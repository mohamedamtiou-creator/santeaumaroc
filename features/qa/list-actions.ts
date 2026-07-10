"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { answersLabel } from "@/lib/qa";
import { searchQuestions } from "@/lib/qa-search";
import { localizedTitle } from "@/lib/qa-content";

const QA_PAGE_SIZE = 12;
// Aligné sur components/qa/QuestionCard : un compteur de vues faible est masqué.
const VIEW_THRESHOLD = 500;

export type QaListCard = {
  slug: string;
  title: string;
  answersText: string;
  viewsText: string | null;
  hasAnswers: boolean;
  specialtyName: string | null;
  specialtySlug: string | null;
  dateText: string | null;
  doctorName: string | null;
  doctorVerified: boolean;
};

type Params = { q?: string; specialite?: string; tri?: string; page: number };

/**
 * Charge une page de questions publiées, déjà localisée et sérialisable —
 * consommée par l'îlot d'infinite scroll (les composants serveur ne peuvent
 * pas être rendus côté client).
 */
export async function loadMoreQuestions(
  params: Params,
): Promise<{ items: QaListCard[]; hasMore: boolean; total: number }> {
  const { q = "", specialite = "", tri = "recent" } = params;
  const page = Math.max(1, Number(params.page) || 1);
  const locale = await getLocale();
  const t = getDictionary(locale).qa;

  const CARD_SELECT = {
    id: true, slug: true, title: true, titleAr: true, arReviewedAt: true, answersCount: true, views: true, publishedAt: true,
    specialty: { select: { name: true, slug: true } },
    answers: {
      where: { status: "PUBLISHED" },
      orderBy: [{ isAccepted: "desc" }, { score: "desc" }],
      take: 1,
      select: { doctor: { select: { prenom: true, nom: true, civilite: true, isVerified: true } } },
    },
  } satisfies Prisma.QuestionSelect;

  // Recherche `q` → moteur full-text tolérant (cf lib/qa-search), sinon Prisma.
  const { rows, total } = await (async () => {
    if (q) {
      const res = await searchQuestions(q, {
        specialtySlug: specialite || undefined,
        unansweredOnly: tri === "sans-reponse",
        limit: QA_PAGE_SIZE,
        offset: (page - 1) * QA_PAGE_SIZE,
      });
      const found = res.ids.length
        ? await prisma.question.findMany({ where: { id: { in: res.ids } }, select: CARD_SELECT })
        : [];
      const pos = new Map(res.ids.map((id, i) => [id, i]));
      found.sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
      return { rows: found, total: res.total };
    }
    const where = {
      status: "PUBLISHED" as const,
      ...(specialite ? { specialty: { slug: specialite } } : {}),
      ...(tri === "sans-reponse" ? { answersCount: 0 } : {}),
    };
    const orderBy =
      tri === "populaires"
        ? [{ views: "desc" as const }, { answersCount: "desc" as const }]
        : [{ publishedAt: "desc" as const }];
    const [found, count] = await Promise.all([
      prisma.question.findMany({ where, orderBy, take: QA_PAGE_SIZE, skip: (page - 1) * QA_PAGE_SIZE, select: CARD_SELECT }),
      prisma.question.count({ where }),
    ]);
    return { rows: found, total: count };
  })();

  const dateFmt = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR", { day: "numeric", month: "short", year: "numeric" }) : null;

  const items: QaListCard[] = rows.map((qq) => {
    const doc = qq.answers[0]?.doctor ?? null;
    return {
      slug: qq.slug,
      title: localizedTitle(qq, locale),
      answersText: answersLabel(qq.answersCount, t.oneAnswer, t.manyAnswers),
      viewsText: qq.views >= VIEW_THRESHOLD ? t.views.replace("{n}", qq.views.toLocaleString(locale === "ar" ? "ar-MA" : "fr")) : null,
      hasAnswers: qq.answersCount > 0,
      specialtyName: qq.specialty ? tSpecialty(qq.specialty.name, locale) : null,
      specialtySlug: qq.specialty?.slug ?? null,
      dateText: dateFmt(qq.publishedAt),
      doctorName: doc ? [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ") || "Médecin" : null,
      doctorVerified: doc?.isVerified ?? false,
    };
  });

  return { items, hasMore: page * QA_PAGE_SIZE < total, total };
}

export type QaSimilar = {
  slug: string;
  title: string;
  answersText: string;
  hasAnswers: boolean;
  specialtyName: string | null;
};

// Mots vides FR ignorés pour la recherche par mots-clés (titres de question).
const STOPWORDS = new Set([
  "pour", "avec", "dans", "une", "des", "les", "que", "quoi", "quel", "quelle",
  "comment", "pourquoi", "mon", "mes", "qui", "sur", "par", "ce", "cette",
  "ces", "faire", "etre", "être", "avoir", "plus", "moins", "est", "sont", "mal",
  "quels", "quelles", "depuis", "chez", "vous", "nous", "elle", "ils", "leur",
]);

/**
 * Recherche live de questions publiées proches d'un texte saisi — alimente
 * l'encart « questions similaires » du tunnel poser (détection de doublons
 * côté utilisateur, avant publication). Match par mots-clés (OR) tolérant.
 */
export async function findSimilarQuestions(query: string): Promise<QaSimilar[]> {
  const raw = (query || "").trim();
  if (raw.length < 8) return [];

  const keywords = Array.from(
    new Set(
      raw
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !STOPWORDS.has(w)),
    ),
  ).slice(0, 6);
  if (keywords.length === 0) return [];

  const locale = await getLocale();
  const t = getDictionary(locale).qa;

  const rows = await prisma.question.findMany({
    where: {
      status: "PUBLISHED",
      OR: keywords.map((w) => ({ title: { contains: w, mode: "insensitive" as const } })),
    },
    orderBy: [{ answersCount: "desc" }, { views: "desc" }],
    take: 4,
    select: {
      slug: true,
      title: true,
      answersCount: true,
      specialty: { select: { name: true } },
    },
  });

  return rows.map((qq) => ({
    slug: qq.slug,
    title: qq.title,
    answersText: answersLabel(qq.answersCount, t.oneAnswer, t.manyAnswers),
    hasAnswers: qq.answersCount > 0,
    specialtyName: qq.specialty ? tSpecialty(qq.specialty.name, locale) : null,
  }));
}
