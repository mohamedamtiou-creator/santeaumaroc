/**
 * Localisation FR/AR + parsing des hubs santé (symptômes). Mêmes garde-fous
 * YMYL que le glossaire/blog : FR indexé si `reviewedAt`, AR si `arReviewedAt`.
 */
import type { Locale } from "@/lib/i18n";

export type HealthTopicArSource = {
  term: string;
  shortAnswer: string;
  causes: string;
  redFlags: string;
  whenToConsult: string | null;
  faqJson: string | null;
  sources: string | null;
  termAr: string | null;
  shortAnswerAr: string | null;
  causesAr: string | null;
  redFlagsAr: string | null;
  whenToConsultAr: string | null;
  faqJsonAr: string | null;
  sourcesAr: string | null;
  arReviewedAt: Date | null;
};

export function isTopicArReady(t: { arReviewedAt: Date | null; shortAnswerAr: string | null }): boolean {
  return !!t.arReviewedAt && !!t.shortAnswerAr;
}

export function isTopicReviewed(t: { reviewedAt: Date | null }): boolean {
  return !!t.reviewedAt;
}

export function topicLocalized<T extends HealthTopicArSource>(t: T, locale: Locale) {
  const ar = locale === "ar" && isTopicArReady(t);
  const pick = (a: string | null, fr: string) => (ar && a ? a : fr);
  const pickN = (a: string | null, fr: string | null) => (ar && a ? a : fr);
  return {
    isArabic: ar,
    term: pick(t.termAr, t.term),
    shortAnswer: pick(t.shortAnswerAr, t.shortAnswer),
    causes: pick(t.causesAr, t.causes),
    redFlags: pick(t.redFlagsAr, t.redFlags),
    whenToConsult: pickN(t.whenToConsultAr, t.whenToConsult),
    faqJson: pickN(t.faqJsonAr, t.faqJson),
    sources: pickN(t.sourcesAr, t.sources),
  };
}

/* ── Pages « quel médecin consulter pour X ? » (intention) ──────────────
 * Adossées au même HealthTopic (le Health Graph). Une page existe dès que
 * `intentSlug` est renseigné ; l'indexation réutilise le verrou YMYL du topic
 * (`reviewedAt` FR / `arReviewedAt` AR). La question et la réponse sont soit
 * rédigées (meilleur snippet), soit composées depuis le graph (spécialité). */

export type HealthTopicIntentSource = HealthTopicArSource & {
  intentQuestion: string | null;
  intentQuestionAr: string | null;
  intentAnswer: string | null;
  intentAnswerAr: string | null;
};

/** Une page d'intention existe pour ce topic ? */
export function hasIntentPage(t: { intentSlug: string | null }): boolean {
  return !!t.intentSlug;
}

/**
 * Localise la question (H1) et la réponse directe de la page d'intention.
 * En AR (si la traduction du topic est relue), sert la variante AR quand elle
 * existe, sinon repli FR. Les champs peuvent être `null` → l'appelant compose
 * alors depuis le graph (libellé du symptôme + spécialité) via les dictionnaires.
 */
export function intentLocalized<T extends HealthTopicIntentSource>(t: T, locale: Locale) {
  const ar = locale === "ar" && isTopicArReady(t);
  const pickN = (a: string | null, fr: string | null) => (ar && a ? a : fr);
  return {
    isArabic: ar,
    question: pickN(t.intentQuestionAr, t.intentQuestion),
    answer: pickN(t.intentAnswerAr, t.intentAnswer),
  };
}

/* ── Pages « comment traiter X ? » (angle parcours/traitement) ──────────────
 * Adossées au même HealthTopic → /comment-traiter/[slug] (le slug du topic).
 * Une page existe dès que `treatmentSummary` est renseigné. Indexation sous le
 * verrou YMYL du topic. Le contenu reste de l'ORIENTATION (approches, quand/où
 * se soigner, rôle du spécialiste) — jamais de posologie ni de diagnostic. */

export type HealthTopicTreatmentSource = {
  treatmentSummary: string | null;
  treatmentSteps: string | null;
  treatmentSummaryAr: string | null;
  treatmentStepsAr: string | null;
  arReviewedAt: Date | null;
  shortAnswerAr: string | null;
};

/** Une page « comment traiter » existe pour ce topic ? */
export function hasTreatmentPage(t: { treatmentSummary: string | null }): boolean {
  return !!t.treatmentSummary;
}

