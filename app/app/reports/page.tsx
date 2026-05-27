import { ReportsClient } from "@/app/app/reports/reports-client";
import { EmptyState } from "@/components/empty-state";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getReportTransactions } from "@/src/lib/data/transactions";

export default async function ReportsPage() {
  const household = await getActiveHousehold();

  if (!household) {
    return <EmptyState title="No household found" message="Create a household before viewing reports." />;
  }

  const transactions = await getReportTransactions(household.id);

  return <ReportsClient transactions={transactions} />;
}
