/**
 * Candidats « pages intention » (/quel-medecin-pour/[slug]) À VALIDER avant
 * rédaction. Chaque entrée deviendra un HealthTopic (SYMPTOM|DISEASE) adossé à
 * une spécialité, puis une page intention. Rien n'est rédigé ni publié tant que
 * cette liste n'est pas validée (cf. docs/seo/intent-pages-pipeline.md).
 *
 * Priorisation = rôle « groupes de spécialistes » + épidémiologie MAROC réelle :
 *  - NCDs dominants : diabète (~10-17 %), HTA (~29-33 %), cancers, cardiopathies,
 *    insuffisance rénale, rhumatismes (sources : STEPS 2017, RMSP, CESE).
 *  - Santé mentale massive : dépression 26,5 %, anxiété 9 % (enquête MS 2022).
 *  - Endémies locales : leishmaniose cutanée, tuberculose (~35k cas/an), hépatites.
 *  - Motifs de 1er recours : infections respiratoires/ORL, digestif, douleurs
 *    musculo-squelettiques, peau, dentaire, femme, enfant.
 *
 * tier : 1 = forte demande / prévalence — à faire en premier
 *        2 = fréquent
 *        3 = longue traîne (à confirmer par la demande réelle GSC avant rédaction)
 *
 * Les 33 slugs DÉJÀ live (23 symptômes + 10 maladies) sont volontairement absents.
 */
export type IntentCandidate = {
  slug: string;
  term: string; // libellé FR
  kind: "SYMPTOM" | "DISEASE";
  specialty: string; // slug de spécialité (doit exister en base)
  tier: 1 | 2 | 3;
  note?: string; // pertinence Maroc / précision de cadrage
};

