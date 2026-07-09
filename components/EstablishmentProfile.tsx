import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { EstablishmentReviewDialog, type EstabExistingReview } from "@/components/EstablishmentReviewDialog";

type EstabT = Dictionary["estab"];

/* ── Types ──────────────────────────────────────────────── */

export type EstablishmentData = {
  id: string;
  nom: string;
  slug: string;
  type: string | null;
  adresse: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  averageRating: number;
  isVerified: boolean;
  latitude: number | null;
  longitude: number | null;
  geoApprox: boolean;
  city: { name: string; slug: string };
  reviews: {
    id: string;
    auteur: string | null;
    note: number;
    commentaire: string | null;
    createdAt: Date;
  }[];
  _count: { reviews: number };
};

type Props = {
  establishment: EstablishmentData;
  listHref: string;
  listLabel: string;
  /** Session : conditionne le déclencheur (ouvrir la modale vs rediriger vers connexion). */
  isLoggedIn: boolean;
  /** Avis existant de l'utilisateur connecté sur cet établissement (édition). */
  existingReview: EstabExistingReview;
  /** Locale portée par l'URL (params.lang) — PAS getLocale() : évite une lecture
   *  d'en-tête/cookie et le bug locale cookie-vs-URL. */
  locale: Locale;
};

/* ── Helpers ─────────────────────────────────────────────── */

function relativeDate(date: Date, t: EstabT): string {
  const diffMs   = new Date().getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 1)  return t.today;
  if (diffDays < 7)  return (diffDays > 1 ? t.daysAgo : t.dayAgo).replace("{n}", String(diffDays));
  const diffW = Math.floor(diffDays / 7);
  if (diffW < 5)     return (diffW > 1 ? t.weeksAgo : t.weekAgo).replace("{n}", String(diffW));
  const diffM = Math.floor(diffDays / 30);
  if (diffM < 12)    return t.monthsAgo.replace("{n}", String(diffM));
  const diffY = Math.floor(diffDays / 365);
  return (diffY > 1 ? t.yearsAgo : t.yearAgo).replace("{n}", String(diffY));
}

function avatarColor(name: string): { bg: string; text: string } {
  const palettes = [
    { bg: "bg-primary-100",   text: "text-primary-700"   },
    { bg: "bg-secondary-100", text: "text-secondary-700" },
    { bg: "bg-violet-100",    text: "text-violet-700"    },
    { bg: "bg-rose-100",      text: "text-rose-700"      },
    { bg: "bg-orange-100",    text: "text-orange-700"    },
    { bg: "bg-teal-100",      text: "text-teal-700"      },
  ];
  return palettes[(name ?? "A").charCodeAt(0) % palettes.length];
}

function noteColor(note: number): string {
  if (note >= 4) return "text-emerald-600";
  if (note === 3) return "text-amber-600";
  return "text-rose-500";
}

/* ── Config par type ─────────────────────────────────────── */

const TYPE_CONFIG: Record<string, { bg: string; text: string; iconBg: string }> = {
  clinique:                       { bg: "bg-primary-50",   text: "text-primary-700",   iconBg: "bg-primary-100"   },
  "hôpital":                      { bg: "bg-red-50",       text: "text-red-700",       iconBg: "bg-red-100"       },
  cabinet:                        { bg: "bg-secondary-50", text: "text-secondary-700", iconBg: "bg-secondary-100" },
  laboratoire:                    { bg: "bg-indigo-50",    text: "text-indigo-700",    iconBg: "bg-indigo-100"    },
  pharmacie:                      { bg: "bg-accent-50",    text: "text-accent-700",    iconBg: "bg-accent-100"    },
  "établissement pharmaceutique": { bg: "bg-accent-50",    text: "text-accent-700",    iconBg: "bg-accent-100"    },
};

function getTypeCfg(type: string | null) {
  return TYPE_CONFIG[type ?? ""] ?? {
    bg: "bg-slate-50", text: "text-slate-700", iconBg: "bg-slate-100",
  };
}

/** Libellé traduit (singulier) d'un type d'établissement. */
function typeLabel(type: string | null, t: EstabT): string {
  switch (type) {
    case "clinique":                       return t.typeClinique;
    case "hôpital":                        return t.typeHopital;
    case "cabinet":                        return t.typeCabinet;
    case "laboratoire":                    return t.typeLaboratoire;
    case "pharmacie":                      return t.typePharmacie;
    case "établissement pharmaceutique":   return t.typePharmaEtab;
    default:                               return type ?? t.typeFallback;
  }
}

