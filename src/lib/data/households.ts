import { createAdminClient } from "@/src/lib/supabase/admin";
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

export async function getHouseholdData(householdId: string): Promise<HouseholdData> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("households")
    .select("name, invite_code, monthly_cycle_day")
    .eq("id", householdId)
    .single<HouseholdData>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.invite_code) {
    const code = generateHouseholdCode();
    const { data: updated, error: updateError } = await admin
      .from("households")
      .update({ invite_code: code })
      .eq("id", householdId)
      .select("name, invite_code, monthly_cycle_day")
      .single<HouseholdData>();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return updated;
  }

  return data;
}

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

  const household = await getHouseholdData(data.household_id);

  return {
    id: data.household_id,
    name: household.name,
    inviteCode: household.invite_code ?? "",
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
