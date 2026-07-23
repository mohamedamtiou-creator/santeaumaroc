"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { espaceContent } from "@/lib/espace-content";
import type { Locale } from "@/lib/i18n";
import { submitLicense, type ContributorState } from "@/features/contributor/actions";

const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none";
const labelCls = "block text-sm font-medium text-slate-700 mb-1";

export function LicenseForm({ requiredKinds, locale = "fr" }: { requiredKinds: string[]; locale?: Locale }) {
  const c = espaceContent(locale);
  const t = c.license;
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const kinds = Array.from(new Set([...requiredKinds, "CARTE_PRO"]));
  const showOrdreNumber = requiredKinds.includes("ORDRE");

  function submit() {
    setMsg(null);
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      let res: ContributorState;
      try { res = await submitLicense(undefined, fd); }
      catch { setMsg({ ok: false, text: t.errGeneric }); return; }
      if (res?.errors) setMsg({ ok: false, text: Object.values(res.errors).join(" ") });
      else { setMsg({ ok: true, text: t.sent }); router.refresh(); }
    });
  }

  return (
    <form ref={formRef} className="space-y-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      {msg && (
        <div role="alert" className={`rounded-lg text-sm px-4 py-3 border ${msg.ok ? "bg-secondary-50 border-secondary-200 text-secondary-800" : "bg-red-50 border-red-200 text-red-800"}`}>{msg.text}</div>
      )}

      {showOrdreNumber && (
        <div>
          <label className={labelCls} htmlFor="ordreNumber">{t.ordreNumber}</label>
          <input id="ordreNumber" name="ordreNumber" className={field} placeholder="Ex. 12345" />
          <p className="text-xs text-slate-400 mt-1">{t.ordreHint}</p>
        </div>
      )}

      {kinds.map((k) => (
        <div key={k}>
          <label className={labelCls} htmlFor={`file-${k}`}>
            {c.kindLabels[k] ?? k}
            {requiredKinds.includes(k) && <span className="text-red-500"> *</span>}
          </label>
          <input id={`file-${k}`} name={k} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-primary-700 file:font-medium hover:file:bg-primary-100" />
        </div>
      ))}

      <p className="text-xs text-slate-400">{t.formatsNote}</p>

      <button type="submit" disabled={pending} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
        {pending ? t.submitting : t.submitBtn}
      </button>
    </form>
  );
}
