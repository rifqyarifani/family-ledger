import { BudgetClient } from "@/app/app/budget/budget-client";
import { EmptyState } from "@/components/empty-state";
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
    return <EmptyState title="No household found" message="Create a household before managing budgets." />;
  }

  const [budgets, transactions, categories] = await Promise.all([
    getBudgetsForMonth(household.id, selectedMonth),
    getTransactionsForMonth(household.id, selectedMonth),
    getCategories(household.id)
  ]);
  const expenseCategories = categories
    .filter((category) => category.type === "expense")
    .map((category) => category.name);

  return (
    <BudgetClient
      budgets={budgets}
      transactions={transactions}
      expenseCategories={expenseCategories}
      selectedMonth={selectedMonth}
    />
  );
}
