require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// DENSIFICATION EN COCONS — vague 5 : Reflux (RGO), Insuffisance rénale, Goutte.
//   • Reflux (reflux-gastro-oesophagien-maroc) → gastro (nourrisson → pédiatrie)
//   • Insuffisance rénale (insuffisance-renale-maroc) → médecine générale
//   • Goutte (goutte-maroc) → médecine générale
// Idempotent (upsert). Mappings : lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ═══ REFLUX ═══════════════════════════════════════════════════════════════════
const cRefluxAlim = `<p>Contre le reflux, les mesures d'hygiène de vie sont souvent aussi importantes que les médicaments. Adapter son alimentation et quelques habitudes suffit parfois à faire disparaître les brûlures du <a href="/blog/reflux-gastro-oesophagien-maroc">reflux gastro-œsophagien</a>.</p>

<h2>Les aliments qui favorisent le reflux</h2>
<ul>
<li>Repas gras, copieux, fritures</li>
<li>Café, thé fort, boissons gazeuses, alcool</li>
<li>Chocolat, menthe, plats épicés, agrumes chez certains</li>
</ul>

<h2>Les bons réflexes à table</h2>
<ul>
<li>Manger lentement, en quantités modérées, sans repas trop tardif.</li>
<li>Attendre 2 à 3 heures avant de s'allonger après manger.</li>
<li>Repérer ses aliments déclencheurs, variables d'une personne à l'autre.</li>
</ul>

<h2>Au-delà de l'assiette</h2>
<ul>
<li><strong>Surélever la tête du lit</strong> (et non ajouter des oreillers).</li>
<li>Perdre du poids en cas de surpoids : très efficace.</li>
<li>Arrêter le tabac, éviter les vêtements trop serrés à la taille.</li>
</ul>

<p>Si ces mesures ne suffisent pas, un traitement (comme l'<a href="/blog/omeprazole-maroc">oméprazole</a>) peut être ajouté, sur avis médical.</p>

<hr>
<p>Un reflux gênant malgré ces mesures ? Sur SantéauMaroc, trouvez un médecin ou un gastro-entérologue près de chez vous.</p>`;
const refluxAlimFaq = [
  { q: "Quels aliments éviter en cas de reflux ?", a: "Les repas gras et copieux, les fritures, le café, le thé fort, les boissons gazeuses, l'alcool, et chez certains le chocolat, la menthe, les plats épicés ou les agrumes. Les déclencheurs varient d'une personne à l'autre : il faut repérer les siens." },
  { q: "Comment dormir quand on a du reflux ?", a: "En surélevant la tête du lit (en inclinant le sommier plutôt qu'en empilant les oreillers) et en évitant de s'allonger dans les 2 à 3 heures après un repas. Un dîner léger et pas trop tardif aide aussi à limiter les remontées nocturnes." },
  { q: "Perdre du poids aide-t-il contre le reflux ?", a: "Oui, nettement, en cas de surpoids : la perte de poids réduit la pression sur l'estomac et diminue les remontées acides. C'est l'une des mesures les plus efficaces, avec l'arrêt du tabac et l'adaptation des repas." },
  { q: "Les mesures alimentaires suffisent-elles pour le reflux ?", a: "Souvent pour un reflux léger ou occasionnel. Si les brûlures persistent malgré ces mesures, un traitement antiacide (comme l'oméprazole) peut être ajouté sur avis médical. Des signes d'alerte imposent une consultation." },
  { q: "Le stress aggrave-t-il le reflux ?", a: "Le stress peut majorer la perception des symptômes et de mauvaises habitudes (repas rapides, tabac). Le gérer, avec les mesures alimentaires et de mode de vie, contribue à réduire l'inconfort du reflux." },
];
const refluxAlimTk = [
  "Les mesures d'hygiène de vie sont centrales contre le reflux.",
  "Éviter repas gras/copieux, café, alcool, et s'allonger juste après manger.",
  "Surélever la tête du lit, perdre du poids, arrêter le tabac.",
  "Si insuffisant, un antiacide (oméprazole) peut être ajouté sur avis.",
];

