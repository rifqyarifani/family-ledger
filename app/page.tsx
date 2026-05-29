import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  LockKeyhole,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;

  if (params.code) {
    redirect(`/reset-password/callback?code=${params.code}`);
  }

  return (
    <main className="min-h-screen bg-surface">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <PublicHeader />

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <div className="rounded-[2rem] bg-brand p-6 text-white shadow-soft sm:p-8 lg:p-10">
            <p className="mb-4 inline-flex rounded-full bg-brand-green-pale px-3 py-1 text-xs font-bold uppercase text-brand-green-dark">
              Family finance
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] text-brand-green sm:text-6xl lg:text-7xl">
              Household money, clearly handled.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-surface sm:text-lg">
              FamilyLedger gives families a shared workspace for manual income,
              expenses, accounts, budgets, and savings goals in Indonesian
              Rupiah.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-green px-5 text-sm font-bold text-ink transition hover:bg-brand-green-light"
              >
                Create account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/app"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#9fe870]/40 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Open app
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-surface-border bg-white p-5 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-secondary">
                    This month
                  </p>
                  <p className="mt-1 text-3xl font-black text-ink">
                    Rp 16.205.000
                  </p>
                </div>
                <div className="rounded-2xl bg-brand-green-pale p-3 text-ink">
                  <WalletCards className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-semibold text-ink-secondary">Income</p>
                  <p className="mt-2 text-lg font-black text-ink">
                    Rp 26.5m
                  </p>
                </div>
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-semibold text-ink-secondary">
                    Expense
                  </p>
                  <p className="mt-2 text-lg font-black text-ink">
                    Rp 10.2m
                  </p>
                </div>
                <div className="rounded-2xl bg-brand-green-pale p-4">
                  <p className="text-xs font-semibold text-brand-green-dark">Saved</p>
                  <p className="mt-2 text-lg font-black text-ink">61%</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-surface-border bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand p-3 text-brand-green">
                  <ReceiptText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-ink">
                    Track Every Transaction
                  </p>
                  <p className="text-sm text-ink-secondary">
                    Record income, expenses, transfers, and household spending
                    manually without connecting a bank account.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-surface-border bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand p-3 text-brand-green">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-ink">
                    See Your Family’s Money Clearly
                  </p>
                  <p className="text-sm text-ink-secondary">
                    Monitor balances, monthly cashflow, budget progress, and
                    savings goals from one simple dashboard.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-surface-border bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand p-3 text-brand-green">
                  <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-ink">
                    Built for Private Household Use
                  </p>
                  <p className="text-sm text-ink-secondary">
                    Your financial workspace is protected with account access,
                    so only authorized users can open the app.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
