require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// DENSIFICATION EN COCONS — vague 3 : Allergie, Arthrose, Migraine (3 satellites
// chacun, rattachés par pillarId). Idempotent (upsert). Mappings : blog-related.ts.
//   • Allergie  (allergie-maroc)  — rhinite / alimentaire / urticaire
//   • Arthrose  (arthrose-maroc)  — genou / hanche / cervicale
//   • Migraine  (migraine-maroc)  — aura / traitement de crise / règles
// ════════════════════════════════════════════════════════════════════════════

// ═══ ALLERGIE ═════════════════════════════════════════════════════════════════
const cRhinite = `<p>La rhinite allergique, ou « rhume des foins », est l'allergie la plus fréquente. Éternuements, nez qui coule et bouché, yeux qui piquent : gênante et souvent sous-estimée, elle se contrôle bien et mérite d'être prise au sérieux, car elle est liée à l'<a href="/blog/asthme-maroc">asthme</a>.</p>

<h2>Les symptômes</h2>
<ul>
<li>Éternuements en salves, nez qui coule (écoulement clair) ou bouché</li>
<li>Démangeaisons du nez, des yeux, de la gorge ; yeux rouges et larmoyants</li>
<li>Fatigue, troubles du sommeil et de la concentration</li>
</ul>

<h2>Saisonnière ou toute l'année ?</h2>
<p>La rhinite <strong>saisonnière</strong> (pollens) revient à certaines périodes ; la rhinite <strong>persistante</strong> (acariens, animaux, moisissures) dure toute l'année. Repérer les circonstances aide à identifier l'<a href="/blog/allergie-maroc">allergène</a>.</p>

<h2>Que faire ?</h2>
<ul>
<li>Réduire l'exposition : aération, literie anti-acariens, fenêtres fermées aux pics de pollens.</li>
<li>Lavages de nez au sérum physiologique.</li>
<li>Antihistaminiques et corticoïdes locaux (spray nasal), sur conseil médical.</li>
</ul>

<h2>Quand consulter ?</h2>
<p>Si la rhinite gêne le quotidien, dure, ou s'accompagne de toux ou d'essoufflement (recherche d'asthme). Un bilan allergologique et, parfois, une désensibilisation peuvent être proposés.</p>

<hr>
<p>Une rhinite qui vous gâche la vie ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const rhiniteFaq = [
  { q: "Comment soulager une rhinite allergique ?", a: "En réduisant l'exposition à l'allergène (aération, literie anti-acariens, fenêtres fermées aux pics de pollens), avec des lavages de nez au sérum physiologique et, sur conseil médical, des antihistaminiques et un corticoïde local en spray nasal." },
  { q: "Rhume ou rhinite allergique : comment faire la différence ?", a: "Le rhume est viral, dure quelques jours, parfois avec fièvre. La rhinite allergique revient dans des circonstances précises (saison, animal, poussière), sans fièvre, avec des démangeaisons du nez et des yeux, et peut durer des semaines." },
  { q: "La rhinite allergique est-elle liée à l'asthme ?", a: "Oui. Rhinite allergique et asthme partagent le même terrain allergique et coexistent souvent. Une rhinite mal contrôlée peut favoriser ou aggraver un asthme : il faut les prendre en charge ensemble et signaler toute toux ou essoufflement." },
  { q: "Peut-on guérir d'une rhinite allergique ?", a: "On la contrôle bien par l'éviction et les traitements. Dans certains cas, la désensibilisation (immunothérapie) réduit durablement les réactions à un allergène identifié. Un bilan allergologique permet d'en discuter avec le médecin." },
  { q: "Quand consulter pour une rhinite ?", a: "Si elle gêne le quotidien (sommeil, concentration), dure, revient chaque année, ou s'accompagne de toux ou d'essoufflement évoquant un asthme. Le médecin peut proposer un bilan allergologique et un traitement adapté." },
];
const rhiniteTk = [
  "La rhinite allergique (rhume des foins) est l'allergie la plus fréquente.",
  "Saisonnière (pollens) ou persistante (acariens, animaux) : repérer l'allergène.",
  "Traitement : éviction, lavages de nez, antihistaminiques et corticoïdes locaux.",
  "Elle est liée à l'asthme : signaler toute toux ou essoufflement.",
];

const cAllergAlim = `<p>L'allergie alimentaire est une réaction du système immunitaire à un aliment. Plus fréquente chez l'enfant, elle va de la simple gêne à la réaction grave (anaphylaxie). L'identifier et éviter l'aliment en cause sont essentiels.</p>

<h2>Les aliments souvent en cause</h2>
<p>Arachide, fruits à coque, lait de vache, œuf, poisson et fruits de mer, certains fruits. Les aliments varient selon l'âge : lait et œuf chez l'enfant, fruits de mer et fruits à coque plutôt chez l'adulte.</p>

<h2>Les symptômes</h2>
<ul>
<li>Cutanés : <a href="/blog/urticaire-maroc">urticaire</a>, démangeaisons, gonflement</li>
<li>Digestifs : douleurs, vomissements, diarrhée</li>
<li>Respiratoires et généraux dans les formes graves</li>
</ul>
<blockquote>Attention : une réaction généralisée et brutale (gonflement de la gorge, gêne à respirer, malaise) est une <strong>anaphylaxie</strong> — urgence vitale. Appelez les secours et utilisez un stylo d'adrénaline si la personne en a un.</blockquote>

