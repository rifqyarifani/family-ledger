"use server";

import { revalidatePath } from "next/cache";
import { getAccounts, getAccountBalanceMap } from "@/src/lib/data/accounts";
import {
  createSavingsGoal,
  deleteSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
  type SavingsGoalInput
} from "@/src/lib/data/savings-goals";
import { getActiveHousehold } from "@/src/lib/data/households";
import { normalizeGoalName } from "@/lib/format-utils";
import type { SavingsGoal } from "@/types/finance";

async function validateSavingsGoal(householdId: string, goal: SavingsGoal, currentGoalId?: string): Promise<SavingsGoalInput> {
  const name = goal.name.trim();

  if (!name || name.length > 30) {
    throw new Error("Choose a valid savings account.");
  }

  if (!Number.isFinite(goal.targetAmount) || goal.targetAmount <= 0) {
    throw new Error("Target amount must be positive.");
  }

  if (!goal.dueDate) {
    throw new Error("Due date is required.");
  }

  const [accounts, goals] = await Promise.all([
    getAccounts(householdId),
    getSavingsGoals(householdId)
  ]);

  const linkedAccount = accounts.find(
    (account) => account.type === "savings" && normalizeGoalName(account.name) === normalizeGoalName(name)
  );

  if (!linkedAccount) {
    throw new Error("Choose an account with type Savings.");
  }

  const duplicateGoal = goals.find(
    (existingGoal) =>
      existingGoal.id !== currentGoalId &&
      normalizeGoalName(existingGoal.name) === normalizeGoalName(linkedAccount.name)
  );

  if (duplicateGoal) {
    throw new Error("This savings account already has a savings goal.");
  }

  const balances = await getAccountBalanceMap(householdId, accounts);
  const savedAmount = Math.max(0, balances[linkedAccount.id] ?? linkedAccount.openingBalance);

  return {
    name: linkedAccount.name,
    targetAmount: goal.targetAmount,
    savedAmount,
    dueDate: goal.dueDate,
    accountId: linkedAccount.id
  };
}

async function requireHouseholdId() {
  const household = await getActiveHousehold();

  if (!household) {
    throw new Error("No active household found.");
  }

  return household.id;
}

function revalidateGoals() {
  revalidatePath("/app");
  revalidatePath("/app/goals");
}

export async function createSavingsGoalAction(goal: SavingsGoal) {
  const householdId = await requireHouseholdId();
  await createSavingsGoal(householdId, await validateSavingsGoal(householdId, goal));
  revalidateGoals();
}

export async function updateSavingsGoalAction(goal: SavingsGoal) {
  const householdId = await requireHouseholdId();
  await updateSavingsGoal(householdId, goal.id, await validateSavingsGoal(householdId, goal, goal.id));
  revalidateGoals();
}

export async function deleteSavingsGoalAction(goalId: string) {
  const householdId = await requireHouseholdId();
  await deleteSavingsGoal(householdId, goalId);
  revalidateGoals();
}
