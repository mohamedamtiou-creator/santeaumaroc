/**
 * Candidats de sources pour les termes du glossaire — À VÉRIFIER AVANT USAGE.
 *
 * Aucune URL de ce fichier n'est réputée valide : `scripts/verify-glossary-sources.ts`
 * les teste une par une (statut HTTP + présence d'un mot-clé attendu dans la page)
 * et n'en retient que celles qui répondent. Une source non vérifiée ne doit jamais
 * atteindre la base : un lien mort sur une page santé coûte plus que l'absence de
 * lien.
 *
 * Familles de sources retenues, toutes institutionnelles et francophones :
 *   · OMS — fiches d'information (convention déjà en place sur 10 termes) ;
 *   · Assurance Maladie (ameli.fr) — fiches grand public, très stables ;
 *   · Institut Pasteur — fiches maladies ;
 *   · Inserm — dossiers scientifiques ;
 *   · Manuel MSD, version grand public.
 */

export type SourceCandidate = {
  /** Slug du terme de glossaire. */
  slug: string;
  /** Mot-clé attendu dans la page cible, pour écarter les pages d'erreur. */
  expect: string;
  label: string;
  url: string;
  publisher: string;
};

const who = (slug: string, titre: string, detail: string, expect: string): SourceCandidate => ({
  slug,
  expect,
  label: `Organisation mondiale de la Santé — « ${titre} »`,
  url: `https://www.who.int/fr/news-room/fact-sheets/detail/${detail}`,
  publisher: "OMS",
});

const ameli = (slug: string, titre: string, theme: string, expect: string): SourceCandidate => ({
  slug,
  expect,
  label: `Assurance Maladie — « ${titre} »`,
  url: `https://www.ameli.fr/assure/sante/themes/${theme}`,
  publisher: "ameli.fr",
});

const pasteur = (slug: string, titre: string, fiche: string, expect: string): SourceCandidate => ({
  slug,
  expect,
  label: `Institut Pasteur — fiche « ${titre} »`,
  url: `https://www.pasteur.fr/fr/centre-medical/fiches-maladies/${fiche}`,
  publisher: "Institut Pasteur",
});

const inserm = (slug: string, titre: string, dossier: string, expect: string): SourceCandidate => ({
  slug,
  expect,
  label: `Inserm — dossier « ${titre} »`,
  url: `https://www.inserm.fr/dossier/${dossier}/`,
  publisher: "Inserm",
});

/** Page ameli.fr hors section « themes » (examens, médicaments, prévention). */
const ameliPath = (slug: string, titre: string, path: string, expect: string): SourceCandidate => ({
  slug,
  expect,
  label: `Assurance Maladie — « ${titre} »`,
  url: `https://www.ameli.fr${path}`,
  publisher: "ameli.fr",
});

/** Manuel MSD, version grand public — chemins relevés sur les index réels. */
const msd = (slug: string, titre: string, path: string, expect: string): SourceCandidate => ({
  slug,
  expect,
  label: `Manuel MSD, version grand public — « ${titre} »`,
  // Les chemins MSD contiennent des accents : on encode pour une URL valide.
  url: `https://www.msdmanuals.com${path.split("/").map(encodeURIComponent).join("/")}`,
  publisher: "Manuel MSD",
});