const cRefluxNourrisson = `<p>Les régurgitations du nourrisson sont très fréquentes et le plus souvent bénignes : on parle de reflux « physiologique ». Il faut savoir le distinguer des rares situations qui nécessitent un avis médical.</p>

<h2>Reflux « normal » du bébé</h2>
<p>Beaucoup de bébés régurgitent après les biberons ou les tétées, sans être gênés, et prennent bien du poids : c'est banal et cela s'améliore avec l'âge, surtout après l'acquisition de la position assise et la diversification.</p>

<h2>Les gestes qui aident</h2>
<ul>
<li>Fractionner les repas, faire faire le rot, ne pas suralimenter.</li>
<li>Garder le bébé un moment en position verticale après le repas.</li>
<li>Suivre les conseils du pédiatre pour l'épaississement éventuel du lait.</li>
</ul>

<h2>Quand consulter ?</h2>
<blockquote>Attention : consultez si le bébé pleure beaucoup et semble souffrir, refuse de manger, ne prend pas de poids, vomit en jet, présente du sang dans les régurgitations, une gêne respiratoire ou un malaise. Ces situations ne sont pas un simple reflux banal.</blockquote>

<h2>Faut-il un traitement ?</h2>
<p>Le reflux physiologique ne nécessite pas de médicament : il faut surtout rassurer et appliquer les mesures de position et d'alimentation. Un traitement n'est envisagé que dans les formes gênantes, sur décision du pédiatre. Voir aussi la fiche <a href="/blog/reflux-gastro-oesophagien-maroc">reflux</a>.</p>

<hr>
<p>Un bébé gêné par ses régurgitations ? Sur SantéauMaroc, trouvez un pédiatre près de chez vous et prenez rendez-vous en ligne.</p>`;
const refluxNourrissonFaq = [
  { q: "Les régurgitations de bébé sont-elles normales ?", a: "Oui, elles sont très fréquentes et le plus souvent bénignes (reflux physiologique), surtout si le bébé ne semble pas gêné et prend bien du poids. Elles s'améliorent avec l'âge, notamment après la position assise et la diversification." },
  { q: "Comment réduire le reflux du nourrisson ?", a: "En fractionnant les repas, en faisant faire le rot, en évitant de suralimenter et en gardant le bébé en position verticale un moment après le repas. Le pédiatre peut conseiller un lait épaissi dans certains cas." },
  { q: "Quand s'inquiéter du reflux d'un bébé ?", a: "S'il pleure beaucoup et semble souffrir, refuse de manger, ne prend pas de poids, vomit en jet, présente du sang dans les régurgitations, une gêne respiratoire ou un malaise. Ces signes ne relèvent pas d'un simple reflux banal et imposent de consulter." },
  { q: "Faut-il un médicament pour le reflux du bébé ?", a: "Le reflux physiologique ne nécessite pas de médicament : les mesures de position et d'alimentation, et le fait de rassurer les parents, suffisent le plus souvent. Un traitement n'est envisagé que dans les formes gênantes, sur décision du pédiatre." },
  { q: "Le reflux du nourrisson disparaît-il ?", a: "Oui, dans la grande majorité des cas il s'améliore spontanément avec l'âge, surtout après l'acquisition de la position assise et le passage à une alimentation diversifiée. La patience et les bons gestes suffisent généralement." },
];
const refluxNourrissonTk = [
  "Les régurgitations du nourrisson sont fréquentes et le plus souvent bénignes.",
  "Gestes utiles : fractionner, faire le rot, position verticale après le repas.",
  "Consulter si le bébé souffre, ne grossit pas, vomit en jet ou a du sang.",
  "Pas de médicament pour le reflux physiologique : rassurer et adapter.",
];

const cHernieHiatale = `<p>La hernie hiatale est le glissement d'une partie de l'estomac vers le thorax, à travers l'orifice du diaphragme. Très fréquente, souvent sans symptôme, elle est surtout connue pour favoriser le <a href="/blog/reflux-gastro-oesophagien-maroc">reflux</a>.</p>

<h2>Qu'est-ce que c'est ?</h2>
<p>Normalement, l'estomac reste sous le diaphragme. Dans la hernie hiatale, une partie remonte dans le thorax par l'orifice (le hiatus) où passe l'œsophage. Cela peut affaiblir la barrière anti-reflux.</p>

<h2>Quels symptômes ?</h2>
<p>Souvent <strong>aucun</strong>. Quand elle se manifeste, c'est surtout par les signes du reflux : brûlures remontant derrière le sternum, régurgitations acides, parfois gêne.</p>

<h2>Comment la découvre-t-on ?</h2>
<p>Souvent par hasard, lors d'une <a href="/blog/gastroscopie-maroc">fibroscopie</a> ou d'un examen d'imagerie réalisé pour une autre raison.</p>

<h2>Que faire ?</h2>
<ul>
<li>Les <a href="/blog/reflux-alimentation-mesures-maroc">mesures anti-reflux</a> et, si besoin, un traitement antiacide.</li>
<li>La chirurgie est réservée aux formes gênantes ou compliquées résistant au traitement.</li>
</ul>
<p>Une hernie hiatale sans symptôme ne nécessite en général aucun traitement particulier.</p>

<hr>
<p>Une hernie hiatale et du reflux gênant ? Sur SantéauMaroc, trouvez un gastro-entérologue près de chez vous.</p>`;
const hernieFaq = [
  { q: "Qu'est-ce qu'une hernie hiatale ?", a: "C'est le glissement d'une partie de l'estomac vers le thorax, à travers l'orifice du diaphragme (le hiatus) où passe l'œsophage. Très fréquente, elle peut affaiblir la barrière anti-reflux et favoriser les remontées acides." },
  { q: "La hernie hiatale est-elle grave ?", a: "Le plus souvent non : elle est fréquente et souvent sans symptôme. Elle est surtout gênante par le reflux qu'elle peut favoriser. Les formes compliquées, plus rares, peuvent nécessiter une prise en charge spécifique." },
  { q: "Quels sont les symptômes d'une hernie hiatale ?", a: "Souvent aucun. Quand elle se manifeste, c'est surtout par les signes du reflux : brûlures remontant derrière le sternum, régurgitations acides, parfois gêne. Elle est fréquemment découverte par hasard lors d'un examen." },
  { q: "Comment traiter une hernie hiatale ?", a: "Par les mesures anti-reflux (alimentation, position, perte de poids) et, si besoin, un traitement antiacide. La chirurgie est réservée aux formes gênantes ou compliquées résistant au traitement. Sans symptôme, aucun traitement particulier n'est nécessaire." },
  { q: "Faut-il opérer une hernie hiatale ?", a: "Non dans la plupart des cas. La chirurgie n'est envisagée que pour les formes très gênantes ou compliquées qui résistent au traitement médical. La décision se prend avec le gastro-entérologue selon les symptômes et les examens." },
];
const hernieTk = [
  "La hernie hiatale = remontée d'une partie de l'estomac dans le thorax.",
  "Très fréquente, souvent sans symptôme ; surtout liée au reflux.",
  "Souvent découverte par hasard (fibroscopie, imagerie).",
  "Traitement = mesures anti-reflux ± antiacide ; chirurgie rare.",
];