<h2>Le diagnostic</h2>
<p>Il repose sur l'interrogatoire, des tests cutanés et des dosages sanguins (voir <a href="/blog/allergie-maroc">allergies</a>), parfois un test de réintroduction encadré par un spécialiste.</p>

<h2>La prise en charge</h2>
<p>Éviter l'aliment (lire les étiquettes), disposer d'un traitement d'urgence si risque d'anaphylaxie, et être suivi par un allergologue. Chez l'enfant, certaines allergies (lait, œuf) s'atténuent avec l'âge.</p>

<hr>
<p>Une allergie alimentaire suspectée ? Sur SantéauMaroc, trouvez un médecin près de chez vous. En cas de réaction grave, appelez immédiatement les secours.</p>`;
const allergAlimFaq = [
  { q: "Quels sont les aliments les plus allergisants ?", a: "L'arachide, les fruits à coque, le lait de vache, l'œuf, le poisson et les fruits de mer, et certains fruits. Chez l'enfant, le lait et l'œuf dominent ; chez l'adulte, plutôt les fruits de mer et les fruits à coque." },
  { q: "Comment reconnaître une allergie alimentaire ?", a: "Par des signes survenant après l'ingestion : urticaire, démangeaisons, gonflement, troubles digestifs, voire réaction respiratoire ou générale. L'interrogatoire, des tests cutanés et des dosages sanguins, réalisés par un allergologue, précisent l'aliment en cause." },
  { q: "Qu'est-ce que l'anaphylaxie alimentaire ?", a: "C'est une réaction allergique généralisée et brutale (gonflement de la gorge, gêne à respirer, malaise, chute de tension) après ingestion de l'aliment. C'est une urgence vitale : il faut appeler les secours et utiliser un stylo d'adrénaline si disponible." },
  { q: "Une allergie alimentaire disparaît-elle ?", a: "Chez l'enfant, certaines allergies (lait, œuf) s'atténuent souvent avec l'âge. D'autres, comme l'arachide ou les fruits de mer, persistent généralement. Le suivi par un allergologue permet d'évaluer l'évolution." },
  { q: "Comment vivre avec une allergie alimentaire ?", a: "En évitant strictement l'aliment (lecture systématique des étiquettes, vigilance au restaurant), en disposant d'un traitement d'urgence en cas de risque d'anaphylaxie, et en étant suivi par un allergologue. L'entourage doit être informé des gestes d'urgence." },
];
const allergAlimTk = [
  "L'allergie alimentaire est une réaction immunitaire à un aliment, plus fréquente chez l'enfant.",
  "Aliments fréquents : arachide, fruits à coque, lait, œuf, poisson, fruits de mer.",
  "L'anaphylaxie (gonflement, gêne à respirer) est une urgence vitale.",
  "Prise en charge : éviter l'aliment, traitement d'urgence, suivi allergologue.",
];

const cUrticaire = `<p>L'urticaire est une éruption de plaques rouges en relief, qui démangent et ressemblent à des piqûres d'ortie. Très fréquente et le plus souvent bénigne, elle inquiète par son aspect. La plupart du temps, elle disparaît en quelques heures à quelques jours.</p>

<h2>À quoi ça ressemble ?</h2>
<p>Des plaques rouges, gonflées, mobiles (elles changent de place), qui démangent. Elles peuvent s'accompagner d'un gonflement des paupières ou des lèvres (angio-œdème).</p>

<h2>Les causes</h2>
<ul>
<li><a href="/blog/allergie-maroc">Allergie</a> (aliment, médicament, piqûre), infection</li>
<li>Frottement, froid, chaleur, effort, stress</li>
<li>Souvent, aucune cause précise n'est retrouvée (urticaire « idiopathique »)</li>
</ul>

<h2>Aiguë ou chronique ?</h2>
<p>L'urticaire <strong>aiguë</strong> dure moins de 6 semaines ; au-delà, on parle d'urticaire <strong>chronique</strong>, qui justifie un avis médical.</p>

<h2>Que faire ?</h2>
<p>Les antihistaminiques calment les démangeaisons. Éviter le facteur déclenchant si identifié, ne pas gratter, préférer une peau au frais.</p>
<blockquote>Attention : un gonflement de la gorge, une gêne à respirer ou un malaise associés à l'urticaire évoquent une réaction grave (anaphylaxie) — urgence vitale, appelez les secours.</blockquote>

<h2>Quand consulter ?</h2>
<p>Si l'urticaire dure plus de quelques jours, revient, ou s'accompagne de gonflement du visage. Une urticaire chronique nécessite un bilan.</p>

