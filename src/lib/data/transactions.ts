import { createClient } from "@/src/lib/supabase/server";
import type {
  FamilyMemberTransactionTotals,
  Transaction,
  TransactionMonthMetric,
  TransactionType
} from "@/types/finance";

type TransactionRow = {
  id: string;
  title: string;
  type: TransactionType;
  amount: number | string;
  category_id: string | null;
  member_id: string | null;
  account_id: string;
  transfer_account_id: string | null;
  transaction_date: string;
  transaction_time: string | null;
  created_at: string;
  note: string | null;
  categories: {
    name: string;
  } | null;
  household_members: {
    display_name: string;
  } | null;
  accounts: {
    name: string;
  } | null;
  transfer_account: {
    name: string;
  } | null;
};

export type TransactionCursor = {
  transactionDate: string;
  transactionTime: string | null;
  createdAt: string;
  id: string;
};

export type TransactionPage = {
  items: Transaction[];
  nextCursor: TransactionCursor | null;
};

type TransactionMetricRow = {
  id: string;
  type: TransactionType;
  amount: number | string;
  transaction_date: string;
  transaction_time: string | null;
};

type ReportTransactionRow = TransactionMetricRow & {
  created_at: string;
  categories: {
    name: string;
  } | null;
  household_members: {
    display_name: string;
  } | null;
};

type MemberTotalRow = {
  type: TransactionType;
  amount: number | string;
  member_id: string | null;
};

export type TransactionInput = {
  title: string;
  type: TransactionType;
  amount: number;
  category?: string;
  memberId: string;
  accountId: string;
  transferAccountId?: string;
  date: string;
  time?: string;
  note?: string;
};

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    amount: Number(row.amount),
    category: row.type === "transfer" ? "Transfer" : row.categories?.name ?? "Uncategorized",
    categoryId: row.category_id ?? undefined,
    memberId: row.member_id ?? "",
    memberName: row.household_members?.display_name ?? undefined,
    accountId: row.account_id,
    accountName: row.accounts?.name ?? undefined,
    transferAccountId: row.transfer_account_id ?? undefined,
    transferAccountName: row.transfer_account?.name ?? undefined,
    date: row.transaction_date,
    time: row.transaction_time ?? undefined,
    createdAt: row.created_at,
    note: row.note ?? undefined
  };
}

function mapTransactionMetric(row: TransactionMetricRow): TransactionMonthMetric {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    date: row.transaction_date
  };
}

function mapReportTransaction(row: ReportTransactionRow): Transaction {
  return {
    id: row.id,
    title: "",
    type: row.type,
    amount: Number(row.amount),
    category: row.type === "transfer" ? "Transfer" : row.categories?.name ?? "Uncategorized",
    memberId: "",
    memberName: row.household_members?.display_name ?? undefined,
    accountId: "",
    date: row.transaction_date,
    createdAt: row.transaction_date
  };
}

async function getRequiredId({
  table,
  householdId,
  column,
  value,
  message
}: {
  table: "accounts" | "household_members";
  householdId: string;
  column: "id";
  value: string;
  message: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("household_id", householdId)
    .eq(column, value)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(message);
  }

  return data.id;
}

async function getCategoryId(householdId: string, categoryName: string, type: "income" | "expense") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("household_id", householdId)
    .eq("name", categoryName)
    .eq("type", type)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Choose a valid category.");
  }

  return data.id;
}

type CursorChain = { or: (filter: string) => unknown };

function applyTransactionCursor<T extends CursorChain>(query: T, cursor: TransactionCursor | undefined): T {
  if (!cursor) {
    return query;
  }

  const date = cursor.transactionDate;
  const time = cursor.transactionTime;
  const createdAt = cursor.createdAt;
  const id = cursor.id;

  const orChain = time
    ? `transaction_date.lt.${date},` +
      `and(transaction_date.eq.${date},transaction_time.lt.${time}),` +
      `and(transaction_date.eq.${date},transaction_time.eq.${time},created_at.lt.${createdAt}),` +
      `and(transaction_date.eq.${date},transaction_time.eq.${time},created_at.eq.${createdAt},id.lt.${id})`
    : `transaction_date.lt.${date},` +
      `and(transaction_date.eq.${date},transaction_time.not.is.null),` +
      `and(transaction_date.eq.${date},transaction_time.is.null,created_at.lt.${createdAt}),` +
      `and(transaction_date.eq.${date},transaction_time.is.null,created_at.eq.${createdAt},id.lt.${id})`;

  return query.or(orChain) as T;
}

