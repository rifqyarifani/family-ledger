import { cache } from "react";
import { createClient, getAuthedUser } from "@/src/lib/supabase/server";

export type ActiveHousehold = {
  id: string;
  name: string;
  inviteCode: string;
  monthlyCycleDay: number;
  role: "owner" | "member";
};

type HouseholdMemberRow = {
  household_id: string;
  role: ActiveHousehold["role"];
};

type HouseholdData = {
  name: string;
  invite_code: string;
  monthly_cycle_day: number;
};

export const getActiveHousehold = cache(async (): Promise<ActiveHousehold | null> => {
  const user = await getAuthedUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<HouseholdMemberRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("name, invite_code, monthly_cycle_day")
    .eq("id", data.household_id)
    .maybeSingle<HouseholdData>();

  if (householdError) {
    throw new Error(householdError.message);
  }

  if (!household) {
    return null;
  }

  return {
    id: data.household_id,
    name: household.name,
    inviteCode: household.invite_code,
    monthlyCycleDay: household.monthly_cycle_day ?? 1,
    role: data.role === "owner" ? "owner" : "member"
  };
});

export const getCurrentUserProfile = cache(async () => {
  const user = await getAuthedUser();

  if (!user) {
    return null;
  }

  const firstName =
    typeof user.user_metadata.first_name === "string"
      ? user.user_metadata.first_name
      : "";
  const lastName =
    typeof user.user_metadata.last_name === "string"
      ? user.user_metadata.last_name
      : "";
  const displayName =
    `${firstName} ${lastName}`.trim() || user.email || "Family member";

  return {
    id: user.id,
    email: user.email ?? null,
    firstName,
    lastName,
    displayName
  };
});
