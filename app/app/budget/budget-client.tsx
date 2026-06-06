"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { iconLookup } from "@/constants/icons";
import {
  createBudgetAction,
  deleteBudgetAction,
  updateBudgetAction,
} from "@/app/app/budget/actions";
import { BudgetForm } from "@/components/budget-form";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { Modal } from "@/components/modal";
import { Progress } from "@/components/progress";
import { StatCard } from "@/components/stat-card";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { useRunAction } from "@/hooks/use-run-action";
import { cn } from "@/lib/utils";
import { formatCurrency, getAdjacentMonth, getBudgetUsage } from "@/lib/finance";
import type { Budget, Transaction } from "@/types/finance";

export function BudgetClient({
  budgets,
  transactions,
  expenseCategories,
  selectedMonth,
  categoryMap,
}: {
  budgets: Budget[];
  transactions: Transaction[];
  expenseCategories: string[];
  selectedMonth: string;
  categoryMap: Record<string, { icon?: string; color?: string }>;
}) {
  const budgetDialog = useCrudDialog<Budget>();
  const { isPending, isRunning, error, runAction } = useRunAction();
  const actionPending = isPending || isRunning;
  const router = useRouter();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hasExpenseCategories = expenseCategories.length > 0;

  const annotated = useMemo(
    () =>
      budgets
        .map((budget) => ({
          budget,
          usage: getBudgetUsage(budget, transactions),
        }))
        .sort((a, b) => {
          const pc = b.usage.percentage - a.usage.percentage;
          return pc !== 0
            ? pc
            : a.budget.category.localeCompare(b.budget.category);
        }),
    [budgets, transactions],
  );

  const summary = useMemo(() => {
    const totalBudget = annotated.reduce((sum, { budget }) => sum + budget.limit, 0);
    const totalUsed = annotated.reduce((sum, { usage }) => sum + usage.spent, 0);
    const remaining = totalBudget - totalUsed;
    const percentage = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;
    return { totalBudget, totalUsed, remaining, percentage };
  }, [annotated]);

  function changeMonth(month: string) {
    setOpenMenuId(null);
    router.push(`/app/budget?month=${month}`);
  }

  const monthNavClassName = cn(
    "inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full font-semibold text-ink-secondary transition hover:bg-surface hover:text-ink"
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <h1 className="shrink-0 text-3xl font-black tracking-normal text-ink sm:text-4xl">
            Budget
          </h1>
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:hidden">
            <Link
              href={`/app/budget?month=${getAdjacentMonth(selectedMonth, -1)}`}
              className={cn(monthNavClassName, "h-9 w-9 shrink-0")}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="min-w-0 flex-1">
              <MonthPicker value={selectedMonth} onChange={changeMonth} />
            </div>
            <Link
              href={`/app/budget?month=${getAdjacentMonth(selectedMonth, 1)}`}
              className={cn(monthNavClassName, "h-9 w-9 shrink-0")}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="hidden w-full items-center gap-1 sm:flex sm:w-auto sm:gap-0">
            <Link
              href={`/app/budget?month=${getAdjacentMonth(selectedMonth, -1)}`}
              className={cn(monthNavClassName, "shrink-0")}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="min-w-0 flex-1 sm:w-48 sm:flex-none">
              <MonthPicker value={selectedMonth} onChange={changeMonth} />
            </div>
            <Link
              href={`/app/budget?month=${getAdjacentMonth(selectedMonth, 1)}`}
              className={cn(monthNavClassName, "shrink-0")}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <Button
            onClick={budgetDialog.openCreate}
            disabled={actionPending || !hasExpenseCategories}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add budget
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-2xl border border-surface-border bg-surface-subtle p-3 text-sm text-ink-secondary">
          {error}
        </p>
      ) : null}

      {annotated.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total budget"
              value={formatCurrency(summary.totalBudget)}
              icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
            />
            <StatCard
              title="Total used"
              value={formatCurrency(summary.totalUsed)}
              icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
            />
            <StatCard
              title="Remaining"
              value={formatCurrency(summary.remaining)}
              icon={<TrendingDown className="h-5 w-5" aria-hidden="true" />}
            />
            <StatCard
              title="Progress"
              value={`${summary.percentage}%`}
              icon={<PiggyBank className="h-5 w-5" aria-hidden="true" />}
            />
          </div>

          <div className="mt-4 grid gap-2">
          {annotated.map(({ budget, usage }) => {
            const isOver = usage.percentage > 100;
            const menuOpen = openMenuId === budget.id;
            const catInfo = categoryMap[budget.category];
            const BudgetIcon = catInfo?.icon
              ? (iconLookup[catInfo.icon] ?? iconLookup.tag)
              : iconLookup.tag;
            const iconColor = catInfo?.color ?? "#64748b";

            return (
              <div
                key={budget.id}
                className="rounded-2xl border border-surface-border bg-white p-3 transition hover:bg-surface-subtle sm:px-3 sm:py-2"
              >
                <div className="flex items-start gap-3 sm:items-center sm:gap-2">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:h-8 sm:w-8 sm:rounded-lg"
                    style={{ backgroundColor: iconColor }}
                  >
                    <BudgetIcon className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1 sm:contents">
                    <div className="flex min-w-0 items-start justify-between gap-3 sm:contents">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink sm:w-[200px] sm:shrink-0 sm:flex-none">
                        {budget.category}
                      </span>

                      <span
                        className={cn(
                          "shrink-0 text-sm font-bold sm:w-16 sm:text-center",
                          isOver ? "text-danger" : "text-ink",
                        )}
                      >
                        {usage.percentage}%
                      </span>
                    </div>

                    <div className="mt-3 min-w-0 sm:mt-0 sm:flex-1">
                      <Progress value={usage.percentage} />
                    </div>

                    <span className="mt-2 block truncate text-sm text-ink-secondary sm:mt-0 sm:w-48 sm:shrink-0 sm:text-left">
                      {formatCurrency(usage.spent)} /{" "}
                      {formatCurrency(budget.limit)}
                    </span>
                  </div>

                  <div className="relative flex w-8 shrink-0 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpenMenuId(menuOpen ? null : budget.id)}
                      aria-expanded={menuOpen}
                      aria-haspopup="true"
                      aria-label={`Actions for ${budget.category}`}
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    {menuOpen ? (
                      <div
                        ref={menuRef}
                        role="menu"
                        aria-label={`Actions for ${budget.category}`}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            setOpenMenuId(null);
                          }
                        }}
                        className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-surface-border bg-white shadow-lg"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center px-4 py-2 text-left text-sm text-ink transition hover:bg-surface-subtle"
                          onClick={() => {
                            setOpenMenuId(null);
                            budgetDialog.openEdit(budget);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center px-4 py-2 text-left text-sm text-danger transition hover:bg-danger-light"
                          onClick={() => {
                            setOpenMenuId(null);
                            budgetDialog.setDeletingItem(budget);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </>
      ) : (
        <EmptyState
          title={
            hasExpenseCategories ? "No budgets yet" : "No expense categories"
          }
          message={
            hasExpenseCategories
              ? "Create monthly limits for your expense categories in the selected month."
              : "Create expense categories before adding monthly budgets."
          }
          action={
            hasExpenseCategories ? (
              <Button onClick={budgetDialog.openCreate}>Add budget</Button>
            ) : undefined
          }
        />
      )}

      <Modal
        open={budgetDialog.isFormOpen}
        title={budgetDialog.editingItem ? "Edit budget" : "Add budget"}
        onClose={budgetDialog.closeForm}
      >
        <BudgetForm
          key={
            budgetDialog.editingItem?.id ??
            (budgetDialog.isFormOpen ? "new-budget" : "closed-budget")
          }
          budget={budgetDialog.editingItem}
          expenseCategories={expenseCategories}
          defaultMonth={selectedMonth}
          onCancel={budgetDialog.closeForm}
          pending={actionPending}
          pendingLabel={budgetDialog.editingItem ? "Saving..." : "Adding..."}
          onSubmit={(budget) => {
            const editingId = budgetDialog.editingItem?.id;
            runAction(
              () =>
                editingId
                  ? updateBudgetAction(editingId, budget)
                  : createBudgetAction(budget),
              budgetDialog.closeForm,
              {
                successMessage: editingId ? "Budget updated" : "Budget added"
              }
            );
          }}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(budgetDialog.deletingItem)}
        title="Delete budget?"
        message={`This will remove the ${budgetDialog.deletingItem?.category ?? "selected"} budget category.`}
        pending={actionPending}
        pendingLabel="Deleting..."
        onClose={budgetDialog.closeDelete}
        onConfirm={() =>
          budgetDialog.deletingItem &&
          runAction(
            () => deleteBudgetAction(budgetDialog.deletingItem!.id),
            budgetDialog.closeDelete,
            { successMessage: "Budget deleted" }
          )
        }
      />
    </>
  );
}
