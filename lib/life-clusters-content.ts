import type { Locale } from "./i18n";
import type { ClusterSlug } from "./life-clusters";
import { CLUSTERS_CONTENT_AR } from "./life-clusters-content-ar";

/**
 * Contenu éditorial des clusters « parcours de vie » — français (référence) et
 * arabe (`life-clusters-content-ar.ts`). Même convention que
 * `specialty-content.ts` : un enregistrement par locale + accesseur avec repli FR.
 *
 * ⚠️ Anti-cannibalisation : ce contenu ne redit JAMAIS ce que disent les fiches
 * qu'il agrège. Il explique le parcours et oriente ; le détail médical reste sur
 * la fiche, qui garde son autorité de page.
 */

export type ClusterSectionContent = {
  title: string;
  /** Une ou deux phrases de cadrage — le seul texte propre au hub. */
  lead: string;
};

export type ClusterContent = {
  /** Libellé court : cartes, fil d'Ariane, liens entre clusters. */
  name: string;
  h1: string;
  metaTitle: string;
  metaDesc: string;
  /** Chapô de la page. */
  intro: string;
  editorialTitle: string;
  editorialBody: string;
  sections: Record<string, ClusterSectionContent>;
  faq: { q: string; a: string }[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Français
// ─────────────────────────────────────────────────────────────────────────────

const FR: Record<ClusterSlug, ClusterContent> = {
  grossesse: {
    name: "Grossesse",
    h1: "Grossesse : suivi, examens et questions fréquentes",
    metaTitle: "Grossesse au Maroc : suivi, examens et calculateurs",
    metaDesc:
      "Tout le parcours d'une grossesse au Maroc : calcul de la date d'accouchement, examens du suivi, complications à connaître, inconforts fréquents et après la naissance.",
    intro:
      "Une grossesse se suit par étapes, chacune avec ses examens, ses repères et ses questions. Ce dossier rassemble ce que SantéauMaroc publie sur le sujet, du désir d'enfant aux premières semaines du nouveau-né, et vous mène directement au gynécologue-obstétricien ou à la sage-femme qui assurera votre suivi.",
    editorialTitle: "Comment utiliser ce dossier",
    editorialBody:
      "Les rubriques suivent l'ordre du parcours plutôt que celui d'un manuel : avant la grossesse, pendant le suivi, en cas de complication, pour les inconforts du quotidien, puis après la naissance. Chaque lien mène à une fiche relue par notre rédaction médicale. Aucun de ces contenus ne remplace vos consultations : une grossesse se suit avec un professionnel, qui connaît vos antécédents et vos examens.",
    sections: {
      avant: {
        title: "Avant la grossesse",
        lead: "Comprendre son cycle, repérer sa période fertile et savoir quand un délai à concevoir justifie un bilan.",
      },
      suivi: {
        title: "Le suivi de la grossesse",
        lead: "Datation, échographies et analyses qui jalonnent les neuf mois, avec le calcul de votre date prévue d'accouchement.",
      },
      complications: {
        title: "Ce qui demande une surveillance",
        lead: "Situations qui ne sont pas rares et se prennent bien en charge quand elles sont repérées tôt, à condition de ne pas manquer les consultations.",
      },
      inconforts: {
        title: "Les inconforts fréquents",
        lead: "Désagréments habituels de la grossesse : bénins le plus souvent, mais toujours à signaler s'ils deviennent intenses ou inhabituels.",
      },
      apres: {
        title: "Après la naissance",
        lead: "Les premières semaines concernent la mère autant que le bébé : allaitement, récupération, moral, et les motifs de consultation du nouveau-né.",
      },
    },
    faq: [
      {
        q: "Quand faire la première consultation de grossesse ?",
        a: "Dès que la grossesse est confirmée, sans attendre. La première consultation permet de dater la grossesse, de prescrire le premier bilan sanguin, de vérifier vos vaccinations et vos traitements en cours, et de mettre en place la supplémentation utile. Plus elle est précoce, mieux le suivi s'organise.",
      },
      {
        q: "Gynécologue ou sage-femme pour suivre ma grossesse au Maroc ?",
        a: "Les deux assurent le suivi. Une grossesse sans facteur de risque particulier peut être suivie par une sage-femme, avec orientation vers l'obstétricien si une situation le demande. Un antécédent médical, une grossesse multiple ou une complication orientent d'emblée vers le gynécologue-obstétricien.",
      },
      {
        q: "Quels examens sont obligatoires pendant la grossesse ?",
        a: "Le contenu exact du suivi est fixé par votre praticien selon votre situation, mais il repose partout sur les mêmes piliers : une échographie de datation au premier trimestre, une échographie morphologique au deuxième, des analyses de sang et d'urines répétées, et le dépistage du diabète gestationnel. Les fiches examens de ce dossier détaillent chacun d'eux.",
      },
      {
        q: "Que faire en cas de saignement ou de douleur pendant la grossesse ?",
        a: "Un saignement, une douleur abdominale intense, une perte de liquide, une fièvre, des maux de tête violents avec troubles de la vue, ou une diminution nette des mouvements du bébé imposent de contacter votre maternité sans attendre. Ces signes ne s'auto-évaluent pas : ils se font vérifier.",
      },
      {
        q: "Ces pages remplacent-elles le suivi médical ?",
        a: "Non. Elles vous aident à comprendre le parcours, à préparer vos questions et à repérer ce qui doit alerter. Le suivi, les examens et les décisions relèvent du professionnel qui vous accompagne.",
      },
    ],
  },

  nutrition: {
    name: "Nutrition",
    h1: "Nutrition et alimentation : repères, outils et fiches santé",
    metaTitle: "Nutrition : poids, alimentation et maladies chroniques",
    metaDesc:
      "Faire le point sur son poids, adapter son alimentation au diabète, au cholestérol ou à l'hypertension, comprendre les intolérances et les carences. Outils de calcul et fiches vérifiées.",
    intro:
      "L'alimentation intervient dans la plupart des maladies chroniques fréquentes au Maroc — surpoids, diabète de type 2, cholestérol, hypertension. Ce dossier réunit les outils pour situer vos repères, les fiches des maladies concernées et les guides pratiques adaptés à la cuisine marocaine. Pour un accompagnement personnalisé, il mène au nutritionniste ou au diététicien.",
    editorialTitle: "Un chiffre n'est pas un régime",
    editorialBody:
      "Les calculateurs de ce dossier donnent des repères : un indice, un tour de taille, une estimation de besoins. Ils ne construisent pas un plan alimentaire, qui dépend de vos habitudes, de votre budget, de vos contraintes et de votre état de santé. C'est le rôle du médecin nutritionniste, qui peut aussi prescrire les analyses utiles, et du diététicien, qui traduit les objectifs en repas réalistes. Nous ne publions aucun régime type : ce qui fonctionne durablement est ce qui tient dans votre quotidien.",
    sections: {
      poids: {
        title: "Faire le point sur son poids",
        lead: "Trois calculs complémentaires — indice de masse corporelle, tour de taille, besoins énergétiques — et les situations où un poids qui bouge sans raison doit faire consulter.",
      },
      chroniques: {
        title: "Alimentation et maladies chroniques",
        lead: "Là où l'assiette pèse le plus lourd : diabète, cholestérol, hypertension, goutte, foie et reins. Avec les guides adaptés aux plats marocains et au jeûne du Ramadan.",
      },
      digestion: {
        title: "Digestion, intolérances et allergies",
        lead: "Quand certains aliments ne passent pas : intolérances, maladie cœliaque, intestin irritable, allergies alimentaires — et comment on les distingue.",
      },
      carences: {
        title: "Carences et déficits",
        lead: "Fer, vitamine D, calcium : des manques fréquents au Maroc, qui se confirment par une analyse de sang avant toute supplémentation.",
      },
      quotidien: {
        title: "Bien manger et bien s'hydrater",
        lead: "Repères applicables tous les jours, y compris par forte chaleur et pour les âges où les besoins changent.",
      },
    },
    faq: [
      {
        q: "Nutritionniste ou diététicien : quelle différence ?",
        a: "Le médecin nutritionniste est docteur en médecine : il diagnostique, prescrit analyses et traitements et suit les pathologies associées. Le diététicien est un professionnel paramédical spécialisé dans la construction concrète des plans alimentaires et l'éducation nutritionnelle. Les deux sont complémentaires ; le choix dépend de votre situation.",
      },
      {
        q: "Faut-il une ordonnance pour consulter en nutrition au Maroc ?",
        a: "Non, vous pouvez consulter directement. Apporter vos dernières analyses — glycémie, bilan lipidique, thyroïde, fer — et la liste de vos traitements rend la première consultation beaucoup plus utile.",
      },
      {
        q: "Les régimes rapides fonctionnent-ils ?",
        a: "Ils font perdre du poids à court terme, mais la reprise est la règle, souvent au-delà du poids initial, avec une perte de masse musculaire au passage. Les changements qui durent sont progressifs et compatibles avec votre vie. Un déficit important ne se conduit pas sans suivi médical.",
      },
      {
        q: "Comment adapter son alimentation pendant le Ramadan avec un diabète ?",
        a: "Cette adaptation se prépare avec un médecin AVANT le mois de jeûne : ajustement des traitements, répartition des repas, surveillance de la glycémie, signes qui imposent de rompre le jeûne. Le guide dédié de ce dossier détaille les repères, mais il ne remplace pas cet avis préalable, indispensable dès qu'un traitement est en jeu.",
      },
      {
        q: "Ces outils conviennent-ils aux enfants ?",
        a: "Non. Chez l'enfant et l'adolescent, les repères varient avec l'âge et le sexe et se lisent sur les courbes de croissance : c'est le pédiatre qui les interprète. Le dossier santé de l'enfant traite de son alimentation.",
      },
    ],
  },

  "sante-enfant": {
    name: "Santé de l'enfant",
    h1: "Santé de l'enfant : motifs de consultation et repères",
    metaTitle: "Santé de l'enfant : fièvre, croissance, maladies",
    metaDesc:
      "Fièvre, toux, diarrhée, éruptions, sommeil, croissance, maladies chroniques de l'enfant : les repères des parents au Maroc et quand consulter un pédiatre.",
    intro:
      "Les parents se posent souvent les mêmes questions : cette fièvre est-elle inquiétante, cette toux doit-elle faire consulter, ce développement est-il normal ? Ce dossier rassemble les fiches et guides de SantéauMaroc consacrés à l'enfant, du nourrisson à l'adolescent, et mène au pédiatre quand un avis est nécessaire.",
    editorialTitle: "Un enfant n'est pas un adulte en petit",
    editorialBody:
      "Les seuils, les doses et l'interprétation des symptômes diffèrent chez l'enfant, et d'autant plus qu'il est jeune : ce qui est bénin à huit ans peut être urgent à deux mois. C'est pourquoi ce dossier n'inclut aucun calculateur — l'indice de masse corporelle, par exemple, ne s'interprète chez l'enfant que sur les courbes de croissance du carnet de santé, par un professionnel. Devant un nourrisson de moins de trois mois qui a de la fièvre, un enfant qui refuse de boire, qui est anormalement mou ou geignard, on ne cherche pas sur internet : on consulte sans attendre.",
    sections: {
      frequents: {
        title: "Les motifs de consultation les plus fréquents",
        lead: "Ce qui amène le plus souvent chez le pédiatre : fièvre, toux, otites, angines, diarrhées et gastro-entérites.",
      },
      eruptions: {
        title: "Éruptions et maladies de l'enfance",
        lead: "Boutons, plaques et taches : comment ces maladies se reconnaissent, lesquelles s'attrapent à l'école, et lesquelles la vaccination prévient.",
      },
      croissance: {
        title: "Croissance, sommeil et développement",
        lead: "Repères d'évolution, sommeil, vue, audition, langage et troubles de l'apprentissage — les sujets où un dépistage précoce change tout.",
      },
      alimentation: {
        title: "Alimentation de l'enfant",
        lead: "De la diversification aux allergies alimentaires, en passant par les carences les plus fréquentes au Maroc.",
      },
      chroniques: {
        title: "Maladies chroniques de l'enfant",
        lead: "Asthme, eczéma, allergies, épilepsie et maladies du sang : des situations qui se vivent bien quand le suivi est régulier.",
      },
      prevention: {
        title: "Prévention et suivi",
        lead: "Vaccination, choix du pédiatre et repères du suivi régulier — la partie du travail qui évite les consultations en urgence.",
      },
    },
    faq: [
      {
        q: "À partir de quelle température parle-t-on de fièvre chez l'enfant ?",
        a: "On parle de fièvre à partir de 38 °C mesurés. Ce n'est pas le chiffre qui décide de la gravité mais l'âge de l'enfant, son comportement et les signes associés. Avant trois mois, toute fièvre justifie un avis médical rapide, sans exception.",
      },
      {
        q: "Quand consulter en urgence pour un enfant ?",
        a: "Fièvre avant trois mois, refus de boire, somnolence inhabituelle ou enfant impossible à consoler, gêne respiratoire, taches qui ne s'effacent pas à la pression, convulsion, vomissements répétés avec diarrhée chez un nourrisson : ce sont des motifs de consultation immédiate ou d'appel des secours.",
      },
      {
        q: "Peut-on donner un médicament sans avis médical ?",
        a: "Les doses pédiatriques dépendent du poids, pas de l'âge, et beaucoup de médicaments courants chez l'adulte sont contre-indiqués chez l'enfant. Nous ne publions aucune posologie : demandez à votre pédiatre ou à votre pharmacien, et respectez précisément l'ordonnance.",
      },
      {
        q: "Faut-il consulter un pédiatre ou un généraliste ?",
        a: "Les deux suivent les enfants au Maroc. Le pédiatre est spécialisé dans l'enfant et particulièrement indiqué pour le nourrisson, le suivi de la croissance et les situations complexes. Le généraliste assure les motifs courants, souvent avec une meilleure disponibilité de proximité.",
      },
      {
        q: "Mon enfant grandit-il normalement ?",
        a: "La croissance ne se juge pas sur une mesure isolée mais sur une courbe suivie dans le temps, celle du carnet de santé. Un changement de rythme compte davantage qu'une valeur ponctuelle : c'est le pédiatre qui l'interprète, en tenant compte de la taille des parents et de la puberté.",
      },
    ],
  },

  vaccination: {
    name: "Vaccination",
    h1: "Vaccination au Maroc : de quoi elle protège",
    metaTitle: "Vaccination au Maroc : calendrier et maladies évitées",
    metaDesc:
      "Comprendre la vaccination au Maroc : où se faire vacciner, les maladies que les vaccins évitent chez l'enfant et l'adulte, les rappels et les vaccins du voyageur.",
    intro:
      "La vaccination est le geste de prévention dont l'effet est le mieux documenté : certaines maladies autrefois courantes au Maroc sont devenues rares grâce au programme national d'immunisation. Ce dossier explique de quoi les vaccins protègent, où se faire vacciner et à quels moments de la vie la question se repose.",
    editorialTitle: "Le calendrier officiel est celui du Ministère de la Santé",
    editorialBody:
      "Le programme national d'immunisation fixe les vaccins et les âges auxquels ils sont administrés, et les vaccins qu'il couvre sont gratuits dans les centres de santé publics. Nous ne reproduisons pas ce calendrier ici : il évolue, et une information périmée sur ce sujet serait plus nuisible qu'utile. Les guides de la première rubrique le détaillent, et votre centre de santé, votre pédiatre ou votre médecin traitant vous donneront la version en vigueur ainsi que la conduite à tenir en cas de retard — un retard se rattrape presque toujours, sans tout recommencer.",
    sections: {
      calendrier: {
        title: "Le calendrier vaccinal",
        lead: "Les guides qui détaillent les vaccins du programme national, chez l'enfant comme chez l'adulte et la personne âgée.",
      },
      enfance: {
        title: "Les maladies évitées chez l'enfant",
        lead: "Ce que la vaccination de l'enfance prévient réellement : des maladies que l'on voit peu aujourd'hui précisément parce qu'on vaccine.",
      },
      adulte: {
        title: "Vaccination de l'adulte et rappels",
        lead: "La vaccination ne s'arrête pas à l'enfance : rappels, vaccins saisonniers et vaccinations liées à l'âge ou à une situation particulière.",
      },
      voyage: {
        title: "Voyage et situations particulières",
        lead: "Selon la destination et la saison, certains vaccins et précautions s'anticipent plusieurs semaines avant le départ.",
      },
    },
    faq: [
      {
        q: "Où se faire vacciner au Maroc ?",
        a: "Les vaccins du programme national sont administrés gratuitement dans les centres de santé publics. En dehors de ce programme, votre médecin généraliste, votre pédiatre ou une clinique peuvent réaliser la vaccination, avec un vaccin délivré en pharmacie sur ordonnance.",
      },
      {
        q: "Que faire en cas de retard dans les vaccins ?",
        a: "Un retard se rattrape : il n'est presque jamais nécessaire de tout recommencer. Présentez le carnet de vaccination à un professionnel, qui déterminera les doses manquantes et le calendrier de rattrapage adapté à l'âge. Mieux vaut un rattrapage tardif qu'une absence de protection.",
      },
      {
        q: "Les vaccins de l'enfance suffisent-ils pour toute la vie ?",
        a: "Non. Certaines protections s'atténuent et demandent des rappels ; d'autres vaccinations se posent à l'âge adulte, selon l'âge, l'état de santé, la profession ou les voyages. C'est un point à évoquer lors d'une consultation, même en bonne santé.",
      },
      {
        q: "Quels vaccins prévoir avant un voyage ?",
        a: "Cela dépend de la destination, de la saison, de la durée et des conditions du séjour. La consultation se prépare idéalement quatre à six semaines avant le départ, car certains schémas demandent plusieurs doses. Un médecin ou un centre de vaccination internationale établit la liste adaptée.",
      },
      {
        q: "Pourquoi ce dossier ne donne-t-il pas les âges de chaque vaccin ?",
        a: "Parce que le calendrier relève du Ministère de la Santé et qu'il évolue. Publier des âges figés exposerait à diffuser une information périmée sur un sujet où l'erreur a des conséquences. Nous préférons vous renvoyer aux guides dédiés et à votre professionnel de santé, qui disposent de la version en vigueur.",
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Accesseur
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contenu localisé d'un cluster. L'arabe est complété champ par champ depuis le
 * français : une traduction partielle ne laisse jamais de trou dans la page.
 */
export function getClusterContent(slug: ClusterSlug, locale: Locale = "fr"): ClusterContent {
  const fr = FR[slug];
  if (locale !== "ar") return fr;
  const ar = CLUSTERS_CONTENT_AR[slug];
  if (!ar) return fr;
  return {
    ...fr,
    ...ar,
    sections: { ...fr.sections, ...(ar.sections ?? {}) },
  };
}
