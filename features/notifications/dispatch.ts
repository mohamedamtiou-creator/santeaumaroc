import "server-only";

import { prisma } from "@/lib/prisma";
import {
  sendArticleSubmittedAdminEmail,
  sendArticleDecisionEmail,
  sendArticleLiveEmail,
  sendAuthorVerificationEmail,
} from "@/lib/email";

/**
 * Dispatcher de notifications de la plateforme contributive.
 *
 * Chaque événement crée une notification IN-APP (persistée, source de vérité du
 * centre /espace-auteur/notifications) et déclenche l'email correspondant en
 * BEST-EFFORT : un échec Resend (env manquant en prod, etc.) ne doit jamais
 * faire échouer la transition éditoriale. cf lib/email.ts.
 */

type NotifKind =
  | "SUBMITTED"
  | "APPROVED"
  | "CHANGES"
  | "REJECTED"
  | "PUBLISHED"
  | "COMMENT"
  | "BADGE"
  | "LICENSE_APPROVED"
  | "LICENSE_REJECTED";

/** Crée une notification in-app. Ne lève jamais (best-effort). */
export async function createNotification(input: {
  userId: string;
  kind: NotifKind;
  title: string;
  body?: string | null;
  href?: string | null;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
      },
    });
  } catch (err) {
    console.error("[notify] création notification échouée", err);
  }
}

/** Emballe un envoi email en best-effort (log, ne relance pas). */
async function tryEmail(label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(`[notify] email « ${label} » échoué`, err);
  }
}

/* ── Événements éditoriaux ──────────────────────────────────────────────── */

/** L'auteur a soumis un article → confirmation in-app + alerte équipe. */
export async function notifyArticleSubmitted(input: {
  authorId: string;
  authorName: string;
  articleTitle: string;
  postId: string;
}): Promise<void> {
  await createNotification({
    userId: input.authorId,
    kind: "SUBMITTED",
    title: "Article soumis à la relecture",
    body: `« ${input.articleTitle} » est en attente de validation médicale.`,
    href: "/espace-auteur/articles",
  });
  await tryEmail("article-submitted-admin", () =>
    sendArticleSubmittedAdminEmail({
      articleTitle: input.articleTitle,
      authorName: input.authorName,
      postId: input.postId,
    }),
  );
}

/** Décision de l'éditeur (approuvé / corrections / refus). */
export async function notifyArticleDecision(input: {
  authorId: string;
  authorEmail: string;
  authorName: string;
  articleTitle: string;
  decision: "APPROVE" | "CHANGES" | "REJECT";
  note?: string | null;
}): Promise<void> {
  const kind: NotifKind =
    input.decision === "APPROVE" ? "APPROVED" : input.decision === "CHANGES" ? "CHANGES" : "REJECTED";
  const title =
    input.decision === "APPROVE"
      ? "Article approuvé"
      : input.decision === "CHANGES"
        ? "Corrections demandées"
        : "Article non retenu";
  await createNotification({
    userId: input.authorId,
    kind,
    title,
    body: `« ${input.articleTitle} »${input.note ? ` — ${input.note}` : ""}`,
    href: "/espace-auteur/articles",
  });
  await tryEmail("article-decision", () =>
    sendArticleDecisionEmail(input.authorEmail, input.authorName, {
      decision: input.decision,
      articleTitle: input.articleTitle,
      note: input.note,
    }),
  );
}

/** L'article est passé en ligne. */
export async function notifyArticlePublished(input: {
  authorId: string;
  authorEmail: string;
  authorName: string;
  articleTitle: string;
  slug: string;
}): Promise<void> {
  await createNotification({
    userId: input.authorId,
    kind: "PUBLISHED",
    title: "Votre article est publié",
    body: `« ${input.articleTitle} » est en ligne.`,
    href: `/blog/${input.slug}`,
  });
  await tryEmail("article-live", () =>
    sendArticleLiveEmail(input.authorEmail, input.authorName, {
      articleTitle: input.articleTitle,
      slug: input.slug,
    }),
  );
}

/** Décision de vérification d'identité auteur. */
export async function notifyAuthorVerification(input: {
  userId: string;
  email: string;
  name: string;
  approved: boolean;
  note?: string | null;
}): Promise<void> {
  await createNotification({
    userId: input.userId,
    kind: input.approved ? "LICENSE_APPROVED" : "LICENSE_REJECTED",
    title: input.approved ? "Vous êtes auteur vérifié" : "Dossier auteur à compléter",
    body: input.approved
      ? "Vous pouvez maintenant rédiger et soumettre vos articles."
      : input.note ?? "Des informations complémentaires sont requises.",
    href: "/espace-auteur/verification",
  });
  await tryEmail("author-verification", () =>
    sendAuthorVerificationEmail(input.email, input.name, { approved: input.approved, note: input.note }),
  );
}
