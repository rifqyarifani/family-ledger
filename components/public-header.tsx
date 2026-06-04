import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { PublicHeaderMobileMenu } from "@/components/public-header-mobile-menu";

const navLinks = [
  { href: "/#why", label: "Features" }
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="rounded-xl bg-ink p-1.5 text-brand-green">
            <PiggyBank className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-ink">FamilyLedger</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-2xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-brand-green px-4 text-sm font-semibold text-ink transition hover:bg-brand-green-light"
          >
            Sign up
          </Link>
        </div>

        <PublicHeaderMobileMenu />
      </div>
    </header>
  );
}
