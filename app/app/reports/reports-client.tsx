"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Landmark,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardHeader } from "@/components/card";
import { ChartCard } from "@/components/chart-card";
import { EmptyState } from "@/components/empty-state";
import { Select } from "@/components/form-field";
import { PageIntro } from "@/components/page-intro";
import { StatCard } from "@/components/stat-card";
import {
  calculateTotalExpense,
  calculateTotalIncome,
  filterTransactionsByMonth,
  formatCurrency,
  formatMonthKey,
  getMonthOptions,
  groupTransactionsByCategory,
  groupTransactionsByMember,
  groupTransactionsByMonth,
} from "@/lib/finance";
import type { Transaction } from "@/types/finance";

const MonthlyIncomeExpenseChart = dynamic(
  () =>
    import("@/app/app/reports/report-charts").then(
      (module) => module.MonthlyIncomeExpenseChart,
    ),
  { ssr: false, loading: () => <ChartLoading /> },
);

const NetCashflowTrendChart = dynamic(
  () =>
    import("@/app/app/reports/report-charts").then(
      (module) => module.NetCashflowTrendChart,
    ),
  { ssr: false, loading: () => <ChartLoading /> },
);

const SpendingByCategoryChart = dynamic(
  () =>
    import("@/app/app/reports/report-charts").then(
      (module) => module.SpendingByCategoryChart,
    ),
  { ssr: false, loading: () => <ChartLoading /> },
);

const ExpenseByMemberChart = dynamic(
  () =>
    import("@/app/app/reports/report-charts").then(
      (module) => module.ExpenseByMemberChart,
    ),
  { ssr: false, loading: () => <ChartLoading /> },
);

function ChartLoading() {
  return <div className="h-full min-h-48 rounded-lg bg-slate-50" />;
}

export function ReportsClient({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const monthOptions = useMemo(
    () => getMonthOptions(transactions),
    [transactions],
  );
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);

  useEffect(() => {
    if (!monthOptions.includes(selectedMonth)) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  const monthlyTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  );
  const monthlyIncome = useMemo(
    () => calculateTotalIncome(monthlyTransactions),
    [monthlyTransactions],
  );
  const monthlyExpense = useMemo(
    () => calculateTotalExpense(monthlyTransactions),
    [monthlyTransactions],
  );
  const netCashflow = useMemo(
    () => monthlyIncome - monthlyExpense,
    [monthlyIncome, monthlyExpense],
  );
  const spending = useMemo(
    () => groupTransactionsByCategory(monthlyTransactions),
    [monthlyTransactions],
  );
  const spendingByMember = useMemo(
    () => groupTransactionsByMember(monthlyTransactions),
    [monthlyTransactions],
  );
  const topCategory = useMemo(() => spending[0], [spending]);
  const topMember = useMemo(() => spendingByMember[0], [spendingByMember]);
  const monthlyData = useMemo(
    () => groupTransactionsByMonth(transactions),
    [transactions],
  );

  return (
    <>
      <PageIntro
        title="Reports"
        action={
          <Select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            aria-label="Filter month"
            className="w-full sm:w-44"
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonthKey(month)}
              </option>
            ))}
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Monthly income"
          value={formatCurrency(monthlyIncome)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Monthly expense"
          value={formatCurrency(monthlyExpense)}
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          title="Net cashflow"
          value={formatCurrency(netCashflow)}
          icon={<Landmark className="h-5 w-5" />}
        />
        <StatCard
          title="Top expense category"
          value={topCategory?.category ?? "None"}
          detail={topCategory ? formatCurrency(topCategory.amount) : undefined}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Monthly Income vs Expense">
          {monthlyData.length > 0 ? (
            <MonthlyIncomeExpenseChart data={monthlyData} />
          ) : (
            <EmptyState
              title="No monthly data"
              message="Add transactions to compare income and expenses by month."
            />
          )}
        </ChartCard>

        <ChartCard title="Net Cashflow Trend">
          {monthlyData.length > 0 ? (
            <NetCashflowTrendChart data={monthlyData} />
          ) : (
            <EmptyState
              title="No cashflow trend"
              message="Net cashflow appears after income or expense transactions exist."
            />
          )}
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <ChartCard title="Spending by Category">
          {spending.length > 0 ? (
            <SpendingByCategoryChart data={spending} />
          ) : (
            <EmptyState
              title="No category spend"
              message="Add expense transactions for this month to populate the chart."
            />
          )}
        </ChartCard>

        <Card>
          <CardHeader title="Category Detail" />
          {spending.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {spending.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {item.category}
                  </span>
                  <span className="text-sm font-semibold text-slate-950">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No expenses"
              message="This month has no manual expense records yet."
            />
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Expense by Member">
          {spendingByMember.length > 0 ? (
            <ExpenseByMemberChart data={spendingByMember} />
          ) : (
            <EmptyState
              title="No member spending"
              message="Expense by member appears after expenses are recorded for this month."
            />
          )}
        </ChartCard>

        <StatCard
          title="Top spending member"
          value={topMember?.member ?? "None"}
          detail={topMember ? formatCurrency(topMember.amount) : undefined}
          icon={<Users className="h-5 w-5" />}
        />
      </div>
    </>
  );
}
