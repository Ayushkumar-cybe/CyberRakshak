import React from "react";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Props {
  stats: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
  };
}

const ReportSummaryCards = ({ stats }: Props) => {
  const cards = [
    {
      title: "Total Reports",
      value: stats?.total || 0,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Completed",
      value: stats?.completed || 0,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Pending / Running",
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Failed / Partial",
      value: stats?.failed || 0,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

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
