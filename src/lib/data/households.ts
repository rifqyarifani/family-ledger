import { createClient } from "@/src/lib/supabase/server";
import { generateHouseholdCode } from "@/src/lib/household-code";

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
  invite_code: string | null;
  monthly_cycle_day: number;
};

export async function getActiveHousehold(): Promise<ActiveHousehold | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

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

  let inviteCode = household.invite_code;

  if (!inviteCode) {
    const code = generateHouseholdCode();
    const { error: updateError } = await supabase
      .from("households")
      .update({ invite_code: code })
      .eq("id", data.household_id);

    if (updateError) {
      throw new Error(updateError.message);
    }
    inviteCode = code;
  }

  return {
    id: data.household_id,
    name: household.name,
    inviteCode: inviteCode ?? "",
    monthlyCycleDay: household.monthly_cycle_day ?? 1,
    role: data.role === "owner" ? "owner" : "member",
  };
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    displayName,
  };
}
