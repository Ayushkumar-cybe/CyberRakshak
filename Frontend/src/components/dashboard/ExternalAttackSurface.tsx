import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  stats: {
    total: number;
    exposed: number;
    cloud: number;
  };
}

const ExternalAttackSurface = ({ stats }: Props) => {
  const internal = stats.total - (stats.exposed + stats.cloud);
  
  const data = [
    { name: "Public Facing", value: stats.exposed, color: "#ef4444" },
    { name: "Cloud Assets", value: stats.cloud, color: "#f97316" },
    { name: "Internal", value: internal > 0 ? internal : 0, color: "#3b82f6" },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Attack Surface</h3>
      <div className="flex items-center gap-6">
        <div className="w-[180px] h-[180px] relative">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="80%" paddingAngle={2}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm opacity-70">Assets</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {data.map((d, i) => (
            <p key={i} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
              {d.name}: <span className="font-semibold">{d.value}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExternalAttackSurface;
