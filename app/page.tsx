import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  LockKeyhole,
  PiggyBank,
  ReceiptText,
  WalletCards,
} from "lucide-react";

export default function LandingPage() {
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

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <div className="rounded-[2rem] bg-[#0e0f0c] p-6 text-white shadow-soft sm:p-8 lg:p-10">
            <p className="mb-4 inline-flex rounded-full bg-[#e2f6d5] px-3 py-1 text-xs font-bold uppercase text-[#054d28]">
              Family finance
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] text-[#9fe870] sm:text-6xl lg:text-7xl">
              Household money, clearly handled.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#e8ebe6] sm:text-lg">
              FamilyLedger gives families a shared workspace for manual income,
              expenses, accounts, budgets, and savings goals in Indonesian
              Rupiah.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#9fe870] px-5 text-sm font-bold text-[#0e0f0c] transition hover:bg-[#cdffad]"
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
            <div className="rounded-[2rem] border border-[#cfd5ca] bg-white p-5 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#454745]">
                    This month
                  </p>
                  <p className="mt-1 text-3xl font-black text-[#0e0f0c]">
                    Rp 16.205.000
                  </p>
                </div>
                <div className="rounded-2xl bg-[#e2f6d5] p-3 text-[#0e0f0c]">
                  <WalletCards className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#e8ebe6] p-4">
                  <p className="text-xs font-semibold text-[#454745]">Income</p>
                  <p className="mt-2 text-lg font-black text-[#0e0f0c]">
                    Rp 26.5m
                  </p>
                </div>
                <div className="rounded-2xl bg-[#e8ebe6] p-4">
                  <p className="text-xs font-semibold text-[#454745]">
                    Expense
                  </p>
                  <p className="mt-2 text-lg font-black text-[#0e0f0c]">
                    Rp 10.2m
                  </p>
                </div>
                <div className="rounded-2xl bg-[#e2f6d5] p-4">
                  <p className="text-xs font-semibold text-[#054d28]">Saved</p>
                  <p className="mt-2 text-lg font-black text-[#0e0f0c]">61%</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#cfd5ca] bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#0e0f0c] p-3 text-[#9fe870]">
                  <ReceiptText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-[#0e0f0c]">
                    Track Every Transaction
                  </p>
                  <p className="text-sm text-[#454745]">
                    Record income, expenses, transfers, and household spending
                    manually without connecting a bank account.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[#cfd5ca] bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#0e0f0c] p-3 text-[#9fe870]">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-[#0e0f0c]">
                    See Your Family’s Money Clearly
                  </p>
                  <p className="text-sm text-[#454745]">
                    Monitor balances, monthly cashflow, budget progress, and
                    savings goals from one simple dashboard.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[#cfd5ca] bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#0e0f0c] p-3 text-[#9fe870]">
                  <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-[#0e0f0c]">
                    Built for Private Household Use
                  </p>
                  <p className="text-sm text-[#454745]">
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
