import Link from "next/link";
import { PiggyBank } from "lucide-react";

const productLinks = [
  { href: "/#why", label: "Features" },
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Sign up" }
];

const companyLinks = [
  { href: "#", label: "About" },
  { href: "#", label: "Contact" }
];

const legalLinks = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "—" }
];

export function LandingFooter() {
  return (
    <footer className="bg-ink text-canvas-soft">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="rounded-xl bg-canvas-soft/10 p-1.5 text-brand-green">
                <PiggyBank className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-canvas-soft">FamilyLedger</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-canvas-soft/70">
              Manual money tracking for Indonesian families. Record income,
              expenses, accounts, budgets, and goals in IDR — no bank connection
              required.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterColumn title="Product" links={productLinks} />
            <FooterColumn title="Company" links={companyLinks} />
            <FooterColumn title="Legal" links={legalLinks} />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-canvas-soft/15 pt-6 text-xs text-canvas-soft/60 sm:flex-row sm:items-center">
          <p>&copy; 2026 FamilyLedger</p>
          <p>Made for Indonesian households.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-canvas-soft/60">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm text-canvas-soft transition hover:text-brand-green"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
