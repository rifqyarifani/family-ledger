"use client";

import { useState, type FormEvent } from "react";
import { DatePicker } from "@/components/date-picker";
import { Field, Input, Select, Textarea } from "@/components/form-field";
import { FormActions } from "@/components/form-actions";
import { transactionCategories } from "@/constants/finance";
import { formatInputAmount, handleBlockedNumberKeys, parseFormattedAmount, sanitizeFormattedAmount } from "@/lib/format-utils";
import { createId } from "@/lib/utils";
import type { Account, Category, FamilyMember, Transaction, TransactionType } from "@/types/finance";

const maxTitleLength = 30;

type FormValues = {
  title: string;
  type: TransactionType;
  amount: string;
  category: string;
  memberId: string;
  accountId: string;
  transferAccountId: string;
  date: string;
  note: string;
};

function getFallbackTransferAccountId(accounts: Account[], sourceAccountId: string, currentTransferAccountId = "") {
  if (currentTransferAccountId && currentTransferAccountId !== sourceAccountId) {
    return currentTransferAccountId;
  }

  return accounts.find((account) => account.id !== sourceAccountId)?.id ?? "";
}

export function TransactionForm({
  transaction,
  members,
  accounts,
  categories,
  defaultMemberId,
  allowTransfer = true,
  onSubmit,
  onCancel
}: {
  transaction?: Transaction;
  members: FamilyMember[];
  accounts: Account[];
  categories?: Category[];
  defaultMemberId?: string | null;
  allowTransfer?: boolean;
  onSubmit: (transaction: Transaction) => void | Promise<void>;
  onCancel: () => void;
}) {
  const categoryOptions = categories?.length
    ? categories
        .filter((category) => category.type === (transaction?.type ?? "expense"))
        .map((category) => category.name)
    : [...transactionCategories];
  const initialAccountId = transaction?.accountId ?? accounts[0]?.id ?? "";
  const fallbackMemberId =
    defaultMemberId && members.some((member) => member.id === defaultMemberId)
      ? defaultMemberId
      : members[0]?.id ?? "";
  const [values, setValues] = useState<FormValues>({
    title: transaction?.title ?? "",
    type: transaction?.type ?? "expense",
    amount: transaction ? formatInputAmount(transaction.amount) : "",
    category: transaction?.category ?? categoryOptions[0] ?? "",
    memberId: transaction?.memberId ?? fallbackMemberId,
    accountId: initialAccountId,
    transferAccountId: getFallbackTransferAccountId(accounts, initialAccountId, transaction?.transferAccountId),
    date: transaction?.date ?? new Date().toISOString().slice(0, 10),
    note: transaction?.note ?? ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField(name: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleTypeChange(type: TransactionType) {
    const nextCategories = categories?.length
      ? categories.filter((category) => category.type === type).map((category) => category.name)
      : [...transactionCategories];

    setValues((current) => ({
      ...current,
      type,
      category: type === "transfer" ? "Transfer" : nextCategories.includes(current.category) ? current.category : nextCategories[0] ?? "",
      transferAccountId: getFallbackTransferAccountId(accounts, current.accountId, current.transferAccountId)
    }));
  }

  function handleSourceAccountChange(accountId: string) {
    setValues((current) => ({
      ...current,
      accountId,
      transferAccountId: getFallbackTransferAccountId(accounts, accountId, current.transferAccountId)
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const amount = parseFormattedAmount(values.amount);

    if (!values.title.trim() || values.title.trim().length > maxTitleLength) {
      nextErrors.title = "Title up to 30 characters is required.";
    }
    if (!values.date) nextErrors.date = "Date is required.";
    if (!values.memberId) nextErrors.memberId = "Choose a family member.";
    if (!values.accountId) nextErrors.accountId = "Choose an account.";
    if (!allowTransfer && values.type === "transfer") {
      nextErrors.type = "Choose income or expense.";
    }
    if (values.type === "transfer") {
      if (!values.transferAccountId) nextErrors.transferAccountId = "Choose a destination account.";
      if (values.accountId === values.transferAccountId) {
        nextErrors.transferAccountId = "Choose a different destination account.";
      }
    }
    if (values.type !== "transfer" && !values.category.trim()) nextErrors.category = "Category is required.";
    if (!Number.isFinite(amount) || amount <= 0) nextErrors.amount = "Amount must be positive.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      id: transaction?.id ?? createId("txn"),
      title: values.title.trim(),
      type: values.type,
      amount,
      category: values.type === "transfer" ? "Transfer" : values.category.trim(),
      memberId: values.memberId,
      accountId: values.accountId,
      transferAccountId: values.type === "transfer" ? values.transferAccountId : undefined,
      date: values.date,
      note: values.note.trim()
    });
  }

  const isTransfer = values.type === "transfer";
  const visibleCategoryOptions = categories?.length
    ? categories.filter((category) => category.type === values.type).map((category) => category.name)
    : [...transactionCategories];

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Title" error={errors.title}>
        <Input
          value={values.title}
          maxLength={maxTitleLength}
          onChange={(event) =>
            updateField("title", event.target.value.slice(0, maxTitleLength))
          }
          required
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {values.title.length}/{maxTitleLength}
        </p>
      </Field>
      <Field label="Type">
        <Select
          value={values.type}
          onChange={(event) => handleTypeChange(event.target.value as TransactionType)}
          required
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          {allowTransfer ? <option value="transfer">Transfer</option> : null}
        </Select>
      </Field>
      <Field label="Amount" error={errors.amount}>
        <Input
          type="text"
          inputMode="decimal"
          value={values.amount}
          onKeyDown={handleBlockedNumberKeys}
          onChange={(event) =>
            updateField("amount", sanitizeFormattedAmount(event.target.value))
          }
          className="no-spinner"
          required
        />
      </Field>
      {isTransfer ? (
        <Field label="To account" error={errors.transferAccountId}>
          <Select
            value={values.transferAccountId}
            onChange={(event) => updateField("transferAccountId", event.target.value)}
            required
          >
            {accounts
              .filter((account) => account.id !== values.accountId)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
          </Select>
        </Field>
      ) : (
        <Field label="Category" error={errors.category}>
          {categories?.length ? (
            <Select
              value={values.category}
              onChange={(event) => updateField("category", event.target.value)}
              required
            >
              {visibleCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          ) : (
            <>
              <Input
                list="transaction-categories"
                value={values.category}
                onChange={(event) => updateField("category", event.target.value)}
                required
              />
              <datalist id="transaction-categories">
                {transactionCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </>
          )}
        </Field>
      )}
      <Field label="Family member" error={errors.memberId}>
        <Select value={values.memberId} onChange={(event) => updateField("memberId", event.target.value)} required>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={isTransfer ? "From account" : "Account"} error={errors.accountId}>
        <Select value={values.accountId} onChange={(event) => handleSourceAccountChange(event.target.value)} required>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Date" error={errors.date}>
        <DatePicker value={values.date} onChange={(value) => updateField("date", value)} />
      </Field>
      <Field label="Note">
        <Textarea value={values.note} onChange={(event) => updateField("note", event.target.value)} />
      </Field>
      <FormActions submitLabel={transaction ? "Save changes" : "Add transaction"} onCancel={onCancel} />
    </form>
  );
}
