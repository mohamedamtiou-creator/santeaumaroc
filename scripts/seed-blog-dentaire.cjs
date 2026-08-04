require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// VERTICAL DENTAIRE — article n°1 (pilier du futur cocon bucco-dentaire).
//
// POURQUOI CE SUJET : au 3 août 2026, le corpus blog (227 articles) ne contient
// AUCUN article dentaire, alors que l'annuaire compte 2 770 chirurgiens-dentistes,
// 226 orthodontistes, 112 parodontologues et 43 pédodontistes — le 2e pool de
// praticiens derrière la médecine générale, déjà couverte. Requête à intention
// urgente, concurrence marocaine faible, conversion directe vers la prise de RDV.
//
// GARDE-FOUS APPLIQUÉS :
//  · Aucune posologie, aucun nom de spécialité pharmaceutique en conseil direct
//    (YMYL — cf RELECTURE-MEDICALE-YMYL.md).
//  · AUCUN MONTANT recopié : lib/prix-reference.ts est la source unique du silo
//    tarifaire et interdit la duplication de chiffres. La section « coût » explique
//    ce qui fait varier la facture et renvoie vers /prix et /remboursement-amo-cnss.
//  · Urgences : convention du site « le 141 (SAMU) ou le 15 » (cf lib/i18n.ts).
//  · Maillage : blog ↔ fiches maladies/symptômes ↔ Q/R ↔ outils ↔ annuaire.
//    Premier article du corpus à câbler le silo complet (les 227 autres ne
//    pointent que vers /blog et /specialites).
//
//   node scripts/seed-blog-dentaire.cjs
// ════════════════════════════════════════════════════════════════════════════

