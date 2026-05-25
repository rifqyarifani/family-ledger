import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const normalized = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all",
          normalized >= 90 ? "bg-red-500" : normalized >= 70 ? "bg-amber-500" : "bg-slate-900"
        )}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
