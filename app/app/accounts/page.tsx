import { AccountsClient } from "@/app/app/accounts/accounts-client";
import { NoHouseholdCallout } from "@/components/no-household-callout";
import {
  getAccountBalanceMap,
  getAccountImpactMap,
  getAccounts,
  type AccountImpact
} from "@/src/lib/data/accounts";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getHouseholdMembers } from "@/src/lib/data/household-members";

export default async function AccountsPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <NoHouseholdCallout message="Create a household before managing accounts." />;
  }

  const householdId = household.id;

  const [accounts, accountBalances, members] = await Promise.all([
    getAccounts(householdId),
    getAccountBalanceMap(householdId),
    getHouseholdMembers(householdId)
  ]);

  const accountImpacts: Record<string, AccountImpact> = await getAccountImpactMap(
    householdId,
    accounts.map((account) => account.id)
  );

  return (
    <AccountsClient
      accounts={accounts}
      accountBalances={accountBalances}
      accountImpacts={accountImpacts}
      members={members}
    />
  );
}