/** Localise le résumé de traitement et les étapes du parcours (repli FR). */
export function treatmentLocalized<T extends HealthTopicTreatmentSource>(t: T, locale: Locale) {
  const ar = locale === "ar" && isTopicArReady(t);
  const pickN = (a: string | null, fr: string | null) => (ar && a ? a : fr);
  return {
    isArabic: ar,
    summary: pickN(t.treatmentSummaryAr, t.treatmentSummary),
    steps: pickN(t.treatmentStepsAr, t.treatmentSteps),
  };
}

/** Question (H1) « comment traiter », composée depuis le libellé quand non rédigée. */
export function composeTreatmentQuestion(term: string, locale: Locale): string {
  const t = term.trim();
  return locale === "ar"
    ? `كيف يُعالَج ${t}؟`
    : `Comment traiter ${frWithArticle(t)} ?`;
}

/**
 * Réponse directe « comment traiter » (~40-60 mots) composée depuis le graph
 * quand elle n'est pas rédigée. Volontairement NON médicale : oriente vers le
 * bon interlocuteur et rappelle que la prise en charge est individualisée →
 * sûre à servir sous le verrou YMYL du topic (`reviewedAt`), sans posologie.
 */
export function composeTreatmentAnswer(term: string, specialtyName: string | null, locale: Locale): string {
  if (locale === "ar") {
    const t = term.trim();
    return specialtyName
      ? `يعتمد علاج ${t} على السبب وشدّة الحالة، ويحدّده الطبيب بعد الفحص. غالبًا ما يبدأ الأمر باستشارة طبيب عام أو أخصّائي «${specialtyName}» الذي يقترح الخطوات المناسبة. لا تأخذ أي دواء دون وصفة، وفي حال ظهور علامات إنذار توجّه إلى الطوارئ.`
      : `يعتمد علاج ${t} على السبب وشدّة الحالة، ويحدّده الطبيب بعد الفحص. ابدأ باستشارة طبيب عام يقيّم حالتك ويقترح الخطوات المناسبة. لا تأخذ أي دواء دون وصفة، وفي حال ظهور علامات إنذار توجّه إلى الطوارئ.`;
  }
  const t = frWithDe(term);
  return specialtyName
    ? `La prise en charge ${t} dépend de la cause et de la sévérité : c'est le médecin qui la définit après examen. On commence souvent par un médecin généraliste ou un spécialiste en « ${specialtyName} », qui propose les étapes adaptées. Ne prenez aucun médicament sans avis ; en présence de signes d'alerte, rendez-vous aux urgences.`
    : `La prise en charge ${t} dépend de la cause et de la sévérité : c'est le médecin qui la définit après examen. Commencez par un médecin généraliste, qui évalue la situation et propose les étapes adaptées. Ne prenez aucun médicament sans avis ; en présence de signes d'alerte, rendez-vous aux urgences.`;
}

/* ── Pages « comment prévenir X ? » (angle prévention) ─────────────────────
 * Adossées au même HealthTopic → /prevenir/[slug]. Existe dès que
 * `preventionSummary` est renseigné. Indexation sous le verrou YMYL du topic.
 * Contenu = hygiène de vie / réduction des risques / dépistage — jamais de
 * posologie ni de promesse de « guérison ». Certaines maladies ne se préviennent
 * pas : le rédigé le dit honnêtement (on parle alors de dépistage précoce). */

export type HealthTopicPreventionSource = {
  preventionSummary: string | null;
  preventionSteps: string | null;
  preventionSummaryAr: string | null;
  preventionStepsAr: string | null;
  arReviewedAt: Date | null;
  shortAnswerAr: string | null;
};

/** Une page « comment prévenir » existe pour ce topic ? */
export function hasPreventionPage(t: { preventionSummary: string | null }): boolean {
  return !!t.preventionSummary;
}

/** Localise le résumé de prévention et les gestes (repli FR). */
export function preventionLocalized<T extends HealthTopicPreventionSource>(t: T, locale: Locale) {
  const ar = locale === "ar" && isTopicArReady(t);
  const pickN = (a: string | null, fr: string | null) => (ar && a ? a : fr);
  return {
    isArabic: ar,
    summary: pickN(t.preventionSummaryAr, t.preventionSummary),
    steps: pickN(t.preventionStepsAr, t.preventionSteps),
  };
}

/** Question (H1) « comment prévenir », composée depuis le libellé quand non rédigée. */
export function composePreventionQuestion(term: string, locale: Locale): string {
  const t = term.trim();
  return locale === "ar"
    ? `كيف يمكن الوقاية من ${t}؟`
    : `Comment prévenir ${frWithArticle(t)} ?`;
}

/**
 * Réponse directe « comment prévenir » (~40-60 mots) composée depuis le graph
 * quand elle n'est pas rédigée. Orientation prudente : hygiène de vie et
 * dépistage, sans promesse. Sûre sous le verrou YMYL du topic.
 */
