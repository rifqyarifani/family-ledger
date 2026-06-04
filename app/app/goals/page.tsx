import { GoalsClient } from "@/app/app/goals/goals-client";
import { NoHouseholdCallout } from "@/components/no-household-callout";
import { getAccountBalanceMap, getAccounts } from "@/src/lib/data/accounts";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getSavingsGoals } from "@/src/lib/data/savings-goals";
import type { Account, AccountBalanceMap, SavingsGoal, SavingsGoalAccountOption } from "@/types/finance";

function applySavingsAccountTracking({
  goals,
  accounts,
  accountBalances
}: {
  goals: SavingsGoal[];
  accounts: Account[];
  accountBalances: AccountBalanceMap;
}) {
  return goals.map((goal) => {
    const linkedAccount = accounts.find((account) => account.id === goal.accountId);

    if (!linkedAccount) {
      return goal;
    }

    return {
      ...goal,
      name: linkedAccount.name,
      savedAmount: Math.max(0, accountBalances[linkedAccount.id] ?? linkedAccount.openingBalance)
    };
  });
}

function getSavingsAccountOptions(accounts: Account[], accountBalances: AccountBalanceMap): SavingsGoalAccountOption[] {
  return accounts
    .filter((account) => account.type === "savings")
    .map((account) => ({
      name: account.name,
      savedAmount: Math.max(0, accountBalances[account.id] ?? account.openingBalance)
    }));
}

export default async function GoalsPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <NoHouseholdCallout message="Create a household before managing savings goals." />;
  }

  const [savingsGoals, accounts] = await Promise.all([
    getSavingsGoals(household.id),
    getAccounts(household.id)
  ]);
  const accountBalances = await getAccountBalanceMap(household.id, accounts);

  const accountMap: Record<string, { icon?: string; iconColor?: string }> = {};
  for (const account of accounts) {
    accountMap[account.id] = { iconColor: account.iconColor };
  }

  const accountNameById: Record<string, string> = {};
  for (const account of accounts) {
    accountNameById[account.id] = account.name;
  }

  return (
    <GoalsClient
      savingsGoals={applySavingsAccountTracking({
        goals: savingsGoals,
        accounts,
        accountBalances
      })}
      savingsAccountOptions={getSavingsAccountOptions(accounts, accountBalances)}
      accountMap={accountMap}
      accountNameById={accountNameById}
    />
  );
}
