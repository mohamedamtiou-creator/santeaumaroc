require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie SYMPTÔMES — LOT 4 (catégorie créée par seed-blog-symptomes.cjs).
// Gabarit Symptôme + FAQ + À retenir. Rappel : seul un médecin diagnostique.
//   • Jambes gonflées (œdème) → cardiologie
//   • Insomnie                → médecine générale (repli)
//   • Éruption cutanée        → dermatologie
//   • Douleur articulaire     → médecine générale (repli)
//   • Saignement de nez       → médecine générale (repli)
//   • Ballonnements           → gastro-entérologie
// ════════════════════════════════════════════════════════════════════════════

const cJambes = `<p>Des jambes ou des chevilles qui gonflent, surtout en fin de journée, sont fréquentes et souvent sans gravité. Mais un gonflement (œdème) peut aussi révéler un problème de cœur, de veines ou de reins. Savoir distinguer les situations aide à réagir au bon moment.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Station debout ou assise prolongée, chaleur</li>
<li>Insuffisance veineuse (voir <a href="/blog/varices-maroc">varices</a>)</li>
<li>Grossesse, certains médicaments</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li>Insuffisance cardiaque, maladie des reins ou du foie (œdème des deux jambes)</li>
<li><strong>Phlébite</strong> : gonflement d'<strong>une seule</strong> jambe, avec douleur, chaleur, rougeur</li>
</ul>
<blockquote>Attention : un gonflement brutal d'une seule jambe, douloureuse et chaude, évoque une phlébite (caillot) — urgence. Un gonflement avec essoufflement ou douleur dans la poitrine impose aussi d'appeler les secours.</blockquote>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Surélever les jambes, marcher régulièrement, éviter la station immobile prolongée.</li>
<li>Porter une contention si conseillée, limiter le sel.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Si le gonflement persiste, touche les deux jambes durablement, s'accompagne d'essoufflement, de prise de poids rapide, ou revient sans explication.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Gonflement d'une seule jambe douloureuse et chaude (phlébite), ou gonflement avec essoufflement, douleur thoracique ou malaise.</p>

<h2>Quels examens possibles ?</h2>
<p>Selon le contexte : examen clinique, <a href="/blog/echo-doppler-maroc">écho-doppler</a> des veines, prise de sang, <a href="/blog/electrocardiogramme-ecg-maroc">ECG</a> et échographie du cœur.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent de la cause : contention et mesures veineuses, traitement d'une insuffisance cardiaque ou rénale, anticoagulants en cas de phlébite. <strong>Seul un médecin peut poser un diagnostic.</strong></p>

<hr>
<p>Des jambes qui gonflent sans explication ? Sur SantéauMaroc, trouvez un médecin près de chez vous. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;
const jambesFaq = [
  { q: "Pourquoi mes jambes gonflent-elles le soir ?", a: "Le plus souvent à cause d'une insuffisance veineuse, d'une station debout ou assise prolongée et de la chaleur, qui font stagner le sang et l'eau dans les jambes. Surélever les jambes et marcher aident. Un gonflement qui persiste ou s'aggrave doit faire consulter." },
  { q: "Quand un gonflement des jambes est-il grave ?", a: "Quand il touche une seule jambe, douloureuse et chaude (phlébite, une urgence), ou qu'il s'accompagne d'essoufflement, d'une douleur thoracique ou d'une prise de poids rapide (cœur, reins). Ces situations imposent de consulter, voire d'appeler les secours." },
  { q: "Qu'est-ce qu'une phlébite ?", a: "C'est la formation d'un caillot dans une veine profonde, généralement de la jambe, qui gonfle, devient douloureuse, chaude et rouge. C'est une urgence car le caillot peut migrer vers les poumons (embolie pulmonaire). Il faut consulter sans attendre." },
  { q: "Comment réduire des jambes gonflées à la maison ?", a: "En surélevant les jambes, en marchant régulièrement, en évitant la station immobile prolongée et la chaleur, en portant une contention si elle est conseillée et en limitant le sel. Si le gonflement persiste, un avis médical est nécessaire." },
  { q: "Le gonflement des deux jambes est-il inquiétant ?", a: "Il est souvent lié aux veines ou à la position, mais un gonflement des deux jambes durable, surtout avec essoufflement ou prise de poids, peut traduire un problème de cœur, de reins ou de foie et justifie une consultation." },
];
const jambesTk = [
  "Un gonflement des jambes le soir est souvent veineux et bénin.",
  "Œdème des deux jambes durable : penser cœur, reins, foie.",
  "Une seule jambe gonflée, chaude et douloureuse = phlébite, urgence.",
  "À la maison : surélever les jambes, marcher, contention, moins de sel.",
];

const cInsomnie = `<p>L'insomnie — difficulté à s'endormir, réveils nocturnes ou réveil trop précoce — touche presque tout le monde à un moment. Passagère, elle est banale ; installée, elle retentit sur la journée et mérite d'en chercher la cause plutôt que de recourir d'emblée aux somnifères.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Stress, anxiété, <a href="/blog/depression-maroc">dépression</a></li>
<li>Mauvaises habitudes (écrans, caféine le soir, horaires irréguliers)</li>
<li>Douleurs, environnement bruyant, âge</li>
</ul>

