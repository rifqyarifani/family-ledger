"use server";

import { revalidatePath } from "next/cache";
import {
  createBudget,
  deleteBudget,
  updateBudget,
  type BudgetInput
} from "@/src/lib/data/budgets";
import { requireHouseholdId } from "@/lib/household-utils";
import { isValidMonthKey } from "@/lib/validation";
import type { BudgetFormInput } from "@/types/finance";

function validateBudget(budget: BudgetFormInput): BudgetInput {
  const category = budget.category.trim();

  if (!category) {
    throw new Error("Choose an expense category.");
  }

  if (!budget.month || !isValidMonthKey(budget.month)) {
    throw new Error("Choose a valid month.");
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


function revalidateBudgetViews() {
  revalidatePath("/app");
  revalidatePath("/app/budget");
}

export async function createBudgetAction(budget: BudgetFormInput) {
  const householdId = await requireHouseholdId();
  await createBudget(householdId, validateBudget(budget));
  revalidateBudgetViews();
}

export async function updateBudgetAction(budgetId: string, budget: BudgetFormInput) {
  const householdId = await requireHouseholdId();
  await updateBudget(householdId, budgetId, validateBudget(budget));
  revalidateBudgetViews();
}

export async function deleteBudgetAction(budgetId: string) {
  const householdId = await requireHouseholdId();
  await deleteBudget(householdId, budgetId);
  revalidateBudgetViews();
}
