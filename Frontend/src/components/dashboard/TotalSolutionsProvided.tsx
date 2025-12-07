import React from "react";
import CardHeader from "./CardHeader";

const TotalSolutionsProvided = () => {
  // Chart dimensions
  const width = 400;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Data points for the area chart (simulating solutions provided)
  const data = [
    { day: "Mon", value: 15 },
    { day: "Tue", value: 28 },
    { day: "Wed", value: 35 },
    { day: "Thu", value: 52 },
    { day: "Fri", value: 68 },
    { day: "Sat", value: 75 },
    { day: "Sun", value: 92 },
  ];

  // Calculate path coordinates
  const maxValue = 100;
  const xScale = chartWidth / (data.length - 1);
  const yScale = chartHeight / maxValue;

  // Generate smooth curve path using cubic bezier for smoother curves
  const getPathData = () => {
    const points = data.map((d, i) => ({
      x: padding.left + i * xScale,
      y: padding.top + chartHeight - d.value * yScale,
    }));

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      // Calculate control points for smooth cubic bezier
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const pathData = getPathData();

  // Calculate last point coordinates for area closure
  const lastPointX = padding.left + (data.length - 1) * xScale;
  const firstPointX = padding.left;
  const bottomY = padding.top + chartHeight;

  // Area path (closed path for gradient fill)
  const areaPath = `${pathData} L ${lastPointX} ${bottomY} L ${firstPointX} ${bottomY} Z`;

  // Grid lines for Y-axis
  const gridLines = [0, 50, 100].map((val) => ({
    y: padding.top + chartHeight - (val * yScale),
    label: val.toString(),
  }));

  return (
    <div className="w-full h-full flex flex-col">
      <CardHeader
        title="Total Solutions Provided"
        tooltip="Cumulative number of automated patches and remediation scripts executed by CyRa this month."
      />

      <div className="w-full flex-1 flex items-center justify-center min-h-[200px]">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Grid lines (dotted) */}
          {gridLines.map((grid, idx) => (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={grid.y}
                x2={padding.left + chartWidth}
                y2={grid.y}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.5"
              />
              {/* Y-axis labels */}
              <text
                x={padding.left - 10}
                y={grid.y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
                className="dark:fill-slate-400"
              >
                {grid.label}
              </text>
            </g>
          ))}

          {/* Vertical grid lines for days */}
          {data.map((d, i) => {
            const x = padding.left + i * xScale;
            return (
              <line
                key={i}
                x1={x}
                y1={padding.top}
                x2={x}
                y2={padding.top + chartHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.3"
              />
            );
          })}

          {/* Area chart fill */}
          <path
            d={areaPath}
            fill="url(#cyanGradient)"
            opacity="0.6"
          />

          {/* Smooth curve line */}
          <path
            d={pathData}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = padding.left + i * xScale;
            const y = padding.top + chartHeight - d.value * yScale;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#06b6d4"
                stroke="#ffffff"
                strokeWidth="2"
                className="dark:stroke-slate-800"
              />
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const x = padding.left + i * xScale;
            return (
              <text
                key={i}
                x={x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
                className="dark:fill-slate-400"
              >
                {d.day}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default TotalSolutionsProvided;

