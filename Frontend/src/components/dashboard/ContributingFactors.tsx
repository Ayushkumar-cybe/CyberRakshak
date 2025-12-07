import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import CardHeader from "./CardHeader";

const data = [
  { name: "Unpatched Software", value: 38, color: "#ef4444" },  // red
  { name: "Misconfigurations", value: 28, color: "#f97316" },   // orange
  { name: "Weak Credentials", value: 23, color: "#3b82f6" },    // blue
  { name: "Exposed Services", value: 11, color: "#10b981" },    // green
];

const ContributingFactors = () => {
  return (
    <div className="w-full h-full">
      <CardHeader
        title="Contributing Factors"
        tooltip="Primary factors contributing to overall security risk, showing percentage breakdown of root causes."
      />

      <div className="w-full h-48">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="75%"
              paddingAngle={2}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>

            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ContributingFactors;