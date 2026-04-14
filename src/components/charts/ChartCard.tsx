// src/components/charts/ChartCard.tsx
import React from "react";

export default function ChartCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card relative bg-gradient-to-br from-[#11203f]/80 to-[#0a142b]/90 shadow-lg shadow-sky-500/20">
      <div className="flex justify-between items-center mb-3">
        <div className="hdr">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}
