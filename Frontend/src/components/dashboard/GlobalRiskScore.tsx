import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import CardHeader from "./CardHeader";

const GlobalRiskScore = () => {
  const score = 742;

  const data = [
    { name: "score", value: score },
    { name: "rest", value: 1000 - score },
  ];

  const COLORS = ["#dc2626", "#e5e7eb"];

  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      <CardHeader
        title="Global Cyber Risk Score"
        tooltip="Dynamic score (0-1000) calculated from active vulnerabilities, asset criticality, and threat intel."
      />

      <div className="w-[200px] h-[200px] relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius="70%"
              outerRadius="90%"
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* CENTER LABEL PROPERLY CENTERED */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">
            {score}
          </p>
          <p className="text-sm opacity-70">High Risk</p>
        </div>
      </div>

      <div className="mt-6 text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <p>
          Critical Assets: <span className="font-semibold">9,512</span>
        </p>
        <p>
          High Severity: <span className="font-semibold">3,847</span>
        </p>
      </div>
    </div>
  );
};

export default GlobalRiskScore;
