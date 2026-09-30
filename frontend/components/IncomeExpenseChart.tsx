"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactCurrency, formatCurrency, formatMonth } from "@/lib/format";
import type { MonthlyTotal } from "@/lib/types";

export default function IncomeExpenseChart({ monthly }: { monthly: MonthlyTotal[] }) {
  const data = monthly.map((item) => ({ ...item, label: formatMonth(item.month) }));

  return (
    <div role="img" aria-label="Bar chart of monthly income and expenses">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) => formatCompactCurrency(Number(value))}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} cursor={{ fill: "#f1f5f9" }} />
          <Legend iconType="circle" />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