const content = `<p>Une rage de dents ne prévient pas. Elle arrive un vendredi soir, empêche de dormir, résiste au comprimé avalé à la hâte — et laisse une seule question en tête : est-ce que ça peut attendre lundi ? Au Maroc, la douleur dentaire fait partie des tout premiers motifs de consultation, et les chiffres expliquent pourquoi : selon l'enquête nationale de santé bucco-dentaire du ministère de la Santé, <strong>92 % des adultes de 35 à 44 ans</strong> sont touchés par la carie, et <strong>27 % n'ont jamais vu de dentiste</strong>.</p>

<p>Ce guide répond à ce que vous cherchez vraiment : ce qui fait mal exactement, ce qui soulage réellement en attendant le rendez-vous, les gestes qui aggravent la situation, les signes qui imposent les urgences le soir même, et ce qui se passe ensuite au fauteuil. Il complète notre fiche courte <a href="/symptomes/mal-de-dents">mal de dents</a>, à lire si vous cherchez une réponse en trente secondes.</p>

<h2>Pourquoi une dent fait-elle mal ?</h2>

<p>Une dent n'est pas un caillou : c'est un organe vivant, construit en trois couches. L'<strong>émail</strong>, en surface, est le tissu le plus dur du corps et ne contient aucun nerf. Sous lui, la <strong>dentine</strong> est traversée de milliers de canalicules microscopiques qui conduisent le froid, le chaud et le sucré. Au centre, la <strong>pulpe</strong> abrite le nerf et les vaisseaux sanguins.</p>

<p>Toute la logique de la douleur dentaire tient dans cette anatomie. Tant que la lésion reste dans l'émail, il n'y a aucun symptôme : c'est la phase silencieuse, celle qui se voit sur une radio, pas dans le miroir. Quand elle atteint la dentine, la dent devient <em>sensible</em> — au froid, au sucré, à l'air frais. Quand elle touche la pulpe, l'inflammation se produit dans une cavité fermée qui ne peut pas gonfler : la pression monte, et la douleur devient <strong>forte, continue, lancinante</strong>. C'est ce que l'on appelle une rage de dents, ou pulpite.</p>

<h3>Les cinq causes les plus fréquentes</h3>

<ul>
<li><strong>La <a href="/maladies/carie-dentaire">carie</a> profonde</strong> — de loin la première cause. Elle progresse pendant des mois sans bruit, puis se manifeste par une sensibilité, puis par une douleur franche.</li>
<li><strong>La pulpite</strong> — le nerf est atteint et enflammé. Douleur spontanée, prolongée, souvent aggravée par la chaleur et par la position allongée.</li>
<li><strong>L'<a href="/blog/abces-dentaire-maroc">abcès dentaire</a></strong> — le nerf est mort, l'infection s'est installée à la racine. La douleur devient pulsatile, la dent semble « plus haute », le moindre contact est intolérable, et la joue ou la gencive peut gonfler.</li>
<li><strong>Les maladies des gencives</strong> — <a href="/maladies/gingivite">gingivite</a> puis <a href="/blog/parodontite-dechaussement-dents-maroc">parodontite</a> : les gencives <a href="/symptomes/saignement-des-gencives">saignent au brossage</a>, se rétractent, les dents deviennent sensibles au collet puis mobiles.</li>
<li><strong>La <a href="/blog/dent-de-sagesse-extraction-maroc">dent de sagesse</a></strong> — quand elle sort mal, la gencive qui la recouvre s'infecte (péricoronarite) : douleur au fond de la mâchoire, difficulté à ouvrir la bouche, parfois ganglion sous le maxillaire.</li>
</ul>

<p>À côté de ces cinq causes, deux situations reviennent souvent en consultation : la <strong>fêlure</strong> d'une dent (douleur brève et vive à la mastication, sans carie visible) et le <a href="/maladies/bruxisme">bruxisme</a>, ce grincement nocturne qui réveille avec des dents sensibles et une mâchoire fatiguée.</p>

<h3>Quand ce n'est pas la dent : les douleurs qui trompent</h3>

<p>Une douleur ressentie dans les dents ne vient pas toujours des dents. Quatre pièges classiques méritent d'être connus, parce qu'ils changent complètement le médecin à consulter :</p>

<ul>
<li><strong>La <a href="/maladies/sinusite">sinusite</a> maxillaire</strong> : plusieurs dents du haut, du même côté, deviennent douloureuses en même temps, avec une aggravation quand on penche la tête en avant et un nez bouché.</li>
<li><strong>La <a href="/maladies/nevralgie-du-trijumeau">névralgie du trijumeau</a></strong> : décharges électriques de quelques secondes, déclenchées par un effleurement, le vent ou le brossage.</li>
<li><strong>L'articulation de la mâchoire</strong> : douleur devant l'oreille, craquements, ouverture limitée, réveil avec les mâchoires serrées.</li>
<li><strong>Le cœur</strong> : rare mais capital. Une douleur de la mâchoire <em>inférieure</em>, déclenchée par l'effort, accompagnée d'un serrement dans la poitrine, d'un essoufflement ou de sueurs, peut être un <a href="/maladies/infarctus-du-myocarde">infarctus</a>. Dans ce cas, on n'appelle pas le dentiste : on appelle le <strong>141 (SAMU) ou le 15</strong>.</li>
</ul>

<h2>Évaluer la gravité en trois questions</h2>

<p>Avant de chercher un remède, situez votre douleur. Ce tableau résume ce que les dentistes évaluent en premier.</p>

<table>
<thead>
<tr><th>Ce que vous ressentez</th><th>Ce que cela évoque</th><th>Délai à respecter</th></tr>
</thead>
<tbody>
<tr><td>Sensibilité brève au froid ou au sucré, qui s'arrête aussitôt</td><td>Dentine exposée, carie débutante, gencive rétractée</td><td>Rendez-vous dans les jours qui viennent</td></tr>
<tr><td>Douleur qui persiste après le stimulus, réveille la nuit, cède mal aux antalgiques</td><td>Pulpite : le nerf est atteint</td><td>Consultation rapide, sous 24 à 48 h</td></tr>
<tr><td>Douleur pulsatile, dent qui ne supporte plus le contact, mauvais goût dans la bouche</td><td>Infection de la racine, abcès en formation</td><td>Le jour même si possible</td></tr>
<tr><td>Gonflement de la joue, du plancher de la bouche ou du cou, fièvre, difficulté à ouvrir la bouche</td><td>Infection qui diffuse dans les tissus</td><td><strong>Urgence : 141 (SAMU) ou le 15</strong></td></tr>
<tr><td>Dent cassée, déplacée ou expulsée après un choc</td><td>Traumatisme dentaire</td><td><strong>Urgence dentaire immédiate</strong></td></tr>
</tbody>
</table>

<p>Une règle simple sert de repère : <strong>une douleur dentaire qui dure plus de deux jours, ou qui revient, ne se règle pas seule</strong>. Elle peut s'interrompre — c'est même fréquent quand le nerf finit par mourir — mais l'infection, elle, continue.</p>

<h2>Que faire tout de suite pour soulager</h2>

<p>Ces gestes visent un objectif précis et limité : passer la nuit, ou tenir jusqu'au rendez-vous. Aucun ne soigne la dent.</p>

<h3>Ce qui soulage vraiment</h3>

<ol>
<li><strong>Un antalgique simple</strong>, aux doses habituelles indiquées sur la notice. Le <a href="/blog/paracetamol-maroc">paracétamol</a> est le premier choix quand il n'y a pas de contre-indication ; un <a href="/blog/anti-inflammatoires-ains-maroc">anti-inflammatoire</a> comme l'<a href="/blog/ibuprofene-maroc">ibuprofène</a> agit souvent mieux sur une douleur inflammatoire, mais il n'est pas anodin (estomac, reins, grossesse, asthme, traitements en cours) : demandez l'avis de votre pharmacien ou de votre médecin avant de le prendre. Vous pouvez retrouver la fiche des spécialités commercialisées au Maroc, leur prix public et leur taux de remboursement dans notre <a href="/medicaments">base des médicaments</a>.</li>
<li><strong>Un bain de bouche à l'eau salée tiède</strong> — une demi-cuillère à café de sel dans un verre d'eau, à recracher, jamais à avaler. À réserver aux adultes et grands enfants.</li>
<li><strong>Le froid sur la joue</strong>, par-dessus un linge, quinze minutes maximum. Jamais de chaleur sur une joue gonflée : la chaleur favorise la diffusion de l'infection.</li>
<li><strong>Dormir la tête surélevée</strong>, avec un oreiller de plus. La douleur augmente en position allongée parce que l'afflux de sang accroît la pression dans la dent — c'est la vraie raison pour laquelle un mal de dents empire la nuit.</li>
<li><strong>Alléger la mécanique</strong> : aliments mous et tièdes, mastication de l'autre côté, brosse souple, ni très chaud ni très froid.</li>
</ol>

<h3>Les six erreurs qui aggravent la situation</h3>

<blockquote>Attention. Ne posez <strong>jamais</strong> un comprimé d'aspirine ni de l'huile de clou de girofle pure directement sur la gencive : cela provoque une brûlure chimique de la muqueuse, qui s'ajoute à la douleur d'origine.</blockquote>

<ul>
<li><strong>Reprendre un antibiotique d'une ancienne ordonnance.</strong> C'est l'erreur la plus répandue. Elle masque les signes, retarde le soin, favorise la résistance bactérienne, et n'évite pas la récidive. Voir notre article sur le <a href="/blog/antibiotiques-maroc">bon usage des antibiotiques</a>.</li>
<li><strong>Percer ou presser un abcès.</strong> Le drainage est un acte médical, réalisé sous anesthésie.</li>
<li><strong>Appliquer de la chaleur</strong> sur un gonflement.</li>
<li><strong>Passer du fil dentaire autour de la dent douloureuse</strong> si la gencive est enflammée : nettoyez le reste de la bouche, épargnez la zone.</li>
<li><strong>Fumer</strong> — cigarette ou chicha : le tabac entretient l'inflammation gingivale et ralentit la cicatrisation.</li>
<li><strong>Attendre que « ça passe ».</strong> Une douleur qui disparaît sans soin signifie souvent que le nerf est mort, pas que la dent est guérie.</li>
</ul>

<h2>Quand faut-il aller aux urgences ?</h2>

<p>Une infection dentaire négligée peut diffuser dans les tissus du visage et du cou, jusqu'à gêner la respiration. Ces situations ne relèvent pas d'un rendez-vous, mais des urgences immédiates — appelez le <strong>141 (SAMU) ou le 15</strong> :</p>

<ul>
<li>gonflement qui atteint l'œil, le plancher de la bouche ou le cou ;</li>
<li>difficulté à respirer, à avaler ou à parler ;</li>
<li>impossibilité d'ouvrir la bouche normalement ;</li>
<li>fièvre élevée, frissons, altération de l'état général ;</li>
<li>douleur incontrôlable malgré les antalgiques ;</li>
<li>traumatisme avec dent expulsée ou mâchoire douloureuse après un choc.</li>
</ul>

<p>La vigilance doit être renforcée en cas de <a href="/blog/diabete-type-2-maroc">diabète</a>, de traitement immunosuppresseur, de valvulopathie ou de prothèse cardiaque : chez ces personnes, une infection dentaire se complique plus vite et plus fort.</p>

<h2>Ce qui se passe chez le dentiste</h2>

<p>Comprendre le déroulé enlève une bonne part de l'appréhension — et celle-ci est la première cause de retard aux soins.</p>

<p>La consultation commence par un <strong>examen clinique</strong> : inspection, percussion des dents, test au froid pour savoir si le nerf est vivant, palpation des gencives et des ganglions. Une <strong>radiographie</strong> rétro-alvéolaire, ou panoramique si plusieurs dents sont en cause, précise l'étendue de la lésion et l'état de l'os autour de la racine.</p>

<p>Le traitement dépend de ce qui est trouvé :</p>

<ul>
<li><strong>Carie sans atteinte du nerf</strong> — nettoyage puis obturation (composite). Une séance suffit généralement.</li>
<li><strong>Nerf atteint</strong> — <a href="/comment-traiter/carie-dentaire">dévitalisation</a> : le canal est nettoyé, désinfecté, puis obturé. La douleur cède le plus souvent dès cette étape.</li>
<li><strong>Abcès</strong> — <a href="/comment-traiter/abces-dentaire">drainage</a> du pus et traitement du canal. C'est le geste efficace ; l'antibiotique ne vient qu'en complément, dans certaines situations, et <strong>ne remplace jamais le soin de la dent</strong>.</li>
<li><strong>Gencives atteintes</strong> — détartrage, assainissement, parfois surfaçage radiculaire dans les <a href="/comment-traiter/gingivite">parodontites</a>.</li>
<li><strong>Dent non conservable</strong> — extraction, puis discussion d'un remplacement (bridge, prothèse, <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant</a>).</li>
</ul>

<h3>Quel praticien consulter ?</h3>

<p>Dans la très grande majorité des cas, le bon interlocuteur est le <strong><a href="/specialites/chirurgie-dentaire">chirurgien-dentiste</a></strong>. Il traite les caries, les infections, les gencives, extrait et pose les prothèses. Il orientera lui-même vers un <em>parodontologue</em> si les gencives et l'os sont très atteints, vers un <em>orthodontiste</em> pour un problème d'<a href="/symptomes/dents-mal-alignees">alignement</a>, vers un <em>stomatologue</em> ou chirurgien maxillo-facial pour une extraction complexe, et vers un <em>pédodontiste</em> pour les jeunes enfants. Notre page <a href="/quel-medecin-pour/mal-de-dents">quel médecin pour un mal de dents</a> détaille ces situations.</p>

<h3>Combien cela coûte et ce que couvre l'AMO</h3>

<p>Trois éléments font varier la facture : la <strong>nature de l'acte</strong> (un soin de carie et une dévitalisation avec couronne ne se comparent pas), la <strong>ville et le cabinet</strong> — les honoraires sont libres dans le privé — et le <strong>nombre de séances</strong> nécessaires. Le point à retenir sur le plan financier est simple : plus la dent est prise tôt, moins le traitement est lourd et coûteux.</p>

<p>Côté couverture, l'AMO rembourse une partie des soins dentaires sur la base de la tarification nationale de référence, actuellement en cours de révision, et non sur le montant réellement payé : le reste à charge dépend donc de l'écart entre les deux. Demandez toujours un <strong>devis écrit</strong> avant un traitement prothétique ou implantaire, et faites établir une <strong>prise en charge préalable</strong> quand elle est exigée. Nos pages <a href="/prix">tarifs des actes médicaux au Maroc</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> détaillent les fourchettes observées et la mécanique du remboursement ; notre article sur le <a href="/blog/amo-remboursement-consultation-maroc">remboursement d'une consultation</a> explique les démarches pas à pas.</p>

<h2>Situations particulières</h2>

<h3>Chez l'enfant</h3>

<p>Une douleur dentaire chez l'enfant se traite comme chez l'adulte, avec trois différences : <strong>jamais d'aspirine</strong>, jamais d'huile de clou de girofle sur la gencive, et pas de bain de bouche chez le petit qui pourrait l'avaler. Le paracétamol se dose au poids et non à l'âge : notre article sur le <a href="/blog/paracetamol-maroc">paracétamol</a> donne les repères, et celui sur la <a href="/blog/fievre-enfant-que-faire-maroc">fièvre de l'enfant</a> précise quand consulter. Une <a href="/questions/poussees-dentaires-du-bebe-quels-signes-et-comment-le-soulager">poussée dentaire</a> du nourrisson peut gêner et faire baver, mais elle n'explique pas une fièvre élevée ni une diarrhée : dans ce cas, cherchez une autre cause. À voir aussi : notre <a href="/blog/sante-enfant-guide-maroc">guide de la santé de l'enfant</a>.</p>

<h3>Pendant la grossesse</h3>

<p>Les soins dentaires courants sont possibles et même recommandés pendant la grossesse : les gencives sont plus fragiles à cette période, et une infection non traitée est un risque supérieur à celui du soin. Signalez systématiquement la grossesse : le praticien adapte l'anesthésique, évite certains médicaments et reporte les radiographies non indispensables. Le deuxième trimestre est souvent le plus confortable pour les actes programmés. Voir notre article sur le <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>.</p>

<h3>Sous anticoagulant ou antiagrégant</h3>

<p><strong>N'arrêtez jamais votre traitement de vous-même</strong> avant un soin dentaire : le risque lié à l'arrêt est généralement supérieur au risque de saignement. Signalez-le au dentiste, qui prendra les précautions adaptées et, si nécessaire, contactera votre médecin. Notre article sur les <a href="/blog/anticoagulants-maroc">anticoagulants</a> détaille ces précautions.</p>

<h3>Le soir, le week-end ou pendant les fêtes</h3>

<p>Si la douleur est supportable, les gestes décrits plus haut permettent d'attendre l'ouverture des cabinets. Si un signe d'urgence apparaît — gonflement, fièvre, difficulté à avaler ou à respirer — n'attendez pas : rendez-vous aux urgences de l'hôpital le plus proche ou appelez le <strong>141 (SAMU) ou le 15</strong>. Pour le lendemain, vous pouvez <a href="/specialites/chirurgie-dentaire">rechercher un chirurgien-dentiste par ville</a> et réserver un créneau en ligne.</p>

<h2>Éviter la prochaine rage de dents</h2>

<p>C'est la partie la plus rentable de cet article. La quasi-totalité des rages de dents résulte de lésions qui étaient indolores — donc dépistables — pendant des mois.</p>

<ul>
<li><strong>Brossage deux fois par jour, deux minutes</strong>, avec un dentifrice fluoré. C'est la mesure dont l'efficacité est la mieux établie.</li>
<li><strong>Nettoyage entre les dents</strong> une fois par jour : fil ou brossettes. La brosse seule ne nettoie pas les faces où naissent la plupart des caries.</li>
<li><strong>Réduire la fréquence des prises de sucre</strong> plus encore que la quantité. Un thé très sucré siroté toute la matinée est plus délétère qu'une pâtisserie prise en fin de repas : ce sont les attaques acides répétées qui déminéralisent l'émail. Les boissons gazeuses et les jus industriels agissent de même.</li>
<li><strong>Arrêter le tabac et la chicha</strong> — facteur majeur de parodontite et de perte dentaire. Notre article sur le <a href="/blog/arret-tabac-sevrage-maroc">sevrage tabagique</a> peut aider.</li>
<li><strong>Une visite de contrôle une à deux fois par an</strong>, même sans douleur, avec <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">détartrage</a> selon les besoins. C'est ce qui permet de traiter une carie de l'émail en une séance courte plutôt qu'une pulpite un dimanche soir.</li>
<li><strong>Surveiller les signaux faibles</strong> : <a href="/questions/dent-sensible-au-froid-et-au-chaud-pourquoi-et-comment-la-soulager">dent sensible</a>, <a href="/questions/mes-gencives-saignent-au-brossage-est-ce-une-gingivite-et-que-faire">gencives qui saignent</a>, <a href="/symptomes/mauvaise-haleine">mauvaise haleine</a> persistante, <a href="/questions/je-grince-des-dents-la-nuit-bruxisme-quelles-consequences-et-solutions">grincement nocturne</a>. Ce sont des invitations à consulter, pas des détails.</li>
</ul>

<p>Pour aller plus loin : <a href="/prevenir/carie-dentaire">prévenir la carie dentaire</a>, <a href="/prevenir/gingivite">prévenir les maladies des gencives</a> et notre <a href="/blog/prevention-sante-guide-maroc">guide de la prévention santé</a>.</p>

<h2>En résumé</h2>

<p>Un mal de dents est un signal, pas une maladie en soi. Il indique qu'un tissu de la dent ou de la gencive est atteint, et la seule question utile est de savoir à quelle vitesse il faut agir. Un antalgique et de l'eau salée font passer la nuit ; ils ne referment pas une carie, ne drainent pas un abcès et ne réparent pas une gencive. Devant un gonflement, de la fièvre ou une difficulté à avaler, on ne temporise pas : c'est une urgence. Dans tous les autres cas, une consultation rapide transforme un traitement lourd en soin simple.</p>

<hr>

<p>Une dent qui vous fait souffrir ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a>, consultez les profils vérifiés et les avis patients, et prenez rendez-vous en ligne gratuitement. En présence d'un signe d'urgence — gonflement du visage ou du cou, fièvre, difficulté à respirer ou à avaler — appelez immédiatement le 141 (SAMU) ou le 15.</p>`;

