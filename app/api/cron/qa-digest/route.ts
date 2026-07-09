import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDoctorDigestEmail } from "@/lib/email";

/*
 * Digest hebdomadaire (flywheel de contenu Q/R) : notifie les médecins vérifiés
 * des questions sans réponse récentes dans leur spécialité.
 *
 * Endpoint protégé par CRON_SECRET — à déclencher par un planificateur externe
 * (Vercel Cron, GitHub Actions, cron système) une fois par semaine :
 *   GET /api/cron/qa-digest  avec l'en-tête  Authorization: Bearer <CRON_SECRET>
 *
 * Pas de planificateur intégré : la cadence est gérée à l'extérieur. Idempotence
 * non garantie (rejouer = renvoyer) — laisser le planificateur cadencer.
 */

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 7;
const MAX_EMAILS = 500; // garde-fou

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré." }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // Questions publiées récentes encore sans réponse, par spécialité.
  const questions = await prisma.question.findMany({
    where: { status: "PUBLISHED", answersCount: 0, publishedAt: { gte: since }, specialtyId: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, specialtyId: true },
  });

  // Regroupement par spécialité.
  const bySpecialty = new Map<string, { slug: string; title: string }[]>();
  for (const q of questions) {
    if (!q.specialtyId) continue;
    const arr = bySpecialty.get(q.specialtyId) ?? [];
    arr.push({ slug: q.slug, title: q.title });
    bySpecialty.set(q.specialtyId, arr);
  }

  // Noms de spécialités + médecins destinataires récupérés en 2 requêtes groupées
  // (au lieu de 2 requêtes PAR spécialité — N+1). Regroupement des e-mails en mémoire.
  const specialtyIds = [...bySpecialty.keys()];
  const [specialties, doctors] = await Promise.all([
    prisma.specialty.findMany({ where: { id: { in: specialtyIds } }, select: { id: true, name: true } }),
    prisma.doctor.findMany({
      where: {
        specialtyId: { in: specialtyIds },
        isVerified: true,
        isActive: true,
        isBlacklisted: false,
        user: { is: { emailVerified: true, isActive: true } },
      },
      select: { specialtyId: true, user: { select: { email: true } } },
    }),
  ]);

  const nameById = new Map(specialties.map((s) => [s.id, s.name]));
  const emailsBySpecialty = new Map<string, string[]>();
  for (const d of doctors) {
    const email = d.user?.email;
    if (!email) continue;
    const arr = emailsBySpecialty.get(d.specialtyId) ?? [];
    arr.push(email);
    emailsBySpecialty.set(d.specialtyId, arr);
  }

  let sent = 0;
  let failed = 0;

  for (const [specialtyId, qs] of bySpecialty) {
    if (sent >= MAX_EMAILS) break;

    const emails = emailsBySpecialty.get(specialtyId) ?? [];
    const specialtyName = nameById.get(specialtyId) ?? "votre spécialité";

    for (const email of emails) {
      if (sent >= MAX_EMAILS) break;
      try {
        await sendDoctorDigestEmail(email, specialtyName, qs, qs.length);
        sent++;
      } catch (e) {
        failed++;
        console.error("[qa-digest] envoi échoué", e);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    specialties: bySpecialty.size,
    questions: questions.length,
    emailsSent: sent,
    emailsFailed: failed,
  });
}
