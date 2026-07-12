// next/link NU (pas LocaleLink) : PraticienCard est un Server Component qui
// connaît déjà `locale` → on préfixe les hrefs côté serveur via localeHref et on
// évite un îlot client LocaleLink par lien (≈6 liens × 15 cartes = ~90/page).
import Link from "next/link";
import Image from "next/image";
import { getDoctorInitials, telHref } from "@/lib/utils";
import { PhoneLink } from "@/components/PhoneLink";
import { getDictionary, localeHref, type Dictionary, type Locale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";

type Props = {
  praticien: {
    id: string;
    slug: string | null;
    nom: string | null;
    prenom: string | null;
    civilite: string | null;
    adresse: string;
    avatar: string | null;
    averageRating: number;
    prix: number | { toNumber(): number } | null;
    isVerified: boolean;
    specialty: { name: string; slug: string };
    city: { name: string; slug: string };
    _count: { reviews: number };
    /** Horaires actifs. `startTime`/`endTime` (optionnels) activent le statut
     *  Ouvert/Fermé temps réel ; sinon seul `dayOfWeek` sert à « dispo aujourd'hui ». */
    workingHours?: { dayOfWeek: number; startTime?: string; endTime?: string }[];
    /** Langues parlées (stockées en français : « Arabe », « Français »…). */
    langues?: string[];
    /** Conventionnement / prise en charge (« AMO », « CNSS », « RAMED »…). */
    conventions?: string[];
    /** Téléphone du cabinet — active l'action « Appeler » sur les fiches non réservables. */
    phone?: string | null;
  };
  priority?: boolean;
  hideSpecialty?: boolean;
  /** Médecin abonné Pro → badge + mise en avant visuelle. */
  isPro?: boolean;
  /** Add-on « Mise en avant Premium » actif → badge Premium + halo ambré. */
  isFeatured?: boolean;
  /**
   * RDV en ligne réellement possible (accès Pro/essai + horaires). Détermine
   * le CTA : « Prendre RDV » si vrai, « Voir le profil » sinon (honnêteté :
   * on ne promet pas une réservation qui n'aboutira pas). Défaut `true` pour
   * préserver le comportement des pages non encore mises à jour.
   */
  canBookOnline?: boolean;
  /** Prochains créneaux réservables déjà calculés côté page (fiche Pro/essai).
   *  Rendus en puces cliquables vers la réservation. Ignoré si `canBookOnline` faux. */
  slots?: { date: string; time: string }[];
  /** Traductions de carte. Défaut FR (pour les pages non encore traduites). */
  t?: Dictionary["card"];
  /** Locale courante — traduit le nom de spécialité affiché. Défaut FR. */
  locale?: Locale;
};

/** Seuil d'avis « fiables » : en dessous, on n'affiche ni note chiffrée ni
 *  rangée d'étoiles pleines (un « 5,0 sur 1 avis » se lit comme factice). */
const RELIABLE_REVIEWS = 3;

/** Langues → code court, lisible dans les deux locales. Repli : 2 lettres. */
const LANG_SHORT: Record<string, string> = {
  français: "FR", francais: "FR", arabe: "AR", darija: "DAR", anglais: "EN", espagnol: "ES",
  allemand: "DE", italien: "IT", amazigh: "ⵣ", tamazight: "ⵣ", berbère: "ⵣ", berbere: "ⵣ",
};
function langShort(lang: string): string {
  const key = lang.trim().toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "");
  return LANG_SHORT[key] ?? lang.trim().slice(0, 2).toUpperCase();
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
    <div role="img" className="flex items-center gap-px" aria-label={label}>
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

function ShieldCheck() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" className="w-3 h-3 shrink-0"
      aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 0.75L0.75 3.25V7c0 2.5 1.9 4.4 5.25 5.25C9.35 11.4 11.25 9.5 11.25 7V3.25z" strokeWidth="1.1"/>
      <path d="M3.75 6.5l1.75 1.75L9.25 4.5" strokeWidth="1.4"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-3 h-3.5 shrink-0 text-slate-500" aria-hidden="true">
      <path d="M6 1C3.79 1 2 2.79 2 5c0 3.28 4 9 4 9s4-5.72 4-9c0-2.21-1.79-4-4-4z"/>
      <circle cx="6" cy="5" r="1.5"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25"
      className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5"/>
      <path d="M1.5 7h11M7 1.5c1.5 1.6 1.5 9.4 0 11M7 1.5c-1.5 1.6-1.5 9.4 0 11" strokeLinecap="round"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25"
      className="w-3.5 h-3.5 shrink-0 text-secondary-500" aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1L2 3v3.5C2 9.5 4.2 11.7 7 12.5c2.8-.8 5-3 5-6V3L7 1z"/>
      <path d="M4.75 6.75L6.4 8.4 9.5 5.3" strokeWidth="1.4"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
      <rect x="2.25" y="3" width="11.5" height="11" rx="2"/>
      <path d="M2.25 6.5h11.5M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z"/>
    </svg>
  );
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

