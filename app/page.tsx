import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  LockKeyhole,
  ReceiptText,
  Users,
  Wallet,
  WalletCards
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { LandingFooter } from "@/components/landing-footer";
import { formatCurrency, formatCurrencyShort } from "@/lib/finance";

const heroFeatures = [
  {
    variant: "sage" as const,
    icon: ReceiptText,
    title: "Track Every Transaction",
    description:
      "Record income, expenses, transfers, and household spending manually without connecting a bank account."
  },
  {
    variant: "green" as const,
    icon: BarChart3,
    title: "See Your Family's Money Clearly",
    description:
      "Monitor balances, monthly cashflow, budget progress, and savings goals from one simple dashboard."
  },
  {
    variant: "dark" as const,
    icon: LockKeyhole,
    title: "Per-Household Privacy",
    description:
      "Per-household workspaces with invite codes, so only your family sees your data."
  }
];

const whyFeatures = [
  {
    icon: Users,
    title: "Track together",
    description:
      "Your household members see the same totals, accounts, and goals. No more screenshots or end-of-month surprises."
  },
  {
    icon: LockKeyhole,
    title: "Stay private or share",
    description:
      "Mark accounts as Shared or privately owned by a member. FamilyLedger never sells your data or connects to a bank."
  },
  {
    icon: Wallet,
    title: "Built for IDR",
    description:
      "Indonesian Rupiah is the only currency. Amounts, dates, and conventions are tuned for how families here actually track money."
  }
];

export default async function LandingPage({
  searchParams
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;

  if (params.code) {
    redirect(`/reset-password/callback?code=${params.code}`);
  }

  return (
    <>
      <PublicHeader />

      <main className="bg-surface">
        {/* HERO */}
        <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
          <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] bg-ink p-8 text-canvas-soft shadow-soft lg:p-10">
              <span className="inline-flex items-center rounded-full bg-brand-green-pale px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-green-dark">
                For Indonesian households
              </span>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] text-brand-green md:text-6xl lg:text-7xl">
                Household money, clearly handled.
              </h1>
              <p className="mt-5 text-xl font-semibold leading-snug text-canvas-soft/85 lg:text-2xl">
                The shared workspace where families record income, expenses, accounts, budgets, and goals — in IDR, no bank connection required.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-green px-6 text-sm font-bold text-ink transition hover:bg-brand-green-light"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-5 text-sm text-canvas-soft/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-brand-green underline-offset-4 hover:underline"
                >
                  Log in →
                </Link>
              </p>
            </div>

            <div className="grid gap-4">
              {/* Dashboard preview */}
              <div className="rounded-[2rem] border border-surface-border bg-white p-6 shadow-soft">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-secondary">
                      This month
                    </p>
                    <p className="mt-1 text-3xl font-black text-ink">
                      {formatCurrency(16_205_000)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-brand-green-pale p-3 text-ink">
                    <WalletCards className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-xs font-semibold text-ink-secondary">
                      Income
                    </p>
                    <p className="mt-2 text-lg font-black text-ink">{formatCurrencyShort(26_500_000)}</p>
                  </div>
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-xs font-semibold text-ink-secondary">
                      Expense
                    </p>
                    <p className="mt-2 text-lg font-black text-ink">{formatCurrencyShort(10_200_000)}</p>
                  </div>
                  <div className="relative rounded-2xl bg-surface p-4">
                    <span
                      className="absolute right-3 top-3 h-2 w-2 rounded-full bg-brand-green"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-semibold text-ink-secondary">
                      Saved
                    </p>
                    <p className="mt-2 text-lg font-black text-ink">61%</p>
                  </div>
                </div>
                <p className="mt-3 text-right text-[11px] text-ink-muted">
                  Sample data
                </p>
              </div>

              {/* Feature cards — palette variety */}
              {heroFeatures.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* WHY */}
        <section
          id="why"
          className="bg-white"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-secondary">
                Why FamilyLedger
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight text-ink md:text-4xl lg:text-5xl">
                Three reasons Indonesian families choose FamilyLedger over a spreadsheet.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-3">
              {whyFeatures.map((feature) => (
                <WhyCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* DARK CTA STRIP */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
          <div className="overflow-hidden rounded-[2rem] bg-ink p-8 text-canvas-soft lg:p-10">
            <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-3xl font-black leading-tight text-brand-green md:text-4xl">
                  Set up your household in under a minute.
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-canvas-soft/80">
                  Create an account, start a household or join one with a code,
                  and add your first account. No bank login. No data sharing.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-green px-6 text-sm font-bold text-ink transition hover:bg-brand-green-light"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-canvas-soft/30 bg-transparent px-6 text-sm font-bold text-canvas-soft transition hover:bg-canvas-soft/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}

function FeatureCard({
  variant,
  icon: Icon,
  title,
  description
}: {
  variant: "sage" | "green" | "dark";
  icon: typeof ReceiptText;
  title: string;
  description: string;
}) {
  if (variant === "dark") {
    return (
      <div className="rounded-[2rem] bg-ink p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-canvas-soft/10 p-3 text-brand-green">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-brand-green">{title}</p>
            <p className="mt-1 text-sm text-canvas-soft/75">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        variant === "sage"
          ? "rounded-[2rem] border border-surface-border bg-surface p-6 shadow-soft"
          : "rounded-[2rem] border border-brand-green-pale bg-brand-green-pale p-6 shadow-soft"
      }
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-ink p-3 text-brand-green">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm text-ink-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
}

function WhyCard({
  icon: Icon,
  title,
  description
}: {
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] border border-surface-border bg-surface p-6">
      <div className="rounded-2xl bg-ink p-3 text-brand-green w-fit">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-secondary">{description}</p>
    </div>
  );
}
