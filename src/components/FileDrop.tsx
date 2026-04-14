import React, { useRef } from "react";

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

  const submitFile = (file?: File) => {
    if (!file) return;
    onFile(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    submitFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    submitFile(file);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="card border-2 border-dashed border-sky-500/50 bg-slate-950/45 text-center py-10 cursor-pointer hover:bg-slate-900/70 transition"
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
