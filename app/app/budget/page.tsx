import { BudgetClient } from "@/app/app/budget/budget-client";
import { NoHouseholdCallout } from "@/components/no-household-callout";
import { getCurrentMonthKey } from "@/lib/finance";
import { getBudgetsForMonth } from "@/src/lib/data/budgets";
import { getCategories } from "@/src/lib/data/categories";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getTransactionsForMonth } from "@/src/lib/data/transactions";

function normalizeMonthParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : getCurrentMonthKey();
}

export default async function BudgetPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const selectedMonth = normalizeMonthParam(params.month);
  const household = await getActiveHousehold();

  if (!household) {
    return <NoHouseholdCallout message="Create a household before managing budgets." />;
  }

  const [budgets, transactionsPage, categories] = await Promise.all([
    getBudgetsForMonth(household.id, selectedMonth),
    getTransactionsForMonth(household.id, selectedMonth),
    getCategories(household.id)
  ]);
  const expenseCategories = categories
    .filter((category) => category.type === "expense")
    .map((category) => category.name);

  const categoryMap: Record<string, { icon?: string; color?: string }> = {};
  for (const category of categories) {
    categoryMap[category.name] = { icon: category.icon, color: category.color };
  }

  return (
    <BudgetClient
      budgets={budgets}
      transactions={transactionsPage.items}
      expenseCategories={expenseCategories}
      selectedMonth={selectedMonth}
      categoryMap={categoryMap}
    />
  );
}
