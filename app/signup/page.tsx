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
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = getSignupErrorMessage(params.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-slate-950 p-3 text-white">
            <PiggyBank className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Create account</h1>
            <p className="text-sm text-slate-500">Create your login. Household setup happens after you sign in.</p>
          </div>
        </div>

        {errorMessage ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p> : null}

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
            <Input name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" autoComplete="new-password" minLength={6} required />
          </Field>
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-950 underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
