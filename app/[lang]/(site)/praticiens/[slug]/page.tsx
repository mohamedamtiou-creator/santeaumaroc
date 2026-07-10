import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { DoctorAnswersSection } from "@/components/qa/DoctorAnswersSection";
import { getDoctorInitials, generateAvailableSlots, cleanDoctorDescription, telHref, formatStreetAddress } from "@/lib/utils";
import { hasProAccess } from "@/lib/plan";
import { tryGetSession } from "@/lib/dal";
import { BookingForm } from "./rdv/_components/BookingForm";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Dictionary } from "@/lib/i18n";
import { cachedQuery, decToNum } from "@/lib/cache";
import { ReviewDialog, type ExistingReview, type UserStatus } from "./_components/ReviewDialog";
import { ClaimButton } from "./_components/ClaimButton";
import { NotifyButton } from "./_components/NotifyButton";
import { CallbackForm } from "./_components/CallbackForm";
import { PhoneLink } from "@/components/PhoneLink";
import { getSpecialtyContent } from "@/lib/specialty-content";
import { tSpecialty, tLanguage } from "@/lib/specialty-i18n";
import { tConvention, tPayment } from "@/lib/doctor-options";

type Params = Promise<{ lang: string; slug: string }>;

// Profil médecin — données STABLES (identité, spécialité, ville, horaires, avis).
// Mises en cache DURABLE 1 h (Vercel Data Cache, cf. lib/cache) : ~20k fiches sur
// le chemin SEO principal → on ne rejoue pas cette requête (avis + jointures) à
// chaque visite. `prix` (Decimal) est converti en `number` : un Decimal ne
// survit pas à la sérialisation JSON du Data Cache (perd `.toNumber()`).
// La DISPONIBILITÉ (rendez-vous, créneaux bloqués, absences) est VOLATILE : elle
// est exclue d'ici et lue à part, non cachée (getDoctorAvailability), pour ne
// jamais servir un créneau périmé (anti double-réservation).
const getDoctorProfile = (slug: string) =>
  cachedQuery(`doctor:${slug}`, 3600, async () => {
    const doc = await prisma.doctor.findUnique({
      where: { slug },
      include: {
        specialty:    { select: { name: true, slug: true } },
        city:         { select: { name: true, slug: true, region: true } },
        workingHours: { orderBy: { dayOfWeek: "asc" } },
        reviews: {
          where:   { isPublic: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { patient: { select: { name: true, avatar: true } } },
        },
        _count: { select: { reviews: { where: { isPublic: true } } } },
      },
    });
    return doc ? { ...doc, prix: decToNum(doc.prix) } : null;
  });

// Disponibilité — VOLATILE, jamais cachée. Lue UNIQUEMENT pour les fiches
// réservables (Pro) : les 99 % de fiches non réservables ne paient plus la
// requête « rendez-vous » (allègement vs. l'ancien getDoctor qui la chargeait
// systématiquement).
async function getDoctorAvailability(doctorId: string) {
  const doc = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      blockedSlots: { select: { date: true, time: true } },
      absences:     { select: { startDate: true, endDate: true, allDay: true, startTime: true, endTime: true } },
      appointments: { where: { status: { notIn: ["CANCELLED"] } }, select: { date: true, time: true } },
    },
  });
  return doc ?? { blockedSlots: [], absences: [], appointments: [] };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await getDoctorProfile(slug);
  if (!p) return { title: "Praticien introuvable", robots: { index: false } };
  const name = [p.civilite, p.prenom, p.nom].filter(Boolean).join(" ");
  const title = `${name} — ${p.specialty.name} à ${p.city.name}`;
  // Même seuil que la page : pas de note agrégée dans le SEO sous 3 avis fiables.
  const ratingSnippet = p._count.reviews >= 3 && p.averageRating > 0
    ? ` Note ${p.averageRating.toFixed(1)}/5 (${p._count.reviews} avis).`
    : "";
  // Les descriptions factices (« Test », « import »…) sont écartées du SEO :
  // on retombe alors sur une méta générée, propre et informative.
  const cleanDesc = cleanDoctorDescription(p.description);
  const rawDesc = cleanDesc
    ?? `Consultez le profil de ${name}, ${p.specialty.name} à ${p.city.name}.${ratingSnippet} Tarifs, horaires et prise de rendez-vous en ligne.`;
  const description = rawDesc.length > 155 ? rawDesc.slice(0, 152) + "…" : rawDesc;
  const ogDescription = cleanDesc
    ? (cleanDesc.length > 120 ? cleanDesc.slice(0, 117) + "…" : cleanDesc)
    : `${name}, ${p.specialty.name} à ${p.city.name} — SantéauMaroc.${ratingSnippet}`;

  const locale = toLocale(lang);
  return {
    title,
    description,
    alternates: localizedAlternates(`/praticiens/${slug}`, locale),
    openGraph: {
      title,
      description: ogDescription,
      url: `/praticiens/${slug}`,
      type: "profile",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
      // Image OG/Twitter fournie dynamiquement par opengraph-image.tsx
      // (nom + spécialité + ville + note) — meilleure que l'avatar brut.
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
    },
  };
}

/* ── Helpers ─────────────────────────────────────────────── */

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
    { bg: "bg-accent-100",    text: "text-accent-700"    },
  ];
  return palettes[(name ?? "A").charCodeAt(0) % palettes.length];
}

/* ── Icônes ─────────────────────────────────────────────── */

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

function StarsRow({ rating, size = "md", label = `Note : ${rating} sur 5` }: { rating: number; size?: "sm" | "md" | "lg"; label?: string }) {
  return (
    <div role="img" className="flex items-center gap-px" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < Math.round(rating)} size={size} />
      ))}
    </div>
  );
}

/* Micro-preuves de réassurance affichées près du CTA de réservation (CRO). */
function Reassurance({ t }: { t: Dictionary["doctor"] }) {
  const items = [t.reassureFree, t.reassureNoCommit, t.reassureCancel, t.reassureSecure];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((label) => (
        <li key={label} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <svg viewBox="0 0 16 16" fill="none" stroke="#059669" strokeWidth="2" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8.5l3.5 3.5L13 4.5"/>
          </svg>
          {label}
        </li>
      ))}
    </ul>
  );
}

/* ── Sous-composants avis ────────────────────────────────── */

