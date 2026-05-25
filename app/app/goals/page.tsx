import { GoalsClient } from "@/app/app/goals/goals-client";
import { EmptyState } from "@/components/empty-state";
import { calculateAccountBalance } from "@/lib/finance";
import { getAccounts } from "@/src/lib/data/accounts";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getSavingsGoals } from "@/src/lib/data/savings-goals";
import { getTransactions } from "@/src/lib/data/transactions";
import type { Account, SavingsGoal, SavingsGoalAccountOption, Transaction } from "@/types/finance";

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

function getSavingsAccountOptions(accounts: Account[], transactions: Transaction[]): SavingsGoalAccountOption[] {
  return accounts
    .filter((account) => account.type === "savings")
    .map((account) => ({
      name: account.name,
      savedAmount: Math.max(0, calculateAccountBalance(account, transactions))
    }));
}

export default async function GoalsPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before managing savings goals." />;
  }

  const [savingsGoals, accounts, transactions] = await Promise.all([
    getSavingsGoals(household.id),
    getAccounts(household.id),
    getTransactions(household.id)
  ]);

  return (
    <GoalsClient
      savingsGoals={applySavingsAccountTracking({
        goals: savingsGoals,
        accounts,
        transactions
      })}
      savingsAccountOptions={getSavingsAccountOptions(accounts, transactions)}
    />
  );
}
