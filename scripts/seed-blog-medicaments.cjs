require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie MÉDICAMENTS (fiches conseil éditoriales) — brief cat. 4.
// ⚠️ DISTINCTE de l'annuaire /medicaments (base de données de spécialités) :
//    ici, /blog/categorie/medicaments = fiches d'information « bon usage ».
// Gabarit : à quoi ça sert (indications), comment ça se prend (posologie
// GÉNÉRALE, sans remplacer l'avis médical), contre-indications, effets
// secondaires, interactions, grossesse/allaitement, conseils + FAQ + À retenir.
// ⚠️ Contenu YMYL très sensible : renvoi systématique au médecin/pharmacien,
// pas de posologie précise pédiatrique. À faire valider par un pharmacien/médecin.
// Repli spécialiste : médecine générale.
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  name: "Médicaments",
  slug: "medicaments",
  description:
    "Bien connaître ses médicaments : à quoi ils servent, comment les prendre, leurs contre-indications, effets secondaires et interactions. Des fiches d'information claires qui ne remplacent jamais l'avis de votre médecin ou de votre pharmacien.",
  color: "green",
};

const DISCLAIMER = `<p><em>Cette fiche est une information générale et ne remplace pas l'avis de votre médecin ou de votre pharmacien. Ne modifiez jamais un traitement sans avis, respectez la prescription et lisez la notice.</em></p>`;

const cParacetamol = `<p>Le paracétamol est l'antalgique (contre la douleur) et l'antipyrétique (contre la fièvre) le plus utilisé, disponible sans ordonnance. Bien toléré aux doses recommandées, il devient dangereux pour le foie en cas de surdosage : d'où l'importance de respecter les doses.</p>

<h2>À quoi sert-il ?</h2>
<p>À soulager les douleurs légères à modérées (maux de tête, douleurs dentaires, courbatures, règles douloureuses) et à faire baisser la fièvre. <strong>Marques courantes au Maroc</strong> : Doliprane, Efferalgan, Panadol, Dafalgan (liste non exhaustive).</p>

<h2>Comment se prend-il ?</h2>
<p>Chez l'adulte, la dose est en général de <strong>500 mg à 1 g par prise</strong>, en espaçant les prises d'au moins 6 heures, sans dépasser la dose maximale indiquée sur la notice (souvent 3 g par jour). <strong>Chez l'enfant, la dose dépend du poids</strong> : suivez impérativement la prescription. Respecter les doses est essentiel.</p>

<h2>Contre-indications</h2>
<p>Maladie grave du foie, allergie au paracétamol. Prudence en cas de poids faible, de consommation d'alcool ou de maladie hépatique : demandez conseil.</p>

<h2>Effets secondaires</h2>
<p>Rares aux doses recommandées. Le principal danger est le <strong>surdosage</strong>, qui peut gravement abîmer le foie — parfois sans symptôme au début. En cas de prise excessive, contactez un médecin en urgence même si vous vous sentez bien.</p>

<h2>Interactions</h2>
<p>Attention aux <strong>médicaments qui contiennent déjà du paracétamol</strong> (nombreux médicaments « anti-rhume » ou antidouleurs combinés) : les additionner expose au surdosage. Signalez vos traitements, notamment un anticoagulant.</p>

<h2>Grossesse et allaitement</h2>
<p>Le paracétamol est généralement l'antalgique de choix pendant la grossesse et l'allaitement, à la dose efficace la plus faible et le moins longtemps possible, sur conseil médical.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Ne jamais cumuler plusieurs médicaments contenant du paracétamol.</li>
<li>Respecter l'intervalle entre les prises et la dose maximale.</li>
<li>Consulter si la douleur ou la fièvre persiste au-delà de quelques jours.</li>
</ul>

${DISCLAIMER}
<hr>
<p>Un doute sur un traitement ? Demandez conseil à votre pharmacien ou, sur SantéauMaroc, à un médecin près de chez vous.</p>`;
const paracetamolFaq = [
  { q: "Quelle dose de paracétamol par jour ?", a: "Chez l'adulte, souvent 500 mg à 1 g par prise, espacées d'au moins 6 heures, sans dépasser la dose maximale de la notice (fréquemment 3 g par jour). Chez l'enfant, la dose dépend du poids : suivez la prescription. En cas de doute, demandez à votre pharmacien." },
  { q: "Le paracétamol est-il dangereux ?", a: "Il est bien toléré aux doses recommandées, mais un surdosage peut gravement abîmer le foie, parfois sans symptôme au début. Il faut respecter les doses et ne jamais cumuler plusieurs médicaments qui en contiennent. En cas d'excès, consultez en urgence." },
  { q: "Peut-on prendre du paracétamol enceinte ?", a: "Le paracétamol est généralement l'antalgique de choix pendant la grossesse et l'allaitement, à la dose efficace la plus faible et le moins longtemps possible, sur conseil médical. Demandez toujours l'avis d'un professionnel." },
  { q: "Paracétamol ou ibuprofène : que choisir ?", a: "Le paracétamol est souvent privilégié en première intention car mieux toléré (estomac, reins). L'ibuprofène est un anti-inflammatoire, utile pour certaines douleurs, mais avec plus de contre-indications. Demandez conseil selon votre situation." },
  { q: "Peut-on prendre du paracétamol avec d'autres médicaments ?", a: "Attention aux médicaments « anti-rhume » ou antidouleurs combinés qui contiennent déjà du paracétamol : les additionner expose au surdosage. Signalez tous vos traitements à votre médecin ou pharmacien." },
];
const paracetamolTk = [
  "Le paracétamol soulage douleur et fièvre ; c'est l'antalgique le mieux toléré.",
  "Respecter les doses : le surdosage abîme gravement le foie.",
  "Ne jamais cumuler plusieurs médicaments contenant du paracétamol.",
  "Antalgique de choix pendant la grossesse, sur conseil médical.",
];