// ═══ INSUFFISANCE RÉNALE ══════════════════════════════════════════════════════
const cDialyse = `<p>La dialyse est un traitement qui remplace la fonction des reins lorsqu'ils ne suffisent plus, au stade terminal de l'<a href="/blog/insuffisance-renale-maroc">insuffisance rénale</a>. Elle filtre le sang à la place des reins et permet de vivre, en attendant parfois une greffe.</p>

<h2>Pourquoi la dialyse ?</h2>
<p>Quand les reins ne parviennent plus à éliminer les déchets et l'eau (insuffisance rénale terminale), la dialyse prend le relais pour maintenir l'équilibre du corps.</p>

<h2>Les deux méthodes</h2>
<ul>
<li><strong>Hémodialyse</strong> : le sang est filtré par une machine (rein artificiel), généralement en centre, plusieurs fois par semaine, quelques heures par séance.</li>
<li><strong>Dialyse péritonéale</strong> : le filtrage se fait à l'intérieur du ventre, souvent à domicile, à l'aide d'un liquide changé plusieurs fois par jour.</li>
</ul>

<h2>Vivre avec la dialyse</h2>
<p>La dialyse impose un rythme et des contraintes (alimentation, boissons, séances), mais permet de poursuivre une vie sociale et, souvent, une activité. Un accompagnement diététique et psychologique aide beaucoup.</p>

<h2>Et la greffe ?</h2>
<p>La <strong>greffe de rein</strong> est l'autre solution de suppléance, offrant souvent une meilleure qualité de vie. Elle n'est pas possible pour tous et dépend de nombreux facteurs, évalués par l'équipe médicale.</p>

<hr>
<p>Une insuffisance rénale à suivre ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const dialyseFaq = [
  { q: "Qu'est-ce que la dialyse ?", a: "C'est un traitement qui filtre le sang à la place des reins défaillants, au stade terminal de l'insuffisance rénale. Elle élimine les déchets et l'excès d'eau que les reins ne peuvent plus évacuer, pour maintenir l'équilibre du corps." },
  { q: "Quelles sont les méthodes de dialyse ?", a: "L'hémodialyse, où le sang est filtré par une machine (souvent en centre, plusieurs fois par semaine), et la dialyse péritonéale, où le filtrage se fait dans le ventre à l'aide d'un liquide, souvent à domicile. Le choix dépend de la situation médicale et de la vie du patient." },
  { q: "Peut-on vivre normalement sous dialyse ?", a: "La dialyse impose des contraintes (séances, alimentation, boissons), mais permet de poursuivre une vie sociale et souvent une activité. Un accompagnement diététique et psychologique aide à mieux vivre le traitement au quotidien." },
  { q: "Dialyse ou greffe de rein ?", a: "La greffe de rein est l'autre solution de suppléance et offre souvent une meilleure qualité de vie, mais elle n'est pas possible pour tous et dépend de nombreux facteurs. L'équipe médicale évalue la meilleure option pour chaque patient." },
  { q: "La dialyse est-elle définitive ?", a: "Elle l'est tant que les reins ne fonctionnent plus, sauf en cas de greffe réussie qui prend le relais. Dans l'insuffisance rénale aiguë (réversible), la dialyse peut n'être que temporaire, le temps que les reins récupèrent." },
];
const dialyseTk = [
  "La dialyse remplace les reins au stade terminal de l'insuffisance rénale.",
  "Deux méthodes : hémodialyse (en centre) et dialyse péritonéale (souvent à domicile).",
  "Elle impose des contraintes mais permet de poursuivre une vie active.",
  "La greffe de rein est l'autre solution, avec souvent une meilleure qualité de vie.",
];

const cReinAlim = `<p>En cas de maladie rénale, l'alimentation fait partie du traitement : bien adaptée, elle aide à ralentir l'évolution de l'<a href="/blog/insuffisance-renale-maroc">insuffisance rénale</a> et à limiter les complications. Les conseils sont personnalisés selon le stade.</p>

