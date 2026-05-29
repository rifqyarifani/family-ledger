import Link from "next/link";
import { login } from "@/app/actions/login";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/form-field";
import { PublicHeader } from "@/components/public-header";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-surface">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <PublicHeader />

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
          <div className="rounded-[2rem] bg-brand p-6 text-white shadow-soft sm:p-8">
            <p className="mb-4 inline-flex rounded-full bg-brand-green-pale px-3 py-1 text-xs font-bold uppercase text-brand-green-dark">
              Welcome back
            </p>
            <h1 className="text-5xl font-black leading-[0.95] text-brand-green sm:text-6xl">
              Open your household workspace.
            </h1>
            <p className="mt-6 text-base leading-7 text-surface">
              Continue tracking shared accounts, transactions, budgets, and
              savings goals from the same FamilyLedger dashboard.
            </p>
          </div>

          <section className="w-full rounded-3xl border border-surface-border bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-ink">Log in</h2>
              <p className="text-sm text-ink-secondary">
                Use your FamilyLedger account credentials.
              </p>
            </div>

            {params.error ? (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {params.error}
              </p>
            ) : null}
            {params.message ? (
              <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
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
              <Button type="submit" className="w-full">
                Log in
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-secondary">
              New to FamilyLedger?{" "}
              <Link
                href="/signup"
                className="font-semibold text-ink underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
