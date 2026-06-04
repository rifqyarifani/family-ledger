import Link from "next/link";
import { signup } from "@/app/actions/signup";
import { Field, Input } from "@/components/form-field";
import { PublicHeader } from "@/components/public-header";
import { SubmitButton } from "@/components/submit-button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ?? "";

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-surface">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div className="rounded-[2rem] bg-ink p-8 text-canvas-soft shadow-soft sm:p-10 lg:p-12">
              <span className="inline-flex items-center rounded-full bg-brand-green-pale px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-green-dark">
                New here
              </span>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] text-brand-green sm:text-6xl lg:text-7xl">
                Create your family finance workspace.
              </h1>
              <p className="mt-5 text-xl font-semibold leading-snug text-canvas-soft/85 lg:text-2xl">
                Make your account first, then create a household or join an
                existing one with a household code.
              </p>
            </div>

            <section className="w-full rounded-[2rem] border border-surface-border bg-white p-6 shadow-soft sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-ink">Create account</h2>
                <p className="text-sm text-ink-secondary">
                  Household setup happens after you sign in.
                </p>
              </div>

              {errorMessage ? (
                <p className="mb-4 rounded-2xl border border-danger-border bg-danger-lighter p-3 text-sm text-danger-deep">
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
                <SubmitButton className="h-12 w-full" pendingLabel="Creating account...">
                  Create account
                </SubmitButton>
              </form>

              <p className="mt-5 text-center text-sm text-ink-secondary">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-ink underline-offset-4 hover:underline"
                >
                  Log in →
                </Link>
              </p>
              <p className="mt-3 text-center text-xs text-ink-muted">
                Free to use. No bank connection. Cancel anytime.
              </p>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