<h2>Pourquoi l'alimentation compte</h2>
<p>Des reins fatigués éliminent moins bien le sel, certains minéraux et les déchets. Adapter l'alimentation soulage les reins et prévient des déséquilibres (tension, potassium, phosphore).</p>

<h2>Les grands principes</h2>
<ul>
<li><strong>Réduire le sel</strong> : essentiel pour la tension et la rétention d'eau.</li>
<li>Adapter les <strong>protéines</strong> selon le stade et l'avis médical (ni trop, ni pas assez).</li>
<li>Surveiller <strong>potassium et phosphore</strong> aux stades avancés (certains fruits, légumes, produits laitiers), sur conseil.</li>
<li>Gérer les <strong>boissons</strong> selon les recommandations.</li>
</ul>

<blockquote>Bon à savoir : ces recommandations sont individualisées. Il ne faut pas s'imposer seul un régime restrictif, au risque de carences : elles se décident avec le médecin et une diététicienne.</blockquote>

<h2>Le rôle de l'équipe</h2>
<p>Une diététicienne aide à concilier ces contraintes avec le plaisir de manger et la culture alimentaire. Le contrôle du <a href="/blog/diabete-type-2-maroc">diabète</a> et de la <a href="/blog/hypertension-arterielle-maroc">tension</a> reste central.</p>

<hr>
<p>Une maladie rénale à accompagner ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const reinAlimFaq = [
  { q: "Quelle alimentation en cas d'insuffisance rénale ?", a: "Une alimentation personnalisée selon le stade : réduire le sel, adapter les protéines (ni trop ni pas assez), et aux stades avancés surveiller le potassium et le phosphore, ainsi que les boissons. Ces conseils se décident avec le médecin et une diététicienne." },
  { q: "Faut-il manger moins de protéines avec les reins fragiles ?", a: "Souvent oui, il faut adapter les apports en protéines selon le stade de la maladie, mais sans excès de restriction qui exposerait à des carences. L'ajustement est individualisé et se fait sur avis médical et diététique, pas seul." },
  { q: "Pourquoi réduire le sel en cas de maladie rénale ?", a: "Parce que des reins fatigués éliminent moins bien le sel, ce qui favorise la rétention d'eau et l'hypertension, elles-mêmes néfastes pour les reins. Réduire le sel aide à contrôler la tension et à ralentir l'évolution de la maladie." },
  { q: "Peut-on suivre seul un régime pour les reins ?", a: "Non, c'est déconseillé. Un régime rénal mal conduit peut entraîner des carences ou des déséquilibres. Les recommandations sont individualisées selon le stade et les analyses : elles se décident avec le médecin et une diététicienne." },
  { q: "Le diabète et la tension influencent-ils le régime rénal ?", a: "Oui, ils sont souvent à l'origine de la maladie rénale et leur contrôle est central. L'alimentation vise aussi à équilibrer le diabète et la tension, en plus d'adapter le sel, les protéines et certains minéraux selon le stade." },
];
const reinAlimTk = [
  "L'alimentation fait partie du traitement de la maladie rénale.",
  "Principes : réduire le sel, adapter les protéines, surveiller potassium/phosphore.",
  "Recommandations individualisées : ne pas se restreindre seul (risque de carences).",
  "Contrôler diabète et tension reste central.",
];

const cProtegerReins = `<p>On peut protéger ses reins et prévenir l'<a href="/blog/insuffisance-renale-maroc">insuffisance rénale</a>, surtout quand on a des facteurs de risque. Comme la maladie rénale est longtemps silencieuse, la prévention et le dépistage sont essentiels.</p>

<h2>Les deux grands ennemis des reins</h2>
<p>Le <a href="/blog/diabete-type-2-maroc">diabète</a> et l'<a href="/blog/hypertension-arterielle-maroc">hypertension</a> sont les premières causes d'insuffisance rénale. Bien les équilibrer est la meilleure protection.</p>

<h2>Les bons réflexes</h2>
<ul>
<li>Contrôler et traiter tension et diabète ; réduire le sel.</li>
<li>Boire suffisamment, sans excès inutile.</li>
<li>Maintenir un poids sain, bouger, arrêter le tabac.</li>
<li>Faire dépister ses reins si l'on est à risque (prise de sang, analyse d'urine).</li>
</ul>

<blockquote>Attention : évitez l'automédication par <a href="/blog/anti-inflammatoires-ains-maroc">anti-inflammatoires (AINS)</a>, toxiques pour les reins s'ils sont pris de façon répétée. Demandez conseil avant d'en prendre, surtout en cas de facteur de risque.</blockquote>

<h2>Le dépistage</h2>
<p>Chez les personnes à risque (diabète, hypertension, antécédents), un contrôle régulier de la créatinine et de la présence de protéines dans les urines permet de repérer une atteinte tôt, quand on peut encore la ralentir.</p>

<hr>
<p>Diabétique ou hypertendu ? Faites contrôler vos reins. Sur SantéauMaroc, trouvez un médecin près de chez vous.</p>`;
const protegerReinsFaq = [
  { q: "Comment protéger ses reins ?", a: "En contrôlant la tension et le diabète (les deux principales causes d'atteinte rénale), en réduisant le sel, en buvant suffisamment, en maintenant un poids sain, en arrêtant le tabac et en évitant l'automédication par anti-inflammatoires. Le dépistage chez les personnes à risque est essentiel." },
  { q: "Les anti-inflammatoires abîment-ils les reins ?", a: "Oui, les anti-inflammatoires (AINS) pris de façon répétée sans avis peuvent abîmer les reins, surtout en cas de facteur de risque ou de déshydratation. Il faut demander conseil avant d'en prendre et éviter l'automédication prolongée." },
  { q: "Comment savoir si mes reins sont fragiles ?", a: "Par une prise de sang (créatinine, qui permet de calculer le débit de filtration) et une analyse d'urine à la recherche de protéines. Ces examens simples sont recommandés chez les personnes à risque (diabète, hypertension, antécédents)." },
  { q: "Boire beaucoup d'eau protège-t-il les reins ?", a: "Une hydratation suffisante est utile, notamment pour prévenir les calculs, mais il n'est pas nécessaire de boire à l'excès. L'essentiel pour protéger les reins est surtout de contrôler la tension et le diabète et d'éviter les médicaments toxiques." },
  { q: "Peut-on éviter l'insuffisance rénale ?", a: "En grande partie, oui, en agissant tôt sur les facteurs de risque : équilibrer le diabète et la tension, éviter les médicaments néfastes pour les reins, et dépister régulièrement chez les personnes à risque pour ralentir toute atteinte débutante." },
];
const protegerReinsTk = [
  "Diabète et hypertension sont les premières causes d'insuffisance rénale.",
  "Protéger ses reins : équilibrer tension/diabète, réduire le sel, arrêter le tabac.",
  "Éviter l'automédication par anti-inflammatoires (toxiques pour les reins).",
  "Dépister (créatinine, protéines urinaires) chez les personnes à risque.",
];

