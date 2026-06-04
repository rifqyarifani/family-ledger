"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryInput
} from "@/src/lib/data/categories";
import { requireHouseholdId } from "@/lib/household-utils";
import type { CategoryFormInput } from "@/types/finance";

function validateCategory(category: CategoryFormInput): CategoryInput {
  const name = category.name.trim();

  if (!name || name.length > 30) {
    throw new Error("Category name must be 1-30 characters.");
  }

  if (category.type !== "income" && category.type !== "expense") {
    throw new Error("Choose income or expense.");
  }

  return {
    name,
    type: category.type,
    color: category.color,
    icon: category.icon
  };
}


function revalidateCategoryViews() {
  revalidatePath("/app");
  revalidatePath("/app/categories");
  revalidatePath("/app/budget");
  revalidatePath("/app/reports");
  revalidatePath("/app/transactions");
}

export async function createCategoryAction(category: CategoryFormInput) {
  const householdId = await requireHouseholdId();
  await createCategory(householdId, validateCategory(category));
  revalidateCategoryViews();
}

export async function updateCategoryAction(categoryId: string, category: CategoryFormInput) {
  const householdId = await requireHouseholdId();
  await updateCategory(householdId, categoryId, validateCategory(category));
  revalidateCategoryViews();
}

export async function deleteCategoryAction(categoryId: string) {
  const householdId = await requireHouseholdId();
  await deleteCategory(householdId, categoryId);
  revalidateCategoryViews();
}
