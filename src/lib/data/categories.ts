import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";
import type { Category, TransactionType } from "@/types/finance";

const defaultCategories: Array<Omit<Category, "id">> = [
  { name: "Salary", type: "income", color: "#16a34a" },
  { name: "Side Income", type: "income", color: "#22c55e" },
  { name: "Food & Groceries", type: "expense", color: "#2563eb" },
  { name: "Bills & Utilities", type: "expense", color: "#0f172a" },
  { name: "Education", type: "expense", color: "#f59e0b" },
  { name: "Transport", type: "expense", color: "#d97706" },
  { name: "Entertainment", type: "expense", color: "#7c3aed" },
  { name: "Savings", type: "expense", color: "#14b8a6" },
  { name: "Transfer", type: "transfer", color: "#64748b" }
];

type CategoryRow = {
  id: string;
  name: string;
  type: TransactionType;
  color: string | null;
  icon: string | null;
};

export type CategoryInput = {
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined
  };
}

export async function getCategories(householdId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, color, icon")
    .eq("household_id", householdId)
    .order("type", { ascending: true })
    .order("name", { ascending: true })
    .returns<CategoryRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapCategory);
}

export async function createCategory(householdId: string, category: CategoryInput) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("categories").insert({
    household_id: householdId,
    name: category.name,
    type: category.type,
    color: category.color ?? null,
    icon: category.icon ?? null,
    created_by: user?.id ?? null
  });

  if (error) {
    throw new Error(error.code === "23505" ? "This category already exists." : error.message);
  }
}

export async function updateCategory(householdId: string, categoryId: string, category: CategoryInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: category.name,
      type: category.type,
      color: category.color ?? null,
      icon: category.icon ?? null
    })
    .eq("household_id", householdId)
    .eq("id", categoryId);

  if (error) {
    throw new Error(error.code === "23505" ? "This category already exists." : error.message);
  }
}

export async function deleteCategory(householdId: string, categoryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("household_id", householdId)
    .eq("id", categoryId)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "Cannot delete this category. It has linked records that must be removed first."
      );
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Category was not found or could not be deleted.");
  }
}

export type CategoryImpact = {
  transactionCount: number;
  budgetCount: number;
};

export async function getCategoryImpact(
  householdId: string,
  categoryId: string
): Promise<CategoryImpact> {
  const supabase = await createClient();
  const [txnResult, budgetResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("household_id", householdId)
      .eq("category_id", categoryId),
    supabase
      .from("budgets")
      .select("id", { count: "exact", head: true })
      .eq("household_id", householdId)
      .eq("category_id", categoryId)
  ]);

  if (txnResult.error) {
    throw new Error(txnResult.error.message);
  }
  if (budgetResult.error) {
    throw new Error(budgetResult.error.message);
  }

  return {
    transactionCount: txnResult.count ?? 0,
    budgetCount: budgetResult.count ?? 0
  };
}

export async function getCategoryImpactMap(
  householdId: string,
  categoryIds: string[]
): Promise<Record<string, CategoryImpact>> {
  const result: Record<string, CategoryImpact> = {};
  for (const id of categoryIds) {
    result[id] = { transactionCount: 0, budgetCount: 0 };
  }

  if (categoryIds.length === 0) {
    return result;
  }

  const supabase = await createClient();
  const [txnResult, budgetResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("category_id")
      .eq("household_id", householdId)
      .in("category_id", categoryIds),
    supabase
      .from("budgets")
      .select("category_id")
      .eq("household_id", householdId)
      .in("category_id", categoryIds)
  ]);

  if (txnResult.error) {
    throw new Error(txnResult.error.message);
  }
  if (budgetResult.error) {
    throw new Error(budgetResult.error.message);
  }

  for (const txn of txnResult.data ?? []) {
    if (txn.category_id && txn.category_id in result) {
      result[txn.category_id].transactionCount += 1;
    }
  }
  for (const budget of budgetResult.data ?? []) {
    if (budget.category_id && budget.category_id in result) {
      result[budget.category_id].budgetCount += 1;
    }
  }

  return result;
}

export async function createDefaultCategories(householdId: string, userId: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("categories").upsert(
    defaultCategories.map((category) => ({
      household_id: householdId,
      name: category.name,
      type: category.type,
      color: category.color,
      created_by: userId
    })),
    { onConflict: "household_id,name,type" }
  );

  if (error) {
    throw error;
  }
}


