import { describe, expect, it } from "vitest";
import { buildTopMessages, buildWeeklyTrend } from "./stats";
import type { ParsedMessage } from "../types";

function message(overrides: Partial<ParsedMessage>): ParsedMessage {
  return {
    id: 1,
    from: "Alice",
    from_id: "user1",
    text: "hello",
    date: "2026-01-01T10:00:00Z",
    reactions: { "👍": 1 },
    fullDateISO: "2026-01-01T10:00:00.000Z",
    total: 1,
    weekDateISO: "2025-12-29",
    weekKeyISO: "2026-W01",
    ...overrides,
  };
}

describe("stats", () => {
  it("does not mutate source array in buildTopMessages", () => {
    const input = [
      message({ id: 1, total: 1 }),
      message({ id: 2, total: 10 }),
      message({ id: 3, total: 5 }),
    ];
    const orderBefore = input.map((m) => m.id);

    const top = buildTopMessages(input, 2);

    expect(top).toHaveLength(2);
    expect(top[0].reactions).toBe(10);
    expect(input.map((m) => m.id)).toEqual(orderBefore);
  });

  it("builds ISO weekly trend keys", () => {
    const input = [
      message({ id: 1, fullDateISO: "2025-12-29T09:00:00.000Z" }),
      message({ id: 2, fullDateISO: "2026-01-02T09:00:00.000Z" }),
      message({ id: 3, fullDateISO: "2026-01-09T09:00:00.000Z" }),
    ];

    const trend = buildWeeklyTrend(input);

    expect(trend[0]?.week).toBe("2026-W01");
    expect(trend[0]?.count).toBe(2);
    expect(trend[1]?.week).toBe("2026-W02");
    expect(trend[1]?.count).toBe(1);
  });
});
