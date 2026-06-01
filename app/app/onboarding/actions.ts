"use server";

import { redirect } from "next/navigation";
import { createDefaultCategories } from "@/src/lib/data/categories";
import { getActiveHousehold, getCurrentUserProfile } from "@/src/lib/data/households";
import { formatHouseholdCode, generateHouseholdCode } from "@/src/lib/household-code";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { getFormValue } from "@/lib/form-utils";

function redirectWithError(message: string): never {
  redirect(`/app/onboarding?error=${encodeURIComponent(message)}`);
}

async function requireCurrentUser() {
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect("/login");
  }

  return user;
}

async function createUniqueHouseholdInviteCode(admin: ReturnType<typeof createAdminClient>) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const inviteCode = generateHouseholdCode();
    const { data, error } = await admin
      .from("households")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return inviteCode;
    }
  }

  throw new Error("Could not create a unique household invite code.");
}

export async function createHouseholdAction(formData: FormData) {
  const householdName = getFormValue(formData, "householdName");
  const user = await requireCurrentUser();
  const existingHousehold = await getActiveHousehold();

  if (existingHousehold) {
    redirect("/app/onboarding");
  }

  if (!householdName || householdName.length > 80) {
    redirectWithError("Household name must be 1-80 characters.");
  }

  const admin = createAdminClient();
  const inviteCode = await createUniqueHouseholdInviteCode(admin);
  const { data: household, error: householdError } = await admin
    .from("households")
    .insert({
      name: householdName,
      invite_code: inviteCode,
      currency: "IDR",
      monthly_cycle_day: 1,
      created_by: user.id
    })
    .select("id")
    .single();

  if (householdError || !household) {
    redirectWithError(householdError?.message ?? "Could not create household.");
  }

  const { error: memberError } = await admin.from("household_members").insert({
    household_id: household.id,
    user_id: user.id,
    role: "owner",
    display_name: user.displayName,
    email: user.email
  });

  if (memberError) {
    redirectWithError(memberError.message);
  }

  try {
    await createDefaultCategories(household.id, user.id);
  } catch {
    redirectWithError("Household created, but default categories could not be prepared.");
  }

  redirect("/app/onboarding?created=1");
}

export async function joinHouseholdAction(formData: FormData) {
  const householdCode = getFormValue(formData, "householdCode");
  const user = await requireCurrentUser();
  const existingHousehold = await getActiveHousehold();

  if (existingHousehold) {
    redirect("/app/onboarding");
  }

  if (!householdCode) {
    redirectWithError("Enter a household code.");
  }

  const admin = createAdminClient();
  const inviteCode = formatHouseholdCode(householdCode);
  const { data: household, error: householdError } = await admin
    .from("households")
    .select("id")
    .eq("invite_code", inviteCode)
    .maybeSingle<{ id: string }>();

  if (householdError || !household) {
    redirectWithError("Household code was not found.");
  }

  const { error: memberError } = await admin.from("household_members").insert({
    household_id: household.id,
    user_id: user.id,
    role: "member",
    display_name: user.displayName,
    email: user.email
  });

  if (memberError) {
    redirectWithError(memberError.code === "23505" ? "You already belong to this household." : memberError.message);
  }

  redirect("/app");
}
