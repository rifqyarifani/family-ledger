import { CategoriesClient } from "@/app/app/categories/categories-client";
import { NoHouseholdCallout } from "@/components/no-household-callout";
import { getCategories, getCategoryImpactMap } from "@/src/lib/data/categories";
import { getActiveHousehold } from "@/src/lib/data/households";

export default async function CategoriesPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <NoHouseholdCallout message="Create a household before managing categories." />;
  }

  const categories = (await getCategories(household.id)).filter(
    (category) => category.type === "income" || category.type === "expense"
  );

  const categoryImpacts = await getCategoryImpactMap(
    household.id,
    categories.map((category) => category.id)
  );

  return <CategoriesClient categories={categories} categoryImpacts={categoryImpacts} />;
}
