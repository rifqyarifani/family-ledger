import Link from "next/link";
import { updatePassword } from "@/app/actions/reset-password";
import { Field, Input } from "@/components/form-field";
import { PublicHeader } from "@/components/public-header";
import { SubmitButton } from "@/components/submit-button";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-surface">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div className="rounded-[2rem] bg-ink p-8 text-canvas-soft shadow-soft sm:p-10 lg:p-12">
              <span className="inline-flex items-center rounded-full bg-brand-green-pale px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-green-dark">
                New password
              </span>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] text-brand-green sm:text-6xl lg:text-7xl">
                Set a new password.
              </h1>
              <p className="mt-5 text-xl font-semibold leading-snug text-canvas-soft/85 lg:text-2xl">
                Choose a strong password for your FamilyLedger account — at
                least 6 characters.
              </p>
            </div>

            <section className="w-full rounded-[2rem] border border-surface-border bg-white p-6 shadow-soft sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-ink">Set new password</h2>
                <p className="text-sm text-ink-secondary">
                  Enter your new password below.
                </p>
              </div>

              {params.error ? (
                <p className="mb-4 rounded-2xl border border-danger-border bg-danger-lighter p-3 text-sm text-danger-deep">
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
                <SubmitButton className="h-12 w-full" pendingLabel="Updating...">
                  Update password
                </SubmitButton>
              </form>

              <p className="mt-5 text-center text-sm text-ink-secondary">
                Need to start over?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-ink underline-offset-4 hover:underline"
                >
                  Log in →
                </Link>
              </p>
              <p className="mt-3 text-center text-xs text-ink-muted">
                Make it 8+ characters with a number for the strongest result.
              </p>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
