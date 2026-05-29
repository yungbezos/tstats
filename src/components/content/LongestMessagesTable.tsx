// src/components/content/LongestMessagesTable.tsx
import React from "react";
import { getSafeMessageLink } from "../../lib/telegram";

export type LongRow = {
  rank: number;
  from: string;
  length: number;
  text: string;
  id?: number;
};
type Props = { rows: LongRow[]; chatSlug?: string };

export default function LongestMessagesTable({ rows, chatSlug }: Props) {
  const msgLink = (id?: number) => getSafeMessageLink(chatSlug, id);

  return (
    <div className="overflow-x-auto -mx-2 md:mx-0">
      <table className="w-full table-fixed border-separate border-spacing-0 text-sm text-slate-200">
        <thead>
          <tr className="text-slate-400">
            <th className="w-10 text-left font-normal px-3 py-2">#</th>
            <th className="w-44 text-left font-normal px-3 py-2">Автор</th>
            <th className="w-24 text-right font-normal px-3 py-2">Длина</th>
            <th className="text-left font-normal px-3 py-2">Текст</th>
            <th className="w-16 text-right font-normal px-3 py-2">Ссылка</th>
          </tr>
          <tr aria-hidden>
            <td colSpan={5} className="p-0">
              <div className="h-px bg-white/5" />
            </td>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <React.Fragment key={`${r.rank}-${r.id ?? i}`}>
              <tr className="hover:bg-white/5 transition">
                <td className="px-3 py-2 align-middle tabular-nums">
                  {r.rank}
                </td>
                <td className="px-3 py-2 align-middle truncate">{r.from}</td>
                <td className="px-3 py-2 align-middle text-right tabular-nums">
                  {r.length.toLocaleString("ru-RU")}
                </td>
                <td className="px-3 py-2 align-middle truncate">
                  {r.text?.trim() ? r.text : "(без текста)"}
                </td>
                <td className="px-3 py-2 align-middle text-right">
                  {msgLink(r.id) ? (
                    <a
                      href={msgLink(r.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="opacity-80 hover:opacity-100 underline decoration-dotted"
                      title="Открыть сообщение"
                    >
                      🔗
                    </a>
                  ) : (
                    <span className="opacity-40">—</span>
                  )}
                </td>
              </tr>

              {i < rows.length - 1 && (
                <tr aria-hidden>
                  <td colSpan={5} className="p-0">
                    <div className="h-px bg-white/5" />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
