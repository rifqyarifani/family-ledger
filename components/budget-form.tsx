"use client";

import { useState, type FormEvent } from "react";
import { Field, Input, Select } from "@/components/form-field";
import { FormActions, FormError } from "@/components/form-actions";
import { MonthPicker } from "@/components/month-picker";
import { formatInputAmount, handleBlockedNumberKeys, parseFormattedAmount, sanitizeFormattedAmount } from "@/lib/format-utils";
import { getCurrentMonthKey } from "@/lib/finance";
import { createId } from "@/lib/utils";
import type { Budget } from "@/types/finance";

export function BudgetForm({
  budget,
  expenseCategories,
  defaultMonth,
  onSubmit,
  onCancel
}: {
  budget?: Budget;
  expenseCategories: string[];
  defaultMonth?: string;
  onSubmit: (budget: Budget) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState(
    budget?.category && expenseCategories.includes(budget.category)
      ? budget.category
      : expenseCategories[0] ?? ""
  );
  const [limit, setLimit] = useState(
    budget ? formatInputAmount(budget.limit) : "0"
  );
  const [month, setMonth] = useState(budget?.month ?? defaultMonth ?? getCurrentMonthKey());
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericLimit = parseFormattedAmount(limit);

    if (
      !category ||
      !month ||
      !Number.isFinite(numericLimit) ||
      numericLimit <= 0
    ) {
      setError("Expense category, month, and a positive limit are required.");
      return;
    }

    onSubmit({
      id: budget?.id ?? createId("budget"),
      category,
      limit: numericLimit,
      month
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormError message={error} />
      <Field label="Category">
        <Select value={category} onChange={(event) => setCategory(event.target.value)} required>
          {expenseCategories.map((expenseCategory) => (
            <option key={expenseCategory} value={expenseCategory}>
              {expenseCategory}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Limit">
        <Input
          type="text"
          inputMode="decimal"
          value={limit}
          onKeyDown={handleBlockedNumberKeys}
          onChange={(event) =>
            setLimit(sanitizeFormattedAmount(event.target.value))
          }
          className="no-spinner"
          required
        />
      </Field>
      <div className="block">
        <span className="text-sm font-medium text-ink-secondary">Month</span>
        <div className="mt-1">
          <MonthPicker value={month} onChange={setMonth} />
        </div>
      </div>
      <FormActions submitLabel={budget ? "Save changes" : "Add budget"} onCancel={onCancel} />
    </form>
  );
}