export function composePreventionAnswer(term: string, locale: Locale): string {
  if (locale === "ar") {
    const t = term.trim();
    return `لا يمكن دائمًا تفادي ${t} تمامًا، لكن نمط حياة صحّي (تغذية متوازنة، نشاط بدني، الإقلاع عن التدخين) والكشف المبكر يقلّلان الخطر أو يسمحان بالتكفّل مبكرًا. استشر طبيبًا لتقييم عوامل الخطر لديك والنصائح الملائمة لحالتك.`;
  }
  const t = frWithArticle(term);
  return `On ne peut pas toujours éviter totalement ${t}, mais une bonne hygiène de vie (alimentation équilibrée, activité physique, arrêt du tabac) et le dépistage réduisent le risque ou permettent une prise en charge précoce. Consultez un médecin pour évaluer vos facteurs de risque et les conseils adaptés à votre situation.`;
}

function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

/**
 * Préfixe un libellé de topic par l'article défini français correct
 * (« la migraine », « le mal de dos », « l'acné », « les hémorroïdes ») pour
 * composer des questions grammaticales sur /quel-medecin-pour, /comment-traiter
 * et /prevenir. Le genre n'est pas stocké en base → heuristique en cascade.
 *
 * ── POURQUOI CETTE CASCADE (audit du 4 août 2026) ─────────────────────────
 * La version précédente testait uniquement un suffixe féminin sur le mot-tête,
 * avec élision avant ce test. Sur les 265 fiches, elle publiait 62 titres faux :
 *   · pluriels traités en masculin singulier — « le ballonnements »,
 *     « le règles douloureuses », « le troubles de la vue » ;
 *   · pluriels élidés — « l'oreillons », « l'yeux secs », « l'acouphènes » ;
 *   · féminins dont le mot-tête n'a aucun suffixe reconnaissable — « le fièvre »,
 *     « le ménopause », « le cataracte », « le gale », « le toux ».
 * L'ordre compte : la détection du PLURIEL doit passer AVANT l'élision, sinon
 * « hémorroïdes » redevient « l'hémorroïdes ».
 *
 * Le pluriel est désormais INFÉRÉ (mot-tête en « s »/« x »), ce qui rend inutiles
 * les entrées « les » de l'ancienne table — dont plusieurs étaient d'ailleurs
 * mortes, leur clé ne portant pas la parenthèse du libellé réel
 * (« calculs rénaux » vs « Calculs rénaux (lithiase urinaire) »).
 */
type FrArticle = "le" | "la" | "l'" | "les";

/**
 * Féminins que le suffixe ne permet pas de deviner. Clé = libellé COMPLET en
 * minuscules, parenthèse incluse : c'est la seule forme qui matche réellement.
 */
const FR_ARTICLE_OVERRIDE: Record<string, FrArticle> = {
  "bpco (bronchopneumopathie chronique)": "la",
  cataracte: "la",
  "chute de cheveux": "la",
  "colique néphrétique": "la",
  coqueluche: "la",
  "crise d'angoisse (attaque de panique)": "la",
  fatigue: "la",
  fièvre: "la",
  "fièvre chez l'enfant": "la",
  "fièvre typhoïde": "la",
  gale: "la",
  "gastro-entérite": "la",
  goutte: "la",
  "mauvaise haleine": "la",
  ménopause: "la",
  "perte d'appétit": "la",
  "perte d'audition": "la",
  "perte de poids inexpliquée": "la",
  "prise de poids inexpliquée": "la",
  "rage (morsure animale)": "la",
  roséole: "la",
  rougeole: "la",
  rubéole: "la",
  sciatique: "la",
  "teigne (dermatophytose)": "la",
  toux: "la",
  "toux chez l'enfant": "la",
};

/**
 * Singuliers savants terminés par « s » ou « x » : sans cette liste, la règle du
 * pluriel produirait « les psoriasis », « les reflux », « les stress ».
 */
const FR_SINGULIER_EN_S = new Set([
  "abcès", "anus", "herpès", "lupus", "phimosis", "pityriasis", "pouls", "prolapsus",
  "psoriasis", "reflux", "sinus", "stress", "tétanos", "torticolis", "toux", "virus",
]);

