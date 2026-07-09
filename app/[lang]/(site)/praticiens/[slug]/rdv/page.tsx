import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { generateAvailableSlots, getDoctorInitials, casablancaTodayStr } from "@/lib/utils";
import { hasProAccess } from "@/lib/plan";
import { BookingForm } from "./_components/BookingForm";
import { CallbackForm } from "../_components/CallbackForm";
import { getDictionary, toLocale, type Dictionary } from "@/lib/i18n";

type Params = Promise<{ lang: string; slug: string }>;
type SearchParams = Promise<{ date?: string; time?: string; reason?: string }>;

async function getDoctor(slug: string) {
  // Date du jour à l'heure du Maroc (YYYY-MM-DD) — `date` est stocké en string,
  // la comparaison lexicographique ISO est donc valide. (Pas le fuseau serveur :
  // sinon décalage d'un jour autour de minuit, cf. casablancaTodayStr.)
  const todayStr = casablancaTodayStr();

  return prisma.doctor.findUnique({
    where: { slug, isActive: true },
    include: {
      specialty:    { select: { name: true, slug: true } },
      city:         { select: { name: true, slug: true } },
      workingHours: true,
      blockedSlots: { select: { date: true, time: true } },
      absences: {
        select: { startDate: true, endDate: true, allDay: true, startTime: true, endTime: true },
      },
      // Seuls les RDV à venir servent à marquer les créneaux occupés : borner la
      // requête évite de charger tout l'historique (croissance non bornée).
      appointments: {
        where:  { status: { notIn: ["CANCELLED"] }, date: { gte: todayStr } },
        select: { date: true, time: true },
      },
      _count: { select: { reviews: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getDoctor(slug);
  if (!p) return { title: "Praticien introuvable", robots: { index: false } };
  const name = [p.civilite, p.prenom, p.nom].filter(Boolean).join(" ");
  // Étape de tunnel (réservée aux utilisateurs connectés) → ne pas indexer
  return {
    // Le suffixe « | SantéauMaroc » est ajouté par le template du layout racine.
    title: `Prendre RDV avec ${name}`,
    robots: { index: false, follow: true },
  };
}

/* ── Composants ────────────────────────────────────────────── */

type CallbackT = Dictionary["doctor"]["callback"];

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z"/>
    </svg>
  );
}

/**
 * Bloc « Réservez par téléphone » (capture de lead via rappel du cabinet).
 * - `collapsible` : repliable (<details>, sans JS) — option secondaire quand la
 *   réservation en ligne est déjà possible.
 * - sinon : carte ouverte (action principale quand le RDV en ligne est indisponible).
 */
function PhoneBooking({
  doctorId, phone, collapsible, c, callOfficeLabel, summaryLabel, doctorMotifs, motifT,
}: {
  doctorId: string;
  phone?: string | null;
  collapsible: boolean;
  c: CallbackT;
  callOfficeLabel: string;
  summaryLabel: string;
  doctorMotifs?: string[];
  motifT: Pick<Dictionary["rdv"], "reasonChips" | "reasonOther" | "reasonOtherPlaceholder">;
}) {
  const tel = phone?.trim();
  const inner = (
    <>
      <CallbackForm doctorId={doctorId} t={c} doctorMotifs={doctorMotifs} motifT={motifT} />
      {tel && (
        <a
          href={`tel:${tel}`}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors border border-primary-100"
        >
          <PhoneIcon className="w-4 h-4 shrink-0" />
          {callOfficeLabel}
        </a>
      )}
    </>
  );

  if (collapsible) {
    return (
      <details className="card p-0 group">
        <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4 sm:p-5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-2xl">
          <span className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
              <PhoneIcon className="w-4.5 h-4.5 text-primary-600" />
            </span>
            <span className="text-sm font-semibold text-slate-800 truncate">{summaryLabel}</span>
          </span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 6 4 4 4-4"/>
          </svg>
        </summary>
        <div className="px-4 sm:px-5 pb-5">
          <p className="text-xs text-slate-500 leading-relaxed mb-3">{c.subtitle}</p>
          {inner}
        </div>
      </details>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
          <PhoneIcon className="w-5 h-5 text-primary-600" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-snug">{c.title}</h2>
          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{c.subtitle}</p>
        </div>
      </div>
      {inner}
    </div>
  );
}

/* ── Icônes inline ─────────────────────────────────────────── */

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-3.5 h-3.5 text-slate-500 shrink-0 rtl:-scale-x-100" aria-hidden="true">
      <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 12 12" fill={filled ? "#fbbf24" : "none"}
      stroke={filled ? "#fbbf24" : "#d1d5db"} strokeWidth="1" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M6 .5l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 7.5l-2.78 1.55.53-3.09L1.5 3.77l3.11-.45z"/>
    </svg>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default async function RdvPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { lang, slug } = await params;
  const { date: initialDate, time: initialTime, reason: initialReason } = await searchParams;

  // Auth tardive : on n'exige plus la connexion pour VOIR les créneaux.
  // Le compte est demandé uniquement au moment de confirmer (cf. BookingForm).
  const session = await tryGetSession();
  const isAuthenticated = !!session?.userId;

  const [p, patient] = await Promise.all([
    getDoctor(slug),
    session?.userId
      ? prisma.user.findUnique({ where: { id: session.userId }, select: { phone: true } })
      : Promise.resolve(null),
  ]);
  if (!p) notFound();

  const dict = getDictionary(toLocale(lang));
  const t = dict.rdv;
  const cb = dict.doctor.callback;
  const callOfficeLabel = dict.doctor.callOffice;
  // Prise de RDV en ligne = fonction Pro. Médecin non-Pro → bannière (pas de réservation).
  const canBook = p.workingHours.some((wh) => wh.isActive) && hasProAccess(p.plan, p.planExpiresAt, p.trialEndsAt);

  // Créneaux générés uniquement si la prise de RDV en ligne est débloquée (Pro).
  const allSlots = canBook
    ? generateAvailableSlots(
        p.appointments.map((a) => ({ date: a.date, time: a.time })),
        p.workingHours,
        p.consultationDuration,
        p.absences,
        { leadHours: p.bookingLeadHours, maxDays: p.bookingMaxDays },
      )
    : [];

  const blockedSet = new Set(p.blockedSlots.map((b) => `${b.date}-${b.time}`));
  const slotsByDate: Record<string, string[]> = {};
  for (const slot of allSlots) {
    if (!slot.available) continue;
    if (blockedSet.has(`${slot.date}-${slot.time}`)) continue;
    if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
    slotsByDate[slot.date].push(slot.time);
  }

  const doctorName = [p.civilite, p.prenom, p.nom].filter(Boolean).join(" ");
  const prix        = p.prix?.toNumber();
  const totalSlots  = Object.values(slotsByDate).reduce((s, arr) => s + arr.length, 0);
  const initials    = getDoctorInitials(p.prenom, p.nom);

  /* ── Données structurées : Physician + action de réservation ──
     La page est volontairement `noindex` (étape de tunnel) : l'intérêt
     n'est pas le référencement classique mais de décrire la prise de RDV
     de façon lisible par les moteurs et les agents IA (ReserveAction). */
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
  const profileUrl = `${BASE}/praticiens/${slug}`;
  const rdvUrl = `${profileUrl}/rdv`;
  const hasReliableRating = p.averageRating > 0 && p._count.reviews >= 3;
  const physician = {
    "@type": "Physician",
    "@id": `${profileUrl}#physician`,
    "name": doctorName,
    "url": profileUrl,
    ...(p.avatar && { "image": p.avatar }),
    "medicalSpecialty": p.specialty.name,
    ...(p.phone && { "telephone": p.phone }),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": p.adresse,
      "addressLocality": p.city.name,
      "addressCountry": "MA",
    },
    "areaServed": { "@type": "City", "name": p.city.name },
    // Coordonnées du cabinet : signal SEO local fort (Google/agents). Émis
    // seulement si géocodé.
    ...(p.latitude != null && p.longitude != null && {
      "geo": { "@type": "GeoCoordinates", "latitude": p.latitude, "longitude": p.longitude },
    }),
    ...(prix && { "priceRange": `${prix} MAD` }),
    ...(hasReliableRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": p.averageRating.toFixed(1),
        "reviewCount": p._count.reviews,
        "bestRating": "5",
        "worstRating": "1",
      },
    }),
    ...(canBook && {
      "potentialAction": {
        "@type": "ReserveAction",
        "name": "Prendre rendez-vous en ligne",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": rdvUrl,
          "actionPlatform": [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform",
          ],
        },
        "result": { "@type": "Reservation", "name": `Rendez-vous médical avec ${doctorName}` },
      },
    }),
  };

  // Fil d'Ariane structuré — calqué sur le breadcrumb visible (exigence Google).
  // La page est noindex mais `follow` : ce graphe aide crawlers et agents IA à
  // situer l'étape de réservation dans la hiérarchie du site.
  const breadcrumb = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": t.breadcrumbDoctors, "item": `${BASE}/praticiens` },
      { "@type": "ListItem", "position": 2, "name": doctorName, "item": profileUrl },
      { "@type": "ListItem", "position": 3, "name": t.breadcrumbBook, "item": rdvUrl },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [physician, breadcrumb],
  };

  return (
    <div className="page-outer max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5 flex-wrap" aria-label={t.breadcrumbAria}>
        <Link href="/praticiens" className="hover:text-primary-600 transition-colors">{t.breadcrumbDoctors}</Link>
        <ChevronIcon />
        <Link href={`/praticiens/${slug}`} className="hover:text-primary-600 transition-colors truncate max-w-[11rem]">
          {doctorName}
        </Link>
        <ChevronIcon />
        <span className="text-slate-700 font-medium">{t.breadcrumbBook}</span>
      </nav>

      {/* H1 orienté tâche (sr-only) : donne un plan de document correct sans
          dédoubler visuellement l'identité déjà affichée dans la carte médecin. */}
      <h1 className="sr-only">{t.bookWith} {doctorName}</h1>

      {/* ── Grille : formulaire (principal) + rail médecin (sticky) ── */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6">

      {/* ── Rail médecin (droite desktop, haut mobile, sticky) ── */}
      <aside className="flex flex-col gap-4 lg:order-2 lg:sticky lg:top-24">
      {/* ── Carte médecin ──────────────────────────────────── */}
      <div className="card overflow-hidden p-0">
        {/* Bande de couleur */}
        <div className="h-1.5" style={{ background: "linear-gradient(90deg,#2563eb 0%,#059669 100%)" }} />

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-4">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="avatar-ring w-16 h-16 sm:w-[72px] sm:h-[72px]">
                <div className="avatar-ring-inner">
                  {p.avatar ? (
                    <Image
                      src={p.avatar}
                      alt={`Photo de profil de ${doctorName}`}
                      width={72}
                      height={72}
                      sizes="(max-width: 640px) 64px, 72px"
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <span className="text-primary-700 font-bold text-xl select-none">{initials}</span>
                  )}
                </div>
              </div>
              {p.isVerified && (
                <span className="absolute -bottom-0.5 -end-0.5 w-5 h-5 bg-secondary-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
                  title="Médecin vérifié">
                  <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" aria-hidden="true">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              {/* Nom + badge vérifié */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{doctorName}</p>
                {p.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                    bg-secondary-50 text-secondary-700 border border-secondary-200 text-xs font-semibold shrink-0">
                    <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" aria-hidden="true">
                      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t.verifiedDoctor}
                  </span>
                )}
              </div>

              {/* Spécialité */}
              <Link href={`/praticiens?specialite=${p.specialty.slug}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                  bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors mb-2">
                {p.specialty.name}
              </Link>

              {/* Adresse */}
              {/* items-start + line-clamp-2 : l'adresse complète (avec la ville)
                  reste lisible sur 2 lignes — info clé pour se rendre au RDV.
                  L'ancien `truncate` masquait la ville sur les adresses longues. */}
              <p className="text-xs text-slate-500 flex items-start gap-1.5 mb-1.5">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" aria-hidden="true">
                  <path d="M8 1C5.79 1 4 2.79 4 5c0 3.28 4 9 4 9s4-5.72 4-9c0-2.21-1.79-4-4-4z"/>
                  <circle cx="8" cy="5" r="1.5"/>
                </svg>
                <span className="line-clamp-2"><bdi>{p.adresse}, {p.city.name}</bdi></span>
              </p>

              {/* Rating — la note chiffrée n'est mise en avant qu'à partir de 3
                  avis fiables (cohérent avec la fiche profil et le JSON-LD).
                  Un « 5,0 sur 2 avis » en gras inspire la méfiance ; sous le
                  seuil on garde les étoiles + le nombre d'avis, sans le chiffre. */}
              {p.averageRating > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-px">
                    {Array.from({ length: 5 }, (_, i) => (
                      <StarIcon key={i} filled={i < Math.round(p.averageRating)} />
                    ))}
                  </div>
                  {hasReliableRating && (
                    <span className="text-xs font-bold text-amber-600 tabular-nums">
                      {p.averageRating.toFixed(1)}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    {t.reviewsCount.replace("{n}", String(p._count.reviews))}
                  </span>
                </div>
              )}
            </div>

            {/* Prix */}
            {prix && (
              <div className="shrink-0 text-end ps-2">
                <p className="text-xl font-bold text-slate-900 tabular-nums leading-none">{prix}</p>
                <p className="text-xs text-slate-500 mt-0.5">MAD</p>
              </div>
            )}
          </div>

          {/* ── Méta-stats ── */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
              bg-slate-50 border border-slate-100 text-xs text-slate-600">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="7"/><path d="M8 4v4l2.5 2.5"/>
              </svg>
              {t.consultation} {p.consultationDuration} {t.minSuffix}
            </span>

            {totalSlots > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                bg-secondary-50 border border-secondary-100 text-xs font-semibold text-secondary-700">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-3.5 h-3.5 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="2" width="14" height="13" rx="2"/>
                  <path d="M1 6h14M5 1v2M11 1v2"/>
                </svg>
                {(totalSlots > 1 ? t.slotsAvailable : t.slotAvailableOne).replace("{n}", String(totalSlots))}
              </span>
            )}

            {p.experience && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12V6l6-4 6 4v6M6 12V9h4v3"/>
                </svg>
                {(p.experience > 1 ? t.yearsExp : t.yearExpOne).replace("{n}", String(p.experience))}
              </span>
            )}

            {p.langues.slice(0, 2).map((l) => (
              <span key={l} className="inline-flex items-center px-2.5 py-1.5 rounded-xl
                bg-slate-50 border border-slate-100 text-xs text-slate-500">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
      </aside>

      {/* ── Colonne principale : formulaire + garanties ─────── */}
      <div className="min-w-0 lg:order-1 flex flex-col">

      {/* ── Formulaire de réservation ───────────────────────── */}
      {canBook ? (
        <>
          <BookingForm
            doctorId={p.id}
            slug={slug}
            slotsByDate={slotsByDate}
            consultationDuration={p.consultationDuration}
            isAuthenticated={isAuthenticated}
            needsPhone={isAuthenticated && !patient?.phone}
            doctorMotifs={p.motifs}
            initialDate={initialDate}
            initialTime={initialTime}
            initialReason={initialReason}
            t={t}
            authT={dict.auth.login.form}
          />
          {/* Alternative : être rappelé par le cabinet (repliable, secondaire) */}
          <div className="mt-4">
            <PhoneBooking
              doctorId={p.id}
              phone={p.phone}
              collapsible
              c={cb}
              callOfficeLabel={callOfficeLabel}
              summaryLabel={t.preferPhone}
              doctorMotifs={p.motifs}
              motifT={t}
            />
          </div>
        </>
      ) : (
        /* Pas de RDV en ligne → capture de lead : le cabinet rappelle */
        <>
          {/* Explique l'absence de calendrier pour ne pas tromper l'attente créée
              par le clic « Prendre rendez-vous ». */}
          <div className="flex items-start gap-2.5 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 mb-4">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4.5 h-4.5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="8" /><path d="M10 9v4M10 6.5v.5" />
            </svg>
            <p className="text-xs text-slate-600 leading-relaxed">{t.noOnlineBooking}</p>
          </div>
          <PhoneBooking
            doctorId={p.id}
            phone={p.phone}
            collapsible={false}
            c={cb}
            callOfficeLabel={callOfficeLabel}
            summaryLabel={t.preferPhone}
            doctorMotifs={p.motifs}
            motifT={t}
          />
        </>
      )}

      {/* ── Garanties ──────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          {
            icon: (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-5 h-5 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="8"/><path d="M6.5 10l2.5 2.5L14 7"/>
              </svg>
            ),
            label: t.guaranteeFree,
          },
          {
            icon: (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-5 h-5 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="14" height="14" rx="2"/>
                <path d="M3 9h14M7 3v2M13 3v2M8 13l4 0M8 15.5l4 0"/>
              </svg>
            ),
            // En réservation en ligne : annulation libre. En repli « rappel du
            // cabinet », rien n'est encore réservé → on promet « sans engagement ».
            label: canBook ? t.guaranteeCancel : t.guaranteeNoCommit,
          },
          {
            icon: (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-5 h-5 text-slate-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z"/>
                <path d="M7 10l2 2 4-4"/>
              </svg>
            ),
            label: t.guaranteeSecure,
          },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            {icon}
            <p className="text-xs sm:text-xs text-slate-500 font-medium text-center leading-tight">{label}</p>
          </div>
        ))}
      </div>

      </div>
      {/* ── fin colonne principale ── */}

      </div>
      {/* ── fin grille ── */}

      {/* ── Lien retour profil ──────────────────────────────── */}
      <div className="mt-6 text-center">
        <Link href={`/praticiens/${slug}`}
          className="text-xs text-slate-500 hover:text-primary-600 transition-colors">
          <span className="rtl:hidden">←</span> {t.backToProfileOf} {doctorName} <span className="hidden rtl:inline">→</span>
        </Link>
      </div>

    </div>
  );
}
