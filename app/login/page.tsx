import Link from "next/link";
import { login } from "@/app/actions/login";
import { Field, Input } from "@/components/form-field";
import { PublicHeader } from "@/components/public-header";
import { SubmitButton } from "@/components/submit-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
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
              Welcome back
            </span>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] text-brand-green sm:text-6xl lg:text-7xl">
              Open your household workspace.
            </h1>
            <p className="mt-5 text-xl font-semibold leading-snug text-canvas-soft/85 lg:text-2xl">
              Continue tracking shared accounts, transactions, budgets, and
              savings goals from the same FamilyLedger dashboard.
            </p>
          </div>

          <section className="w-full rounded-[2rem] border border-surface-border bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-ink">Log in</h2>
              <p className="text-sm text-ink-secondary">
                Use your FamilyLedger account credentials.
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

            <form action={login} className="grid gap-4">
              <input type="hidden" name="next" value={params.next ?? "/app"} />
              <Field label="Email">
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field label="Password">
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-ink-secondary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <SubmitButton className="h-12 w-full" pendingLabel="Logging in...">
                Log in
              </SubmitButton>
            </form>

            <p className="mt-5 text-center text-sm text-ink-secondary">
              New to FamilyLedger?{" "}
              <Link
                href="/signup"
                className="font-semibold text-ink underline-offset-4 hover:underline"
              >
                Create an account →
              </Link>
            </p>
            <p className="mt-3 text-center text-xs text-ink-muted">
              Your household data is private to your family — never shared or
              sold.
            </p>
          </section>
          </div>
        </section>
      </main>
    </>
  );
}