// ═══ GOUTTE ═══════════════════════════════════════════════════════════════════
const cCriseGoutte = `<p>La crise de goutte est une inflammation brutale et très douloureuse d'une articulation, provoquée par des cristaux d'acide urique. Savoir la reconnaître et réagir vite permet de soulager la douleur — et d'éviter les récidives.</p>

<h2>Reconnaître la crise</h2>
<p>Une articulation — le plus souvent le <strong>gros orteil</strong> — devient brutalement rouge, chaude, gonflée et extrêmement douloureuse, souvent la nuit. Le moindre contact est insupportable. Voir la fiche <a href="/blog/goutte-maroc">goutte</a>.</p>

<h2>Que faire pendant la crise ?</h2>
<ul>
<li>Mettre l'articulation au <strong>repos</strong>, la surélever, appliquer du froid.</li>
<li>Prendre le traitement de crise prescrit (anti-inflammatoire ou colchicine) le plus tôt possible.</li>
<li>Bien s'hydrater ; éviter l'alcool et les excès alimentaires.</li>
</ul>

<blockquote>Bon à savoir : on ne commence pas un traitement de fond (qui baisse l'acide urique) pendant la crise, et on n'arrête pas celui déjà en cours. En cas de doute ou de fièvre associée, consultez : une articulation chaude peut aussi être une infection.</blockquote>

<h2>Après la crise</h2>
<p>La crise cède en quelques jours. Si les crises se répètent, un <a href="/blog/acide-urique-eleve-maroc">traitement de fond</a> et des <a href="/blog/alimentation-goutte-maroc">mesures alimentaires</a> préviennent les récidives.</p>

<hr>
<p>Des crises de goutte à répétition ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const criseGoutteFaq = [
  { q: "Comment soulager une crise de goutte ?", a: "En mettant l'articulation au repos, en la surélevant, en appliquant du froid, et en prenant le traitement de crise prescrit (anti-inflammatoire ou colchicine) le plus tôt possible. Bien s'hydrater et éviter l'alcool aident aussi. La crise cède en quelques jours." },
  { q: "Combien de temps dure une crise de goutte ?", a: "En général quelques jours, avec un pic très douloureux les premières 24 à 48 heures. Un traitement pris tôt raccourcit la crise. Entre les crises, tout redevient normal, mais l'acide urique reste souvent élevé." },
  { q: "Faut-il commencer un traitement de fond pendant la crise ?", a: "Non : on ne débute pas un traitement qui baisse l'acide urique en pleine crise, car cela peut l'aggraver. En revanche, si un traitement de fond est déjà en cours, on ne l'arrête pas. Le médecin organise la suite après la crise." },
  { q: "Une articulation chaude est-elle toujours une goutte ?", a: "Non. Une articulation rouge, chaude et gonflée peut aussi être une infection (arthrite septique), surtout avec de la fièvre. En cas de doute, il faut consulter rapidement, car une infection articulaire est une urgence." },
  { q: "Comment éviter une nouvelle crise de goutte ?", a: "En traitant la cause si les crises se répètent (traitement de fond qui abaisse l'acide urique) et en adaptant l'alimentation (moins de viandes, d'abats, de fruits de mer, d'alcool et de boissons sucrées), avec une bonne hydratation." },
];
const criseGoutteTk = [
  "La crise de goutte : articulation brutalement rouge, chaude, gonflée, très douloureuse.",
  "Réagir vite : repos, froid, traitement de crise prescrit, hydratation.",
  "Ne pas débuter le traitement de fond en pleine crise ; ne pas arrêter celui en cours.",
  "Une articulation chaude avec fièvre peut être une infection : consulter.",
];

const cAlimGoutte = `<p>L'alimentation joue un rôle clé dans la <a href="/blog/goutte-maroc">goutte</a> : certains aliments augmentent l'<a href="/blog/acide-urique-eleve-maroc">acide urique</a> et favorisent les crises. Adapter son alimentation aide à les espacer, en complément du traitement.</p>

