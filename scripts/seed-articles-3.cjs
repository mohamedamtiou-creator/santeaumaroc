require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Article 1 : Alimentation méditerranéenne ────────────────────────────────
const content1 = `<p>Et si votre tajine, votre harira et votre salade marocaine étaient parmi les meilleures médecines préventives qui soient ? L'alimentation méditerranéenne au Maroc n'est pas un régime importé de l'étranger : c'est, en grande partie, ce que vos grands-parents mangeaient chaque jour. À une époque où le diabète de type 2, l'hypertension et les maladies cardiovasculaires progressent rapidement au Maroc, redécouvrir les fondements de la cuisine marocaine traditionnelle représente une stratégie de santé publique puissante — et délicieuse.</p>

<h2>Qu'est-ce que le régime méditerranéen ?</h2>
<p>Le régime méditerranéen est un mode d'alimentation inspiré des habitudes culinaires des populations riveraines de la Méditerranée. Il a été formalisé dans les années 1960 par le chercheur américain Ancel Keys, qui avait observé une longévité remarquable chez les populations grecques, italiennes et… maghrébines.</p>
<p>Ses piliers sont simples et cohérents avec la cuisine marocaine ancestrale :</p>
<ul>
<li>Une consommation abondante de légumes, légumineuses et fruits frais</li>
<li>Des céréales complètes ou semi-complètes (pain, couscous, orge)</li>
<li>L'huile d'olive comme corps gras principal</li>
<li>Du poisson et des fruits de mer plusieurs fois par semaine</li>
<li>Des herbes aromatiques et des épices en remplacement du sel</li>
<li>Une consommation modérée de viande rouge</li>
<li>Des oléagineux : amandes, noix, graines de sésame</li>
</ul>
<p>Ce profil nutritionnel correspond presque trait pour trait à ce que les familles marocaines préparaient avant l'industrialisation alimentaire et l'essor de la restauration rapide.</p>

<h2>Les bienfaits prouvés du régime méditerranéen</h2>
<p>Les preuves scientifiques sont aujourd'hui considérables. Depuis l'étude PREDIMED menée en Espagne jusqu'aux travaux de l'INSERM en France, les données convergent : adopter une alimentation saine au Maroc inspirée du modèle méditerranéen réduit significativement les risques de plusieurs pathologies chroniques.</p>
<blockquote>Une méta-analyse publiée dans le <em>British Medical Journal</em> (2019) portant sur plus de 12 millions de personnes a établi que le régime méditerranéen réduit de 25 % le risque de maladies cardiovasculaires et de 33 % le risque de diabète de type 2.</blockquote>

<h3>Protection cardiovasculaire</h3>
<p>L'huile d'olive est au cœur de cette protection. Riche en acides gras mono-insaturés (oméga-9) et en polyphénols antioxydants, elle contribue à réduire le mauvais cholestérol (LDL) tout en préservant le bon (HDL). L'ail, le curcuma, le cumin et la coriandre — omniprésents dans la cuisine marocaine — possèdent également des propriétés anti-inflammatoires documentées qui soutiennent la santé artérielle.</p>

<h3>Prévention du diabète de type 2</h3>
<p>Les légumineuses — pois chiches, lentilles, fèves — que l'on retrouve dans la harira, le bissara et tant d'autres plats marocains, ont un index glycémique bas. Elles libèrent leurs sucres lentement, stabilisent la glycémie et améliorent la sensibilité à l'insuline. Manger sain au Maroc, c'est aussi revenir à ces protéines végétales qui remplacent avantageusement la viande dans l'assiette quotidienne.</p>

<h3>Contrôle du poids et prévention de l'obésité</h3>
<p>Contrairement aux régimes restrictifs qui promettent des résultats rapides, le régime méditerranéen s'inscrit dans la durée. Sa richesse en fibres, en protéines végétales et en graisses saines procure une satiété durable, réduit les fringales et favorise un poids corporel stable sans frustration alimentaire.</p>

<h3>Santé cognitive et protection contre la dépression</h3>
<p>Des recherches récentes montrent un lien entre alimentation méditerranéenne et réduction du risque de déclin cognitif et de maladie d'Alzheimer. Les acides gras oméga-3 des poissons gras (sardines, maquereau — très présents sur les côtes atlantiques et méditerranéennes marocaines) protègent les membranes des neurones et soutiennent la production de sérotonine.</p>

<h2>La cuisine marocaine traditionnelle : un modèle méditerranéen à part entière</h2>
<p>Il est important de le souligner : la cuisine marocaine ancestrale n'a rien à envier aux modèles grecs ou italiens. Elle en partage les vertus fondamentales, avec une identité propre et une richesse aromatique exceptionnelle.</p>

<h3>Les plats marocains naturellement méditerranéens</h3>
<ol>
<li><strong>La harira</strong> — tomates, lentilles, pois chiches, coriandre : un concentré de fibres, de protéines et d'antioxydants</li>
<li><strong>Le couscous aux légumes</strong> — semoule semi-complète, légumes variés, légumineuses : équilibre glycémique et apport minéral exceptionnel</li>
<li><strong>Le tajine de poisson</strong> — poisson blanc ou gras, olives, citron confit, épices : oméga-3, vitamine D et polyphénols réunis</li>
<li><strong>Le bissara</strong> — purée de fèves à l'huile d'olive et au cumin : protéines végétales, fer et graisses de qualité</li>
<li><strong>La zaalouk et les salades cuites</strong> — aubergines, tomates, poivrons : vitamines, minéraux et fibres en abondance</li>
</ol>

<h3>Ce qui s'est perdu et qu'il faut retrouver</h3>
<p>L'urbanisation et la mondialisation alimentaire ont introduit dans les foyers marocains des habitudes moins favorables : huiles végétales raffinées, pain blanc, sucreries industrielles, fast-food. Or, c'est précisément cet éloignement du modèle traditionnel qui coïncide avec la montée des maladies métaboliques au Maroc.</p>

<h2>Comment intégrer l'alimentation méditerranéenne au quotidien</h2>
<p>Pas besoin de tout révolutionner. Quelques ajustements progressifs suffisent à transformer votre alimentation :</p>
<ul>
<li><strong>Remplacez les huiles végétales raffinées</strong> par de l'huile d'olive vierge extra pour l'assaisonnement et les cuissons douces</li>
<li><strong>Augmentez la fréquence des légumineuses</strong> : visez au moins 3 à 4 repas à base de pois chiches, lentilles ou fèves par semaine</li>
<li><strong>Mangez du poisson</strong> au moins deux fois par semaine — les sardines fraîches de l'Atlantique marocain sont accessibles et excellentes</li>
<li><strong>Réduisez la viande rouge</strong> à une à deux fois par semaine maximum</li>
<li><strong>Privilégiez les fruits frais</strong> en dessert plutôt que les pâtisseries industrielles</li>
<li><strong>Cuisinez vos épices</strong> généreusement : curcuma, cumin, gingembre, cannelle sont de puissants anti-inflammatoires naturels</li>
<li><strong>Hydratez-vous</strong> avec de l'eau et des infusions de plantes plutôt qu'avec des boissons sucrées</li>
</ul>

<hr>

<h2>Conclusion : votre santé commence dans votre cuisine</h2>
<p>L'alimentation méditerranéenne au Maroc n'est pas une mode venue d'ailleurs — c'est un retour aux sources. La cuisine marocaine traditionnelle, dans sa forme la plus authentique, est déjà un régime méditerranéen. Elle est savoureuse, variée, accessible et scientifiquement validée comme bouclier contre les grandes maladies chroniques de notre époque.</p>
<p>Chaque choix alimentaire est un acte de prévention. Remettre l'huile d'olive, les légumineuses, les légumes et les épices au centre de l'assiette, c'est investir dans sa santé à long terme — sans se priver du plaisir de manger.</p>
<p><strong>Vous souhaitez adapter ce mode d'alimentation à votre situation personnelle ?</strong> Consultez un médecin nutritionniste ou une diététicienne sur <em>santeaumaroc.com</em> pour un accompagnement personnalisé.</p>`;

