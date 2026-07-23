import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { professionLabel } from "@/lib/contributor";

export const revalidate = 3600;

const PATH = "/auteur";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const title = locale === "ar" ? "كتّابنا — مهنيو الصحة" : "Nos auteurs — professionnels de santé";
  const description =
    locale === "ar"
      ? "اكتشف مهنيي الصحة الذين ينشرون على SantéauMaroc: أطباء، صيادلة، أخصائيون نفسيون وأكثر."
      : "Découvrez les professionnels de santé qui publient sur SantéauMaroc : médecins, pharmaciens, psychologues et plus encore.";
  return {
    title,
    description,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title, description, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
  };
}

export default async function AuthorsDirectoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);

  const authors = await prisma.user.findMany({
    where: { authorStatus: "VERIFIED", authorSlug: { not: null } },
    orderBy: [{ featuredAuthorUntil: { sort: "desc", nulls: "last" } }, { name: "asc" }],
    take: 120,
    select: {
      name: true,
      avatar: true,
      authorSlug: true,
      jobTitle: true,
      professionKind: true,
      authorCity: { select: { name: true } },
      authorSpecialty: { select: { name: true } },
      contributorProfile: { select: { headline: true, articlesCount: true } },
    },
  });

  const title = locale === "ar" ? "كتّابنا" : "Nos auteurs";
  const intro =
    locale === "ar"
      ? "مهنيو صحة موثَّقون يشاركون خبرتهم."
      : "Des professionnels de santé vérifiés qui partagent leur expertise.";

  return (
    <main className="page-outer">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" dir="auto">{title}</h1>
          <p className="text-slate-600" dir="auto">{intro}</p>
        </header>

        {authors.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-slate-600 mb-4" dir="auto">
              {locale === "ar" ? "لا كتّاب موثَّقون بعد. كن أول من ينشر!" : "Aucun auteur vérifié pour le moment. Soyez le premier à publier !"}
            </p>
            <Link href="/devenir-auteur" className="btn-primary px-5 py-2.5 text-sm">
              {locale === "ar" ? "كن كاتباً" : "Devenir auteur"}
            </Link>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none m-0 p-0">
            {authors.map((a) => (
              <li key={a.authorSlug}>
                <Link href={`/auteur/${a.authorSlug}`} className="card p-5 h-full flex items-center gap-4 hover:border-primary-300 transition-colors">
                  {a.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.avatar} alt={a.name} className="h-14 w-14 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate" dir="auto">{a.name}</p>
                    <p className="text-sm text-slate-500 truncate" dir="auto">
                      {a.contributorProfile?.headline ||
                        [professionLabel(a.professionKind, locale), a.authorSpecialty?.name, a.authorCity?.name].filter(Boolean).join(" · ")}
                    </p>
                    {!!a.contributorProfile?.articlesCount && (
                      <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                        {a.contributorProfile.articlesCount} {locale === "ar" ? "مقال" : "articles"}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
