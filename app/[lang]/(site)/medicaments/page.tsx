import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/components/ui/Pagination";
import { toLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/hreflang";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Médicaments au Maroc — Prix, dosage et remboursement",
    description:
      "Base de données officielle des médicaments autorisés au Maroc. Prix public, taux de remboursement, dosage et avis patients.",
    alternates: localizedAlternates("/medicaments", locale),
    openGraph: {
      title: "Médicaments au Maroc — Prix et remboursement",
      description: "Base de données officielle des médicaments autorisés au Maroc.",
      url: "/medicaments",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Médicaments au Maroc — SantéauMaroc",
      description: "Base de données officielle des médicaments autorisés au Maroc.",
    },
  };
}

type SearchParams = Promise<{ q?: string; forme?: string; page?: string }>;

const PAGE_SIZE = 30;

type FormeFilter = { query: string; label: string };
const FORMES: FormeFilter[] = [
  { query: "comprim", label: "Comprimé"     },
  { query: "gelule",  label: "Gélule"       },
  { query: "sirop",   label: "Sirop"        },
  { query: "inject",  label: "Injectable"   },
  { query: "pommade", label: "Pommade"      },
  { query: "supposi", label: "Suppositoire" },
  { query: "goutte",  label: "Gouttes"      },
];

async function getFormesSorted(): Promise<FormeFilter[]> {
  const counts = await Promise.all(
    FORMES.map(async (f) => ({
      ...f,
      count: await prisma.medication.count({
        where: { isActive: true, forme: { contains: f.query, mode: "insensitive" } },
      }),
    }))
  );
  return counts.sort((a, b) => b.count - a.count).map(({ query, label }) => ({ query, label }));
}

/* ── Icônes ─────────────────────────────────────────────── */

function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className ?? "w-5 h-5"} aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="4"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-5 h-5 text-slate-500 shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="6"/>
      <path d="m14 14 4 4" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Étoiles ─────────────────────────────────────────────── */

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

function StarsRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-px" aria-label={`Note : ${rating} sur 5`}>
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

/* ── Page ────────────────────────────────────────────────── */

