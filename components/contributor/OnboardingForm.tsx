"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PROFESSIONS, professionLabel } from "@/lib/contributor";
import { espaceContent } from "@/lib/espace-content";
import type { Locale } from "@/lib/i18n";
import { applyAsAuthor, type ContributorState } from "@/features/contributor/actions";

const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none";

export function OnboardingForm({ locale = "fr" }: { locale?: Locale }) {
  const t = espaceContent(locale).onboarding;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [kind, setKind] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isOrg = ["ASSOCIATION", "HOPITAL", "CLINIQUE"].includes(kind);

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set("professionKind", kind);
    fd.set("orgLegalName", orgName);
    startTransition(async () => {
      let res: ContributorState;
      try { res = await applyAsAuthor(undefined, fd); }
      catch { setError(t.errGeneric); return; }
      if (res?.errors) { setError(Object.values(res.errors).join(" ")); return; }
      router.push("/espace-auteur/verification");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {error && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">{error}</div>}

      <fieldset>
        <legend className="block text-sm font-medium text-slate-700 mb-2">{t.professionQ}</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROFESSIONS.map((p) => (
            <button key={p.kind} type="button" onClick={() => setKind(p.kind)}
              className={`text-start px-3 py-2.5 rounded-lg border text-sm transition-colors ${kind === p.kind ? "border-primary-500 bg-primary-50 text-primary-800 font-semibold" : "border-slate-200 hover:border-slate-300 text-slate-700"}`}>
              {professionLabel(p.kind, locale)}
            </button>
          ))}
        </div>
      </fieldset>

      {isOrg && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="orgLegalName">{t.orgLegalName}</label>
          <input id="orgLegalName" className={field} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </div>
      )}

      <button type="button" onClick={submit} disabled={pending || !kind} className="btn-primary px-6 py-3 text-base font-semibold disabled:opacity-50">
        {pending ? "…" : t.continueCta}
      </button>
    </div>
  );
}
