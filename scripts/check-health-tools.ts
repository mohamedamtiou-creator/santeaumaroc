/**
 * Contrôle des calculs du cluster `/outils` — valeurs de référence vérifiées à
 * la main pour chaque formule publiée (OMS, Mifflin-St Jeor, Naegele, ESC/ESH,
 * FINDRISC). À rejouer après toute modification des seuils ou des formules :
 *   npx tsx scripts/check-health-tools.ts
 */
import { runTool } from "@/lib/health-tools";

let fails = 0;
const ok = (name: string, cond: boolean, got?: unknown) => {
  if (!cond) { fails++; console.log(`  FAIL ${name}`, got ?? ""); } else console.log(`  ok   ${name}`);
};
const norm = (s: string) => s.replace(/\s/g, " ");
const r = (slug: any, v: Record<string, string>) => {
  const res = runTool(slug, v, "fr");
  if (res.ok) {
    res.outcome.value = norm(res.outcome.value);
    res.outcome.details = res.outcome.details?.map((d) => ({ ...d, value: norm(d.value) }));
  }
  return res;
};

console.log("IMC");
{
  const res = r("calcul-imc", { poids: "72", taille: "175" });
  ok("72kg/175cm → 23,5 normal", res.ok && res.outcome.value === "23,5" && res.outcome.categoryKey === "normal", res);
  const o = r("calcul-imc", { poids: "110", taille: "165" });
  ok("110/165 → obesite3 alert", o.ok && o.outcome.categoryKey === "obesite3" && o.outcome.severity === "alert", o);
  const e = r("calcul-imc", { poids: "", taille: "175" });
  ok("poids vide → required", !e.ok && e.errors.poids === "required", e);
  const b = r("calcul-imc", { poids: "900", taille: "175" });
  ok("900kg → range", !b.ok && b.errors.poids === "range", b);
}

console.log("TOUR DE TAILLE");
{
  // 92 / 175 = 0,526 → risque augmenté ; tour 92 chez l'homme > 94 ? non → augmenté seulement
  const res = r("tour-de-taille", { sexe: "homme", tourTaille: "92", taille: "175", tourHanches: "100" });
  ok("92/175 → 0,53 augmenté", res.ok && res.outcome.value === "0,53" && res.outcome.categoryKey === "augmente", res.ok ? res.outcome : res);
  ok("RTH 0,92 → note obésité abdominale", res.ok && res.outcome.noteKeys!.includes("rthEleve") && res.outcome.details![0].value === "0,92", res.ok ? res.outcome : res);
  ok("seuils homme affichés", res.ok && res.outcome.details![1].value === "94 – 102 cm", res.ok ? res.outcome.details : res);
  const sain = r("tour-de-taille", { sexe: "femme", tourTaille: "72", taille: "165", tourHanches: "95" });
  ok("72/165 → 0,44 favorable", sain.ok && sain.outcome.value === "0,44" && sain.outcome.categoryKey === "sain", sain.ok ? sain.outcome : sain);
  ok("tour sous le seuil femme", sain.ok && sain.outcome.noteKeys!.includes("tourNormal"), sain.ok ? sain.outcome.noteKeys : sain);
  const eleve = r("tour-de-taille", { sexe: "homme", tourTaille: "115", taille: "175", tourHanches: "110" });
  ok("115/175 → 0,66 élevé + tourEleve", eleve.ok && eleve.outcome.categoryKey === "eleve" && eleve.outcome.noteKeys!.includes("tourEleve"), eleve.ok ? eleve.outcome : eleve);
  const inv = r("tour-de-taille", { sexe: "homme", tourTaille: "180", taille: "175", tourHanches: "110" });
  ok("champs inversés → incohérent", !inv.ok && inv.errors.tourTaille === "coherence", inv);
}

