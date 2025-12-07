import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import CardHeader from "./CardHeader";

const data = [
  { name: "Public Facing", value: 1523, color: "#ef4444" },   // red
  { name: "Cloud Assets", value: 956, color: "#f97316" },    // orange
  { name: "Internal", value: 1135, color: "#3b82f6" },       // blue
];

const ExternalAttackSurface = () => {
  const total =
    data[0].value + data[1].value + data[2].value;

  return (
    <div className="w-full h-full flex flex-col">
      <CardHeader
        title="External Attack Surface"
        tooltip="Count of public-facing assets visible to the open internet, including ports and cloud buckets."
      />

      <div className="flex items-center gap-6">

        {/* Donut Chart */}
        <div className="w-[180px] h-[180px] relative">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Center total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-sm opacity-70">Total</p>
          </div>
        </div>

        {/* Stats list */}
        <div className="space-y-2 text-sm">
          {data.map((d, i) => (
            <p key={i} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: d.color }}
              ></span>
              {d.name}: <span className="font-semibold">{d.value}</span>
            </p>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ExternalAttackSurface;