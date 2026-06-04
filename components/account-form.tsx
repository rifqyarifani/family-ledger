"use client";

import { useState, type FormEvent } from "react";
import { Field, Select, CappedTextInput, MoneyInput } from "@/components/form-field";
import { FormActions } from "@/components/form-actions";
import { ColorPicker, type ColorOption } from "@/components/color-picker";
import { useFormErrors } from "@/hooks/use-form-errors";
import { formatInputAmount, parseFormattedAmount } from "@/lib/format-utils";
import {
  MAX_NAME_LENGTH,
  cappedName,
  nonNegativeAmount
} from "@/lib/validation";
import type { Account, AccountFormInput, FamilyMember } from "@/types/finance";

const colorOptions: ColorOption[] = [
  { value: "#64748b", label: "Slate" },
  { value: "#528540", label: "Green" },
  { value: "#0957c3", label: "Blue" },
  { value: "#feaf27", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#7240f9", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f26d35", label: "Orange" },
  { value: "#35a39d", label: "Teal" }
];

export function AccountForm({
  account,
  members = [],
  onSubmit,
  onCancel,
  pending = false,
  pendingLabel
}: {
  account?: AccountFormInput;
  members?: FamilyMember[];
  onSubmit: (account: AccountFormInput) => void | Promise<void>;
  onCancel: () => void;
  pending?: boolean;
  pendingLabel?: string;
}) {
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<Account["type"]>(account?.type ?? "bank");
  const [openingBalance, setOpeningBalance] = useState(
    account ? formatInputAmount(account.openingBalance) : "0"
  );
  const [iconColor, setIconColor] = useState(account?.iconColor ?? "#64748b");
  const [ownerMemberId, setOwnerMemberId] = useState<string>(account?.ownerMemberId ?? "");
  const { errors, setAll, clearAll } = useFormErrors();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = {
      name: cappedName(name, "Account name"),
      openingBalance: nonNegativeAmount(openingBalance, parseFormattedAmount, "Opening balance")
    };

    setAll(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    void onSubmit({
      name: name.trim(),
      type,
      openingBalance: parseFormattedAmount(openingBalance),
      iconColor,
      ownerMemberId: ownerMemberId || null
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
      <Field label="Account name" error={errors.name}>
        <CappedTextInput
          value={name}
          onChange={setName}
          maxLength={MAX_NAME_LENGTH}
          required
        />
      </Field>
      <Field label="Type">
        <Select
          value={type}
          onChange={(event) => setType(event.target.value as Account["type"])}
        >
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="credit">Credit</option>
          <option value="savings">Savings</option>
        </Select>
      </Field>
      <Field label="Owner">
        <Select
          value={ownerMemberId}
          onChange={(event) => setOwnerMemberId(event.target.value)}
        >
          <option value="">Shared</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Color">
        <ColorPicker
          value={iconColor}
          options={colorOptions}
          onChange={setIconColor}
          ariaLabel="Account color"
        />
      </Field>
      <Field label="Opening balance" error={errors.openingBalance}>
        <MoneyInput
          value={openingBalance}
          onChange={setOpeningBalance}
          required
        />
      </Field>
      <FormActions
        submitLabel={account ? "Save changes" : "Add account"}
        onCancel={onCancel}
        pending={pending}
        pendingLabel={pendingLabel}
      />
    </form>
  );
}
