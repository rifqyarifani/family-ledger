import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function GET() {
  await signOut();
}

export async function POST() {
  await signOut();
}