const keyTakeaways = [
  "Une rage de dents traduit le plus souvent une carie qui a atteint le nerf : la douleur peut s'arrêter, l'infection continue.",
  "Un antalgique soulage mais ne soigne pas : seul le chirurgien-dentiste traite la cause.",
  "Urgence immédiate (141 SAMU ou 15) si gonflement du visage ou du cou, fièvre, difficulté à respirer, à avaler ou à ouvrir la bouche.",
  "Ne posez jamais d'aspirine ni de clou de girofle à même la gencive, et ne reprenez pas un antibiotique d'une ancienne ordonnance.",
  "Une douleur dentaire qui dure plus de deux jours impose une consultation, même si elle se calme.",
  "Au Maroc, 92 % des adultes de 35-44 ans sont touchés par la carie : le contrôle annuel et le détartrage restent les gestes les plus rentables.",
];

const faq = [
  {
    q: "Comment soulager une rage de dents rapidement ?",
    a: "Prenez un antalgique simple aux doses de la notice (paracétamol en premier choix, anti-inflammatoire sur avis du pharmacien ou du médecin), faites un bain de bouche à l'eau salée tiède à recracher, appliquez du froid sur la joue à travers un linge, dormez la tête surélevée et mastiquez de l'autre côté. Ces gestes permettent d'attendre le rendez-vous : ils ne soignent pas la dent.",
  },
  {
    q: "Combien de temps dure un mal de dents ?",
    a: "Une sensibilité passagère au froid peut durer quelques jours. En revanche, une douleur dentaire qui dure plus de deux jours, qui réveille la nuit ou qui revient ne se règle pas seule et impose une consultation. Si elle disparaît brutalement sans soin, cela signifie souvent que le nerf est mort : l'infection, elle, poursuit son évolution.",
  },
  {
    q: "Paracétamol ou ibuprofène pour un mal de dents ?",
    a: "Le paracétamol est le premier choix car il est le mieux toléré. Un anti-inflammatoire comme l'ibuprofène agit souvent mieux sur une douleur d'origine inflammatoire, mais il est contre-indiqué ou à éviter dans plusieurs situations (ulcère, maladie rénale, grossesse, asthme, certains traitements). Demandez l'avis de votre pharmacien ou de votre médecin, et respectez les doses de la notice.",
  },
  {
    q: "Faut-il des antibiotiques pour un mal de dents ?",
    a: "Non, pas systématiquement. Le traitement efficace d'une infection dentaire est le geste local réalisé par le dentiste : soin du canal, drainage de l'abcès ou extraction. L'antibiotique n'est prescrit qu'en complément dans certaines situations, et il ne remplace jamais le soin de la dent. Reprendre un antibiotique d'une ancienne ordonnance masque les signes, retarde la prise en charge et favorise la résistance bactérienne.",
  },
  {
    q: "Le clou de girofle est-il efficace contre le mal de dents ?",
    a: "Son principe actif, l'eugénol, a un effet anesthésique local léger et transitoire. Mais l'huile essentielle pure ou le clou appliqué directement sur la gencive provoque une brûlure chimique de la muqueuse, qui ajoute une douleur à la douleur. Ce n'est ni un traitement ni une alternative à la consultation.",
  },
  {
    q: "Pourquoi le mal de dents est-il plus fort la nuit ?",
    a: "En position allongée, l'afflux de sang vers la tête augmente la pression dans la pulpe dentaire, déjà enflammée dans une cavité qui ne peut pas se dilater. Le silence et l'absence de distraction accentuent aussi la perception de la douleur. Dormir avec un oreiller supplémentaire aide réellement.",
  },
  {
    q: "Peut-on avoir mal aux dents sans carie visible ?",
    a: "Oui, et c'est fréquent. Il peut s'agir d'une fêlure, d'une gencive rétractée qui expose le collet, d'une carie sous une ancienne obturation, d'un bruxisme, d'un problème de l'articulation de la mâchoire, d'une sinusite maxillaire ou d'une névralgie du trijumeau. Une radiographie et un examen clinique permettent de trancher.",
  },
  {
    q: "Quand un mal de dents devient-il une urgence ?",
    a: "Dès qu'apparaissent un gonflement du visage, du plancher de la bouche ou du cou, une fièvre élevée, une difficulté à respirer, à avaler ou à parler, une impossibilité d'ouvrir la bouche, ou une douleur incontrôlable malgré les antalgiques. Il faut alors se rendre aux urgences ou appeler le 141 (SAMU) ou le 15. Une dent expulsée après un choc est également une urgence dentaire.",
  },
  {
    q: "Les soins dentaires sont-ils remboursés au Maroc ?",
    a: "L'AMO rembourse une partie des soins dentaires, calculée sur la tarification nationale de référence — actuellement en cours de révision — et non sur le montant réellement facturé, les honoraires étant libres dans le privé. Le reste à charge dépend donc de cet écart. Demandez un devis écrit avant tout traitement prothétique ou implantaire, et une prise en charge préalable lorsqu'elle est exigée.",
  },
];

