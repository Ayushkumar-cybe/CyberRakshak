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
  Cell,
} from "recharts";
import CardHeader from "./CardHeader";

const data = [
  { severity: "Critical", count: 1247, color: "#ef4444" },
  { severity: "High", count: 3546, color: "#f97316" },
  { severity: "Medium", count: 6891, color: "#eab308" },
  { severity: "Low", count: 2708, color: "#3b82f6" },
];

const CvssDistribution = () => {
  return (
    <div className="w-full h-full">
      <CardHeader
        title="CVSS Distribution"
        tooltip="Vulnerabilities categorized by severity level (Critical to Low) based on CVSS v3.1 standards."
      />

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
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CvssDistribution;