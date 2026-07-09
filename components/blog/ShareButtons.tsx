"use client";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

export function ShareButtons({
  title,
  url,
  t,
}: {
  title: string;
  url: string;
  t: Dictionary["blog"];
}) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(title + " — ");
  const href = encodeURIComponent(url);

  const copy = async () => {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 me-1">{t.share}</span>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${text}${href}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.shareWhatsapp}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M10 0C4.48 0 0 4.48 0 10c0 1.77.46 3.42 1.27 4.86L0 20l5.29-1.25A9.95 9.95 0 0 0 10 20c5.52 0 10-4.48 10-10S15.52 0 10 0zm4.9 14.11c-.21.58-1.2 1.11-1.65 1.16-.45.05-.46.34-2.87-.75-2.41-1.09-3.87-3.74-3.99-3.91-.11-.17-.94-1.25-.94-2.38 0-1.13.59-1.69.81-1.92.21-.23.46-.29.61-.29.15 0 .31.001.44.008.14.008.33-.053.52.4.19.45.64 1.56.7 1.68.06.11.09.25.02.4-.07.15-.11.24-.22.375-.11.13-.23.29-.33.39-.11.11-.22.23-.1.45.13.22.57.94 1.22 1.52.84.75 1.55.98 1.77 1.09.22.11.35.09.48-.055.13-.148.55-.645.7-.866.15-.22.3-.18.5-.11.2.073 1.28.606 1.51.72.22.11.37.16.42.26.05.09.05.54-.15 1.12z"/>
        </svg>
        WhatsApp
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${href}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.shareFacebook}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M18.9 0H1.1C.49 0 0 .49 0 1.1v17.8C0 19.51.49 20 1.1 20h9.58v-7.74H8.08V9.24h2.6V7.01c0-2.58 1.58-3.99 3.88-3.99 1.1 0 2.05.08 2.33.12v2.7h-1.6c-1.25 0-1.5.6-1.5 1.47v1.93h2.99l-.39 3.02h-2.6V20h5.1c.61 0 1.1-.49 1.1-1.1V1.1C20 .49 19.51 0 18.9 0z"/>
        </svg>
        Facebook
      </a>

      {/* Copy link */}
      <button
        type="button"
        onClick={copy}
        aria-label={t.copyLinkAria}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
      >
        {copied ? (
          <>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 8 3.5 3.5L13 4"/>
            </svg>
            <span className="text-secondary-700">{t.copied}</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 4H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2.5M10 2h4v4M14 2l-6 6"/>
            </svg>
            {t.copy}
          </>
        )}
      </button>
    </div>
  );
}
