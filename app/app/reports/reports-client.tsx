"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Landmark, TrendingDown, TrendingUp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardHeader } from "@/components/card";
import { ChartCard } from "@/components/chart-card";
import { EmptyState } from "@/components/empty-state";
import { Select } from "@/components/form-field";
import { PageIntro } from "@/components/page-intro";
import { StatCard } from "@/components/stat-card";
import { chartColors } from "@/constants/finance";
import {
  calculateTotalExpense,
  calculateTotalIncome,
  filterTransactionsByMonth,
  formatCurrency,
  formatMonthKey,
  getMonthOptions,
  groupTransactionsByCategory,
  groupTransactionsByMember,
  groupTransactionsByMonth
} from "@/lib/finance";
import type { Transaction } from "@/types/finance";

export function ReportsClient({ transactions }: { transactions: Transaction[] }) {
  const monthOptions = useMemo(() => getMonthOptions(transactions), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);

  useEffect(() => {
    if (!monthOptions.includes(selectedMonth)) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  const monthlyTransactions = filterTransactionsByMonth(transactions, selectedMonth);
  const monthlyIncome = calculateTotalIncome(monthlyTransactions);
  const monthlyExpense = calculateTotalExpense(monthlyTransactions);
  const netCashflow = monthlyIncome - monthlyExpense;
  const spending = groupTransactionsByCategory(monthlyTransactions);
  const spendingByMember = groupTransactionsByMember(monthlyTransactions);
  const topCategory = spending[0];
  const topMember = spendingByMember[0];
  const monthlyData = groupTransactionsByMonth(transactions);

  return (
    <>
      <PageIntro
        title="Reports"
        description="Understand monthly income, expenses, category spending, member spending, and net cashflow."
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
        <StatCard title="Monthly income" value={formatCurrency(monthlyIncome)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Monthly expense" value={formatCurrency(monthlyExpense)} icon={<TrendingDown className="h-5 w-5" />} />
        <StatCard title="Net cashflow" value={formatCurrency(netCashflow)} icon={<Landmark className="h-5 w-5" />} />
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value: string) => formatMonthKey(value)}
                />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value: number) => `${value / 1000000}m`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No monthly data" message="Add transactions to compare income and expenses by month." />
          )}
        </ChartCard>

        <ChartCard title="Net Cashflow Trend">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value: string) => formatMonthKey(value)}
                />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value: number) => `${value / 1000000}m`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="savings" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No cashflow trend" message="Net cashflow appears after income or expense transactions exist." />
          )}
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <ChartCard title="Spending by Category">
          {spending.length > 0 ? (
            <div className="flex h-full flex-col">
              <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <Pie data={spending} dataKey="amount" nameKey="category" outerRadius={82}>
                      {spending.map((entry, index) => (
                        <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2">
                {spending.map((item, index) => (
                  <div key={item.category} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-slate-600">{item.category}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No category spend" message="Add expense transactions for this month to populate the chart." />
          )}
        </ChartCard>

        <Card>
          <CardHeader title="Category Detail" />
          {spending.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {spending.map((item) => (
                <div key={item.category} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{item.category}</span>
                  <span className="text-sm font-semibold text-slate-950">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No expenses" message="This month has no manual expense records yet." />
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Expense by Member">
          {spendingByMember.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingByMember} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(value: number) => `${value / 1000000}m`} />
                <YAxis type="category" dataKey="member" stroke="#64748b" fontSize={12} width={90} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#0f172a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No member spending" message="Expense by member appears after expenses are recorded for this month." />
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
