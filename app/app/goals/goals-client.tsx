"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, Plus } from "lucide-react";
import {
  createSavingsGoalAction,
  deleteSavingsGoalAction,
  updateSavingsGoalAction
} from "@/app/app/goals/actions";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { Progress } from "@/components/progress";
import { ResourceActions } from "@/components/resource-actions";
import { SavingsGoalForm } from "@/components/savings-goal-form";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { calculatePercentage, formatCurrency, formatDate } from "@/lib/finance";
import type { SavingsGoal, SavingsGoalAccountOption } from "@/types/finance";

function normalizeGoalName(value: string) {
  return value.trim().toLowerCase();
}

export function GoalsClient({
  savingsGoals,
  savingsAccountOptions
}: {
  savingsGoals: SavingsGoal[];
  savingsAccountOptions: SavingsGoalAccountOption[];
}) {
  const router = useRouter();
  const goalDialog = useCrudDialog<SavingsGoal>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

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

  function getAvailableSavingsAccounts(editingGoal?: SavingsGoal) {
    const usedGoalNames = new Set(
      savingsGoals
        .filter((goal) => goal.id !== editingGoal?.id)
        .map((goal) => normalizeGoalName(goal.name))
    );

    return savingsAccountOptions.filter((account) => !usedGoalNames.has(normalizeGoalName(account.name)));
  }

  const availableSavingsAccounts = useMemo(
    () => getAvailableSavingsAccounts(goalDialog.editingItem),
    [savingsAccountOptions, savingsGoals, goalDialog.editingItem]
  );
  const canCreateGoal = availableSavingsAccounts.length > 0;
  const hasSavingsAccounts = savingsAccountOptions.length > 0;
  const helperState = !hasSavingsAccounts
    ? {
        title: "Create a savings account first",
        message: "Savings goals track the balance of a savings account. Add an account with type Savings, then return here to create the goal."
      }
    : !canCreateGoal
      ? {
          title: "All savings accounts are linked",
          message: "Each savings account can have one goal. Create another savings account to add a new goal."
        }
      : null;

  return (
    <>
      <PageIntro
        title="Savings Goals"
        action={
          <Button onClick={goalDialog.openCreate} disabled={isPending || !canCreateGoal}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add goal
          </Button>
        }
      />

      {savingsGoals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {savingsGoals.map((goal) => {
            const progress = calculatePercentage(goal.savedAmount, goal.targetAmount);

            return (
              <Card key={goal.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[#f4f6f1] p-2 text-[#454745]">
                      <Flag className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#0e0f0c]">{goal.name}</h2>
                      <p className="mt-1 text-sm text-[#454745]">Due {formatDate(goal.dueDate)}</p>
                    </div>
                  </div>
                  <ResourceActions
                    editLabel={`Edit ${goal.name}`}
                    deleteLabel={`Delete ${goal.name}`}
                    onEdit={() => goalDialog.openEdit(goal)}
                    onDelete={() => goalDialog.setDeletingItem(goal)}
                  />
                </div>
                <div className="mt-6">
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="text-[#454745]">Saved</span>
                    <span className="font-medium text-[#0e0f0c]">
                      {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <Progress value={progress} />
                  <p className="mt-3 text-sm font-semibold text-[#0e0f0c]">{progress}% complete</p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={helperState?.title ?? "No savings goals"}
          message={
            helperState?.message ??
            "Create a goal to track target amount, saved amount, due date, and progress."
          }
          action={
            helperState ? (
              <Link
                href="/app/accounts"
                className="inline-flex h-10 items-center justify-center rounded-[1.5rem] border border-[#0e0f0c] bg-white px-4 text-sm font-medium text-[#0e0f0c] transition hover:bg-[#f4f6f1]"
              >
                Go to Accounts
              </Link>
            ) : undefined
          }
        />
      )}

      {helperState && savingsGoals.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-[#cfd5ca] bg-[#f4f6f1] p-4 text-sm text-[#454745] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-[#0e0f0c]">{helperState.title}</p>
            <p className="mt-1">{helperState.message}</p>
          </div>
          <Link
            href="/app/accounts"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-[1.5rem] border border-[#0e0f0c] bg-white px-4 text-sm font-medium text-[#0e0f0c] transition hover:bg-[#f4f6f1]"
          >
            Go to Accounts
          </Link>
        </div>
      ) : null}

      <Modal open={goalDialog.isFormOpen} title={goalDialog.editingItem ? "Edit savings goal" : "Add savings goal"} onClose={() => { goalDialog.closeForm(); setError(""); }}>
        {error ? <p className="mb-4 rounded-2xl border border-[#cfd5ca] bg-[#f4f6f1] p-3 text-sm text-[#454745]">{error}</p> : null}
        <SavingsGoalForm
          key={goalDialog.editingItem?.id ?? (goalDialog.isFormOpen ? "new-goal" : "closed-goal")}
          goal={goalDialog.editingItem}
          savingsAccountOptions={availableSavingsAccounts}
          onCancel={goalDialog.closeForm}
          onSubmit={(goal) =>
            runAction(
              () => (goalDialog.editingItem ? updateSavingsGoalAction(goal) : createSavingsGoalAction(goal)),
              goalDialog.closeForm
            )
          }
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(goalDialog.deletingItem)}
        title="Delete savings goal?"
        message={`This will remove ${goalDialog.deletingItem?.name ?? "this savings goal"}.`}
        onClose={goalDialog.closeDelete}
        onConfirm={() =>
          goalDialog.deletingItem &&
          runAction(() => deleteSavingsGoalAction(goalDialog.deletingItem!.id), goalDialog.closeDelete)
        }
      />
    </>
  );
}
