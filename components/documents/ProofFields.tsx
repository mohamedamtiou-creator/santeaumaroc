"use client";

import { UploadZone, type UploadZoneFile, type UploadZoneLabels } from "./UploadZone";

export type ProofLabels = {
  cinTitle:         string; // "Pièce d'identité nationale (CIN)"
  required:         string; // "obligatoire"
  justifTitle:      string; // "Justificatif médical"
  eitherOr:         string; // "l'un OU l'autre"
  optionA:          string; // "Option A — Diplôme de médecine"
  optionAOptional:  string; // "(facultatif si n° Ordre renseigné)"
  orSep:            string; // "OU"
  optionB:          string; // "Option B — Numéro d'inscription…"
  ordrePlaceholder: string;
  ordreHint:        string;
  messageLabel:     string;
  messagePlaceholder: string;
  reassurance:      string;
  upload:           UploadZoneLabels;
};

type Slot = {
  file:      UploadZoneFile | null;
  onPick:    (file: File) => void;
  onRemove:  () => void;
  uploading?: boolean;
};

type Props = {
  idPrefix:  string; // namespace les id (cin/diplome/ordre/message)
  cin:       Slot;
  diplome:   Slot;
  ordre:     string;
  onOrdreChange:   (value: string) => void;
  message:   string;
  onMessageChange: (value: string) => void;
  labels:    ProofLabels;
  cinInvalid?: boolean;
};

/**
 * Bloc de collecte des justificatifs (CIN + diplôme OU n° Ordre + message),
 * partagé par le tunnel de revendication et la vérification du tableau de bord.
 * Présentationnel : le parent gère le stockage des fichiers (state vs upload).
 */
export function ProofFields({
  idPrefix, cin, diplome, ordre, onOrdreChange, message, onMessageChange, labels, cinInvalid,
}: Props) {
  const diplomeOptional = !!ordre.trim() && !diplome.file;

  return (
    <div className="flex flex-col gap-5">
      {/* 1 — CIN */}
      <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
        <legend className="flex items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <span className="font-semibold text-slate-800 text-sm">
            {labels.cinTitle} <span className="text-red-500 font-normal">· {labels.required}</span>
          </span>
        </legend>
        <UploadZone
          id={`${idPrefix}-cin`}
          file={cin.file}
          onPick={cin.onPick}
          onRemove={cin.onRemove}
          uploading={cin.uploading}
          invalid={cinInvalid && !cin.file}
          labels={labels.upload}
        />
      </fieldset>

      {/* 2 — Justificatif médical */}
      <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
        <legend className="flex items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <span className="font-semibold text-slate-800 text-sm">
            {labels.justifTitle} <span className="text-red-500 font-normal">· {labels.eitherOr}</span>
          </span>
        </legend>

        <div className={`rounded-xl border p-4 ${diplome.file ? "border-secondary-200 bg-secondary-50/30" : "border-slate-200 bg-white"}`}>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
            {labels.optionA}
            {diplomeOptional && (
              <span className="ms-2 text-slate-500 font-normal normal-case tracking-normal">{labels.optionAOptional}</span>
            )}
          </p>
          <UploadZone
            id={`${idPrefix}-diplome`}
            file={diplome.file}
            onPick={diplome.onPick}
            onRemove={diplome.onRemove}
            uploading={diplome.uploading}
            labels={labels.upload}
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex-1 h-px bg-slate-200" /><span className="font-semibold">{labels.orSep}</span><div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className={`rounded-xl border p-4 ${ordre.trim() ? "border-secondary-200 bg-secondary-50/30" : "border-slate-200 bg-white"}`}>
          <label htmlFor={`${idPrefix}-ordre`} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
            {labels.optionB}
          </label>
          <input
            id={`${idPrefix}-ordre`}
            type="text"
            inputMode="numeric"
            value={ordre}
            maxLength={20}
            onChange={(e) => onOrdreChange(e.target.value)}
            placeholder={labels.ordrePlaceholder}
            className="input-field text-sm"
          />
          <p className="text-xs text-slate-500 mt-1.5">{labels.ordreHint}</p>
        </div>
      </fieldset>

      {/* 3 — Message */}
      <div>
        <label htmlFor={`${idPrefix}-msg`} className="block text-sm font-medium text-slate-700 mb-1.5">
          {labels.messageLabel}
        </label>
        <textarea
          id={`${idPrefix}-msg`}
          value={message}
          rows={2}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={labels.messagePlaceholder}
          className="input-field resize-none"
        />
      </div>

      {/* Réassurance données */}
      <div className="flex items-start gap-3 bg-secondary-50/60 border border-secondary-200 rounded-xl px-4 py-3 text-xs text-secondary-800 leading-relaxed">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"
          className="w-5 h-5 shrink-0 mt-px text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2L4 4.5v5C4 13.2 6.8 16.8 10 18c3.2-1.2 6-4.8 6-8.5v-5L10 2z" /><path d="m7.5 10 2 2 3-3.5" />
        </svg>
        <span>{labels.reassurance}</span>
      </div>
    </div>
  );
}
