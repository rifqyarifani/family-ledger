import { EmptyState } from "@/components/empty-state";
import { AccountsClient } from "@/app/app/accounts/accounts-client";
import { getAccountBalanceMap, getAccounts } from "@/src/lib/data/accounts";
import { getActiveHousehold } from "@/src/lib/data/households";

export default async function AccountsPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before managing accounts." />;
  }

  const accounts = await getAccounts(household.id);
  const accountBalances = await getAccountBalanceMap(household.id, accounts);

  return <AccountsClient accounts={accounts} accountBalances={accountBalances} />;
}
