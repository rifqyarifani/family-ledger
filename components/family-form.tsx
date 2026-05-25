"use client";

import { useState, type FormEvent } from "react";
import { Field, Input, Select } from "@/components/form-field";
import { FormActions, FormError } from "@/components/form-actions";
import { createId } from "@/lib/utils";
import type { FamilyMember } from "@/types/finance";

const maxMemberNameLength = 30;
const roles = [
  { value: "owner", label: "Owner" },
  { value: "member", label: "Member" }
];

export function FamilyForm({
  member,
  onSubmit,
  onCancel
}: {
  member?: FamilyMember;
  onSubmit: (member: FamilyMember) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role === "owner" ? "owner" : "member");
  const [email, setEmail] = useState(member?.email ?? "");
  const [error, setError] = useState("");
  const isEditing = Boolean(member);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || name.trim().length > maxMemberNameLength || !role.trim() || (!isEditing && !email.trim())) {
      setError("Name up to 30 characters, role, and email are required.");
      return;
    }

    onSubmit({
      id: member?.id ?? createId("member"),
      name: name.trim(),
      role: role.trim(),
      email: email.trim() || undefined
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormError message={error} />
      <Field label="Name">
        <Input
          value={name}
          maxLength={maxMemberNameLength}
          onChange={(event) => setName(event.target.value.slice(0, maxMemberNameLength))}
          required
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {name.length}/{maxMemberNameLength}
        </p>
      </Field>
      <Field label="Role">
        <Select value={role} onChange={(event) => setRole(event.target.value)} required>
          {roles.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={isEditing ? "Email" : "Email"}>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required={!isEditing} />
      </Field>
      <FormActions submitLabel={member ? "Save changes" : "Add member"} onCancel={onCancel} />
    </form>
  );
}
