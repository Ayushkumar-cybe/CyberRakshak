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

const data = [
  { name: "Servers", count: 3247, color: "#3b82f6" },
  { name: "Workstations", count: 4562, color: "#8b5cf6" },
  { name: "Network Devices", count: 1823, color: "#0ea5e9" },
  { name: "Cloud Assets", count: 2899, color: "#14b8a6" },
];

const AssetDistribution = () => {
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
            />
            <Tooltip />

            <Bar dataKey="count" radius={8}>
              <LabelList dataKey="count" position="right" fill="#ffffff" />
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