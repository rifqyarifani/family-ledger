import type { ReactNode } from "react";
import { Card, CardHeader } from "@/components/card";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  action,
  contentClassName,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} action={action} />
      <div className={cn("h-72 w-full", contentClassName)}>{children}</div>
    </Card>
  );
}