const cIbuprofene = `<p>L'ibuprofène est un anti-inflammatoire non stéroïdien (AINS) très utilisé contre la douleur, l'inflammation et la fièvre. Efficace, il a toutefois plus de précautions d'emploi que le paracétamol, notamment pour l'estomac, les reins et la grossesse.</p>

<h2>À quoi sert-il ?</h2>
<p>À soulager les douleurs (dentaires, règles, articulaires, maux de tête), l'inflammation et la fièvre. <strong>Marques courantes</strong> : Advil, Nurofen, Brufen (liste non exhaustive).</p>

<h2>Comment se prend-il ?</h2>
<p>À la <strong>dose efficace la plus faible et le moins longtemps possible</strong>, de préférence au milieu d'un repas. Suivez la notice et la prescription ; chez l'enfant, la dose dépend du poids. Ne pas associer deux anti-inflammatoires.</p>

<h2>Contre-indications</h2>
<ul>
<li><a href="/blog/ulcere-estomac-maroc">Ulcère</a> de l'estomac, antécédent de saignement digestif</li>
<li>Maladie grave des reins, du cœur ou du foie</li>
<li>Allergie aux AINS ; <strong>grossesse (formellement contre-indiqué à partir du 6e mois)</strong></li>
</ul>

<h2>Effets secondaires</h2>
<p>Troubles digestifs (brûlures, ulcère, saignement), atteinte des reins, élévation de la <a href="/blog/hypertension-arterielle-maroc">tension</a>, réactions allergiques. Le risque augmente avec la dose et la durée.</p>

<h2>Interactions</h2>
<p>Ne pas associer à un autre AINS ni à l'aspirine à visée antidouleur. Prudence avec les anticoagulants (risque de saignement), certains médicaments de la tension et du cœur, et chez la personne âgée.</p>

<h2>Grossesse et allaitement</h2>
<p>À éviter pendant la grossesse et <strong>contre-indiqué à partir du 6e mois</strong> (risque pour le bébé). Pendant l'allaitement, un avis médical est nécessaire ; le paracétamol est souvent préféré.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Prendre au cours d'un repas, sur une courte durée.</li>
<li>Éviter en cas de déshydratation, de fièvre avec risque de déshydratation ou d'infection non évaluée.</li>
<li>Demander conseil en cas de maladie chronique ou de traitement au long cours.</li>
</ul>

${DISCLAIMER}
<hr>
<p>Un doute sur un anti-inflammatoire ? Demandez à votre pharmacien ou, sur SantéauMaroc, à un médecin près de chez vous.</p>`;
const ibuprofeneFaq = [
  { q: "Quand ne faut-il pas prendre d'ibuprofène ?", a: "En cas d'ulcère ou d'antécédent de saignement digestif, de maladie grave des reins, du cœur ou du foie, d'allergie aux AINS, et à partir du 6e mois de grossesse (contre-indication). Prudence chez la personne âgée et en cas de déshydratation." },
  { q: "Ibuprofène ou paracétamol ?", a: "Le paracétamol est souvent privilégié car mieux toléré. L'ibuprofène, anti-inflammatoire, est utile pour certaines douleurs inflammatoires, mais avec plus de contre-indications (estomac, reins, grossesse). Le choix dépend de votre situation : demandez conseil." },
  { q: "L'ibuprofène est-il dangereux pour l'estomac et les reins ?", a: "Il peut provoquer des troubles digestifs (brûlures, ulcère, saignement) et une atteinte des reins, surtout à forte dose, sur une longue durée, chez la personne âgée ou déshydratée. On l'utilise à la dose la plus faible et le moins longtemps possible." },
  { q: "Peut-on prendre de l'ibuprofène enceinte ?", a: "Il est à éviter pendant la grossesse et formellement contre-indiqué à partir du 6e mois, en raison de risques pour le bébé. Le paracétamol est généralement préféré. Demandez toujours l'avis d'un professionnel de santé." },
  { q: "Peut-on associer ibuprofène et paracétamol ?", a: "Ils agissent différemment et peuvent parfois être associés sur avis médical, mais il ne faut jamais associer deux anti-inflammatoires (ibuprofène + aspirine antidouleur, par exemple). En cas de doute, demandez conseil à votre médecin ou pharmacien." },
];
const ibuprofeneTk = [
  "L'ibuprofène est un anti-inflammatoire (AINS) : douleur, inflammation, fièvre.",
  "Plus de précautions que le paracétamol : estomac, reins, tension.",
  "Contre-indiqué à partir du 6e mois de grossesse.",
  "Dose la plus faible, le moins longtemps possible, au cours d'un repas.",
];

