import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { generateHouseholdCode, formatHouseholdCode } from "@/src/lib/household-code";

export type MobileContext = {
  client: SupabaseClient;
  user: User;
  household: {
    id: string;
    name: string;
    inviteCode: string;
    role: "owner" | "member";
  } | null;
};

export class MobileApiError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "bad_request"
  ) {
    super(message);
  }
}

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new MobileApiError("Server is not configured.", 500, "server_configuration");
  return { url, key };
}

export async function getMobileContext(request: NextRequest): Promise<MobileContext> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new MobileApiError("Authentication is required.", 401, "unauthorized");
  }

  const token = authorization.slice(7);
  const { url, key } = env();
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: { user }, error: userError } = await client.auth.getUser(token);
  if (userError || !user) throw new MobileApiError("Session is invalid or expired.", 401, "unauthorized");

  const { data: membership, error: membershipError } = await client
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ household_id: string; role: "owner" | "member" }>();
  if (membershipError) throw new MobileApiError(membershipError.message, 500, "database_error");
  if (!membership) return { client, user, household: null };

  const { data: household, error: householdError } = await client
    .from("households")
    .select("id, name, invite_code")
    .eq("id", membership.household_id)
    .single<{ id: string; name: string; invite_code: string }>();
  if (householdError) throw new MobileApiError(householdError.message, 500, "database_error");

  return {
    client,
    user,
    household: {
      id: household.id,
      name: household.name,
      inviteCode: household.invite_code,
      role: membership.role
    }
  };
}

export function requireHousehold(context: MobileContext) {
  if (!context.household) throw new MobileApiError("Create or join a household first.", 409, "household_required");
  return context.household;
}

export function requireOwner(context: MobileContext) {
  const household = requireHousehold(context);
  if (household.role !== "owner") throw new MobileApiError("Only the household owner can do that.", 403, "owner_required");
  return household;
}

