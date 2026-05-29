"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useOptimistic, useCallback } from "react";
import { Banknote, Building, CreditCard, PiggyBank, Plus } from "lucide-react";
import {
  createAccountAction,
  deleteAccountAction,
  updateAccountAction,
} from "@/app/app/accounts/actions";
import { AccountForm } from "@/components/account-form";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { ResourceActions } from "@/components/resource-actions";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { formatCurrency } from "@/lib/finance";
import type { Account, AccountBalanceMap } from "@/types/finance";

type AccountsState = {
  accounts: Account[];
  balances: AccountBalanceMap;
};

type OptimisticAction =
  | { type: "create"; account: Account }
  | { type: "update"; account: Account }
  | { type: "delete"; id: string };

export function AccountsClient({
  accounts,
  accountBalances,
  householdId,
}: {
  accounts: Account[];
  accountBalances: AccountBalanceMap;
  householdId: string;
}) {
  const router = useRouter();
  const accountDialog = useCrudDialog<Account>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [optimisticState, addOptimistic] = useOptimistic(
    { accounts, balances: accountBalances },
    (state: AccountsState, action: OptimisticAction) => {
      switch (action.type) {
        case "create":
          return {
            accounts: [...state.accounts, action.account],
            balances: {
              ...state.balances,
              [action.account.id]: action.account.openingBalance,
            },
          };
        case "update":
          return {
            accounts: state.accounts.map((a) =>
              a.id === action.account.id ? action.account : a,
            ),
            balances: {
              ...state.balances,
              [action.account.id]: action.account.openingBalance,
            },
          };
        case "delete": {
          const remaining: AccountBalanceMap = {};
          for (const key of Object.keys(state.balances)) {
            if (key !== action.id) {
              remaining[key] = state.balances[key];
            }
          }
          return {
            accounts: state.accounts.filter((a) => a.id !== action.id),
            balances: remaining,
          };
        }
        default:
          return state;
      }
    },
  );

  const runAction = useCallback(
    (
      action: () => Promise<void>,
      optimisticAction: OptimisticAction | null,
      onSuccess?: () => void,
    ) => {
      setError("");
      startTransition(async () => {
        if (optimisticAction) addOptimistic(optimisticAction);
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
          router.refresh();
        }
      });
    },
    [addOptimistic, router],
  );

  const typeIcon: Record<Account["type"], typeof CreditCard> = {
    cash: Banknote,
    bank: Building,
    credit: CreditCard,
    savings: PiggyBank,
  };

  return (
    <>
      <PageIntro
        title="Accounts"
        action={
          <Button onClick={accountDialog.openCreate} disabled={isPending}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add account
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-2xl border border-surface-border bg-surface-subtle p-3 text-sm text-ink-secondary">
          {error}
        </p>
      ) : null}

      {optimisticState.accounts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {optimisticState.accounts.map((account) => (
            <Card key={account.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-surface-subtle p-2 text-ink-secondary">
                    {(() => {
                      const Icon = typeIcon[account.type];
                      return <Icon className="h-5 w-5" aria-hidden="true" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-ink">
                      {account.name}
                    </h2>
                    <div className="mt-1">
                      <span className="inline-block rounded-full bg-brand-green-pale px-3 py-0.5 text-xs font-semibold text-brand-green-dark capitalize">
                        {account.type}
                      </span>
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
                <p className="text-2xl font-semibold leading-[31.2px] tracking-[-0.48px] text-ink">
                  {formatCurrency(
                    optimisticState.balances[account.id] ??
                      account.openingBalance,
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
          onSubmit={(account) => {
            const optimisticAction: OptimisticAction = accountDialog.editingItem
              ? { type: "update", account }
              : { type: "create", account };
            runAction(
              () =>
                accountDialog.editingItem
                  ? updateAccountAction(householdId, account)
                  : createAccountAction(householdId, account),
              optimisticAction,
              accountDialog.closeForm,
            );
          }}
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
            () =>
              deleteAccountAction(householdId, accountDialog.deletingItem!.id),
            { type: "delete", id: accountDialog.deletingItem!.id },
            accountDialog.closeDelete,
          )
        }
      />
    </>
  );
}