console.log("BESOINS EN EAU");
{
  // 70 kg × 33 ml = 2,31 L ; climat tempéré, pas de sport
  const res = r("besoins-en-eau", { poids: "70", sport: "0", climat: "tempere" });
  ok("70 kg tempéré → 2,3 L", res.ok && res.outcome.value === "2,3", res.ok ? res.outcome : res);
  ok("part à boire 1,7 L", res.ok && res.outcome.details![0].value === "1,7 L", res.ok ? res.outcome.details : res);
  ok("avertissement restriction toujours présent", res.ok && res.outcome.noteKeys![0] === "restrictionMedicale", res.ok ? res.outcome.noteKeys : res);
  ok("pas de note effort au repos", res.ok && !res.outcome.noteKeys!.includes("pendantEffort"), res.ok ? res.outcome.noteKeys : res);
  // 70 kg × 33 × 1,2 = 2,772 + 60/30 × 0,35 = 0,7 → 3,47 L
  const hot = r("besoins-en-eau", { poids: "70", sport: "60", climat: "tresChaud" });
  ok("chaleur extrême + 1 h sport → 3,5 L", hot.ok && hot.outcome.value === "3,5" && hot.outcome.severity === "watch", hot.ok ? hot.outcome : hot);
  ok("note effort ajoutée", hot.ok && hot.outcome.noteKeys!.includes("pendantEffort"), hot.ok ? hot.outcome.noteKeys : hot);
}

console.log("FRÉQUENCE CARDIAQUE");
{
  // FCmax Tanaka à 40 ans = 208 − 28 = 180 ; réserve = 180 − 60 = 120
  // zone cible 60–80 % → 60 + 72 = 132 à 60 + 96 = 156
  const res = r("frequence-cardiaque", { age: "40", fcRepos: "60" });
  ok("40 ans, repos 60 → cible 132–156", res.ok && res.outcome.value === "132 – 156 bpm", res.ok ? res.outcome.value : res);
  ok("FCmax 180 bpm", res.ok && res.outcome.details![0].value === "180 bpm", res.ok ? res.outcome.details![0] : res);
  ok("repos 60 → habituelle", res.ok && res.outcome.categoryKey === "habituelle" && !res.outcome.emergency, res.ok ? res.outcome : res);
  const tachy = r("frequence-cardiaque", { age: "40", fcRepos: "110" });
  ok("repos 110 → tachycardie + urgence", tachy.ok && tachy.outcome.categoryKey === "tachycardie" && tachy.outcome.emergency === true, tachy.ok ? tachy.outcome : tachy);
  // Garde-fou : au-delà de 100 bpm au repos, aucune zone d'effort ne doit être proposée.
  ok("tachycardie → aucune zone affichée", tachy.ok && tachy.outcome.details!.length === 1 && tachy.outcome.value === "110", tachy.ok ? tachy.outcome : tachy);
  ok("tachycardie → invite à refaire la mesure", tachy.ok && tachy.outcome.noteKeys!.includes("mesureRepos"), tachy.ok ? tachy.outcome.noteKeys : tachy);
  const extreme = r("frequence-cardiaque", { age: "100", fcRepos: "140" });
  ok("repos 140 à 100 ans → pas de zone absurde", extreme.ok && extreme.outcome.categoryKey === "tachycardie" && extreme.outcome.details!.length === 1, extreme.ok ? extreme.outcome : extreme);
  const brady = r("frequence-cardiaque", { age: "30", fcRepos: "45" });
  ok("repos 45 → basse/watch", brady.ok && brady.outcome.categoryKey === "basse" && brady.outcome.severity === "watch", brady.ok ? brady.outcome : brady);
  ok("note bêtabloquants systématique", res.ok && res.outcome.noteKeys!.includes("betaBloquants"), res.ok ? res.outcome.noteKeys : res);
}

