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
          <p className="text-sm font-medium text-ink-secondary">{title}</p>
          <p className="mt-2 break-words text-3xl font-black text-ink">{value}</p>
          {detail ? <p className="mt-2 text-xs text-ink-muted">{detail}</p> : null}
        </div>
        <div className="shrink-0 rounded-2xl bg-brand-green-pale p-2 text-ink">{icon}</div>
      </div>
    </Card>
  );
}
