import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { tSpecialty } from "@/lib/specialty-i18n";
import { getDoctorInitials, formatDoctorName, hasReliableRating } from "@/lib/utils";
import { isProPlan } from "@/lib/plan";
import type { Dictionary, Locale } from "@/lib/i18n";

type QaT = Dictionary["qa"];

/**
 * Médecins recommandés de la spécialité (conversion) — composant serveur
 * autonome, exclut le médecin répondeur. Rend `null` si aucun.
 */
export async function RecommendedDoctors({
  specialtyId, excludeDoctorId, t, locale,
}: {
  specialtyId: string;
  excludeDoctorId?: string;
  t: QaT;
  locale: Locale;
}) {
  const doctors = await prisma.doctor.findMany({
    where: {
      specialtyId,
      isActive: true,
      isVerified: true,
      isBlacklisted: false,
      slug: { not: null },
      ...(excludeDoctorId ? { id: { not: excludeDoctorId } } : {}),
    },
    orderBy: [
      { featuredUntil: { sort: "desc", nulls: "last" } },
      { planActivatedAt: { sort: "desc", nulls: "last" } },
      { averageRating: "desc" },
    ],
    take: 3,
    select: {
      slug: true, nom: true, prenom: true, civilite: true, avatar: true,
      plan: true, planExpiresAt: true, averageRating: true,
      specialty: { select: { name: true } }, city: { select: { name: true } },
      _count: { select: { reviews: { where: { isPublic: true } } } },
    },
  });
  if (doctors.length === 0) return null;

  return (
    <section className="card p-5" aria-labelledby="reco-title">
      <h2 id="reco-title" className="font-bold text-slate-900 text-base mb-1">{t.recommendedTitle}</h2>
      <p className="text-xs text-slate-500 mb-4">{t.recommendedSub}</p>
      <ul className="flex flex-col divide-y divide-slate-100">
        {doctors.map((d) => {
          const name = formatDoctorName(d);
          return (
            <li key={d.slug} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="avatar-ring w-10 h-10 shrink-0">
                <div className="avatar-ring-inner grid place-items-center bg-primary-50 text-primary-700 font-bold text-xs">{getDoctorInitials(d.prenom, d.nom)}</div>
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/praticiens/${d.slug}`} className="block font-semibold text-slate-800 text-sm leading-tight truncate hover:text-primary-700">{name}</Link>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  {d.city?.name ?? tSpecialty(d.specialty.name, locale)}
                  {hasReliableRating(d.averageRating, d._count.reviews) && <span className="text-accent-600 font-semibold">★ {d.averageRating.toFixed(1)}</span>}
                  {isProPlan(d.plan, d.planExpiresAt) && <span className="inline-flex items-center rounded bg-accent-50 text-accent-700 px-1 text-[9px] font-extrabold">PRO</span>}
                </p>
              </div>
              <Link href={`/praticiens/${d.slug}`} className="btn-outline text-xs py-1.5 px-3 shrink-0">{t.rdvShort}</Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
