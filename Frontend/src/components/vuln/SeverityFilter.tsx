import React from "react";

interface Props {
  selected: string[];
  setSelected: (items: string[]) => void;
}

const severities = [
  { id: "critical", label: "Critical", color: "bg-red-600" },
  { id: "high", label: "High", color: "bg-orange-500" },
  { id: "medium", label: "Medium", color: "bg-yellow-500" },
  { id: "low", label: "Low", color: "bg-blue-500" },
];

const SeverityFilter = ({ selected, setSelected }: Props) => {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {severities.map((sev) => (
        <button
          key={sev.id}
          onClick={() => toggle(sev.id)}
          className={`
            px-4 py-2 rounded-full text-white text-sm font-medium transition
            ${sev.color}
            ${selected.includes(sev.id) ? "ring-4 ring-slate-300 dark:ring-slate-700" : "opacity-70"}
          `}
        >
          {sev.label}
        </button>
      ))}
    </div>
  );
};

export default SeverityFilter;