/**
 * Seed de contenu Q/R éditorial — 3e lot (SantéauMaroc).
 *
 * Complète les lots 1 et 2 : urgences (dont spécificités marocaines comme la
 * piqûre de scorpion), santé sexuelle, santé mentale, maladies chroniques.
 * Net-neuf, idempotent (détection par titre).
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
    title: "Quelqu'un s'étouffe avec un aliment : quels gestes de premiers secours ?",
    body: "Si une personne (ou mon enfant) s'étouffe en mangeant et ne peut plus respirer, que dois-je faire en attendant les secours ?",
    specialty: "medecine-d-urgence-et-de-catastrophe",
    tags: ["premiers secours", "étouffement", "urgence", "Heimlich"],
    aiSummary:
      "Devant un étouffement, si la personne tousse, on l'encourage à tousser. Si elle ne peut plus respirer ni parler, on alterne 5 claques dans le dos et 5 compressions abdominales (manœuvre de Heimlich) et on appelle les secours (15 / 141). Chez le nourrisson, on alterne 5 tapes dans le dos et 5 compressions thoraciques. Si la personne perd connaissance, on débute les gestes de réanimation.",
    metaTitle: "Étouffement : gestes de premiers secours | SantéauMaroc",
    metaDesc:
      "Que faire si une personne ou un enfant s'étouffe : claques dans le dos, manœuvre de Heimlich et secours. Gestes qui sauvent, expliqués au Maroc.",
    answer:
      "L'étouffement par un aliment ou un objet est une urgence : il faut agir vite, mais les bons gestes sont simples.\n\nSi la personne tousse, parle ou respire encore : ne tapez pas dans le dos, encouragez-la à tousser — la toux est le moyen le plus efficace d'expulser le corps étranger.\n\nSi elle ne peut plus respirer, parler ni tousser (obstruction complète) :\n— Donnez 5 claques vigoureuses dans le dos, entre les omoplates, avec le plat de la main, la personne penchée en avant.\n— Si cela ne suffit pas, faites 5 compressions abdominales (manœuvre de Heimlich) : placez-vous derrière, un poing au creux de l'estomac, et tirez vers vous et vers le haut.\n— Alternez 5 claques et 5 compressions jusqu'à expulsion.\n— Faites appeler les secours (15 / 141, ou 112 depuis un mobile).\n\nChez le nourrisson : alternez 5 tapes dans le dos (tête vers le bas) et 5 compressions thoraciques (deux doigts au milieu de la poitrine) ; pas de Heimlich avant 1 an.\n\nSi la personne perd connaissance, allongez-la et commencez les compressions thoraciques en attendant les secours. Apprendre ces gestes lors d'une formation aux premiers secours peut sauver un proche." +
      DISCLAIMER,
    upvotes: 16,
    thanks: 13,
  },
  {
    title: "Piqûre de scorpion : que faire en urgence ?",
    body: "Nous habitons une région où il y a des scorpions. Si l'un de nous, surtout un enfant, est piqué, que faut-il faire et quels signes sont graves ?",
    specialty: "medecine-d-urgence-et-de-catastrophe",
    tags: ["scorpion", "piqûre", "urgence", "enfant"],
    aiSummary:
      "La plupart des piqûres de scorpion ne provoquent qu'une douleur locale, bénigne chez l'adulte. Le danger concerne surtout les jeunes enfants, chez qui l'envenimation peut être grave. On calme et immobilise la personne, on donne du paracétamol (jamais d'aspirine/ibuprofène), on n'incise pas et on rejoint vite le centre de santé le plus proche. On appelle le 15/141 ou le Centre Anti Poison (CAPM) devant tout signe général.",
    metaTitle: "Piqûre de scorpion : que faire en urgence | SantéauMaroc",
    metaDesc:
      "Piqûre de scorpion au Maroc : premiers gestes, signes de gravité chez l'enfant et qui appeler (15/141, Centre Anti Poison). Conseils médicaux.",
    answer:
      "Au Maroc, les piqûres de scorpion sont fréquentes dans plusieurs régions, surtout l'été et au sud. Rassurez-vous : chez l'adulte, la plupart ne donnent qu'une douleur locale intense, sans gravité. Le risque sérieux concerne surtout les jeunes enfants, chez qui l'envenimation peut être grave et rapide.\n\nGestes immédiats :\n— Garder la personne calme et au repos ; immobiliser la zone piquée (l'agitation aggrave la diffusion du venin).\n— Appliquer du froid (linge propre) sur la piqûre pour la douleur.\n— Donner du paracétamol pour la douleur. NE PAS donner d'aspirine ni d'ibuprofène.\n— NE PAS inciser, sucer la plaie, poser un garrot, ni appliquer de remèdes traditionnels.\n\nRendez-vous sans tarder au centre de santé ou à l'hôpital le plus proche, surtout pour un enfant, une personne âgée ou enceinte : une surveillance de quelques heures est recommandée.\n\nAppelez immédiatement les secours (15 / 141, 112 depuis un mobile) ou le Centre Anti Poison du Maroc (CAPM, 05 37 68 64 64, 24h/24) devant des signes généraux : vomissements, sueurs abondantes, fièvre, agitation, difficulté à respirer, palpitations, ou chez tout enfant piqué. Ces signes imposent une prise en charge hospitalière urgente." +
      DISCLAIMER,
    upvotes: 18,
    thanks: 14,
  },
  {
    title: "Infections sexuellement transmissibles (IST) : symptômes, dépistage et protection ?",
    body: "Je me pose des questions sur les IST : quels sont les signes, comment se faire dépister discrètement et comment se protéger ?",
    specialty: "maladies-infectieuses",
    tags: ["IST", "dépistage", "préservatif", "prévention"],
    aiSummary:
      "Beaucoup d'IST ne donnent aucun symptôme, d'où l'importance du dépistage. Les signes possibles : écoulement, brûlures en urinant, plaies ou boutons génitaux, douleurs. Le préservatif reste la meilleure protection. Le dépistage (prise de sang, prélèvement) est confidentiel ; certaines IST se soignent simplement, d'autres se contrôlent. On consulte sans gêne, le médecin est tenu au secret.",
    metaTitle: "IST : symptômes, dépistage et protection | SantéauMaroc",
    metaDesc:
      "Infections sexuellement transmissibles : reconnaître les signes, se faire dépister en toute confidentialité et se protéger. Conseils médicaux au Maroc.",
    answer:
      "C'est une question importante et tout à fait légitime. Les infections sexuellement transmissibles (IST) sont fréquentes et, point essentiel, beaucoup ne donnent aucun symptôme : on peut être porteur sans le savoir et les transmettre. C'est pourquoi le dépistage compte autant que les symptômes.\n\nSignes possibles, quand ils existent : écoulement inhabituel (verge ou vagin), brûlures en urinant, plaies, boutons ou verrues sur les parties génitales, démangeaisons, douleurs lors des rapports ou dans le bas-ventre.\n\nSe protéger : le préservatif (masculin ou féminin), utilisé correctement et à chaque rapport, est la meilleure protection. La vaccination existe contre certaines infections (hépatite B, papillomavirus).\n\nLe dépistage est simple et confidentiel : prise de sang et/ou prélèvement local, selon les cas. Beaucoup d'IST se soignent très bien (souvent par antibiotiques) ; d'autres se contrôlent durablement. Plus c'est pris tôt, mieux c'est.\n\nN'hésitez pas à consulter un médecin sans gêne : il est tenu au secret professionnel. Si vous avez eu une prise de risque, parlez-en ; un dépistage du ou de la partenaire est aussi recommandé pour éviter de se réinfecter." +
      DISCLAIMER,
    upvotes: 9,
    thanks: 6,
  },
  {
    title: "Tension élevée pendant la grossesse : est-ce dangereux ?",
    body: "Je suis enceinte et ma tension est un peu haute. On m'a parlé de pré-éclampsie. Qu'est-ce que c'est et quels signes doivent m'alerter ?",
    specialty: "gyneco-obstetrique",
    tags: ["grossesse", "hypertension", "pré-éclampsie", "santé de la femme"],
    aiSummary:
      "Une tension élevée pendant la grossesse doit être surveillée de près car elle peut évoluer vers une pré-éclampsie, qui met en jeu la santé de la mère et du bébé. Les signes d'alerte : maux de tête intenses, troubles de la vue, douleur sous les côtes, gonflement brutal. Devant ces signes, il faut consulter en urgence. Un suivi régulier permet de dépister tôt.",
    metaTitle: "Tension et pré-éclampsie pendant la grossesse | SantéauMaroc",
    metaDesc:
      "Hypertension de la grossesse et pré-éclampsie : signes d'alerte et quand consulter en urgence au Maroc. Conseils d'un gynécologue.",
    answer:
      "Une tension élevée pendant la grossesse n'est pas à prendre à la légère : elle nécessite une surveillance rapprochée, car elle peut évoluer vers une pré-éclampsie, une complication qui touche la mère et le bébé.\n\nLa pré-éclampsie associe une hypertension et la présence de protéines dans les urines, généralement après la 20e semaine. Elle peut réduire l'apport de sang au bébé et, si elle s'aggrave, devenir dangereuse pour la maman.\n\nLes signes qui doivent vous amener à consulter en urgence :\n— Maux de tête intenses et persistants.\n— Troubles de la vue (points brillants, vision floue).\n— Douleur en barre au-dessus de l'estomac ou sous les côtes à droite.\n— Gonflement brutal du visage, des mains ou des pieds.\n— Bourdonnements d'oreille, prise de poids rapide, ou diminution des mouvements du bébé.\n\nDevant ces signes, rendez-vous sans attendre à la maternité ou appelez les secours (15 / 141).\n\nLa meilleure protection est le suivi prénatal régulier : la tension et les urines sont vérifiées à chaque consultation, ce qui permet de dépister et de prendre en charge tôt. Au Maroc, ce suivi est assuré dans les centres de santé et en cabinet — ne sautez pas vos rendez-vous." +
      DISCLAIMER,
    upvotes: 11,
    thanks: 8,
  },
  {
    title: "Mon enfant passe beaucoup de temps sur les écrans : quels risques et quelles limites ?",
    body: "Mes enfants regardent la télé, la tablette et le téléphone plusieurs heures par jour. Est-ce mauvais et quelles limites fixer selon l'âge ?",
    specialty: "pediatrie",
    tags: ["écrans", "enfant", "sommeil", "développement"],
    aiSummary:
      "Trop d'écrans peut nuire au sommeil, à la concentration, au langage et au poids de l'enfant. On recommande pas d'écran avant 2-3 ans, un temps limité et accompagné ensuite, pas d'écran pendant les repas ni avant le coucher. L'important est de privilégier jeu, lecture et activité physique. On consulte en cas de retard de langage ou de troubles du sommeil ou du comportement.",
    metaTitle: "Enfants et écrans : risques et limites par âge | SantéauMaroc",
    metaDesc:
      "Combien de temps d'écran pour un enfant ? Risques, règles par âge et bons réflexes. Conseils d'un pédiatre au Maroc.",
    answer:
      "Vous avez raison de vous poser la question. Un excès d'écrans, surtout chez les plus jeunes, peut retentir sur le sommeil, la concentration, le langage, la vue et le poids, et réduire le temps de jeu et d'échanges, essentiels au développement.\n\nQuelques repères simples selon l'âge :\n— Avant 2-3 ans : éviter les écrans autant que possible (ils n'apportent rien au tout-petit).\n— De 3 à 6 ans : un temps court et toujours accompagné, avec des contenus adaptés.\n— Après 6 ans : fixer une durée raisonnable et des règles claires, en gardant le dialogue.\n\nDans tous les cas : pas d'écran pendant les repas, ni dans la chambre, ni dans l'heure qui précède le coucher (la lumière des écrans perturbe le sommeil). Montrez l'exemple et privilégiez le jeu, la lecture, le sport et le temps en famille.\n\nConsultez un médecin ou un pédiatre si vous observez un retard de langage, des troubles du sommeil, une irritabilité importante, des difficultés scolaires ou un repli sur l'écran : un avis aide à rééquilibrer les choses." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 5,
  },
  {
    title: "Asthme : comment gérer le quotidien et réagir à une crise ?",
    body: "Je suis asthmatique et parfois je manque d'air. Comment bien gérer mon asthme au jour le jour et que faire pendant une crise ?",
    specialty: "pneumo-phtisiologie",
    tags: ["asthme", "respiration", "crise", "poumons"],
    aiSummary:
      "Un asthme bien suivi permet une vie normale. On évite les déclencheurs (tabac, poussière, pollens), on prend son traitement de fond régulièrement et on garde toujours son inhalateur de secours. En cas de crise : s'asseoir, rester calme, prendre le bronchodilatateur. On appelle les secours (15/141) si la gêne est sévère ou ne cède pas.",
    metaTitle: "Asthme : gérer le quotidien et une crise | SantéauMaroc",
    metaDesc:
      "Vivre avec l'asthme : éviter les déclencheurs, le traitement de fond et que faire en cas de crise. Conseils d'un pneumologue au Maroc.",
    answer:
      "Avec un bon suivi, on vit tout à fait normalement avec un asthme — y compris en faisant du sport. L'asthme est une inflammation des bronches qui se resserrent, d'où la gêne, les sifflements et la toux.\n\nAu quotidien :\n— Éviter les déclencheurs : tabac (et tabagisme passif), poussière, acariens, poils d'animaux, pollens, air froid, fortes odeurs, pollution.\n— Prendre régulièrement le traitement de fond prescrit (souvent un inhalateur à base de corticoïde), même quand on se sent bien : c'est lui qui prévient les crises. Bien maîtriser la technique d'inhalation est essentiel.\n— Garder toujours sur soi l'inhalateur de secours (bronchodilatateur à action rapide).\n\nEn cas de crise : arrêtez l'effort, asseyez-vous, restez calme, et prenez votre inhalateur de secours (bouffées selon la prescription).\n\nAppelez les secours (15 / 141 / 112) si : la gêne est intense, vous parlez avec difficulté, les lèvres bleuissent, ou l'inhalateur de secours ne soulage pas. Consultez votre médecin si vous utilisez souvent le traitement de secours : cela signifie que l'asthme n'est pas assez contrôlé et qu'il faut adapter le traitement." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 4,
  },
  {
    title: "Hémorroïdes : comment se soulager et quand consulter ?",
    body: "J'ai des douleurs et parfois un peu de sang aux toilettes. Je pense à des hémorroïdes. Que puis-je faire et quand faut-il s'inquiéter ?",
    specialty: "gastro-enterologie",
    tags: ["hémorroïdes", "saignement", "constipation", "anus"],
    aiSummary:
      "Les hémorroïdes sont très fréquentes et bénignes. On les soulage en évitant la constipation (fibres, eau), en ne forçant pas aux toilettes, avec des bains tièdes et des traitements locaux. Mais le sang aux toilettes ne doit jamais être attribué d'emblée aux hémorroïdes : un avis médical est nécessaire pour ne pas passer à côté d'une autre cause.",
    metaTitle: "Hémorroïdes : soulager et quand consulter | SantéauMaroc",
    metaDesc:
      "Hémorroïdes : gestes qui soulagent et pourquoi tout saignement doit être vu par un médecin. Conseils au Maroc.",
    answer:
      "Les hémorroïdes sont des veines dilatées de la région de l'anus ; c'est très fréquent et bénin. Les crises se manifestent par une douleur, une gêne, des démangeaisons et parfois un saignement rouge vif au moment des selles.\n\nCe qui soulage :\n— Lutter contre la constipation, principale cause des poussées : fibres, eau, activité physique.\n— Ne pas forcer ni rester trop longtemps aux toilettes.\n— Des bains de siège tièdes (10 minutes) soulagent la douleur.\n— Des crèmes ou suppositoires en pharmacie peuvent aider sur quelques jours ; un antalgique simple si besoin.\n\nPoint important : il ne faut jamais attribuer soi-même un saignement aux seules hémorroïdes. Du sang dans les selles peut avoir d'autres causes, parfois sérieuses. Un examen médical simple permet de confirmer l'origine.\n\nConsultez un médecin si : le saignement se répète ou est abondant, la douleur est forte ou avec une boule dure (thrombose), il y a du sang noir ou mêlé aux selles, un changement du transit, un amaigrissement, ou si vous avez plus de 50 ans ou des antécédents familiaux de cancer du côlon." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 4,
  },
  {
    title: "Mon enfant a mal à l'oreille : est-ce une otite et faut-il des antibiotiques ?",
    body: "Mon enfant pleure et se plaint de l'oreille, surtout la nuit, après un rhume. Est-ce une otite ? Faut-il consulter et donner des antibiotiques ?",
    specialty: "oto-rhino-laryngologie",
    tags: ["otite", "enfant", "oreille", "douleur"],
    aiSummary:
      "L'otite de l'enfant survient souvent après un rhume : douleur de l'oreille, pleurs, fièvre. On soulage la douleur avec du paracétamol et on consulte pour examiner le tympan : tous les cas ne nécessitent pas d'antibiotiques. On consulte en urgence si fièvre élevée, écoulement de l'oreille, raideur de nuque, ou chez le nourrisson.",
    metaTitle: "Otite de l'enfant : que faire et antibiotiques | SantéauMaroc",
    metaDesc:
      "Mal d'oreille chez l'enfant après un rhume : reconnaître l'otite, la soulager et quand consulter au Maroc. Conseils d'un médecin ORL.",
    answer:
      "La douleur d'oreille chez un enfant, surtout la nuit et après un rhume, évoque souvent une otite moyenne aiguë : c'est très fréquent chez le jeune enfant, dont les conduits sont encore courts.\n\nLes signes : douleur de l'oreille (le tout-petit pleure, se touche l'oreille, dort mal), fièvre, parfois baisse de l'audition ou un écoulement.\n\nEn attendant la consultation : donnez du paracétamol à la dose adaptée au poids pour calmer la douleur et la fièvre ; cela soulage rapidement.\n\nIl faut consulter pour que le médecin examine le tympan : c'est cet examen qui décide. Toutes les otites ne nécessitent pas d'antibiotiques — certaines, virales, guérissent seules sous surveillance et antidouleurs ; les antibiotiques sont réservés à certains cas (jeune âge, otite bactérienne confirmée, signes marqués). Il ne faut pas en donner « au cas où ».\n\nConsultez en urgence si : fièvre élevée et persistante, écoulement de l'oreille, gonflement ou rougeur derrière l'oreille, raideur de la nuque, somnolence anormale, ou chez un nourrisson de moins de 6 mois." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 5,
  },
  {
    title: "Mon enfant a la peau sèche qui démange (eczéma) : que faire ?",
    body: "Mon enfant a des plaques rouges qui grattent, surtout aux plis des bras et des genoux. On m'a parlé d'eczéma. Comment le soulager ?",
    specialty: "dermatologie",
    tags: ["eczéma", "dermatite atopique", "enfant", "peau sèche"],
    aiSummary:
      "L'eczéma (dermatite atopique) de l'enfant est fréquent et bénin, mais gênant. La base du traitement : hydrater la peau tous les jours avec un émollient, et utiliser une crème à la cortisone sur les poussées, selon la prescription. On évite les irritants (savons agressifs, laine). On consulte si les plaques s'infectent, résistent ou gênent le sommeil.",
    metaTitle: "Eczéma de l'enfant : soulager la peau | SantéauMaroc",
    metaDesc:
      "Eczéma (dermatite atopique) chez l'enfant : comment hydrater, traiter les poussées et quand consulter. Conseils d'un dermatologue au Maroc.",
    answer:
      "Les plaques rouges qui démangent dans les plis (coudes, genoux), sur une peau sèche, sont typiques de l'eczéma (dermatite atopique). C'est très fréquent chez l'enfant, souvent sur un terrain familial allergique, et cela s'améliore généralement avec l'âge. Ce n'est ni contagieux ni dû à un manque d'hygiène.\n\nLa prise en charge repose sur deux piliers :\n— Hydrater la peau tous les jours, même sans poussée, avec une crème émolliente : c'est le geste le plus important pour espacer les crises.\n— Traiter les poussées avec une crème à la cortisone (dermocorticoïde) prescrite par le médecin, appliquée sur les plaques le temps nécessaire. Bien utilisée, elle est efficace et sûre — n'en ayez pas peur, mais suivez la prescription.\n\nAu quotidien : douches courtes et tièdes, savon doux (surgras), sécher en tamponnant, éviter la laine à même la peau et les températures extrêmes, garder les ongles courts pour limiter le grattage.\n\nConsultez si : les plaques suintent, deviennent croûteuses ou jaunâtres (surinfection), résistent au traitement, gênent le sommeil, ou en cas de doute sur le diagnostic. Un dermatologue peut adapter le traitement et rechercher des facteurs déclenchants." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 4,
  },
  {
    title: "Crise de goutte : pourquoi mon gros orteil est-il très douloureux ?",
    body: "Je me suis réveillé avec le gros orteil rouge, gonflé et extrêmement douloureux. On m'a parlé de goutte. Qu'est-ce que c'est et que faire ?",
    specialty: "rhumatologie",
    tags: ["goutte", "acide urique", "articulation", "orteil"],
    aiSummary:
      "La goutte est une arthrite due à un excès d'acide urique qui forme des cristaux dans une articulation, souvent le gros orteil : douleur brutale, intense, avec rougeur et gonflement. On soulage la crise avec repos, froid et un traitement adapté. À distance, on réduit les facteurs favorisants (alcool, viandes, sodas). On consulte pour confirmer et prévenir les récidives.",
    metaTitle: "Crise de goutte : que faire pour le gros orteil | SantéauMaroc",
    metaDesc:
      "Goutte et acide urique : reconnaître une crise, la soulager et l'éviter. Conseils d'un rhumatologue au Maroc.",
    answer:
      "Une douleur brutale, souvent nocturne, du gros orteil devenu rouge, chaud, gonflé et hypersensible (le drap fait mal) est très évocatrice d'une crise de goutte. C'est une forme d'arthrite due à un excès d'acide urique dans le sang, qui forme des microcristaux dans l'articulation.\n\nPendant la crise :\n— Mettre l'articulation au repos et la surélever ; appliquer du froid.\n— Le traitement de la crise (anti-inflammatoire, colchicine ou autre) doit être adapté par un médecin, surtout en cas de maladie du rein, du cœur ou d'ulcère.\n— Bien s'hydrater (eau).\n\nPour éviter les récidives, on réduit les facteurs favorisants : alcool (surtout la bière), abats et viandes rouges en excès, fruits de mer, boissons et aliments très sucrés (sodas) ; on contrôle le poids, la tension et le diabète.\n\nConsultez pour confirmer le diagnostic (parfois par une prise de sang ou une ponction) et, en cas de crises répétées ou de taux d'acide urique élevé, discuter d'un traitement de fond qui fait baisser l'acide urique au long cours. Une articulation très douloureuse avec fièvre doit être vue rapidement pour écarter une infection." +
      DISCLAIMER,
    upvotes: 5,
    thanks: 3,
  },
  {
    title: "Troubles de l'érection : est-ce grave et que peut-on faire ?",
    body: "Depuis quelque temps, j'ai des difficultés d'érection. C'est gênant à dire mais ça m'inquiète. Est-ce dans la tête ou physique, et y a-t-il des solutions ?",
    specialty: "andrologie",
    tags: ["érection", "santé masculine", "couple"],
    aiSummary:
      "Les troubles de l'érection sont fréquents et le plus souvent traitables. Les causes peuvent être psychologiques (stress, anxiété) et/ou physiques (diabète, tension, cholestérol, tabac, certains médicaments). Ils peuvent aussi être un signal d'alerte cardiovasculaire. Un bilan médical simple oriente la cause, et des solutions efficaces existent. Il ne faut pas hésiter à en parler.",
    metaTitle: "Troubles de l'érection : causes et solutions | SantéauMaroc",
    metaDesc:
      "Difficultés d'érection : causes psychologiques et physiques, lien avec le cœur et solutions. Conseils confidentiels d'un médecin au Maroc.",
    answer:
      "C'est un motif très fréquent, et il ne faut surtout pas en avoir honte : en parler est la première étape vers une solution. Une difficulté passagère, liée à la fatigue ou au stress, est banale ; c'est la persistance qui justifie un avis.\n\nLes causes sont souvent mêlées :\n— Psychologiques : stress, anxiété de performance, fatigue, soucis de couple, dépression.\n— Physiques : diabète, hypertension, excès de cholestérol, tabac, alcool, surpoids, baisse de testostérone, ou effet de certains médicaments.\n\nPoint important : chez l'homme, des troubles de l'érection peuvent être un signal d'alerte précoce d'un problème des artères (cœur, vaisseaux). C'est une raison de plus de consulter, pas seulement pour la sexualité.\n\nUn bilan simple (interrogatoire, tension, prise de sang) oriente la cause. Les solutions sont nombreuses et efficaces : corriger l'hygiène de vie (arrêt du tabac, activité physique, équilibre du diabète et de la tension), prendre en charge le stress, et, si besoin, des traitements sur ordonnance.\n\nÉvitez les produits vendus sans prescription ou sur internet : ils peuvent être dangereux. Parlez-en à un médecin, en toute confidentialité — c'est un motif courant qu'il connaît bien." +
      DISCLAIMER,
    upvotes: 8,
    thanks: 5,
  },
  {
    title: "Comment reconnaître une dépression et quand demander de l'aide ?",
    body: "Depuis plusieurs semaines, je n'ai goût à rien, je suis fatigué et triste. Est-ce une dépression ou juste un coup de mou ? Quand faut-il consulter ?",
    specialty: "psychiatrie",
    tags: ["dépression", "santé mentale", "tristesse", "aide"],
    aiSummary:
      "La dépression est une maladie fréquente, pas une faiblesse. Elle se reconnaît à une tristesse ou une perte d'intérêt durant plus de deux semaines, avec fatigue, troubles du sommeil et de l'appétit, dévalorisation. Elle se soigne bien (psychothérapie, parfois médicaments). On demande de l'aide sans tarder, et en urgence en cas d'idées noires ou suicidaires.",
    metaTitle: "Reconnaître une dépression et trouver de l'aide | SantéauMaroc",
    metaDesc:
      "Dépression : symptômes, différence avec un coup de mou et quand consulter au Maroc. Information fiable et bienveillante.",
    answer:
      "Ce que vous décrivez mérite attention, et le fait d'en parler est déjà un bon pas. Un coup de mou passager est normal ; on parle plutôt de dépression quand les symptômes durent plus de deux semaines, presque tous les jours, et retentissent sur la vie quotidienne.\n\nLes signes fréquents :\n— Tristesse persistante ou perte d'intérêt et de plaisir pour ce qu'on aimait.\n— Fatigue, manque d'énergie, ralentissement.\n— Troubles du sommeil (insomnie ou hypersomnie) et de l'appétit.\n— Difficultés de concentration, sentiment de dévalorisation ou de culpabilité.\n\nPoint essentiel : la dépression est une vraie maladie, fréquente, et non une faiblesse de caractère ou un manque de volonté. Surtout, elle se soigne bien — par une psychothérapie, parfois associée à un traitement, selon l'intensité.\n\nDemandez de l'aide sans attendre auprès d'un médecin ou d'un psychologue si ces signes durent ou s'aggravent. Et c'est une urgence si apparaissent des idées noires, l'impression que la vie ne vaut pas la peine, ou des pensées suicidaires : parlez-en immédiatement à un proche et contactez un professionnel ou les secours (15 / 141). Vous n'êtes pas seul, et l'aide est efficace." +
      DISCLAIMER,
    upvotes: 12,
    thanks: 9,
  },
  {
    title: "Douleur violente dans le dos et le côté : est-ce une colique néphrétique ?",
    body: "J'ai une douleur intense d'un côté du dos qui descend vers le bas-ventre, avec envie de vomir. Est-ce un calcul rénal et que faire ?",
    specialty: "urologie-et-chirurgie-urologique",
    tags: ["colique néphrétique", "calcul rénal", "douleur", "reins"],
    aiSummary:
      "Une douleur brutale et très intense d'un côté du dos, irradiant vers le bas-ventre, avec agitation et nausées, évoque une colique néphrétique (calcul urinaire). On boit normalement, on prend un antalgique et on consulte. On va aux urgences en cas de fièvre, de vomissements incoercibles, d'absence d'urines ou de sang abondant : ce sont des signes de gravité.",
    metaTitle: "Colique néphrétique et calcul rénal : que faire | SantéauMaroc",
    metaDesc:
      "Douleur intense du dos vers le ventre : reconnaître une colique néphrétique et quand aller aux urgences au Maroc. Conseils d'un urologue.",
    answer:
      "Une douleur qui démarre brutalement d'un côté du dos (la « loge » du rein), très intense, qui descend vers le bas-ventre et les organes génitaux, avec une impossibilité de trouver une position antalgique, des nausées ou des envies fréquentes d'uriner, est typique d'une colique néphrétique. Elle est due à un calcul qui bloque l'évacuation de l'urine.\n\nEn attendant :\n— Prenez l'antalgique dont vous disposez (le paracétamol aide ; les anti-inflammatoires sont efficaces mais déconseillés dans certains cas — d'où l'intérêt d'un avis).\n— Contrairement à une idée reçue, il ne faut pas se forcer à boire énormément pendant la crise ; buvez normalement.\n— Filtrer les urines peut permettre de récupérer le calcul pour analyse.\n\nConsultez pour confirmer (un examen et souvent une imagerie) et soulager la douleur.\n\nAllez aux urgences ou appelez le 15 / 141 sans attendre en cas de signes de gravité : fièvre ou frissons (risque d'infection grave), vomissements qui empêchent tout traitement, absence totale d'urines, sang abondant dans les urines, ou si vous n'avez qu'un seul rein. Après la crise, un bilan recherche la cause pour éviter les récidives (hydratation, alimentation)." +
      DISCLAIMER,
    upvotes: 7,
    thanks: 4,
  },
  {
    title: "Faut-il faire le vaccin contre la grippe et qui est concerné ?",
    body: "Chaque hiver on parle du vaccin contre la grippe. Est-il utile, qui devrait le faire et quand ?",
    specialty: "medecine-generale",
    tags: ["grippe", "vaccin", "prévention", "hiver"],
    aiSummary:
      "Le vaccin contre la grippe réduit le risque de grippe et surtout de formes graves. Il est particulièrement recommandé aux personnes fragiles : plus de 65 ans, maladies chroniques, femmes enceintes, et au personnel de santé. On le fait idéalement à l'automne, avant l'hiver, car il faut le renouveler chaque année. C'est un geste de prévention simple.",
    metaTitle: "Vaccin contre la grippe : utile et pour qui ? | SantéauMaroc",
    metaDesc:
      "Vaccin antigrippal : à quoi il sert, qui devrait le faire et quand au Maroc. Conseils de prévention d'un médecin.",
    answer:
      "Le vaccin contre la grippe est utile : la grippe n'est pas un simple rhume, elle peut entraîner des complications sérieuses (pneumonie, aggravation d'une maladie chronique), surtout chez les personnes fragiles. Le vaccin réduit le risque d'attraper la grippe et, surtout, celui de faire une forme grave.\n\nIl est particulièrement recommandé pour :\n— Les personnes de 65 ans et plus.\n— Les personnes ayant une maladie chronique (diabète, asthme/BPCO, maladie du cœur, des reins, immunité affaiblie).\n— Les femmes enceintes.\n— Le personnel de santé et l'entourage de personnes fragiles.\n\nLe bon moment : à l'automne, avant le pic hivernal. Comme le virus change chaque année, le vaccin se refait chaque saison. La protection s'installe en une à deux semaines.\n\nIl est généralement bien toléré : parfois une douleur au point d'injection ou une légère fièvre un jour ou deux. Il ne donne pas la grippe.\n\nMême vacciné, gardez les gestes simples (lavage des mains, aération) en période d'épidémie. Demandez conseil à votre médecin ou pharmacien pour savoir si vous êtes concerné et où le faire." +
      DISCLAIMER,
    upvotes: 6,
    thanks: 3,
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
  const startOffsetHours = 18; // intercale après les lots précédents
  let created = 0;
  let updated = 0;

  for (let i = 0; i < CURATED.length; i++) {
    const c = CURATED[i];
    const specId = await specialtyIdBySlug(c.specialty);
    const doctorId = await pickVerifiedDoctor(c.specialty);
    const publishedAt = new Date(now - (startOffsetHours + i * 30) * 60 * 60 * 1000);

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

  console.log(`\n✓ 3e lot terminé. Créés : ${created} · Mis à jour : ${updated} · Total lot : ${CURATED.length}`);
  const pubCount = await prisma.question.count({ where: { status: "PUBLISHED" } });
  console.log(`Questions publiées en base : ${pubCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
