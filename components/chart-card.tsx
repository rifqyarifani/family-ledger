import type { ReactNode } from "react";
import { Card, CardHeader } from "@/components/card";

export function ChartCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} action={action} />
      <div className="h-72 w-full">{children}</div>
    </Card>
  );
}