console.log("CALORIES");
{
  // Mifflin femme 30a 60kg 165cm = 10*60+6.25*165-5*30-161 = 600+1031,25-150-161 = 1320,25 ; ×1,2 = 1584,3 → 1580
  const res = r("calcul-calories", { sexe: "femme", age: "30", poids: "60", taille: "165", activite: "sedentaire" });
  ok("MB 1320 → TDEE 1580", res.ok && res.outcome.value === "1 580" && res.outcome.details![0].value === "1 320 kcal", res.ok ? res.outcome : res);
  // Plancher : petite femme peu active, déficit sous 1200
  const p = r("calcul-calories", { sexe: "femme", age: "60", poids: "50", taille: "150", activite: "sedentaire" });
  ok("plancher déclenché", p.ok && p.outcome.noteKeys!.includes("plancher"), p.ok ? p.outcome.noteKeys : p);
}

console.log("DATE ACCOUCHEMENT");
{
  const res = r("date-accouchement", { ddr: "2026-03-01", cycle: "28" });
  ok("DDR 01/03 → DPA 06/12/2026", res.ok && /6 décembre 2026/.test(res.outcome.details![0].value), res.ok ? res.outcome.details : res);
  const c32 = r("date-accouchement", { ddr: "2026-03-01", cycle: "32" });
  ok("cycle 32 → +4 jours", c32.ok && /10 décembre 2026/.test(c32.outcome.details![0].value), c32.ok ? c32.outcome.details![0] : c32);
  const f = r("date-accouchement", { ddr: "2030-01-01", cycle: "28" });
  ok("date future → futureDate", !f.ok && f.errors.ddr === "futureDate", f);
  const old = r("date-accouchement", { ddr: "2020-01-01", cycle: "28" });
  ok("date trop ancienne → tooOld", !old.ok && old.errors.ddr === "tooOld", old);
  const bad = r("date-accouchement", { ddr: "2026-02-31", cycle: "28" });
  ok("31 février → range", !bad.ok && bad.errors.ddr === "range", bad);
}

console.log("SEMAINES DE GROSSESSE");
{
  // 20 SA → 18 semaines de grossesse → 5e mois (18 / 4,345 = 4,14 → arrondi sup.)
  const res = r("semaines-grossesse", { sa: "20" });
  ok("20 SA → 5e mois", res.ok && res.outcome.value === "5", res.ok ? res.outcome.value : res);
  ok("20 SA → 18 semaines de grossesse", res.ok && res.outcome.details![1].value === "18", res.ok ? res.outcome.details : res);
  ok("20 SA → 20 semaines restantes avant 40 SA", res.ok && res.outcome.details![3].value === "20", res.ok ? res.outcome.details : res);
  ok("20 SA → 2e trimestre", res.ok && res.outcome.categoryKey === "t2", res.ok ? res.outcome.categoryKey : res);
  const t1 = r("semaines-grossesse", { sa: "12" });
  ok("12 SA → 10 semaines de grossesse, T1", t1.ok && t1.outcome.details![1].value === "10" && t1.outcome.categoryKey === "t1", t1.ok ? t1.outcome : t1);
  const terme = r("semaines-grossesse", { sa: "39" });
  ok("39 SA → à terme, 9e mois", terme.ok && terme.outcome.categoryKey === "terme" && terme.outcome.value === "9", terme.ok ? terme.outcome : terme);
  const debut = r("semaines-grossesse", { sa: "2" });
  ok("2 SA → 1er mois (plancher)", debut.ok && debut.outcome.value === "1", debut.ok ? debut.outcome.value : debut);
  const hors = r("semaines-grossesse", { sa: "50" });
  ok("50 SA → hors bornes", !hors.ok && hors.errors.sa === "range", hors);
  ok("note sur les deux comptages", res.ok && res.outcome.noteKeys!.includes("deuxComptages"), res.ok ? res.outcome.noteKeys : res);
}