<h2>Les causes à explorer</h2>
<ul>
<li>Apnées du sommeil (ronflements, fatigue au réveil)</li>
<li>Syndrome des jambes sans repos, hyperthyroïdie, certains médicaments</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Horaires réguliers, chambre calme et sombre, sans écrans avant le coucher.</li>
<li>Éviter café, thé et repas lourds le soir ; s'exposer à la lumière du jour.</li>
<li>Se lever si l'on ne dort pas plutôt que de rester à ruminer.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Si l'insomnie dure plusieurs semaines, retentit sur la journée (fatigue, humeur, concentration), ou s'accompagne de ronflements avec pauses respiratoires ou d'un moral en berne.</p>

<h2>Prudence avec les somnifères</h2>
<blockquote>Attention : les somnifères ne traitent pas la cause et exposent à une dépendance, à des chutes (surtout chez le senior) et à des troubles de la mémoire. Ils ne doivent être utilisés que ponctuellement, sur avis médical.</blockquote>

<h2>Quels examens et traitements ?</h2>
<p>Selon le contexte : bilan de la cause, parfois enregistrement du sommeil. Les approches non médicamenteuses (thérapies du sommeil) sont très efficaces. <strong>Seul un médecin peut poser un diagnostic.</strong></p>

<hr>
<p>Un sommeil qui ne revient pas ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const insomnieFaq = [
  { q: "Que faire contre l'insomnie ?", a: "Adopter des horaires réguliers, une chambre calme et sombre, éviter les écrans, la caféine et les repas lourds le soir, s'exposer à la lumière du jour, et se lever si l'on ne dort pas plutôt que de ruminer. Si cela persiste, consulter pour en chercher la cause." },
  { q: "Quand l'insomnie doit-elle faire consulter ?", a: "Quand elle dure plusieurs semaines, retentit sur la journée (fatigue, humeur, concentration), ou s'accompagne de ronflements avec pauses respiratoires ou d'un moral en berne. Le médecin recherche alors la cause et propose une prise en charge adaptée." },
  { q: "Les somnifères sont-ils une bonne solution ?", a: "Ils ne traitent pas la cause et exposent à une dépendance, à des chutes (surtout chez le senior) et à des troubles de la mémoire. Ils ne doivent être pris que ponctuellement, sur avis médical. Les thérapies du sommeil sont plus efficaces sur le long terme." },
  { q: "L'anxiété peut-elle causer une insomnie ?", a: "Oui, le stress, l'anxiété et la dépression sont des causes très fréquentes d'insomnie, avec des difficultés d'endormissement et des ruminations. Traiter la cause psychologique améliore souvent nettement le sommeil." },
  { q: "Combien d'heures de sommeil faut-il ?", a: "En moyenne 7 à 9 heures chez l'adulte, mais les besoins varient d'une personne à l'autre. L'important est de se sentir reposé dans la journée. Un sommeil un peu plus court ou fragmenté n'est pas forcément pathologique." },
];
const insomnieTk = [
  "L'insomnie passagère est banale ; installée, elle justifie d'en chercher la cause.",
  "Causes fréquentes : stress, anxiété, dépression, mauvaises habitudes.",
  "À explorer : apnées du sommeil, jambes sans repos, thyroïde.",
  "Prudence avec les somnifères : ponctuels et sur avis médical seulement.",
];

