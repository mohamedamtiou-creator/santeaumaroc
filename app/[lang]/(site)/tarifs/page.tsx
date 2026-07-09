import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Dictionary } from "@/lib/i18n";

type Params = Promise<{ lang: string }>;
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PricingPlans } from "./_components/PricingPlans";
import { tryGetSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { isProPlan, isTrialActive } from "@/lib/plan";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).tarifs;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: localizedAlternates("/tarifs", locale),
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: "/tarifs",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: t.metaTitle, description: t.metaDescription },
  };
}

type TarifsT = Dictionary["tarifs"];

/* Rendu d'une cellule du comparatif : ✓ / — / valeur texte. */
function CmpCell({ v, t, feat = false }: { v: string; t: TarifsT; feat?: boolean }) {
  const base = `px-4 py-3.5 text-center text-sm border-b border-slate-100 ${feat ? "bg-secondary-50/60" : ""}`;
  if (v === "yes")
    return (
      <td className={base}>
        <span className="inline-flex text-secondary-600" title={t.yes}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" className="w-4 h-4" aria-label={t.yes} strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.5 3.5L13 4" /></svg>
        </span>
      </td>
    );
  if (v === "no")
    return (
      <td className={base}>
        <span className="text-slate-300" aria-label={t.no}>—</span>
      </td>
    );
  return <td className={`${base} font-semibold text-slate-700`}>{v}</td>;
}

const REA_ICONS = [
  <svg key="0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2 4 4.5v5C4 13.2 6.8 16.8 10 18c3.2-1.2 6-4.8 6-8.5v-5L10 2z" /><path d="m7.5 10 2 2 3-3.5" /></svg>,
  <svg key="1" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M10 5.5v4.5l3 2" /></svg>,
  <svg key="2" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="14" height="13" rx="2" /><path d="M3 8h14M7 2v3M13 2v3" /></svg>,
  <svg key="3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="12" height="8" rx="2" /><path d="M7 9V6.5a3 3 0 0 1 6 0V9" /></svg>,
];
const REA_TINT = [
  "bg-secondary-50 text-secondary-600",
  "bg-primary-50 text-primary-600",
  "bg-amber-50 text-amber-600",
  "bg-secondary-50 text-secondary-600",
];