const cAmoxicilline = `<p>L'amoxicilline est l'un des antibiotiques les plus prescrits. Elle traite des infections <strong>bactériennes</strong> — et seulement elles : elle est <strong>inutile contre les virus</strong> (rhume, grippe, la plupart des angines et bronchites). Le bon usage des antibiotiques protège leur efficacité.</p>

<h2>À quoi sert-elle ?</h2>
<p>À traiter certaines infections bactériennes (ORL, respiratoires, urinaires, dentaires…), sur prescription. <strong>Marques courantes</strong> : Clamoxyl ; l'association amoxicilline + acide clavulanique est vendue sous le nom d'Augmentin (liste non exhaustive).</p>

<h2>Comment se prend-elle ?</h2>
<p>Uniquement <strong>sur ordonnance</strong>, à la dose et pour la durée prescrites. Il est essentiel de <strong>terminer la cure</strong> même si l'on se sent mieux, pour éviter une rechute et l'apparition de résistances. Chez l'enfant, la dose dépend du poids.</p>

<h2>Contre-indications</h2>
<p><strong>Allergie aux pénicillines</strong> (l'amoxicilline en fait partie) : signalez toute allergie connue à un antibiotique. Prudence en cas de maladie des reins (adaptation de dose).</p>

<h2>Effets secondaires</h2>
<p>Troubles digestifs (diarrhée, nausées), éruptions cutanées, plus rarement réactions allergiques parfois graves. Toute réaction (éruption, gonflement, gêne à respirer) impose d'arrêter et de consulter en urgence.</p>

<h2>Interactions</h2>
<p>Signalez vos traitements (dont la pilule : en cas de troubles digestifs, son efficacité peut être réduite) et vos allergies. Le médecin et le pharmacien vérifient la compatibilité.</p>

<h2>Grossesse et allaitement</h2>
<p>L'amoxicilline peut être utilisée pendant la grossesse et l'allaitement lorsque c'est nécessaire, sur prescription. Signalez toujours une grossesse.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Ne jamais prendre un antibiotique « qui reste » d'une ancienne ordonnance ni celui d'un proche.</li>
<li>Respecter les horaires, la dose et la durée ; terminer la cure.</li>
<li>Un antibiotique ne soigne pas une infection virale.</li>
</ul>

${DISCLAIMER}
<hr>
<p>Une infection à évaluer ? Seul un médecin décide d'un antibiotique. Sur SantéauMaroc, trouvez un médecin près de chez vous.</p>`;
const amoxicillineFaq = [
  { q: "L'amoxicilline soigne-t-elle le rhume ou la grippe ?", a: "Non. L'amoxicilline est un antibiotique : elle n'agit que sur les bactéries, pas sur les virus. Le rhume, la grippe et la plupart des angines et bronchites sont viraux et ne nécessitent pas d'antibiotique. Le médecin décide de son utilité." },
  { q: "Faut-il terminer la cure d'antibiotique ?", a: "Oui, il faut suivre la durée prescrite même si l'on se sent mieux avant la fin, pour éviter une rechute et limiter l'apparition de bactéries résistantes. Ne jamais arrêter ni raccourcir une cure sans avis médical." },
  { q: "Quels sont les effets secondaires de l'amoxicilline ?", a: "Le plus souvent des troubles digestifs (diarrhée, nausées) et parfois des éruptions cutanées. Des réactions allergiques, parfois graves, sont possibles : toute éruption, gonflement ou gêne à respirer impose d'arrêter et de consulter en urgence." },
  { q: "Peut-on prendre de l'amoxicilline enceinte ?", a: "Oui, elle peut être utilisée pendant la grossesse et l'allaitement lorsque c'est nécessaire, sur prescription médicale. Signalez toujours une grossesse ou un allaitement à votre médecin et à votre pharmacien." },
  { q: "Peut-on utiliser un antibiotique qui reste d'une ancienne ordonnance ?", a: "Non. Il ne faut jamais réutiliser un antibiotique d'une ancienne ordonnance ni prendre celui d'un proche : le choix, la dose et la durée dépendent de l'infection, et un mauvais usage favorise les résistances. Consultez pour toute nouvelle infection." },
];
const amoxicillineTk = [
  "L'amoxicilline est un antibiotique : efficace sur les bactéries, inutile contre les virus.",
  "Uniquement sur ordonnance ; terminer la cure même si l'on va mieux.",
  "Contre-indiquée en cas d'allergie aux pénicillines : signaler toute allergie.",
  "Ne jamais réutiliser un antibiotique ancien ni celui d'un proche.",
];