const cEruption = `<p>Une éruption cutanée — boutons, plaques, rougeurs — est un motif de consultation très courant. La plupart sont bénignes, mais certaines, surtout avec de la fièvre ou un mauvais état général, doivent faire consulter rapidement.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Eczéma, <a href="/blog/urticaire-maroc">urticaire</a>, acné</li>
<li>Allergie ou réaction à un médicament</li>
<li>Infections (varicelle, autres maladies éruptives), piqûres, mycoses</li>
</ul>

<h2>Les situations à ne pas manquer</h2>
<ul>
<li>Éruption avec <strong>fièvre élevée</strong> et mauvais état général</li>
<li>Cloques étendues, atteinte de la bouche ou des yeux, décollement de la peau</li>
</ul>
<blockquote>Attention : des <strong>taches rouges ou violacées qui ne s'effacent pas à la pression</strong>, avec fièvre et raideur de la nuque, peuvent évoquer une méningite grave — urgence vitale, appelez les secours. De même, une éruption avec gonflement du visage et gêne à respirer (anaphylaxie) est une urgence.</blockquote>

<h2>Que faire à la maison ?</h2>
<p>Ne pas gratter, éviter savons agressifs et produits nouveaux, hydrater la peau. Un antihistaminique peut soulager des démangeaisons. Éviter l'automédication par crèmes à la cortisone sans avis.</p>

<h2>Quand consulter un médecin ?</h2>
<p>Si l'éruption s'étend, persiste, démange fortement, ou survient après un nouveau médicament. Une éruption chez un nourrisson doit être montrée au médecin.</p>

<h2>Quels examens et traitements ?</h2>
<p>Souvent, l'examen de la peau suffit. Le traitement dépend de la cause (hydratation, antihistaminiques, antifongiques, arrêt d'un médicament en cause…). <strong>Seul un médecin peut poser un diagnostic.</strong></p>

<hr>
<p>Une éruption qui inquiète ? Sur SantéauMaroc, trouvez un dermatologue près de chez vous. Avec fièvre et taches qui ne s'effacent pas, appelez immédiatement les secours.</p>`;
const eruptionFaq = [
  { q: "Quelles sont les causes d'une éruption cutanée ?", a: "Le plus souvent l'eczéma, l'urticaire, l'acné, une allergie ou une réaction médicamenteuse, des infections (varicelle et autres maladies éruptives), des piqûres ou des mycoses. L'examen de la peau par un médecin oriente le diagnostic." },
  { q: "Quand une éruption cutanée est-elle une urgence ?", a: "Quand elle s'accompagne de fièvre élevée avec mauvais état général, de cloques étendues ou d'une atteinte de la bouche et des yeux, et surtout de taches rouges/violacées ne s'effaçant pas à la pression avec raideur de nuque (méningite). Il faut alors appeler les secours." },
  { q: "Que faire en cas de boutons qui démangent ?", a: "Ne pas gratter, éviter les savons agressifs et les produits nouveaux, hydrater la peau ; un antihistaminique peut soulager. Évitez l'automédication par crèmes à la cortisone sans avis. Si cela s'étend ou persiste, consultez." },
  { q: "Une éruption après un médicament, est-ce grave ?", a: "Une éruption survenant après l'introduction d'un médicament doit faire consulter, car il peut s'agir d'une allergie médicamenteuse. Certaines réactions cutanées aux médicaments peuvent être graves : ne reprenez pas le médicament sans avis." },
  { q: "Faut-il s'inquiéter d'une éruption chez le nourrisson ?", a: "Une éruption chez un nourrisson doit être montrée au médecin, surtout si elle s'accompagne de fièvre, d'un changement de comportement ou d'une gêne. Chez le tout-petit, mieux vaut consulter pour préciser la cause et la conduite." },
];
const eruptionTk = [
  "La plupart des éruptions cutanées sont bénignes (eczéma, urticaire, acné, infections).",
  "Fièvre élevée, cloques étendues ou atteinte bouche/yeux = consulter rapidement.",
  "Taches qui ne s'effacent pas + fièvre + raideur de nuque = urgence (méningite).",
  "Ne pas gratter ; éviter l'automédication par cortisone sans avis.",
];

