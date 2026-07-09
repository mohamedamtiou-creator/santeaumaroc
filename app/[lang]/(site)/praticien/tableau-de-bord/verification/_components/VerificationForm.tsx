"use client";

import { useState, useTransition } from "react";
import { submitVerificationRequest } from "@/features/praticien/verification-actions";
import type { Dictionary } from "@/lib/i18n";
import { ProofFields, type ProofLabels } from "@/components/documents/ProofFields";

type PraticienT = Dictionary["dashboard"]["praticien"];
type DocCategory = "cin" | "diplome";
type Doc = { url: string; name: string; size: number; type: string; category: DocCategory };

function proofLabels(t: PraticienT): ProofLabels {
  return {
    cinTitle:        t.docStep1,
    required:        t.required,
    justifTitle:     t.docStep2,
    eitherOr:        t.eitherOr,
    optionA:         t.optionA,
    optionAOptional: t.optionAOptional,
    orSep:           t.orSep,
    optionB:         t.optionB,
    ordrePlaceholder: t.ordrePlaceholder,
    ordreHint:       t.ordreHint,
    messageLabel:    t.messageLabel,
    messagePlaceholder: t.messagePlaceholder,
    reassurance:     t.docReassurance,
    upload: {
      drag:       t.uploadDrag,
      browse:     t.uploadClick,
      hint:       t.docHint,
      removeAria: t.removeAria,
      uploading:  t.uploadingDoc,
      ko:         t.koSuffix,
    },
  };
}

export function VerificationForm({ t}: { t: PraticienT }) {
  const [cinFile,     setCinFile]     = useState<Doc | null>(null);
  const [diplomeFile, setDiplomeFile] = useState<Doc | null>(null);
  const [ordreNumber, setOrdreNumber] = useState("");
  const [message,     setMessage]     = useState("");
  const [uploading,   setUploading]   = useState<DocCategory | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success,     setSuccess]     = useState(false);
  const [pending, start] = useTransition();

  async function handleUpload(file: File, category: DocCategory) {
    if (file.size > 5 * 1024 * 1024) { setUploadError(t.errFileSize); return; }
    setUploadError("");
    setUploading(category);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/document", { method: "POST", body: fd });
    setUploading(null);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setUploadError(err.error ?? t.errUploadDoc);
      return;
    }
    const uploaded = await res.json();
    const doc: Doc = { ...uploaded, category };
    if (category === "cin")     setCinFile(doc);
    if (category === "diplome") setDiplomeFile(doc);
  }

  function validate(): string | null {
    if (!cinFile) return t.errCin;
    if (!diplomeFile && !ordreNumber.trim()) return t.errDoc;
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setSubmitError(err); return; }
    setSubmitError("");
    const docs: Doc[] = [cinFile!, ...(diplomeFile ? [diplomeFile] : [])];
    start(async () => {
      try {
        await submitVerificationRequest(message, docs, ordreNumber.trim() || undefined);
        setSuccess(true);
      } catch (e: unknown) {
        setSubmitError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-10 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-secondary-50 flex items-center justify-center">
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-8 h-8 text-secondary-500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="20" cy="20" r="16"/><path d="M12 20.5l5.5 5.5L28 14"/>
          </svg>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 mb-1">{t.successTitle}</p>
          <p className="text-sm text-slate-500 max-w-xs">{t.successDesc}</p>
        </div>
      </div>
    );
  }

  const toFile = (d: Doc | null) => d ? { name: d.name, size: d.size, isPdf: d.type === "application/pdf" } : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <ProofFields
        idPrefix="verif"
        cin={{
          file:      toFile(cinFile),
          onPick:    (f) => { void handleUpload(f, "cin"); },
          onRemove:  () => setCinFile(null),
          uploading: uploading === "cin",
        }}
        diplome={{
          file:      toFile(diplomeFile),
          onPick:    (f) => { void handleUpload(f, "diplome"); },
          onRemove:  () => setDiplomeFile(null),
          uploading: uploading === "diplome",
        }}
        ordre={ordreNumber}
        onOrdreChange={setOrdreNumber}
        message={message}
        onMessageChange={setMessage}
        labels={proofLabels(t)}
      />

      {(uploadError || submitError) && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5" role="alert">
          {uploadError || submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || uploading !== null}
        className="btn-primary self-start px-8 py-2.5 inline-flex items-center gap-2 disabled:opacity-60"
      >
        {pending ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {t.sending}
          </>
        ) : t.submitRequest}
      </button>
    </form>
  );
}
