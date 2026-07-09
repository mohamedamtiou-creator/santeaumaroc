"use client";

import { useRef } from "react";

export type UploadZoneFile = { name: string; size: number; isPdf: boolean };

export type UploadZoneLabels = {
  drag:       string; // "Glissez ou"
  browse:     string; // "cliquez pour choisir"
  hint:       string; // "JPG, PNG ou PDF · max 5 Mo"
  removeAria: string; // "Supprimer"
  uploading:  string; // "Envoi en cours…"
  ko:         string; // "Ko"
};

type Props = {
  id:        string;
  file:      UploadZoneFile | null;
  onPick:    (file: File) => void;
  onRemove:  () => void;
  uploading?: boolean;
  invalid?:   boolean;
  labels:     UploadZoneLabels;
};

/**
 * Zone de dépôt accessible (bouton natif : navigable au clavier, focus visible).
 * Partagée par le tunnel de revendication et la vérification du tableau de bord.
 */
export function UploadZone({ id, file, onPick, onRemove, uploading, invalid, labels }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = `${id}-hint`;

  if (file) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-secondary-200 bg-secondary-50/50">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${file.isPdf ? "bg-red-50" : "bg-primary-50"}`}>
          {file.isPdf
            ? <span className="text-[10px] font-bold text-red-500">PDF</span>
            : <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="14" height="14" rx="2" /><path d="M7 8h6M7 11h4" />
              </svg>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
          <p className="text-xs text-slate-500">{Math.round(file.size / 1024)} {labels.ko}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 grid place-items-center w-11 h-11 -me-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          aria-label={`${labels.removeAria} : ${file.name}`}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onPick(f); }}
        aria-describedby={hintId}
        aria-busy={uploading || undefined}
        disabled={uploading}
        className={`w-full flex flex-col items-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 text-center transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
          ${invalid
            ? "border-red-300 bg-red-50/40 hover:border-red-400"
            : "border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/40"}`}
      >
        {uploading ? (
          <span className="flex items-center gap-2 text-sm text-slate-500 py-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
            {labels.uploading}
          </span>
        ) : (
          <>
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-8 h-8 text-slate-300" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 24h20M16 8v12M10 14l6-6 6 6" />
            </svg>
            <span className="text-sm text-slate-600">
              {labels.drag} <span className="text-primary-600 font-semibold">{labels.browse}</span>
            </span>
            <span id={hintId} className="text-xs text-slate-500">{labels.hint}</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }}
      />
    </>
  );
}
