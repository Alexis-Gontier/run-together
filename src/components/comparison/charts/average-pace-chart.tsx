"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import {
  Scatter,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis,
  Cell
} from "recharts";
import { UserComparison } from "@/lib/api/schemas";

interface AveragePaceChartProps {
  data: UserComparison[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function AveragePaceChart({ data }: AveragePaceChartProps) {
  const chartData = data.map((comparison, index) => ({
    name: comparison.user.name,
    x: index,
    pace: comparison.stats.averagePace,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allure Moyenne</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Utilisateur"
              tickFormatter={(value) => chartData[value]?.name || ""}
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
              domain={[-0.5, chartData.length - 0.5]}
              ticks={chartData.map((_, i) => i)}
            />
            <YAxis
              type="number"
              dataKey="pace"
              name="Allure"
              label={{ value: "Allure (min/km)", angle: -90, position: "insideLeft" }}
              reversed // Lower is better for pace
            />
            <ZAxis range={[400, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const pace = data.pace;
                  const minutes = Math.floor(pace);
                  const seconds = Math.round((pace - minutes) * 60);
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {data.name}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {minutes}:{seconds.toString().padStart(2, '0')} /km
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Scatter name="Allure" data={chartData} fill="hsl(var(--chart-3))">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
