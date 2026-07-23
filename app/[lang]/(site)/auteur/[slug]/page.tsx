import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { professionLabel, isVerifiedAuthor } from "@/lib/contributor";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

type Params = Promise<{ lang: string; slug: string }>;

/** Titre d'article localisé (repli FR si l'arabe n'est pas relu). */
function localizedTitle(
  p: { title: string; titleAr: string | null; arReviewedAt: Date | null },
  locale: Locale,
): string {
  return locale === "ar" && p.arReviewedAt && p.titleAr ? p.titleAr : p.title;
}

const authorSelect = {
  id: true,
  name: true,
  avatar: true,
  authorSlug: true,
  authorStatus: true,
  professionKind: true,
  jobTitle: true,
  credentials: true,
  bio: true,
  bioAr: true,
  university: true,
  orderName: true,
  registrationNumber: true,
  website: true,
  linkedin: true,
  cabinetUrl: true,
  featuredAuthorUntil: true,
  authorCity: { select: { name: true, slug: true } },
  authorSpecialty: { select: { name: true, slug: true } },
  contributorProfile: { select: { headline: true, languages: true, interests: true, isOrgAccount: true } },
  // Cas « médecin + auteur » : bascule le balisage en Physician + lien vers la fiche.
  doctorProfile: { select: { slug: true } },
} as const;

