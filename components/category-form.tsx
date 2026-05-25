"use client";

import { useState, type FormEvent } from "react";
import { Field, Input, Select } from "@/components/form-field";
import { FormActions, FormError } from "@/components/form-actions";
import { createId } from "@/lib/utils";
import type { Category } from "@/types/finance";

const maxCategoryLength = 30;

export function CategoryForm({
  category,
  onSubmit,
  onCancel
}: {
  category?: Category;
  onSubmit: (category: Category) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<"income" | "expense">(
    category?.type === "income" ? "income" : "expense"
  );
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length > maxCategoryLength) {
      setError("Category name must be 1-30 characters.");
      return;
    }

    onSubmit({
      id: category?.id ?? createId("category"),
      name: trimmedName,
      type
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormError message={error} />
      <Field label="Category name">
        <Input
          value={name}
          maxLength={maxCategoryLength}
          onChange={(event) => setName(event.target.value.slice(0, maxCategoryLength))}
          required
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {name.length}/{maxCategoryLength}
        </p>
      </Field>
      <Field label="Type">
        <Select value={type} onChange={(event) => setType(event.target.value as "income" | "expense")} required>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
      </Field>
      <FormActions submitLabel={category ? "Save changes" : "Add category"} onCancel={onCancel} />
    </form>
  );
}
