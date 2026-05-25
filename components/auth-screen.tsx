"use client";

import { useState, type FormEvent } from "react";
import { PiggyBank } from "lucide-react";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/form-field";
import { useLedger } from "@/hooks/use-ledger";

export function AuthScreen() {
  const { user, createLocalProfile, signIn } = useLedger();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pin, setPin] = useState("");
  const [householdName, setHouseholdName] = useState("FamilyLedger Home");
  const [error, setError] = useState("");
  const isSetup = !user;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isSetup) {
      if (!firstName.trim() || !email.trim() || pin.trim().length < 4 || !householdName.trim()) {
        setError("First name, email, household name, and a PIN of at least 4 digits are required.");
        return;
      }

      const created = await createLocalProfile(
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          pin: pin.trim()
        },
        householdName.trim()
      );
      if (!created) {
        setError("Could not create the account. Please try again.");
      }
      return;
    }

    if (!(await signIn(email, pin))) {
      setError("Email or PIN is incorrect.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-slate-950 p-3 text-white">
            <PiggyBank className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">FamilyLedger</h1>
            <p className="text-sm text-slate-500">{isSetup ? "Create your account" : "Sign in to your synced workspace"}</p>
          </div>
        </div>

        {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <form onSubmit={handleSubmit} className="grid gap-4">
          {isSetup ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              </Field>
              <Field label="Last name">
                <Input value={lastName} onChange={(event) => setLastName(event.target.value)} />
              </Field>
            </div>
          ) : null}

          <Field label="Email">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Field>

          <Field label="PIN">
            <Input
              type="password"
              inputMode="numeric"
              minLength={4}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))}
              required
            />
          </Field>

          {isSetup ? (
            <Field label="Household name">
              <Input value={householdName} onChange={(event) => setHouseholdName(event.target.value)} required />
            </Field>
          ) : null}

          <Button type="submit" className="w-full">
            {isSetup ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          This MVP syncs through Supabase. Use a production auth provider before relying on it for real security.
        </p>
      </section>
    </main>
  );
}
