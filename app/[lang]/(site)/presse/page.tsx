import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PRESS_EMAIL = "contact@santeaumaroc.com";

// Date de dernière mise à jour du kit média : date les chiffres cités et
// signale leur fraîcheur (un chiffre non daté vieillit mal / se fait requalifier).
const LAST_UPDATED_ISO = "2026-07-01";

// Porte-parole presse : journalistes et moteurs génératifs cherchent une personne
// citable. Piloté par env → rien de factice ne part tant qu'un vrai référent n'est
// pas désigné (même politique que les profils sociaux `sameAs` de la home).
const SPOKESPERSON_NAME = process.env.NEXT_PUBLIC_PRESS_SPOKESPERSON_NAME;
const SPOKESPERSON_ROLE = process.env.NEXT_PUBLIC_PRESS_SPOKESPERSON_ROLE;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Espace presse & kit média",
    description:
      "Ressources presse de SantéauMaroc : présentation, chiffres clés, logos à télécharger et contact média. La plateforme santé de référence au Maroc.",
    alternates: localizedAlternates("/presse", locale),
    openGraph: {
      title: "Espace presse & kit média — SantéauMaroc",
      description: "Présentation, chiffres clés, logos et contact média.",
      url: "/presse",
      type: "website",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
    twitter: {
      card: "summary_large_image",
      title: "Espace presse & kit média — SantéauMaroc",
      description: "Présentation, chiffres clés, logos et contact média.",
    },
  };
}

type Stat = { value: string; label: string };
type Asset = { label: string; href: string; note: string };
type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  updatedLabel: string;
  updatedHuman: string;
  statsTitle: string;
  stats: Stat[];
  statsNote: string;
  boilerplateTitle: string;
  boilerplateIntro: string;
  boilerplate: string;
  assetsTitle: string;
  assetsIntro: string;
  assets: Asset[];
  contactTitle: string;
  contactText: string;
  contactBtn: string;
  aboutLink: string;
  usageNote: string;
  homeCrumb: string;
  crumb: string;
};

// Chiffres arrondis et factuels (citables). À maintenir au fil de la croissance.
const STATS_FR: Stat[] = [
  { value: "~20 000", label: "médecins et praticiens référencés" },
  { value: "246", label: "villes couvertes" },
  { value: "96", label: "spécialités médicales" },
  { value: "6 400+", label: "cliniques, pharmacies et laboratoires" },
];
const STATS_AR: Stat[] = [
  { value: "~20 000", label: "طبيب ومهني صحة مُدرَج" },
  { value: "246", label: "مدينة مُغطّاة" },
  { value: "96", label: "تخصصاً طبياً" },
  { value: "6 400+", label: "عيادة وصيدلية ومختبر" },
];

const ASSETS_FR: Asset[] = [
  { label: "Logo principal (SVG)", href: "/logo.svg", note: "couleur, fond clair" },
  { label: "Logo monochrome (SVG)", href: "/logo-mono.svg", note: "une seule couleur" },
  { label: "Symbole / icône (SVG)", href: "/logo-mark.svg", note: "carré, réseaux sociaux" },
  { label: "Icône (PNG, 512 px)", href: "/icon-512.png", note: "matriciel, print & bureautique" },
];
const ASSETS_AR: Asset[] = [
  { label: "الشعار الرئيسي (SVG)", href: "/logo.svg", note: "ملوّن، خلفية فاتحة" },
  { label: "شعار أحادي اللون (SVG)", href: "/logo-mono.svg", note: "لون واحد" },
  { label: "الرمز / الأيقونة (SVG)", href: "/logo-mark.svg", note: "مربّع، الشبكات الاجتماعية" },
  { label: "أيقونة (PNG، 512 بكسل)", href: "/icon-512.png", note: "نقطي، للطباعة والمكتبيات" },
];

