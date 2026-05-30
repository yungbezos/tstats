import React, { useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  isLoading?: boolean;
  fileName?: string;
  error?: string;
}

export default function FileDrop({
  onFile,
  isLoading = false,
  fileName,
  error,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const submitFile = (file?: File) => {
    if (!file) return;
    onFile(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    submitFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    submitFile(file);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload JSON file"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
      className={`card border-2 border-dashed text-center py-10 cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
        isDragging
          ? "border-sky-400 bg-slate-800/80 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          : "border-sky-500/50 bg-slate-950/45 hover:bg-slate-900/70"
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={onChange}
      />
      <p className="hdr">
        {isLoading ? "⏳ Обработка файла..." : "📂 Перетащи сюда result.json"}
      </p>
      <p className="lbl">
        {isLoading
          ? "это может занять до нескольких секунд"
          : "или кликни чтобы выбрать файл"}
      </p>
      {fileName ? <p className="lbl mt-2">Текущий файл: {fileName}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