/** Article défini FR + libellé, sans contraction (heuristique genre/nombre). */
function frArticleParts(term: string): { article: FrArticle; noun: string } {
  const raw = term.trim();
  const lower = raw.toLowerCase();
  // Un libellé qui COMMENCE par un sigle garde sa casse : « le bPCO (…) » sinon.
  const startsWithAcronym = /^[A-Z0-9][A-Z0-9-]+\b/.test(raw); // AVC, BPCO, TDAH, COVID-19…
  const noun = startsWithAcronym ? raw : lowerFirst(raw);

  const override = FR_ARTICLE_OVERRIDE[lower];
  if (override) return { article: override, noun };

  const head = lower.split(/[\s-]/)[0];
  // 1. Pluriel — AVANT l'élision (« les hémorroïdes », pas « l'hémorroïdes »).
  if (/[sx]$/.test(head) && !FR_SINGULIER_EN_S.has(head)) return { article: "les", noun };
  // 2. Élision devant voyelle, h muet ou œ : « l'acné », « l'hypertension », « l'œil rouge ».
  if (/^[aàâäeéèêëiîïoôöuùûüyhœ]/i.test(lower)) return { article: "l'", noun };
  // 3. Féminin : suffixes médicaux fréquents et fiables, testés sur le MOT-TÊTE
  //    (« carie dentaire » → carie fém → « la »). Sinon masculin.
  const feminine = /(ite|ose|ie|tion|sion|ure|té|ité|ine|ade|ance|ence|algie|pathie|ée|ppe|sse|mie|xie|rie|gie|elle|eur)$/.test(head);
  return { article: feminine ? "la" : "le", noun };
}

/** « la migraine », « l'acné », « le mal de dos », « les hémorroïdes ». */
export function frWithArticle(term: string): string {
  const { article, noun } = frArticleParts(term);
  return article === "l'" ? `l'${noun}` : `${article} ${noun}`;
}

/** Forme contractée avec « de » : « de la migraine », « de l'acné », « du mal de dos », « des hémorroïdes ». */
export function frWithDe(term: string): string {
  const { article, noun } = frArticleParts(term);
  switch (article) {
    case "le": return `du ${noun}`;
    case "les": return `des ${noun}`;
    case "l'": return `de l'${noun}`;
    default: return `de la ${noun}`;
  }
}

/** Question (H1) par défaut, composée depuis le libellé du topic quand elle n'est pas rédigée. */
export function composeIntentQuestion(term: string, locale: Locale): string {
  const t = term.trim();
  return locale === "ar"
    ? `أي طبيب يجب استشارته عند ${t}؟`
    : `Quel médecin consulter pour ${frWithArticle(t)} ?`;
}

/**
 * Réponse directe (~40-60 mots) composée depuis le graph (libellé + spécialité)
 * quand elle n'est pas rédigée. Volontairement NON médicale : c'est de
 * l'aiguillage (« quel spécialiste »), pas un diagnostic ni une posologie → sûr
 * à servir sans relecture propre, sous le verrou YMYL du topic (`reviewedAt`).
 */
export function composeIntentAnswer(term: string, specialtyName: string | null, locale: Locale): string {
  if (locale === "ar") {
    const t = term.trim();
    return specialtyName
      ? `عند ${t}، يُنصَح بالتوجّه إلى تخصّص «${specialtyName}» لتحديد السبب واقتراح العلاج المناسب. يمكن كذلك لطبيب عام تقييمُ حالتك في البداية وإحالتُك إلى المختص عند الحاجة. وفي حال ظهور علامات إنذار، استشِر دون تأخير أو توجّه إلى قسم الطوارئ.`
      : `عند ${t}، ابدأ باستشارة طبيب عام يقيّم حالتك ويحيلك إلى المختص المناسب عند الحاجة. وفي حال ظهور علامات إنذار، استشِر دون تأخير أو توجّه إلى قسم الطوارئ.`;
  }
  const t = frWithArticle(term);
  return specialtyName
    ? `Pour ${t}, orientez-vous vers la spécialité « ${specialtyName} » : le spécialiste identifie la cause et propose la prise en charge adaptée. Un médecin généraliste peut aussi vous évaluer en premier recours et vous adresser au bon spécialiste. En présence de signes d'alerte, consultez sans tarder ou rendez-vous aux urgences.`
    : `Pour ${t}, consultez d'abord un médecin généraliste : il évalue la situation et vous oriente vers le spécialiste adapté si nécessaire. En présence de signes d'alerte, consultez sans tarder ou rendez-vous aux urgences.`;
}

/** Découpe une liste « 1 item par ligne » (puces tolérées). */
export function parseLines(s: string | null | undefined): string[] {
  if (!s) return [];
  return s.split(/\r?\n/).map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
}

export type FaqItem = { q: string; a: string };
export function parseFaq(s: string | null | undefined): FaqItem[] {
  if (!s) return [];
  try {
    const arr = JSON.parse(s);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && typeof x.q === "string" && typeof x.a === "string").map((x) => ({ q: x.q.trim(), a: x.a.trim() }));
  } catch {
    return [];
  }
}
