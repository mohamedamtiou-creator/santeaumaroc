/**
 * Seed de contenu Q/R éditorial — SantéauMaroc.
 *
 * Objectif : peupler l'espace Questions/Réponses avec des questions patients
 * réalistes et des réponses de médecins vérifiés, exactes et adaptées au Maroc.
 * Cela amorce la confiance (preuve sociale + SEO/GEO) et incite à poser.
 *
 * Comportement :
 *  - « corrige » les 15 anciens placeholders (« Question de démo numéro N… »)
 *    en les transformant en vraies Q/R (on garde la ligne, on régénère le slug) ;
 *  - crée les items curés restants en net-neuf ;
 *  - complète la question « genou » existante (metaTitle/metaDesc manquants) ;
 *  - chaque réponse est signée par un médecin ACTIF de la spécialité visée,
 *    promu « vérifié » au passage (même logique que seed-qa-demo).
 *
 * Idempotent : ré-exécutable sans créer de doublons (détection par titre).
 */
import { prisma } from "../lib/prisma";
import { uniqueQuestionSlug, recomputeAnswerScore } from "../lib/qa";

type Curated = {
  title: string;
  body: string;
  specialty: string; // slug de spécialité (fallback medecine-generale)
  tags: string[];
  aiSummary: string;
  metaTitle: string;
  metaDesc: string;
  answer: string;
  upvotes?: number;
  thanks?: number;
};

const DISCLAIMER =
  "\n\nCette réponse est une information générale et ne remplace pas une consultation : un examen permet d'adapter la prise en charge à votre situation.";

