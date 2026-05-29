import React, { useEffect, useMemo, useState } from "react";
import WeeklyActiveAuthorsChart from "../social/WeeklyActiveAuthorsChart";
import WeeklyNewAuthorsChart from "../social/WeeklyNewAuthorsChart";
import StableAuthorsTable from "../social/StableAuthorsTable";
import ReplyGraph from "../social/ReplyGraph";
import { buildReplyGraph } from "../../lib/stats";
import type { ParsedMessage, Row } from "../../types";
import { pageSlice } from "../../lib/helpers";

export default function SocialTab({
  humans,
  pageSize,
}: {
  humans: ParsedMessage[];
  pageSize: number;
}) {
  const latestNameByUser = useMemo(() => {
    const map = new Map<string, { name: string; iso: string }>();
    for (const m of humans) {
      const uid = m.from_id ?? "";
      if (!uid) continue;
      const prev = map.get(uid);
      if (!prev || m.fullDateISO > prev.iso) {
        map.set(uid, { name: m.from, iso: m.fullDateISO });
      }
    }
    return map;
  }, [humans]);

  const weeklyActiveData = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    humans.forEach((m) => {
      const uid = m.from_id ?? "";
      if (!uid) return;
      const wkDate = m.weekStartISO;
      map[wkDate] = map[wkDate] ?? new Set<string>();
      map[wkDate].add(uid);
    });
    return Object.entries(map)
      .map(([date, set]) => ({ date, value: set.size }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [humans]);

  const weeklyNewData = useMemo(() => {
    const firstWeekByAuthor = new Map<string, string>();
    humans.forEach((m) => {
      const uid = m.from_id ?? "";
      if (!uid) return;
      const wk = m.weekKey;
      const prev = firstWeekByAuthor.get(uid);
      if (!prev || wk < prev) firstWeekByAuthor.set(uid, wk);
    });
    const countByWeek = new Map<string, number>();
    for (const wk of firstWeekByAuthor.values()) {
      countByWeek.set(wk, (countByWeek.get(wk) ?? 0) + 1);
    }
    return Array.from(countByWeek.entries())
      .map(([week, newAuthors]) => ({ week, newAuthors }))
      .sort((a, b) => (a.week > b.week ? 1 : -1));
  }, [humans]);

  const stableAll = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    humans.forEach((m) => {
      const uid = m.from_id ?? "";
      if (!uid) return;
      const wk = m.weekKey;
      map[uid] = map[uid] ?? new Set<string>();
      map[uid].add(wk);
    });
    return Object.entries(map)
      .map(([uid, weeksSet]) => ({
        uid,
        from: latestNameByUser.get(uid)?.name ?? uid,
        weeks: weeksSet.size,
      }))
      .sort((a, b) => b.weeks - a.weeks || a.from.localeCompare(b.from, "ru"));
  }, [humans, latestNameByUser]);

  const [stablePage, setStablePage] = useState(0);
  const stablePageSize = pageSize;
  useEffect(() => {
    setStablePage(0);
  }, [humans, pageSize]);

  const stablePaged: Row[] = useMemo(
    () =>
      pageSlice(stableAll, stablePage, stablePageSize).map(
        (r: { from: string; weeks: number }, i: number) => ({
          rank: stablePage * stablePageSize + i + 1,
          from: r.from,
          weeks: r.weeks,
        }),
      ),
    [stableAll, stablePage, stablePageSize],
  );

  const replyGraph = useMemo(() => buildReplyGraph(humans), [humans]);

  return (
    <div className="space-y-6">
      {/* Оба графика уже с карточками/заголовками внутри компонентов */}
      <WeeklyActiveAuthorsChart data={weeklyActiveData} />
      <WeeklyNewAuthorsChart data={weeklyNewData} />

      {/* Таблица — card здесь */}
      <div className="card relative">
        <div className="flex justify-between items-center mb-3">
          <div className="hdr">📅 Стабильные авторы (пишут каждую неделю)</div>
          {stableAll.length > stablePageSize && (
            <div className="flex gap-2">
              <button
                disabled={stablePage === 0}
                onClick={() => setStablePage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 bg-slate-700 rounded-full hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-500 disabled:opacity-40"
              >
                ←
              </button>
              <button
                disabled={(stablePage + 1) * stablePageSize >= stableAll.length}
                onClick={() =>
                  setStablePage((p) =>
                    (p + 1) * stablePageSize >= stableAll.length ? p : p + 1,
                  )
                }
                className="px-3 py-1 bg-slate-700 rounded-full hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-500 disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </div>
        <StableAuthorsTable rows={stablePaged} />
      </div>

      {/* ReplyGraph — уже карточка */}
      <ReplyGraph data={replyGraph} />
    </div>
  );
}
