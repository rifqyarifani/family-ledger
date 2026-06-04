"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/#why", label: "Features" }
];

export function PublicHeaderMobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-surface-border bg-white text-ink md:hidden"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
      </button>
      {menuOpen ? (
        <div className="absolute left-0 right-0 top-16 border-t border-surface-border bg-white md:hidden">
          <nav
            aria-label="Mobile primary"
            className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-surface" aria-hidden="true" />
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-brand-green px-4 text-sm font-semibold text-ink transition hover:bg-brand-green-light"
            >
              Sign up
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
