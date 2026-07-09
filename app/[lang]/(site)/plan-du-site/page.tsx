import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { toLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/hreflang";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

// Dernière révision de la structure du plan du site (E-E-A-T : signal de fraîcheur).
const LAST_UPDATED_ISO = "2026-07-02";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Plan du site — toutes les pages de SantéauMaroc",
    description:
      "Retrouvez d'un coup d'œil toutes les rubriques de SantéauMaroc : annuaire des praticiens, spécialités, villes, établissements de santé, blog, questions/réponses, espace praticien et informations légales.",
    alternates: localizedAlternates("/plan-du-site", locale),
    openGraph: {
      title: "Plan du site — SantéauMaroc",
      description:
        "Toutes les rubriques de SantéauMaroc : praticiens, spécialités, villes, établissements, ressources santé et espace praticien.",
      url: "/plan-du-site",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Plan du site — SantéauMaroc",
      description: "Toutes les rubriques et pages de SantéauMaroc, organisées par thème.",
    },
  };
}

/* ── Icônes de rubriques (inline SVG, aucune requête réseau → CWV) ───────── */
type IconKey = "search" | "building" | "book" | "stethoscope" | "info" | "shield";

const ICONS: Record<IconKey, React.ReactNode> = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
      <path d="M4 21h16M6 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M14 9h3a1 1 0 0 1 1 1v11" />
      <path d="M9 8h2M9 12h2M9 16h2" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19a2 2 0 0 0 2 2h12" />
      <path d="M8 7h6M8 11h6" />
    </svg>
  ),
  stethoscope: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <path d="M10 16v1a5 5 0 0 0 10 0v-2" />
      <circle cx="20" cy="12" r="2" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
};

type SiteLink = { href: string; label: string; desc: string };
type Group = { id: string; icon: IconKey; title: string; links: SiteLink[] };
type Copy = {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  updatedLabel: string;
  updatedHuman: string;
  tocLabel: string;
  pagesLabel: (n: number) => string;
  groups: Group[];
  machineTitle: string;
  machineDesc: string;
  machineBtn: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaBtn: string;
  homeCrumb: string;
  crumb: string;
};

