import { cn } from "@/lib/utils";

export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const normalized = Math.min(Math.max(value, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={normalized}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${normalized}% complete`}
      className={cn("h-2 overflow-hidden rounded-full bg-surface", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          normalized >= 90 ? "bg-red-500" : normalized >= 70 ? "bg-amber-500" : "bg-brand"
        )}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