async function normalizeTransactionInput(householdId: string, input: TransactionInput) {
  const isTransfer = input.type === "transfer";
  const categoryIdPromise =
    input.type === "income" || input.type === "expense"
      ? getCategoryId(householdId, input.category ?? "", input.type)
      : Promise.resolve(null);
  const [categoryId, accountId, transferAccountId, memberId] = await Promise.all([
    categoryIdPromise,
    getRequiredId({
      table: "accounts",
      householdId,
      column: "id",
      value: input.accountId,
      message: "Choose a valid account."
    }),
    isTransfer && input.transferAccountId
      ? getRequiredId({
          table: "accounts",
          householdId,
          column: "id",
          value: input.transferAccountId,
          message: "Choose a valid destination account."
        })
      : Promise.resolve(null),
    getRequiredId({
      table: "household_members",
      householdId,
      column: "id",
      value: input.memberId,
      message: "Choose a valid family member."
    })
  ]);

  if (isTransfer && (!transferAccountId || accountId === transferAccountId)) {
    throw new Error("Choose a different destination account.");
  }

  return {
    title: input.title,
    type: input.type,
    amount: input.amount,
    category_id: categoryId,
    member_id: memberId,
    account_id: accountId,
    transfer_account_id: transferAccountId,
    transaction_date: input.date,
    transaction_time: input.time || null,
    note: input.note?.trim() || null
  };
}

