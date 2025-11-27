import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

interface Props {
  distribution: Record<string, number>;
}

const AssetDistribution = ({ distribution }: Props) => {
  // Convert dictionary to array for Recharts
  const data = Object.entries(distribution || {}).map(([name, count], index) => ({
    name,
    count,
    // Assign colors cyclically
    color: ["#3b82f6", "#8b5cf6", "#0ea5e9", "#14b8a6", "#f97316"][index % 5]
  }));

  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold mb-4">Asset Distribution</h3>

      <div className="w-full h-56">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "#94a3b8" }}
              width={100}
            />
            <Tooltip />

            <Bar dataKey="count" radius={8}>
              <LabelList dataKey="count" position="right" fill="#888" />
              {data.map((entry, index) => (
                <rect key={index} fill={entry.color} />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetDistribution;