<h2>Les aliments à limiter</h2>
<ul>
<li><strong>Viandes rouges, abats, charcuterie</strong></li>
<li><strong>Certains poissons et fruits de mer</strong> (sardines, anchois, crustacés)</li>
<li><strong>Alcool</strong>, surtout la bière ; <strong>boissons sucrées</strong> et sodas</li>
</ul>

<h2>Les aliments plutôt favorables</h2>
<ul>
<li>Produits laitiers peu gras, légumes, fruits (avec modération pour les plus sucrés)</li>
<li>Céréales complètes, légumineuses</li>
<li><strong>Eau en abondance</strong> : elle aide à éliminer l'acide urique</li>
</ul>

<h2>Les bons réflexes</h2>
<ul>
<li>Boire beaucoup d'eau chaque jour.</li>
<li>Limiter fortement l'alcool et les boissons sucrées.</li>
<li>Perdre du poids en cas de surpoids, progressivement.</li>
</ul>

<p>L'alimentation seule ne suffit pas toujours : en cas de crises répétées, elle s'associe à un traitement de fond, sur avis médical.</p>

<hr>
<p>La goutte perturbe votre quotidien ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const alimGoutteFaq = [
  { q: "Quels aliments éviter en cas de goutte ?", a: "Les viandes rouges, les abats, la charcuterie, certains poissons et fruits de mer (sardines, anchois, crustacés), l'alcool (surtout la bière) et les boissons sucrées. Ces aliments augmentent l'acide urique et favorisent les crises." },
  { q: "Quels aliments sont bons contre la goutte ?", a: "Les produits laitiers peu gras, les légumes, les fruits (avec modération pour les plus sucrés), les céréales complètes et les légumineuses. Surtout, boire beaucoup d'eau aide à éliminer l'acide urique." },
  { q: "L'alimentation suffit-elle à traiter la goutte ?", a: "Elle aide à espacer les crises, mais ne suffit pas toujours. En cas de crises répétées ou d'acide urique très élevé, elle s'associe à un traitement de fond qui abaisse l'acide urique, sur avis médical." },
  { q: "L'alcool provoque-t-il des crises de goutte ?", a: "Oui, l'alcool, en particulier la bière, augmente l'acide urique et peut déclencher des crises. Les boissons sucrées aussi. Les limiter fortement est l'une des mesures les plus efficaces pour prévenir les crises." },
  { q: "Faut-il boire beaucoup d'eau quand on a de la goutte ?", a: "Oui, une bonne hydratation (souvent au moins 1,5 à 2 litres d'eau par jour, sauf contre-indication) aide à éliminer l'acide urique et à prévenir aussi les calculs rénaux, fréquents en cas de goutte." },
];
const alimGoutteTk = [
  "Limiter viandes rouges, abats, fruits de mer, alcool (bière) et boissons sucrées.",
  "Privilégier laitages peu gras, légumes, et surtout beaucoup d'eau.",
  "L'eau aide à éliminer l'acide urique et à prévenir les calculs.",
  "L'alimentation complète le traitement de fond en cas de crises répétées.",
];

