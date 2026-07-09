import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import { toLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/hreflang";
import { BadgeSnippet } from "@/components/BadgeSnippet";

type Params = Promise<{ lang: string }>;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Badge « Vérifié » pour votre site — Praticiens",
    description:
      "Praticien vérifié sur SantéauMaroc ? Affichez le badge de vérification sur votre site web pour rassurer vos patients. Code d'intégration gratuit.",
    alternates: localizedAlternates("/badge", locale),
    openGraph: {
      title: "Badge « Vérifié » SantéauMaroc",
      description: "Affichez votre badge de praticien vérifié sur votre site web.",
      url: "/badge",
      type: "website",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
  };
}

type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  benefitsTitle: string;
  benefits: string[];
  yourCodeTitle: string;
  yourCodeIntro: string;
  altText: string;
  copy: string;
  copied: string;
  howTitle: string;
  howSteps: string[];
  gatedTitle: string;
  gatedText: string;
  gatedCta: string;
  homeCrumb: string;
  crumb: string;
};

const COPY: Record<"fr" | "ar", Copy> = {
  fr: {
    eyebrow: "Espace praticien",
    title: "Affichez votre badge « Vérifié »",
    subtitle:
      "Vous êtes vérifié sur SantéauMaroc ? Ajoutez le badge de vérification à votre site web : un signal de confiance pour vos patients, un lien direct vers votre fiche.",
    benefitsTitle: "Pourquoi l'afficher ?",
    benefits: [
      "Rassure vos patients : votre identité et votre qualité de praticien ont été contrôlées.",
      "Renvoie vers votre fiche : avis, horaires et prise de rendez-vous en un clic.",
      "Gratuit et sans maintenance : le badge se met à jour automatiquement.",
    ],
    yourCodeTitle: "Votre code d'intégration",
    yourCodeIntro: "Copiez ce code et collez-le à l'endroit voulu sur votre site.",
    altText: "Praticien vérifié sur SantéauMaroc",
    copy: "Copier",
    copied: "Copié !",
    howTitle: "Comment l'installer",
    howSteps: [
      "Copiez le code ci-dessus.",
      "Collez-le dans le code HTML de votre site (pied de page, page « À propos »…).",
      "Le badge s'affiche et pointe vers votre fiche SantéauMaroc.",
    ],
    gatedTitle: "Réservé aux praticiens vérifiés",
    gatedText:
      "Le badge est disponible une fois votre fiche vérifiée. Connectez-vous à votre espace praticien pour obtenir votre code.",
    gatedCta: "Accéder à mon espace praticien",
    homeCrumb: "Accueil",
    crumb: "Badge Vérifié",
  },
  ar: {
    eyebrow: "فضاء الطبيب",
    title: "اعرض شارة «موثَّق» الخاصة بك",
    subtitle:
      "هل أنت موثَّق على SantéauMaroc؟ أضف شارة التوثيق إلى موقعك الإلكتروني: إشارة ثقة لمرضاك، ورابط مباشر نحو بطاقتك.",
    benefitsTitle: "لماذا تعرضها؟",
    benefits: [
      "تطمئن مرضاك: تم التحقق من هويتك وصفتك كطبيب.",
      "تحيل إلى بطاقتك: الآراء، ساعات العمل وأخذ موعد بنقرة واحدة.",
      "مجانية وبدون صيانة: تتحدّث الشارة تلقائياً.",
    ],
    yourCodeTitle: "رمز الإدماج الخاص بك",
    yourCodeIntro: "انسخ هذا الرمز وألصقه في المكان المطلوب من موقعك.",
    altText: "طبيب موثَّق على SantéauMaroc",
    copy: "نسخ",
    copied: "تم النسخ!",
    howTitle: "كيفية التثبيت",
    howSteps: [
      "انسخ الرمز أعلاه.",
      "ألصقه في كود HTML لموقعك (تذييل الصفحة، صفحة «من نحن»…).",
      "تظهر الشارة وتشير إلى بطاقتك على SantéauMaroc.",
    ],
    gatedTitle: "مُخصَّص للأطباء الموثَّقين",
    gatedText:
      "تتوفر الشارة بمجرد توثيق بطاقتك. سجّل الدخول إلى فضاء الطبيب للحصول على رمزك.",
    gatedCta: "الولوج إلى فضاء الطبيب",
    homeCrumb: "الرئيسية",
    crumb: "شارة موثَّق",
  },
};

/** Aperçu statique du badge (utilisé quand le visiteur n'est pas un praticien vérifié connecté). */
function BadgePreview({ label }: { label: string }) {
  return (
    <svg width="220" height="56" viewBox="0 0 220 56" role="img" aria-label={label}>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="219" height="55" rx="11" fill="#ffffff" stroke="#e2e8f0" />
      <rect x="0.5" y="0.5" width="219" height="4" rx="2" fill="url(#bg)" />
      <circle cx="34" cy="30" r="15" fill="url(#bg)" />
      <path d="M27 30.5l4.5 4.5L42 25" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="60" y="27" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="700" fill="#0f172a">Praticien vérifié</text>
      <text x="60" y="43" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="600" fill="#2563eb">santeaumaroc.com</text>
    </svg>
  );
}

export default async function BadgePage({ params }: { params: Params }) {
  const locale = toLocale((await params).lang);
  const t = COPY[locale];

  // Session lue SANS redirection (page publique) : personnalise si praticien vérifié.
  const session = await decrypt((await cookies()).get("session")?.value);
  let mySlug: string | null = null;
  if (session?.userId && session.role === "DOCTOR") {
    const d = await prisma.doctor.findUnique({
      where: { userId: session.userId as string },
      select: { slug: true, isVerified: true, isActive: true },
    });
    if (d?.isVerified && d.isActive && d.slug) mySlug = d.slug;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE}/badge#page`,
        "name": t.title,
        "url": `${BASE}/badge`,
        "description": t.subtitle,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}/#website`, "url": BASE },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.homeCrumb, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.crumb, "item": `${BASE}/badge` },
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
        </div>
      </div>

      <main className="page-outer">
        <div className="max-w-3xl mx-auto">

          {/* ── Bénéfices ───────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t.benefitsTitle}</h2>
            <ul className="space-y-2">
              {t.benefits.map((b, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25"
                    className="w-4 h-4 mt-1 shrink-0 text-secondary-600 rtl:-scale-x-100" aria-hidden="true"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5l3.5 3.5L13 5" />
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Code (personnalisé) ou aperçu (verrouillé) ── */}
          {mySlug ? (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-1">{t.yourCodeTitle}</h2>
              <p className="text-sm text-slate-500 mb-4">{t.yourCodeIntro}</p>
              <BadgeSnippet
                profileUrl={`${BASE}/praticiens/${mySlug}`}
                badgeUrl={`${BASE}/api/badge/${mySlug}`}
                altText={t.altText}
                copyLabel={t.copy}
                copiedLabel={t.copied}
              />
            </section>
          ) : (
            <section className="mb-10">
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 mb-4">
                <BadgePreview label={t.altText} />
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
                <p className="text-sm font-bold text-amber-800 mb-1">{t.gatedTitle}</p>
                <p className="text-sm text-amber-900/80 leading-relaxed mb-4">{t.gatedText}</p>
                <Link href="/praticien/tableau-de-bord" className="btn-primary text-sm px-5 py-2.5 inline-flex">
                  {t.gatedCta}
                </Link>
              </div>
            </section>
          )}

          {/* ── Installation ────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t.howTitle}</h2>
            <ol className="space-y-2 list-decimal ps-5 text-sm text-slate-700 leading-relaxed">
              {t.howSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </>
  );
}
