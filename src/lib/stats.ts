import { ParsedMessage, Row, Node, Link } from "../types";
import { weekKey } from "./helpers";

/**
 * NOTE: All functions in this module expect an array of *already filtered* messages.
 * The caller (App.tsx) is responsible for filtering out bots/channels via `isHumanAuthor`.
 */

/* ======================= tops ======================= */

export function buildTopAuthors(messages: ParsedMessage[], limit = 10): Row[] {
  const countsByUser: Record<string, number> = {};
  const latestNameByUser: Record<string, { name: string; iso: string }> = {};

  for (const m of messages) {
    const uid = m.from_id!;
    countsByUser[uid] = (countsByUser[uid] ?? 0) + 1;
    const rec = latestNameByUser[uid];
    if (!rec || m.fullDateISO > rec.iso) {
      latestNameByUser[uid] = { name: m.from, iso: m.fullDateISO };
    }
  }

  return Object.entries(countsByUser)
    .map(([uid, count]) => ({
      uid,
      from: latestNameByUser[uid]?.name || "",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((e, idx) => ({ rank: idx + 1, from: e.from, count: e.count }));
}

export function buildTopMessages(messages: ParsedMessage[], limit = 10): Row[] {
  const rows = [...messages]
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map((m, idx) => ({
      rank: idx + 1,
      from: m.from,
      text: m.text || "(без текста)",
      reactions: m.total,
    }));
  return rows;
}

export function buildTopAuthorsByReactions(
  messages: ParsedMessage[],
  limit = 20,
): Row[] {
  const sumByUser: Record<string, number> = {};
  const latestNameByUser: Record<string, { name: string; iso: string }> = {};

  for (const m of messages) {
    const uid = m.from_id!;
    sumByUser[uid] = (sumByUser[uid] ?? 0) + m.total;
    const rec = latestNameByUser[uid];
    if (!rec || m.fullDateISO > rec.iso) {
      latestNameByUser[uid] = { name: m.from, iso: m.fullDateISO };
    }
  }

  return Object.entries(sumByUser)
    .map(([uid, total]) => ({
      uid,
      from: latestNameByUser[uid]?.name || "",
      reactions: total,
    }))
    .sort((a, b) => b.reactions - a.reactions)
    .slice(0, limit)
    .map((e, idx) => ({ rank: idx + 1, from: e.from, reactions: e.reactions }));
}

/* ======================= activity ======================= */

export function buildHourWeekdayHeatmap(messages: ParsedMessage[]) {
  const matrix = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  const weekdayCache = new Map<string, number>();

  for (const m of messages) {
    const datePart = m.fullDateISO.slice(0, 10);
    let weekday = weekdayCache.get(datePart);
    if (weekday === undefined) {
      weekday = (new Date(datePart).getUTCDay() + 6) % 7; // 0=Mon … 6=Sun
      weekdayCache.set(datePart, weekday);
    }
    if (weekday < 0 || weekday > 6) continue;

    const hour =
      typeof m.date === "string" && m.date.length >= 13
        ? parseInt(m.date.slice(11, 13), 10)
        : new Date(m.fullDateISO).getHours();

    if (Number.isNaN(hour) || hour < 0 || hour > 23) continue;
    matrix[weekday][hour] += 1;
  }

  const heat: { weekday: number; hour: number; count: number }[] = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    for (let hour = 0; hour < 24; hour++) {
      const count = matrix[weekday][hour];
      if (count > 0) heat.push({ weekday, hour, count });
    }
  }

  return heat;
}

export function buildDailyChart(messages: ParsedMessage[]) {
  const counts: Record<string, number> = {};
  for (const m of messages) {
    const date = m.fullDateISO.slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}

export function buildWeeklyTrend(messages: ParsedMessage[]) {
  const counts = new Map<string, number>();
  const cache = new Map<string, string>();
  for (const m of messages) {
    const datePart = m.fullDateISO.slice(0, 10);
    let key = cache.get(datePart);
    if (!key) {
      key = weekKey(new Date(datePart));
      cache.set(datePart, key);
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => (a.week > b.week ? 1 : -1));
}

/* ======================= reply graph ======================= */

export function buildReplyGraph(messages: ParsedMessage[]): {
  nodes: Node[];
  links: Link[];
} {
  const byId = new Map<number, ParsedMessage>();
  const latestNameByUser = new Map<string, { name: string; iso: string }>();
  for (const m of messages) {
    byId.set(m.id, m);
    const uid = m.from_id!;
    const rec = latestNameByUser.get(uid);
    if (!rec || m.fullDateISO > rec.iso) {
      latestNameByUser.set(uid, { name: m.from, iso: m.fullDateISO });
    }
  }

  const nodeSeen = new Set<string>();
  const nodes: Node[] = [];
  const linkWeights = new Map<string, number>();

  for (const m of messages) {
    const src = m.from_id!;
    if (!nodeSeen.has(src)) {
      nodes.push({ id: src, name: latestNameByUser.get(src)?.name || "" });
      nodeSeen.add(src);
    }

    const replyTo = m.reply_to_message_id;
    if (!replyTo) continue;

    const target = byId.get(replyTo);
    if (!target) continue;
    const dst = target.from_id!;
    if (src === dst) continue;

    const key = `${src}→${dst}`;
    linkWeights.set(key, (linkWeights.get(key) ?? 0) + 1);
  }

  const links: Link[] = Array.from(linkWeights.entries()).map(([k, value]) => {
    const [source, target] = k.split("→");
    return { source, target, value };
  });

  return { nodes, links };
}