const COPY: Record<"fr" | "ar", Copy> = {
  fr: {
    eyebrow: "Espace presse",
    title: "Kit média SantéauMaroc",
    subtitle:
      "SantéauMaroc est la plateforme de santé qui aide les Marocains à trouver un médecin, consulter des avis et prendre rendez-vous en ligne. Vous préparez un article ? Voici l'essentiel.",
    updatedLabel: "Chiffres à jour au",
    updatedHuman: "1er juillet 2026",
    statsTitle: "Chiffres clés",
    stats: STATS_FR,
    statsNote: "Chiffres arrondis, arrêtés au 1er juillet 2026 et actualisés au fil de la croissance de la plateforme.",
    boilerplateTitle: "Présentation (à reprendre)",
    boilerplateIntro: "Texte de présentation prêt à citer :",
    boilerplate:
      "SantéauMaroc est un annuaire médical et une plateforme de prise de rendez-vous en ligne au Maroc. Elle référence près de 20 000 médecins et praticiens dans 246 villes et 96 spécialités, ainsi que plus de 6 400 établissements de santé (cliniques, pharmacies, laboratoires). Disponible en français et en arabe, elle permet de comparer les praticiens, de consulter les avis de patients et de prendre rendez-vous en ligne.",
    assetsTitle: "Logos à télécharger",
    assetsIntro: "Formats vectoriel (SVG) et matriciel (PNG), libres d'usage éditorial pour parler de SantéauMaroc.",
    assets: ASSETS_FR,
    contactTitle: "Contact presse",
    contactText: "Une demande d'interview, une donnée, une illustration ? Écrivez-nous (objet : Presse).",
    contactBtn: "Écrire à l'équipe presse",
    aboutLink: "En savoir plus sur SantéauMaroc",
    usageNote:
      "Merci de ne pas modifier les logos (couleurs, proportions) et de ne pas laisser entendre un partenariat ou une approbation non convenus.",
    homeCrumb: "Accueil",
    crumb: "Presse",
  },
  ar: {
    eyebrow: "الفضاء الصحفي",
    title: "الملف الصحفي لـ SantéauMaroc",
    subtitle:
      "SantéauMaroc منصة صحية تساعد المغاربة على إيجاد طبيب، الاطلاع على الآراء وأخذ موعد عبر الإنترنت. تُعِدّ مقالاً؟ إليك الأساسي.",
    updatedLabel: "أرقام محيّنة بتاريخ",
    updatedHuman: "1 يوليوز 2026",
    statsTitle: "أرقام رئيسية",
    stats: STATS_AR,
    statsNote: "أرقام مُقرّبة، مُثبّتة بتاريخ 1 يوليوز 2026 وتُحيَّن مع نمو المنصة.",
    boilerplateTitle: "تقديم (جاهز للاقتباس)",
    boilerplateIntro: "نص جاهز للاقتباس:",
    boilerplate:
      "SantéauMaroc دليل طبي ومنصة لأخذ المواعيد عبر الإنترنت بالمغرب. تُدرِج قرابة 20 000 طبيب ومهني صحة في 246 مدينة و96 تخصصاً، إضافة إلى أكثر من 6 400 مؤسسة صحية (عيادات، صيدليات، مختبرات). متوفرة بالفرنسية والعربية، تتيح مقارنة الأطباء والاطلاع على آراء المرضى وأخذ موعد عبر الإنترنت.",
    assetsTitle: "شعارات للتحميل",
    assetsIntro: "صيغ متجهية (SVG) ونقطية (PNG)، حرّة الاستعمال التحريري للحديث عن SantéauMaroc.",
    assets: ASSETS_AR,
    contactTitle: "الاتصال الصحفي",
    contactText: "طلب مقابلة، معطى، أو صورة؟ راسلنا (الموضوع: صحافة).",
    contactBtn: "مراسلة الفريق الصحفي",
    aboutLink: "معرفة المزيد عن SantéauMaroc",
    usageNote:
      "يُرجى عدم تعديل الشعارات (الألوان، النِّسب) وعدم الإيحاء بشراكة أو موافقة غير متفق عليها.",
    homeCrumb: "الرئيسية",
    crumb: "صحافة",
  },
};

export default async function PressePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang) === "ar" ? "ar" : "fr";
  const t = COPY[locale];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE}/presse#page`,
        "name": t.title,
        "url": `${BASE}/presse`,
        "description": t.subtitle,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "dateModified": LAST_UPDATED_ISO,
        "about": { "@id": `${BASE}/#organization` },
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}/#website`, "url": BASE },
      },
      // Porte-parole rattaché à l'entité (merge par @id) — émis seulement si défini.
      ...(SPOKESPERSON_NAME
        ? [{
            "@type": "Organization",
            "@id": `${BASE}/#organization`,
            "spokesperson": {
              "@type": "Person",
              "name": SPOKESPERSON_NAME,
              ...(SPOKESPERSON_ROLE ? { "jobTitle": SPOKESPERSON_ROLE } : {}),
            },
          }]
        : []),
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.homeCrumb, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.crumb, "item": `${BASE}/presse` },
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
          <p className="text-white/75 text-lg leading-relaxed">{t.subtitle}</p>
          <p className="mt-6 text-sm text-white/60">
            {t.updatedLabel} <time dateTime={LAST_UPDATED_ISO}>{t.updatedHuman}</time>
          </p>
        </div>
      </div>

      <main className="page-outer">
        <div className="max-w-3xl mx-auto">

          {/* ── Chiffres clés ───────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{t.statsTitle}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {t.stats.map((s, i) => (
                <div key={i} className="card p-4 text-center">
                  <p dir="ltr" className="text-2xl font-black tabular-nums tracking-tight text-primary-600">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">{t.statsNote}</p>
          </section>

          {/* ── Boilerplate ─────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-1">{t.boilerplateTitle}</h2>
            <p className="text-sm text-slate-500 mb-3">{t.boilerplateIntro}</p>
            <blockquote className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 leading-relaxed select-all">
              {t.boilerplate}
            </blockquote>
          </section>

          {/* ── Logos ───────────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-1">{t.assetsTitle}</h2>
            <p className="text-sm text-slate-500 mb-4">{t.assetsIntro}</p>
            <ul className="grid sm:grid-cols-3 gap-4">
              {t.assets.map((a, i) => {
                const ext = a.href.split(".").pop()?.toUpperCase() ?? "";
                return (
                <li key={i} className="card p-4 flex flex-col">
                  <div className="flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 h-20 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.href} alt={a.label} className="max-h-10 max-w-[80%]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{a.label}</span>
                  <span className="text-xs text-slate-500 mb-3">{a.note}</span>
                  <a
                    href={a.href}
                    download
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2v8m0 0L5 7m3 3l3-3M2.5 12.5h11" />
                    </svg>
                    {ext}
                  </a>
                </li>
                );
              })}
            </ul>
            <p className="text-xs text-slate-400 mt-4">{t.usageNote}</p>
          </section>

          {/* ── Contact presse ──────────────────────────── */}
          <section>
            <div
              className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 58%, #047857 100%)" }}
            >
              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{t.contactTitle}</h2>
                <p className="text-white/75 text-sm mb-7 max-w-md mx-auto leading-relaxed">{t.contactText}</p>
                <a href={`mailto:${PRESS_EMAIL}?subject=Presse`} className="btn-ghost-white px-8 py-3">
                  {t.contactBtn}
                </a>
                <p className="mt-5">
                  <Link href="/a-propos" className="text-sm font-semibold text-white/80 hover:text-white underline underline-offset-4">
                    {t.aboutLink}
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
