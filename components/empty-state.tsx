import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#cfd5ca] bg-[#e8ebe6] px-5 py-12 text-center">
      <Inbox className="h-10 w-10 text-[#868685]" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-[#0e0f0c]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#454745]">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