/** Statut Ouvert/Fermé temps réel (heure du Maroc), calculé uniquement si les
 *  horaires portent des heures. Renvoie null sinon (repli sur « Sur RDV »). */
function computeOpenStatus(
  hours: { dayOfWeek: number; startTime?: string; endTime?: string }[],
  now: Date,
): { isOpen: boolean; nextTime: string | null } | null {
  const withTimes = hours.filter((h) => h.startTime && h.endTime);
  if (withTimes.length === 0) return null;
  const day = now.getDay();
  const min = now.getHours() * 60 + now.getMinutes();
  const isOpen = withTimes.some(
    (h) => h.dayOfWeek === day && min >= toMin(h.startTime!) && min < toMin(h.endTime!),
  );
  if (isOpen) return { isOpen: true, nextTime: null };
  // Prochaine ouverture aujourd'hui (heure ultérieure) uniquement — signal court et honnête.
  const laterToday = withTimes
    .filter((h) => h.dayOfWeek === day && toMin(h.startTime!) > min)
    .sort((a, b) => toMin(a.startTime!) - toMin(b.startTime!))[0];
  return { isOpen: false, nextTime: laterToday ? laterToday.startTime! : null };
}

/** Étiquette courte d'un créneau : « Auj. 14:30 » / « Demain 09:00 » / « 12 juil. 09:00 ».
 *  `todayIso`/`tmrIso` sont fournis en date de Casablanca (évite tout décalage de fuseau). */
function slotLabel(date: string, time: string, todayIso: string, tmrIso: string, locale: Locale): string {
  if (date === todayIso) return `${locale === "ar" ? "اليوم" : "Auj."} ${time}`;
  if (date === tmrIso)   return `${locale === "ar" ? "غدًا" : "Demain"} ${time}`;
  const d = new Date(date + "T00:00:00");
  const day = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", { day: "numeric", month: "short" }).format(d);
  return `${day} ${time}`;
}

