import type { ReactNode } from "react";
import { Card } from "@/components/card";

export function StatCard({
  title,
  value,
  detail,
  icon
}: {
  title: string;
  value: string;
  detail?: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-semibold text-slate-950">{value}</p>
          {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
        </div>
        <div className="shrink-0 rounded-lg bg-slate-100 p-2 text-slate-700">{icon}</div>
      </div>
    </Card>
  );
}
