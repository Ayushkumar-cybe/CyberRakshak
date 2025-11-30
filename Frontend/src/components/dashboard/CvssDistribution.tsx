import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, LabelList } from "recharts";

interface Props {
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const CvssDistribution = ({ stats }: Props) => {
  const data = [
    { severity: "Critical", count: stats.critical, color: "#dc2626" },
    { severity: "High", count: stats.high, color: "#f97316" },
    { severity: "Medium", count: stats.medium, color: "#facc15" },
    { severity: "Low", count: stats.low, color: "#22c55e" },
  ];

  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold mb-4">CVSS Distribution</h3>
      <div className="w-full h-56">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="severity" tick={{ fill: "#94a3b8" }} />
            <YAxis tick={{ fill: "#94a3b8" }} />
            <Tooltip />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="count" position="top" fill="#888888" />
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
