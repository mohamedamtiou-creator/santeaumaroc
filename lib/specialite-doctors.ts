import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/utils";
import { isProPlan, isFeaturedActive, hasProAccess } from "@/lib/plan";
import { cachedQuery } from "@/lib/cache";
import { PRATICIENS_PAGE_SIZE, type DoctorCardDTO, type DoctorsResult } from "@/lib/praticiens-query";

export type SpecialtyFilters = {
  ville?: string;
  tri?: string;
  dispo?: string;
  conv?: string;
  langue?: string;
  /** Recherche par nom/prénom (utilisée par la page spécialité×ville). */
  q?: string;
  page?: number;
};

/** Jour de la semaine à l'heure marocaine (0=dimanche), pour le filtre « dispo aujourd'hui ». */
function casablancaWeekday(): number {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Casablanca", weekday: "short" }).format(new Date());
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as const)[wd as "Sun"] ?? 0;
}

function sanitize(s: string | null | undefined): string | null {
  if (s === null || s === undefined) return null;
  return s.replace(/[\r\n\t\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, " ").trim();
}
function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (typeof v === "object" && typeof (v as { toNumber(): number }).toNumber === "function") return (v as { toNumber(): number }).toNumber();
  if (typeof v === "string") return parseFloat(v);
  return null;
}

function buildWhere(slug: string, f: Required<Pick<SpecialtyFilters, "ville" | "dispo" | "conv" | "langue" | "q">> & { today: number }) {
  return {
    isActive: true as const,
    specialty: { slug },
    ...(f.ville ? { city: { slug: f.ville } } : {}),
    ...(f.dispo === "1" ? { workingHours: { some: { isActive: true, dayOfWeek: f.today } } } : {}),
    ...(f.conv === "1" ? { conventions: { isEmpty: false } } : {}),
    ...(f.langue ? { langues: { has: f.langue } } : {}),
    ...(f.q ? {
      OR: [
        { nom:    { contains: f.q, mode: "insensitive" as const } },
        { prenom: { contains: f.q, mode: "insensitive" as const } },
      ],
    } : {}),
  };
}

function buildOrderBy(tri: string) {
  return tri === "note"
    ? [{ featuredUntil: { sort: "desc" as const, nulls: "last" as const } }, { averageRating: "desc" as const }, { isVerified: "desc" as const }]
    : tri === "avis"
    ? [{ featuredUntil: { sort: "desc" as const, nulls: "last" as const } }, { reviewsCount: "desc" as const }, { averageRating: "desc" as const }]
    : [{ featuredUntil: { sort: "desc" as const, nulls: "last" as const } }, { planActivatedAt: { sort: "desc" as const, nulls: "last" as const } }, { isVerified: "desc" as const }, { averageRating: "desc" as const }];
}

/**
 * Liste médecins d'une spécialité (+ filtres), mise en cache durable 1 h.
 * Renvoie le même DTO plat que /praticiens (prix Decimal→number, slots inline).
 * Utilisée par la vue de base SSR de /specialites/[slug] ET par la route API
 * client /api/specialites/[slug]/search.
 */
export function getSpecialtyDoctors(slug: string, f: SpecialtyFilters): Promise<DoctorsResult> {
  const ville  = f.ville  ?? "";
  const tri    = f.tri    ?? "";
  const dispo  = f.dispo  ?? "";
  const conv   = f.conv   ?? "";
  const langue = f.langue ?? "";
  const q      = (f.q     ?? "").trim();
  const page   = Math.max(1, f.page ?? 1);
  const today  = dispo === "1" ? casablancaWeekday() : -1;
  const key = `specialite-doctors:${slug}:${ville}:${tri}:${dispo}:${conv}:${langue}:${q}:${page}:${today}`;

  return cachedQuery(key, 3600, async () => {
    const where = buildWhere(slug, { ville, dispo, conv, langue, q, today });
    const orderBy = buildOrderBy(tri);
    const [rawDoctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          specialty:    { select: { name: true, slug: true } },
          city:         { select: { name: true, slug: true } },
          _count:       { select: { reviews: true } },
          workingHours: { select: { dayOfWeek: true, startTime: true, endTime: true }, where: { isActive: true } },
        },
        orderBy,
        take: PRATICIENS_PAGE_SIZE,
        skip: (page - 1) * PRATICIENS_PAGE_SIZE,
      }),
      prisma.doctor.count({ where }),
    ]);

    const bookableIds = rawDoctors
      .filter((d) => hasProAccess(d.plan, d.planExpiresAt, d.trialEndsAt) && d.workingHours.length > 0)
      .map((d) => d.id);
    const slotsByDoctor: Record<string, { date: string; time: string }[]> = {};
    if (bookableIds.length > 0) {
      const sched = await prisma.doctor.findMany({
        where: { id: { in: bookableIds } },
        select: {
          id: true, consultationDuration: true, bookingLeadHours: true, bookingMaxDays: true, workingHours: true,
          blockedSlots: { select: { date: true, time: true } },
          absences: { select: { startDate: true, endDate: true, allDay: true, startTime: true, endTime: true } },
          appointments: { where: { status: { notIn: ["CANCELLED"] } }, select: { date: true, time: true } },
        },
      });
      for (const d of sched) {
        const booked = d.appointments.map((a) => ({ date: a.date, time: a.time }));
        const all = generateAvailableSlots(booked, d.workingHours, d.consultationDuration, d.absences, {
          leadHours: d.bookingLeadHours, maxDays: Math.min(d.bookingMaxDays, 14),
        });
        const blockedSet = new Set(d.blockedSlots.map((b) => `${b.date}-${b.time}`));
        slotsByDoctor[d.id] = all
          .filter((s) => s.available && !blockedSet.has(`${s.date}-${s.time}`))
          .slice(0, 4).map((s) => ({ date: s.date, time: s.time }));
      }
    }

    const doctors: DoctorCardDTO[] = rawDoctors.map((d) => ({
      id: d.id, slug: d.slug, nom: sanitize(d.nom), prenom: sanitize(d.prenom), civilite: sanitize(d.civilite),
      adresse: sanitize(d.adresse) ?? "", avatar: d.avatar, averageRating: d.averageRating, prix: num(d.prix),
      isVerified: d.isVerified,
      isPro: isProPlan(d.plan, d.planExpiresAt), isFeatured: isFeaturedActive(d.featuredUntil),
      canBookOnline: hasProAccess(d.plan, d.planExpiresAt, d.trialEndsAt),
      langues: d.langues, conventions: d.conventions,
      specialty: { name: sanitize(d.specialty.name) ?? d.specialty.name, slug: d.specialty.slug },
      city: { name: sanitize(d.city.name) ?? d.city.name, slug: d.city.slug },
      _count: { reviews: d._count.reviews },
      workingHours: d.workingHours.map((wh) => ({ dayOfWeek: wh.dayOfWeek, startTime: wh.startTime, endTime: wh.endTime })),
      phone: sanitize(d.phone), slots: slotsByDoctor[d.id],
    }));

    return { doctors, total };
  });
}
