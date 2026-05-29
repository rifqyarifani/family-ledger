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
import { formatCurrency, formatMonthKey } from "@/lib/finance";

type MonthlyDatum = {
  month: string;
  income: number;
  expense: number;
  savings: number;
};

type CategoryDatum = {
  category: string;
  amount: number;
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
        <YAxis stroke="#454745" fontSize={12} tickFormatter={(value: number) => `${value / 1000000}m`} />
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
        <YAxis stroke="#454745" fontSize={12} tickFormatter={(value: number) => `${value / 1000000}m`} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Area type="monotone" dataKey="savings" stroke="#9fe870" fill="#e5f7d4" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SpendingByCategoryChart({ data }: { data: CategoryDatum[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie data={data} dataKey="amount" nameKey="category" outerRadius={82}>
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-surface pt-3 sm:grid-cols-2">
        {data.map((item, index) => (
          <div key={item.category} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: chartColors[index % chartColors.length] }}
              aria-hidden="true"
            />
            <span className="truncate text-ink-secondary">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExpenseByMemberChart({ data }: { data: MemberDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cfd5ca" />
        <XAxis type="number" stroke="#454745" fontSize={12} tickFormatter={(value: number) => `${value / 1000000}m`} />
        <YAxis type="category" dataKey="member" stroke="#454745" fontSize={12} width={90} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Bar dataKey="amount" fill="#0f172a" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
