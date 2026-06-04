"use client";

import { useState, type FormEvent } from "react";
import { Field, Input, Select, MoneyInput } from "@/components/form-field";
import { FormActions } from "@/components/form-actions";
import { DatePicker } from "@/components/date-picker";
import { useFormErrors } from "@/hooks/use-form-errors";
import { formatInputAmount, parseFormattedAmount } from "@/lib/format-utils";
import { mustSelect, positiveAmount, requiredString } from "@/lib/validation";
import type { SavingsGoalFormInput, SavingsGoalAccountOption } from "@/types/finance";

export function SavingsGoalForm({
  goal,
  savingsAccountOptions,
  onSubmit,
  onCancel,
  pending = false,
  pendingLabel
}: {
  goal?: SavingsGoalFormInput;
  savingsAccountOptions: SavingsGoalAccountOption[];
  onSubmit: (goal: SavingsGoalFormInput) => void | Promise<void>;
  onCancel: () => void;
  pending?: boolean;
  pendingLabel?: string;
}) {
  const initialAccountName = savingsAccountOptions.some((account) => account.name === goal?.name)
    ? goal?.name ?? ""
    : savingsAccountOptions[0]?.name ?? "";
  const [name, setName] = useState(initialAccountName);
  const [targetAmount, setTargetAmount] = useState(
    goal ? formatInputAmount(goal.targetAmount) : "0",
  );
  const [dueDate, setDueDate] = useState(goal?.dueDate ?? "");
  const selectedAccount = savingsAccountOptions.find((account) => account.name === name);
  const savedAmount = selectedAccount?.savedAmount ?? 0;
  const { errors, setAll, clearAll } = useFormErrors();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = {
      name: mustSelect(name, "Savings account"),
      targetAmount: positiveAmount(targetAmount, parseFormattedAmount, "Target amount"),
      dueDate: requiredString(dueDate, "Due date")
    };

    setAll(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    onSubmit({
      name: selectedAccount!.name,
      targetAmount: parseFormattedAmount(targetAmount),
      savedAmount,
      dueDate
    });
  }

  return (
    <form
      onSubmit={(event) => {
        clearAll();
        handleSubmit(event);
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Linked savings account" error={errors.name}>
        <Select
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          disabled={savingsAccountOptions.length === 0}
        >
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
      <Field label="Target amount" error={errors.targetAmount}>
        <MoneyInput value={targetAmount} onChange={setTargetAmount} required />
      </Field>
      <Field label="Saved amount">
        <Input
          type="text"
          value={formatInputAmount(savedAmount)}
          readOnly
          className="bg-surface-subtle"
        />
        <p className="mt-1 text-xs text-ink-secondary">
          Saved amount follows this account balance automatically.
        </p>
      </Field>
      <div className="block">
        <span className="text-sm font-medium text-ink-secondary">Due date</span>
        <div className="mt-1">
          <DatePicker value={dueDate} onChange={setDueDate} />
        </div>
        {errors.dueDate ? (
          <span className="mt-1 block text-xs text-red-600">{errors.dueDate}</span>
        ) : null}
      </div>
      <FormActions
        submitLabel={goal ? "Save changes" : "Add goal"}
        onCancel={onCancel}
        pending={pending}
        pendingLabel={pendingLabel}
      />
    </form>
  );
}