const cOmeprazole = `<p>L'oméprazole fait partie des inhibiteurs de la pompe à protons (IPP), des médicaments qui réduisent fortement l'acidité de l'estomac. Ils soulagent le <a href="/blog/reflux-gastro-oesophagien-maroc">reflux</a> et protègent l'estomac dans certaines situations.</p>

<h2>À quoi sert-il ?</h2>
<p>À traiter le reflux gastro-œsophagien et l'œsophagite, l'<a href="/blog/ulcere-estomac-maroc">ulcère</a>, et à protéger l'estomac lors d'un traitement par anti-inflammatoires à risque. <strong>Marques courantes</strong> : Mopral, Oméprazole génériques ; l'ésoméprazole (Inexium) est proche (liste non exhaustive).</p>

<h2>Comment se prend-il ?</h2>
<p>En général <strong>une prise par jour, avant le repas</strong>, à la dose et pour la durée prescrites. Pour un reflux occasionnel, la durée est courte ; un usage prolongé doit être réévalué par le médecin.</p>

<h2>Contre-indications</h2>
<p>Allergie au produit. Il ne faut pas masquer durablement des symptômes sans diagnostic : des signes d'alerte (amaigrissement, difficulté à avaler, sang) imposent un avis, voire une <a href="/blog/gastroscopie-maroc">gastroscopie</a>.</p>

<h2>Effets secondaires</h2>
<p>Généralement bien toléré : parfois maux de tête, troubles digestifs. Un usage très prolongé peut être associé à certains effets (carences, infections digestives) : d'où l'intérêt de ne pas le poursuivre sans raison.</p>

<h2>Interactions</h2>
<p>L'oméprazole peut interagir avec certains médicaments (par exemple le clopidogrel, un antiagrégant). Signalez vos traitements à votre médecin et à votre pharmacien.</p>

<h2>Grossesse et allaitement</h2>
<p>Utilisable si nécessaire pendant la grossesse et l'allaitement, sur avis médical. Signalez toujours une grossesse.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Le prendre avant le repas pour une meilleure efficacité.</li>
<li>Ne pas prolonger un IPP « par habitude » sans réévaluation.</li>
<li>Associer les mesures d'hygiène de vie contre le reflux.</li>
</ul>

${DISCLAIMER}
<hr>
<p>Des brûlures d'estomac qui reviennent ? Sur SantéauMaroc, trouvez un médecin ou un gastro-entérologue près de chez vous.</p>`;
const omeprazoleFaq = [
  { q: "À quoi sert l'oméprazole ?", a: "C'est un inhibiteur de la pompe à protons (IPP) qui réduit fortement l'acidité de l'estomac. Il traite le reflux et l'œsophagite, l'ulcère, et protège l'estomac lors d'un traitement par anti-inflammatoires à risque, sur prescription." },
  { q: "Comment prendre l'oméprazole ?", a: "En général une prise par jour, avant le repas, à la dose et pour la durée prescrites. Pour un reflux occasionnel, la durée est courte ; un usage prolongé doit être réévalué par le médecin plutôt que poursuivi par habitude." },
  { q: "L'oméprazole peut-il se prendre longtemps ?", a: "Un usage prolongé est parfois justifié, mais il doit être réévalué régulièrement, car il peut être associé à certains effets (carences, infections digestives). Il ne faut pas le poursuivre indéfiniment sans raison ni avis médical." },
  { q: "L'oméprazole est-il bien toléré ?", a: "Oui, en général. Les effets les plus fréquents sont des maux de tête ou de légers troubles digestifs. Comme tout médicament, il peut avoir des interactions (par exemple avec le clopidogrel) : signalez vos traitements." },
  { q: "Peut-on prendre de l'oméprazole enceinte ?", a: "Il peut être utilisé si nécessaire pendant la grossesse et l'allaitement, sur avis médical. Signalez toujours une grossesse. Les mesures d'hygiène de vie contre le reflux sont à privilégier en complément." },
];
const omeprazoleTk = [
  "L'oméprazole (IPP) réduit l'acidité de l'estomac : reflux, ulcère, protection sous AINS.",
  "Une prise par jour avant le repas, pour la durée prescrite.",
  "Ne pas prolonger sans réévaluation ; signes d'alerte = avis médical/gastroscopie.",
  "Interactions possibles (ex. clopidogrel) : signaler ses traitements.",
];

