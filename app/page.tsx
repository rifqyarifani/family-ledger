import Link from "next/link";
import { ArrowRight, BarChart3, LockKeyhole, PiggyBank, WalletCards } from "lucide-react";

const features = [
  {
    title: "Manual records",
    description: "Track household income, expenses, transfers, budgets, and savings without bank integrations.",
    icon: WalletCards
  },
  {
    title: "Family dashboard",
    description: "See balances, monthly flow, budget progress, and goals in one calm workspace.",
    icon: BarChart3
  },
  {
    title: "Private by default",
    description: "Supabase Auth protects the app area while the current MVP data flow stays unchanged.",
    icon: LockKeyhole
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-950 p-2 text-white">
              <PiggyBank className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">FamilyLedger</p>
              <p className="text-xs text-slate-500">Household finance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Sign up
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Family finance MVP</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              A simple, serious dashboard for household money.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              FamilyLedger helps families record income, expenses, budgets, accounts, and goals manually in Indonesian Rupiah.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Create account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/app"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Open app
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="grid gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-4 rounded-lg border border-slate-100 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-950">{feature.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
