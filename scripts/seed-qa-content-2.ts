/**
 * Seed de contenu Q/R éditorial — 2e lot (SantéauMaroc).
 *
 * Complète scripts/seed-qa-content.ts avec de nouvelles questions à forte
 * demande (prévention, vaccination, urgences estivales, santé de la femme).
 * Toutes en net-neuf (les anciens placeholders ont déjà été corrigés).
 *
 * Idempotent : détection par titre (met à jour si déjà présent).
 */
import { prisma } from "../lib/prisma";
import { uniqueQuestionSlug, recomputeAnswerScore } from "../lib/qa";

type Curated = {
  title: string;
  body: string;
  specialty: string;
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
    title: "Quel est le calendrier de vaccination du nourrisson au Maroc ?",
    body: "Je viens d'avoir un bébé et je ne sais pas quels vaccins faire ni quand. Où peut-on les faire et est-ce gratuit ?",
    specialty: "pediatrie",
    tags: ["vaccination", "nourrisson", "bébé", "prévention"],
    aiSummary:
      "Au Maroc, le Programme National d'Immunisation propose les vaccins du nourrisson gratuitement dans les centres de santé, dès la naissance puis à 2, 3, 4 mois, etc. Ils protègent contre des maladies graves (tuberculose, polio, rougeole…). On respecte les rendez-vous notés sur le carnet de santé et on consulte en cas de doute.",
    metaTitle: "Calendrier vaccinal du nourrisson au Maroc | SantéauMaroc",
    metaDesc:
      "Quels vaccins pour bébé et à quel âge au Maroc ? Le calendrier du Programme National d'Immunisation, gratuit en centre de santé. Conseils d'un pédiatre.",
    answer:
      "La vaccination est l'une des meilleures protections pour votre bébé : elle prévient des maladies qui peuvent être graves (tuberculose, poliomyélite, coqueluche, rougeole, hépatite B, etc.).\n\nAu Maroc, ces vaccins sont assurés gratuitement par le Programme National d'Immunisation dans les centres de santé publics. Le calendrier débute à la naissance (BCG, polio, hépatite B), puis se poursuit à 2, 3 et 4 mois, vers 9 et 12 mois (notamment la rougeole), et avec des rappels les années suivantes.\n\nLe plus simple : suivez les rendez-vous notés sur le carnet de santé de l'enfant, qui fait foi, et apportez-le à chaque visite.\n\nUne légère fièvre ou une petite douleur au point d'injection pendant 1 à 2 jours sont fréquentes et bénignes ; du paracétamol suffit. Consultez si la fièvre est élevée et persistante, ou en cas de réaction inhabituelle. Si un vaccin a été oublié, il n'est jamais trop tard pour rattraper : demandez conseil au centre de santé ou à votre pédiatre." +
      DISCLAIMER,
    upvotes: 11,
    thanks: 8,
  },
  {
    title: "Comment arrêter de fumer ? Quelles méthodes marchent vraiment ?",
    body: "Je fume depuis des années et je voudrais arrêter, mais j'ai déjà échoué plusieurs fois. Qu'est-ce qui aide réellement ?",
    specialty: "tabacologie",
    tags: ["tabac", "sevrage", "cigarette", "addiction"],
    aiSummary:
      "Arrêter de fumer est possible, et les rechutes font partie du chemin. Les méthodes qui ont fait leurs preuves : les substituts nicotiniques (patchs, gommes), un accompagnement par un professionnel, et le soutien de l'entourage. Les bénéfices commencent dès les premières heures. On consulte pour un plan personnalisé, surtout en cas de forte dépendance.",
    metaTitle: "Arrêter de fumer : méthodes efficaces | SantéauMaroc",
    metaDesc:
      "Comment arrêter de fumer pour de bon : substituts nicotiniques, accompagnement et conseils qui marchent vraiment. Aide d'un professionnel au Maroc.",
    answer:
      "Bravo pour cette décision : c'est le meilleur geste possible pour votre santé. Les échecs passés ne sont pas un signe d'incapacité — en moyenne, il faut plusieurs tentatives avant d'arrêter définitivement. Chaque essai vous rapproche du but.\n\nCe qui aide vraiment :\n— Les substituts nicotiniques (patchs, gommes, pastilles) réduisent le manque et doublent les chances de réussite ; on les dose selon votre consommation.\n— Un accompagnement par un médecin ou un tabacologue : il existe aussi des médicaments sur ordonnance pour les fortes dépendances.\n— Fixer une date d'arrêt, prévenir son entourage, repérer les situations « déclencheuses » (café, stress) et préparer une alternative (marche, eau, respiration).\n\nLes bénéfices sont rapides : le goût et l'odorat reviennent en quelques jours, le souffle et la circulation s'améliorent en quelques semaines, et le risque cardiaque chute nettement dès la première année.\n\nConsultez pour un plan personnalisé, surtout si vous avez une maladie chronique ou si vous êtes enceinte. Demander de l'aide multiplie vos chances de réussir." +
      DISCLAIMER,
    upvotes: 9,
    thanks: 6,
  },
  {
    title: "Quelle méthode de contraception choisir ?",
    body: "Je voudrais une contraception fiable mais je suis perdue entre la pilule, le stérilet et les autres méthodes. Comment choisir ?",
    specialty: "gyneco-obstetrique",
    tags: ["contraception", "pilule", "stérilet", "santé de la femme"],
    aiSummary:
      "Il n'existe pas de « meilleure » contraception universelle : le bon choix dépend de votre âge, votre santé, votre mode de vie et vos préférences. Pilule, stérilet (DIU), implant, préservatif… chacun a ses avantages. Un médecin ou une sage-femme aide à choisir une méthode fiable et adaptée, et le préservatif reste le seul à protéger des infections.",
    metaTitle: "Choisir sa contraception : pilule, stérilet… | SantéauMaroc",
    metaDesc:
      "Pilule, stérilet, implant ou préservatif : comment choisir une contraception fiable et adaptée. Conseils d'un gynécologue au Maroc.",
    answer:
      "Bonne nouvelle : il existe plusieurs méthodes fiables, et le bon choix est celui qui vous convient, à vous. Il dépend de votre âge, d'éventuelles maladies (tension, migraines, tabac…), du fait d'avoir eu ou non des enfants, et de votre mode de vie.\n\nLes principales options :\n— La pilule : efficace si elle est prise tous les jours sans oubli ; certaines sont déconseillées en cas de tabac après 35 ans, d'hypertension ou d'antécédents de phlébite.\n— Le stérilet (DIU), au cuivre ou hormonal : très efficace, posé pour plusieurs années, pratique car on n'y pense plus.\n— L'implant : un petit bâtonnet sous la peau du bras, efficace 3 ans.\n— Le préservatif : la seule méthode qui protège aussi des infections sexuellement transmissibles.\n\nLe plus utile est d'en parler avec un médecin ou une sage-femme : un court entretien permet d'écarter les contre-indications et de choisir une méthode fiable et confortable. Vous pouvez aussi en changer si elle ne vous convient pas." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 5,
  },
  {
    title: "J'ai trop de cholestérol : que dois-je faire ?",
    body: "Mon bilan sanguin montre un cholestérol élevé. Dois-je m'inquiéter et faut-il forcément des médicaments ?",
    specialty: "cardiologie",
    tags: ["cholestérol", "cœur", "alimentation", "prévention"],
    aiSummary:
      "Un cholestérol élevé n'est pas une maladie en soi mais un facteur de risque pour le cœur et les artères. La première mesure est l'hygiène de vie : alimentation, activité physique, arrêt du tabac. Les médicaments (statines) sont réservés aux situations à risque, décidées avec le médecin selon le risque global, pas seulement le chiffre.",
    metaTitle: "Cholestérol élevé : que faire ? | SantéauMaroc",
    metaDesc:
      "Cholestérol élevé : faut-il s'inquiéter, que changer dans son alimentation et quand prendre un traitement. Conseils d'un cardiologue au Maroc.",
    answer:
      "Un cholestérol élevé ne se « sent » pas, mais avec le temps il peut encrasser les artères et augmenter le risque d'infarctus ou d'AVC. La bonne nouvelle : on peut souvent l'améliorer.\n\nIl faut distinguer le « mauvais » cholestérol (LDL) du « bon » (HDL). Le médecin ne regarde pas qu'un chiffre isolé : il évalue votre risque global (âge, tension, tabac, diabète, antécédents familiaux).\n\nPremière étape, l'hygiène de vie :\n— Réduire les graisses saturées (charcuterie, fritures, viennoiseries, excès de beurre) et privilégier huile d'olive, poisson, légumes, légumineuses et fibres.\n— Bouger au moins 30 minutes par jour.\n— Arrêter le tabac et limiter l'alcool ; perdre du poids si nécessaire.\n\nLes médicaments (souvent des statines) ne sont pas systématiques : ils sont proposés quand le risque est élevé ou si l'hygiène de vie ne suffit pas. C'est une décision à prendre avec votre médecin, qui adaptera et surveillera le traitement." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 4,
  },
  {
    title: "Je suis tout le temps fatigué(e), est-ce un manque de fer ?",
    body: "Je me sens épuisé(e), parfois essoufflé(e) en montant les escaliers, et je suis pâle. Est-ce une anémie par manque de fer ?",
    specialty: "medecine-generale",
    tags: ["fatigue", "anémie", "fer", "carence"],
    aiSummary:
      "La fatigue avec pâleur, essoufflement à l'effort et palpitations peut évoquer une anémie par manque de fer, fréquente surtout chez la femme. Une simple prise de sang confirme le diagnostic et en cherche la cause. On ne prend pas de fer « au cas où » : le traitement et la recherche de la cause doivent être guidés par un médecin.",
    metaTitle: "Fatigue et manque de fer (anémie) : que faire | SantéauMaroc",
    metaDesc:
      "Fatigue, pâleur, essoufflement : est-ce une anémie par manque de fer ? Quand faire une prise de sang et consulter. Conseils d'un médecin au Maroc.",
    answer:
      "Une fatigue persistante accompagnée de pâleur, d'un essoufflement à l'effort, de palpitations ou de vertiges peut effectivement évoquer une anémie par carence en fer. C'est fréquent, en particulier chez la femme (règles abondantes, grossesses) et en cas d'alimentation pauvre en fer.\n\nMais la fatigue a beaucoup d'autres causes (sommeil insuffisant, stress, thyroïde, infection, etc.). Le seul moyen de savoir est une prise de sang simple (numération + ferritine) : elle confirme l'anémie et oriente vers sa cause.\n\nÉvitez de prendre des compléments de fer de votre propre initiative : un excès est nocif, et surtout cela peut masquer une cause qu'il faut traiter (par exemple un saignement digestif).\n\nCôté alimentation, le fer est apporté par la viande rouge, les abats, les légumineuses (lentilles, pois chiches) et les légumes verts ; la vitamine C (agrumes) en améliore l'absorption, tandis que le thé pris pendant le repas la diminue.\n\nConsultez un médecin pour interpréter le bilan et adapter la prise en charge." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 4,
  },
  {
    title: "Je suis souvent constipé(e), que faire au quotidien ?",
    body: "J'ai du mal à aller à la selle, parfois plusieurs jours sans y arriver. Que puis-je changer et quand faut-il consulter ?",
    specialty: "gastro-enterologie",
    tags: ["constipation", "transit", "fibres", "digestion"],
    aiSummary:
      "La constipation s'améliore souvent par des mesures simples : plus de fibres et d'eau, de l'activité physique, et ne pas se retenir d'aller aux toilettes. Les laxatifs ne se prennent pas au long cours sans avis. On consulte si la constipation est récente et inhabituelle, s'accompagne de sang, de douleurs, d'amaigrissement ou alterne avec des diarrhées.",
    metaTitle: "Constipation : conseils pour un bon transit | SantéauMaroc",
    metaDesc:
      "Constipation chez l'adulte : gestes simples qui aident et signes qui doivent amener à consulter. Conseils d'un médecin au Maroc.",
    answer:
      "La constipation est très fréquente et le plus souvent bénigne. Le rythme normal varie d'une personne à l'autre (de 3 fois par jour à 3 fois par semaine) : ce qui compte, c'est le changement par rapport à votre habitude et l'inconfort.\n\nMesures efficaces au quotidien :\n— Augmenter progressivement les fibres : légumes, fruits (pruneaux), légumineuses, pain et céréales complets.\n— Boire suffisamment d'eau dans la journée.\n— Bouger régulièrement : la marche stimule le transit.\n— Aller aux toilettes sans se retenir, à heure régulière (souvent après le repas), sans forcer ; un petit marchepied sous les pieds peut aider.\n\nLes laxatifs peuvent dépanner ponctuellement, mais ne doivent pas devenir une habitude sans avis médical.\n\nConsultez si la constipation est récente et inhabituelle (surtout après 50 ans), si elle s'accompagne de sang dans les selles, de douleurs importantes, de vomissements, d'un amaigrissement, ou si elle alterne avec des diarrhées : un avis et parfois un examen sont alors nécessaires." +
      DISCLAIMER,
    upvotes: 5,
    thanks: 3,
  },
  {
    title: "J'éternue et j'ai le nez bouché à chaque printemps : est-ce une allergie ?",
    body: "Chaque année au printemps, j'ai le nez qui coule, j'éternue et les yeux qui piquent. Est-ce une allergie et comment se soulager ?",
    specialty: "allergologie",
    tags: ["allergie", "rhinite allergique", "pollen", "éternuements"],
    aiSummary:
      "Des éternuements, un nez qui coule et des yeux qui piquent revenant chaque saison évoquent une rhinite allergique (souvent au pollen). On se soulage en limitant l'exposition et avec des antihistaminiques ou sprays nasaux. On consulte si la gêne est forte, persistante, ou s'accompagne d'essoufflement ou de sifflements (risque d'asthme associé).",
    metaTitle: "Rhinite allergique et allergie au pollen | SantéauMaroc",
    metaDesc:
      "Nez bouché, éternuements, yeux qui piquent au printemps : reconnaître une rhinite allergique et se soulager. Conseils d'un allergologue au Maroc.",
    answer:
      "Des symptômes qui reviennent chaque année à la même saison (éternuements en salves, nez bouché ou qui coule clair, démangeaisons du nez et des yeux) sont typiques d'une rhinite allergique, le plus souvent due au pollen. C'est gênant mais pas dangereux en soi.\n\nPour limiter l'exposition :\n— Aérer tôt le matin ou tard le soir, quand le pollen est moins présent ; garder les fenêtres fermées aux heures chaudes et venteuses.\n— Se rincer le nez au sérum physiologique et se laver les cheveux le soir.\n— Éviter de faire sécher le linge dehors en pleine saison pollinique.\n\nPour se soulager : les antihistaminiques (comprimés) et les sprays nasaux à base de corticoïde, disponibles en pharmacie, sont efficaces. Des collyres existent pour les yeux.\n\nConsultez un médecin ou un allergologue si la gêne est importante ou persistante, si elle perturbe le sommeil, ou surtout si apparaissent une toux, un essoufflement ou des sifflements : une allergie peut s'accompagner d'un asthme qu'il faut prendre en charge. Un bilan allergologique permet d'identifier l'allergène et parfois de proposer une désensibilisation." +
      DISCLAIMER,
    upvotes: 5,
    thanks: 2,
  },
  {
    title: "À quoi sert la vitamine D et comment savoir si j'en manque ?",
    body: "On entend beaucoup parler de carence en vitamine D. Comment savoir si j'en manque et faut-il en prendre ?",
    specialty: "endocrinologie-et-maladies-metaboliques",
    tags: ["vitamine D", "carence", "soleil", "os"],
    aiSummary:
      "La vitamine D aide à fixer le calcium et garde les os solides ; elle est surtout fabriquée par la peau au soleil. Le manque est fréquent, notamment chez les personnes peu exposées. On ne se supplémente pas au hasard : une prise de sang et l'avis du médecin déterminent s'il faut une supplémentation et à quelle dose.",
    metaTitle: "Carence en vitamine D : signes et conseils | SantéauMaroc",
    metaDesc:
      "Vitamine D : à quoi elle sert, comment savoir si l'on en manque et faut-il se supplémenter. Conseils d'un médecin au Maroc.",
    answer:
      "La vitamine D joue un rôle essentiel : elle aide l'organisme à absorber le calcium et à garder des os solides ; elle participe aussi au bon fonctionnement des muscles et de l'immunité.\n\nSa particularité : elle est surtout fabriquée par la peau sous l'effet du soleil. Une carence est pourtant fréquente, même dans un pays ensoleillé comme le Maroc, chez les personnes peu exposées (travail en intérieur, vêtements couvrants, peau foncée, personnes âgées) ou en hiver.\n\nUn manque marqué peut donner de la fatigue, des douleurs musculaires ou osseuses, mais souvent il n'y a aucun symptôme. Le seul moyen de le savoir est un dosage sanguin.\n\nIl ne faut pas se supplémenter à fortes doses « par précaution » : un excès est possible et inutile. Une exposition raisonnable au soleil (quelques minutes sur les bras et le visage, sans coup de soleil) et une alimentation incluant poissons gras et œufs aident.\n\nDemandez l'avis de votre médecin : selon le contexte (grossesse, ostéoporose, enfant), il décidera s'il faut doser, supplémenter, et à quelle dose." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 3,
  },
  {
    title: "Comment reconnaître les signes d'un AVC et que faire en urgence ?",
    body: "Mon père est âgé et hypertendu. Comment reconnaître un accident vasculaire cérébral et que faut-il faire immédiatement ?",
    specialty: "neurologie",
    tags: ["AVC", "urgence", "cerveau", "prévention"],
    aiSummary:
      "Un AVC est une urgence vitale : chaque minute compte. Les signes apparaissent brutalement — bouche déviée, faiblesse d'un bras, difficulté à parler. Devant l'un d'eux, on appelle immédiatement les secours (15 / 141 / 112) sans attendre que ça passe. Un traitement rapide limite les séquelles. La prévention passe par le contrôle de la tension, du diabète et l'arrêt du tabac.",
    metaTitle: "Signes d'un AVC : reconnaître et réagir vite | SantéauMaroc",
    metaDesc:
      "Reconnaître un AVC (bouche déviée, bras faible, parole troublée) et réagir en urgence au Maroc : appeler le 15/141/112. Conseils d'un neurologue.",
    answer:
      "L'AVC (accident vasculaire cérébral) est une urgence absolue : plus on agit vite, plus on sauve de cerveau. Les signes apparaissent brutalement, le plus souvent d'un seul côté du corps.\n\nLe moyen le plus simple de les reconnaître, c'est le réflexe « VITE » :\n— Visage : la bouche se tord, un côté du visage tombe.\n— Bras (ou jambe) : faiblesse ou engourdissement soudain d'un côté.\n— Parole : difficulté à parler ou à comprendre, paroles confuses.\n— Time / Temps : devant l'un de ces signes, c'est une urgence — appelez tout de suite les secours.\n\nDevant ces signes, appelez immédiatement le 15 (SAMU/ambulance), le 141 (SAMU) ou le 112 depuis un mobile. N'attendez pas que « ça passe », ne donnez rien à boire ni à manger, allongez la personne et notez l'heure de début des symptômes : cette information est précieuse pour les médecins.\n\nLa prévention est efficace : contrôler la tension artérielle (première cause), équilibrer le diabète et le cholestérol, arrêter le tabac, bouger et surveiller le rythme cardiaque. Un suivi régulier chez une personne hypertendue réduit fortement le risque." +
      DISCLAIMER,
    upvotes: 15,
    thanks: 12,
  },
  {
    title: "Coup de chaleur en été : comment le reconnaître et l'éviter ?",
    body: "Avec les fortes chaleurs au Maroc l'été, comment protéger ma famille, surtout les enfants et les personnes âgées, et reconnaître un coup de chaleur ?",
    specialty: "medecine-d-urgence-et-de-catastrophe",
    tags: ["coup de chaleur", "canicule", "été", "déshydratation"],
    aiSummary:
      "Le coup de chaleur est une urgence : le corps n'arrive plus à se refroidir. Signes : peau très chaude, maux de tête, malaise, confusion. On rafraîchit la personne et on appelle les secours (15 / 141). Pour l'éviter pendant la canicule : boire régulièrement, rester au frais aux heures chaudes, et surveiller les enfants et les personnes âgées.",
    metaTitle: "Coup de chaleur : reconnaître et prévenir | SantéauMaroc",
    metaDesc:
      "Canicule au Maroc : reconnaître un coup de chaleur, réagir en urgence et protéger enfants et personnes âgées. Conseils médicaux.",
    answer:
      "Pendant les fortes chaleurs de l'été marocain, le coup de chaleur est un vrai danger, surtout pour les nourrissons, les personnes âgées et les malades chroniques. Il survient quand le corps n'arrive plus à évacuer la chaleur.\n\nSignes d'alerte : peau chaude, rouge et parfois sèche, température élevée, maux de tête, nausées, fatigue intense, vertiges, et surtout confusion ou somnolence anormale. C'est une urgence.\n\nQue faire immédiatement : mettre la personne à l'ombre dans un endroit frais, la déshabiller, la rafraîchir (linge humide, ventilation), lui faire boire de l'eau si elle est consciente, et appeler les secours (15 / 141 / 112) en cas de confusion, de perte de connaissance ou de fièvre très élevée.\n\nPour prévenir pendant une canicule :\n— Boire de l'eau régulièrement sans attendre la soif.\n— Rester à l'intérieur aux heures les plus chaudes (12 h–16 h), fermer volets et rideaux.\n— Éviter l'effort physique en plein soleil ; porter des vêtements légers et un chapeau.\n— Ne JAMAIS laisser un enfant ou une personne fragile dans une voiture, même quelques minutes.\n— Surveiller activement les bébés et les personnes âgées, qui ressentent moins la soif." +
      DISCLAIMER,
    upvotes: 13,
    thanks: 9,
  },
  {
    title: "Gastro-entérite : comment éviter la déshydratation ?",
    body: "J'ai des diarrhées et des vomissements depuis hier. Que dois-je manger et boire, et quand faut-il consulter ?",
    specialty: "gastro-enterologie",
    tags: ["gastro-entérite", "diarrhée", "déshydratation", "vomissements"],
    aiSummary:
      "La gastro-entérite est le plus souvent virale et guérit seule en quelques jours. L'essentiel est d'éviter la déshydratation : boire souvent par petites gorgées, recourir aux solutions de réhydratation. On consulte en cas de signes de déshydratation, de sang dans les selles, de fièvre élevée, ou chez le nourrisson et la personne âgée.",
    metaTitle: "Gastro-entérite : éviter la déshydratation | SantéauMaroc",
    metaDesc:
      "Diarrhée et vomissements : comment se réhydrater, que manger et quand consulter au Maroc. Conseils d'un médecin.",
    answer:
      "La gastro-entérite (diarrhée et vomissements) est le plus souvent d'origine virale et guérit seule en 2 à 4 jours. Le vrai risque, surtout aux deux extrémités de la vie, est la déshydratation.\n\nLa priorité est donc de boire :\n— Souvent, par petites gorgées, pour éviter de revomir.\n— Les solutions de réhydratation orale (en pharmacie) sont idéales, surtout pour les enfants et les personnes âgées.\n— Eau, bouillons salés et tisanes conviennent ; évitez les boissons très sucrées et l'alcool.\n\nCôté alimentation, reprenez progressivement des aliments simples quand l'appétit revient (riz, banane, compote, pain, carotte cuite) ; pas besoin de jeûner longtemps.\n\nLes antibiotiques sont inutiles dans la plupart des cas (virus), et les médicaments qui « bloquent » la diarrhée ne sont pas toujours conseillés.\n\nConsultez rapidement en cas de signes de déshydratation (bouche sèche, très peu d'urines, grande faiblesse, yeux cernés), de sang dans les selles, de fièvre élevée, de diarrhée qui dure plus de 3 jours, ou s'il s'agit d'un nourrisson, d'une personne âgée ou affaiblie. Le lavage des mains limite la contagion dans la famille." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 5,
  },
  {
    title: "Comment prévenir les caries et garder des dents saines ?",
    body: "J'ai souvent des caries malgré le brossage. Quels sont les bons gestes et à quelle fréquence voir le dentiste ?",
    specialty: "chirurgie-dentaire",
    tags: ["caries", "dents", "hygiène bucco-dentaire", "prévention"],
    aiSummary:
      "Prévenir les caries repose sur un brossage efficace deux fois par jour avec un dentifrice au fluor, la limitation du grignotage sucré, et une visite chez le dentiste une à deux fois par an. On consulte sans attendre en cas de douleur, de sensibilité ou de tache sur une dent.",
    metaTitle: "Prévenir les caries : bons gestes | SantéauMaroc",
    metaDesc:
      "Comment éviter les caries et garder des dents saines : brossage, fluor, alimentation et visites chez le dentiste. Conseils au Maroc.",
    answer:
      "Avoir des caries malgré le brossage est fréquent : souvent, c'est la technique, la fréquence ou l'alimentation qui sont en cause, plus que le manque d'effort.\n\nLes bons gestes :\n— Se brosser les dents deux fois par jour, 2 minutes, avec un dentifrice au fluor (le fluor protège réellement l'émail). Le brossage du soir est le plus important.\n— Nettoyer entre les dents une fois par jour (fil dentaire ou brossettes) : la brosse seule n'atteint pas tout.\n— Limiter le sucre, mais surtout sa fréquence : grignoter et siroter des boissons sucrées toute la journée est plus nocif qu'une quantité prise en une fois.\n— Éviter de se brosser juste après un aliment acide (jus, soda) : attendre 30 minutes.\n\nPour les enfants, surveiller le brossage et éviter le biberon sucré au coucher.\n\nVoyez un dentiste une à deux fois par an pour un contrôle et un détartrage : une carie traitée tôt est indolore et peu coûteuse. Consultez sans attendre en cas de douleur, de sensibilité au chaud/froid, de saignement des gencives ou d'une tache sombre sur une dent." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 3,
  },
  {
    title: "Ménopause : quels sont les symptômes et comment se soulager ?",
    body: "J'ai des bouffées de chaleur, je dors mal et mes règles deviennent irrégulières. Est-ce la ménopause et que peut-on faire ?",
    specialty: "gyneco-obstetrique",
    tags: ["ménopause", "bouffées de chaleur", "santé de la femme"],
    aiSummary:
      "La ménopause est une étape naturelle, autour de 50 ans, marquée par l'arrêt des règles et des symptômes comme les bouffées de chaleur et les troubles du sommeil. Une bonne hygiène de vie soulage beaucoup ; un traitement hormonal est possible dans certains cas, à discuter avec le médecin. C'est aussi le moment de surveiller os et cœur.",
    metaTitle: "Ménopause : symptômes et solutions | SantéauMaroc",
    metaDesc:
      "Bouffées de chaleur, sommeil, règles irrégulières : reconnaître la ménopause et la soulager. Conseils d'un gynécologue au Maroc.",
    answer:
      "La ménopause est une étape naturelle de la vie, le plus souvent autour de 50 ans. On la confirme après 12 mois sans règles. La période qui précède (préménopause) s'accompagne souvent de cycles irréguliers, de bouffées de chaleur, de sueurs nocturnes, de troubles du sommeil, de sécheresse vaginale et parfois de variations de l'humeur.\n\nCe qui aide au quotidien :\n— Une activité physique régulière, une alimentation équilibrée riche en calcium, limiter caféine, alcool et plats épicés (qui déclenchent les bouffées de chaleur).\n— Des vêtements légers en couches, et des techniques de relaxation pour le sommeil.\n\nUn traitement hormonal de la ménopause peut être proposé en cas de symptômes gênants : il est efficace, mais ne convient pas à toutes (il y a des contre-indications). C'est une décision personnalisée à prendre avec votre médecin, qui pèsera bénéfices et risques.\n\nLa ménopause est aussi un bon moment pour faire le point sur votre santé : surveillance du cœur et de la tension, prévention de l'ostéoporose (os), et poursuite des dépistages (cancer du sein, col de l'utérus). Consultez en cas de saignement après la ménopause : cela doit toujours être exploré." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 5,
  },
  {
    title: "Cancer du sein : comment se faire dépister et s'autosurveiller ?",
    body: "À partir de quel âge faut-il faire une mammographie et comment surveiller soi-même ses seins ?",
    specialty: "gyneco-obstetrique",
    tags: ["cancer du sein", "dépistage", "mammographie", "prévention"],
    aiSummary:
      "Le dépistage du cancer du sein permet de le détecter tôt, quand il se guérit le mieux. On recommande de connaître ses seins et de consulter devant tout changement, et de faire une mammographie selon l'âge et les facteurs de risque (souvent à partir de 40-45 ans, à discuter avec le médecin). Au Maroc, des campagnes nationales facilitent l'accès au dépistage.",
    metaTitle: "Dépistage du cancer du sein : âge et conseils | SantéauMaroc",
    metaDesc:
      "Cancer du sein : à partir de quand faire une mammographie, comment s'autosurveiller et quand consulter au Maroc. Conseils d'un gynécologue.",
    answer:
      "Le cancer du sein est le cancer le plus fréquent chez la femme, mais détecté tôt, il se guérit très souvent. Le dépistage est donc essentiel.\n\nDeux niveaux complémentaires :\n— Bien connaître ses seins : observez et palpez-les régulièrement (par exemple une fois par mois, après les règles) afin de repérer un changement. Ce n'est pas un diagnostic, mais cela aide à consulter tôt.\n— Le dépistage par mammographie : il est recommandé selon l'âge et les facteurs de risque. En l'absence de risque particulier, il débute souvent vers 40-45 ans ; en cas d'antécédents familiaux, il peut commencer plus tôt. L'âge de départ et le rythme se décident avec votre médecin.\n\nAu Maroc, des campagnes nationales de sensibilisation et de dépistage facilitent l'accès à l'examen, notamment dans les centres de santé.\n\nConsultez sans attendre, quel que soit votre âge, si vous remarquez : une boule ou une masse, une modification de la peau ou du mamelon (rétraction, rougeur, « peau d'orange »), un écoulement, ou un ganglion sous le bras. La plupart des anomalies sont bénignes, mais seul un examen permet de le confirmer." +
      DISCLAIMER,
    upvotes: 10,
    thanks: 7,
  },
];

