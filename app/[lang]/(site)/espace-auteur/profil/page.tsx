import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { getContributorUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/i18n";
import { espaceContent } from "@/lib/espace-content";
import { ProfileForm } from "@/components/contributor/ProfileForm";

export default async function AuthorProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const t = espaceContent(locale);
  const user = await getContributorUser();
  const [cities, specialties] = await Promise.all([
    prisma.city.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.specialty.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const cp = user.contributorProfile;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-900" dir="auto">{t.profilTitle}</h2>
          <p className="text-sm text-slate-500" dir="auto">{t.profilIntro}</p>
        </div>
        {user.authorSlug && (
          <Link href={`/auteur/${user.authorSlug}`} className="btn-outline px-4 py-2 text-sm shrink-0">{t.profilPublicLink}</Link>
        )}
      </div>
      <div className="card p-6">
        <ProfileForm
          locale={locale}
          cities={cities}
          specialties={specialties}
          initial={{
            jobTitle: user.jobTitle ?? "",
            credentials: user.credentials ?? "",
            bio: user.bio ?? "",
            bioAr: user.bioAr ?? "",
            headline: cp?.headline ?? "",
            university: user.university ?? "",
            orderName: user.orderName ?? "",
            registrationNumber: user.registrationNumber ?? "",
            website: user.website ?? "",
            linkedin: user.linkedin ?? "",
            cabinetUrl: user.cabinetUrl ?? "",
            authorCityId: user.authorCityId ?? "",
            authorSpecialtyId: user.authorSpecialtyId ?? "",
            languages: cp?.languages?.join(", ") ?? "",
            interests: cp?.interests?.join(", ") ?? "",
            yearsPractice: cp?.yearsPractice != null ? String(cp.yearsPractice) : "",
          }}
        />
      </div>
    </div>
  );
}
