import type { Locale } from "@/lib/i18n";

/**
 * Vue 404 partagée (présentation pure, Server Component).
 *
 * Utilisée par :
 *  • `app/[lang]/(site)/not-found.tsx` — `notFound()` levé dans une route
 *    existante, rendu DANS le chrome du site (navbar + footer).
 *  • `app/global-not-found.tsx` — URL ne matchant AUCUNE route, rendu en
 *    document autonome (hors chrome, hors LocaleProvider).
 *
 * → Pas de dépendance au contexte client (LocaleLink/LocaleProvider) : liens en
 *   `<a>` avec préfixe /ar calculé depuis la prop `locale`. Zéro JS côté client
 *   (le champ de recherche est un simple formulaire GET) → CWV impeccables, zéro
 *   CLS. Les libellés sont locaux à la page (aucune nouvelle clé i18n globale).
 */

type Copy = {
  code: string;
  title: string;
  lead: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchBtn: string;
  popular: string;
  home: string;
  helpPre: string;
  helpLink: string;
  trust: string;
  destinations: { label: string; desc: string }[];
  chips: { slug: string; label: string }[];
};

const COPY: Record<Locale, Copy> = {
  fr: {
    code: "Erreur 404",
    title: "Cette page est introuvable",
    lead: "Le lien est peut-être erroné ou la page a été déplacée. Pas d’inquiétude : retrouvez en un clic un médecin, une spécialité ou un établissement près de chez vous.",
    searchLabel: "Rechercher un médecin, une spécialité ou une ville",
    searchPlaceholder: "Médecin, spécialité, ville…",
    searchBtn: "Rechercher",
    popular: "Recherches fréquentes",
    home: "Retour à l’accueil",
    helpPre: "Vous ne trouvez pas ce que vous cherchez ?",
    helpLink: "Contactez notre équipe",
    trust: "Plus de 20 000 praticiens vérifiés partout au Maroc",
    destinations: [
      { label: "Trouver un médecin", desc: "Parcourez plus de 20 000 praticiens vérifiés" },
      { label: "Spécialités médicales", desc: "Explorez toutes les spécialités" },
      { label: "Médecins par ville", desc: "Casablanca, Rabat, Marrakech…" },
      { label: "Établissements de santé", desc: "Cliniques, hôpitaux et laboratoires" },
    ],
    chips: [
      { slug: "medecine-generale", label: "Médecin généraliste" },
      { slug: "cardiologie", label: "Cardiologue" },
      { slug: "pediatrie", label: "Pédiatre" },
      { slug: "dermatologie", label: "Dermatologue" },
      { slug: "gyneco-obstetrique", label: "Gynécologue" },
    ],
  },
  ar: {
    code: "خطأ 404",
    title: "الصفحة غير موجودة",
    lead: "قد يكون الرابط خاطئًا أو تم نقل الصفحة. لا تقلق: اعثر بنقرة واحدة على طبيب أو تخصص أو مؤسسة صحية بالقرب منك.",
    searchLabel: "ابحث عن طبيب أو تخصص أو مدينة",
    searchPlaceholder: "طبيب، تخصص، مدينة…",
    searchBtn: "بحث",
    popular: "عمليات بحث شائعة",
    home: "العودة إلى الرئيسية",
    helpPre: "لم تجد ما تبحث عنه؟",
    helpLink: "تواصل مع فريقنا",
    trust: "أكثر من 20 000 طبيب موثوق في جميع أنحاء المغرب",
    destinations: [
      { label: "ابحث عن طبيب", desc: "تصفّح أكثر من 20 000 طبيب موثوق" },
      { label: "التخصصات الطبية", desc: "استكشف جميع التخصصات" },
      { label: "الأطباء حسب المدينة", desc: "الدار البيضاء، الرباط، مراكش…" },
      { label: "المؤسسات الصحية", desc: "العيادات والمستشفيات والمختبرات" },
    ],
    chips: [
      { slug: "medecine-generale", label: "طب عام" },
      { slug: "cardiologie", label: "طب القلب" },
      { slug: "pediatrie", label: "طب الأطفال" },
      { slug: "dermatologie", label: "الأمراض الجلدية" },
      { slug: "gyneco-obstetrique", label: "أمراض النساء" },
    ],
  },
};

// Paths logiques (sans préfixe de locale). L'ordre suit COPY.destinations.
const DEST_PATHS = ["/praticiens", "/specialites", "/villes", "/cliniques"];

// Palette par destination — la 4ᵉ (établissements) porte le terracotta marocain,
// signal d'identité locale du Design System.
const DEST_STYLE = [
  { chip: "bg-primary-50 text-primary-600", bar: "linear-gradient(90deg,#2563eb,#3b82f6)" },
  { chip: "bg-secondary-50 text-secondary-600", bar: "linear-gradient(90deg,#059669,#10b981)" },
  { chip: "bg-accent-50 text-accent-600", bar: "linear-gradient(90deg,#d97706,#fbbf24)" },
  { chip: "bg-terra-50 text-terra-600", bar: "linear-gradient(90deg,#a84f3e,#de7848)" },
];