const cDouleurArt = `<p>Les douleurs articulaires (arthralgies) sont très fréquentes. Elles peuvent toucher une ou plusieurs articulations et avoir des causes très variées, mécaniques ou inflammatoires. Distinguer les deux aide à orienter la prise en charge.</p>

<h2>Douleur mécanique ou inflammatoire ?</h2>
<table>
<thead><tr><th></th><th>Mécanique</th><th>Inflammatoire</th></tr></thead>
<tbody>
<tr><td>Quand</td><td>À l'effort, calmée par le repos</td><td>Au repos, réveille la nuit</td></tr>
<tr><td>Raideur du matin</td><td>Courte</td><td>Prolongée (> 30 min)</td></tr>
<tr><td>Exemple</td><td><a href="/blog/arthrose-maroc">Arthrose</a></td><td>Arthrite, <a href="/blog/goutte-maroc">goutte</a></td></tr>
</tbody>
</table>

<h2>Les causes fréquentes</h2>
<ul>
<li>Arthrose, tendinite, faux mouvement, surmenage</li>
<li>Goutte (crise très douloureuse, souvent le gros orteil)</li>
<li>Après une infection virale (douleurs passagères)</li>
</ul>

<h2>Les causes à explorer</h2>
<p>Une articulation <strong>chaude, rouge et gonflée</strong>, des douleurs inflammatoires de plusieurs articulations, ou une fièvre associée peuvent évoquer une arthrite (parfois infectieuse) et imposent un avis rapide.</p>

<h2>Que faire à la maison ?</h2>
<p>Repos relatif de l'articulation douloureuse (sans immobilisation prolongée), chaleur pour les douleurs mécaniques, antalgiques simples. Éviter les efforts qui aggravent.</p>

<h2>Quand consulter ?</h2>
<blockquote>Attention : consultez rapidement en cas d'articulation chaude, rouge et gonflée, surtout avec fièvre (arthrite possiblement infectieuse), ou de douleur intense après un traumatisme.</blockquote>

<h2>Quels examens et traitements ?</h2>
<p>Selon le contexte : examen clinique, <a href="/blog/radiographie-maroc">radiographie</a>, prise de sang, parfois ponction articulaire. Le traitement dépend de la cause. <strong>Seul un médecin peut poser un diagnostic.</strong></p>

<hr>
<p>Des douleurs articulaires qui durent ? Sur SantéauMaroc, trouvez un médecin près de chez vous. Une articulation chaude avec fièvre impose de consulter rapidement.</p>`;
const douleurArtFaq = [
  { q: "Comment savoir si une douleur articulaire est grave ?", a: "Une articulation chaude, rouge et gonflée, surtout avec de la fièvre, peut évoquer une arthrite parfois infectieuse et impose un avis rapide. Une douleur intense après un traumatisme aussi. Les douleurs mécaniques banales sont moins urgentes mais méritent un avis si elles durent." },
  { q: "Quelle différence entre douleur mécanique et inflammatoire ?", a: "La douleur mécanique (arthrose) survient à l'effort, se calme au repos, avec une raideur matinale courte. La douleur inflammatoire (arthrite, goutte) est présente au repos, réveille la nuit et s'accompagne d'une raideur matinale prolongée." },
  { q: "Que faire en cas de douleur articulaire ?", a: "Mettre l'articulation au repos relatif sans l'immobiliser longtemps, appliquer de la chaleur pour les douleurs mécaniques, prendre un antalgique simple et éviter les efforts qui aggravent. Si la douleur persiste ou inquiète, consulter." },
  { q: "Une articulation chaude et gonflée, que faire ?", a: "Consulter rapidement : une articulation chaude, rouge et gonflée, surtout avec fièvre, peut être une arthrite, parfois infectieuse, qui nécessite un diagnostic et un traitement urgents. Ne pas se contenter d'antalgiques." },
  { q: "Les douleurs articulaires après une infection sont-elles normales ?", a: "Des douleurs articulaires passagères peuvent suivre une infection virale (grippe, etc.) et disparaissent en général spontanément. Si elles persistent, touchent plusieurs articulations ou s'accompagnent de gonflement, un avis médical est utile." },
];
const douleurArtTk = [
  "Distinguer douleur mécanique (arthrose) et inflammatoire (arthrite, goutte).",
  "Causes fréquentes : arthrose, tendinite, goutte, suites d'infection virale.",
  "Articulation chaude, rouge, gonflée avec fièvre = consulter rapidement (arthrite).",
  "Seul un médecin peut poser un diagnostic devant une douleur qui dure.",
];

