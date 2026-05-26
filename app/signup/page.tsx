import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/form-field";

function getSignupErrorMessage(error?: string) {
  if (!error) {
    return "";
  }

  if (error.toLowerCase().includes("email rate limit")) {
    return "Email confirmation was rate-limited. Try again now; local signup no longer sends confirmation email.";
  }

  return error;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = getSignupErrorMessage(params.error);

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
              Start together
            </p>
            <h1 className="text-5xl font-black leading-[0.95] text-[#9fe870] sm:text-6xl">
              Create your family finance workspace.
            </h1>
            <p className="mt-6 text-base leading-7 text-[#e8ebe6]">
              Make your account first, then create a household or join an
              existing one with a household code.
            </p>
          </div>

          <section className="w-full rounded-3xl border border-[#cfd5ca] bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#0e0f0c]">
                Create account
              </h2>
              <p className="text-sm text-[#454745]">
                Household setup happens after you sign in.
              </p>
            </div>

            {errorMessage ? (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <form action={signup} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name">
                  <Input name="firstName" autoComplete="given-name" required />
                </Field>
                <Field label="Last name">
                  <Input name="lastName" autoComplete="family-name" />
                </Field>
              </div>
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
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </Field>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-[#454745]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#0e0f0c] underline-offset-4 hover:underline"
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
