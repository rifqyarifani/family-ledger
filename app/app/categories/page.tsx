import { CategoriesClient } from "@/app/app/categories/categories-client";
import { EmptyState } from "@/components/empty-state";
import { getCategories } from "@/src/lib/data/categories";
import { getActiveHousehold } from "@/src/lib/data/households";

export default async function CategoriesPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before managing categories." />;
  }

  const categories = (await getCategories(household.id)).filter(
    (category) => category.type === "income" || category.type === "expense"
  );

  return <CategoriesClient categories={categories} />;
}
