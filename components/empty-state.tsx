import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-surface-border bg-surface px-5 py-12 text-center">
      <Inbox className="h-10 w-10 text-ink-muted" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-ink-secondary">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
