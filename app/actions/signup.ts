"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { getFormValue } from "@/lib/form-utils";

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
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });

  if (error) {
    const message =
      error.code === "user_already_exists" || error.message.toLowerCase().includes("already")
        ? "An account with this email already exists. Please log in."
        : error.message;
    redirectWithMessage("/signup", "error", message);
  }

  if (!data.session) {
    redirectWithMessage("/login", "message", "Check your email to confirm your account, then log in.");
  }

  redirectWithMessage("/login", "message", "Account created. Log in to create or join a household.");
}
