import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/form-field";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-slate-950 p-3 text-white">
            <PiggyBank className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Log in</h1>
            <p className="text-sm text-slate-500">Open your FamilyLedger workspace.</p>
          </div>
        </div>

        {params.error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
        {params.message ? <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{params.message}</p> : null}

        <form action={login} className="grid gap-4">
          <input type="hidden" name="next" value={params.next ?? "/app"} />
          <Field label="Email">
            <Input name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" autoComplete="current-password" required />
          </Field>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          New to FamilyLedger?{" "}
          <Link href="/signup" className="font-medium text-slate-950 underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
