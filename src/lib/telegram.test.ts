import { describe, expect, it } from "vitest";
import { parseMessages } from "./telegram";
import type { RawMessage } from "../types";

describe("parseMessages", () => {
  it("filters out service/channel/invalid messages", () => {
    const input: RawMessage[] = [
      {
        id: 1,
        type: "message",
        from: "Alice",
        from_id: "user1",
        text: "ok",
        date: "2026-01-01T10:00:00Z",
      },
      {
        id: 2,
        type: "message",
        from: "My Channel",
        from_id: "channel1",
        text: "post",
        date: "2026-01-01T10:00:00Z",
      },
      {
        id: 3,
        type: "service",
        from: "Alice",
        from_id: "user1",
        text: "joined",
        date: "2026-01-01T10:00:00Z",
      },
      {
        id: 4,
        type: "message",
        from: "Alice",
        from_id: "user1",
        text: "bad date",
        date: "not-a-date",
      },
    ];

    const parsed = parseMessages(input);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.id).toBe(1);
  });

  it("normalizes custom emoji reactions from array exports", () => {
    const input: RawMessage[] = [
      {
        id: 10,
        type: "message",
        from: "Alice",
        from_id: "user1",
        text: "hello",
        date: "2026-01-01T10:00:00Z",
        reactions: [
          { type: "emoji", emoji: "🔥", count: 2 },
          { type: "custom_emoji", custom_emoji_id: "777", count: 3 },
        ],
      },
    ];

    const parsed = parseMessages(input);
    const reactions = parsed[0]?.reactions as Record<string, number>;
    expect(reactions?.["🔥"]).toBe(2);
    expect(reactions?.["custom:777"]).toBe(3);
    expect(parsed[0]?.total).toBe(5);
  });
});
