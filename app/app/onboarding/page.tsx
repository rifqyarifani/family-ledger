import Link from "next/link";
import { CheckCircle2, Home, LogIn } from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { Field, Input } from "@/components/form-field";
import { PageIntro } from "@/components/page-intro";
import { getActiveHousehold } from "@/src/lib/data/households";
import {
  createHouseholdAction,
  joinHouseholdAction,
} from "@/app/app/onboarding/actions";

export default async function HouseholdOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const params = await searchParams;
  const household = await getActiveHousehold();

  if (household) {
    return (
      <>
        <PageIntro title="Household ready" />
        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-50 p-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-slate-950">
                {household.name}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Household code for joining members:
              </p>
              <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800">
                {household.inviteCode}
              </code>
              {params.created ? (
                <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  Household created. Share the code only with people you want to
                  invite.
                </p>
              ) : null}
              <Link
                href="/app"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Continue to dashboard
              </Link>
            </div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageIntro title="Set up household" />

      {params.error ? (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Create household"
            description="Start a new FamilyLedger workspace."
          />
          <form action={createHouseholdAction} className="grid gap-4">
            <Field label="Household name">
              <Input
                name="householdName"
                maxLength={80}
                placeholder="Rifqy Family Home"
                required
              />
            </Field>
            <Button type="submit" className="w-full">
              <Home className="h-4 w-4" aria-hidden="true" />
              Create household
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader
            title="Join household"
            description="Use the household code shared by an existing owner."
          />
          <form action={joinHouseholdAction} className="grid gap-4">
            <Field label="Household code">
              <Input name="householdCode" placeholder="ABC234" required />
            </Field>
            <Button type="submit" variant="secondary" className="w-full">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Join household
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
