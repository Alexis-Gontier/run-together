"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { UserComparison } from "@/lib/api/schemas";

interface TotalDistanceChartProps {
  data: UserComparison[];
}

export function TotalDistanceChart({ data }: TotalDistanceChartProps) {
  const chartData = data.map((comparison) => ({
    name: comparison.user.name,
    distance: comparison.stats.totalDistance,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distance Totale</CardTitle>
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
              label={{ value: "Distance (km)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)} km`, "Distance"]}
            />
            <Legend />
            <Bar
              dataKey="distance"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
