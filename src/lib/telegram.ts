// src/lib/telegram.ts
import { ParsedMessage, RawMessage } from "../types";
import { weekKey } from "./helpers";

/* ======================= helpers ======================= */

const BOT_SUFFIXES = ["bot", "бот"];

export type ParseOptions = {
  includeBots: boolean;
  includeChannels: boolean;
  includeForwarded: boolean;
  includeServiceMessages: boolean;
};

export const DEFAULT_PARSE_OPTIONS: ParseOptions = {
  includeBots: false,
  includeChannels: false,
  includeForwarded: false,
  includeServiceMessages: false,
};

function looksLikeBot(name?: string): boolean {
  if (!name) return false;
  const s = String(name).trim().toLowerCase();
  return BOT_SUFFIXES.some((suf) => s.endsWith(suf));
}

function isUserId(id?: string): boolean {
  return !!id && id.startsWith("user");
}

function isForwarded(raw: RawMessage): boolean {
  return !!(raw?.forwarded_from || raw?.saved_from);
}

function isService(raw: RawMessage): boolean {
  return raw?.type !== "message";
}

function normalizeText(text: unknown): string {
  if (typeof text === "string") return text.trim();
  if (Array.isArray(text)) {
    return text
      .map((t) => (typeof t === "string" ? t : ((t as { text?: string })?.text ?? "")))
      .join("")
      .trim();
  }
  return "";
}

function normalizeReactions(raw: RawMessage): Record<string, number> {
  const r = raw?.reactions;
  if (!r) return {};
  if (Array.isArray(r)) {
    const acc: Record<string, number> = {};
    for (const item of r) {
      const customId = String(
        item?.custom_emoji_id ?? item?.document_id ?? "",
      ).trim();
      const e =
        typeof item?.emoji === "string" && item.emoji.length
          ? item.emoji
          : customId
            ? `custom:${customId}`
            : "";
      const c = Number(item?.count ?? 0);
      if (e) acc[e] = (acc[e] ?? 0) + c;
    }
    return acc;
  }
  if (typeof r === "object") return { ...(r as Record<string, number>) };
  return {};
}

/** Глобальный предикат допуска сообщения (по raw) */
function allowRawMessage(raw: RawMessage, options: ParseOptions): boolean {
  if (!options.includeServiceMessages && isService(raw)) return false;
  if (!options.includeForwarded && isForwarded(raw)) return false;
  const fromId: string | undefined = raw?.from_id;
  const fromName: string | undefined = raw?.from;

  if (!fromId) return false;
  if (!options.includeChannels && !isUserId(fromId)) return false;
  if (!options.includeBots && looksLikeBot(fromName)) return false;

  return true;
}

/* ======================= core ======================= */

export function parseMessages(
  messages: RawMessage[],
  options: ParseOptions = DEFAULT_PARSE_OPTIONS,
): ParsedMessage[] {
  const latestNameByUser: Record<string, { name: string; iso: string }> = {};
  const parsed: ParsedMessage[] = [];

  for (const m of messages) {
    if (!allowRawMessage(m, options)) continue;

    const text = normalizeText(m.text);
    const reactions = normalizeReactions(m);
    const date = new Date(m.date);
    if (Number.isNaN(date.getTime())) continue;
    const fullDateISO = date.toISOString();
    const total = Object.values(reactions).reduce((a, b) => a + b, 0);
    const week = weekKey(date);

    const pm: ParsedMessage = {
      id: Number(m.id),
      from: typeof m.from === "string" ? m.from : "",
      from_id: m.from_id,
      text,
      date: m.date,
      reactions,
      reply_to_message_id: m.reply_to_message_id,
      media_type: m.media_type,
      fullDateISO,
      total,
      week,
    };

    const uid = pm.from_id!;
    const rec = latestNameByUser[uid];
    if (!rec || fullDateISO > rec.iso) {
      latestNameByUser[uid] = { name: pm.from, iso: fullDateISO };
    }

    parsed.push(pm);
  }

  for (const msg of parsed) {
    const uid = msg.from_id!;
    const rec = latestNameByUser[uid];
    if (rec && rec.name && msg.from !== rec.name) {
      msg.from = rec.name;
    }
  }

  return parsed;
}

/** Проверка уже на ParsedMessage, лишнее не пройдёт после parseMessages */
export function isHumanAuthor(m: ParsedMessage): boolean {
  if (!isUserId(m.from_id)) return false;
  if (looksLikeBot(m.from)) return false;
  return true;
}
