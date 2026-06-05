"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { chartColors } from "@/constants/finance";
import { formatCompactNumber, formatCurrency } from "@/lib/finance";

type CashflowDatum = {
  month: string;
  income: number;
  expense: number;
  savings: number;
};

type SpendingDatum = {
  category: string;
  amount: number;
  color?: string;
};

export function CashflowTrendChart({ data }: { data: CashflowDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cfd5ca" />
        <XAxis dataKey="month" stroke="#454745" fontSize={12} />
        <YAxis stroke="#454745" fontSize={12} tickFormatter={(value: number) => formatCompactNumber(value)} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Area type="monotone" dataKey="income" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
        <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="#fee2e2" strokeWidth={2} />
        <Area type="monotone" dataKey="savings" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SpendingBreakdownChart({ data }: { data: SpendingDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="h-40 shrink-0 sm:h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius="52%"
              outerRadius="80%"
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={entry.color ?? chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid min-h-0 grid-cols-1 gap-2 overflow-y-auto border-t border-surface pt-3 sm:grid-cols-2">
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <div key={item.category} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color ?? chartColors[index % chartColors.length] }}
                  aria-hidden="true"
                />
                <span className="truncate text-ink-secondary">{item.category}</span>
              </div>
              <span className="shrink-0 font-medium text-ink">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
