import React from "react";

type Row = {
  from: string;
  length: number;
  text: string;
  id?: number;
};

export default function LongestMessagesCard({
  rows,
  chatSlug,
}: {
  rows: Row[];
  chatSlug?: string;
}) {
  const linkOf = (id?: number) => {
    if (id == null || !chatSlug) return undefined;
    if (/^(javascript|data|vbscript):/i.test(chatSlug)) return undefined;
    return `https://t.me/${chatSlug}/${id}`;
  };

  return (
    <div className="card relative">
      <div className="hdr mb-3">📜 Самые длинные сообщения</div>

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
              <React.Fragment key={`${r.from}-${r.id ?? i}`}>
                <tr className="hover:bg-white/5 transition">
                  <td className="px-3 py-2 tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2 truncate">{r.from}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.length.toLocaleString("ru-RU")}
                  </td>
                  <td className="px-3 py-2 truncate">
                    {r.text?.trim() || "(без текста)"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {linkOf(r.id) ? (
                      <a
                        href={linkOf(r.id)}
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
    </div>
  );
}
