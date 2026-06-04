import { ReportsClient } from "@/app/app/reports/reports-client";
import { NoHouseholdCallout } from "@/components/no-household-callout";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getCategories } from "@/src/lib/data/categories";
import { getReportTransactions } from "@/src/lib/data/transactions";

export default async function ReportsPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <NoHouseholdCallout message="Create a household before viewing reports." />;
  }

  const [transactions, categories] = await Promise.all([
    getReportTransactions(household.id),
    getCategories(household.id)
  ]);

  return <ReportsClient transactions={transactions} categories={categories} />;
}
