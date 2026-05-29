import { createClient } from "@/src/lib/supabase/server";
import type { Account, AccountBalanceMap, TransactionType } from "@/types/finance";

type AccountRow = {
  id: string;
  name: string;
  type: Account["type"];
  opening_balance: number | string;
};

type AccountMovementRow = {
  type: TransactionType;
  amount: number | string;
  account_id: string;
  transfer_account_id: string | null;
};

export type AccountInput = {
  name: string;
  type: Account["type"];
  openingBalance: number;
};

function mapAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    openingBalance: Number(row.opening_balance)
  };
}

export async function getAccounts(householdId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, type, opening_balance")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true })
    .returns<AccountRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapAccount);
}

async function computeBalancesInJS(
  householdId: string,
  accounts: Account[],
): Promise<AccountBalanceMap> {
  const balances = accounts.reduce<AccountBalanceMap>((current, account) => {
    current[account.id] = account.openingBalance;
    return current;
  }, {});

  if (accounts.length === 0) {
    return balances;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, account_id, transfer_account_id")
    .eq("household_id", householdId)
    .returns<AccountMovementRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  for (const transaction of data ?? []) {
    const amount = Number(transaction.amount);

    if (transaction.type === "income") {
      balances[transaction.account_id] = (balances[transaction.account_id] ?? 0) + amount;
    }

    if (transaction.type === "expense") {
      balances[transaction.account_id] = (balances[transaction.account_id] ?? 0) - amount;
    }

    if (transaction.type === "transfer") {
      balances[transaction.account_id] = (balances[transaction.account_id] ?? 0) - amount;

      if (transaction.transfer_account_id) {
        balances[transaction.transfer_account_id] = (balances[transaction.transfer_account_id] ?? 0) + amount;
      }
    }
  }

  return balances;
}

export async function getAccountBalanceMap(householdId: string, accounts?: Account[]) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_account_balances", {
    target_household_id: householdId,
  });

  if (!error && data) {
    return (data as { account_id: string; balance: number }[]).reduce<AccountBalanceMap>(
      (acc, row) => {
        acc[row.account_id] = Number(row.balance);
        return acc;
      },
      {},
    );
  }

  const resolvedAccounts = accounts ?? (await getAccounts(householdId));
  return computeBalancesInJS(householdId, resolvedAccounts);
}

export async function createAccount(householdId: string, account: AccountInput) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("accounts").insert({
    household_id: householdId,
    name: account.name,
    type: account.type,
    opening_balance: account.openingBalance,
    created_by: user?.id ?? null
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAccount(householdId: string, accountId: string, account: AccountInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({
      name: account.name,
      type: account.type,
      opening_balance: account.openingBalance
    })
    .eq("household_id", householdId)
    .eq("id", accountId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAccount(householdId: string, accountId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .delete()
    .eq("household_id", householdId)
    .eq("id", accountId)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Account not found or no permission.");
  }
}
