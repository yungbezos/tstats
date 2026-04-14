import { parseMessages, type ParseOptions } from "../lib/telegram";
import type { RawMessage, TelegramExport } from "../types";

type WorkerRequest = {
  requestId: number;
  file: File;
  fileName: string;
  options: ParseOptions;
};

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: unknown) => void;
};

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { requestId, file, fileName, options } = event.data;

  try {
    const rawText = await file.text();
    const json = JSON.parse(rawText) as TelegramExport;
    const sourceMessages: RawMessage[] = Array.isArray(json?.messages)
      ? json.messages
      : [];

    const messages = parseMessages(sourceMessages, options);

    ctx.postMessage({
      type: "success",
      requestId,
      messages,
      sourceCount: sourceMessages.length,
      keptCount: messages.length,
      fileName,
    });
  } catch {
    ctx.postMessage({
      type: "error",
      requestId,
      message:
        "Неверный JSON или неподдерживаемый формат экспорта. Нужен result.json из Telegram Desktop.",
    });
  }
};

export {};
