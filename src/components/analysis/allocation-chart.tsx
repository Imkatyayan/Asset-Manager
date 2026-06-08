"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { AllocationSlice } from "@/lib/analysis";

interface AllocationChartProps {
  data: AllocationSlice[];
  title?: string;
}

export function AllocationChart({ data, title = "Sector Allocation" }: AllocationChartProps) {
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="border-b border-market-border">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="#1A1E29" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: "6px",
                  border: "1px solid #2A2E39",
                  background: "#1E222D",
                  color: "#D1D4DC",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 space-y-2">
          {data.map((slice) => (
            <div key={slice.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="text-market-muted">{slice.name}</span>
              </div>
              <span className="font-mono-nums font-medium text-market-text">
                {slice.percent.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
