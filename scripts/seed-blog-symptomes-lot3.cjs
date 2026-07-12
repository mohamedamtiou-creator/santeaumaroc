require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie SYMPTÔMES — LOT 3 (catégorie créée par seed-blog-symptomes.cjs).
// Gabarit Symptôme : causes fréquentes, causes graves, que faire à la maison,
// quand consulter, QUAND APPELER LES URGENCES, examens, traitements + FAQ + À
// retenir. Rappel : seul un médecin pose un diagnostic. Idempotent (upsert).
//   • Sang dans les urines → médecine générale (repli)
//   • Diarrhée             → gastro-entérologie
//   • Constipation         → gastro-entérologie
//   • Démangeaisons        → dermatologie
//   • Perte de poids       → médecine générale (repli)
//   • Brûlures urinaires   → médecine générale (repli)
// ════════════════════════════════════════════════════════════════════════════

const cUrines = `<p>Voir du sang dans ses urines (hématurie) est toujours impressionnant. La cause est souvent bénigne, mais ce signe doit <strong>toujours</strong> être évalué par un médecin, même s'il ne survient qu'une fois et sans douleur, car il peut parfois révéler une maladie sérieuse.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Infection urinaire (<a href="/blog/brulures-urinaires-maroc">cystite</a>)</li>
<li><a href="/blog/calculs-renaux-maroc">Calcul urinaire</a></li>
<li>Chez l'homme âgé : problème de prostate</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li>Tumeur de la vessie ou du rein</li>
<li>Maladie des reins (glomérulonéphrite)</li>
</ul>

<h2>Attention aux fausses alertes</h2>
<p>Certains aliments (betterave), médicaments ou les règles chez la femme peuvent colorer les urines sans qu'il s'agisse de sang. En cas de doute, seul un examen d'urine tranche.</p>

<h2>Que faire à la maison ?</h2>
<p>Bien s'hydrater, noter les circonstances (douleur, caillots, brûlures) et ne pas ignorer le signe. Prenez rendez-vous rapidement, même si tout semble rentré dans l'ordre.</p>

<h2>Quand consulter un médecin ?</h2>
<p>Systématiquement, dès le premier épisode de sang visible dans les urines, avec ou sans douleur.</p>

<h2>Quand appeler les urgences ?</h2>
<ul>
<li>Impossibilité d'uriner (blocage)</li>
<li>Fièvre élevée avec douleur du dos et frissons (infection)</li>
<li>Caillots abondants, malaise ou pâleur</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Bandelette et analyse d'urine (ECBU), échographie, parfois examen de la vessie (cystoscopie) et scanner, selon l'âge et le contexte.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent de la cause : antibiotiques pour une infection, prise en charge d'un calcul, avis spécialisé si autre cause. <strong>Seul un médecin peut poser un diagnostic.</strong></p>

<hr>
<p>Du sang dans les urines ne doit jamais être négligé. Sur SantéauMaroc, trouvez un médecin près de chez vous. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;
const urinesFaq = [
  { q: "Du sang dans les urines est-il toujours grave ?", a: "Non, la cause est souvent bénigne (infection, calcul), mais ce signe doit toujours être évalué par un médecin, même une seule fois et sans douleur, car il peut parfois révéler une tumeur ou une maladie rénale. Ne le négligez jamais." },
  { q: "Quelles sont les causes de sang dans les urines ?", a: "Le plus souvent une infection urinaire, un calcul ou, chez l'homme âgé, un problème de prostate. Plus rarement, une tumeur de la vessie ou du rein, ou une maladie rénale. Un examen d'urine et un bilan permettent d'en trouver la cause." },
  { q: "Des urines rouges signifient-elles toujours du sang ?", a: "Non. La betterave, certains médicaments ou les règles chez la femme peuvent colorer les urines sans qu'il s'agisse de sang. Seul un examen d'urine (bandelette, ECBU) permet de confirmer la présence réelle de sang." },
  { q: "Quand faut-il consulter pour du sang dans les urines ?", a: "Systématiquement, dès le premier épisode, avec ou sans douleur. C'est une urgence si vous ne pouvez plus uriner, en cas de fièvre élevée avec douleur du dos, ou de caillots abondants avec malaise." },
  { q: "Quels examens pour explorer une hématurie ?", a: "Une bandelette et une analyse d'urine (ECBU), une échographie, et selon l'âge et le contexte, un examen de la vessie (cystoscopie) et un scanner. Le médecin choisit les examens selon la situation." },
];
const urinesTk = [
  "Du sang dans les urines doit toujours être évalué, même une fois et sans douleur.",
  "Causes fréquentes : infection urinaire, calcul, prostate ; à écarter : tumeur.",
  "Attention aux fausses alertes (betterave, médicaments, règles).",
  "Blocage urinaire ou fièvre avec douleur du dos = urgence.",
];

const cDiarrhee = `<p>La diarrhée — des selles liquides et fréquentes — est très courante et le plus souvent bénigne, due à une infection passagère. L'essentiel est d'éviter la déshydratation, surtout chez l'enfant et la personne âgée, et de repérer les rares signes de gravité.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Gastro-entérite virale ou bactérienne, intoxication alimentaire</li>
<li>Stress, certains médicaments (dont les antibiotiques)</li>
<li>Aliments mal tolérés</li>
</ul>

