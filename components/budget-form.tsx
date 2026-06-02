"use client";

import { useState, type FormEvent } from "react";
import { Field, Select, MoneyInput } from "@/components/form-field";
import { FormActions } from "@/components/form-actions";
import { MonthPicker } from "@/components/month-picker";
import { useFormErrors } from "@/hooks/use-form-errors";
import { formatInputAmount, parseFormattedAmount } from "@/lib/format-utils";
import { getCurrentMonthKey } from "@/lib/finance";
import { createId } from "@/lib/utils";
import { mustSelect, positiveAmount } from "@/lib/validation";
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
  const { errors, setAll, clearAll } = useFormErrors();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = {
      category: mustSelect(category, "Expense category"),
      month: mustSelect(month, "Month"),
      limit: positiveAmount(limit, parseFormattedAmount, "Limit")
    };

    setAll(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    onSubmit({
      id: budget?.id ?? createId("budget"),
      category,
      limit: parseFormattedAmount(limit),
      month
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
      <Field label="Category" error={errors.category}>
        <Select value={category} onChange={(event) => setCategory(event.target.value)} required>
          {expenseCategories.map((expenseCategory) => (
            <option key={expenseCategory} value={expenseCategory}>
              {expenseCategory}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Limit" error={errors.limit}>
        <MoneyInput value={limit} onChange={setLimit} required />
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
