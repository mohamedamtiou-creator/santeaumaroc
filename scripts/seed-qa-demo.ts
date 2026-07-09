import { prisma } from "../lib/prisma";
import { uniqueQuestionSlug, recomputeAnswerScore } from "../lib/qa";

async function main() {
  // La question porte sur une douleur au genou : une médecine générale est
  // cliniquement plausible (et le répondeur doit l'être aussi, sinon on casse
  // l'E-E-A-T — cf. reseed-qa-answer-doctors.ts). On ancre donc question ET
  // répondeur sur « Médecine générale », plutôt qu'une spécialité arbitraire.
  const specialty = await prisma.specialty.findFirst({ where: { name: "Médecine générale" } });
  const doctor = await prisma.doctor.findFirst({
    where: {
      isActive: true,
      isVerified: true,
      isBlacklisted: false,
      slug: { not: null },
      ...(specialty ? { specialtyId: specialty.id } : {}),
    },
    select: { id: true, isVerified: true, slug: true },
    orderBy: { averageRating: "desc" },
  });
  if (!doctor) throw new Error("Aucun médecin généraliste vérifié trouvé.");

  // S'assure que le médecin de démo est vérifié (pour le badge / classement).
  if (!doctor.isVerified) {
    await prisma.doctor.update({ where: { id: doctor.id }, data: { isVerified: true } });
  }

  // Patient demandeur (réutilise ou crée).
  let patient = await prisma.user.findFirst({ where: { role: "PATIENT" } });
  if (!patient) {
    patient = await prisma.user.create({
      data: {
        email: `demo-patient-${Date.now()}@example.com`,
        password: "x",
        name: "Patient Démo",
        role: "PATIENT",
        emailVerified: true,
        isActive: true,
      },
    });
  }

  const title = "Douleur au genou en montant les escaliers, que faire ?";
  const existing = await prisma.question.findFirst({ where: { title } });
  if (existing) {
    console.log("Question de démo déjà présente:", `/questions/${existing.slug}`);
    return;
  }

  const slug = await uniqueQuestionSlug(title);
  const question = await prisma.question.create({
    data: {
      slug,
      title,
      body: "Depuis deux semaines, j'ai une douleur à l'avant du genou quand je monte les escaliers. Pas de gonflement. Est-ce grave ? Que puis-je faire ?",
      status: "PUBLISHED",
      publishedAt: new Date(),
      askedById: patient.id,
      specialtyId: specialty?.id ?? null,
      aiSummary:
        "Une douleur antérieure du genou à la montée d'escaliers évoque souvent un syndrome rotulien, fréquent et bénin. Repos relatif, glace et renforcement du quadriceps aident généralement. Consultez si la douleur persiste, gonfle ou bloque le genou.",
      tags: ["genou", "douleur", "escaliers"],
      answersCount: 1,
      lastAnswerAt: new Date(),
    },
  });

  const answer = await prisma.answer.create({
    data: {
      questionId: question.id,
      doctorId: doctor.id,
      status: "PUBLISHED",
      isAccepted: true,
      body:
        "Ce type de douleur à l'avant du genou en montant les escaliers évoque le plus souvent un syndrome fémoro-patellaire, très fréquent et bénin.\n\nEn première intention : repos relatif (évitez escaliers et accroupissements), glace 15 min après l'effort, et renforcement progressif du quadriceps.\n\nConsultez un médecin si la douleur persiste au-delà de 2 à 3 semaines, s'accompagne d'un gonflement, d'un blocage ou d'une instabilité du genou.",
    },
  });
  await recomputeAnswerScore(answer.id);

  console.log("✓ Question de démo créée:", `/questions/${slug}`);
  console.log("  Médecin:", doctor.slug, "| Spécialité:", specialty?.slug);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