<hr>
<p>Une urticaire qui persiste ou qui revient ? Sur SantéauMaroc, trouvez un dermatologue près de chez vous. En cas de gêne à respirer, appelez immédiatement les secours.</p>`;
const urticaireFaq = [
  { q: "Qu'est-ce que l'urticaire ?", a: "C'est une éruption de plaques rouges en relief qui démangent, ressemblant à des piqûres d'ortie et changeant de place. Très fréquente et le plus souvent bénigne, elle disparaît généralement en quelques heures à quelques jours." },
  { q: "Quelles sont les causes de l'urticaire ?", a: "Une allergie (aliment, médicament, piqûre), une infection, ou des facteurs physiques (froid, chaleur, frottement, effort, stress). Souvent, aucune cause précise n'est retrouvée, surtout dans l'urticaire chronique." },
  { q: "Comment calmer une urticaire ?", a: "Les antihistaminiques calment les démangeaisons. Il faut éviter le facteur déclenchant s'il est identifié, ne pas gratter et garder la peau au frais. Si l'urticaire persiste ou revient, un avis médical est utile." },
  { q: "Quand l'urticaire est-elle une urgence ?", a: "Quand elle s'accompagne d'un gonflement de la gorge, d'une gêne à respirer ou d'un malaise : cela évoque une réaction allergique grave (anaphylaxie), une urgence vitale nécessitant d'appeler immédiatement les secours." },
  { q: "Qu'est-ce qu'une urticaire chronique ?", a: "C'est une urticaire qui dure plus de 6 semaines. Elle est le plus souvent bénigne mais gênante, et sans allergie retrouvée dans de nombreux cas. Elle justifie un avis médical et parfois un bilan, avec un traitement antihistaminique de fond." },
];
const urticaireTk = [
  "L'urticaire = plaques rouges en relief qui démangent, mobiles, souvent bénignes.",
  "Causes : allergie, infection, facteurs physiques ; souvent aucune cause retrouvée.",
  "Aiguë (< 6 semaines) ou chronique (au-delà, à explorer).",
  "Gonflement de la gorge ou gêne à respirer = urgence (anaphylaxie).",
];

// ═══ ARTHROSE ═════════════════════════════════════════════════════════════════
const cGonarthrose = `<p>L'arthrose du genou (gonarthrose) est l'une des plus fréquentes. Douleur à la marche, à la montée des escaliers, raideur : elle peut gêner le quotidien, mais se soulage bien — et rester actif est la clé.</p>

