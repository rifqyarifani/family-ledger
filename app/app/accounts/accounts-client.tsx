"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CreditCard, Plus } from "lucide-react";
import {
  createAccountAction,
  deleteAccountAction,
  updateAccountAction,
} from "@/app/app/accounts/actions";
import { AccountForm } from "@/components/account-form";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { ResourceActions } from "@/components/resource-actions";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { calculateAccountBalance, formatCurrency } from "@/lib/finance";
import type { Account, Transaction } from "@/types/finance";

export function AccountsClient({
  accounts,
  transactions,
}: {
  accounts: Account[];
  transactions: Transaction[];
}) {
  const router = useRouter();
  const accountDialog = useCrudDialog<Account>();
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
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Something went wrong.",
        );
      }
    });
  }

  return (
    <>
      <PageIntro
        title="Accounts"
        description="Manage household cash, bank, card, and savings accounts. Balances are calculated from manual transactions."
        action={
          <Button onClick={accountDialog.openCreate} disabled={isPending}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add account
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {accounts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-950">
                      {account.name}
                    </h2>
                    <div className="mt-1 capitalize">
                      <Badge tone="blue">{account.type}</Badge>
                    </div>
                  </div>
                </div>
                <ResourceActions
                  editLabel={`Edit ${account.name}`}
                  deleteLabel={`Delete ${account.name}`}
                  onEdit={() => accountDialog.openEdit(account)}
                  onDelete={() => accountDialog.setDeletingItem(account)}
                />
              </div>
              <div className="mt-6">
                <p className="text-2xl font-semibold text-slate-950">
                  {formatCurrency(
                    calculateAccountBalance(account, transactions),
                  )}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No accounts"
          message="Add an account such as Cash, BCA Main, Mandiri Bills, Credit Card, or Emergency Fund."
        />
      )}

      <Modal
        open={accountDialog.isFormOpen}
        title={accountDialog.editingItem ? "Edit account" : "Add account"}
        onClose={accountDialog.closeForm}
      >
        <AccountForm
          key={
            accountDialog.editingItem?.id ??
            (accountDialog.isFormOpen ? "new-account" : "closed-account")
          }
          account={accountDialog.editingItem}
          onCancel={accountDialog.closeForm}
          onSubmit={(account) =>
            runAction(
              () =>
                accountDialog.editingItem
                  ? updateAccountAction(account)
                  : createAccountAction(account),
              accountDialog.closeForm,
            )
          }
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(accountDialog.deletingItem)}
        title="Delete account?"
        message={`This will remove ${accountDialog.deletingItem?.name ?? "this account"}. Existing linked transactions will keep their records.`}
        onClose={accountDialog.closeDelete}
        onConfirm={() =>
          accountDialog.deletingItem &&
          runAction(
            () => deleteAccountAction(accountDialog.deletingItem!.id),
            accountDialog.closeDelete,
          )
        }
      />
    </>
  );
}
