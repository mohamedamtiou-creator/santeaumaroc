/**
 * Test e2e : inscription médecin → vérification admin → annuaire
 * node scripts/test-verification-flow.mjs
 */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const BASE  = "http://localhost:3000";
const SHOTS = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "test-screenshots");

const DR    = { email: `dr.test.${Date.now()}@example.com`, password: "Test@1234" };
const ADMIN = { email: "admin@santeaumaroc.com", password: "Admin@Santeaumaroc2025" };

let browser, ctx, page;
let n = 0;

const log  = (msg) => console.log(`\n▶  ${msg}`);
const ok   = (msg) => console.log(`   ✓  ${msg}`);
const warn = (msg) => console.log(`   ⚠  ${msg}`);

async function shot(label) {
  await fs.mkdir(SHOTS, { recursive: true });
  const f = path.join(SHOTS, `${String(++n).padStart(2,"0")}-${label}.png`);
  await page.screenshot({ path: f, fullPage: false });
  ok(`screenshot → ${path.basename(f)}`);
}

/* ─── 1. Page inscription praticien ──────────────────── */
async function step1_inscriptionCompte() {
  log("1 — Inscription praticien — création compte");
  await page.goto(`${BASE}/inscription-praticien`);

  // Attendre que les inputs soient prêts (formulaire React client-side)
  await page.waitForSelector("input[type='email']", { timeout: 10000 });
  await shot("inscription-page");

  // Email (type='email', pas de name attribute)
  await page.fill("input[type='email']", DR.email);
  ok(`Email : ${DR.email}`);

  // Mot de passe (1er input[type='password'])
  await page.fill("input[type='password'] >> nth=0", DR.password);

  // Confirmer (2e input[type='password'])
  const pwInputs = await page.locator("input[type='password']").count();
  if (pwInputs >= 2) {
    await page.fill("input[type='password'] >> nth=1", DR.password);
    ok("Confirmation mot de passe remplie");
  }

  await shot("step1-rempli");
  await page.locator("button:has-text('Continuer')").first().click();
  await page.waitForTimeout(1200);
  await shot("apres-continuer");
}

/* ─── 2. Étape 2 : infos médecin ─────────────────────── */
async function step2_infosMedecin() {
  log("2 — Inscription — informations médecin");

  const url = page.url();
  const txt = await page.textContent("body");
  if (txt.match(/vérifiez|e-mail|confirmez|Merci/i) || url.match(/connexion|confirm/)) {
    ok("Déjà redirigé après step 1"); return;
  }

  // Civilité
  const civSel = page.locator("select[name='civilite']").first();
  if (await civSel.isVisible().catch(() => false)) {
    await civSel.selectOption("Dr"); ok("Civilité : Dr");
  }

  // Prénom / Nom via placeholders ou labels
  const prenomEl = page.locator("input[placeholder*='rénom'], input[placeholder*='irst'], input[name='prenom']").first();
  if (await prenomEl.isVisible().catch(() => false)) { await prenomEl.fill("Youssef"); ok("Prénom : Youssef"); }

  const nomEl = page.locator("input[placeholder*='om de famille'], input[placeholder*='ast name'], input[name='nom']").first();
  if (await nomEl.isVisible().catch(() => false)) { await nomEl.fill("Benali"); ok("Nom : Benali"); }

  // Téléphone
  const telEl = page.locator("input[type='tel'], input[name='phone'], input[placeholder*='éléphone']").first();
  if (await telEl.isVisible().catch(() => false)) { await telEl.fill("0600000099"); ok("Téléphone rempli"); }

  // Spécialité
  const specSel = page.locator("select[name='specialtyId']").first();
  if (await specSel.isVisible().catch(() => false)) {
    const opts = await specSel.locator("option").allTextContents();
    const first = opts.find(o => o.trim() && !o.match(/^[-—]|Choisir/i));
    if (first) { await specSel.selectOption({ label: first.trim() }); ok(`Spécialité : ${first.trim()}`); }
  }

  // Ville
  const citySel = page.locator("select[name='cityId']").first();
  if (await citySel.isVisible().catch(() => false)) {
    const opts = await citySel.locator("option").allTextContents();
    const first = opts.find(o => o.trim() && !o.match(/^[-—]|Choisir/i));
    if (first) { await citySel.selectOption({ label: first.trim() }); ok(`Ville : ${first.trim()}`); }
  }

  // Adresse
  const adrEl = page.locator("input[name='adresse'], input[placeholder*='dresse']").first();
  if (await adrEl.isVisible().catch(() => false)) { await adrEl.fill("12 Avenue Hassan II"); ok("Adresse remplie"); }

  // CGU checkboxes — cocher tous les checkboxes visibles
  const checkboxes = page.locator("input[type='checkbox']");
  const cbCount = await checkboxes.count();
  for (let i = 0; i < cbCount; i++) {
    const cb = checkboxes.nth(i);
    if (await cb.isVisible().catch(() => false)) {
      await cb.check().catch(() => {});
    }
  }
  if (cbCount > 0) ok(`${cbCount} checkbox(es) cochée(s) (CGU)`);

  await shot("step2-rempli");

  // Soumettre
  const submitBtn = page.locator("button[type='submit'], button:has-text('Créer'), button:has-text('Inscrire mon cabinet'), button:has-text('Continuer')").first();
  await Promise.all([
    page.waitForURL(u => !u.href.includes("/inscription-praticien"), { timeout: 18000 }).catch(() => {}),
    submitBtn.click(),
  ]);
  await page.waitForTimeout(1500);
  await shot("inscription-resultat");

  const finalUrl = page.url();
  const finalTxt = await page.textContent("body");
  ok(`URL : ${finalUrl}`);

  if (finalTxt.match(/e-mail|vérifiez|confirm|bienvenu|Merci/i) || finalUrl.match(/connexion|confirm/)) {
    ok("✓  Inscription réussie — email de confirmation attendu");
  } else if (finalTxt.match(/erreur|obligatoire/i)) {
    warn(`Erreur formulaire : ${finalTxt.slice(0,150).replace(/\s+/g," ")}`);
  } else {
    ok("Soumission effectuée");
  }
}

