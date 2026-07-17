import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { getMedicationDetail } from "@/lib/medications-query";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale, getDictionary } from "@/lib/i18n";
import { MedicationReviewDialog } from "@/components/MedicationReviewDialog";

type Params = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const m = await getMedicationDetail(slug);
  if (!m) return { title: "Médicament introuvable", robots: { index: false } };
  const locale = toLocale(lang);
  const dosageLabel = [m.dosage, m.uniteDosage].filter(Boolean).join(" ");
  const title = `${m.nom}${dosageLabel ? ` ${dosageLabel}` : ""}${m.dci ? ` (${m.dci})` : ""} — Médicament au Maroc`;
  const rawDesc = m.description
    ?? `${m.nom}${m.dci ? ` (${m.dci})` : ""}${m.forme ? ` — ${m.forme}` : ""}. Informations officielles : prix, dosage, remboursement et avis patients.`;
  const description = rawDesc.length > 155 ? rawDesc.slice(0, 152) + "…" : rawDesc;
  return {
    title,
    description,
    alternates: localizedAlternates(`/medicaments/${slug}`, locale),
    openGraph: { title, description, url: `/medicaments/${slug}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/* ── Helpers ─────────────────────────────────────────────── */

function relativeDate(date: Date): string {
  const diffMs   = new Date().getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 1)  return "Aujourd'hui";
  if (diffDays < 7)  return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  const diffW = Math.floor(diffDays / 7);
  if (diffW < 5)     return `Il y a ${diffW} semaine${diffW > 1 ? "s" : ""}`;
  const diffM = Math.floor(diffDays / 30);
  if (diffM < 12)    return `Il y a ${diffM} mois`;
  const diffY = Math.floor(diffDays / 365);
  return `Il y a ${diffY} an${diffY > 1 ? "s" : ""}`;
}

function ratingColor(r: number): string {
  if (r >= 4) return "text-emerald-600";
  if (r >= 3) return "text-amber-600";
  return "text-rose-500";
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

/* ── Icônes ─────────────────────────────────────────────── */

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true">
      <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className ?? "w-6 h-6"} aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="4"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className ?? "w-4 h-4"} aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5"/>
      <path d="M8 7.5v4M8 5v.5"/>
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className ?? "w-4 h-4"} aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9.5 9 2.5l4 1 1 4-7 6.5a1 1 0 0 1-1.4 0l-3.6-3.6a1 1 0 0 1 0-1.4z"/>
      <circle cx="11.5" cy="5.5" r="1"/>
    </svg>
  );
}

function StarIcon({ filled, size = "md" }: { filled: boolean; size?: "sm" | "md" | "lg" }) {
  const cls = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <svg viewBox="0 0 12 12"
      fill={filled ? "#fbbf24" : "none"}
      stroke={filled ? "#fbbf24" : "#d1d5db"}
      strokeWidth="1"
      className={cls} aria-hidden="true">
      <path d="M6 .5l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 7.5l-2.78 1.55.53-3.09L1.5 3.77l3.11-.45z"/>
    </svg>
  );
}

function StarsRow({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center gap-px" aria-label={`Note : ${rating} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < Math.round(rating)} size={size} />
      ))}
    </div>
  );
}

/* ── Sous-composants avis ────────────────────────────────── */

