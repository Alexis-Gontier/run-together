"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { UserComparison } from "@/lib/api/schemas";

interface ActivityFrequencyChartProps {
  data: UserComparison[];
}

export function ActivityFrequencyChart({ data }: ActivityFrequencyChartProps) {
  const chartData = data.map((comparison) => ({
    name: comparison.user.name,
    frequency: comparison.stats.runsPerMonth,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fréquence d&apos;Activité</CardTitle>
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
              label={{ value: "Courses/mois", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)} courses/mois`, "Fréquence"]}
            />
            <Legend />
            <Bar
              dataKey="frequency"
              fill="hsl(var(--chart-4))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
