import React from "react";

const RiskSparkline = ({ values }: { values: number[] }) => {
  const max = Math.max(...values);
  const points = values
    .map((v, i) => `${i * 20},${40 - (v / max) * 40}`)
    .join(" ");

  return (
    <svg width="100" height="40">
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};

export default RiskSparkline;