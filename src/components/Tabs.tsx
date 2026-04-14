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
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-full border transition ${
            value === t.key
              ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-sky-500/35"
              : "bg-[#0a0a15] border-slate-700 text-gray-300 hover:bg-slate-800"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
