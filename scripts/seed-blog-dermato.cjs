require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// OUVERTURE DU VERTICAL DERMATOLOGIE — 2 piliers autonomes.
//
// POURQUOI CES DEUX SUJETS : l'annuaire compte 348 dermatologues et le corpus
// blog ne couvrait la dermatologie que par la marge (urticaire, zona, éruption
// cutanée, démangeaisons). « Chute de cheveux » et « acné » sont les deux
// premiers motifs de consultation dermatologique, à fort volume de recherche et
// à concurrence marocaine faible. Les deux articles sont des PILIERS autonomes
// (sujets distincts) : pas de rattachement `pillarId` entre eux.
//
// GARDE-FOUS YMYL :
//  · aucune posologie, aucun protocole de prescription ;
//  · isotrétinoïne : on décrit l'ENCADREMENT réglementaire (prescription
//    dermatologique, prévention des grossesses, tests mensuels) sans jamais
//    donner de doses — information de sécurité, pas de conseil thérapeutique ;
//  · aucun montant en dirhams (lib/prix-reference.ts = source unique) ;
//  · angle marocain assumé sur deux pratiques à risque documentées :
//    dépigmentation volontaire et alopécie de traction (tresses, défrisage).
//
//   node scripts/seed-blog-dermato.cjs
// ════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. CHUTE DE CHEVEUX
// ─────────────────────────────────────────────────────────────────────────────
const cCheveux = `<p>Voir des cheveux sur l'oreiller, dans la brosse ou au fond de la douche inquiète presque tout le monde à un moment. Pourtant, <strong>perdre 50 à 100 cheveux par jour est normal</strong> : le cheveu pousse, se repose, tombe, et repousse. Le vrai sujet n'est donc pas la présence de cheveux dans le peigne, mais la <em>tendance</em> : est-ce que la chevelure s'éclaircit, est-ce que les golfes reculent, est-ce que la raie s'élargit ?</p>

<p>Cet article distingue les chutes passagères des chutes durables, détaille le bilan qu'un médecin réalise, et fait le tri entre les traitements dont l'efficacité est établie et les promesses commerciales. Il complète notre fiche <a href="/symptomes/chute-de-cheveux">chute de cheveux</a> et la question <a href="/questions/je-perds-beaucoup-mes-cheveux-est-ce-normal-et-que-faire">je perds beaucoup mes cheveux, est-ce normal ?</a></p>

<h2>Ce qui est normal, ce qui ne l'est pas</h2>

<p>Chaque cheveu suit un cycle de plusieurs années : une longue phase de croissance, une courte phase de transition, puis une phase de repos au terme de laquelle il tombe pour être remplacé. À tout moment, environ un cheveu sur dix est en fin de cycle — c'est ce renouvellement permanent qui explique la perte quotidienne physiologique.</p>

<p>Doivent en revanche faire consulter :</p>

<ul>
<li>une perte <strong>brutalement plus abondante</strong>, qui dure plus de deux à trois mois ;</li>
<li>un <strong>éclaircissement visible</strong> : cuir chevelu qui se voit au sommet, raie qui s'élargit, queue de cheval qui maigrit ;</li>
<li>un <strong>recul des golfes temporaux</strong> ou une tonsure au vertex chez l'homme ;</li>
<li>des <strong>plaques sans cheveux</strong>, nettes, apparues rapidement ;</li>
<li>une chute accompagnée de <strong>rougeurs, croûtes, douleur ou démangeaisons</strong> du cuir chevelu ;</li>
<li>une chute associée à d'autres signes : fatigue, prise ou perte de poids, règles irrégulières, pilosité inhabituelle.</li>
</ul>

<h2>Les grandes causes</h2>

<table>
<thead>
<tr><th>Cause</th><th>Ce qui la caractérise</th><th>Réversible ?</th></tr>
</thead>
<tbody>
<tr><td><strong>Alopécie androgénétique</strong></td><td>Évolution lente et progressive, terrain familial. Golfes et vertex chez l'homme, éclaircissement diffus du sommet chez la femme</td><td>Non spontanément ; ralentie par un traitement au long cours</td></tr>
<tr><td><strong>Chute réactionnelle</strong></td><td>Perte diffuse et abondante, 2 à 4 mois après un déclencheur : accouchement, fièvre élevée, chirurgie, régime restrictif, choc émotionnel, arrêt d'une contraception</td><td>Oui, le plus souvent en quelques mois</td></tr>
<tr><td><strong>Carences</strong></td><td><a href="/maladies/carence-en-fer">Manque de fer</a>, ferritine basse, apports insuffisants en protéines, régimes déséquilibrés</td><td>Oui, après correction</td></tr>
<tr><td><strong>Causes hormonales</strong></td><td><a href="/maladies/hypothyroidie">Thyroïde</a>, <a href="/maladies/syndrome-des-ovaires-polykystiques">SOPK</a>, ménopause, post-partum</td><td>Souvent, si la cause est traitée</td></tr>
<tr><td><strong>Pelade</strong> (alopécie en aires)</td><td>Plaques rondes, bien limitées, apparition rapide, cuir chevelu lisse</td><td>Souvent, mais évolution capricieuse — avis dermatologique</td></tr>
<tr><td><strong>Alopécie de traction</strong></td><td>Chute localisée aux zones tirées : lisière frontale, tempes. Tresses serrées, extensions, chignons tirés, défrisage, lissage répété</td><td>Oui si on arrête tôt ; définitive si le follicule est détruit</td></tr>
<tr><td><strong>Causes infectieuses</strong></td><td><a href="/maladies/teigne">Teigne</a> chez l'enfant : plaque squameuse avec cheveux cassés courts — contagieuse, à traiter</td><td>Oui, sous traitement</td></tr>
<tr><td><strong>Médicaments et maladies</strong></td><td>Chimiothérapie, certains traitements au long cours, <a href="/maladies/lupus">maladies inflammatoires</a></td><td>Variable, selon la cause</td></tr>
</tbody>
</table>

<h3>Chez l'homme</h3>

<p>La cause dominante est l'alopécie androgénétique, qui peut débuter dès la vingtaine. Le mécanisme est une sensibilité héritée du follicule aux hormones androgènes : le cheveu devient progressivement plus fin, plus court, moins pigmenté, jusqu'à ne plus émerger. Ce n'est pas une maladie du cuir chevelu et cela n'a rien à voir avec l'hygiène — mais l'évolution est <strong>progressive et continue</strong> sans prise en charge, ce qui explique l'intérêt de consulter tôt si l'on souhaite agir.</p>

<h3>Chez la femme</h3>

<p>Trois situations reviennent constamment. La chute du <strong>post-partum</strong>, qui débute deux à quatre mois après l'accouchement et se corrige presque toujours seule en quelques mois — voir notre article sur le <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>. La <strong>carence en fer</strong>, très fréquente chez la femme en âge de procréer, notamment en cas de règles abondantes : voir <a href="/blog/anemie-fer-carence-maroc">anémie par carence en fer</a> et <a href="/blog/aliments-riches-en-fer-maroc">aliments riches en fer</a>. Et les <strong>causes hormonales</strong> : <a href="/blog/hypothyroidie-maroc">hypothyroïdie</a>, <a href="/blog/syndrome-ovaires-polykystiques-sopk-maroc">SOPK</a>, <a href="/blog/menopause-symptomes-solutions-maroc">ménopause</a>. Chez la femme, une chute qui s'accompagne d'acné et d'une pilosité inhabituelle oriente vers un bilan hormonal.</p>

<h3>L'alopécie de traction : un angle trop peu discuté</h3>

<blockquote>Tresses très serrées, extensions, tissages, chignons tirés, défrisage et lissage répétés exercent une tension permanente sur les follicules de la lisière. Le premier signe est un dégarnissement du contour frontal et des tempes, souvent avec de petits boutons douloureux à la racine. Pris tôt, il régresse. Prolongé des années, il devient <strong>définitif</strong> : le follicule est remplacé par du tissu cicatriciel et aucun traitement ne le fait repousser.</blockquote>

<p>Les mesures utiles sont simples : desserrer, alterner les coiffures, espacer les défrisages et les lissages thermiques, éviter de tresser sur cheveux fragilisés, et consulter dès que la lisière recule — pas quand elle a disparu.</p>

<h3>Cheveux couverts : ce qui compte vraiment</h3>

<p>Porter un foulard ne fait pas tomber les cheveux. Ce qui peut poser problème, ce sont deux habitudes associées : <strong>serrer</strong> — attache tendue, chignon tiré, épingles au même endroit tous les jours — et <strong>couvrir des cheveux encore humides</strong>, ce qui entretient une macération favorable aux <a href="/maladies/mycose-cutanee">mycoses</a> et aux irritations du cuir chevelu. Trois réflexes suffisent : sécher avant de couvrir, varier les points de tension et l'emplacement des épingles, et laisser le cuir chevelu respirer quand c'est possible. En cas de <a href="/symptomes/demangeaisons">démangeaisons</a>, de plaques ou d'odeur, il s'agit d'un problème de cuir chevelu à traiter — pas d'une fatalité.</p>

<h2>Le bilan : ce que cherche le médecin</h2>

<p>La démarche commence par un <strong>interrogatoire</strong> précis : depuis quand, comment (diffuse ou en plaques), antécédents familiaux, événements des six derniers mois, régimes, traitements, coiffures habituelles, cycle menstruel. Puis l'<strong>examen du cuir chevelu</strong> et des cheveux, parfois à l'aide d'une loupe éclairante (trichoscopie), qui distingue une chute diffuse d'une alopécie cicatricielle et repère une atteinte inflammatoire.</p>

<p>Selon l'orientation, une <strong>prise de sang</strong> cible ce qui est utile plutôt qu'un bilan tous azimuts : numération et ferritine pour le fer, TSH pour la thyroïde, parfois bilan hormonal chez la femme, vitamine D. Voir notre article <a href="/blog/analyse-de-sang-maroc">prise de sang : déroulé et résultats</a>. Un prélèvement mycologique est réalisé en cas de suspicion de teigne, et une biopsie du cuir chevelu reste réservée aux alopécies cicatricielles ou d'origine incertaine.</p>

<h2>Les traitements : ce qui marche, ce qui ne marche pas</h2>

<h3>D'abord, traiter la cause</h3>

<p>C'est l'étape la plus rentable et la plus souvent négligée. Corriger une carence en fer, équilibrer une thyroïde, prendre en charge un SOPK, arrêter une coiffure traumatisante, laisser passer une chute post-partum : dans tous ces cas, le cheveu repart sans qu'aucun produit capillaire n'y soit pour quelque chose.</p>

<h3>L'alopécie androgénétique</h3>

<p>Des traitements médicamenteux existent, avec un bénéfice réel mais des règles claires : ils se prescrivent après un diagnostic, leurs indications diffèrent selon le sexe et l'âge, le résultat s'évalue sur plusieurs mois, et l'effet <strong>disparaît à l'arrêt</strong> — c'est un traitement d'entretien, pas une cure. Certains sont formellement contre-indiqués en cas de grossesse ou de désir de grossesse. C'est au médecin d'en discuter avec vous, avec les effets indésirables possibles : ni le pharmacien de garde, ni un site de vente en ligne, ni un forum ne peuvent poser cette indication.</p>

<h3>La greffe de cheveux</h3>

<p>La greffe redistribue les cheveux d'une zone donneuse — généralement l'arrière du crâne, moins sensible aux androgènes — vers les zones dégarnies. Elle ne crée pas de cheveux et ne stoppe pas l'évolution de l'alopécie : sans traitement d'entretien, les cheveux d'origine autour de la greffe continuent de s'éclaircir. Elle suppose une zone donneuse suffisante, une alopécie stabilisée, et une évaluation honnête du résultat atteignable. Voir la question <a href="/questions/greffe-de-cheveux-au-maroc-comment-ca-se-passe-et-quel-resultat">greffe de cheveux au Maroc</a>.</p>

<h3>Compléments, huiles et « soins miracles »</h3>

<ul>
<li><strong>Les compléments alimentaires</strong> n'ont d'intérêt démontré que s'il existe une carence : supplémenter du fer sans carence ne fait pas repousser les cheveux et n'est pas anodin.</li>
<li><strong>Les huiles et massages</strong> peuvent améliorer le confort du cuir chevelu et l'aspect du cheveu ; ils ne modifient pas une alopécie androgénétique.</li>
<li><strong>Les shampooings « anti-chute »</strong> agissent sur le lavage, pas sur le cycle du cheveu. En cas de <a href="/questions/pellicules-et-cuir-chevelu-qui-demange-que-faire-pour-s-en-debarrasser">pellicules et démangeaisons</a>, un traitement adapté du cuir chevelu est utile — c'est une autre question que la chute.</li>
<li><strong>Méfiance sur les protocoles vendus en ligne</strong> sans consultation ni diagnostic, et sur les préparations dont la composition n'est pas connue.</li>
</ul>

<h2>Quand consulter</h2>

<p>Sans attendre, en cas de plaques sans cheveux, de cuir chevelu rouge, douloureux ou croûteux, de chute chez un enfant, ou d'une chute qui s'accompagne de signes généraux. Rapidement aussi si la lisière recule sur des zones tressées ou défrisées, parce que la fenêtre de réversibilité se referme. Et sans dramatiser, mais sans attendre non plus, si l'éclaircissement progresse : <strong>les traitements freinent l'évolution, ils ne ressuscitent pas un follicule disparu</strong>. Notre page <a href="/quel-medecin-pour/chute-de-cheveux">quel médecin consulter pour une chute de cheveux</a> précise vers qui vous tourner, et <a href="/comment-traiter/chute-de-cheveux">comment traiter une chute de cheveux</a> résume le parcours.</p>

<h2>En résumé</h2>

<p>Perdre des cheveux chaque jour est normal ; voir sa chevelure s'éclaircir ne l'est pas. La bonne démarche est d'identifier le mécanisme avant d'acheter quoi que ce soit : une chute réactionnelle se corrige seule, une carence se comble, une cause hormonale se traite, une alopécie de traction s'arrête en changeant de coiffure, et une alopécie androgénétique se ralentit — à condition de commencer tôt et de continuer.</p>

<hr>

<p>Une chute qui dure ou une lisière qui recule ? Sur SantéauMaroc, <a href="/specialites/dermatologie">trouvez un dermatologue près de chez vous</a>, consultez les profils vérifiés et les avis patients, et prenez rendez-vous en ligne gratuitement.</p>`;