const cSaignementNez = `<p>Le saignement de nez (épistaxis) est très fréquent et le plus souvent bénin, surtout chez l'enfant. Quelques gestes simples suffisent en général à l'arrêter. Certaines situations demandent toutefois un avis médical.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Se moucher fort, se gratter le nez, air sec</li>
<li>Rhume, allergie, petit traumatisme</li>
<li>Fragilité des petits vaisseaux du nez</li>
</ul>

<h2>Les causes à explorer</h2>
<ul>
<li><a href="/blog/hypertension-arterielle-maroc">Hypertension</a> mal contrôlée</li>
<li>Prise d'anticoagulants, troubles de la coagulation</li>
<li>Saignements répétés du même côté (avis ORL)</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>S'asseoir, pencher la tête <strong>en avant</strong> (pas en arrière).</li>
<li><strong>Comprimer</strong> la partie molle du nez entre deux doigts pendant 10 minutes sans relâcher.</li>
<li>Respirer par la bouche ; éviter de se moucher juste après.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Si les saignements se répètent, surviennent sous anticoagulant, ou toujours du même côté. Un contrôle de la tension et un avis peuvent être utiles.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Si le saignement est abondant et ne s'arrête pas après 20 minutes de compression bien faite, s'il survient après un traumatisme important, ou s'il s'accompagne d'un malaise ou d'une pâleur.</p>

<h2>Quels examens et traitements ?</h2>
<p>Le plus souvent aucun. Sinon, examen ORL, contrôle de la tension et de la coagulation, cautérisation d'un vaisseau si besoin. <strong>Seul un médecin peut poser un diagnostic</strong> en cas de saignements répétés.</p>

<hr>
<p>Des saignements de nez fréquents ou inquiétants ? Sur SantéauMaroc, trouvez un médecin près de chez vous. Un saignement qui ne s'arrête pas est une urgence.</p>`;
const saignementFaq = [
  { q: "Comment arrêter un saignement de nez ?", a: "S'asseoir, pencher la tête en avant (surtout pas en arrière), et comprimer la partie molle du nez entre deux doigts pendant 10 minutes sans relâcher, en respirant par la bouche. Éviter de se moucher juste après. Cela suffit dans la grande majorité des cas." },
  { q: "Pourquoi ne faut-il pas pencher la tête en arrière ?", a: "Parce que le sang coule alors vers la gorge, ce qui peut être avalé (nausées) ou mal évalué. Pencher la tête en avant permet au sang de s'écouler et de mieux contrôler le saignement en comprimant le nez." },
  { q: "Quand un saignement de nez est-il inquiétant ?", a: "Quand il se répète, survient sous anticoagulant, toujours du même côté, ou ne s'arrête pas après 20 minutes de compression bien faite. Un saignement après un traumatisme important ou avec malaise impose aussi un avis, voire les urgences." },
  { q: "L'hypertension provoque-t-elle des saignements de nez ?", a: "Une hypertension mal contrôlée peut favoriser ou aggraver un saignement de nez. Un contrôle de la tension est utile en cas de saignements répétés, même si beaucoup d'épistaxis sont dues à des causes locales bénignes." },
  { q: "Les saignements de nez de l'enfant sont-ils graves ?", a: "Le plus souvent non : ils sont fréquents et bénins, favorisés par le fait de se gratter le nez et l'air sec. Les bons gestes suffisent à les arrêter. Des saignements très répétés ou abondants doivent toutefois faire consulter." },
];
const saignementTk = [
  "Le saignement de nez est fréquent et le plus souvent bénin, surtout chez l'enfant.",
  "Geste clé : tête en avant + comprimer le nez 10 minutes sans relâcher.",
  "À explorer : saignements répétés, sous anticoagulant, ou hypertension.",
  "Saignement qui ne s'arrête pas après 20 min ou avec malaise = urgence.",
];

