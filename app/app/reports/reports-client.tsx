"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Landmark,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { ChartCard } from "@/components/chart-card";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageIntro } from "@/components/page-intro";
import { StatCard } from "@/components/stat-card";
import {
  calculateTotalExpense,
  calculateTotalIncome,
  filterTransactionsByMonth,
  formatCurrency,
  getMonthOptions,
  groupTransactionsByCategory,
  groupTransactionsByMember,
  groupTransactionsByMonth,
} from "@/lib/finance";
import type { Category, Transaction } from "@/types/finance";

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
  categories = [],
}: {
  transactions: Transaction[];
  categories?: Category[];
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
  const spending = useMemo(() => {
    const grouped = groupTransactionsByCategory(monthlyTransactions);
    return grouped.map((item) => {
      const category = categories.find((c) => c.name === item.category);
      return { ...item, color: category?.color };
    });
  }, [monthlyTransactions, categories]);
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

  function getAdjacentMonth(monthKey: string, offset: number) {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  return (
    <>
      <PageIntro
        title="Reports"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedMonth(getAdjacentMonth(selectedMonth, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <div className="w-48">
              <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedMonth(getAdjacentMonth(selectedMonth, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
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