const cheveuxTk = [
  "Perdre 50 à 100 cheveux par jour est normal : ce qui compte est l'éclaircissement, pas les cheveux dans le peigne.",
  "Une chute diffuse survenant 2 à 4 mois après un accouchement, une fièvre, un régime ou un choc est réactionnelle et se corrige presque toujours seule.",
  "Chez la femme, penser d'abord carence en fer, thyroïde, SOPK, post-partum et ménopause.",
  "Tresses serrées, extensions et défrisages répétés provoquent une alopécie de traction : réversible au début, définitive après des années.",
  "Les traitements de l'alopécie androgénétique freinent l'évolution mais perdent leur effet à l'arrêt ; certains sont contre-indiqués en cas de grossesse.",
  "Plaques sans cheveux, cuir chevelu rouge ou douloureux, chute chez l'enfant : avis médical sans attendre.",
];

const cheveuxFaq = [
  { q: "Combien de cheveux perd-on normalement par jour ?", a: "Entre 50 et 100, parce que chaque cheveu suit un cycle et qu'environ un sur dix est en fin de cycle à tout moment. La perte augmente naturellement à certaines périodes, notamment aux changements de saison. Le signe à surveiller n'est pas le nombre de cheveux tombés mais l'éclaircissement de la chevelure." },
  { q: "Le stress fait-il vraiment tomber les cheveux ?", a: "Un choc émotionnel ou un stress intense peut déclencher une chute diffuse, qui apparaît typiquement deux à quatre mois après l'événement et se corrige le plus souvent seule en quelques mois. Le stress chronique, lui, aggrave plutôt qu'il ne cause. Voir notre article sur la gestion du stress." },
  { q: "Ma chute de cheveux après l'accouchement est-elle normale ?", a: "Oui, c'est l'une des chutes les plus fréquentes : la baisse hormonale fait basculer d'un coup de nombreux cheveux en fin de cycle, deux à quatre mois après la naissance. Elle est spectaculaire mais transitoire et régresse en général en quelques mois. Un bilan de fer est utile si la fatigue s'y ajoute." },
  { q: "Une carence en fer peut-elle faire tomber les cheveux ?", a: "Oui, et c'est une cause très fréquente chez la femme, en particulier en cas de règles abondantes ou d'alimentation pauvre en fer. Le dosage de la ferritine permet de l'objectiver. Attention toutefois : se supplémenter en fer sans carence prouvée n'a aucun bénéfice sur les cheveux et n'est pas sans risque." },
  { q: "Les tresses et le défrisage abîment-ils les cheveux ?", a: "Ils peuvent provoquer une alopécie de traction : la tension permanente sur les follicules de la lisière frontale et des tempes finit par les détruire. Le premier signe est un contour qui recule, parfois avec de petits boutons à la racine. Pris tôt, cela régresse ; prolongé des années, le résultat devient définitif." },
  { q: "Les compléments alimentaires font-ils repousser les cheveux ?", a: "Uniquement s'ils corrigent une carence réelle — fer, protéines, certaines vitamines. En l'absence de carence, aucun complément n'a démontré qu'il faisait repousser les cheveux, et certains dosages élevés sont déconseillés. Mieux vaut un bilan ciblé qu'une supplémentation à l'aveugle." },
  { q: "La greffe de cheveux est-elle une solution définitive ?", a: "Elle déplace des cheveux d'une zone donneuse vers une zone dégarnie, mais elle n'en crée pas et n'arrête pas l'évolution de l'alopécie : les cheveux d'origine autour de la greffe continuent de s'éclaircir sans traitement d'entretien. Elle suppose une alopécie stabilisée, une zone donneuse suffisante et des attentes réalistes." },
  { q: "Quand faut-il consulter pour une chute de cheveux ?", a: "Sans attendre en cas de plaques sans cheveux, de cuir chevelu rouge, croûteux ou douloureux, de chute chez un enfant, ou de signes associés comme une fatigue marquée ou des règles irrégulières. Et sans trop tarder si la chevelure s'éclaircit : les traitements ralentissent l'évolution mais ne font pas revenir un follicule disparu." },
];

