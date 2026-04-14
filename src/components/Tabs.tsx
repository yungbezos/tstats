import React from "react";

interface Tab {
  key: string;
  label: string;
}

export default function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Tab[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-sky-900/40 bg-slate-950/35 p-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-lg border text-sm transition ${
            value === t.key
              ? "bg-cyan-600/90 border-cyan-400 text-white shadow-lg shadow-sky-500/35"
              : "bg-slate-950/55 border-slate-700 text-slate-300 hover:bg-slate-800/80 hover:border-sky-700"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
