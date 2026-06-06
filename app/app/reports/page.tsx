import { ReportsClient } from "@/app/app/reports/reports-client";
import { NoHouseholdCallout } from "@/components/no-household-callout";
import { getCurrentMonthKey } from "@/lib/finance";
import { getActiveHousehold } from "@/src/lib/data/households";
import { getCategories } from "@/src/lib/data/categories";
import { getReportTransactions } from "@/src/lib/data/transactions";

function normalizeMonthParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : getCurrentMonthKey();
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const selectedMonth = normalizeMonthParam(params.month);
  const household = await getActiveHousehold();

  if (!household) {
    return <NoHouseholdCallout message="Create a household before viewing reports." />;
  }

  const [transactions, categories] = await Promise.all([
    getReportTransactions(household.id),
    getCategories(household.id)
  ]);

  return (
    <ReportsClient
      transactions={transactions}
      categories={categories}
      selectedMonth={selectedMonth}
    />
  );
}
