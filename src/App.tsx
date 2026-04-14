import React, { useEffect, useMemo, useRef, useState } from "react";
import FileDrop from "./components/FileDrop";
import Tabs from "./components/Tabs";

// секции
import ActivityTab from "./components/sections/ActivityTab";
import TopsTab from "./components/sections/TopsTab";
import ContentTab from "./components/sections/ContentTab";
import ReactionsTab from "./components/sections/ReactionsTab";
import SettingsTab from "./components/sections/SettingsTab";

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

type TabKey = "settings" | "activity" | "tops" | "content" | "reactions" | "social";

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
  const [displaySettings, setDisplaySettings] = useState({
    tablePageSize: 10,
    topDaysLimit: 10,
    longestMessagesLimit: 10,
    showMessageLinks: true,
  });

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

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setAuthorQuery("");
    setMinReactions("");
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

  const [tab, setTab] = useState<TabKey>("settings");

  const hasSource = sourceCount > 0 || !!sourceFile;

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

        {hasSource && (
          <div className="card">
            <div className="flex justify-between gap-4 flex-wrap items-center">
              <div className="hdr">🧭 Разделы</div>
              <Tabs
                tabs={[
                  { key: "settings", label: "Настройки" },
                  { key: "activity", label: "Активность" },
                  { key: "tops", label: "Топы" },
                  { key: "content", label: "Контент" },
                  { key: "reactions", label: "Реакции" },
                  { key: "social", label: "Соц. динамика" },
                ]}
                value={tab}
                onChange={(k) => setTab(k as TabKey)}
              />
            </div>
          </div>
        )}

        {hasSource && tab === "settings" && (
          <SettingsTab
            chatSlug={chatSlug}
            setChatSlug={setChatSlug}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            authorQuery={authorQuery}
            setAuthorQuery={setAuthorQuery}
            minReactions={minReactions}
            setMinReactions={setMinReactions}
            parseOptions={parseOptions}
            toggleParseOption={setOption}
            displaySettings={displaySettings}
            setDisplaySettings={setDisplaySettings}
            sourceCount={sourceCount}
            filteredCount={summary.messages}
            uniqueAuthors={summary.authors}
            totalReactions={summary.reactions}
            onResetFilters={resetFilters}
          />
        )}

        {hasSource && tab !== "settings" && humans.length === 0 && (
          <div className="card text-slate-300">
            По текущим фильтрам нет данных. Открой вкладку "Настройки" и ослабь фильтры.
          </div>
        )}

        {humans.length > 0 && tab === "activity" && (
          <ActivityTab humans={humans} topDaysLimit={displaySettings.topDaysLimit} />
        )}
        {humans.length > 0 && tab === "tops" && (
          <TopsTab
            humans={humans}
            chatSlug={chatSlug}
            pageSize={displaySettings.tablePageSize}
            showMessageLinks={displaySettings.showMessageLinks}
          />
        )}
        {humans.length > 0 && tab === "content" && (
          <ContentTab
            humans={humans}
            chatSlug={chatSlug}
            tablePageSize={displaySettings.tablePageSize}
            longestLimit={displaySettings.longestMessagesLimit}
            showMessageLinks={displaySettings.showMessageLinks}
          />
        )}
        {humans.length > 0 && tab === "reactions" && (
          <ReactionsTab
            humans={humans}
            chatSlug={chatSlug}
            pageSize={displaySettings.tablePageSize}
            showMessageLinks={displaySettings.showMessageLinks}
          />
        )}
        {humans.length > 0 && tab === "social" && (
          <React.Suspense
            fallback={
              <div className="card text-slate-300">
                Загрузка социального графа...
              </div>
            }
          >
            <SocialTab humans={humans} pageSize={displaySettings.tablePageSize} />
          </React.Suspense>
        )}

        <footer className="text-center text-xs text-gray-500 pt-6">
          Все данные обрабатываются локально в браузере
        </footer>
      </div>
    </div>
  );
}
