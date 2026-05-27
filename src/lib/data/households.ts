import { createClient } from "@/src/lib/supabase/server";
import { generateHouseholdCode } from "@/src/lib/household-code";
import { createAdminClient } from "@/src/lib/supabase/admin";

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

function canUseAdminClient() {
  return Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function ensureHouseholdInviteCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  currentCode: string | null | undefined
) {
  if (currentCode) {
    return currentCode;
  }

  const { data: existingHousehold, error: existingError } = await supabase
    .from("households")
    .select("invite_code")
    .eq("id", householdId)
    .maybeSingle<{ invite_code: string | null }>();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingHousehold?.invite_code) {
    return existingHousehold.invite_code;
  }

  if (!canUseAdminClient()) {
    return "";
  }

  const admin = createAdminClient();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const inviteCode = generateHouseholdCode();
    const { data, error } = await admin
      .from("households")
      .update({ invite_code: inviteCode })
      .eq("id", householdId)
      .select("invite_code")
      .single<{ invite_code: string }>();

    if (!error && data?.invite_code) {
      return data.invite_code;
    }

    if (error?.code === "23505") {
      continue;
    }

    throw new Error(error?.message ?? "Could not prepare household invite code.");
  }

  throw new Error("Could not generate a unique household invite code.");
}

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

  const inviteCode = await ensureHouseholdInviteCode(supabase, data.household_id, data.households?.invite_code);

  return {
    id: data.household_id,
    name: data.households?.name ?? "FamilyLedger Home",
    inviteCode,
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
