import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
      <Inbox className="h-10 w-10 text-slate-400" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
