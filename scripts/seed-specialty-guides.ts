/**
 * Seed des guides « quand consulter un [spécialité] ? ». Upsert par spécialité,
 * verrous YMYL à NULL → /quand-consulter/[specialite] reste noindex jusqu'à
 * relecture (specialty-guides-approve[-ar]).
 *
 *   npx tsx --env-file=.env scripts/seed-specialty-guides.ts
 */
import { prisma } from "@/lib/prisma";
import { SPECIALTY_GUIDES } from "./data/specialty-guides";
import { SPECIALTY_GUIDES_2 } from "./data/specialty-guides-2";
import { SPECIALTY_GUIDES_3 } from "./data/specialty-guides-3";

async function main() {
  let ok = 0;
  let missing = 0;
  for (const g of [...SPECIALTY_GUIDES, ...SPECIALTY_GUIDES_2, ...SPECIALTY_GUIDES_3]) {
    const spec = await prisma.specialty.findUnique({ where: { slug: g.specialty }, select: { id: true } });
    if (!spec) {
      console.warn(`⚠ spécialité introuvable, ignorée : ${g.specialty}`);
      missing++;
      continue;
    }
    const data = {
      shortAnswer: g.shortAnswer,
      reasons: g.reasons.join("\n"),
      redFlags: g.redFlags.join("\n"),
      whenToConsult: g.whenToConsult,
      faqJson: JSON.stringify(g.faq),
      relatedSlugs: g.relatedSlugs ?? [],
      shortAnswerAr: g.shortAnswerAr,
      reasonsAr: g.reasonsAr.join("\n"),
      redFlagsAr: g.redFlagsAr.join("\n"),
      whenToConsultAr: g.whenToConsultAr,
      faqJsonAr: JSON.stringify(g.faqAr),
    };
    // Upsert sans écraser les dates de relecture éventuelles (verrous préservés).
    await prisma.specialtyGuide.upsert({
      where: { specialtyId: spec.id },
      create: { specialtyId: spec.id, ...data },
      update: data,
    });
    ok++;
  }
  console.log(`✓ ${ok} guide(s) de spécialité semé(s)${missing ? `, ${missing} introuvable(s)` : ""} (noindex jusqu'à relecture).`);
}

main().finally(() => prisma.$disconnect());
