import { FamilyClient } from "@/app/app/family/family-client";
import { EmptyState } from "@/components/empty-state";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getHouseholdMembers } from "@/src/lib/data/household-members";
import { getTransactions } from "@/src/lib/data/transactions";

export default async function FamilyPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before managing family members." />;
  }

  const [familyMembers, transactions] = await Promise.all([
    getHouseholdMembers(household.id),
    getTransactions(household.id)
  ]);

  return <FamilyClient familyMembers={familyMembers} transactions={transactions} />;
}