const sources = [
  { label: "Santé bucco-dentaire — principaux repères", url: "https://www.who.int/fr/news-room/fact-sheets/detail/oral-health", publisher: "Organisation mondiale de la Santé (OMS)", year: "2025" },
  { label: "Symptômes et évolution de la carie dentaire", url: "https://www.ameli.fr/assure/sante/themes/carie-dentaire/symptomes-diagnostic", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Le traitement et l'évolution d'un abcès dentaire", url: "https://www.ameli.fr/assure/sante/themes/abces-dentaire/traitement-abces-dentaire", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Prescription des antibiotiques en pratique bucco-dentaire — recommandations", url: "https://ansm.sante.fr/uploads/2021/02/04/reco-prescription-des-antibiotiques-en-pratique-buccodentaire-septembre2011.pdf", publisher: "ANSM", year: "2011" },
  { label: "Toothache — symptômes, soulagement et signes d'urgence", url: "https://www.nhs.uk/conditions/toothache/", publisher: "National Health Service (NHS)" },
  { label: "Enquête nationale de santé bucco-dentaire : prévalence de la carie au Maroc", url: "https://aujourdhui.ma/societe/les-marocains-negligent-leur-hygiene-bucco-dentaire", publisher: "Ministère de la Santé (via Aujourd'hui le Maroc)", year: "2018" },
];

const ARTICLE = {
  slug: "mal-de-dents-rage-de-dents-maroc",
  categorySlug: "symptomes",
  aboutEntity: "Mal de dents",
  title: "Mal de dents : comment soulager une rage de dents et quand consulter",
  excerpt:
    "Rage de dents : d'où vient la douleur, ce qui la soulage vraiment en attendant le rendez-vous, les erreurs à ne pas commettre, les signes qui imposent les urgences et ce qui se passe chez le dentiste. Un guide complet adapté au Maroc.",
  metaTitle: "Mal de dents : soulager une rage de dents",
  metaDesc:
    "Mal de dents : causes, ce qui soulage vraiment, erreurs à éviter, signes d'urgence et déroulé des soins chez le dentiste. Guide complet adapté au Maroc.",
  // Doit rester ALIGNÉ sur l'entrée MAP de scripts/gen-blog-post-covers.cjs
  // (même slug) : les deux scripts écrivent `coverAlt`.
  coverAlt: "Chirurgien-dentiste soignant une patiente au fauteuil",
};

// Temps de lecture — même formule que lib/article-content.ts (≈200 mots/min).
function calcReadingTime(html) {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return Math.max(1, Math.round(plain.split(" ").filter(Boolean).length / 200));
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.findUnique({ where: { slug: ARTICLE.categorySlug }, select: { id: true } });
  if (!cat) { console.error(`Catégorie « ${ARTICLE.categorySlug} » introuvable.`); process.exit(1); }

  const words = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
  const now = new Date();

  const data = {
    title: ARTICLE.title,
    excerpt: ARTICLE.excerpt,
    content,
    categoryId: cat.id,
    metaTitle: ARTICLE.metaTitle,
    metaDesc: ARTICLE.metaDesc,
    coverAlt: ARTICLE.coverAlt,
    readingTime: calcReadingTime(content),
    keyTakeaways: keyTakeaways.join("\n"),
    faqJson: JSON.stringify(faq),
    sources: JSON.stringify(sources),
    aboutEntity: ARTICLE.aboutEntity,
    reviewedById: admin.id,
    reviewedAt: now,
  };

  const post = await prisma.post.upsert({
    where: { slug: ARTICLE.slug },
    update: data,
    create: { ...data, slug: ARTICLE.slug, authorId: admin.id, status: "PUBLISHED", publishedAt: now },
    select: { slug: true, readingTime: true },
  });

  console.log(`◆ /blog/${post.slug}`);
  console.log(`  ${words} mots · ${post.readingTime} min · ${faq.length} questions FAQ · ${sources.length} sources · ${keyTakeaways.length} points « À retenir »`);
  console.log(`  liens internes : ${(content.match(/href="/g) || []).length}`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