/** Libellé traduit (pluriel) — pour le lien « Voir d'autres … ». */
function typePluralLabel(type: string | null, t: EstabT): string {
  switch (type) {
    case "clinique":                       return t.typePluralClinique;
    case "hôpital":                        return t.typePluralHopital;
    case "cabinet":                        return t.typePluralCabinet;
    case "laboratoire":                    return t.typePluralLaboratoire;
    case "pharmacie":                      return t.typePluralPharmacie;
    case "établissement pharmaceutique":   return t.typePluralPharmaEtab;
    default:                               return t.typePluralFallback;
  }
}

/* ── Icônes ─────────────────────────────────────────────── */

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true">
      <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25"
      className={className ?? "w-3.5 h-3.5"} aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l4 4 6-6"/>
    </svg>
  );
}

function EstabIcon({ type, className }: { type: string | null; className?: string }) {
  const cls = className ?? "w-8 h-8";
  if (type === "hôpital" || type === "clinique") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        className={cls} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="14" rx="2"/>
        <path d="M3 11h18M9 11v10M15 11v10M9 4h6v3H9z"/>
        <path d="M11.5 15h1m-.5-1.5v3"/>
      </svg>
    );
  }
  if (type === "laboratoire") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        className={cls} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6M8.5 3 4.5 13a5 5 0 0 0 7.5 4.33A5 5 0 0 0 19.5 13L15.5 3"/>
        <path d="M7.5 13h9"/>
      </svg>
    );
  }
  if (type === "pharmacie" || type === "établissement pharmaceutique") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        className={cls} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={cls} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="14" rx="2"/>
      <path d="M3 11h18M12 7V5M10 15h4M12 13v4"/>
    </svg>
  );
}

/* ── Icônes de contact ──────────────────────────────────── */

function AddressIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true">
      <path d="M10 2C7.24 2 5 4.24 5 7c0 4.38 5 10 5 10s5-5.62 5-10c0-2.76-2.24-5-5-5z"/>
      <circle cx="10" cy="7" r="2"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true">
      <path d="M3 5a2 2 0 0 1 2-2h1.5a1 1 0 0 1 .97.757l.6 2.4a1 1 0 0 1-.27.976L6.6 8.35a11 11 0 0 0 5.05 5.05l1.217-1.2a1 1 0 0 1 .976-.27l2.4.6A1 1 0 0 1 17 13.5V15a2 2 0 0 1-2 2h-.5C7.954 17 3 12.046 3 5.5V5z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true">
      <rect x="2" y="5" width="16" height="12" rx="2"/>
      <path d="m2 7 8 5 8-5"/>
    </svg>
  );
}

function WebIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="8"/>
      <path d="M2 10h16M10 2c-2.5 3-4 5-4 8s1.5 5 4 8M10 2c2.5 3 4 5 4 8s-1.5 5-4 8"/>
    </svg>
  );
}

/* ── Étoiles ─────────────────────────────────────────────── */

function StarIcon({ filled, half, className }: { filled: boolean; half?: boolean; className?: string }) {
  const cls = className ?? "w-4 h-4";
  if (half) {
    return (
      <svg viewBox="0 0 16 16" className={cls} aria-hidden="true">
        <defs>
          <linearGradient id="star-half-grad">
            <stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="50%" stopColor="transparent"/>
          </linearGradient>
        </defs>
        <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.13L8 10.25 4.29 12.41 5 8.28 2 5.35l4.15-.6z"
          fill="url(#star-half-grad)" stroke="#fbbf24" strokeWidth="1.25"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16"
      fill={filled ? "#fbbf24" : "none"}
      stroke={filled ? "#fbbf24" : "#d1d5db"}
      strokeWidth="1.25"
      className={cls} aria-hidden="true">
      <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.13L8 10.25 4.29 12.41 5 8.28 2 5.35l4.15-.6z"/>
    </svg>
  );
}

function StarsRow({ rating, size = "md", label }: { rating: number; size?: "sm" | "md" | "lg"; label: string }) {
  const cls = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half   = !filled && i < rating;
        return <StarIcon key={i} filled={filled} half={half} className={cls}/>;
      })}
    </div>
  );
}

/* ── Sous-composants avis ────────────────────────────────── */

