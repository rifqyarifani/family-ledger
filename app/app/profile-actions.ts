"use server";

import { revalidatePath } from "next/cache";
import { getActiveHousehold } from "@/src/lib/data/households";
import { createClient } from "@/src/lib/supabase/server";

export type ProfileActionState = {
  ok: boolean;
  message: string;
};

export async function updateProfileAction(input: {
  firstName: string;
  lastName: string;
}): Promise<ProfileActionState> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName) {
    return { ok: false, message: "First name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: firstName,
      last_name: lastName
    }
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/app", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function updateHouseholdSettingsAction(input: {
  householdName: string;
}): Promise<ProfileActionState> {
  const householdName = input.householdName.trim();

  if (!householdName || householdName.length > 80) {
    return { ok: false, message: "Household name must be 1-80 characters." };
  }

  const household = await getActiveHousehold();

  if (!household) {
    return { ok: false, message: "No active household found." };
  }

  if (household.role !== "owner") {
    return { ok: false, message: "Only household owners can update household settings." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("households")
    .update({
      name: householdName
    })
    .eq("id", household.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/app", "layout");
  return { ok: true, message: "Household settings saved." };
}
