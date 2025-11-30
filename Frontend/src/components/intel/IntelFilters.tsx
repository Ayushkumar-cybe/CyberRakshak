import React from "react";

interface Props {
  filters: any;
  setFilters: (f: any) => void;
}

const groups = [
  {
    title: "Severity",
    key: "severity",
    options: ["Critical", "High", "Medium", "Low"],
  },
  {
    title: "Exploit Availability",
    key: "exploit",
    options: ["Exploit Available", "No Known Exploit"],
  },
  {
    title: "MITRE ATT&CK Techniques",
    key: "mitre",
    options: ["Initial Access", "Execution", "Privilege Escalation", "Lateral Movement", "Persistence", "Impact"],
  },
  {
    title: "Threat Actor Type",
    key: "actor",
    options: ["APT", "Ransomware", "Financial", "Hacktivist", "State-sponsored"],
  },
];

const IntelFilters = ({ filters, setFilters }: Props) => {
  
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

export default IntelFilters;