const cMetformine = `<p>La metformine est le médicament de référence du <a href="/blog/diabete-type-2-maroc">diabète de type 2</a>. Elle aide à contrôler la glycémie, en complément de l'alimentation et de l'activité physique, avec un bon recul d'utilisation.</p>

<h2>À quoi sert-elle ?</h2>
<p>À faire baisser la glycémie dans le diabète de type 2, principalement en réduisant la production de sucre par le foie et en améliorant la sensibilité à l'insuline. <strong>Marques courantes</strong> : Glucophage, Stagid, metformine génériques (liste non exhaustive).</p>

<h2>Comment se prend-elle ?</h2>
<p><strong>Pendant ou après les repas</strong> pour limiter les troubles digestifs, à la dose prescrite, souvent augmentée progressivement. Elle ne provoque pas d'hypoglycémie par elle-même. Ne l'arrêtez pas de votre propre initiative.</p>

<h2>Contre-indications et précautions</h2>
<ul>
<li>Insuffisance rénale sévère, maladie grave du foie</li>
<li>À <strong>suspendre avant un examen avec produit de contraste iodé</strong> (scanner injecté) et lors de situations à risque (déshydratation, infection sévère), selon l'avis médical</li>
</ul>

<h2>Effets secondaires</h2>
<p>Surtout digestifs en début de traitement (nausées, diarrhée, douleurs), souvent transitoires et réduits par la prise pendant les repas et l'augmentation progressive des doses. Un effet rare mais grave (acidose lactique) justifie les précautions ci-dessus.</p>

<h2>Interactions</h2>
<p>Signalez vos traitements et prévenez tout médecin ou radiologue que vous prenez de la metformine, notamment avant un examen avec produit de contraste.</p>

<h2>Grossesse et allaitement</h2>
<p>La prise en charge du diabète pendant la grossesse est adaptée par le médecin ; ne modifiez rien seul et signalez tout projet de grossesse.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Prendre pendant les repas ; ne pas arrêter sans avis, même si la glycémie est bonne.</li>
<li>Signaler la metformine avant tout examen avec injection d'iode.</li>
<li>Poursuivre l'alimentation équilibrée et l'activité physique.</li>
</ul>

${DISCLAIMER}
<hr>
<p>Un diabète à suivre ou un traitement à ajuster ? Sur SantéauMaroc, trouvez un médecin ou un endocrinologue près de chez vous.</p>`;
const metformineFaq = [
  { q: "À quoi sert la metformine ?", a: "C'est le médicament de référence du diabète de type 2 : elle abaisse la glycémie en réduisant la production de sucre par le foie et en améliorant la sensibilité à l'insuline, en complément de l'alimentation et de l'activité physique." },
  { q: "La metformine provoque-t-elle des hypoglycémies ?", a: "Non, la metformine ne provoque pas d'hypoglycémie par elle-même, contrairement à certains autres antidiabétiques. Le risque d'hypoglycémie apparaît surtout si elle est associée à d'autres traitements comme l'insuline ou les sulfamides." },
  { q: "Pourquoi la metformine donne-t-elle des troubles digestifs ?", a: "Des nausées, diarrhées ou douleurs sont fréquentes en début de traitement. Elles sont souvent transitoires et réduites en prenant la metformine pendant les repas et en augmentant les doses progressivement, comme le prévoit le médecin." },
  { q: "Faut-il arrêter la metformine avant un scanner ?", a: "En cas d'examen avec produit de contraste iodé (scanner injecté), la metformine est souvent suspendue autour de l'examen, selon l'avis médical, pour prévenir un effet rare mais grave. Signalez toujours que vous en prenez avant un tel examen." },
  { q: "Peut-on arrêter la metformine si la glycémie est normale ?", a: "Non, pas de sa propre initiative. Une glycémie bien contrôlée est justement le signe que le traitement, associé à l'hygiène de vie, fonctionne. Toute modification se décide avec le médecin, qui adapte selon l'évolution." },
];
const metformineTk = [
  "La metformine est le médicament de référence du diabète de type 2.",
  "À prendre pendant les repas ; elle ne provoque pas d'hypoglycémie seule.",
  "À suspendre avant un scanner avec produit de contraste iodé (avis médical).",
  "Ne pas l'arrêter seul, même si la glycémie est bonne.",
];

