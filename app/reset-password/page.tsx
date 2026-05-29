import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { updatePassword } from "@/app/actions/reset-password";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/form-field";
import { PublicHeader } from "@/components/public-header";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-surface">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <PublicHeader />

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
          <div className="rounded-[2rem] bg-brand p-6 text-white shadow-soft sm:p-8">
            <p className="mb-4 inline-flex rounded-full bg-brand-green-pale px-3 py-1 text-xs font-bold uppercase text-brand-green-dark">
              New Password
            </p>
            <h1 className="text-5xl font-black leading-[0.95] text-brand-green sm:text-6xl">
              Create a new password.
            </h1>
            <p className="mt-6 text-base leading-7 text-surface">
              Choose a strong password for your FamilyLedger account. Make sure
              it&apos;s at least 6 characters long.
            </p>
          </div>

          <section className="w-full rounded-3xl border border-surface-border bg-white p-6 shadow-xl">
            <div className="mb-6">
              <div className="mb-3 rounded-2xl bg-brand-green-pale p-3 text-brand-green-dark inline-flex">
                <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-black text-ink">Set new password</h2>
              <p className="text-sm text-ink-secondary">
                Enter your new password below.
              </p>
            </div>

            {params.error ? (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {params.error}
              </p>
            ) : null}

            <form action={updatePassword} className="grid gap-4">
              <Field label="New password">
                <Input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </Field>
              <Field label="Confirm password">
                <Input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </Field>
              <Button type="submit" className="w-full">
                Update password
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-secondary">
              <Link
                href="/login"
                className="font-semibold text-ink underline-offset-4 hover:underline"
              >
                Back to log in
              </Link>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
