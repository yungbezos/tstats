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
    <div className="card relative">
      <div className="flex justify-between items-center mb-3">
        <div className="hdr">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}
