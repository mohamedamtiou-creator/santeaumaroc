import { prisma } from "@/lib/prisma";
import { cachedQuery, decToNum } from "@/lib/cache";
import { isProPlan, isFeaturedActive, hasProAccess } from "@/lib/plan";
import { PRATICIENS_PAGE_SIZE, type DoctorCardDTO, type DoctorsResult } from "@/lib/praticiens-query";

function sanitize(s: string | null | undefined): string | null {
  if (s == null) return null;
  return s.replace(/[\r\n\t\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, " ").trim();
}

/**
 * Liste médecins d'une ville (+ filtre spécialité), mise en cache durable 1 h.
 * DTO plat identique à /praticiens. Source UNIQUE partagée par la vue canonique
 * SSR de /villes/[slug] ET la route API client /api/villes/[slug]/search.
 */
export function getVilleDoctors(slug: string, specialite: string, page: number): Promise<DoctorsResult> {
  const spec = (specialite ?? "").trim();
  const p = Math.max(1, page || 1);
  const key = `ville-doctors:${slug}:${spec}:${p}`;

  return cachedQuery(key, 3600, async () => {
    const where = {
      isActive: true,
      city: { slug },
      ...(spec ? { specialty: { slug: spec } } : {}),
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
        skip: (p - 1) * PRATICIENS_PAGE_SIZE,
      }),
      prisma.doctor.count({ where }),
    ]);

    const doctors: DoctorCardDTO[] = rawDoctors.map((d) => ({
      id: d.id, slug: d.slug, nom: sanitize(d.nom), prenom: sanitize(d.prenom), civilite: sanitize(d.civilite),
      adresse: sanitize(d.adresse) ?? "", avatar: d.avatar, averageRating: d.averageRating, prix: decToNum(d.prix),
      isVerified: d.isVerified,
      isPro: isProPlan(d.plan, d.planExpiresAt), isFeatured: isFeaturedActive(d.featuredUntil),
      canBookOnline: hasProAccess(d.plan, d.planExpiresAt, d.trialEndsAt),
      langues: d.langues, conventions: d.conventions,
      specialty: { name: sanitize(d.specialty.name) ?? d.specialty.name, slug: d.specialty.slug },
      city: { name: sanitize(d.city.name) ?? d.city.name, slug: d.city.slug },
      _count: { reviews: d._count.reviews },
      workingHours: d.workingHours.map((wh) => ({ dayOfWeek: wh.dayOfWeek, startTime: wh.startTime, endTime: wh.endTime })),
      phone: sanitize(d.phone),
    }));

    return { doctors, total };
  });
}
