"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useOptimistic, useCallback } from "react";
import {
  Banknote,
  Building,
  CreditCard,
  MoreVertical,
  PiggyBank,
  Plus,
} from "lucide-react";
import {
  createAccountAction,
  deleteAccountAction,
  updateAccountAction,
} from "@/app/app/accounts/actions";
import { AccountForm } from "@/components/account-form";

import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { InfoDialog } from "@/components/info-dialog";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { formatAccountDeleteMessage } from "@/lib/account-delete-utils";
import { formatCurrency } from "@/lib/finance";
import type { AccountImpact } from "@/src/lib/data/accounts";
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
  accountImpacts,
}: {
  accounts: Account[];
  accountBalances: AccountBalanceMap;
  accountImpacts: Record<string, AccountImpact>;
}) {
  const router = useRouter();
  const accountDialog = useCrudDialog<Account>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(menuRef, openMenuId !== null, () => setOpenMenuId(null));

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
        <div className="grid gap-3 sm:grid-cols-2">
          {optimisticState.accounts.map((account) => {
            const menuOpen = openMenuId === account.id;

            return (
              <div
                key={account.id}
                className="min-w-0 rounded-2xl border border-surface-border bg-white px-3 py-2 transition hover:bg-surface-subtle"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="shrink-0 rounded-lg p-1.5 text-white"
                      style={{ backgroundColor: account.iconColor ?? "#64748b" }}
                    >
                      {(() => {
                        const Icon = typeIcon[account.type];
                        return <Icon className="h-4 w-4" aria-hidden="true" />;
                      })()}
                    </div>
                    <h2 className="truncate text-sm font-semibold text-ink">
                      {account.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-bold text-ink">
                      {formatCurrency(
                        optimisticState.balances[account.id] ??
                          account.openingBalance,
                      )}
                    </p>
                    <div className="relative shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpenMenuId(menuOpen ? null : account.id)}
                        aria-expanded={menuOpen}
                        aria-haspopup="true"
                        aria-label={`Actions for ${account.name}`}
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      {menuOpen ? (
                        <div
                          ref={menuRef}
                          role="menu"
                          aria-label={`Actions for ${account.name}`}
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
                              accountDialog.openEdit(account);
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
                              accountDialog.setDeletingItem(account);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No accounts"
          message="Add an account such as Cash, BCA Main, Mandiri Bills, Credit Card, or Emergency Fund."
          action={
            <Button onClick={accountDialog.openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add account
            </Button>
          }
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
                  ? updateAccountAction(account)
                  : createAccountAction(account),
              optimisticAction,
              accountDialog.closeForm,
            );
          }}
        />
      </Modal>

      {(() => {
        const deleting = accountDialog.deletingItem;
        const impact = deleting ? accountImpacts[deleting.id] : undefined;
        const decision = formatAccountDeleteMessage(
          deleting?.name ?? "",
          impact?.transactionCount ?? 0,
          impact?.goalCount ?? 0,
          deleting?.type === "savings"
        );

        if (!decision.canDelete) {
          return (
            <InfoDialog
              open={Boolean(deleting)}
              title="Cannot delete account"
              message={decision.message}
              onClose={accountDialog.closeDelete}
            />
          );
        }

        return (
          <ConfirmDialog
            open={Boolean(deleting)}
            title="Delete account?"
            message={decision.message}
            confirmLabel={decision.confirmLabel}
            onClose={accountDialog.closeDelete}
            onConfirm={() => {
              if (!deleting) {
                accountDialog.closeDelete();
                return;
              }
              runAction(
                () => deleteAccountAction(deleting.id),
                { type: "delete", id: deleting.id },
                accountDialog.closeDelete,
              );
            }}
          />
        );
      })()}
    </>
  );
}
