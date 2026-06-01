import { getActiveHousehold } from "@/src/lib/data/households";

export async function requireHouseholdId() {
  const household = await getActiveHousehold();

  if (!household) {
    throw new Error("No active household found.");
  }

  return household.id;
}
