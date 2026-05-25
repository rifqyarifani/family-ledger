import { createClient } from "@/src/lib/supabase/server";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { FamilyMember } from "@/types/finance";

const householdRoles = ["owner", "member"] as const;

type HouseholdMemberRow = {
  id: string;
  display_name: string;
  role: HouseholdRole;
  email: string | null;
  monthly_responsibility_note: string | null;
};

export type HouseholdRole = (typeof householdRoles)[number];

export type HouseholdMemberInput = {
  name: string;
  role: HouseholdRole;
  email?: string;
  note?: string;
};

function mapHouseholdMember(row: HouseholdMemberRow): FamilyMember {
  return {
    id: row.id,
    name: row.display_name,
    role: row.role,
    email: row.email ?? undefined,
    note: row.monthly_responsibility_note ?? undefined
  };
}

export async function getHouseholdMembers(householdId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("household_members")
    .select("id, display_name, role, email, monthly_responsibility_note")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true })
    .returns<HouseholdMemberRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapHouseholdMember);
}

export async function getCurrentHouseholdMemberId(householdId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("household_members")
    .select("id")
    .eq("household_id", householdId)
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export function normalizeHouseholdRole(role: string): HouseholdRole {
  return householdRoles.includes(role as HouseholdRole) ? (role as HouseholdRole) : "member";
}

async function findAuthUserIdByEmail(email: string) {
  const admin = createAdminClient();
  const normalizedEmail = email.toLowerCase();
  let page = 1;

  while (page < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);

    if (user) {
      return user.id;
    }

    if (data.users.length < 100) {
      break;
    }

    page += 1;
  }

  return null;
}

async function getOrCreateAuthUserId(member: HouseholdMemberInput) {
  if (!member.email) {
    throw new Error("Email is required to add a database-backed household member.");
  }

  const existingUserId = await findAuthUserIdByEmail(member.email);

  if (existingUserId) {
    return existingUserId;
  }

  const [firstName = member.name, ...lastNameParts] = member.name.split(" ");
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: member.email,
    email_confirm: true,
    password: randomUUID(),
    user_metadata: {
      first_name: firstName,
      last_name: lastNameParts.join(" ")
    }
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Could not create the member account.");
  }

  return data.user.id;
}

export async function createHouseholdMember(householdId: string, member: HouseholdMemberInput) {
  const supabase = await createClient();
  const userId = await getOrCreateAuthUserId(member);
  const { error } = await supabase.from("household_members").insert({
    household_id: householdId,
    user_id: userId,
    display_name: member.name,
    role: member.role,
    email: member.email,
    monthly_responsibility_note: member.note?.trim() || null
  });

  if (error) {
    throw new Error(error.code === "23505" ? "This email is already a member of the household." : error.message);
  }
}

export async function updateHouseholdMember(householdId: string, memberId: string, member: HouseholdMemberInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("household_members")
    .update({
      display_name: member.name,
      role: member.role,
      email: member.email?.trim() || null,
      monthly_responsibility_note: member.note?.trim() || null
    })
    .eq("household_id", householdId)
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteHouseholdMember(householdId: string, memberId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("household_members")
    .delete()
    .eq("household_id", householdId)
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}
