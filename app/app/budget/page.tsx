import { BudgetClient } from "@/app/app/budget/budget-client";
import { EmptyState } from "@/components/empty-state";
import { getBudgets } from "@/src/lib/data/budgets";
import { getCategories } from "@/src/lib/data/categories";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getTransactions } from "@/src/lib/data/transactions";

export default async function BudgetPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before managing budgets." />;
  }

  const [budgets, transactions, categories] = await Promise.all([
    getBudgets(household.id),
    getTransactions(household.id),
    getCategories(household.id)
  ]);
  const expenseCategories = categories
    .filter((category) => category.type === "expense")
    .map((category) => category.name);

  return <BudgetClient budgets={budgets} transactions={transactions} expenseCategories={expenseCategories} />;
}