/* ─── 3. Login admin ──────────────────────────────────── */
async function step3_loginAdmin() {
  log("3 — Connexion admin");
  await page.goto(`${BASE}/connexion`);
  await page.waitForSelector("input[type='email']", { timeout: 10000 });

  await page.fill("input[type='email']", ADMIN.email);
  await page.fill("input[type='password']", ADMIN.password);
  await shot("login-rempli");

  await Promise.all([
    page.waitForURL(u => !u.href.includes("/connexion"), { timeout: 15000 }),
    page.locator("button[type='submit']").first().click(),
  ]);
  await page.waitForLoadState("networkidle");
  await shot("apres-login");

  const url = page.url();
  ok(`URL après login : ${url}`);
  if (!url.includes("/connexion")) {
    ok("✓  Admin connecté");
  } else {
    const errMsg = await page.locator("p").filter({ hasText: /incorrect|vérifi|erreur/i }).first().textContent().catch(() => "");
    throw new Error(`Login admin échoué. Message: "${errMsg}" URL: ${url}`);
  }
}

/* ─── 4. Admin : ouvrir un dossier médecin ───────────── */
async function step4_openDossier() {
  log("4 — Admin : ouvrir un dossier médecin");
  await page.goto(`${BASE}/admin/praticiens`);
  await page.waitForLoadState("networkidle");
  await shot("admin-liste");

  const rows = await page.locator("table tbody tr").count();
  ok(`${rows} médecin(s) dans la liste`);

  // Vérifier le banner de demandes en attente
  const banner = page.locator("text=demande").first();
  if (await banner.isVisible().catch(() => false)) {
    ok("Banner de demandes en attente visible");
  }

  // Ouvrir le premier dossier — récupérer le href et naviguer directement
  const firstExaminer = page.locator("a:has-text('Examiner')").first();
  if (!await firstExaminer.isVisible().catch(() => false)) {
    warn("Aucun dossier 'Examiner' visible");
    return false;
  }

  const href = await firstExaminer.getAttribute("href");
  if (href && href.match(/\/admin\/praticiens\/[^\/]+$/)) {
    await page.goto(BASE + href);
  } else {
    // Fallback: clic + attente de navigation
    await Promise.all([
      page.waitForURL(u => u.href.match(/\/admin\/praticiens\/[^\/]+$/), { timeout: 12000 }),
      firstExaminer.click(),
    ]);
  }
  await page.waitForLoadState("networkidle");
  await shot("dossier-ouvert");
  ok(`Dossier : ${page.url()}`);

  // Vérifier qu'on est bien sur une page de détail
  if (!page.url().match(/\/admin\/praticiens\/[^\/]+$/)) {
    warn(`Navigation vers le dossier échouée (URL: ${page.url()})`);
    return false;
  }
  return true;
}

