import React from "react";
import { FileText, Clock, CheckCircle2, CalendarClock } from "lucide-react";

const cards = [
  {
    title: "Total Reports",
    value: 42,
    icon: FileText,
    color: "text-blue-600",
  },
  {
    title: "Completed",
    value: 29,
    icon: CheckCircle2,
    color: "text-green-600",
  },
  {
    title: "Pending",
    value: 8,
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    title: "Scheduled",
    value: 5,
    icon: CalendarClock,
    color: "text-purple-600",
  },
];

const ReportSummaryCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 transition hover:shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">{c.title}</p>
            <c.icon className={`w-5 h-5 ${c.color}`} />
          </div>

          <h3 className="text-2xl font-bold">{c.value}</h3>
        </div>
      ))}
    </div>
  );
};

export default ReportSummaryCards;