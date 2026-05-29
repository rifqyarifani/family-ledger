import Link from "next/link";
import { PiggyBank } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-5 z-20 flex items-center justify-between gap-4 rounded-3xl border border-surface-border bg-white/95 px-4 py-3 shadow-soft">
      <Link href="/" className="flex items-center gap-3">
        <div className="rounded-2xl bg-brand p-2 text-brand-green">
          <PiggyBank className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">FamilyLedger</p>
          <p className="text-xs text-ink-secondary">Household finance</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-surface-border bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-brand-green-pale"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-brand px-4 text-sm font-semibold text-brand-green transition hover:bg-[#163300]"
        >
          Sign up
        </Link>
      </div>
    </header>
  );
}
