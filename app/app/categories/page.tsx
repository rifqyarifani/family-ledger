import { CategoriesClient } from "@/app/app/categories/categories-client";
import { EmptyState } from "@/components/empty-state";
import { getCategories, getCategoryImpact, type CategoryImpact } from "@/src/lib/data/categories";
import { getActiveHousehold } from "@/src/lib/data/households";

export default async function CategoriesPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before managing categories." />;
  }

  const categories = (await getCategories(household.id)).filter(
    (category) => category.type === "income" || category.type === "expense"
  );

  const impacts = await Promise.all(
    categories.map((category) => getCategoryImpact(household.id, category.id))
  );
  const categoryImpacts: Record<string, CategoryImpact> = {};
  for (let i = 0; i < categories.length; i += 1) {
    categoryImpacts[categories[i].id] = impacts[i];
  }

  return <CategoriesClient categories={categories} categoryImpacts={categoryImpacts} />;
}
