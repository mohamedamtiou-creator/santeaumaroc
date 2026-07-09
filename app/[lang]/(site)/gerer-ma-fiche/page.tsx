import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { toLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/hreflang";

type Locale = "fr" | "ar";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

/* ── Contenu bilingue (page autonome : i18n local) ───────────── */

const CONTENT = {
  fr: {
    eyebrow: "Espace praticien",
    h1Pre: "Votre fiche existe déjà ?",
    h1Highlight: "Reprenez-en le contrôle.",
    subtitle:
      "Des milliers de médecins sont déjà référencés sur SantéauMaroc. Revendiquez votre fiche pour gérer vos informations, recevoir des rendez-vous en ligne et rassurer vos patients.",
    ctaPrimary: "Trouver ma fiche",
    ctaSecondary: "Je ne suis pas référencé",
    heroNote: "Gratuit · Validation sous 24 à 48 h ouvrées",
    benefitsTitle: "Pourquoi revendiquer votre fiche",
    benefits: [
      { title: "Maîtrisez vos informations", desc: "Spécialité, adresse, horaires, tarifs, photo : tout reste à jour et exact." },
      { title: "Recevez des rendez-vous", desc: "Activez la prise de rendez-vous en ligne et réduisez les appels manqués." },
      { title: "Affichez le badge « Vérifié »", desc: "Un profil vérifié inspire confiance et ressort mieux dans les recherches." },
      { title: "Gagnez en visibilité", desc: "Votre fiche est optimisée pour le référencement et vous apporte de nouveaux patients." },
    ],
    stepsTitle: "Comment ça marche",
    stepsSubtitle: "Trois étapes, sans paperasse inutile.",
    steps: [
      { title: "Trouvez votre fiche", desc: "Recherchez votre nom dans l'annuaire et ouvrez votre profil." },
      { title: "Prouvez votre identité", desc: "Déposez votre CIN et votre diplôme — ou votre numéro d'inscription à l'Ordre." },
      { title: "C'est validé sous 24-48 h", desc: "Notre équipe vérifie votre dossier, puis la fiche vous appartient." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Comment revendiquer ma fiche ?", a: "Recherchez votre nom dans l'annuaire, ouvrez votre fiche puis cliquez sur « Revendiquer cette fiche ». Vous confirmez votre identité, déposez deux justificatifs et créez votre accès — le tout en quelques minutes." },
      { q: "Est-ce vraiment gratuit ?", a: "Oui. La revendication et la gestion de votre fiche sont entièrement gratuites." },
      { q: "Quels documents dois-je fournir ?", a: "Une copie de votre carte d'identité nationale (CIN), et au choix votre diplôme de médecine OU votre numéro d'inscription à l'Ordre National des Médecins." },
      { q: "Combien de temps prend la validation ?", a: "Notre équipe examine votre dossier sous 24 à 48 heures ouvrées et vous prévient par e-mail." },
      { q: "Ma fiche n'existe pas encore, que faire ?", a: "Créez gratuitement votre profil praticien : il sera publié après vérification, comme une revendication." },
      { q: "Mes documents sont-ils protégés ?", a: "Vos pièces sont confidentielles, stockées de façon privée, réservées à l'équipe de vérification et supprimées une fois votre fiche validée." },
    ],
    finalTitle: "Prêt à reprendre votre fiche ?",
    finalSubtitle: "Trouvez votre profil et revendiquez-le en quelques minutes.",
    breadcrumbHome: "Accueil",
    breadcrumbThis: "Gérer ma fiche",
    metaTitle: "Gérez votre fiche médecin — Revendiquez votre profil",
    metaDesc:
      "Vous êtes médecin au Maroc ? Revendiquez gratuitement votre fiche sur SantéauMaroc : gérez vos informations, recevez des rendez-vous en ligne et obtenez le badge vérifié.",
  },
  ar: {
    eyebrow: "فضاء الطبيب",
    h1Pre: "بطاقتك موجودة بالفعل؟",
    h1Highlight: "استعِد التحكم فيها.",
    subtitle:
      "آلاف الأطباء مُدرَجون بالفعل على SantéauMaroc. طالِب ببطاقتك لإدارة معلوماتك، واستقبال المواعيد عبر الإنترنت، وطمأنة مرضاك.",
    ctaPrimary: "ابحث عن بطاقتي",
    ctaSecondary: "لستُ مُدرَجاً بعد",
    heroNote: "مجاني · التحقق خلال 24 إلى 48 ساعة عمل",
    benefitsTitle: "لماذا تطالب ببطاقتك",
    benefits: [
      { title: "تحكّم في معلوماتك", desc: "التخصص، العنوان، أوقات العمل، الأسعار، الصورة: كل شيء يبقى محدّثاً ودقيقاً." },
      { title: "استقبل المواعيد", desc: "فعّل حجز المواعيد عبر الإنترنت وقلّل المكالمات الفائتة." },
      { title: "اعرض شارة «موثَّق»", desc: "الملف الموثَّق يبعث الثقة ويظهر بشكل أفضل في نتائج البحث." },
      { title: "زِد من ظهورك", desc: "بطاقتك مُحسَّنة لمحركات البحث وتجلب لك مرضى جدداً." },
    ],
    stepsTitle: "كيف تتم العملية",
    stepsSubtitle: "ثلاث خطوات، دون أوراق لا داعي لها.",
    steps: [
      { title: "ابحث عن بطاقتك", desc: "ابحث عن اسمك في الدليل وافتح ملفك." },
      { title: "أثبت هويتك", desc: "أرفِق بطاقة التعريف الوطنية وشهادتك — أو رقم تسجيلك في الهيئة." },
      { title: "يتم التحقق خلال 24-48 ساعة", desc: "يفحص فريقنا ملفك، ثم تصبح البطاقة ملكك." },
    ],
    faqTitle: "أسئلة شائعة",
    faq: [
      { q: "كيف أطالب ببطاقتي؟", a: "ابحث عن اسمك في الدليل، افتح بطاقتك ثم انقر «المطالبة بالبطاقة». تؤكّد هويتك، تُرفِق وثيقتين وتُنشئ حسابك — كل ذلك في دقائق." },
      { q: "هل هي مجانية حقاً؟", a: "نعم. المطالبة ببطاقتك وإدارتها مجانيتان بالكامل." },
      { q: "ما الوثائق المطلوبة؟", a: "نسخة من بطاقة التعريف الوطنية، وحسب اختيارك شهادة الطب أو رقم التسجيل في الهيئة الوطنية للأطباء." },
      { q: "كم يستغرق التحقق؟", a: "يفحص فريقنا ملفك خلال 24 إلى 48 ساعة عمل ويُعلِمك عبر البريد الإلكتروني." },
      { q: "بطاقتي غير موجودة بعد، ماذا أفعل؟", a: "أنشئ ملفك كطبيب مجاناً: سيُنشَر بعد التحقق، مثل المطالبة تماماً." },
      { q: "هل وثائقي محمية؟", a: "وثائقك سرّية، مُخزَّنة بشكل خاص، مخصّصة لفريق التحقق فقط وتُحذف بعد التحقق من بطاقتك." },
    ],
    finalTitle: "مستعد لاستعادة بطاقتك؟",
    finalSubtitle: "ابحث عن ملفك وطالِب به في دقائق.",
    breadcrumbHome: "الرئيسية",
    breadcrumbThis: "إدارة بطاقتي",
    metaTitle: "أدِر بطاقتك الطبية — طالِب بملفك",
    metaDesc:
      "طبيب في المغرب؟ طالِب مجاناً ببطاقتك على SantéauMaroc: أدِر معلوماتك، استقبل المواعيد عبر الإنترنت واحصل على شارة التوثيق.",
  },
} satisfies Record<Locale, unknown>;

/* ── Metadata ────────────────────────────────────────────────── */

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang) as Locale;
  const t = CONTENT[locale] ?? CONTENT.fr;
  const ogTitle = `${t.metaTitle} | SantéauMaroc`;
  return {
    title: t.metaTitle, // le template du layout ajoute « | SantéauMaroc »
    description: t.metaDesc,
    alternates: localizedAlternates("/gerer-ma-fiche", locale),
    openGraph: {
      title: ogTitle,
      description: t.metaDesc,
      url: "/gerer-ma-fiche",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: t.metaDesc },
  };
}