// ─── Article 2 : Cancer du sein ──────────────────────────────────────────────
const content2 = `<p>Chaque année au Maroc, des milliers de femmes reçoivent un diagnostic de cancer du sein. Derrière chaque chiffre, il y a une mère, une sœur, une amie. Ce cancer, le plus fréquent chez la femme marocaine, peut faire peur — et c'est normal. Mais ce qu'il faut retenir, c'est que lorsqu'il est détecté tôt, il se traite dans la grande majorité des cas avec succès. Parler de cancer du sein, c'est déjà agir pour sa santé.</p>

<h2>Le cancer du sein au Maroc : une réalité qui nous concerne toutes</h2>
<p>Au Maroc, le <strong>cancer du sein</strong> représente près de 40 % de l'ensemble des cancers féminins. Il touche des femmes de tous les âges, mais reste plus fréquent après 40 ans. Contrairement à certaines idées reçues, il ne frappe pas seulement les femmes ayant des antécédents familiaux.</p>
<blockquote>Selon le Registre des Cancers de la Région du Grand Casablanca, le cancer du sein est le cancer le plus fréquent chez la femme au Maroc, avec une incidence de 40,5 cas pour 100 000 femmes.</blockquote>
<p>Ces données doivent nous alerter, non nous paralyser. Plus nous parlons de ce cancer, plus nous normalisons le dépistage, et plus de vies peuvent être sauvées.</p>

<h3>Pourquoi le dépistage précoce change tout</h3>
<p>Détecter un cancer du sein à un stade précoce multiplie considérablement les chances de guérison. À un stade localisé, le taux de survie à cinq ans dépasse 90 %. C'est pourquoi ne pas attendre les symptômes est le message le plus important que l'on puisse transmettre.</p>

<h2>Les signes du cancer du sein à ne pas ignorer</h2>
<p>Connaître les signes permet de consulter rapidement. Voici les principaux signaux d'alerte à surveiller lors de l'autopalpation mensuelle :</p>
<ul>
<li>Une <strong>bosse ou masse</strong> dans le sein ou l'aisselle, même indolore</li>
<li>Un changement de <strong>taille ou de forme</strong> du sein</li>
<li>Une modification de la peau : rougeur, aspect en « peau d'orange », épaississement</li>
<li>Un <strong>écoulement du mamelon</strong>, surtout s'il est sanglant</li>
<li>Un mamelon qui se rétracte vers l'intérieur</li>
<li>Une douleur persistante dans le sein ou le mamelon</li>
</ul>
<p>Ces signes ne signifient pas forcément un cancer — de nombreuses anomalies sont bénignes. Mais seul un médecin peut le confirmer. En cas de doute, <strong>consultez sans attendre</strong>.</p>

<h3>Comment réaliser une autopalpation correctement</h3>
<p>L'autopalpation doit être pratiquée une fois par mois, idéalement quelques jours après les règles, lorsque les seins sont moins sensibles. Voici les étapes :</p>
<ol>
<li>Devant un miroir, observez vos seins bras le long du corps, puis bras levés.</li>
<li>Allongée, placez un oreiller sous l'épaule du côté examiné.</li>
<li>Avec les trois doigts du milieu, explorez le sein en cercles concentriques, de l'extérieur vers le mamelon.</li>
<li>Palpez également l'aisselle et la zone entre le sein et la clavicule.</li>
<li>Répétez de l'autre côté.</li>
</ol>
<p>Se familiariser avec ses seins, c'est apprendre à reconnaître ce qui est normal pour soi — et donc à détecter ce qui ne l'est plus.</p>

<h2>Le dépistage du cancer du sein au Maroc : quelles options ?</h2>
<p>Le dépistage repose sur plusieurs examens complémentaires, accessibles dans les grandes villes comme dans les centres régionaux.</p>

<h3>La mammographie, examen de référence</h3>
<p>La mammographie est l'examen radiologique des seins recommandé à toutes les femmes à partir de 40 ans, même en l'absence de symptômes. Elle permet de détecter des anomalies invisibles à la palpation, parfois plusieurs années avant qu'elles ne deviennent palpables.</p>
<p>Les recommandations marocaines et internationales préconisent :</p>
<ul>
<li>Une mammographie tous les <strong>deux ans à partir de 40 ans</strong></li>
<li>Un suivi annuel pour les femmes à risque élevé (antécédents familiaux, mutation génétique BRCA)</li>
<li>Une consultation médicale immédiate en cas de symptôme, quel que soit l'âge</li>
</ul>

<h3>L'échographie mammaire</h3>
<p>Souvent complémentaire à la mammographie, l'échographie est particulièrement utile chez les femmes jeunes dont les seins sont denses. Elle est sans rayonnement et indolore. Votre médecin vous indiquera si elle est nécessaire dans votre cas.</p>

<h3>Où se faire dépister au Maroc ?</h3>
<ul>
<li>Les <strong>centres hospitaliers universitaires (CHU)</strong> des grandes villes</li>
<li>Les cliniques privées disposant d'un service de radiologie</li>
<li>Les centres de la <strong>Ligue Nationale de Lutte contre les Cancers (LNLCC)</strong></li>
<li>Les campagnes de dépistage gratuit organisées chaque octobre (Octobre Rose)</li>
</ul>
<p>Pour les femmes couvertes par la CNOPS ou la CNSS, la mammographie est remboursée sous conditions. Renseignez-vous auprès de votre organisme d'assurance ou de votre médecin traitant.</p>

<h2>Prévention du cancer du sein : ce que vous pouvez faire dès aujourd'hui</h2>
<p>Si certains facteurs de risque comme l'âge ou la génétique ne sont pas modifiables, la prévention passe aussi par des choix de vie qui réduisent significativement les risques.</p>

<h3>Les habitudes protectrices</h3>
<ul>
<li><strong>Maintenir un poids santé</strong> : le surpoids après la ménopause augmente le risque</li>
<li><strong>Pratiquer une activité physique régulière</strong> : 30 minutes de marche rapide par jour ont un effet protecteur démontré</li>
<li><strong>Limiter la consommation d'alcool</strong>, même modérée</li>
<li><strong>Allaiter</strong>, si possible : l'allaitement prolongé réduit le risque</li>
<li><strong>Éviter le tabac</strong> et limiter l'exposition aux perturbateurs endocriniens</li>
<li>Suivre les recommandations médicales concernant les <strong>traitements hormonaux</strong> de la ménopause</li>
</ul>

<h3>L'importance du suivi gynécologique régulier</h3>
<p>Un suivi annuel chez un médecin gynécologue ou un médecin généraliste formé permet d'évaluer votre situation personnelle, d'adapter le rythme de dépistage à vos antécédents et de répondre à vos questions. Ce suivi est un droit, pas un luxe.</p>

<hr>

<h2>Agir tôt, c'est un acte de courage</h2>
<p>Se faire dépister demande parfois de surmonter la peur du résultat. Mais attendre n'a jamais protégé personne. Au contraire, c'est en faisant face, en se faisant examiner, que l'on se donne les meilleures chances. Des milliers de femmes au Maroc vivent aujourd'hui pleinement après un diagnostic de cancer du sein pris en charge à temps.</p>
<p>Vous n'avez pas à traverser cela seule. Parlez-en à votre médecin, à votre gynécologue, à votre entourage. Le premier pas est souvent le plus difficile — mais il est aussi le plus important.</p>
<p><strong>Prenez rendez-vous dès aujourd'hui avec un gynécologue ou votre médecin traitant pour faire le point sur votre dépistage.</strong> Trouvez un praticien près de chez vous sur <em>santeaumaroc.com</em> et faites de votre santé une priorité.</p>`;

