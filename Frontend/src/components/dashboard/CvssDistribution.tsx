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
  { severity: "Critical", count: 1247, color: "#dc2626" },
  { severity: "High", count: 3546, color: "#f97316" },
  { severity: "Medium", count: 6891, color: "#facc15" },
  { severity: "Low", count: 2708, color: "#22c55e" },
];

const CvssDistribution = () => {
  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold mb-4">CVSS Distribution</h3>

      <div className="w-full h-56">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="severity"
              tick={{ fill: "#94a3b8" }}
            />
            <YAxis tick={{ fill: "#94a3b8" }} />
            <Tooltip />

            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="count" position="top" fill="#ffffff" />
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

export default CvssDistribution;