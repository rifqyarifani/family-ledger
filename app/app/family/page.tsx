import { FamilyClient } from "@/app/app/family/family-client";
import { EmptyState } from "@/components/empty-state";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getHouseholdMembers } from "@/src/lib/data/household-members";
import { getFamilyMemberTransactionTotals } from "@/src/lib/data/transactions";

export default async function FamilyPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before managing family members." />;
  }

  const [familyMembers, transactionTotals] = await Promise.all([
    getHouseholdMembers(household.id),
    getFamilyMemberTransactionTotals(household.id)
  ]);

  return <FamilyClient familyMembers={familyMembers} transactionTotals={transactionTotals} />;
}
