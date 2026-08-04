require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// VERTICAL DENTAIRE — LOT 2 : trois satellites du pilier « mal de dents »
// (scripts/seed-blog-dentaire.cjs), rattachés par `pillarId` → le pilier affiche
// « Dans ce dossier » et chaque satellite affiche sa bannière de rattachement.
//
//   · Abcès dentaire        → urgence + drainage
//   · Dent de sagesse       → indication d'extraction + suites
//   · Parodontite           → déchaussement + assainissement
//
// MÊMES GARDE-FOUS QUE LE PILIER :
//  · aucun montant en dirhams (lib/prix-reference.ts = source unique) ;
//  · aucune posologie ni protocole de prescription ;
//  · urgences : « le 141 (SAMU) ou le 15 » (convention lib/i18n.ts) ;
//  · maillage silo complet (blog ↔ maladies/symptômes ↔ Q/R ↔ annuaire).
//
//   node scripts/seed-blog-dentaire-lot2.cjs
// ════════════════════════════════════════════════════════════════════════════

const PILLAR_SLUG = "mal-de-dents-rage-de-dents-maroc";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ABCÈS DENTAIRE
// ─────────────────────────────────────────────────────────────────────────────
const cAbces = `<p>Un abcès dentaire n'est pas une grosse carie : c'est une <strong>infection installée</strong>, avec du pus, dans un espace fermé. C'est ce qui explique à la fois la violence de la douleur et le fait qu'un abcès ne se règle jamais tout seul. C'est aussi la situation dentaire qui envoie le plus de patients aux urgences hospitalières, souvent après plusieurs jours d'attente et un antibiotique pris au hasard.</p>

<p>Cet article explique comment reconnaître un abcès, à quel moment il devient une urgence vitale, ce qu'il faut faire en attendant, et pourquoi le geste du dentiste — et non le comprimé — est le vrai traitement. Pour la douleur dentaire en général, voir notre guide <a href="/blog/mal-de-dents-rage-de-dents-maroc">mal de dents : soulager une rage de dents</a>.</p>

<h2>Qu'est-ce qu'un abcès dentaire ?</h2>

<p>Des bactéries franchissent une barrière — une <a href="/maladies/carie-dentaire">carie</a> profonde, une fêlure, une dent dévitalisée qui a repris l'infection, ou un sillon gingival malade — et se multiplient dans un tissu qui ne peut pas se drainer. Le pus s'accumule sous pression. Le corps réagit : inflammation, gonflement, fièvre parfois.</p>

<h3>Deux abcès qui ne se soignent pas de la même façon</h3>

<ul>
<li><strong>L'abcès d'origine dentaire</strong> (périapical) part de la pulpe morte et se développe à la pointe de la racine, dans l'os. La dent est généralement <em>très</em> sensible à la percussion et donne l'impression d'être « plus haute » que les autres.</li>
<li><strong>L'abcès de la gencive</strong> (parodontal) part d'une poche gingivale infectée. La dent est souvent mobile, la gencive gonflée et rouge à un endroit précis, avec parfois un écoulement de pus au collet. Il s'inscrit dans une <a href="/blog/parodontite-dechaussement-dents-maroc">parodontite</a>.</li>
</ul>

<p>Un troisième cas fréquent est l'infection de la gencive qui recouvre une <a href="/blog/dent-de-sagesse-extraction-maroc">dent de sagesse</a> mal sortie (péricoronarite), avec douleur au fond de la mâchoire et difficulté à ouvrir la bouche.</p>

<h2>Les signes qui doivent faire penser à un abcès</h2>

<ul>
<li>Douleur <strong>pulsatile</strong>, continue, qui bat au rythme du cœur et s'aggrave en position allongée.</li>
<li>Dent qui ne supporte plus le contact : mastiquer, ou même fermer la bouche, devient douloureux.</li>
<li><strong>Gonflement</strong> de la gencive, de la joue ou de la lèvre, parfois de tout un côté du visage.</li>
<li>Mauvais goût persistant, mauvaise haleine soudaine, écoulement de pus — le goût désagréable qui apparaît brutalement avec un soulagement de la douleur signe souvent une fistule, c'est-à-dire un abcès qui s'est vidé partiellement. <strong>Ce n'est pas une guérison.</strong></li>
<li>Ganglion douloureux sous la mâchoire ou dans le cou.</li>
<li>Fièvre, frissons, fatigue inhabituelle.</li>
</ul>

<blockquote>Un point est contre-intuitif et coûte cher : la douleur d'un abcès peut disparaître d'un coup. Cela signifie que le nerf est mort ou que le pus s'est frayé un chemin, pas que l'infection est éteinte. Elle continue à travailler dans l'os.</blockquote>

<h2>Quand est-ce une urgence ?</h2>

<p>Un abcès dentaire peut diffuser dans les espaces du visage et du cou, jusqu'à comprimer les voies aériennes. Ces signes imposent les urgences immédiatement — appelez le <strong>141 (SAMU) ou le 15</strong> :</p>

<ul>
<li>gonflement qui atteint l'œil, le plancher de la bouche, la gorge ou le cou ;</li>
<li>difficulté à respirer, à avaler sa salive ou à parler ;</li>
<li>impossibilité d'ouvrir la bouche (trismus) ;</li>
<li>fièvre élevée avec frissons, confusion, malaise ;</li>
<li>douleur incontrôlable malgré les antalgiques.</li>
</ul>

<p>Sans ces signes, il ne s'agit pas d'une urgence vitale, mais d'une <strong>urgence de soins</strong> : le rendez-vous doit être pris le jour même ou le lendemain, pas « la semaine prochaine ».</p>

<h2>En attendant le rendez-vous</h2>

<p>Ces mesures visent à limiter la douleur sans aggraver l'infection. Aucune ne remplace le soin.</p>

<ul>
<li><strong>Un antalgique simple</strong> aux doses de la notice — le <a href="/blog/paracetamol-maroc">paracétamol</a> en premier choix ; un <a href="/blog/anti-inflammatoires-ains-maroc">anti-inflammatoire</a> peut mieux agir mais n'est pas anodin : avis du pharmacien ou du médecin. La fiche des spécialités vendues au Maroc est dans notre <a href="/medicaments">base des médicaments</a>.</li>
<li><strong>Du froid sur la joue</strong>, à travers un linge, quinze minutes maximum. <strong>Jamais de chaleur</strong> : elle accélère la diffusion de l'infection.</li>
<li><strong>Dormir la tête surélevée</strong>, alimentation molle et tiède, mastication de l'autre côté.</li>
<li><strong>Bain de bouche à l'eau salée tiède</strong>, à recracher (adultes et grands enfants).</li>
</ul>

<p>À l'inverse, quatre gestes aggravent régulièrement la situation : <strong>percer ou presser l'abcès</strong>, <strong>appliquer de la chaleur</strong>, <strong>poser de l'aspirine ou du clou de girofle sur la gencive</strong> (brûlure chimique), et <strong>reprendre un antibiotique d'une ancienne ordonnance</strong>. Ce dernier point est le plus fréquent : il atténue les signes, retarde le drainage, et favorise la résistance bactérienne. Voir notre article sur le <a href="/blog/antibiotiques-maroc">bon usage des antibiotiques</a>.</p>

<h2>Le traitement chez le dentiste</h2>

<h3>Le drainage, geste central</h3>

<p>Le principe est mécanique avant d'être médicamenteux : il faut <strong>évacuer le pus et supprimer la source</strong>. Selon l'origine, le praticien ouvre la dent pour nettoyer et désinfecter les canaux, incise la gencive pour drainer une collection, assainit une poche parodontale, ou extrait la dent si elle n'est pas conservable. Le soulagement est le plus souvent net dans les heures qui suivent.</p>

<h3>La place réelle des antibiotiques</h3>

<p>Les antibiotiques ne sont pas systématiques. Ils viennent en <strong>complément</strong> du geste local dans certaines situations — infection diffusée, fièvre, terrain fragilisé — et l'<a href="/glossaire/antibiotique">antibiotique</a> seul, sans soin de la dent, expose à la récidive et aux complications. La molécule, la durée et les alternatives en cas d'allergie relèvent de la prescription : c'est le praticien qui décide, jamais l'armoire à pharmacie.</p>

<h3>Garder ou extraire la dent ?</h3>

<p>La décision dépend de ce qu'il reste de dent utilisable, de l'état de l'os autour de la racine et de la faisabilité du traitement canalaire. Une dent dévitalisée puis reconstituée peut durer des années ; à l'inverse, s'acharner sur une dent condamnée fait perdre de l'os et compromet le remplacement futur, qu'il s'agisse d'un bridge ou d'un <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant</a>. Demandez un <strong>devis écrit</strong> avant tout acte prothétique ; nos pages <a href="/prix">tarifs des actes</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> expliquent la mécanique du reste à charge.</p>

<h2>Après le soin : ce qui est normal, ce qui ne l'est pas</h2>

<p>Le soulagement est en général rapide, mais il n'est pas toujours immédiat : une gêne, une sensibilité à la pression et un gonflement résiduel peuvent persister deux à trois jours, le temps que l'inflammation reflue. Un traitement de canal se déroule souvent en plusieurs séances, et il est important de <strong>les honorer toutes</strong> : une dent laissée ouverte ou une désinfection interrompue se réinfecte presque systématiquement.</p>

<p>En revanche, doivent faire rappeler le praticien : une douleur qui <strong>augmente</strong> après le deuxième jour, un gonflement qui progresse, une fièvre qui apparaît ou revient, un écoulement de pus qui persiste, ou un saignement qui ne se tarit pas. Ce sont les mêmes signes d'alerte que ceux listés plus haut qui commandent, à leur stade extrême, un passage aux urgences.</p>

<h2>Ce qui arrive quand on laisse traîner</h2>

<p>L'infection ne reste pas au même endroit. Elle suit les chemins de moindre résistance, et l'évolution typique se compte en jours, pas en mois :</p>

<ul>
<li><strong>Destruction de l'os</strong> autour de la racine : la lésion s'élargit et compromet la conservation de la dent, puis la pose ultérieure d'un implant faute de volume osseux.</li>
<li><strong>Diffusion dans les tissus du visage et du cou</strong> (cellulite cervico-faciale) : le gonflement dépasse la zone de la dent, l'ouverture de la bouche se limite, la déglutition devient difficile. C'est une urgence chirurgicale.</li>
<li><strong>Atteinte du sinus maxillaire</strong> pour les dents du haut, avec un tableau qui ressemble à une <a href="/maladies/sinusite">sinusite</a> qui résiste aux traitements habituels.</li>
<li><strong>Passage dans le sang</strong>, avec risque de localisation à distance, en particulier chez les personnes à risque cardiaque ou immunodéprimées.</li>
</ul>

<p>Ces complications sont rares au regard du nombre d'abcès traités, mais elles ne sont pas exceptionnelles — et elles surviennent presque toujours après plusieurs jours d'automédication, chez quelqu'un qui espérait passer le week-end.</p>

<h2>Terrains qui demandent plus de vigilance</h2>

<ul>
<li><strong><a href="/blog/diabete-type-2-maroc">Diabète</a></strong> : l'infection se contrôle moins bien et la cicatrisation est plus lente ; à l'inverse, une infection dentaire déséquilibre la glycémie. Le lien fonctionne dans les deux sens.</li>
<li><strong>Immunodépression</strong> (traitement immunosuppresseur, chimiothérapie, corticothérapie au long cours) : consultation sans délai.</li>
<li><strong>Cardiopathie à risque, prothèse valvulaire</strong> : signalez-le, une prévention spécifique peut s'appliquer avant certains gestes.</li>
<li><strong>Grossesse</strong> : les soins sont possibles et nécessaires — une infection non traitée est plus risquée que le soin. Signalez la grossesse ; voir notre article sur le <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>.</li>
<li><strong>Traitement anticoagulant ou antiagrégant</strong> : ne l'arrêtez jamais de vous-même, signalez-le. Voir <a href="/blog/anticoagulants-maroc">anticoagulants</a>.</li>
</ul>

<h3>Et chez l'enfant ?</h3>

<p>Une dent de lait peut parfaitement faire un abcès, et l'idée qu'« elle va tomber de toute façon » est trompeuse : l'infection siège au contact du germe de la dent définitive, qu'elle peut abîmer, et elle est douloureuse. Un gonflement de la joue chez un enfant, surtout avec de la fièvre ou un abattement, impose une consultation rapide — voir notre article <a href="/blog/fievre-enfant-que-faire-maroc">fièvre de l'enfant</a>. Deux règles s'ajoutent à celles de l'adulte : <strong>jamais d'aspirine</strong> et pas de bain de bouche chez le petit qui risque de l'avaler. Le paracétamol se dose au poids, non à l'âge : voir notre article sur le <a href="/blog/paracetamol-maroc">paracétamol</a> et notre <a href="/blog/sante-enfant-guide-maroc">guide de la santé de l'enfant</a>.</p>

<h2>Éviter la récidive</h2>

<p>Un abcès est presque toujours l'aboutissement de quelque chose qu'on a laissé courir. Trois leviers réduisent nettement le risque : terminer les traitements commencés (une dent ouverte ou une dévitalisation non finie se réinfecte), traiter les caries et les gencives avant qu'elles ne fassent mal — voir <a href="/prevenir/carie-dentaire">prévenir la carie</a> et <a href="/prevenir/gingivite">prévenir la maladie des gencives</a> — et maintenir un contrôle une à deux fois par an avec <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">détartrage</a>. Le <a href="/blog/arret-tabac-sevrage-maroc">tabac</a>, cigarette comme chicha, augmente le risque infectieux et ralentit la cicatrisation.</p>

<p>Deux réflexes complètent utilement ce socle. D'abord, ne pas ignorer les signaux faibles : une <a href="/questions/dent-sensible-au-froid-et-au-chaud-pourquoi-et-comment-la-soulager">dent devenue sensible</a>, une gencive qui saigne, une dent qui a changé de teinte après un choc ancien. Ensuite, faire vérifier les dents dévitalisées de longue date, qui peuvent se réinfecter en silence des années plus tard et ne se manifester qu'à l'occasion d'une radio de contrôle.</p>

<h2>En résumé</h2>

<p>Un abcès dentaire est une infection sous pression, pas une douleur passagère. Le geste du dentiste — ouvrir, drainer, traiter la cause — est le seul traitement ; l'antalgique fait patienter et l'antibiotique, quand il est indiqué, accompagne sans remplacer. Le mauvais scénario est toujours le même : trois jours d'automédication, une douleur qui s'efface, puis un gonflement qui envoie aux urgences. Pour savoir vers qui vous tourner selon la situation, voir <a href="/quel-medecin-pour/mal-de-dents">quel médecin consulter pour un mal de dents</a>.</p>

<hr>

<p>Un gonflement ou une douleur pulsatile ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a> et prenez rendez-vous en ligne. En présence de fièvre, d'un gonflement du visage ou du cou, ou d'une difficulté à respirer ou à avaler, appelez immédiatement le 141 (SAMU) ou le 15.</p>`;