export async function getTransactions(
  householdId: string,
  limit = 100,
  cursor?: TransactionCursor
): Promise<TransactionPage> {
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select(
      `
        id,
        title,
        type,
        amount,
        category_id,
        member_id,
        account_id,
        transfer_account_id,
        transaction_date,
        transaction_time,
        created_at,
        note,
        categories(name),
        household_members(display_name),
        accounts!transactions_account_id_fkey(name),
        transfer_account:accounts!transactions_transfer_account_id_fkey(name)
      `
    )
    .eq("household_id", householdId)
    .order("transaction_date", { ascending: false })
    .order("transaction_time", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  query = applyTransactionCursor(query, cursor);

  const { data, error } = await query.limit(limit).returns<TransactionRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const items = (data ?? []).map(mapTransaction);
  const nextCursor: TransactionCursor | null =
    items.length === limit
      ? {
          transactionDate: items[items.length - 1].date,
          transactionTime: items[items.length - 1].time ?? null,
          createdAt: items[items.length - 1].createdAt,
          id: items[items.length - 1].id,
        }
      : null;

  return { items, nextCursor };
}

export async function getRecentTransactions(
  householdId: string,
  limit = 5,
  cursor?: TransactionCursor
): Promise<TransactionPage> {
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select(
      `
        id,
        title,
        type,
        amount,
        category_id,
        member_id,
        account_id,
        transfer_account_id,
        transaction_date,
        transaction_time,
        created_at,
        note,
        categories(name),
        household_members(display_name),
        accounts!transactions_account_id_fkey(name),
        transfer_account:accounts!transactions_transfer_account_id_fkey(name)
      `
    )
    .eq("household_id", householdId)
    .order("transaction_date", { ascending: false })
    .order("transaction_time", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  query = applyTransactionCursor(query, cursor);

  const { data, error } = await query.limit(limit).returns<TransactionRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const items = (data ?? []).map(mapTransaction);
  const nextCursor: TransactionCursor | null =
    items.length === limit
      ? {
          transactionDate: items[items.length - 1].date,
          transactionTime: items[items.length - 1].time ?? null,
          createdAt: items[items.length - 1].createdAt,
          id: items[items.length - 1].id,
        }
      : null;

  return { items, nextCursor };
}

export async function getTransactionMonthMetrics(householdId: string, monthsBack = 12) {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  const startDateStr = startDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, amount, transaction_date, transaction_time")
    .eq("household_id", householdId)
    .gte("transaction_date", startDateStr)
    .order("transaction_date", { ascending: true })
    .order("transaction_time", { ascending: true, nullsFirst: false })
    .returns<TransactionMetricRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapTransactionMetric);
}

export async function getReportTransactions(householdId: string, monthsBack = 12) {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  const startDateStr = startDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
        id,
        type,
        amount,
        transaction_date,
        transaction_time,
        created_at,
        categories(name),
        household_members(display_name)
      `
    )
    .eq("household_id", householdId)
    .gte("transaction_date", startDateStr)
    .order("transaction_date", { ascending: false })
    .order("transaction_time", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .returns<ReportTransactionRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapReportTransaction);
}

export async function getFamilyMemberTransactionTotals(householdId: string, monthsBack = 12) {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  const startDateStr = startDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, member_id")
    .eq("household_id", householdId)
    .gte("transaction_date", startDateStr)
    .returns<MemberTotalRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce<FamilyMemberTransactionTotals>((totals, transaction) => {
    if (!transaction.member_id || transaction.type === "transfer") {
      return totals;
    }

    const current = totals[transaction.member_id] ?? { income: 0, expense: 0 };

    if (transaction.type === "income") {
      current.income += Number(transaction.amount);
    }

    if (transaction.type === "expense") {
      current.expense += Number(transaction.amount);
    }

    totals[transaction.member_id] = current;
    return totals;
  }, {});
}

export async function getTransactionsForMonth(
  householdId: string,
  month: string,
  limit = 1000,
  cursor?: TransactionCursor
): Promise<TransactionPage> {
  const [year, monthNumber] = month.split("-").map(Number);

  if (!year || !monthNumber) {
    throw new Error("Choose a valid month.");
  }

  const startDate = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
  const nextMonthDate = new Date(year, monthNumber, 1);
  const endDate = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select(
      `
        id,
        title,
        type,
        amount,
        category_id,
        member_id,
        account_id,
        transfer_account_id,
        transaction_date,
        transaction_time,
        created_at,
        note,
        categories(name),
        household_members(display_name),
        accounts!transactions_account_id_fkey(name),
        transfer_account:accounts!transactions_transfer_account_id_fkey(name)
      `
    )
    .eq("household_id", householdId)
    .gte("transaction_date", startDate)
    .lt("transaction_date", endDate)
    .order("transaction_date", { ascending: false })
    .order("transaction_time", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  query = applyTransactionCursor(query, cursor);

  const { data, error } = await query.limit(limit).returns<TransactionRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const items = (data ?? []).map(mapTransaction);
  const nextCursor: TransactionCursor | null =
    items.length === limit
      ? {
          transactionDate: items[items.length - 1].date,
          transactionTime: items[items.length - 1].time ?? null,
          createdAt: items[items.length - 1].createdAt,
          id: items[items.length - 1].id,
        }
      : null;

  return { items, nextCursor };
}

export async function createTransaction(householdId: string, input: TransactionInput) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const normalizedInput = await normalizeTransactionInput(householdId, input);

  const { error } = await supabase.from("transactions").insert({
    household_id: householdId,
    ...normalizedInput,
    created_by: user?.id ?? null
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateTransaction(householdId: string, transactionId: string, input: TransactionInput) {
  const supabase = await createClient();
  const normalizedInput = await normalizeTransactionInput(householdId, input);
  const { error } = await supabase
    .from("transactions")
    .update(normalizedInput)
    .eq("household_id", householdId)
    .eq("id", transactionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteTransaction(householdId: string, transactionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("household_id", householdId)
    .eq("id", transactionId);

  if (error) {
    throw new Error(error.message);
  }
}
