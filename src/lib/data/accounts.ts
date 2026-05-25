import { createClient } from "@/src/lib/supabase/server";
import type { Account } from "@/types/finance";

type AccountRow = {
  id: string;
  name: string;
  type: Account["type"];
  opening_balance: number | string;
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
  const { error } = await supabase.from("accounts").delete().eq("household_id", householdId).eq("id", accountId);

  if (error) {
    throw new Error(error.message);
  }
}
