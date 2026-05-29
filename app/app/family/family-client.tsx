"use client";

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
import { useRunAction } from "@/hooks/use-run-action";
import { formatCurrency } from "@/lib/finance";
import type { FamilyMember, FamilyMemberTransactionTotals } from "@/types/finance";

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function FamilyClient({
  familyMembers,
  transactionTotals
}: {
  familyMembers: FamilyMember[];
  transactionTotals: FamilyMemberTransactionTotals;
}) {
  const memberDialog = useCrudDialog<FamilyMember>();
  const { isPending, error, runAction } = useRunAction();

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

      {error ? <p className="mb-4 rounded-2xl border border-surface-border bg-surface p-3 text-sm text-ink-secondary">{error}</p> : null}

      {familyMembers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {familyMembers.map((member) => {
            const totals = transactionTotals[member.id] ?? { income: 0, expense: 0 };

            return (
              <Card key={member.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-brand-green-pale p-2 text-ink">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-ink">{member.name}</h2>
                      <p className="text-sm text-ink-secondary">{formatRole(member.role)}</p>
                    </div>
                  </div>
                  <ResourceActions
                    editLabel={`Edit ${member.name}`}
                    deleteLabel={`Delete ${member.name}`}
                    onEdit={() => memberDialog.openEdit(member)}
                    onDelete={() => memberDialog.setDeletingItem(member)}
                  />
                </div>
                {member.email ? <p className="mt-4 break-words text-sm text-ink-secondary">{member.email}</p> : null}
                {member.note ? <p className="mt-2 text-sm text-ink-secondary">{member.note}</p> : null}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-xs text-[#2ead4b]">Contribution</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{formatCurrency(totals.income)}</p>
                  </div>
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-xs text-[#d03238]">Spending</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{formatCurrency(totals.expense)}</p>
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
