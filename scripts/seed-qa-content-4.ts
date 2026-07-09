/**
 * Seed de contenu Q/R éditorial — 4e lot (SantéauMaroc).
 *
 * Complète les lots 1-3 : urgences domestiques/estivales, santé de la femme,
 * maladies chroniques, ORL, traumato, pédiatrie. Net-neuf, idempotent (titre).
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
    title: "Brûlure domestique (eau bouillante, huile) : quels sont les bons gestes ?",
    body: "Je me suis brûlé la main avec de l'eau bouillante en cuisinant. Que faut-il faire tout de suite et quand faut-il consulter ?",
    specialty: "medecine-d-urgence-et-de-catastrophe",
    tags: ["brûlure", "premiers secours", "urgence", "maison"],
    aiSummary:
      "Devant une brûlure, le geste essentiel est de refroidir à l'eau tiède courante (15-25 °C) pendant 15 à 20 minutes, retirer bagues et vêtements non collés, puis couvrir d'un linge propre. On ne met JAMAIS dentifrice, beurre, huile ou henné. On consulte pour une brûlure étendue, profonde, sur le visage/mains/articulations/parties intimes, ou chez un enfant.",
    metaTitle: "Brûlure : premiers gestes qui sauvent | SantéauMaroc",
    metaDesc:
      "Brûlure à l'eau bouillante ou à l'huile : refroidir à l'eau, ce qu'il ne faut surtout pas faire et quand consulter au Maroc. Conseils médicaux.",
    answer:
      "Le bon réflexe immédiat fait toute la différence : refroidir la brûlure.\n\nGestes à faire tout de suite :\n— Passer la zone sous l'eau tiède courante (environ 15-25 °C, ni glacée ni chaude) pendant 15 à 20 minutes. Cela calme la douleur et limite l'aggravation.\n— Retirer bagues, bracelets, montre et vêtements autour de la brûlure AVANT que ça gonfle — sauf s'ils sont collés à la peau (on les laisse alors en place).\n— Couvrir ensuite d'un linge propre, non pelucheux (ou film alimentaire propre).\n— Prendre du paracétamol pour la douleur.\n\nCe qu'il ne faut JAMAIS faire : appliquer dentifrice, beurre, huile, henné, farine ou autre remède maison — cela favorise l'infection et complique les soins. Ne percez pas les cloques.\n\nConsultez un médecin (ou allez aux urgences) si la brûlure : est plus grande que la paume de la main, est profonde (peau blanche, cartonnée ou indolore), touche le visage, les mains, les articulations ou les parties intimes, est due à l'électricité ou à un produit chimique, ou concerne un enfant ou une personne âgée. Appelez le 15 / 141 pour une brûlure grave ou étendue. Pensez aussi à vérifier la vaccination antitétanique." +
      DISCLAIMER,
    upvotes: 14,
    thanks: 10,
  },
  {
    title: "Diarrhée du voyageur (turista) : comment l'éviter et la soigner ?",
    body: "Je voyage bientôt et j'ai souvent la diarrhée en déplacement. Comment l'éviter et que faire si elle survient ?",
    specialty: "maladies-infectieuses",
    tags: ["diarrhée du voyageur", "turista", "voyage", "hydratation"],
    aiSummary:
      "La diarrhée du voyageur est due à une eau ou des aliments contaminés. On la prévient en buvant de l'eau en bouteille capsulée, en évitant glaçons, crudités lavées à l'eau du robinet et aliments mal cuits. Si elle survient, l'essentiel est de bien se réhydrater. On consulte en cas de fièvre élevée, de sang dans les selles, ou de symptômes qui durent.",
    metaTitle: "Diarrhée du voyageur (turista) : éviter et soigner | SantéauMaroc",
    metaDesc:
      "Turista : comment prévenir la diarrhée du voyageur, se réhydrater et quand consulter. Conseils d'un médecin au Maroc.",
    answer:
      "La diarrhée du voyageur (ou « turista ») est fréquente : elle vient le plus souvent d'une eau ou d'aliments contaminés par des microbes auxquels on n'est pas habitué.\n\nPour la prévenir :\n— Boire de l'eau en bouteille capsulée (ou bouillie/filtrée) ; éviter les glaçons et l'eau du robinet, y compris pour se brosser les dents en zone à risque.\n— Préférer les aliments bien cuits et servis chauds ; se méfier des crudités lavées à l'eau du robinet, des plats réchauffés et des fruits qu'on n'épluche pas soi-même.\n— Se laver les mains souvent (ou gel hydroalcoolique).\n\nSi elle survient, l'essentiel est de se réhydrater : boire souvent, par petites gorgées (eau, solutions de réhydratation orale). Reprendre une alimentation simple. La plupart des épisodes guérissent seuls en 1 à 3 jours ; les antibiotiques ne sont utiles que dans certains cas, sur avis médical.\n\nConsultez (ou contactez un médecin) en cas de fièvre élevée, de sang ou de glaires dans les selles, de vomissements empêchant de boire, de signes de déshydratation, ou si cela dure plus de 3 jours — et particulièrement chez l'enfant, la personne âgée ou en cas de maladie chronique." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 4,
  },
  {
    title: "Pilule du lendemain (contraception d'urgence) : quand et comment l'utiliser ?",
    body: "J'ai eu un rapport non protégé et je m'inquiète. Que puis-je faire, dans quel délai, et où me procurer la contraception d'urgence ?",
    specialty: "gyneco-obstetrique",
    tags: ["contraception d'urgence", "pilule du lendemain", "santé de la femme"],
    aiSummary:
      "La contraception d'urgence sert après un rapport non ou mal protégé : plus on agit tôt, mieux c'est. La pilule du lendemain (lévonorgestrel) s'utilise idéalement dans les 72 h ; le stérilet au cuivre, posé jusqu'à 5 jours, est la méthode la plus efficace. Elle ne protège pas des IST et n'est pas un moyen régulier. On consulte si les règles tardent.",
    metaTitle: "Pilule du lendemain : délai et mode d'emploi | SantéauMaroc",
    metaDesc:
      "Contraception d'urgence : quel délai, quelle méthode et où l'obtenir au Maroc. Conseils confidentiels d'un médecin.",
    answer:
      "C'est une situation fréquente, et il existe des solutions efficaces : la contraception d'urgence. Le principe clé est la rapidité — plus elle est prise tôt après le rapport, plus elle est efficace.\n\nDeux options :\n— La pilule du lendemain (lévonorgestrel) : à prendre le plus vite possible, idéalement dans les 72 heures (3 jours). Elle est disponible en pharmacie. Une autre molécule (ulipristal) agit jusqu'à 5 jours.\n— Le stérilet (DIU) au cuivre, posé par un médecin jusqu'à 5 jours après le rapport : c'est la méthode d'urgence la plus efficace, et il peut ensuite servir de contraception durable.\n\nPoints importants : la contraception d'urgence n'est pas un moyen de contraception régulier (moins efficace et déconseillée en usage répété) ; elle ne protège pas des infections sexuellement transmissibles ; elle peut décaler un peu les règles.\n\nN'hésitez pas à demander conseil au pharmacien ou à un médecin, en toute confidentialité. Faites un test de grossesse si vos règles ont plus de 5 à 7 jours de retard, et profitez-en pour discuter d'une contraception régulière adaptée, et éventuellement d'un dépistage des IST si le rapport était à risque." +
      DISCLAIMER,
    upvotes: 9,
    thanks: 6,
  },
  {
    title: "Fatigue, prise de poids et frilosité : est-ce la thyroïde (hypothyroïdie) ?",
    body: "Je suis fatiguée, j'ai pris du poids, j'ai souvent froid et la peau sèche. Une amie m'a parlé de la thyroïde. Comment savoir ?",
    specialty: "endocrinologie-et-maladies-metaboliques",
    tags: ["thyroïde", "hypothyroïdie", "fatigue", "TSH"],
    aiSummary:
      "Une thyroïde qui fonctionne au ralenti (hypothyroïdie) peut donner fatigue, prise de poids, frilosité, peau sèche, constipation et humeur basse. C'est fréquent, surtout chez la femme. Une simple prise de sang (TSH) fait le diagnostic. Le traitement (hormone thyroïdienne) est simple et efficace. On consulte pour doser et adapter.",
    metaTitle: "Hypothyroïdie : symptômes et diagnostic | SantéauMaroc",
    metaDesc:
      "Fatigue, prise de poids, frilosité : est-ce la thyroïde ? Quand doser la TSH et consulter au Maroc. Conseils d'un endocrinologue.",
    answer:
      "Les signes que vous décrivez peuvent effectivement évoquer une hypothyroïdie, c'est-à-dire une thyroïde qui fonctionne au ralenti. La thyroïde est une petite glande du cou qui règle le « rythme » de l'organisme.\n\nQuand elle est paresseuse, tout ralentit : fatigue, prise de poids malgré peu de changements, frilosité, peau sèche, cheveux cassants, constipation, crampes, humeur basse, parfois ralentissement du cœur. C'est fréquent, en particulier chez la femme et après 50 ans.\n\nMais ces symptômes ne sont pas spécifiques (ils existent dans bien d'autres situations). Le seul moyen de savoir est une prise de sang qui dose la TSH (et au besoin les hormones thyroïdiennes).\n\nLa bonne nouvelle : si le diagnostic est confirmé, le traitement est simple — une hormone thyroïdienne en comprimé, prise chaque matin, qui rétablit l'équilibre. La dose est ajustée par des contrôles sanguins.\n\nConsultez votre médecin pour prescrire le bilan et l'interpréter. À l'inverse, une thyroïde trop active (hyperthyroïdie) donne plutôt nervosité, perte de poids, palpitations et bouffées de chaleur — qui justifient aussi un avis." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 5,
  },
  {
    title: "Zona : qu'est-ce que c'est et que faut-il faire rapidement ?",
    body: "J'ai une éruption douloureuse avec des cloques sur un seul côté du corps, en bande. On m'a dit que c'était un zona. Est-ce grave et que faire ?",
    specialty: "dermatologie",
    tags: ["zona", "douleur", "éruption", "virus"],
    aiSummary:
      "Le zona est une réactivation du virus de la varicelle : éruption douloureuse de cloques, d'un seul côté, en bande. Il faut consulter rapidement (dans les 72 h) car un traitement antiviral précoce limite la durée et le risque de douleurs persistantes. Un zona près de l'œil est une urgence. Les lésions peuvent contaminer une personne non immunisée contre la varicelle.",
    metaTitle: "Zona : reconnaître et agir vite | SantéauMaroc",
    metaDesc:
      "Zona : symptômes, pourquoi consulter dans les 72 h et quand c'est une urgence (œil). Conseils d'un dermatologue au Maroc.",
    answer:
      "Le zona correspond au réveil du virus de la varicelle, resté endormi dans l'organisme depuis l'enfance. Il se manifeste par une douleur (brûlure, picotements) puis une éruption de petites cloques groupées, sur un seul côté du corps, disposées en bande (thorax, visage, etc.). Il survient souvent à la faveur d'une baisse de forme, du stress ou de l'âge.\n\nPoint important : il faut consulter rapidement, idéalement dans les 72 heures après l'apparition des boutons. Un traitement antiviral pris tôt réduit la durée du zona et, surtout, le risque de douleurs qui persistent après la guérison (douleurs post-zostériennes), parfois tenaces.\n\nEn attendant : un antalgique (paracétamol) pour la douleur, garder les lésions propres et sèches, éviter de les gratter.\n\nUn zona situé sur le visage, surtout près de l'œil ou sur le bout du nez, est une urgence (risque pour l'œil) : consultez sans attendre.\n\nÀ savoir : tant que les cloques ne sont pas sèches, le liquide peut transmettre la varicelle à une personne qui ne l'a jamais eue (enfants, femmes enceintes non immunisées) — évitez le contact. Un vaccin contre le zona existe pour les personnes âgées." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 4,
  },
  {
    title: "Comment réduire ou arrêter l'alcool quand on en boit trop ?",
    body: "Je bois plus que je ne voudrais et j'aimerais réduire ou arrêter. Comment m'y prendre et est-ce dangereux d'arrêter d'un coup ?",
    specialty: "addictologie-clinique",
    tags: ["alcool", "addiction", "sevrage", "santé"],
    aiSummary:
      "Vouloir réduire l'alcool est une démarche positive. En cas de forte dépendance, l'arrêt brutal peut être dangereux (tremblements, crises) : il doit alors être encadré médicalement. On se fixe des objectifs, on repère les situations à risque et on se fait accompagner. Des aides efficaces existent. On consulte sans jugement, c'est confidentiel.",
    metaTitle: "Réduire ou arrêter l'alcool : conseils | SantéauMaroc",
    metaDesc:
      "Boire moins ou arrêter l'alcool : par où commencer, pourquoi ne pas arrêter brutalement si dépendance, et où trouver de l'aide au Maroc.",
    answer:
      "C'est une démarche courageuse et positive pour votre santé. Quelques repères pour avancer.\n\nPoint de sécurité d'abord : si vous buvez beaucoup et tous les jours depuis longtemps, n'arrêtez pas brutalement seul. Un sevrage non encadré peut provoquer tremblements, sueurs, anxiété, voire des crises (convulsions) potentiellement graves. Dans ce cas, l'arrêt doit être préparé et accompagné par un médecin, parfois avec un traitement.\n\nPour avancer :\n— Fixez-vous un objectif clair (réduire à X verres, ou arrêter) et notez votre consommation : on sous-estime souvent.\n— Repérez les situations « déclencheuses » (stress, sorties, ennui) et préparez une alternative.\n— Prévenez un proche de confiance et entourez-vous.\n— Alternez avec des boissons sans alcool, ne gardez pas de stock chez vous.\n\nDes accompagnements efficaces existent (médecin traitant, addictologue, soutien psychologique). Demander de l'aide n'est pas un échec, au contraire : c'est ce qui marche le mieux.\n\nConsultez sans tarder si vous ressentez un manque, une perte de contrôle, ou si l'alcool retentit sur votre travail, votre famille ou votre santé. Tout cela reste confidentiel et sans jugement." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 5,
  },
  {
    title: "Rage de dent la nuit : comment me soulager en attendant le dentiste ?",
    body: "J'ai une douleur dentaire violente qui m'empêche de dormir. Que puis-je faire pour me soulager et quand est-ce urgent ?",
    specialty: "chirurgie-dentaire",
    tags: ["mal de dents", "rage de dent", "douleur", "urgence dentaire"],
    aiSummary:
      "Pour soulager une rage de dent : antalgique (paracétamol, en respectant les doses), tête surélevée, éviter le chaud, le sucré et le froid sur la dent. On ne met jamais d'aspirine ni de comprimé directement sur la gencive. Il faut voir un dentiste rapidement. C'est urgent en cas de gonflement du visage, de fièvre ou de difficulté à avaler ou respirer.",
    metaTitle: "Rage de dent la nuit : comment se soulager | SantéauMaroc",
    metaDesc:
      "Douleur dentaire violente : comment se soulager en attendant le dentiste et quand c'est une urgence au Maroc. Conseils.",
    answer:
      "La rage de dent est une des douleurs les plus pénibles, surtout la nuit où elle empire (la position allongée augmente l'afflux de sang vers la dent).\n\nPour se soulager en attendant le dentiste :\n— Prendre un antalgique : le paracétamol est un bon premier choix, en respectant les doses ; un anti-inflammatoire (ibuprofène) peut aider sauf contre-indication.\n— Dormir la tête surélevée (plusieurs oreillers).\n— Éviter ce qui réveille la douleur : aliments chauds, très froids, sucrés ou durs du côté douloureux.\n— Un bain de bouche tiède à l'eau salée peut apaiser une gencive irritée.\n\nÀ ne PAS faire : poser un comprimé d'aspirine ou un cachet directement sur la dent ou la gencive (cela brûle la muqueuse) ; appliquer des remèdes maison agressifs.\n\nPrenez rendez-vous chez un dentiste rapidement : les antidouleurs ne traitent pas la cause (carie profonde, abcès…), qui doit être soignée.\n\nC'est une urgence — consultez sans attendre ou allez aux urgences — si la douleur s'accompagne d'un gonflement du visage ou de la joue, de fièvre, de difficulté à ouvrir la bouche, à avaler ou à respirer : une infection dentaire peut se propager et devenir dangereuse." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 5,
  },
  {
    title: "J'ai des vertiges, la tête qui tourne : est-ce grave ?",
    body: "J'ai des épisodes où tout se met à tourner autour de moi, parfois quand je bouge la tête. Qu'est-ce qui peut causer ça et quand consulter ?",
    specialty: "oto-rhino-laryngologie",
    tags: ["vertiges", "équilibre", "oreille interne"],
    aiSummary:
      "Les vertiges (sensation que tout tourne) viennent souvent de l'oreille interne et sont le plus souvent bénins, comme le vertige positionnel déclenché par les mouvements de tête. On évite les mouvements brusques pendant la crise. On consulte en urgence si le vertige s'accompagne de signes neurologiques (troubles de la parole, faiblesse, vision double, fort mal de tête) : il faut éliminer une cause grave.",
    metaTitle: "Vertiges : causes et quand consulter | SantéauMaroc",
    metaDesc:
      "Tête qui tourne, vertiges : causes fréquentes (oreille interne) et signes d'alerte à ne pas manquer. Conseils d'un médecin ORL au Maroc.",
    answer:
      "Le vrai vertige est la sensation que tout tourne autour de vous (ou que vous tournez), souvent avec des nausées. À distinguer d'un simple « étourdissement » ou d'un malaise.\n\nLa cause la plus fréquente vient de l'oreille interne, qui gère l'équilibre. Par exemple, le vertige positionnel bénin déclenche de brèves crises rotatoires quand on bouge la tête (se retourner dans le lit, lever les yeux) : c'est très désagréable mais bénin, et cela se traite bien. D'autres causes ORL existent (inflammation, maladie de Ménière).\n\nPendant une crise : s'asseoir ou s'allonger, fixer un point, éviter les mouvements brusques de la tête et la conduite.\n\nConsultez un médecin pour préciser la cause : un examen simple oriente souvent le diagnostic, et des manœuvres ou un traitement peuvent soulager.\n\nConsultez en URGENCE (15 / 141) si le vertige s'accompagne de : difficulté à parler ou à marcher, faiblesse ou engourdissement d'un côté, vision double, fort mal de tête inhabituel, perte de connaissance ou bourdonnement avec perte d'audition brutale. Ces signes imposent d'éliminer une cause neurologique." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 3,
  },
  {
    title: "Je me suis tordu la cheville : entorse ou fracture, que faire ?",
    body: "Je me suis tordu la cheville en marchant, elle a gonflé et c'est douloureux. Comment savoir si c'est cassé et que faire les premiers jours ?",
    specialty: "traumatologie-orthopedie",
    tags: ["entorse", "cheville", "premiers soins", "GREC"],
    aiSummary:
      "Une cheville tordue qui gonfle est le plus souvent une entorse (ligaments étirés). Les premiers jours, on applique le protocole GREC : Glace, Repos, Élévation, Compression. On consulte si l'on ne peut pas poser le pied ni faire quelques pas, en cas de déformation, ou de douleur sur l'os : une radio recherche une fracture.",
    metaTitle: "Entorse de la cheville : entorse ou fracture ? | SantéauMaroc",
    metaDesc:
      "Cheville tordue et gonflée : premiers soins (glace, repos), entorse ou fracture et quand faire une radio au Maroc. Conseils médicaux.",
    answer:
      "Une cheville qui se tord, gonfle et fait mal est le plus souvent une entorse : les ligaments qui stabilisent l'articulation ont été étirés ou déchirés. Le gonflement et un bleu sont fréquents et ne signifient pas forcément une fracture.\n\nLes premiers jours, appliquez le protocole « GREC » :\n— Glace : 15 à 20 minutes plusieurs fois par jour (jamais à même la peau).\n— Repos relatif : ménagez la cheville, mais reprenez l'appui et la marche dès que la douleur le permet (l'immobilisation totale prolongée n'est plus conseillée).\n— Élévation : surélevez le pied pour réduire l'œdème.\n— Compression : une bande élastique soutient et limite le gonflement.\nUn antalgique (paracétamol) aide.\n\nConsultez (avec une radio à la clé) pour rechercher une fracture si : vous ne pouvez pas du tout poser le pied ni faire quelques pas, la cheville est déformée, la douleur siège précisément sur l'os (malléole), il y a un craquement net, un engourdissement, ou si ça ne s'améliore pas après quelques jours. Chez l'enfant et la personne âgée, un avis est plus volontiers nécessaire." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 4,
  },
  {
    title: "Mon bébé respire vite et siffle après un rhume : est-ce une bronchiolite ?",
    body: "Mon nourrisson de 5 mois a eu un rhume, et maintenant il respire vite, siffle et tète moins bien. Est-ce une bronchiolite et que faire ?",
    specialty: "pediatrie",
    tags: ["bronchiolite", "nourrisson", "respiration", "hiver"],
    aiSummary:
      "La bronchiolite est une infection respiratoire virale fréquente du nourrisson en hiver : après un rhume, le bébé respire vite, siffle et peut moins bien téter. La base du traitement à la maison : lavages de nez, fractionner les biberons, surveiller la respiration. On consulte en urgence si le bébé respire très vite ou difficilement, refuse de boire, est très fatigué, ou a moins de 3 mois.",
    metaTitle: "Bronchiolite du nourrisson : que faire | SantéauMaroc",
    metaDesc:
      "Bébé qui respire vite et siffle après un rhume : reconnaître la bronchiolite et quand consulter en urgence au Maroc. Conseils d'un pédiatre.",
    answer:
      "Ce que vous décrivez évoque une bronchiolite, une infection virale des petites bronches très fréquente chez le nourrisson, surtout en automne-hiver. Elle commence comme un rhume, puis le bébé se met à respirer plus vite, à siffler, à tousser, et tète souvent moins bien.\n\nLa plupart des bronchiolites sont bénignes et guérissent en 1 à 2 semaines. Les soins reposent sur des mesures simples, à la maison :\n— Laver le nez au sérum physiologique souvent, surtout avant les repas et le coucher.\n— Fractionner les biberons/tétées (plus petits, plus fréquents) pour qu'il continue à boire.\n— Le coucher sur le dos, aérer la chambre, ne pas surchauffer, et bien sûr aucun tabac à la maison.\n— Du paracétamol si fièvre et inconfort. Les antibiotiques et les sirops ne sont pas utiles (c'est viral).\n\nConsultez en urgence (ou appelez le 15 / 141) si le bébé : respire très vite ou avec effort (creux entre les côtes, battement des ailes du nez), fait des pauses respiratoires, refuse de boire ou prend moins de la moitié de ses biberons, vomit tout, est anormalement fatigué ou pâle/bleuté, ou a moins de 3 mois. Dans ces cas, il faut l'examiner sans attendre." +
      DISCLAIMER,
    upvotes: 11,
    thanks: 8,
  },
  {
    title: "Comment savoir si je suis prédiabétique et puis-je l'éviter ?",
    body: "Ma glycémie est un peu élevée mais je ne suis pas diabétique. On m'a parlé de prédiabète. Qu'est-ce que ça veut dire et que puis-je faire ?",
    specialty: "endocrinologie-et-maladies-metaboliques",
    tags: ["prédiabète", "glycémie", "diabète", "prévention"],
    aiSummary:
      "Le prédiabète est une glycémie plus haute que la normale, sans être encore un diabète. C'est un signal d'alarme réversible : perdre un peu de poids, bouger et améliorer l'alimentation peuvent éviter ou retarder le diabète. On le dépiste par une prise de sang, surtout en cas de surpoids, d'antécédents familiaux ou d'hypertension. Un suivi médical est conseillé.",
    metaTitle: "Prédiabète : le reconnaître et l'éviter | SantéauMaroc",
    metaDesc:
      "Prédiabète : ce que signifie une glycémie élevée, comment l'éviter d'évoluer en diabète et quand se faire dépister au Maroc.",
    answer:
      "Le prédiabète signifie que votre glycémie (sucre dans le sang) est plus élevée que la normale, mais pas encore au niveau d'un diabète. C'est une excellente nouvelle dans un sens : c'est un signal d'alarme précoce, et il est souvent réversible.\n\nIl ne donne en général aucun symptôme : on le découvre par une prise de sang (glycémie à jeun ou hémoglobine glyquée, HbA1c). Le dépistage est conseillé surtout en cas de surpoids (notamment au niveau du ventre), d'antécédents familiaux de diabète, d'hypertension, de cholestérol élevé, ou d'un diabète survenu pendant une grossesse.\n\nLe plus important : on peut éviter ou retarder le passage au diabète, et c'est très efficace. Les leviers :\n— Perdre un peu de poids (même 5 à 7 % du poids change beaucoup).\n— Bouger au moins 30 minutes par jour (la marche compte).\n— Réduire sucres rapides, boissons sucrées et aliments ultra-transformés ; privilégier légumes, légumineuses et céréales complètes.\n— Limiter le tabac, bien dormir.\n\nConsultez votre médecin pour confirmer, rechercher les autres facteurs de risque (tension, cholestérol) et organiser un suivi : un simple contrôle régulier permet d'agir à temps." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 6,
  },
  {
    title: "Homme de plus de 50 ans : envies fréquentes d'uriner la nuit, est-ce la prostate ?",
    body: "Je me lève plusieurs fois la nuit pour uriner, le jet est faible et j'ai du mal à démarrer. Est-ce un problème de prostate et faut-il s'inquiéter ?",
    specialty: "urologie-et-chirurgie-urologique",
    tags: ["prostate", "urines", "homme", "nuit"],
    aiSummary:
      "Après 50 ans, des envies fréquentes (surtout la nuit), un jet faible et une difficulté à démarrer évoquent souvent une augmentation bénigne de la prostate. C'est fréquent et non cancéreux, mais cela mérite un avis pour soulager et écarter d'autres causes. L'impossibilité totale d'uriner est une urgence. Du sang dans les urines ou une douleur imposent de consulter.",
    metaTitle: "Prostate et envies d'uriner la nuit : que faire | SantéauMaroc",
    metaDesc:
      "Jet faible, envies nocturnes après 50 ans : comprendre les troubles de la prostate et quand consulter au Maroc. Conseils d'un urologue.",
    answer:
      "Les symptômes que vous décrivez — se lever la nuit pour uriner, jet faible, difficulté à démarrer, sensation de ne pas vider complètement la vessie — sont très fréquents chez l'homme après 50 ans. Ils sont le plus souvent liés à une augmentation bénigne (non cancéreuse) du volume de la prostate, qui gêne l'écoulement de l'urine.\n\nC'est bénin, mais cela vaut la peine de consulter, pour deux raisons : soulager la gêne (des traitements efficaces existent) et écarter d'autres causes par un examen simple et, selon les cas, une prise de sang et une échographie.\n\nMesures qui aident au quotidien : limiter les boissons le soir, réduire café et thé, éviter de se retenir longtemps, et traiter une éventuelle constipation.\n\nConsultez sans tarder, et c'est une urgence (allez aux urgences), si vous ne parvenez plus du tout à uriner malgré l'envie (« rétention aiguë ») : c'est douloureux et nécessite un geste rapide.\n\nConsultez aussi rapidement en cas de sang dans les urines, de douleurs, de fièvre avec brûlures, ou d'envies impérieuses récentes et inhabituelles. Le médecin évaluera la prostate et vous proposera la conduite adaptée." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 4,
  },
  {
    title: "Allaitement : comment bien démarrer et éviter les difficultés ?",
    body: "Je vais accoucher bientôt et je veux allaiter. Comment bien commencer, à quelle fréquence, et que faire en cas de douleur ou de manque de lait ?",
    specialty: "pediatrie",
    tags: ["allaitement", "bébé", "lait maternel", "nouveau-né"],
    aiSummary:
      "L'allaitement se met en place les premiers jours : mise au sein précoce et fréquente, à la demande, avec une bonne position. Une bonne prise du sein prévient les crevasses. La plupart des doutes sur le « manque de lait » se résolvent par des tétées plus fréquentes. On surveille les signes que bébé boit assez (couches mouillées, prise de poids) et on demande conseil en cas de douleur ou d'inquiétude.",
    metaTitle: "Allaitement : bien démarrer et éviter les soucis | SantéauMaroc",
    metaDesc:
      "Réussir l'allaitement : mise au sein, fréquence, douleurs et manque de lait. Conseils pratiques d'un pédiatre au Maroc.",
    answer:
      "Bravo pour ce choix : le lait maternel couvre tous les besoins du bébé et le protège des infections. Quelques repères pour bien démarrer.\n\n— Commencez tôt : mettez bébé au sein dès les premières heures, peau à peau, et souvent (8 à 12 fois par 24 h les premières semaines), à la demande, jour et nuit. Les premiers jours, le bébé reçoit le colostrum, peu abondant mais très précieux.\n— Soignez la position et la prise du sein : bébé bien face à vous, bouche grande ouverte prenant l'aréole (pas seulement le mamelon). Une bonne prise prévient les crevasses et assure une bonne succion.\n— « Manque de lait » : c'est une crainte fréquente, le plus souvent infondée. La production s'ajuste à la demande : plus bébé tète, plus il y a de lait. Évitez les compléments inutiles qui risquent de réduire la stimulation.\n\nSignes que bébé boit assez : il mouille 5 à 6 couches par jour, fait des selles, est tonique et reprend du poids après la baisse initiale.\n\nDemandez conseil (sage-femme, médecin, pédiatre, consultante en lactation) en cas de douleur qui persiste, de crevasses, de seins durs et rouges avec fièvre (possible engorgement ou infection), ou si vous vous inquiétez de la croissance de bébé. L'allaitement s'apprend : un accompagnement précoce résout la plupart des difficultés." +
      DISCLAIMER,
    upvotes: 9,
    thanks: 7,
  },
  {
    title: "Noyade : quels gestes de premiers secours si quelqu'un se noie ?",
    body: "Cet été à la plage ou à la piscine, si quelqu'un se noie, que faut-il faire en attendant les secours ?",
    specialty: "medecine-d-urgence-et-de-catastrophe",
    tags: ["noyade", "premiers secours", "été", "urgence"],
    aiSummary:
      "Devant une noyade, on sort la personne de l'eau sans se mettre en danger et on appelle les secours (15 / 141). Si elle ne respire pas, on commence la réanimation (insufflations puis compressions). Toute personne ayant failli se noyer doit être examinée à l'hôpital, même si elle semble aller bien (risque de complication respiratoire retardée). La prévention reste essentielle, surtout pour les enfants.",
    metaTitle: "Noyade : gestes de premiers secours | SantéauMaroc",
    metaDesc:
      "Que faire en cas de noyade à la plage ou à la piscine : alerter, réanimer et consulter. Gestes qui sauvent, expliqués au Maroc.",
    answer:
      "La noyade peut être très rapide et silencieuse, surtout chez l'enfant. Réagir vite est vital.\n\nLes gestes :\n— Sortir la personne de l'eau sans vous mettre en danger vous-même (tendez un objet, une perche, ne vous jetez pas à l'eau si vous ne savez pas sauver) et faites appeler les secours immédiatement (15 / 141, ou 112 depuis un mobile).\n— Allongez la personne sur le dos sur une surface dure. Vérifiez si elle respire.\n— Si elle ne respire pas : commencez la réanimation. Pour une noyade, on débute par 5 insufflations (bouche-à-bouche) puis on alterne 30 compressions thoraciques et 2 insufflations, sans s'arrêter jusqu'à l'arrivée des secours.\n— Si elle respire mais est inconsciente : mettez-la sur le côté (position latérale de sécurité) et surveillez.\n— Ne perdez pas de temps à vouloir « faire vomir l'eau » : ce n'est pas utile et retarde les gestes qui sauvent. Réchauffez la personne (couverture).\n\nImportant : toute personne ayant failli se noyer doit être examinée à l'hôpital, même si elle semble aller bien, car des troubles respiratoires peuvent apparaître plusieurs heures après.\n\nPrévention : surveillance constante des enfants près de l'eau (une noyade est silencieuse), pas de baignade seul, respect des drapeaux et zones surveillées sur les plages." +
      DISCLAIMER,
    upvotes: 13,
    thanks: 10,
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
  const startOffsetHours = 24; // intercale après les lots précédents
  let created = 0;
  let updated = 0;

  for (let i = 0; i < CURATED.length; i++) {
    const c = CURATED[i];
    const specId = await specialtyIdBySlug(c.specialty);
    const doctorId = await pickVerifiedDoctor(c.specialty);
    const publishedAt = new Date(now - (startOffsetHours + i * 26) * 60 * 60 * 1000);

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

  console.log(`\n✓ 4e lot terminé. Créés : ${created} · Mis à jour : ${updated} · Total lot : ${CURATED.length}`);
  const pubCount = await prisma.question.count({ where: { status: "PUBLISHED" } });
  console.log(`Questions publiées en base : ${pubCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
