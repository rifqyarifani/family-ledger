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
  Ambulance
} from "lucide-react";
import { Field, Select, CappedTextInput } from "@/components/form-field";
import { FormActions } from "@/components/form-actions";
import { ColorPicker, type ColorOption } from "@/components/color-picker";
import { IconPicker, type IconOption } from "@/components/icon-picker";
import { useFormErrors } from "@/hooks/use-form-errors";
import { createId } from "@/lib/utils";
import { MAX_NAME_LENGTH, cappedName, mustSelect } from "@/lib/validation";
import type { Category } from "@/types/finance";

const iconOptions: IconOption[] = [
  { value: "tag", label: "Tag", icon: Tag },
  { value: "utensils", label: "Utensils", icon: Utensils },
  { value: "car", label: "Car", icon: Car },
  { value: "home", label: "Home", icon: Home },
  { value: "zap", label: "Zap", icon: Zap },
  { value: "graduation-cap", label: "Graduation Cap", icon: GraduationCap },
  { value: "tv", label: "Tv", icon: Tv },
  { value: "heart", label: "Heart", icon: Heart },
  { value: "shirt", label: "Shirt", icon: Shirt },
  { value: "plane", label: "Plane", icon: Plane },
  { value: "gift", label: "Gift", icon: Gift },
  { value: "briefcase", label: "Briefcase", icon: Briefcase },
  { value: "trending-up", label: "Trending Up", icon: TrendingUp },
  { value: "dollar-sign", label: "Dollar Sign", icon: DollarSign },
  { value: "shopping-bag", label: "Shopping Bag", icon: ShoppingBag },
  { value: "ambulance", label: "Ambulance", icon: Ambulance }
];

const colorOptions: ColorOption[] = [
  { value: "#64748b", label: "Slate" },
  { value: "#9fe870", label: "Lime" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f97316", label: "Orange" },
  { value: "#14b8a6", label: "Teal" }
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
    category?.type === "income" ? "income" : "expense"
  );
  const [icon, setIcon] = useState(category?.icon ?? "tag");
  const [color, setColor] = useState(
    category?.color ?? (type === "income" ? "#2ead4b" : "#d03238")
  );
  const { errors, setAll, clearAll } = useFormErrors();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = {
      name: cappedName(name, "Category name"),
      type: mustSelect(type, "Type")
    };

    setAll(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    onSubmit({
      id: category?.id ?? createId("category"),
      name: name.trim(),
      type,
      icon,
      color
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
      <Field label="Category name" error={errors.name}>
        <CappedTextInput
          value={name}
          onChange={setName}
          maxLength={MAX_NAME_LENGTH}
          required
        />
      </Field>
      <Field label="Type" error={errors.type}>
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
        <IconPicker
          value={icon}
          options={iconOptions}
          onChange={setIcon}
          ariaLabel="Category icon"
        />
      </Field>
      <Field label="Color">
        <ColorPicker
          value={color}
          options={colorOptions}
          onChange={setColor}
          ariaLabel="Category color"
        />
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