const COPY: Record<"fr" | "ar", Copy> = {
  fr: {
    eyebrow: "Navigation",
    heroTitle: "Plan du site",
    heroSubtitle:
      "Toutes les rubriques de SantéauMaroc réunies sur une seule page. Trouvez rapidement un praticien, un établissement de santé, un article ou une information pratique.",
    updatedLabel: "Dernière mise à jour",
    updatedHuman: "2 juillet 2026",
    tocLabel: "Rubriques",
    pagesLabel: (n) => (n > 1 ? `${n} pages` : `${n} page`),
    groups: [
      {
        id: "praticiens",
        icon: "search",
        title: "Trouver un praticien",
        links: [
          { href: "/praticiens", label: "Annuaire des praticiens", desc: "Tous les médecins et professionnels de santé, filtrables par spécialité et par ville." },
          { href: "/specialites", label: "Spécialités médicales", desc: "Parcourir les praticiens par spécialité : cardiologie, dermatologie, pédiatrie…" },
          { href: "/villes", label: "Villes du Maroc", desc: "Trouver un praticien près de chez vous, ville par ville." },
        ],
      },
      {
        id: "etablissements",
        icon: "building",
        title: "Établissements de santé",
        links: [
          { href: "/cliniques", label: "Cliniques & hôpitaux", desc: "Établissements de soins référencés partout au Maroc." },
          { href: "/pharmacies", label: "Pharmacies", desc: "Pharmacies et pharmacies de garde à proximité." },
          { href: "/laboratoires", label: "Laboratoires d'analyses", desc: "Laboratoires d'analyses médicales et d'imagerie." },
          { href: "/medicaments", label: "Médicaments", desc: "Base d'information sur les médicaments disponibles au Maroc." },
        ],
      },
      {
        id: "ressources",
        icon: "book",
        title: "Ressources & information santé",
        links: [
          { href: "/blog", label: "Blog santé", desc: "Articles de prévention et de vulgarisation, relus médicalement." },
          { href: "/questions", label: "Questions / Réponses", desc: "Posez vos questions ; des médecins vérifiés y répondent." },
          { href: "/sante-darija", label: "Santé en darija", desc: "L'information santé expliquée en darija marocaine." },
          { href: "/remboursement-amo-cnss", label: "Remboursement AMO / CNSS", desc: "Comprendre le remboursement de vos soins et démarches." },
          { href: "/observatoire-sante-maroc", label: "Observatoire de la santé", desc: "Données et tendances de la santé au Maroc." },
        ],
      },
      {
        id: "praticien-pro",
        icon: "stethoscope",
        title: "Espace praticien",
        links: [
          { href: "/inscription-praticien", label: "Inscription praticien", desc: "Créer votre fiche et développer votre cabinet en ligne." },
          { href: "/gerer-ma-fiche", label: "Gérer ma fiche", desc: "Revendiquer et mettre à jour votre fiche existante." },
          { href: "/guide-du-medecin", label: "Guide du médecin", desc: "Votre cabinet en ligne en 10 minutes, étape par étape." },
          { href: "/badge", label: "Badge vérifié", desc: "En quoi consiste la vérification et comment l'obtenir." },
          { href: "/tarifs", label: "Tarifs & abonnements", desc: "Nos offres pour les praticiens, du gratuit au Premium." },
        ],
      },
      {
        id: "a-propos",
        icon: "info",
        title: "À propos & contact",
        links: [
          { href: "/a-propos", label: "À propos", desc: "Notre mission et notre équipe." },
          { href: "/contact", label: "Contact", desc: "Nous écrire ou signaler une information." },
          { href: "/presse", label: "Espace presse", desc: "Ressources et contact pour les journalistes." },
          { href: "/support", label: "Aide & support", desc: "Réponses aux questions fréquentes et assistance." },
        ],
      },
      {
        id: "legal",
        icon: "shield",
        title: "Confiance & mentions légales",
        links: [
          { href: "/charte-editoriale", label: "Charte éditoriale & transparence", desc: "Comment nous produisons et vérifions nos contenus." },
          { href: "/conditions-utilisation", label: "Conditions d'utilisation", desc: "Les règles d'usage de la plateforme." },
          { href: "/politique-confidentialite", label: "Politique de confidentialité", desc: "Comment vos données sont protégées." },
        ],
      },
    ],
    machineTitle: "Plan du site pour les moteurs",
    machineDesc:
      "Un plan du site XML est également disponible pour les moteurs de recherche et les moteurs de réponse par IA.",
    machineBtn: "Voir le sitemap XML",
    ctaTitle: "Vous cherchez un médecin ?",
    ctaDesc: "Trouvez un praticien vérifié et prenez rendez-vous en quelques clics.",
    ctaBtn: "Trouver un praticien",
    homeCrumb: "Accueil",
    crumb: "Plan du site",
  },
  ar: {
    eyebrow: "التصفّح",
    heroTitle: "خريطة الموقع",
    heroSubtitle:
      "كل أقسام «الصحة في المغرب» مجمّعة في صفحة واحدة. اعثر بسرعة على طبيب، أو مؤسسة صحية، أو مقال، أو معلومة عملية.",
    updatedLabel: "آخر تحديث",
    updatedHuman: "2 يوليوز 2026",
    tocLabel: "الأقسام",
    pagesLabel: (n) => (n > 1 ? `${n} صفحات` : `صفحة واحدة`),
    groups: [
      {
        id: "praticiens",
        icon: "search",
        title: "البحث عن طبيب",
        links: [
          { href: "/praticiens", label: "دليل الأطباء", desc: "جميع الأطباء ومهنيي الصحة، مع الترشيح حسب التخصص والمدينة." },
          { href: "/specialites", label: "التخصّصات الطبية", desc: "تصفّح الأطباء حسب التخصص: أمراض القلب، الجلد، الأطفال…" },
          { href: "/villes", label: "مدن المغرب", desc: "اعثر على طبيب قريب منك، مدينةً مدينة." },
        ],
      },
      {
        id: "etablissements",
        icon: "building",
        title: "المؤسسات الصحية",
        links: [
          { href: "/cliniques", label: "العيادات والمستشفيات", desc: "مؤسسات العلاج المُدرَجة في كل أنحاء المغرب." },
          { href: "/pharmacies", label: "الصيدليات", desc: "الصيدليات وصيدليات الحراسة القريبة منك." },
          { href: "/laboratoires", label: "مختبرات التحاليل", desc: "مختبرات التحاليل الطبية والتصوير." },
          { href: "/medicaments", label: "الأدوية", desc: "قاعدة معلومات حول الأدوية المتوفرة بالمغرب." },
        ],
      },
      {
        id: "ressources",
        icon: "book",
        title: "موارد ومعلومات صحية",
        links: [
          { href: "/blog", label: "مدوّنة الصحة", desc: "مقالات وقائية وتبسيطية، مُراجَعة طبياً." },
          { href: "/questions", label: "الأسئلة والأجوبة", desc: "اطرح أسئلتك، ويجيب عنها أطباء مُوثَّقون." },
          { href: "/sante-darija", label: "الصحة بالدارجة", desc: "المعلومة الصحية مشروحة بالدارجة المغربية." },
          { href: "/remboursement-amo-cnss", label: "التعويض AMO / CNSS", desc: "فهم تعويض مصاريف العلاج والإجراءات." },
          { href: "/observatoire-sante-maroc", label: "مرصد الصحة", desc: "معطيات واتجاهات الصحة بالمغرب." },
        ],
      },
      {
        id: "praticien-pro",
        icon: "stethoscope",
        title: "فضاء الطبيب",
        links: [
          { href: "/inscription-praticien", label: "تسجيل الطبيب", desc: "أنشئ بطاقتك وطوّر عيادتك على الإنترنت." },
          { href: "/gerer-ma-fiche", label: "إدارة بطاقتي", desc: "المطالبة ببطاقتك القائمة وتحديثها." },
          { href: "/guide-du-medecin", label: "دليل الطبيب", desc: "عيادتك على الإنترنت في 10 دقائق، خطوة بخطوة." },
          { href: "/badge", label: "علامة موثَّق", desc: "ما هي عملية التوثيق وكيفية الحصول عليها." },
          { href: "/tarifs", label: "الأسعار والاشتراكات", desc: "عروضنا للأطباء، من المجاني إلى بريميوم." },
        ],
      },
      {
        id: "a-propos",
        icon: "info",
        title: "من نحن والتواصل",
        links: [
          { href: "/a-propos", label: "من نحن", desc: "مهمّتنا وفريقنا." },
          { href: "/contact", label: "اتصل بنا", desc: "راسلنا أو أبلغ عن معلومة." },
          { href: "/presse", label: "فضاء الصحافة", desc: "موارد وتواصل للصحفيين." },
          { href: "/support", label: "المساعدة والدعم", desc: "أجوبة الأسئلة الشائعة والمساعدة." },
        ],
      },
      {
        id: "legal",
        icon: "shield",
        title: "الثقة والإشعارات القانونية",
        links: [
          { href: "/charte-editoriale", label: "الميثاق التحريري والشفافية", desc: "كيف ننتج محتوانا ونتحقق منه." },
          { href: "/conditions-utilisation", label: "شروط الاستعمال", desc: "قواعد استخدام المنصّة." },
          { href: "/politique-confidentialite", label: "سياسة الخصوصية", desc: "كيف تُحمى بياناتك." },
        ],
      },
    ],
    machineTitle: "خريطة الموقع لمحرّكات البحث",
    machineDesc:
      "تتوفر أيضاً خريطة موقع بصيغة XML موجّهة لمحرّكات البحث ومحرّكات الإجابة بالذكاء الاصطناعي.",
    machineBtn: "عرض خريطة XML",
    ctaTitle: "هل تبحث عن طبيب؟",
    ctaDesc: "اعثر على طبيب موثَّق واحجز موعدك في بضع نقرات.",
    ctaBtn: "ابحث عن طبيب",
    homeCrumb: "الرئيسية",
    crumb: "خريطة الموقع",
  },
};

