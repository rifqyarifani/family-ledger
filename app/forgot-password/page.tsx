import Link from "next/link";
import { KeyRound } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/reset-password";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/form-field";
import { PublicHeader } from "@/components/public-header";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-surface">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <PublicHeader />

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
          <div className="rounded-[2rem] bg-brand p-6 text-white shadow-soft sm:p-8">
            <p className="mb-4 inline-flex rounded-full bg-brand-green-pale px-3 py-1 text-xs font-bold uppercase text-brand-green-dark">
              Password Recovery
            </p>
            <h1 className="text-5xl font-black leading-[0.95] text-brand-green sm:text-6xl">
              Reset your password.
            </h1>
            <p className="mt-6 text-base leading-7 text-surface">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          <section className="w-full rounded-3xl border border-surface-border bg-white p-6 shadow-xl">
            <div className="mb-6">
              <div className="mb-3 rounded-2xl bg-brand-green-pale p-3 text-brand-green-dark inline-flex">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-black text-ink">Forgot password?</h2>
              <p className="text-sm text-ink-secondary">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {params.error ? (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {params.error}
              </p>
            ) : null}
            {params.message ? (
              <p className="mb-4 rounded-lg bg-surface-subtle p-3 text-sm text-ink-secondary">
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
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-secondary">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-ink underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