console.log("OVULATION");
{
  const res = r("ovulation", { ddr: "2026-07-01", cycle: "28", luteale: "14" });
  ok("ovulation 15/07", res.ok && /15 juillet/.test(res.outcome.details![0].value), res.ok ? res.outcome.details : res);
  ok("fenêtre 10–16 juillet", res.ok && res.outcome.value === "10 juillet – 16 juillet", res.ok ? res.outcome.value : res);
  ok("prochaines règles 29/07", res.ok && /29 juillet/.test(res.outcome.details![1].value), res.ok ? res.outcome.details![1] : res);
  const long = r("ovulation", { ddr: "2026-07-01", cycle: "40", luteale: "14" });
  ok("cycle 40 → long/watch", long.ok && long.outcome.categoryKey === "long" && long.outcome.severity === "watch", long);
}

console.log("CALENDRIER VACCINAL");
{
  // Naissance le 01/03/2026 → jalons calés sur le document officiel
  const res = r("calendrier-vaccinal", { naissance: "2026-03-01" });
  ok("9 jalons rendus", res.ok && res.outcome.rows!.length === 9, res.ok ? res.outcome.rows?.length : res);
  ok("colonnes déclarées", res.ok && res.outcome.columns!.join(",") === "jalon,vaccins", res.ok ? res.outcome.columns : res);
  // 2 mois = 61 j après le 01/03/2026 → 01/05/2026 ; contenu attendu : Pentavalent, VPO, Pneumo, Rotavirus
  const m2 = res.ok ? res.outcome.rows![2] : null;
  ok("jalon 2 mois daté au 1er mai 2026", !!m2 && /1 mai 2026/.test(m2.cells[0]), m2?.cells[0]);
  ok("2 mois : Pentavalent + VPO + Pneumo + Rotavirus", !!m2
    && m2.cells[1].includes("Pentavalent — Dose 1")
    && m2.cells[1].includes("VPO — Dose 1")
    && m2.cells[1].includes("Pneumo — Dose 1")
    && m2.cells[1].includes("Rotavirus — Dose 1"), m2?.cells[1]);
  // Fidélité au document : BCG et VPO dose 0 sont dans « durant le premier mois », pas à la naissance
  const naissance = res.ok ? res.outcome.rows![0] : null;
  const premierMois = res.ok ? res.outcome.rows![1] : null;
  ok("naissance : uniquement HB dans les 24 h", !!naissance && naissance.cells[1].includes("HB") && !naissance.cells[1].includes("BCG"), naissance?.cells[1]);
  ok("premier mois : BCG + VPO dose 0 (fidèle au tableau)", !!premierMois
    && premierMois.cells[1].includes("BCG — Dose 1")
    && premierMois.cells[1].includes("VPO — Dose 0"), premierMois?.cells[1]);
  // 9 mois : RR dose 1 seulement ; 12 mois : pneumo dose 3 seulement
  const m9 = res.ok ? res.outcome.rows![5] : null;
  const m12 = res.ok ? res.outcome.rows![6] : null;
  ok("9 mois : RR dose 1", !!m9 && m9.cells[1] === "RR — Dose 1", m9?.cells[1]);
  ok("12 mois : Pneumo dose 3", !!m12 && m12.cells[1] === "Pneumo — Dose 3", m12?.cells[1]);
  // 18 mois : VPO 4, RR 2, DTC rappel 1 · 5 ans : VPO 5, DTC rappel 2
  const m18 = res.ok ? res.outcome.rows![7] : null;
  const y5 = res.ok ? res.outcome.rows![8] : null;
  ok("18 mois : VPO 4 + RR 2 + DTC rappel 1", !!m18
    && m18.cells[1].includes("VPO — Dose 4") && m18.cells[1].includes("RR — Dose 2") && m18.cells[1].includes("DTC — Rappel 1"), m18?.cells[1]);
  ok("5 ans : VPO 5 + DTC rappel 2", !!y5
    && y5.cells[1].includes("VPO — Dose 5") && y5.cells[1].includes("DTC — Rappel 2"), y5?.cells[1]);
  // Un seul jalon mis en avant : le prochain à venir
  ok("exactement un jalon mis en avant", res.ok && res.outcome.rows!.filter((x) => x.emphasis).length === 1, res.ok ? res.outcome.rows?.filter((x) => x.emphasis).length : res);
  // Un jalon passé est « à vérifier sur le carnet » (watch), jamais « fait » :
  // l'outil ne sait pas ce qui a été administré.
  const passes = res.ok ? res.outcome.rows!.filter((x) => x.severity === "watch") : [];
  const aVenir = res.ok ? res.outcome.rows!.filter((x) => x.severity === "good") : [];
  ok("jalons passés marqués « à vérifier », pas « fait »", passes.length > 0 && passes.every((x) => !x.emphasis), passes.length);
  ok("le jalon mis en avant est bien à venir", res.ok && aVenir.some((x) => x.emphasis), aVenir.length);
  ok("note carnet de santé présente", res.ok && res.outcome.noteKeys!.includes("carnetSante"), res.ok ? res.outcome.noteKeys : res);
  const futur = r("calendrier-vaccinal", { naissance: "2030-01-01" });
  ok("naissance future → futureDate", !futur.ok && futur.errors.naissance === "futureDate", futur);
  const vieux = r("calendrier-vaccinal", { naissance: "1990-01-01" });
  ok("date trop ancienne → tooOld", !vieux.ok && vieux.errors.naissance === "tooOld", vieux);
}

