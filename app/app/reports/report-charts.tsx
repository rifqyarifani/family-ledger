"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import { formatCompactNumber, formatCurrency, formatMonthKey } from "@/lib/finance";

type MonthlyDatum = {
  month: string;
  income: number;
  expense: number;
  savings: number;
};

type CategoryDatum = {
  category: string;
  amount: number;
  color?: string;
};

type MemberDatum = {
  member: string;
  amount: number;
};

export function MonthlyIncomeExpenseChart({ data }: { data: MonthlyDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cfd5ca" />
        <XAxis dataKey="month" stroke="#454745" fontSize={12} tickFormatter={(value: string) => formatMonthKey(value)} />
        <YAxis stroke="#454745" fontSize={12} tickFormatter={formatCompactNumber} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" fill="#dc2626" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NetCashflowTrendChart({ data }: { data: MonthlyDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cfd5ca" />
        <XAxis dataKey="month" stroke="#454745" fontSize={12} tickFormatter={(value: string) => formatMonthKey(value)} />
        <YAxis stroke="#454745" fontSize={12} tickFormatter={formatCompactNumber} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Area type="monotone" dataKey="savings" stroke="#9fe870" fill="#e5f7d4" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SpendingByCategoryChart({ data }: { data: CategoryDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie data={data} dataKey="amount" nameKey="category" outerRadius={82}>
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
      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-surface pt-3 sm:grid-cols-2">
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <div key={item.category} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
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

export function ExpenseByMemberChart({ data }: { data: MemberDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cfd5ca" />
        <XAxis type="number" stroke="#454745" fontSize={12} tickFormatter={formatCompactNumber} />
        <YAxis type="category" dataKey="member" stroke="#454745" fontSize={12} width={90} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Bar dataKey="amount" fill="#0f172a" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
