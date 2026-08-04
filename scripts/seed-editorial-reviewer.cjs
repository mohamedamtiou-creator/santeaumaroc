require("dotenv/config");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// COMPTE DE RELECTURE ÉDITORIALE dédié — porteur de `Post.reviewedById`.
//
// POURQUOI : jusqu'ici les scripts de seed pointaient `reviewedById` sur le
// premier compte ADMIN actif. C'est le compte d'administration technique qui se
// retrouvait crédité de la relecture médicale sous chaque article. Un compte
// dédié sépare les deux responsabilités et rend la signature exacte.
//
// SÉCURITÉ : le compte NE PEUT PAS SE CONNECTER — `isActive: false` et
// `emailVerified: false` sont tous deux bloquants (features/auth/actions.ts:178),
// et le mot de passe est le hash d'un secret aléatoire jamais conservé. C'est une
// identité de signature, pas un accès.
//
// Le rôle EDITOR est celui prévu par lib/contributor.ts pour un relecteur.
//
//   node scripts/seed-editorial-reviewer.cjs
// ════════════════════════════════════════════════════════════════════════════

const EMAIL = "redaction@santeaumaroc.com";

// L'identité doit se DISTINGUER de l'auteur : le compte admin qui signe les
// articles s'appelle « Équipe SantéauMaroc » avec pour fonction « Rédaction
// médicale — SantéauMaroc ». Un relecteur nommé « Rédaction médicale » aurait
// produit deux lignes quasi identiques sous chaque article (« Écrit par… » /
// « Vérifié par… »), ce qui affaiblit le signal au lieu de le renforcer.
// `jobTitle` reste vide : la page l'affiche en suffixe « · … » du nom, ce qui
// serait redondant ici.
const PROFILE = {
  name: "Relecture médicale SantéauMaroc",
  role: "EDITOR",
  jobTitle: null,
  credentials: "Relecture éditoriale et médicale des contenus publiés sur SantéauMaroc, contre sources institutionnelles (OMS, ANSM, Assurance Maladie, NHS) et recommandations en vigueur.",
  bio: "La rédaction médicale de SantéauMaroc vérifie chaque contenu avant publication : exactitude des faits, conformité aux recommandations, sources citées et adaptation au contexte marocain.",
  isActive: false,
  emailVerified: false,
};

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL }, select: { id: true } });
  const user = existing
    ? await prisma.user.update({ where: { email: EMAIL }, data: PROFILE, select: { id: true, name: true } })
    : await prisma.user.create({
        // Mot de passe : hash d'un secret aléatoire, volontairement non conservé.
        data: { email: EMAIL, password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10), ...PROFILE },
        select: { id: true, name: true },
      });
  console.log(`${existing ? "=" : "✓"} ${user.name} <${EMAIL}> — connexion impossible (isActive=false, emailVerified=false)`);
  return user.id;
}

main()
  .then((id) => console.log(`  id : ${id}`))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