const cAspirine = `<p>L'aspirine (acide acétylsalicylique) a deux usages très différents selon la dose : à dose élevée, c'est un antidouleur et antifièvre ; à <strong>faible dose</strong>, elle « fluidifie » le sang et sert à prévenir les accidents cardiovasculaires. Ces deux usages n'ont pas les mêmes règles.</p>

<h2>À quoi sert-elle ?</h2>
<ul>
<li><strong>À dose élevée</strong> : douleur et fièvre (usage aujourd'hui plus limité, au profit du paracétamol).</li>
<li><strong>À faible dose</strong> : antiagrégant plaquettaire, pour prévenir <a href="/blog/avc-accident-vasculaire-cerebral-maroc">infarctus et AVC</a> chez des personnes à risque, sur prescription.</li>
</ul>
<p><strong>Marques courantes</strong> : Aspégic, Aspirine ; à faible dose, Kardégic (liste non exhaustive).</p>

<h2>Comment se prend-elle ?</h2>
<p>La faible dose « cardio » est un <strong>traitement au long cours prescrit</strong> : ne l'arrêtez jamais seul (risque cardiovasculaire). À dose antidouleur, respecter la notice et éviter l'usage prolongé.</p>

<h2>Contre-indications</h2>
<ul>
<li><a href="/blog/ulcere-estomac-maroc">Ulcère</a>, risque de saignement, allergie aux AINS/salicylés</li>
<li><strong>Grossesse (surtout 3e trimestre)</strong> sauf prescription particulière</li>
<li><strong>Enfant et adolescent en cas de fièvre virale</strong> : risque de syndrome de Reye — ne pas donner sans avis médical</li>
</ul>

<h2>Effets secondaires</h2>
<p>Risque de saignement (digestif notamment), troubles de l'estomac, réactions allergiques. Le risque hémorragique augmente avec la dose et l'association à d'autres médicaments.</p>

<h2>Interactions</h2>
<p>Prudence majeure avec les <strong>anticoagulants</strong> et les autres <strong>anti-inflammatoires</strong> (risque de saignement accru). Signalez toujours que vous prenez de l'aspirine avant un geste ou une chirurgie.</p>

<h2>Grossesse et allaitement</h2>
<p>L'aspirine antidouleur est déconseillée pendant la grossesse, surtout au 3e trimestre. Une faible dose peut parfois être prescrite dans un cadre précis. Demandez toujours l'avis d'un professionnel.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Ne jamais donner d'aspirine à un enfant fiévreux sans avis médical.</li>
<li>Faible dose « cardio » : ne pas l'arrêter seul ; la signaler avant tout geste.</li>
<li>Éviter d'associer aspirine et autres anti-inflammatoires.</li>
</ul>

${DISCLAIMER}
<hr>
<p>Un traitement par aspirine à comprendre ? Sur SantéauMaroc, trouvez un médecin ou un cardiologue près de chez vous.</p>`;
const aspirineFaq = [
  { q: "À quoi sert l'aspirine à faible dose ?", a: "À faible dose, l'aspirine « fluidifie » le sang (antiagrégant) et sert à prévenir les infarctus et AVC chez des personnes à risque, sur prescription. C'est un traitement au long cours qu'il ne faut pas arrêter de sa propre initiative." },
  { q: "Peut-on donner de l'aspirine à un enfant qui a de la fièvre ?", a: "Non, pas sans avis médical : chez l'enfant et l'adolescent, l'aspirine en cas de fièvre virale expose au syndrome de Reye, une atteinte rare mais grave. Le paracétamol est privilégié pour la fièvre de l'enfant." },
  { q: "L'aspirine est-elle dangereuse pour l'estomac ?", a: "Elle peut provoquer des troubles de l'estomac et surtout un risque de saignement, notamment digestif. Ce risque augmente avec la dose et l'association à d'autres médicaments. Elle est contre-indiquée en cas d'ulcère ou de risque hémorragique." },
  { q: "Peut-on arrêter l'aspirine cardio seul ?", a: "Non. Arrêter une aspirine prescrite à faible dose pour le cœur expose à un risque d'infarctus ou d'AVC. Toute interruption, même avant un geste ou une chirurgie, doit être décidée avec le médecin." },
  { q: "Aspirine et anticoagulants, est-ce compatible ?", a: "L'association augmente fortement le risque de saignement et ne se fait que sous stricte surveillance médicale. Il faut signaler tous ses traitements et ne jamais associer soi-même aspirine, anticoagulants et anti-inflammatoires." },
];
const aspirineTk = [
  "L'aspirine : antidouleur/antifièvre à dose élevée, « fluidifiant » du sang à faible dose.",
  "La faible dose « cardio » est un traitement prescrit : ne pas l'arrêter seul.",
  "Ne jamais donner à un enfant fiévreux sans avis (syndrome de Reye).",
  "Risque de saignement : prudence avec anticoagulants et anti-inflammatoires.",
];

