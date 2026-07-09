"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

/* Modale de signalement chargée au 1ᵉʳ clic (ssr:false) — hors bundle initial
   des pages Q/R. Le launcher ne garde que le bouton déclencheur + l'état. */
const ReportModal = dynamic(() => import("./ReportModal").then((m) => m.ReportModal), { ssr: false });

export function ReportDialog({
  targetType, targetId, t,
}: {
  targetType: "QUESTION" | "ANSWER" | "COMMENT";
  targetId: string;
  t: QaT;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition-colors"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14V3h7l-1 2 1 2H3" /><path d="M3 3v11" />
        </svg>
        {t.report}
      </button>

      {open && (
        <ReportModal
          targetType={targetType}
          targetId={targetId}
          t={t}
          onClose={() => setOpen(false)}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
}