export async function readJson<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json() as T;
  } catch {
    throw new MobileApiError("Request body must be valid JSON.");
  }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function handleMobileError(error: unknown) {
  if (error instanceof MobileApiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return NextResponse.json({ error: { code: "server_error", message } }, { status: 500 });
}

export function profileFor(user: User) {
  const firstName = typeof user.user_metadata.first_name === "string" ? user.user_metadata.first_name : "";
  const lastName = typeof user.user_metadata.last_name === "string" ? user.user_metadata.last_name : "";
  return {
    id: user.id,
    email: user.email ?? "",
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`.trim() || user.email || "Family member"
  };
}

const defaults = [
  ["Salary", "income", "#16a34a"], ["Side Income", "income", "#22c55e"],
  ["Food & Groceries", "expense", "#2563eb"], ["Bills & Utilities", "expense", "#0f172a"],
  ["Education", "expense", "#f59e0b"], ["Transport", "expense", "#d97706"],
  ["Entertainment", "expense", "#7c3aed"], ["Savings", "expense", "#14b8a6"],
  ["Transfer", "transfer", "#64748b"]
] as const;

async function uniqueInviteCode(admin: ReturnType<typeof createAdminClient>) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateHouseholdCode();
    const { data } = await admin.from("households").select("id").eq("invite_code", code).maybeSingle();
    if (!data) return code;
  }
  throw new MobileApiError("Could not create a household code.", 500, "invite_code_failed");
}

export async function createHousehold(context: MobileContext, nameValue: string) {
  if (context.household) throw new MobileApiError("You already belong to a household.", 409, "already_in_household");
  const name = nameValue.trim();
  if (!name || name.length > 80) throw new MobileApiError("Household name must be 1-80 characters.");
  const admin = createAdminClient();
  const inviteCode = await uniqueInviteCode(admin);
  const { data: household, error } = await admin.from("households").insert({
    name, invite_code: inviteCode, currency: "IDR", monthly_cycle_day: 1, created_by: context.user.id
  }).select("id").single<{ id: string }>();
  if (error) throw new MobileApiError(error.message, 500, "database_error");
  const profile = profileFor(context.user);
  const { error: memberError } = await admin.from("household_members").insert({
    household_id: household.id, user_id: context.user.id, role: "owner",
    display_name: profile.displayName, email: profile.email
  });
  if (memberError) throw new MobileApiError(memberError.message, 500, "database_error");
  const { error: categoryError } = await admin.from("categories").insert(defaults.map(([categoryName, type, color]) => ({
    household_id: household.id, name: categoryName, type, color, created_by: context.user.id
  })));
  if (categoryError) throw new MobileApiError(categoryError.message, 500, "database_error");
  return { id: household.id, name, inviteCode, role: "owner" as const };
}

export async function joinHousehold(context: MobileContext, codeValue: string) {
  if (context.household) throw new MobileApiError("You already belong to a household.", 409, "already_in_household");
  const admin = createAdminClient();
  const code = formatHouseholdCode(codeValue);
  const { data: household } = await admin.from("households").select("id, name, invite_code").eq("invite_code", code)
    .maybeSingle<{ id: string; name: string; invite_code: string }>();
  if (!household) throw new MobileApiError("Household code was not found.", 404, "household_not_found");
  const profile = profileFor(context.user);
  const { error } = await admin.from("household_members").insert({
    household_id: household.id, user_id: context.user.id, role: "member",
    display_name: profile.displayName, email: profile.email
  });
  if (error) throw new MobileApiError(error.code === "23505" ? "You already belong to this household." : error.message);
  return { id: household.id, name: household.name, inviteCode: household.invite_code, role: "member" as const };
}

export async function getReferenceData(context: MobileContext) {
  const household = requireHousehold(context);
  const [membersResult, accountsResult, categoriesResult] = await Promise.all([
    context.client.from("household_members").select("id, display_name, role, email").eq("household_id", household.id).order("created_at"),
    context.client.from("accounts").select("id, name, type, opening_balance, icon_color, owner_member_id").eq("household_id", household.id).order("created_at"),
    context.client.from("categories").select("id, name, type, color, icon").eq("household_id", household.id).order("name")
  ]);
  const error = membersResult.error ?? accountsResult.error ?? categoriesResult.error;
  if (error) throw new MobileApiError(error.message, 500, "database_error");
  return {
    members: (membersResult.data ?? []).map(row => ({
      id: row.id, name: row.display_name, role: row.role, email: row.email
    })),
    accounts: (accountsResult.data ?? []).map(row => ({
      id: row.id, name: row.name, type: row.type, openingBalance: Number(row.opening_balance),
      iconColor: row.icon_color, ownerMemberId: row.owner_member_id
    })),
    categories: categoriesResult.data ?? []
  };
}

type TransactionRow = {
  id: string; title: string; type: "income" | "expense" | "transfer"; amount: number | string;
  category_id: string | null; member_id: string | null; account_id: string; transfer_account_id: string | null;
  transaction_date: string; transaction_time: string | null; created_at: string; note: string | null;
  categories: { name: string } | null; household_members: { display_name: string } | null;
  accounts: { name: string } | null; transfer_account: { name: string } | null;
};

const transactionSelect = `
  id, title, type, amount, category_id, member_id, account_id, transfer_account_id,
  transaction_date, transaction_time, created_at, note, categories(name),
  household_members(display_name), accounts!transactions_account_id_fkey(name),
  transfer_account:accounts!transactions_transfer_account_id_fkey(name)
`;

function mapTransaction(row: TransactionRow) {
  return {
    id: row.id, title: row.title, type: row.type, amount: Number(row.amount),
    category: row.type === "transfer" ? "Transfer" : row.categories?.name ?? "Uncategorized",
    categoryId: row.category_id, memberId: row.member_id ?? "", memberName: row.household_members?.display_name,
    accountId: row.account_id, accountName: row.accounts?.name, transferAccountId: row.transfer_account_id,
    transferAccountName: row.transfer_account?.name, date: row.transaction_date,
    time: row.transaction_time, createdAt: row.created_at, note: row.note
  };
}

export async function getTransactions(context: MobileContext, limit = 100) {
  const household = requireHousehold(context);
  const { data, error } = await context.client.from("transactions").select(transactionSelect)
    .eq("household_id", household.id).order("transaction_date", { ascending: false })
    .order("transaction_time", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 500)).returns<TransactionRow[]>();
  if (error) throw new MobileApiError(error.message, 500, "database_error");
  return (data ?? []).map(mapTransaction);
}

type TransactionPayload = {
  title: string; type: "income" | "expense" | "transfer"; amount: number; categoryId?: string | null;
  memberId: string; accountId: string; transferAccountId?: string | null; date: string; time?: string | null; note?: string | null;
};

function validateTransaction(input: TransactionPayload) {
  const title = input.title?.trim();
  if (!title || title.length > 30) throw new MobileApiError("Title must be 1-30 characters.");
  if (!["income", "expense", "transfer"].includes(input.type)) throw new MobileApiError("Choose a valid transaction type.");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new MobileApiError("Amount must be positive.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new MobileApiError("Choose a valid date.");
  if (!input.memberId || !input.accountId) throw new MobileApiError("Choose a member and account.");
  if (input.type !== "transfer" && !input.categoryId) throw new MobileApiError("Choose a category.");
  if (input.type === "transfer" && (!input.transferAccountId || input.transferAccountId === input.accountId)) {
    throw new MobileApiError("Choose a different destination account.");
  }
  return {
    title, type: input.type, amount: input.amount, category_id: input.type === "transfer" ? null : input.categoryId,
    member_id: input.memberId, account_id: input.accountId,
    transfer_account_id: input.type === "transfer" ? input.transferAccountId : null,
    transaction_date: input.date, transaction_time: input.time || null, note: input.note?.trim() || null
  };
}

export async function saveTransaction(context: MobileContext, input: TransactionPayload, id?: string) {
  const household = requireHousehold(context);
  const values = validateTransaction(input);
  const accountIds = [values.account_id, values.transfer_account_id].filter((value): value is string => Boolean(value));
  const [accountsResult, memberResult, categoryResult] = await Promise.all([
    context.client.from("accounts").select("id").eq("household_id", household.id).in("id", accountIds),
    context.client.from("household_members").select("id").eq("household_id", household.id).eq("id", values.member_id).maybeSingle(),
    values.category_id
      ? context.client.from("categories").select("id").eq("household_id", household.id).eq("id", values.category_id).eq("type", values.type).maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ]);
  const referenceError = accountsResult.error ?? memberResult.error ?? categoryResult.error;
  if (referenceError) throw new MobileApiError(referenceError.message, 400, "invalid_reference");
  if ((accountsResult.data?.length ?? 0) !== accountIds.length || !memberResult.data || (values.category_id && !categoryResult.data)) {
    throw new MobileApiError("Choose valid household accounts, member, and category.", 400, "invalid_reference");
  }
  const query = id
    ? context.client.from("transactions").update(values).eq("household_id", household.id).eq("id", id)
    : context.client.from("transactions").insert({ household_id: household.id, created_by: context.user.id, ...values });
  const { data, error } = await query.select(transactionSelect).single<TransactionRow>();
  if (error) throw new MobileApiError(error.message, 400, "database_error");
  return mapTransaction(data);
}

export async function deleteTransaction(context: MobileContext, id: string) {
  const household = requireHousehold(context);
  const { error } = await context.client.from("transactions").delete().eq("household_id", household.id).eq("id", id);
  if (error) throw new MobileApiError(error.message, 400, "database_error");
}

export async function getDashboard(context: MobileContext) {
  const household = requireHousehold(context);
  const reference = await getReferenceData(context);
  const transactions = await getTransactions(context, 500);
  const month = new Date().toISOString().slice(0, 7);
  const monthly = transactions.filter(item => item.date.startsWith(month));
  const income = monthly.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = monthly.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const { data: balanceRows, error: balanceError } = await context.client.rpc("get_account_balances", { target_household_id: household.id });
  if (balanceError) throw new MobileApiError(balanceError.message, 500, "database_error");
  const balances = Object.fromEntries((balanceRows ?? []).map((row: { account_id: string; balance: number | string }) => [row.account_id, Number(row.balance)]));
  const totalBalance = reference.accounts.reduce((sum, account) => sum + (balances[account.id] ?? account.openingBalance), 0);
  return {
    totalBalance, monthlyIncome: income, monthlyExpense: expense,
    savingsRate: income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0,
    recentTransactions: transactions.slice(0, 5), accounts: reference.accounts, accountBalances: balances
  };
}

export async function getPlanning(context: MobileContext, month: string) {
  const household = requireHousehold(context);
  const reference = await getReferenceData(context);
  type BudgetRow = {
    id: string;
    category_id: string;
    budget_month: string;
    limit_amount: number | string;
    categories: { name: string } | null;
  };
  const [budgetResult, goalResult, balanceResult, transactions] = await Promise.all([
    context.client.from("budgets").select("id, category_id, budget_month, limit_amount, categories(name)").eq("household_id", household.id).eq("budget_month", `${month}-01`).returns<BudgetRow[]>(),
    context.client.from("savings_goals").select("id, name, target_amount, saved_amount, due_date, account_id").eq("household_id", household.id),
    context.client.rpc("get_account_balances", { target_household_id: household.id }),
    getTransactions(context, 500)
  ]);
  const error = budgetResult.error ?? goalResult.error ?? balanceResult.error;
  if (error) throw new MobileApiError(error.message, 500, "database_error");
  const balances = Object.fromEntries((balanceResult.data ?? []).map((row: { account_id: string; balance: number | string }) => [row.account_id, Number(row.balance)]));
  return {
    budgets: (budgetResult.data ?? []).map(row => ({
      id: row.id, categoryId: row.category_id, month: row.budget_month.slice(0, 7), limit: Number(row.limit_amount),
      category: row.categories?.name
    })),
    goals: (goalResult.data ?? []).map(row => ({
      id: row.id, name: row.name, targetAmount: Number(row.target_amount),
      savedAmount: Math.max(0, balances[row.account_id] ?? Number(row.saved_amount)),
      dueDate: row.due_date ?? "", accountId: row.account_id
    })),
    transactions: transactions.filter(item => item.date.startsWith(month)),
    accounts: reference.accounts
  };
}

type Resource = "accounts" | "budgets" | "goals" | "categories" | "members";

export async function saveResource(context: MobileContext, resource: Resource, body: Record<string, unknown>, id?: string) {
  const household = requireHousehold(context);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (resource === "accounts") {
    if (!name || name.length > 30) throw new MobileApiError("Account name must be 1-30 characters.");
    const type = String(body.type ?? "");
    const openingBalance = Number(body.openingBalance);
    if (!["cash", "bank", "credit", "savings"].includes(type) || !Number.isFinite(openingBalance) || openingBalance < 0) {
      throw new MobileApiError("Choose a valid account type and opening balance.");
    }
    const ownerMemberId = typeof body.ownerMemberId === "string" && body.ownerMemberId ? body.ownerMemberId : null;
    if (ownerMemberId) {
      const { data: owner } = await context.client.from("household_members").select("id").eq("household_id", household.id).eq("id", ownerMemberId).maybeSingle();
      if (!owner) throw new MobileApiError("Selected owner is not a member of this household.");
    }
    const values = { name, type, opening_balance: openingBalance, owner_member_id: ownerMemberId, icon_color: body.iconColor || null };
    const query = id ? context.client.from("accounts").update(values).eq("household_id", household.id).eq("id", id)
      : context.client.from("accounts").insert({ household_id: household.id, created_by: context.user.id, ...values });
    const { error } = await query;
    if (error) throw new MobileApiError(error.message);
  } else if (resource === "categories") {
    if (!name || name.length > 30 || !["income", "expense"].includes(String(body.type))) {
      throw new MobileApiError("Choose a valid category name and type.");
    }
    const values = { name, type: body.type, color: body.color || null, icon: body.icon || null };
    const query = id ? context.client.from("categories").update(values).eq("household_id", household.id).eq("id", id)
      : context.client.from("categories").insert({ household_id: household.id, created_by: context.user.id, ...values });
    const { error } = await query;
    if (error) throw new MobileApiError(error.code === "23505" ? "This category already exists." : error.message);
  } else if (resource === "budgets") {
    const categoryId = String(body.categoryId ?? "");
    const month = String(body.month ?? "");
    const limit = Number(body.limit);
    if (!categoryId || !/^\d{4}-\d{2}$/.test(month) || !Number.isFinite(limit) || limit <= 0) {
      throw new MobileApiError("Choose a category, month, and positive budget limit.");
    }
    const { data: category } = await context.client.from("categories").select("id").eq("household_id", household.id).eq("id", categoryId).eq("type", "expense").maybeSingle();
    if (!category) throw new MobileApiError("Choose a valid expense category.");
    const values = { category_id: categoryId, budget_month: `${month}-01`, limit_amount: limit };
    const query = id ? context.client.from("budgets").update(values).eq("household_id", household.id).eq("id", id)
      : context.client.from("budgets").insert({ household_id: household.id, created_by: context.user.id, ...values });
    const { error } = await query;
    if (error) throw new MobileApiError(error.code === "23505" ? "This category already has a budget for the selected month." : error.message);
  } else if (resource === "goals") {
    const accountId = String(body.accountId ?? "");
    const targetAmount = Number(body.targetAmount);
    const dueDate = String(body.dueDate ?? "");
    if (!name || name.length > 30 || !accountId || !Number.isFinite(targetAmount) || targetAmount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      throw new MobileApiError("Enter a valid goal, target amount, due date, and savings account.");
    }
    const { data: account } = await context.client.from("accounts").select("id, name").eq("household_id", household.id).eq("id", accountId).eq("type", "savings").maybeSingle();
    if (!account) throw new MobileApiError("Choose an account with type Savings.");
    const duplicateQuery = context.client.from("savings_goals").select("id").eq("household_id", household.id).eq("account_id", accountId);
    const { data: duplicate } = await (id ? duplicateQuery.neq("id", id) : duplicateQuery).maybeSingle();
    if (duplicate) throw new MobileApiError("This savings account already has a savings goal.");
    const { data: balanceRows } = await context.client.rpc("get_account_balances", { target_household_id: household.id });
    const balance = (balanceRows ?? []).find((row: { account_id: string }) => row.account_id === accountId);
    const values = { name: account.name, target_amount: targetAmount, due_date: dueDate, account_id: accountId, saved_amount: Math.max(0, Number(balance?.balance ?? 0)) };
    const query = id ? context.client.from("savings_goals").update(values).eq("household_id", household.id).eq("id", id)
      : context.client.from("savings_goals").insert({ household_id: household.id, created_by: context.user.id, ...values });
    const { error } = await query;
    if (error) throw new MobileApiError(error.message);
  } else {
    requireOwner(context);
    const email = String(body.email ?? "").trim().toLowerCase();
    const role = body.role === "owner" ? "owner" : "member";
    if (!name || name.length > 30 || (!id && !email.includes("@"))) throw new MobileApiError("Enter a valid member name and email.");
    if (id) {
      const { error } = await context.client.from("household_members").update({
        display_name: name, role, email: email || null, monthly_responsibility_note: body.note || null
      }).eq("household_id", household.id).eq("id", id);
      if (error) throw new MobileApiError(error.message);
    } else {
      const admin = createAdminClient();
      let userId: string | undefined;
      for (let page = 1; page <= 20 && !userId; page += 1) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
        if (error) throw new MobileApiError(error.message);
        userId = data.users.find(candidate => candidate.email?.toLowerCase() === email)?.id;
        if (data.users.length < 100) break;
      }
      if (!userId) {
        const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true, password: randomUUID() });
        if (error || !data.user) throw new MobileApiError(error?.message ?? "Could not create member account.");
        userId = data.user.id;
      }
      const { error } = await context.client.from("household_members").insert({
        household_id: household.id, user_id: userId, display_name: name, role, email,
        monthly_responsibility_note: body.note || null
      });
      if (error) throw new MobileApiError(error.code === "23505" ? "This email is already a member." : error.message);
    }
  }
  return { saved: true };
}

export async function deleteResource(context: MobileContext, resource: Resource, id: string) {
  const household = requireHousehold(context);
  const table = resource === "goals" ? "savings_goals" : resource === "members" ? "household_members" : resource;
  if (resource === "members") requireOwner(context);
  if (resource === "accounts") {
    const { count } = await context.client.from("transactions").select("id", { count: "exact", head: true })
      .eq("household_id", household.id).or(`account_id.eq.${id},transfer_account_id.eq.${id}`);
    if ((count ?? 0) > 0) throw new MobileApiError("Delete or reassign linked transactions first.");
  }
  const { error } = await context.client.from(table).delete().eq("household_id", household.id).eq("id", id);
  if (error) throw new MobileApiError(error.message);
  return { deleted: true };
}

export function parseResource(value: string): Resource {
  if (!["accounts", "budgets", "goals", "categories", "members"].includes(value)) {
    throw new MobileApiError("Unknown resource.", 404, "not_found");
  }
  return value as Resource;
}