export default async function TarifsPage({ params }: { params: Params }) {
  const dict = getDictionary(toLocale((await params).lang));
  const t = dict.tarifs;

  // Éligibilité à l'essai gratuit Pro (médecin connecté, jamais essayé, pas déjà Pro).
  let trialEligible = false;
  const session = await tryGetSession();
  if (session?.userId && session.role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      select: { plan: true, planExpiresAt: true, trialEndsAt: true, trialUsedAt: true },
    });
    trialEligible =
      !!doctor &&
      !doctor.trialUsedAt &&
      !isProPlan(doctor.plan, doctor.planExpiresAt) &&
      !isTrialActive(doctor.trialEndsAt);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${BASE}/tarifs#product`,
        "name": "SantéauMaroc — Abonnement praticien",
        "description": t.metaDescription,
        "brand": { "@type": "Brand", "name": "SantéauMaroc" },
        "offers": [
          { "@type": "Offer", "name": t.freeName, "price": "0", "priceCurrency": "MAD", "url": `${BASE}/tarifs` },
          { "@type": "Offer", "name": t.proName, "price": "249", "priceCurrency": "MAD", "url": `${BASE}/tarifs`, "category": "Subscription" },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": t.faqs.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Tarifs", "item": `${BASE}/tarifs` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary-300 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-5">
            ★ {t.heroEyebrow}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-[1.05] tracking-tight">
            {t.heroTitle1}<br className="hidden sm:block" />
            <span className="text-secondary-300"> {t.heroTitleAccent}</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mt-5">
            {t.heroLedePre}<strong className="text-white font-semibold">{t.heroLedeStrong}</strong>{t.heroLedePost}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <a href="#offres" className="btn-secondary px-6 py-3 text-sm">
              {t.heroCtaPlans}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
            </a>
            <a href="#comparatif" className="btn-ghost-white px-6 py-3 text-sm">{t.heroCtaCompare}</a>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-7 text-sm text-white/80">
            {[t.trust1, t.trust2, t.trust3].map((tr) => (
              <span key={tr} className="inline-flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-secondary-300 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5 6.5-7" /></svg>
                {tr}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Offres ───────────────────────────────────────── */}
      <section id="offres" className="page-outer max-w-6xl">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="section-eyebrow mb-2">{t.plansEyebrow}</p>
          <h2 className="section-title">{t.plansTitle}</h2>
          <p className="section-subtitle mt-3">{t.plansSubtitle}</p>
        </div>
        <PricingPlans t={t} trialEligible={trialEligible} trialLabel={trialEligible ? dict.dashboard.praticien.sub.trialStart : ""} />
      </section>

      {/* ── Réassurance ──────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.reaItems.map((r, i) => (
            <div key={r.title} className="flex items-start gap-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${REA_TINT[i]}`}>{REA_ICONS[i]}</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparatif ───────────────────────────────────── */}
      <section id="comparatif" className="page-outer max-w-5xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="section-eyebrow mb-2">{t.cmpEyebrow}</p>
          <h2 className="section-title">{t.cmpTitle}</h2>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3.5 text-start text-sm min-w-[220px]">&nbsp;</th>
                <th className="px-4 py-3.5 text-center"><span className="block font-bold text-slate-900 text-sm">{t.freeName}</span><span className="block text-xs text-slate-500 font-medium">0 {t.currency}</span></th>
                <th className="px-4 py-3.5 text-center bg-secondary-50"><span className="block font-bold text-slate-900 text-sm">{t.proName}</span><span className="block text-xs text-slate-500 font-medium">249 {t.currency}{t.perMonth}</span></th>
                <th className="px-4 py-3.5 text-center"><span className="block font-bold text-slate-900 text-sm">{t.clinicName}</span><span className="block text-xs text-slate-500 font-medium">{t.quotePrice}</span></th>
              </tr>
            </thead>
            <tbody>
              {t.cmpRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="px-4 py-3.5 text-start text-sm font-medium text-slate-700 border-b border-slate-100">{row.label}</th>
                  <CmpCell v={row.free} t={t} />
                  <CmpCell v={row.pro} t={t} feat />
                  <CmpCell v={row.clinic} t={t} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────── */}
      <section className="page-outer max-w-6xl pt-0">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="section-eyebrow mb-2">{t.testiEyebrow}</p>
          <h2 className="section-title">{t.testiTitle}</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {t.testimonials.map((q) => {
            const initials = q.name.replace(/^Dr\.?\s*|^د\.?\s*/u, "").split(" ").map((w) => w[0]).slice(0, 2).join("");
            return (
              <figure key={q.name} className="card p-5 flex flex-col gap-3.5">
                <div className="text-amber-400 tracking-[2px] text-sm" aria-label="5/5">★★★★★</div>
                <blockquote className="text-sm text-slate-700 leading-relaxed">« {q.quote} »</blockquote>
                <figcaption className="flex items-center gap-3 mt-auto pt-1">
                  <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center shrink-0" aria-hidden="true">{initials}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 truncate">{q.name}</span>
                    <span className="block text-xs text-slate-500 truncate">{q.meta}</span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="page-outer max-w-3xl pt-0">
        <div className="text-center mb-8">
          <p className="section-eyebrow mb-2">{t.faqEyebrow}</p>
          <h2 className="section-title">{t.faqTitle}</h2>
        </div>
        <div className="card p-5 sm:p-6">
          <FaqAccordion faqs={t.faqs} />
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="page-outer max-w-5xl pt-0">
        <div className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 58%, #047857 130%)" }}>
          <div className="absolute inset-0 opacity-10" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.finalTitle}</h2>
            <p className="text-white/80 text-sm mb-7 max-w-md mx-auto leading-relaxed">{t.finalDesc}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/inscription-praticien" className="btn-ghost-white px-7 py-3">{t.finalCtaFree}</Link>
              <Link href="/tarifs/activer?offre=pro" className="btn-secondary px-7 py-3">{t.finalCtaPro}</Link>
            </div>
            <p className="text-white/70 text-xs mt-5">{t.finalMicro}</p>
          </div>
        </div>
      </section>
    </>
  );
}
