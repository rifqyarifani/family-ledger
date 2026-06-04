"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useOptimistic, useCallback, useMemo } from "react";
import {
  Banknote,
  Building,
  CreditCard,
  MoreVertical,
  PiggyBank,
  Plus,
  User,
  Users,
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
import { useToast } from "@/components/toast-provider";
import { createId } from "@/lib/utils";
import { formatAccountDeleteMessage } from "@/lib/account-delete-utils";
import { formatCurrency, groupAccountsByOwner } from "@/lib/finance";
import type { AccountImpact } from "@/src/lib/data/accounts";
import type { Account, AccountBalanceMap, AccountFormInput, FamilyMember } from "@/types/finance";

type AccountsState = {
  accounts: Account[];
  balances: AccountBalanceMap;
};

type OptimisticAction =
  | { type: "create"; account: Account }
  | { type: "update"; account: Account }
  | { type: "delete"; id: string };

function toOptimisticAccount(input: AccountFormInput, id: string): Account {
  return {
    id,
    name: input.name,
    type: input.type,
    openingBalance: input.openingBalance,
    iconColor: input.iconColor,
    ownerMemberId: input.ownerMemberId ?? null
  };
}

export function AccountsClient({
  accounts,
  accountBalances,
  accountImpacts,
  members,
}: {
  accounts: Account[];
  accountBalances: AccountBalanceMap;
  accountImpacts: Record<string, AccountImpact>;
  members: FamilyMember[];
}) {
  const router = useRouter();
  const accountDialog = useCrudDialog<Account>();
  const { showToast } = useToast();
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
      successMessage?: string,
    ) => {
      setError("");
      startTransition(async () => {
        if (optimisticAction) addOptimistic(optimisticAction);
        try {
          await action();
          onSuccess?.();
          router.refresh();
          if (successMessage) {
            showToast({ tone: "success", title: successMessage });
          }
        } catch (actionError) {
          const message =
            actionError instanceof Error
              ? actionError.message
              : "Something went wrong.";
          setError(message);
          showToast({ tone: "error", title: "Action failed", description: message });
          router.refresh();
        }
      });
    },
    [addOptimistic, router, showToast],
  );

  const typeIcon: Record<Account["type"], typeof CreditCard> = {
    cash: Banknote,
    bank: Building,
    credit: CreditCard,
    savings: PiggyBank,
  };

  const groups = useMemo(
    () => groupAccountsByOwner(optimisticState.accounts, members),
    [optimisticState.accounts, members]
  );

  const renderAccountCard = (account: Account) => {
    const menuOpen = openMenuId === account.id;
    const ownerLabel = account.ownerName ?? account.ownerMemberId;

    return (
      <div
        key={account.id}
        className="min-w-0 rounded-2xl border border-surface-border bg-white px-3 py-2 transition hover:bg-surface-subtle"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="shrink-0 rounded-lg p-1.5 text-white"
              style={{ backgroundColor: account.iconColor ?? "#64748b" }}
            >
              {(() => {
                const Icon = typeIcon[account.type];
                return <Icon className="h-4 w-4" aria-hidden="true" />;
              })()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-ink">
                {account.name}
              </h2>
              {ownerLabel ? (
                <p className="flex items-center gap-1 truncate text-xs text-ink-secondary">
                  <User className="h-3 w-3" aria-hidden="true" />
                  {ownerLabel}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className="text-sm font-bold text-ink">
              {formatCurrency(
                optimisticState.balances[account.id] ?? account.openingBalance
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
        <div className="grid gap-6">
          {groups.shared.length > 0 ? (
            <section className="grid gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-secondary">
                <Users className="h-4 w-4" aria-hidden="true" />
                Shared
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {groups.shared.map(renderAccountCard)}
              </div>
            </section>
          ) : null}
          {groups.byMember.map(({ member, accounts: memberAccounts }) => (
            <section key={member.id} className="grid gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-secondary">
                <User className="h-4 w-4" aria-hidden="true" />
                {member.name}&apos;s accounts
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {memberAccounts.map(renderAccountCard)}
              </div>
            </section>
          ))}
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
          members={members}
          onCancel={accountDialog.closeForm}
          pending={isPending}
          pendingLabel={accountDialog.editingItem ? "Saving..." : "Adding..."}
          onSubmit={(account) => {
            const editingId = accountDialog.editingItem?.id;
            const optimisticAction: OptimisticAction = editingId
              ? { type: "update", account: toOptimisticAccount(account, editingId) }
              : { type: "create", account: toOptimisticAccount(account, createId("account")) };
            runAction(
              () =>
                editingId
                  ? updateAccountAction(editingId, account)
                  : createAccountAction(account),
              optimisticAction,
              accountDialog.closeForm,
              editingId ? "Account updated" : "Account added"
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
            pending={isPending}
            pendingLabel="Deleting..."
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
                "Account deleted"
              );
            }}
          />
        );
      })()}
    </>
  );
}
