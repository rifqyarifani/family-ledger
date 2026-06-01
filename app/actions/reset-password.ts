"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/src/lib/supabase/server";
import { getFormValue } from "@/lib/form-utils";

export async function requestPasswordReset(formData: FormData) {
  const email = getFormValue(formData, "email").toLowerCase();

  if (!email) {
    redirect("/forgot-password?error=Email is required.");
  }

  const supabase = await createClient();

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;
  const redirectTo = `${origin}/reset-password/callback`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    redirect("/forgot-password?error=Could not send reset email. Try again.");
  }

  redirect("/forgot-password?message=Check your email for a password reset link.");
}

export async function updatePassword(formData: FormData) {
  const password = getFormValue(formData, "password");
  const confirmPassword = getFormValue(formData, "confirmPassword");

  if (!password || password.length < 6) {
    redirect("/reset-password?error=Password must be at least 6 characters.");
  }

  if (password !== confirmPassword) {
    redirect("/reset-password?error=Passwords do not match.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/reset-password?error=Could not update password. The link may have expired.");
  }

  redirect("/login?message=Password updated. Log in with your new password.");
}
