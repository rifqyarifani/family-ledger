import { createClient } from "@/src/lib/supabase/server";
import type { Transaction, TransactionType } from "@/types/finance";

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

export type TransactionInput = {
  title: string;
  type: TransactionType;
  amount: number;
  category?: string;
  memberId: string;
  accountId: string;
  transferAccountId?: string;
  date: string;
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
    note: row.note ?? undefined
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
    note: input.note?.trim() || null
  };
}

export async function getTransactions(householdId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
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
        note,
        categories(name),
        household_members(display_name),
        accounts!transactions_account_id_fkey(name),
        transfer_account:accounts!transactions_transfer_account_id_fkey(name)
      `
    )
    .eq("household_id", householdId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<TransactionRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapTransaction);
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
