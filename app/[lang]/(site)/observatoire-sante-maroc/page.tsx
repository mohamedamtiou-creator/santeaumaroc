import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/hreflang";
import { tCity, tSpecialty } from "@/lib/specialty-i18n";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const YEAR = "2026";
const LAST_UPDATED_ISO = "2026-07-02";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: `Observatoire de l'accès aux soins au Maroc ${YEAR}`,
    description:
      "Étude de la répartition des médecins au Maroc : concentration urbaine, déserts médicaux et offre par spécialité, d'après les fiches référencées sur SantéauMaroc.",
    alternates: localizedAlternates("/observatoire-sante-maroc", locale),
    openGraph: {
      title: `Observatoire de l'accès aux soins au Maroc ${YEAR} — SantéauMaroc`,
      description:
        "Concentration urbaine, déserts médicaux et offre par spécialité : les chiffres de l'accès aux soins au Maroc.",
      url: "/observatoire-sante-maroc",
      type: "article",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
  };
}

// ── Données agrégées, cachées 7 j (lourdes : ~240 villes + ~96 spécialités).
// Indépendantes de la locale : la page traduit les libellés à l'affichage.
const getStats = unstable_cache(
  async () => {
    const [total, cities, specialties] = await Promise.all([
      prisma.doctor.count({ where: { isActive: true } }),
      prisma.city.findMany({
        select: { name: true, slug: true, _count: { select: { doctors: { where: { isActive: true } } } } },
      }),
      prisma.specialty.findMany({
        select: { name: true, slug: true, _count: { select: { doctors: { where: { isActive: true } } } } },
      }),
    ]);

    const cityCounts = cities.map((c) => ({ name: c.name, slug: c.slug, n: c._count.doctors }));
    const sortedCities = [...cityCounts].sort((a, b) => b.n - a.n);
    const withDocs = cityCounts.filter((c) => c.n > 0).length;
    const zero = cityCounts.filter((c) => c.n === 0).length;
    const lt5 = cityCounts.filter((c) => c.n > 0 && c.n < 5).length;
    const top5 = sortedCities.slice(0, 5).reduce((s, c) => s + c.n, 0);

    const specCounts = specialties
      .map((s) => ({ name: s.name, slug: s.slug, n: s._count.doctors }))
      .sort((a, b) => b.n - a.n);

    return {
      total,
      citiesTotal: cities.length,
      citiesWithDocs: withDocs,
      citiesZero: zero,
      citiesLt5: lt5,
      topCities: sortedCities.slice(0, 12),
      top1CitySharePct: total ? Math.round((sortedCities[0]?.n ?? 0) / total * 100) : 0,
      top1CityName: sortedCities[0]?.name ?? "",
      top5CitySharePct: total ? Math.round(top5 / total * 100) : 0,
      topSpecs: specCounts.slice(0, 12),
      top2SpecSharePct: total ? Math.round(((specCounts[0]?.n ?? 0) + (specCounts[1]?.n ?? 0)) / total * 100) : 0,
      specialtiesTotal: specialties.length,
    };
  },
  ["observatory-stats"],
  { revalidate: 604800, tags: ["doctors"] },
);

type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  method: string;
  updatedLabel: string;
  updatedHuman: string;
  kpiDoctors: string;
  kpiCities: string;
  kpiSpecialties: string;
  kpiConcentration: string;
  s1Title: string;
  s1Lead: string;
  s2Title: string;
  s2Lead: string;
  s2Zero: string;
  s2Lt5: string;
  s3Title: string;
  s3Lead: string;
  chartUnit: string;
  methodTitle: string;
  methodBody: string;
  citeTitle: string;
  citeIntro: string;
  ctaTitle: string;
  ctaText: string;
  ctaBtn: string;
  homeCrumb: string;
  crumb: string;
};

const nf = (locale: "fr" | "ar") => new Intl.NumberFormat("fr-FR"); // groupes par espace, chiffres latins (FR+AR)

