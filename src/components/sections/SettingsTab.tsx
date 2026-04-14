import React from "react";
import type { ParseOptions } from "../../lib/telegram";

type DisplaySettings = {
  tablePageSize: number;
  topDaysLimit: number;
  longestMessagesLimit: number;
  showMessageLinks: boolean;
};

type Props = {
  chatSlug: string;
  setChatSlug: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  authorQuery: string;
  setAuthorQuery: (value: string) => void;
  minReactions: string;
  setMinReactions: (value: string) => void;
  parseOptions: ParseOptions;
  toggleParseOption: (key: keyof ParseOptions) => void;
  displaySettings: DisplaySettings;
  setDisplaySettings: React.Dispatch<React.SetStateAction<DisplaySettings>>;
  sourceCount: number;
  filteredCount: number;
  uniqueAuthors: number;
  totalReactions: number;
  onResetFilters: () => void;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const TOP_LIMIT_OPTIONS = [5, 10, 15, 20];

export default function SettingsTab({
  chatSlug,
  setChatSlug,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  authorQuery,
  setAuthorQuery,
  minReactions,
  setMinReactions,
  parseOptions,
  toggleParseOption,
  displaySettings,
  setDisplaySettings,
  sourceCount,
  filteredCount,
  uniqueAuthors,
  totalReactions,
  onResetFilters,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="hdr">⚙️ Настройки аналитики</div>
          <button className="chip-btn" onClick={onResetFilters}>
            Сбросить фильтры
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
          <label className="switch-row">
            <input
              type="checkbox"
              checked={parseOptions.includeBots}
              onChange={() => toggleParseOption("includeBots")}
            />
            <span>Учитывать ботов</span>
          </label>
          <label className="switch-row">
            <input
              type="checkbox"
              checked={parseOptions.includeChannels}
              onChange={() => toggleParseOption("includeChannels")}
            />
            <span>Учитывать каналы</span>
          </label>
          <label className="switch-row">
            <input
              type="checkbox"
              checked={parseOptions.includeForwarded}
              onChange={() => toggleParseOption("includeForwarded")}
            />
            <span>Учитывать пересланные</span>
          </label>
          <label className="switch-row">
            <input
              type="checkbox"
              checked={parseOptions.includeServiceMessages}
              onChange={() => toggleParseOption("includeServiceMessages")}
            />
            <span>Учитывать сервисные</span>
          </label>
        </div>
      </div>

      <div className="card">
        <div className="hdr mb-4">🔎 Фильтры данных</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div>
            <label className="lbl">Чат для ссылок (slug)</label>
            <input
              value={chatSlug}
              onChange={(e) => setChatSlug(e.target.value.trim())}
              placeholder="например: durov"
              className="input"
            />
          </div>
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
      </div>

      <div className="card">
        <div className="hdr mb-4">🎛️ Внешний вид и лимиты</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div>
            <label className="lbl">Строк на страницу</label>
            <select
              value={displaySettings.tablePageSize}
              onChange={(e) =>
                setDisplaySettings((prev) => ({
                  ...prev,
                  tablePageSize: Number(e.target.value),
                }))
              }
              className="input"
            >
              {PAGE_SIZE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="lbl">Топ дней (Активность)</label>
            <select
              value={displaySettings.topDaysLimit}
              onChange={(e) =>
                setDisplaySettings((prev) => ({
                  ...prev,
                  topDaysLimit: Number(e.target.value),
                }))
              }
              className="input"
            >
              {TOP_LIMIT_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="lbl">Длинные сообщения</label>
            <select
              value={displaySettings.longestMessagesLimit}
              onChange={(e) =>
                setDisplaySettings((prev) => ({
                  ...prev,
                  longestMessagesLimit: Number(e.target.value),
                }))
              }
              className="input"
            >
              {TOP_LIMIT_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <label className="switch-row mt-6 md:mt-0">
            <input
              type="checkbox"
              checked={displaySettings.showMessageLinks}
              onChange={() =>
                setDisplaySettings((prev) => ({
                  ...prev,
                  showMessageLinks: !prev.showMessageLinks,
                }))
              }
            />
            <span>Показывать ссылки на сообщения</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
        <div className="stat-card">
          <div className="text-slate-400">Источник</div>
          <div className="text-lg font-semibold">{sourceCount}</div>
        </div>
        <div className="stat-card">
          <div className="text-slate-400">После фильтров</div>
          <div className="text-lg font-semibold">{filteredCount}</div>
        </div>
        <div className="stat-card">
          <div className="text-slate-400">Уникальных авторов</div>
          <div className="text-lg font-semibold">{uniqueAuthors}</div>
        </div>
        <div className="stat-card">
          <div className="text-slate-400">Всего реакций</div>
          <div className="text-lg font-semibold">{totalReactions}</div>
        </div>
      </div>
    </div>
  );
}
