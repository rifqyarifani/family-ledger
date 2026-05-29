import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "slate"
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "red" | "blue";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        tone === "slate" && "bg-surface text-ink-secondary",
        tone === "green" && "bg-brand-green-pale text-brand-green-dark",
        tone === "red" && "bg-[#320707] text-white",
        tone === "blue" && "bg-blue-50 text-blue-700"
      )}
    >
      {children}
    </span>
  );
}
