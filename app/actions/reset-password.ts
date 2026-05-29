"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function requestPasswordReset(formData: FormData) {
  const email = getFormValue(formData, "email").toLowerCase();

  if (!email) {
    redirect("/forgot-password?error=Email is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

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
