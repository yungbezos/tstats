import React, { useEffect, useMemo, useRef, useState } from "react";
import FileDrop from "./components/FileDrop";
import Tabs from "./components/Tabs";

// секции
import ActivityTab from "./components/sections/ActivityTab";
import TopsTab from "./components/sections/TopsTab";
import ContentTab from "./components/sections/ContentTab";
import ReactionsTab from "./components/sections/ReactionsTab";

const SocialTab = React.lazy(() => import("./components/sections/SocialTab"));

import type { ParsedMessage } from "./types";
import {
  DEFAULT_PARSE_OPTIONS,
  type ParseOptions,
} from "./lib/telegram";

type WorkerSuccess = {
  type: "success";
  requestId: number;
  messages: ParsedMessage[];
  sourceCount: number;
  keptCount: number;
  fileName: string;
};

type WorkerError = {
  type: "error";
  requestId: number;
  message: string;
};

export default function App() {
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  const [allMessages, setAllMessages] = useState<ParsedMessage[]>([]);
  const [sourceCount, setSourceCount] = useState(0);
  const [chatFileName, setChatFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState("");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [parseOptions, setParseOptions] =
    useState<ParseOptions>(DEFAULT_PARSE_OPTIONS);

  const [chatSlug, setChatSlug] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");
  const [minReactions, setMinReactions] = useState("");

  useEffect(() => {
    const worker = new Worker(new URL("./workers/parser.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerSuccess | WorkerError>) => {
      const payload = event.data;
      if (!payload || payload.requestId !== requestIdRef.current) {
        return;
      }

      if (payload.type === "success") {
        setAllMessages(payload.messages);
        setSourceCount(payload.sourceCount);
        setChatFileName(payload.fileName);
        setParseError("");
      } else {
        setAllMessages([]);
        setSourceCount(0);
        setChatFileName("");
        setParseError(payload.message || "Не удалось обработать JSON");
      }
      setIsLoading(false);
    };

    worker.onerror = () => {
      setIsLoading(false);
      setParseError("Ошибка воркера при обработке файла");
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const onFile = (file: File) => {
    setSourceFile(file);
  };

  useEffect(() => {
    if (!sourceFile) return;

    const worker = workerRef.current;
    if (!worker) return;

    requestIdRef.current += 1;
    setIsLoading(true);
    setParseError("");
    setChatFileName(sourceFile.name);

    worker.postMessage({
      requestId: requestIdRef.current,
      file: sourceFile,
      fileName: sourceFile.name,
      options: parseOptions,
    });
  }, [parseOptions, sourceFile]);

  const setOption = (key: keyof ParseOptions) => {
    setParseOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const humans = useMemo(() => {
    const query = authorQuery.trim().toLowerCase();
    const minR = Number(minReactions || 0);

    return allMessages.filter((m) => {
      const isoDay = m.fullDateISO.slice(0, 10);
      if (fromDate && isoDay < fromDate) return false;
      if (toDate && isoDay > toDate) return false;
      if (query && !m.from.toLowerCase().includes(query)) return false;
      if (minR > 0 && m.total < minR) return false;
      return true;
    });
  }, [allMessages, authorQuery, fromDate, toDate, minReactions]);

  const summary = useMemo(() => {
    const authors = new Set<string>();
    let reactions = 0;

    for (const m of humans) {
      if (m.from_id) authors.add(m.from_id);
      reactions += m.total;
    }

    return {
      messages: humans.length,
      authors: authors.size,
      reactions,
    };
  }, [humans]);

  const [tab, setTab] = useState<
    "activity" | "tops" | "content" | "reactions" | "social"
  >("activity");

  return (
    <div className="storm-shell min-h-screen text-white">
      <div className="container py-6 space-y-6">
        <header className="flex flex-col gap-2 justify-center items-center text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-sky-200/80">
            Tokyo Night Storm Edition
          </div>
          <h1 className="text-4xl font-bold text-sky-200 drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]">
            TStats
          </h1>
          <div className="text-slate-400 text-sm">
            Локальная аналитика экспорта Telegram без отправки данных на сервер
          </div>
        </header>

        <FileDrop
          onFile={onFile}
          isLoading={isLoading}
          fileName={chatFileName}
          error={parseError}
        />

        {humans.length > 0 && (
          <div className="card">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-4 flex-wrap">
                <div className="hdr">⚙️ Навигация</div>
                <Tabs
                  tabs={[
                    { key: "activity", label: "Активность" },
                    { key: "tops", label: "Топы" },
                    { key: "content", label: "Контент" },
                    { key: "reactions", label: "Реакции" },
                    { key: "social", label: "Соц. динамика" },
                  ]}
                  value={tab}
                  onChange={(k) => setTab(k as any)}
                />
              </div>

              <div>
                <label className="lbl">Чат для ссылок (slug)</label>
                <input
                  value={chatSlug}
                  onChange={(e) => setChatSlug(e.target.value.trim())}
                  placeholder="например: durov"
                  className="input"
                />
              </div>

              <div className="rounded-xl border border-sky-900/70 bg-slate-950/50 px-3 py-3">
                <div className="lbl mb-2">Общие настройки импорта</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 text-sm">
                  <label className="switch-row">
                    <input
                      type="checkbox"
                      checked={parseOptions.includeBots}
                      onChange={() => setOption("includeBots")}
                    />
                    <span>Учитывать ботов</span>
                  </label>
                  <label className="switch-row">
                    <input
                      type="checkbox"
                      checked={parseOptions.includeChannels}
                      onChange={() => setOption("includeChannels")}
                    />
                    <span>Учитывать каналы</span>
                  </label>
                  <label className="switch-row">
                    <input
                      type="checkbox"
                      checked={parseOptions.includeForwarded}
                      onChange={() => setOption("includeForwarded")}
                    />
                    <span>Учитывать пересланные</span>
                  </label>
                  <label className="switch-row">
                    <input
                      type="checkbox"
                      checked={parseOptions.includeServiceMessages}
                      onChange={() => setOption("includeServiceMessages")}
                    />
                    <span>Учитывать сервисные</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <div>
                  <label className="lbl">Дата от</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="lbl">Дата до</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="lbl">Автор (поиск)</label>
                  <input
                    value={authorQuery}
                    onChange={(e) => setAuthorQuery(e.target.value)}
                    placeholder="например: Alice"
                    className="input"
                  />
                </div>
                <div>
                  <label className="lbl">Мин. реакций на сообщение</label>
                  <input
                    value={minReactions}
                    onChange={(e) => setMinReactions(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="0"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-sky-900/60 px-3 py-2 bg-slate-950/40">
                  <div className="text-slate-400">Сообщений (фильтр)</div>
                  <div className="text-lg font-semibold">{summary.messages}</div>
                </div>
                <div className="rounded-lg border border-sky-900/60 px-3 py-2 bg-slate-950/40">
                  <div className="text-slate-400">Уникальных авторов</div>
                  <div className="text-lg font-semibold">{summary.authors}</div>
                </div>
                <div className="rounded-lg border border-sky-900/60 px-3 py-2 bg-slate-950/40">
                  <div className="text-slate-400">Всего реакций</div>
                  <div className="text-lg font-semibold">{summary.reactions}</div>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Источник: {sourceCount} сообщений, после фильтрации: {humans.length}
              </div>
            </div>
          </div>
        )}

        {humans.length > 0 && tab === "activity" && (
          <ActivityTab humans={humans} />
        )}
        {humans.length > 0 && tab === "tops" && (
          <TopsTab humans={humans} chatSlug={chatSlug} />
        )}
        {humans.length > 0 && tab === "content" && (
          <ContentTab humans={humans} chatSlug={chatSlug} />
        )}
        {humans.length > 0 && tab === "reactions" && (
          <ReactionsTab humans={humans} chatSlug={chatSlug} />
        )}
        {humans.length > 0 && tab === "social" && (
          <React.Suspense
            fallback={
              <div className="card text-slate-300">
                Загрузка социального графа...
              </div>
            }
          >
            <SocialTab humans={humans} />
          </React.Suspense>
        )}

        <footer className="text-center text-xs text-gray-500 pt-6">
          Все данные обрабатываются локально в браузере
        </footer>
      </div>
    </div>
  );
}
