"use server";

import { revalidatePath } from "next/cache";
import {
  createAccount,
  deleteAccount,
  updateAccount,
  type AccountInput
} from "@/src/lib/data/accounts";
import { requireHouseholdId } from "@/lib/household-utils";
import { createClient } from "@/src/lib/supabase/server";
import type { Account } from "@/types/finance";

async function assertOwnerIsMember(householdId: string, ownerMemberId: string | null | undefined) {
  if (!ownerMemberId) {
    return;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("household_members")
    .select("id")
    .eq("household_id", householdId)
    .eq("id", ownerMemberId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Selected owner is not a member of this household.");
  }
}

async function validateAccount(householdId: string, account: Account): Promise<AccountInput> {
  const name = account.name.trim();

  if (!name || name.length > 30) {
    throw new Error("Account name must be 1-30 characters.");
  }

  if (!["cash", "bank", "credit", "savings"].includes(account.type)) {
    throw new Error("Choose a valid account type.");
  }

  if (!Number.isFinite(account.openingBalance) || account.openingBalance < 0) {
    throw new Error("Opening balance must be zero or more.");
  }

  if (account.openingBalance > 999_999_999_999.99) {
    throw new Error("Opening balance must be at most 999.999.999.999,99.");
  }

  await assertOwnerIsMember(householdId, account.ownerMemberId);

  return {
    name,
    type: account.type,
    openingBalance: account.openingBalance,
    iconColor: account.iconColor,
    ownerMemberId: account.ownerMemberId ?? null
  };
}

export async function createAccountAction(account: Account) {
  const householdId = await requireHouseholdId();
  await createAccount(householdId, await validateAccount(householdId, account));
  revalidatePath("/app/accounts");
  revalidatePath("/app/goals");
}

export async function updateAccountAction(account: Account) {
  const householdId = await requireHouseholdId();
  await updateAccount(householdId, account.id, await validateAccount(householdId, account));
  revalidatePath("/app/accounts");
  revalidatePath("/app/goals");
}

export async function deleteAccountAction(accountId: string) {
  const householdId = await requireHouseholdId();
  await deleteAccount(householdId, accountId);
  revalidatePath("/app/accounts");
  revalidatePath("/app/goals");
}
