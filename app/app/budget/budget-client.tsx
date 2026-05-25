"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  createBudgetAction,
  deleteBudgetAction,
  updateBudgetAction
} from "@/app/app/budget/actions";
import { BudgetCard } from "@/components/budget-card";
import { BudgetForm } from "@/components/budget-form";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import type { Budget, Transaction } from "@/types/finance";

export function BudgetClient({
  budgets,
  transactions,
  expenseCategories
}: {
  budgets: Budget[];
  transactions: Transaction[];
  expenseCategories: string[];
}) {
  const router = useRouter();
  const budgetDialog = useCrudDialog<Budget>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const hasExpenseCategories = expenseCategories.length > 0;

  function runAction(action: () => Promise<void>, onSuccess?: () => void) {
    setError("");
    startTransition(async () => {
      try {
        await action();
        onSuccess?.();
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Something went wrong.");
      }
    });
  }

  return (
    <>
      <PageIntro
        title="Budget"
        action={
          <Button onClick={budgetDialog.openCreate} disabled={isPending || !hasExpenseCategories}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add budget
          </Button>
        }
      />

      {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {budgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              transactions={transactions}
              onEdit={budgetDialog.openEdit}
              onDelete={budgetDialog.setDeletingItem}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasExpenseCategories ? "No budgets yet" : "No expense categories"}
          message={
            hasExpenseCategories
              ? "Create monthly limits for your expense categories."
              : "Create expense categories before adding monthly budgets."
          }
          action={
            hasExpenseCategories ? (
              <Button onClick={budgetDialog.openCreate}>Add budget</Button>
            ) : undefined
          }
        />
      )}

      <Modal open={budgetDialog.isFormOpen} title={budgetDialog.editingItem ? "Edit budget" : "Add budget"} onClose={budgetDialog.closeForm}>
        <BudgetForm
          key={budgetDialog.editingItem?.id ?? (budgetDialog.isFormOpen ? "new-budget" : "closed-budget")}
          budget={budgetDialog.editingItem}
          expenseCategories={expenseCategories}
          onCancel={budgetDialog.closeForm}
          onSubmit={(budget) =>
            runAction(
              () => (budgetDialog.editingItem ? updateBudgetAction(budget) : createBudgetAction(budget)),
              budgetDialog.closeForm
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
          runAction(() => deleteBudgetAction(budgetDialog.deletingItem!.id), budgetDialog.closeDelete)
        }
      />
    </>
  );
}
