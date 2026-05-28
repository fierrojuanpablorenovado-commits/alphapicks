"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { PerformancePoint } from "@/lib/data";

type Props = { data: PerformancePoint[]; benchmark: string };

export default function PerformanceChart({ data, benchmark }: Props) {
  const sliced = data.filter((_, i) => i % 3 === 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={sliced} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
        <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false}
          interval={Math.floor(sliced.length / 6)} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={(v) => `${v}`} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 8, color: "#e2e8f0" }}
          formatter={(val, name) => [typeof val === 'number' ? `${val.toFixed(1)}` : String(val), String(name)]}
          labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
        <Line type="monotone" dataKey="strategy" name="AlphaPicks"
          stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="benchmark" name={benchmark}
          stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}
