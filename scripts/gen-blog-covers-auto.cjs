require("dotenv/config");
const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Générateur AUTO de couvertures — recherche une photo pertinente par mots-clés
// via l'API Unsplash (pas d'ID à choisir à la main), la télécharge, la
// redimensionne (1200×675, jpeg mozjpeg q72) → public/blog-covers/post-<slug>.jpg,
// et (avec --commit) met à jour Post.coverImage + coverAlt.
//
// PRÉREQUIS : variable d'env UNSPLASH_ACCESS_KEY (compte développeur Unsplash,
// gratuit). Respecte les règles Unsplash (déclenche l'endpoint download).
//
//   node scripts/gen-blog-covers-auto.cjs                 # tous les posts SANS image (fichiers only, PAS de DB)
//   node scripts/gen-blog-covers-auto.cjs --commit        # + met à jour la DB
//   node scripts/gen-blog-covers-auto.cjs --category=symptomes --commit
//   node scripts/gen-blog-covers-auto.cjs --limit=40      # traiter par lots (quota API)
//   node scripts/gen-blog-covers-auto.cjs --force         # régénérer même si le fichier existe
//
// ⚠️ Quota Unsplash « démo » = 50 requêtes/heure. Pour ~160 articles : demander
// l'accès « production » (5000/h) OU lancer par lots (--limit) sur plusieurs heures.
// ════════════════════════════════════════════════════════════════════════════

const W = 1200, H = 675, SRC_W = 1600;
const OUT_DIR = path.join(__dirname, "..", "public", "blog-covers");
const SHEET = path.join(OUT_DIR, "_contact-sheet-auto.jpg");
const KEY = process.env.UNSPLASH_ACCESS_KEY;
const COMMIT = process.argv.includes("--commit");
const FORCE = process.argv.includes("--force");
const CATEGORY = (process.argv.find(a => a.startsWith("--category=")) || "").split("=")[1] || null;
const LIMIT = parseInt((process.argv.find(a => a.startsWith("--limit=")) || "").split("=")[1] || "0", 10);

