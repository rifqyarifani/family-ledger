"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, SlidersHorizontal } from "lucide-react";
import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/app/app/transactions/actions";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DateRangePicker } from "@/components/date-range-picker";
import { Field, Input, Select } from "@/components/form-field";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionTable } from "@/components/transaction-table";
import { groupAccountsByOwner } from "@/lib/finance";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { useRunAction } from "@/hooks/use-run-action";
import type {
  Account,
  Category,
  FamilyMember,
  Transaction,
} from "@/types/finance";

export function TransactionsClient({
  transactions,
  familyMembers,
  accounts,
  categories,
  currentMemberId,
  categoryMap = {},
  accountMap = {},
}: {
  transactions: Transaction[];
  familyMembers: FamilyMember[];
  accounts: Account[];
  categories: Category[];
  currentMemberId: string | null;
  categoryMap?: Record<string, { icon?: string; color?: string }>;
  accountMap?: Record<string, { iconColor?: string }>;
}) {
  const transactionDialog = useCrudDialog<Transaction>();
  const { isPending, error, runAction } = useRunAction();
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
    memberId: "all",
    accountId: "all",
    startDate: "",
    endDate: "",
  });

  const accountGroups = useMemo(
    () => groupAccountsByOwner(accounts, familyMembers),
    [accounts, familyMembers]
  );

  const categoryNames = useMemo(
    () =>
      Array.from(
        new Set(
          categories
            .filter(
              (category) =>
                category.type === "income" || category.type === "expense",
            )
            .map((category) => category.name),
        ),
      ).sort(),
    [categories],
  );

  const activeFilterCount = useMemo(() => {
    return [
      filters.search,
      filters.type !== "all",
      filters.category !== "all",
      filters.memberId !== "all",
      filters.accountId !== "all",
      filters.startDate || filters.endDate,
    ].filter(Boolean).length;
  }, [filters]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const keyword =
          `${transaction.title} ${transaction.category} ${transaction.note ?? ""}`.toLowerCase();
        const matchesSearch = keyword.includes(filters.search.toLowerCase());
        const matchesType =
          filters.type === "all" || transaction.type === filters.type;
        const matchesCategory =
          filters.category === "all" ||
          transaction.category === filters.category;
        const matchesMember =
          filters.memberId === "all" ||
          transaction.memberId === filters.memberId;
        const matchesAccount =
          filters.accountId === "all" ||
          transaction.accountId === filters.accountId ||
          transaction.transferAccountId === filters.accountId;
        const matchesStart =
          !filters.startDate || transaction.date >= filters.startDate;
        const matchesEnd =
          !filters.endDate || transaction.date <= filters.endDate;

        return (
          matchesSearch &&
          matchesType &&
          matchesCategory &&
          matchesMember &&
          matchesAccount &&
          matchesStart &&
          matchesEnd
        );
      })
      .sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        if (byDate !== 0) return byDate;
        if (a.time && b.time) {
          const byTime = b.time.localeCompare(a.time);
          if (byTime !== 0) return byTime;
        } else if (a.time) {
          return -1;
        } else if (b.time) {
          return 1;
        }
        const byCreated = b.createdAt.localeCompare(a.createdAt);
        if (byCreated !== 0) return byCreated;
        return b.id.localeCompare(a.id);
      });
  }, [filters, transactions]);

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(50);
  }, [filters]);

  return (
    <>
      <PageIntro
        title="Transactions"
        action={
          <Button onClick={transactionDialog.openCreate} disabled={isPending}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add transaction
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-ink">All Transactions</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              {visibleTransactions.length} of {filteredTransactions.length} records shown
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters((current) => !current)}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            <ChevronDown
              className={`h-4 w-4 transition ${showFilters ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </Button>
        </div>

        {showFilters ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Date">
              <DateRangePicker
                startDate={filters.startDate}
                endDate={filters.endDate}
                onChange={({ startDate, endDate }) =>
                  setFilters((current) => ({ ...current, startDate, endDate }))
                }
              />
            </Field>
            <div className="sm:col-span-1 lg:col-span-2">
              <Field label="Search">
                <Input
                  placeholder="Groceries, salary, note..."
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Family member">
              <Select
                value={filters.memberId}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    memberId: event.target.value,
                  }))
                }
              >
                <option value="all">All members</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Account">
              <Select
                value={filters.accountId}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    accountId: event.target.value,
                  }))
                }
              >
                <option value="all">All accounts</option>
                {accountGroups.shared.length > 0 ? (
                  <optgroup label="Shared">
                    {accountGroups.shared.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                {accountGroups.byMember.map(({ member, accounts: memberAccounts }) => (
                  <optgroup key={member.id} label={`${member.name}'s accounts`}>
                    {memberAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>
            <Field label="Type">
              <Select
                value={filters.type}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </Select>
            </Field>
            <Field label="Category">
              <Select
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                <option value="all">All categories</option>
                {categoryNames.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex h-full items-end">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() =>
                    setFilters({
                      search: "",
                      type: "all",
                      category: "all",
                      memberId: "all",
                      accountId: "all",
                      startDate: "",
                      endDate: "",
                    })
                  }
                >
                  Reset filters
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <TransactionTable
            transactions={visibleTransactions}
            members={familyMembers}
            accounts={accounts}
            categoryMap={categoryMap}
            accountMap={accountMap}
            onEdit={transactionDialog.openEdit}
            onDelete={transactionDialog.setDeletingItem}
          />
        </div>

        {visibleTransactions.length < filteredTransactions.length ? (
          <div className="mt-4 flex justify-center">
            <Button
              variant="secondary"
              onClick={() => setVisibleCount((current) => current + 50)}
            >
              Show more
            </Button>
          </div>
        ) : null}
      </Card>

      <Modal
        open={transactionDialog.isFormOpen}
        title={
          transactionDialog.editingItem ? "Edit transaction" : "Add transaction"
        }
        onClose={transactionDialog.closeForm}
      >
        <TransactionForm
          key={
            transactionDialog.editingItem?.id ??
            (transactionDialog.isFormOpen
              ? "new-transaction"
              : "closed-transaction")
          }
          transaction={transactionDialog.editingItem}
          members={familyMembers}
          accounts={accounts}
          categories={categories}
          defaultMemberId={currentMemberId}
          onCancel={transactionDialog.closeForm}
          onSubmit={(transaction) =>
            runAction(
              () =>
                transactionDialog.editingItem
                  ? updateTransactionAction(transaction)
                  : createTransactionAction(transaction),
              transactionDialog.closeForm,
            )
          }
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(transactionDialog.deletingItem)}
        title="Delete transaction?"
        message={`This will remove "${transactionDialog.deletingItem?.title ?? "this transaction"}" from your household ledger.`}
        onClose={transactionDialog.closeDelete}
        onConfirm={() =>
          transactionDialog.deletingItem &&
          runAction(
            () => deleteTransactionAction(transactionDialog.deletingItem!.id),
            transactionDialog.closeDelete,
          )
        }
      />
    </>
  );
}
