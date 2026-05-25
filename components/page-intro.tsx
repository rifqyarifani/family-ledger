import type { ReactNode } from "react";

export function PageIntro({ title, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">{action}</div> : null}
    </div>
  );
}
