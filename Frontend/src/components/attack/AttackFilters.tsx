import React from "react";

interface Props {
  filters: any;
  setFilters: (f: any) => void;
}

const groups = [
  {
    title: "Node Type",
    key: "type",
    options: ["Internet", "Web Server", "Application Server", "Database", "Workstation", "Domain Controller"],
  },
  {
    title: "Severity",
    key: "severity",
    options: ["Critical", "High", "Medium", "Low"],
  },
  {
    title: "Exposure",
    key: "exposure",
    options: ["Internet-facing", "Internal"],
  },
];

const AttackFilters = ({ filters, setFilters }: Props) => {
  
  const toggle = (group: string, value: string) => {
    const current = filters[group] || [];
    const exists = current.includes(value);

    if (exists) {
      setFilters({
        ...filters,
        [group]: current.filter((v: string) => v !== value),
      });
    } else {
      setFilters({
        ...filters,
        [group]: [...current, value],
      });
    }
  };

  return (
    <div className="space-y-6">

      {groups.map((g) => (
        <div key={g.key}>
          <p className="font-semibold text-sm mb-2 opacity-80">{g.title}</p>

          <div className="flex flex-wrap gap-3">
            {g.options.map((opt) => (
              <button
                key={opt}
                onClick={() => toggle(g.key, opt)}
                className={`
                  px-3 py-1 rounded-full text-sm transition
                  ${filters[g.key]?.includes(opt)
                    ? "bg-blue-600 text-white ring-2 ring-blue-300"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
};

export default AttackFilters;