function RatingSummary({
  averageRating, totalCount, reviews, t,
}: {
  averageRating: number; totalCount: number; reviews: { note: number }[]; t: EstabT;
}) {
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.note === star).length;
    const pct   = totalCount > 0 ? (count / totalCount) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-1"
      style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}>
      <div className="flex gap-6 items-center">
        <div className="text-center shrink-0 min-w-[80px]">
          <p className="text-[3.25rem] font-black leading-none text-slate-900 tracking-tight">
            {averageRating.toFixed(1)}
          </p>
          <StarsRow rating={averageRating} size="md" label={`${t.ratingAria} ${averageRating} ${t.ratingOf5}`}/>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">{totalCount} {t.reviews}</p>
        </div>
        <div className="w-px self-stretch bg-slate-100 shrink-0"/>
        <div className="flex-1 space-y-1.5">
          {dist.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 w-3 text-end shrink-0">{star}</span>
              <StarIcon filled className="w-3 h-3 shrink-0"/>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}/>
              </div>
              <span className="text-xs text-slate-500 w-4 text-end shrink-0 tabular-nums">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, t }: {
  review: { id: string; auteur: string | null; note: number; commentaire: string | null; createdAt: Date };
  t: EstabT;
}) {
  const auteur  = review.auteur || t.anonymous;
  const initial = auteur.charAt(0).toUpperCase();
  const colors  = avatarColor(initial);
  const nColor  = noteColor(review.note);

  return (
    <article className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 transition-all duration-200 hover:border-slate-200 hover:shadow-sm"
      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 font-bold text-sm`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="font-semibold text-sm text-slate-900 leading-snug truncate max-w-[200px] sm:max-w-none">
              {auteur}
            </p>
            <time dateTime={review.createdAt.toISOString()}
              className="text-xs text-slate-500 shrink-0 mt-0.5">
              {relativeDate(review.createdAt, t)}
            </time>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarsRow rating={review.note} size="sm" label={`${t.ratingAria} ${review.note} ${t.ratingOf5}`}/>
            <span className={`text-xs font-bold ${nColor}`}>{review.note}/5</span>
          </div>
        </div>
      </div>
      {review.commentaire && (
        <blockquote className="mt-3 text-sm text-slate-700 leading-relaxed ps-[52px]">
          {review.commentaire}
        </blockquote>
      )}
    </article>
  );
}

function EmptyReviews({ t, trigger }: { t: EstabT; trigger: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5"
          className="w-7 h-7" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 4.87 5.38.78-3.89 3.79.92 5.36L12 14.27l-4.81 2.53.92-5.36L4.22 7.65l5.38-.78z"/>
        </svg>
      </div>
      <h3 className="font-semibold text-slate-700 text-sm">{t.emptyReviewsTitle}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[220px] mx-auto mb-5">
        {t.emptyReviewsText}
      </p>
      {/* Entrée « étoile-first » (dépôt d'avis) */}
      <div className="flex justify-center">{trigger}</div>
    </div>
  );
}

/* ── Composant principal ─────────────────────────────────── */

export async function EstablishmentProfile({
  establishment: e,
  listHref,
  listLabel,
  isLoggedIn,
  existingReview,
  locale,
}: Props) {
  const dict             = getDictionary(locale);
  const t                = dict.estab;
  const rt               = dict.review;
  const cfg              = getTypeCfg(e.type);
  const label            = typeLabel(e.type, t);
  const hasContact       = !!(e.phone || e.email || e.website);
  const avgColor         = noteColor(e.averageRating);

  // Libellés des déclencheurs d'avis (réutilise estab + review, pas de nouvelle clé i18n).
  const reviewLabels = {
    leave:       t.leaveReview,
    edit:        rt.titleEdit,
    leaveAria:   t.leaveReviewAria,
    editAria:    rt.titleEdit,
    firstPrompt: t.leaveReview,
  };
  const reviewDialogProps = {
    establishmentId:   e.id,
    slug:              e.slug,
    basePath:          listHref,
    establishmentName: e.nom,
    isLoggedIn,
    existingReview,
    labels:            reviewLabels,
    t:                 rt,
  };

  return (
    <div className="page-outer max-w-3xl">

      {/* ── Breadcrumb ──────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5 flex-wrap" aria-label={t.breadcrumbAria}>
        <Link href={listHref} className="hover:text-primary-600 transition-colors">{listLabel}</Link>
        <ChevronIcon/>
        <Link href={`${listHref}?ville=${e.city.slug}`} className="hover:text-primary-600 transition-colors">
          {e.city.name}
        </Link>
        <ChevronIcon/>
        <span className="text-slate-700 font-medium truncate max-w-[160px]">{e.nom}</span>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <div className="card overflow-hidden p-0 mb-4">
        {/* Bande dégradée */}
        <div className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }}/>

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Icône établissement */}
            <div className={`w-16 h-16 rounded-2xl ${cfg.iconBg} ${cfg.text} flex items-center justify-center shrink-0`}>
              <EstabIcon type={e.type} className="w-8 h-8"/>
            </div>

            <div className="flex-1 min-w-0">
              {/* Nom + badge vérifié */}
              <div className="flex items-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug flex-1">
                  {e.nom}
                </h1>
                {e.isVerified && (
                  <span className="badge-verified shrink-0 mt-0.5 flex items-center gap-1">
                    <CheckIcon className="w-3 h-3"/>
                    {t.verified}
                  </span>
                )}
              </div>

              {/* Type badge */}
              {e.type && (
                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full mt-1.5 ${cfg.bg} ${cfg.text}`}>
                  {label}
                </span>
              )}

              {/* Note + lien vers avis */}
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {e.averageRating > 0 ? (
                  <>
                    <StarsRow rating={e.averageRating} size="sm" label={`${t.ratingAria} ${e.averageRating} ${t.ratingOf5}`}/>
                    <span className={`text-sm font-bold tabular-nums ${avgColor}`}>
                      {e.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({e._count.reviews} {t.reviews})
                    </span>
                    <a href="#avis"
                      className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors">
                      {t.seeReviews}
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <StarsRow rating={0} size="sm" label={`${t.ratingAria} 0 ${t.ratingOf5}`}/>
                    {t.noReviews}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {e.description && (
            <p className="mt-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
              {e.description}
            </p>
          )}

          {/* Adresse dans le hero (toujours visible) */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-sm text-slate-600">
            <AddressIcon/>
            <bdi>{e.adresse}, {e.city.name}</bdi>
          </div>

        </div>
      </div>

      {/* ── Coordonnées ───────────────────────────── */}
      {hasContact && (
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-bold text-slate-700 mb-3.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-3.5 h-3.5 text-primary-600" aria-hidden="true">
                <path d="M3 3a1 1 0 0 1 1-1h1a1 1 0 0 1 .97.757l.5 2a1 1 0 0 1-.27.976l-.8.79a9 9 0 0 0 4.07 4.07l.79-.8a1 1 0 0 1 .976-.27l2 .5A1 1 0 0 1 14 11v1a1 1 0 0 1-1 1h-.5C6.82 13 3 9.18 3 4.5V4a1 1 0 0 1 0-.5V3z"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {t.contactTitle}
          </h2>
          <div className="space-y-3">
            {e.phone && (
              <a href={`tel:${e.phone}`}
                className="flex items-center gap-3 text-sm text-secondary-700 hover:text-secondary-800 group">
                <span className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center shrink-0">
                  <PhoneIcon/>
                </span>
                <span className="group-hover:underline font-medium"><bdi dir="ltr">{e.phone}</bdi></span>
              </a>
            )}
            {e.email && (
              <a href={`mailto:${e.email}`}
                className="flex items-center gap-3 text-sm text-secondary-700 hover:text-secondary-800 group">
                <span className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center shrink-0">
                  <EmailIcon/>
                </span>
                <span className="group-hover:underline truncate font-medium">{e.email}</span>
              </a>
            )}
            {e.website && (
              <a href={e.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-primary-600 hover:text-primary-700 group">
                <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <WebIcon/>
                </span>
                <span className="group-hover:underline truncate font-medium">
                  {e.website.replace(/^https?:\/\//, "")}
                </span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Voir d'autres dans la ville ───────────── */}
      <Link href={`${listHref}?ville=${e.city.slug}`}
        className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary-200 hover:bg-primary-50 transition-colors group mb-5"
        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.04)" }}>
        <span className="text-sm font-medium text-slate-700 group-hover:text-primary-700 transition-colors">
          {t.seeOthers.split("{type}").map((part, i) => (
            <span key={i}>
              {part.replace("{city}", e.city.name)}
              {i === 0 && <span className="font-semibold">{typePluralLabel(e.type, t)}</span>}
            </span>
          ))}
        </span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true">
          <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
        </svg>
      </Link>

      {/* ── Avis patients ────────────────────────────── */}
      <section id="avis" aria-labelledby="avis-titre">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 id="avis-titre" className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            {t.reviewsTitle}
            {e._count.reviews > 0 && (
              <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 tabular-nums">
                {e._count.reviews}
              </span>
            )}
          </h2>
          <EstablishmentReviewDialog variant="header" {...reviewDialogProps} />
        </div>

        {e.reviews.length === 0 ? (
          <EmptyReviews t={t} trigger={<EstablishmentReviewDialog variant="empty" {...reviewDialogProps} />}/>
        ) : (
          <div className="flex flex-col gap-3">
            <RatingSummary
              averageRating={e.averageRating}
              totalCount={e._count.reviews}
              reviews={e.reviews}
              t={t}
            />
            {e.reviews.map((r) => (
              <ReviewCard key={r.id} review={r} t={t}/>
            ))}
            {e._count.reviews > e.reviews.length && (
              <p className="text-center text-xs text-slate-500 py-2">
                {t.showing
                  .replace("{shown}", String(e.reviews.length))
                  .replace("{total}", String(e._count.reviews))}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