const CURATED: Curated[] = [
  {
    title: "Combien de temps dure un rhume chez l'enfant et quand s'inquiéter ?",
    body: "Mon enfant de 4 ans a le nez qui coule et tousse depuis quelques jours. Pas de fièvre élevée. Combien de temps cela dure-t-il normalement et à partir de quand faut-il consulter ?",
    specialty: "pediatrie",
    tags: ["rhume", "enfant", "toux", "fièvre"],
    aiSummary:
      "Un rhume banal de l'enfant guérit seul en 7 à 10 jours ; la toux peut traîner 2 à 3 semaines. On surveille l'hydratation et la respiration. On consulte si fièvre > 3 jours, gêne respiratoire, refus de boire ou enfant de moins de 3 mois.",
    metaTitle: "Rhume de l'enfant : durée et quand consulter | SantéauMaroc",
    metaDesc:
      "Un rhume de l'enfant dure 7 à 10 jours. Découvrez les signes qui doivent amener à consulter un médecin ou pédiatre au Maroc.",
    answer:
      "Le rhume (rhinopharyngite) est l'infection la plus banale de l'enfant : il est d'origine virale, donc les antibiotiques sont inutiles. Un enfant peut faire 6 à 10 rhumes par an, surtout en crèche ou à l'école.\n\nÉvolution habituelle : nez bouché ou qui coule, toux et parfois fièvre modérée pendant 3 à 4 jours, puis amélioration en 7 à 10 jours. La toux résiduelle peut durer 2 à 3 semaines sans gravité.\n\nCe qui aide à la maison : lavages de nez au sérum physiologique plusieurs fois par jour, faire boire régulièrement, du paracétamol (Doliprane) à la dose adaptée au poids en cas de fièvre ou d'inconfort. On évite les sirops antitussifs avant 6 ans.\n\nConsultez un médecin ou un pédiatre si : fièvre élevée au-delà de 3 jours, respiration rapide ou difficile, sifflements, refus de boire, somnolence inhabituelle, ou douleur d'oreille. Avant l'âge de 3 mois, toute fièvre doit faire consulter rapidement." +
      DISCLAIMER,
    upvotes: 9,
    thanks: 6,
  },
  {
    title: "Diabète et jeûne du Ramadan : est-ce dangereux et comment se préparer ?",
    body: "Je suis diabétique de type 2 sous traitement et je souhaite jeûner pendant le Ramadan. Est-ce que je peux ? Quelles précautions dois-je prendre ?",
    specialty: "endocrinologie-et-maladies-metaboliques",
    tags: ["diabète", "ramadan", "jeûne", "glycémie"],
    aiSummary:
      "Beaucoup de diabétiques de type 2 équilibrés peuvent jeûner, mais cela demande une préparation médicale 6 à 8 semaines avant le Ramadan (adaptation du traitement, autosurveillance). Le jeûne est déconseillé en cas de diabète déséquilibré, de complications ou d'hypoglycémies fréquentes. On rompt le jeûne en cas de malaise.",
    metaTitle: "Diabète et jeûne du Ramadan : précautions | SantéauMaroc",
    metaDesc:
      "Jeûner avec un diabète au Maroc : qui peut, comment adapter son traitement et quels signes imposent de rompre le jeûne. Conseils d'un médecin.",
    answer:
      "Jeûner avec un diabète est possible pour de nombreux patients de type 2 bien équilibrés, mais cela ne s'improvise pas : c'est une décision à préparer avec votre médecin, idéalement 6 à 8 semaines avant le Ramadan.\n\nPoints clés à préparer ensemble :\n— Adapter les doses et les horaires des médicaments (certains comprimés et l'insuline doivent être réajustés pour le repas du soir).\n— Renforcer l'autosurveillance de la glycémie ; mesurer sa glycémie ne rompt pas le jeûne.\n— Bien s'hydrater entre l'Iftar et le Shour, et éviter l'excès de sucreries au moment de la rupture.\n\nLe jeûne est généralement déconseillé en cas de diabète déséquilibré, d'hypoglycémies répétées, de diabète de type 1 instable, de grossesse, d'insuffisance rénale ou de complications récentes.\n\nRompez le jeûne sans hésiter en cas de glycémie très basse (malaise, sueurs, tremblements, vision floue) ou très élevée, de soif intense ou de fatigue extrême. La religion autorise la rupture en cas de risque pour la santé." +
      DISCLAIMER,
    upvotes: 14,
    thanks: 11,
  },
  {
    title: "Quelle est la tension artérielle normale et à partir de quand parle-t-on d'hypertension ?",
    body: "On m'a dit que ma tension était un peu haute. À partir de quel chiffre faut-il s'inquiéter et que dois-je faire ?",
    specialty: "cardiologie",
    tags: ["tension", "hypertension", "cœur", "prévention"],
    aiSummary:
      "Une tension normale est inférieure à 140/90 mmHg au cabinet (et 135/85 à domicile). On parle d'hypertension quand elle reste élevée sur plusieurs mesures à des jours différents. Le diagnostic repose sur des mesures répétées, pas sur un chiffre isolé. Une tension très élevée avec symptômes est une urgence.",
    metaTitle: "Tension artérielle normale et hypertension | SantéauMaroc",
    metaDesc:
      "Quels chiffres de tension sont normaux et quand parle-t-on d'hypertension ? Conseils et quand consulter, expliqués par un cardiologue au Maroc.",
    answer:
      "La tension se lit avec deux chiffres, par exemple 12/8 (soit 120/80 mmHg). On considère qu'elle est normale en dessous de 140/90 mmHg mesurée au cabinet, ou 135/85 à domicile.\n\nUn chiffre isolé un peu élevé ne signifie pas que vous êtes hypertendu : le stress, la douleur ou un café récent peuvent la faire monter. Le diagnostic d'hypertension repose sur des mesures répétées, élevées, à plusieurs jours d'intervalle — souvent confirmées par une automesure à domicile ou un enregistrement sur 24 h (MAPA).\n\nCe qui aide naturellement : réduire le sel, limiter les plats très salés et la charcuterie, bouger 30 min par jour, perdre du poids si besoin, limiter l'alcool et le tabac, et bien dormir.\n\nConsultez rapidement, voire appelez les secours (15 / 141), si une tension très élevée s'accompagne de maux de tête violents, douleur dans la poitrine, troubles de la vue, difficulté à parler ou essoufflement : ce sont des signes d'alerte." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 4,
  },
  {
    title: "Comment traiter l'acné de l'adolescent ?",
    body: "Mon fils de 15 ans a beaucoup de boutons sur le visage et le dos. Quels soins simples peut-on faire et quand voir un dermatologue ?",
    specialty: "dermatologie",
    tags: ["acné", "adolescent", "peau", "boutons"],
    aiSummary:
      "L'acné est très fréquente à l'adolescence et se traite bien. On nettoie la peau en douceur, on évite de percer les boutons et les produits gras. Les traitements locaux en pharmacie aident les formes légères. On consulte un dermatologue si l'acné est étendue, inflammatoire ou laisse des cicatrices.",
    metaTitle: "Acné de l'adolescent : soins et traitements | SantéauMaroc",
    metaDesc:
      "Comment soigner l'acné à l'adolescence : gestes simples, traitements et quand consulter un dermatologue au Maroc. Conseils d'un médecin.",
    answer:
      "L'acné touche la grande majorité des adolescents : elle est liée aux hormones et à l'excès de sébum, pas à un manque d'hygiène. Elle se soigne très bien, mais demande de la patience (les résultats prennent souvent 6 à 8 semaines).\n\nGestes utiles au quotidien :\n— Nettoyer la peau matin et soir avec un produit doux, sans frotter fort.\n— Éviter de percer ou gratter les boutons (risque de cicatrices).\n— Préférer des crèmes et cosmétiques « non comédogènes ».\n— L'alimentation joue un rôle modéré ; inutile de se priver de façon stricte.\n\nPour les formes légères, des traitements locaux disponibles en pharmacie (à base de peroxyde de benzoyle ou de rétinoïdes) sont efficaces.\n\nConsultez un dermatologue si l'acné est étendue, très inflammatoire (gros boutons douloureux), résiste aux soins, retentit sur le moral, ou commence à laisser des marques : un traitement sur ordonnance évite les cicatrices durables." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 5,
  },
  {
    title: "Brûlures d'estomac et reflux : que faire au quotidien ?",
    body: "J'ai souvent des remontées acides et des brûlures après les repas, surtout le soir. Que puis-je changer et quand faut-il consulter ?",
    specialty: "gastro-enterologie",
    tags: ["reflux", "brûlures d'estomac", "digestion", "RGO"],
    aiSummary:
      "Le reflux acide est fréquent et souvent soulagé par des mesures simples : repas plus légers, ne pas s'allonger juste après manger, surélever la tête du lit, réduire café, plats épicés et tabac. On consulte si les symptômes sont fréquents, résistent, ou s'accompagnent de signes d'alerte (amaigrissement, difficulté à avaler, vomissements).",
    metaTitle: "Reflux et brûlures d'estomac : conseils | SantéauMaroc",
    metaDesc:
      "Reflux gastro-œsophagien : gestes qui soulagent les brûlures d'estomac et signes qui doivent amener à consulter. Conseils d'un médecin au Maroc.",
    answer:
      "Les brûlures et remontées acides traduisent souvent un reflux gastro-œsophagien (RGO), très fréquent et le plus souvent bénin.\n\nMesures qui soulagent vraiment :\n— Manger plus lentement et en quantité raisonnable, surtout le soir.\n— Attendre 2 à 3 heures avant de s'allonger après le repas.\n— Surélever légèrement la tête du lit.\n— Réduire café, thé fort, plats épicés ou très gras, boissons gazeuses, et arrêter le tabac.\n— Perdre du poids si nécessaire ; éviter les vêtements trop serrés à la taille.\n\nLes médicaments anti-acides peuvent soulager ponctuellement, mais ne doivent pas être pris au long cours sans avis médical.\n\nConsultez un médecin si les brûlures sont fréquentes (plusieurs fois par semaine) ou résistent, et rapidement en cas de signes d'alerte : difficulté ou douleur à avaler, amaigrissement, vomissements répétés, anémie, ou selles noires. Une fibroscopie peut alors être proposée." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 3,
  },
  {
    title: "J'ai une toux qui dure depuis trois semaines, dois-je m'inquiéter ?",
    body: "J'ai eu un rhume il y a un mois et je tousse encore, surtout une toux sèche. Je ne fume pas. Est-ce normal ou faut-il faire une radio ?",
    specialty: "pneumo-phtisiologie",
    tags: ["toux", "toux chronique", "poumons", "radio"],
    aiSummary:
      "Une toux qui suit un rhume peut persister 2 à 3 semaines sans gravité. On parle de toux chronique au-delà de 8 semaines : elle mérite alors un avis médical. Au Maroc, une toux qui traîne avec fièvre, amaigrissement ou sueurs nocturnes doit faire éliminer une tuberculose. Crachats de sang ou essoufflement imposent de consulter.",
    metaTitle: "Toux qui dure 3 semaines : faut-il consulter ? | SantéauMaroc",
    metaDesc:
      "Une toux persistante après un rhume est souvent bénigne. Signes d'alerte et quand consulter, expliqués par un pneumologue au Maroc.",
    answer:
      "Après une infection virale, une toux sèche peut persister 2 à 3 semaines, le temps que les bronches se calment : c'est fréquent et le plus souvent sans gravité, surtout chez un non-fumeur sans fièvre.\n\nD'autres causes banales entretiennent une toux : écoulement nasal vers l'arrière-gorge, reflux acide, ou réactivité des bronches (parfois un asthme qui se révèle par la toux).\n\nOn parle de toux chronique au-delà de 8 semaines : un avis médical et parfois une radio du thorax sont alors justifiés.\n\nAu Maroc, devant une toux qui traîne accompagnée de fièvre prolongée, de sueurs nocturnes, d'une perte de poids ou de fatigue, il faut penser à éliminer une tuberculose (un dépistage est gratuit dans les centres de santé publique).\n\nConsultez sans tarder si vous crachez du sang, êtes essoufflé, avez une douleur dans la poitrine ou une fièvre élevée." +
      DISCLAIMER,
    upvotes: 10,
    thanks: 7,
  },
  {
    title: "Maux de tête fréquents : est-ce une migraine et comment les soulager ?",
    body: "J'ai mal à la tête plusieurs fois par semaine. Parfois ça tape d'un seul côté avec la lumière qui me gêne. Est-ce une migraine ? Que faire ?",
    specialty: "neurologie",
    tags: ["migraine", "maux de tête", "céphalée"],
    aiSummary:
      "Une douleur d'un seul côté, pulsatile, aggravée par l'effort, avec gêne à la lumière ou au bruit, évoque une migraine. On limite les facteurs déclenchants (manque de sommeil, stress, sauts de repas) et on traite tôt la crise. On consulte en urgence si le mal de tête est brutal et intense, ou s'accompagne de fièvre, troubles de la parole ou faiblesse.",
    metaTitle: "Migraine ou mal de tête : que faire ? | SantéauMaroc",
    metaDesc:
      "Reconnaître une migraine, la soulager et savoir quels maux de tête sont une urgence. Conseils d'un neurologue au Maroc.",
    answer:
      "Plusieurs maux de tête par semaine méritent de l'attention. Une migraine se reconnaît souvent à une douleur d'un seul côté, pulsatile (qui bat), aggravée par l'effort, avec une gêne à la lumière et au bruit, parfois des nausées. Les céphalées de tension, elles, serrent la tête « en casque » et sont liées au stress et à la fatigue.\n\nCe qui aide à réduire les crises :\n— Un sommeil régulier, ne pas sauter de repas, bien s'hydrater.\n— Limiter le stress, les écrans prolongés et l'excès de café.\n— Traiter la crise tôt avec un antalgique simple (paracétamol) ; éviter d'enchaîner les antidouleurs trop souvent, ce qui peut entretenir les maux de tête.\n\nTenir un petit carnet des crises aide beaucoup le médecin.\n\nAppelez les secours (15 / 141) ou consultez en urgence si le mal de tête est brutal et très intense (« le pire de ma vie »), ou s'accompagne de fièvre avec raideur de la nuque, de troubles de la parole, de la vue, d'une faiblesse d'un côté, ou survient après un choc à la tête." +
      DISCLAIMER,
    upvotes: 5,
    thanks: 2,
  },
  {
    title: "Mal en bas du dos (lombalgie) : que faire et faut-il du repos ?",
    body: "J'ai mal en bas du dos depuis quelques jours après avoir porté une charge. Dois-je rester couché et quand faut-il consulter ?",
    specialty: "rhumatologie",
    tags: ["mal de dos", "lombalgie", "dos"],
    aiSummary:
      "La lombalgie commune est très fréquente et guérit le plus souvent en quelques jours à semaines. Le repos strict est déconseillé : il faut rester actif. Antalgiques simples et chaleur soulagent. On consulte si la douleur descend dans la jambe, persiste, ou s'accompagne de fièvre, de perte de force ou de troubles urinaires.",
    metaTitle: "Lombalgie : que faire contre le mal de dos | SantéauMaroc",
    metaDesc:
      "Mal de dos en bas du dos : bons réflexes, faut-il se reposer et quand consulter. Conseils d'un médecin au Maroc.",
    answer:
      "Le mal de bas du dos (lombalgie) après un effort est le plus souvent « commun » : il vient des muscles et articulations, sans gravité, et s'améliore en général en quelques jours à quelques semaines.\n\nLes bons réflexes :\n— Rester actif : le repos strict au lit retarde la guérison. Continuez à bouger en douceur dès que possible.\n— Appliquer de la chaleur sur la zone douloureuse.\n— Prendre un antalgique simple (paracétamol) si besoin.\n— Reprendre progressivement les activités ; éviter de porter lourd en arrondissant le dos.\n\nConsultez un médecin si la douleur descend dans la jambe (sciatique), persiste au-delà de 4 à 6 semaines, ou réveille la nuit.\n\nConsultez rapidement en cas de signes d'alerte : fièvre, perte de poids, faiblesse ou engourdissement d'une jambe, difficulté à uriner ou à se retenir, douleur après une chute importante — ils imposent un examen sans attendre." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 5,
  },
  {
    title: "Début de grossesse : quels examens et précautions au Maroc ?",
    body: "Je viens d'apprendre que je suis enceinte. Quels sont les premiers examens à faire et les précautions importantes ?",
    specialty: "gyneco-obstetrique",
    tags: ["grossesse", "suivi", "acide folique"],
    aiSummary:
      "En début de grossesse, on consulte tôt pour confirmer la grossesse, débuter le suivi et prescrire les premiers examens (échographie, bilan sanguin). On prend de l'acide folique, on évite tabac, alcool et automédication, et on adopte des règles d'hygiène alimentaire. Le suivi régulier permet de dépister à temps les complications.",
    metaTitle: "Début de grossesse : examens et précautions | SantéauMaroc",
    metaDesc:
      "Premiers examens et précautions en début de grossesse au Maroc : acide folique, échographie, suivi. Conseils d'un gynécologue.",
    answer:
      "Félicitations. Le plus important en début de grossesse est de consulter tôt pour mettre en place le suivi : un médecin ou une sage-femme confirmera la grossesse et programmera les examens.\n\nPremiers examens habituels :\n— Une échographie de datation (vers 7 à 12 semaines).\n— Un bilan sanguin : groupe sanguin et rhésus, sérologies (toxoplasmose, rubéole, hépatites, etc.), glycémie, numération.\n\nPrécautions clés :\n— Prendre de l'acide folique (vitamine B9), idéalement débuté avant ou dès le début de grossesse, pour protéger le développement du bébé.\n— Arrêter tabac et alcool, et ne prendre aucun médicament sans avis médical (y compris les anti-inflammatoires, déconseillés).\n— En cas de toxoplasmose non immunisée : bien laver fruits et légumes, viande bien cuite.\n\nConsultez sans attendre en cas de saignements, de fortes douleurs au ventre, de fièvre ou de vomissements importants. Au Maroc, le suivi prénatal est assuré dans les centres de santé et en cabinet ; un suivi régulier est la meilleure protection." +
      DISCLAIMER,
    upvotes: 11,
    thanks: 8,
  },
  {
    title: "Mal de gorge : faut-il prendre des antibiotiques ?",
    body: "J'ai mal à la gorge depuis deux jours avec un peu de fièvre. Dois-je prendre des antibiotiques ou est-ce que ça passe tout seul ?",
    specialty: "oto-rhino-laryngologie",
    tags: ["mal de gorge", "angine", "antibiotiques"],
    aiSummary:
      "La plupart des maux de gorge sont viraux et guérissent seuls en quelques jours sans antibiotiques. Ceux-ci ne servent que pour une angine bactérienne, confirmée si besoin par un test. On soulage avec antalgiques et boissons. On consulte en cas de forte fièvre, gêne à avaler ou à respirer, ou si les symptômes persistent.",
    metaTitle: "Mal de gorge : antibiotiques ou pas ? | SantéauMaroc",
    metaDesc:
      "Angine et mal de gorge : quand les antibiotiques sont utiles, comment se soulager et quand consulter. Conseils d'un médecin au Maroc.",
    answer:
      "Bonne nouvelle : la plupart des maux de gorge sont d'origine virale et guérissent seuls en 3 à 5 jours. Dans ce cas, les antibiotiques sont inutiles et peuvent même être nocifs (effets secondaires, résistances).\n\nLes antibiotiques ne sont utiles que pour une angine bactérienne (à streptocoque), surtout chez l'enfant et l'adolescent. Un test rapide réalisé par le médecin permet de savoir s'ils sont nécessaires — il ne faut pas en prendre « au cas où ».\n\nPour se soulager : paracétamol contre la douleur et la fièvre, boissons tièdes, miel (après 1 an), et repos. Les pastilles pour la gorge apportent un confort.\n\nConsultez un médecin si : fièvre élevée ou qui dure, difficulté à avaler ou à ouvrir la bouche, gêne pour respirer, ganglions douloureux, éruption cutanée, ou symptômes qui durent plus de 5 jours. Une gêne respiratoire ou une difficulté à avaler sa salive impose une consultation rapide." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 4,
  },
  {
    title: "Yeux secs et fatigue visuelle devant les écrans : que faire ?",
    body: "Je travaille toute la journée sur ordinateur et j'ai souvent les yeux secs, rouges et fatigués le soir. Est-ce grave et comment soulager ?",
    specialty: "ophtalmologie",
    tags: ["yeux secs", "écrans", "fatigue visuelle"],
    aiSummary:
      "La fatigue visuelle sur écran est fréquente et bénigne : on cligne moins des yeux, ce qui les assèche. La règle 20-20-20, des pauses, un bon éclairage et des larmes artificielles soulagent. On consulte si la gêne persiste, en cas de douleur, baisse de vision, rougeur importante ou sensation de corps étranger.",
    metaTitle: "Yeux secs et écrans : comment soulager | SantéauMaroc",
    metaDesc:
      "Fatigue visuelle et yeux secs devant les écrans : gestes simples qui soulagent et quand consulter un ophtalmologue au Maroc.",
    answer:
      "La gêne que vous décrivez est très fréquente : c'est la fatigue visuelle numérique. Devant un écran, on cligne deux à trois fois moins des yeux, ce qui assèche la surface de l'œil et donne cette sensation de picotement, de rougeur et de lourdeur en fin de journée. C'est gênant mais bénin.\n\nGestes efficaces :\n— Règle du 20-20-20 : toutes les 20 minutes, regarder à environ 6 mètres (20 pieds) pendant 20 secondes.\n— Penser à cligner volontairement des yeux.\n— Régler l'écran un peu en dessous des yeux, à bonne distance, sans reflets ; baisser la luminosité le soir.\n— Utiliser des larmes artificielles (sans conservateur) en cas de sécheresse.\n— Aérer les pièces climatisées et bien s'hydrater.\n\nConsultez un ophtalmologue si la gêne persiste malgré ces mesures, ou en cas de douleur, de baisse de vision, de vision double, de rougeur importante ou de sensation de corps étranger. Un bilan vérifiera aussi si vous avez besoin de lunettes." +
      DISCLAIMER,
    upvotes: 4,
    thanks: 2,
  },
  {
    title: "J'ai des palpitations, quand faut-il s'inquiéter ?",
    body: "Je sens parfois mon cœur s'accélérer ou « sauter un battement », surtout quand je suis stressé. Est-ce dangereux ?",
    specialty: "cardiologie",
    tags: ["palpitations", "cœur", "rythme"],
    aiSummary:
      "Des palpitations occasionnelles liées au stress, à la caféine ou à la fatigue sont souvent bénignes. On réduit café, tabac et manque de sommeil. On consulte si elles sont fréquentes, prolongées, ou accompagnées de malaise, douleur dans la poitrine ou essoufflement — et on appelle les secours en cas de douleur thoracique.",
    metaTitle: "Palpitations : quand consulter ? | SantéauMaroc",
    metaDesc:
      "Palpitations cardiaques : quand est-ce bénin et quels signes imposent de consulter en urgence. Conseils d'un cardiologue au Maroc.",
    answer:
      "Sentir son cœur s'accélérer ou « sauter un battement » est une sensation courante. Le plus souvent, ces palpitations sont bénignes, surtout quand elles sont brèves et liées au stress, à l'anxiété, à un excès de café ou de thé, au tabac, au manque de sommeil ou à la fièvre.\n\nCe qui aide : réduire la caféine et le tabac, mieux dormir, gérer le stress (respiration, activité physique régulière). Vérifier aussi qu'une anémie ou un problème de thyroïde ne sont pas en cause, surtout si c'est fréquent.\n\nConsultez un cardiologue si les palpitations sont fréquentes, durent longtemps, débutent et s'arrêtent brutalement, ou surviennent à l'effort. Un simple ECG, parfois un enregistrement sur 24 h (Holter), précise le diagnostic.\n\nAppelez immédiatement les secours (15 / 141 / 112 depuis un mobile) si les palpitations s'accompagnent d'une douleur dans la poitrine, d'un essoufflement important, d'un malaise ou d'une perte de connaissance." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 3,
  },
  {
    title: "Comment gérer l'anxiété et les troubles du sommeil ?",
    body: "Je me sens souvent anxieux, j'ai du mal à m'endormir et je rumine la nuit. Que puis-je faire et quand consulter ?",
    specialty: "psychiatrie",
    tags: ["anxiété", "sommeil", "stress", "santé mentale"],
    aiSummary:
      "L'anxiété et les troubles du sommeil sont fréquents et se traitent. Une bonne hygiène de sommeil, l'activité physique, la réduction des écrans et de la caféine, et des techniques de relaxation aident beaucoup. On consulte si l'anxiété dure, gêne le quotidien, ou s'accompagne d'idées noires — dans ce cas, il faut demander de l'aide rapidement.",
    metaTitle: "Anxiété et troubles du sommeil : que faire | SantéauMaroc",
    metaDesc:
      "Mieux gérer l'anxiété et l'insomnie : conseils concrets et quand consulter un professionnel au Maroc. Information médicale fiable.",
    answer:
      "L'anxiété et les difficultés de sommeil vont souvent ensemble, et elles sont très répandues. La bonne nouvelle : on peut beaucoup les améliorer.\n\nHygiène de sommeil et du stress :\n— Des horaires de coucher et de lever réguliers, même le week-end.\n— Arrêter les écrans au moins 1 heure avant de dormir ; chambre sombre et fraîche.\n— Éviter café, thé fort et grosses quantités le soir.\n— Bouger dans la journée (la marche compte) et s'exposer à la lumière du jour.\n— Tester la respiration lente, la relaxation ou la cohérence cardiaque le soir.\n\nÉviter de prendre des somnifères de sa propre initiative : ils ne traitent pas la cause et créent une dépendance.\n\nConsultez un médecin ou un psychologue si l'anxiété dure plusieurs semaines, vous empêche de travailler ou de vivre normalement, provoque des crises (cœur qui s'emballe, impression d'étouffer), ou s'accompagne de tristesse profonde. Demandez de l'aide rapidement en cas d'idées noires : vous n'êtes pas seul, et un accompagnement aide vraiment." +
      DISCLAIMER,
    upvotes: 13,
    thanks: 9,
  },
  {
    title: "Comment perdre du poids sainement et durablement ?",
    body: "Je voudrais perdre quelques kilos mais je ne sais pas par où commencer, sans faire un régime trop strict. Des conseils ?",
    specialty: "nutrition",
    tags: ["poids", "alimentation", "nutrition", "prévention"],
    aiSummary:
      "Une perte de poids saine est progressive (0,5 à 1 kg par semaine) et repose sur des changements durables : assiette équilibrée, moins de sucre et d'aliments ultra-transformés, plus de légumes et d'eau, et activité physique régulière. Les régimes très restrictifs échouent à long terme. Un avis médical est utile en cas de maladie associée.",
    metaTitle: "Perdre du poids sainement : conseils | SantéauMaroc",
    metaDesc:
      "Maigrir durablement sans régime extrême : principes simples et efficaces, expliqués par un professionnel de la nutrition au Maroc.",
    answer:
      "Pour perdre du poids durablement, l'objectif n'est pas un régime extrême et court, mais des changements tenables dans le temps. Une perte de 0,5 à 1 kg par semaine est réaliste et saine.\n\nPrincipes simples et efficaces :\n— Remplir la moitié de l'assiette de légumes, un quart de protéines (poisson, poulet, légumineuses), un quart de féculents (de préférence complets).\n— Réduire le sucre, les boissons sucrées, le pain blanc en excès et les aliments ultra-transformés.\n— Boire de l'eau plutôt que des jus et sodas ; attention au thé très sucré.\n— Manger lentement, à heures régulières, sans sauter de repas.\n— Bouger au moins 30 minutes par jour (la marche compte) et réduire le temps assis.\n\nLes régimes « miracle » font reprendre le poids perdu. Mieux vaut de petits changements maintenus.\n\nUn avis médical ou diététique est conseillé si vous avez du diabète, de l'hypertension, un poids très élevé, ou si le poids ne bouge pas malgré vos efforts : on cherche alors une cause (thyroïde, traitements) et on adapte un plan personnalisé." +
      DISCLAIMER,
    upvotes: 9,
    thanks: 6,
  },
  {
    title: "Fièvre chez l'adulte : à partir de quand faut-il consulter ?",
    body: "J'ai 38,5 °C depuis hier avec des courbatures. Dois-je m'inquiéter et que prendre en attendant ?",
    specialty: "medecine-generale",
    tags: ["fièvre", "adulte", "grippe"],
    aiSummary:
      "Une fièvre isolée chez l'adulte, due le plus souvent à une infection virale, peut être surveillée à la maison quelques jours avec repos, hydratation et paracétamol. On consulte si elle dépasse 3 jours, est très élevée, ou s'accompagne de signes d'alerte (gêne respiratoire, raideur de nuque, confusion, éruption).",
    metaTitle: "Fièvre chez l'adulte : quand consulter ? | SantéauMaroc",
    metaDesc:
      "Que faire en cas de fièvre chez l'adulte et à partir de quand consulter un médecin au Maroc. Conseils et signes d'alerte.",
    answer:
      "Une fièvre à 38,5 °C avec des courbatures évoque le plus souvent une infection virale (grippe, virus saisonnier), qui guérit seule en quelques jours.\n\nEn attendant, à la maison :\n— Repos et bonne hydratation (eau, soupes).\n— Paracétamol (Doliprane) pour faire baisser la fièvre et soulager les courbatures, en respectant les doses.\n— Éviter de se sur-couvrir.\n\nIl n'est pas nécessaire de prendre des antibiotiques : ils n'agissent pas sur les virus.\n\nConsultez un médecin si la fièvre dépasse 3 jours, remonte après s'être calmée, ou dépasse 39,5-40 °C de façon persistante.\n\nConsultez en urgence (ou appelez le 15 / 141) en cas de signes d'alerte : difficulté à respirer, douleur thoracique, raideur de la nuque avec maux de tête, confusion ou somnolence anormale, éruption qui ne s'efface pas à la pression, vomissements empêchant de boire, ou fièvre chez une personne fragile (âgée, enceinte, immunodéprimée)." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 3,
  },
  {
    title: "Quels vaccins sont obligatoires pour le Hajj et l'Omra ?",
    body: "Je prévois de partir pour le Hajj cette année. Quels vaccins dois-je faire et combien de temps à l'avance ?",
    specialty: "maladies-infectieuses",
    tags: ["hajj", "omra", "vaccins", "voyage"],
    aiSummary:
      "Pour le Hajj et l'Omra, le vaccin contre la méningite (ACYW135) est exigé par l'Arabie Saoudite, à faire au moins 10 jours avant le départ. D'autres vaccins (grippe saisonnière, mise à jour des vaccins habituels) sont recommandés. Les exigences évoluent chaque année : vérifiez auprès des autorités et préparez votre santé à l'avance.",
    metaTitle: "Vaccins Hajj et Omra : ce qui est obligatoire | SantéauMaroc",
    metaDesc:
      "Vaccins obligatoires et recommandés pour le Hajj et l'Omra depuis le Maroc, et délais à respecter. Conseils médicaux pour bien se préparer.",
    answer:
      "Bien se préparer protège votre santé pendant un séjour où la foule est très dense.\n\nVaccin exigé : la vaccination contre la méningite à méningocoque, type quadrivalent ACYW135, est obligatoire pour obtenir le visa. Elle doit être faite au moins 10 jours avant le départ et reste valable plusieurs années selon le vaccin.\n\nVaccins et mesures recommandés :\n— Vaccin contre la grippe saisonnière, surtout pour les personnes âgées ou fragiles.\n— Mise à jour des vaccinations habituelles (diphtérie-tétanos, etc.).\n— Selon les années, d'autres recommandations peuvent s'ajouter (par exemple contre certaines infections respiratoires).\n\nLes exigences peuvent changer chaque année : vérifiez les consignes officielles du ministère de la Santé et de l'Arabie Saoudite avant de partir, et anticipez (idéalement 4 à 6 semaines avant).\n\nSur place, des gestes simples réduisent les risques : port du masque dans la foule, lavage des mains, bonne hydratation, protection contre le soleil. Consultez votre médecin avant le départ si vous avez une maladie chronique (diabète, cœur, tension) pour adapter votre traitement au voyage." +
      DISCLAIMER,
    upvotes: 12,
    thanks: 8,
  },
  {
    title: "Mon bébé a de la fièvre, que faire avant de consulter ?",
    body: "Mon bébé de 8 mois a 38,8 °C. Il boit mais est grognon. Que puis-je faire à la maison et quand dois-je consulter en urgence ?",
    specialty: "pediatrie",
    tags: ["bébé", "fièvre", "nourrisson"],
    aiSummary:
      "Chez un nourrisson, on mesure la fièvre, on le découvre un peu, on le fait boire souvent et on donne du paracétamol à la dose adaptée au poids. Avant 3 mois, toute fièvre impose de consulter rapidement. On consulte en urgence en cas de mauvaise tolérance, refus de boire, somnolence, taches sur la peau ou gêne respiratoire.",
    metaTitle: "Fièvre du bébé : que faire et quand consulter | SantéauMaroc",
    metaDesc:
      "Fièvre chez le nourrisson : gestes à la maison et signes qui imposent de consulter en urgence au Maroc. Conseils d'un pédiatre.",
    answer:
      "Devant la fièvre d'un bébé, restez calme et observez surtout son comportement, qui compte plus que le chiffre.\n\nGestes à la maison :\n— Découvrir un peu l'enfant (ne pas trop le couvrir) et aérer la pièce.\n— Le faire boire souvent, par petites quantités (lait, eau).\n— Donner du paracétamol (Doliprane) à la dose adaptée à son poids, en respectant l'intervalle. On n'utilise pas l'ibuprofène sans avis avant un certain âge ou en cas de varicelle/déshydratation.\n— Ne jamais donner d'aspirine à un enfant.\n\nImportant : avant l'âge de 3 mois, toute fièvre doit faire consulter rapidement, sans attendre.\n\nConsultez en urgence (ou appelez le 15 / 141) si le bébé : refuse de boire ou a moins de couches mouillées, est très grognon ou au contraire anormalement somnolent, respire vite ou difficilement, a des taches rouges/violacées qui ne s'effacent pas à la pression, fait une convulsion, ou si la fièvre dure plus de 48 h. Dans le doute, mieux vaut consulter." +
      DISCLAIMER,
    upvotes: 10,
    thanks: 7,
  },
  {
    title: "Brûlures en urinant : est-ce une infection urinaire et que faire ?",
    body: "Depuis hier, j'ai mal et ça brûle quand j'urine, et j'ai souvent envie d'aller aux toilettes. Est-ce une infection urinaire ? Que dois-je faire ?",
    specialty: "urologie-et-chirurgie-urologique",
    tags: ["infection urinaire", "cystite", "urines"],
    aiSummary:
      "Brûlures en urinant et envies fréquentes évoquent une infection urinaire (cystite), fréquente chez la femme. Boire beaucoup aide, mais un avis médical est conseillé car un traitement adapté est souvent nécessaire. On consulte en urgence en cas de fièvre, douleur au dos, frissons, sang dans les urines, ou chez l'homme, l'enfant et la femme enceinte.",
    metaTitle: "Brûlures en urinant : infection urinaire ? | SantéauMaroc",
    metaDesc:
      "Cystite et infection urinaire : symptômes, ce qui aide et quand consulter d'urgence au Maroc. Conseils d'un médecin.",
    answer:
      "Des brûlures en urinant avec des envies fréquentes et pressantes évoquent une infection urinaire basse (cystite), très fréquente, surtout chez la femme.\n\nCe qui aide : boire abondamment pour « rincer » la vessie, ne pas se retenir, et uriner après les rapports. Mais la cystite nécessite souvent un traitement adapté : il est conseillé de consulter, car le médecin peut prescrire une analyse d'urine (ECBU) et l'antibiotique approprié. Évitez de prendre un antibiotique au hasard ou un reste de boîte.\n\nConsultez rapidement, car il peut s'agir d'une infection plus sérieuse (rein), si vous avez : de la fièvre, des frissons, une douleur dans le dos ou le flanc, du sang dans les urines, des vomissements, ou si les symptômes ne s'améliorent pas.\n\nUn avis médical est particulièrement important chez l'homme, l'enfant, la femme enceinte, la personne diabétique, ou en cas d'infections urinaires à répétition : la prise en charge y est différente." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 5,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const doctorCache = new Map<string, string>(); // specialtySlug → doctorId

async function pickVerifiedDoctor(specialtySlug: string): Promise<string> {
  if (doctorCache.has(specialtySlug)) return doctorCache.get(specialtySlug)!;

  const find = (where: object) =>
    prisma.doctor.findFirst({
      where: { isActive: true, slug: { not: null }, ...where },
      select: { id: true, isVerified: true, slug: true },
      orderBy: { averageRating: "desc" },
    });

  // 1) un médecin de la spécialité visée ; 2) médecine générale ; 3) n'importe lequel.
  let doc =
    (await find({ specialty: { slug: specialtySlug } })) ??
    (await find({ specialty: { slug: "medecine-generale" } })) ??
    (await find({}));

  if (!doc) throw new Error("Aucun médecin actif avec slug trouvé pour signer les réponses.");

  if (!doc.isVerified) {
    await prisma.doctor.update({ where: { id: doc.id }, data: { isVerified: true } });
    console.log(`  ↳ médecin promu vérifié : ${doc.slug} (pour ${specialtySlug})`);
  }
  doctorCache.set(specialtySlug, doc.id);
  return doc.id;
}

async function ensureAnswer(questionId: string, doctorId: string, body: string, upvotes: number, thanks: number) {
  const existing = await prisma.answer.findFirst({ where: { questionId }, select: { id: true } });
  if (existing) {
    await prisma.answer.update({
      where: { id: existing.id },
      data: { body, doctorId, status: "PUBLISHED", isAccepted: true, upvotes, thanksCount: thanks },
    });
    await recomputeAnswerScore(existing.id);
    return existing.id;
  }
  const a = await prisma.answer.create({
    data: { questionId, doctorId, body, status: "PUBLISHED", isAccepted: true, upvotes, thanksCount: thanks },
    select: { id: true },
  });
  await recomputeAnswerScore(a.id);
  return a.id;
}

async function specialtyIdBySlug(slug: string): Promise<string | null> {
  const s = await prisma.specialty.findUnique({ where: { slug }, select: { id: true } });
  return s?.id ?? null;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Patient demandeur (réutilise ou crée).
  let patient = await prisma.user.findFirst({ where: { role: "PATIENT" } });
  if (!patient) {
    patient = await prisma.user.create({
      data: {
        email: `qa-seed-patient-${Date.now()}@example.com`,
        password: "x",
        name: "Patient",
        role: "PATIENT",
        emailVerified: true,
        isActive: true,
      },
    });
  }

  // 1) Compléter la question « genou » existante (meta SEO manquantes).
  const genou = await prisma.question.findFirst({
    where: { slug: "douleur-au-genou-en-montant-les-escaliers-que-faire" },
    select: { id: true, metaTitle: true },
  });
  if (genou && !genou.metaTitle) {
    await prisma.question.update({
      where: { id: genou.id },
      data: {
        metaTitle: "Douleur au genou dans les escaliers : que faire | SantéauMaroc",
        metaDesc:
          "Douleur à l'avant du genou en montant les escaliers : causes fréquentes, gestes qui soulagent et quand consulter. Réponse d'un médecin au Maroc.",
        tags: ["genou", "douleur", "escaliers", "syndrome rotulien"],
      },
    });
    console.log("✓ Question « genou » complétée (meta SEO).");
  }

  // 2) Récupère les anciens placeholders à corriger (les plus anciens d'abord).
  const placeholders = await prisma.question.findMany({
    where: { slug: { startsWith: "question-de-demo-numero-" } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`Placeholders à corriger : ${placeholders.length}`);

  const now = Date.now();
  let corrected = 0;
  let created = 0;

  for (let i = 0; i < CURATED.length; i++) {
    const c = CURATED[i];
    const specId = await specialtyIdBySlug(c.specialty);
    const doctorId = await pickVerifiedDoctor(c.specialty);
    // Étale les dates de publication pour un fil naturel (un item par ~2 jours).
    const publishedAt = new Date(now - i * 2 * 24 * 60 * 60 * 1000);

    // Idempotence : si une question avec ce titre existe déjà, on la met à jour.
    const byTitle = await prisma.question.findFirst({ where: { title: c.title }, select: { id: true } });

    const data = {
      title: c.title,
      body: c.body,
      status: "PUBLISHED" as const,
      publishedAt,
      askedById: patient.id,
      specialtyId: specId,
      tags: c.tags,
      aiSummary: c.aiSummary,
      metaTitle: c.metaTitle,
      metaDesc: c.metaDesc,
      urgencyLevel: "NONE",
      isAnonymous: true,
      answersCount: 1,
      lastAnswerAt: publishedAt,
    };

    let questionId: string;
    if (byTitle) {
      await prisma.question.update({ where: { id: byTitle.id }, data });
      questionId = byTitle.id;
    } else if (i < placeholders.length) {
      // Corrige un placeholder en place + nouveau slug.
      const ph = placeholders[i];
      const slug = await uniqueQuestionSlug(c.title);
      await prisma.question.update({ where: { id: ph.id }, data: { ...data, slug } });
      questionId = ph.id;
      corrected++;
    } else {
      // Net-neuf.
      const slug = await uniqueQuestionSlug(c.title);
      const q = await prisma.question.create({ data: { ...data, slug }, select: { id: true } });
      questionId = q.id;
      created++;
    }

    await ensureAnswer(questionId, doctorId, c.answer, c.upvotes ?? 3, c.thanks ?? 1);
  }

  console.log(`\n✓ Terminé. Corrigés : ${corrected} · Créés : ${created} · Total curé : ${CURATED.length}`);

  const pubCount = await prisma.question.count({ where: { status: "PUBLISHED" } });
  console.log(`Questions publiées en base : ${pubCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
