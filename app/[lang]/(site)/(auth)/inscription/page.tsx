import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { RegisterForm } from "./_components/RegisterForm";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Inscription patient — SantéauMaroc",
  description:
    "Créez votre compte patient gratuit et prenez rendez-vous en ligne avec les meilleurs médecins au Maroc.",
  robots: { index: false, follow: false },
};

const BENEFIT_ICONS = [
  (
    <svg key="i0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="6" />
      <path d="m15 15 3 3" />
    </svg>
  ),
  (
    <svg key="i1" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="15" rx="2" />
      <path d="M3 8h14M7 2v2M13 2v2" />
    </svg>
  ),
  (
    <svg key="i2" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2a6 6 0 0 1 6 6c0 3.5-1.5 5-2 6H6c-.5-1-2-2.5-2-6a6 6 0 0 1 6-6z" />
      <path d="M8 17h4" />
    </svg>
  ),
  (
    <svg key="i3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2a7 7 0 0 1 7 7c0 5-4 9-7 10-3-1-7-5-7-10a7 7 0 0 1 7-7z" />
      <path d="M7.5 10l2 2 3-3" />
    </svg>
  ),
];

const STAT_VALUES = ["20 000+", "50+", "100%"];

export default async function InscriptionPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).inscription.patient;
  const statLabels = [t.stats.doctors, t.stats.cities, t.stats.free];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Mobile hero ─────────────────────────────── */}
      <div className="hero-bg lg:hidden px-5 pt-8 pb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary-300 mb-2">{t.eyebrow}</p>
        <h1 className="text-2xl font-bold text-white mb-2 leading-snug">
          {t.titleLine1}<br />{t.titleLine2}
        </h1>
        <p className="text-sm text-white/75 max-w-xs mb-5 leading-relaxed">
          {t.subtitleMobile}
        </p>
        <div className="flex flex-wrap gap-2">
          {STAT_VALUES.map((value, i) => (
            <span key={statLabels[i]} className="badge-trust">
              <span dir="ltr">{value}</span> {statLabels[i]}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-14 lg:grid lg:grid-cols-[1fr_460px] lg:gap-14 lg:items-start">

        {/* ── Left panel (desktop only) ────────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-24">

            <div className="mb-8">
              <p className="section-eyebrow mb-2">{t.eyebrow}</p>
              <h1 className="text-[2.6rem] font-bold text-slate-900 leading-tight mb-3">
                {t.titleLine1}<br />{t.titleLine2}
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-sm">
                {t.subtitleDesktop}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {t.benefits.map((b, i) => (
                <div key={b.title} className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-secondary-50 flex items-center justify-center shrink-0 text-secondary-600 mt-0.5">
                    {BENEFIT_ICONS[i]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{b.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-8 pb-8 border-b border-slate-200">
              {STAT_VALUES.map((value, i) => (
                <div key={statLabels[i]}>
                  <p dir="ltr" className="text-2xl font-bold text-primary-700 tabular-nums">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{statLabels[i]}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="card p-4 sm:p-5">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} viewBox="0 0 12 12" fill="currentColor" className="w-3.5 h-3.5 text-amber-400" aria-hidden="true">
                    <path d="M6 1l1.35 2.73L10.5 4.2l-2.25 2.19.53 3.11L6 8.01 3.22 9.5l.53-3.11L1.5 4.2l3.15-.47L6 1z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic mb-3">
                &ldquo;{t.testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold text-xs shrink-0">
                  FB
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{t.testimonial.name}</p>
                  <p className="text-xs text-slate-500">{t.testimonial.city}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Right panel: Form ───────────────────── */}
        <div>
          <div className="card overflow-hidden p-0 shadow-lg shadow-slate-200/70">
            <div
              className="h-1.5"
              style={{ background: "linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)" }}
            />
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-1">{t.cardTitle}</h2>
              <p className="text-sm text-slate-500 mb-6">{t.cardSubtitle}</p>
              <RegisterForm t={t.form} />
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-5 space-y-3 text-center">
            <p className="text-sm text-slate-600">
              {t.already}{" "}
              <Link
                href="/connexion"
                className="text-secondary-600 hover:text-secondary-700 font-semibold hover:underline"
              >
                {t.login}
              </Link>
            </p>
            <div className="pt-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                {t.areYouPro}{" "}
                <Link
                  href="/inscription-praticien"
                  className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                >
                  {t.proSignup}
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
