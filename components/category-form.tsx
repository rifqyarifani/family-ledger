"use client";

import { useState, type FormEvent } from "react";
import {
  Tag,
  Utensils,
  Car,
  Home,
  Zap,
  GraduationCap,
  Tv,
  Heart,
  Shirt,
  Plane,
  Gift,
  Briefcase,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Ambulance,
} from "lucide-react";
import { Field, Input, Select } from "@/components/form-field";
import { FormActions, FormError } from "@/components/form-actions";
import { cn } from "@/lib/utils";
import { createId } from "@/lib/utils";
import type { Category } from "@/types/finance";

const maxCategoryLength = 30;

const iconOptions = [
  { name: "tag", icon: Tag },
  { name: "utensils", icon: Utensils },
  { name: "car", icon: Car },
  { name: "home", icon: Home },
  { name: "zap", icon: Zap },
  { name: "graduation-cap", icon: GraduationCap },
  { name: "tv", icon: Tv },
  { name: "heart", icon: Heart },
  { name: "shirt", icon: Shirt },
  { name: "plane", icon: Plane },
  { name: "gift", icon: Gift },
  { name: "briefcase", icon: Briefcase },
  { name: "trending-up", icon: TrendingUp },
  { name: "dollar-sign", icon: DollarSign },
  { name: "shopping-bag", icon: ShoppingBag },
  { name: "ambulance", icon: Ambulance },
];

const colorOptions = [
  "#64748b",
  "#9fe870",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#6366f1",
  "#10b981",
  "#f97316",
  "#14b8a6",
];

export function CategoryForm({
  category,
  onSubmit,
  onCancel,
}: {
  category?: Category;
  onSubmit: (category: Category) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<"income" | "expense">(
    category?.type === "income" ? "income" : "expense",
  );
  const [icon, setIcon] = useState(category?.icon ?? "tag");
  const [color, setColor] = useState(
    category?.color ?? (type === "income" ? "#2ead4b" : "#d03238"),
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
      type,
      icon,
      color,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormError message={error} />
      <Field label="Category name">
        <Input
          value={name}
          maxLength={maxCategoryLength}
          onChange={(event) =>
            setName(event.target.value.slice(0, maxCategoryLength))
          }
          required
        />
        <p className="mt-1 text-right text-xs text-ink-muted">
          {name.length}/{maxCategoryLength}
        </p>
      </Field>
      <Field label="Type">
        <Select
          value={type}
          onChange={(event) =>
            setType(event.target.value as "income" | "expense")
          }
          required
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
      </Field>
      <Field label="Icon">
        <div className="flex flex-wrap gap-2">
          {iconOptions.map((iconOption) => {
            const Icon = iconOption.icon;
            return (
              <button
                key={iconOption.name}
                type="button"
                onClick={() => setIcon(iconOption.name)}
                className={cn(
                  "h-9 w-9 rounded-lg border-2 flex items-center justify-center transition-all",
                  icon === iconOption.name
                    ? "border-ink bg-surface-subtle"
                    : "border-transparent hover:bg-surface-subtle",
                )}
                aria-label={iconOption.name}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Color">
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              onClick={() => setColor(colorOption)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                color === colorOption
                  ? "border-ink scale-110"
                  : "border-transparent hover:scale-105",
              )}
              style={{ backgroundColor: colorOption }}
              aria-label={colorOption}
            />
          ))}
        </div>
      </Field>
      <div className="sm:col-span-2">
        <FormActions
          submitLabel={category ? "Save changes" : "Add category"}
          onCancel={onCancel}
        />
      </div>
    </form>
  );
}
