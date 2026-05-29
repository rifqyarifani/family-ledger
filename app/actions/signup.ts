"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(path: string, key: "error" | "message", message: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}

export async function signup(formData: FormData) {
  const firstName = getFormValue(formData, "firstName");
  const lastName = getFormValue(formData, "lastName");
  const email = getFormValue(formData, "email").toLowerCase();
  const password = getFormValue(formData, "password");

  if (!firstName || !email || password.length < 6) {
    redirectWithMessage("/signup", "error", "First name, email, and a password of at least 6 characters are required.");
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "http://localhost:3000";
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      email_redirect_to: `${origin}/auth/callback`
    }
  });

  if (error || !data.user) {
    const message =
      error?.code === "email_exists" || error?.message.toLowerCase().includes("already")
        ? "An account with this email already exists. Please log in."
        : error?.message ?? "Could not create the account.";
    redirectWithMessage("/signup", "error", message);
  }

  redirectWithMessage("/login", "message", "Account created. Log in to create or join a household.");
}
