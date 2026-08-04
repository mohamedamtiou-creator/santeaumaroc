import type { Locale } from "./i18n";
import type { ToolSlug } from "./health-tools";
import { TOOLS_CONTENT_AR } from "./tools-content-ar";

/**
 * Contenu éditorial du cluster `/outils` — français (référence) et arabe
 * (`tools-content-ar.ts`). Même convention que `specialty-content.ts` /
 * `city-content.ts` : un enregistrement par locale + un accesseur avec repli FR.
 *
 * Les fourchettes de la colonne `range` doublent volontairement les seuils
 * numériques de `lib/health-tools.ts` (l'un sert au calcul, l'autre à la table
 * de référence indexable) : toute modification doit toucher les deux.
 */

export type ToolCategoryContent = {
  label: string;
  /** Fourchette rédigée, telle qu'affichée dans la table de référence. */
  range: string;
  /** Interprétation prudente : oriente, ne diagnostique jamais. */
  advice: string;
};

export type ToolContent = {
  /** En-têtes des colonnes d'un résultat tabulaire, par clé. */
  columns?: Record<string, string>;
  /** Libellé court : cartes du hub, fil d'Ariane, liens croisés. */
  name: string;
  h1: string;
  metaTitle: string;
  metaDesc: string;
  /** Accroche de la carte sur le hub. */
  teaser: string;
  /** Chapô de la page (2 à 3 phrases). */
  intro: string;
  fields: Record<string, { label: string; hint?: string }>;
  /** Libellés des options de `select`, par clé d'option. */
  options?: Record<string, string>;
  resultLabel: string;
  /** Libellés des lignes secondaires du résultat, par clé. */
  detailLabels: Record<string, string>;
  categories: Record<string, ToolCategoryContent>;
  /** Intitulés des colonnes de la table de référence. */
  refColumns: { category: string; range: string };
  refCaption: string;
  /** Notes conditionnelles affichées sous le résultat, par clé. */
  notes: Record<string, string>;
  /** Ce que l'outil ne fait pas — garde-fou YMYL, toujours rendu. */
  limits: string[];
  /** Méthode de calcul, en clair (transparence + contenu indexable). */
  howTo: string[];
  faq: { q: string; a: string }[];
  sources: { label: string; publisher?: string; year?: string; url?: string }[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Français
// ─────────────────────────────────────────────────────────────────────────────

const FR: Record<ToolSlug, ToolContent> = {
  "calcul-imc": {
    name: "Calcul de l'IMC",
    h1: "Calcul de l'IMC : indice de masse corporelle",
    metaTitle: "Calcul IMC adulte : résultat et interprétation OMS",
    metaDesc:
      "Calculez votre IMC et comprenez le résultat selon les seuils de l'OMS : fourchette de poids pour votre taille, limites de l'indice et quand consulter au Maroc.",
    teaser: "Votre indice de masse corporelle, sa catégorie OMS et la fourchette de poids correspondant à votre taille.",
    intro:
      "L'indice de masse corporelle rapporte votre poids à votre taille. C'est un repère de dépistage utile à l'échelle d'une population, pas un bilan de santé individuel : il ne distingue ni le muscle de la graisse, ni la graisse abdominale du reste. Lisez-le donc comme un point de départ pour une discussion avec un professionnel, jamais comme un verdict.",
    fields: {
      poids: { label: "Votre poids", hint: "En kilogrammes, par exemple 72,5." },
      taille: { label: "Votre taille", hint: "En centimètres, sans chaussures." },
    },
    resultLabel: "Votre IMC",
    detailLabels: {
      fourchette: "Poids correspondant à un IMC de référence pour votre taille",
    },
    categories: {
      maigreur: {
        label: "Insuffisance pondérale",
        range: "moins de 18,5",
        advice:
          "Un IMC inférieur à 18,5 peut traduire des apports insuffisants, une perte de poids récente ou une cause médicale à rechercher. Si vous n'avez pas cherché à maigrir, ou si la perte a été rapide, l'étape utile est un avis médical — pas un changement d'alimentation improvisé.",
      },
      normal: {
        label: "Corpulence normale",
        range: "de 18,5 à 24,9",
        advice:
          "Votre IMC se situe dans la fourchette de référence de l'OMS. À lui seul, il ne dit rien de votre alimentation, de votre activité physique ni de votre tour de taille — or ce sont eux qui pèsent le plus sur le risque cardiovasculaire et métabolique.",
      },
      surpoids: {
        label: "Surpoids",
        range: "de 25 à 29,9",
        advice:
          "Le surpoids n'est pas une maladie, mais il augmente le risque de diabète de type 2, d'hypertension artérielle et d'apnée du sommeil, particulièrement quand la graisse est abdominale. Une perte de 5 à 10 % du poids améliore déjà nettement ces paramètres.",
      },
      obesite1: {
        label: "Obésité modérée (classe I)",
        range: "de 30 à 34,9",
        advice:
          "À partir d'un IMC de 30, un accompagnement structuré est plus efficace qu'un régime seul : bilan des facteurs de risque, alimentation adaptée à votre quotidien, activité physique progressive. Un médecin nutritionniste ou votre médecin traitant peut coordonner cette prise en charge.",
      },
      obesite2: {
        label: "Obésité sévère (classe II)",
        range: "de 35 à 39,9",
        advice:
          "Ce niveau justifie un bilan médical complet : glycémie, bilan lipidique, tension artérielle, recherche d'apnée du sommeil. La prise en charge est pluridisciplinaire et se construit dans le temps ; elle donne de meilleurs résultats qu'une succession de régimes.",
      },
      obesite3: {
        label: "Obésité massive (classe III)",
        range: "40 et plus",
        advice:
          "Un IMC de 40 ou plus expose à des complications cardiaques, respiratoires et métaboliques qui méritent une évaluation médicale rapprochée. Prenez rendez-vous pour un bilan : les options thérapeutiques sont réelles et se discutent au cas par cas.",
      },
    },
    refColumns: { category: "Catégorie OMS", range: "IMC (kg/m²)" },
    refCaption:
      "Classification de l'IMC chez l'adulte selon l'Organisation mondiale de la Santé. Ces seuils ne s'appliquent ni à l'enfant, ni à la femme enceinte.",
    notes: {
      adulteSeulement:
        "Ces seuils ne valent que chez l'adulte, en dehors de la grossesse. Chez l'enfant, l'IMC se lit sur les courbes de croissance ; chez le sportif très musclé et la personne âgée, il induit en erreur.",
    },
    limits: [
      "Il ne mesure pas la masse grasse : à IMC égal, un sportif musclé et une personne sédentaire n'ont pas le même risque.",
      "Il ignore la répartition de la graisse, alors que la graisse abdominale est le paramètre le plus lié au risque cardiovasculaire — le tour de taille le complète utilement.",
      "Il n'est pas interprétable chez l'enfant, l'adolescent, la femme enceinte ni après 65 ans avec les mêmes seuils.",
      "Il ne remplace aucun examen : seule une consultation permet d'évaluer glycémie, tension, bilan lipidique et antécédents.",
    ],
    howTo: [
      "L'IMC est le poids en kilogrammes divisé par le carré de la taille en mètres. Pour 72 kg et 1,75 m : 72 ÷ (1,75 × 1,75) = 23,5.",
      "Le résultat est comparé aux seuils de l'Organisation mondiale de la Santé pour l'adulte.",
      "La fourchette de poids affichée correspond aux poids donnant un IMC de 18,5 à 24,9 pour votre taille.",
    ],
    faq: [
      {
        q: "Quel est l'IMC idéal ?",
        a: "L'OMS retient une fourchette de référence de 18,5 à 24,9 chez l'adulte, sans valeur « idéale » unique. Deux personnes au même IMC peuvent avoir un état de santé très différent selon leur masse musculaire, leur tour de taille, leur activité physique et leurs antécédents.",
      },
      {
        q: "L'IMC est-il valable pour un enfant ?",
        a: "Non, pas avec ces seuils. Chez l'enfant et l'adolescent, l'IMC varie avec l'âge et le sexe : il s'interprète sur les courbes de corpulence du carnet de santé, en suivant l'évolution dans le temps plutôt qu'une valeur isolée. C'est le pédiatre qui pose cette lecture.",
      },
      {
        q: "Et pendant la grossesse ?",
        a: "L'IMC calculé pendant la grossesse n'a pas de signification. Ce qui compte est l'IMC d'avant la grossesse, qui sert à définir la prise de poids recommandée. Cette prise de poids est suivie par le gynécologue ou la sage-femme.",
      },
      {
        q: "Faut-il ajouter le tour de taille ?",
        a: "C'est très utile. Le tour de taille estime la graisse abdominale, celle qui est le plus liée au diabète de type 2 et au risque cardiovasculaire. On parle de risque accru au-delà de 94 cm chez l'homme et 80 cm chez la femme, y compris avec un IMC normal.",
      },
      {
        q: "Quel médecin consulter avec un IMC élevé au Maroc ?",
        a: "Vous pouvez consulter directement un médecin nutritionniste, sans passer par votre médecin traitant. Le médecin nutritionniste peut prescrire des examens et suivre les pathologies associées ; le diététicien construit le plan alimentaire au quotidien. Les deux sont complémentaires.",
      },
      {
        q: "Mes données sont-elles enregistrées ?",
        a: "Non. Le calcul est effectué dans votre navigateur : votre poids et votre taille ne sont ni envoyés à un serveur, ni conservés, ni associés à votre compte.",
      },
    ],
    sources: [
      {
        label: "Obésité et surpoids — fiche d'information",
        publisher: "Organisation mondiale de la Santé",
        url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
      },
      { label: "Classification de l'indice de masse corporelle chez l'adulte", publisher: "Organisation mondiale de la Santé" },
      { label: "Tour de taille et risque cardiométabolique — seuils de référence", publisher: "Fédération internationale du diabète" },
    ],
  },

  "tour-de-taille": {
    name: "Tour de taille",
    h1: "Tour de taille : rapport taille/hauteur et risque abdominal",
    metaTitle: "Tour de taille normal : calcul et seuils de risque",
    metaDesc:
      "Situez votre tour de taille et votre rapport taille/hauteur selon les seuils de l'OMS et du NICE. La graisse abdominale, mieux corrélée au risque que l'IMC seul.",
    teaser: "Votre rapport tour de taille/hauteur, le seuil applicable à votre sexe et le rapport taille/hanches.",
    intro:
      "L'IMC ne dit pas où se situe la graisse. Or c'est la graisse abdominale — celle qui entoure les organes — qui pèse le plus sur le risque de diabète de type 2 et de maladie cardiovasculaire. Le rapport entre votre tour de taille et votre hauteur est aujourd'hui l'indicateur simple le plus fiable pour l'estimer, à tout âge et quelle que soit la morphologie.",
    fields: {
      sexe: { label: "Sexe", hint: "Les seuils de tour de taille diffèrent selon le sexe." },
      tourTaille: { label: "Tour de taille", hint: "À mi-distance entre la dernière côte et le haut du bassin, en fin d'expiration." },
      taille: { label: "Votre hauteur", hint: "Votre stature, en centimètres." },
      tourHanches: { label: "Tour de hanches", hint: "Au niveau le plus large des fesses." },
    },
    options: { femme: "Femme", homme: "Homme" },
    resultLabel: "Rapport tour de taille / hauteur",
    detailLabels: {
      rapportTailleHanches: "Rapport tour de taille / tour de hanches",
      seuilsSexe: "Seuils de tour de taille pour votre sexe",
    },
    categories: {
      sousLeSeuil: {
        label: "En dessous des repères",
        range: "moins de 0,40",
        advice:
          "Un rapport très bas peut simplement refléter une silhouette fine, mais aussi une masse insuffisante. Si vous avez perdu du poids sans le vouloir, ou si vous vous sentez fatigué, faites-en part à un médecin plutôt que de vous rassurer sur ce seul chiffre.",
      },
      sain: {
        label: "Dans la zone favorable",
        range: "de 0,40 à 0,49",
        advice:
          "Votre tour de taille reste inférieur à la moitié de votre hauteur : c'est le repère associé au risque le plus bas. Le maintenir dans le temps compte davantage qu'un chiffre isolé — l'activité physique régulière y contribue plus que n'importe quelle restriction ponctuelle.",
      },
      augmente: {
        label: "Risque augmenté",
        range: "de 0,50 à 0,59",
        advice:
          "Au-delà de 0,50, l'accumulation abdominale commence à peser sur le risque métabolique, même avec un IMC normal — c'est ce qu'on appelle parfois l'obésité abdominale à poids normal. Un bilan simple (glycémie, bilan lipidique, tension) permet de faire le point.",
      },
      eleve: {
        label: "Risque élevé",
        range: "0,60 et plus",
        advice:
          "Ce niveau est associé à un risque nettement accru de diabète de type 2, d'hypertension et de maladie cardiovasculaire. Une consultation est justifiée pour évaluer l'ensemble des facteurs de risque et construire une prise en charge : quelques centimètres de tour de taille en moins produisent des effets mesurables.",
      },
    },
    refColumns: { category: "Niveau", range: "Tour de taille ÷ hauteur" },
    refCaption:
      "Seuils du rapport tour de taille/hauteur retenus par le NICE. Repère simple à retenir : le tour de taille doit rester inférieur à la moitié de la hauteur.",
    notes: {
      tourNormal:
        "Votre tour de taille est en dessous du premier seuil de l'OMS pour votre sexe (94 cm chez l'homme, 80 cm chez la femme).",
      tourAugmente:
        "Votre tour de taille dépasse le premier seuil de l'OMS (94 cm chez l'homme, 80 cm chez la femme) : le risque métabolique est considéré comme augmenté.",
      tourEleve:
        "Votre tour de taille dépasse le second seuil de l'OMS (102 cm chez l'homme, 88 cm chez la femme) : le risque métabolique est considéré comme nettement accru.",
      rthEleve:
        "Votre rapport taille/hanches atteint le seuil d'obésité abdominale de l'OMS (0,90 chez l'homme, 0,85 chez la femme), ce qui traduit une répartition abdominale de la graisse.",
      mesureNote:
        "La mesure se prend sur peau nue ou vêtement fin, debout, sans serrer le mètre, en fin d'expiration normale. Une mesure prise après un repas ou en rentrant le ventre n'est pas exploitable.",
    },
    limits: [
      "Il n'évalue pas la masse grasse totale : il le complète, sans remplacer l'IMC ni un examen clinique.",
      "Les seuils de tour de taille sont ceux de l'adulte et varient selon les populations : ceux utilisés ici sont les seuils européens de l'OMS, les plus employés en pratique au Maroc.",
      "Il n'est pas interprétable chez l'enfant, la femme enceinte, ni en cas de ballonnement important, d'ascite ou de hernie volumineuse.",
      "Un chiffre favorable n'exclut ni diabète, ni hypertension, ni excès de cholestérol : seuls des examens le disent.",
    ],
    howTo: [
      "Le rapport principal divise votre tour de taille par votre hauteur, les deux en centimètres : 92 ÷ 175 = 0,53.",
      "Le résultat est comparé aux seuils du NICE : en dessous de 0,50, la zone est considérée comme favorable.",
      "Le tour de taille est aussi comparé aux deux seuils de l'OMS propres à votre sexe, et le rapport taille/hanches au seuil d'obésité abdominale.",
    ],
    faq: [
      {
        q: "Quel tour de taille est normal ?",
        a: "L'OMS retient deux seuils : le risque est considéré comme augmenté au-delà de 94 cm chez l'homme et 80 cm chez la femme, puis nettement accru au-delà de 102 cm et 88 cm. Le repère le plus simple reste toutefois de garder un tour de taille inférieur à la moitié de sa hauteur.",
      },
      {
        q: "Pourquoi le tour de taille est-il plus parlant que l'IMC ?",
        a: "Parce qu'il renseigne sur la localisation de la graisse. La graisse abdominale, qui entoure les organes, est métaboliquement active et directement liée à l'insulinorésistance. Deux personnes au même IMC peuvent avoir un risque très différent selon leur tour de taille.",
      },
      {
        q: "Comment mesurer son tour de taille correctement ?",
        a: "Debout, sans vêtement serré, placez le mètre à mi-distance entre la dernière côte et le sommet de l'os du bassin, horizontalement. Mesurez en fin d'expiration normale, sans serrer et sans rentrer le ventre. Mesurez toujours au même moment de la journée pour pouvoir comparer.",
      },
      {
        q: "Peut-on cibler la perte de graisse abdominale ?",
        a: "On ne choisit pas où l'on perd, mais la graisse abdominale est souvent la première mobilisée quand on réduit les apports et qu'on augmente l'activité. L'activité d'endurance régulière, associée au renforcement musculaire, agit efficacement — les exercices d'abdominaux seuls, non.",
      },
      {
        q: "Quel médecin consulter au Maroc ?",
        a: "Un médecin nutritionniste ou votre médecin traitant pour le bilan et l'accompagnement ; un endocrinologue si un trouble métabolique est suspecté. Vous pouvez consulter directement, sans lettre d'orientation.",
      },
    ],
    sources: [
      {
        label: "Waist circumference and waist-hip ratio — report of a WHO expert consultation",
        publisher: "Organisation mondiale de la Santé",
        year: "2008",
      },
      { label: "Obesity: identification, assessment and management — seuils du rapport tour de taille/hauteur", publisher: "National Institute for Health and Care Excellence (NICE)" },
      {
        label: "Obésité et surpoids — fiche d'information",
        publisher: "Organisation mondiale de la Santé",
        url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
      },
    ],
  },

  "calcul-calories": {
    name: "Calcul des calories",
    h1: "Calcul des calories : vos besoins énergétiques par jour",
    metaTitle: "Calcul calories par jour : besoins énergétiques (TDEE)",
    metaDesc:
      "Calculez vos besoins en calories par jour avec l'équation Mifflin-St Jeor : métabolisme de base, dépense totale et repères pour perdre ou prendre du poids.",
    teaser: "Votre métabolisme de base et votre dépense énergétique totale, avec des repères pour perdre ou prendre du poids.",
    intro:
      "Vos besoins en calories dépendent de votre métabolisme de base — l'énergie consommée au repos — multiplié par votre niveau d'activité. Cet outil applique l'équation Mifflin-St Jeor, la plus fiable des formules d'estimation courantes. Le résultat reste une estimation statistique : deux personnes aux mêmes mesures peuvent dépenser 200 kcal d'écart par jour.",
    fields: {
      sexe: { label: "Sexe" },
      age: { label: "Âge" },
      poids: { label: "Poids", hint: "En kilogrammes." },
      taille: { label: "Taille", hint: "En centimètres." },
      activite: { label: "Niveau d'activité physique", hint: "Comptez votre semaine réelle, pas celle que vous visez." },
    },
    options: {
      femme: "Femme",
      homme: "Homme",
      sedentaire: "Sédentaire — travail assis, peu ou pas de sport",
      legere: "Activité légère — 1 à 3 séances par semaine",
      moderee: "Activité modérée — 3 à 5 séances par semaine",
      soutenue: "Activité soutenue — 6 à 7 séances par semaine",
      intense: "Très intense — travail physique ou double entraînement",
    },
    resultLabel: "Vos besoins quotidiens",
    detailLabels: {
      metabolismeBase: "Métabolisme de base (au repos)",
      perteDePoids: "Pour perdre du poids progressivement",
      priseDePoids: "Pour prendre du poids ou de la masse",
    },
    categories: {
      sedentaire: {
        label: "Sédentaire",
        range: "métabolisme de base × 1,2",
        advice:
          "Avec une journée principalement assise, l'essentiel de votre dépense vient du métabolisme de base. Augmenter l'activité quotidienne — marche, escaliers, déplacements — modifie ces besoins plus vite qu'un changement d'alimentation seul.",
      },
      legere: {
        label: "Activité légère",
        range: "métabolisme de base × 1,375",
        advice:
          "Une à trois séances hebdomadaires, ou une journée debout, situent la plupart des adultes actifs à ce niveau. C'est le facteur à retenir en cas de doute entre deux niveaux.",
      },
      moderee: {
        label: "Activité modérée",
        range: "métabolisme de base × 1,55",
        advice:
          "Trois à cinq séances par semaine. À ce niveau, la répartition des apports autour de l'effort commence à compter autant que leur total, surtout si vous cherchez à progresser.",
      },
      soutenue: {
        label: "Activité soutenue",
        range: "métabolisme de base × 1,725",
        advice:
          "Six à sept séances par semaine, ou un métier physique. Les besoins deviennent difficiles à couvrir sans organisation des repas : un accompagnement diététique évite les déficits involontaires.",
      },
      intense: {
        label: "Très intense",
        range: "métabolisme de base × 1,9",
        advice:
          "Double entraînement quotidien ou travail de force. À ce niveau, un suivi par un médecin du sport ou un diététicien du sport est plus pertinent qu'une estimation par formule.",
      },
    },
    refColumns: { category: "Niveau d'activité", range: "Facteur appliqué" },
    refCaption:
      "Facteurs d'activité classiques appliqués au métabolisme de base pour estimer la dépense énergétique totale sur 24 heures.",
    notes: {
      estimation:
        "Ces chiffres sont des estimations : l'écart entre une formule et une mesure réelle atteint couramment 10 %. Ajustez selon l'évolution de votre poids sur trois à quatre semaines plutôt que jour après jour.",
      plancher:
        "Le repère de perte de poids affiché a été relevé : descendre plus bas expose à des carences et n'accélère pas durablement la perte. Un déficit important ne se conduit pas sans suivi médical.",
    },
    limits: [
      "L'équation n'a pas été établie chez l'enfant, l'adolescent, la femme enceinte ou allaitante : leurs besoins se calculent autrement.",
      "Elle ne tient pas compte de la composition corporelle, de la thyroïde, d'un traitement en cours ni d'une maladie chronique.",
      "Elle n'indique aucune répartition entre protéines, glucides et lipides, ni aucune qualité nutritionnelle : 2 000 kcal peuvent être équilibrées ou non.",
      "Elle ne remplace pas un bilan nutritionnel, en particulier en cas de trouble du comportement alimentaire ou de perte de poids inexpliquée.",
    ],
    howTo: [
      "Le métabolisme de base est estimé par l'équation Mifflin-St Jeor : 10 × poids (kg) + 6,25 × taille (cm) − 5 × âge, plus 5 chez l'homme, moins 161 chez la femme.",
      "Ce métabolisme est multiplié par un facteur d'activité, de 1,2 (sédentaire) à 1,9 (très intense), pour obtenir la dépense énergétique totale sur 24 heures.",
      "Les repères de perte et de prise de poids correspondent à un écart d'environ 500 kcal en moins et 300 kcal en plus, avec un plancher de sécurité.",
    ],
    faq: [
      {
        q: "Combien de calories par jour pour perdre du poids ?",
        a: "Un déficit d'environ 500 kcal par jour correspond à une perte de l'ordre de 0,5 kg par semaine, rythme considéré comme réaliste et tenable. Aller plus vite expose à la perte de masse musculaire, à la fatigue et à la reprise. En dessous de 1 200 kcal chez la femme et 1 500 kcal chez l'homme, un suivi médical est nécessaire.",
      },
      {
        q: "Pourquoi Mifflin-St Jeor plutôt que Harris-Benedict ?",
        a: "L'équation de Harris-Benedict, plus ancienne, surestime souvent le métabolisme de base d'environ 5 %. Mifflin-St Jeor, publiée en 1990, s'est révélée plus proche des mesures réelles dans la population générale : c'est la référence retenue aujourd'hui.",
      },
      {
        q: "Le résultat inclut-il le sport ?",
        a: "Oui. Le facteur d'activité couvre l'ensemble de vos dépenses, y compris les séances de sport. N'ajoutez donc pas séparément les calories brûlées à l'entraînement, sous peine de compter deux fois.",
      },
      {
        q: "Mes besoins changent-ils avec l'âge ?",
        a: "Oui, ils diminuent progressivement : l'équation retire environ 5 kcal par année d'âge, et la masse musculaire baisse avec les années si l'on ne l'entretient pas. Le renforcement musculaire est le levier le plus efficace pour limiter cette baisse.",
      },
      {
        q: "Qui consulter pour un suivi nutritionnel au Maroc ?",
        a: "Un médecin nutritionniste peut prescrire des analyses et suivre des pathologies associées ; un diététicien élabore le plan alimentaire concret. Pour un objectif sportif, le médecin du sport apporte l'évaluation de l'aptitude et de la récupération. Vous pouvez consulter directement, sans lettre d'orientation.",
      },
    ],
    sources: [
      {
        label: "Mifflin MD, St Jeor ST et al. — A new predictive equation for resting energy expenditure in healthy individuals",
        publisher: "American Journal of Clinical Nutrition",
        year: "1990",
      },
      { label: "Besoins énergétiques humains — rapport d'experts", publisher: "FAO / OMS / UNU" },
      { label: "Alimentation saine — fiche d'information", publisher: "Organisation mondiale de la Santé", url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet" },
    ],
  },

  "besoins-en-eau": {
    name: "Besoins en eau",
    h1: "Combien d'eau boire par jour ?",
    metaTitle: "Combien d'eau boire par jour : calcul selon poids",
    metaDesc:
      "Estimez vos besoins en eau selon votre poids, votre activité physique et la chaleur. Repères d'hydratation adaptés au climat marocain et signes de manque d'eau.",
    teaser: "Vos besoins en eau du jour selon votre poids, votre effort et la chaleur, avec la part à boire.",
    intro:
      "Il n'existe pas de « 8 verres par jour » universel : les besoins dépendent du poids, de l'activité et surtout de la chaleur — un paramètre qui compte particulièrement au Maroc en été. Cet outil estime l'apport hydrique total de la journée, dont environ un quart provient déjà des aliments.",
    fields: {
      poids: { label: "Votre poids", hint: "En kilogrammes." },
      sport: { label: "Activité physique aujourd'hui", hint: "Durée d'effort qui fait transpirer, en minutes. 0 si repos." },
      climat: { label: "Conditions du jour", hint: "Température ressentie et exposition à la chaleur." },
    },
    options: {
      tempere: "Tempéré — intérieur climatisé ou climat doux",
      chaud: "Chaud — été marocain, environ 30 à 35 °C",
      tresChaud: "Très chaud — au-delà de 35 °C ou travail au soleil",
    },
    resultLabel: "Apport hydrique total du jour",
    detailLabels: {
      eauBoissons: "À boire (le reste vient des aliments)",
      verres: "Soit en verres de 25 cl",
      apportAliments: "Apporté par les aliments",
    },
    categories: {
      tempere: {
        label: "Conditions tempérées",
        range: "besoin de base",
        advice:
          "En conditions tempérées, répartissez les apports sur la journée plutôt que par grandes quantités : la sensation de soif est un signal tardif, surtout après 60 ans. Une urine claire en début d'après-midi est un bon indicateur d'hydratation suffisante.",
      },
      chaud: {
        label: "Forte chaleur",
        range: "besoin de base + 10 %",
        advice:
          "Par forte chaleur, les pertes par transpiration augmentent nettement, même sans activité. Buvez avant d'avoir soif, évitez l'effort aux heures les plus chaudes, et préférez l'eau aux boissons très sucrées, qui hydratent moins bien.",
      },
      tresChaud: {
        label: "Chaleur extrême",
        range: "besoin de base + 20 %",
        advice:
          "Au-delà de 35 °C ou en travaillant au soleil, le risque de coup de chaleur devient réel. Buvez régulièrement, cherchez l'ombre et la fraîcheur, et surveillez les personnes âgées, les enfants et les travailleurs en extérieur. Maux de tête, crampes, nausées ou confusion imposent d'arrêter, de se mettre au frais et de demander de l'aide.",
      },
    },
    refColumns: { category: "Conditions", range: "Ajustement appliqué" },
    refCaption:
      "L'apport hydrique total inclut l'eau des boissons et celle des aliments. Les majorations tiennent compte des pertes par transpiration liées à la chaleur et à l'effort.",
    notes: {
      restrictionMedicale:
        "Si vous suivez une restriction hydrique prescrite — insuffisance cardiaque, insuffisance rénale, dialyse, certains traitements diurétiques —, appliquez la consigne de votre médecin et non ce calcul. Boire plus que prescrit peut être dangereux dans ces situations.",
      pendantEffort:
        "Pendant l'effort, buvez par petites quantités régulières plutôt qu'en une fois. Au-delà d'une heure d'effort intense ou en forte chaleur, les pertes en sel comptent aussi : une boisson légèrement salée ou une collation salée après l'effort est utile.",
      signesInsuffisance:
        "Signes d'un apport insuffisant : urines foncées et peu abondantes, bouche sèche, maux de tête, fatigue, vertiges au lever. Chez la personne âgée, une confusion inhabituelle peut être le premier signe.",
      populationsRisque:
        "Nourrissons, jeunes enfants, personnes âgées, femmes enceintes ou allaitantes et travailleurs en extérieur sont les plus exposés au manque d'eau, et leurs besoins ne se déduisent pas d'un simple calcul au poids.",
    },
    limits: [
      "Il ne s'applique pas en cas de restriction hydrique prescrite : insuffisance cardiaque, insuffisance rénale, dialyse ou certains traitements imposent la consigne du médecin.",
      "Il n'est pas conçu pour le nourrisson ni le jeune enfant, dont les besoins relèvent du pédiatre.",
      "Il ne tient pas compte d'une fièvre, de diarrhées, de vomissements ni de brûlures, situations où les pertes explosent et où un avis médical s'impose.",
      "Les besoins de la femme enceinte ou allaitante sont plus élevés et se discutent avec la sage-femme ou le médecin.",
    ],
    howTo: [
      "Le besoin de base retient environ 33 ml d'eau par kilogramme et par jour, apport total inclus.",
      "Ce besoin est majoré de 10 % par forte chaleur et de 20 % au-delà de 35 °C ou en cas d'exposition directe au soleil.",
      "L'effort ajoute environ 0,35 litre par demi-heure d'activité qui fait transpirer.",
      "Environ un quart de l'apport total provient des aliments : seule la part restante est à boire.",
    ],
    faq: [
      {
        q: "Faut-il vraiment boire 1,5 litre par jour ?",
        a: "Le chiffre de 1,5 litre est une moyenne commode, pas une règle. Les besoins varient avec le poids, l'activité, la chaleur et l'alimentation. Une personne de 55 kg au repos en hiver et une personne de 90 kg travaillant dehors en juillet n'ont pas les mêmes besoins — l'écart peut dépasser le double.",
      },
      {
        q: "Le thé et le café comptent-ils ?",
        a: "Oui, ils participent à l'apport hydrique, y compris le thé à la menthe. Leur effet diurétique léger ne les rend pas déshydratants aux quantités habituelles. En revanche, les boissons très sucrées apportent surtout du sucre et ne constituent pas une bonne source d'hydratation au quotidien.",
      },
      {
        q: "Comment savoir si je bois assez ?",
        a: "La couleur des urines est le repère le plus simple : claires et abondantes, l'apport est suffisant ; foncées et rares, il ne l'est pas. Soif intense, bouche sèche, maux de tête et vertiges au lever sont des signes plus tardifs. Chez la personne âgée, la soif s'émousse : mieux vaut boire à intervalles réguliers.",
      },
      {
        q: "Comment s'hydrater pendant le Ramadan ?",
        a: "Répartissez les apports entre la rupture du jeûne et l'aube, par petites quantités régulières plutôt qu'en une fois, et privilégiez l'eau, les soupes, les fruits et les légumes riches en eau. Limitez les boissons très sucrées et l'effort physique aux heures chaudes. En cas de maladie chronique, de grossesse ou de traitement, l'adaptation se discute avec un médecin avant le mois de jeûne.",
      },
      {
        q: "Boire beaucoup d'eau protège-t-il des calculs rénaux ?",
        a: "Un apport hydrique suffisant est la mesure de prévention la mieux établie contre la récidive des calculs urinaires : il dilue les urines et limite la cristallisation. L'objectif est habituellement d'obtenir des urines claires tout au long de la journée. Après un premier calcul, la conduite se précise avec un urologue ou un néphrologue.",
      },
      {
        q: "Peut-on boire trop d'eau ?",
        a: "Oui, c'est rare mais réel : boire des quantités très importantes en peu de temps peut diluer le sodium sanguin et provoquer une hyponatrémie, avec maux de tête, nausées et confusion. Le risque concerne surtout les efforts très longs et certaines situations médicales. Répartir les apports sur la journée l'évite.",
      },
    ],
    sources: [
      {
        label: "Scientific Opinion on Dietary Reference Values for water",
        publisher: "Autorité européenne de sécurité des aliments (EFSA)",
        year: "2010",
      },
      { label: "Chaleur et santé — repères de prévention", publisher: "Organisation mondiale de la Santé" },
      { label: "Prévention de la récidive des calculs urinaires — apports hydriques", publisher: "Référentiel d'urologie" },
    ],
  },

  "frequence-cardiaque": {
    name: "Fréquence cardiaque",
    h1: "Fréquence cardiaque : zones cibles et fréquence maximale",
    metaTitle: "Fréquence cardiaque cible : calcul des zones (Karvonen)",
    metaDesc:
      "Calculez votre fréquence cardiaque maximale et vos zones d'entraînement par la méthode Karvonen, et situez votre fréquence cardiaque de repos.",
    teaser: "Votre zone d'entraînement cible, votre fréquence maximale estimée et la lecture de votre pouls de repos.",
    intro:
      "Deux chiffres suffisent à personnaliser un entraînement : la fréquence cardiaque maximale, qui dépend surtout de l'âge, et la fréquence de repos, qui reflète votre condition physique. La méthode Karvonen les combine pour calculer des zones adaptées à vous, là où un simple pourcentage de la fréquence maximale ignore votre niveau.",
    fields: {
      age: { label: "Votre âge" },
      fcRepos: { label: "Fréquence cardiaque de repos", hint: "Au réveil, allongé, avant de vous lever. Comptez les battements sur une minute." },
    },
    resultLabel: "Zone d'entraînement cible",
    detailLabels: {
      fcMax: "Fréquence cardiaque maximale estimée",
      zoneEchauffement: "Échauffement et récupération (50–60 %)",
      zoneEndurance: "Endurance fondamentale (60–70 %)",
      zoneSoutenue: "Effort soutenu (70–80 %)",
      zoneIntense: "Effort intense (80–90 %)",
    },
    categories: {
      basse: {
        label: "Pouls de repos bas",
        range: "moins de 50 bpm",
        advice:
          "Un pouls bas est habituel chez les sportifs d'endurance entraînés et n'a alors rien d'inquiétant. Il mérite en revanche un avis médical s'il s'accompagne de vertiges, de malaises, d'essoufflement ou d'une fatigue inhabituelle, ou s'il est apparu récemment sans changement d'entraînement.",
      },
      sportive: {
        label: "Pouls de repos de personne entraînée",
        range: "de 50 à 59 bpm",
        advice:
          "Cette valeur traduit généralement une bonne condition cardiovasculaire. Suivre son évolution est plus instructif qu'un chiffre isolé : une hausse durable de cinq à dix battements peut signaler une fatigue accumulée, un manque de sommeil ou un début d'infection.",
      },
      habituelle: {
        label: "Pouls de repos habituel",
        range: "de 60 à 80 bpm",
        advice:
          "Vous êtes dans la fourchette la plus courante chez l'adulte. L'activité d'endurance régulière fait baisser cette valeur en quelques semaines : c'est l'un des effets les plus rapidement mesurables de l'entraînement.",
      },
      haute: {
        label: "Pouls de repos élevé",
        range: "de 81 à 100 bpm",
        advice:
          "Cette valeur reste dans les limites de la normale mais se situe dans le haut de la fourchette. Elle peut refléter un manque d'activité, du stress, un sommeil insuffisant, de la caféine, une fièvre ou une anémie. Si elle persiste au repos et au calme, parlez-en à un médecin.",
      },
      tachycardie: {
        label: "Pouls de repos anormalement rapide",
        range: "plus de 100 bpm",
        advice:
          "Un pouls de repos durablement supérieur à 100 battements par minute s'appelle une tachycardie et justifie un avis médical, même sans gêne ressentie. Reprenez d'abord la mesure après cinq minutes de calme. Palpitations, gêne respiratoire, douleur dans la poitrine ou malaise imposent de consulter sans attendre.",
      },
    },
    refColumns: { category: "Fréquence de repos", range: "Valeurs" },
    refCaption:
      "Repères de fréquence cardiaque de repos chez l'adulte. Les zones d'entraînement sont calculées sur la réserve cardiaque, c'est-à-dire l'écart entre la fréquence maximale et la fréquence de repos.",
    notes: {
      formuleEstimation:
        "La fréquence maximale est estimée à partir de l'âge : l'écart individuel réel atteint couramment dix battements en plus ou en moins. Seul un test d'effort la mesure précisément.",
      betaBloquants:
        "Si vous prenez un bêtabloquant ou un autre traitement ralentissant le cœur, ces formules ne s'appliquent pas : vos zones doivent être définies par votre médecin, idéalement après un test d'effort.",
      arretEffort:
        "Arrêtez immédiatement l'effort en cas de douleur dans la poitrine, d'essoufflement inhabituel, de palpitations, de vertiges ou de malaise, et demandez un avis médical avant de reprendre.",
      mesureRepos:
        "Aucune zone d'entraînement n'est affichée : à ce niveau de pouls au repos, elles n'auraient aucun sens et suivre un effort ciblé serait imprudent. Reprenez la mesure après cinq minutes assis au calme, sans café ni cigarette dans l'heure précédente. Si le chiffre se confirme, faites-le vérifier avant toute reprise du sport.",
    },
    limits: [
      "Elle estime la fréquence maximale par une formule d'âge : elle ne remplace pas un test d'effort, seul examen qui la mesure et vérifie la tolérance cardiaque.",
      "Elle n'est pas valable sous bêtabloquant ou autre traitement ralentisseur du rythme, ni en cas de trouble du rythme comme la fibrillation auriculaire.",
      "Elle ne constitue pas un certificat d'aptitude au sport : après 35 ans, en cas de reprise, de facteurs de risque cardiovasculaire ou d'antécédents, un avis médical préalable est recommandé.",
      "Elle ne dépiste aucune maladie cardiaque : un pouls normal n'exclut rien.",
    ],
    howTo: [
      "La fréquence maximale est estimée par la formule de Tanaka : 208 − 0,7 × âge, plus fidèle que l'ancien « 220 − âge ».",
      "La réserve cardiaque est l'écart entre cette fréquence maximale et votre fréquence de repos.",
      "Chaque zone applique un pourcentage à cette réserve, puis y ajoute la fréquence de repos — c'est la méthode Karvonen, qui individualise les zones selon votre condition.",
      "La zone cible affichée correspond à 60 à 80 % de la réserve, l'intervalle habituellement recommandé pour progresser en endurance.",
    ],
    faq: [
      {
        q: "Quelle est une fréquence cardiaque de repos normale ?",
        a: "Chez l'adulte, la fourchette habituelle va de 60 à 100 battements par minute au repos. Les sportifs d'endurance descendent souvent entre 40 et 60 sans que cela soit anormal. Au-delà de 100 au repos et au calme, on parle de tachycardie et un avis médical est justifié.",
      },
      {
        q: "Comment mesurer son pouls de repos ?",
        a: "Le matin au réveil, encore allongé, posez deux doigts sur le poignet ou le côté du cou et comptez les battements pendant une minute complète. Répétez trois matins de suite et retenez la moyenne : une mesure isolée est influencée par le réveil, le stress ou le café de la veille.",
      },
      {
        q: "Pourquoi ne pas utiliser « 220 moins l'âge » ?",
        a: "Cette formule ancienne surestime la fréquence maximale chez les personnes jeunes et la sous-estime après 40 ans. La formule de Tanaka, publiée en 2001, colle mieux aux mesures réelles sur l'ensemble des âges : c'est celle utilisée ici.",
      },
      {
        q: "Dans quelle zone s'entraîner pour perdre du poids ?",
        a: "La dépense totale compte davantage que la zone. S'entraîner en endurance fondamentale permet de tenir plus longtemps et de mieux récupérer, donc de dépenser plus sur la semaine ; les efforts intenses dépensent plus par minute mais se répètent moins. Une alimentation adaptée reste le levier principal.",
      },
      {
        q: "Faut-il un avis médical avant de reprendre le sport au Maroc ?",
        a: "C'est recommandé après 35 ans, en cas de reprise après une longue interruption, de facteurs de risque cardiovasculaire, d'antécédents familiaux d'accident cardiaque précoce ou de symptômes à l'effort. Le médecin du sport réalise le bilan d'aptitude et, si besoin, un test d'effort ; il délivre aussi le certificat demandé par les clubs.",
      },
    ],
    sources: [
      {
        label: "Tanaka H, Monahan KD, Seals DR — Age-predicted maximal heart rate revisited",
        publisher: "Journal of the American College of Cardiology",
        year: "2001",
      },
      { label: "Karvonen MJ, Kentala E, Mustala O — The effects of training on heart rate", publisher: "Annales Medicinae Experimentalis et Biologiae Fenniae", year: "1957" },
      {
        label: "Activité physique — fiche d'information",
        publisher: "Organisation mondiale de la Santé",
        url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
      },
    ],
  },

  "date-accouchement": {
    name: "Date d'accouchement",
    h1: "Calcul de la date d'accouchement et des semaines de grossesse",
    metaTitle: "Calcul date d'accouchement : DPA et semaines (SA)",
    metaDesc:
      "Calculez votre date prévue d'accouchement et votre âge gestationnel en semaines d'aménorrhée, avec les périodes clés du suivi de grossesse au Maroc.",
    teaser: "Votre date prévue d'accouchement, votre âge gestationnel en semaines et les fenêtres d'échographie à ne pas manquer.",
    intro:
      "La date prévue d'accouchement se calcule à partir du premier jour de vos dernières règles, ajusté à la longueur de votre cycle. C'est une estimation de repère : moins de 5 % des naissances tombent exactement ce jour-là, et un accouchement est considéré à terme entre 37 et 41 semaines d'aménorrhée révolues. Seule l'échographie du premier trimestre datera précisément votre grossesse.",
    fields: {
      ddr: { label: "Premier jour de vos dernières règles", hint: "Le premier jour des saignements, pas le dernier." },
      cycle: { label: "Longueur habituelle de votre cycle", hint: "Du premier jour des règles au premier jour des suivantes. 28 jours par défaut." },
    },
    resultLabel: "Vous en êtes à",
    detailLabels: {
      dpa: "Date prévue d'accouchement",
      termeDebut: "Début du terme (37 SA)",
      termeFin: "Fin du terme (41 SA)",
      echoT1: "Échographie du 1ᵉʳ trimestre",
      echoT2: "Échographie du 2ᵉ trimestre",
    },
    categories: {
      t1: {
        label: "Premier trimestre",
        range: "jusqu'à 13 SA + 6 jours",
        advice:
          "C'est la période des premiers repères : confirmation de la grossesse, échographie de datation entre 11 et 13 semaines + 6 jours, premier bilan sanguin, supplémentation en acide folique. Nausées et fatigue intenses sont fréquentes mais ne doivent pas empêcher de vous alimenter et de vous hydrater.",
      },
      t2: {
        label: "Deuxième trimestre",
        range: "de 14 à 27 SA",
        advice:
          "Trimestre généralement le plus confortable. Il concentre l'échographie morphologique (autour de 20 à 25 SA) et le dépistage du diabète gestationnel. Les mouvements du bébé deviennent perceptibles, souvent entre 18 et 22 semaines pour un premier enfant.",
      },
      t3: {
        label: "Troisième trimestre",
        range: "de 28 à 36 SA",
        advice:
          "Le suivi se rapproche : consultations mensuelles puis plus fréquentes, échographie de croissance, préparation à la naissance et choix de la maternité. C'est aussi le moment d'organiser vos démarches administratives et votre congé.",
      },
      terme: {
        label: "À terme",
        range: "de 37 à 41 SA",
        advice:
          "Votre grossesse est à terme : l'accouchement peut se déclencher à tout moment. Contractions régulières et rapprochées, perte des eaux ou saignement sont des motifs pour rejoindre la maternité sans attendre.",
      },
      depasse: {
        label: "Terme dépassé",
        range: "42 SA et plus",
        advice:
          "Au-delà de 42 semaines d'aménorrhée, la surveillance devient rapprochée en milieu spécialisé. Si ce calcul reflète bien votre situation, contactez votre maternité aujourd'hui même — vérifiez d'abord la date saisie, une erreur de saisie donne ce résultat.",
      },
    },
    refColumns: { category: "Période", range: "Âge gestationnel" },
    refCaption:
      "Découpage de la grossesse en semaines d'aménorrhée (SA), comptées depuis le premier jour des dernières règles. Un accouchement à terme survient entre 37 et 41 SA révolues.",
    notes: {
      estimationDate:
        "Cette date est une estimation calculée sur un cycle régulier. L'échographie du premier trimestre reste la référence pour dater la grossesse, en particulier si vos cycles sont irréguliers ou si la date de vos dernières règles est incertaine.",
      depassementTerme:
        "Un terme calculé au-delà de 42 semaines demande un avis obstétrical rapide, pas une attente. Contactez votre maternité.",
    },
    limits: [
      "Le calcul suppose une ovulation régulière : sur cycles irréguliers, après un arrêt de contraception hormonale ou en cas de doute sur la date des dernières règles, il peut se tromper de plusieurs jours.",
      "Il ne s'applique pas aux grossesses obtenues par fécondation in vitro, datées à partir du transfert d'embryon.",
      "Il ne dit rien du bon déroulement de la grossesse : seul le suivi médical le vérifie.",
      "Il ne remplace ni l'échographie de datation, ni les consultations de suivi.",
    ],
    howTo: [
      "La règle de Naegele ajoute 280 jours — 40 semaines — au premier jour des dernières règles.",
      "Un cycle plus long ou plus court décale l'ovulation : le calcul ajoute la différence entre votre cycle et 28 jours.",
      "L'âge gestationnel est exprimé en semaines d'aménorrhée (SA), comptées depuis le premier jour des dernières règles — et non depuis la conception, qui survient environ deux semaines plus tard.",
    ],
    faq: [
      {
        q: "Comment calculer sa date d'accouchement ?",
        a: "On ajoute 280 jours, soit 40 semaines, au premier jour des dernières règles, puis on corrige selon la longueur du cycle. Un cycle de 32 jours décale la date d'environ quatre jours. Cette estimation est ensuite confirmée ou corrigée par l'échographie du premier trimestre.",
      },
      {
        q: "Quelle différence entre semaines de grossesse et semaines d'aménorrhée ?",
        a: "Les semaines d'aménorrhée (SA) se comptent depuis le premier jour des dernières règles ; les semaines de grossesse depuis la conception, environ deux semaines plus tard. Une grossesse de 12 SA correspond donc à environ 10 semaines de grossesse. Les professionnels de santé au Maroc raisonnent en SA.",
      },
      {
        q: "Quand faire la première échographie ?",
        a: "L'échographie de datation se réalise entre 11 semaines et 13 semaines + 6 jours d'aménorrhée. C'est la période où la mesure de l'embryon date la grossesse le plus précisément, et où se fait le dépistage du premier trimestre.",
      },
      {
        q: "Combien de temps dure le congé de maternité au Maroc ?",
        a: "Le Code du travail marocain prévoit 14 semaines de congé de maternité pour les salariées, dont une partie obligatoirement prise après l'accouchement. Les modalités d'indemnisation relèvent de la CNSS : renseignez-vous auprès de votre employeur et de votre caisse pour les démarches et les délais de dépôt.",
      },
      {
        q: "Mon terme est dépassé, est-ce inquiétant ?",
        a: "Un dépassement de quelques jours au-delà de la date prévue est fréquent et se surveille. Au-delà de 41 semaines révolues, la maternité met en place une surveillance rapprochée et discute d'un déclenchement. Ne restez pas sans contact avec votre équipe de suivi.",
      },
      {
        q: "Qui suit une grossesse au Maroc ?",
        a: "Le gynécologue-obstétricien et la sage-femme assurent le suivi ; le choix dépend de votre situation et du niveau de risque. Une grossesse sans complication peut être suivie par une sage-femme, avec orientation vers l'obstétricien si nécessaire.",
      },
    ],
    sources: [
      {
        label: "Recommandations sur les soins prénatals pour que la grossesse soit une expérience positive",
        publisher: "Organisation mondiale de la Santé",
        year: "2016",
      },
      { label: "Estimation de la date d'accouchement — règle de Naegele", publisher: "Référentiel obstétrical" },
      { label: "Code du travail marocain (loi n° 65-99), articles relatifs au congé de maternité", publisher: "Royaume du Maroc" },
    ],
  },

  "semaines-grossesse": {
    name: "Semaines de grossesse",
    h1: "Semaines de grossesse : conversion en mois et en SA",
    metaTitle: "Semaines de grossesse en mois : tableau de conversion",
    metaDesc:
      "Convertissez les semaines d'aménorrhée en semaines de grossesse et en mois. Comprenez pourquoi votre médecin compte en SA et pas en mois, et où vous en êtes.",
    teaser: "La conversion entre semaines d'aménorrhée, semaines de grossesse et mois — les deux comptages qui prêtent à confusion.",
    intro:
      "« Vous êtes à 20 semaines » : de quelles semaines parle-t-on ? Au Maroc comme en France, les professionnels comptent en semaines d'aménorrhée (SA), depuis le premier jour des dernières règles. Les semaines de grossesse, elles, partent de la conception — deux semaines plus tard. D'où un décalage constant, et beaucoup de malentendus. Cet outil fait la conversion dans les deux sens et vous situe en mois.",
    fields: {
      sa: { label: "Où en êtes-vous, en semaines d'aménorrhée (SA) ?", hint: "Le chiffre que vous donne votre médecin ou votre sage-femme, de 1 à 42." },
    },
    resultLabel: "Vous êtes dans votre",
    detailLabels: {
      semainesAmenorrhee: "Semaines d'aménorrhée (comptage médical)",
      semainesGrossesse: "Semaines de grossesse (depuis la conception)",
      dansLeMois: "Semaines écoulées dans ce mois",
      restantAvantTerme: "Semaines restantes avant 40 SA",
    },
    categories: {
      t1: {
        label: "Premier trimestre",
        range: "de 1 à 13 SA — mois 1 à 3",
        advice:
          "Trimestre de la mise en place : l'échographie de datation, entre 11 et 13 SA + 6 jours, est celle qui fixera votre terme avec précision. C'est aussi la période où les nausées et la fatigue sont les plus marquées.",
      },
      t2: {
        label: "Deuxième trimestre",
        range: "de 14 à 27 SA — mois 4 à 6",
        advice:
          "Le trimestre le plus confortable en général. Il concentre l'échographie morphologique, autour de 20 à 25 SA, et le dépistage du diabète gestationnel. Les mouvements deviennent perceptibles, souvent entre 18 et 22 SA pour un premier enfant.",
      },
      t3: {
        label: "Troisième trimestre",
        range: "de 28 à 36 SA — mois 7 à 9",
        advice:
          "Le suivi se rapproche et la préparation à la naissance commence. C'est aussi le moment d'organiser le choix de la maternité et les démarches administratives.",
      },
      terme: {
        label: "À terme",
        range: "de 37 à 42 SA",
        advice:
          "À partir de 37 SA révolues, l'accouchement peut se déclencher à tout moment et la grossesse est considérée à terme jusqu'à 41 SA. Contractions régulières, perte des eaux ou saignement : rejoignez la maternité sans attendre.",
      },
    },
    refColumns: { category: "Trimestre", range: "Correspondance SA / mois" },
    refCaption:
      "Un mois obstétrical vaut environ 4 semaines et un tiers, ce qui explique que les mois ne tombent pas sur des semaines rondes. Le mois affiché est le mois en cours, pas le mois révolu.",
    notes: {
      deuxComptages:
        "Retenez l'écart : semaines de grossesse = semaines d'aménorrhée − 2. Une grossesse de 12 SA correspond à 10 semaines de grossesse. Les professionnels de santé au Maroc raisonnent en SA.",
      echographieDate:
        "Ces conversions supposent un terme calculé sur des cycles réguliers. Seule l'échographie du premier trimestre date la grossesse avec précision : si elle a corrigé votre terme, partez du chiffre en SA qu'elle a donné.",
    },
    limits: [
      "Elle convertit des semaines, elle ne date pas votre grossesse : c'est l'échographie du premier trimestre qui le fait.",
      "Le passage en mois suit une convention obstétricale (un mois ≈ 4 semaines et un tiers) : d'autres tableaux peuvent décaler d'une semaine selon la convention retenue.",
      "Elle ne dit rien du développement du bébé ni du bon déroulement de la grossesse, qui relèvent du suivi médical.",
      "Elle ne s'applique pas aux grossesses obtenues par fécondation in vitro, datées à partir du transfert d'embryon.",
    ],
    howTo: [
      "Les semaines de grossesse sont obtenues en retirant 2 aux semaines d'aménorrhée : la conception survient environ deux semaines après le début des dernières règles.",
      "Le mois de grossesse se calcule sur les semaines de grossesse, à raison d'environ 4 semaines et un tiers par mois, et correspond au mois EN COURS.",
      "Le trimestre suit le découpage habituel du suivi : jusqu'à 13 SA, de 14 à 27 SA, puis de 28 SA au terme.",
    ],
    faq: [
      {
        q: "20 SA, c'est combien de mois de grossesse ?",
        a: "20 semaines d'aménorrhée correspondent à 18 semaines de grossesse, soit le cinquième mois en cours — on dit souvent « quatre mois et demi ». C'est aussi la période de l'échographie morphologique.",
      },
      {
        q: "Quelle est la différence entre SA et semaines de grossesse ?",
        a: "Les semaines d'aménorrhée se comptent depuis le premier jour des dernières règles ; les semaines de grossesse depuis la conception, environ deux semaines plus tard. L'écart est donc de 2 semaines, constant. Au Maroc, les professionnels de santé comptent en SA : c'est le chiffre qui figure sur vos comptes rendus.",
      },
      {
        q: "Combien de semaines dure une grossesse ?",
        a: "Une grossesse à terme dure 40 semaines d'aménorrhée en moyenne, soit 38 semaines de grossesse, ou neuf mois. L'accouchement est considéré à terme entre 37 et 41 SA révolues.",
      },
      {
        q: "Pourquoi les mois ne correspondent-ils pas à 4 semaines ?",
        a: "Parce qu'un mois calendaire vaut environ 4 semaines et un tiers, pas 4. Sur neuf mois, l'écart cumulé atteint près de trois semaines : c'est pourquoi les tableaux de correspondance ne tombent jamais sur des semaines rondes, et pourquoi deux tableaux peuvent différer d'une semaine.",
      },
      {
        q: "Mon échographie a changé mon terme, que dois-je utiliser ?",
        a: "Le chiffre donné par l'échographie du premier trimestre. C'est la mesure la plus fiable pour dater une grossesse, et elle prime sur tout calcul fondé sur la date des dernières règles, surtout si vos cycles sont irréguliers.",
      },
    ],
    sources: [
      {
        label: "Recommandations sur les soins prénatals pour que la grossesse soit une expérience positive",
        publisher: "Organisation mondiale de la Santé",
        year: "2016",
      },
      { label: "Datation de la grossesse et âge gestationnel", publisher: "Référentiel obstétrical" },
    ],
  },

  ovulation: {
    name: "Calcul d'ovulation",
    h1: "Calcul d'ovulation et de la fenêtre de fertilité",
    metaTitle: "Calcul ovulation : date et fenêtre de fertilité",
    metaDesc:
      "Estimez votre date d'ovulation et votre fenêtre de fertilité sur trois cycles à partir de vos dernières règles. Repères clairs et limites de la méthode.",
    teaser: "Votre fenêtre de fertilité estimée sur trois cycles, la date d'ovulation probable et vos prochaines règles.",
    intro:
      "L'ovulation ne se situe pas au milieu du cycle mais à distance fixe de sa fin : la phase lutéale, entre l'ovulation et les règles suivantes, dure environ 14 jours quelle que soit la longueur du cycle. C'est cette règle qu'applique le calcul. La fenêtre affichée est une estimation statistique, utile pour planifier une grossesse — jamais pour l'éviter.",
    fields: {
      ddr: { label: "Premier jour de vos dernières règles", hint: "Le premier jour des saignements." },
      cycle: { label: "Longueur habituelle de votre cycle", hint: "Du premier jour des règles au premier jour des suivantes." },
      luteale: { label: "Longueur de la phase lutéale", hint: "Entre l'ovulation et les règles. 14 jours si vous ne la connaissez pas." },
    },
    resultLabel: "Fenêtre de fertilité estimée",
    detailLabels: {
      ovulation: "Jour d'ovulation probable",
      prochainesRegles: "Prochaines règles attendues",
      cycleSuivant: "Ovulation du cycle suivant",
      cycleTroisieme: "Ovulation du 3ᵉ cycle",
    },
    categories: {
      regulier: {
        label: "Cycle dans les repères habituels",
        range: "de 24 à 35 jours",
        advice:
          "Un cycle de cette durée permet une estimation raisonnablement fiable de l'ovulation. Pour affiner, les tests d'ovulation urinaires détectent le pic hormonal 24 à 36 heures avant, et la glaire cervicale devient claire et filante à l'approche de la période fertile.",
      },
      court: {
        label: "Cycle court",
        range: "moins de 24 jours",
        advice:
          "Des cycles courts rapprochent l'ovulation du début du cycle et rendent l'estimation plus fragile. S'ils sont récents, très irréguliers, ou accompagnés de saignements entre les règles, un avis gynécologique est utile pour en chercher la cause.",
      },
      long: {
        label: "Cycle long",
        range: "plus de 35 jours",
        advice:
          "Des cycles longs ou espacés peuvent traduire une ovulation irrégulière, parfois liée au syndrome des ovaires polykystiques ou à un trouble thyroïdien. Si vous cherchez à concevoir depuis plus de six mois avec ce profil, consultez sans attendre douze mois.",
      },
    },
    refColumns: { category: "Profil de cycle", range: "Durée" },
    refCaption:
      "La fenêtre de fertilité couvre les cinq jours précédant l'ovulation et le jour suivant : les spermatozoïdes survivent jusqu'à cinq jours dans les voies génitales, l'ovocyte environ vingt-quatre heures.",
    notes: {
      pasContraception:
        "Cette estimation n'est pas une méthode de contraception. Le calendrier ne protège pas d'une grossesse : une ovulation peut avancer ou reculer de plusieurs jours, y compris sur des cycles habituellement réguliers.",
      cycleIrregulier:
        "Plus vos cycles varient d'un mois à l'autre, moins cette estimation est fiable. Le suivi de plusieurs cycles, les tests d'ovulation ou une échographie donnent des repères bien plus solides.",
    },
    limits: [
      "Elle suppose une phase lutéale stable et des cycles réguliers : ni l'un ni l'autre n'est garanti, notamment après un accouchement, un arrêt de contraception ou en période de stress important.",
      "Elle ne détecte pas l'ovulation : elle la prédit. Seuls les tests hormonaux, la courbe de température ou l'échographie l'objectivent.",
      "Elle ne convient pas comme moyen d'éviter une grossesse.",
      "Elle n'évalue pas la fertilité : ni la qualité de l'ovulation, ni la perméabilité des trompes, ni le spermogramme du partenaire.",
    ],
    howTo: [
      "Les prochaines règles sont estimées en ajoutant la longueur de votre cycle au premier jour des dernières règles.",
      "L'ovulation est placée à la durée de la phase lutéale avant ces règles — 14 jours par défaut — car c'est cette phase qui est la plus stable d'une femme à l'autre.",
      "La fenêtre de fertilité couvre les cinq jours précédant l'ovulation et le jour suivant, d'après la durée de survie des gamètes.",
    ],
    faq: [
      {
        q: "Comment savoir quand j'ovule ?",
        a: "Le calcul donne une estimation à partir de vos cycles. Pour l'objectiver, les tests d'ovulation urinaires repèrent le pic de LH 24 à 36 heures avant l'ovulation ; la glaire cervicale devient transparente et filante ; la température corporelle s'élève légèrement juste après. En cas de doute persistant, le gynécologue peut proposer un suivi échographique.",
      },
      {
        q: "Quels sont les jours les plus fertiles du cycle ?",
        a: "Les deux jours précédant l'ovulation et le jour de l'ovulation offrent les meilleures chances de conception. Des rapports tous les deux jours pendant la fenêtre fertile suffisent : une fréquence plus élevée n'améliore pas les chances.",
      },
      {
        q: "Peut-on utiliser ce calcul comme contraception ?",
        a: "Non, et c'est important. Une ovulation peut se décaler sans signe préalable, et les spermatozoïdes survivent plusieurs jours. Les méthodes fondées sur le calendrier comptent parmi les moins efficaces. Pour une contraception fiable, parlez-en à un professionnel de santé.",
      },
      {
        q: "Mes cycles sont irréguliers, que faire ?",
        a: "Notez la durée de plusieurs cycles consécutifs pour dégager une tendance, et utilisez plutôt les tests d'ovulation. Des cycles très variables, absents ou espacés de plus de 35 jours méritent un avis gynécologique : ils peuvent révéler un syndrome des ovaires polykystiques ou un déséquilibre thyroïdien.",
      },
      {
        q: "Après combien de temps consulter pour infertilité ?",
        a: "En règle générale après douze mois de rapports réguliers sans grossesse, et après six mois passé 35 ans. Consultez plus tôt en cas de cycles très irréguliers, d'absence de règles, d'antécédent d'infection génitale ou de chirurgie pelvienne. Le bilan concerne les deux partenaires.",
      },
    ],
    sources: [
      {
        label: "Wilcox AJ, Weinberg CR, Baird DD — Timing of sexual intercourse in relation to ovulation",
        publisher: "New England Journal of Medicine",
        year: "1995",
      },
      { label: "Infertilité — fiche d'information", publisher: "Organisation mondiale de la Santé", url: "https://www.who.int/news-room/fact-sheets/detail/infertility" },
      { label: "Physiologie du cycle menstruel et prédiction de l'ovulation", publisher: "Référentiel de gynécologie" },
    ],
  },

  "calendrier-vaccinal": {
    name: "Calendrier vaccinal",
    h1: "Calendrier vaccinal du Maroc : les dates de votre enfant",
    metaTitle: "Calendrier vaccinal Maroc : dates selon la naissance",
    metaDesc:
      "Entrez la date de naissance de votre enfant et obtenez les dates de chaque rendez-vous de vaccination, d'après le calendrier officiel du Programme national d'immunisation.",
    teaser: "Les dates de chaque vaccin de votre enfant, calculées depuis sa date de naissance sur le calendrier officiel.",
    intro:
      "Le Programme national d'immunisation fixe les vaccins et les âges auxquels ils sont administrés, gratuitement dans les centres de santé publics. Cet outil applique ce calendrier officiel à la date de naissance de votre enfant pour vous donner des dates concrètes — et surtout le prochain rendez-vous à ne pas manquer.",
    fields: {
      naissance: { label: "Date de naissance de l'enfant", hint: "Le calendrier officiel couvre de la naissance à 5 ans." },
    },
    columns: { jalon: "Échéance", vaccins: "Vaccins prévus" },
    resultLabel: "Prochain rendez-vous",
    detailLabels: {
      prochainsVaccins: "Vaccins prévus à ce rendez-vous",
    },
    categories: {
      aVenir: {
        label: "Calendrier à démarrer",
        range: "de la naissance au premier mois",
        advice:
          "Les premiers vaccins se donnent très tôt : le BCG, la première dose contre l'hépatite B et la dose 0 de polio orale concernent les tout premiers jours. Si la naissance a eu lieu à domicile, présentez-vous au centre de santé dès que possible : c'est là que le carnet de vaccination sera ouvert.",
      },
      enCours: {
        label: "Calendrier en cours",
        range: "de 2 mois à 5 ans",
        advice:
          "Les rendez-vous se rapprochent entre 2 et 4 mois, puis s'espacent. Présentez toujours le carnet de santé : c'est lui qui fait foi sur ce qui a déjà été administré, et il permet au professionnel de rattraper une dose manquante sans tout recommencer.",
      },
      termine: {
        label: "Calendrier de la petite enfance terminé",
        range: "après 5 ans",
        advice:
          "Les jalons du calendrier officiel de la petite enfance sont derrière vous. Des rappels sont prévus plus tard : leur nature et leur rythme relèvent du calendrier officiel en vigueur, que votre centre de santé ou votre pédiatre vous précisera. Vérifiez aussi qu'aucune dose ne manque sur le carnet.",
      },
      retard: {
        label: "Doses possiblement en retard",
        range: "jalon dépassé",
        advice:
          "Un retard se rattrape presque toujours sans tout reprendre depuis le début. Présentez le carnet à un professionnel : il déterminera les doses manquantes et un calendrier de rattrapage adapté à l'âge.",
      },
    },
    refColumns: { category: "Situation", range: "Période" },
    refCaption:
      "Le calendrier appliqué est celui du Programme national d'immunisation, tel que publié par le Centre Anti Poison et de Pharmacovigilance du Maroc. Les dates calculées sont des repères : seul le professionnel qui voit l'enfant valide ce qui doit être administré.",
    notes: {
      carnetSante:
        "Cet outil ne sait pas ce qui a déjà été administré : les jalons passés apparaissent en grisé et sont à vérifier sur le carnet de santé, jamais à considérer comme faits.",
      calendrierOfficiel:
        "Le calendrier officiel peut évoluer. En cas de différence avec ce que vous indique votre centre de santé ou votre pédiatre, c'est leur version qui fait foi.",
      rattrapage:
        "Un vaccin oublié se rattrape : il n'est généralement pas nécessaire de recommencer toute la série. Consultez plutôt que de renoncer.",
    },
    limits: [
      "Il calcule des dates théoriques à partir de la naissance : il ne sait pas quels vaccins ont réellement été administrés, ni s'il existe une contre-indication.",
      "Il ne couvre que le calendrier de la petite enfance, de la naissance à 5 ans, tel que publié dans le document officiel.",
      "Il ne remplace ni le carnet de santé, ni l'avis du professionnel qui suit l'enfant, notamment en cas de prématurité, de maladie chronique ou de traitement affaiblissant l'immunité.",
      "Il ne traite pas les vaccins hors programme national (voyage, situations particulières), qui se discutent en consultation.",
    ],
    howTo: [
      "Chaque jalon du calendrier officiel — naissance, premier mois, 2, 3, 4, 9, 12, 18 mois et 5 ans — est reporté sur la date de naissance saisie.",
      "Les vaccins affichés à chaque jalon sont exactement ceux du tableau officiel, à la colonne d'âge correspondante.",
      "Le prochain rendez-vous à venir est mis en avant ; les jalons déjà passés sont grisés, car l'outil ne peut pas savoir s'ils ont été honorés.",
    ],
    faq: [
      {
        q: "Quels sont les vaccins obligatoires au Maroc et à quel âge ?",
        a: "Le Programme national d'immunisation couvre la tuberculose (BCG), l'hépatite B, la poliomyélite (orale et injectable), la diphtérie-tétanos-coqueluche avec Hib et hépatite B (pentavalent), le pneumocoque, le rotavirus et la rougeole-rubéole. Les rendez-vous se situent à la naissance, durant le premier mois, puis à 2, 3, 4, 9, 12 et 18 mois, avec un dernier rappel à 5 ans. Entrez la date de naissance ci-dessus pour obtenir les dates de votre enfant.",
      },
      {
        q: "Les vaccins sont-ils gratuits au Maroc ?",
        a: "Oui, les vaccins du Programme national d'immunisation sont fournis gratuitement dans les centres de santé publics. Ils peuvent aussi être administrés en cabinet privé, où la consultation et le vaccin sont alors à votre charge, selon les modalités du praticien.",
      },
      {
        q: "Mon enfant a manqué un vaccin, faut-il tout recommencer ?",
        a: "Non, dans la très grande majorité des cas. Un retard se rattrape : le professionnel évalue les doses déjà reçues sur le carnet et propose un schéma de rattrapage adapté à l'âge. Mieux vaut un rattrapage tardif qu'une absence de protection.",
      },
      {
        q: "Pourquoi le BCG figure-t-il « durant le premier mois » et pas à la naissance ?",
        a: "Parce que c'est ainsi qu'il apparaît dans le tableau officiel. En pratique, il est souvent administré dès la maternité ; mais le calendrier prévoit le premier mois, ce qui permet de vacciner l'enfant né à domicile lors de son premier contact avec le centre de santé. Nous reproduisons le document sans le réinterpréter.",
      },
      {
        q: "Et après 5 ans ?",
        a: "Le document officiel utilisé ici s'arrête à 5 ans. Des rappels existent au-delà, mais nous ne les inventons pas : demandez leur nature et leur rythme à votre centre de santé ou à votre médecin, qui disposent du calendrier en vigueur.",
      },
      {
        q: "Mon enfant est né prématurément, le calcul s'applique-t-il ?",
        a: "Les dates calculées partent de la naissance réelle, mais la prématurité peut modifier certains schémas vaccinaux. C'est précisément une situation où l'avis du pédiatre prime sur tout calcul automatique.",
      },
    ],
    sources: [
      {
        label: "Calendrier national de vaccination — Programme national d'immunisation",
        publisher: "Centre Anti Poison et de Pharmacovigilance du Maroc (Ministère de la Santé)",
        url: "https://www.capm-sante.ma/uploads/documents/CALENDRIER%20Vaccination%20Maroc.pdf",
      },
      {
        label: "Vaccins et immunisation — fiche d'information",
        publisher: "Organisation mondiale de la Santé",
        url: "https://www.who.int/fr/news-room/fact-sheets/detail/immunization-coverage",
      },
      { label: "Vaccination", publisher: "Assurance Maladie", url: "https://www.ameli.fr/assure/sante/themes/vaccination" },
    ],
  },

  "dose-paracetamol": {
    name: "Dose de paracétamol",
    h1: "Dose de paracétamol pour un enfant : calcul au poids",
    metaTitle: "Dose paracétamol enfant : calcul au poids (sirop)",
    metaDesc:
      "Calculez la dose de paracétamol en sirop d'après le poids de votre enfant et la concentration inscrite sur votre flacon : millilitres par prise, intervalle et dose maximale par jour.",
    teaser: "La dose en millilitres pour votre flacon, calculée sur le poids — jamais sur l'âge — avec la dose maximale à ne pas franchir.",
    intro:
      "La dose de paracétamol chez l'enfant se calcule sur le POIDS, jamais sur l'âge : c'est la règle de base, et la cause d'erreur la plus fréquente. Cet outil applique la posologie de référence — 15 mg par kilo et par prise, sans dépasser 60 mg par kilo et par jour — à la concentration inscrite sur votre propre flacon. Il ne remplace pas l'ordonnance ni l'avis du pharmacien : en cas de doute sur ce que vous lisez, montrez le flacon.",
    fields: {
      poids: { label: "Poids de l'enfant", hint: "Le poids réel et récent, en kilogrammes. Ne l'estimez pas d'après l'âge." },
      ageMois: { label: "Âge de l'enfant", hint: "En mois. En dessous de 3 mois, aucune dose n'est proposée : la fièvre impose un avis médical." },
      mgParMl: {
        label: "Concentration du flacon, en mg par mL",
        hint: "À lire sur votre flacon. Un sirop à 2,4 % contient 24 mg par mL ; « 120 mg / 5 mL » correspond à 24 mg par mL. En cas de doute, demandez au pharmacien.",
      },
    },
    resultLabel: "Dose par prise",
    detailLabels: {
      doseMg: "Soit en milligrammes par prise",
      intervalle: "Intervalle minimal entre deux prises",
      prisesMax: "Nombre maximal de prises par 24 h",
      maxJour: "Dose maximale sur 24 h — à ne jamais dépasser",
    },
    categories: {
      moinsDeTroisMois: {
        label: "Aucune dose n'est proposée avant 3 mois",
        range: "moins de 3 mois",
        advice:
          "Chez un nourrisson de moins de 3 mois, une fièvre n'est jamais banale et se traite après examen, pas en automédication. Nous n'affichons volontairement aucune dose : contactez un médecin ou rendez-vous aux urgences pédiatriques sans attendre. Refus de boire, somnolence inhabituelle, gêne respiratoire ou enfant impossible à consoler imposent d'appeler les secours.",
      },
      nourrisson: {
        label: "Nourrisson",
        range: "de 3 à 23 mois",
        advice:
          "À cet âge, pesez l'enfant plutôt que de vous fier à l'âge : le poids évolue vite et la dose en dépend entièrement. Utilisez uniquement la pipette ou la seringue fournie avec le flacon, jamais une cuillère de cuisine. Si la fièvre dure plus de 48 heures, ou si le comportement change, consultez.",
      },
      enfant: {
        label: "Enfant",
        range: "de 2 à 11 ans",
        advice:
          "Le paracétamol soulage la douleur et la fièvre ; il ne traite pas la cause. Il n'est pas nécessaire de faire baisser une fièvre bien tolérée à tout prix : l'objectif est le confort de l'enfant. Faites-le boire régulièrement et ne le couvrez pas trop.",
      },
      grandEnfant: {
        label: "Grand enfant",
        range: "12 ans et plus",
        advice:
          "À l'approche du poids adulte, la dose plafonne : au-delà de 50 kg, ce sont les repères de l'adulte qui s'appliquent et ce calculateur ne les couvre pas. Demandez au pharmacien la présentation adaptée.",
      },
    },
    refColumns: { category: "Tranche d'âge", range: "Âge" },
    refCaption:
      "Posologie de référence du paracétamol par voie orale chez l'enfant : 15 mg/kg par prise, 60 mg/kg par jour au maximum, 4 prises au plus, au moins 6 heures d'intervalle. La dose ne dépasse jamais le plafond de l'adulte.",
    notes: {
      avisObligatoire:
        "Avant 3 mois, toute fièvre justifie un avis médical rapide, sans exception et sans automédication préalable.",
      pipetteGraduee:
        "Utilisez exclusivement la pipette ou la seringue graduée livrée avec CE flacon : une pipette d'un autre produit ne donne pas la même dose. Jamais de cuillère à café.",
      paracetamolCache:
        "Vérifiez que l'enfant ne reçoit pas déjà du paracétamol sous un autre nom : beaucoup de sirops contre le rhume, la toux ou la douleur en contiennent. Additionnées, ces prises provoquent des surdosages, et le paracétamol est la première cause d'atteinte du foie par médicament chez l'enfant.",
      poidsReel:
        "Le calcul repose sur le poids réel. Un poids surestimé de deux kilos, c'est une dose surestimée de 30 mg par prise : pesez l'enfant plutôt que d'estimer.",
      quandConsulter:
        "Consultez si la fièvre dépasse 48 heures, si elle réapparaît après amélioration, ou devant tout signe inhabituel : refus de boire, somnolence, gêne respiratoire, taches qui ne s'effacent pas à la pression, ou enfant impossible à consoler.",
    },
    limits: [
      "Il ne couvre QUE la suspension buvable (sirop). Pour les sachets, comprimés ou suppositoires, la présentation se choisit selon le poids en pharmacie : ne fractionnez jamais un sachet ou un comprimé de vous-même.",
      "Il ne s'applique pas avant 3 mois, ni au-delà de 50 kg, ni en cas de maladie du foie ou des reins, de dénutrition, de déshydratation ou de traitement en cours : ces situations modifient la posologie et relèvent du médecin.",
      "Il ne remplace ni l'ordonnance, ni la notice du produit, ni l'avis du pharmacien — qui, lui, voit votre flacon.",
      "Il ne dit pas s'il FAUT donner du paracétamol : une fièvre bien tolérée ne se traite pas systématiquement, et une douleur qui persiste doit être expliquée, pas seulement soulagée.",
    ],
    howTo: [
      "La dose par prise applique 15 mg de paracétamol par kilogramme de poids réel.",
      "Cette dose en milligrammes est divisée par la concentration que vous avez lue sur votre flacon, pour donner un volume en millilitres.",
      "La dose maximale sur 24 heures retient 60 mg par kilogramme, plafonnée à la dose maximale de l'adulte, en 4 prises au plus espacées d'au moins 6 heures.",
      "En dessous de 3 mois, ou si le poids saisi est incompatible avec l'âge, aucun résultat n'est affiché : le calcul est bloqué plutôt qu'approximatif.",
    ],
    faq: [
      {
        q: "Quelle dose de paracétamol pour un enfant selon son poids ?",
        a: "La règle est de 15 mg par kilogramme et par prise, à renouveler au maximum toutes les 6 heures, sans dépasser 60 mg par kilogramme sur 24 heures. Pour un enfant de 12 kg, cela fait 180 mg par prise et 720 mg au maximum par jour. Le volume en millilitres dépend de la concentration de votre flacon : c'est pour cela que l'outil vous la demande.",
      },
      {
        q: "Pourquoi calculer sur le poids et pas sur l'âge ?",
        a: "Parce que deux enfants du même âge peuvent peser du simple au double. Les repères par âge des boîtes sont des moyennes : chez un enfant petit pour son âge, ils conduisent à un surdosage. Le poids réel est la seule base fiable.",
      },
      {
        q: "Combien de temps entre deux doses ?",
        a: "Au moins 6 heures, et pas plus de 4 prises par 24 heures. Un intervalle de 4 heures n'est envisageable que sur avis médical. Si la fièvre remonte avant 6 heures, ce n'est pas la dose qu'il faut augmenter : c'est un motif de consultation.",
      },
      {
        q: "Que faire si j'ai donné une dose de trop ?",
        a: "Ne pas attendre l'apparition de symptômes : un surdosage de paracétamol peut atteindre le foie sans signe immédiat. Appelez le Centre Anti Poison du Maroc ou rendez-vous aux urgences avec le flacon, en indiquant la quantité et l'heure des prises.",
      },
      {
        q: "Peut-on alterner paracétamol et ibuprofène ?",
        a: "L'alternance n'apporte pas de bénéfice démontré et multiplie les risques d'erreur de dose. L'ibuprofène est par ailleurs déconseillé en cas de varicelle ou d'infection cutanée, et de déshydratation. Cette décision revient au médecin, pas à un calculateur.",
      },
      {
        q: "Faut-il faire baisser toute fièvre ?",
        a: "Non. La fièvre est une réaction utile de défense ; l'objectif est le confort de l'enfant, pas un chiffre sur le thermomètre. Un enfant qui joue, boit et dort correctement avec 38,5 °C n'a pas forcément besoin d'un médicament. Faites-le boire, allégez ses vêtements, et traitez s'il est gêné.",
      },
    ],
    sources: [
      {
        label: "Bien utiliser les médicaments antalgiques contre la douleur",
        publisher: "Assurance Maladie",
        url: "https://www.ameli.fr/assure/sante/medicaments/utiliser-recycler-medicaments/utiliser-antalgiques",
      },
      { label: "Paracétamol chez l'enfant — posologie au poids", publisher: "Référentiel de pédiatrie" },
      { label: "Fièvre chez l'enfant : conduite à tenir", publisher: "Manuel MSD, version grand public" },
    ],
  },

  "tension-arterielle": {
    name: "Tension artérielle",
    h1: "Tension artérielle : interpréter vos chiffres",
    metaTitle: "Tension artérielle normale ? Interprétez vos chiffres",
    metaDesc:
      "Situez votre tension artérielle selon la classification européenne de référence : catégories, seuils d'alerte et conditions d'une mesure fiable.",
    teaser: "Votre tension située dans la classification de référence, avec les seuils qui justifient un avis médical.",
    intro:
      "Une tension artérielle s'écrit avec deux chiffres : la systolique, pression au moment où le cœur éjecte le sang, et la diastolique, pression entre deux battements. Cet outil situe vos chiffres dans la classification européenne de référence. Une mesure isolée ne suffit jamais à conclure : le diagnostic d'hypertension repose sur des mesures répétées, réalisées dans de bonnes conditions.",
    fields: {
      systolique: { label: "Systolique (chiffre du haut)", hint: "Le plus élevé des deux, par exemple 128." },
      diastolique: { label: "Diastolique (chiffre du bas)", hint: "Le plus bas des deux, par exemple 82." },
    },
    resultLabel: "Votre tension",
    detailLabels: {
      pressionPulsee: "Écart entre les deux chiffres",
    },
    categories: {
      hypotension: {
        label: "Tension basse",
        range: "moins de 90 ou moins de 60",
        advice:
          "Une tension basse n'est pas une maladie si elle ne provoque aucun symptôme, et elle est fréquente chez les personnes jeunes et minces. Elle mérite un avis si elle s'accompagne de vertiges au lever, de malaises, de fatigue inhabituelle, ou si elle apparaît sous traitement antihypertenseur.",
      },
      optimale: {
        label: "Tension optimale",
        range: "moins de 120 et moins de 80",
        advice:
          "Vos chiffres sont dans la zone la plus favorable. Un contrôle tous les un à deux ans suffit chez l'adulte sans facteur de risque particulier.",
      },
      normale: {
        label: "Tension normale",
        range: "120–129 ou 80–84",
        advice:
          "Ces valeurs restent normales. Un contrôle annuel est raisonnable, en particulier en cas d'antécédents familiaux d'hypertension, de surpoids ou de diabète.",
      },
      normaleHaute: {
        label: "Tension normale haute",
        range: "130–139 ou 85–89",
        advice:
          "Zone à surveiller : sans être une hypertension, elle en précède souvent une. C'est le moment où l'hygiène de vie a le plus d'effet — réduction du sel, activité physique régulière, poids, alcool, tabac. Un contrôle rapproché est recommandé.",
      },
      grade1: {
        label: "Hypertension de grade 1",
        range: "140–159 ou 90–99",
        advice:
          "Ces chiffres évoquent une hypertension légère, à confirmer par plusieurs mesures sur plusieurs jours avant toute conclusion. Prenez rendez-vous : un bilan recherche un retentissement et les autres facteurs de risque cardiovasculaire.",
      },
      grade2: {
        label: "Hypertension de grade 2",
        range: "160–179 ou 100–109",
        advice:
          "Une hypertension modérée à sévère justifie une consultation sans tarder, avec bilan cardiovasculaire, rénal et biologique. Plus la prise en charge est précoce, plus le risque d'accident cardiaque ou vasculaire cérébral diminue.",
      },
      grade3: {
        label: "Hypertension de grade 3",
        range: "180 et plus, ou 110 et plus",
        advice:
          "Ce niveau demande un avis médical rapide, même sans aucun symptôme. Répétez la mesure après dix minutes de repos ; si elle se confirme, consultez le jour même. En présence de douleur thoracique, de gêne respiratoire, de maux de tête violents, de troubles de la vue ou de la parole, appelez les secours.",
      },
    },
    refColumns: { category: "Catégorie", range: "Systolique / diastolique (mmHg)" },
    refCaption:
      "Classification de la pression artérielle chez l'adulte selon les recommandations européennes. La catégorie retenue est toujours celle du chiffre le plus élevé.",
    notes: {
      mesureUnique:
        "Une seule mesure ne permet pas de conclure. Le diagnostic d'hypertension repose sur des chiffres élevés confirmés lors de plusieurs consultations, ou sur une automesure conduite selon un protocole précis.",
      protocoleMesure:
        "Pour une mesure fiable : assis, dos appuyé, après cinq minutes de repos, bras nu posé à hauteur du cœur, sans avoir fumé, bu de café ni fait d'effort dans les trente minutes. Prenez deux mesures espacées d'une minute et retenez la moyenne.",
    },
    limits: [
      "Il classe des chiffres, il ne pose pas de diagnostic : seule une confirmation par un professionnel, sur mesures répétées, permet de parler d'hypertension.",
      "Les seuils présentés sont ceux de l'adulte : ils ne s'appliquent ni à l'enfant, ni à la femme enceinte, chez qui la surveillance obéit à d'autres règles.",
      "Il ne tient pas compte de votre traitement, de vos antécédents, de votre fonction rénale ni de votre risque cardiovasculaire global.",
      "Il ne remplace ni l'automesure encadrée, ni la mesure ambulatoire sur 24 heures, qui restent les examens de référence.",
    ],
    howTo: [
      "Les deux chiffres saisis sont comparés aux bornes de la classification européenne de référence.",
      "La catégorie retenue est celle du chiffre le plus élevé : une tension de 135/95 est classée sur la diastolique, en hypertension de grade 1.",
      "À partir de 180 de systolique ou 110 de diastolique, l'outil affiche un avertissement invitant à un avis médical rapide.",
    ],
    faq: [
      {
        q: "Quelle est une tension artérielle normale ?",
        a: "Chez l'adulte, une tension est considérée normale en dessous de 140/90 mmHg mesurée au cabinet, et optimale en dessous de 120/80. Entre 130/85 et 139/89, on parle de tension normale haute : à surveiller, car elle précède souvent une hypertension.",
      },
      {
        q: "Quel chiffre compte le plus, le haut ou le bas ?",
        a: "Les deux, mais leur poids varie avec l'âge. Avant 50 ans, la diastolique est souvent la plus informative ; après, la systolique devient le meilleur indicateur de risque. Dans tous les cas, c'est le chiffre le plus élevé qui détermine la catégorie.",
      },
      {
        q: "À partir de quand faut-il s'inquiéter ?",
        a: "Une tension égale ou supérieure à 180/110 mmHg demande un avis médical rapide, même sans symptôme. Elle devient une urgence en présence de douleur thoracique, d'essoufflement, de maux de tête intenses, de troubles visuels, de difficulté à parler ou de faiblesse d'un côté du corps : appelez alors le 141 ou le 15.",
      },
      {
        q: "Ma tension est plus élevée chez le médecin, est-ce normal ?",
        a: "C'est fréquent : on parle d'effet blouse blanche. À l'inverse, une tension normale au cabinet peut masquer une hypertension à domicile. C'est pourquoi l'automesure à domicile ou la mesure sur 24 heures est souvent demandée avant de conclure.",
      },
      {
        q: "L'hypertension donne-t-elle des symptômes ?",
        a: "Le plus souvent aucun, pendant des années — c'est ce qui la rend dangereuse. Maux de tête, saignements de nez ou bourdonnements ne sont ni constants ni spécifiques. Seule la mesure régulière permet de la repérer.",
      },
      {
        q: "Quel médecin consulter au Maroc pour ma tension ?",
        a: "Le médecin généraliste assure le dépistage, la confirmation et le suivi de la plupart des hypertensions. Le cardiologue intervient en cas de chiffres élevés, de retentissement cardiaque, de traitement difficile à équilibrer ou d'autres facteurs de risque associés. Vous pouvez consulter l'un ou l'autre directement.",
      },
    ],
    sources: [
      {
        label: "Recommandations pour la prise en charge de l'hypertension artérielle",
        publisher: "Société européenne de cardiologie et Société européenne d'hypertension",
        year: "2018",
      },
      { label: "Hypertension — fiche d'information", publisher: "Organisation mondiale de la Santé", url: "https://www.who.int/news-room/fact-sheets/detail/hypertension" },
    ],
  },

  "risque-diabete": {
    name: "Risque de diabète",
    h1: "Test de risque de diabète de type 2 (score FINDRISC)",
    metaTitle: "Risque de diabète type 2 : test FINDRISC en 8 questions",
    metaDesc:
      "Évaluez votre risque de développer un diabète de type 2 dans les dix ans avec le score FINDRISC, validé scientifiquement. Résultat immédiat et conduite à tenir.",
    teaser: "Votre risque de diabète de type 2 à dix ans, calculé avec le score FINDRISC validé.",
    intro:
      "Le diabète de type 2 s'installe silencieusement, souvent des années avant d'être découvert. Le score FINDRISC, validé par la recherche et utilisé en pratique clinique, estime en huit questions la probabilité d'en développer un dans les dix prochaines années. Il ne dit pas si vous êtes diabétique aujourd'hui : cela, seule une analyse de sang le détermine.",
    fields: {
      sexe: { label: "Sexe", hint: "Les seuils de tour de taille diffèrent selon le sexe." },
      age: { label: "Âge" },
      poids: { label: "Poids", hint: "En kilogrammes." },
      taille: { label: "Taille", hint: "En centimètres." },
      tourTaille: { label: "Tour de taille", hint: "Mesuré à mi-distance entre la dernière côte et le haut du bassin, en fin d'expiration." },
      activite: { label: "Pratiquez-vous au moins 30 minutes d'activité physique par jour ?", hint: "Travail et déplacements compris." },
      fruitsLegumes: { label: "Mangez-vous des fruits ou des légumes chaque jour ?" },
      traitementTension: { label: "Prenez-vous un traitement contre l'hypertension ?" },
      glycemieElevee: { label: "Vous a-t-on déjà trouvé une glycémie élevée ?", hint: "Lors d'une prise de sang, d'une grossesse ou d'une maladie." },
      antecedents: { label: "Un membre de votre famille est-il diabétique ?" },
    },
    options: {
      femme: "Femme",
      homme: "Homme",
      oui: "Oui",
      non: "Non",
      aucun: "Non, personne",
      second: "Oui : grand-parent, oncle, tante ou cousin",
      premier: "Oui : parent, frère, sœur ou enfant",
    },
    resultLabel: "Votre score FINDRISC",
    detailLabels: {
      imc: "Indice de masse corporelle calculé",
    },
    categories: {
      faible: {
        label: "Risque faible",
        range: "moins de 7 points",
        advice:
          "Environ 1 personne sur 100 avec ce score développe un diabète de type 2 dans les dix ans. Conserver une activité physique régulière et un poids stable suffit à maintenir ce niveau ; un contrôle de glycémie tous les trois ans reste raisonnable après 45 ans.",
      },
      legerementEleve: {
        label: "Risque légèrement élevé",
        range: "de 7 à 11 points",
        advice:
          "Environ 1 personne sur 25 développera un diabète dans les dix ans. C'est le moment où les changements d'habitudes sont les plus rentables : activité physique quotidienne, réduction des sucres rapides et des boissons sucrées, surveillance du tour de taille.",
      },
      modere: {
        label: "Risque modéré",
        range: "de 12 à 14 points",
        advice:
          "Environ 1 personne sur 6 développera un diabète dans les dix ans. Une glycémie à jeun ou une hémoglobine glyquée est justifiée pour faire le point, et un accompagnement sur l'alimentation et l'activité physique réduit nettement ce risque.",
      },
      eleve: {
        label: "Risque élevé",
        range: "de 15 à 20 points",
        advice:
          "Environ 1 personne sur 3 développera un diabète dans les dix ans. Un bilan biologique est nécessaire pour vérifier si le diabète n'est pas déjà installé. Une prise en charge structurée a démontré qu'elle pouvait réduire fortement le passage au diabète.",
      },
      tresEleve: {
        label: "Risque très élevé",
        range: "plus de 20 points",
        advice:
          "Environ 1 personne sur 2 développera un diabète dans les dix ans, et il est possible qu'il soit déjà présent sans symptôme. Prenez rendez-vous rapidement pour une glycémie à jeun et un avis médical : un diabète non traité abîme silencieusement les reins, les yeux, les nerfs et les artères.",
      },
    },
    refColumns: { category: "Niveau de risque", range: "Score (sur 26)" },
    refCaption:
      "Interprétation du score FINDRISC : probabilité de développer un diabète de type 2 dans les dix années suivantes, établie sur des cohortes de population.",
    notes: {
      pasDiagnostic:
        "Ce score évalue un risque futur ; il ne dit pas si vous êtes diabétique aujourd'hui. Seule une analyse de sang — glycémie à jeun ou hémoglobine glyquée — permet de poser ce diagnostic.",
      scoreValide:
        "Le FINDRISC a été construit et validé sur des cohortes finlandaises puis utilisé dans de nombreux pays. Il ne prend pas en compte tous les facteurs de risque connus, notamment le diabète gestationnel et l'origine ethnique.",
    },
    limits: [
      "Il ne dépiste pas un diabète déjà installé : un score faible n'exclut pas un diabète présent, et seule une prise de sang tranche.",
      "Il concerne le diabète de type 2 de l'adulte, pas le type 1 ni le diabète gestationnel.",
      "Il ne tient pas compte d'un antécédent de diabète pendant une grossesse, d'un syndrome des ovaires polykystiques ni de l'origine ethnique, qui pèsent aussi sur le risque.",
      "Il n'évalue ni votre risque cardiovasculaire global, ni la présence de complications.",
    ],
    howTo: [
      "Le score additionne huit facteurs : âge, indice de masse corporelle, tour de taille, activité physique, consommation de fruits et légumes, traitement antihypertenseur, glycémie élevée déjà constatée et antécédents familiaux.",
      "Chaque réponse vaut de 0 à 5 points, pour un total de 0 à 26.",
      "Le total est comparé aux cinq niveaux de risque définis par les auteurs du score.",
    ],
    faq: [
      {
        q: "Le score FINDRISC est-il fiable ?",
        a: "C'est l'un des scores de risque de diabète les mieux validés : construit sur des cohortes suivies pendant dix ans, il est utilisé dans de nombreux pays comme outil de dépistage de première ligne. Il estime un risque de population, pas une certitude individuelle : un score élevé n'annonce pas un diabète inévitable, un score faible ne le met pas hors de portée.",
      },
      {
        q: "Comment savoir si j'ai déjà du diabète ?",
        a: "Par une analyse de sang. Une glycémie à jeun égale ou supérieure à 1,26 g/l à deux reprises, ou une hémoglobine glyquée à 6,5 % ou plus, définit le diabète. Soif intense, urines fréquentes, fatigue et amaigrissement inexpliqué doivent faire consulter rapidement, mais le diabète de type 2 est le plus souvent silencieux.",
      },
      {
        q: "Peut-on éviter un diabète de type 2 quand le risque est élevé ?",
        a: "En grande partie, oui. Les grands essais de prévention ont montré qu'une perte de poids modérée, de l'ordre de 5 à 7 %, associée à une activité physique régulière, réduit fortement le passage au diabète chez les personnes à risque — davantage, dans certaines études, qu'un traitement médicamenteux.",
      },
      {
        q: "Comment mesurer correctement son tour de taille ?",
        a: "Debout, sans vêtement serré, placez le mètre à mi-distance entre la dernière côte et le haut de l'os du bassin, puis mesurez en fin d'expiration sans serrer. Le risque augmente au-delà de 94 cm chez l'homme et 80 cm chez la femme.",
      },
      {
        q: "Quel médecin consulter au Maroc pour un risque élevé ?",
        a: "Commencez par un médecin généraliste ou un endocrinologue, qui prescrira le bilan sanguin et posera le cadre du suivi. Le nutritionniste et le diététicien interviennent ensuite sur l'alimentation. Vous pouvez consulter directement, sans lettre d'orientation.",
      },
      {
        q: "Mes réponses sont-elles enregistrées ?",
        a: "Non. Le score est calculé dans votre navigateur ; aucune de vos réponses n'est transmise ni conservée.",
      },
    ],
    sources: [
      {
        label: "Lindström J, Tuomilehto J — The Diabetes Risk Score : a practical tool to predict type 2 diabetes risk",
        publisher: "Diabetes Care",
        year: "2003",
      },
      { label: "Diabète — fiche d'information", publisher: "Organisation mondiale de la Santé", url: "https://www.who.int/news-room/fact-sheets/detail/diabetes" },
      { label: "Prévention du diabète de type 2 — recommandations", publisher: "Fédération internationale du diabète" },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Accesseur
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contenu localisé d'un outil. L'arabe est complété champ par champ depuis le
 * français : une traduction partielle ne laisse jamais de trou dans la page.
 */
export function getToolContent(slug: ToolSlug, locale: Locale = "fr"): ToolContent {
  const fr = FR[slug];
  if (locale !== "ar") return fr;
  const ar = TOOLS_CONTENT_AR[slug];
  if (!ar) return fr;
  return {
    ...fr,
    ...ar,
    fields: { ...fr.fields, ...(ar.fields ?? {}) },
    options: { ...(fr.options ?? {}), ...(ar.options ?? {}) },
    columns: { ...(fr.columns ?? {}), ...(ar.columns ?? {}) },
    detailLabels: { ...fr.detailLabels, ...(ar.detailLabels ?? {}) },
    categories: { ...fr.categories, ...(ar.categories ?? {}) },
    refColumns: { ...fr.refColumns, ...(ar.refColumns ?? {}) },
    notes: { ...fr.notes, ...(ar.notes ?? {}) },
  };
}

/** Contenu français brut — utilisé pour les libellés de secours et les tris. */
export function getToolContentFr(slug: ToolSlug): ToolContent {
  return FR[slug];
}