const abcesTk = [
  "Un abcès dentaire est une infection avec du pus : il ne guérit jamais seul.",
  "Le traitement, c'est le drainage par le dentiste ; l'antibiotique n'est qu'un complément, parfois inutile.",
  "Douleur qui disparaît + mauvais goût = abcès qui s'est vidé en partie, pas guérison.",
  "Urgence (141 SAMU ou 15) si gonflement de l'œil, du cou ou du plancher de la bouche, fièvre, difficulté à respirer, avaler ou ouvrir la bouche.",
  "Jamais de chaleur sur la joue, jamais d'antibiotique repris d'une ancienne ordonnance.",
];

const abcesFaq = [
  { q: "Un abcès dentaire peut-il guérir tout seul ?", a: "Non. Le pus est enfermé dans un espace qui ne se draine pas spontanément. La douleur peut cesser, notamment si l'abcès se vide partiellement par une fistule ou si le nerf meurt, mais l'infection continue d'évoluer dans l'os. Seul un geste dentaire — drainage, traitement du canal ou extraction — met fin au processus." },
  { q: "Combien de temps peut-on attendre avec un abcès dentaire ?", a: "En l'absence de signe d'alerte, l'objectif est une consultation le jour même ou le lendemain. En présence d'un gonflement du visage ou du cou, d'une fièvre, d'une difficulté à respirer, à avaler ou à ouvrir la bouche, il ne faut pas attendre du tout : ce sont les urgences, en appelant le 141 (SAMU) ou le 15." },
  { q: "Faut-il des antibiotiques pour un abcès dentaire ?", a: "Pas systématiquement. Le traitement efficace est le geste local réalisé par le dentiste. Les antibiotiques sont prescrits en complément dans certaines situations — infection diffusée, fièvre, terrain fragilisé — et jamais à la place du soin. Un antibiotique pris seul soulage temporairement puis laisse revenir l'infection." },
  { q: "Peut-on percer un abcès dentaire soi-même ?", a: "Non. Percer ou presser expose à une diffusion de l'infection dans les tissus profonds du visage et du cou, et à une surinfection. Le drainage est un acte réalisé sous anesthésie, avec un matériel stérile, suivi du traitement de la cause." },
  { q: "Chaud ou froid sur la joue en cas d'abcès ?", a: "Du froid, à travers un linge, quinze minutes maximum. La chaleur favorise la diffusion de l'infection dans les tissus : ni compresse chaude, ni bouillotte, ni bain de bouche brûlant." },
  { q: "L'abcès dentaire est-il contagieux ?", a: "L'abcès en lui-même ne se transmet pas. Les bactéries buccales, elles, s'échangent par la salive, mais c'est l'état de la dent et des gencives de chacun qui détermine le risque d'infection. Il n'y a pas lieu d'isoler la personne concernée." },
  { q: "Une dent dévitalisée peut-elle refaire un abcès ?", a: "Oui. Si des bactéries subsistent ou reviennent dans les canaux, ou si l'étanchéité de l'obturation se dégrade, une infection peut réapparaître à la pointe de la racine, parfois des années plus tard. Le traitement consiste alors à reprendre le traitement canalaire, ou à recourir à un geste chirurgical." },
];

