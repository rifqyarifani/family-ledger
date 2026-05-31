"use client";

import { useMemo, useRef, useState } from "react";
import {
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
  Tag,
  Utensils,
  Car,
  Home,
  Zap,
  GraduationCap,
  Tv,
  Heart,
  Shirt,
  Plane,
  Gift,
  Briefcase,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
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
import { PageIntro } from "@/components/page-intro";
import { Progress } from "@/components/progress";
import { StatCard } from "@/components/stat-card";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { useRunAction } from "@/hooks/use-run-action";
import { cn } from "@/lib/utils";
import { formatCurrency, getBudgetUsage } from "@/lib/finance";
import type { Budget, Transaction } from "@/types/finance";

const iconLookup: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  tag: Tag,
  utensils: Utensils,
  car: Car,
  home: Home,
  zap: Zap,
  "graduation-cap": GraduationCap,
  tv: Tv,
  heart: Heart,
  shirt: Shirt,
  plane: Plane,
  gift: Gift,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "dollar-sign": DollarSign,
  "shopping-bag": ShoppingBag,
};

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
  const { isPending, error, runAction } = useRunAction();
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
    window.location.href = `/app/budget?month=${month}`;
  }

  function getAdjacentMonth(monthKey: string, offset: number) {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  return (
    <>
      <PageIntro
        title="Budget"
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(getAdjacentMonth(selectedMonth, -1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <div className="w-48">
                <MonthPicker value={selectedMonth} onChange={changeMonth} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(getAdjacentMonth(selectedMonth, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <Button
              onClick={budgetDialog.openCreate}
              disabled={isPending || !hasExpenseCategories}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add budget
            </Button>
          </div>
        }
      />

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
              ? (iconLookup[catInfo.icon] ?? Tag)
              : Tag;
            const iconColor = catInfo?.color ?? "#64748b";

            return (
              <div
                key={budget.id}
                className="rounded-2xl border border-surface-border bg-white px-3 py-2 transition hover:bg-surface-subtle"
              >
                <div className="flex items-center gap-2">
                  {/* Icon - Fixed 32px */}
                  <div
                    className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: iconColor }}
                  >
                    <BudgetIcon className="h-4 w-4" aria-hidden="true" />
                  </div>

                  {/* Budget name - Fixed 140px */}
                  <span className="shrink-0 w-[200px] truncate text-sm font-semibold text-ink">
                    {budget.category}
                  </span>

                  {/* Progress bar - Flexible, takes remaining */}
                  <div className="flex-1 min-w-0">
                    <Progress value={usage.percentage} />
                  </div>

                  {/* Percentage - Fixed 48px */}
                  <span
                    className={cn(
                      "shrink-0 w-16 text-center text-sm font-bold",
                      isOver ? "text-danger" : "text-ink",
                    )}
                  >
                    {usage.percentage}%
                  </span>

                  {/* Balance - Auto */}
                  <span className="shrink-0 w-48 text-left text-sm text-ink-secondary">
                    {formatCurrency(usage.spent)} /{" "}
                    {formatCurrency(budget.limit)}
                  </span>

                  {/* Three-dot menu - Fixed 32px */}
                  <div className="relative shrink-0 w-8 flex justify-end">
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
          onSubmit={(budget) =>
            runAction(
              () =>
                budgetDialog.editingItem
                  ? updateBudgetAction(budget)
                  : createBudgetAction(budget),
              budgetDialog.closeForm,
            )
          }
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(budgetDialog.deletingItem)}
        title="Delete budget?"
        message={`This will remove the ${budgetDialog.deletingItem?.category ?? "selected"} budget category.`}
        onClose={budgetDialog.closeDelete}
        onConfirm={() =>
          budgetDialog.deletingItem &&
          runAction(
            () => deleteBudgetAction(budgetDialog.deletingItem!.id),
            budgetDialog.closeDelete,
          )
        }
      />
    </>
  );
}