// Règles mots-clés (1re correspondance sur le slug gagne) → requête Unsplash (EN
// = meilleurs résultats) + préfixe d'alt SEO FR. Fallback par catégorie ensuite.
const RULES = [
  [/diabet|glycemie|insuline|hba1c/, "blood sugar diabetes test", "Autosurveillance de la glycémie"],
  [/hypertension|tension|antihypertenseur/, "blood pressure monitor", "Mesure de la tension artérielle"],
  [/asthme|bronchiolite|bpco|spirometrie|inhalateur/, "asthma inhaler breathing", "Inhalateur et santé respiratoire"],
  [/cholesterol|triglyceride|statine|cardiovasculaire|avc|infarctus/, "heart health cardiology", "Prévention cardiovasculaire"],
  [/anemie|fer|prise-de-sang|analyse-de-sang|bilan-lipidique/, "blood test laboratory", "Analyse de sang au laboratoire"],
  [/depression|stress|anxiete|mentale|isolement|antidepresseur/, "mental health calm support", "Bien-être et santé mentale"],
  [/allergie|rhinite|urticaire|antihistaminique|eruption|demangeaison/, "allergy pollen sneeze", "Allergie et réaction cutanée"],
  [/arthrose|articulaire|osteoporose|calcium|rhumat/, "joint knee bones", "Articulations et santé osseuse"],
  [/migraine|mal-de-tete|cephalee|tete/, "headache migraine woman", "Mal de tête et migraine"],
  [/hypothyroid|hyperthyroid|thyroide|levothyroxine/, "thyroid neck examination", "Examen de la thyroïde"],
  [/renal|rein|dialyse|calcul|colique-nephretique|urin/, "kidney health water", "Santé des reins et hydratation"],
  [/goutte|acide-urique/, "foot pain gout", "Douleur articulaire du pied"],
  [/hepatite|foie|steatose/, "liver health medical", "Santé du foie"],
  [/reflux|estomac|gastrite|ulcere|helicobacter|hernie-hiatale|ballonnement/, "stomach digestion", "Confort digestif"],
  [/colorect|colon|polype|coloscopie|gastroscopie/, "colon screening endoscopy", "Dépistage digestif"],
  [/cancer/, "cancer screening hope", "Dépistage et prévention du cancer"],
  [/zona|vaccin|vaccination/, "vaccine syringe arm", "Vaccination"],
  [/varice|jambes-lourdes|contention|phlebite|doppler/, "legs veins walking", "Circulation veineuse des jambes"],
  [/irm/, "MRI scan machine", "Appareil d'IRM"],
  [/scanner/, "CT scan radiology", "Scanner médical"],
  [/radiographie/, "x-ray radiology", "Radiographie"],
  [/echographie|echo-doppler/, "ultrasound scan", "Échographie"],
  [/electrocardiogramme|ecg|holter|mapa|epreuve-effort/, "ECG heart monitor", "Enregistrement cardiaque (ECG)"],
  [/mammographie/, "mammography breast health", "Mammographie de dépistage"],
  [/fond-d-oeil|vue-senior|ophtalmo/, "eye exam vision", "Examen des yeux"],
  [/eeg/, "brain scan neurology", "Exploration neurologique"],
  [/test-allergie/, "allergy skin test", "Test allergologique cutané"],
  [/fievre/, "fever thermometer", "Prise de température (fièvre)"],
  [/toux|gorge|sinusite|lavage-nez/, "cough throat cold", "Voies respiratoires (toux, gorge)"],
  [/poitrine|palpitation|essoufflement|dyspnee/, "chest pain heart", "Gêne thoracique et respiration"],
  [/ventre|nausee|vomissement|diarrhee|constipation/, "abdominal stomach ache", "Douleurs abdominales"],
  [/dos|lombalgie/, "back pain spine", "Douleur au dos"],
  [/vertige/, "dizziness balance", "Vertiges et équilibre"],
  [/fatigue/, "tired fatigue rest", "Fatigue"],
  [/sang-dans-les-urines|brulures-urinaires/, "urology kidney health", "Santé urinaire"],
  [/saignement-de-nez/, "nosebleed face", "Saignement de nez"],
  [/grossesse|allaitement|regles|endometriose|sopk|mycose|gynecolog|contraception|menopause|infertilite|femme/, "women health pregnancy", "Santé de la femme"],
  [/enfant|nourrisson|bebe|pediatr|diversification|developpement|urgences-pediatriques/, "child pediatric care", "Santé de l'enfant"],
  [/senior|age|chute|memoire|audition|polymedication|canicule|deshydratation|autonomie|dependance/, "elderly senior care", "Santé des seniors"],
  [/obesite|imc|maigrir|bariatrique|poids/, "healthy weight nutrition", "Poids et nutrition"],
  [/sommeil|insomnie/, "sleep bed rest", "Sommeil"],
  [/alimentation|nutrition|manger|aliments/, "healthy food vegetables", "Alimentation équilibrée"],
  [/depistage|bilan/, "medical checkup doctor", "Dépistage et bilan de santé"],
  [/paracetamol|ibuprofene|anti-inflammatoire|antibiotique|omeprazole|metformine|aspirine|anticoagulant|corticoide|medicament/, "medication pills pharmacy", "Médicaments et bon usage"],
  [/activite-physique|sport/, "walking exercise outdoor", "Activité physique"],
  [/tabac|sevrage/, "quit smoking", "Arrêt du tabac"],
];
const CAT_DEFAULT = {
  "maladies-traitements": ["doctor patient consultation", "Consultation médicale"],
  symptomes: ["patient symptoms doctor", "Consultation pour des symptômes"],
  examens: ["medical exam hospital", "Examen médical"],
  medicaments: ["medication pharmacy", "Médicaments"],
  "prevention-sante": ["healthy lifestyle prevention", "Prévention et bonne santé"],
  "sante-femme": ["women health", "Santé de la femme"],
  "sante-enfant": ["child health pediatric", "Santé de l'enfant"],
  "sante-senior": ["elderly care", "Santé des seniors"],
  "sante-mentale": ["mental wellbeing", "Santé mentale"],
  "questions-frequentes": ["doctor answering question", "Questions de santé"],
};
const FALLBACK = ["health medical morocco", "Santé"];

function pick(slug, catSlug) {
  for (const [re, q, alt] of RULES) if (re.test(slug)) return { q, alt };
  if (CAT_DEFAULT[catSlug]) return { q: CAT_DEFAULT[catSlug][0], alt: CAT_DEFAULT[catSlug][1] };
  return { q: FALLBACK[0], alt: FALLBACK[1] };
}

function apiGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: `Client-ID ${KEY}`, "Accept-Version": "v1" } }, (res) => {
      let b = ""; res.on("data", c => b += c);
      res.on("end", () => { if (res.statusCode >= 400) return reject(new Error(`Unsplash ${res.statusCode}: ${b.slice(0,120)}`)); try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}
function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 400) return reject(new Error("dl " + res.statusCode));
      const chunks = []; res.on("data", c => chunks.push(c)); res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!KEY) { console.error("❌ UNSPLASH_ACCESS_KEY manquant dans .env (compte développeur Unsplash, gratuit)."); process.exit(1); }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", ...(CATEGORY ? { category: { slug: CATEGORY } } : {}) },
    select: { slug: true, aboutEntity: true, coverImage: true, category: { select: { slug: true } } },
    orderBy: { publishedAt: "desc" },
  });
  posts = posts.filter(p => FORCE || !p.coverImage);
  if (LIMIT) posts = posts.slice(0, LIMIT);
  console.log(`${posts.length} articles à traiter${CATEGORY?" (catégorie "+CATEGORY+")":""}${LIMIT?" (limite "+LIMIT+")":""}\n`);

  const thumbs = []; let ok = 0, fail = 0;
  const usedIds = new Set();      // photos déjà utilisées dans ce lot (anti-doublon global)
  const queryUse = new Map();     // décalage par requête (variété au sein d'un même thème)
  for (const p of posts) {
    const outPath = path.join(OUT_DIR, `post-${p.slug}.jpg`);
    if (!FORCE && fs.existsSync(outPath)) { console.log(`· ${p.slug} (fichier déjà présent)`); if (COMMIT) await prisma.post.update({ where:{slug:p.slug}, data:{ coverImage:`/blog-covers/post-${p.slug}.jpg` } }).catch(()=>{}); continue; }
    const { q, alt } = pick(p.slug, p.category.slug);
    try {
      const search = await apiGet(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&orientation=landscape&per_page=10&content_filter=high`);
      const results = (search.results || []);
      if (!results.length) { console.log(`✗ ${p.slug} — aucun résultat pour « ${q} »`); fail++; continue; }
      // Choisit une photo DISTINCTE : décalage par requête + saut des IDs déjà pris.
      const start = queryUse.get(q) || 0; queryUse.set(q, start + 1);
      let ph = null;
      for (let k = 0; k < results.length; k++) { const c = results[(start + k) % results.length]; if (!usedIds.has(c.id)) { ph = c; break; } }
      if (!ph) ph = results[start % results.length];
      usedIds.add(ph.id);
      // Respect des règles Unsplash : déclencher l'endpoint de download.
      if (ph.links && ph.links.download_location) await apiGet(ph.links.download_location).catch(()=>{});
      const buf = await download(`${ph.urls.raw}&w=${SRC_W}&q=80&fm=jpg`);
      await sharp(buf).resize(W, H, { fit: "cover", position: "attention" }).jpeg({ quality: 72, mozjpeg: true }).toFile(outPath);
      thumbs.push(outPath);
      const coverAlt = alt;
      if (COMMIT) await prisma.post.update({ where:{slug:p.slug}, data:{ coverImage:`/blog-covers/post-${p.slug}.jpg`, coverAlt } });
      console.log(`✓ ${p.slug} ← « ${q} » (${ph.user && ph.user.name || "?"})`);
      ok++;
      await sleep(1200); // throttle doux (quota Unsplash)
    } catch (e) { console.log(`✗ ${p.slug} — ${e.message}`); fail++; await sleep(1500); }
  }

  // Planche-contact (validation visuelle avant --commit)
  if (thumbs.length) {
    const cols = 6, tw = 300, th = 169;
    const rows = Math.ceil(thumbs.length / cols);
    const canvas = sharp({ create: { width: cols*tw, height: rows*th, channels: 3, background: "#fff" } });
    const comps = await Promise.all(thumbs.map(async (f,i)=>({ input: await sharp(f).resize(tw,th).toBuffer(), left:(i%cols)*tw, top:Math.floor(i/cols)*th })));
    await canvas.composite(comps).jpeg({ quality: 70 }).toFile(SHEET);
    console.log(`\nPlanche-contact : ${SHEET}`);
  }
  console.log(`\nTerminé : ${ok} générées, ${fail} échecs.${COMMIT?" (DB mise à jour)":" (fichiers seulement — relancer avec --commit après validation de la planche)"}`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
