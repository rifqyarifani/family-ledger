"use client";

import { useState, type FormEvent } from "react";
import { DatePicker } from "@/components/date-picker";
import { Field, Input, Select } from "@/components/form-field";
import { FormActions, FormError } from "@/components/form-actions";
import { formatInputAmount, handleBlockedNumberKeys, parseFormattedAmount, sanitizeFormattedAmount } from "@/lib/format-utils";
import { createId } from "@/lib/utils";
import type { SavingsGoal, SavingsGoalAccountOption } from "@/types/finance";

export function SavingsGoalForm({
  goal,
  savingsAccountOptions,
  onSubmit,
  onCancel,
}: {
  goal?: SavingsGoal;
  savingsAccountOptions: SavingsGoalAccountOption[];
  onSubmit: (goal: SavingsGoal) => void | Promise<void>;
  onCancel: () => void;
}) {
  const initialAccountName = savingsAccountOptions.some((account) => account.name === goal?.name)
    ? goal?.name ?? ""
    : savingsAccountOptions[0]?.name ?? "";
  const [name, setName] = useState(initialAccountName);
  const [targetAmount, setTargetAmount] = useState(
    goal ? formatInputAmount(goal.targetAmount) : "0",
  );
  const [dueDate, setDueDate] = useState(goal?.dueDate ?? "");
  const [error, setError] = useState("");
  const selectedAccount = savingsAccountOptions.find((account) => account.name === name);
  const savedAmount = selectedAccount?.savedAmount ?? 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = parseFormattedAmount(targetAmount);

    if (
      !selectedAccount ||
      !dueDate ||
      !Number.isFinite(target) ||
      target <= 0
    ) {
      setError(
        "Choose a savings account, due date, and positive target amount.",
      );
      return;
    }

    onSubmit({
      id: goal?.id ?? createId("goal"),
      name: selectedAccount.name,
      targetAmount: target,
      savedAmount,
      dueDate,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormError message={error} />
      <Field label="Linked savings account">
        <Select value={name} onChange={(event) => setName(event.target.value)} required disabled={savingsAccountOptions.length === 0}>
          {savingsAccountOptions.length > 0 ? (
            savingsAccountOptions.map((account) => (
              <option key={account.name} value={account.name}>
                {account.name}
              </option>
            ))
          ) : (
            <option value="">No available savings account</option>
          )}
        </Select>
      </Field>
      <Field label="Target amount">
        <Input
          type="text"
          inputMode="decimal"
          value={targetAmount}
          onKeyDown={handleBlockedNumberKeys}
          onChange={(event) =>
            setTargetAmount(sanitizeFormattedAmount(event.target.value))
          }
          className="no-spinner"
          required
        />
      </Field>
      <Field label="Saved amount">
        <Input
          type="text"
          value={formatInputAmount(savedAmount)}
          readOnly
          className="bg-surface-subtle"
        />
        <p className="mt-1 text-xs text-ink-secondary">Saved amount follows this account balance automatically.</p>
      </Field>
      <div className="block">
        <span className="text-sm font-medium text-ink-secondary">Due date</span>
        <div className="mt-1">
          <DatePicker value={dueDate} onChange={setDueDate} />
        </div>
      </div>
      <FormActions
        submitLabel={goal ? "Save changes" : "Add goal"}
        onCancel={onCancel}
      />
    </form>
  );
}
