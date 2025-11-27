import React from "react";

const ContextPanel = ({ context }: any) => {
  if (!context) {
    return (
      <div className="opacity-60 text-sm">
        No context selected. Ask something like:
        <br />
        <strong>“Explain CVE-2025-12432”</strong>
        <br />
        <strong>“Generate attack path for the web server”</strong>
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-all duration-300 animate-fade-up">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">{context.title}</h2>
        <p className="opacity-70 text-sm">{context.subtitle}</p>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {context.sections?.map((sec: any, i: number) => (
          <div key={i} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
            <p className="font-semibold text-sm">{sec.heading}</p>
            <p className="text-sm opacity-70 mt-1">{sec.body}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ContextPanel;