// ─── Article 3 : Stress chronique & burn-out ─────────────────────────────────
const content3 = `<p>Au Maroc, parler de santé mentale reste difficile. Dans une société où la résilience est valorisée et où « tenir bon » est souvent perçu comme une vertu, admettre que l'on souffre psychologiquement peut sembler une faiblesse. Pourtant, le <strong>stress chronique</strong> et le <strong>burn-out</strong> touchent chaque année des milliers de Marocains — cadres, enseignants, soignants, parents, jeunes diplômés — souvent sans qu'ils le sachent vraiment. Cet article n'est pas là pour juger, mais pour informer, rassurer et ouvrir la porte à une aide concrète.</p>

<h2>Stress chronique au Maroc : une réalité silencieuse</h2>
<p>Le stress est une réponse normale de l'organisme face à une situation difficile. Il devient <strong>chronique</strong> lorsqu'il s'installe dans la durée, sans répit ni récupération. Contrairement au stress aigu — utile et passager — le stress chronique épuise progressivement le corps et l'esprit.</p>
<p>Au Maroc, plusieurs facteurs alimentent cette réalité :</p>
<ul>
<li>La pression économique et l'insécurité de l'emploi</li>
<li>Les longues heures de travail et les trajets urbains épuisants (Casablanca, Rabat, Marrakech)</li>
<li>Les responsabilités familiales cumulées, souvent portées seul</li>
<li>Le manque de frontière entre vie professionnelle et vie personnelle</li>
<li>La stigmatisation de la souffrance psychologique dans l'entourage</li>
</ul>
<blockquote>Selon l'Organisation Mondiale de la Santé, <strong>1 personne sur 8 dans le monde</strong> souffre d'un trouble mental. Dans la région MENA, les troubles anxieux et dépressifs figurent parmi les causes les plus fréquentes d'invalidité. Le Maroc n'est pas épargné.</blockquote>

<h2>Burn-out : les symptômes à ne pas ignorer</h2>
<p>Le burn-out, ou épuisement professionnel, est l'aboutissement d'un stress chronique non traité. Il ne s'agit pas d'une simple fatigue passagère : c'est un état d'épuisement profond, physique, émotionnel et mental, reconnu par l'OMS comme un phénomène lié au travail.</p>

<h3>Les signes physiques</h3>
<ul>
<li>Fatigue persistante malgré le repos</li>
<li>Troubles du sommeil (insomnie, réveils nocturnes fréquents)</li>
<li>Maux de tête, douleurs musculaires sans cause organique claire</li>
<li>Infections à répétition (le système immunitaire est affaibli)</li>
<li>Troubles digestifs chroniques</li>
</ul>

<h3>Les signes émotionnels et comportementaux</h3>
<ul>
<li>Irritabilité, sautes d'humeur, larmes inexpliquées</li>
<li>Sentiment de vide, de détachement ou d'indifférence</li>
<li>Perte de motivation et de plaisir, même pour des activités aimées</li>
<li>Difficulté à se concentrer, oublis fréquents</li>
<li>Isolement social, retrait de la famille et des amis</li>
<li>Cynisme ou amertume croissante envers le travail</li>
</ul>
<p>Si vous vous reconnaissez dans plusieurs de ces symptômes depuis plusieurs semaines, il est important de ne pas minimiser ce que vous ressentez.</p>

<h2>Anxiété chronique : quand l'inquiétude prend le contrôle</h2>
<p>Le stress chronique s'accompagne souvent d'<strong>anxiété chronique</strong> : une inquiétude permanente, difficile à contrôler, qui envahit les pensées même dans les moments de calme. Elle peut se manifester par :</p>
<ul>
<li>Des ruminations constantes (rejouer les situations, anticiper le pire)</li>
<li>Des palpitations ou sensation d'oppression dans la poitrine</li>
<li>Une hypervigilance — être toujours « sur le qui-vive »</li>
<li>Des crises d'angoisse (montée brutale de peur intense)</li>
</ul>
<p>L'anxiété chronique n'est pas un défaut de caractère. C'est un trouble qui répond très bien à une prise en charge adaptée.</p>

<h2>Gérer le stress : des stratégies concrètes au quotidien</h2>
<p>En attendant ou en complément d'un suivi professionnel, certaines habitudes peuvent réduire significativement l'impact du stress chronique.</p>

<h3>Agir sur le corps</h3>
<ol>
<li><strong>Bougez chaque jour</strong> : 30 minutes de marche réduisent le cortisol (hormone du stress) de façon mesurable.</li>
<li><strong>Soignez votre sommeil</strong> : couchez-vous à heure fixe, limitez les écrans avant de dormir.</li>
<li><strong>Respirez consciemment</strong> : la cohérence cardiaque (5 inspirations/expirations par minute, 3 fois par jour) régule le système nerveux.</li>
</ol>

<h3>Agir sur le mental</h3>
<ol>
<li><strong>Posez des limites</strong> : apprenez à dire non sans culpabilité. Vos ressources sont précieuses.</li>
<li><strong>Identifiez vos sources de stress</strong> : tenir un journal pendant une semaine aide à repérer les déclencheurs.</li>
<li><strong>Reconnectez-vous à ce qui vous ressource</strong> : un hobby, une prière, un moment en famille, une sortie en nature.</li>
</ol>
<p>Ces stratégies sont utiles, mais elles ne remplacent pas une aide professionnelle lorsque le stress ou le burn-out s'est installé profondément.</p>

<h2>Santé mentale au Maroc : briser le tabou pour se soigner</h2>
<p>Dans beaucoup de familles marocaines, consulter un <strong>médecin psychiatre</strong> ou un psychologue est encore vécu comme une honte ou réservé aux cas « graves ». Cette perception éloigne des personnes qui souffrent réellement de l'aide dont elles ont besoin.</p>
<p>Pourtant, consulter pour un burn-out ou un stress chronique n'est pas différent de consulter pour une hypertension ou un diabète. Ce sont des pathologies qui méritent un diagnostic et un traitement.</p>
<p>La <strong>santé mentale au Maroc</strong> évolue : des psychiatres, des psychologues cliniciens et des médecins généralistes formés à ces troubles exercent dans les grandes villes comme Casablanca, Rabat, Fès, Marrakech et Agadir. Les consultations restent confidentielles, et un professionnel de santé ne portera jamais de jugement sur votre situation.</p>

<hr>

<h2>Qui consulter et comment trouver de l'aide ?</h2>
<p>Face au stress chronique ou au burn-out, plusieurs professionnels peuvent vous accompagner :</p>
<ul>
<li><strong>Le médecin généraliste</strong> : premier recours, il peut évaluer votre état, écarter des causes organiques et vous orienter.</li>
<li><strong>Le médecin psychiatre</strong> : spécialiste des troubles mentaux, il peut poser un diagnostic précis et proposer un traitement médicamenteux si nécessaire.</li>
<li><strong>Le psychologue clinicien</strong> : propose un accompagnement par la parole (thérapie cognitive et comportementale, thérapie brève, etc.).</li>
<li><strong>Le médecin du travail</strong> : dans le cadre d'un burn-out professionnel, il joue un rôle clé dans la reconnaissance et l'aménagement de poste.</li>
</ul>
<p>Vous n'avez pas besoin d'attendre d'être « au bout du rouleau » pour consulter. Plus tôt vous agissez, plus la récupération est rapide et complète.</p>

<h2>Conclusion : votre santé mentale mérite la même attention que votre santé physique</h2>
<p>Le stress chronique et le burn-out ne sont pas des fatalités. Reconnaître les signes, en parler et consulter un professionnel sont des actes de courage, pas de faiblesse. Au Maroc comme ailleurs, prendre soin de sa santé mentale est un droit et une nécessité.</p>
<p>Si vous vous reconnaissez dans les symptômes décrits dans cet article, ne restez pas seul. <strong>Consultez un médecin généraliste, un psychiatre ou un psychologue</strong> près de chez vous. Sur santeaumaroc.com, vous pouvez rechercher et contacter des praticiens qualifiés partout au Maroc, en toute confidentialité.</p>`;

