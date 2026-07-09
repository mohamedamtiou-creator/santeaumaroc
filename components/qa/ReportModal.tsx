"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitReport } from "@/features/qa/report-actions";
import type { FormState } from "@/lib/definitions";
import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

/**
 * Modale de signalement — extraite de ReportDialog et chargée en
 * `dynamic(ssr:false)` au 1ᵉʳ clic. Porte SA propre a11y (focus initial, piège
 * du focus, Échap, restitution du focus au déclencheur) : le launcher ne garde
 * que le bouton + l'état d'ouverture.
 */
export function ReportModal({
  targetType, targetId, t, onClose, triggerRef,
}: {
  targetType: "QUESTION" | "ANSWER" | "COMMENT";
  targetId: string;
  t: QaT;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitReport, undefined);
  const done = state?.message === "ok";
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus initial dans la dialog, piège du focus (Tab boucle), Échap ferme, et
  // restitution du focus au déclencheur à la fermeture (WCAG 2.4.3 / 2.1.2).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [onClose, triggerRef]);

  const reasons = [
    { value: "SPAM", label: t.reportReasonSpam },
    { value: "DANGEROUS", label: t.reportReasonDangerous },
    { value: "MISINFORMATION", label: t.reportReasonMisinfo },
    { value: "DUPLICATE", label: t.reportReasonDuplicate },
    { value: "OTHER", label: t.reportReasonOther },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-label={t.reportTitle} onClick={onClose}>
      <div ref={panelRef} className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">{t.reportTitle}</h2>
          <button type="button" onClick={onClose} aria-label={t.reportClose} className="p-2 -m-2 text-slate-400 hover:text-slate-700 text-xl leading-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">×</button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <p className="text-sm text-secondary-700 font-medium">{t.reportThanks}</p>
            <button type="button" onClick={onClose} className="btn-outline mt-4 text-sm">OK</button>
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-3">
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            <fieldset className="flex flex-col gap-2">
              {reasons.map((r) => (
                <label key={r.value} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input type="radio" name="reason" value={r.value} required className="accent-primary-600" />
                  {r.label}
                </label>
              ))}
            </fieldset>
            <textarea
              name="detail"
              rows={2}
              maxLength={500}
              placeholder={t.reportDetail}
              className="input-field text-sm"
            />
            {state?.message && state.message !== "ok" && (
              <p className="text-xs text-red-600">{state.message}</p>
            )}
            <button type="submit" disabled={pending} className="btn-primary justify-center text-sm py-2.5">
              {t.reportSubmit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
