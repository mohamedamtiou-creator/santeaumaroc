import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { processCache } from "@/lib/process-cache";
import { generateAvailableSlots } from "@/lib/utils";
import { isProPlan, isFeaturedActive, hasProAccess } from "@/lib/plan";

export const PRATICIENS_PAGE_SIZE = 15;

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
      `praticiens:doctors:${q}|${specialite}|${ville}|${page}`,
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
              workingHours: { select: { dayOfWeek: true, startTime: true, endTime: true }, where: { isActive: true } },
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

        // Créneaux réservables inline — requête ciblée sur les seules fiches Pro.
        const bookableIds = rawDoctors
          .filter((d) => hasProAccess(d.plan, d.planExpiresAt, d.trialEndsAt) && d.workingHours.length > 0)
          .map((d) => d.id);
        const slotsByDoctor: Record<string, { date: string; time: string }[]> = {};
        if (bookableIds.length > 0) {
          const sched = await prisma.doctor.findMany({
            where: { id: { in: bookableIds } },
            select: {
              id: true,
              consultationDuration: true,
              bookingLeadHours: true,
              bookingMaxDays: true,
              workingHours: true,
              blockedSlots: { select: { date: true, time: true } },
              absences: { select: { startDate: true, endDate: true, allDay: true, startTime: true, endTime: true } },
              appointments: { where: { status: { notIn: ["CANCELLED"] } }, select: { date: true, time: true } },
            },
          });
          for (const d of sched) {
            const booked = d.appointments.map((a) => ({ date: a.date, time: a.time }));
            const all = generateAvailableSlots(booked, d.workingHours, d.consultationDuration, d.absences, {
              leadHours: d.bookingLeadHours,
              maxDays: Math.min(d.bookingMaxDays, 14),
            });
            const blockedSet = new Set(d.blockedSlots.map((b) => `${b.date}-${b.time}`));
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
  ["praticiens-doctors"],
  { revalidate: 300, tags: ["doctors"] },
);