export default async function MedicamentsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", forme = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const where = {
    isActive: true,
    ...(forme ? { forme: { contains: forme, mode: "insensitive" as const } } : {}),
    ...(q ? { OR: [
      { nom: { contains: q, mode: "insensitive" as const } },
      { dci: { contains: q, mode: "insensitive" as const } },
    ] } : {}),
  };

  const [medications, total, formes] = await Promise.all([
    prisma.medication.findMany({
      where,
      select: {
        id: true, slug: true, nom: true, dci: true, forme: true,
        dosage: true, uniteDosage: true, princepsGenerique: true,
        reviews: { select: { note: true }, where: { isPublic: true } },
      },
      orderBy: [{ reviews: { _count: "desc" } }, { nom: "asc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.medication.count({ where }),
    getFormesSorted(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const ps = new URLSearchParams();
    if (q)     ps.set("q",     q);
    if (forme) ps.set("forme", forme);
    if (p > 1) ps.set("page",  String(p));
    const qs = ps.toString();
    return `/medicaments${qs ? `?${qs}` : ""}`;
  };

  const chipActive   = "inline-flex items-center shrink-0 h-9 px-4 rounded-full text-sm font-semibold bg-primary-600 text-white capitalize whitespace-nowrap transition-all";
  const chipInactive = "inline-flex items-center shrink-0 h-9 px-4 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-primary-300 hover:text-primary-700 capitalize whitespace-nowrap transition-all";
  const hasFilters   = !!(q || forme);
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
  const showSchema   = !hasFilters && page === 1;

  const jsonLd = showSchema
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "ItemList",
            "name": "Médicaments autorisés au Maroc",
            "description": `Base de données des médicaments autorisés au Maroc. ${total.toLocaleString("fr")} médicaments référencés avec prix, dosage et taux de remboursement.`,
            "url": `${BASE}/medicaments`,
            "numberOfItems": total,
            "itemListElement": medications.map((m, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "name": m.nom,
              "url": `${BASE}/medicaments/${m.slug}`,
            })),
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
              { "@type": "ListItem", "position": 2, "name": "Médicaments", "item": `${BASE}/medicaments` },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    <div className="page-outer">

      {/* ── En-tête ───────────────────────────────────────── */}
      <header className="mb-8">
        <p className="section-eyebrow mb-1.5">Base médicamenteuse</p>
        <h1 className="section-title">Médicaments</h1>
        <p className="mt-2 text-sm text-slate-500">
          {hasFilters ? (
            <>
              <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span>
              {" "}résultat{total !== 1 ? "s" : ""}
              {forme && <> pour <span className="font-medium text-primary-700">&ldquo;{FORMES.find(f => f.query === forme)?.label ?? forme}&rdquo;</span></>}
              {q && <> · <span className="font-medium text-primary-700">&ldquo;{q}&rdquo;</span></>}
              {" · "}
              <Link href="/medicaments"
                className="text-secondary-600 hover:text-secondary-700 underline underline-offset-2 font-medium">
                Tout afficher
              </Link>
            </>
          ) : (
            <>
              <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span>
              {" "}médicament{total !== 1 ? "s" : ""} dans notre base de données
            </>
          )}
        </p>
        <div className="mt-4 h-px"
          style={{ background: "linear-gradient(90deg, #bfdbfe 0%, #a7f3d0 60%, transparent 100%)" }} />
      </header>

      {/* ── Barre de recherche ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5"
        style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}>
        <form method="GET" action="/medicaments">
          <div className="flex gap-2.5">
            <label className="flex-1 relative flex items-center">
              <span className="absolute start-3.5 pointer-events-none"><SearchIcon /></span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Nom du médicament, DCI…"
                className="input-field ps-11 h-12 w-full"
              />
              {forme && <input type="hidden" name="forme" value={forme} />}
            </label>
            <button type="submit" className="btn-primary h-12 px-5 shrink-0 rounded-xl">
              Rechercher
            </button>
          </div>
        </form>
      </div>

      {/* ── Filtres par forme ─────────────────────────────── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        <Link
          href={q ? `/medicaments?q=${encodeURIComponent(q)}` : "/medicaments"}
          className={!forme ? chipActive : chipInactive}
        >
          Toutes formes
        </Link>
        {formes.map((f) => {
          const ps = new URLSearchParams();
          if (q) ps.set("q", q);
          ps.set("forme", f.query);
          return (
            <Link key={f.query} href={`/medicaments?${ps.toString()}`}
              className={forme === f.query ? chipActive : chipInactive}>
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* ── Grille médicaments ────────────────────────────── */}
      {medications.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center">
            <PillIcon className="w-8 h-8 text-accent-400" />
          </div>
          <p className="font-semibold text-slate-700 text-base">Aucun médicament trouvé</p>
          <p className="text-sm text-slate-500 max-w-xs text-center">
            Essayez un autre nom ou DCI, ou supprimez les filtres actifs.
          </p>
          {hasFilters && (
            <Link href="/medicaments"
              className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
              Voir tous les médicaments
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {medications.map((m) => {
            const avg   = m.reviews.length > 0
              ? m.reviews.reduce((s, r) => s + r.note, 0) / m.reviews.length
              : 0;
            const count = m.reviews.length;
            const dosageLabel = [m.dosage, m.uniteDosage].filter(Boolean).join(" ");

            return (
              <Link key={m.id} href={`/medicaments/${m.slug}`}
                className="card group flex items-start gap-3 p-4">

                {/* Icône pilule */}
                <div className="w-11 h-11 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center shrink-0 group-hover:bg-accent-100 transition-colors">
                  <PillIcon className="w-5 h-5" />
                </div>

                {/* Informations */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-slate-900 text-sm leading-snug truncate group-hover:text-primary-700 transition-colors">
                    {m.nom}
                  </h2>
                  {m.dci && (
                    <p className="text-[12px] text-slate-500 italic truncate mt-0.5">{m.dci}</p>
                  )}

                  {/* Badges : forme · dosage · princeps/générique */}
                  {(m.forme || dosageLabel || m.princepsGenerique) && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {m.forme && (
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200 capitalize">
                          {m.forme}
                        </span>
                      )}
                      {dosageLabel && (
                        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {dosageLabel}
                        </span>
                      )}
                      {m.princepsGenerique === "P" && (
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                          Princeps
                        </span>
                      )}
                      {m.princepsGenerique === "G" && (
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-100">
                          Générique
                        </span>
                      )}
                    </div>
                  )}

                  {/* Note */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <StarsRow rating={avg} />
                    {avg > 0 ? (
                      <>
                        <span className={`text-xs font-bold tabular-nums ${ratingColor(avg)}`}>
                          {avg.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">· {count} avis</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">Aucun avis</span>
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

      <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} />
    </div>
    </>
  );
}
