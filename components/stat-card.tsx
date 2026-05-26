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
          <p className="text-sm font-medium text-[#454745]">{title}</p>
          <p className="mt-2 break-words text-3xl font-black text-[#0e0f0c]">{value}</p>
          {detail ? <p className="mt-2 text-xs text-[#868685]">{detail}</p> : null}
        </div>
        <div className="shrink-0 rounded-2xl bg-[#e2f6d5] p-2 text-[#0e0f0c]">{icon}</div>
      </div>
    </Card>
  );
}