<h2>Les symptômes</h2>
<p>Une douleur <strong>mécanique</strong> (déclenchée par l'effort, calmée par le repos), une raideur brève au réveil, des craquements et parfois un gonflement. La marche et les escaliers sont souvent les premiers gênés.</p>

<h2>Les facteurs favorisants</h2>
<ul>
<li><strong>Surpoids</strong> (le genou porte le poids du corps)</li>
<li>Antécédent de traumatisme ou d'opération du genou</li>
<li>Âge, activités très sollicitantes</li>
</ul>

<h2>Comment la soulager ?</h2>
<ul>
<li><strong>Perdre du poids</strong> : le levier le plus efficace.</li>
<li><strong>Bouger</strong> sans chocs (marche, vélo, natation) et renforcer les cuisses.</li>
<li>Antalgiques, kinésithérapie, parfois infiltrations.</li>
<li>Chirurgie (prothèse) aux stades avancés et invalidants.</li>
</ul>
<blockquote>Bon à savoir : le repos complet aggrave l'arthrose en affaiblissant les muscles. Voir la fiche <a href="/blog/arthrose-maroc">Arthrose</a> et le guide <a href="/blog/activite-physique-senior-maroc">activité physique</a>.</blockquote>

<h2>Quand consulter ?</h2>
<p>Si la douleur gêne la marche ou le quotidien, ou en cas de genou chaud, gonflé ou bloqué (qui peut évoquer une autre cause).</p>

<hr>
<p>Un genou douloureux ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const gonarthroseFaq = [
  { q: "Comment soulager l'arthrose du genou ?", a: "En perdant du poids (levier majeur), en bougeant sans chocs (marche, vélo, natation) et en renforçant les cuisses par la kinésithérapie, avec des antalgiques et parfois des infiltrations. Aux stades avancés, une prothèse peut être proposée." },
  { q: "Faut-il marcher avec de l'arthrose du genou ?", a: "Oui. Le repos complet affaiblit les muscles et aggrave l'arthrose. Une activité adaptée et sans chocs entretient l'articulation et réduit la douleur. Il faut simplement doser l'effort et éviter les impacts répétés." },
  { q: "Le surpoids aggrave-t-il l'arthrose du genou ?", a: "Oui, nettement, car le genou porte le poids du corps. Perdre quelques kilos soulage significativement la douleur et ralentit l'évolution. La perte de poids fait partie intégrante du traitement de la gonarthrose." },
  { q: "Quand envisager une prothèse de genou ?", a: "Lorsque l'arthrose est avancée et invalidante, avec une douleur et une gêne qui résistent aux traitements et retentissent fortement sur la vie quotidienne. La décision se prend avec le médecin et le chirurgien, selon la gêne et l'état du genou." },
  { q: "Un genou gonflé et chaud, est-ce de l'arthrose ?", a: "L'arthrose donne surtout une douleur mécanique avec parfois un gonflement. Un genou chaud, très gonflé ou brutalement bloqué peut évoquer une autre cause (inflammation, infection) et doit faire consulter pour préciser le diagnostic." },
];
const gonarthroseTk = [
  "L'arthrose du genou (gonarthrose) donne une douleur mécanique à la marche et aux escaliers.",
  "Le surpoids est un facteur majeur : perdre du poids soulage nettement.",
  "Rester actif sans chocs et renforcer les cuisses sont essentiels.",
  "Prothèse envisagée aux stades avancés et invalidants.",
];

const cCoxarthrose = `<p>L'arthrose de la hanche (coxarthrose) provoque une douleur de l'aine ou de la fesse, gênant la marche. Comme les autres arthroses, elle se prend en charge par l'activité adaptée, la perte de poids et, si besoin, une prothèse très efficace.</p>

<h2>Où et quand ça fait mal ?</h2>
<p>La douleur siège typiquement dans l'<strong>aine</strong>, parfois la fesse ou la cuisse, déclenchée par la marche et calmée par le repos. La raideur peut gêner pour enfiler ses chaussettes ou monter en voiture.</p>

<h2>Les facteurs favorisants</h2>
<ul>
<li>Âge, <strong>surpoids</strong>, hérédité</li>
<li>Anomalie de forme de la hanche, antécédent de traumatisme</li>
</ul>

<h2>Comment la soulager ?</h2>
<ul>
<li>Activité physique adaptée (vélo, natation) et perte de poids.</li>
<li>Kinésithérapie, antalgiques.</li>
<li><strong>Prothèse de hanche</strong> aux stades avancés : une chirurgie qui donne d'excellents résultats sur la douleur et la mobilité.</li>
</ul>
<p>Voir aussi la fiche <a href="/blog/arthrose-maroc">Arthrose</a>.</p>

<h2>Quand consulter ?</h2>
<p>Si la douleur de hanche gêne la marche, le sommeil ou le quotidien, ou si la mobilité se réduit. Une douleur intense et brutale après une chute doit faire éliminer une fracture.</p>

<hr>
<p>Une hanche douloureuse qui vous limite ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const coxarthroseFaq = [
  { q: "Où a-t-on mal en cas d'arthrose de la hanche ?", a: "La douleur siège typiquement dans l'aine, parfois la fesse ou la cuisse, déclenchée par la marche et calmée par le repos. La raideur peut gêner des gestes comme enfiler ses chaussettes ou monter en voiture." },
  { q: "Comment soulager l'arthrose de la hanche ?", a: "Par une activité physique adaptée (vélo, natation), la perte de poids, la kinésithérapie et des antalgiques. Aux stades avancés, la prothèse de hanche donne d'excellents résultats sur la douleur et la mobilité." },
  { q: "La prothèse de hanche est-elle efficace ?", a: "Oui, c'est l'une des chirurgies les plus efficaces : elle soulage nettement la douleur et restaure la mobilité aux stades avancés de coxarthrose. La décision se prend avec le médecin et le chirurgien selon la gêne et l'état de la hanche." },
  { q: "Faut-il bouger avec une arthrose de la hanche ?", a: "Oui, une activité douce et sans chocs (vélo, natation) entretient la hanche et les muscles, à l'inverse du repos complet qui aggrave l'arthrose. Il faut adapter l'intensité et éviter les impacts répétés." },
  { q: "Une douleur de hanche est-elle toujours de l'arthrose ?", a: "Non : elle peut venir des tendons, du dos (sciatique) ou, après une chute, d'une fracture, surtout chez la personne âgée. Une douleur intense, brutale ou empêchant l'appui doit faire consulter pour préciser la cause." },
];
const coxarthroseTk = [
  "L'arthrose de la hanche (coxarthrose) donne une douleur de l'aine à la marche.",
  "Facteurs : âge, surpoids, hérédité, anomalie de la hanche.",
  "Activité adaptée et perte de poids soulagent ; la prothèse est très efficace.",
  "Douleur brutale après une chute : éliminer une fracture.",
];

const cCervicarthrose = `<p>L'arthrose cervicale (cervicarthrose) touche les vertèbres du cou. Très fréquente avec l'âge, elle est souvent bien tolérée, mais peut provoquer douleurs et raideur de la nuque, parfois des irradiations dans le bras.</p>

<h2>Les symptômes</h2>
<ul>
<li>Douleur et <strong>raideur de la nuque</strong>, craquements</li>
<li>Maux de tête partant de la nuque</li>
<li>Parfois irradiation dans l'épaule ou le bras (névralgie cervico-brachiale)</li>
</ul>

<h2>Ce qui la favorise</h2>
<p>L'âge surtout, mais aussi les <strong>mauvaises postures</strong> prolongées (écrans, téléphone), le stress et les tensions musculaires.</p>

<h2>Comment la soulager ?</h2>
<ul>
<li>Bonnes postures, pauses, adaptation du poste de travail.</li>
<li>Chaleur, exercices d'assouplissement, kinésithérapie.</li>
<li>Antalgiques lors des poussées.</li>
</ul>
<p>Voir la fiche <a href="/blog/arthrose-maroc">Arthrose</a>. Une douleur de nuque banale ne doit pas être confondue avec les <a href="/blog/mal-de-tete-maroc">maux de tête</a> d'autres causes.</p>

<h2>Quand consulter ?</h2>
<blockquote>Attention : une raideur de nuque avec <strong>fièvre</strong>, ou des troubles neurologiques (faiblesse, fourmillements persistants d'un bras, troubles de la marche), imposent de consulter sans tarder. Une raideur brutale après un traumatisme aussi.</blockquote>

<hr>
<p>Une nuque douloureuse et raide ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const cervicFaq = [
  { q: "Qu'est-ce que l'arthrose cervicale ?", a: "C'est l'arthrose des vertèbres du cou, très fréquente avec l'âge. Elle provoque douleurs et raideur de la nuque, des craquements, parfois des maux de tête partant de la nuque ou des irradiations dans le bras. Elle est souvent bien tolérée." },
  { q: "Comment soulager une arthrose cervicale ?", a: "Par de bonnes postures et des pauses (écrans, téléphone), l'application de chaleur, des exercices d'assouplissement et la kinésithérapie, avec des antalgiques lors des poussées. Adapter son poste de travail aide beaucoup." },
  { q: "L'arthrose cervicale donne-t-elle des maux de tête ?", a: "Oui, elle peut provoquer des maux de tête partant de la nuque et remontant vers l'arrière du crâne. D'autres causes de maux de tête existent cependant : en cas de doute ou de céphalée inhabituelle, il faut consulter." },
  { q: "Quand s'inquiéter d'une douleur de nuque ?", a: "En cas de raideur de nuque avec fièvre, de troubles neurologiques (faiblesse ou fourmillements persistants d'un bras, troubles de la marche), ou de douleur brutale après un traumatisme. Ces situations imposent de consulter sans tarder." },
  { q: "Les écrans aggravent-ils l'arthrose cervicale ?", a: "Les postures prolongées tête penchée (écrans, téléphone) sollicitent le cou et peuvent aggraver les douleurs. Faire des pauses, redresser l'écran à hauteur des yeux et bouger régulièrement la nuque aident à les prévenir." },
];
const cervicTk = [
  "L'arthrose cervicale touche les vertèbres du cou ; très fréquente avec l'âge.",
  "Symptômes : douleur et raideur de la nuque, craquements, parfois irradiation au bras.",
  "Postures, pauses, chaleur et kinésithérapie soulagent.",
  "Raideur de nuque avec fièvre ou troubles neurologiques = consulter sans tarder.",
];

// ═══ MIGRAINE ═════════════════════════════════════════════════════════════════
const cMigAura = `<p>Chez certaines personnes migraineuses, la crise est précédée d'une « aura » : des troubles neurologiques passagers, le plus souvent visuels. Impressionnante la première fois, l'aura est généralement bénigne, mais elle doit être connue et bien distinguée d'autres urgences.</p>

<h2>Qu'est-ce que l'aura ?</h2>
<p>Ce sont des signes transitoires qui précèdent (ou accompagnent) le mal de tête de la <a href="/blog/migraine-maroc">migraine</a>, durant en général de 5 à 60 minutes, puis régressant complètement.</p>

<h2>Les formes d'aura</h2>
<ul>
<li><strong>Visuelle</strong> (la plus fréquente) : points brillants, lignes en zigzag, tache aveugle qui s'agrandit</li>
<li><strong>Sensitive</strong> : fourmillements d'une main, du visage</li>
<li>Trouble passager de la parole</li>
</ul>

<h2>Aura ou AVC ?</h2>
<blockquote>Attention : une aura migraineuse s'installe progressivement et régresse. Des signes <strong>brutaux</strong> (faiblesse d'un côté, trouble de la parole, perte de vision soudaine), surtout lors d'un premier épisode ou après 50 ans, peuvent évoquer un <a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a> : appelez les secours.</blockquote>

<h2>Que faire ?</h2>
<p>Se mettre au calme, prendre son traitement de crise dès l'aura ou le début du mal de tête selon le conseil du médecin. Un premier épisode d'aura doit faire consulter pour confirmer le diagnostic.</p>

<hr>
<p>Des auras qui vous inquiètent ? Sur SantéauMaroc, trouvez un médecin près de chez vous. Devant des signes brutaux, appelez les secours.</p>`;
const migAuraFaq = [
  { q: "Qu'est-ce qu'une aura migraineuse ?", a: "Ce sont des troubles neurologiques passagers qui précèdent ou accompagnent la migraine, le plus souvent visuels (points brillants, lignes en zigzag, tache aveugle), durant 5 à 60 minutes puis régressant complètement." },
  { q: "L'aura migraineuse est-elle dangereuse ?", a: "Elle est généralement bénigne. Mais des signes brutaux (faiblesse d'un côté, trouble de la parole, perte de vision soudaine), surtout lors d'un premier épisode ou après 50 ans, peuvent évoquer un AVC et imposent d'appeler les secours." },
  { q: "Comment distinguer une aura d'un AVC ?", a: "L'aura migraineuse s'installe progressivement (sur quelques minutes) et régresse complètement, souvent chez une personne déjà migraineuse. Un AVC donne des signes brutaux et persistants. En cas de doute, surtout à un premier épisode, appelez les secours." },
  { q: "Que faire quand une aura commence ?", a: "Se mettre au calme et prendre le traitement de crise dès l'aura ou le début du mal de tête, selon le conseil du médecin. Un premier épisode d'aura doit toujours faire consulter pour confirmer qu'il s'agit bien d'une migraine." },
  { q: "Peut-on avoir une aura sans mal de tête ?", a: "Oui, il existe des auras isolées, sans céphalée qui suit. Elles restent le plus souvent bénignes chez une personne migraineuse connue, mais un premier épisode ou une aura inhabituelle doit faire consulter pour écarter une autre cause." },
];
const migAuraTk = [
  "L'aura précède la migraine : troubles passagers, surtout visuels (5-60 min).",
  "Elle est généralement bénigne et régresse complètement.",
  "Des signes brutaux ou un premier épisode après 50 ans peuvent évoquer un AVC : secours.",
  "Un premier épisode d'aura doit faire consulter pour confirmer le diagnostic.",
];

const cMigCrise = `<p>Bien traiter une crise de migraine, c'est agir vite et juste. Pris tôt, le traitement de crise raccourcit l'épisode et réduit la douleur. Mais l'excès d'antalgiques peut, à l'inverse, entretenir les maux de tête.</p>

<h2>Agir dès le début</h2>
<p>Le traitement de crise est d'autant plus efficace qu'il est pris <strong>dès les premiers signes</strong> de la <a href="/blog/migraine-maroc">migraine</a>. Attendre réduit son efficacité.</p>

<h2>Les traitements de la crise</h2>
<ul>
<li><strong>Antalgiques et anti-inflammatoires</strong> pour les crises légères à modérées.</li>
<li><strong>Triptans</strong> : médicaments spécifiques de la migraine, si les antalgiques ne suffisent pas, sur prescription.</li>
<li>Contre les nausées, un médicament adapté peut être associé.</li>
</ul>

<h2>Les bons réflexes</h2>
<p>Se reposer dans le calme et l'obscurité, boire de l'eau. Noter la crise dans un agenda aide à ajuster le traitement.</p>

<blockquote>Attention à l'abus d'antalgiques : en prendre trop souvent (plusieurs jours par semaine) peut entraîner des « céphalées par abus médicamenteux », un cercle vicieux. Si vous devez traiter des crises très fréquentes, parlez-en à votre médecin : un traitement de fond est peut-être nécessaire.</blockquote>

<h2>Quand consulter ?</h2>
<p>Si les crises sont fréquentes, intenses, ou si les traitements ne suffisent plus. Tout mal de tête inhabituel ou brutal impose un avis.</p>

<hr>
<p>Des crises difficiles à soulager ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const migCriseFaq = [
  { q: "Comment arrêter une crise de migraine ?", a: "En prenant le traitement dès les premiers signes : antalgiques ou anti-inflammatoires, et si besoin un triptan prescrit par le médecin. Se reposer au calme et dans l'obscurité, s'hydrater. Plus le traitement est pris tôt, plus il est efficace." },
  { q: "Qu'est-ce qu'un triptan ?", a: "C'est un médicament spécifique de la crise de migraine, prescrit quand les antalgiques classiques ne suffisent pas. Il agit sur les mécanismes de la migraine. Il se prend sur prescription, dès le début de la céphalée, selon les conseils du médecin." },
  { q: "Peut-on prendre trop d'antalgiques contre la migraine ?", a: "Oui, et c'est un piège : en prendre trop souvent (plusieurs jours par semaine) peut entretenir des maux de tête, appelés « céphalées par abus médicamenteux ». En cas de crises fréquentes, un traitement de fond est parfois nécessaire." },
  { q: "Faut-il prendre le traitement dès le début de la crise ?", a: "Oui. Le traitement de crise est bien plus efficace pris dès les premiers signes qu'attendu. Retarder la prise diminue son effet et laisse la crise s'installer. Avoir son traitement à portée de main est donc important." },
  { q: "Quand consulter pour ses crises de migraine ?", a: "Si les crises sont fréquentes, intenses, retentissent sur votre vie ou si vos traitements ne suffisent plus, un médecin peut proposer un traitement de fond. Tout mal de tête inhabituel ou brutal impose par ailleurs un avis rapide." },
];
const migCriseTk = [
  "Le traitement de crise est plus efficace pris dès les premiers signes.",
  "Antalgiques/anti-inflammatoires, et triptans si besoin (sur prescription).",
  "Repos au calme et dans l'obscurité, hydratation.",
  "Abus d'antalgiques = céphalées par abus : crises fréquentes → traitement de fond.",
];

const cMigRegles = `<p>Chez beaucoup de femmes, les crises de migraine sont rythmées par le cycle : elles surviennent volontiers autour des règles. Cette migraine « cataméniale » s'explique par les variations hormonales et se prend en charge de façon adaptée.</p>

<h2>Pourquoi les règles déclenchent des migraines</h2>
<p>La chute du taux d'œstrogènes juste avant les règles est un déclencheur puissant chez les femmes prédisposées. Ces crises <a href="/blog/migraine-maroc">migraineuses</a> périmenstruelles sont souvent plus intenses et plus longues.</p>

<h2>Reconnaître le lien</h2>
<p>Tenir un <strong>agenda</strong> des crises et des règles pendant quelques mois met en évidence le rythme et aide le médecin à adapter le traitement.</p>

<h2>La prise en charge</h2>
<ul>
<li>Traiter la crise tôt (voir <a href="/blog/migraine-traitement-crise-maroc">traitement de la crise</a>).</li>
<li>Parfois, un traitement préventif ciblé autour des règles.</li>
<li>Hygiène de vie : sommeil régulier, éviter le jeûne et la déshydratation.</li>
</ul>

<h2>Migraine et contraception</h2>
<blockquote>Attention : en cas de <strong>migraine avec aura</strong>, certaines pilules contenant des œstrogènes sont déconseillées, car elles augmentent le risque vasculaire. Signalez toujours vos migraines et leur type à votre médecin avant une contraception hormonale.</blockquote>

<hr>
<p>Des migraines rythmées par vos règles ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const migReglesFaq = [
  { q: "Pourquoi ai-je des migraines pendant mes règles ?", a: "La chute du taux d'œstrogènes juste avant les règles est un déclencheur puissant de migraine chez les femmes prédisposées. Ces crises périmenstruelles (migraine cataméniale) sont souvent plus intenses et plus longues que les autres." },
  { q: "Comment traiter une migraine liée aux règles ?", a: "En traitant la crise tôt (antalgiques, triptans sur prescription) et, dans certains cas, par un traitement préventif ciblé autour des règles. Une bonne hygiène de vie (sommeil régulier, éviter le jeûne et la déshydratation) aide aussi." },
  { q: "Migraine et pilule : y a-t-il un risque ?", a: "En cas de migraine avec aura, certaines pilules contenant des œstrogènes sont déconseillées car elles augmentent le risque vasculaire. Il faut toujours signaler ses migraines et leur type au médecin avant de choisir une contraception hormonale." },
  { q: "La migraine s'améliore-t-elle à la ménopause ?", a: "Souvent, les migraines liées aux hormones tendent à diminuer après la ménopause, une fois les variations hormonales terminées. L'évolution est toutefois variable d'une femme à l'autre ; le médecin adapte la prise en charge." },
  { q: "Comment savoir si mes migraines sont hormonales ?", a: "En tenant un agenda des crises et des règles pendant quelques mois : si les crises surviennent régulièrement autour des règles, le lien hormonal est probable. Cet agenda aide le médecin à confirmer et à adapter le traitement." },
];
const migReglesTk = [
  "Les migraines périmenstruelles sont déclenchées par la chute des œstrogènes.",
  "Elles sont souvent plus intenses ; un agenda crises/règles met en évidence le lien.",
  "Prise en charge : traiter la crise tôt, parfois prévention ciblée autour des règles.",
  "Migraine avec aura : certaines pilules œstroprogestatives sont déconseillées.",
];

// ─────────────────────────────────────────────────────────────────────────────
const SATELLITES = [
  { pillarSlug:"allergie-maroc", categorySlug:"maladies-traitements", aboutEntity:"Rhinite allergique",
    slug:"rhinite-allergique-maroc", title:"Rhinite allergique (rhume des foins) : symptômes et traitement",
    excerpt:"Rhinite allergique : symptômes, formes saisonnière et persistante, comment la soulager et son lien avec l'asthme. Un guide clair adapté au Maroc.",
    metaTitle:"Rhinite allergique (rhume des foins) : traitement | Maroc",
    metaDesc:"Rhinite allergique : symptômes (éternuements, nez bouché, yeux qui piquent), formes saisonnière et persistante, traitements et lien avec l'asthme. Guide clair adapté au Maroc.",
    readingTime:5, content:cRhinite, keyTakeaways:rhiniteTk, faq:rhiniteFaq },
  { pillarSlug:"allergie-maroc", categorySlug:"maladies-traitements", aboutEntity:"Allergie alimentaire",
    slug:"allergie-alimentaire-maroc", title:"Allergie alimentaire : reconnaître, réagir et vivre avec",
    excerpt:"Allergie alimentaire : aliments en cause, symptômes, urgence de l'anaphylaxie, diagnostic et prise en charge. Un guide clair adapté au Maroc.",
    metaTitle:"Allergie alimentaire : symptômes et prise en charge | Maroc",
    metaDesc:"Allergie alimentaire : aliments en cause, symptômes, anaphylaxie (urgence), diagnostic (tests, IgE) et prise en charge (éviction, adrénaline). Guide clair adapté au Maroc.",
    readingTime:5, content:cAllergAlim, keyTakeaways:allergAlimTk, faq:allergAlimFaq },
  { pillarSlug:"allergie-maroc", categorySlug:"maladies-traitements", aboutEntity:"Urticaire",
    slug:"urticaire-maroc", title:"Urticaire : causes, que faire et quand consulter",
    excerpt:"Urticaire : à quoi ça ressemble, causes, formes aiguë et chronique, comment la calmer et quand c'est une urgence. Un guide clair adapté au Maroc.",
    metaTitle:"Urticaire : causes et que faire | Maroc",
    metaDesc:"Urticaire : plaques qui démangent, causes (allergie, physique, idiopathique), formes aiguë et chronique, comment la calmer et signe d'urgence (anaphylaxie). Adapté au Maroc.",
    readingTime:5, content:cUrticaire, keyTakeaways:urticaireTk, faq:urticaireFaq },

  { pillarSlug:"arthrose-maroc", categorySlug:"maladies-traitements", aboutEntity:"Gonarthrose",
    slug:"arthrose-genou-maroc", title:"Arthrose du genou (gonarthrose) : soulager et rester actif",
    excerpt:"Arthrose du genou : symptômes, rôle du surpoids, comment la soulager (activité, kiné, prothèse) et quand consulter. Un guide clair adapté au Maroc.",
    metaTitle:"Arthrose du genou (gonarthrose) : soulager | Maroc",
    metaDesc:"Arthrose du genou : symptômes, facteurs (surpoids), comment la soulager (perte de poids, activité, kiné, prothèse) et quand consulter. Guide clair adapté au Maroc.",
    readingTime:5, content:cGonarthrose, keyTakeaways:gonarthroseTk, faq:gonarthroseFaq },
  { pillarSlug:"arthrose-maroc", categorySlug:"maladies-traitements", aboutEntity:"Coxarthrose",
    slug:"arthrose-hanche-maroc", title:"Arthrose de la hanche (coxarthrose) : symptômes et solutions",
    excerpt:"Arthrose de la hanche : douleur de l'aine, facteurs, comment la soulager et efficacité de la prothèse. Un guide clair adapté au Maroc.",
    metaTitle:"Arthrose de la hanche (coxarthrose) : solutions | Maroc",
    metaDesc:"Arthrose de la hanche : douleur de l'aine à la marche, facteurs, comment la soulager (activité, perte de poids, kiné) et efficacité de la prothèse de hanche. Adapté au Maroc.",
    readingTime:5, content:cCoxarthrose, keyTakeaways:coxarthroseTk, faq:coxarthroseFaq },
  { pillarSlug:"arthrose-maroc", categorySlug:"maladies-traitements", aboutEntity:"Cervicarthrose",
    slug:"arthrose-cervicale-maroc", title:"Arthrose cervicale : douleurs de nuque et solutions",
    excerpt:"Arthrose cervicale : symptômes (nuque raide, maux de tête), postures, comment la soulager et signes qui doivent alerter. Un guide clair adapté au Maroc.",
    metaTitle:"Arthrose cervicale : douleurs de nuque et solutions | Maroc",
    metaDesc:"Arthrose cervicale : symptômes (raideur de nuque, maux de tête, irradiation au bras), rôle des postures, comment la soulager et signes d'alerte. Guide clair adapté au Maroc.",
    readingTime:5, content:cCervicarthrose, keyTakeaways:cervicTk, faq:cervicFaq },

  { pillarSlug:"migraine-maroc", categorySlug:"maladies-traitements", aboutEntity:"Migraine avec aura",
    slug:"migraine-aura-maroc", title:"Migraine avec aura : ce qu'il faut savoir",
    excerpt:"Migraine avec aura : ce qu'est l'aura, ses formes, comment la distinguer d'un AVC et que faire. Un guide clair et rassurant adapté au Maroc.",
    metaTitle:"Migraine avec aura : symptômes et que faire | Maroc",
    metaDesc:"Migraine avec aura : formes (visuelle, sensitive), durée, comment la distinguer d'un AVC et que faire. Un guide clair et rassurant adapté au Maroc.",
    readingTime:5, content:cMigAura, keyTakeaways:migAuraTk, faq:migAuraFaq },
  { pillarSlug:"migraine-maroc", categorySlug:"maladies-traitements", aboutEntity:"Migraine",
    slug:"migraine-traitement-crise-maroc", title:"Traiter une crise de migraine : agir vite et juste",
    excerpt:"Traitement de la crise de migraine : agir dès le début, antalgiques et triptans, bons réflexes et piège de l'abus d'antalgiques. Un guide clair adapté au Maroc.",
    metaTitle:"Traiter une crise de migraine : que prendre | Maroc",
    metaDesc:"Traiter une crise de migraine : agir dès les premiers signes, antalgiques et triptans, bons réflexes et piège des céphalées par abus d'antalgiques. Guide clair adapté au Maroc.",
    readingTime:5, content:cMigCrise, keyTakeaways:migCriseTk, faq:migCriseFaq },
  { pillarSlug:"migraine-maroc", categorySlug:"maladies-traitements", aboutEntity:"Migraine cataméniale",
    slug:"migraine-regles-hormonale-maroc", title:"Migraine et règles : comprendre la migraine hormonale",
    excerpt:"Migraine liée aux règles : pourquoi les hormones déclenchent les crises, comment les reconnaître, les traiter et le point sur la contraception. Adapté au Maroc.",
    metaTitle:"Migraine et règles : la migraine hormonale | Maroc",
    metaDesc:"Migraine et règles : rôle de la chute des œstrogènes, reconnaître le lien, traitement, et précautions avec la pilule en cas d'aura. Guide clair adapté au Maroc.",
    readingTime:5, content:cMigRegles, keyTakeaways:migReglesTk, faq:migReglesFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const catId = (s) => { const c = cats.find(x=>x.slug===s); if(!c) throw new Error("cat "+s); return c.id; };
  const pillarSlugs = [...new Set(SATELLITES.map(s=>s.pillarSlug))];
  const pid = {};
  for (const s of pillarSlugs) { const p = await prisma.post.update({ where:{slug:s}, data:{pillarId:null}, select:{id:true,slug:true} }); pid[s]=p.id; console.log(`◆ ${p.slug}`); }
  const now = new Date();
  for (const art of SATELLITES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:catId(art.categorySlug), metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, pillarId:pid[art.pillarSlug], reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`  ↳ ${post.slug}`);
  }
  console.log(`\nCocons vague 3 : ${pillarSlugs.length} piliers, ${SATELLITES.length} satellites.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