export default async function PlanDuSitePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang) === "ar" ? "ar" : "fr";
  const t = COPY[locale];
  const inLang = locale === "ar" ? "ar-MA" : "fr-MA";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE}/plan-du-site#page`,
        "name": t.heroTitle,
        "url": `${BASE}/plan-du-site`,
        "description": t.heroSubtitle,
        "inLanguage": inLang,
        "dateModified": LAST_UPDATED_ISO,
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}/#website`, "url": BASE },
        "publisher": {
          "@type": "Organization",
          "@id": `${BASE}/#organization`,
          "name": "SantéauMaroc",
          "url": BASE,
          "logo": `${BASE}/logo.svg`,
        },
      },
      // SiteNavigationElement : aide les moteurs (dont les IA) à comprendre la structure du site.
      {
        "@type": "ItemList",
        "@id": `${BASE}/plan-du-site#nav`,
        "name": t.heroTitle,
        "itemListElement": t.groups.flatMap((g) =>
          g.links.map((l) => ({
            "@type": "SiteNavigationElement",
            "name": l.label,
            "description": l.desc,
            "url": `${BASE}${l.href}`,
          })),
        ),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.homeCrumb, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.crumb, "item": `${BASE}/plan-du-site` },
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
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <p className="section-eyebrow text-secondary-300 mb-4">{t.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-2xl">{t.heroSubtitle}</p>
          <p className="mt-6 text-sm text-white/60">
            {t.updatedLabel} : <time dateTime={LAST_UPDATED_ISO}>{t.updatedHuman}</time>
          </p>
        </div>
      </div>

      <main className="page-outer">
        {/* ── Sommaire (ancres profondes + éligibilité sitelinks) ── */}
        <nav aria-label={t.tocLabel} className="mb-10 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{t.tocLabel}</p>
          <ol className="flex flex-wrap gap-x-6 gap-y-1.5">
            {t.groups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline leading-relaxed rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Rubriques ────────────────────────────────────── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.groups.map((g) => (
            <section
              key={g.id}
              id={g.id}
              aria-labelledby={`${g.id}-title`}
              className="card p-6 scroll-mt-24 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600 shrink-0">
                  {ICONS[g.icon]}
                </span>
                <div className="min-w-0">
                  <h2 id={`${g.id}-title`} className="text-base font-bold text-slate-900 leading-tight">
                    {g.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{t.pagesLabel(g.links.length)}</p>
                </div>
              </div>

              <ul className="space-y-1 -mx-2">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="w-3.5 h-3.5 mt-1 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                      >
                        <path d="M6 3l5 5-5 5" />
                      </svg>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-800 group-hover:text-primary-700 transition-colors">
                          {l.label}
                        </span>
                        <span className="block text-xs text-slate-500 leading-relaxed mt-0.5">{l.desc}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* ── Plan du site machine (XML) ───────────────────── */}
        <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M4 9h16M9 4v16" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-slate-900">{t.machineTitle}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mt-0.5">{t.machineDesc}</p>
          </div>
          {/* Fichier XML : lien natif non préfixé par la locale (ressource unique). */}
          <a
            href="/sitemap.xml"
            className="btn-outline px-5 py-2.5 shrink-0 whitespace-nowrap"
            rel="nofollow"
          >
            {t.machineBtn}
          </a>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="mt-10">
          <div
            className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 58%, #047857 100%)" }}
          >
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{t.ctaTitle}</h2>
              <p className="text-white/75 text-sm mb-7 max-w-md mx-auto leading-relaxed">{t.ctaDesc}</p>
              <Link href="/praticiens" className="btn-ghost-white px-8 py-3">{t.ctaBtn}</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