<h2>Les causes plus graves ou chroniques</h2>
<ul>
<li>Infection sévère, diarrhée avec sang</li>
<li>Diarrhée qui dure (maladies inflammatoires de l'intestin, malabsorption)</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li><strong>Boire abondamment</strong> par petites gorgées (eau, solution de réhydratation) pour compenser les pertes.</li>
<li>Manger léger : riz, banane, carotte cuite ; éviter gras, laitages et fibres irritantes le temps de la crise.</li>
<li>Se laver soigneusement les mains pour éviter la transmission.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Si la diarrhée dure plus de 2 à 3 jours, chez un nourrisson, un enfant ou une personne âgée, ou en cas de signes de déshydratation (bouche sèche, urines rares, grande faiblesse).</p>

<h2>Quand appeler les urgences ?</h2>
<ul>
<li>Diarrhée avec <strong>sang</strong> ou forte fièvre</li>
<li>Signes de <strong>déshydratation sévère</strong> (somnolence, malaise)</li>
<li>Douleur abdominale intense</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Souvent aucun pour une diarrhée aiguë banale. Sinon : analyse des selles (coproculture), prise de sang, ou explorations si la diarrhée est chronique.</p>

<h2>Quels traitements possibles ?</h2>
<p>La priorité est la <strong>réhydratation</strong>. Les ralentisseurs du transit ne sont pas conseillés en cas de sang ou de fièvre. Les antibiotiques sont réservés à certaines causes. <strong>Seul un médecin peut poser un diagnostic</strong> si la diarrhée persiste.</p>

<hr>
<p>Une diarrhée qui dure ou inquiète ? Sur SantéauMaroc, trouvez un médecin près de chez vous. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;
const diarrheeFaq = [
  { q: "Que faire en cas de diarrhée ?", a: "Boire abondamment par petites gorgées (eau, solution de réhydratation), manger léger (riz, banane, carotte cuite), éviter gras et laitages le temps de la crise, et se laver soigneusement les mains. Consulter si cela dure ou en cas de signes de déshydratation." },
  { q: "Combien de temps dure une diarrhée bénigne ?", a: "Une diarrhée aiguë virale dure en général de un à trois jours. Au-delà, ou en cas de sang, de forte fièvre ou de déshydratation, il faut consulter. Chez le nourrisson et la personne âgée, la prudence s'impose plus tôt." },
  { q: "Quand la diarrhée est-elle une urgence ?", a: "En cas de sang dans les selles, de forte fièvre, de signes de déshydratation sévère (somnolence, malaise, urines rares) ou de douleur abdominale intense. Il faut alors appeler les secours ou consulter sans attendre." },
  { q: "Faut-il prendre un médicament contre la diarrhée ?", a: "La réhydratation est la priorité. Les ralentisseurs du transit ne sont pas conseillés en cas de sang ou de fièvre, car ils peuvent aggraver certaines infections. Les antibiotiques sont réservés à des causes précises, sur avis médical." },
  { q: "Comment éviter de transmettre une gastro-entérite ?", a: "En se lavant soigneusement les mains après être allé aux toilettes et avant de manger ou de cuisiner, en nettoyant les surfaces et en évitant de préparer les repas des autres pendant la phase aiguë. L'hygiène des mains est la mesure clé." },
];
const diarrheeTk = [
  "La diarrhée est le plus souvent bénigne (infection passagère).",
  "Priorité : boire par petites gorgées pour éviter la déshydratation.",
  "Sang dans les selles, forte fièvre ou déshydratation sévère = urgence.",
  "Réhydrater d'abord ; ralentisseurs déconseillés si sang ou fièvre.",
];

const cConstipation = `<p>La constipation — des selles rares, dures ou difficiles à évacuer — est très fréquente et le plus souvent bénigne, liée au mode de vie. Certains changements récents ou signes associés doivent toutefois amener à consulter.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Manque de fibres et d'eau, alimentation déséquilibrée</li>
<li>Sédentarité, se retenir d'aller à la selle, changement d'habitudes (voyage)</li>
<li>Grossesse, certains médicaments</li>
</ul>

<h2>Les causes à explorer</h2>
<ul>
<li><a href="/blog/hypothyroidie-maroc">Hypothyroïdie</a></li>
<li>Un obstacle sur l'intestin, notamment en cas de constipation récente après 50 ans (voir <a href="/blog/cancer-colorectal-maroc">cancer colorectal</a>)</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Augmenter les <strong>fibres</strong> (fruits, légumes, légumineuses, céréales complètes) et boire suffisamment.</li>
<li>Bouger régulièrement.</li>
<li>Aller à la selle dès que l'envie se présente, sans se retenir.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Si la constipation est récente et persistante (surtout après 50 ans), s'accompagne de sang dans les selles, d'un amaigrissement, de douleurs, ou d'une alternance avec des diarrhées.</p>

<h2>Quand appeler les urgences ?</h2>
<p>En cas d'<strong>arrêt total des gaz et des selles</strong> avec ventre gonflé, douleurs intenses et vomissements : cela peut évoquer une occlusion intestinale, une urgence.</p>

<h2>Quels examens possibles ?</h2>
<p>Souvent aucun pour une constipation banale. Sinon, selon le contexte : prise de sang (dont thyroïde) et coloscopie, notamment en cas de signes d'alerte ou après 50 ans.</p>

<h2>Quels traitements possibles ?</h2>
<p>Les mesures d'hygiène de vie sont la base. Les laxatifs peuvent aider ponctuellement, sur conseil médical, sans en abuser. <strong>Seul un médecin peut poser un diagnostic</strong> devant une constipation inhabituelle.</p>

<hr>
<p>Une constipation récente ou inhabituelle ? Sur SantéauMaroc, trouvez un médecin près de chez vous. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;
const constipationFaq = [
  { q: "Comment soulager la constipation naturellement ?", a: "En augmentant les fibres (fruits, légumes, légumineuses, céréales complètes), en buvant suffisamment, en bougeant régulièrement et en allant à la selle dès que l'envie se présente, sans se retenir. Ces mesures suffisent le plus souvent." },
  { q: "Quand la constipation doit-elle inquiéter ?", a: "Quand elle est récente et persistante, surtout après 50 ans, ou qu'elle s'accompagne de sang dans les selles, d'un amaigrissement, de douleurs, ou d'une alternance avec des diarrhées. Ces signes justifient une consultation." },
  { q: "La constipation peut-elle être une urgence ?", a: "Oui, rarement : un arrêt total des gaz et des selles avec ventre gonflé, douleurs intenses et vomissements peut évoquer une occlusion intestinale, qui est une urgence nécessitant d'appeler les secours." },
  { q: "Les laxatifs sont-ils dangereux ?", a: "Utilisés ponctuellement et sur conseil, ils dépannent. Il ne faut pas en abuser au long cours sans avis médical, car cela peut entretenir le problème. Les mesures d'hygiène de vie restent la base du traitement de la constipation." },
  { q: "La constipation peut-elle venir de la thyroïde ?", a: "Oui, l'hypothyroïdie (thyroïde qui fonctionne au ralenti) ralentit le transit et peut provoquer une constipation, souvent avec fatigue, prise de poids et frilosité. Une prise de sang (TSH) permet de le vérifier si le médecin le suspecte." },
];
const constipationTk = [
  "La constipation est fréquente et le plus souvent liée au mode de vie.",
  "Base du traitement : fibres, hydratation, activité, ne pas se retenir.",
  "Constipation récente après 50 ans, sang ou amaigrissement = consulter.",
  "Arrêt total des gaz et des selles avec ventre gonflé = urgence (occlusion).",
];

const cDemangeaisons = `<p>Les démangeaisons (prurit) sont un motif fréquent de consultation. Le plus souvent liées à la peau (sécheresse, allergie), elles peuvent parfois, quand elles sont généralisées et sans lésion, révéler une maladie interne. Voici comment s'y retrouver.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Peau sèche (surtout en hiver et chez le senior)</li>
<li>Eczéma, urticaire, <a href="/blog/allergie-maroc">allergie</a>, réaction à un médicament</li>
<li>Piqûres d'insectes, parasites (gale)</li>
</ul>

<h2>Les causes plus générales à ne pas manquer</h2>
<p>Des démangeaisons diffuses et persistantes, <strong>sans éruption visible</strong>, peuvent être liées à une maladie du foie, des reins, de la thyroïde, à un diabète ou, plus rarement, à une maladie du sang. Elles justifient un bilan.</p>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Hydrater la peau avec un émollient, éviter l'eau très chaude et les savons agressifs.</li>
<li>Ne pas gratter (cela aggrave et abîme la peau) ; garder les ongles courts.</li>
<li>Porter des vêtements en coton, éviter les irritants connus.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Si les démangeaisons sont généralisées, persistantes, sans cause évidente, ou s'accompagnent d'autres signes (jaunisse, amaigrissement, fatigue, lésions qui s'étendent).</p>

<h2>Quand appeler les urgences ?</h2>
<p>Si les démangeaisons s'accompagnent d'un <strong>gonflement du visage, des lèvres ou de la gorge et d'une gêne à respirer</strong> : c'est une réaction allergique grave (anaphylaxie), une urgence vitale.</p>

<h2>Quels examens possibles ?</h2>
<p>Examen de la peau, et selon le contexte, prise de sang (foie, reins, thyroïde, glycémie, numération) pour rechercher une cause générale.</p>

<h2>Quels traitements possibles ?</h2>
<p>Hydratation de la peau, antihistaminiques, traitements locaux et surtout traitement de la cause. <strong>Seul un médecin peut poser un diagnostic</strong> devant un prurit qui dure.</p>

<hr>
<p>Des démangeaisons persistantes ou inexpliquées ? Sur SantéauMaroc, trouvez un dermatologue près de chez vous. En cas de gonflement avec gêne à respirer, appelez immédiatement les secours.</p>`;
const demangeaisonsFaq = [
  { q: "Quelles sont les causes des démangeaisons ?", a: "Le plus souvent la peau sèche, l'eczéma, l'urticaire, une allergie, une réaction médicamenteuse ou des piqûres. Des démangeaisons diffuses sans lésion visible peuvent aussi révéler une maladie du foie, des reins, de la thyroïde ou un diabète." },
  { q: "Comment calmer des démangeaisons ?", a: "En hydratant la peau avec un émollient, en évitant l'eau très chaude et les savons agressifs, en ne grattant pas (ongles courts) et en portant du coton. Un antihistaminique peut aider ; si cela persiste, il faut consulter pour traiter la cause." },
  { q: "Quand des démangeaisons doivent-elles inquiéter ?", a: "Quand elles sont généralisées, persistantes, sans cause évidente, ou associées à d'autres signes (jaunisse, amaigrissement, fatigue). Elles justifient alors un bilan pour rechercher une maladie interne sous-jacente." },
  { q: "Des démangeaisons peuvent-elles être une urgence ?", a: "Oui, si elles s'accompagnent d'un gonflement du visage, des lèvres ou de la gorge et d'une gêne à respirer : c'est une réaction allergique grave (anaphylaxie), une urgence vitale qui impose d'appeler immédiatement les secours." },
  { q: "Les démangeaisons sans bouton, est-ce normal ?", a: "Des démangeaisons diffuses sans éruption visible ne doivent pas être banalisées si elles persistent : elles peuvent être liées à une peau très sèche, mais aussi à une maladie du foie, des reins, de la thyroïde ou du sang. Un avis médical est utile." },
];
const demangeaisonsTk = [
  "Les démangeaisons viennent le plus souvent de la peau (sécheresse, allergie, eczéma).",
  "Un prurit diffus sans lésion peut révéler une maladie interne : à explorer.",
  "À la maison : hydrater, ne pas gratter, éviter eau chaude et savons agressifs.",
  "Gonflement du visage/gorge avec gêne à respirer = urgence (anaphylaxie).",
];

const cPertePoids = `<p>Perdre du poids sans l'avoir cherché — sans régime ni changement d'activité — n'est pas anodin. Une perte involontaire et significative est un signal qui doit toujours amener à consulter pour en trouver la cause.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Stress, anxiété, <a href="/blog/depression-maroc">dépression</a></li>
<li>Excès d'hormones thyroïdiennes (hyperthyroïdie)</li>
<li><a href="/blog/diabete-type-2-maroc">Diabète</a> mal équilibré</li>
<li>Problèmes digestifs, perte d'appétit, chez le senior une <a href="/blog/nutrition-personne-agee-maroc">dénutrition</a></li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li>Cancers</li>
<li>Infections chroniques (dont la tuberculose)</li>
<li>Maladies inflammatoires ou digestives</li>
</ul>

<h2>Que faire à la maison ?</h2>
<p>Objectiver la perte (se peser régulièrement), noter les symptômes associés (fièvre, sueurs, troubles digestifs, fatigue) et ne pas banaliser. Il n'y a pas d'« auto-traitement » : c'est un signe à explorer.</p>

<h2>Quand consulter un médecin ?</h2>
<p>Devant toute perte de poids involontaire et notable (par exemple plus de 5 % du poids en quelques semaines à mois), surtout si elle s'accompagne d'autres symptômes. Un bilan est nécessaire.</p>

<h2>Quand consulter rapidement ?</h2>
<ul>
<li>Perte de poids rapide et importante</li>
<li>Association à une fièvre prolongée, des sueurs nocturnes, du sang (selles, urines, crachats)</li>
<li>Fatigue majeure, chez une personne âgée ou fragile</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Prise de sang (dont thyroïde, glycémie, numération, inflammation), et selon l'orientation, imagerie ou examens ciblés pour rechercher la cause.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent entièrement de la cause identifiée. <strong>Seul un médecin peut poser un diagnostic</strong> : une perte de poids inexpliquée ne se traite pas sans en connaître l'origine.</p>

<hr>
<p>Une perte de poids que vous n'expliquez pas ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;
const pertePoidsFaq = [
  { q: "Quand une perte de poids est-elle inquiétante ?", a: "Quand elle est involontaire et notable (souvent plus de 5 % du poids en quelques semaines à mois), sans régime ni changement d'activité, surtout si elle s'accompagne d'autres symptômes (fièvre, sueurs, fatigue, troubles digestifs). Elle impose un bilan." },
  { q: "Quelles sont les causes d'une perte de poids inexpliquée ?", a: "Le stress et la dépression, une hyperthyroïdie, un diabète mal équilibré, des problèmes digestifs, une dénutrition chez le senior, mais aussi des causes plus sérieuses comme un cancer, une infection chronique (tuberculose) ou une maladie inflammatoire." },
  { q: "Faut-il consulter pour une perte de poids sans régime ?", a: "Oui. Une perte de poids involontaire et significative n'est jamais anodine : elle doit amener à consulter pour en rechercher la cause par un bilan. Il n'existe pas d'auto-traitement d'un tel signe." },
  { q: "Quels examens pour une perte de poids inexpliquée ?", a: "Le plus souvent une prise de sang (thyroïde, glycémie, numération, marqueurs d'inflammation) et, selon l'orientation clinique, une imagerie ou des examens ciblés. Le médecin choisit les examens selon les symptômes associés." },
  { q: "La dépression peut-elle faire maigrir ?", a: "Oui, la dépression et l'anxiété peuvent réduire l'appétit et entraîner une perte de poids. C'est une cause fréquente, à retenir après avoir écarté les autres. Le médecin évalue l'ensemble de la situation avant de conclure." },
];
const pertePoidsTk = [
  "Une perte de poids involontaire et notable n'est jamais anodine.",
  "Causes variées : dépression, thyroïde, diabète, digestif — mais aussi cancer, infection.",
  "Toute perte inexpliquée impose de consulter pour un bilan.",
  "Fièvre prolongée, sueurs nocturnes ou sang associés = consulter rapidement.",
];

const cBrulures = `<p>Des brûlures en urinant, avec des envies fréquentes et pressantes, évoquent le plus souvent une infection urinaire (cystite), très fréquente chez la femme. Bénigne dans la plupart des cas, elle nécessite toutefois un traitement et une vigilance particulière dans certaines situations.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li><strong>Cystite</strong> (infection urinaire basse), surtout chez la femme</li>
<li>Irritation, parfois infection sexuellement transmissible</li>
</ul>

<h2>Les situations à ne pas banaliser</h2>
<ul>
<li>Infection urinaire chez l'<strong>homme</strong>, la <strong>femme enceinte</strong> ou l'<strong>enfant</strong> : toujours à évaluer</li>
<li><strong>Pyélonéphrite</strong> (infection du rein) : fièvre, frissons, douleur du dos ou du flanc</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Boire abondamment et uriner régulièrement.</li>
<li>Ne pas se retenir. Éviter l'automédication : une infection urinaire nécessite le plus souvent un avis médical.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>En cas de brûlures qui persistent, de sang dans les urines, de récidives, et systématiquement chez l'homme, la femme enceinte et l'enfant.</p>

<h2>Quand appeler les urgences ?</h2>
<ul>
<li>Fièvre élevée avec frissons et douleur du dos ou du flanc (pyélonéphrite)</li>
<li>Impossibilité d'uriner</li>
<li>Altération de l'état général, chez une personne fragile</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Une bandelette urinaire et un examen des urines (ECBU) confirment l'infection et guident l'antibiotique. Des examens complémentaires sont réalisés en cas de récidives ou de forme compliquée.</p>

<h2>Quels traitements possibles ?</h2>
<p>La cystite se traite par <strong>antibiotiques</strong>, sur prescription, avec une bonne hydratation. Les formes compliquées (pyélonéphrite, homme, grossesse) nécessitent une prise en charge adaptée. <strong>Seul un médecin peut poser un diagnostic</strong> et prescrire le traitement.</p>

<hr>
<p>Des brûlures urinaires gênantes ou récidivantes ? Sur SantéauMaroc, trouvez un médecin près de chez vous. En cas de fièvre avec douleur du dos, appelez ou consultez en urgence.</p>`;
const bruluresFaq = [
  { q: "Qu'est-ce qui provoque des brûlures en urinant ?", a: "Le plus souvent une cystite (infection urinaire basse), surtout chez la femme, avec des envies fréquentes et pressantes. Plus rarement, une irritation ou une infection sexuellement transmissible. Un examen d'urine permet de confirmer l'infection." },
  { q: "Une infection urinaire est-elle grave ?", a: "Une cystite simple est bénigne mais nécessite un traitement. Elle est à ne pas banaliser chez l'homme, la femme enceinte et l'enfant. Une fièvre avec douleur du dos et frissons évoque une infection du rein (pyélonéphrite), plus grave, à traiter en urgence." },
  { q: "Que faire en cas de brûlures urinaires ?", a: "Boire abondamment, uriner régulièrement sans se retenir, et consulter : une infection urinaire nécessite le plus souvent un antibiotique sur prescription. L'automédication est déconseillée. Un examen d'urine guide le traitement." },
  { q: "Quand des brûlures urinaires sont-elles une urgence ?", a: "En cas de fièvre élevée avec frissons et douleur du dos ou du flanc (pyélonéphrite), d'impossibilité d'uriner, ou d'altération de l'état général chez une personne fragile. Il faut alors consulter ou appeler les secours sans attendre." },
  { q: "Pourquoi les infections urinaires reviennent-elles ?", a: "Les récidives sont fréquentes, surtout chez la femme. Boire suffisamment, uriner régulièrement et après les rapports, et de bonnes habitudes d'hygiène aident à les prévenir. En cas de récidives, le médecin peut proposer un bilan et des mesures adaptées." },
];
const bruluresTk = [
  "Des brûlures en urinant évoquent le plus souvent une cystite, surtout chez la femme.",
  "À ne pas banaliser chez l'homme, la femme enceinte et l'enfant.",
  "Fièvre avec douleur du dos et frissons = infection du rein, urgence.",
  "La cystite se traite par antibiotiques sur prescription : éviter l'automédication.",
];

const ARTICLES = [
  { slug: "sang-dans-les-urines-maroc", aboutEntity: "Hématurie",
    title: "Sang dans les urines : causes et quand consulter",
    excerpt: "Sang dans les urines (hématurie) : causes fréquentes et graves, fausses alertes, pourquoi toujours consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    metaTitle: "Sang dans les urines : causes et quand consulter | Maroc",
    metaDesc: "Sang dans les urines (hématurie) : causes fréquentes (infection, calcul) et graves, fausses alertes, pourquoi toujours consulter et signes d'urgence. Guide clair adapté au Maroc.",
    readingTime: 5, content: cUrines, keyTakeaways: urinesTk, faq: urinesFaq },
  { slug: "diarrhee-maroc", aboutEntity: "Diarrhée",
    title: "Diarrhée : que faire et quand consulter",
    excerpt: "Diarrhée : causes fréquentes et graves, comment éviter la déshydratation, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    metaTitle: "Diarrhée : que faire et quand consulter | Maroc",
    metaDesc: "Diarrhée : causes fréquentes et graves, comment se réhydrater, que manger, quand consulter et signes d'urgence (sang, fièvre, déshydratation). Guide clair adapté au Maroc.",
    readingTime: 5, content: cDiarrhee, keyTakeaways: diarrheeTk, faq: diarrheeFaq },
  { slug: "constipation-maroc", aboutEntity: "Constipation",
    title: "Constipation : causes, que faire et quand consulter",
    excerpt: "Constipation : causes fréquentes et à explorer, que faire à la maison, quand consulter et quand c'est une urgence (occlusion). Guide clair adapté au Maroc.",
    metaTitle: "Constipation : que faire et quand consulter | Maroc",
    metaDesc: "Constipation : causes fréquentes et à explorer (thyroïde, côlon), mesures à la maison (fibres, eau), quand consulter et signe d'urgence (occlusion). Guide clair adapté au Maroc.",
    readingTime: 5, content: cConstipation, keyTakeaways: constipationTk, faq: constipationFaq },
  { slug: "demangeaisons-maroc", aboutEntity: "Prurit",
    title: "Démangeaisons : causes, que faire et quand consulter",
    excerpt: "Démangeaisons (prurit) : causes de la peau et causes générales, comment les calmer, quand consulter et quand c'est une urgence (anaphylaxie). Guide clair adapté au Maroc.",
    metaTitle: "Démangeaisons : causes et quand consulter | Maroc",
    metaDesc: "Démangeaisons (prurit) : causes cutanées et générales (foie, reins, thyroïde), comment les calmer, quand consulter et signe d'urgence (anaphylaxie). Guide clair adapté au Maroc.",
    readingTime: 5, content: cDemangeaisons, keyTakeaways: demangeaisonsTk, faq: demangeaisonsFaq },
  { slug: "perte-de-poids-inexpliquee-maroc", aboutEntity: "Perte de poids",
    title: "Perte de poids inexpliquée : quand faut-il s'inquiéter ?",
    excerpt: "Perte de poids involontaire : causes fréquentes et graves, pourquoi toujours consulter, quand consulter rapidement et quels examens. Guide clair adapté au Maroc.",
    metaTitle: "Perte de poids inexpliquée : quand s'inquiéter ? | Maroc",
    metaDesc: "Perte de poids inexpliquée : causes fréquentes (thyroïde, diabète, dépression) et graves (cancer, infection), pourquoi consulter et quels examens. Guide clair adapté au Maroc.",
    readingTime: 5, content: cPertePoids, keyTakeaways: pertePoidsTk, faq: pertePoidsFaq },
  { slug: "brulures-urinaires-maroc", aboutEntity: "Infection urinaire",
    title: "Brûlures urinaires : cystite, que faire et quand consulter",
    excerpt: "Brûlures en urinant : cystite et infection urinaire, situations à ne pas banaliser, que faire, quand consulter et quand c'est une urgence (pyélonéphrite). Adapté au Maroc.",
    metaTitle: "Brûlures urinaires (cystite) : que faire | Maroc",
    metaDesc: "Brûlures urinaires : cystite et infection urinaire, situations à ne pas banaliser (homme, grossesse, enfant), que faire, quand consulter et urgence (pyélonéphrite). Adapté au Maroc.",
    readingTime: 5, content: cBrulures, keyTakeaways: bruluresTk, faq: bruluresFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.findUnique({ where: { slug: "symptomes" }, select: { id: true } });
  if (!cat) { console.error("Catégorie 'symptomes' introuvable."); process.exit(1); }
  const now = new Date();
  for (const art of ARTICLES) {
    const data = {
      title: art.title, excerpt: art.excerpt, content: art.content, categoryId: cat.id,
      metaTitle: art.metaTitle, metaDesc: art.metaDesc, readingTime: art.readingTime,
      keyTakeaways: art.keyTakeaways.join("\n"), faqJson: JSON.stringify(art.faq), aboutEntity: art.aboutEntity,
      reviewedById: admin.id, reviewedAt: now,
    };
    const post = await prisma.post.upsert({
      where: { slug: art.slug }, update: data,
      create: { ...data, slug: art.slug, authorId: admin.id, status: "PUBLISHED", publishedAt: now },
      select: { slug: true },
    });
    console.log(`✓ Symptôme  /blog/${post.slug}`);
  }
  console.log(`\nSymptômes lot 3 : ${ARTICLES.length} fiches publiées.`);
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
