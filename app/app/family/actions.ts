"use server";

import { revalidatePath } from "next/cache";
import {
  createHouseholdMember,
  deleteHouseholdMember,
  normalizeHouseholdRole,
  updateHouseholdMember,
  type HouseholdMemberInput
} from "@/src/lib/data/household-members";
import { getActiveHousehold } from "@/src/lib/data/households";
import type { FamilyMemberFormInput } from "@/types/finance";

function validateFamilyMember(member: FamilyMemberFormInput, isCreate: boolean): HouseholdMemberInput {
  const name = member.name.trim();
  const email = member.email?.trim().toLowerCase();
  const role = normalizeHouseholdRole(member.role);

  if (!name || name.length > 30) {
    throw new Error("Member name must be 1-30 characters.");
  }

  if (isCreate && !email) {
    throw new Error("Email is required when adding a database-backed household member.");
  }

  if (email && !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  return {
    name,
    role,
    email,
    note: member.note?.trim() || undefined
  };
}

async function requireManageableHouseholdId() {
  const household = await getActiveHousehold();

  if (!household) {
    throw new Error("No active household found.");
  }

  if (household.role !== "owner") {
    throw new Error("Only household owners can manage family members.");
  }

  return household.id;
}

function revalidateFamily() {
  revalidatePath("/app");
  revalidatePath("/app/family");
  revalidatePath("/app/transactions");
  revalidatePath("/app/reports");
}

export async function createFamilyMemberAction(member: FamilyMemberFormInput) {
  const householdId = await requireManageableHouseholdId();
  await createHouseholdMember(householdId, validateFamilyMember(member, true));
  revalidateFamily();
}

export async function updateFamilyMemberAction(memberId: string, member: FamilyMemberFormInput) {
  const householdId = await requireManageableHouseholdId();
  await updateHouseholdMember(householdId, memberId, validateFamilyMember(member, false));
  revalidateFamily();
}

export async function deleteFamilyMemberAction(memberId: string) {
  const householdId = await requireManageableHouseholdId();
  await deleteHouseholdMember(householdId, memberId);
  revalidateFamily();
}