console.log("DOSE DE PARACÉTAMOL — garde-fous");
{
  // 12 kg, 24 mois, sirop à 24 mg/mL → 180 mg par prise = 7,5 mL
  const res = r("dose-paracetamol", { poids: "12", ageMois: "24", mgParMl: "24" });
  ok("12 kg → 7,5 mL par prise", res.ok && res.outcome.value === "7,5", res.ok ? res.outcome.value : res);
  ok("12 kg → 180 mg par prise", res.ok && res.outcome.details![0].value === "180 mg", res.ok ? res.outcome.details : res);
  ok("intervalle 6 h", res.ok && res.outcome.details![1].value === "6 h", res.ok ? res.outcome.details : res);
  ok("4 prises maximum", res.ok && res.outcome.details![2].value === "4", res.ok ? res.outcome.details : res);
  ok("plafond 720 mg / 24 h", res.ok && res.outcome.details![3].value === "720 mg", res.ok ? res.outcome.details : res);
  ok("mise en garde paracétamol caché", res.ok && res.outcome.noteKeys!.includes("paracetamolCache"), res.ok ? res.outcome.noteKeys : res);

  // GARDE-FOU 1 : refus avant 3 mois, aucune dose affichée
  const bebe = r("dose-paracetamol", { poids: "5", ageMois: "2", mgParMl: "24" });
  ok("moins de 3 mois → aucune dose", bebe.ok && bebe.outcome.value === "—" && bebe.outcome.details === undefined, bebe.ok ? bebe.outcome : bebe);
  ok("moins de 3 mois → alerte + urgence", bebe.ok && bebe.outcome.severity === "alert" && bebe.outcome.emergency === true, bebe.ok ? bebe.outcome : bebe);

  // GARDE-FOU 2 : poids/âge invraisemblables → calcul bloqué
  const typo = r("dose-paracetamol", { poids: "25", ageMois: "2", mgParMl: "24" });
  ok("25 kg à 2 mois → bloqué (faute de frappe)", !typo.ok && typo.errors.poids === "implausible", typo);
  const typo2 = r("dose-paracetamol", { poids: "4", ageMois: "48", mgParMl: "24" });
  ok("4 kg à 4 ans → bloqué", !typo2.ok && typo2.errors.poids === "implausible", typo2);

  // GARDE-FOU 3 : hors bornes (au-delà du domaine pédiatrique)
  const ado = r("dose-paracetamol", { poids: "60", ageMois: "170", mgParMl: "24" });
  ok("60 kg → hors bornes (posologie adulte)", !ado.ok && ado.errors.poids === "range", ado);

  // GARDE-FOU 4 : plafond adulte jamais franchi
  const grand = r("dose-paracetamol", { poids: "50", ageMois: "156", mgParMl: "24" });
  ok("50 kg → plafond 3 000 mg respecté", grand.ok && grand.outcome.details![3].value === "3 000 mg", grand.ok ? grand.outcome.details![3] : grand);
  ok("50 kg → 750 mg par prise", grand.ok && grand.outcome.details![0].value === "750 mg", grand.ok ? grand.outcome.details![0] : grand);

  // Concentration différente → volume différent, mg identiques
  const conc = r("dose-paracetamol", { poids: "12", ageMois: "24", mgParMl: "30" });
  ok("30 mg/mL → 6 mL pour la même dose", conc.ok && conc.outcome.value === "6,0" && conc.outcome.details![0].value === "180 mg", conc.ok ? conc.outcome : conc);
}

