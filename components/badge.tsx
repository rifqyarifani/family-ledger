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
        tone === "slate" && "bg-slate-100 text-slate-700",
        tone === "green" && "bg-emerald-50 text-emerald-700",
        tone === "red" && "bg-red-50 text-red-700",
        tone === "blue" && "bg-blue-50 text-blue-700"
      )}
    >
      {children}
    </span>
  );
}
