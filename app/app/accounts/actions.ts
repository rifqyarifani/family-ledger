"use server";

import { revalidatePath } from "next/cache";
import {
  createAccount,
  deleteAccount,
  updateAccount,
  type AccountInput
} from "@/src/lib/data/accounts";
import type { Account } from "@/types/finance";

function validateAccount(account: Account): AccountInput {
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

  return {
    name,
    type: account.type,
    openingBalance: account.openingBalance
  };
}

export async function createAccountAction(householdId: string, account: Account) {
  await createAccount(householdId, validateAccount(account));
  revalidatePath("/app/accounts");
  revalidatePath("/app/goals");
}

export async function updateAccountAction(householdId: string, account: Account) {
  await updateAccount(householdId, account.id, validateAccount(account));
  revalidatePath("/app/accounts");
  revalidatePath("/app/goals");
}

export async function deleteAccountAction(householdId: string, accountId: string) {
  await deleteAccount(householdId, accountId);
  revalidatePath("/app/accounts");
  revalidatePath("/app/goals");
}
