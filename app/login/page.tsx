import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/form-field";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#e8ebe6]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-5 z-20 flex items-center justify-between gap-4 rounded-3xl border border-[#cfd5ca] bg-white/80 px-4 py-3 shadow-soft backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#0e0f0c] p-2 text-[#9fe870]">
              <PiggyBank className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0e0f0c]">
                FamilyLedger
              </p>
              <p className="text-xs text-[#454745]">Household finance</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-[#cfd5ca] bg-[#e8ebe6] px-4 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#e2f6d5]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#0e0f0c] px-4 text-sm font-semibold text-[#9fe870] transition hover:bg-[#163300]"
            >
              Sign up
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
          <div className="rounded-[2rem] bg-[#0e0f0c] p-6 text-white shadow-soft sm:p-8">
            <p className="mb-4 inline-flex rounded-full bg-[#e2f6d5] px-3 py-1 text-xs font-bold uppercase text-[#054d28]">
              Welcome back
            </p>
            <h1 className="text-5xl font-black leading-[0.95] text-[#9fe870] sm:text-6xl">
              Open your household workspace.
            </h1>
            <p className="mt-6 text-base leading-7 text-[#e8ebe6]">
              Continue tracking shared accounts, transactions, budgets, and
              savings goals from the same FamilyLedger dashboard.
            </p>
          </div>

          <section className="w-full rounded-3xl border border-[#cfd5ca] bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#0e0f0c]">Log in</h2>
              <p className="text-sm text-[#454745]">
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
              <Button type="submit" className="w-full">
                Log in
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-[#454745]">
              New to FamilyLedger?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#0e0f0c] underline-offset-4 hover:underline"
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