export const SOURCE_CANDIDATES: SourceCandidate[] = [
  // ══ Vague 3 : Manuel MSD (grand public) et CNSS, pour les termes qu'aucune
  // source de l'Assurance Maladie ne couvrait. Chemins MSD relevés sur les index
  // de sections, pas devinés. ═════════════════════════════════════════════════

  msd("reflux-gastro-oesophagien", "Reflux gastro-œsophagien (RGO)",
    "/fr/accueil/troubles-digestifs/maladies-de-l-œsophage-et-de-la-déglutition/reflux-gastro-œsophagien-rgo", "reflux"),
  msd("hypoglycemie", "Hypoglycémie",
    "/fr/accueil/troubles-hormonaux-et-métaboliques/diabète-sucré-et-faible-taux-de-sucre-dans-le-sang-hypoglycémie/hypoglycémie", "hypoglycémie"),
  msd("fievre", "Fièvre chez les adultes",
    "/fr/accueil/infections/biologie-des-maladies-infectieuses/fièvre-chez-les-adultes", "fièvre"),
  msd("ictere", "Jaunisse chez l'adulte",
    "/fr/accueil/troubles-du-foie-et-de-la-vésicule-biliaire/manifestations-cliniques-des-maladies-du-foie/jaunisse-chez-l-adulte", "jaunisse"),
  msd("poumons", "Présentation du système respiratoire",
    "/fr/accueil/troubles-pulmonaires-et-des-voies-aériennes/biologie-des-poumons-et-des-voies-respiratoires/présentation-du-système-respiratoire", "poumon"),
  msd("radiographie", "Radiographies",
    "/fr/accueil/sujets-particuliers/examens-d-imagerie-courants/radiographies", "radiographie"),
  msd("chimiotherapie", "Chimiothérapie et autres traitements systémiques du cancer",
    "/fr/accueil/cancer/prévention-et-traitement-du-cancer/chimiothérapie-et-autres-traitements-systémiques-du-cancer", "chimiothérapie"),
  msd("radiotherapie", "Radiothérapie pour le cancer",
    "/fr/accueil/cancer/prévention-et-traitement-du-cancer/radiothérapie-pour-le-cancer", "radiothérapie"),
  msd("antidepresseur", "Médicaments pour le traitement de la dépression",
    "/fr/accueil/troubles-mentaux/troubles-de-l-humeur/médicaments-pour-le-traitement-de-la-dépression", "antidépresseur"),
  msd("insuline", "Traitement médicamenteux du diabète",
    "/fr/accueil/troubles-hormonaux-et-métaboliques/diabète-sucré-et-faible-taux-de-sucre-dans-le-sang-hypoglycémie/traitement-médicamenteux-du-diabète", "insuline"),
  msd("kinesitherapie", "Kinésithérapie du thorax",
    "/fr/accueil/troubles-pulmonaires-et-des-voies-aériennes/rééducation-pour-les-troubles-des-poumons-et-des-voies-respiratoires/kinésithérapie-du-thorax", "kinésithérapie"),
  msd("biopsie", "Principes du traitement du cancer",
    "/fr/accueil/cancer/prévention-et-traitement-du-cancer/principes-du-traitement-du-cancer", "biopsie"),
  // Pistes à confirmer par le vérificateur — chemins non relevés, donc incertains.
  msd("anesthesie", "Anesthésie", "/fr/accueil/sujets-particuliers/chirurgie/anesthésie", "anesthésie"),
  msd("corticoide", "Corticoïdes", "/fr/accueil/médicaments/effets-indésirables-des-médicaments", "corticoïde"),
  msd("effet-secondaire", "Effets indésirables des médicaments",
    "/fr/accueil/médicaments/effets-indésirables-des-médicaments", "indésirable"),
  ameliPath("teleconsultation", "La télémédecine", "/assure/remboursements/rembourse/telemedecine", "téléconsultation"),
  ameliPath("teleconsultation", "Consulter à distance", "/assure/sante/assurance-maladie/teleconsultation", "téléconsultation"),

  // VIDAL — classifications de référence. Ce sont des listes de classe
  // thérapeutique, pas des pages explicatives : le libellé le dit, pour ne pas
  // faire passer une nomenclature pour un article de vulgarisation.
  {
    slug: "corticoide",
    expect: "corticoïdes",
    label: "VIDAL — classification « Corticoïdes par voie orale »",
    url: "https://www.vidal.fr/classifications/vidal/c:1121/n:Cortico%C3%AFdes%20par%20voie%20orale",
    publisher: "VIDAL",
  },
  {
    slug: "anesthesie",
    expect: "anesth",
    label: "VIDAL — classification « Anesthésie - Réanimation »",
    url: "https://www.vidal.fr/classifications/vidal/c:28/n:Anesth%C3%A9sie%20-%20R%C3%A9animation",
    publisher: "VIDAL",
  },
  // Biopsie — pistes à confirmer, aucune page dédiée relevée jusqu'ici.
  msd("biopsie", "Dépistage et diagnostic du cancer",
    "/fr/accueil/cancer/diagnostic-du-cancer/dépistage-et-diagnostic-du-cancer", "biopsie"),
  msd("biopsie", "Tests médicaux fréquents",
    "/fr/accueil/ressources/tests-médicaux-fréquents/tests-médicaux-fréquents", "biopsie"),

  // L'AMO est un dispositif marocain : la seule source légitime est la CNSS.
  {
    slug: "amo",
    expect: "assurance maladie obligatoire",
    label: "Caisse Nationale de Sécurité Sociale — « AMO, Assurance Maladie Obligatoire »",
    url: "https://www.cnss.ma/fr/content/amo-assurance-maladie-obligatoire",
    publisher: "CNSS Maroc",
  },

  // ══ Vague 2 : slugs relevés sur les index réels d'ameli.fr (A–Z des thèmes,
  // sections examens et médicaments), et non plus devinés. ═══════════════════

  // Maladies et symptômes
  ameli("arthrose", "Arthrose du genou", "arthrose-genou", "arthrose"),
  ameli("bronchite", "Bronchite", "bronchite", "bronchite"),
  ameli("eczema", "Eczéma ou dermatite atopique", "eczema-dermatite-atopique", "eczéma"),
  ameli("gastro-enterite", "Gastro-entérite de l'adulte", "gastro-enterite-adulte", "gastro-entérite"),
  ameli("hernie-discale", "Lombalgie aiguë", "lombalgie-aigue", "lombalgie"),
  ameli("sciatique", "Sciatique", "sciatique", "sciatique"),
  ameli("varices", "Varices des jambes", "varices-jambes", "varice"),
  ameli("cephalee", "Mal de tête", "mal-tete", "tête"),
  ameli("dyspnee", "Dyspnée chronique ou essoufflement durable", "dyspnee-chronique-ou-essoufflement-durable", "essoufflement"),
  ameli("palpitations", "Palpitations cardiaques", "palpitations-cardiaques", "palpitation"),
  ameli("tachycardie", "Trouble du rythme cardiaque", "trouble-rythme-cardiaque", "rythme"),
  ameli("anemie", "Anémie par carence en fer", "anemie-par-carence-en-fer", "anémie"),

  // Anatomie — la page d'organe n'existe pas ; on cite la pathologie de référence
  // de cet organe, avec un libellé qui le dit explicitement.
  ameli("prostate", "Adénome de la prostate", "adenome-prostate", "prostate"),
  ameli("rein", "Maladie rénale chronique", "maladie-renale-chronique", "rein"),
  ameli("foie", "Stéatose hépatique", "steatose-hepatique", "foie"),
  ameli("poumons", "BPCO et bronchite chronique", "bpco-bronchite-chronique", "poumon"),
  ameli("coeur", "Insuffisance cardiaque", "insuffisance-cardiaque", "cœur"),
  ameli("artere", "Artériopathie oblitérante des membres inférieurs", "arteriopathie-obliterante-arterite-des-membres-inferieurs", "artère"),
  ameli("thyroide", "Nodule thyroïdien", "nodule-thyroidien", "thyroïde"),

  // Examens — section « examen », chemins relevés
  ameliPath("irm", "Comment se déroule une IRM ?", "/assure/sante/examen/imagerie-medicale/deroulement-irm", "IRM"),
  ameliPath("scanner", "Comment se déroule un scanner ?", "/assure/sante/examen/imagerie-medicale/deroulement-scanner", "scanner"),
  ameliPath("mammographie", "Comment se déroule une mammographie ?", "/assure/sante/examen/imagerie-medicale/deroulement-mammographie", "mammographie"),
  ameliPath("echographie", "Comment se déroule une échographie ?", "/assure/sante/examen/imagerie-medicale/deroulement-echographie-abdomino-pelvienne", "échographie"),
  ameliPath("radiographie", "Imagerie médicale", "/assure/sante/examen/imagerie-medicale", "radiologie"),
  ameliPath("coloscopie", "Comment se déroule une coloscopie ?", "/assure/sante/examen/exploration/deroulement-coloscopie", "coloscopie"),
  ameliPath("endoscopie", "Comment se déroule une endoscopie digestive haute ?", "/assure/sante/examen/exploration/deroulement-endoscopie-digestive-haute", "endoscopie"),
  ameliPath("epreuve-d-effort", "Comment se déroule un électrocardiogramme d'effort ?", "/assure/sante/examen/exploration/deroulement-electrocardiogramme-effort", "effort"),
  ameliPath("electrocardiogramme", "Électrocardiogramme d'effort : déroulement", "/assure/sante/examen/exploration/deroulement-electrocardiogramme-effort", "électrocardiogramme"),
  ameliPath("frottis", "Comment se déroule un frottis du col utérin ?", "/assure/sante/examen/gynecologie/deroulement-frottis-col-uterin", "frottis"),
  ameliPath("prise-de-sang", "Lire les résultats d'une prise de sang", "/assure/sante/examen/analyse/lire-resultats-prise-sang", "prise de sang"),
  ameliPath("glycemie", "Lire les résultats d'une prise de sang", "/assure/sante/examen/analyse/lire-resultats-prise-sang", "glycémie"),

  // Médicaments — section « medicaments », chemins relevés
  ameliPath("antibiotique", "Bien utiliser les antibiotiques", "/assure/sante/medicaments/utiliser-recycler-medicaments/bien-utiliser-les-antibiotiques", "antibiotique"),
  ameliPath("anti-inflammatoire", "Bien utiliser les anti-inflammatoires non stéroïdiens", "/assure/sante/medicaments/utiliser-recycler-medicaments/utiliser-anti-inflammatoires", "inflammatoire"),
  ameliPath("anticoagulant", "Anticoagulants : importance du suivi", "/assure/sante/medicaments/comprendre-les-differents-medicaments/anticoagulants", "anticoagulant"),
  ameliPath("effet-secondaire", "Le médicament : ce qu'il faut savoir", "/assure/sante/medicaments/comprendre-les-differents-medicaments/medicament", "indésirable"),
  ameliPath("ordonnance", "Lire une ordonnance de médicaments", "/assure/sante/medicaments/utiliser-recycler-medicaments/lire-ordonnance-medicaments", "ordonnance"),
  ameli("insuline", "Diabète de l'adulte", "diabete-adulte", "insuline"),

  // Cancérologie — Institut national du cancer (INCa)
  {
    slug: "chimiotherapie",
    expect: "chimiothérapie",
    label: "Institut national du cancer — « Les différents traitements du cancer »",
    url: "https://moyenspouragir.e-cancer.fr/html/soigner/les-differents-traitements.html",
    publisher: "INCa",
  },
  {
    slug: "radiotherapie",
    expect: "radiothérapie",
    label: "Institut national du cancer — « Les différents traitements du cancer »",
    url: "https://moyenspouragir.e-cancer.fr/html/soigner/les-differents-traitements.html",
    publisher: "INCa",
  },
  {
    slug: "biopsie",
    expect: "biopsie",
    label: "Institut national du cancer — « Les différents traitements du cancer »",
    url: "https://moyenspouragir.e-cancer.fr/html/soigner/les-differents-traitements.html",
    publisher: "INCa",
  },

  // Termes généraux
  ameliPath("depistage", "Prévention et dépistages", "/assure/sante/assurance-maladie/prevention-depistages", "dépistage"),
  ameliPath("teleconsultation", "La téléconsultation", "/assure/sante/assurance-maladie/teleconsultation", "téléconsultation"),

  // ══ Vague 1 : candidats initiaux, conservés — le vérificateur tranche. ═════
  // ── Maladies ────────────────────────────────────────────────────────────
  who("acne", "Acné", "acne", "acné"),
  ameli("acne", "Acné", "acne", "acné"),
  who("anemie", "Anémie", "anaemia", "anémie"),
  ameli("anemie", "Anémie par carence en fer", "anemie-carence-fer", "anémie"),
  who("arthrose", "Arthrose", "osteoarthritis", "arthrose"),
  ameli("arthrose", "Arthrose", "arthrose", "arthrose"),
  ameli("bronchite", "Bronchite aiguë", "bronchite-aigue", "bronchite"),
  who("cataracte", "Cécité et déficience visuelle", "blindness-and-visual-impairment", "cataracte"),
  ameli("cataracte", "Cataracte", "cataracte", "cataracte"),
  ameli("conjonctivite", "Conjonctivite", "conjonctivite", "conjonctivite"),
  ameli("cystite", "Cystite", "cystite", "cystite"),
  ameli("eczema", "Eczéma atopique", "dermatite-atopique-eczema", "eczéma"),
  inserm("eczema", "Dermatite atopique", "dermatite-atopique-eczema-atopique", "dermatite"),
  who("epilepsie", "Épilepsie", "epilepsy", "épilepsie"),
  inserm("epilepsie", "Épilepsie", "epilepsie", "épilepsie"),
  who("gastro-enterite", "Maladies diarrhéiques", "diarrhoeal-disease", "diarrhée"),
  ameli("gastro-enterite", "Gastro-entérite de l'adulte", "gastro-enterite-adulte", "gastro"),
  who("glaucome", "Cécité et déficience visuelle", "blindness-and-visual-impairment", "glaucome"),
  ameli("glaucome", "Glaucome", "glaucome", "glaucome"),
  ameli("goutte", "Goutte", "goutte", "goutte"),
  inserm("goutte", "Goutte", "goutte", "goutte"),
  who("hernie-discale", "Lombalgie", "low-back-pain", "lombalgie"),
  ameli("hernie-discale", "Lombalgie et hernie discale", "lombalgie-aigue-lumbago", "lombalgie"),
  ameli("hypothyroidie", "Hypothyroïdie", "hypothyroidie", "hypothyroïdie"),
  who("infarctus-du-myocarde", "Maladies cardiovasculaires", "cardiovascular-diseases-(cvds)", "cardiovasculaire"),
  ameli("infarctus-du-myocarde", "Infarctus du myocarde", "infarctus-myocarde", "infarctus"),
  who("insuffisance-cardiaque", "Maladies cardiovasculaires", "cardiovascular-diseases-(cvds)", "cardiovasculaire"),
  ameli("insuffisance-cardiaque", "Insuffisance cardiaque", "insuffisance-cardiaque", "insuffisance cardiaque"),
  who("migraine", "Céphalées", "headache-disorders", "migraine"),
  ameli("migraine", "Migraine", "migraine", "migraine"),
  ameli("osteoporose", "Ostéoporose", "osteoporose", "ostéoporose"),
  inserm("osteoporose", "Ostéoporose", "osteoporose", "ostéoporose"),
  ameli("pneumonie", "Pneumonie", "pneumonie", "pneumonie"),
  ameli("psoriasis", "Psoriasis", "psoriasis", "psoriasis"),
  inserm("psoriasis", "Psoriasis", "psoriasis", "psoriasis"),
  ameli("reflux-gastro-oesophagien", "Reflux gastro-œsophagien", "reflux-gastro-oesophagien-adulte", "reflux"),
  ameli("sciatique", "Sciatique", "sciatique-cruralgie", "sciatique"),
  ameli("varices", "Varices", "varices", "varices"),

  // ── Symptômes ───────────────────────────────────────────────────────────
  who("cephalee", "Céphalées", "headache-disorders", "céphalée"),
  ameli("cephalee", "Maux de tête", "mal-tete-cephalee", "tête"),
  ameli("dyspnee", "Essoufflement", "essoufflement", "essoufflement"),
  ameli("fievre", "Fièvre de l'adulte", "fievre-adulte", "fièvre"),
  ameli("hypoglycemie", "Hypoglycémie", "hypoglycemie", "hypoglycémie"),
  ameli("ictere", "Jaunisse", "jaunisse", "jaunisse"),
  ameli("oedeme", "Jambes gonflées", "jambes-lourdes", "jambes"),
  ameli("palpitations", "Palpitations", "palpitations", "palpitations"),
  ameli("tachycardie", "Troubles du rythme cardiaque", "troubles-rythme-cardiaque", "rythme"),
  ameli("vertige", "Vertiges", "vertiges", "vertige"),

  // ── Examens ─────────────────────────────────────────────────────────────
  ameli("biopsie", "Biopsie", "biopsie", "biopsie"),
  ameli("coloscopie", "Coloscopie", "coloscopie", "coloscopie"),
  ameli("echographie", "Échographie", "echographie", "échographie"),
  ameli("electrocardiogramme", "Électrocardiogramme", "electrocardiogramme", "électrocardiogramme"),
  ameli("endoscopie", "Endoscopie digestive", "endoscopie-digestive", "endoscopie"),
  ameli("epreuve-d-effort", "Épreuve d'effort", "epreuve-effort", "effort"),
  ameli("frottis", "Frottis cervico-utérin", "frottis-cervico-uterin", "frottis"),
  who("frottis", "Cancer du col de l'utérus", "cervical-cancer", "col de l'utérus"),
  ameli("glycemie", "Glycémie", "glycemie", "glycémie"),
  ameli("irm", "IRM", "irm", "IRM"),
  ameli("mammographie", "Mammographie", "mammographie", "mammographie"),
  ameli("prise-de-sang", "Analyses de sang", "analyses-sang", "sang"),
  ameli("radiographie", "Radiographie", "radiographie", "radiographie"),
  ameli("scanner", "Scanner", "scanner", "scanner"),

  // ── Traitements ─────────────────────────────────────────────────────────
  who("antibiotique", "Résistance aux antimicrobiens", "antimicrobial-resistance", "antibiotique"),
  ameli("antibiotique", "Antibiotiques", "antibiotiques", "antibiotique"),
  ameli("anti-inflammatoire", "Anti-inflammatoires non stéroïdiens", "anti-inflammatoires-non-steroidiens", "inflammatoire"),
  ameli("anticoagulant", "Traitement anticoagulant", "anticoagulants", "anticoagulant"),
  ameli("antidepresseur", "Antidépresseurs", "antidepresseurs", "antidépresseur"),
  ameli("antihistaminique", "Allergies et antihistaminiques", "allergies", "allergie"),
  ameli("antihypertenseur", "Traitement de l'hypertension artérielle", "hypertension-arterielle", "hypertension"),
  ameli("anesthesie", "Anesthésie", "anesthesie", "anesthésie"),
  ameli("chimiotherapie", "Chimiothérapie", "chimiotherapie", "chimiothérapie"),
  ameli("corticoide", "Corticoïdes", "corticoides", "corticoïde"),
  ameli("insuline", "Insuline et diabète", "diabete-traitement-insuline", "insuline"),
  ameli("kinesitherapie", "Kinésithérapie", "kinesitherapie", "kinésithérapie"),
  ameli("radiotherapie", "Radiothérapie", "radiotherapie", "radiothérapie"),
  who("vaccin", "Vaccins et immunisation", "vaccines-and-immunization-what-is-vaccination", "vaccin"),
  ameli("vaccin", "Vaccination", "vaccination", "vaccin"),

  // ── Anatomie ────────────────────────────────────────────────────────────
  ameli("artere", "Maladies des artères", "maladie-arterielle", "artère"),
  ameli("coeur", "Le cœur et la circulation", "maladie-coronaire", "cœur"),
  inserm("foie", "Maladies du foie", "hepatites-virales", "foie"),
  ameli("poumons", "Bronchopneumopathie chronique obstructive", "bronchopneumopathie-chronique-obstructive", "poumon"),
  ameli("prostate", "Hypertrophie bénigne de la prostate", "hypertrophie-benigne-prostate", "prostate"),
  ameli("rein", "Maladie rénale chronique", "insuffisance-renale-chronique", "rein"),
  ameli("thyroide", "Troubles de la thyroïde", "hypothyroidie", "thyroïde"),

  // ── Termes généraux ─────────────────────────────────────────────────────
  who("depistage", "Dépistage du cancer", "cancer", "dépistage"),
  ameli("depistage", "Les dépistages", "depistages-organises-cancers", "dépistage"),
  ameli("effet-secondaire", "Effets indésirables des médicaments", "medicaments-effets-indesirables", "indésirable"),
  who("imc", "Obésité et surpoids", "obesity-and-overweight", "indice de masse corporelle"),
  ameli("ordonnance", "L'ordonnance médicale", "ordonnance", "ordonnance"),
  ameli("teleconsultation", "La téléconsultation", "teleconsultation", "téléconsultation"),
];
