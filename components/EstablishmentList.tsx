import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { SearchFilters } from "@/components/SearchFilters";
import { Pagination } from "@/components/ui/Pagination";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";

type EstabT = Dictionary["estab"];

/* ── Config par type ─────────────────────────────────────── */

const TYPE_CONFIG: Record<string, { bg: string; text: string; iconBg: string }> = {
  clinique:                       { bg: "bg-primary-50",   text: "text-primary-700",   iconBg: "bg-primary-100"   },
  "hôpital":                      { bg: "bg-red-50",       text: "text-red-700",       iconBg: "bg-red-100"       },
  cabinet:                        { bg: "bg-secondary-50", text: "text-secondary-700", iconBg: "bg-secondary-100" },
  laboratoire:                    { bg: "bg-indigo-50",    text: "text-indigo-700",    iconBg: "bg-indigo-100"    },
  pharmacie:                      { bg: "bg-accent-50",    text: "text-accent-700",    iconBg: "bg-accent-100"    },
  "établissement pharmaceutique": { bg: "bg-accent-50",    text: "text-accent-700",    iconBg: "bg-accent-100"    },
};

function getTypeConfig(type: string | null) {
  return TYPE_CONFIG[type ?? ""] ?? {
    bg: "bg-slate-50", text: "text-slate-700", iconBg: "bg-slate-100",
  };
}

/** Libellé traduit d'un type d'établissement. */
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

/* ── Icônes ─────────────────────────────────────────────── */

function EstabIcon({ type, className }: { type: string | null; className?: string }) {
  const cls = className ?? "w-5 h-5";
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
  if (type === "cabinet") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        className={cls} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4"/>
        <path d="M6.5 9.5A5.5 5.5 0 0 0 11.5 15v4.5"/>
        <circle cx="11.5" cy="20" r="1.5"/>
        <path d="M13 20h3"/>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
      className={className ?? "w-2.5 h-2.5"} aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5"/>
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 12 12"
      fill={filled ? "#fbbf24" : "none"}
      stroke={filled ? "#fbbf24" : "#d1d5db"}
      strokeWidth="1"
      className="w-3 h-3" aria-hidden="true">
      <path d="M6 .5l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 7.5l-2.78 1.55.53-3.09L1.5 3.77l3.11-.45z"/>
    </svg>
  );
}

function StarsRow({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-px" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < Math.round(rating)} />
      ))}
    </div>
  );
}

function ratingColor(r: number): string {
  if (r >= 4) return "text-emerald-600";
  if (r >= 3) return "text-amber-600";
  return "text-rose-500";
}

/* ── Constantes ─────────────────────────────────────────── */

const PAGE_SIZE = 20;

type Props = {
  types: string[];
  baseHref: string;
  q: string;
  ville: string;
  type: string;
  page: number;
  showTypeBadge?: boolean;
  /** Locale portée par l'URL (params.lang), pas getLocale() — cf. audit perf. */
  locale: Locale;
};

/* ── Composant ──────────────────────────────────────────── */