// ─── Insertion ────────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    title:       "Alimentation méditerranéenne au Maroc : votre cuisine traditionnelle est un trésor pour la santé",
    slug:        "alimentation-mediterraneenne-maroc",
    excerpt:     "Le régime méditerranéen et la cuisine marocaine traditionnelle partagent les mêmes fondements nutritionnels. Un bouclier naturel contre le diabète, les maladies cardiovasculaires et l'obésité.",
    content:     content1,
    categorySlug:"nutrition-bien-etre",
    metaTitle:   "Alimentation méditerranéenne au Maroc : bienfaits santé",
    metaDesc:    "Découvrez comment l'alimentation méditerranéenne, proche de la cuisine marocaine traditionnelle, protège contre les maladies chroniques. Conseils pratiques.",
    readingTime: 5,
    featured:    false,
  },
  {
    title:       "Cancer du sein au Maroc : comprendre, dépister et prévenir",
    slug:        "cancer-sein-maroc-depistage-prevention",
    excerpt:     "Le cancer du sein est le premier cancer féminin au Maroc. Connaître les signes et se faire dépister tôt peut sauver des vies.",
    content:     content2,
    categorySlug:"sante-femme",
    metaTitle:   "Cancer du sein au Maroc : dépistage et prévention",
    metaDesc:    "Cancer du sein au Maroc : symptômes, dépistage par mammographie et prévention. Tout savoir pour agir tôt et protéger votre santé.",
    readingTime: 6,
    featured:    false,
  },
  {
    title:       "Stress chronique et burn-out au Maroc : reconnaître, prévenir et se faire aider",
    slug:        "stress-chronique-burn-out-maroc",
    excerpt:     "Le stress chronique touche de plus en plus de Marocains, souvent en silence. Apprenez à reconnaître les signes du burn-out et à consulter sans honte.",
    content:     content3,
    categorySlug:"prevention-sante",
    metaTitle:   "Stress chronique & burn-out au Maroc : agir",
    metaDesc:    "Stress chronique, burn-out, anxiété : symptômes, causes et solutions au Maroc. Briser le tabou de la santé mentale et trouver une aide professionnelle.",
    readingTime: 5,
    featured:    false,
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true, email: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  for (const art of ARTICLES) {
    const cat = await prisma.postCategory.findFirst({
      where: { slug: art.categorySlug },
      select: { id: true, name: true },
    });
    if (!cat) { console.error(`Catégorie introuvable: ${art.categorySlug}`); continue; }

    const post = await prisma.post.upsert({
      where: { slug: art.slug },
      update: {},
      create: {
        title:       art.title,
        slug:        art.slug,
        excerpt:     art.excerpt,
        content:     art.content,
        coverImage:  null,
        categoryId:  cat.id,
        authorId:    admin.id,
        status:      "PUBLISHED",
        publishedAt: new Date(),
        readingTime: art.readingTime,
        featured:    art.featured,
        metaTitle:   art.metaTitle,
        metaDesc:    art.metaDesc,
      },
    });

    console.log(`✓ ${cat.name.padEnd(28)} /blog/${post.slug}`);
  }
  console.log("\n3 articles publiés !");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
