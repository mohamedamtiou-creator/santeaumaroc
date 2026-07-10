import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { QuestionCard, type QuestionCardData } from "@/components/qa/QuestionCard";
import { Pagination } from "@/components/ui/Pagination";

export const revalidate = 600;
const PAGE_SIZE = 12;
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

type Params = Promise<{ lang: string; slug: string }>;
type SearchParams = Promise<{ page?: string }>;

const getSpecialty = cache(async (slug: string) =>
  prisma.specialty.findUnique({ where: { slug }, select: { id: true, name: true, slug: true } }),
);

export async function generateStaticParams() {
  const specialties = await prisma.specialty.findMany({
    where: { questions: { some: { status: "PUBLISHED" } } },
    select: { slug: true },
  });
  return specialties.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const sp = await getSpecialty(slug);
  if (!sp) return { title: "Spécialité introuvable", robots: { index: false } };
  const locale = toLocale(lang);
  const t = getDictionary(locale).qa;
  const name = sp.name;
  // Le hub liste des titres de questions encore en français ; tant que le contenu
  // Q/R n'est pas traduit, on ne sert pas d'alternative arabe et la vue arabe reste
  // noindex (cf lib/qa-content — aligné sur /questions liste/home).
  return {
    title: `${t.hubTitle.replace("{specialty}", name)} — SantéauMaroc`,
    description: t.hubSubtitle.replace("{specialty}", name),
    alternates: frenchOnlyAlternates(`/questions/specialite/${slug}`),
    ...(locale === "ar" ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function QuestionsBySpecialtyPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { lang, slug } = await params;
  const { page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const sp = await getSpecialty(slug);
  if (!sp) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.qa;
  const label = tSpecialty(sp.name, locale);

  const where = { status: "PUBLISHED" as const, specialtyId: sp.id };
  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: { slug: true, title: true, titleAr: true, arReviewedAt: true, answersCount: true, views: true, publishedAt: true, specialty: { select: { name: true, slug: true } } },
    }),
    prisma.question.count({ where }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (p: number) => `/questions/specialite/${slug}${p > 1 ? `?page=${p}` : ""}`;

  const jsonLd = page === 1 ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${BASE}/questions/specialite/${slug}#page`,
        "name": t.hubTitle.replace("{specialty}", sp.name),
        "url": `${BASE}/questions/specialite/${slug}`,
        "about": { "@type": "MedicalSpecialty", "name": sp.name },
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.home, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${BASE}/questions` },
          { "@type": "ListItem", "position": 3, "name": sp.name, "item": `${BASE}/questions/specialite/${slug}` },
        ],
      },
    ],
  } : null;

  return (
    <div className="page-outer">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
        <Link href="/questions" className="hover:text-secondary-600 transition-colors">{t.breadcrumb}</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700">{label}</span>
      </nav>

      <header className="mb-6">
        <h1 className="section-title">{t.hubTitle.replace("{specialty}", label)}</h1>
        <p className="section-subtitle mt-2">{t.hubSubtitle.replace("{specialty}", label)}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/questions/poser" className="btn-primary inline-flex text-sm py-2.5 px-5">{t.ask}</Link>
          <Link href={`/specialites/${slug}`} className="btn-outline inline-flex text-sm py-2.5 px-5">
            {t.ctaFindSpecialistNamed.replace("{specialty}", label)}
          </Link>
        </div>
      </header>

      {questions.length === 0 ? (
        <div className="empty-state">
          <p className="font-semibold text-slate-700">{t.emptyTitle}</p>
          <p className="text-sm text-slate-500">{t.emptyText}</p>
          <Link href="/questions/poser" className="btn-primary mt-3 text-sm">{t.ask}</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((qq: QuestionCardData) => (
            <QuestionCard key={qq.slug} q={qq} t={t} locale={locale} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={dict.pagination} />
    </div>
  );
}
