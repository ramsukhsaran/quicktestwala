"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  data: { attempt: string; score: number; accuracy: number }[];
}

export function PerformanceCharts({ data }: ChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[260px] w-full flex items-center justify-center text-xs text-muted-foreground">
        Loading performance metrics...
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
          <XAxis
            dataKey="attempt"
            stroke="#88888880"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#88888880"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name="Score (%)"
            stroke="#0ea5e9"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#0ea5e9" }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            name="Accuracy (%)"
            stroke="#10b981"
            strokeWidth={2.5}
            strokeDasharray="4 4"
            dot={{ r: 4, fill: "#10b981" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
