"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(path: string, key: "error" | "message", message: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}

function getSafeNextPath(value: string) {
  return value.startsWith("/app") ? value : "/app";
}

export async function login(formData: FormData) {
  const email = getFormValue(formData, "email").toLowerCase();
  const password = getFormValue(formData, "password");
  const next = getSafeNextPath(getFormValue(formData, "next"));

  if (!email || !password) {
    redirectWithMessage("/login", "error", "Email and password are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirectWithMessage("/login", "error", error.message);
  }

  redirect(next);
}
