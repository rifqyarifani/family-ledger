"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserRound } from "lucide-react";
import {
  createFamilyMemberAction,
  deleteFamilyMemberAction,
  updateFamilyMemberAction
} from "@/app/app/family/actions";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { FamilyForm } from "@/components/family-form";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { ResourceActions } from "@/components/resource-actions";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { calculateTotalExpense, calculateTotalIncome, formatCurrency } from "@/lib/finance";
import type { FamilyMember, Transaction } from "@/types/finance";

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function FamilyClient({
  familyMembers,
  transactions
}: {
  familyMembers: FamilyMember[];
  transactions: Transaction[];
}) {
  const router = useRouter();
  const memberDialog = useCrudDialog<FamilyMember>();
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

  return (
    <>
      <PageIntro
        title="Family"
        action={
          <Button onClick={memberDialog.openCreate} disabled={isPending}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add member
          </Button>
        }
      />

      {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {familyMembers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {familyMembers.map((member) => {
            const memberTransactions = transactions.filter((transaction) => transaction.memberId === member.id);
            const income = calculateTotalIncome(memberTransactions);
            const expense = calculateTotalExpense(memberTransactions);

            return (
              <Card key={member.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-950">{member.name}</h2>
                      <p className="text-sm text-slate-500">{formatRole(member.role)}</p>
                    </div>
                  </div>
                  <ResourceActions
                    editLabel={`Edit ${member.name}`}
                    deleteLabel={`Delete ${member.name}`}
                    onEdit={() => memberDialog.openEdit(member)}
                    onDelete={() => memberDialog.setDeletingItem(member)}
                  />
                </div>
                {member.email ? <p className="mt-4 break-words text-sm text-slate-500">{member.email}</p> : null}
                {member.note ? <p className="mt-2 text-sm text-slate-600">{member.note}</p> : null}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-xs text-emerald-700">Contribution</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-950">{formatCurrency(income)}</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="text-xs text-red-700">Spending</p>
                    <p className="mt-1 text-sm font-semibold text-red-950">{formatCurrency(expense)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No family members" message="Add household members to track who contributed or spent each record." />
      )}

      <Modal
        open={memberDialog.isFormOpen}
        title={memberDialog.editingItem ? "Edit family member" : "Add family member"}
        onClose={memberDialog.closeForm}
      >
        <FamilyForm
          key={memberDialog.editingItem?.id ?? (memberDialog.isFormOpen ? "new-member" : "closed-member")}
          member={memberDialog.editingItem}
          onCancel={memberDialog.closeForm}
          onSubmit={(member) =>
            runAction(
              () => (memberDialog.editingItem ? updateFamilyMemberAction(member) : createFamilyMemberAction(member)),
              memberDialog.closeForm
            )
          }
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(memberDialog.deletingItem)}
        title="Delete family member?"
        message={`This will remove ${memberDialog.deletingItem?.name ?? "this member"} from the household. Existing linked transactions will keep their records.`}
        onClose={memberDialog.closeDelete}
        onConfirm={() =>
          memberDialog.deletingItem &&
          runAction(() => deleteFamilyMemberAction(memberDialog.deletingItem!.id), memberDialog.closeDelete)
        }
      />
    </>
  );
}