const cBallonnements = `<p>La sensation de ventre gonflé, tendu, avec des gaz, est très fréquente et le plus souvent bénigne. Liés à l'alimentation et au fonctionnement de l'intestin, les ballonnements sont gênants mais rarement graves. Quelques ajustements suffisent souvent à les réduire.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Repas trop rapides, aliments fermentescibles (légumineuses, choux, boissons gazeuses)</li>
<li>Stress, avaler de l'air, <a href="/blog/constipation-maroc">constipation</a></li>
<li>Syndrome de l'intestin irritable, intolérances (lactose)</li>
</ul>

<h2>Les causes à explorer</h2>
<p>Des ballonnements <strong>récents et persistants</strong>, surtout après 50 ans, ou associés à une perte de poids, du sang dans les selles ou un changement du transit, doivent faire consulter (voir <a href="/blog/perte-de-poids-inexpliquee-maroc">perte de poids inexpliquée</a>).</p>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Manger lentement, en mâchant bien, à heures régulières.</li>
<li>Limiter boissons gazeuses, chewing-gums et excès d'aliments fermentescibles.</li>
<li>Bouger, traiter une constipation, gérer le stress.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Si les ballonnements sont persistants, s'aggravent, ou s'accompagnent de douleurs importantes, d'un amaigrissement, de sang dans les selles ou d'un changement durable du transit.</p>

<h2>Quand appeler les urgences ?</h2>
<p>En cas de ventre très gonflé et douloureux avec arrêt des gaz et des selles et vomissements, qui peut évoquer une occlusion.</p>

<h2>Quels examens et traitements ?</h2>
<p>Souvent aucun. Sinon, selon le contexte : bilan, parfois recherche d'intolérance ou <a href="/blog/coloscopie-maroc">coloscopie</a>. Le traitement passe surtout par l'alimentation et le mode de vie. <strong>Seul un médecin peut poser un diagnostic</strong> si les troubles persistent.</p>

<hr>
<p>Des ballonnements qui durent ou inquiètent ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const ballonnementsFaq = [
  { q: "Qu'est-ce qui provoque les ballonnements ?", a: "Le plus souvent l'alimentation (repas rapides, légumineuses, choux, boissons gazeuses), le fait d'avaler de l'air, le stress, la constipation, le syndrome de l'intestin irritable ou une intolérance (lactose). Ils sont fréquents et le plus souvent bénins." },
  { q: "Comment réduire les ballonnements ?", a: "En mangeant lentement et en mâchant bien, à heures régulières, en limitant les boissons gazeuses, les chewing-gums et l'excès d'aliments fermentescibles, en bougeant, en traitant une constipation et en gérant le stress." },
  { q: "Quand les ballonnements doivent-ils inquiéter ?", a: "Quand ils sont récents et persistants, surtout après 50 ans, ou associés à une perte de poids, du sang dans les selles, des douleurs importantes ou un changement durable du transit. Ces signes justifient une consultation." },
  { q: "Ballonnements et intestin irritable, quel lien ?", a: "Le syndrome de l'intestin irritable est une cause fréquente de ballonnements, souvent avec douleurs et troubles du transit, sans gravité mais gênant. Le diagnostic est posé par le médecin après avoir écarté d'autres causes." },
  { q: "Les ballonnements peuvent-ils être une urgence ?", a: "Rarement : un ventre très gonflé et douloureux avec arrêt des gaz et des selles et vomissements peut évoquer une occlusion intestinale, une urgence. Dans ce cas, il faut appeler les secours sans attendre." },
];
const ballonnementsTk = [
  "Les ballonnements sont très fréquents et le plus souvent bénins.",
  "Causes : alimentation, air avalé, stress, constipation, intestin irritable, intolérances.",
  "Ballonnements récents et persistants après 50 ans ou avec perte de poids = consulter.",
  "Ventre très gonflé, arrêt des gaz et des selles + vomissements = urgence (occlusion).",
];

const ARTICLES = [
  { slug:"jambes-gonflees-oedeme-maroc", aboutEntity:"Œdème des membres inférieurs",
    title:"Jambes gonflées (œdème) : causes et quand consulter",
    excerpt:"Jambes gonflées : causes fréquentes et graves (phlébite, cœur, reins), que faire, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    metaTitle:"Jambes gonflées (œdème) : causes et quand consulter | Maroc",
    metaDesc:"Jambes gonflées (œdème) : causes fréquentes (veines) et graves (phlébite, cœur, reins), que faire à la maison, quand consulter et signes d'urgence. Guide clair adapté au Maroc.",
    readingTime:5, content:cJambes, keyTakeaways:jambesTk, faq:jambesFaq },
  { slug:"insomnie-maroc", aboutEntity:"Insomnie",
    title:"Insomnie : causes, que faire et quand consulter",
    excerpt:"Insomnie : causes fréquentes et à explorer, bonnes habitudes de sommeil, prudence avec les somnifères et quand consulter. Guide clair adapté au Maroc.",
    metaTitle:"Insomnie : causes, que faire et quand consulter | Maroc",
    metaDesc:"Insomnie : causes (stress, dépression, apnées), bonnes habitudes de sommeil, prudence avec les somnifères et quand consulter. Guide clair adapté au Maroc.",
    readingTime:5, content:cInsomnie, keyTakeaways:insomnieTk, faq:insomnieFaq },
  { slug:"eruption-cutanee-boutons-maroc", aboutEntity:"Éruption cutanée",
    title:"Éruption cutanée (boutons, plaques) : que faire ?",
    excerpt:"Éruption cutanée : causes fréquentes et signes de gravité, que faire à la maison, quand consulter et quand c'est une urgence. Guide clair adapté au Maroc.",
    metaTitle:"Éruption cutanée (boutons, plaques) : que faire ? | Maroc",
    metaDesc:"Éruption cutanée : causes (eczéma, urticaire, allergie, infections), signes de gravité (fièvre, taches), que faire et quand consulter. Guide clair adapté au Maroc.",
    readingTime:5, content:cEruption, keyTakeaways:eruptionTk, faq:eruptionFaq },
  { slug:"douleur-articulaire-maroc", aboutEntity:"Arthralgie",
    title:"Douleur articulaire : mécanique ou inflammatoire ?",
    excerpt:"Douleur articulaire : distinguer mécanique et inflammatoire, causes fréquentes et à explorer, que faire et quand consulter rapidement. Guide clair adapté au Maroc.",
    metaTitle:"Douleur articulaire : causes et quand consulter | Maroc",
    metaDesc:"Douleur articulaire : mécanique (arthrose) ou inflammatoire (arthrite, goutte), causes, que faire et quand consulter (articulation chaude, fièvre). Guide clair adapté au Maroc.",
    readingTime:5, content:cDouleurArt, keyTakeaways:douleurArtTk, faq:douleurArtFaq },
  { slug:"saignement-de-nez-maroc", aboutEntity:"Épistaxis",
    title:"Saignement de nez : les bons gestes et quand consulter",
    excerpt:"Saignement de nez (épistaxis) : les bons gestes pour l'arrêter, causes, quand consulter et quand c'est une urgence. Guide clair adapté au Maroc.",
    metaTitle:"Saignement de nez : les bons gestes | Maroc",
    metaDesc:"Saignement de nez (épistaxis) : bons gestes pour l'arrêter (tête en avant, comprimer), causes, quand consulter et signes d'urgence. Guide clair adapté au Maroc.",
    readingTime:5, content:cSaignementNez, keyTakeaways:saignementTk, faq:saignementFaq },
  { slug:"ballonnements-maroc", aboutEntity:"Ballonnements",
    title:"Ballonnements et ventre gonflé : causes et solutions",
    excerpt:"Ballonnements : causes fréquentes et à explorer, comment les réduire, quand consulter et quand c'est une urgence. Guide clair adapté au Maroc.",
    metaTitle:"Ballonnements et ventre gonflé : causes et solutions | Maroc",
    metaDesc:"Ballonnements : causes (alimentation, stress, intestin irritable), comment les réduire, quand consulter et signe d'urgence (occlusion). Guide clair adapté au Maroc.",
    readingTime:5, content:cBallonnements, keyTakeaways:ballonnementsTk, faq:ballonnementsFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.findUnique({ where: { slug: "symptomes" }, select: { id: true } });
  if (!cat) { console.error("Catégorie 'symptomes' introuvable."); process.exit(1); }
  const now = new Date();
  for (const art of ARTICLES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:cat.id, metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`✓ Symptôme  /blog/${post.slug}`);
  }
  console.log(`\nSymptômes lot 4 : ${ARTICLES.length} fiches publiées.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
