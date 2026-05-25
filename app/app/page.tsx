import { DashboardClient } from "@/app/app/dashboard-client";
import { EmptyState } from "@/components/empty-state";
import { calculateAccountBalance } from "@/lib/finance";
import { getAccounts } from "@/src/lib/data/accounts";
import { getBudgets } from "@/src/lib/data/budgets";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getHouseholdMembers } from "@/src/lib/data/household-members";
import { getSavingsGoals } from "@/src/lib/data/savings-goals";
import { getTransactions } from "@/src/lib/data/transactions";
import type { Account, SavingsGoal, Transaction } from "@/types/finance";

function normalizeLinkName(value: string) {
  return value.trim().toLowerCase();
}

function applySavingsAccountTracking({
  goals,
  accounts,
  transactions
}: {
  goals: SavingsGoal[];
  accounts: Account[];
  transactions: Transaction[];
}) {
  const savingsAccounts = accounts.filter((account) => account.type === "savings");

  return goals.map((goal) => {
    const linkedAccount = savingsAccounts.find((account) => normalizeLinkName(account.name) === normalizeLinkName(goal.name));

    if (!linkedAccount) {
      return goal;
    }

    return {
      ...goal,
      savedAmount: Math.max(0, calculateAccountBalance(linkedAccount, transactions))
    };
  });
}

export default async function DashboardPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before viewing the dashboard." />;
  }

  const [transactions, accounts, familyMembers, budgets, savingsGoals] = await Promise.all([
    getTransactions(household.id),
    getAccounts(household.id),
    getHouseholdMembers(household.id),
    getBudgets(household.id),
    getSavingsGoals(household.id)
  ]);

  return (
    <DashboardClient
      transactions={transactions}
      accounts={accounts}
      familyMembers={familyMembers}
      budgets={budgets}
      savingsGoals={applySavingsAccountTracking({ goals: savingsGoals, accounts, transactions })}
    />
  );
}
