"use client";

import { useState, type FormEvent } from "react";
import { Field, Input, Select, CappedTextInput } from "@/components/form-field";
import { FormActions } from "@/components/form-actions";
import { useFormErrors } from "@/hooks/use-form-errors";
import {
  MAX_NAME_LENGTH,
  cappedName,
  composeValidators,
  mustSelect,
  requiredString
} from "@/lib/validation";
import type { FamilyMemberFormInput } from "@/types/finance";

const roles = [
  { value: "owner", label: "Owner" },
  { value: "member", label: "Member" }
];

export function FamilyForm({
  member,
  onSubmit,
  onCancel,
  pending = false,
  pendingLabel
}: {
  member?: FamilyMemberFormInput;
  onSubmit: (member: FamilyMemberFormInput) => void | Promise<void>;
  onCancel: () => void;
  pending?: boolean;
  pendingLabel?: string;
}) {
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role === "owner" ? "owner" : "member");
  const [email, setEmail] = useState(member?.email ?? "");
  const isEditing = Boolean(member);
  const { errors, setAll, clearAll } = useFormErrors();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = {
      name: cappedName(name),
      role: mustSelect(role, "Role"),
      email: isEditing
        ? null
        : composeValidators(requiredString(email, "Email"))
    };

    setAll(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    onSubmit({
      name: name.trim(),
      role: role.trim(),
      email: email.trim() || undefined
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
      <Field label="Name" error={errors.name}>
        <CappedTextInput
          value={name}
          onChange={setName}
          maxLength={MAX_NAME_LENGTH}
          required
        />
      </Field>
      <Field label="Role" error={errors.role}>
        <Select value={role} onChange={(event) => setRole(event.target.value)} required>
          {roles.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Email" error={errors.email}>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required={!isEditing}
        />
      </Field>
      <FormActions
        submitLabel={member ? "Save changes" : "Add member"}
        onCancel={onCancel}
        pending={pending}
        pendingLabel={pendingLabel}
      />
    </form>
  );
}
