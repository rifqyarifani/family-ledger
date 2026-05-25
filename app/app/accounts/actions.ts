"use server";

import { revalidatePath } from "next/cache";
import {
  createAccount,
  deleteAccount,
  updateAccount,
  type AccountInput
} from "@/src/lib/data/accounts";
import { getActiveHousehold } from "@/src/lib/data/households";
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

async function requireHouseholdId() {
  const household = await getActiveHousehold();

  if (!household) {
    throw new Error("No active household found.");
  }

  return household.id;
}

export async function createAccountAction(account: Account) {
  const householdId = await requireHouseholdId();
  await createAccount(householdId, validateAccount(account));
  revalidatePath("/app/accounts");
  revalidatePath("/app/goals");
}

export async function updateAccountAction(account: Account) {
  const householdId = await requireHouseholdId();
  await updateAccount(householdId, account.id, validateAccount(account));
  revalidatePath("/app/accounts");
  revalidatePath("/app/goals");
}

export async function deleteAccountAction(accountId: string) {
  const householdId = await requireHouseholdId();
  await deleteAccount(householdId, accountId);
  revalidatePath("/app/accounts");
  revalidatePath("/app/goals");
}