const ARTICLES = [
  { slug:"paracetamol-maroc", aboutEntity:"Paracétamol",
    title:"Paracétamol : indications, doses et précautions",
    excerpt:"Paracétamol : à quoi il sert, comment le prendre, doses, contre-indications, danger du surdosage pour le foie, grossesse et conseils. Fiche d'information adaptée au Maroc.",
    metaTitle:"Paracétamol : doses, précautions et danger du surdosage | Maroc",
    metaDesc:"Paracétamol (Doliprane, Efferalgan) : indications, doses, danger du surdosage pour le foie, contre-indications, grossesse et conseils. Information claire adaptée au Maroc.",
    readingTime:5, content:cParacetamol, keyTakeaways:paracetamolTk, faq:paracetamolFaq },
  { slug:"ibuprofene-maroc", aboutEntity:"Ibuprofène",
    title:"Ibuprofène : indications, précautions et contre-indications",
    excerpt:"Ibuprofène (AINS) : à quoi il sert, précautions (estomac, reins), contre-indications dont la grossesse, effets secondaires, interactions et conseils. Adapté au Maroc.",
    metaTitle:"Ibuprofène : précautions et contre-indications | Maroc",
    metaDesc:"Ibuprofène (Advil, Nurofen) : indications, précautions (estomac, reins), contre-indications (grossesse), effets secondaires, interactions et conseils. Adapté au Maroc.",
    readingTime:5, content:cIbuprofene, keyTakeaways:ibuprofeneTk, faq:ibuprofeneFaq },
  { slug:"amoxicilline-maroc", aboutEntity:"Amoxicilline",
    title:"Amoxicilline : antibiotique, bon usage et précautions",
    excerpt:"Amoxicilline : à quoi sert cet antibiotique, pourquoi il est inutile contre les virus, l'importance de terminer la cure, allergies, effets et grossesse. Adapté au Maroc.",
    metaTitle:"Amoxicilline : antibiotique et bon usage | Maroc",
    metaDesc:"Amoxicilline (Clamoxyl, Augmentin) : indications, bon usage des antibiotiques (terminer la cure, inutile contre les virus), allergie aux pénicillines, effets et grossesse. Adapté au Maroc.",
    readingTime:5, content:cAmoxicilline, keyTakeaways:amoxicillineTk, faq:amoxicillineFaq },
  { slug:"omeprazole-maroc", aboutEntity:"Oméprazole",
    title:"Oméprazole (IPP) : indications, usage et précautions",
    excerpt:"Oméprazole (IPP) : à quoi il sert (reflux, ulcère), comment le prendre, usage prolongé à réévaluer, effets, interactions et grossesse. Fiche adaptée au Maroc.",
    metaTitle:"Oméprazole (IPP) : reflux, usage et précautions | Maroc",
    metaDesc:"Oméprazole (Mopral, IPP) : indications (reflux, ulcère), comment le prendre, usage prolongé à réévaluer, effets, interactions (clopidogrel) et grossesse. Adapté au Maroc.",
    readingTime:5, content:cOmeprazole, keyTakeaways:omeprazoleTk, faq:omeprazoleFaq },
  { slug:"metformine-maroc", aboutEntity:"Metformine",
    title:"Metformine : le médicament de référence du diabète de type 2",
    excerpt:"Metformine : à quoi elle sert, comment la prendre (pendant les repas), précautions (reins, scanner iodé), effets digestifs et conseils. Fiche adaptée au Maroc.",
    metaTitle:"Metformine : usage et précautions (diabète) | Maroc",
    metaDesc:"Metformine (Glucophage) : médicament de référence du diabète de type 2, comment la prendre, précautions (reins, scanner iodé), effets digestifs et conseils. Adapté au Maroc.",
    readingTime:5, content:cMetformine, keyTakeaways:metformineTk, faq:metformineFaq },
  { slug:"aspirine-maroc", aboutEntity:"Aspirine",
    title:"Aspirine : deux usages, deux précautions",
    excerpt:"Aspirine : antidouleur à dose élevée, « fluidifiant » du sang à faible dose. Usages, contre-indications (enfant fiévreux, ulcère), saignements et interactions. Adapté au Maroc.",
    metaTitle:"Aspirine : usages, doses et précautions | Maroc",
    metaDesc:"Aspirine : antidouleur à dose élevée, antiagrégant à faible dose (cardio). Usages, contre-indications (enfant fiévreux, ulcère, grossesse), risque de saignement et interactions. Adapté au Maroc.",
    readingTime:5, content:cAspirine, keyTakeaways:aspirineTk, faq:aspirineFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name, description: CATEGORY.description, color: CATEGORY.color },
    create: CATEGORY, select: { id: true, slug: true },
  });
  console.log(`✓ Catégorie  /blog/categorie/${cat.slug}  (${CATEGORY.name})`);
  const now = new Date();
  for (const art of ARTICLES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:cat.id, metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`✓ Médicament  /blog/${post.slug}`);
  }
  console.log(`\nCatégorie Médicaments : ${ARTICLES.length} fiches publiées.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
