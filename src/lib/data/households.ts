import { createClient } from "@/src/lib/supabase/server";

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
  households: {
    name: string;
    invite_code: string | null;
    monthly_cycle_day: number;
  } | null;
};

export async function getActiveHousehold(): Promise<ActiveHousehold | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("household_members")
    .select("household_id, role, households(name, invite_code, monthly_cycle_day)")
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

  return {
    id: data.household_id,
    name: data.households?.name ?? "FamilyLedger Home",
    inviteCode: data.households?.invite_code ?? "",
    monthlyCycleDay: data.households?.monthly_cycle_day ?? 1,
    role: data.role === "owner" ? "owner" : "member"
  };
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const firstName = typeof user.user_metadata.first_name === "string" ? user.user_metadata.first_name : "";
  const lastName = typeof user.user_metadata.last_name === "string" ? user.user_metadata.last_name : "";
  const displayName = `${firstName} ${lastName}`.trim() || user.email || "Family member";

  return {
    id: user.id,
    email: user.email ?? null,
    firstName,
    lastName,
    displayName
  };
}
