"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { espaceContent } from "@/lib/espace-content";
import type { Locale } from "@/lib/i18n";
import { updateAuthorProfile, type ContributorState } from "@/features/contributor/actions";

const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none";
const labelCls = "block text-sm font-medium text-slate-700 mb-1";

type Option = { id: string; name: string };

export function ProfileForm({
  initial, cities, specialties, locale = "fr",
}: {
  initial: {
    jobTitle: string; credentials: string; bio: string; bioAr: string; headline: string;
    university: string; orderName: string; registrationNumber: string;
    website: string; linkedin: string; cabinetUrl: string;
    authorCityId: string; authorSpecialtyId: string;
    languages: string; interests: string; yearsPractice: string;
  };
  cities: Option[];
  specialties: Option[];
  locale?: Locale;
}) {
  const t = espaceContent(locale).profileForm;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  function submit() {
    setMsg(null);
    const fd = new FormData();
    for (const [k, v] of Object.entries(f)) fd.set(k, v);
    startTransition(async () => {
      let res: ContributorState;
      try { res = await updateAuthorProfile(undefined, fd); }
      catch { setMsg({ ok: false, text: t.errGeneric }); return; }
      if (res?.errors) setMsg({ ok: false, text: Object.values(res.errors).join(" ") });
      else { setMsg({ ok: true, text: t.saved }); router.refresh(); }
    });
  }

  return (
    <div className="space-y-5">
      {msg && (
        <div role="alert" className={`rounded-lg text-sm px-4 py-3 border ${msg.ok ? "bg-secondary-50 border-secondary-200 text-secondary-800" : "bg-red-50 border-red-200 text-red-800"}`}>{msg.text}</div>
      )}

      <div>
        <label className={labelCls} htmlFor="headline">{t.headline} <span className="text-slate-400 font-normal">{t.headlineHint}</span></label>
        <input id="headline" className={field} value={f.headline} onChange={(e) => set("headline")(e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div><label className={labelCls} htmlFor="jobTitle">{t.jobTitle}</label><input id="jobTitle" className={field} value={f.jobTitle} onChange={(e) => set("jobTitle")(e.target.value)} /></div>
        <div><label className={labelCls} htmlFor="yearsPractice">{t.years}</label><input id="yearsPractice" type="number" min={0} className={field} value={f.yearsPractice} onChange={(e) => set("yearsPractice")(e.target.value)} /></div>
        <div>
          <label className={labelCls} htmlFor="authorSpecialtyId">{t.specialty}</label>
          <select id="authorSpecialtyId" className={field} value={f.authorSpecialtyId} onChange={(e) => set("authorSpecialtyId")(e.target.value)}>
            <option value="">{t.dash}</option>
            {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="authorCityId">{t.city}</label>
          <select id="authorCityId" className={field} value={f.authorCityId} onChange={(e) => set("authorCityId")(e.target.value)}>
            <option value="">{t.dash}</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div><label className={labelCls} htmlFor="bio">{t.bio}</label><textarea id="bio" rows={4} className={field} value={f.bio} onChange={(e) => set("bio")(e.target.value)} /></div>
      <div dir="rtl"><label className={labelCls} htmlFor="bioAr">{t.bioAr}</label><textarea id="bioAr" rows={4} className={field} value={f.bioAr} onChange={(e) => set("bioAr")(e.target.value)} /></div>
      <div><label className={labelCls} htmlFor="credentials">{t.credentials}</label><textarea id="credentials" rows={2} className={field} value={f.credentials} onChange={(e) => set("credentials")(e.target.value)} /></div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div><label className={labelCls} htmlFor="university">{t.university}</label><input id="university" className={field} value={f.university} onChange={(e) => set("university")(e.target.value)} /></div>
        <div><label className={labelCls} htmlFor="orderName">{t.orderName}</label><input id="orderName" className={field} value={f.orderName} onChange={(e) => set("orderName")(e.target.value)} /></div>
        <div><label className={labelCls} htmlFor="registrationNumber">{t.regNumber}</label><input id="registrationNumber" className={field} value={f.registrationNumber} onChange={(e) => set("registrationNumber")(e.target.value)} /></div>
        <div><label className={labelCls} htmlFor="languages">{t.languages} <span className="text-slate-400 font-normal">{t.langHint}</span></label><input id="languages" className={field} value={f.languages} onChange={(e) => set("languages")(e.target.value)} placeholder="Arabe, Français" /></div>
        <div><label className={labelCls} htmlFor="cabinetUrl">{t.cabinet}</label><input id="cabinetUrl" className={field} value={f.cabinetUrl} onChange={(e) => set("cabinetUrl")(e.target.value)} /></div>
        <div><label className={labelCls} htmlFor="website">{t.website}</label><input id="website" className={field} value={f.website} onChange={(e) => set("website")(e.target.value)} /></div>
        <div><label className={labelCls} htmlFor="linkedin">{t.linkedin}</label><input id="linkedin" className={field} value={f.linkedin} onChange={(e) => set("linkedin")(e.target.value)} /></div>
        <div><label className={labelCls} htmlFor="interests">{t.interests} <span className="text-slate-400 font-normal">{t.interestsHint}</span></label><input id="interests" className={field} value={f.interests} onChange={(e) => set("interests")(e.target.value)} /></div>
      </div>

      <button type="button" onClick={submit} disabled={pending} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
        {pending ? t.saving : t.save}
      </button>
    </div>
  );
}