function RatingSummary({
  averageRating,
  totalCount,
  reviews,
  dict,
}: {
  averageRating: number;
  totalCount: number;
  reviews: { rating: number }[];
  dict: Dictionary;
}) {
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct   = totalCount > 0 ? (count / totalCount) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-5 mb-1"
      style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}
    >
      <div className="flex gap-6 items-center">
        {/* Score */}
        <div className="text-center shrink-0 min-w-[72px]">
          <p className="text-[3rem] font-black leading-none text-slate-900 tracking-tight">
            {averageRating.toFixed(1)}
          </p>
          <StarsRow rating={averageRating} size="md" label={`${dict.card.ratingPrefix} ${averageRating} ${dict.card.ratingOf5}`} />
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            {totalCount} {dict.card.reviews}
          </p>
        </div>

        <div className="w-px self-stretch bg-slate-100 shrink-0" />

        {/* Distribution */}
        <div className="flex-1 space-y-1.5">
          {dist.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2" aria-label={`${star} / 5 — ${count} ${dict.card.reviews}`}>
              <span aria-hidden="true" className="text-xs font-semibold text-slate-500 w-3 text-end shrink-0">{star}</span>
              <StarIcon filled size="sm" />
              <div aria-hidden="true" className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span aria-hidden="true" className="text-xs text-slate-500 w-4 text-end shrink-0 tabular-nums">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  dict,
  locale,
}: {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    appointmentId: string | null;
    patient: { name: string | null; avatar: string | null };
  };
  dict: Dictionary;
  locale: string;
}) {
  const name    = review.patient.name || dict.doctor.anonymous;
  const initial = name.charAt(0).toUpperCase();
  const colors  = avatarColor(initial);
  const nColor  = ratingColor(review.rating);
  const exactDate = new Date(review.createdAt).toLocaleDateString(
    locale === "ar" ? "ar-MA" : "fr-MA",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <article
      className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 transition-all duration-200 hover:border-slate-200 hover:shadow-sm"
      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 font-bold text-sm`}>
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="font-semibold text-sm text-slate-900 leading-snug truncate max-w-[200px] sm:max-w-none">
              {name}
            </p>
            <time
              dateTime={review.createdAt.toISOString()}
              className="text-xs text-slate-500 shrink-0 mt-0.5"
            >
              {exactDate}
            </time>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <StarsRow rating={review.rating} size="sm" label={`${dict.card.ratingPrefix} ${review.rating} ${dict.card.ratingOf5}`} />
            <span className={`text-xs font-bold ${nColor}`}>{review.rating}/5</span>
            {review.appointmentId && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary-50 border border-secondary-100 text-secondary-700 text-xs font-semibold cursor-help"
                title={dict.doctor.consultationVerifiedTitle}
              >
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" aria-hidden="true">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {dict.doctor.consultationVerified}
              </span>
            )}
          </div>
        </div>
      </div>

      {review.comment && (
        <blockquote className="mt-3 text-sm text-slate-700 leading-relaxed ps-[52px]">
          {review.comment}
        </blockquote>
      )}
    </article>
  );
}

function EmptyReviews({ reviewButton, t }: { reviewButton: React.ReactNode; t: Dictionary["doctor"] }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5"
          className="w-7 h-7" aria-hidden="true"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <h3 className="font-semibold text-slate-700 text-sm">{t.emptyTitle}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[220px] mx-auto">
        {t.emptyText}
      </p>
      {reviewButton}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default async function PraticienProfilePage({ params }: { params: Params }) {
  const { lang, slug } = await params;

  const [p, session] = await Promise.all([
    getDoctorProfile(slug),
    tryGetSession(),
  ]);
  if (!p || !p.isActive) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const d = dict.doctor;

  /* Déterminer le statut de l'utilisateur courant */
  const canReview = session?.role === "PATIENT" || session?.role === "ADMIN";
  const userStatus: UserStatus =
    !session?.userId ? "not-logged-in" :
    !canReview       ? "not-patient"   :
                       "yes";

  const isUnclaimed   = !p.userId;
  const isDoctorUser  = session?.role === "DOCTOR";

  // Bannière de revendication : affichée sur les fiches migrées (non revendiquées)
  // ET non vérifiées, pour tout visiteur SAUF un patient connecté (déconnectés,
  // médecins et admins la voient ; c'est du B2B, sans intérêt pour un patient).
  const showClaimBanner = isUnclaimed && !p.isVerified && session?.role !== "PATIENT";

  /* Requêtes parallèles selon les droits */
  let existingReview: ExistingReview = null;
  let existingClaim: { status: string; adminNote: string | null } | null = null;

  const [reviewResult, claimResult, patientResult] = await Promise.all([
    userStatus === "yes" && session?.userId
      ? prisma.review.findUnique({
          where:  { patientId_doctorId: { patientId: session.userId, doctorId: p.id } },
          select: { rating: true, comment: true },
        })
      : Promise.resolve(null),
    isUnclaimed && isDoctorUser && session?.userId
      ? prisma.doctorClaim.findUnique({
          where:  { doctorId_userId: { doctorId: p.id, userId: session.userId } },
          select: { status: true, adminNote: true },
        })
      : Promise.resolve(null),
    session?.userId
      ? prisma.user.findUnique({ where: { id: session.userId }, select: { phone: true } })
      : Promise.resolve(null),
  ]);
  existingReview = reviewResult;
  existingClaim  = claimResult;

  const fullName   = [p.civilite, p.prenom, p.nom].filter(Boolean).join(" ") || d.fallbackName;
  // Présentation exploitable ou null (écarte les données-poubelle : « Test »…).
  // Sert au bloc « À propos » et au JSON-LD ; le SEO utilise la même logique.
  const cleanDescription = cleanDoctorDescription(p.description);
  // Numéro composable pour les liens `tel:` (le champ peut contenir plusieurs
  // numéros ou du texte libre : « 0652218080 / 0522581016 »). Le libellé, lui,
  // reste affiché tel quel (les deux numéros restent une info utile).
  const phoneHref = telHref(p.phone);
  // Adresse normalisée pour l'affichage (casse : « RADIOLOGIE… » → « Radiologie… »).
  // La requête Maps garde l'adresse brute pour le géocodage.
  const displayAddress = formatStreetAddress(p.adresse);

  const spContent = getSpecialtyContent(p.specialty.slug, locale);
  const spSyn = spContent.synonyme;
  // Les synonymes de spécialité ne sont rédigés qu'en français (contenu SEO).
  // En arabe, on retombe sur un terme générique traduit pour éviter un mot FR isolé.
  const synonymePluriel = locale === "ar"
    ? d.specialistsWord
    : spSyn !== "spécialiste"
      ? spSyn.includes(" ")
        ? spSyn.split(" ").map(w => w + "s").join(" ")   // "médecin généraliste" → "médecins généralistes"
        : spSyn + "s"                                     // "cardiologue" → "cardiologues"
      : `spécialistes en ${tSpecialty(p.specialty.name, locale)}`;

  // Seuil minimal d'avis pour afficher une note agrégée (hero, factoïde, JSON-LD).
  // En dessous, un « 5,0 sur 1 avis » nuit à la confiance et expose à une pénalité
  // de rich snippet ; on préfère afficher les avis individuels sans agrégat.
  const MIN_REVIEWS_FOR_RATING = 3;
  const hasReliableRating = p._count.reviews >= MIN_REVIEWS_FOR_RATING && p.averageRating > 0;

  // Phrase « factoïde » dense (GEO/LLMO) — résumé factuel citable, rendu visiblement dans le hero.
  const specWord    = tSpecialty(p.specialty.name, locale);
  // Nom de métier (la personne) : « médecin généraliste », et non la spécialité « médecine générale ».
  // FR : synonyme rédactionnel (toujours en minuscules) ; AR : nom de spécialité en phrase nominale.
  // FR : si la spécialité n'a pas de synonyme rédactionnel (fallback générique
  // « spécialiste »), on nomme la spécialité — « spécialiste en Acupuncture » —
  // au lieu d'un « spécialiste » nu qui n'informe ni le lecteur ni les moteurs.
  const specPhrase  = locale === "fr"
    ? (spSyn === "spécialiste" ? `spécialiste en ${specWord}` : spSyn)
    : specWord;
  // Langues en minuscules en français (« arabe » et non « Arabe ») pour une phrase naturelle.
  const factoidLangsRaw = p.langues.map((l) => tLanguage(l, locale));
  const factoidLangs    = locale === "fr" ? factoidLangsRaw.map((l) => l.toLowerCase()) : factoidLangsRaw;
  const langPhrase =
    factoidLangs.length === 0 ? "" :
    factoidLangs.length === 1 ? factoidLangs[0] :
    `${factoidLangs.slice(0, -1).join(", ")} ${d.factoidAnd} ${factoidLangs[factoidLangs.length - 1]}`;
  const factoidParts: string[] = [
    `${fullName} ${d.factoidIs} ${specPhrase} ${d.inCity} ${p.city.name}.`,
  ];
  // Phrases distinctes et impersonnelles (pas de pronom genré).
  if (langPhrase) factoidParts.push(`${d.factoidConsults} ${langPhrase}.`);
  if (p.adresse)  factoidParts.push(`${d.factoidReceives} ${p.adresse}.`);
  if (hasReliableRating) {
    factoidParts.push(`${d.factoidRating} ${p.averageRating.toFixed(1)}/5 ${d.factoidReviewsOn} ${p._count.reviews} ${dict.card.reviews}.`);
  }
  const factoid = factoidParts.join(" ");

  // Phrase d'introduction UNIQUE par médecin, injectée dans le bloc spécialité
  // (générique et donc dupliqué entre fiches) pour casser la duplication SEO.
  // Verbe « consulte » (3ᵉ pers.) → aucune marque de genre ; nominal en arabe.
  const practiceIntro = locale === "ar"
    ? `${fullName} — ${specWord} ${d.inCity} ${p.city.name}${langPhrase ? ` · ${d.practiceConsults} ${langPhrase}` : ""}.`
    : `${fullName}, ${specPhrase} ${d.inCity} ${p.city.name}${langPhrase ? `, ${d.practiceConsults} ${langPhrase}` : ""}.`;

  // Texte d'attente honnête quand aucune présentation n'a été rédigée (anti-section vide).
  // Élision de « en tant que » → « qu' » devant une spécialité à voyelle initiale
  // (acupuncteur, ophtalmologue, orthodontiste, homéopathe…).
  const specVowelStart = /^[aeiouyàâäéèêëîïôöûüæœh]/i.test(specPhrase);
  const exercePhrase = specVowelStart
    ? `${d.aboutEmptyExerce.replace(/e$/, "'")}${specPhrase}`   // « exerce en tant qu'acupuncteur »
    : `${d.aboutEmptyExerce} ${specPhrase}`;                     // « exerce en tant que cardiologue »
  const aboutEmptyText = locale === "ar"
    ? `${fullName} — ${specWord} ${d.inCity} ${p.city.name}. ${d.aboutEmptyHint}`
    : `${fullName} ${exercePhrase} ${d.inCity} ${p.city.name}. ${d.aboutEmptyHint}`;

  // Libellés traduits du bouton « Laisser un avis » (passés au composant client).
  const reviewTrigger = {
    leave: d.leaveReview,
    edit: d.editReview,
    leaveAria: d.leaveReviewAria,
    editAria: d.editReviewAria,
    onlyPatients: d.reviewOnlyPatients,
  };
  const activeHours = p.workingHours.filter((wh) => wh.isActive);
  const hasSchedule = activeHours.length > 0;
  const prix        = p.prix ?? undefined;

  /* ── Statut « Ouvert / Fermé » en temps réel ─────────────
     Calculé sur l'heure de Casablanca (le serveur peut être ailleurs).
     N'utilise que les horaires existants — signal de confiance clé (Doctolib/Google). */
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const casaNow  = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
  const nowDay   = casaNow.getDay();          // 0 = dimanche … 6 = samedi (comme dayOfWeek)
  const nowMin   = casaNow.getHours() * 60 + casaNow.getMinutes();
  const isOpenNow = activeHours.some(
    (wh) => wh.dayOfWeek === nowDay && nowMin >= toMin(wh.startTime) && nowMin < toMin(wh.endTime),
  );
  // Prochaine ouverture (aujourd'hui plus tard, sinon jour suivant sur 7 jours).
  let nextOpen: { day: number; time: string; isToday: boolean } | null = null;
  if (hasSchedule && !isOpenNow) {
    for (let offset = 0; offset < 7 && !nextOpen; offset++) {
      const day = (nowDay + offset) % 7;
      const slots = activeHours
        .filter((wh) => wh.dayOfWeek === day && (offset > 0 || toMin(wh.startTime) > nowMin))
        .sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
      if (slots[0]) nextOpen = { day, time: slots[0].startTime, isToday: offset === 0 };
    }
  }
  const openStatusLabel = isOpenNow
    ? d.scheduleOpen
    : nextOpen
      ? nextOpen.isToday
        ? `${d.scheduleOpensAt} ${nextOpen.time}`
        : `${d.scheduleOpensPrefix} ${dict.dayNames[nextOpen.day]} · ${nextOpen.time}`
      : null;

  // Gating Pro : la prise de RDV en ligne est une fonction premium.
  // Un médecin sans abonnement Pro retombe sur le parcours « appeler / être rappelé ».
  const canBook = hasSchedule && hasProAccess(p.plan, p.planExpiresAt, p.trialEndsAt);

  /* ── Réservation inline ──────────────────────────────────
     Créneaux générés côté serveur, comme la page /rdv dédiée.
     Auth tardive : le compte n'est demandé qu'au moment de confirmer. */
  const isAuthenticated = !!session?.userId;
  const needsPhone      = isAuthenticated && !patientResult?.phone;
  const tRdv            = dict.rdv;

  const slotsByDate: Record<string, string[]> = {};
  if (canBook) {
    // Disponibilité fraîche (hors cache) — uniquement pour les fiches réservables.
    const { appointments, absences, blockedSlots } = await getDoctorAvailability(p.id);
    const bookedSlots = appointments.map((a) => ({ date: a.date, time: a.time }));
    const allSlots = generateAvailableSlots(
      bookedSlots,
      p.workingHours,
      p.consultationDuration,
      absences,
      { leadHours: p.bookingLeadHours, maxDays: p.bookingMaxDays },
    );
    const blockedSet = new Set(blockedSlots.map((b) => `${b.date}-${b.time}`));
    for (const slot of allSlots) {
      if (!slot.available) continue;
      if (blockedSet.has(`${slot.date}-${slot.time}`)) continue;
      (slotsByDate[slot.date] ??= []).push(slot.time);
    }
  }

  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

  const SCHEMA_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const openingHoursSpecification = activeHours.map((wh) => ({
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": `https://schema.org/${SCHEMA_DAYS[wh.dayOfWeek]}`,
    "opens": wh.startTime,
    "closes": wh.endTime,
  }));

  const mapsQuery = encodeURIComponent(`${p.adresse}, ${p.city.name}, Maroc`);
  const hasMap = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Physician",
        "@id": `${BASE}/praticiens/${slug}#physician`,
        "name": fullName,
        "url": `${BASE}/praticiens/${slug}`,
        "hasMap": hasMap,
        ...(cleanDescription && { "description": cleanDescription }),
        // Les données structurées exigent une URL d'image ABSOLUE (l'avatar est
        // stocké en chemin relatif « /uploads/… » → sinon ignorée par Google).
        ...(p.avatar && { "image": p.avatar.startsWith("http") ? p.avatar : `${BASE}${p.avatar}` }),
        "address": {
          "@type": "PostalAddress",
          "streetAddress": displayAddress,
          "addressLocality": p.city.name,
          "addressRegion": p.city.region ?? p.city.name,
          "addressCountry": "MA",
        },
        ...(p.latitude != null && p.longitude != null && {
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": p.latitude,
            "longitude": p.longitude,
          },
        }),
        "telephone": phoneHref ?? p.phone,
        "medicalSpecialty": p.specialty.name,
        ...(p.motifs.length > 0 && {
          "availableService": p.motifs.map((m) => ({ "@type": "MedicalProcedure", "name": m })),
        }),
        ...(p.langues.length > 0 && { "knowsLanguage": p.langues }),
        // Modes de paiement — propriété LocalBusiness valide (Physician en hérite).
        ...(p.paymentMethods.length > 0 && { "paymentAccepted": p.paymentMethods.join(", ") }),
        // Conventionnement / prise en charge — pas de propriété schema.org dédiée :
        // exposé en additionalProperty pour rester exploitable par les moteurs.
        ...(p.conventions.length > 0 && {
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Conventionnement",
            "value": p.conventions.join(", "),
          },
        }),
        ...(prix && { "priceRange": `${prix} MAD` }),
        ...(openingHoursSpecification.length > 0 && { openingHoursSpecification }),
        ...(p.isVerified && { "hasCredential": { "@type": "EducationalOccupationalCredential", "credentialCategory": "Praticien vérifié" } }),
        ...(hasReliableRating && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": p.averageRating.toFixed(1),
            "reviewCount": p._count.reviews,
            "bestRating": "5",
            "worstRating": "1",
          },
        }),
      },
      /* Page médicale (YMYL) — `lastReviewed`/`dateModified` = signal de fraîcheur
         attendu par Google et les moteurs génératifs pour du contenu santé. */
      {
        "@type": "MedicalWebPage",
        "@id": `${BASE}/praticiens/${slug}#webpage`,
        "url": `${BASE}/praticiens/${slug}`,
        "name": `${fullName} — ${tSpecialty(p.specialty.name, locale)} ${d.inCity} ${p.city.name}`,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "lastReviewed": p.updatedAt.toISOString().slice(0, 10),
        "dateModified": p.updatedAt.toISOString(),
        "mainEntity": { "@id": `${BASE}/praticiens/${slug}#physician` },
        ...(spContent.faqs.length > 0 && { "mainContentOfPage": { "@id": `${BASE}/praticiens/${slug}#faq` } }),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": d.breadcrumbHome, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": dict.nav.doctors, "item": `${BASE}/praticiens` },
          { "@type": "ListItem", "position": 3, "name": tSpecialty(p.specialty.name, locale), "item": `${BASE}/specialites/${p.specialty.slug}` },
          { "@type": "ListItem", "position": 4, "name": p.city.name, "item": `${BASE}/specialites/${p.specialty.slug}/${p.city.slug}` },
          { "@type": "ListItem", "position": 5, "name": fullName, "item": `${BASE}/praticiens/${slug}` },
        ],
      },
      /* Avis individuels — citables un par un par les moteurs (au-delà de l'aggregateRating). */
      ...p.reviews
        .filter((r) => r.comment)
        .map((r) => ({
          "@type": "Review",
          "itemReviewed": { "@id": `${BASE}/praticiens/${slug}#physician` },
          "author": { "@type": "Person", "name": r.patient.name || d.anonymous },
          "reviewRating": { "@type": "Rating", "ratingValue": r.rating, "bestRating": 5, "worstRating": 1 },
          "datePublished": new Date(r.createdAt).toISOString().slice(0, 10),
          "reviewBody": r.comment,
        })),
      /* FAQ — éligible aux rich results Google + matière première GEO/LLMO.
         Le contenu est rendu visiblement sur la page (cf. section FAQ). */
      ...(spContent.faqs.length > 0
        ? [{
            "@type": "FAQPage",
            "@id": `${BASE}/praticiens/${slug}#faq`,
            "mainEntity": spContent.faqs.map((f) => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": { "@type": "Answer", "text": f.a },
            })),
          }]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="page-outer">

        {/* ── Fil d'Ariane ────────────────────────── */}
        <nav aria-label={d.breadcrumbAria} className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap">
          {/* « Accueil » en tête : le fil d'Ariane visible reflète exactement le
              BreadcrumbList JSON-LD (exigence Google : parité balisage ↔ affichage). */}
          <Link href="/" className="hover:text-secondary-600 transition-colors">{d.breadcrumbHome}</Link>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
          </svg>
          <Link href="/praticiens" className="hover:text-secondary-600 transition-colors">{dict.nav.doctors}</Link>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
          </svg>
          {/* Niveau spécialité → page canonique /specialites/[slug] (et non le
              listing filtré), pour coller au JSON-LD et concentrer le maillage SEO. */}
          <Link href={`/specialites/${p.specialty.slug}`} className="hover:text-secondary-600 transition-colors">
            {tSpecialty(p.specialty.name, locale)}
          </Link>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
          </svg>
          {/* Niveau ville — capte la requête locale « spécialité + ville » */}
          <Link href={`/specialites/${p.specialty.slug}/${p.city.slug}`} className="hover:text-secondary-600 transition-colors">
            {p.city.name}
          </Link>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
          </svg>
          <span className="text-slate-600 truncate">{fullName}</span>
        </nav>

        {/* ── Bannière revendication ──────────────────────────
            Fiches migrées non revendiquées ET non vérifiées, visibles pour tout
            visiteur sauf un patient connecté (cf. showClaimBanner). Pour un patient,
            c'est un message B2B qui parasite l'intention de prise de rendez-vous ;
            il garde un accès discret via la carte « Vous êtes ce médecin ? » en sidebar. */}
        {showClaimBanner && (
          <Link
            href={`/praticiens/${slug}/revendiquer`}
            className="group flex items-center gap-4 mb-5 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50/40 px-4 sm:px-5 py-3.5 hover:border-primary-300 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <span className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.75"
                className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 3v14M4 3l11 3.5L4 10.5" />
              </svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-slate-900 leading-snug">
                {d.claimBannerTitle.replace("{name}", fullName)}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5 leading-snug">
                {d.claimBannerText}
              </span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 shrink-0">
              {d.claimBannerCta}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-4 h-4 rtl:-scale-x-100 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 3 5 5-5 5" />
              </svg>
            </span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="sm:hidden w-4 h-4 text-primary-500 shrink-0 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 3 5 5-5 5" />
            </svg>
          </Link>
        )}

        <div className="grid md:grid-cols-3 gap-5">

          {/* ══════════════════════════════════════════
              COLONNE PRINCIPALE
              ══════════════════════════════════════════ */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* ── Carte hero praticien (premium) ─────────────── */}
            <div className="card overflow-hidden p-0">
              {/* Bandeau dégradé */}
              <div
                className="relative h-24 sm:h-28"
                style={{ background: "linear-gradient(115deg, #2563eb 0%, #2e6fe6 45%, #059669 100%)" }}
              >
                {p.isVerified && (
                  <span
                    className="absolute bottom-3 end-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,.16)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,.32)" }}
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0" aria-hidden="true">
                      <path d="M6 0.75L0.75 3.25V7c0 2.5 1.9 4.4 5.25 5.25C9.35 11.4 11.25 9.5 11.25 7V3.25z" fill="rgba(255,255,255,.25)" stroke="white" strokeWidth="1.1" strokeLinejoin="round"/>
                      <path d="M3.75 6.5l1.75 1.75L9.25 4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {d.verifiedProfile}
                  </span>
                )}
              </div>

              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                {/* Avatar débordant sur le bandeau */}
                <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 -mt-14 sm:-mt-16 rounded-3xl bg-white p-1.5 shadow-lg">
                  <div className="w-full h-full rounded-[18px] overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                    {p.avatar ? (
                      <Image
                        src={p.avatar}
                        alt={`Photo de profil de ${fullName}`}
                        width={112}
                        height={112}
                        sizes="(max-width: 640px) 96px, 112px"
                        className="w-full h-full object-cover"
                        priority
                      />
                    ) : (
                      <span className="text-primary-700 font-bold text-3xl sm:text-4xl select-none" aria-hidden="true">
                        {getDoctorInitials(p.prenom, p.nom)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Identité */}
                <div className="mt-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{fullName}</h1>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Link
                      href={`/praticiens?specialite=${p.specialty.slug}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                      {tSpecialty(p.specialty.name, locale)}
                    </Link>

                    {/* Étoiles pleines + note chiffrée UNIQUEMENT au-dessus du seuil d'avis
                        fiable : un « 5,0 sur 1 avis » rendu en 5 étoiles dorées se lit comme
                        factice (même règle que PraticienCard et le bloc RatingSummary). */}
                    {hasReliableRating ? (
                      <span className="inline-flex items-center gap-1.5">
                        <StarsRow rating={p.averageRating} size="md" label={`${dict.card.ratingPrefix} ${p.averageRating} ${dict.card.ratingOf5}`} />
                        <span className={`text-sm font-bold tabular-nums ${ratingColor(p.averageRating)}`}>
                          {p.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-600">
                          ({p._count.reviews} {dict.card.reviews})
                        </span>
                      </span>
                    ) : p._count.reviews > 0 ? (
                      // 1-2 avis : mention sobre, sans étoiles pleines ni note gonflée.
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <StarIcon filled={false} size="md" />
                        <span>{p._count.reviews} {dict.card.reviewsFew}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <StarsRow rating={0} size="md" label={`${dict.card.ratingPrefix} 0 ${dict.card.ratingOf5}`} />
                        <span className="text-xs text-slate-600">{dict.card.noReviews}</span>
                      </span>
                    )}

                  </div>

                  {/* Factoïde GEO — résumé factuel dense, citable par les moteurs IA */}
                  <p className="mt-3.5 text-sm sm:text-[15px] text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 border-s-[3px] border-s-secondary-500 rounded-xl px-3.5 py-2.5">
                    {factoid}
                  </p>
                </div>
              </div>

              {/* Meta strip — coordonnées clés (pleine largeur, hairlines) */}
              <div
                className="grid border-t border-slate-100 bg-slate-100 gap-px"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
              >
                <div className="bg-white px-4 py-3.5 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{d.addressLabel}</p>
                  <p className="text-[13px] text-slate-700 mt-1 leading-snug">
                    <bdi>{displayAddress}, <span className="font-medium text-slate-900">{p.city.name}</span></bdi>
                  </p>
                </div>

                {p.phone && (
                  <div className="bg-white px-4 py-3.5 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{d.phoneLabel}</p>
                    {phoneHref ? (
                      <PhoneLink doctorId={p.id} href={phoneHref} source="profile" className="text-[13px] font-semibold text-primary-700 hover:text-primary-800 mt-1 inline-block tabular-nums">
                        <bdi dir="ltr">{p.phone}</bdi>
                      </PhoneLink>
                    ) : (
                      <p className="text-[13px] font-semibold text-slate-700 mt-1 tabular-nums"><bdi dir="ltr">{p.phone}</bdi></p>
                    )}
                  </div>
                )}

                {p.langues.length > 0 && (
                  <div className="bg-white px-4 py-3.5 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{d.languages}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.langues.map((l) => {
                        const isLocal = /arabe|darija|amazigh/i.test(l);
                        return (
                          <span
                            key={l}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isLocal
                                ? "bg-secondary-50 text-secondary-700 border-secondary-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {tLanguage(l, locale)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {p.experience && (
                  <div className="bg-white px-4 py-3.5 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{d.expLabel}</p>
                    <p className="text-[13px] font-semibold text-slate-800 mt-1">
                      {p.experience} {p.experience > 1 ? d.yearMany : d.yearOne}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Réservation inline (mobile) — placée haut pour la conversion ── */}
            <div id="reserver" className="md:hidden scroll-mt-4 flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">{tRdv.breadcrumbBook}</h2>
                {prix && (
                  <span className="text-sm text-slate-500 shrink-0">
                    <span className="font-bold text-slate-900 tabular-nums">{prix}</span> {d.priceLine}
                  </span>
                )}
              </div>
              {canBook ? (
                <>
                  <BookingForm
                    doctorId={p.id}
                    slug={slug}
                    slotsByDate={slotsByDate}
                    consultationDuration={p.consultationDuration}
                    isAuthenticated={isAuthenticated}
                    needsPhone={needsPhone}
                    doctorMotifs={p.motifs}
                    t={tRdv}
                    authT={dict.auth.login.form}
                  />
                  <div className="card p-4">
                    <Reassurance t={d} />
                  </div>
                </>
              ) : (
                <div className="card p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 20 20" fill="none" stroke="#d97706" strokeWidth="1.6"
                        className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 4a1 1 0 0 1 1-1h2.2l1.2 3.4-1.7 1.2a9 9 0 0 0 3.5 3.5l1.2-1.7L14 11v2.2a1 1 0 0 1-1 1A10 10 0 0 1 3 4z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-snug">{d.callback.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{d.callback.subtitle}</p>
                    </div>
                  </div>
                  <CallbackForm doctorId={p.id} t={d.callback} doctorMotifs={p.motifs} motifT={tRdv} />
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Reassurance t={d} />
                  </div>
                  {phoneHref && (
                    <a
                      href={`tel:${phoneHref}`}
                      className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors border border-primary-100"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z"/>
                      </svg>
                      {d.callOffice}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ── À propos ─────────────────────────── */}
            <div className="card p-5 sm:p-6">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-primary-500" aria-hidden="true">
                  <circle cx="8" cy="8" r="7"/>
                  <path d="M8 7v5M8 5v.5" strokeLinecap="round"/>
                </svg>
                {d.about}
              </h2>
              {cleanDescription ? (
                <p className="text-sm text-slate-600 leading-relaxed">{cleanDescription}</p>
              ) : (
                <p className="text-sm text-slate-500 leading-relaxed italic">{aboutEmptyText}</p>
              )}
            </div>

            {/* ── Formation & Expérience ──────────── */}
            {p.experience && (
              <div className="card p-5 sm:p-6">
                <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                    className="w-4 h-4 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 9l7-7 7 7M2 8v7h4V11h4v4h4V8"/>
                  </svg>
                  {d.education}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100 text-xs font-semibold">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                      className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="8" r="7"/>
                      <path d="M8 4v4l2.5 2.5"/>
                    </svg>
                    {p.experience} {p.experience > 1 ? d.yearMany : d.yearOne} {d.experienceSuffix}
                  </span>
                  {p.isVerified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-100 text-xs font-semibold">
                      <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                        <path d="M6 0.75L0.75 3.25V7c0 2.5 1.9 4.4 5.25 5.25C9.35 11.4 11.25 9.5 11.25 7V3.25z"
                          fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                        <path d="M3.75 6.5l1.75 1.75L9.25 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {d.diplomasVerified}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Prise en charge & paiement (données médecin) — confiance + CRO + SEO local ── */}
            {(p.conventions.length > 0 || p.paymentMethods.length > 0) && (
              <div className="card p-5 sm:p-6">
                <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-secondary-50 text-secondary-600 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 1.5l5 2v4c0 3-2.2 4.9-5 5.8C5.2 12.4 3 10.5 3 7.5v-4l5-2z"/>
                      <path d="M5.75 7.75L7.25 9.25 10.25 6.25"/>
                    </svg>
                  </span>
                  {d.coverageTitle}
                </h2>
                <p className="text-sm text-slate-500 mb-4">{d.coverageLead}</p>

                <div className="flex flex-col gap-4">
                  {p.conventions.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">{d.conventionsLabel}</h3>
                      <ul className="flex flex-wrap gap-2">
                        {p.conventions.map((c) => (
                          <li
                            key={c}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-50 border border-secondary-200 text-secondary-700 text-sm font-medium"
                          >
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 8.5l3.5 3.5L13 4.5"/>
                            </svg>
                            <bdi>{tConvention(c, locale)}</bdi>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.paymentMethods.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">{d.paymentLabel}</h3>
                      <ul className="flex flex-wrap gap-2">
                        {p.paymentMethods.map((m) => (
                          <li
                            key={m}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-sm"
                          >
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="M1.5 6.5h13"/>
                            </svg>
                            <bdi>{tPayment(m, locale)}</bdi>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Contenu spécialité (SEO/GEO) — texte unique bilingue ── */}
            {spContent.description && (
              <div className="card p-5 sm:p-6">
                <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9h2.5l1.5 4 3-9 1.5 5H14"/>
                  </svg>
                  {tSpecialty(p.specialty.name, locale)} {d.inCity} {p.city.name}
                </h2>
                {/* Phrase unique par médecin — casse la duplication du texte générique de spécialité (SEO). */}
                <p className="text-sm font-medium text-slate-800 leading-relaxed mb-2">{practiceIntro}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{spContent.description}</p>

                {spContent.quandConsulter.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-2.5">{d.whenConsult}</h3>
                    <ul className="flex flex-col gap-2">
                      {spContent.quandConsulter.map((motif) => (
                        <li key={motif} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <svg viewBox="0 0 16 16" fill="none" stroke="#059669" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="8" cy="8" r="7" stroke="#a7f3d0"/>
                            <path d="M5 8l2 2 4-4"/>
                          </svg>
                          {motif}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sections éditoriales : on n'en surface que 2 sur la fiche médecin
                    (déroulé + indications) pour informer le patient sans dupliquer
                    tout le dossier de la page spécialité sur des milliers de fiches.
                    Le contenu complet reste accessible via le maillage ci-dessous. */}
                {spContent.sections && spContent.sections.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-4">
                    {spContent.sections.slice(0, 2).map((s) => (
                      <div key={s.h}>
                        <h3 className="text-sm font-semibold text-slate-800 mb-1.5">{s.h}</h3>
                        {s.body.map((para, i) => (
                          <p key={i} className="text-sm text-slate-600 leading-relaxed mb-2 last:mb-0">{para}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Motifs de consultation (propres au médecin) — SEO longue traîne + CRO ── */}
            {p.motifs.length > 0 && (
              <div className="card p-5 sm:p-6">
                <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 2.5h5l6.5 6.5a1.4 1.4 0 0 1 0 2L9 15.5a1.4 1.4 0 0 1-2 0L.5 9V4a1.5 1.5 0 0 1 1.5-1.5z"/>
                      <circle cx="5" cy="5" r="1"/>
                    </svg>
                  </span>
                  {d.motifsTitle}
                </h2>
                <p className="text-sm text-slate-500 mb-3">{d.motifsLead}</p>
                <ul className="flex flex-wrap gap-2">
                  {p.motifs.map((motif) => (
                    <li
                      key={motif}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-sm"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="#059669" strokeWidth="2" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8.5l3.5 3.5L13 4.5"/>
                      </svg>
                      {motif}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── FAQ (SEO rich results + GEO/LLMO) ──────── */}
            {spContent.faqs.length > 0 && (
              <section aria-labelledby="faq-titre" className="card p-5 sm:p-6">
                <h2 id="faq-titre" className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="7"/>
                    <path d="M6 6.2a2 2 0 1 1 2.6 1.9c-.4.15-.6.4-.6.8v.3M8 11.6v.1"/>
                  </svg>
                  {d.faqTitle}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {spContent.faqs.map((f) => (
                    <details key={f.q} className="group rounded-xl border border-slate-100 bg-white open:border-primary-100 open:shadow-sm transition-colors">
                      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-4 text-sm font-semibold text-slate-900 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500">
                        {f.q}
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-90 group-open:text-primary-500 rtl:-scale-x-100" aria-hidden="true">
                          <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
                        </svg>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* ── Localisation du cabinet (accent terracotta = identité marocaine) ── */}
            <div className="card p-5 sm:p-6">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-terra-50 text-terra-600 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true">
                    <path d="M8 1C5.79 1 4 2.79 4 5c0 3.28 4 9 4 9s4-5.72 4-9c0-2.21-1.79-4-4-4z"/>
                    <circle cx="8" cy="5" r="1.5"/>
                  </svg>
                </span>
                {d.locationTitle}
              </h2>

              {/* Aperçu carte (décoratif, cliquable vers l'itinéraire) — accent terracotta = identité marocaine */}
              <a
                href={hasMap}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${d.seeRoute} — ${displayAddress}, ${p.city.name}`}
                className="group relative block h-40 sm:h-44 rounded-xl border border-slate-100 overflow-hidden mb-3.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-terra-500"
                style={{ background: "linear-gradient(0deg, rgba(5,150,105,.05), rgba(37,99,235,.05)), #eef3f8" }}
              >
                {/* trame quadrillée */}
                <span aria-hidden="true" className="absolute inset-0" style={{
                  backgroundImage:
                    "linear-gradient(rgba(148,163,184,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.18) 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }} />
                {/* axe routier */}
                <span aria-hidden="true" className="absolute" style={{
                  left: "8%", top: "50%", width: "140%", height: "13px",
                  background: "rgba(37,99,235,.18)", transform: "rotate(-7deg)", borderRadius: "99px",
                }} />
                {/* pin */}
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                  className="absolute left-1/2 top-[42%] w-9 h-9 text-terra-600 -translate-x-1/2 -translate-y-full transition-transform group-hover:scale-110"
                  style={{ filter: "drop-shadow(0 6px 8px rgba(15,27,45,.25))" }}>
                  <path d="M12 2C8.7 2 6 4.7 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.3-2.7-6-6-6z"/>
                  <circle cx="12" cy="8" r="2.4" fill="#fff"/>
                </svg>
              </a>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <bdi>{displayAddress}, <span className="font-medium text-slate-900">{p.city.name}</span></bdi>
                </p>
                <a
                  href={hasMap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-terra-700 bg-terra-50 hover:bg-terra-100 border border-terra-100 transition-colors shrink-0"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 1C5.79 1 4 2.79 4 5c0 3.28 4 9 4 9s4-5.72 4-9c0-2.21-1.79-4-4-4z"/>
                    <circle cx="8" cy="5" r="1.5"/>
                  </svg>
                  {d.seeRoute}
                </a>
              </div>
            </div>

            {/* ── Liens vers médecins similaires ──────── */}
            <div className="flex flex-col gap-2">
              <Link
                href={`/specialites/${p.specialty.slug}/${p.city.slug}`}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-s-[3px] border-s-primary-400 border border-primary-100 bg-primary-50 hover:bg-primary-100 hover:border-primary-200 transition-colors group"
              >
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary-800 transition-colors">
                  {d.otherPre} <span className="font-semibold">{synonymePluriel}</span> {d.inCity} {p.city.name}
                </span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all shrink-0 rtl:-scale-x-100" aria-hidden="true">
                  <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
                </svg>
              </Link>
              <Link
                href={`/specialites/${p.specialty.slug}`}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-s-[3px] border-s-slate-300 border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors group"
              >
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                  {d.allPre} <span className="font-semibold">{synonymePluriel}</span> {d.inCountry}
                </span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0 rtl:-scale-x-100" aria-hidden="true">
                  <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
                </svg>
              </Link>
            </div>

            {/* ── Avis patients ────────────────────── */}
            <section id="avis" aria-labelledby="avis-titre">

              {/* En-tête */}
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <h2 id="avis-titre" className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  {d.reviewsTitle}
                  {p.reviews.length > 0 && (
                    <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 tabular-nums">
                      {p._count.reviews}
                    </span>
                  )}
                </h2>
                <ReviewDialog
                  doctorId={p.id}
                  doctorSlug={slug}
                  doctorName={fullName}
                  existingReview={existingReview}
                  userStatus={userStatus}
                  labels={reviewTrigger}
                  t={dict.review}
                  variant="header"
                />
              </div>

              {p.reviews.length === 0 ? (
                <EmptyReviews t={d} reviewButton={
                  <ReviewDialog
                    doctorId={p.id}
                    doctorSlug={slug}
                    doctorName={fullName}
                    existingReview={existingReview}
                    userStatus={userStatus}
                    labels={reviewTrigger}
                    t={dict.review}
                    variant="empty"
                  />
                } />
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Résumé + distribution — masqués sous le seuil d'avis fiable
                      (une distribution « 100 % · 5★ » sur 1 vote donne une fausse impression). */}
                  {hasReliableRating && (
                    <RatingSummary
                      averageRating={p.averageRating}
                      totalCount={p._count.reviews}
                      reviews={p.reviews}
                      dict={dict}
                    />
                  )}

                  {/* Liste */}
                  {p.reviews.map((r) => (
                    <ReviewCard key={r.id} review={r} dict={dict} locale={locale} />
                  ))}

                  {p._count.reviews > p.reviews.length && (
                    <p className="text-center text-xs text-slate-500 py-2">
                      {d.showingPre} {p.reviews.length} {d.showingMid} {p._count.reviews} {d.showingPost}
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Maillage Q/R : réponses publiées par ce médecin (E-E-A-T + Pro) */}
            <DoctorAnswersSection doctorId={p.id} doctorFirstName={p.prenom ?? p.nom ?? "ce médecin"} locale={locale} />

          </div>

          {/* ══════════════════════════════════════════
              SIDEBAR — réservation inline + infos
              ══════════════════════════════════════════ */}
          {/* Pas de sticky : la colonne (réservation + horaires + fiche) dépasse
              toujours la hauteur du viewport → un sticky épinglé en haut rendait
              son bas (confirmation / connexion) inatteignable. Défilement naturel. */}
          <div className="flex flex-col gap-4 md:self-start">

            {/* 1. Réservation inline (desktop) — toujours en premier */}
            <div className="hidden md:flex flex-col gap-4" id="rdv">

              {/* En-tête : prix + durée */}
              <div className="card overflow-hidden p-0">
                <div className="h-1"
                  style={{ background: canBook
                    ? "linear-gradient(90deg, #059669 0%, #2563eb 100%)"
                    : "linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)" }} />
                <div className="p-4 flex items-center justify-between gap-3">
                  {prix ? (
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
                        {prix} <span className="text-sm font-medium text-slate-500">{d.priceLine}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1 truncate">{d.reimbursement}</p>
                    </div>
                  ) : (
                    // Sans RDV en ligne (non-Pro), le libellé reflète le canal réel
                    // (rappel téléphonique) plutôt que de promettre une réservation.
                    <p className="text-sm font-semibold text-slate-700">{canBook ? d.book : d.callback.title}</p>
                  )}
                  {/* Durée de consultation : pertinente seulement quand le RDV en ligne
                      est possible — l'afficher sans agenda renforce une fausse promesse. */}
                  {canBook && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                        className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="8" r="7"/><path d="M8 4v4l2.5 2.5"/>
                      </svg>
                      {p.consultationDuration}&nbsp;{d.minutes}
                    </span>
                  )}
                </div>
              </div>

              {canBook ? (
                <>
                  <BookingForm
                    doctorId={p.id}
                    slug={slug}
                    slotsByDate={slotsByDate}
                    consultationDuration={p.consultationDuration}
                    isAuthenticated={isAuthenticated}
                    needsPhone={needsPhone}
                    doctorMotifs={p.motifs}
                    t={tRdv}
                    authT={dict.auth.login.form}
                  />
                  <div className="card p-4">
                    <Reassurance t={d} />
                  </div>
                </>
              ) : (
                <div className="card p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 20 20" fill="none" stroke="#d97706" strokeWidth="1.6"
                        className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 4a1 1 0 0 1 1-1h2.2l1.2 3.4-1.7 1.2a9 9 0 0 0 3.5 3.5l1.2-1.7L14 11v2.2a1 1 0 0 1-1 1A10 10 0 0 1 3 4z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-snug">{d.callback.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{d.callback.subtitle}</p>
                    </div>
                  </div>
                  <CallbackForm doctorId={p.id} t={d.callback} doctorMotifs={p.motifs} motifT={tRdv} />
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Reassurance t={d} />
                  </div>
                  {phoneHref && (
                    <a
                      href={`tel:${phoneHref}`}
                      className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors border border-primary-100"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z"/>
                      </svg>
                      {d.callOffice}
                    </a>
                  )}
                  <div className="mt-2">
                    <NotifyButton notifyMe={d.notifyMe} willNotify={d.willNotify} />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Horaires */}
            {activeHours.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-primary-500" aria-hidden="true">
                      <circle cx="8" cy="8" r="7"/>
                      <path d="M8 4v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {d.schedule}
                  </h2>
                  {/* Statut temps réel — vert = ouvert, ambre = fermé + prochaine ouverture. */}
                  {openStatusLabel && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        isOpenNow
                          ? "bg-secondary-50 text-secondary-700 border border-secondary-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? "bg-secondary-500" : "bg-amber-500"}`} />
                      {isOpenNow ? d.scheduleOpen : (
                        <span>
                          <span className="text-amber-600 font-bold">{d.scheduleClosed}</span>
                          <span className="font-normal text-amber-700"> · {openStatusLabel}</span>
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  {activeHours.map((wh) => {
                    // nowDay = jour de la semaine à l'heure du Maroc (cf. isOpenNow) —
                    // PAS new Date().getDay() (fuseau serveur → mauvais jour surligné près de minuit).
                    const isToday = wh.dayOfWeek === nowDay;
                    return (
                      <div
                        key={wh.id}
                        className={`flex justify-between items-center text-sm py-1.5 ${
                          isToday
                            ? "bg-secondary-50 -mx-2 px-2 rounded-lg"
                            : "border-b border-slate-50 last:border-0"
                        }`}
                      >
                        <span className={`font-medium w-10 shrink-0 ${isToday ? "text-secondary-700" : "text-slate-500"}`}>
                          {dict.dayNames[wh.dayOfWeek]}
                        </span>
                        <span className={`font-semibold tabular-nums ${isToday ? "text-secondary-800" : "text-slate-800"}`}>
                          {wh.startTime} – {wh.endTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Revendiquer la fiche — en dernier (adressé aux praticiens) */}
            {isUnclaimed && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                    className="w-4 h-4 text-primary-500 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v12M3 2l9 3-9 4"/>
                  </svg>
                  <h2 className="font-semibold text-slate-900 text-sm">{d.claimTitle}</h2>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {d.claimText}
                </p>
                <ClaimButton
                  doctorSlug={slug}
                  userRole={(session?.role ?? null) as "DOCTOR" | "PATIENT" | "ADMIN" | null}
                  claimStatus={(existingClaim?.status ?? null) as "PENDING" | "APPROVED" | "REJECTED" | null}
                  adminNote={existingClaim?.adminNote}
                />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* CTA fixe mobile */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-4 py-3 safe-area-bottom">
        {canBook ? (
          <div className="flex flex-col gap-1">
            <a
              href="#reserver"
              className="btn-secondary w-full py-3.5 text-base justify-center"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                <rect x="1" y="2" width="14" height="13" rx="2"/>
                <path d="M1 6h14M5 1v2M11 1v2" strokeLinecap="round"/>
              </svg>
              {d.book}{prix ? ` — ${prix} ${d.priceIndicative}` : ""}
            </a>
            <p className="text-center text-xs text-slate-500">{d.bookConfirm}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <a href="#reserver" className="btn-secondary flex-1 py-3.5 text-base justify-center">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9"
                  className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 4a1 1 0 0 1 1-1h2l1 3.5-2 1.2a9 9 0 0 0 3.3 3.3L9.5 9 13 10v2a1 1 0 0 1-1 1A10 10 0 0 1 3 4z"/>
                </svg>
                {d.callback.submit}
              </a>
              {phoneHref && (
                <a
                  href={`tel:${phoneHref}`}
                  aria-label={d.callOffice}
                  className="shrink-0 w-12 h-12 rounded-xl border border-primary-100 bg-primary-50 text-primary-700 flex items-center justify-center hover:bg-primary-100 transition-colors"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                    className="w-5 h-5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z"/>
                  </svg>
                </a>
              )}
            </div>
            <p className="text-center text-xs text-slate-500">{d.callback.subtitle}</p>
          </div>
        )}
      </div>
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