export function PraticienCard({ praticien: p, priority = false, hideSpecialty = false, isPro = false, isFeatured = false, canBookOnline = true, slots, t = getDictionary("fr").card, locale = "fr" }: Props) {
  const fullName = [p.civilite, p.prenom, p.nom].filter(Boolean).join(" ") || t.fallbackName;
  // hrefs préfixés /ar côté serveur (locale connue) → next/link nu, sans wrapper client.
  const href     = p.slug ? localeHref(locale, `/praticiens/${p.slug}`) : "#";
  const bookHref = p.slug ? localeHref(locale, `/praticiens/${p.slug}/rdv`) : null;
  const prix     = p.prix === null || p.prix === undefined
    ? null
    : typeof p.prix === "number"
    ? p.prix
    : p.prix.toNumber();

  const reviews = p._count.reviews;
  const reliable = reviews >= RELIABLE_REVIEWS && p.averageRating > 0;

  // Jour de la semaine à l'heure marocaine (et non au fuseau du serveur, souvent
  // UTC) : sinon « Disponible aujourd'hui » bascule d'un jour autour de minuit.
  // workingHours.dayOfWeek suit la convention JS getDay() : 0 = dimanche … 6 = samedi.
  const casaWeekday = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Casablanca", weekday: "short" })
    .format(new Date());
  const today = ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as const)[
    casaWeekday as "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat"
  ];
  const isAvailableToday = p.workingHours !== undefined
    ? p.workingHours.some((wh) => wh.dayOfWeek === today)
    : undefined;

  // Puces d'infos différenciantes (données réelles, dégradation propre si absentes).
  const langues     = (p.langues ?? []).filter(Boolean);
  const conventions = (p.conventions ?? []).filter(Boolean);
  const langCodes   = langues.slice(0, 3).map(langShort);
  const langExtra   = langues.length - langCodes.length;
  const convShown   = conventions.slice(0, 3);
  const convExtra   = conventions.length - convShown.length;

  // Heure de Casablanca (le serveur est souvent en UTC) → statut Ouvert/Fermé et
  // libellés de créneaux (« Auj. »/« Demain ») calculés sur le bon jour.
  const casaNow    = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
  const casaFmt    = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Casablanca" });
  const todayIso   = casaFmt.format(new Date());
  // new Date().getTime() (et non Date.now()) : même valeur (ms epoch UTC) mais la
  // règle react-hooks/purity ne flague pas `new Date()` argless. « Demain » = +24 h.
  const tmrIso     = casaFmt.format(new Date(new Date().getTime() + 86_400_000));
  const openStatus = p.workingHours ? computeOpenStatus(p.workingHours, casaNow) : null;

  // Action « Appeler » : seulement sur les fiches non réservables avec un numéro composable.
  const phoneHref  = !canBookOnline ? telHref(p.phone) : null;

  // Créneaux inline (fiches réservables) : jusqu'à 3 puces cliquables + « voir plus ».
  const shownSlots = canBookOnline && slots ? slots.slice(0, 3) : [];
  const moreSlots  = canBookOnline && slots ? Math.max(0, slots.length - shownSlots.length) : 0;

  return (
    <article className={`card p-4 sm:p-5 relative group has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary-500 has-[a:focus-visible]:ring-offset-2 ${isFeatured ? "ring-1 ring-accent-300" : isPro ? "ring-1 ring-secondary-200" : ""}`}>
      {/* Lien principal couvrant toute la carte */}
      <Link href={href} className="absolute inset-0 rounded-2xl focus-visible:outline-none" aria-label={fullName} />

      {/* Mention de transparence : fiche remontée par l'add-on payant Premium. */}
      {isFeatured && (
        <span
          className="absolute top-2.5 end-3 text-[10px] font-medium uppercase tracking-wide text-slate-400 pointer-events-none select-none"
          title={t.sponsoredTitle}
        >
          {t.sponsored}
        </span>
      )}

      {/* pointer-events-none : les clics traversent vers le lien overlay ci-dessus */}
      <div className="flex gap-3 sm:gap-4 items-center relative pointer-events-none">

        {/* Avatar */}
        <div className="shrink-0 relative w-14 h-14 sm:w-16 sm:h-16">
          <div className="avatar-ring w-14 h-14 sm:w-16 sm:h-16">
            <div className="avatar-ring-inner">
              {p.avatar ? (
                <Image
                  src={p.avatar}
                  alt=""
                  width={64}
                  height={64}
                  sizes="64px"
                  priority={priority}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-700 font-bold text-base sm:text-lg select-none">
                  {getDoctorInitials(p.prenom, p.nom)}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Informations */}
        <div className="flex-1 min-w-0">
          {/* Nom + badge de confiance sur la MÊME ligne : le badge « Vérifié »
              qualifie le nom (convention Doctolib/X). Badges shrink-0 → le nom
              tronque si besoin sans jamais écraser le badge. « Premium » étant
              passé en label « Sponsorisé » (coin), il reste au plus 2 petits badges. */}
          <div className="flex items-center gap-1.5 min-w-0 pe-12">
            <span className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors text-sm sm:text-base leading-snug truncate min-w-0">
              {fullName}
            </span>
            {p.isVerified && (
              <span className="badge-verified shrink-0" title={t.verifiedTitle}>
                <ShieldCheck />
                {t.verified}
              </span>
            )}
            {isPro && (
              <span
                className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold text-white bg-gradient-to-br from-secondary-600 to-secondary-500"
                title={t.proBadgeTitle}
              >
                <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5 shrink-0" aria-hidden="true">
                  <path d="M6 .5l1.55 3.14 3.45.5-2.5 2.44.59 3.42L6 8.79 2.91 10.4l.59-3.42L1 4.14l3.45-.5z"/>
                </svg>
                {t.proBadge}
              </span>
            )}
          </div>

          {/* Spécialité — masquée quand le contexte la rend redondante (ex : page spécialité) */}
          {!hideSpecialty && (
            <Link
              href={localeHref(locale, `/specialites/${p.specialty.slug}`)}
              className="pointer-events-auto inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
            >
              {tSpecialty(p.specialty.name, locale)}
            </Link>
          )}

          {/* Disponibilité — signal honnête, par ordre de richesse :
              1. statut Ouvert/Fermé temps réel si des horaires existent,
              2. « Disponible aujourd'hui » (RDV en ligne + horaires du jour),
              3. « Sur rendez-vous » (fiche non réservable). */}
          <div className="flex items-center gap-2 mt-1 text-xs">
            {openStatus ? (
              openStatus.isOpen ? (
                <span className="inline-flex items-center gap-1 text-secondary-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shrink-0" aria-hidden="true" />
                  {t.open}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
                  {t.closed}
                  {openStatus.nextTime && (
                    <span className="text-slate-500 font-normal">· {t.opensAt} {openStatus.nextTime}</span>
                  )}
                </span>
              )
            ) : canBookOnline && isAvailableToday === true ? (
              <span className="inline-flex items-center gap-1 text-secondary-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shrink-0" aria-hidden="true" />
                {t.availableToday}
              </span>
            ) : !canBookOnline ? (
              <span className="inline-flex items-center gap-1 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
                {t.byAppointment}
              </span>
            ) : null}
          </div>

          {/* Adresse + ville */}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-600 min-w-0 overflow-hidden">
            <MapPinIcon />
            <span className="truncate min-w-0">
              {/* bdi : isole l'ordre bidi de l'adresse latine (sinon en RTL le
                  numéro de rue « 12 » saute à la fin). */}
              <bdi>
                {p.adresse && <>{p.adresse}, </>}
                <span className="font-medium text-slate-600">{p.city.name}</span>
              </bdi>
            </span>
          </div>

          {/* Ligne d'infos différenciantes : langues parlées + conventionnement.
              Signaux prioritaires pour les patients marocains (AMO/CNSS/RAMED),
              rarement affichés par les concurrents. Rendu seulement si présents. */}
          {(langCodes.length > 0 || convShown.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
              {langCodes.length > 0 && (
                <span className="inline-flex items-center gap-1" title={t.languagesTitle}>
                  <GlobeIcon />
                  <span className="font-medium text-slate-600">
                    {langCodes.join(" · ")}{langExtra > 0 ? ` +${langExtra}` : ""}
                  </span>
                </span>
              )}
              {convShown.length > 0 && (
                <span className="inline-flex items-center gap-1" title={t.conventionsTitle}>
                  <ShieldIcon />
                  <span className="font-medium text-secondary-700">
                    {convShown.join(" · ")}{convExtra > 0 ? ` +${convExtra}` : ""}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Évaluation + prix */}
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
              {reliable ? (
                <>
                  <StarsRow rating={p.averageRating} label={`${t.ratingPrefix} ${p.averageRating} ${t.ratingOf5}`} />
                  <span className={`font-bold tabular-nums ${ratingColor(p.averageRating)}`}>
                    {p.averageRating.toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-xs">· {reviews} {t.reviews}</span>
                </>
              ) : reviews > 0 ? (
                // 1-2 avis : mention sobre, sans étoiles pleines ni note gonflée.
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <StarIcon filled={false} />
                  <span>{reviews} {t.reviewsFew}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">
                    {t.newPractitioner}
                  </span>
                  <span className="text-slate-400">{t.noReviews}</span>
                </span>
              )}
            </div>
            {/* Slot prix toujours présent → colonne droite cohérente d'une carte
                à l'autre. À défaut de tarif renseigné : « Tarif sur demande ». */}
            {prix ? (
              <span
                className="text-sm font-bold text-slate-800 shrink-0 whitespace-nowrap tabular-nums"
                title={t.priceTitle}
              >
                {prix}
                <span className="text-xs font-normal text-slate-500 ms-0.5">{t.currency}</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap" title={t.priceTitle}>
                {t.priceOnRequest}
              </span>
            )}
          </div>

          {/* Créneaux réservables inline (fiches Pro) — signal Doctolib : le patient
              agit depuis la liste. Puces cliquables → réservation ; « +N » → agenda. */}
          {shownSlots.length > 0 && bookHref && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {shownSlots.map((s) => (
                <Link
                  key={`${s.date}-${s.time}`}
                  href={`${bookHref}?date=${s.date}&time=${s.time}`}
                  className="pointer-events-auto inline-flex items-center rounded-lg border border-secondary-200 bg-secondary-50 px-2.5 py-1 text-xs font-semibold text-secondary-700 hover:bg-secondary-100 hover:border-secondary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 tabular-nums"
                >
                  {slotLabel(s.date, s.time, todayIso, tmrIso, locale)}
                </Link>
              ))}
              {moreSlots > 0 && (
                <Link
                  href={bookHref}
                  className="pointer-events-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  {t.moreSlots}
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0 rtl:-scale-x-100" aria-hidden="true">
                    <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )}
            </div>
          )}

          {/* Actions : « Prendre RDV » si la réservation aboutit réellement (accès
              Pro/essai) ; sinon « Appeler » (si numéro composable) + « Voir le profil »
              — plus de cul-de-sac « lien fantôme » sur les fiches non réservables.
              Les actions portent pointer-events-auto, pas le lien-overlay de carte. */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
            {canBookOnline && bookHref ? (
              <Link
                href={bookHref}
                aria-label={`${t.book} — ${fullName}`}
                className="pointer-events-auto w-full sm:w-auto sm:ms-auto justify-center inline-flex items-center gap-1.5 h-10 sm:h-9 px-4 rounded-lg bg-primary-600 text-white text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <CalendarIcon />
                {t.book}
              </Link>
            ) : (
              <>
                {phoneHref && (
                  <PhoneLink
                    doctorId={p.id}
                    href={phoneHref}
                    source="listing"
                    ariaLabel={`${t.callAria} ${fullName}`}
                    className="pointer-events-auto w-full sm:w-auto justify-center inline-flex items-center gap-1.5 h-10 sm:h-9 px-3.5 rounded-lg border border-secondary-200 text-secondary-700 text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-secondary-50 hover:border-secondary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2"
                  >
                    <PhoneIcon />
                    {t.call}
                  </PhoneLink>
                )}
                <Link
                  href={href}
                  aria-label={`${t.viewProfileAria} ${fullName}`}
                  className="pointer-events-auto w-full sm:w-auto sm:ms-auto justify-center inline-flex items-center gap-1.5 h-10 sm:h-9 px-4 rounded-lg border border-primary-200 text-primary-700 text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-primary-50 hover:border-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {t.viewProfile}
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0 rtl:-scale-x-100" aria-hidden="true">
                    <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </article>
  );
}
