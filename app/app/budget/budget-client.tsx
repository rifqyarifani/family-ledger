"use client";

import { useMemo, useRef, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";
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
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { useRunAction } from "@/hooks/use-run-action";
import { cn } from "@/lib/utils";
import { formatCurrency, getBudgetUsage } from "@/lib/finance";
import type { Budget, Transaction } from "@/types/finance";

export function BudgetClient({
  budgets,
  transactions,
  expenseCategories,
  selectedMonth,
}: {
  budgets: Budget[];
  transactions: Transaction[];
  expenseCategories: string[];
  selectedMonth: string;
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
          return pc !== 0 ? pc : a.budget.category.localeCompare(b.budget.category);
        }),
    [budgets, transactions]
  );

  function changeMonth(month: string) {
    setOpenMenuId(null);
    window.location.href = `/app/budget?month=${month}`;
  }

  return (
    <>
      <PageIntro
        title="Budget"
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="w-full sm:w-48">
              <MonthPicker value={selectedMonth} onChange={changeMonth} />
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
        <div className="rounded-2xl border border-surface-border bg-white">
          <div className="hidden gap-3 border-b border-surface bg-surface-subtle px-5 py-3 text-xs font-medium uppercase tracking-wide text-ink-secondary md:grid md:grid-cols-[1fr_3fr_44px_44px]">
            <span>Category</span>
            <span>Progress</span>
            <span className="text-right">Used</span>
            <span />
          </div>
          <div className="divide-y divide-[#e8ebe6]">
            {annotated.map(({ budget, usage }) => {
              const isOver = usage.percentage > 100;
              const menuOpen = openMenuId === budget.id;

              return (
                <div
                  key={budget.id}
                  className="grid grid-cols-[1fr_3fr_44px_44px] items-center gap-3 px-5 py-3 transition hover:bg-surface-subtle max-sm:flex max-sm:flex-wrap max-sm:gap-x-3 max-sm:gap-y-1"
                >
                  <span className="truncate text-sm font-medium text-ink max-sm:w-full">
                    {budget.category}
                  </span>

                  <div className="min-w-0 space-y-1">
                    <Progress value={usage.percentage} />
                    <p className="text-xs text-ink-secondary">
                      {formatCurrency(usage.spent)} /{" "}
                      {formatCurrency(budget.limit)}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "text-right text-sm font-semibold",
                      isOver ? "text-danger" : "text-ink",
                    )}
                  >
                    {usage.percentage}%
                  </span>

                  <div className="relative flex justify-end">
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
              );
            })}
          </div>
        </div>
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