function fill(s: string, vars: Record<string, string>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

const COPY: Record<"fr" | "ar", Copy> = {
  fr: {
    eyebrow: `Étude · ${YEAR}`,
    title: "Observatoire de l'accès aux soins au Maroc",
    subtitle:
      "Où sont les médecins au Maroc ? Cette étude analyse leur répartition par ville et par spécialité — et met en lumière les déséquilibres d'accès aux soins.",
    method: "D'après les fiches actives référencées sur SantéauMaroc.",
    updatedLabel: "Mise à jour",
    updatedHuman: "2 juillet 2026",
    kpiDoctors: "médecins actifs référencés",
    kpiCities: "villes couvertes sur {tot}",
    kpiSpecialties: "spécialités médicales",
    kpiConcentration: "des médecins dans les 5 premières villes",
    s1Title: "Une offre très concentrée dans les grandes villes",
    s1Lead:
      "À elle seule, {city} regroupe {p1}% des médecins référencés, et les cinq premières villes en concentrent {p5}%. L'accès aux soins reste fortement métropolitain.",
    s2Title: "Des déserts médicaux persistants",
    s2Lead:
      "Sur {tot} villes du référentiel, {zero} n'affichent aucun médecin référencé et {lt5} en comptent moins de cinq — un signal de sous-dotation en dehors des pôles urbains.",
    s2Zero: "villes sans médecin référencé",
    s2Lt5: "villes avec moins de 5 médecins",
    s3Title: "Une offre dominée par quelques spécialités",
    s3Lead:
      "Médecine générale et chirurgie dentaire représentent à elles seules {p2}% de l'offre référencée. Les spécialités pointues restent rares et concentrées dans les métropoles.",
    chartUnit: "médecins",
    methodTitle: "Méthodologie & limites",
    methodBody:
      "Les chiffres portent sur les fiches de praticiens actives référencées sur SantéauMaroc à la date indiquée. Ils reflètent la couverture de la plateforme et non un recensement officiel de la démographie médicale marocaine ; la densité par habitant n'est pas calculée (données de population non intégrées). Ils constituent néanmoins un indicateur utile des déséquilibres territoriaux de l'offre de soins.",
    citeTitle: "Citer cette étude",
    citeIntro: "Vous êtes journaliste ou chercheur ? Reprenez librement ces chiffres en citant la source :",
    ctaTitle: "Trouvez un médecin près de chez vous",
    ctaText: "Comparez les praticiens de votre ville et prenez rendez-vous en ligne.",
    ctaBtn: "Explorer l'annuaire",
    homeCrumb: "Accueil",
    crumb: "Observatoire de l'accès aux soins",
  },
  ar: {
    eyebrow: `دراسة · ${YEAR}`,
    title: "مرصد الولوج إلى العلاجات بالمغرب",
    subtitle:
      "أين يوجد الأطباء بالمغرب؟ تحلّل هذه الدراسة توزيعهم حسب المدينة والتخصص — وتُبرز اختلالات الولوج إلى العلاجات.",
    method: "بناءً على البطاقات النشطة المُدرَجة على SantéauMaroc.",
    updatedLabel: "تحديث",
    updatedHuman: "2 يوليوز 2026",
    kpiDoctors: "طبيب نشط مُدرَج",
    kpiCities: "مدينة مُغطّاة من أصل {tot}",
    kpiSpecialties: "تخصصاً طبياً",
    kpiConcentration: "من الأطباء في المدن الخمس الأولى",
    s1Title: "عرض شديد التركّز في المدن الكبرى",
    s1Lead:
      "لوحدها، تضم {city} {p1}% من الأطباء المُدرَجين، وتركّز المدن الخمس الأولى {p5}% منهم. يبقى الولوج إلى العلاجات ذا طابع حضري قوي.",
    s2Title: "فجوات طبية مستمرة",
    s2Lead:
      "من أصل {tot} مدينة في المرجع، {zero} لا تُظهر أي طبيب مُدرَج و{lt5} تضم أقل من خمسة — مؤشر على ضعف التغطية خارج الأقطاب الحضرية.",
    s2Zero: "مدينة بدون طبيب مُدرَج",
    s2Lt5: "مدينة بأقل من 5 أطباء",
    s3Title: "عرض تهيمن عليه بعض التخصصات",
    s3Lead:
      "يمثّل الطب العام وطب الأسنان وحدهما {p2}% من العرض المُدرَج. تبقى التخصصات الدقيقة نادرة ومتمركزة في المدن الكبرى.",
    chartUnit: "طبيب",
    methodTitle: "المنهجية والحدود",
    methodBody:
      "تهمّ الأرقام بطاقات الأطباء النشطة المُدرَجة على SantéauMaroc في التاريخ المشار إليه. تعكس تغطية المنصة وليست إحصاءً رسمياً للديموغرافيا الطبية المغربية؛ ولا تُحتسب الكثافة لكل ساكن (معطيات السكان غير مُدمجة). ومع ذلك تشكّل مؤشراً مفيداً للاختلالات المجالية في عرض العلاجات.",
    citeTitle: "اقتباس هذه الدراسة",
    citeIntro: "صحافي أو باحث؟ استعمل هذه الأرقام بحرية مع ذكر المصدر:",
    ctaTitle: "اعثر على طبيب قريب منك",
    ctaText: "قارن الأطباء في مدينتك وخذ موعداً عبر الإنترنت.",
    ctaBtn: "استكشف الدليل",
    homeCrumb: "الرئيسية",
    crumb: "مرصد الولوج إلى العلاجات",
  },
};

/** Barre horizontale (CSS pur, pas de dépendance). */
function Bar({ label, value, max, unit, gradient }: { label: string; value: number; max: number; unit: string; gradient: boolean }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 sm:w-40 shrink-0 truncate text-slate-700">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: gradient ? "linear-gradient(90deg,#2563eb,#059669)" : "#2563eb" }}
        />
      </div>
      <span dir="ltr" className="w-14 shrink-0 text-end tabular-nums font-semibold text-slate-800">
        {new Intl.NumberFormat("fr-FR").format(value)}
      </span>
      <span className="sr-only">{unit}</span>
    </div>
  );
}

export default async function ObservatoirePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang) === "ar" ? "ar" : "fr";
  const t = COPY[locale];
  const d = await getStats();
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  const url = `${BASE}/observatoire-sante-maroc`;

  const maxCity = d.topCities[0]?.n ?? 1;
  const maxSpec = d.topSpecs[0]?.n ?? 1;
  const citation = `Observatoire de l'accès aux soins au Maroc ${YEAR}, SantéauMaroc — ${url}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "@id": `${url}#dataset`,
        "name": `${t.title} ${YEAR}`,
        "description": t.subtitle,
        "url": url,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "dateModified": LAST_UPDATED_ISO,
        "isAccessibleForFree": true,
        "creator": { "@id": `${BASE}/#organization` },
        "spatialCoverage": { "@type": "Country", "name": "Maroc", "sameAs": "https://www.wikidata.org/wiki/Q1028" },
        "keywords": ["accès aux soins", "démographie médicale", "Maroc", "médecins", "déserts médicaux"],
        "measurementTechnique": "Agrégation des fiches de praticiens actives référencées sur SantéauMaroc",
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.homeCrumb, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.crumb, "item": url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="hero-bg relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20">
          <p className="section-eyebrow text-secondary-300 mb-4">{t.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5 tracking-tight">{t.title}</h1>
          <p className="text-white/75 text-lg leading-relaxed mb-4">{t.subtitle}</p>
          <p className="text-sm text-white/55">
            {t.method} · {t.updatedLabel} : <time dateTime={LAST_UPDATED_ISO}>{t.updatedHuman}</time>
          </p>
        </div>
      </div>

      <main className="page-outer">
        <div className="max-w-3xl mx-auto">

          {/* ── KPIs ────────────────────────────────────── */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
            {[
              { v: fmt(d.total), l: t.kpiDoctors },
              { v: fmt(d.citiesWithDocs), l: fill(t.kpiCities, { tot: fmt(d.citiesTotal) }) },
              { v: fmt(d.specialtiesTotal), l: t.kpiSpecialties },
              { v: `${d.top5CitySharePct}%`, l: t.kpiConcentration },
            ].map((k, i) => (
              <div key={i} className="card p-4 text-center">
                <p dir="ltr" className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-primary-600">{k.v}</p>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{k.l}</p>
              </div>
            ))}
          </section>

          {/* ── Insight 1 : concentration urbaine ───────── */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t.s1Title}</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              {fill(t.s1Lead, {
                city: tCity(d.top1CityName, locale),
                p1: String(d.top1CitySharePct),
                p5: String(d.top5CitySharePct),
              })}
            </p>
            <div className="space-y-2.5">
              {d.topCities.map((c) => (
                <Bar key={c.slug} label={tCity(c.name, locale)} value={c.n} max={maxCity} unit={t.chartUnit} gradient />
              ))}
            </div>
          </section>

          {/* ── Insight 2 : déserts médicaux ────────────── */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t.s2Title}</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              {fill(t.s2Lead, { tot: fmt(d.citiesTotal), zero: fmt(d.citiesZero), lt5: fmt(d.citiesLt5) })}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-6 text-center">
                <p dir="ltr" className="text-4xl font-black tabular-nums text-amber-600">{fmt(d.citiesZero)}</p>
                <p className="text-sm text-slate-500 mt-2">{t.s2Zero}</p>
              </div>
              <div className="card p-6 text-center">
                <p dir="ltr" className="text-4xl font-black tabular-nums text-amber-600">{fmt(d.citiesLt5)}</p>
                <p className="text-sm text-slate-500 mt-2">{t.s2Lt5}</p>
              </div>
            </div>
          </section>

          {/* ── Insight 3 : spécialités ─────────────────── */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t.s3Title}</h2>
            <p className="text-slate-600 leading-relaxed mb-6">{fill(t.s3Lead, { p2: String(d.top2SpecSharePct) })}</p>
            <div className="space-y-2.5">
              {d.topSpecs.map((s) => (
                <Bar key={s.slug} label={tSpecialty(s.name, locale)} value={s.n} max={maxSpec} unit={t.chartUnit} gradient={false} />
              ))}
            </div>
          </section>

          {/* ── Méthodologie ────────────────────────────── */}
          <section className="mb-14">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">{t.methodTitle}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{t.methodBody}</p>
          </section>

          {/* ── Citer cette étude (aimant à liens) ──────── */}
          <section className="mb-14">
            <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-5">
              <p className="text-sm font-bold text-primary-800 mb-1">{t.citeTitle}</p>
              <p className="text-sm text-slate-600 mb-3">{t.citeIntro}</p>
              <p dir="ltr" className="rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-700 font-mono leading-relaxed select-all">
                {citation}
              </p>
            </div>
          </section>

          {/* ── CTA ─────────────────────────────────────── */}
          <section>
            <div
              className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 58%, #047857 100%)" }}
            >
              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{t.ctaTitle}</h2>
                <p className="text-white/75 text-sm mb-7 max-w-md mx-auto leading-relaxed">{t.ctaText}</p>
                <Link href="/praticiens" className="btn-ghost-white px-8 py-3">{t.ctaBtn}</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
