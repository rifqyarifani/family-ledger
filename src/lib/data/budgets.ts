import { createClient } from "@/src/lib/supabase/server";
import type { Budget } from "@/types/finance";

type BudgetRow = {
  id: string;
  budget_month: string;
  limit_amount: number | string;
  categories: {
    name: string;
  } | null;
};

export type BudgetInput = {
  category: string;
  limit: number;
  month: string;
};

function mapBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    category: row.categories?.name ?? "Uncategorized",
    limit: Number(row.limit_amount),
    month: row.budget_month.slice(0, 7)
  };
}

async function getExpenseCategoryId(householdId: string, categoryName: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("household_id", householdId)
    .eq("type", "expense")
    .eq("name", categoryName)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Choose a valid expense category.");
  }

  return data.id;
}

function toBudgetMonthDate(month: string) {
  return `${month}-01`;
}

export async function getBudgets(householdId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .select("id, budget_month, limit_amount, categories(name)")
    .eq("household_id", householdId)
    .order("budget_month", { ascending: false })
    .returns<BudgetRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapBudget);
}

export async function createBudget(householdId: string, budget: BudgetInput) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const categoryId = await getExpenseCategoryId(householdId, budget.category);
  const { error } = await supabase.from("budgets").insert({
    household_id: householdId,
    category_id: categoryId,
    budget_month: toBudgetMonthDate(budget.month),
    limit_amount: budget.limit,
    created_by: user?.id ?? null
  });

  if (error) {
    throw new Error(error.code === "23505" ? "This category already has a budget for the selected month." : error.message);
  }
}

export async function updateBudget(householdId: string, budgetId: string, budget: BudgetInput) {
  const supabase = await createClient();
  const categoryId = await getExpenseCategoryId(householdId, budget.category);
  const { error } = await supabase
    .from("budgets")
    .update({
      category_id: categoryId,
      budget_month: toBudgetMonthDate(budget.month),
      limit_amount: budget.limit
    })
    .eq("household_id", householdId)
    .eq("id", budgetId);

  if (error) {
    throw new Error(error.code === "23505" ? "This category already has a budget for the selected month." : error.message);
  }
}

export async function deleteBudget(householdId: string, budgetId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .delete()
    .eq("household_id", householdId)
    .eq("id", budgetId)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Budget was not found or could not be deleted.");
  }
}
