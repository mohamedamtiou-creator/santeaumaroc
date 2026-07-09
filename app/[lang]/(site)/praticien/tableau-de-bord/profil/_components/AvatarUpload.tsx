"use client";

import { useRef, useState, useTransition } from "react";
import type { Dictionary } from "@/lib/i18n";

type Props = {
  currentAvatar: string | null;
  initials: string;
  fullName: string;
  t: Dictionary["dashboard"]["praticien"];
};

function CameraIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7a2 2 0 0 1 2-2h1l1.5-2h7L15 5h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"/>
      <circle cx="10" cy="11" r="2.5"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M6 4V3h4v1M5 4v8h6V4"/>
    </svg>
  );
}

function CheckSmallIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-3 h-3 shrink-0" aria-hidden="true" strokeLinecap="round">
      <path d="M2 6l3 3 5-5"/>
    </svg>
  );
}

function AlertSmallIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 shrink-0" aria-hidden="true">
      <circle cx="6" cy="6" r="5.5"/>
      <path d="M6 4v2.5M6 8h.01" stroke="white" strokeWidth="1.25" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function AvatarUpload({ currentAvatar, initials, fullName, t}: Props) {
  const [preview,    setPreview]    = useState<string | null>(currentAvatar);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);
  const [isPending,  startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() { inputRef.current?.click(); }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSuccess(false);

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError(t.avatarFormatError);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t.avatarSizeError);
      return;
    }

    setPreview(URL.createObjectURL(file));

    startTransition(async () => {
      const fd = new FormData();
      fd.append("avatar", file);
      const res  = await fetch("/api/upload/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.avatarUploadError);
        setPreview(currentAvatar);
      } else {
        setPreview(data.url + "?t=" + Date.now());
        setSuccess(true);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleDelete() {
    startTransition(async () => {
      setError(null);
      setSuccess(false);
      const res = await fetch("/api/upload/avatar", { method: "DELETE" });
      if (res.ok) {
        setPreview(null);
      } else {
        const data = await res.json();
        setError(data.error ?? t.avatarDeleteError);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">

      {/* ── Avatar cliquable ─────────────────────────── */}
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          aria-label={t.changePhotoAria}
          className="relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-full disabled:opacity-75"
        >
          <div className="avatar-ring w-24 h-24 sm:w-28 sm:h-28">
            <div className="avatar-ring-inner">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-700 select-none">
                  {initials}
                </span>
              )}
            </div>
          </div>

          {!isPending && (
            <div className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
              <CameraIcon />
            </div>
          )}

          {isPending && (
            <div className="absolute inset-0 rounded-full bg-white/75 flex items-center justify-center">
              <svg className="animate-spin w-7 h-7 text-primary-600" viewBox="0 0 24 24" fill="none" aria-label="Chargement…">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            </div>
          )}
        </button>

        {/* Bouton caméra flottant */}
        {!isPending && (
          <button
            type="button"
            onClick={handleClick}
            aria-label={t.changePhoto}
            className="absolute -bottom-0.5 -end-0.5 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
          >
            <CameraIcon />
          </button>
        )}
      </div>

      {/* ── Input caché ──────────────────────────────── */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Sélectionner une photo de profil"
      />

      {/* ── Actions texte ────────────────────────────── */}
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-xs text-slate-500 tracking-wide">{t.avatarHint}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 transition-colors"
          >
            {preview ? t.changePhoto : t.addPhoto}
          </button>
          {preview && (
            <>
              <span className="text-slate-200 select-none">|</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
              >
                <TrashIcon /> {t.deletePhoto}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Feedback ─────────────────────────────────── */}
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertSmallIcon />{error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-1.5 text-xs text-secondary-600">
          <CheckSmallIcon /> {t.photoUpdated}
        </p>
      )}
    </div>
  );
}