const cheveuxSources = [
  { label: "Hair loss — causes, types d'alopécie et prise en charge", url: "https://www.nhs.uk/conditions/hair-loss/", publisher: "National Health Service (NHS)" },
  { label: "Pilosité de la femme : ce qui est normal, ce qui l'est moins (hyperandrogénie, SOPK)", url: "https://www.ameli.fr/assure/sante/themes/pilosite-excessive-femme/definition-formes-causes", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Prise en charge des perruques et accessoires capillaires", url: "https://www.ameli.fr/assure/remboursements/rembourse/medicaments-vaccins-dispositifs-medicaux/remboursement-perruques", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Aménorrhée et troubles du cycle : quelles causes ?", url: "https://www.ameli.fr/assure/sante/themes/retard-absence-de-regles-ou-amenorrhee/amenorrhee-regles-retard-absence-0", publisher: "Assurance Maladie (ameli.fr)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. ACNÉ
// ─────────────────────────────────────────────────────────────────────────────
const cAcne = `<p>L'acné n'est pas un défaut d'hygiène, ni une fatalité de l'adolescence qu'il faudrait « attendre ». C'est une <strong>maladie inflammatoire du follicule pilo-sébacé</strong>, fréquente, traitable, et dont la prise en charge précoce a un enjeu très concret : éviter les cicatrices, qui sont bien plus difficiles à corriger que les boutons eux-mêmes.</p>

<p>Cet article explique le mécanisme, distingue les formes selon leur gravité, liste les gestes qui aggravent — dont deux très répandus au Maroc — et décrit les traitements réellement efficaces ainsi que leur encadrement. Il complète notre fiche <a href="/maladies/acne">acné</a> et la question <a href="/questions/comment-traiter-l-acne-de-l-adolescent">comment traiter l'acné de l'adolescent</a>.</p>

<h2>Ce qui provoque l'acné</h2>

<p>Chaque pore de la peau abrite un follicule pilo-sébacé : un poil et une glande sébacée qui produit le sébum, film protecteur naturel. Quatre mécanismes s'enchaînent :</p>

<ol>
<li><strong>Une production excessive de sébum</strong> (hyperséborrhée), sous influence hormonale — d'où le pic à l'adolescence et les poussées liées au cycle chez la femme. La peau devient brillante et grasse sur le front, le nez, les joues, le menton.</li>
<li><strong>Un bouchon de kératine</strong> obstrue le canal : c'est le comédon, ouvert (point noir) ou fermé (microkyste blanchâtre).</li>
<li><strong>Une prolifération bactérienne</strong> dans ce milieu fermé et riche en sébum.</li>
<li><strong>Une inflammation</strong> : le bouton rouge (papule), le bouton à tête blanche (pustule), puis dans les formes sévères le nodule et le kyste profonds — ceux qui laissent des cicatrices.</li>
</ol>

<p>Deux idées reçues méritent d'être écartées. L'acné n'est <strong>pas</strong> un problème de propreté : se laver plus souvent ou plus fort agresse la barrière cutanée et aggrave l'inflammation. Et aucun aliment isolé n'a été identifié comme cause : les données actuelles suggèrent un effet modeste des régimes très sucrés à index glycémique élevé, sans rien de comparable à l'influence hormonale et génétique.</p>

<h2>Les formes, et pourquoi la distinction compte</h2>

<table>
<thead>
<tr><th>Forme</th><th>Ce qu'on voit</th><th>Risque de cicatrices</th></tr>
</thead>
<tbody>
<tr><td><strong>Rétentionnelle</strong></td><td>Points noirs et microkystes, peau grasse, peu de rougeur</td><td>Faible</td></tr>
<tr><td><strong>Inflammatoire légère à modérée</strong></td><td>Papules et pustules rouges, sur une partie du visage</td><td>Modéré</td></tr>
<tr><td><strong>Sévère, nodulaire ou kystique</strong></td><td>Lésions profondes, douloureuses, étendues au dos et au torse</td><td><strong>Élevé</strong> — avis dermatologique rapide</td></tr>
</tbody>
</table>

<p>Cette distinction commande le traitement : une acné rétentionnelle relève de soins locaux, une acné sévère justifie un traitement général sans attendre, parce que chaque mois d'inflammation profonde laisse des marques définitives.</p>

<h2>Les erreurs qui aggravent</h2>

<ul>
<li><strong>Percer et gratter.</strong> C'est le raccourci le plus coûteux : l'inflammation s'aggrave, le risque de cicatrice et de tache pigmentaire augmente nettement, surtout sur les peaux foncées.</li>
<li><strong>Décaper la peau</strong> : savons agressifs, gommages répétés, alcool. La barrière cutanée s'abîme et la glande sébacée compense.</li>
<li><strong>Les crèmes éclaircissantes</strong> pour effacer les taches. Beaucoup contiennent des dérivés cortisonés ou de l'hydroquinone à forte dose : elles provoquent une acné induite, un amincissement de la peau, des taches paradoxales, et des complications générales quand l'usage est prolongé sur de grandes surfaces. Voir <a href="/questions/les-cremes-eclaircissantes-pour-la-peau-sont-elles-dangereuses">les crèmes éclaircissantes sont-elles dangereuses ?</a></li>
<li><strong>Les crèmes à la cortisone utilisées sans prescription</strong> : effet flatteur en quelques jours, rebond et aggravation ensuite. Voir <a href="/blog/corticoides-maroc">corticoïdes : bon usage</a>.</li>
<li><strong>Les cosmétiques occlusifs</strong> et les fonds de teint épais qui ferment les pores ; préférer les produits non comédogènes.</li>
<li><strong>Arrêter le traitement trop tôt.</strong> Un traitement anti-acné s'évalue sur deux à trois mois, et une phase d'irritation initiale ne signifie pas qu'il ne marche pas.</li>
<li><strong>Les antibiotiques pris seuls, longtemps, sans avis.</strong> Voir <a href="/blog/antibiotiques-maroc">le bon usage des antibiotiques</a>.</li>
</ul>

<h2>Les traitements</h2>

<h3>Les soins de base, pour tout le monde</h3>

<p>Un nettoyage doux une à deux fois par jour avec un produit adapté, une hydratation non comédogène, une protection solaire — plusieurs traitements anti-acné rendent la peau photosensible — et de la patience. Ces mesures ne suffisent pas seules dans les formes inflammatoires, mais aucun traitement ne fonctionne bien sans elles. Voir <a href="/questions/comment-se-proteger-du-soleil-au-maroc-et-prevenir-le-cancer-de">comment se protéger du soleil au Maroc</a>.</p>

<h3>Les traitements locaux</h3>

<p>Ils constituent la base des formes légères à modérées et agissent sur le bouchon, la bactérie et l'inflammation. Ils demandent une application régulière et prolongée, avec une irritation initiale fréquente qui s'atténue. C'est le médecin qui choisit la molécule, la concentration et le rythme selon le type de peau et la forme d'acné.</p>

<h3>Les traitements par voie orale</h3>

<p>Dans les formes inflammatoires résistantes aux traitements locaux, un traitement oral est ajouté, sur une durée limitée et sous surveillance. Chez la femme, une prise en charge hormonale est parfois discutée quand l'acné s'inscrit dans un tableau plus large — voir <a href="/blog/syndrome-ovaires-polykystiques-sopk-maroc">SOPK</a>.</p>

<h3>L'isotrétinoïne : très efficace, très encadrée</h3>

<blockquote>Réservée aux acnés sévères ou résistantes, l'isotrétinoïne orale change le pronostic de formes qui laisseraient sinon des cicatrices majeures. Son encadrement est strict et non négociable : <strong>prescription initiale par un dermatologue</strong>, information écrite, surveillance biologique, et chez la femme en âge de procréer un <strong>programme de prévention des grossesses</strong> — contraception efficace débutée avant le traitement, tests de grossesse avant, chaque mois pendant, puis après l'arrêt. Le risque de malformations en cas de grossesse sous traitement est majeur. Ce médicament ne se partage jamais, ne s'achète pas sans ordonnance et ne se reprend pas sur une ancienne prescription.</blockquote>

<h2>Les cicatrices : prévenir d'abord</h2>

<p>Deux marques différentes sont souvent confondues. Les <strong>taches pigmentaires</strong> rouges ou brunes qui suivent un bouton ne sont pas des cicatrices : elles s'estompent en quelques mois, plus lentement sur les peaux foncées, et la photoprotection accélère leur disparition. Les <strong>vraies cicatrices</strong>, en creux ou en relief, correspondent à une perte de tissu et ne disparaissent pas seules.</p>

<p>Leur traitement — peelings, lasers, micro-needling, injections — améliore l'aspect sans effacer complètement, se discute sur une acné stabilisée, et demande plusieurs séances. Autrement dit : le meilleur traitement des cicatrices reste le traitement précoce de l'acné. Voir <a href="/questions/cicatrices-d-acne-quels-traitements-marchent-vraiment-pour-les-attenue">quels traitements marchent vraiment contre les cicatrices d'acné</a>.</p>

<h2>Situations particulières</h2>

<ul>
<li><strong>L'acné de la femme adulte</strong>, souvent localisée au bas du visage, mâchoire et menton, avec des poussées prémenstruelles. Elle justifie un bilan si elle s'accompagne de règles irrégulières, d'une pilosité inhabituelle ou d'une <a href="/blog/chute-de-cheveux-maroc">chute de cheveux</a>.</li>
<li><strong>Pendant la grossesse</strong> : plusieurs traitements anti-acné sont contre-indiqués, y compris certains produits locaux. Signalez toute grossesse ou tout projet de grossesse avant de commencer ou de poursuivre un traitement — voir <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>.</li>
<li><strong>Chez l'adolescent</strong> : l'impact psychologique est réel et ne doit pas être minimisé. Une acné qui retentit sur l'humeur, les relations ou la scolarité est en soi une raison de consulter, quelle que soit son étendue.</li>
<li><strong>Le sport et la transpiration</strong> n'aggravent pas l'acné en eux-mêmes ; une douche après l'effort et des vêtements respirants suffisent.</li>
</ul>

<h2>L'acné du dos et du torse</h2>

<p>Elle est plus fréquente chez l'homme et l'adolescent, et souvent négligée parce qu'elle se voit moins. C'est une erreur : les lésions y sont volontiers plus profondes et plus inflammatoires, donc plus cicatricielles, et la peau du dos est plus épaisse — ce qui rend les traitements locaux moins commodes et fait recourir plus vite à un traitement général. Quelques mesures aident : doucher après le sport, éviter les vêtements serrés et non respirants sur une peau moite, laver les tenues de sport après chaque usage, et ne pas frotter les lésions avec des gants de crin ou des gommages abrasifs.</p>

<h2>Lire une étiquette de cosmétique</h2>

<p>Le mot à chercher est <strong>« non comédogène »</strong>, et le réflexe utile est la simplicité : moins de produits, textures fluides plutôt qu'occlusives, et une introduction un produit à la fois pour identifier ce qui déclenche une poussée. Les huiles végétales pures appliquées largement sur le visage, les baumes épais et les fonds de teint couvrants entretiennent souvent l'acné rétentionnelle. Un point souvent oublié : ce qui touche le visage compte aussi — téléphone, taies d'oreiller, casque, mains.</p>

<h2>L'acné du nouveau-né et du jeune enfant</h2>

<p>De petits boutons sur le visage d'un nouveau-né dans les premières semaines sont fréquents et bénins : ils régressent seuls, sans traitement ni produit particulier, et ne préjugent en rien de l'acné à l'adolescence. En revanche, une acné qui apparaît chez un enfant plus grand, avant la puberté, n'est pas banale : elle justifie un avis médical, notamment pour rechercher une cause hormonale ou l'application de produits inadaptés. Voir notre <a href="/blog/sante-enfant-guide-maroc">guide de la santé de l'enfant</a>.</p>

<h2>Quand consulter un dermatologue</h2>

<p>Sans attendre en cas de lésions profondes, douloureuses, étendues au dos ou au torse, ou de premières cicatrices. Également si les soins bien conduits ne donnent rien après deux à trois mois, si l'acné revient dès l'arrêt du traitement, si elle apparaît ou s'aggrave à l'âge adulte, ou si elle pèse sur le moral. Notre page <a href="/quel-medecin-pour/acne">quel médecin consulter pour l'acné</a> et <a href="/comment-traiter/acne">comment traiter l'acné</a> résument le parcours.</p>

<h2>En résumé</h2>

<p>L'acné se traite, et se traite mieux tôt. La logique est la même à tous les stades : ne pas percer, ne pas décaper, ne pas se soigner avec des crèmes éclaircissantes ou cortisonées, tenir un traitement assez longtemps pour le juger, et consulter dès que les lésions sont profondes ou qu'une cicatrice apparaît. Ce qui est irréversible n'est pas le bouton, c'est la cicatrice qu'il laisse.</p>

<hr>

<p>Une acné qui résiste ou qui laisse des marques ? Sur SantéauMaroc, <a href="/specialites/dermatologie">trouvez un dermatologue près de chez vous</a>, consultez les profils vérifiés et les avis patients, et prenez rendez-vous en ligne gratuitement.</p>`;

const acneTk = [
  "L'acné est une maladie inflammatoire du follicule, pas un défaut d'hygiène : se laver plus fort l'aggrave.",
  "Ce qui est irréversible n'est pas le bouton mais la cicatrice : une acné nodulaire ou kystique justifie un avis dermatologique rapide.",
  "Ne jamais percer : c'est le principal facteur de cicatrices et de taches, surtout sur peau foncée.",
  "Crèmes éclaircissantes et crèmes à la cortisone sans prescription induisent et aggravent l'acné.",
  "Un traitement anti-acné s'évalue sur 2 à 3 mois ; l'irritation initiale n'est pas un échec.",
  "L'isotrétinoïne est très efficace mais strictement encadrée : prescription dermatologique, contraception et tests de grossesse obligatoires chez la femme en âge de procréer.",
];

const acneFaq = [
  { q: "L'acné est-elle liée à un manque d'hygiène ?", a: "Non. C'est une maladie inflammatoire du follicule pilo-sébacé, déterminée surtout par les hormones et le terrain génétique. Se laver plus souvent ou avec des produits agressifs abîme la barrière cutanée et aggrave l'inflammation. Un nettoyage doux une à deux fois par jour suffit." },
  { q: "Le chocolat et les aliments gras donnent-ils des boutons ?", a: "Aucun aliment isolé n'a été démontré comme cause de l'acné. Les données actuelles suggèrent un effet modeste des alimentations très sucrées à index glycémique élevé, sans commune mesure avec le rôle des hormones. Une alimentation équilibrée est utile pour la santé globale, ce n'est pas un traitement de l'acné." },
  { q: "Faut-il percer ses boutons ?", a: "Non, jamais. Percer aggrave l'inflammation, augmente nettement le risque de cicatrice définitive et de tache pigmentaire, particulièrement sur les peaux foncées, et peut surinfecter la lésion. L'extraction de certains microkystes se fait au cabinet, avec un matériel adapté." },
  { q: "Combien de temps faut-il pour qu'un traitement anti-acné agisse ?", a: "Il faut compter deux à trois mois pour juger un traitement, avec souvent une phase d'irritation ou une aggravation apparente les premières semaines. Arrêter au bout de dix jours parce que « ça ne marche pas » est l'erreur la plus fréquente. Un traitement d'entretien est ensuite souvent nécessaire." },
  { q: "Les crèmes éclaircissantes peuvent-elles effacer les taches d'acné ?", a: "Elles sont surtout dangereuses. Beaucoup contiennent des dérivés cortisonés ou de l'hydroquinone à forte dose, qui induisent une acné, amincissent la peau, provoquent des taches paradoxales et, en usage prolongé sur de grandes surfaces, des complications générales. Les taches post-acné s'estompent seules avec une bonne photoprotection." },
  { q: "Le soleil améliore-t-il l'acné ?", a: "Il donne une impression d'amélioration à court terme, en masquant les rougeurs et en asséchant la peau, suivie d'une aggravation quelques semaines plus tard. Par ailleurs, plusieurs traitements anti-acné rendent la peau photosensible : la protection solaire fait partie du traitement, pas du confort." },
  { q: "L'isotrétinoïne est-elle dangereuse ?", a: "C'est un traitement très efficace des acnés sévères, mais strictement encadré : prescription initiale par un dermatologue, surveillance biologique, et chez la femme en âge de procréer contraception efficace et tests de grossesse avant, pendant chaque mois et après l'arrêt, en raison d'un risque majeur de malformations. Il ne se partage jamais et ne se reprend pas sur une ancienne ordonnance." },
  { q: "Pourquoi ai-je de l'acné à 30 ans ?", a: "L'acné de la femme adulte est fréquente, souvent localisée au bas du visage avec des poussées avant les règles. Elle peut être favorisée par des facteurs hormonaux, certains cosmétiques ou médicaments. Un bilan est justifié si elle s'accompagne de règles irrégulières, d'une pilosité inhabituelle ou d'une chute de cheveux." },
];

const acneSources = [
  { label: "Définition, symptômes et évolution de l'acné", url: "https://www.ameli.fr/assure/sante/themes/acne/definition-symptomes-evolution", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Acné : consultation et traitement", url: "https://www.ameli.fr/assure/sante/themes/acne/traitement", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Acné : que faire et quand consulter ?", url: "https://www.ameli.fr/assure/sante/themes/acne/bons-reflexes-bons-gestes", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Traitement contre l'acné : règles de bon usage de l'isotrétinoïne pour limiter les risques", url: "https://ansm.sante.fr/actualites/traitement-contre-lacne-regles-de-bon-usage-de-lisotretinoine-pour-limiter-les-risques", publisher: "ANSM" },
  { label: "Isotrétinoïne orale et traitement de l'acné sévère : actions pour réduire les risques", url: "https://ansm.sante.fr/dossiers-thematiques/isotretinoine-orale-et-traitement-de-lacne-severe/les-actions-mises-en-oeuvre-pour-reduire-les-risques-associes-a-lisotretinoine", publisher: "ANSM" },
];

// ─────────────────────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    slug: "chute-de-cheveux-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Alopécie",
    title: "Chute de cheveux : causes, bilan et traitements qui marchent vraiment",
    excerpt:
      "Perdre 50 à 100 cheveux par jour est normal. Comment distinguer une chute passagère d'une alopécie durable, quel bilan permet d'en trouver la cause, et ce qu'on peut réellement attendre des traitements. Un guide complet adapté au Maroc.",
    metaTitle: "Chute de cheveux : causes et solutions",
    metaDesc:
      "Chute de cheveux : ce qui est normal, les causes (hormones, fer, traction, pelade), le bilan utile et les traitements. Adapté au Maroc.",
    coverAlt: "Peigne portant des cheveux tombés",
    content: cCheveux, keyTakeaways: cheveuxTk, faq: cheveuxFaq, sources: cheveuxSources,
  },
  {
    slug: "acne-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Acné",
    title: "Acné : comprendre, traiter et éviter les cicatrices",
    excerpt:
      "L'acné n'est pas un défaut d'hygiène et ne se règle pas en attendant. Le mécanisme, les formes selon leur gravité, les gestes qui aggravent, les traitements efficaces et leur encadrement, et comment éviter les cicatrices. Guide adapté au Maroc.",
    metaTitle: "Acné : traitements et erreurs à éviter",
    metaDesc:
      "Acné : causes réelles, erreurs qui aggravent (percer, crèmes éclaircissantes), traitements, isotrétinoïne encadrée et cicatrices. Au Maroc.",
    coverAlt: "Visage présentant des lésions d'acné inflammatoire sur la joue",
    content: cAcne, keyTakeaways: acneTk, faq: acneFaq, sources: acneSources,
  },
];

function words(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const catId = (s) => {
    const c = cats.find((x) => x.slug === s);
    if (!c) throw new Error(`Catégorie « ${s} » introuvable.`);
    return c.id;
  };

  const now = new Date();
  for (const art of ARTICLES) {
    const n = words(art.content);
    const data = {
      title: art.title, excerpt: art.excerpt, content: art.content, categoryId: catId(art.categorySlug),
      metaTitle: art.metaTitle, metaDesc: art.metaDesc, coverAlt: art.coverAlt,
      readingTime: Math.max(1, Math.round(n / 200)),
      keyTakeaways: art.keyTakeaways.join("\n"),
      faqJson: JSON.stringify(art.faq),
      sources: JSON.stringify(art.sources),
      aboutEntity: art.aboutEntity,
      reviewedById: admin.id, reviewedAt: now,
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
  console.log(`\nVertical dermatologie ouvert : ${ARTICLES.length} piliers.`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
