/**
 * Seed de contenu Q/R éditorial — 5e lot (SantéauMaroc).
 *
 * Complète les lots 1-4 : urgence cardiaque, santé de la femme, dermato,
 * ORL, rhumato, ophtalmo, neuro, endocrino. Net-neuf, idempotent (titre).
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
    title: "Comment reconnaître une crise cardiaque (infarctus) et réagir vite ?",
    body: "Mon mari a parfois des douleurs dans la poitrine. Comment reconnaître un infarctus et que faut-il faire immédiatement ?",
    specialty: "cardiologie",
    tags: ["infarctus", "crise cardiaque", "urgence", "douleur thoracique"],
    aiSummary:
      "L'infarctus est une urgence vitale : chaque minute compte. Le signe principal est une douleur ou une oppression dans la poitrine, qui peut irradier vers le bras, la mâchoire ou le dos, avec sueurs, essoufflement ou nausées. Devant ces signes, on appelle immédiatement le 15 / 141, on met la personne au repos et on ne conduit pas soi-même.",
    metaTitle: "Reconnaître un infarctus et réagir | SantéauMaroc",
    metaDesc:
      "Signes d'une crise cardiaque (douleur dans la poitrine, bras, sueurs) et gestes d'urgence au Maroc : appeler le 15/141. Conseils d'un cardiologue.",
    answer:
      "L'infarctus du myocarde (crise cardiaque) est une urgence absolue : une artère du cœur se bouche, et plus on agit vite, plus on sauve de muscle cardiaque.\n\nLes signes typiques :\n— Une douleur ou une sensation de serrement, d'oppression ou d'écrasement au milieu de la poitrine, qui dure (plus de quelques minutes) et ne passe pas au repos.\n— Une douleur qui peut irradier vers le bras gauche (ou les deux), la mâchoire, le cou, le dos ou l'estomac.\n— Souvent associée : sueurs froides, essoufflement, nausées, angoisse, pâleur, malaise.\n\nAttention : chez la femme, la personne âgée ou diabétique, les signes peuvent être trompeurs (simple fatigue intense, essoufflement, gêne digestive). Dans le doute, on agit.\n\nQue faire immédiatement :\n— Appelez tout de suite les secours : 15 (SAMU/ambulance), 141, ou 112 depuis un mobile. N'attendez pas que « ça passe ».\n— Mettez la personne au repos complet, en position assise ou demi-assise, desserrez ses vêtements.\n— Ne la laissez pas conduire ni se déplacer seule ; ne conduisez pas non plus pour l'emmener si une ambulance peut venir.\n— Si elle perd connaissance et ne respire pas, commencez les compressions thoraciques.\n\nLa prévention compte : contrôler tension, cholestérol et diabète, arrêter le tabac, bouger et surveiller son cœur, surtout en cas d'antécédents familiaux." +
      DISCLAIMER,
    upvotes: 16,
    thanks: 12,
  },
  {
    title: "Démangeaisons et pertes blanches : est-ce une mycose vaginale ?",
    body: "J'ai des démangeaisons intimes et des pertes blanches épaisses. Est-ce une mycose ? Comment la soigner et quand consulter ?",
    specialty: "gyneco-obstetrique",
    tags: ["mycose vaginale", "pertes blanches", "démangeaisons", "santé de la femme"],
    aiSummary:
      "Des démangeaisons avec des pertes blanches épaisses (comme du lait caillé) évoquent une mycose vaginale (candidose), fréquente et bénigne. Un traitement antifongique local la soigne en quelques jours. On consulte si c'est la première fois, si ça récidive, en cas de grossesse, de fièvre, de douleurs ou de pertes malodorantes — pour confirmer et écarter une autre cause.",
    metaTitle: "Mycose vaginale : symptômes et traitement | SantéauMaroc",
    metaDesc:
      "Démangeaisons et pertes blanches : reconnaître une mycose vaginale, la soigner et quand consulter au Maroc. Conseils d'un gynécologue.",
    answer:
      "Des démangeaisons intimes avec des pertes blanches épaisses et grumeleuses (comme du lait caillé), parfois avec des brûlures et des rougeurs, évoquent une mycose vaginale (candidose). C'est très fréquent, bénin, et ce n'est pas forcément une infection sexuellement transmissible.\n\nCertaines situations la favorisent : prise d'antibiotiques, grossesse, diabète, règles, sous-vêtements serrés ou synthétiques, toilette intime trop agressive.\n\nLe traitement repose sur un antifongique local (ovule + crème), disponible en pharmacie, efficace en quelques jours. Quelques conseils : toilette douce à l'eau et savon neutre (sans douche vaginale, qui déséquilibre la flore), bien sécher, préférer le coton.\n\nConsultez un médecin ou une sage-femme plutôt que de vous auto-traiter si : c'est la première fois (pour confirmer le diagnostic), les épisodes se répètent (plus de 3-4 par an), vous êtes enceinte, ou en cas de fièvre, douleurs du bas-ventre, pertes jaunes/verdâtres ou malodorantes, ou de plaies — car d'autres infections peuvent ressembler à une mycose et nécessitent un autre traitement. Si une IST est possible, un dépistage et le traitement du partenaire peuvent être discutés." +
      DISCLAIMER,
    upvotes: 9,
    thanks: 6,
  },
  {
    title: "Douleur sous les côtes à droite après les repas gras : calculs biliaires ?",
    body: "J'ai des douleurs sous les côtes à droite, surtout après les repas gras, qui partent vers l'épaule. On m'a parlé de calculs dans la vésicule. Que faire ?",
    specialty: "gastro-enterologie",
    tags: ["calculs biliaires", "vésicule", "colique hépatique", "digestion"],
    aiSummary:
      "Une douleur sous les côtes à droite, déclenchée par les repas gras et irradiant vers l'épaule droite ou le dos, évoque une colique hépatique due à des calculs de la vésicule. C'est fréquent. On allège les graisses et on consulte pour une échographie. Fièvre, frissons ou jaunisse sont des signes de complication imposant d'aller aux urgences.",
    metaTitle: "Calculs biliaires et colique hépatique : que faire | SantéauMaroc",
    metaDesc:
      "Douleur sous les côtes à droite après un repas gras : calculs de la vésicule, échographie et signes d'urgence au Maroc. Conseils médicaux.",
    answer:
      "Ce tableau — douleur sous les côtes à droite (ou au creux de l'estomac), survenant souvent après un repas gras, irradiant vers l'épaule droite ou le dos, avec parfois des nausées — est typique d'une colique hépatique, due à des calculs dans la vésicule biliaire. C'est fréquent, surtout chez la femme, et souvent sans gravité quand cela reste une simple crise.\n\nLa crise dure de quelques minutes à quelques heures puis se calme. Beaucoup de personnes ont des calculs sans aucun symptôme.\n\nEn pratique :\n— Pendant la crise, un antalgique (selon avis médical) et le repos digestif aident.\n— Au quotidien, réduire les graisses (fritures, sauces, charcuterie) espace les crises.\n— Consultez votre médecin : une échographie de l'abdomen confirme facilement les calculs. Si les crises se répètent, une intervention pour retirer la vésicule peut être proposée.\n\nAllez aux urgences (ou appelez le 15 / 141) en cas de signes de complication : fièvre et frissons, douleur intense et continue qui ne cède pas, jaunisse (yeux ou peau jaunes), urines foncées, vomissements importants. Cela peut témoigner d'une infection de la vésicule ou d'une obstruction des voies biliaires, qui nécessitent une prise en charge rapide." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 4,
  },
  {
    title: "Je perds beaucoup mes cheveux : est-ce normal et que faire ?",
    body: "Je trouve beaucoup de cheveux sur l'oreiller et dans la douche depuis quelques mois. Est-ce inquiétant et y a-t-il des solutions ?",
    specialty: "dermatologie",
    tags: ["chute de cheveux", "cheveux", "alopécie", "carence"],
    aiSummary:
      "Perdre jusqu'à environ 100 cheveux par jour est normal. Une chute diffuse et passagère survient souvent quelques mois après un accouchement, un stress, une maladie ou un régime, et se récupère. Une carence (fer), un problème de thyroïde ou une cause héréditaire sont possibles. On consulte un dermatologue si la chute est importante, durable, par plaques, ou avec d'autres signes.",
    metaTitle: "Chute de cheveux : causes et solutions | SantéauMaroc",
    metaDesc:
      "Perte de cheveux : ce qui est normal, les causes fréquentes (stress, carence, thyroïde) et quand consulter au Maroc. Conseils d'un dermatologue.",
    answer:
      "Rassurez-vous d'abord : perdre des cheveux tous les jours est normal (jusqu'à une centaine), car ils se renouvellent en permanence. C'est une chute plus marquée et durable qui mérite attention.\n\nLa cause la plus fréquente d'une chute diffuse et brutale est l'« effluvium télogène » : une perte qui survient 2 à 3 mois après un facteur déclenchant — accouchement, forte fièvre ou maladie, intervention, stress important, régime restrictif, arrêt d'une pilule. Bonne nouvelle : elle est presque toujours réversible et les cheveux repoussent.\n\nAutres causes à rechercher : une carence (fer surtout, fréquente chez la femme), un trouble de la thyroïde, certains médicaments, et la chute héréditaire (calvitie) qui est plus progressive et localisée (golfes, sommet du crâne).\n\nCe qui aide : une alimentation équilibrée (protéines, fer), gérer le stress, éviter les coiffures trop serrées et les traitements agressifs.\n\nConsultez un dermatologue si la chute est importante ou dure plus de quelques mois, si elle se fait par plaques bien limitées (qui peuvent nécessiter un traitement spécifique), ou si elle s'accompagne d'autres signes (fatigue, ongles cassants, règles abondantes). Une simple prise de sang recherche une carence ou un problème de thyroïde, et des traitements efficaces existent selon la cause." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 5,
  },
  {
    title: "Sinusite : comment la soulager et faut-il des antibiotiques ?",
    body: "Après un rhume, j'ai le nez bouché, mal au front et aux joues, et ça dure. Est-ce une sinusite et faut-il des antibiotiques ?",
    specialty: "oto-rhino-laryngologie",
    tags: ["sinusite", "nez bouché", "rhume", "antibiotiques"],
    aiSummary:
      "La sinusite fait souvent suite à un rhume : nez bouché, douleur du visage (front, joues), écoulement. Elle est le plus souvent virale et guérit seule ; les antibiotiques ne sont utiles que dans certains cas. On soulage avec lavages de nez, antalgiques et chaleur. On consulte si fièvre élevée, douleur intense, symptômes qui durent ou gonflement autour de l'œil.",
    metaTitle: "Sinusite : soulager et antibiotiques | SantéauMaroc",
    metaDesc:
      "Sinusite après un rhume : comment se soulager, quand les antibiotiques sont utiles et signes d'alerte. Conseils d'un médecin ORL au Maroc.",
    answer:
      "La sinusite est une inflammation des sinus, ces cavités autour du nez. Elle fait souvent suite à un rhume : nez bouché ou qui coule (parfois épais et coloré), douleur ou pesanteur du visage (front, joues, autour des yeux) augmentée en se penchant en avant, et parfois maux de tête.\n\nLa plupart des sinusites sont virales et guérissent seules en une à deux semaines. Les antibiotiques ne sont donc pas systématiques : ils ne sont utiles que dans certains cas (sinusite bactérienne, symptômes intenses ou qui s'aggravent), sur décision médicale.\n\nPour se soulager :\n— Laver le nez au sérum physiologique plusieurs fois par jour.\n— Antalgique (paracétamol) contre la douleur ; chaleur sur le visage.\n— Bien s'hydrater, aérer ; un spray décongestionnant peut dépanner quelques jours seulement (pas plus, risque d'effet rebond).\n\nConsultez un médecin si : la douleur est intense, la fièvre est élevée ou prolongée, les symptômes durent au-delà de 10 jours ou s'aggravent après une amélioration, ou si les sinusites se répètent.\n\nConsultez en urgence en cas de gonflement, rougeur ou douleur autour d'un œil, de troubles de la vue, de maux de tête violents avec raideur de la nuque ou de confusion : ce sont des signes de complication rares mais sérieux." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 3,
  },
  {
    title: "Sciatique : une douleur qui descend dans la jambe, que faire ?",
    body: "J'ai une douleur du bas du dos qui descend dans la fesse et derrière la jambe. On parle de sciatique. Que faire et quand consulter ?",
    specialty: "rhumatologie",
    tags: ["sciatique", "nerf sciatique", "dos", "jambe"],
    aiSummary:
      "La sciatique est une douleur du bas du dos qui descend dans la fesse et la jambe, le long du nerf sciatique, souvent à cause d'une hernie discale. Elle s'améliore le plus souvent en quelques semaines : rester actif, antalgiques, éviter le repos strict. On consulte en urgence en cas de faiblesse de la jambe, de troubles pour uriner, ou d'une perte de sensibilité de la zone des fesses.",
    metaTitle: "Sciatique : douleur dans la jambe, que faire | SantéauMaroc",
    metaDesc:
      "Sciatique : pourquoi la douleur descend dans la jambe, comment la soulager et signes d'urgence. Conseils d'un rhumatologue au Maroc.",
    answer:
      "La sciatique est une douleur qui part du bas du dos ou de la fesse et descend le long de la jambe (parfois jusqu'au pied), en suivant le trajet du nerf sciatique. Elle est le plus souvent due à une hernie discale qui comprime le nerf, fréquente et généralement bénigne.\n\nLa bonne nouvelle : dans la grande majorité des cas, elle guérit toute seule en quelques semaines.\n\nCe qui aide :\n— Rester actif autant que la douleur le permet : le repos strict au lit retarde la guérison. Continuez à marcher et à bouger doucement.\n— Antalgiques (paracétamol), parfois un anti-inflammatoire ou un décontractant sur avis médical ; chaleur locale.\n— Éviter de porter lourd et les mouvements de torsion brusques ; reprendre progressivement.\n\nConsultez votre médecin si la douleur est intense, ne s'améliore pas après quelques semaines, ou revient souvent.\n\nC'est une URGENCE (consultez sans attendre) en cas de : faiblesse nette ou paralysie de la jambe ou du pied, perte de sensibilité de la région entre les cuisses et les fesses (« selle »), difficulté à uriner ou à se retenir (urines ou selles). Ces signes, rares, imposent un avis immédiat. Une fièvre, un amaigrissement ou une douleur après une chute justifient aussi un examen rapproché." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 5,
  },
  {
    title: "J'ai l'œil rouge qui coule : est-ce une conjonctivite ?",
    body: "J'ai un œil rouge, qui pique et qui coule depuis ce matin. Est-ce contagieux et que faut-il faire ?",
    specialty: "ophtalmologie",
    tags: ["conjonctivite", "œil rouge", "yeux", "contagion"],
    aiSummary:
      "Un œil rouge qui pique et coule, sans baisse de vision ni douleur intense, est souvent une conjonctivite, le plus souvent virale ou allergique, et bénigne. On nettoie l'œil au sérum physiologique et on se lave bien les mains (les formes infectieuses sont contagieuses). On consulte en urgence en cas de douleur intense, de baisse de vision, de gêne à la lumière, ou si l'on porte des lentilles.",
    metaTitle: "Œil rouge et conjonctivite : que faire | SantéauMaroc",
    metaDesc:
      "Œil rouge qui coule : reconnaître une conjonctivite, l'hygiène à adopter et quand consulter en urgence au Maroc. Conseils médicaux.",
    answer:
      "Un œil rouge qui pique, picote ou colle, avec des sécrétions et une sensation de grain de sable, mais SANS baisse de la vue ni forte douleur, correspond le plus souvent à une conjonctivite : une inflammation de la fine membrane qui recouvre l'œil. C'est en général bénin.\n\nLes causes : virale (souvent dans un contexte de rhume, très contagieuse), bactérienne (sécrétions jaunes, paupières collées le matin), ou allergique (les deux yeux, démangeaisons, contexte d'allergie au pollen).\n\nCe qui aide :\n— Nettoyer l'œil au sérum physiologique, du coin interne vers l'extérieur, avec une compresse propre par œil.\n— Se laver soigneusement les mains, ne pas se frotter l'œil, ne pas partager serviette ni oreiller (les formes infectieuses se transmettent facilement).\n— Si vous portez des lentilles, retirez-les jusqu'à guérison.\n\nConsultez en urgence (ophtalmologue) si : douleur intense de l'œil, baisse de la vision, gêne importante à la lumière, œil très rouge autour de l'iris, pupille anormale, traumatisme ou projection de produit, ou si vous portez des lentilles (risque d'infection plus grave). Une conjonctivite banale qui ne s'améliore pas en quelques jours mérite aussi un avis." +
      DISCLAIMER,
    upvotes: 5,
    thanks: 3,
  },
  {
    title: "Ostéoporose : comment protéger mes os, surtout après la ménopause ?",
    body: "J'ai dépassé la ménopause et j'ai peur de l'ostéoporose et des fractures. Comment savoir si mes os sont fragiles et comment les protéger ?",
    specialty: "rhumatologie",
    tags: ["ostéoporose", "os", "ménopause", "prévention"],
    aiSummary:
      "L'ostéoporose fragilise les os sans douleur, jusqu'à une fracture. Après la ménopause, le risque augmente. On protège ses os par l'activité physique, un apport suffisant en calcium et vitamine D, l'arrêt du tabac et de l'alcool, et la prévention des chutes. Un examen (densitométrie) évalue la solidité osseuse selon les facteurs de risque ; des traitements existent.",
    metaTitle: "Ostéoporose : protéger ses os après la ménopause | SantéauMaroc",
    metaDesc:
      "Ostéoporose : prévenir les fractures après la ménopause, calcium, vitamine D et densitométrie. Conseils d'un rhumatologue au Maroc.",
    answer:
      "L'ostéoporose est une fragilisation progressive des os, qui devient poreux et se cassent plus facilement (poignet, vertèbres, hanche). Elle est silencieuse : elle ne fait pas mal et se révèle souvent par une fracture après un choc minime ou une perte de taille. Après la ménopause, la baisse des œstrogènes accélère la perte osseuse, d'où votre vigilance justifiée.\n\nPour protéger vos os :\n— Bougez : la marche, la montée d'escaliers et les exercices en charge ou de renforcement stimulent l'os et l'équilibre.\n— Assurez un apport suffisant en calcium (produits laitiers, certaines eaux, légumes verts, sardines) et en vitamine D (soleil raisonnable, parfois supplémentation prescrite).\n— Arrêtez le tabac, limitez l'alcool et l'excès de café/sel.\n— Prévenez les chutes à la maison (éclairage, tapis, chaussures stables) ; faites vérifier votre vue.\n\nPour évaluer la solidité de vos os, le médecin peut prescrire une densitométrie osseuse (ostéodensitométrie), surtout en présence de facteurs de risque (ménopause précoce, antécédents familiaux ou de fracture, corticoïdes au long cours, maigreur).\n\nConsultez votre médecin : selon le résultat et votre risque, il pourra conseiller calcium/vitamine D et, si nécessaire, un traitement qui réduit nettement le risque de fracture." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 4,
  },
  {
    title: "Crise d'angoisse : que se passe-t-il et comment la calmer ?",
    body: "J'ai eu une crise où mon cœur s'emballait, je n'arrivais plus à respirer et j'avais l'impression de mourir. Est-ce une crise d'angoisse ? Comment réagir ?",
    specialty: "psychiatrie",
    tags: ["crise d'angoisse", "attaque de panique", "anxiété", "santé mentale"],
    aiSummary:
      "La crise d'angoisse (attaque de panique) provoque palpitations, souffle court, tremblements et peur intense, mais elle n'est pas dangereuse et passe en quelques minutes. On respire lentement, on se rassure, on attend que ça redescende. Si les crises se répètent, un accompagnement est très efficace. Une 1re fois ou des signes inhabituels justifient d'écarter une cause physique.",
    metaTitle: "Crise d'angoisse : comprendre et se calmer | SantéauMaroc",
    metaDesc:
      "Attaque de panique : symptômes, comment calmer une crise d'angoisse et quand consulter au Maroc. Information fiable et rassurante.",
    answer:
      "Ce que vous décrivez ressemble à une crise d'angoisse (attaque de panique) : une montée brutale de peur intense, avec des sensations physiques fortes — cœur qui s'emballe, souffle court, oppression dans la poitrine, tremblements, vertiges, fourmillements, impression de perdre le contrôle ou de mourir.\n\nC'est très impressionnant, mais point essentiel : une crise d'angoisse n'est pas dangereuse pour le cœur ni pour la vie, et elle redescend d'elle-même, généralement en quelques minutes à une demi-heure.\n\nPour calmer une crise :\n— Rappelez-vous que ça va passer, que ce n'est pas dangereux.\n— Respirez lentement : inspirez par le nez quelques secondes, soufflez doucement plus longtemps, en posant une main sur le ventre. Ralentir la respiration coupe l'emballement.\n— Asseyez-vous dans un endroit calme, ancrez-vous (nommez ce que vous voyez, sentez vos pieds au sol).\n\nConsultez un médecin ou un psychologue si les crises se répètent, si vous commencez à éviter des situations par peur d'en refaire, ou si l'anxiété pèse sur votre quotidien : un accompagnement (thérapie, parfois traitement) est très efficace.\n\nCela dit, lors d'une toute première crise, ou en cas de douleur intense dans la poitrine, de malaise réel ou chez une personne à risque cardiaque, mieux vaut consulter pour écarter une cause physique — au moindre doute, appelez le 15 / 141." +
      DISCLAIMER,
    upvotes: 12,
    thanks: 9,
  },
  {
    title: "Frottis et vaccin HPV : comment se protéger du cancer du col de l'utérus ?",
    body: "À partir de quel âge faut-il faire un frottis et qu'est-ce que le vaccin contre le HPV ? Je veux me protéger du cancer du col.",
    specialty: "gyneco-obstetrique",
    tags: ["cancer du col", "frottis", "HPV", "dépistage"],
    aiSummary:
      "Le cancer du col de l'utérus est l'un des plus évitables grâce au dépistage par frottis et à la vaccination contre le HPV. Le frottis se fait régulièrement à partir de 25-30 ans pour repérer des lésions avant qu'elles n'évoluent. Le vaccin HPV protège, idéalement administré chez les jeunes avant les premiers rapports. On consulte pour organiser son suivi.",
    metaTitle: "Frottis et vaccin HPV : prévenir le cancer du col | SantéauMaroc",
    metaDesc:
      "Cancer du col de l'utérus : à quel âge faire un frottis, le vaccin HPV et le dépistage au Maroc. Conseils d'un gynécologue.",
    answer:
      "C'est une excellente démarche : le cancer du col de l'utérus est l'un des cancers les plus évitables, grâce à deux outils complémentaires.\n\n1) Le dépistage par frottis (ou test HPV) : un prélèvement simple et rapide au niveau du col, qui détecte des anomalies des cellules bien avant qu'elles ne deviennent un cancer — ce qui permet de les traiter à temps. Il se réalise régulièrement à partir de 25-30 ans (le rythme est précisé par votre médecin selon le type de test et les résultats), même en l'absence de symptôme et même si vous êtes vaccinée.\n\n2) La vaccination contre le HPV (papillomavirus), le virus responsable de la quasi-totalité de ces cancers. Le vaccin est le plus efficace lorsqu'il est administré chez les jeunes (filles, et garçons selon les recommandations), idéalement avant le début de la vie sexuelle ; il peut être proposé plus tard dans certains cas.\n\nLes deux se complètent : le vaccin prévient l'infection, le frottis dépiste. Le préservatif réduit le risque sans l'éliminer.\n\nConsultez un médecin, une sage-femme ou un gynécologue pour organiser votre suivi et discuter de la vaccination (pour vous ou vos enfants). Et consultez en dehors du dépistage en cas de saignements entre les règles ou après les rapports, ou de pertes inhabituelles." +
      DISCLAIMER,
    upvotes: 9,
    thanks: 6,
  },
  {
    title: "Coupure ou plaie : comment la soigner et quand faut-il des points ?",
    body: "Je me suis coupé assez profondément. Comment nettoyer la plaie, arrêter le saignement et savoir s'il faut des points de suture ou un vaccin ?",
    specialty: "medecine-d-urgence-et-de-catastrophe",
    tags: ["plaie", "coupure", "premiers secours", "tétanos"],
    aiSummary:
      "Devant une coupure, on comprime avec un linge propre pour arrêter le saignement, puis on nettoie à l'eau et au savon. Des points de suture sont nécessaires si la plaie est profonde, béante, longue, sur le visage ou très sale. On vérifie la vaccination antitétanique. On consulte en urgence si le saignement ne s'arrête pas, en cas de morsure, ou de plaie profonde/souillée.",
    metaTitle: "Plaie et coupure : soigner et quand suturer | SantéauMaroc",
    metaDesc:
      "Coupure ou plaie : arrêter le saignement, nettoyer, savoir s'il faut des points et le tétanos. Premiers soins expliqués au Maroc.",
    answer:
      "Voici les bons gestes devant une coupure.\n\n1) Arrêter le saignement : appuyez fermement sur la plaie avec un linge propre (ou une compresse) pendant au moins 5 à 10 minutes sans relâcher pour vérifier. Surélevez la zone si possible. La plupart des saignements s'arrêtent ainsi.\n\n2) Nettoyer : une fois le saignement contrôlé, rincez à l'eau claire et lavez autour au savon pour retirer les saletés. Un antiseptique peut être appliqué. Couvrez avec un pansement propre.\n\nDes points de suture (ou de la colle/des agrafes) sont nécessaires, et il faut consulter rapidement (dans les heures qui suivent), si la plaie : est profonde ou béante (les bords s'écartent), mesure plus de 1 à 2 cm, saigne beaucoup, se situe sur le visage (esthétique) ou près d'une articulation, laisse voir de la graisse ou un tendon, ou est très sale.\n\nVérifiez la vaccination contre le tétanos : si elle n'est pas à jour (rappel de plus de 10 ans, ou plaie souillée/terre/rouille), un rappel est indiqué — demandez à un médecin.\n\nConsultez en urgence (ou appelez le 15 / 141) si : le saignement ne s'arrête pas malgré la compression (saignement abondant, sang qui gicle), la plaie est due à une morsure (animal ou humain) ou à un objet sale/rouillé, il y a une perte de sensibilité ou de mobilité, ou des signes d'infection apparaissent ensuite (rougeur qui s'étend, chaleur, pus, fièvre)." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 5,
  },
  {
    title: "Diabète : comment prendre soin de mes pieds pour éviter les complications ?",
    body: "Je suis diabétique et on m'a dit de faire très attention à mes pieds. Pourquoi, et quels sont les bons gestes au quotidien ?",
    specialty: "endocrinologie-et-maladies-metaboliques",
    tags: ["pied diabétique", "diabète", "prévention", "plaie"],
    aiSummary:
      "Chez le diabétique, le pied est fragile : la baisse de sensibilité et de circulation fait qu'une petite plaie peut s'aggraver sans qu'on la sente. La prévention est essentielle : inspecter ses pieds chaque jour, bien les laver et hydrater, porter de bonnes chaussures, ne pas marcher pieds nus, et consulter vite toute plaie ou rougeur. Un bon équilibre du diabète protège.",
    metaTitle: "Pied diabétique : protéger ses pieds | SantéauMaroc",
    metaDesc:
      "Diabète et soins des pieds : gestes quotidiens pour éviter les plaies et complications, et quand consulter au Maroc. Conseils d'un endocrinologue.",
    answer:
      "Vous avez reçu un bon conseil : chez la personne diabétique, le soin des pieds est essentiel pour éviter des complications parfois graves.\n\nPourquoi ? Avec le temps, un diabète mal équilibré peut diminuer la sensibilité des pieds (on sent moins la douleur) et réduire la circulation du sang. Résultat : une petite blessure, une ampoule ou une fissure peut passer inaperçue, mal cicatriser et s'infecter.\n\nLes bons gestes au quotidien :\n— Inspecter ses pieds chaque jour (dessus, dessous, entre les orteils), à l'aide d'un miroir si besoin, et faire regarder par un proche si la vue baisse.\n— Laver à l'eau tiède (vérifier la température avec la main ou le coude, pas le pied), bien sécher entre les orteils, et hydrater la peau sèche (sans excès entre les orteils).\n— Couper les ongles droits, sans creuser les coins ; éviter de couper les cors soi-même (voir un podologue).\n— Porter des chaussures confortables, fermées et adaptées, et vérifier l'intérieur avant de les mettre (caillou, couture). Ne JAMAIS marcher pieds nus, même à la maison.\n— Éviter les sources de chaleur directe (bouillotte, brasero) sur les pieds.\n\nConsultez rapidement pour toute plaie, ampoule, rougeur, gonflement, cor, ongle incarné ou changement de couleur — même sans douleur. Et n'oubliez pas : bien équilibrer sa glycémie, sa tension et arrêter le tabac protège vos pieds. Un examen des pieds doit être fait régulièrement lors de votre suivi du diabète." +
      DISCLAIMER,
    upvotes: 9,
    thanks: 7,
  },
  {
    title: "Que faire si quelqu'un fait une crise d'épilepsie (convulsions) ?",
    body: "Si une personne tombe et se met à convulser devant moi, quels sont les bons gestes et les erreurs à éviter ?",
    specialty: "neurologie",
    tags: ["épilepsie", "convulsions", "premiers secours", "crise"],
    aiSummary:
      "Devant une crise de convulsions, on protège la personne (écarter les objets, glisser quelque chose de souple sous la tête), on ne la retient pas et on ne met RIEN dans sa bouche. On note l'heure. Après la crise, on la met sur le côté. On appelle le 15 / 141 si la crise dure plus de 5 minutes, se répète, en cas de blessure, de grossesse, ou si c'est la première fois.",
    metaTitle: "Crise d'épilepsie : les bons gestes | SantéauMaroc",
    metaDesc:
      "Convulsions : que faire et quelles erreurs éviter pendant une crise d'épilepsie, et quand appeler les secours au Maroc.",
    answer:
      "Assister à une crise de convulsions est impressionnant, mais des gestes simples aident beaucoup — et certains réflexes sont à éviter absolument.\n\nPendant la crise (la personne est secouée de mouvements, raide, inconsciente) :\n— Gardez votre calme et notez l'heure de début (la durée est une information importante).\n— Protégez-la : écartez les objets durs ou dangereux autour d'elle, glissez quelque chose de souple (vêtement plié) sous sa tête, desserrez son col.\n— Ne la retenez PAS, ne bloquez pas ses mouvements.\n— Ne mettez RIEN dans sa bouche (ni doigt, ni objet, ni cuillère) : c'est dangereux et inutile, on n'avale pas sa langue.\n\nAprès la crise, quand les mouvements cessent : la personne est souvent confuse ou somnolente. Mettez-la sur le côté (position latérale de sécurité) pour libérer les voies respiratoires, restez près d'elle, rassurez-la et laissez-la récupérer.\n\nAppelez les secours (15 / 141, 112 depuis un mobile) si : la crise dure plus de 5 minutes, une 2e crise enchaîne, la personne ne reprend pas connaissance, elle s'est blessée, elle a du mal à respirer, elle est enceinte ou diabétique, la crise survient dans l'eau, ou s'il s'agit d'une première crise (à explorer médicalement).\n\nUne personne épileptique connue qui fait une crise habituelle et brève n'a pas toujours besoin des secours, mais un suivi médical reste important." +
      DISCLAIMER,
    upvotes: 10,
    thanks: 7,
  },
  {
    title: "Jambes lourdes et veines apparentes (varices) : que faire ?",
    body: "J'ai les jambes lourdes en fin de journée et des petites veines apparaissent. Est-ce des varices et comment soulager ?",
    specialty: "angiologie",
    tags: ["varices", "jambes lourdes", "circulation", "veines"],
    aiSummary:
      "Les jambes lourdes et les varices traduisent une circulation veineuse moins efficace. On soulage par la marche, l'élévation des jambes, l'eau fraîche, le contrôle du poids et, souvent, des bas de contention. On consulte si les varices sont gênantes ou s'aggravent. Une jambe brutalement gonflée, chaude et douloureuse est une urgence (risque de phlébite).",
    metaTitle: "Jambes lourdes et varices : soulager | SantéauMaroc",
    metaDesc:
      "Jambes lourdes et varices : gestes qui soulagent, bas de contention et signes d'alerte (phlébite). Conseils d'un angiologue au Maroc.",
    answer:
      "Les jambes lourdes en fin de journée, avec parfois des veines qui deviennent visibles ou gonflées (varices), des gonflements des chevilles ou des fourmillements, traduisent une insuffisance veineuse : le sang remonte moins bien des jambes vers le cœur. C'est fréquent, favorisé par l'hérédité, la station debout ou assise prolongée, la chaleur, le surpoids, la grossesse et la sédentarité.\n\nCe qui soulage vraiment :\n— Marcher régulièrement : la contraction des mollets « pompe » le sang vers le haut. Bougez, évitez de rester debout ou assis sans bouger trop longtemps.\n— Surélever les jambes au repos et la nuit ; passer de l'eau fraîche sur les jambes.\n— Porter des bas ou chaussettes de contention, très efficaces (un professionnel aide à choisir la classe et la taille).\n— Contrôler son poids, éviter les sources de chaleur directe sur les jambes (bains très chauds, chauffage au sol prolongé).\n\nConsultez un médecin ou un angiologue si les varices sont gênantes, inesthétiques pour vous, s'aggravent, ou s'accompagnent de démangeaisons, d'eczéma, d'une coloration brune ou d'une plaie de la cheville : des traitements existent (et un écho-Doppler évalue les veines).\n\nC'est une URGENCE (consultez sans attendre, appelez le 15 / 141) si une jambe devient brutalement gonflée, chaude, rouge et douloureuse (souvent le mollet) : cela peut être une phlébite (caillot), qui nécessite une prise en charge rapide." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 4,
  },
];

// ── Helpers (identiques aux lots précédents) ─────────────────────────────────

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
  const startOffsetHours = 30; // intercale après les lots précédents
  let created = 0;
  let updated = 0;

  for (let i = 0; i < CURATED.length; i++) {
    const c = CURATED[i];
    const specId = await specialtyIdBySlug(c.specialty);
    const doctorId = await pickVerifiedDoctor(c.specialty);
    const publishedAt = new Date(now - (startOffsetHours + i * 22) * 60 * 60 * 1000);

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

  console.log(`\n✓ 5e lot terminé. Créés : ${created} · Mis à jour : ${updated} · Total lot : ${CURATED.length}`);
  const pubCount = await prisma.question.count({ where: { status: "PUBLISHED" } });
  console.log(`Questions publiées en base : ${pubCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
