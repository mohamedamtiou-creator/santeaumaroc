import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const DUMP_PATH = path.resolve("C:/Next/Santeaumaroc_old/santeaum_sam.sql");

async function main() {
  console.log("Lecture du dump…");
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  // Combien d'INSERT INTO `etablissements_avis` y a-t-il ?
  const insertMatches = [...sql.matchAll(/INSERT INTO `etablissements_avis`/gi)];
  console.log(`\nINSERT INTO \`etablissements_avis\` trouvés : ${insertMatches.length}`);

  // Chercher la position et extraire un extrait autour de chaque INSERT
  for (const m of insertMatches) {
    const pos = m.index!;
    const preview = sql.slice(pos, pos + 300).replace(/\n/g, "↵");
    console.log(`\n--- à l'offset ${pos} ---`);
    console.log(preview);
  }

  // Compter les lignes avec un grep simple sur les séquences ),(
  const block = sql.slice(
    sql.indexOf("INSERT INTO `etablissements_avis`"),
    sql.indexOf("INSERT INTO `etablissements_avis`") + 200_000
  );
  // Compter les tuples de haut niveau : chaque ligne commence par un \n(
  const rowCount = (block.match(/^\(\d+,/gm) ?? []).length;
  console.log(`\nLignes détectées (heuristique) : ${rowCount}`);
}

main().catch(console.error);
