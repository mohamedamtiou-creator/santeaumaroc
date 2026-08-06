import { unstable_cache } from "next/cache";
import { TTL } from "@/lib/cache-ttl";
import { prisma } from "@/lib/prisma";
import { processCache } from "@/lib/process-cache";
import { casablancaTodayStr, generateAvailableSlots } from "@/lib/utils";
import { isProPlan, isFeaturedActive, hasProAccess } from "@/lib/plan";

// Horizon de réservation affiché en liste (cf. `maxDays` ci-dessous). Sert aussi à
// borner les requêtes de créneaux : rien au-delà n'influence les 4 puces montrées.
const SLOTS_HORIZON_DAYS = 14;

// 25 résultats/page — compromis LCP. La profondeur de pagination n'est plus un
// enjeu SEO : la découverte des fiches ne repose PAS sur la pagination (les
// listings sont statiques, `?page=N` sert le HTML de la page 1) mais sur l'index
// alphabétique par ville (cf. lib/city-alpha-index.ts). On privilégie donc le
// poids de la page 1 — la seule qui compte pour le LCP.
//
// ⚠️ ALPHA_MIN_CITY_DOCTORS en dérive : toute ville dont le listing dépasse une
// page doit avoir un index, sinon ses fiches de page 2+ n'ont aucun lien HTML.
export const PRATICIENS_PAGE_SIZE = 25;

// DTO plat 100 % sérialisable (JSON + RSC payload) : c'est ce que consomme
// PraticienCard, l'ItemList JSON-LD ET la route API /api/praticiens/search.
// Aucun Decimal, aucune string à newline (cf. normalisePrix / sanitize).
export type DoctorCardDTO = {
  id: string;
  slug: string | null;
  nom: string | null;
  prenom: string | null;
  civilite: string | null;
  adresse: string;
  avatar: string | null;
  averageRating: number;
  prix: number | null;
  isVerified: boolean;
  isPro: boolean;
  isFeatured: boolean;
  canBookOnline: boolean;
  langues: string[];
  conventions: string[];
  specialty: { name: string; slug: string };
  city: { name: string; slug: string };
  _count: { reviews: number };
  workingHours: { dayOfWeek: number; startTime: string; endTime: string }[];
  phone: string | null;
  slots?: { date: string; time: string }[];
};

export type DoctorsResult = { doctors: DoctorCardDTO[]; total: number };

export type FilterOption = { slug: string; name: string };

// ── Listes de filtres (spécialités / villes), cachées 1 h ────────────────────
// Partagées par la page /praticiens (menus déroulants) ET par /api/praticiens/search
// (résolution du libellé de la puce de filtre active). Deux couches :
//   1. unstable_cache → Data Cache Next (cross-requête, invalidable par tag)
//   2. processCache  → globalThis en process (survit aux hot-reloads Turbopack)
export const getFiltersData = unstable_cache(
  () => {
    const clean = (s: string) => s.replace(/[\r\n\t]+/g, " ").trim();
    // TTL court sur la couche LRU : elle est invisible de `revalidateTag`, donc
    // elle ne doit jamais survivre longtemps à une invalidation du Data Cache
    // qui l'enveloppe (même raison que le plafond de `lib/cache.ts`).
    return processCache("praticiens:filters", 60, async () => {
      const [specialties, cities] = await Promise.all([
        prisma.specialty.findMany({
          select: { slug: true, name: true },
          orderBy: { doctors: { _count: "desc" } },
        }),
        prisma.city.findMany({
          select: { slug: true, name: true },
          orderBy: { doctors: { _count: "desc" } },
        }),
      ]);
      return {
        specialties: specialties.map((s) => ({ ...s, name: clean(s.name) })),
        cities:      cities.map((c)      => ({ ...c, name: clean(c.name) })),
      };
    });
  },
  ["praticiens-filters"],
  // Référentiel pur (97 spécialités, 247 villes) : il ne bouge qu'à l'import.
  { revalidate: TTL.DIRECTORY, tags: ["filters"] },
);

// Normalise Prisma Decimal → number pour survivre au round-trip JSON.
function normalisePrix(prix: unknown): number | null {
  if (prix === null || prix === undefined) return null;
  if (typeof prix === "number") return prix;
  if (typeof prix === "object" && typeof (prix as { toNumber(): number }).toNumber === "function")
    return (prix as { toNumber(): number }).toNumber();
  if (typeof prix === "string") return parseFloat(prix);
  return null;
}

