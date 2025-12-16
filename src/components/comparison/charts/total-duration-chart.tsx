"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { UserComparison } from "@/lib/api/schemas";

interface TotalDurationChartProps {
  data: UserComparison[];
}

export function TotalDurationChart({ data }: TotalDurationChartProps) {
  const chartData = data.map((comparison) => ({
    name: comparison.user.name,
    duration: Math.round(comparison.stats.totalDuration / 3600 * 100) / 100, // Convert to hours
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Durée Totale</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis
              label={{ value: "Durée (heures)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)} heures`, "Durée"]}
            />
            <Legend />
            <Bar
              dataKey="duration"
              fill="hsl(var(--chart-2))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
