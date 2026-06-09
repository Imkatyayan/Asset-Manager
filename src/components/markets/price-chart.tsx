"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface PriceChartProps {
  data: Array<{ date: string; close: number }>;
  positive: boolean;
}

export function PriceChart({ data, positive }: PriceChartProps) {
  if (data.length === 0) return null;

  const color = positive ? "var(--color-market-up)" : "var(--color-market-down)";

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#888" }}
            tickFormatter={(v) => v.slice(5)}
            minTickGap={30}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#888" }}
            domain={["auto", "auto"]}
            tickFormatter={(v) => v.toLocaleString("en-IN")}
            width={60}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Close"]}
            labelFormatter={(label) => label}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
