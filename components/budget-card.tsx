"use client";

import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Progress } from "@/components/progress";
import { formatCurrency, formatMonthKey, getBudgetUsage } from "@/lib/finance";
import type { Budget, Transaction } from "@/types/finance";

export function BudgetCard({
  budget,
  transactions,
  onEdit,
  onDelete
}: {
  budget: Budget;
  transactions: Transaction[];
  onEdit?: (budget: Budget) => void;
  onDelete?: (budget: Budget) => void;
}) {
  const usage = getBudgetUsage(budget, transactions);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">{budget.category}</h3>
          <p className="mt-1 text-sm text-slate-500">{formatMonthKey(budget.month)}</p>
        </div>
        {onEdit || onDelete ? (
          <div className="flex gap-1">
            {onEdit ? (
              <Button variant="ghost" size="icon" onClick={() => onEdit(budget)} aria-label={`Edit ${budget.category}`}>
                <Edit2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
            {onDelete ? (
              <Button variant="ghost" size="icon" onClick={() => onDelete(budget)} aria-label={`Delete ${budget.category}`}>
                <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="mt-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Spent</span>
          <span className="font-medium text-slate-950">
            {formatCurrency(usage.spent)} / {formatCurrency(budget.limit)}
          </span>
        </div>
        <Progress value={usage.percentage} />
        <div className="flex justify-between text-xs text-slate-500">
          <span>{usage.percentage}% used</span>
          <span>{formatCurrency(usage.remaining)} remaining</span>
        </div>
      </div>
    </Card>
  );
}
