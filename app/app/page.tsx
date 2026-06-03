import { DashboardClient } from "@/app/app/dashboard-client";
import { EmptyState } from "@/components/empty-state";
import { getCurrentMonthKey } from "@/lib/finance";
import { getAccountBalanceMap, getAccounts } from "@/src/lib/data/accounts";
import { getBudgetsForMonth } from "@/src/lib/data/budgets";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getHouseholdMembers } from "@/src/lib/data/household-members";
import { getSavingsGoals } from "@/src/lib/data/savings-goals";
import { getCategories } from "@/src/lib/data/categories";
import {
  getRecentTransactions,
  getTransactionMonthMetrics,
  getTransactionsForMonth
} from "@/src/lib/data/transactions";
import type { Account, AccountBalanceMap, SavingsGoal } from "@/types/finance";

function normalizeLinkName(value: string) {
  return value.trim().toLowerCase();
}

function applySavingsAccountTracking({
  goals,
  accounts,
  accountBalances
}: {
  goals: SavingsGoal[];
  accounts: Account[];
  accountBalances: AccountBalanceMap;
}) {
  const savingsAccounts = accounts.filter((account) => account.type === "savings");

  return goals.map((goal) => {
    const linkedAccount = savingsAccounts.find((account) => normalizeLinkName(account.name) === normalizeLinkName(goal.name));

    if (!linkedAccount) {
      return goal;
    }

    return {
      ...goal,
      savedAmount: Math.max(0, accountBalances[linkedAccount.id] ?? linkedAccount.openingBalance)
    };
  });
}

export default async function DashboardPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before viewing the dashboard." />;
  }

  const currentMonth = getCurrentMonthKey();
  const [monthlyPage, cashflowTransactions, recentPage, accounts, familyMembers, categories, budgets, savingsGoals] =
    await Promise.all([
      getTransactionsForMonth(household.id, currentMonth),
      getTransactionMonthMetrics(household.id),
      getRecentTransactions(household.id, 5),
      getAccounts(household.id),
      getHouseholdMembers(household.id),
      getCategories(household.id),
      getBudgetsForMonth(household.id, currentMonth),
      getSavingsGoals(household.id)
    ]);
  const accountBalances = await getAccountBalanceMap(household.id, accounts);

  return (
    <DashboardClient
      monthlyTransactions={monthlyPage.items}
      cashflowTransactions={cashflowTransactions}
      recentTransactions={recentPage.items}
      accounts={accounts}
      accountBalances={accountBalances}
      familyMembers={familyMembers}
      categories={categories}
      budgets={budgets}
      savingsGoals={applySavingsAccountTracking({ goals: savingsGoals, accounts, accountBalances })}
    />
  );
}