const abcesSources = [
  { label: "Le traitement et l'évolution d'un abcès dentaire", url: "https://www.ameli.fr/assure/sante/themes/abces-dentaire/traitement-abces-dentaire", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Douleurs au niveau des dents et de la bouche : quelles causes ?", url: "https://www.ameli.fr/assure/sante/themes/douleurs-dentaires-bouche/causes-douleurs", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Prescription des antibiotiques en pratique bucco-dentaire — recommandations", url: "https://ansm.sante.fr/uploads/2021/02/04/reco-prescription-des-antibiotiques-en-pratique-buccodentaire-septembre2011.pdf", publisher: "ANSM", year: "2011" },
  { label: "Toothache — soulagement et signes d'urgence", url: "https://www.nhs.uk/conditions/toothache/", publisher: "National Health Service (NHS)" },
  { label: "Santé bucco-dentaire — principaux repères", url: "https://www.who.int/fr/news-room/fact-sheets/detail/oral-health", publisher: "Organisation mondiale de la Santé (OMS)", year: "2025" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. DENT DE SAGESSE
// ─────────────────────────────────────────────────────────────────────────────
const cSagesse = `<p>« Il faut les enlever toutes les quatre. » Beaucoup de jeunes adultes entendent cette phrase sans savoir sur quoi elle repose. La réponse honnête est plus nuancée : une dent de sagesse qui a fait sa place et ne gêne personne peut rester en bouche sous surveillance. Une dent incluse qui s'infecte, abîme la dent voisine ou empêche un traitement, elle, doit partir.</p>

<p>Cet article explique ce qui distingue les deux situations, comment se déroule réellement l'extraction, à quoi ressemblent les jours qui suivent, et quand il faut rappeler le praticien. Il complète notre guide <a href="/blog/mal-de-dents-rage-de-dents-maroc">mal de dents</a> et notre fiche <a href="/symptomes/dent-de-sagesse">dent de sagesse</a>.</p>

<h2>Ce que sont les dents de sagesse</h2>

<p>Ce sont les troisièmes molaires, les dernières à apparaître — le plus souvent entre 17 et 25 ans, parfois jamais. Elles sont au nombre de quatre, mais il n'est ni rare d'en avoir moins, ni anormal de n'en avoir aucune. Leur problème est mécanique : elles arrivent en dernier, dans une mâchoire dont la place est déjà prise. Quand l'espace manque, la dent reste bloquée dans l'os (dent incluse), sort de travers, ou n'émerge que partiellement.</p>

<h2>Quand faut-il l'enlever ?</h2>

<h3>Les situations qui justifient l'extraction</h3>

<ul>
<li><strong>Infections répétées de la gencive</strong> qui recouvre la dent (péricoronarite) : douleur au fond de la mâchoire, gencive gonflée, mauvais goût, parfois difficulté à ouvrir la bouche.</li>
<li><strong>Carie de la dent de sagesse ou de la dent voisine</strong> : la zone est presque impossible à brosser, et la deuxième molaire — une dent utile, elle — se carie au contact.</li>
<li><strong>Poussée qui abîme le voisinage</strong> : résorption de la racine d'à côté, perte d'os entre les deux dents.</li>
<li><strong>Kyste ou lésion</strong> autour de la dent incluse, visible sur la radio.</li>
<li><strong>Traitement d'orthodontie</strong> ou chirurgie des mâchoires quand la dent gêne le plan de traitement.</li>
<li><strong>Dent qui blesse la joue ou la langue</strong> de façon répétée.</li>
</ul>

<h3>Les situations de simple surveillance</h3>

<p>Une dent de sagesse complètement sortie, bien positionnée, brossable, sans carie et sans épisode infectieux n'a pas de raison d'être extraite « au cas où ». Une dent incluse profondément, silencieuse et sans lésion visible peut également être surveillée. La règle est celle du bénéfice : on n'opère pas une dent qui ne pose pas de problème et n'en annonce pas.</p>

<blockquote>À retenir sur le calendrier : quand l'extraction est indiquée, il est généralement plus confortable de l'envisager jeune. Les racines sont moins formées, l'os plus souple, la cicatrisation plus rapide. Ce n'est pas un argument pour extraire sans indication, mais pour ne pas repousser indéfiniment une extraction déjà justifiée.</blockquote>

<h2>Le bilan avant l'extraction</h2>

<p>L'examen clinique ne suffit pas pour une dent qu'on ne voit pas. Une <strong>radiographie panoramique</strong> montre la position de la dent, la forme de ses racines et leur rapport avec les structures voisines : le nerf du menton en bas, le sinus en haut. Quand ce rapport est étroit, un examen tridimensionnel (cone beam) peut être demandé. C'est ce bilan qui détermine si le geste relève du cabinet dentaire ou d'un chirurgien maxillo-facial, et sous quelle anesthésie.</p>

<p>Signalez systématiquement : vos traitements en cours — en particulier <a href="/blog/anticoagulants-maroc">anticoagulants</a> et antiagrégants, qu'il ne faut jamais arrêter de sa propre initiative —, un <a href="/blog/diabete-type-2-maroc">diabète</a>, une grossesse, une cardiopathie, une immunodépression, une allergie médicamenteuse.</p>

<h3>Si on ne l'enlève pas : ce qu'il faut surveiller</h3>

<p>Conserver une dent de sagesse n'est pas une décision qu'on prend une fois pour toutes. Une dent gardée sous surveillance se contrôle : radio de référence, puis vérification à chaque visite annuelle. Trois évolutions font rediscuter l'indication — l'apparition d'une <a href="/maladies/carie-dentaire">carie</a> sur la dent ou sur la deuxième molaire voisine, des épisodes infectieux qui se répètent, et une perte d'os entre les deux dents, qui relève de la <a href="/blog/parodontite-dechaussement-dents-maroc">maladie parodontale</a>. Un <a href="/blog/abces-dentaire-maroc">abcès</a> qui part d'une dent de sagesse tranche généralement la question.</p>

<h2>Arrêt de travail, coût et prise en charge</h2>

<p>Sur le plan pratique, deux points reviennent systématiquement en consultation. Le premier est l'organisation : prévoyez la fin de semaine plutôt que la veille d'un examen ou d'un déplacement, un accompagnant si une sédation est prévue, et de quoi vous alimenter facilement à la maison. Le second est le coût : il dépend du nombre de dents, de la difficulté du geste (dent sortie ou incluse dans l'os), du type d'anesthésie et du cadre — cabinet ou bloc opératoire. Demandez un <strong>devis écrit</strong> avant l'intervention, et une prise en charge préalable si elle est exigée. Nos pages <a href="/prix">tarifs des actes médicaux</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> détaillent la mécanique du reste à charge, calculé sur la tarification nationale de référence et non sur le montant facturé.</p>

<h2>Comment se passe l'extraction</h2>

<p>Le plus souvent, tout se fait au cabinet sous <strong>anesthésie locale</strong> : la zone est insensibilisée, vous restez éveillé et ne ressentez pas de douleur, seulement des pressions. Une sédation ou une anesthésie générale est réservée aux extractions multiples ou complexes et à l'anxiété majeure — voir la question <a href="/questions/j-ai-peur-de-l-anesthesie-generale-est-ce-vraiment-risque">j'ai peur de l'anesthésie générale</a>.</p>

<p>Le praticien dégage la gencive si elle recouvre la dent, élargit l'alvéole, et retire la dent — entière, ou en plusieurs fragments pour préserver l'os. Quelques points de suture referment le site, souvent résorbables. Le geste lui-même dure généralement moins de trois quarts d'heure. Pour une intervention programmée, notre question <a href="/questions/comment-bien-preparer-une-operation-programmee-a-jeun">comment préparer une opération</a> détaille les consignes de jeûne et d'accompagnement.</p>

<h2>Les jours d'après</h2>

<p>Il faut s'attendre à un gonflement de la joue et à une gêne pendant plusieurs jours, avec un maximum vers 48 à 72 heures, parfois un bleu et une raideur de la mâchoire. Beaucoup reprennent leurs activités dès le lendemain ; une extraction complexe justifie un à trois jours de repos.</p>

<h3>Ce qui aide vraiment</h3>

<ul>
<li><strong>Le froid</strong> sur la joue les premières vingt-quatre heures, par périodes courtes.</li>
<li><strong>Les antalgiques prescrits</strong>, pris régulièrement le premier jour plutôt qu'à la demande.</li>
<li><strong>Alimentation molle et tiède</strong>, boissons sans paille, pas d'alcool.</li>
<li><strong>Pas de tabac ni de chicha</strong> : le tabac est le premier facteur d'échec de cicatrisation.</li>
<li><strong>Brossage doux</strong> des autres dents dès le premier jour, rinçages selon les consignes du praticien — jamais de bain de bouche vigoureux les premières heures, qui déloge le caillot.</li>
<li><strong>Pas de sport intense</strong> ni d'effort les deux à trois premiers jours.</li>
</ul>

<h3>Manger et se laver les dents, jour par jour</h3>

<p><strong>Les premières heures</strong>, tant que l'anesthésie n'est pas dissipée, ne mangez pas : le risque est de se mordre la joue ou la lèvre sans le sentir. <strong>Le premier jour</strong>, alimentation froide ou tiède et molle — soupe tiède, yaourt, purée, œufs brouillés — sans paille et sans aliments à petits grains ou à éclats qui se logent dans l'alvéole. <strong>À partir du deuxième jour</strong>, on réintroduit progressivement en mastiquant du côté opposé, et on suit les consignes de rinçage données par le praticien. <strong>Au bout d'une semaine</strong>, la plupart des personnes ont retrouvé une alimentation normale.</p>

<p>Le brossage des autres dents reprend dès le soir même, avec une brosse souple ; on contourne simplement le site opératoire les premiers jours pour ne pas déloger le caillot, qui est le pansement naturel de la plaie. Les antalgiques et, si le praticien en a prescrit, l'<a href="/blog/antibiotiques-maroc">antibiotique</a> se prennent aux horaires indiqués et jusqu'au bout — la fiche des spécialités vendues au Maroc est dans notre <a href="/medicaments">base des médicaments</a>.</p>

<h3>Les signes qui doivent faire rappeler</h3>

<ul>
<li>Douleur qui <strong>augmente</strong> au troisième ou quatrième jour au lieu de diminuer, souvent avec une mauvaise odeur : c'est le tableau de l'alvéolite, quand le caillot ne tient pas. Cela se traite.</li>
<li>Saignement qui ne s'arrête pas malgré une compression prolongée.</li>
<li>Fièvre, gonflement qui progresse au-delà du troisième jour, difficulté à avaler ou à respirer : urgence, <strong>141 (SAMU) ou le 15</strong>.</li>
<li>Engourdissement persistant de la lèvre, du menton ou de la langue au-delà de quelques heures.</li>
</ul>

<h2>Questions fréquentes de terrain</h2>

<p><strong>Les quatre en une fois ?</strong> C'est possible et parfois plus pratique, notamment sous sédation, mais le confort post-opératoire est moindre. Beaucoup de praticiens procèdent côté par côté pour laisser un côté fonctionnel.</p>

<p><strong>Les dents de sagesse déplacent-elles les dents de devant ?</strong> Cette idée est très répandue mais mal étayée : la récidive orthodontique s'explique surtout par la stabilité du résultat et le port de la contention. C'est l'orthodontiste qui juge, en fonction du plan de traitement — voir aussi <a href="/symptomes/dents-mal-alignees">dents mal alignées</a>.</p>

<p><strong>Et pendant la grossesse ?</strong> Une extraction non urgente se reporte après l'accouchement ; une infection, elle, se traite. Le deuxième trimestre est la période la plus confortable pour un geste nécessaire. Voir <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>.</p>

<h2>En résumé</h2>

<p>La bonne question n'est pas « faut-il enlever les dents de sagesse ? » mais « <em>cette</em> dent, chez <em>cette</em> personne, pose-t-elle ou annonce-t-elle un problème ? ». Une radio, un examen et un avis argumenté permettent de trancher. En cas de doute, demandez au praticien de vous montrer la radio et de vous expliquer l'indication : c'est la meilleure façon d'éviter autant l'extraction inutile que l'attente qui coûte une deuxième molaire.</p>

<hr>

<p>Une douleur au fond de la mâchoire ou un avis à confirmer ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a>, comparez les profils vérifiés et prenez rendez-vous en ligne. En cas de fièvre avec gonflement ou de difficulté à avaler, appelez le 141 (SAMU) ou le 15.</p>`;

const sagesseTk = [
  "Une dent de sagesse bien sortie, brossable et indolore peut rester : on n'extrait pas « au cas où ».",
  "L'extraction est justifiée en cas d'infections répétées, de carie, d'atteinte de la dent voisine, de kyste ou de gêne orthodontique.",
  "La radiographie panoramique conditionne la décision et le choix de l'anesthésie.",
  "Gonflement et gêne sont normaux jusqu'à 72 h ; une douleur qui augmente au 3e jour évoque une alvéolite, à traiter.",
  "Tabac et chicha sont le premier facteur d'échec de cicatrisation après extraction.",
];

const sagesseFaq = [
  { q: "Faut-il toujours enlever les dents de sagesse ?", a: "Non. Une dent de sagesse complètement sortie, bien positionnée, accessible au brossage et sans épisode infectieux peut être conservée sous surveillance. L'extraction s'impose en cas d'infections répétées, de carie de la dent ou de sa voisine, d'atteinte de l'os, de kyste, ou lorsqu'elle gêne un traitement d'orthodontie." },
  { q: "À quel âge faut-il extraire une dent de sagesse ?", a: "Il n'y a pas d'âge obligatoire. Quand l'extraction est indiquée, elle est généralement plus simple et la cicatrisation plus rapide chez le jeune adulte, car les racines sont moins formées. Cela ne justifie pas d'extraire une dent qui ne pose aucun problème." },
  { q: "L'extraction d'une dent de sagesse est-elle douloureuse ?", a: "Le geste se fait sous anesthésie : on ressent des pressions, pas de douleur. C'est ensuite qu'il faut compter une gêne et un gonflement, maximum vers 48 à 72 heures, contrôlés par les antalgiques prescrits et le froid sur la joue." },
  { q: "Combien de temps dure la récupération ?", a: "La plupart des personnes reprennent leurs activités dès le lendemain, avec un gonflement qui décroît sur cinq à sept jours. Une extraction complexe peut demander un à trois jours de repos. Une douleur qui augmente au troisième ou quatrième jour n'est pas normale et doit faire rappeler le praticien." },
  { q: "Peut-on enlever les quatre dents de sagesse en une seule fois ?", a: "C'est possible, notamment sous sédation ou anesthésie générale, mais les suites sont plus inconfortables puisqu'aucun côté ne reste fonctionnel. Beaucoup de praticiens préfèrent opérer côté par côté ; la décision se prend avec vous selon la difficulté et votre situation." },
  { q: "Qu'est-ce qu'une alvéolite après extraction ?", a: "C'est la complication la plus fréquente : le caillot qui protège l'alvéole se désagrège ou ne se forme pas, laissant l'os à nu. Le signe typique est une douleur intense qui réapparaît ou s'aggrave au troisième ou quatrième jour, souvent avec une mauvaise odeur. Cela se soigne au cabinet, il ne faut pas attendre." },
  { q: "Les dents de sagesse font-elles bouger les autres dents ?", a: "Cette idée est répandue mais peu étayée scientifiquement. La récidive après un traitement d'orthodontie dépend surtout de la stabilité du résultat et du port de la contention. C'est l'orthodontiste, avec le chirurgien-dentiste, qui juge si une extraction sert le plan de traitement." },
  { q: "Peut-on fumer après une extraction dentaire ?", a: "Il faut l'éviter, cigarette comme chicha. Le tabac est le premier facteur d'échec de cicatrisation : il perturbe le caillot, favorise l'alvéolite et l'infection. Plus l'abstinence couvre les premiers jours, meilleures sont les suites." },
];

const sagesseSources = [
  { label: "Wisdom tooth removal — indications, procédure, suites", url: "https://www.nhs.uk/conditions/wisdom-tooth-removal/", publisher: "National Health Service (NHS)" },
  { label: "Douleurs au niveau des dents et de la bouche : quelles causes ?", url: "https://www.ameli.fr/assure/sante/themes/douleurs-dentaires-bouche/causes-douleurs", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Prescription des antibiotiques en pratique bucco-dentaire — recommandations", url: "https://ansm.sante.fr/uploads/2021/02/04/reco-prescription-des-antibiotiques-en-pratique-buccodentaire-septembre2011.pdf", publisher: "ANSM", year: "2011" },
  { label: "Santé bucco-dentaire — principaux repères", url: "https://www.who.int/fr/news-room/fact-sheets/detail/oral-health", publisher: "Organisation mondiale de la Santé (OMS)", year: "2025" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. PARODONTITE
// ─────────────────────────────────────────────────────────────────────────────
const cParo = `<p>Les dents ne tombent pas parce qu'elles vieillissent. Elles tombent parce que ce qui les tient — la gencive et l'os — a été détruit, lentement, par une infection qui ne fait presque pas mal. C'est toute la difficulté de la parodontite : elle avance sans douleur et se manifeste tard, quand la perte osseuse est déjà installée. L'OMS estime que les formes sévères de maladie parodontale touchent <strong>plus d'un milliard de personnes</strong> dans le monde.</p>

<p>Cet article explique comment repérer la maladie tôt, pourquoi elle dépasse le cadre de la bouche, ce que le traitement peut réellement récupérer, et ce qui relève au contraire de la fausse promesse. Il complète notre guide <a href="/blog/mal-de-dents-rage-de-dents-maroc">mal de dents</a> et la fiche <a href="/maladies/gingivite">gingivite</a>.</p>

<h2>De la gingivite à la parodontite</h2>

<p>Tout commence par la plaque dentaire, un dépôt bactérien qui se minéralise en tartre. La gencive s'enflamme : c'est la <strong>gingivite</strong>, rouge, un peu gonflée, qui <a href="/symptomes/saignement-des-gencives">saigne au brossage</a>. À ce stade, tout est <strong>réversible</strong> : hygiène rigoureuse et détartrage suffisent le plus souvent.</p>

<p>Si l'inflammation persiste, elle passe sous la gencive. L'attache se décolle et forme une <strong>poche parodontale</strong>, un espace que la brosse n'atteint plus et où les bactéries prospèrent. L'os qui entoure la racine commence à fondre. C'est la <strong>parodontite</strong> — et cette perte d'os, contrairement à l'inflammation gingivale, <strong>ne se reconstitue pas spontanément</strong>. L'objectif du traitement devient alors d'arrêter la progression, pas de revenir en arrière.</p>

<table>
<thead>
<tr><th>Stade</th><th>Ce que l'on constate</th><th>Ce que le traitement peut obtenir</th></tr>
</thead>
<tbody>
<tr><td>Gencive saine</td><td>Rose pâle, ferme, aucun saignement au brossage</td><td>Maintien par l'hygiène et le contrôle annuel</td></tr>
<tr><td>Gingivite</td><td>Rougeur, gonflement, saignement au brossage, pas de perte d'os</td><td><strong>Retour complet à la normale</strong></td></tr>
<tr><td>Parodontite débutante</td><td>Poches peu profondes, début de perte osseuse à la radio</td><td>Arrêt de l'évolution, gencive raffermie</td></tr>
<tr><td>Parodontite modérée à sévère</td><td>Poches profondes, récessions, mobilités, espaces qui s'ouvrent</td><td>Stabilisation ; l'os perdu ne revient pas</td></tr>
</tbody>
</table>

<h2>Les signes à repérer tôt</h2>

<ul>
<li><strong>Saignement</strong> au brossage ou au fil dentaire — le premier signal, celui qu'on banalise le plus.</li>
<li>Gencives rouges, gonflées, sensibles au contact.</li>
<li><strong>Récession</strong> : les dents paraissent plus longues, les collets se dénudent, la sensibilité au froid augmente.</li>
<li><a href="/symptomes/mauvaise-haleine">Mauvaise haleine</a> persistante, goût désagréable.</li>
<li>Espaces qui apparaissent entre les dents, aliments qui s'y coincent.</li>
<li><strong>Mobilité</strong> dentaire, dents qui « bougent » ou dont la position change, gêne à la mastication.</li>
<li>Abcès de la gencive à répétition.</li>
</ul>

<blockquote>Un saignement de gencive n'est jamais normal, même minime, même indolore. C'est le signe le plus précoce et le plus utile ; c'est aussi celui qui laisse le plus de marge de manœuvre au traitement.</blockquote>

<h2>Pourquoi ce n'est pas qu'un problème de bouche</h2>

<p>La parodontite est une infection chronique qui entretient une inflammation à bas bruit dans tout l'organisme. Deux liens sont particulièrement documentés :</p>

<ul>
<li><strong>Le <a href="/blog/diabete-type-2-maroc">diabète</a></strong>, dans les deux sens : un diabète mal équilibré favorise et aggrave la parodontite ; une parodontite active rend le contrôle de la glycémie plus difficile. Traiter les gencives fait partie de la prise en charge du diabète, pas d'un confort annexe.</li>
<li><strong>Le risque cardiovasculaire</strong>, associé à l'inflammation chronique — un argument de plus, avec le tabac, pour ne pas laisser traîner. Voir notre article sur la <a href="/blog/prevention-cardiovasculaire-maroc">prévention cardiovasculaire</a>.</li>
</ul>

<p>Chez la femme enceinte, les gencives sont plus réactives sous l'effet hormonal et une gingivite s'installe facilement : les soins sont recommandés pendant la grossesse (voir <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>).</p>

<h2>Ce qui augmente le risque</h2>

<ul>
<li><strong>Le tabac et la chicha</strong> — facteur de risque majeur, qui masque en plus le saignement et donne une fausse impression de gencive saine. Voir <a href="/blog/arret-tabac-sevrage-maroc">arrêter de fumer</a>.</li>
<li>Un diabète déséquilibré, une immunodépression.</li>
<li>Une prédisposition familiale : les formes précoces et agressives existent, y compris chez le sujet jeune.</li>
<li>Le <a href="/maladies/bruxisme">bruxisme</a>, qui surcharge des dents déjà fragilisées.</li>
<li>Le tartre installé, des restaurations débordantes, des dents <a href="/symptomes/dents-mal-alignees">mal alignées</a> difficiles à nettoyer.</li>
<li>Certains médicaments, la respiration buccale, le stress.</li>
</ul>

<h3>Le piège du fumeur</h3>

<p>Le tabac resserre les vaisseaux de la gencive. Résultat : chez un fumeur, la gencive <strong>saigne moins</strong> alors que la maladie progresse davantage. Beaucoup de fumeurs se croient donc épargnés jusqu'au jour où une dent bouge. Si vous fumez, ne vous fiez pas à l'absence de saignement comme indicateur : c'est le sondage au cabinet qui dit la vérité, et le dépistage doit être plus régulier, pas moins.</p>

<p>Ce biais s'ajoute à une réalité marocaine : selon l'enquête nationale de santé bucco-dentaire, une part importante de la population n'a jamais consulté de dentiste, et le pays compte environ un dentiste pour 8 100 habitants. La maladie parodontale y est donc souvent découverte à un stade où l'os est déjà entamé — raison de plus pour transformer le premier saignement en rendez-vous.</p>

<h2>Comment le diagnostic se pose</h2>

<p>Le praticien réalise un <strong>bilan parodontal</strong> : il mesure, dent par dent, la profondeur des poches à la sonde, note les saignements, les récessions et les mobilités. Des <strong>radiographies</strong> objectivent la perte osseuse et servent de référence pour suivre l'évolution. C'est ce relevé — et non l'impression visuelle — qui permet de dire s'il s'agit d'une gingivite ou d'une parodontite, et à quel stade. Un <a href="/specialites/chirurgie-dentaire">chirurgien-dentiste</a> assure la prise en charge ; les formes avancées peuvent être adressées à un parodontologue.</p>

<h2>Le traitement : ce qui marche vraiment</h2>

<h3>1. L'assainissement non chirurgical</h3>

<p>C'est le socle, et il fonctionne. Détartrage complet, puis <strong>surfaçage radiculaire</strong> : un nettoyage en profondeur, sous la gencive, qui élimine le tartre et le tissu infecté à la surface des racines pour permettre à la gencive de se réattacher. L'intervention se fait sous anesthésie locale, en une ou plusieurs séances selon l'étendue. En parallèle, la <strong>technique de brossage</strong> et le nettoyage entre les dents sont revus — sans cela, le bénéfice ne tient pas.</p>

<h3>2. La chirurgie, si nécessaire</h3>

<p>Quand des poches profondes persistent après assainissement, un geste chirurgical permet d'accéder aux zones inaccessibles, de remodeler la gencive, et parfois de tenter une régénération osseuse dans des défauts bien délimités. C'est une option ciblée, pas une étape obligatoire.</p>

<h3>3. La maintenance, à vie</h3>

<p>C'est le point que les patients découvrent souvent trop tard : une parodontite traitée est une maladie <strong>stabilisée, pas guérie</strong>. Des visites de contrôle rapprochées, généralement tous les trois à six mois selon le risque, avec assainissement d'entretien, sont ce qui distingue une stabilisation durable d'une rechute. Voir <a href="/questions/mes-dents-se-dechaussent-parodontite-comment-arreter-la-progression">comment arrêter la progression d'une parodontite</a>.</p>

<h2>Récessions, sensibilité, dents perdues : les suites possibles</h2>

<p>Une fois la maladie stabilisée, il reste souvent à traiter ses traces. Les <strong>récessions</strong> — collets dénudés, dents visuellement plus longues — expliquent la sensibilité au froid et à la brosse ; des dentifrices adaptés, des vernis appliqués au cabinet et, dans certains cas, une greffe de gencive permettent d'améliorer confort et esthétique. Attention au réflexe inverse : brosser plus fort aggrave la récession.</p>

<p>Quand une ou plusieurs dents ont été perdues, le remplacement se discute <strong>après</strong> stabilisation, jamais avant : bridge, prothèse amovible ou <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant</a>, selon le volume d'os restant et le contrôle de la maladie. C'est aussi à ce moment que le rôle du <a href="/blog/abces-dentaire-maroc">contrôle des foyers infectieux</a> devient décisif : un abcès parodontal négligé peut faire perdre en quelques mois l'os qu'on espérait utiliser.</p>

<h2>Ce qui ne marche pas</h2>

<ul>
<li><strong>Les bains de bouche seuls.</strong> Ils complètent parfois un traitement, sur une durée limitée et sur prescription ; ils ne pénètrent pas dans une poche et ne remplacent aucun geste mécanique. Utilisés au long cours sans avis, ils ont leurs propres inconvénients.</li>
<li><strong>Les antibiotiques seuls.</strong> Sans assainissement, ils n'ont pas d'effet durable. Voir <a href="/blog/antibiotiques-maroc">le bon usage des antibiotiques</a>.</li>
<li><strong>Brosser plus fort.</strong> Un brossage agressif abîme la gencive et accélère la récession. C'est la régularité et la technique qui comptent, pas la force.</li>
<li><strong>Attendre que la mobilité passe.</strong> Une dent mobile sur parodontite ne se resserre pas d'elle-même.</li>
<li><strong>Poser un implant sans traiter la maladie.</strong> Les tissus autour d'un implant peuvent s'infecter de la même façon : une parodontite non stabilisée compromet le résultat — voir <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant dentaire</a>.</li>
</ul>

<h2>La prévention, au quotidien</h2>

<ul>
<li><strong>Deux brossages par jour, deux minutes</strong>, brosse souple, dentifrice fluoré, en insistant à la jonction dent-gencive.</li>
<li><strong>Un nettoyage interdentaire quotidien</strong> — fil ou brossettes, choisies avec le praticien selon les espaces. C'est l'ajout qui change le plus les choses.</li>
<li><strong>Détartrage régulier</strong> et contrôle une à deux fois par an : voir <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">à quelle fréquence</a> et <a href="/prevenir/gingivite">prévenir la maladie des gencives</a>.</li>
<li><strong>Arrêter le tabac et la chicha</strong> : c'est, avec l'hygiène, le levier le plus puissant.</li>
<li><strong>Équilibrer un diabète</strong> et signaler tout traitement au long cours.</li>
<li><strong>Consulter dès le premier saignement</strong>, sans attendre la mobilité.</li>
</ul>

<p>Sur le plan financier, la logique est la même que pour la carie : un détartrage et un assainissement précoces coûtent bien moins qu'un traitement de parodontite avancée suivi de remplacements prothétiques. Nos pages <a href="/prix">tarifs des actes</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> détaillent la mécanique du reste à charge.</p>

<h2>En résumé</h2>

<p>La parodontite est une maladie silencieuse, fréquente et traitable, dont le pronostic dépend presque entièrement du moment où on la prend. Un saignement de gencive est une invitation à consulter, pas un détail d'hygiène. Traitée tôt, elle se stabilise et les dents se gardent ; traitée tard, on ne récupère pas l'os perdu.</p>

<hr>

<p>Vos gencives saignent ou vos dents bougent ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a>, consultez les profils vérifiés et prenez rendez-vous en ligne pour un bilan parodontal.</p>`;

const paroTk = [
  "La gingivite est réversible ; la parodontite détruit l'os, et cet os ne se reconstitue pas seul.",
  "Un saignement de gencive au brossage est le premier signe utile : il ne faut pas l'attribuer à la brosse.",
  "Le traitement de base est mécanique : détartrage puis surfaçage radiculaire, plus une technique de brossage revue.",
  "Une parodontite traitée est stabilisée, pas guérie : la maintenance tous les 3 à 6 mois évite la rechute.",
  "Tabac, chicha et diabète déséquilibré sont les principaux accélérateurs de la maladie.",
];

const paroFaq = [
  { q: "Peut-on guérir d'une parodontite ?", a: "On peut la stabiliser, durablement, mais pas revenir à l'état antérieur : l'os détruit ne se reconstitue pas spontanément. L'assainissement arrête la progression et l'inflammation, et les dents peuvent être conservées des années. C'est pour cela que la maintenance tous les trois à six mois fait partie du traitement." },
  { q: "Pourquoi mes gencives saignent-elles quand je me brosse les dents ?", a: "Un saignement traduit une inflammation de la gencive due à l'accumulation de plaque bactérienne, le plus souvent une gingivite. Ce n'est pas la brosse qui est en cause et ce n'est jamais banal. Au stade de gingivite, hygiène et détartrage suffisent généralement à tout faire disparaître." },
  { q: "Une dent qui bouge peut-elle se resserrer ?", a: "Une mobilité liée à une inflammation peut diminuer après assainissement, car la gencive se raffermit. En revanche, si l'os de soutien a été détruit, la stabilité ne revient pas complètement ; le traitement vise alors à empêcher l'aggravation et, parfois, à solidariser les dents concernées." },
  { q: "Le détartrage suffit-il contre la parodontite ?", a: "Non, pas seul. Le détartrage retire le tartre visible au-dessus de la gencive. La parodontite nécessite un surfaçage radiculaire, c'est-à-dire un nettoyage sous la gencive, à la surface des racines, réalisé sous anesthésie locale, complété par une technique de brossage adaptée et un suivi rapproché." },
  { q: "Le détartrage abîme-t-il l'émail ou déchausse-t-il les dents ?", a: "Non. Le détartrage n'endommage pas l'émail. L'impression de dents plus longues ou plus sensibles après la séance vient du fait que le tartre masquait une récession déjà présente : c'est la maladie qui avait déchaussé la dent, pas le nettoyage. Une sensibilité passagère est fréquente et s'estompe." },
  { q: "La parodontite est-elle héréditaire ou contagieuse ?", a: "Il existe une prédisposition familiale, avec des formes précoces et rapides chez certaines personnes. Les bactéries impliquées s'échangent par la salive, mais développer la maladie dépend du terrain, de l'hygiène et de facteurs comme le tabac ou le diabète. Un antécédent familial justifie un dépistage plus attentif." },
  { q: "Quel lien entre diabète et maladie des gencives ?", a: "Le lien est réciproque et bien documenté : un diabète mal équilibré favorise et aggrave la parodontite, tandis qu'une parodontite active rend le contrôle de la glycémie plus difficile. Chez une personne diabétique, le suivi dentaire fait partie de la prise en charge du diabète." },
];

const paroSources = [
  { label: "Comprendre la maladie des gencives : gingivite et parodontite", url: "https://www.ameli.fr/assure/sante/themes/maladie-gencives/definition-causes-symptomes", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Consultation et traitement de la gingivite et de la parodontite", url: "https://www.ameli.fr/assure/sante/themes/maladie-gencives/consultation-traitement-gingivite-parodontite", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Les complications du diabète au niveau des dents et des gencives", url: "https://www.ameli.fr/assure/sante/themes/diabete-adulte/diabete-symptomes-evolution/complications-dents-gencives", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Santé bucco-dentaire — principaux repères (parodontopathies sévères : plus d'un milliard de personnes)", url: "https://www.who.int/fr/news-room/fact-sheets/detail/oral-health", publisher: "Organisation mondiale de la Santé (OMS)", year: "2025" },
  { label: "Enquête nationale de santé bucco-dentaire : état bucco-dentaire au Maroc", url: "https://aujourdhui.ma/societe/les-marocains-negligent-leur-hygiene-bucco-dentaire", publisher: "Ministère de la Santé (via Aujourd'hui le Maroc)", year: "2018" },
];

// ─────────────────────────────────────────────────────────────────────────────
const SATELLITES = [
  {
    slug: "abces-dentaire-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Abcès dentaire",
    title: "Abcès dentaire : reconnaître l'urgence et se faire soigner",
    excerpt:
      "Abcès dentaire : les signes qui ne trompent pas, à quel moment cela devient une urgence, ce qu'il faut faire et surtout ne pas faire en attendant, et pourquoi le drainage — pas l'antibiotique — est le vrai traitement.",
    metaTitle: "Abcès dentaire : signes, urgence, traitement",
    metaDesc:
      "Abcès dentaire : reconnaître les signes, savoir quand c'est une urgence, ce qui soulage sans aggraver et le vrai traitement chez le dentiste.",
    coverAlt: "Équipe dentaire réalisant un soin au fauteuil, aspiration en cours",
    content: cAbces, keyTakeaways: abcesTk, faq: abcesFaq, sources: abcesSources,
  },
  {
    slug: "dent-de-sagesse-extraction-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Dent de sagesse",
    title: "Dent de sagesse : faut-il l'enlever et comment se passe l'extraction ?",
    excerpt:
      "Dent de sagesse : quand l'extraction est réellement justifiée, quand une simple surveillance suffit, comment se déroule le geste, à quoi ressemblent les jours d'après et quand rappeler le praticien.",
    metaTitle: "Dent de sagesse : faut-il l'extraire ?",
    metaDesc:
      "Dent de sagesse : quand l'extraction est justifiée, déroulé du geste, récupération, alvéolite et cas particuliers. Guide clair adapté au Maroc.",
    coverAlt: "Radiographie panoramique dentaire montrant les dents de sagesse",
    content: cSagesse, keyTakeaways: sagesseTk, faq: sagesseFaq, sources: sagesseSources,
  },
  {
    slug: "parodontite-dechaussement-dents-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Parodontite",
    title: "Parodontite : pourquoi les dents se déchaussent et comment l'arrêter",
    excerpt:
      "Parodontite : une infection silencieuse qui détruit l'os autour des dents. Les signes à repérer tôt, le lien avec le diabète, ce que le traitement récupère vraiment et ce qui relève de la fausse promesse.",
    metaTitle: "Parodontite : dents qui se déchaussent",
    metaDesc:
      "Parodontite : signes précoces, lien avec le diabète, bilan parodontal, surfaçage radiculaire, maintenance et prévention. Guide clair adapté au Maroc.",
    coverAlt: "Examen des gencives avec miroir et sonde parodontale",
    content: cParo, keyTakeaways: paroTk, faq: paroFaq, sources: paroSources,
  },
];

/** Temps de lecture — même formule que lib/article-content.ts (≈200 mots/min). */
function words(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const pillar = await prisma.post.findUnique({ where: { slug: PILLAR_SLUG }, select: { id: true } });
  if (!pillar) { console.error(`Pilier « ${PILLAR_SLUG} » introuvable : lancer d'abord seed-blog-dentaire.cjs.`); process.exit(1); }

  const cats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const catId = (s) => {
    const c = cats.find((x) => x.slug === s);
    if (!c) throw new Error(`Catégorie « ${s} » introuvable.`);
    return c.id;
  };

  const now = new Date();
  for (const art of SATELLITES) {
    const n = words(art.content);
    const data = {
      title: art.title,
      excerpt: art.excerpt,
      content: art.content,
      categoryId: catId(art.categorySlug),
      metaTitle: art.metaTitle,
      metaDesc: art.metaDesc,
      coverAlt: art.coverAlt,
      readingTime: Math.max(1, Math.round(n / 200)),
      keyTakeaways: art.keyTakeaways.join("\n"),
      faqJson: JSON.stringify(art.faq),
      sources: JSON.stringify(art.sources),
      aboutEntity: art.aboutEntity,
      pillarId: pillar.id,
      reviewedById: admin.id,
      reviewedAt: now,
    };
    const post = await prisma.post.upsert({
      where: { slug: art.slug },
      update: data,
      create: { ...data, slug: art.slug, authorId: admin.id, status: "PUBLISHED", publishedAt: now },
      select: { slug: true, readingTime: true },
    });
    console.log(`  ↳ /blog/${post.slug}`);
    console.log(`     ${n} mots · ${post.readingTime} min · ${art.faq.length} FAQ · ${art.sources.length} sources · ${(art.content.match(/href="/g) || []).length} liens`);
  }
  console.log(`\nLot 2 : ${SATELLITES.length} satellites rattachés à /blog/${PILLAR_SLUG}.`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
