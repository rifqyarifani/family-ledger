"use client";

import { useState, type FormEvent } from "react";
import { Field, Input, Select } from "@/components/form-field";
import { FormActions, FormError } from "@/components/form-actions";
import { formatInputAmount, handleBlockedNumberKeys, parseFormattedAmount, sanitizeFormattedAmount } from "@/lib/format-utils";
import { createId } from "@/lib/utils";
import type { Account } from "@/types/finance";

const maxAccountNameLength = 30;

export function AccountForm({
  account,
  onSubmit,
  onCancel
}: {
  account?: Account;
  onSubmit: (account: Account) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<Account["type"]>(account?.type ?? "bank");
  const [openingBalance, setOpeningBalance] = useState(
    account ? formatInputAmount(account.openingBalance) : "0"
  );
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const balance = parseFormattedAmount(openingBalance);

    if (
      !name.trim() ||
      name.trim().length > maxAccountNameLength ||
      !Number.isFinite(balance) ||
      balance < 0
    ) {
      setError("Account name up to 30 characters and a valid opening balance are required.");
      return;
    }

    void onSubmit({
      id: account?.id ?? createId("account"),
      name: name.trim(),
      type,
      openingBalance: balance
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormError message={error} />
      <Field label="Account name">
        <Input
          value={name}
          maxLength={maxAccountNameLength}
          onChange={(event) =>
            setName(event.target.value.slice(0, maxAccountNameLength))
          }
          required
        />
        <p className="mt-1 text-right text-xs text-ink-muted">
          {name.length}/{maxAccountNameLength}
        </p>
      </Field>
      <Field label="Type">
        <Select value={type} onChange={(event) => setType(event.target.value as Account["type"])}>
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="credit">Credit</option>
          <option value="savings">Savings</option>
        </Select>
      </Field>
      <Field label="Opening balance">
        <Input
          type="text"
          inputMode="decimal"
          value={openingBalance}
          onKeyDown={handleBlockedNumberKeys}
          onChange={(event) =>
            setOpeningBalance(sanitizeFormattedAmount(event.target.value))
          }
          className="no-spinner"
          required
        />
      </Field>
      <FormActions submitLabel={account ? "Save changes" : "Add account"} onCancel={onCancel} />
    </form>
  );
}
