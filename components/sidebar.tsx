"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart3,
  CreditCard,
  Flag,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/app/categories", label: "Categories", icon: Tags },
  { href: "/app/budget", label: "Budget", icon: Banknote },
  { href: "/app/reports", label: "Reports", icon: BarChart3 },
  { href: "/app/family", label: "Family", icon: Users },
  { href: "/app/accounts", label: "Accounts", icon: CreditCard },
  { href: "/app/goals", label: "Savings Goals", icon: Flag },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="rounded-lg bg-slate-900 p-2 text-white">
          <PiggyBank className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Family Ledger</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