const DEST_ICONS = [
  // Stéthoscope / médecin
  <svg key="0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="7" r="4" /><path d="M2 18a8 8 0 0 1 16 0" /></svg>,
  // Croix médicale
  <svg key="1" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true"><path d="M9 4v5H4v2h5v5h2v-5h5v-2h-5V4H9z" /></svg>,
  // Localisation
  <svg key="2" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2C7.24 2 5 4.24 5 7c0 4.37 5 11 5 11s5-6.63 5-11c0-2.76-2.24-5-5-5z" /><circle cx="10" cy="7" r="2" /></svg>,
  // Hôpital / bâtiment
  <svg key="3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="11" rx="1" /><path d="M2 11h16M6 11V9M10 11V9M14 11V9M5 18v-4h3v4M12 18v-4h3v4" /><path d="M7 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg>,
];

export default function NotFoundView({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const prefix = locale === "ar" ? "/ar" : "";
  const href = (p: string) => (p === "/" ? prefix || "/" : `${prefix}${p}`);

  return (
    <section
      aria-labelledby="nf-title"
      className="relative isolate overflow-hidden px-4 py-16 sm:py-24"
    >
      {/* Fond décoratif — glows brand doux + zellige très discret. Purement
          esthétique (aria-hidden), n'affecte pas le contraste du texte. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgb(37 99 235 / 0.10), transparent 70%)," +
              "radial-gradient(ellipse 50% 40% at 85% 20%, rgb(5 150 105 / 0.08), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-pattern-moroccan opacity-40" />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Eyebrow — le code d'erreur, communiqué textuellement (le grand
            visuel ci-dessous est décoratif). */}
        <p className="badge-primary mb-6">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-500" />
          </span>
          {t.code}
        </p>

        {/* Emblème 4 · boussole · 4 — décoratif. La boussole évoque
            l'orientation : « on vous remet sur le bon chemin ». */}
        <div aria-hidden="true" className="mb-8 flex select-none items-center justify-center gap-2 sm:gap-4">
          <span className="text-gradient-brand text-7xl font-black leading-none tracking-tighter sm:text-8xl">4</span>
          <span className="relative inline-flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
            <span className="absolute inset-0 rounded-full bg-primary-400/15 animate-ping" />
            <span
              className="relative flex h-full w-full items-center justify-center rounded-full text-white shadow-lg"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#059669)", boxShadow: "0 12px 30px -8px rgb(37 99 235 / 0.5)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-9 w-9 sm:h-11 sm:w-11" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill="currentColor" stroke="none" />
              </svg>
            </span>
          </span>
          <span className="text-gradient-brand text-7xl font-black leading-none tracking-tighter sm:text-8xl">4</span>
        </div>

        {/* Titre + accroche rassurante */}
        <h1 id="nf-title" className="text-3xl font-bold text-slate-900 sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-500">
          {t.lead}
        </p>

        {/* Action primaire : recherche (formulaire GET, sans JS) */}
        <form
          role="search"
          action={href("/praticiens")}
          method="GET"
          className="mt-8 w-full max-w-xl"
        >
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <label htmlFor="nf-q" className="sr-only">{t.searchLabel}</label>
            <div className="relative flex-1">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true">
                <circle cx="9" cy="9" r="6" /><path d="m14 14 4 4" strokeLinecap="round" />
              </svg>
              <input
                id="nf-q"
                name="q"
                type="search"
                autoComplete="off"
                enterKeyHint="search"
                placeholder={t.searchPlaceholder}
                className="input-field h-12 w-full ps-11"
              />
            </div>
            <button type="submit" className="btn-primary h-12 shrink-0 px-6 text-base">
              {t.searchBtn}
            </button>
          </div>
        </form>

        {/* Recherches fréquentes — récupération rapide + maillage interne SEO */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-medium text-slate-400">{t.popular} :</span>
          {t.chips.map((c) => (
            <a
              key={c.slug}
              href={href(`/specialites/${c.slug}`)}
              className="tag-specialty transition-colors hover:bg-primary-100 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            >
              {c.label}
            </a>
          ))}
        </div>

        {/* Destinations principales */}
        <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {t.destinations.map((d, i) => (
            <a
              key={DEST_PATHS[i]}
              href={href(DEST_PATHS[i])}
              className="card group flex items-stretch overflow-hidden p-0 text-start"
            >
              <span aria-hidden="true" className="w-1 shrink-0" style={{ background: DEST_STYLE[i].bar }} />
              <span className="flex flex-1 items-center gap-3 p-4">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${DEST_STYLE[i].chip}`}>
                  {DEST_ICONS[i]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-primary-700">
                    {d.label}
                  </span>
                  <span className="block truncate text-xs text-slate-500">{d.desc}</span>
                </span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="ms-auto h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:text-primary-400 rtl:rotate-180" aria-hidden="true">
                  <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          ))}
        </div>

        {/* Sortie principale + secours */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <a href={href("/")} className="btn-primary h-12 px-7 text-base">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 rtl:rotate-180" aria-hidden="true">
              <path d="m10 3-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.home}
          </a>
          <p className="text-sm text-slate-500">
            {t.helpPre}{" "}
            <a href={href("/contact")} className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800">
              {t.helpLink}
            </a>
          </p>
        </div>

        {/* Réassurance */}
        <p className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-slate-400">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5 text-secondary-500" aria-hidden="true">
            <path d="M8 1.5 2.5 4v3.5c0 3 2.3 5.6 5.5 6.5 3.2-.9 5.5-3.5 5.5-6.5V4L8 1.5Z" strokeLinejoin="round" />
            <path d="m5.75 8 1.5 1.5 3-3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.trust}
        </p>
      </div>
    </section>
  );
}