/* ── Icônes ──────────────────────────────────────────────────── */

const BENEFIT_ICONS = [
  <svg key="b0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h12M4 11h8M4 15h12"/><rect x="2" y="3" width="16" height="14" rx="2"/></svg>,
  <svg key="b1" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 9h14M7 3v2M13 3v2M7 13l2 2 4-4"/></svg>,
  <svg key="b2" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2L4 4.5v5C4 13.2 6.8 16.8 10 18c3.2-1.2 6-4.8 6-8.5v-5L10 2z"/><path d="m7.5 10 2 2 3-3.5"/></svg>,
  <svg key="b3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16s2-5 8-5 8 5 8 5"/><path d="M10 11V3M6 6l4-3 4 3"/></svg>,
];
const BENEFIT_COLORS = [
  "bg-primary-100 text-primary-600",
  "bg-secondary-100 text-secondary-700",
  "bg-accent-100 text-accent-700",
  "bg-terra-100 text-terra-600",
];

/* ── Page ────────────────────────────────────────────────────── */

export default async function GererMaFichePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang) as Locale;
  const t = CONTENT[locale] ?? CONTENT.fr;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE}/gerer-ma-fiche#webpage`,
        "name": t.metaTitle,
        "description": t.metaDesc,
        "url": `${BASE}/gerer-ma-fiche`,
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.breadcrumbHome, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.breadcrumbThis, "item": `${BASE}/gerer-ma-fiche` },
        ],
      },
      {
        "@type": "HowTo",
        "name": t.stepsTitle,
        "totalTime": "PT5M",
        "step": t.steps.map((s, i) => ({
          "@type": "HowToStep",
          "position": i + 1,
          "name": s.title,
          "text": s.desc,
          "url": `${BASE}/praticiens`,
        })),
      },
      {
        "@type": "FAQPage",
        "mainEntity": t.faq.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-slate-50">

        {/* ── Hero ─────────────────────────────────── */}
        <section className="hero-bg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            aria-hidden="true" />
          <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center flex flex-col items-center gap-5">
            <p className="section-eyebrow text-secondary-300">{t.eyebrow}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              {t.h1Pre}<br />
              <span className="text-secondary-300">{t.h1Highlight}</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl">
              {t.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
              <Link href="/praticiens" className="btn-primary px-7 py-3 justify-center">
                {t.ctaPrimary}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </Link>
              <Link href="/inscription-praticien" className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors">
                {t.ctaSecondary}
              </Link>
            </div>
            <p className="text-xs text-white/60 mt-1">{t.heroNote}</p>
          </div>
        </section>

        {/* ── Bénéfices ────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">{t.benefitsTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {t.benefits.map((b, i) => (
              <div key={b.title} className="card p-5 flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${BENEFIT_COLORS[i]}`}>
                  {BENEFIT_ICONS[i]}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-1">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Étapes ───────────────────────────────── */}
        <section className="bg-white border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-4 py-14 sm:py-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900">{t.stepsTitle}</h2>
              <p className="text-slate-500 mt-2">{t.stepsSubtitle}</p>
            </div>
            <ol className="grid md:grid-cols-3 gap-6">
              {t.steps.map((s, i) => (
                <li key={s.title} className="relative flex flex-col gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center text-lg">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">{t.faqTitle}</h2>
          <div className="flex flex-col gap-3">
            {t.faq.map((f) => (
              <details key={f.q} className="card p-0 group">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-slate-800 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-2xl">
                  {f.q}
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4"/></svg>
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA final ────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div className="rounded-3xl p-8 sm:p-10 text-center text-white"
            style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #047857 130%)" }}>
            <h2 className="text-2xl font-bold mb-2">{t.finalTitle}</h2>
            <p className="text-white/80 mb-6">{t.finalSubtitle}</p>
            <Link href="/praticiens" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-7 py-3 rounded-xl hover:bg-slate-50 transition-colors">
              {t.ctaPrimary}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