console.log("TENSION");
{
  const cases: [string, string, string, boolean][] = [
    ["118", "76", "optimale", false],
    ["125", "82", "normale", false],
    ["135", "86", "normaleHaute", false],
    ["135", "95", "grade1", false],
    ["165", "95", "grade2", false],
    ["185", "95", "grade3", true],
    ["90", "120", "coherence", false],
    ["85", "55", "hypotension", false],
  ];
  for (const [s, d, expect, emerg] of cases) {
    const res = r("tension-arterielle", { systolique: s, diastolique: d });
    if (expect === "coherence") ok(`${s}/${d} → incohérent`, !res.ok && res.errors.systolique === "coherence", res);
    else ok(`${s}/${d} → ${expect}${emerg ? " (urgence)" : ""}`, res.ok && res.outcome.categoryKey === expect && !!res.outcome.emergency === emerg, res.ok ? res.outcome.categoryKey : res);
  }
}

console.log("FINDRISC");
{
  // femme 50a (2) IMC 29,4 (1) tour 90 (>88 → 4) pas d'activité (2) pas de F&L (1)
  // ttt tension oui (2) glycémie non (0) parent 1er degré (5) = 17 → eleve
  const res = r("risque-diabete", {
    sexe: "femme", age: "50", poids: "80", taille: "165", tourTaille: "90",
    activite: "non", fruitsLegumes: "non", traitementTension: "oui",
    glycemieElevee: "non", antecedents: "premier",
  });
  ok("score 17 → eleve", res.ok && res.outcome.value === "17" && res.outcome.categoryKey === "eleve", res.ok ? res.outcome : res);
  // profil minimal : homme 30a IMC 22 tour 80 actif F&L oui, rien d'autre = 0 → faible
  const min = r("risque-diabete", {
    sexe: "homme", age: "30", poids: "70", taille: "180", tourTaille: "80",
    activite: "oui", fruitsLegumes: "oui", traitementTension: "non",
    glycemieElevee: "non", antecedents: "aucun",
  });
  ok("score 0 → faible", min.ok && min.outcome.value === "0" && min.outcome.categoryKey === "faible", min.ok ? min.outcome : min);
  // maximal : homme 70a (4) IMC>30 (3) tour 110 (4) non (2) non (1) oui (2) oui (5) premier (5) = 26
  const max = r("risque-diabete", {
    sexe: "homme", age: "70", poids: "120", taille: "170", tourTaille: "110",
    activite: "non", fruitsLegumes: "non", traitementTension: "oui",
    glycemieElevee: "oui", antecedents: "premier",
  });
  ok("score 26 → tresEleve", max.ok && max.outcome.value === "26" && max.outcome.categoryKey === "tresEleve", max.ok ? max.outcome : max);
}

console.log(fails === 0 ? "\nTOUS LES CONTRÔLES PASSENT" : `\n${fails} ÉCHEC(S)`);
process.exit(fails === 0 ? 0 : 1);