async function getAuthor(slug: string) {
  return prisma.user.findUnique({ where: { authorSlug: slug }, select: authorSelect });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const author = await getAuthor(slug);
  if (!author) return { title: "Auteur introuvable" };

  const verified = isVerifiedAuthor(author.authorStatus);
  const title = `${author.name}${author.jobTitle ? ` — ${author.jobTitle}` : ""}`;
  const description =
    (locale === "ar" ? author.bioAr : author.bio)?.slice(0, 160) ??
    `Articles santé de ${author.name} sur SantéauMaroc.`;

  return {
    title,
    description,
    alternates: localizedAlternates(`/auteur/${slug}`, locale),
    // Verrou E-E-A-T : une page auteur non vérifiée n'est jamais indexée.
    robots: verified ? undefined : { index: false, follow: true },
    openGraph: { title, description, type: "profile", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
  };
}

export default async function AuthorPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const author = await getAuthor(slug);
  if (!author) notFound();

  const verified = isVerifiedAuthor(author.authorStatus);
  // Présence de la date de mise en avant (pas de comparaison à « maintenant » ici :
  // les fonctions impures — Date.now() — sont interdites pendant le rendu). L'admin
  // pose/retire `featuredAuthorUntil` ; l'expiration effective est gérée en amont.
  const featured = !!author.featuredAuthorUntil;

  const articles = await prisma.post.findMany({
    where: { authorId: author.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: { slug: true, title: true, titleAr: true, arReviewedAt: true, excerpt: true, publishedAt: true, readingTime: true },
  });

  const bio = locale === "ar" && author.bioAr ? author.bioAr : author.bio;
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}/auteur/${slug}`;
  const isOrg = author.contributorProfile?.isOrgAccount;
  // Cas « médecin + auteur » : l'auteur exerce réellement → Physician + lien fiche (RDV).
  const ficheSlug = author.doctorProfile?.slug ?? null;
  const ficheAbs = ficheSlug ? `${locale === "ar" ? `${BASE}/ar` : BASE}/praticiens/${ficheSlug}` : null;

  const links: { href: string; label: string }[] = [];
  if (author.cabinetUrl) links.push({ href: author.cabinetUrl, label: locale === "ar" ? "العيادة" : "Cabinet" });
  if (author.website) links.push({ href: author.website, label: locale === "ar" ? "الموقع" : "Site web" });
  if (author.linkedin) links.push({ href: author.linkedin, label: "LinkedIn" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": ficheSlug ? "Physician" : isOrg ? "MedicalOrganization" : "Person",
      name: author.name,
      ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
      ...(author.authorSpecialty?.name ? { medicalSpecialty: author.authorSpecialty.name } : {}),
      ...(author.university ? { alumniOf: { "@type": "CollegeOrUniversity", name: author.university } } : {}),
      ...(author.orderName ? { memberOf: { "@type": "Organization", name: author.orderName } } : {}),
      ...(author.contributorProfile?.interests?.length ? { knowsAbout: author.contributorProfile.interests } : {}),
      ...(() => {
        const sameAs = [...links.map((l) => l.href), ...(ficheAbs ? [ficheAbs] : [])];
        return sameAs.length ? { sameAs } : {};
      })(),
      url,
    },
  };

  return (
    <>
      {verified && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      )}

      <main className="page-outer">
        <div className="max-w-3xl mx-auto">
          {/* En-tête auteur */}
          <header className="flex flex-col sm:flex-row gap-5 items-start sm:items-center pb-8 border-b border-slate-200">
            <div className="shrink-0">
              {author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatar} alt={author.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-50" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-2xl font-bold ring-4 ring-primary-50">
                  {author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900" dir="auto">{author.name}</h1>
                {verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700">
                    ✓ {locale === "ar" ? "موثَّق" : "Vérifié"}
                  </span>
                )}
                {featured && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    {locale === "ar" ? "كاتب الشهر" : "Auteur du mois"}
                  </span>
                )}
              </div>
              <p className="text-slate-600" dir="auto">
                {author.contributorProfile?.headline ||
                  [professionLabel(author.professionKind, locale), author.authorSpecialty?.name, author.authorCity?.name]
                    .filter(Boolean)
                    .join(" · ")}
              </p>
              {author.orderName && <p className="text-sm text-slate-400 mt-0.5" dir="auto">{author.orderName}</p>}
            </div>
          </header>

          {/* Statistiques */}
          <dl className="grid grid-cols-3 gap-4 py-6">
            <div className="text-center">
              <dd className="text-2xl font-bold text-primary-700 tabular-nums">{articles.length}</dd>
              <dt className="text-xs text-slate-500">{locale === "ar" ? "مقالات" : "articles"}</dt>
            </div>
            <div className="text-center">
              <dd className="text-2xl font-bold text-primary-700 tabular-nums">{author.contributorProfile?.languages?.length ?? 0}</dd>
              <dt className="text-xs text-slate-500">{locale === "ar" ? "لغات" : "langues"}</dt>
            </div>
            <div className="text-center">
              <dd className="text-sm font-semibold text-slate-700">{author.authorCity?.name ?? "—"}</dd>
              <dt className="text-xs text-slate-500">{locale === "ar" ? "المدينة" : "ville"}</dt>
            </div>
          </dl>

          {/* Biographie */}
          {bio && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-2" dir="auto">{locale === "ar" ? "نبذة" : "Biographie"}</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line" dir="auto">{bio}</p>
              {author.credentials && <p className="text-sm text-slate-500 mt-3" dir="auto">{author.credentials}</p>}
            </section>
          )}

          {/* Liens */}
          {(ficheSlug || links.length > 0) && (
            <section className="mb-8 flex flex-wrap gap-2">
              {/* Médecin exerçant : lien vers sa fiche (RDV, avis) — signal E-E-A-T fort. */}
              {ficheSlug && (
                <Link href={`/praticiens/${ficheSlug}`} className="btn-primary px-4 py-2 text-sm">
                  {locale === "ar" ? "بطاقته + حجز موعد" : "Sa fiche praticien · Prendre RDV"}
                </Link>
              )}
              {links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener nofollow" className="btn-outline px-4 py-2 text-sm">
                  {l.label}
                </a>
              ))}
            </section>
          )}

          {/* Articles */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4" dir="auto">{locale === "ar" ? "أحدث المقالات" : "Derniers articles"}</h2>
            {articles.length === 0 ? (
              <p className="text-slate-500 text-sm">{locale === "ar" ? "لا مقالات منشورة بعد." : "Aucun article publié pour le moment."}</p>
            ) : (
              <ul className="space-y-3 list-none m-0 p-0">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/blog/${a.slug}`} className="card p-4 block hover:border-primary-300 transition-colors">
                      <p className="font-semibold text-slate-900" dir="auto">{localizedTitle(a, locale)}</p>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2" dir="auto">{a.excerpt}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
