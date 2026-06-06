"use client";

import { useMemo, useState, type FormEvent } from "react";
import { DatePicker } from "@/components/date-picker";
import { TimePicker } from "@/components/time-picker";
import {
  Field,
  Select,
  Textarea,
  CappedTextInput,
  MoneyInput
} from "@/components/form-field";
import { FormActions } from "@/components/form-actions";
import { useFormErrors } from "@/hooks/use-form-errors";
import { transactionCategories } from "@/constants/finance";
import { formatInputAmount, parseFormattedAmount } from "@/lib/format-utils";
import { getCurrentTime, groupAccountsByOwner } from "@/lib/finance";
import {
  MAX_NAME_LENGTH,
  cappedName,
  mustSelect,
  positiveAmount,
  requiredString
} from "@/lib/validation";
import type { Account, Category, FamilyMember, TransactionFormInput, TransactionType } from "@/types/finance";

type FormValues = {
  title: string;
  type: TransactionType;
  amount: string;
  category: string;
  memberId: string;
  accountId: string;
  transferAccountId: string;
  date: string;
  time: string;
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
  onCancel,
  pending = false,
  pendingLabel
}: {
  transaction?: TransactionFormInput;
  members: FamilyMember[];
  accounts: Account[];
  categories?: Category[];
  defaultMemberId?: string | null;
  allowTransfer?: boolean;
  onSubmit: (transaction: TransactionFormInput) => void | Promise<void>;
  onCancel: () => void;
  pending?: boolean;
  pendingLabel?: string;
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
    time: transaction?.time ?? getCurrentTime(),
    note: transaction?.note ?? ""
  });
  const { errors, setAll, clearAll } = useFormErrors();

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

  const accountGroups = useMemo(
    () => groupAccountsByOwner(accounts, members),
    [accounts, members]
  );

  const destinationAccountGroups = useMemo(
    () =>
      groupAccountsByOwner(
        accounts.filter((account) => account.id !== values.accountId),
        members
      ),
    [accounts, members, values.accountId]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    const amount = parseFormattedAmount(values.amount);
    const isTransfer = values.type === "transfer";
    const sameAccount = values.accountId === values.transferAccountId;

    const nextErrors = {
      title: cappedName(values.title, "Title"),
      date: requiredString(values.date, "Date"),
      memberId: mustSelect(values.memberId, "Family member"),
      accountId: mustSelect(values.accountId, "Account"),
      type: !allowTransfer && isTransfer ? "Choose income or expense." : null,
      transferAccountId: isTransfer
        ? mustSelect(values.transferAccountId, "Destination account") ??
          (sameAccount ? "Choose a different destination account." : null)
        : null,
      category: !isTransfer
        ? mustSelect(values.category, "Category")
        : null,
      amount: positiveAmount(values.amount, parseFormattedAmount, "Amount")
    };

    setAll(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    onSubmit({
      title: values.title.trim(),
      type: values.type,
      amount,
      category: values.type === "transfer" ? "Transfer" : values.category.trim(),
      memberId: values.memberId,
      accountId: values.accountId,
      transferAccountId: values.type === "transfer" ? values.transferAccountId : undefined,
      date: values.date,
      time: values.time,
      note: values.note.trim()
    });
  }

  const isTransfer = values.type === "transfer";
  const visibleCategoryOptions = categories?.length
    ? categories.filter((category) => category.type === values.type).map((category) => category.name)
    : [...transactionCategories];

  return (
    <form
      onSubmit={(event) => {
        clearAll();
        handleSubmit(event);
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Title" error={errors.title}>
        <CappedTextInput
          value={values.title}
          onChange={(value) => updateField("title", value)}
          maxLength={MAX_NAME_LENGTH}
          required
        />
      </Field>
      <Field label="Type" error={errors.type}>
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
        <MoneyInput
          value={values.amount}
          onChange={(value) => updateField("amount", value)}
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
            {destinationAccountGroups.shared.length > 0 ? (
              <optgroup label="Shared">
                {destinationAccountGroups.shared.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {destinationAccountGroups.byMember.map(({ member, accounts: memberAccounts }) => (
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
              <CappedTextInput
                value={values.category}
                onChange={(value) => updateField("category", value)}
                showCounter={false}
                list="transaction-categories"
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
      <div className="sm:col-span-2 grid grid-cols-2 gap-4">
        <Field label="Date" error={errors.date}>
          <DatePicker value={values.date} onChange={(value) => updateField("date", value)} />
        </Field>
        <Field label="Time">
          <TimePicker value={values.time} onChange={(value) => updateField("time", value)} />
        </Field>
      </div>
      <Field label="Note">
        <Textarea value={values.note} onChange={(event) => updateField("note", event.target.value)} />
      </Field>
      <FormActions
        submitLabel={transaction ? "Save changes" : "Add transaction"}
        onCancel={onCancel}
        pending={pending}
        pendingLabel={pendingLabel}
      />
    </form>
  );
}
