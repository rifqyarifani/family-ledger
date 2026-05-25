"use server";

import { revalidatePath } from "next/cache";
import {
  createBudget,
  deleteBudget,
  updateBudget,
  type BudgetInput
} from "@/src/lib/data/budgets";
import { getActiveHousehold } from "@/src/lib/data/households";
import type { Budget } from "@/types/finance";

function validateBudget(budget: Budget): BudgetInput {
  const category = budget.category.trim();

  if (!category) {
    throw new Error("Choose an expense category.");
  }

  if (!budget.month) {
    throw new Error("Month is required.");
  }

  if (!Number.isFinite(budget.limit) || budget.limit <= 0) {
    throw new Error("Limit must be positive.");
  }

  return {
    category,
    limit: budget.limit,
    month: budget.month
  };
}

async function requireHouseholdId() {
  const household = await getActiveHousehold();

  if (!household) {
    throw new Error("No active household found.");
  }

  return household.id;
}

function revalidateBudgetViews() {
  revalidatePath("/app");
  revalidatePath("/app/budget");
}

export async function createBudgetAction(budget: Budget) {
  const householdId = await requireHouseholdId();
  await createBudget(householdId, validateBudget(budget));
  revalidateBudgetViews();
}

export async function updateBudgetAction(budget: Budget) {
  const householdId = await requireHouseholdId();
  await updateBudget(householdId, budget.id, validateBudget(budget));
  revalidateBudgetViews();
}

export async function deleteBudgetAction(budgetId: string) {
  const householdId = await requireHouseholdId();
  await deleteBudget(householdId, budgetId);
  revalidateBudgetViews();
}