function RatingSummary({
  avgRating,
  totalCount,
  reviews,
}: {
  avgRating: number;
  totalCount: number;
  reviews: { note: number }[];
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
        {/* Score global */}
        <div className="text-center shrink-0 min-w-[72px]">
          <p className="text-[3rem] font-black leading-none text-slate-900 tracking-tight">
            {avgRating.toFixed(1)}
          </p>
          <StarsRow rating={avgRating} size="md" />
          <p className="text-xs text-slate-500 mt-1.5 font-medium">{totalCount} avis</p>
        </div>
        <div className="w-px self-stretch bg-slate-100 shrink-0" />
        {/* Distribution */}
        <div className="flex-1 space-y-1.5">
          {dist.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 w-3 text-end shrink-0">{star}</span>
              <StarIcon filled size="sm" />
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-slate-500 w-4 text-end shrink-0 tabular-nums">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: {
    id: string;
    auteur: string;
    note: number;
    commentaire: string | null;
    createdAt: Date;
  };
}) {
  const name    = review.auteur || "Anonyme";
  const initial = name.charAt(0).toUpperCase();
  const colors  = avatarColor(initial);
  const nColor  = ratingColor(review.note);

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
              {name}
            </p>
            <time dateTime={review.createdAt.toISOString()}
              className="text-xs text-slate-500 shrink-0 mt-0.5">
              {relativeDate(review.createdAt)}
            </time>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarsRow rating={review.note} size="sm" />
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

function EmptyReviews({ trigger }: { trigger: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5"
          className="w-7 h-7" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 4.87 5.38.78-3.89 3.79.92 5.36L12 14.27l-4.81 2.53.92-5.36L4.22 7.65l5.38-.78z"/>
        </svg>
      </div>
      <h3 className="font-semibold text-slate-700 text-sm">Aucun avis pour le moment</h3>
      <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed max-w-[220px] mx-auto">
        Partagez votre expérience avec ce médicament pour aider la communauté.
      </p>
      {trigger}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default async function MedicamentPage({ params }: { params: Params }) {
  const { lang, slug } = await params;

  const medication = await getMedicationDetail(slug);

  if (!medication || !medication.isActive) notFound();
  const m = medication;

  // Dépôt d'avis : dictionnaire (modale localisée) + libellés des déclencheurs.
  const rt = getDictionary(toLocale(lang)).review;
  const reviewDialogProps = {
    medicationId:   m.id,
    slug,
    medicationName: m.nom,
    labels: {
      leave:       "Laisser un avis",
      edit:        "Modifier mon avis",
      leaveAria:   "Laisser un avis sur ce médicament",
      editAria:    "Modifier mon avis sur ce médicament",
      firstPrompt: "Laisser un avis",
    },
    t: rt,
  };

  const avgRating = m.reviews.length > 0
    ? m.reviews.reduce((sum, r) => sum + r.note, 0) / m.reviews.length
    : 0;

  const dosageLabel     = [m.dosage, m.uniteDosage].filter(Boolean).join(" ");
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Drug",
        "@id": `${BASE}/medicaments/${slug}#drug`,
        "name": m.nom,
        "url": `${BASE}/medicaments/${slug}`,
        ...(m.dci && { "nonProprietaryName": m.dci }),
        ...(m.description && { "description": m.description }),
        ...(m.forme && { "dosageForm": m.forme }),
        ...(m.classe && { "drugClass": m.classe }),
        ...(dosageLabel && {
          "availableStrength": {
            "@type": "DrugStrength",
            "strengthValue": m.dosage ?? "",
            "strengthUnit": m.uniteDosage ?? "",
          },
        }),
        ...(m.ppv && {
          "offers": {
            "@type": "Offer",
            "priceCurrency": "MAD",
            "price": Number(m.ppv).toFixed(2),
            "availability": "https://schema.org/InStock",
            "areaServed": { "@type": "Country", "name": "Maroc" },
          },
        }),
        ...(avgRating > 0 && m._count.reviews > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": avgRating.toFixed(1),
            "reviewCount": m._count.reviews,
            "bestRating": "5",
            "worstRating": "1",
          },
        }),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Médicaments", "item": `${BASE}/medicaments` },
          { "@type": "ListItem", "position": 3, "name": m.nom, "item": `${BASE}/medicaments/${slug}` },
        ],
      },
    ],
  };
  const hasTarification = !!(m.ppv || m.ph || m.prixBR || m.tauxRemboursement);
  const hasCaracteristiques = !!(m.dci || dosageLabel || m.forme || m.presentation || m.classe);
  const tauxIsZero      = !m.tauxRemboursement || m.tauxRemboursement.replace(/\s/g, "") === "0%";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="page-outer max-w-3xl">

      {/* ── Breadcrumb ────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5" aria-label="Fil d'Ariane">
        <Link href="/medicaments" className="hover:text-primary-600 transition-colors">Médicaments</Link>
        <ChevronIcon />
        <span className="text-slate-700 font-medium truncate">{m.nom}</span>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <div className="card overflow-hidden p-0 mb-4">
        {/* Bande dégradée */}
        <div className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Icône */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" }}>
              <PillIcon className="w-8 h-8 text-accent-600" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Princeps / Générique */}
              {m.princepsGenerique && (
                <div className="mb-2">
                  {m.princepsGenerique === "P" && (
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                      Médicament princeps
                    </span>
                  )}
                  {m.princepsGenerique === "G" && (
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-100">
                      Médicament générique
                    </span>
                  )}
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                {m.nom}
              </h1>

              {m.dci && (
                <p className="text-sm text-slate-500 mt-1 italic">{m.dci}</p>
              )}

              {dosageLabel && (
                <div className="mt-2">
                  <span className="inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {dosageLabel}
                  </span>
                </div>
              )}

              {/* Note */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <StarsRow rating={avgRating} size="md" />
                {avgRating > 0 ? (
                  <>
                    <span className={`text-sm font-bold tabular-nums ${ratingColor(avgRating)}`}>
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({m._count.reviews} avis)
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">Aucun avis</span>
                )}
              </div>
            </div>
          </div>

          {/* Badges : forme · classe */}
          {(m.forme || m.classe) && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
              {m.forme  && (
                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-50 text-accent-700 border border-accent-200 capitalize">
                  {m.forme}
                </span>
              )}
              {m.classe && (
                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100 capitalize">
                  {m.classe}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Caractéristiques ──────────────────────── */}
      {hasCaracteristiques && (
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <InfoIcon className="w-3.5 h-3.5 text-primary-600" />
            </span>
            Caractéristiques
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {m.dci && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  DCI
                </dt>
                <dd className="text-sm font-medium text-slate-800 italic">{m.dci}</dd>
              </div>
            )}
            {dosageLabel && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Dosage
                </dt>
                <dd className="text-sm font-medium text-slate-800">{dosageLabel}</dd>
              </div>
            )}
            {m.forme && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Forme pharmaceutique
                </dt>
                <dd className="text-sm font-medium text-slate-800 capitalize">{m.forme}</dd>
              </div>
            )}
            {m.classe && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Classe thérapeutique
                </dt>
                <dd className="text-sm font-medium text-slate-800 capitalize">{m.classe}</dd>
              </div>
            )}
            {m.presentation && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:col-span-2">
                <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Présentation
                </dt>
                <dd className="text-sm font-medium text-slate-800">{m.presentation}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* ── Tarification ──────────────────────────── */}
      {hasTarification && (
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-secondary-50 flex items-center justify-center shrink-0">
              <TagIcon className="w-3.5 h-3.5 text-secondary-600" />
            </span>
            Tarification
          </h2>

          {/* PPV en vedette */}
          {m.ppv && (
            <div className="rounded-xl p-4 mb-4 flex items-center justify-between gap-4"
              style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%)", border: "1px solid #d1fae5" }}>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Prix Public de Vente
                </p>
                <p className="text-3xl font-black text-slate-900 tabular-nums leading-none">
                  {Number(m.ppv).toFixed(2)}
                  <span className="text-base font-semibold text-slate-500 ms-1.5">MAD</span>
                </p>
              </div>
              {!tauxIsZero && m.tauxRemboursement && (
                <div className="text-center shrink-0">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Remboursement
                  </p>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl font-bold text-lg tabular-nums bg-secondary-100 text-secondary-700">
                    {m.tauxRemboursement}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Prix secondaires */}
          {(m.ph || m.prixBR || (m.tauxRemboursement && (!m.ppv || tauxIsZero))) && (
            <div className="divide-y divide-slate-100">
              {m.ph && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-600">Prix hospitalier</span>
                  <span className="text-sm font-bold text-slate-800 tabular-nums">
                    {Number(m.ph).toFixed(2)}{" "}
                    <span className="font-normal text-xs text-slate-500">MAD</span>
                  </span>
                </div>
              )}
              {m.prixBR && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-600">Prix base de remboursement</span>
                  <span className="text-sm font-bold text-slate-800 tabular-nums">
                    {Number(m.prixBR).toFixed(2)}{" "}
                    <span className="font-normal text-xs text-slate-500">MAD</span>
                  </span>
                </div>
              )}
              {m.tauxRemboursement && (!m.ppv || tauxIsZero) && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-600">Taux de remboursement</span>
                  <span className={`text-sm font-bold tabular-nums ${tauxIsZero ? "text-slate-500" : "text-secondary-600"}`}>
                    {m.tauxRemboursement}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Description ───────────────────────────── */}
      {m.description && (
        <div className="card p-5 mb-4">
          <p className="text-sm text-slate-600 leading-relaxed">{m.description}</p>
        </div>
      )}

      {/* ── Médicaments similaires ────────────────── */}
      <Link
        href={m.forme ? `/medicaments?forme=${encodeURIComponent(m.forme)}` : "/medicaments"}
        className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary-200 hover:bg-primary-50 transition-colors group mb-5"
        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.04)" }}
      >
        <span className="text-sm font-medium text-slate-700 group-hover:text-primary-700 transition-colors">
          Voir d&apos;autres{m.forme && <> <span className="font-semibold capitalize">{m.forme}s</span></>} dans la base médicaments
        </span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true">
          <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
        </svg>
      </Link>

      {/* ── Avis ──────────────────────────────────── */}
      <section id="avis" aria-labelledby="avis-titre">

        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 id="avis-titre" className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            Avis patients
            {m._count.reviews > 0 && (
              <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 tabular-nums">
                {m._count.reviews}
              </span>
            )}
          </h2>
          <MedicationReviewDialog variant="header" {...reviewDialogProps} />
        </div>

        {m.reviews.length === 0 ? (
          <EmptyReviews trigger={<MedicationReviewDialog variant="empty" {...reviewDialogProps} />} />
        ) : (
          <div className="flex flex-col gap-3">
            <RatingSummary
              avgRating={avgRating}
              totalCount={m._count.reviews}
              reviews={m.reviews}
            />
            {m.reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
            {m._count.reviews > m.reviews.length && (
              <p className="text-center text-xs text-slate-500 py-2">
                Affichage des {m.reviews.length} avis les plus récents sur {m._count.reviews} au total
              </p>
            )}
          </div>
        )}
      </section>
    </div>
    </>
  );
}
