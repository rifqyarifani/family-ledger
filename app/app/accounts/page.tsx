import { EmptyState } from "@/components/empty-state";
import { AccountsClient } from "@/app/app/accounts/accounts-client";
import { getAccounts } from "@/src/lib/data/accounts";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getTransactions } from "@/src/lib/data/transactions";

export default async function AccountsPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before managing accounts." />;
  }

  const [accounts, transactions] = await Promise.all([
    getAccounts(household.id),
    getTransactions(household.id)
  ]);

  return <AccountsClient accounts={accounts} transactions={transactions} />;
}
