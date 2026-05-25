import { EmptyState } from "@/components/empty-state";
import { TransactionsClient } from "@/app/app/transactions/transactions-client";
import { getAccounts } from "@/src/lib/data/accounts";
import { getCategories } from "@/src/lib/data/categories";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getCurrentHouseholdMemberId, getHouseholdMembers } from "@/src/lib/data/household-members";
import { getTransactions } from "@/src/lib/data/transactions";

export default async function TransactionsPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before managing transactions." />;
  }

  const [transactions, familyMembers, accounts, categories, currentMemberId] = await Promise.all([
    getTransactions(household.id),
    getHouseholdMembers(household.id),
    getAccounts(household.id),
    getCategories(household.id),
    getCurrentHouseholdMemberId(household.id)
  ]);

  return (
    <TransactionsClient
      transactions={transactions}
      familyMembers={familyMembers}
      accounts={accounts}
      categories={categories}
      currentMemberId={currentMemberId}
    />
  );
}
