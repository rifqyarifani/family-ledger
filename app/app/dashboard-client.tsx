"use client";

import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
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
import { PageIntro } from "@/components/page-intro";
import { BudgetCard } from "@/components/budget-card";
import { Progress } from "@/components/progress";
import { StatCard } from "@/components/stat-card";
import { TransactionTable } from "@/components/transaction-table";
import { chartColors } from "@/constants/finance";
import {
  calculateBalance,
  calculateSavingsRate,
  calculateTotalExpense,
  calculateTotalIncome,
  filterTransactionsByMonth,
  formatCurrency,
  getCurrentMonthKey,
  groupTransactionsByCategory,
  groupTransactionsByMonth
} from "@/lib/finance";
import type { Account, Budget, FamilyMember, SavingsGoal, Transaction } from "@/types/finance";

export function DashboardClient({
  transactions,
  accounts,
  familyMembers,
  budgets,
  savingsGoals
}: {
  transactions: Transaction[];
  accounts: Account[];
  familyMembers: FamilyMember[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
}) {
  const month = getCurrentMonthKey();
  const monthlyTransactions = filterTransactionsByMonth(transactions, month);
  const totalBalance = calculateBalance(transactions, accounts);
  const monthlyIncome = calculateTotalIncome(monthlyTransactions);
  const monthlyExpense = calculateTotalExpense(monthlyTransactions);
  const savingsRate = calculateSavingsRate(monthlyTransactions);
  const cashflow = groupTransactionsByMonth(transactions);
  const spending = groupTransactionsByCategory(monthlyTransactions);
  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const currentBudgets = budgets.filter((budget) => budget.month === month).slice(0, 2);
  const monthlySavingGoal = savingsGoals[0];
  const monthlySavingGoalProgress = monthlySavingGoal
    ? Math.min(100, Math.round((monthlySavingGoal.savedAmount / monthlySavingGoal.targetAmount) * 100))
    : 0;

  return (
    <>
      <PageIntro
        title="Dashboard"
        description="A current overview of your household money, monthly flow, and recent manual records."
      />
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Total balance"
          value={formatCurrency(totalBalance)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          title="Monthly income"
          value={formatCurrency(monthlyIncome)}
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
        <StatCard
          title="Monthly expenses"
          value={formatCurrency(monthlyExpense)}
          icon={<ArrowDownRight className="h-5 w-5" />}
        />
        <StatCard
          title="Savings rate"
          value={`${savingsRate}%`}
          icon={<PiggyBank className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <ChartCard title="Cashflow Trend">
          {cashflow.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value: number) => `${value / 1000000}m`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="income" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="#fee2e2" strokeWidth={2} />
                <Area type="monotone" dataKey="savings" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No cashflow yet" message="Add income or expense transactions to build the monthly trend." />
          )}
        </ChartCard>
        <ChartCard title="Spending Breakdown">
          {spending.length > 0 ? (
            <div className="flex h-full flex-col">
              <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <Pie data={spending} dataKey="amount" nameKey="category" innerRadius={52} outerRadius={82} paddingAngle={4}>
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
                  <div key={item.category} className="flex min-w-0 items-center gap-2 text-xs">
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
            <EmptyState title="No spending yet" message="Expense categories will appear after you add transactions this month." />
          )}
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader title="Budget Progress" />
          {currentBudgets.length > 0 ? (
            <div className="grid gap-4">
              {currentBudgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} transactions={transactions} />
              ))}
            </div>
          ) : (
            <EmptyState title="No budgets this month" message="Create budgets to track monthly category limits." />
          )}
        </Card>
        <Card>
          <CardHeader title="Recent Transactions" />
          <TransactionTable transactions={recentTransactions} members={familyMembers} accounts={accounts} />
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Monthly Saving Goal" />
        {monthlySavingGoal ? (
          <div className="grid gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-950">{monthlySavingGoal.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(monthlySavingGoal.savedAmount)} / {formatCurrency(monthlySavingGoal.targetAmount)}
                </p>
              </div>
              <p className="text-2xl font-semibold text-slate-950">{monthlySavingGoalProgress}%</p>
            </div>
            <Progress value={monthlySavingGoalProgress} />
          </div>
        ) : (
          <EmptyState title="No saving goal yet" message="Create a savings goal linked to a savings account to track progress." />
        )}
      </Card>
    </>
  );
}
