import { FamilyClient } from "@/app/app/family/family-client";
import { NoHouseholdCallout } from "@/components/no-household-callout";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getHouseholdMembers } from "@/src/lib/data/household-members";
import { getFamilyMemberTransactionTotals } from "@/src/lib/data/transactions";

export default async function FamilyPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <NoHouseholdCallout message="Create a household before managing family members." />;
  }

  const [familyMembers, transactionTotals] = await Promise.all([
    getHouseholdMembers(household.id),
    getFamilyMemberTransactionTotals(household.id)
  ]);

  return <FamilyClient familyMembers={familyMembers} transactionTotals={transactionTotals} />;
}