export async function EstablishmentList({
  types, baseHref, q, ville, type, page, showTypeBadge = false, locale,
}: Props) {
  const dict = getDictionary(locale);
  const t = dict.estab;

  const where = {
    isActive: true,
    type: { in: types },
    ...(ville ? { city: { slug: ville } } : {}),
    ...(type && types.includes(type) ? { type } : {}),
    ...(q ? {
      OR: [
        { nom: { contains: q, mode: "insensitive" as const } },
        { adresse: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [establishments, total, cities] = await Promise.all([
    prisma.establishment.findMany({
      where,
      include: {
        city:   { select: { name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: [{ isVerified: "desc" }, { averageRating: "desc" }, { nom: "asc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.establishment.count({ where }),
    prisma.city.findMany({
      select: { slug: true, name: true },
      orderBy: { establishments: { _count: "desc" } },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const ps = new URLSearchParams();
    if (q)     ps.set("q",     q);
    if (ville) ps.set("ville", ville);
    if (type)  ps.set("type",  type);
    if (p > 1) ps.set("page",  String(p));
    const qs = ps.toString();
    return `${baseHref}${qs ? `?${qs}` : ""}`;
  };

  const clearTypeUrl = () => {
    const ps = new URLSearchParams();
    if (q)     ps.set("q",     q);
    if (ville) ps.set("ville", ville);
    const qs = ps.toString();
    return `${baseHref}${qs ? `?${qs}` : ""}`;
  };

  const chipActive   = "h-9 px-4 rounded-full text-sm font-semibold bg-primary-600 text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all";
  const chipInactive = "h-9 px-4 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-primary-300 hover:text-primary-700 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all";

  const hasFilters = !!(q || ville || type);

  return (
    <>
      {/* ── Filtres ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 space-y-3"
        style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}>
        <SearchFilters
          key={`${q}|${ville}`}
          specialties={[]}
          cities={cities}
          topCities={6}
          placeholder={t.searchPlaceholder}
          currentQ={q}
          currentVille={ville}
          t={dict.filters}
        />

        {types.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
            <Link href={clearTypeUrl()} className={!type ? chipActive : chipInactive}>
              {t.all}
            </Link>
            {types.map((ty) => {
              const ps = new URLSearchParams();
              if (q)     ps.set("q",     q);
              if (ville) ps.set("ville", ville);
              ps.set("type", ty);
              return (
                <Link key={ty} href={`${baseHref}?${ps.toString()}`}
                  className={type === ty ? chipActive : chipInactive}>
                  <EstabIcon type={ty} className="w-3.5 h-3.5" />
                  {typeLabel(ty, t)}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Compteur + contexte ───────────────────── */}
      <p className="mb-4 text-sm text-slate-500">
        <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span>
        {" "}{total !== 1 ? t.countMany : t.countOne}
        {type  && <span className="text-slate-500"> · {typeLabel(type, t)}</span>}
        {ville && <span className="text-slate-500"> · {cities.find(c => c.slug === ville)?.name ?? ville}</span>}
        {hasFilters && (
          <Link href={baseHref} className="ms-2 text-secondary-600 hover:text-secondary-700 underline underline-offset-2 font-medium text-xs">
            {t.showAll}
          </Link>
        )}
      </p>

      {/* ── Grille établissements ─────────────────── */}
      {establishments.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-8 h-8" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-700 text-base">
            {hasFilters ? t.emptyFilteredTitle : t.emptyTitle}
          </p>
          <p className="text-sm text-slate-500 max-w-xs text-center">
            {hasFilters ? t.emptyFilteredText : t.emptyText}
          </p>
          {hasFilters && (
            <Link href={baseHref}
              className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
              {t.showAll}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {establishments.map((e) => {
            const cfg   = getTypeConfig(e.type);
            const label = typeLabel(e.type, t);
            const href = e.type === "pharmacie"   ? `/pharmacies/${e.slug}`
                       : e.type === "laboratoire" ? `/laboratoires/${e.slug}`
                       : `/cliniques/${e.slug}`;

            return (
              <Link key={e.id} href={href}
                className="card group flex items-start gap-3 p-4">

                {/* Icône type */}
                <div className={`w-12 h-12 rounded-xl ${cfg.iconBg} ${cfg.text} flex items-center justify-center shrink-0 group-hover:opacity-80 transition-opacity`}>
                  <EstabIcon type={e.type} className="w-6 h-6" />
                </div>

                {/* Informations */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <h2 className="font-bold text-sm text-slate-900 group-hover:text-primary-700 transition-colors leading-snug flex-1">
                      {e.nom}
                    </h2>
                    {e.isVerified && (
                      <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-secondary-700 bg-secondary-50 border border-secondary-100 px-1.5 py-0.5 rounded-full mt-0.5">
                        <CheckIcon className="w-2.5 h-2.5" />
                        {t.verified}
                      </span>
                    )}
                  </div>

                  {showTypeBadge && e.type && (
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${cfg.bg} ${cfg.text}`}>
                      {label}
                    </span>
                  )}

                  {/* Adresse */}
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 truncate">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                      className="w-3 h-3 shrink-0 text-slate-500" aria-hidden="true">
                      <path d="M8 1.5C5.52 1.5 3.5 3.52 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.48-2.02-4.5-4.5-4.5z"/>
                      <circle cx="8" cy="6" r="1.5"/>
                    </svg>
                    <span className="truncate">
                      <bdi>
                        <span className="font-medium">{e.city.name}</span>
                        {e.adresse ? ` — ${e.adresse}` : ""}
                      </bdi>
                    </span>
                  </p>

                  {/* Note */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <StarsRow rating={e.averageRating} label={`${t.ratingAria} ${e.averageRating} ${t.ratingOf5}`} />
                    {e.averageRating > 0 ? (
                      <>
                        <span className={`text-xs font-bold tabular-nums ${ratingColor(e.averageRating)}`}>
                          {e.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">· {e._count.reviews} {t.reviews}</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">{t.noReviews}</span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                  className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-colors shrink-0 mt-0.5" aria-hidden="true">
                  <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
                </svg>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={dict.pagination} />
    </>
  );
}
