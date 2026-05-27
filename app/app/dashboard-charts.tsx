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
import { formatCurrency } from "@/lib/finance";

type CashflowDatum = {
  month: string;
  income: number;
  expense: number;
  savings: number;
};

type SpendingDatum = {
  category: string;
  amount: number;
};

export function CashflowTrendChart({ data }: { data: CashflowDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value: number) => `${value / 1000000}m`} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Area type="monotone" dataKey="income" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
        <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="#fee2e2" strokeWidth={2} />
        <Area type="monotone" dataKey="savings" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SpendingBreakdownChart({ data }: { data: SpendingDatum[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie data={data} dataKey="amount" nameKey="category" innerRadius={52} outerRadius={82} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2">
        {data.map((item, index) => (
          <div key={item.category} className="flex min-w-0 items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: chartColors[index % chartColors.length] }}
              aria-hidden="true"
            />
            <span className="truncate text-slate-600">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
