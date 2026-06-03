"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { Card, CardHeader } from "@/components/card";
import { ChartCard } from "@/components/chart-card";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { BudgetCard } from "@/components/budget-card";
import { Progress } from "@/components/progress";
import { StatCard } from "@/components/stat-card";
import { TransactionTable } from "@/components/transaction-table";
import {
  calculateSavingsRate,
  calculateTotalExpense,
  calculateTotalIncome,
  formatCurrency,
  getCurrentMonthKey,
  groupTransactionsByCategory,
  groupTransactionsByMonth,
} from "@/lib/finance";
import type {
  Account,
  AccountBalanceMap,
  Budget,
  Category,
  FamilyMember,
  SavingsGoal,
  Transaction,
  TransactionMonthMetric,
} from "@/types/finance";

const CashflowTrendChart = dynamic(
  () =>
    import("@/app/app/dashboard-charts").then(
      (module) => module.CashflowTrendChart,
    ),
  { ssr: false, loading: () => <ChartLoading /> },
);

const SpendingBreakdownChart = dynamic(
  () =>
    import("@/app/app/dashboard-charts").then(
      (module) => module.SpendingBreakdownChart,
    ),
  { ssr: false, loading: () => <ChartLoading /> },
);

function ChartLoading() {
  return <div className="h-full min-h-48 rounded-lg bg-slate-50" />;
}

export function DashboardClient({
  monthlyTransactions,
  cashflowTransactions,
  recentTransactions,
  accounts,
  accountBalances,
  familyMembers,
  categories = [],
  budgets,
  savingsGoals
}: {
  monthlyTransactions: Transaction[];
  cashflowTransactions: TransactionMonthMetric[];
  recentTransactions: Transaction[];
  accounts: Account[];
  accountBalances: AccountBalanceMap;
  familyMembers: FamilyMember[];
  categories?: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
}) {
  const month = getCurrentMonthKey();
  const totalBalance = useMemo(
    () =>
      accounts.reduce(
        (total, account) =>
          total + (accountBalances[account.id] ?? account.openingBalance),
        0,
      ),
    [accounts, accountBalances],
  );
  const monthlyIncome = useMemo(
    () => calculateTotalIncome(monthlyTransactions),
    [monthlyTransactions],
  );
  const monthlyExpense = useMemo(
    () => calculateTotalExpense(monthlyTransactions),
    [monthlyTransactions],
  );
  const savingsRate = useMemo(
    () => calculateSavingsRate(monthlyTransactions),
    [monthlyTransactions],
  );
  const cashflow = useMemo(
    () => groupTransactionsByMonth(cashflowTransactions),
    [cashflowTransactions],
  );
  const spending = useMemo(() => {
    const grouped = groupTransactionsByCategory(monthlyTransactions);
    return grouped.map((item) => {
      const category = categories.find((c) => c.name === item.category);
      return { ...item, color: category?.color };
    });
  }, [monthlyTransactions, categories]);
  const currentBudgets = useMemo(
    () => budgets.filter((budget) => budget.month === month).slice(0, 2),
    [budgets, month],
  );
  const monthlySavingGoal = savingsGoals[0];
  const monthlySavingGoalProgress = monthlySavingGoal
    ? Math.min(
        100,
        Math.round(
          (monthlySavingGoal.savedAmount / monthlySavingGoal.targetAmount) *
            100,
        ),
      )
    : 0;

  return (
    <>
      <PageIntro title="Dashboard" />
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
            <CashflowTrendChart data={cashflow} />
          ) : (
            <EmptyState
              title="No cashflow yet"
              message="Add income or expense transactions to build the monthly trend."
            />
          )}
        </ChartCard>
        <ChartCard title="Spending Breakdown">
          {spending.length > 0 ? (
            <SpendingBreakdownChart data={spending} />
          ) : (
            <EmptyState
              title="No spending yet"
              message="Expense categories will appear after you add transactions this month."
            />
          )}
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader title="Budget Progress" />
          {currentBudgets.length > 0 ? (
            <div className="grid gap-4">
              {currentBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  transactions={monthlyTransactions}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No budgets this month"
              message="Create budgets to track monthly category limits."
            />
          )}
        </Card>
        <Card>
          <CardHeader title="Recent Transactions" />
          <TransactionTable
            transactions={recentTransactions}
            members={familyMembers}
            accounts={accounts}
          />
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Monthly Saving Goal" />
        {monthlySavingGoal ? (
          <div className="grid gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-950">
                  {monthlySavingGoal.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(monthlySavingGoal.savedAmount)} /{" "}
                  {formatCurrency(monthlySavingGoal.targetAmount)}
                </p>
              </div>
              <p className="text-2xl font-semibold text-slate-950">
                {monthlySavingGoalProgress}%
              </p>
            </div>
            <Progress value={monthlySavingGoalProgress} />
          </div>
        ) : (
          <EmptyState
            title="No saving goal yet"
            message="Create a savings goal linked to a savings account to track progress."
          />
        )}
      </Card>
    </>
  );
}