// Retire les caractères de contrôle (newlines/tabs) des chaînes DB : un \n
// littéral dans un chunk RSC (script) casse la balise <script> qui l'enrobe.
function sanitize(s: string | null | undefined): string | null {
  if (s === null || s === undefined) return null;
  return s.replace(/[\r\n\t\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, " ").trim();
}

// Requête liste médecins mise en cache 5 min (Data Cache durable + processCache).
// Args inclus dans la clé → chaque combinaison de filtres est cachée séparément.
export const getCachedDoctors = unstable_cache(
  (q: string, specialite: string, ville: string, page: number): Promise<DoctorsResult> =>
    processCache(
      `praticiens:doctors:${q}|${specialite}|${ville}|${page}|n${PRATICIENS_PAGE_SIZE}`,
      300,
      async () => {
        const where = {
          isActive: true,
          ...(q ? {
            OR: [
              { nom:       { contains: q, mode: "insensitive" as const } },
              { prenom:    { contains: q, mode: "insensitive" as const } },
              { specialty: { name: { contains: q, mode: "insensitive" as const } } },
            ],
          } : {}),
          ...(specialite ? { specialty: { slug: specialite } } : {}),
          ...(ville      ? { city:      { slug: ville      } } : {}),
        };
        const [rawDoctors, total] = await Promise.all([
          prisma.doctor.findMany({
            where,
            include: {
              specialty:    { select: { name: true, slug: true } },
              city:         { select: { name: true, slug: true } },
              _count:       { select: { reviews: true } },
              // `isActive` est sélectionné (bien que la clause `where` le fixe à true)
              // parce que generateAvailableSlots teste `wh.isActive` : sans le champ,
              // il vaudrait `undefined` et TOUS les créneaux seraient écartés.
              workingHours: { select: { dayOfWeek: true, startTime: true, endTime: true, isActive: true }, where: { isActive: true } },
            },
            orderBy: [
              { featuredUntil: { sort: "desc", nulls: "last" } },
              { planActivatedAt: { sort: "desc", nulls: "last" } },
              { isVerified: "desc" },
              { averageRating: "desc" },
            ],
            take: PRATICIENS_PAGE_SIZE,
            skip: (page - 1) * PRATICIENS_PAGE_SIZE,
          }),
          prisma.doctor.count({ where }),
        ]);

        // Créneaux réservables inline — 2e requête ciblée sur les seules fiches Pro.
        // Elle ne récupère QUE les relations d'agenda : les scalaires de réservation
        // (consultationDuration, bookingLeadHours, bookingMaxDays) et `workingHours`
        // proviennent déjà de la requête ci-dessus (`include` renvoie tous les
        // scalaires du Doctor) — les redemander était un aller-retour Neon pour des
        // données déjà en mémoire.
        const bookable = rawDoctors.filter(
          (d) => hasProAccess(d.plan, d.planExpiresAt, d.trialEndsAt) && d.workingHours.length > 0,
        );
        const slotsByDoctor: Record<string, { date: string; time: string }[]> = {};
        if (bookable.length > 0) {
          // Bornes de date : generateAvailableSlots n'examine que [aujourd'hui,
          // aujourd'hui + maxDays]. Sans `gte`, on chargeait TOUT l'historique de
          // rendez-vous de chaque fiche Pro depuis sa création — volume croissant
          // avec l'ancienneté, intégralement jeté. Les dates sont stockées en
          // `String` ISO (YYYY-MM-DD) → la comparaison lexicographique est correcte
          // (même convention que isSlotInAbsence).
          const todayIso = casablancaTodayStr();
          const horizonIso = new Date(Date.parse(`${todayIso}T12:00:00Z`) + SLOTS_HORIZON_DAYS * 86_400_000)
            .toISOString()
            .split("T")[0];
          const agenda = await prisma.doctor.findMany({
            where: { id: { in: bookable.map((d) => d.id) } },
            select: {
              id: true,
              blockedSlots: {
                where: { date: { gte: todayIso, lte: horizonIso } },
                select: { date: true, time: true },
              },
              absences: {
                where: { endDate: { gte: todayIso }, startDate: { lte: horizonIso } },
                select: { startDate: true, endDate: true, allDay: true, startTime: true, endTime: true },
              },
              appointments: {
                where: { status: { notIn: ["CANCELLED"] }, date: { gte: todayIso, lte: horizonIso } },
                select: { date: true, time: true },
              },
            },
          });
          const agendaById = new Map(agenda.map((a) => [a.id, a]));
          for (const d of bookable) {
            const ag = agendaById.get(d.id);
            if (!ag) continue;
            const booked = ag.appointments.map((a) => ({ date: a.date, time: a.time }));
            const all = generateAvailableSlots(booked, d.workingHours, d.consultationDuration, ag.absences, {
              leadHours: d.bookingLeadHours,
              maxDays: Math.min(d.bookingMaxDays, SLOTS_HORIZON_DAYS),
            });
            const blockedSet = new Set(ag.blockedSlots.map((b) => `${b.date}-${b.time}`));
            slotsByDoctor[d.id] = all
              .filter((s) => s.available && !blockedSet.has(`${s.date}-${s.time}`))
              .slice(0, 4)
              .map((s) => ({ date: s.date, time: s.time }));
          }
        }

        return {
          doctors: rawDoctors.map((d) => ({
            id:            d.id,
            slug:          d.slug,
            nom:           sanitize(d.nom),
            prenom:        sanitize(d.prenom),
            civilite:      sanitize(d.civilite),
            adresse:       sanitize(d.adresse) ?? "",
            avatar:        d.avatar,
            averageRating: d.averageRating,
            prix:          normalisePrix(d.prix),
            isVerified:    d.isVerified,
            isPro:         isProPlan(d.plan, d.planExpiresAt),
            isFeatured:    isFeaturedActive(d.featuredUntil),
            canBookOnline: hasProAccess(d.plan, d.planExpiresAt, d.trialEndsAt),
            langues:       d.langues,
            conventions:   d.conventions,
            specialty:     { name: sanitize(d.specialty.name) ?? d.specialty.name, slug: d.specialty.slug },
            city:          { name: sanitize(d.city.name)      ?? d.city.name,      slug: d.city.slug },
            _count:        { reviews: d._count.reviews },
            workingHours:  d.workingHours.map((wh) => ({ dayOfWeek: wh.dayOfWeek, startTime: wh.startTime, endTime: wh.endTime })),
            phone:         sanitize(d.phone),
            slots:         slotsByDoctor[d.id],
          })),
          total,
        };
      }
    ),
  // `n<taille>` dans les keyParts : le Data Cache est DURABLE (il survit aux
  // déploiements). Sans cela, un changement de PRATICIENS_PAGE_SIZE resservirait
  // pendant tout le TTL des listes de l'ancienne taille, incohérentes avec le
  // totalPages recalculé côté page.
  ["praticiens-doctors", `n${PRATICIENS_PAGE_SIZE}`],
  { revalidate: TTL.LISTING, tags: ["doctors"] },
);