const cAcideUrique = `<p>L'acide urique élevé dans le sang (hyperuricémie) est à l'origine de la <a href="/blog/goutte-maroc">goutte</a>. Souvent découvert sur une prise de sang, il n'entraîne pas toujours de symptôme, mais mérite attention car il expose aux crises et aux calculs.</p>

<h2>Qu'est-ce que l'hyperuricémie ?</h2>
<p>C'est un excès d'acide urique, un déchet issu de la dégradation de certaines substances (les purines) et éliminé par les reins. Quand il est trop élevé, il peut cristalliser dans les articulations (goutte) ou les reins (calculs).</p>

<h2>Les causes</h2>
<ul>
<li>Alimentation riche (viandes, abats, fruits de mer), <a href="/blog/alimentation-goutte-maroc">alcool</a>, boissons sucrées</li>
<li>Hérédité, surpoids, certains médicaments (diurétiques)</li>
<li>Diminution de l'élimination par les reins</li>
</ul>

<h2>Faut-il traiter un acide urique élevé sans crise ?</h2>
<p>Pas toujours. Un acide urique élevé <strong>sans aucune crise</strong> ne nécessite le plus souvent pas de médicament, mais des mesures d'hygiène de vie et une surveillance. Un traitement de fond est proposé en cas de crises de goutte répétées, de calculs ou de taux très élevé, sur décision médicale.</p>

<h2>Comment le faire baisser ?</h2>
<ul>
<li>Adapter l'alimentation, limiter l'alcool et les boissons sucrées.</li>
<li>Boire beaucoup d'eau, perdre du poids si nécessaire.</li>
<li>Prendre le traitement de fond (comme l'allopurinol) si prescrit, sans l'arrêter seul.</li>
</ul>

<hr>
<p>Un acide urique élevé sur votre bilan ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const acideUriqueFaq = [
  { q: "Qu'est-ce que l'acide urique élevé (hyperuricémie) ?", a: "C'est un excès d'acide urique dans le sang, un déchet normalement éliminé par les reins. Quand il est trop élevé, il peut cristalliser dans les articulations (goutte) ou les reins (calculs). Il est souvent découvert sur une prise de sang." },
  { q: "Faut-il traiter un acide urique élevé sans symptôme ?", a: "Le plus souvent non par médicament : un acide urique élevé sans aucune crise relève surtout de mesures d'hygiène de vie et d'une surveillance. Un traitement de fond est proposé en cas de crises répétées, de calculs ou de taux très élevé, sur avis médical." },
  { q: "Comment faire baisser l'acide urique ?", a: "En adaptant l'alimentation (moins de viandes, abats, fruits de mer, alcool et boissons sucrées), en buvant beaucoup d'eau, en perdant du poids si besoin, et en prenant le traitement de fond (comme l'allopurinol) s'il est prescrit, sans l'arrêter seul." },
  { q: "Qu'est-ce qui fait monter l'acide urique ?", a: "Une alimentation riche en purines (viandes, abats, fruits de mer), l'alcool (surtout la bière), les boissons sucrées, le surpoids, l'hérédité, certains médicaments (diurétiques) et une moindre élimination par les reins." },
  { q: "Acide urique élevé et calculs rénaux, quel lien ?", a: "Un excès d'acide urique peut favoriser la formation de calculs dans les reins, en plus des crises de goutte. Boire beaucoup d'eau et adapter l'alimentation aident à prévenir ces deux complications." },
];
const acideUriqueTk = [
  "L'hyperuricémie (acide urique élevé) est à l'origine de la goutte.",
  "Elle peut cristalliser dans les articulations (goutte) ou les reins (calculs).",
  "Un taux élevé sans crise ne nécessite souvent pas de médicament, mais une hygiène de vie.",
  "Traitement de fond (allopurinol) si crises répétées, calculs ou taux très élevé.",
];

// ─────────────────────────────────────────────────────────────────────────────
const SATELLITES = [
  { pillarSlug:"reflux-gastro-oesophagien-maroc", categorySlug:"maladies-traitements", aboutEntity:"Reflux gastro-œsophagien",
    slug:"reflux-alimentation-mesures-maroc", title:"Reflux : alimentation et mesures qui soulagent",
    excerpt:"Reflux : les aliments à éviter, les bons réflexes à table, surélever le lit et perdre du poids. Les mesures d'hygiène de vie qui soulagent, adaptées au Maroc.",
    metaTitle:"Reflux : alimentation et mesures qui soulagent | Maroc",
    metaDesc:"Reflux gastro-œsophagien : aliments à éviter, bons réflexes à table, surélever le lit, perdre du poids. Les mesures d'hygiène de vie qui soulagent, adaptées au Maroc.",
    readingTime:4, content:cRefluxAlim, keyTakeaways:refluxAlimTk, faq:refluxAlimFaq },
  { pillarSlug:"reflux-gastro-oesophagien-maroc", categorySlug:"maladies-traitements", aboutEntity:"Reflux du nourrisson",
    slug:"reflux-nourrisson-maroc", title:"Reflux du nourrisson : régurgitations, que faire ?",
    excerpt:"Régurgitations de bébé : reconnaître le reflux normal, les gestes qui aident et les signes qui doivent faire consulter. Un guide rassurant pour les parents, au Maroc.",
    metaTitle:"Reflux du nourrisson : régurgitations, que faire ? | Maroc",
    metaDesc:"Reflux du nourrisson : reconnaître les régurgitations normales, les gestes qui aident (fractionner, position verticale) et les signes qui doivent faire consulter. Adapté au Maroc.",
    readingTime:4, content:cRefluxNourrisson, keyTakeaways:refluxNourrissonTk, faq:refluxNourrissonFaq },
  { pillarSlug:"reflux-gastro-oesophagien-maroc", categorySlug:"maladies-traitements", aboutEntity:"Hernie hiatale",
    slug:"hernie-hiatale-maroc", title:"Hernie hiatale : qu'est-ce que c'est et que faire ?",
    excerpt:"Hernie hiatale : ce que c'est, son lien avec le reflux, comment on la découvre et que faire. Un guide clair adapté au Maroc.",
    metaTitle:"Hernie hiatale : symptômes et traitement | Maroc",
    metaDesc:"Hernie hiatale : définition, lien avec le reflux, symptômes (souvent aucun), découverte et traitement (mesures anti-reflux, chirurgie rare). Guide clair adapté au Maroc.",
    readingTime:4, content:cHernieHiatale, keyTakeaways:hernieTk, faq:hernieFaq },

  { pillarSlug:"insuffisance-renale-maroc", categorySlug:"maladies-traitements", aboutEntity:"Dialyse",
    slug:"dialyse-maroc", title:"Dialyse : principe, méthodes et vie quotidienne",
    excerpt:"Dialyse : pourquoi et quand, hémodialyse et dialyse péritonéale, vivre avec, et place de la greffe. Un guide clair adapté au Maroc.",
    metaTitle:"Dialyse : principe, méthodes et vie quotidienne | Maroc",
    metaDesc:"Dialyse : pourquoi elle remplace les reins, hémodialyse et dialyse péritonéale, vivre avec le traitement et place de la greffe de rein. Guide clair adapté au Maroc.",
    readingTime:4, content:cDialyse, keyTakeaways:dialyseTk, faq:dialyseFaq },
  { pillarSlug:"insuffisance-renale-maroc", categorySlug:"maladies-traitements", aboutEntity:"Insuffisance rénale",
    slug:"insuffisance-renale-alimentation-maroc", title:"Alimentation et reins : le régime en cas d'insuffisance rénale",
    excerpt:"Maladie rénale : pourquoi l'alimentation compte, sel, protéines, potassium et phosphore, et l'importance d'un suivi diététique. Un guide adapté au Maroc.",
    metaTitle:"Alimentation et insuffisance rénale : le régime | Maroc",
    metaDesc:"Insuffisance rénale : pourquoi l'alimentation fait partie du traitement, principes (sel, protéines, potassium, phosphore) et importance d'un suivi personnalisé. Adapté au Maroc.",
    readingTime:4, content:cReinAlim, keyTakeaways:reinAlimTk, faq:reinAlimFaq },
  { pillarSlug:"insuffisance-renale-maroc", categorySlug:"maladies-traitements", aboutEntity:"Insuffisance rénale",
    slug:"proteger-ses-reins-maroc", title:"Protéger ses reins : prévenir l'insuffisance rénale",
    excerpt:"Protéger ses reins : contrôler tension et diabète, éviter les médicaments toxiques, et se faire dépister. La prévention de l'insuffisance rénale, adaptée au Maroc.",
    metaTitle:"Protéger ses reins : prévenir l'insuffisance rénale | Maroc",
    metaDesc:"Protéger ses reins : contrôler tension et diabète, réduire le sel, éviter l'automédication par anti-inflammatoires et se faire dépister. Prévention adaptée au Maroc.",
    readingTime:4, content:cProtegerReins, keyTakeaways:protegerReinsTk, faq:protegerReinsFaq },

  { pillarSlug:"goutte-maroc", categorySlug:"maladies-traitements", aboutEntity:"Goutte",
    slug:"crise-de-goutte-que-faire-maroc", title:"Crise de goutte : que faire pour la soulager",
    excerpt:"Crise de goutte : reconnaître la crise, les gestes et le traitement pour la soulager vite, et comment éviter les récidives. Un guide clair adapté au Maroc.",
    metaTitle:"Crise de goutte : que faire pour la soulager | Maroc",
    metaDesc:"Crise de goutte : reconnaître l'articulation rouge et douloureuse, les gestes (repos, froid), le traitement de crise et comment éviter les récidives. Guide clair adapté au Maroc.",
    readingTime:4, content:cCriseGoutte, keyTakeaways:criseGoutteTk, faq:criseGoutteFaq },
  { pillarSlug:"goutte-maroc", categorySlug:"maladies-traitements", aboutEntity:"Goutte",
    slug:"alimentation-goutte-maroc", title:"Alimentation et goutte : que manger, que limiter",
    excerpt:"Alimentation et goutte : les aliments à limiter (viandes, fruits de mer, alcool), ceux à privilégier et le rôle de l'eau pour espacer les crises. Adapté au Maroc.",
    metaTitle:"Alimentation et goutte : que manger, que limiter | Maroc",
    metaDesc:"Alimentation et goutte : aliments à limiter (viandes, abats, fruits de mer, alcool, boissons sucrées), aliments favorables et rôle de l'eau pour espacer les crises. Adapté au Maroc.",
    readingTime:4, content:cAlimGoutte, keyTakeaways:alimGoutteTk, faq:alimGoutteFaq },
  { pillarSlug:"goutte-maroc", categorySlug:"maladies-traitements", aboutEntity:"Hyperuricémie",
    slug:"acide-urique-eleve-maroc", title:"Acide urique élevé : faut-il s'inquiéter ?",
    excerpt:"Acide urique élevé (hyperuricémie) : ce que c'est, ses causes, faut-il traiter sans crise et comment le faire baisser. Un guide clair adapté au Maroc.",
    metaTitle:"Acide urique élevé : faut-il s'inquiéter ? | Maroc",
    metaDesc:"Acide urique élevé (hyperuricémie) : causes, lien avec la goutte et les calculs, faut-il traiter sans crise et comment le faire baisser. Guide clair adapté au Maroc.",
    readingTime:4, content:cAcideUrique, keyTakeaways:acideUriqueTk, faq:acideUriqueFaq },
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
  console.log(`\nCocons vague 5 : ${pillarSlugs.length} piliers, ${SATELLITES.length} satellites.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