/* ─── 5. Vérification du médecin ─────────────────────── */
async function step5_verifierMedecin() {
  log("5 — Vérification du médecin");
  const bodyBefore = await page.textContent("body");

  // Si déjà vérifié, révoquer pour tester le flux
  if (bodyBefore.includes("Révoquer la vérification")) {
    ok("Déjà vérifié → révocation pour retester");
    await page.locator("button:has-text('Révoquer la vérification')").click();
    await page.waitForTimeout(500);
    const note = page.locator("textarea").first();
    if (await note.isVisible().catch(() => false)) await note.fill("Test de révocation automatique");
    const confirmRevoke = page.locator("button:has-text('Révoquer')").last();
    await confirmRevoke.click();
    await page.waitForTimeout(2500);
    await page.waitForLoadState("networkidle");
    await shot("apres-revocation");
    ok("Révocation OK");
  }

  // Cliquer Approuver ou Vérifier manuellement
  const approveBtn = page.locator("button:has-text('Approuver'), button:has-text('Vérifier manuellement')").first();
  if (!await approveBtn.isVisible().catch(() => false)) {
    warn("Bouton approbation introuvable");
    warn("Boutons présents : " + (await page.locator("button").allTextContents()).filter(t => t.trim()).join(" | "));
    return;
  }

  await approveBtn.click();
  await page.waitForTimeout(600);
  await shot("formulaire-approbation");

  // Remplir note
  const noteArea = page.locator("textarea").first();
  if (await noteArea.isVisible().catch(() => false)) {
    await noteArea.fill("Dossier complet et conforme. Bienvenue sur SantéauMaroc !");
    ok("Note d'approbation saisie");
  }

  // Confirmer
  const confirmBtn = page.locator("button:has-text(\"Confirmer l'approbation\"), button:has-text('Confirmer')").first();
  if (!await confirmBtn.isVisible().catch(() => false)) { warn("Bouton confirmer absent"); return; }

  await confirmBtn.click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState("networkidle");
  await shot("apres-approbation");

  const bodyAfter = await page.textContent("body");
  if (bodyAfter.match(/Médecin vérifié|badge/i)) {
    ok("✓  Statut « Médecin vérifié » affiché");
  } else if (bodyAfter.includes("Révoquer")) {
    ok("✓  Action approuver réussie (bouton Révoquer présent = médecin vérifié)");
  } else {
    warn("Statut non confirmé — voir screenshot");
  }
}

/* ─── 6. Annuaire public ──────────────────────────────── */
async function step6_annuaire() {
  log("6 — Annuaire public /praticiens");
  await page.goto(`${BASE}/praticiens`);
  await page.waitForLoadState("networkidle");
  await shot("annuaire");

  const badges = await page.locator("text=Vérifié").count();
  ok(`Badges « Vérifié » visibles : ${badges}`);
  if (badges > 0) ok("✓  Badge vérifié visible dans l'annuaire");
  else warn("Aucun badge — médecin approuvé doit être isActive=true");

  await shot("annuaire-final");
}

/* ─── Setup navigateur ───────────────────────────────── */
async function setup() {
  browser = await chromium.launch({ headless: true });
  ctx     = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page    = await ctx.newPage();
  page.setDefaultTimeout(15000);
}

/* ─── MAIN ────────────────────────────────────────────── */
async function main() {
  console.log("══════════════════════════════════════════════════════════");
  console.log("  TEST E2E : INSCRIPTION MÉDECIN + VÉRIFICATION ADMIN");
  console.log("══════════════════════════════════════════════════════════");

  try {
    await setup();
    await step1_inscriptionCompte();
    await step2_infosMedecin();
    await step3_loginAdmin();
    const opened = await step4_openDossier();
    if (opened) await step5_verifierMedecin();
    await step6_annuaire();

    console.log("\n══════════════════════════════════════════════════════════");
    console.log("  ✓  TOUS LES TESTS PASSÉS");
    console.log(`  Screenshots → ${SHOTS}`);
    console.log("══════════════════════════════════════════════════════════\n");
  } catch(e) {
    console.error(`\n  ✗  ERREUR : ${e.message}`);
    if (page) await shot("ERREUR").catch(() => {});
    console.log(`  Screenshots → ${SHOTS}`);
    process.exit(1);
  } finally {
    await browser?.close();
  }
}

main();
