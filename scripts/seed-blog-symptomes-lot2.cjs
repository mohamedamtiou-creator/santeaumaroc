require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie SYMPTÔMES — LOT 2 (la catégorie `symptomes` est créée par
// seed-blog-symptomes.cjs). Même gabarit : causes fréquentes, causes graves,
// que faire à la maison, quand consulter, QUAND APPELER LES URGENCES, examens
// possibles, traitements possibles + FAQ + À retenir. Rappel : seul un médecin
// pose un diagnostic. Fiches choisies pour retisser vers maladies/examens publiés.
//   • Essoufflement       → pneumologie
//   • Vertiges            → médecine générale (repli)
//   • Fatigue permanente  → médecine générale (repli)
//   • Palpitations        → cardiologie
//   • Nausées/vomissements→ gastro-entérologie
//   • Mal de gorge        → médecine générale (repli)
// Idempotent (upsert). Mappings CTA : lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. ESSOUFFLEMENT (DYSPNÉE)
// ─────────────────────────────────────────────────────────────────────────────
const cEssouffl = `<p>L'essoufflement (ou dyspnée) est la sensation de manquer d'air ou de respirer avec difficulté. Après un effort intense, c'est normal. Mais un essoufflement qui survient au repos, pour un effort léger, ou qui s'aggrave, doit alerter : il peut venir des poumons comme du cœur, et parfois traduire une urgence.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Mauvaise condition physique, surpoids</li>
<li>Anxiété, crise d'angoisse (respiration rapide)</li>
<li><a href="/blog/asthme-maroc">Asthme</a>, infection respiratoire (bronchite), <a href="/blog/allergie-maroc">allergie</a></li>
<li><a href="/blog/anemie-maroc">Anémie</a> (manque d'oxygène transporté)</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li><strong>Crise d'asthme grave</strong>, <strong>pneumonie</strong></li>
<li><strong>Embolie pulmonaire</strong> (caillot dans les poumons)</li>
<li><strong>Insuffisance cardiaque</strong> ou <strong>infarctus</strong></li>
<li><strong><a href="/blog/bpco-maroc">BPCO</a></strong> chez le fumeur, pneumothorax</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>S'arrêter, s'asseoir et adopter une position confortable (buste penché en avant).</li>
<li>Respirer lentement et calmement pour éviter la panique.</li>
<li>Utiliser son traitement de secours si l'on est asthmatique.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si l'essoufflement est inhabituel, survient pour des efforts de plus en plus légers, s'aggrave, ou s'accompagne d'une toux, de gonflements des jambes ou d'une fatigue anormale.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) en cas d'essoufflement :</p>
<ul>
<li><strong>Brutal ou intense, au repos</strong></li>
<li>Avec <strong>douleur dans la poitrine</strong> (voir <a href="/blog/douleur-poitrine-maroc">douleur à la poitrine</a>)</li>
<li>Avec lèvres ou ongles qui <strong>bleuissent</strong>, ou impossibilité de parler</li>
<li>Respiration très rapide qui s'épuise</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Selon le contexte : auscultation, mesure de la saturation en oxygène, <a href="/blog/electrocardiogramme-ecg-maroc">ECG</a>, radiographie du thorax, prise de sang, <a href="/blog/spirometrie-efr-maroc">spirométrie</a>, échographie du cœur.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent de la cause : traitement de l'asthme ou de la BPCO, de l'anémie, de l'insuffisance cardiaque, oxygène si nécessaire. <strong>Seul un médecin peut poser un diagnostic</strong> devant un essoufflement.</p>

<hr>
<p>Un essoufflement inhabituel ou qui s'aggrave ? Sur SantéauMaroc, trouvez un médecin ou un pneumologue près de chez vous. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;

const essFaq = [
  { q: "Quand un essoufflement est-il inquiétant ?", a: "Quand il survient au repos ou pour un effort léger, qu'il s'aggrave, ou qu'il s'accompagne d'une toux, de gonflements des jambes ou d'une fatigue anormale. Un essoufflement brutal et intense, avec douleur thoracique ou lèvres bleues, est une urgence." },
  { q: "L'essoufflement vient-il des poumons ou du cœur ?", a: "Les deux sont possibles : asthme, BPCO, pneumonie et embolie pulmonaire (poumons), mais aussi insuffisance cardiaque et infarctus (cœur). L'anémie et l'anxiété en donnent aussi. Seul un médecin, après examen, peut en déterminer la cause." },
  { q: "Que faire en cas de crise d'essoufflement ?", a: "S'arrêter, s'asseoir, adopter une position confortable et respirer lentement pour éviter la panique. Un asthmatique doit utiliser son traitement de secours. Si l'essoufflement est intense ou ne cède pas, il faut appeler les secours." },
  { q: "L'anxiété peut-elle donner un essoufflement ?", a: "Oui, l'anxiété et les crises d'angoisse provoquent souvent une respiration rapide et une sensation de manquer d'air. C'est fréquent, mais reste un diagnostic à retenir après avoir écarté une cause pulmonaire ou cardiaque." },
  { q: "Quels examens pour explorer un essoufflement ?", a: "Selon le cas : mesure de la saturation en oxygène, auscultation, ECG, radiographie du thorax, prise de sang, spirométrie (test du souffle) et échographie du cœur. Le médecin cible les examens selon les signes." },
  { q: "L'essoufflement à l'effort est-il toujours anormal ?", a: "Non : être essoufflé après un effort intense est normal. Il devient anormal quand il apparaît pour des efforts habituellement bien tolérés, au repos, ou qu'il s'aggrave dans le temps. Dans ce cas, il faut consulter." },
];
const essTakeaways = [
  "L'essoufflement est normal à l'effort intense, anormal au repos ou pour un effort léger.",
  "Il peut venir des poumons (asthme, BPCO, pneumonie, embolie) ou du cœur.",
  "Essoufflement brutal, avec douleur thoracique ou lèvres bleues = appeler les secours.",
  "Examens utiles : saturation, ECG, radio du thorax, spirométrie, écho du cœur.",
  "Seul un médecin peut en déterminer la cause : ne pas banaliser une gêne qui s'aggrave.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. VERTIGES
// ─────────────────────────────────────────────────────────────────────────────
const cVertiges = `<p>Avoir « la tête qui tourne » est une plainte très fréquente. Sous le mot vertige se cachent des sensations différentes : le vrai vertige (impression que tout tourne) et l'étourdissement (tête vide, malaise). Le plus souvent bénins, les vertiges peuvent rarement révéler un problème sérieux. Voici comment s'y retrouver.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li><strong>Vertige positionnel</strong> (bénin) : déclenché par un mouvement de tête, lié à l'oreille interne</li>
<li>Baisse de tension en se levant (hypotension), déshydratation</li>
<li>Hypoglycémie, fatigue, anxiété</li>
<li>Infection de l'oreille, <a href="/blog/migraine-maroc">migraine</a>, certains médicaments</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li><strong><a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a></strong> : vertige brutal avec troubles de la parole, de la vision, faiblesse d'un côté</li>
<li><strong>Trouble du rythme cardiaque</strong> (voir <a href="/blog/palpitations-maroc">palpitations</a>)</li>
<li>Anémie sévère</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>S'asseoir ou s'allonger dès les premiers signes, pour éviter la chute.</li>
<li>Se relever lentement, en deux temps.</li>
<li>Bien s'hydrater et manger régulièrement.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si les vertiges se répètent, persistent, sont invalidants, ou s'accompagnent de troubles de l'audition, de maux de tête ou de chutes.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) devant un vertige avec :</p>
<ul>
<li><strong>Signes d'AVC</strong> : trouble de la parole, faiblesse d'un côté, vision double, difficulté à marcher</li>
<li><strong>Maux de tête violents et soudains</strong></li>
<li><strong>Perte de connaissance</strong>, douleur thoracique ou palpitations marquées</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Selon le cas : examen clinique (dont manœuvres de l'oreille interne et examen neurologique), mesure de la tension debout et couché, prise de sang, parfois avis ORL ou imagerie.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent de la cause : manœuvres spécifiques pour le vertige positionnel, traitement d'une hypotension, d'une infection ou d'une migraine. <strong>Seul un médecin peut poser un diagnostic</strong>, surtout pour écarter une cause grave.</p>

<hr>
<p>Des vertiges gênants ou répétés ? Sur SantéauMaroc, trouvez un médecin près de chez vous. Devant des signes d'AVC, appelez immédiatement les secours.</p>`;

const vertFaq = [
  { q: "Quelle est la différence entre vertige et étourdissement ?", a: "Le vrai vertige donne l'impression que tout tourne autour de soi, souvent lié à l'oreille interne. L'étourdissement est plutôt une sensation de tête vide ou de malaise, sans rotation, souvent liée à une baisse de tension, une fatigue ou une anxiété." },
  { q: "Quand des vertiges sont-ils une urgence ?", a: "Quand ils s'accompagnent de signes d'AVC (trouble de la parole, faiblesse d'un côté, vision double, difficulté à marcher), de maux de tête violents et soudains, d'une perte de connaissance ou de palpitations marquées. Il faut alors appeler les secours." },
  { q: "Pourquoi ai-je la tête qui tourne quand je me lève ?", a: "C'est souvent une baisse de tension en passant à la position debout (hypotension orthostatique), favorisée par la déshydratation, la chaleur ou certains médicaments. Se relever lentement et bien s'hydrater aide ; si cela se répète, consultez." },
  { q: "Le vertige positionnel est-il grave ?", a: "Non, le vertige positionnel bénin est lié à l'oreille interne et se déclenche par un mouvement de tête. Il est impressionnant mais sans gravité et se traite bien, notamment par des manœuvres réalisées par un professionnel." },
  { q: "Que faire en cas de vertige à la maison ?", a: "S'asseoir ou s'allonger immédiatement pour éviter la chute, se relever ensuite lentement en deux temps, bien s'hydrater et manger régulièrement. Si les vertiges se répètent ou s'accompagnent d'autres signes, il faut consulter." },
  { q: "Les vertiges peuvent-ils venir des cervicales ou du stress ?", a: "Le stress et l'anxiété donnent souvent une sensation d'étourdissement. Les tensions cervicales peuvent aussi y contribuer. Ce sont des causes fréquentes et bénignes, à retenir après avoir écarté les autres, ce que fait le médecin." },
];
const vertTakeaways = [
  "Le vrai vertige (tout tourne) diffère de l'étourdissement (tête vide, malaise).",
  "Causes fréquentes : vertige positionnel, baisse de tension, déshydratation, migraine.",
  "Vertige brutal avec signes d'AVC ou perte de connaissance = appeler les secours.",
  "À la maison : s'asseoir, se relever lentement, s'hydrater.",
  "Seul un médecin peut poser le diagnostic et écarter une cause grave.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. FATIGUE PERMANENTE
// ─────────────────────────────────────────────────────────────────────────────
const cFatigue = `<p>« Pourquoi suis-je toujours fatigué ? » Se sentir épuisé en permanence, malgré le repos, est un motif de consultation très fréquent. La fatigue passagère est normale ; une fatigue qui dure et retentit sur la vie quotidienne mérite d'en chercher la cause — souvent simple à corriger.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Manque ou mauvaise qualité de <strong>sommeil</strong>, surmenage</li>
<li>Stress, anxiété, <a href="/blog/depression-maroc">dépression</a></li>
<li><a href="/blog/anemie-maroc">Anémie</a> (manque de fer), carences (vitamine D)</li>
<li><a href="/blog/hypothyroidie-maroc">Hypothyroïdie</a>, <a href="/blog/diabete-type-2-maroc">diabète</a></li>
<li>Infections, mode de vie déséquilibré (sédentarité, alimentation)</li>
</ul>

<h2>Les causes plus graves à explorer</h2>
<ul>
<li>Maladies chroniques (cœur, reins, foie)</li>
<li><strong>Apnées du sommeil</strong> (fatigue au réveil, ronflements)</li>
<li>Plus rarement : maladies inflammatoires, cancer</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Régulariser le <strong>sommeil</strong> (horaires, écrans le soir).</li>
<li>Pratiquer une <strong>activité physique</strong> régulière : paradoxalement, elle redonne de l'énergie.</li>
<li>Adopter une alimentation équilibrée et limiter les excitants le soir.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si la fatigue dure plus de quelques semaines, reste inexpliquée malgré le repos, ou s'accompagne d'autres signes : amaigrissement, essoufflement, fièvre, pâleur, soif intense, moral en berne.</p>

<h2>Quand consulter rapidement ?</h2>
<p>La fatigue est rarement une urgence en soi, mais consultez sans tarder si elle s'accompagne :</p>
<ul>
<li>D'un <strong>essoufflement</strong> ou d'une <strong>douleur dans la poitrine</strong></li>
<li>D'un <strong>amaigrissement</strong> important et inexpliqué</li>
<li>D'un <strong>malaise</strong> ou d'une pâleur marquée</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Souvent une <a href="/blog/analyse-de-sang-maroc">prise de sang</a> : numération (anémie), fer (ferritine), thyroïde (TSH), glycémie, parfois vitamine D. D'autres examens sont ajoutés selon les symptômes.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils visent la cause : corriger une carence, traiter une hypothyroïdie, un diabète ou une dépression, améliorer le sommeil. <strong>Seul un médecin peut poser un diagnostic</strong> : évitez l'automédication et les compléments « anti-fatigue » sans avis.</p>

<hr>
<p>Une fatigue qui dure et qui pèse sur votre quotidien ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const fatFaq = [
  { q: "Pourquoi suis-je toujours fatigué ?", a: "Les causes les plus fréquentes sont le manque de sommeil, le stress ou la dépression, l'anémie (manque de fer), une hypothyroïdie, un diabète, des carences ou un mode de vie déséquilibré. Une prise de sang et un bilan par le médecin aident à identifier la cause." },
  { q: "Quand faut-il s'inquiéter d'une fatigue ?", a: "Quand elle dure plus de quelques semaines, reste inexpliquée malgré le repos, ou s'accompagne d'un amaigrissement, d'un essoufflement, d'une fièvre, d'une pâleur ou d'une soif intense. Ces situations justifient de consulter pour un bilan." },
  { q: "Quels examens pour une fatigue persistante ?", a: "Le plus souvent une prise de sang : numération (recherche d'anémie), ferritine (réserves en fer), TSH (thyroïde), glycémie, parfois vitamine D. Le médecin ajoute d'autres examens selon les symptômes associés." },
  { q: "Le sport aide-t-il vraiment contre la fatigue ?", a: "Oui, paradoxalement. Une activité physique régulière et adaptée améliore le sommeil, l'humeur et le niveau d'énergie. La sédentarité, à l'inverse, entretient la fatigue. Il s'agit de reprendre progressivement, sans excès." },
  { q: "La fatigue peut-elle être due à la thyroïde ?", a: "Oui. L'hypothyroïdie (thyroïde qui fonctionne au ralenti) est une cause fréquente de fatigue, souvent avec prise de poids, frilosité et constipation. Une simple prise de sang (TSH) permet de le vérifier." },
  { q: "Les compléments « anti-fatigue » sont-ils utiles ?", a: "Pas sans avis médical. Prendre du fer ou des vitamines sans bilan peut être inutile, voire nuisible, et retarder le diagnostic de la vraie cause. Mieux vaut identifier la cause avec un médecin avant de se supplémenter." },
];
const fatTakeaways = [
  "Une fatigue passagère est normale ; une fatigue durable justifie d'en chercher la cause.",
  "Causes fréquentes : sommeil, stress/dépression, anémie, hypothyroïdie, diabète, carences.",
  "Une prise de sang (numération, ferritine, TSH, glycémie) oriente souvent le diagnostic.",
  "L'activité physique régulière redonne de l'énergie ; la sédentarité entretient la fatigue.",
  "Fatigue avec amaigrissement, essoufflement ou pâleur = consulter rapidement.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. PALPITATIONS
// ─────────────────────────────────────────────────────────────────────────────
const cPalp = `<p>Sentir son cœur battre fort, vite ou de façon irrégulière : les palpitations sont une sensation fréquente et le plus souvent bénigne. Elles peuvent cependant, dans certains cas, traduire un trouble du rythme cardiaque. Savoir les décrire et repérer les signes d'alerte aide le médecin à faire le tri.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Stress, anxiété, émotion, effort physique</li>
<li>Excitants : café, thé fort, boissons énergisantes, tabac</li>
<li>Fièvre, hypoglycémie, <a href="/blog/anemie-maroc">anémie</a></li>
<li>Excès d'hormones thyroïdiennes (hyperthyroïdie), certains médicaments</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li><strong>Troubles du rythme cardiaque</strong> (comme la fibrillation auriculaire, les tachycardies)</li>
<li>Maladie cardiaque sous-jacente</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>S'asseoir, se reposer et respirer calmement.</li>
<li>Réduire café, thé fort, boissons énergisantes et tabac.</li>
<li>Noter les circonstances (repos ou effort, durée, régularité) : utile pour le médecin.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si les palpitations sont fréquentes, prolongées, reviennent régulièrement, sont mal tolérées, ou surviennent chez une personne ayant une maladie ou des antécédents cardiaques.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) si les palpitations s'accompagnent de :</p>
<ul>
<li><strong>Douleur dans la poitrine</strong> (voir <a href="/blog/douleur-poitrine-maroc">douleur à la poitrine</a>)</li>
<li><strong>Essoufflement</strong> important</li>
<li><strong>Malaise, perte de connaissance</strong> ou vertige intense</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Le plus souvent un <a href="/blog/electrocardiogramme-ecg-maroc">électrocardiogramme (ECG)</a>, complété si besoin par un Holter (enregistrement du cœur sur 24 h ou plus), une prise de sang (dont la thyroïde) et une échographie du cœur.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent de la cause : réduire les excitants et le stress suffit souvent ; un vrai trouble du rythme relève d'un traitement cardiologique spécifique. <strong>Seul un médecin peut poser un diagnostic.</strong></p>

<hr>
<p>Des palpitations fréquentes ou mal tolérées ? Sur SantéauMaroc, trouvez un cardiologue près de chez vous. Devant une douleur thoracique ou un malaise, appelez immédiatement les secours.</p>`;

const palpFaq = [
  { q: "Les palpitations sont-elles dangereuses ?", a: "Le plus souvent non : elles sont fréquentes et bénignes, favorisées par le stress, les excitants ou l'effort. Elles deviennent préoccupantes si elles sont prolongées, mal tolérées, ou accompagnées de douleur thoracique, d'essoufflement ou de malaise." },
  { q: "Qu'est-ce qui provoque des palpitations ?", a: "Souvent le stress, l'anxiété, l'effort, la caféine, les boissons énergisantes ou le tabac. La fièvre, l'anémie et un excès d'hormones thyroïdiennes en donnent aussi. Plus rarement, elles traduisent un trouble du rythme cardiaque." },
  { q: "Quand des palpitations sont-elles une urgence ?", a: "Quand elles s'accompagnent d'une douleur dans la poitrine, d'un essoufflement important, d'un malaise, d'une perte de connaissance ou d'un vertige intense. Il faut alors appeler les secours sans attendre." },
  { q: "Quel examen pour explorer des palpitations ?", a: "L'électrocardiogramme (ECG) est l'examen de base. S'il est normal alors que les palpitations sont intermittentes, un Holter (enregistrement sur 24 h ou plus) peut les capter. Une prise de sang (thyroïde) et une échographie du cœur complètent parfois le bilan." },
  { q: "Le stress peut-il donner des palpitations ?", a: "Oui, très souvent. Le stress et l'anxiété accélèrent le cœur et rendent ses battements plus perceptibles. C'est une cause fréquente et bénigne, à retenir après avoir écarté un trouble du rythme, ce que le médecin vérifie." },
  { q: "Le café donne-t-il des palpitations ?", a: "Chez certaines personnes, oui : la caféine, le thé fort, les boissons énergisantes et le tabac peuvent déclencher ou aggraver des palpitations. Les réduire est souvent la première mesure, avant tout autre traitement." },
];
const palpTakeaways = [
  "Les palpitations (cœur qui bat fort, vite ou irrégulier) sont fréquentes et souvent bénignes.",
  "Causes courantes : stress, excitants (café, tabac), effort, fièvre, anémie, thyroïde.",
  "Palpitations avec douleur thoracique, essoufflement ou malaise = appeler les secours.",
  "L'ECG (parfois complété d'un Holter) est l'examen clé.",
  "Réduire café, tabac et stress suffit souvent ; le médecin écarte un trouble du rythme.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. NAUSÉES ET VOMISSEMENTS
// ─────────────────────────────────────────────────────────────────────────────
const cNausees = `<p>Les nausées (envie de vomir) et les vomissements sont des symptômes très courants, le plus souvent liés à une cause bénigne et passagère comme une gastro-entérite. Parfois, ils accompagnent une affection plus sérieuse. L'essentiel est d'éviter la déshydratation et de repérer les signes qui imposent de consulter.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Gastro-entérite, intoxication ou indigestion alimentaire</li>
<li><a href="/blog/migraine-maroc">Migraine</a>, mal des transports</li>
<li>Grossesse (premiers mois)</li>
<li>Stress, excès d'alcool, certains médicaments</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li>Urgence abdominale : appendicite, occlusion (voir <a href="/blog/mal-au-ventre-maroc">mal de ventre</a>)</li>
<li><strong>Méningite</strong> (avec <a href="/blog/mal-de-tete-maroc">maux de tête</a> violents, fièvre, raideur de la nuque)</li>
<li>Problème cardiaque (un infarctus peut donner des nausées), AVC</li>
<li>Augmentation de la pression dans le crâne (après un traumatisme)</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Se reposer et <strong>boire par petites gorgées</strong> pour éviter la déshydratation.</li>
<li>Réintroduire progressivement une alimentation légère (riz, banane, bouillon).</li>
<li>Éviter les odeurs fortes, les aliments gras et l'alcool.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si les vomissements durent plus de 24 à 48 heures, empêchent de boire, entraînent des signes de déshydratation (bouche sèche, urines rares, grande faiblesse), ou surviennent chez une personne fragile, âgée, un enfant ou une femme enceinte.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) en cas de vomissements avec :</p>
<ul>
<li><strong>Sang</strong> (rouge ou « marc de café ») ou selles noires</li>
<li><strong>Douleur abdominale intense</strong> ou ventre dur</li>
<li><strong>Maux de tête violents avec fièvre et raideur de la nuque</strong></li>
<li>Après un <strong>traumatisme crânien</strong>, ou avec confusion et forte déshydratation</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Souvent aucun pour une cause bénigne. Sinon, selon le contexte : examen clinique, prise de sang, bandelette urinaire, échographie ou autres examens ciblés.</p>

<h2>Quels traitements possibles ?</h2>
<p>La priorité est la <strong>réhydratation</strong>. Des médicaments contre les nausées (antiémétiques) peuvent aider, et le traitement vise ensuite la cause. <strong>Seul un médecin peut poser un diagnostic</strong> en cas de vomissements persistants ou inquiétants.</p>

<hr>
<p>Des nausées ou vomissements qui durent ou inquiètent ? Sur SantéauMaroc, trouvez un médecin près de chez vous. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;

const nauFaq = [
  { q: "Que faire en cas de vomissements ?", a: "Se reposer et boire par petites gorgées pour éviter la déshydratation, puis réintroduire progressivement une alimentation légère (riz, banane, bouillon) en évitant les aliments gras, les odeurs fortes et l'alcool. Si cela dure ou s'aggrave, consultez." },
  { q: "Quand des vomissements sont-ils une urgence ?", a: "En cas de sang dans les vomissements (rouge ou « marc de café »), de selles noires, de douleur abdominale intense, de maux de tête violents avec fièvre et raideur de la nuque, après un traumatisme crânien, ou avec une forte déshydratation. Il faut appeler les secours." },
  { q: "Combien de temps durent des vomissements bénins ?", a: "Ceux d'une gastro-entérite ou d'une indigestion durent en général de quelques heures à un ou deux jours. Au-delà de 24 à 48 heures, s'ils empêchent de boire ou s'accompagnent de signes de déshydratation, il faut consulter." },
  { q: "Comment éviter la déshydratation quand on vomit ?", a: "En buvant très régulièrement de petites quantités de liquide (eau, solution de réhydratation), même par petites gorgées, plutôt qu'une grande quantité d'un coup. Surveillez les signes de déshydratation : bouche sèche, urines rares, faiblesse importante." },
  { q: "Les nausées sont-elles normales pendant la grossesse ?", a: "Oui, les nausées et vomissements sont fréquents durant les premiers mois de grossesse et généralement bénins. Ils doivent toutefois amener à consulter s'ils sont sévères, empêchent de s'alimenter ou entraînent une perte de poids." },
  { q: "Un infarctus peut-il donner des nausées ?", a: "Oui, un infarctus peut se manifester par des nausées, surtout associées à une douleur ou une oppression dans la poitrine, des sueurs et un essoufflement. Devant ces signes, il faut appeler les secours sans attendre." },
];
const nauTakeaways = [
  "Nausées et vomissements sont le plus souvent bénins (gastro, indigestion, migraine, grossesse).",
  "La priorité à la maison : boire par petites gorgées pour éviter la déshydratation.",
  "Sang dans les vomissements, douleur abdominale intense ou maux de tête + raideur de nuque = urgence.",
  "Consulter si cela dure plus de 24-48 h ou chez une personne fragile.",
  "Seul un médecin peut poser un diagnostic devant des vomissements persistants.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAL DE GORGE
// ─────────────────────────────────────────────────────────────────────────────
const cGorge = `<p>Le mal de gorge est l'un des symptômes les plus courants, surtout en hiver. Le plus souvent dû à un virus, il guérit spontanément en quelques jours. Les antibiotiques n'y sont utiles que dans certains cas d'angine bactérienne. Voici comment le soulager et savoir quand consulter.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Angine et pharyngite <strong>virales</strong> (la grande majorité), rhume</li>
<li>Angine <strong>bactérienne</strong> (streptocoque), plus fréquente chez l'enfant et l'adolescent</li>
<li>Laryngite, air sec, tabac, cris ou forçage de la voix</li>
<li><a href="/blog/reflux-gastro-oesophagien-maroc">Reflux</a>, <a href="/blog/allergie-maroc">allergie</a></li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li>Angine bactérienne compliquée, <strong>abcès de la gorge</strong> (phlegmon)</li>
<li>Difficulté à respirer ou à avaler sa salive (rare mais urgent)</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Boire chaud, sucer des pastilles, bien s'hydrater.</li>
<li>Prendre un antalgique simple (paracétamol) contre la douleur et la fièvre.</li>
<li>Reposer sa voix, humidifier l'air, éviter le tabac.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si le mal de gorge est intense, dure plus d'une semaine, s'accompagne d'une forte fièvre, de ganglions, d'une difficulté à avaler, d'une éruption cutanée, ou s'il revient souvent.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) en cas de :</p>
<ul>
<li><strong>Difficulté à respirer</strong> ou à avaler sa salive</li>
<li><strong>Voix étouffée</strong>, bave, gonflement du cou</li>
<li>Forte fièvre avec état général très altéré</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>L'examen de la gorge suffit souvent. Un <strong>test rapide (TDR)</strong> peut rechercher le streptocoque pour décider si des antibiotiques sont nécessaires, en particulier chez l'enfant.</p>

<h2>Quels traitements possibles ?</h2>
<p>La plupart des maux de gorge, viraux, se soignent par des antalgiques et guérissent seuls. Les <strong>antibiotiques ne servent qu'en cas d'angine bactérienne confirmée</strong>, sur avis médical — les prendre inutilement est déconseillé. <strong>Seul un médecin peut poser un diagnostic.</strong></p>

<hr>
<p>Un mal de gorge intense, fébrile ou qui traîne ? Sur SantéauMaroc, trouvez un médecin près de chez vous. En cas de difficulté à respirer ou à avaler, appelez immédiatement les secours.</p>`;

const gorgeFaq = [
  { q: "Faut-il des antibiotiques pour un mal de gorge ?", a: "Pas dans la majorité des cas, car la plupart des maux de gorge sont viraux et guérissent seuls. Les antibiotiques ne sont utiles qu'en cas d'angine bactérienne (streptocoque), idéalement confirmée par un test rapide, sur avis médical." },
  { q: "Comment soulager un mal de gorge à la maison ?", a: "En buvant chaud, en suçant des pastilles, en s'hydratant bien, en prenant un antalgique simple (paracétamol) contre la douleur et la fièvre, en reposant sa voix, en humidifiant l'air et en évitant le tabac." },
  { q: "Comment savoir si mon angine est virale ou bactérienne ?", a: "L'examen clinique oriente, mais seul un test rapide de dépistage du streptocoque (TDR) permet de trancher de façon fiable, en particulier chez l'enfant. C'est lui qui indique si des antibiotiques sont nécessaires." },
  { q: "Combien de temps dure un mal de gorge ?", a: "Un mal de gorge viral dure en général quelques jours (3 à 5). S'il persiste au-delà d'une semaine, s'intensifie, ou s'accompagne d'une forte fièvre, de ganglions ou d'une difficulté à avaler, il faut consulter." },
  { q: "Quand un mal de gorge est-il une urgence ?", a: "En cas de difficulté à respirer, à avaler sa salive, de voix étouffée, de bave, de gonflement du cou ou d'un état général très altéré. Ces signes, rares, imposent d'appeler les secours immédiatement." },
  { q: "Un mal de gorge peut-il venir de l'estomac ?", a: "Oui, le reflux gastro-œsophagien peut irriter la gorge et donner une gêne ou une douleur, souvent le matin, sans infection. L'allergie et l'air sec sont d'autres causes non infectieuses fréquentes de mal de gorge." },
];
const gorgeTakeaways = [
  "Le mal de gorge est le plus souvent viral et guérit seul en quelques jours.",
  "Les antibiotiques ne servent qu'en cas d'angine bactérienne (streptocoque) confirmée.",
  "À la maison : boire chaud, pastilles, antalgique simple, repos de la voix.",
  "Difficulté à respirer ou à avaler sa salive, voix étouffée = urgence.",
  "Seul un médecin peut poser un diagnostic ; un test rapide guide les antibiotiques.",
];

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DES FICHES
// ─────────────────────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    slug: "essoufflement-dyspnee-maroc",
    aboutEntity: "Dyspnée",
    title: "Essoufflement : causes, que faire et quand s'inquiéter",
    excerpt: "Essoufflement (dyspnée) : causes fréquentes et graves (cœur, poumons), que faire, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc, sans remplacer l'avis d'un médecin.",
    content: cEssouffl,
    metaTitle: "Essoufflement : causes et quand s'inquiéter | Maroc",
    metaDesc: "Essoufflement (dyspnée) : causes fréquentes et graves (asthme, cœur, embolie), que faire, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    readingTime: 5,
    keyTakeaways: essTakeaways,
    faq: essFaq,
  },
  {
    slug: "vertiges-maroc",
    aboutEntity: "Vertige",
    title: "Vertiges : causes, que faire et quand consulter",
    excerpt: "Vertiges et tête qui tourne : causes fréquentes et graves, que faire à la maison, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    content: cVertiges,
    metaTitle: "Vertiges : causes, que faire et quand consulter | Maroc",
    metaDesc: "Vertiges : différence avec l'étourdissement, causes fréquentes et graves (AVC), que faire à la maison, quand consulter et quand appeler les urgences. Adapté au Maroc.",
    readingTime: 5,
    keyTakeaways: vertTakeaways,
    faq: vertFaq,
  },
  {
    slug: "fatigue-permanente-maroc",
    aboutEntity: "Fatigue",
    title: "Fatigue permanente : pourquoi suis-je toujours fatigué ?",
    excerpt: "Toujours fatigué ? Causes fréquentes (sommeil, anémie, thyroïde, dépression), examens utiles, que faire et quand consulter. Guide clair adapté au Maroc, sans remplacer l'avis d'un médecin.",
    content: cFatigue,
    metaTitle: "Fatigue permanente : pourquoi et que faire ? | Maroc",
    metaDesc: "Pourquoi suis-je toujours fatigué ? Causes fréquentes (sommeil, anémie, thyroïde, diabète, dépression), examens (prise de sang), que faire et quand consulter. Adapté au Maroc.",
    readingTime: 5,
    keyTakeaways: fatTakeaways,
    faq: fatFaq,
  },
  {
    slug: "palpitations-maroc",
    aboutEntity: "Palpitations",
    title: "Palpitations : causes, que faire et quand consulter",
    excerpt: "Palpitations (cœur qui bat fort ou vite) : causes fréquentes et graves, que faire, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    content: cPalp,
    metaTitle: "Palpitations : causes et quand s'inquiéter | Maroc",
    metaDesc: "Palpitations : causes fréquentes (stress, café, thyroïde) et graves (troubles du rythme), que faire, quand consulter et quand appeler les urgences. Adapté au Maroc.",
    readingTime: 5,
    keyTakeaways: palpTakeaways,
    faq: palpFaq,
  },
  {
    slug: "nausees-vomissements-maroc",
    aboutEntity: "Nausées et vomissements",
    title: "Nausées et vomissements : causes, que faire et quand consulter",
    excerpt: "Nausées et vomissements : causes fréquentes et graves, comment éviter la déshydratation, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    content: cNausees,
    metaTitle: "Nausées et vomissements : que faire et quand consulter | Maroc",
    metaDesc: "Nausées et vomissements : causes fréquentes et graves, comment éviter la déshydratation, quand consulter et quand appeler les urgences (sang, douleur intense). Adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: nauTakeaways,
    faq: nauFaq,
  },
  {
    slug: "mal-de-gorge-maroc",
    aboutEntity: "Mal de gorge",
    title: "Mal de gorge : causes, que faire et faut-il des antibiotiques ?",
    excerpt: "Mal de gorge : causes fréquentes (angine virale ou bactérienne), quand des antibiotiques sont utiles, que faire à la maison, quand consulter et quand appeler les urgences. Adapté au Maroc.",
    content: cGorge,
    metaTitle: "Mal de gorge : que faire et antibiotiques ? | Maroc",
    metaDesc: "Mal de gorge : causes (angine virale ou bactérienne), quand des antibiotiques sont utiles, comment le soulager, quand consulter et signes d'urgence. Guide clair adapté au Maroc.",
    readingTime: 5,
    keyTakeaways: gorgeTakeaways,
    faq: gorgeFaq,
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.findUnique({ where: { slug: "symptomes" }, select: { id: true } });
  if (!cat) { console.error("Catégorie 'symptomes' introuvable — lancer d'abord seed-blog-symptomes.cjs."); process.exit(1); }

  const now = new Date();

  for (const art of ARTICLES) {
    const data = {
      title:        art.title,
      excerpt:      art.excerpt,
      content:      art.content,
      categoryId:   cat.id,
      metaTitle:    art.metaTitle,
      metaDesc:     art.metaDesc,
      readingTime:  art.readingTime,
      keyTakeaways: art.keyTakeaways.join("\n"),
      faqJson:      JSON.stringify(art.faq),
      aboutEntity:  art.aboutEntity,
      reviewedById: admin.id,
      reviewedAt:   now,
    };
    const post = await prisma.post.upsert({
      where: { slug: art.slug },
      update: data,
      create: {
        ...data,
        slug:        art.slug,
        authorId:    admin.id,
        status:      "PUBLISHED",
        publishedAt: now,
      },
      select: { slug: true },
    });
    console.log(`✓ Symptôme  /blog/${post.slug}`);
  }

  console.log(`\nSymptômes lot 2 : ${ARTICLES.length} fiches publiées.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
