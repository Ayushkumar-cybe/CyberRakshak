import React from "react";

interface Props {
  filters: any;
  setFilters: (f: any) => void;
}

const groups = [
  {
    title: "Time Range",
    key: "time",
    options: ["Last 24 Hours", "Last 7 Days", "Last 30 Days", "Custom"],
  },
  {
    title: "Report Type",
    key: "type",
    options: ["Vulnerability", "Assets", "Threat Intel", "Scan Summary", "Compliance"],
  },
  {
    title: "Status",
    key: "status",
    options: ["Completed", "Pending", "Running", "Failed"],
  },
];

const ReportFilters = ({ filters, setFilters }: Props) => {
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

      {groups.map((group) => (
        <div key={group.key}>
          <p className="font-semibold text-sm mb-2 opacity-80">{group.title}</p>

          <div className="flex flex-wrap gap-3">
            {group.options.map((item) => (
              <button
                key={item}
                onClick={() => toggle(group.key, item)}
                className={`
                  px-3 py-1 rounded-full text-sm transition
                  ${filters[group.key]?.includes(item)
                    ? "bg-blue-600 text-white ring-2 ring-blue-300"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
};

export default ReportFilters;