export const INTENT_CANDIDATES: IntentCandidate[] = [
  // ── Médecine générale / symptômes généraux ─────────────────
  { slug: "perte-d-appetit", term: "Perte d'appétit", kind: "SYMPTOM", specialty: "medecine-generale", tier: 2 },
  { slug: "prise-de-poids-inexpliquee", term: "Prise de poids inexpliquée", kind: "SYMPTOM", specialty: "endocrinologie-et-maladies-metaboliques", tier: 2 },
  { slug: "malaise-et-perte-de-connaissance", term: "Malaise et perte de connaissance", kind: "SYMPTOM", specialty: "medecine-generale", tier: 2 },
  { slug: "transpiration-excessive", term: "Transpiration excessive", kind: "SYMPTOM", specialty: "medecine-generale", tier: 3 },
  { slug: "ganglions-gonfles", term: "Ganglions gonflés", kind: "SYMPTOM", specialty: "medecine-generale", tier: 2 },
  { slug: "frissons", term: "Frissons", kind: "SYMPTOM", specialty: "medecine-generale", tier: 3 },

  // ── Cardiologie ────────────────────────────────────────────
  { slug: "palpitations", term: "Palpitations", kind: "SYMPTOM", specialty: "cardiologie", tier: 1 },
  { slug: "hypotension", term: "Tension artérielle basse (hypotension)", kind: "SYMPTOM", specialty: "cardiologie", tier: 2 },
  { slug: "jambes-gonflees", term: "Jambes gonflées (œdèmes)", kind: "SYMPTOM", specialty: "cardiologie", tier: 2 },
  { slug: "hypercholesterolemie", term: "Cholestérol élevé", kind: "DISEASE", specialty: "cardiologie", tier: 1, note: "Facteur de risque NCD très recherché" },
  { slug: "insuffisance-cardiaque", term: "Insuffisance cardiaque", kind: "DISEASE", specialty: "cardiologie", tier: 2 },
  { slug: "infarctus-du-myocarde", term: "Infarctus du myocarde", kind: "DISEASE", specialty: "cardiologie", tier: 2 },
  { slug: "fibrillation-auriculaire", term: "Fibrillation auriculaire (arythmie)", kind: "DISEASE", specialty: "cardiologie", tier: 2 },

  // ── Angiologie ─────────────────────────────────────────────
  { slug: "varices", term: "Varices", kind: "DISEASE", specialty: "angiologie", tier: 2 },
  { slug: "jambes-lourdes", term: "Jambes lourdes", kind: "SYMPTOM", specialty: "angiologie", tier: 2 },
  { slug: "phlebite", term: "Phlébite (thrombose veineuse)", kind: "DISEASE", specialty: "angiologie", tier: 2 },

  // ── Pneumologie ────────────────────────────────────────────
  { slug: "bronchite", term: "Bronchite", kind: "DISEASE", specialty: "pneumo-phtisiologie", tier: 1 },
  { slug: "pneumonie", term: "Pneumonie", kind: "DISEASE", specialty: "pneumo-phtisiologie", tier: 2 },
  { slug: "bpco", term: "BPCO (bronchopneumopathie chronique)", kind: "DISEASE", specialty: "pneumo-phtisiologie", tier: 2 },
  { slug: "tuberculose", term: "Tuberculose", kind: "DISEASE", specialty: "pneumo-phtisiologie", tier: 1, note: "Endémique au Maroc (~35 000 cas/an)" },
  { slug: "crachats-de-sang", term: "Crachats de sang (hémoptysie)", kind: "SYMPTOM", specialty: "pneumo-phtisiologie", tier: 3 },

  // ── Pathologie du sommeil ──────────────────────────────────
  { slug: "apnee-du-sommeil", term: "Apnée du sommeil", kind: "DISEASE", specialty: "pathologie-du-sommeil-et-de-la-vigilance", tier: 2 },
  { slug: "ronflement", term: "Ronflement", kind: "SYMPTOM", specialty: "oto-rhino-laryngologie", tier: 2 },

  // ── Gastro-entérologie / hépatologie ───────────────────────
  { slug: "ballonnements", term: "Ballonnements", kind: "SYMPTOM", specialty: "gastro-enterologie", tier: 1 },
  { slug: "brulures-d-estomac", term: "Brûlures d'estomac", kind: "SYMPTOM", specialty: "gastro-enterologie", tier: 1 },
  { slug: "sang-dans-les-selles", term: "Sang dans les selles", kind: "SYMPTOM", specialty: "gastro-enterologie", tier: 2 },
  { slug: "jaunisse", term: "Jaunisse (ictère)", kind: "SYMPTOM", specialty: "gastro-enterologie", tier: 2 },
  { slug: "hemorroides", term: "Hémorroïdes", kind: "DISEASE", specialty: "gastro-enterologie", tier: 1 },
  { slug: "gastrite", term: "Gastrite", kind: "DISEASE", specialty: "gastro-enterologie", tier: 2 },
  { slug: "ulcere-gastrique", term: "Ulcère gastrique", kind: "DISEASE", specialty: "gastro-enterologie", tier: 2 },
  { slug: "syndrome-de-l-intestin-irritable", term: "Syndrome de l'intestin irritable", kind: "DISEASE", specialty: "gastro-enterologie", tier: 2 },
  { slug: "hepatite-virale", term: "Hépatite virale", kind: "DISEASE", specialty: "gastro-enterologie", tier: 1, note: "Hépatites B/C fréquentes au Maroc" },
  { slug: "calculs-biliaires", term: "Calculs biliaires", kind: "DISEASE", specialty: "gastro-enterologie", tier: 2 },
  { slug: "gastro-enterite", term: "Gastro-entérite", kind: "DISEASE", specialty: "gastro-enterologie", tier: 1 },

  // ── Endocrinologie / diabétologie ──────────────────────────
  { slug: "hyperthyroidie", term: "Hyperthyroïdie", kind: "DISEASE", specialty: "endocrinologie-et-maladies-metaboliques", tier: 2 },
  { slug: "nodule-thyroidien", term: "Nodule thyroïdien (goitre)", kind: "DISEASE", specialty: "endocrinologie-et-maladies-metaboliques", tier: 2 },
  { slug: "obesite", term: "Obésité", kind: "DISEASE", specialty: "endocrinologie-et-maladies-metaboliques", tier: 1, note: "Obésité féminine ~31 % (STEPS)" },

  // ── Neurologie ─────────────────────────────────────────────
  { slug: "avc", term: "Accident vasculaire cérébral (AVC)", kind: "DISEASE", specialty: "neurologie", tier: 1 },
  { slug: "epilepsie", term: "Épilepsie", kind: "DISEASE", specialty: "neurologie", tier: 2 },
  { slug: "maladie-de-parkinson", term: "Maladie de Parkinson", kind: "DISEASE", specialty: "neurologie", tier: 2 },
  { slug: "sclerose-en-plaques", term: "Sclérose en plaques", kind: "DISEASE", specialty: "neurologie", tier: 2 },
  { slug: "tremblements", term: "Tremblements", kind: "SYMPTOM", specialty: "neurologie", tier: 2 },
  { slug: "fourmillements", term: "Fourmillements et engourdissements", kind: "SYMPTOM", specialty: "neurologie", tier: 2 },
  { slug: "pertes-de-memoire", term: "Pertes de mémoire", kind: "SYMPTOM", specialty: "neurologie", tier: 2 },

  // ── Psychiatrie / psychologie / addictologie ───────────────
  { slug: "stress", term: "Stress", kind: "SYMPTOM", specialty: "psychologie", tier: 1, note: "Santé mentale = priorité forte au Maroc" },
  { slug: "crise-d-angoisse", term: "Crise d'angoisse (attaque de panique)", kind: "SYMPTOM", specialty: "psychiatrie", tier: 1 },
  { slug: "trouble-bipolaire", term: "Trouble bipolaire", kind: "DISEASE", specialty: "psychiatrie", tier: 2 },
  { slug: "schizophrenie", term: "Schizophrénie", kind: "DISEASE", specialty: "psychiatrie", tier: 2 },
  { slug: "trouble-obsessionnel-compulsif", term: "Trouble obsessionnel compulsif (TOC)", kind: "DISEASE", specialty: "psychiatrie", tier: 2 },
  { slug: "burn-out", term: "Burn-out (épuisement professionnel)", kind: "DISEASE", specialty: "psychologie", tier: 2 },
  { slug: "addiction", term: "Addiction (dépendance)", kind: "DISEASE", specialty: "addictologie-clinique", tier: 2 },

  // ── Dermatologie ───────────────────────────────────────────
  { slug: "acne", term: "Acné", kind: "DISEASE", specialty: "dermatologie", tier: 1 },
  { slug: "eczema", term: "Eczéma", kind: "DISEASE", specialty: "dermatologie", tier: 1 },
  { slug: "psoriasis", term: "Psoriasis", kind: "DISEASE", specialty: "dermatologie", tier: 1 },
  { slug: "mycose-cutanee", term: "Mycose cutanée", kind: "DISEASE", specialty: "dermatologie", tier: 2 },
  { slug: "verrues", term: "Verrues", kind: "DISEASE", specialty: "dermatologie", tier: 2 },
  { slug: "zona", term: "Zona", kind: "DISEASE", specialty: "dermatologie", tier: 2 },
  { slug: "urticaire", term: "Urticaire", kind: "DISEASE", specialty: "dermatologie", tier: 2 },
  { slug: "chute-de-cheveux", term: "Chute de cheveux", kind: "SYMPTOM", specialty: "dermatologie", tier: 1 },
  { slug: "taches-sur-la-peau", term: "Taches sur la peau", kind: "SYMPTOM", specialty: "dermatologie", tier: 2 },
  { slug: "vitiligo", term: "Vitiligo", kind: "DISEASE", specialty: "dermatologie", tier: 3 },

  // ── Maladies infectieuses (dont endémies MA) ───────────────
  { slug: "grippe", term: "Grippe", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 1 },
  { slug: "covid-19", term: "COVID-19", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 2 },
  { slug: "leishmaniose-cutanee", term: "Leishmaniose cutanée", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 2, note: "Endémique au Maroc (Rif→Anti-Atlas)" },
  { slug: "fievre-typhoide", term: "Fièvre typhoïde", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 3, note: "Présente au Maroc" },

  // ── Rhumatologie ───────────────────────────────────────────
  { slug: "sciatique", term: "Sciatique", kind: "SYMPTOM", specialty: "rhumatologie", tier: 1 },
  { slug: "polyarthrite-rhumatoide", term: "Polyarthrite rhumatoïde", kind: "DISEASE", specialty: "rhumatologie", tier: 2 },
  { slug: "goutte", term: "Goutte", kind: "DISEASE", specialty: "rhumatologie", tier: 2 },
  { slug: "osteoporose", term: "Ostéoporose", kind: "DISEASE", specialty: "rhumatologie", tier: 2 },
  { slug: "tendinite", term: "Tendinite", kind: "DISEASE", specialty: "rhumatologie", tier: 2 },
  { slug: "fibromyalgie", term: "Fibromyalgie", kind: "DISEASE", specialty: "rhumatologie", tier: 2 },

  // ── Traumatologie-orthopédie ───────────────────────────────
  { slug: "entorse", term: "Entorse", kind: "DISEASE", specialty: "traumatologie-orthopedie", tier: 2 },
  { slug: "hernie-discale", term: "Hernie discale", kind: "DISEASE", specialty: "traumatologie-orthopedie", tier: 2 },
  { slug: "syndrome-du-canal-carpien", term: "Syndrome du canal carpien", kind: "DISEASE", specialty: "traumatologie-orthopedie", tier: 2 },
  { slug: "douleur-a-l-epaule", term: "Douleur à l'épaule", kind: "SYMPTOM", specialty: "traumatologie-orthopedie", tier: 1 },
  { slug: "douleur-au-cou", term: "Douleur au cou (cervicalgie)", kind: "SYMPTOM", specialty: "traumatologie-orthopedie", tier: 2 },
  { slug: "douleur-a-la-hanche", term: "Douleur à la hanche", kind: "SYMPTOM", specialty: "traumatologie-orthopedie", tier: 2 },

  // ── ORL ────────────────────────────────────────────────────
  { slug: "otite", term: "Otite", kind: "DISEASE", specialty: "oto-rhino-laryngologie", tier: 1 },
  { slug: "sinusite", term: "Sinusite", kind: "DISEASE", specialty: "oto-rhino-laryngologie", tier: 1 },
  { slug: "angine", term: "Angine", kind: "DISEASE", specialty: "oto-rhino-laryngologie", tier: 1 },
  { slug: "rhinite-allergique", term: "Rhinite allergique", kind: "DISEASE", specialty: "allergologie", tier: 1 },
  { slug: "acouphenes", term: "Acouphènes (bourdonnements d'oreille)", kind: "SYMPTOM", specialty: "oto-rhino-laryngologie", tier: 2 },
  { slug: "perte-d-audition", term: "Perte d'audition", kind: "SYMPTOM", specialty: "oto-rhino-laryngologie", tier: 2 },

  // ── Ophtalmologie ──────────────────────────────────────────
  { slug: "conjonctivite", term: "Conjonctivite", kind: "DISEASE", specialty: "ophtalmologie", tier: 1 },
  { slug: "cataracte", term: "Cataracte", kind: "DISEASE", specialty: "ophtalmologie", tier: 1 },
  { slug: "glaucome", term: "Glaucome", kind: "DISEASE", specialty: "ophtalmologie", tier: 2 },
  { slug: "myopie", term: "Myopie", kind: "DISEASE", specialty: "ophtalmologie", tier: 2 },
  { slug: "yeux-secs", term: "Yeux secs (sécheresse oculaire)", kind: "SYMPTOM", specialty: "ophtalmologie", tier: 2 },
  { slug: "oeil-rouge", term: "Œil rouge", kind: "SYMPTOM", specialty: "ophtalmologie", tier: 2 },

  // ── Urologie / néphrologie / andrologie / sexologie ────────
  { slug: "infection-urinaire", term: "Infection urinaire", kind: "DISEASE", specialty: "urologie-et-chirurgie-urologique", tier: 1 },
  { slug: "calculs-renaux", term: "Calculs rénaux (lithiase urinaire)", kind: "DISEASE", specialty: "urologie-et-chirurgie-urologique", tier: 1 },
  { slug: "hypertrophie-de-la-prostate", term: "Hypertrophie de la prostate", kind: "DISEASE", specialty: "urologie-et-chirurgie-urologique", tier: 1 },
  { slug: "sang-dans-les-urines", term: "Sang dans les urines (hématurie)", kind: "SYMPTOM", specialty: "urologie-et-chirurgie-urologique", tier: 2 },
  { slug: "incontinence-urinaire", term: "Incontinence urinaire", kind: "SYMPTOM", specialty: "urologie-et-chirurgie-urologique", tier: 2 },
  { slug: "insuffisance-renale", term: "Insuffisance rénale", kind: "DISEASE", specialty: "nephrologie", tier: 1, note: "Forte charge au Maroc (dépenses NCD)" },
  { slug: "troubles-de-l-erection", term: "Troubles de l'érection", kind: "DISEASE", specialty: "andrologie", tier: 1 },
  { slug: "ejaculation-precoce", term: "Éjaculation précoce", kind: "DISEASE", specialty: "sexologie", tier: 2 },
  { slug: "infertilite-masculine", term: "Infertilité masculine", kind: "DISEASE", specialty: "andrologie", tier: 2 },

  // ── Gynéco-obstétrique / sage-femme ────────────────────────
  { slug: "regles-douloureuses", term: "Règles douloureuses", kind: "SYMPTOM", specialty: "gyneco-obstetrique", tier: 1 },
  { slug: "regles-irregulieres", term: "Règles irrégulières", kind: "SYMPTOM", specialty: "gyneco-obstetrique", tier: 1 },
  { slug: "absence-de-regles", term: "Absence de règles (aménorrhée)", kind: "SYMPTOM", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "pertes-vaginales", term: "Pertes vaginales anormales", kind: "SYMPTOM", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "mycose-vaginale", term: "Mycose vaginale", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 1 },
  { slug: "menopause", term: "Ménopause", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 1 },
  { slug: "syndrome-des-ovaires-polykystiques", term: "Syndrome des ovaires polykystiques (SOPK)", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 1 },
  { slug: "endometriose", term: "Endométriose", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "fibrome-uterin", term: "Fibrome utérin", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "kyste-ovarien", term: "Kyste ovarien", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "infertilite-feminine", term: "Infertilité féminine", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "douleur-au-sein", term: "Douleur au sein", kind: "SYMPTOM", specialty: "gyneco-obstetrique", tier: 2 },

  // ── Pédiatrie / néonatologie ───────────────────────────────
  { slug: "fievre-chez-l-enfant", term: "Fièvre chez l'enfant", kind: "SYMPTOM", specialty: "pediatrie", tier: 1 },
  { slug: "diarrhee-du-nourrisson", term: "Diarrhée du nourrisson", kind: "SYMPTOM", specialty: "pediatrie", tier: 2 },
  { slug: "toux-chez-l-enfant", term: "Toux chez l'enfant", kind: "SYMPTOM", specialty: "pediatrie", tier: 2 },
  { slug: "bronchiolite", term: "Bronchiolite", kind: "DISEASE", specialty: "pediatrie", tier: 2 },
  { slug: "coliques-du-nourrisson", term: "Coliques du nourrisson", kind: "SYMPTOM", specialty: "pediatrie", tier: 2 },
  { slug: "retard-de-croissance", term: "Retard de croissance", kind: "SYMPTOM", specialty: "pediatrie", tier: 2 },

  // ── Dentaire / stomatologie / parodontologie ───────────────
  { slug: "mal-de-dents", term: "Mal de dents (rage de dents)", kind: "SYMPTOM", specialty: "chirurgie-dentaire", tier: 1 },
  { slug: "carie-dentaire", term: "Carie dentaire", kind: "DISEASE", specialty: "chirurgie-dentaire", tier: 1 },
  { slug: "abces-dentaire", term: "Abcès dentaire", kind: "DISEASE", specialty: "chirurgie-dentaire", tier: 2 },
  { slug: "saignement-des-gencives", term: "Saignement des gencives", kind: "SYMPTOM", specialty: "parodontologie", tier: 2 },
  { slug: "gingivite", term: "Gingivite", kind: "DISEASE", specialty: "parodontologie", tier: 2 },
  { slug: "mauvaise-haleine", term: "Mauvaise haleine", kind: "SYMPTOM", specialty: "chirurgie-dentaire", tier: 2 },
  { slug: "aphtes", term: "Aphtes", kind: "DISEASE", specialty: "chirurgie-dentaire", tier: 2 },
  { slug: "dent-de-sagesse", term: "Douleur de dent de sagesse", kind: "SYMPTOM", specialty: "chirurgie-dentaire", tier: 2 },

  // ── Allergologie ───────────────────────────────────────────
  { slug: "allergie-alimentaire", term: "Allergie alimentaire", kind: "DISEASE", specialty: "allergologie", tier: 2 },

  // ── Oncologie (YMYL sensible — cadrage orientation/dépistage) ─
  { slug: "cancer-du-sein", term: "Cancer du sein", kind: "DISEASE", specialty: "oncologie-medicale", tier: 2, note: "YMYL sensible : cadrage dépistage/orientation, relecture stricte" },
  { slug: "cancer-de-la-prostate", term: "Cancer de la prostate", kind: "DISEASE", specialty: "oncologie-medicale", tier: 3, note: "YMYL sensible" },
  { slug: "cancer-colorectal", term: "Cancer colorectal", kind: "DISEASE", specialty: "oncologie-medicale", tier: 3, note: "YMYL sensible" },

  // ── Hématologie ────────────────────────────────────────────
  { slug: "troubles-de-la-coagulation", term: "Troubles de la coagulation", kind: "DISEASE", specialty: "hematologie", tier: 3 },

  // ═══════════════════════════════════════════════════════════
  // WAVE 2 — recherche complémentaire (sites FR : Qare, Livi, ameli ;
  // top motifs téléconsultation) + endémies/carences marocaines.
  // ═══════════════════════════════════════════════════════════

  // ── Infectieux / 1er recours (top téléconsult FR + endémies MA) ─
  { slug: "rhume", term: "Rhume", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 1 },
  { slug: "varicelle", term: "Varicelle", kind: "DISEASE", specialty: "pediatrie", tier: 2 },
  { slug: "intoxication-alimentaire", term: "Intoxication alimentaire", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 2 },
  { slug: "infections-sexuellement-transmissibles", term: "Infections sexuellement transmissibles (IST)", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 1 },
  { slug: "kyste-hydatique", term: "Kyste hydatique (hydatidose)", kind: "DISEASE", specialty: "chirurgie-digestive-viscerale", tier: 2, note: "Maroc hyperendémique (3e du Maghreb, foie 80 %)" },
  { slug: "brucellose", term: "Brucellose (fièvre de Malte)", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 2, note: "Zoonose MA (lait cru non pasteurisé)" },
  { slug: "rougeole", term: "Rougeole", kind: "DISEASE", specialty: "pediatrie", tier: 3 },
  { slug: "oreillons", term: "Oreillons", kind: "DISEASE", specialty: "pediatrie", tier: 3 },
  { slug: "diarrhee-du-voyageur", term: "Diarrhée du voyageur (tourista)", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 3 },
  { slug: "meningite", term: "Méningite", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 3, note: "YMYL sensible : cadrage urgence/orientation" },
  { slug: "carence-en-vitamine-d", term: "Carence en vitamine D", kind: "DISEASE", specialty: "endocrinologie-et-maladies-metaboliques", tier: 1, note: "Maroc 76-90 % d'insuffisance (paradoxe ensoleillement)" },
  { slug: "carence-en-fer", term: "Carence en fer", kind: "DISEASE", specialty: "medecine-generale", tier: 2 },

  // ── Dermatologie (compléments) ─────────────────────────────
  { slug: "gale", term: "Gale", kind: "DISEASE", specialty: "dermatologie", tier: 2 },
  { slug: "herpes", term: "Herpès", kind: "DISEASE", specialty: "dermatologie", tier: 2 },
  { slug: "ongle-incarne", term: "Ongle incarné", kind: "DISEASE", specialty: "dermatologie", tier: 3 },
  { slug: "cancer-de-la-peau", term: "Cancer de la peau (mélanome)", kind: "DISEASE", specialty: "dermatologie", tier: 3, note: "YMYL sensible : cadrage dépistage/orientation" },

  // ── Santé mentale (compléments FR) ─────────────────────────
  { slug: "troubles-du-comportement-alimentaire", term: "Troubles du comportement alimentaire", kind: "DISEASE", specialty: "psychiatrie", tier: 2 },
  { slug: "autisme", term: "Autisme (TSA)", kind: "DISEASE", specialty: "psychiatrie", tier: 2 },
  { slug: "tdah", term: "TDAH (trouble de l'attention)", kind: "DISEASE", specialty: "pediatrie", tier: 2 },
  { slug: "arret-du-tabac", term: "Arrêt du tabac (sevrage tabagique)", kind: "SYMPTOM", specialty: "tabacologie", tier: 2 },
  { slug: "phobie-sociale", term: "Phobie sociale", kind: "DISEASE", specialty: "psychiatrie", tier: 3 },
  { slug: "narcolepsie", term: "Narcolepsie", kind: "DISEASE", specialty: "pathologie-du-sommeil-et-de-la-vigilance", tier: 3 },
  { slug: "vaginisme", term: "Vaginisme", kind: "DISEASE", specialty: "sexologie", tier: 3 },

  // ── Gynéco-obstétrique (compléments) ───────────────────────
  { slug: "syndrome-premenstruel", term: "Syndrome prémenstruel", kind: "SYMPTOM", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "contraception", term: "Contraception (consultation)", kind: "SYMPTOM", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "diabete-gestationnel", term: "Diabète gestationnel", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "vaginose-bacterienne", term: "Vaginose bactérienne", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 3 },

  // ── Ophtalmologie (compléments) ────────────────────────────
  { slug: "presbytie", term: "Presbytie", kind: "DISEASE", specialty: "ophtalmologie", tier: 2 },
  { slug: "astigmatisme", term: "Astigmatisme", kind: "DISEASE", specialty: "ophtalmologie", tier: 2 },
  { slug: "strabisme", term: "Strabisme", kind: "DISEASE", specialty: "ophtalmologie", tier: 2 },
  { slug: "retinopathie-diabetique", term: "Rétinopathie diabétique", kind: "DISEASE", specialty: "ophtalmologie", tier: 2, note: "Complication du diabète, très prévalent au Maroc" },
  { slug: "orgelet", term: "Orgelet", kind: "DISEASE", specialty: "ophtalmologie", tier: 3 },
  { slug: "dmla", term: "Dégénérescence maculaire (DMLA)", kind: "DISEASE", specialty: "ophtalmologie", tier: 3 },

  // ── ORL / phoniatrie (compléments) ─────────────────────────
  { slug: "laryngite", term: "Laryngite", kind: "DISEASE", specialty: "oto-rhino-laryngologie", tier: 2 },
  { slug: "nez-bouche", term: "Nez bouché", kind: "SYMPTOM", specialty: "oto-rhino-laryngologie", tier: 3 },
  { slug: "extinction-de-voix", term: "Extinction de voix", kind: "SYMPTOM", specialty: "phoniatrie", tier: 3 },
  { slug: "maladie-de-meniere", term: "Maladie de Ménière", kind: "DISEASE", specialty: "oto-rhino-laryngologie", tier: 3 },

  // ── Gastro-entérologie (compléments) ───────────────────────
  { slug: "intolerance-au-lactose", term: "Intolérance au lactose", kind: "DISEASE", specialty: "gastro-enterologie", tier: 2 },
  { slug: "steatose-hepatique", term: "Stéatose hépatique (foie gras)", kind: "DISEASE", specialty: "gastro-enterologie", tier: 2 },
  { slug: "flatulences", term: "Flatulences", kind: "SYMPTOM", specialty: "gastro-enterologie", tier: 3 },
  { slug: "maladie-de-crohn", term: "Maladie de Crohn", kind: "DISEASE", specialty: "gastro-enterologie", tier: 3 },
  { slug: "oxyurose", term: "Oxyurose (vers intestinaux)", kind: "DISEASE", specialty: "pediatrie", tier: 3 },
  { slug: "diverticulite", term: "Diverticulite", kind: "DISEASE", specialty: "gastro-enterologie", tier: 3 },

  // ── Neurologie / cardiologie (compléments) ─────────────────
  { slug: "paralysie-faciale", term: "Paralysie faciale", kind: "SYMPTOM", specialty: "neurologie", tier: 2 },
  { slug: "syndrome-des-jambes-sans-repos", term: "Syndrome des jambes sans repos", kind: "DISEASE", specialty: "neurologie", tier: 3 },
  { slug: "angine-de-poitrine", term: "Angine de poitrine (angor)", kind: "DISEASE", specialty: "cardiologie", tier: 2 },

  // ── Urologie / rhumato-ortho / dentaire (compléments) ──────
  { slug: "colique-nephretique", term: "Colique néphrétique", kind: "SYMPTOM", specialty: "urologie-et-chirurgie-urologique", tier: 2 },
  { slug: "prostatite", term: "Prostatite", kind: "DISEASE", specialty: "urologie-et-chirurgie-urologique", tier: 3 },
  { slug: "bursite", term: "Bursite", kind: "DISEASE", specialty: "rhumatologie", tier: 3 },
  { slug: "hallux-valgus", term: "Hallux valgus (oignon)", kind: "DISEASE", specialty: "traumatologie-orthopedie", tier: 3 },
  { slug: "enuresie", term: "Énurésie (pipi au lit)", kind: "SYMPTOM", specialty: "pediatrie", tier: 2 },
  { slug: "bruxisme", term: "Bruxisme (grincement de dents)", kind: "DISEASE", specialty: "chirurgie-dentaire", tier: 3 },
  { slug: "dents-mal-alignees", term: "Dents mal alignées", kind: "SYMPTOM", specialty: "orthodontie", tier: 3 },

  // ═══════════════════════════════════════════════════════════
  // WAVE 3 — dico médical FR (VIDAL, Elsan, hopital.fr) + travel-health MA.
  // Majorité longue traîne (T3) → confirmer par GSC avant rédaction.
  // ═══════════════════════════════════════════════════════════
  { slug: "erysipele", term: "Érysipèle", kind: "DISEASE", specialty: "dermatologie", tier: 3 },
  { slug: "coup-de-soleil", term: "Coup de soleil", kind: "DISEASE", specialty: "dermatologie", tier: 3 },
  { slug: "pied-d-athlete", term: "Pied d'athlète (mycose des pieds)", kind: "DISEASE", specialty: "dermatologie", tier: 3 },
  { slug: "coup-de-chaleur", term: "Coup de chaleur", kind: "SYMPTOM", specialty: "medecine-generale", tier: 3 },
  { slug: "crampes-musculaires", term: "Crampes musculaires", kind: "SYMPTOM", specialty: "medecine-generale", tier: 3 },
  { slug: "mal-des-transports", term: "Mal des transports", kind: "DISEASE", specialty: "medecine-generale", tier: 3 },
  { slug: "coqueluche", term: "Coqueluche", kind: "DISEASE", specialty: "pediatrie", tier: 3 },
  { slug: "roseole", term: "Roséole", kind: "DISEASE", specialty: "pediatrie", tier: 3 },
  { slug: "rubeole", term: "Rubéole", kind: "DISEASE", specialty: "pediatrie", tier: 3 },
  { slug: "mononucleose", term: "Mononucléose", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 3 },
  { slug: "toxoplasmose", term: "Toxoplasmose", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 3, note: "Cadrage grossesse (dépistage)" },
  { slug: "hepatite-a", term: "Hépatite A", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 3, note: "Transmission féco-orale, présente au Maroc" },
  { slug: "rage", term: "Rage (morsure animale)", kind: "DISEASE", specialty: "maladies-infectieuses", tier: 3, note: "Morsures de chien = motif d'urgence au Maroc" },
  { slug: "drepanocytose", term: "Drépanocytose", kind: "DISEASE", specialty: "hematologie", tier: 3 },
  { slug: "lupus", term: "Lupus", kind: "DISEASE", specialty: "medecine-interne", tier: 3 },
  { slug: "phimosis", term: "Phimosis", kind: "DISEASE", specialty: "urologie-et-chirurgie-urologique", tier: 3 },
  { slug: "proteinurie", term: "Protéinurie (protéines dans les urines)", kind: "SYMPTOM", specialty: "nephrologie", tier: 3 },
  { slug: "kyste-pilonidal", term: "Kyste pilonidal", kind: "DISEASE", specialty: "chirurgie-generale", tier: 3 },

  // ═══════════════════════════════════════════════════════════
  // WAVE 4 — dico médical EN (NHS Health A-Z) + top motifs primary care
  // (Mayo/Cleveland/WebMD). Sélection des affections courantes & recherchées,
  // hors syndromes rares. Noms/slugs FR. Beaucoup en T3 → confirmer GSC.
  // ═══════════════════════════════════════════════════════════
  { slug: "maladie-d-alzheimer", term: "Maladie d'Alzheimer", kind: "DISEASE", specialty: "neurologie", tier: 2, note: "Forte recherche, population vieillissante" },
  { slug: "demence", term: "Démence", kind: "DISEASE", specialty: "geriatrie", tier: 3 },
  { slug: "appendicite", term: "Appendicite", kind: "DISEASE", specialty: "chirurgie-generale", tier: 2 },
  { slug: "hernie-inguinale", term: "Hernie inguinale", kind: "DISEASE", specialty: "chirurgie-generale", tier: 2 },
  { slug: "hernie-hiatale", term: "Hernie hiatale", kind: "DISEASE", specialty: "gastro-enterologie", tier: 3 },
  { slug: "rectocolite-hemorragique", term: "Rectocolite hémorragique", kind: "DISEASE", specialty: "gastro-enterologie", tier: 3 },
  { slug: "pancreatite", term: "Pancréatite", kind: "DISEASE", specialty: "gastro-enterologie", tier: 3 },
  { slug: "maladie-coeliaque", term: "Maladie cœliaque", kind: "DISEASE", specialty: "gastro-enterologie", tier: 3 },
  { slug: "cirrhose", term: "Cirrhose du foie", kind: "DISEASE", specialty: "gastro-enterologie", tier: 3 },
  { slug: "syndrome-de-fatigue-chronique", term: "Syndrome de fatigue chronique", kind: "DISEASE", specialty: "medecine-interne", tier: 3 },
  { slug: "embolie-pulmonaire", term: "Embolie pulmonaire", kind: "DISEASE", specialty: "pneumo-phtisiologie", tier: 3, note: "YMYL sensible : cadrage urgence" },
  { slug: "rosacee", term: "Rosacée", kind: "DISEASE", specialty: "dermatologie", tier: 3 },
  { slug: "impetigo", term: "Impétigo", kind: "DISEASE", specialty: "dermatologie", tier: 3 },
  { slug: "teigne", term: "Teigne (dermatophytose)", kind: "DISEASE", specialty: "dermatologie", tier: 3 },
  { slug: "condylomes", term: "Condylomes (verrues génitales, HPV)", kind: "DISEASE", specialty: "dermatologie", tier: 3 },
  { slug: "fasciite-plantaire", term: "Fasciite plantaire (épine calcanéenne)", kind: "DISEASE", specialty: "rhumatologie", tier: 3 },
  { slug: "tennis-elbow", term: "Épicondylite (tennis elbow)", kind: "DISEASE", specialty: "traumatologie-orthopedie", tier: 3 },
  { slug: "nevralgie-du-trijumeau", term: "Névralgie du trijumeau", kind: "DISEASE", specialty: "neurologie", tier: 3 },
  { slug: "etat-de-stress-post-traumatique", term: "État de stress post-traumatique (ESPT)", kind: "DISEASE", specialty: "psychiatrie", tier: 2 },
  { slug: "depression-post-partum", term: "Dépression post-partum", kind: "DISEASE", specialty: "psychiatrie", tier: 2 },
  { slug: "regles-abondantes", term: "Règles abondantes (ménorragie)", kind: "SYMPTOM", specialty: "gyneco-obstetrique", tier: 2 },
  { slug: "fausse-couche", term: "Fausse couche", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 2, note: "YMYL sensible : ton empathique, orientation" },
  { slug: "mastite", term: "Mastite (allaitement)", kind: "DISEASE", specialty: "gyneco-obstetrique", tier: 3 },
  { slug: "pyelonephrite", term: "Pyélonéphrite (infection rénale)", kind: "DISEASE", specialty: "nephrologie", tier: 3 },
  { slug: "maladie-de-raynaud", term: "Maladie de Raynaud", kind: "DISEASE", specialty: "angiologie", tier: 3 },
  { slug: "leucemie", term: "Leucémie", kind: "DISEASE", specialty: "hematologie", tier: 3, note: "YMYL sensible : cadrage orientation" },
  { slug: "lymphome", term: "Lymphome", kind: "DISEASE", specialty: "hematologie", tier: 3, note: "YMYL sensible" },
  { slug: "thalassemie", term: "Thalassémie", kind: "DISEASE", specialty: "hematologie", tier: 3, note: "Maladie génétique présente au Maroc" },
  { slug: "andropause", term: "Andropause", kind: "DISEASE", specialty: "andrologie", tier: 3 },
  { slug: "denutrition", term: "Dénutrition", kind: "DISEASE", specialty: "nutrition", tier: 3 },
  { slug: "polype-nasal", term: "Polypes nasaux", kind: "DISEASE", specialty: "oto-rhino-laryngologie", tier: 3 },
  { slug: "uveite", term: "Uvéite", kind: "DISEASE", specialty: "ophtalmologie", tier: 3 },
];
