import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/reset-password";
import { Field, Input } from "@/components/form-field";
import { PublicHeader } from "@/components/public-header";
import { SubmitButton } from "@/components/submit-button";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
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
                Password recovery
              </span>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] text-brand-green sm:text-6xl lg:text-7xl">
                Reset your password.
              </h1>
              <p className="mt-5 text-xl font-semibold leading-snug text-canvas-soft/85 lg:text-2xl">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>
            </div>

            <section className="w-full rounded-[2rem] border border-surface-border bg-white p-6 shadow-soft sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-ink">Forgot password?</h2>
                <p className="text-sm text-ink-secondary">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {params.error ? (
                <p className="mb-4 rounded-2xl border border-danger-border bg-danger-lighter p-3 text-sm text-danger-deep">
                  {params.error}
                </p>
              ) : null}
              {params.message ? (
                <p className="mb-4 rounded-2xl bg-surface-subtle p-3 text-sm text-ink-secondary">
                  {params.message}
                </p>
              ) : null}

              <form action={requestPasswordReset} className="grid gap-4">
                <Field label="Email">
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </Field>
                <SubmitButton className="h-12 w-full" pendingLabel="Sending...">
                  Send reset link
                </SubmitButton>
              </form>

              <p className="mt-5 text-center text-sm text-ink-secondary">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-ink underline-offset-4 hover:underline"
                >
                  Log in →
                </Link>
              </p>
              <p className="mt-3 text-center text-xs text-ink-muted">
                We never store your password in plain text.
              </p>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