// ── Helpers (identiques au 1er lot) ─────────────────────────────────────────

const doctorCache = new Map<string, string>();

async function pickVerifiedDoctor(specialtySlug: string): Promise<string> {
  if (doctorCache.has(specialtySlug)) return doctorCache.get(specialtySlug)!;
  const find = (where: object) =>
    prisma.doctor.findFirst({
      where: { isActive: true, slug: { not: null }, ...where },
      select: { id: true, isVerified: true, slug: true },
      orderBy: { averageRating: "desc" },
    });
  const doc =
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
    return;
  }
  const a = await prisma.answer.create({
    data: { questionId, doctorId, body, status: "PUBLISHED", isAccepted: true, upvotes, thanksCount: thanks },
    select: { id: true },
  });
  await recomputeAnswerScore(a.id);
}

async function specialtyIdBySlug(slug: string): Promise<string | null> {
  const s = await prisma.specialty.findUnique({ where: { slug }, select: { id: true } });
  return s?.id ?? null;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
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

  const now = Date.now();
  // Démarre les dates avant le 1er lot pour intercaler naturellement (1 / ~36 h).
  const startOffsetDays = 1;
  let created = 0;
  let updated = 0;

  for (let i = 0; i < CURATED.length; i++) {
    const c = CURATED[i];
    const specId = await specialtyIdBySlug(c.specialty);
    const doctorId = await pickVerifiedDoctor(c.specialty);
    const publishedAt = new Date(now - (startOffsetDays + i) * 36 * 60 * 60 * 1000);

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

    const byTitle = await prisma.question.findFirst({ where: { title: c.title }, select: { id: true } });
    let questionId: string;
    if (byTitle) {
      await prisma.question.update({ where: { id: byTitle.id }, data });
      questionId = byTitle.id;
      updated++;
    } else {
      const slug = await uniqueQuestionSlug(c.title);
      const q = await prisma.question.create({ data: { ...data, slug }, select: { id: true } });
      questionId = q.id;
      created++;
    }
    await ensureAnswer(questionId, doctorId, c.answer, c.upvotes ?? 3, c.thanks ?? 1);
  }

  console.log(`\n✓ 2e lot terminé. Créés : ${created} · Mis à jour : ${updated} · Total lot : ${CURATED.length}`);
  const pubCount = await prisma.question.count({ where: { status: "PUBLISHED" } });
  console.log(`Questions publiées en base : ${pubCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
