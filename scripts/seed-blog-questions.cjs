require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie QUESTIONS FRÉQUENTES (brief cat. 9). Articles-questions optimisés
// featured snippets : RÉPONSE DIRECTE en tête, puis l'essentiel, puis renvoi
// vers la fiche complète (hub-and-spoke, pas de duplication). Distincte du
// système Q/R communautaire /questions. Idempotent (upsert).
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  name: "Questions fréquentes",
  slug: "questions-frequentes",
  description:
    "Les réponses claires et directes aux questions de santé les plus posées au Maroc : diabète, tension, AVC, fatigue, migraine… Une information fiable et concise, qui ne remplace jamais l'avis de votre médecin.",
  color: "blue",
};

const cDiabGuerit = `<p><strong>Non, le diabète de type 2 ne se « guérit » pas définitivement, mais il se contrôle très bien</strong> — et chez certaines personnes, une perte de poids et une hygiène de vie saine permettent une <strong>rémission</strong> (glycémie normale sans médicament), à condition de la maintenir dans le temps.</p>

<h2>L'essentiel</h2>
<ul>
<li>Le diabète de type 2 est une maladie chronique : on parle de contrôle et parfois de rémission, pas de guérison définitive.</li>
<li>Dépisté tôt et bien pris en charge, il évite les complications et laisse mener une vie normale.</li>
<li>Le diabète de type 1, lui, nécessite de l'insuline à vie.</li>
</ul>

<h2>Ce qui aide au contrôle (voire à la rémission)</h2>
<p>Perte de poids, alimentation équilibrée, activité physique régulière et, si besoin, traitement. Le suivi de l'HbA1c guide la prise en charge.</p>

<h2>Pour aller plus loin</h2>
<p>Consultez notre fiche complète : <a href="/blog/diabete-type-2-maroc">Diabète de type 2 : symptômes, causes et traitement</a>.</p>

<hr>
<p>Une question sur votre diabète ? Sur SantéauMaroc, trouvez un médecin ou un endocrinologue près de chez vous.</p>`;

const cBaisserTension = `<p><strong>Pour faire baisser la tension : réduire le sel (moins de 5 g/jour), marcher 30 minutes par jour, perdre du poids si nécessaire, limiter l'alcool et arrêter le tabac.</strong> Si ces mesures ne suffisent pas, un traitement prescrit par le médecin est nécessaire — et ne doit jamais être arrêté seul.</p>

<h2>L'essentiel</h2>
<ul>
<li>L'hygiène de vie est le premier levier, parfois suffisant dans les formes légères.</li>
<li>Il n'existe pas de moyen « miracle » de faire chuter la tension en urgence à la maison : une poussée avec symptômes (douleur thoracique, troubles neurologiques) est une urgence.</li>
<li>Le traitement, quand il est prescrit, se prend au long cours.</li>
</ul>

<h2>Attention</h2>
<p>Devant une tension très élevée avec douleur dans la poitrine, essoufflement, troubles de la vision ou de la parole : appelez les secours.</p>

<h2>Pour aller plus loin</h2>
<p>Voir notre fiche : <a href="/blog/hypertension-arterielle-maroc">Hypertension artérielle : symptômes, causes et traitement</a> et <a href="/blog/alimentation-anti-hypertension-maroc">l'alimentation anti-hypertension</a>.</p>

<hr>
<p>Besoin d'aide pour votre tension ? Sur SantéauMaroc, trouvez un médecin ou un cardiologue près de chez vous.</p>`;

const cSignesAvc = `<p><strong>Les premiers signes d'un AVC apparaissent brutalement — retenez le mot « VITE » : Visage déformé (bouche qui tombe d'un côté), Incapacité à lever un bras, Trouble de la parole, En urgence appelez les secours.</strong> D'autres signes : perte brutale de la vue, vertige intense, mal de tête violent et soudain.</p>

<h2>L'essentiel</h2>
<ul>
<li>Devant l'un de ces signes, même transitoire, appelez immédiatement les secours (au Maroc, SAMU 141 ou protection civile 15).</li>
<li>Notez l'heure d'apparition, ne conduisez pas vous-même, ne donnez ni à boire ni à manger.</li>
<li>Chaque minute compte : plus la prise en charge est rapide, moins il y a de séquelles.</li>
</ul>

<h2>Pour aller plus loin</h2>
<p>Voir : <a href="/blog/avc-signes-reconnaitre-maroc">Reconnaître un AVC : la règle VITE</a> et la fiche <a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a>.</p>

<hr>
<p>Devant ces signes, appelez les secours. Pour évaluer votre risque, trouvez un cardiologue sur SantéauMaroc.</p>`;

const cFatigue = `<p><strong>Une fatigue permanente s'explique le plus souvent par un manque de sommeil, du stress ou une dépression, une anémie, une hypothyroïdie, un diabète ou des carences.</strong> Une fatigue qui dure et retentit sur le quotidien mérite un bilan, souvent une simple prise de sang.</p>

<h2>L'essentiel</h2>
<ul>
<li>La fatigue passagère est normale ; une fatigue durable justifie d'en chercher la cause.</li>
<li>Une prise de sang (numération, ferritine, TSH, glycémie) oriente souvent le diagnostic.</li>
<li>Consulter rapidement si la fatigue s'accompagne d'un amaigrissement, d'un essoufflement ou d'une pâleur.</li>
</ul>

<h2>Pour aller plus loin</h2>
<p>Voir notre fiche : <a href="/blog/fatigue-permanente-maroc">Fatigue permanente : pourquoi suis-je toujours fatigué ?</a></p>

<hr>
<p>Une fatigue qui dure ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;

const cMigraine = `<p><strong>Pour soulager une migraine : prendre son traitement dès les premiers signes (antalgique ou anti-inflammatoire, et si besoin un triptan prescrit), se reposer dans le calme et l'obscurité, et bien s'hydrater.</strong> Attention à ne pas abuser des antalgiques, qui peuvent entretenir les maux de tête.</p>

<h2>L'essentiel</h2>
<ul>
<li>Plus le traitement est pris tôt, plus il est efficace.</li>
<li>En cas de crises fréquentes, un traitement de fond peut être prescrit.</li>
<li>Un mal de tête brutal, inhabituel ou avec fièvre et raideur de nuque doit faire consulter sans tarder.</li>
</ul>

<h2>Pour aller plus loin</h2>
<p>Voir : <a href="/blog/migraine-traitement-crise-maroc">Traiter une crise de migraine</a> et la fiche <a href="/blog/migraine-maroc">Migraine</a>.</p>

<hr>
<p>Des migraines difficiles à soulager ? Sur SantéauMaroc, trouvez un médecin près de chez vous.</p>`;

const cToux = `<p><strong>Il faut consulter pour une toux si elle dure plus de 3 semaines, ou si elle s'accompagne de fièvre, d'essoufflement, de crachats colorés ou de sang, d'un amaigrissement ou de sueurs nocturnes.</strong> Au Maroc, une toux prolongée avec ces signes fait notamment rechercher une tuberculose.</p>

<h2>L'essentiel</h2>
<ul>
<li>La plupart des toux aiguës sont virales et passagères.</li>
<li>Une toux qui traîne (plus de 3 semaines) doit toujours être explorée.</li>
<li>Urgence si difficulté importante à respirer, douleur thoracique ou crachats de sang abondants.</li>
</ul>

<h2>Pour aller plus loin</h2>
<p>Voir notre fiche : <a href="/blog/toux-maroc">Toux : causes, que faire et quand consulter</a>.</p>

<hr>
<p>Une toux qui persiste ? Sur SantéauMaroc, trouvez un médecin ou un pneumologue près de chez vous.</p>`;

const cMalTete = `<p><strong>On peut avoir mal à la tête souvent à cause du stress et de la fatigue (céphalées de tension), d'une migraine, d'un manque de sommeil, de la déshydratation, d'un problème de vue, ou d'un excès d'antalgiques.</strong> Des maux de tête fréquents méritent d'en chercher la cause avec un médecin.</p>

<h2>L'essentiel</h2>
<ul>
<li>La plupart des maux de tête récurrents sont bénins (tension, migraine).</li>
<li>Un excès d'antalgiques peut, paradoxalement, entretenir les maux de tête.</li>
<li>Consulter en urgence si un mal de tête est brutal et intense « comme jamais », avec fièvre et raideur de nuque, ou des troubles neurologiques.</li>
</ul>

<h2>Pour aller plus loin</h2>
<p>Voir : <a href="/blog/mal-de-tete-maroc">Mal de tête : causes et quand s'inquiéter</a> et <a href="/blog/migraine-maroc">Migraine</a>.</p>

<hr>
<p>Des maux de tête fréquents ? Sur SantéauMaroc, trouvez un médecin près de chez vous.</p>`;

const cTensionNormale = `<p><strong>Une tension normale est inférieure à 140/90 mmHg (soit « 14/9 ») mesurée au cabinet, et idéalement autour de 120/80 (« 12/8 »).</strong> En automesure à domicile, on parle d'hypertension à partir de 135/85. Le diagnostic repose toujours sur des mesures répétées.</p>

<h2>L'essentiel</h2>
<ul>
<li>Les deux chiffres : le premier (systolique) = cœur qui se contracte ; le second (diastolique) = cœur au repos.</li>
<li>Une seule mesure ne suffit pas : la tension varie et peut monter au cabinet (« effet blouse blanche »).</li>
<li>Faire contrôler sa tension au moins une fois par an à partir de 40 ans.</li>
</ul>

<h2>Pour aller plus loin</h2>
<p>Voir : <a href="/blog/mesurer-tension-arterielle-maroc">Bien mesurer sa tension à domicile</a> et la fiche <a href="/blog/hypertension-arterielle-maroc">Hypertension artérielle</a>.</p>

<hr>
<p>Un doute sur votre tension ? Sur SantéauMaroc, trouvez un médecin ou un cardiologue près de chez vous.</p>`;

const ARTICLES = [
  { slug:"diabete-se-guerit-il-maroc", spec:"endocrinologie-et-maladies-metaboliques", aboutEntity:"Diabète de type 2",
    title:"Est-ce que le diabète se guérit ?", excerpt:"Le diabète de type 2 se guérit-il ? Réponse claire : il se contrôle très bien et peut parfois entrer en rémission, mais ce n'est pas une guérison définitive. Explications, adaptées au Maroc.",
    metaTitle:"Est-ce que le diabète se guérit ? | Maroc", metaDesc:"Le diabète de type 2 se guérit-il ? Il se contrôle très bien et peut entrer en rémission (glycémie normale sans médicament), mais ce n'est pas une guérison définitive. Explications, au Maroc.",
    content:cDiabGuerit, keyTakeaways:["Le diabète de type 2 ne se guérit pas définitivement mais se contrôle très bien.","Une rémission est possible avec perte de poids et hygiène de vie, si maintenue.","Le diabète de type 1 nécessite de l'insuline à vie.","Dépisté tôt, il permet une vie normale et évite les complications."],
    faq:[{q:"Le diabète de type 2 peut-il disparaître ?",a:"Il ne disparaît pas définitivement, mais peut entrer en rémission (glycémie normale sans médicament) grâce à une perte de poids et une hygiène de vie saine, à condition de les maintenir. Le suivi médical reste nécessaire."},{q:"Peut-on arrêter son traitement du diabète ?",a:"Seulement sur décision médicale, si la glycémie le permet durablement. On ne l'arrête jamais seul : une glycémie contrôlée est souvent le signe que le traitement et l'hygiène de vie fonctionnent."},{q:"Quelle différence entre diabète de type 1 et de type 2 ?",a:"Le type 1 est auto-immun et nécessite de l'insuline à vie ; le type 2, lié au mode de vie et à l'hérédité, se traite d'abord par l'hygiène de vie puis par des médicaments."},{q:"Comment mettre son diabète en rémission ?",a:"Par une perte de poids significative et durable, une alimentation équilibrée et une activité physique régulière, sous suivi médical. La rémission n'est pas garantie ni définitive et dépend de chaque personne."}] },
  { slug:"comment-faire-baisser-tension-maroc", spec:"cardiologie", aboutEntity:"Hypertension artérielle",
    title:"Comment faire baisser la tension ?", excerpt:"Comment faire baisser la tension ? Réduire le sel, bouger, perdre du poids, limiter l'alcool et le tabac ; si besoin, un traitement prescrit. Réponse claire adaptée au Maroc.",
    metaTitle:"Comment faire baisser la tension ? | Maroc", metaDesc:"Comment faire baisser la tension : réduire le sel (<5 g/j), marcher 30 min/jour, perdre du poids, limiter l'alcool, arrêter le tabac, et un traitement si besoin. Réponse claire, au Maroc.",
    content:cBaisserTension, keyTakeaways:["L'hygiène de vie (sel, activité, poids) est le premier levier.","Pas de moyen « miracle » pour faire chuter la tension à la maison.","Le traitement prescrit se prend au long cours, sans l'arrêter seul.","Poussée avec douleur thoracique ou troubles neurologiques = urgence."],
    faq:[{q:"Comment faire baisser la tension rapidement ?",a:"Il n'existe pas de moyen sûr de faire chuter la tension en urgence à la maison. Se reposer et respirer calmement peut aider. Une tension très élevée avec des symptômes (douleur thoracique, troubles neurologiques) est une urgence : appelez les secours."},{q:"Quels aliments font baisser la tension ?",a:"Les fruits et légumes (riches en potassium), le poisson, les légumineuses et l'huile d'olive, en réduisant fortement le sel et les aliments transformés (régime type DASH)."},{q:"Le stress fait-il monter la tension ?",a:"Le stress provoque des pics ponctuels et, chronique, favorise l'hypertension. Le gérer aide, mais ne remplace pas les mesures d'hygiène de vie et le traitement éventuel."},{q:"Peut-on arrêter son traitement si la tension est normale ?",a:"Non, pas seul : c'est le traitement qui maintient ces bons chiffres. Tout arrêt se décide avec le médecin."}] },
  { slug:"premiers-signes-avc-maroc", spec:"cardiologie", aboutEntity:"Accident vasculaire cérébral",
    title:"Quels sont les premiers signes d'un AVC ?", excerpt:"Quels sont les premiers signes d'un AVC ? Ils apparaissent brutalement : visage déformé, faiblesse d'un bras, trouble de la parole (règle VITE). Réponse claire, adaptée au Maroc.",
    metaTitle:"Quels sont les premiers signes d'un AVC ? | Maroc", metaDesc:"Premiers signes d'un AVC (règle VITE) : visage déformé, incapacité à lever un bras, trouble de la parole, en urgence appeler les secours. Réponse claire et vitale, au Maroc.",
    content:cSignesAvc, keyTakeaways:["Signes brutaux « VITE » : Visage, Incapacité d'un bras, Trouble de la parole, En urgence.","Aussi : perte brutale de la vue, vertige intense, mal de tête soudain violent.","Appeler les secours même si les signes disparaissent.","Noter l'heure, ne pas conduire soi-même."],
    faq:[{q:"Que faire si je soupçonne un AVC ?",a:"Appeler immédiatement les secours (SAMU 141 ou protection civile 15), noter l'heure d'apparition des signes, allonger la personne, ne rien lui donner à boire ni à manger, et ne pas conduire soi-même."},{q:"Les signes d'AVC peuvent-ils disparaître ?",a:"Oui : s'ils régressent en quelques minutes, il s'agit peut-être d'un accident ischémique transitoire (AIT), signal d'alarme majeur. Il faut appeler les secours même si tout est rentré dans l'ordre."},{q:"Qui est à risque d'AVC ?",a:"Surtout les personnes hypertendues, diabétiques, avec un cholestérol élevé, fumeuses, ou ayant un trouble du rythme cardiaque. Contrôler ces facteurs prévient la plupart des AVC."},{q:"Pourquoi faut-il agir vite en cas d'AVC ?",a:"Parce que les traitements qui débouchent l'artère n'agissent que dans une fenêtre de quelques heures. Plus la prise en charge est rapide, moins il y a de séquelles."}] },
  { slug:"pourquoi-suis-je-toujours-fatigue-maroc", spec:"medecine-generale", aboutEntity:"Fatigue",
    title:"Pourquoi suis-je toujours fatigué ?", excerpt:"Pourquoi suis-je toujours fatigué ? Sommeil, stress, dépression, anémie, thyroïde, diabète, carences… Les causes fréquentes et quand faire un bilan. Réponse claire, adaptée au Maroc.",
    metaTitle:"Pourquoi suis-je toujours fatigué ? | Maroc", metaDesc:"Pourquoi suis-je toujours fatigué ? Causes fréquentes (sommeil, stress, dépression, anémie, thyroïde, diabète, carences) et quand faire une prise de sang. Réponse claire, au Maroc.",
    content:cFatigue, keyTakeaways:["Causes fréquentes : sommeil, stress/dépression, anémie, thyroïde, diabète, carences.","Une fatigue qui dure justifie un bilan, souvent une prise de sang.","Consulter vite si amaigrissement, essoufflement ou pâleur associés.","L'activité physique régulière redonne de l'énergie."],
    faq:[{q:"Quand s'inquiéter d'une fatigue ?",a:"Quand elle dure plus de quelques semaines, reste inexpliquée malgré le repos, ou s'accompagne d'un amaigrissement, d'un essoufflement, d'une pâleur ou d'une fièvre. Ces situations justifient une consultation."},{q:"Quel bilan pour une fatigue persistante ?",a:"Le plus souvent une prise de sang : numération (anémie), ferritine, TSH (thyroïde), glycémie, parfois vitamine D. Le médecin ajoute d'autres examens selon les symptômes."},{q:"La fatigue peut-elle venir de la thyroïde ?",a:"Oui, l'hypothyroïdie est une cause fréquente de fatigue, souvent avec prise de poids et frilosité. Une prise de sang (TSH) permet de le vérifier."},{q:"La dépression fatigue-t-elle ?",a:"Oui, la fatigue est un symptôme fréquent de la dépression et de l'anxiété. Si la fatigue s'accompagne d'une perte d'intérêt ou d'un moral bas, il faut en parler à un médecin."}] },
  { slug:"comment-soulager-une-migraine-maroc", spec:"medecine-generale", aboutEntity:"Migraine",
    title:"Comment soulager une migraine ?", excerpt:"Comment soulager une migraine ? Prendre son traitement dès les premiers signes, se reposer au calme et dans l'obscurité, s'hydrater. Réponse claire, adaptée au Maroc.",
    metaTitle:"Comment soulager une migraine ? | Maroc", metaDesc:"Comment soulager une migraine : traitement dès les premiers signes (antalgique, triptan si besoin), repos au calme et dans l'obscurité, hydratation. Sans abuser des antalgiques. Au Maroc.",
    content:cMigraine, keyTakeaways:["Traiter dès les premiers signes : c'est plus efficace.","Repos au calme et dans l'obscurité, hydratation.","Ne pas abuser des antalgiques (risque de céphalées d'abus).","Crises fréquentes = traitement de fond possible."],
    faq:[{q:"Quel médicament pour une migraine ?",a:"Un antalgique ou un anti-inflammatoire dès le début, et si cela ne suffit pas un triptan prescrit par le médecin. Pris tôt, ces traitements sont plus efficaces."},{q:"Que faire quand une migraine commence ?",a:"Se mettre au calme, dans l'obscurité, prendre son traitement de crise et s'hydrater. Un agenda des crises aide à identifier les déclencheurs."},{q:"Peut-on prévenir les migraines ?",a:"Oui, en identifiant et limitant ses déclencheurs (stress, sommeil irrégulier, jeûne). En cas de crises fréquentes, un traitement de fond quotidien peut être prescrit."},{q:"Quand un mal de tête est-il grave ?",a:"Un mal de tête brutal et intense « comme jamais », avec fièvre et raideur de nuque, ou des troubles neurologiques, doit faire appeler les secours."}] },
  { slug:"quand-consulter-pour-une-toux-maroc", spec:"pneumo-phtisiologie", aboutEntity:"Toux",
    title:"Quand faut-il consulter pour une toux ?", excerpt:"Quand consulter pour une toux ? Si elle dure plus de 3 semaines, ou avec fièvre, essoufflement, crachats colorés ou de sang, amaigrissement. Réponse claire, adaptée au Maroc.",
    metaTitle:"Quand consulter pour une toux ? | Maroc", metaDesc:"Quand faut-il consulter pour une toux ? Si elle dure plus de 3 semaines, ou avec fièvre, essoufflement, crachats colorés ou de sang, amaigrissement ou sueurs nocturnes. Réponse claire, au Maroc.",
    content:cToux, keyTakeaways:["La plupart des toux aiguës sont virales et passagères.","Toux de plus de 3 semaines = consulter et rechercher une cause.","Au Maroc, penser à la tuberculose (toux prolongée, sueurs, amaigrissement).","Difficulté à respirer ou crachats de sang = urgence."],
    faq:[{q:"Combien de temps une toux doit-elle durer avant de consulter ?",a:"Une toux qui dépasse 3 semaines doit être explorée. Avant, consultez plus tôt en cas de fièvre, d'essoufflement, de crachats colorés ou de sang, ou chez une personne fragile."},{q:"Une toux peut-elle être une tuberculose ?",a:"Au Maroc, une toux de plus de 2-3 semaines avec sueurs nocturnes, amaigrissement ou crachats de sang fait rechercher une tuberculose, qui se soigne bien lorsqu'elle est prise à temps."},{q:"Comment calmer une toux à la maison ?",a:"En s'hydratant, avec du miel pour une toux sèche (pas chez le nourrisson), en arrêtant de fumer. Il ne faut pas bloquer une toux grasse, qui aide à évacuer les sécrétions."},{q:"Quand la toux est-elle une urgence ?",a:"En cas de difficulté importante à respirer, de douleur thoracique intense ou de crachats de sang abondants : appelez les secours."}] },
  { slug:"pourquoi-ai-je-toujours-mal-a-la-tete-maroc", spec:"medecine-generale", aboutEntity:"Céphalée",
    title:"Pourquoi ai-je toujours mal à la tête ?", excerpt:"Pourquoi ai-je toujours mal à la tête ? Stress, fatigue, migraine, manque de sommeil, vue, abus d'antalgiques… Les causes fréquentes et quand consulter. Réponse claire, adaptée au Maroc.",
    metaTitle:"Pourquoi ai-je toujours mal à la tête ? | Maroc", metaDesc:"Pourquoi ai-je toujours mal à la tête ? Causes fréquentes (stress, fatigue, migraine, sommeil, vue, abus d'antalgiques) et quand consulter. Réponse claire, adaptée au Maroc.",
    content:cMalTete, keyTakeaways:["La plupart des maux de tête récurrents sont bénins (tension, migraine).","L'abus d'antalgiques peut entretenir les maux de tête.","Corriger sommeil, hydratation, vue et stress aide souvent.","Mal de tête brutal « comme jamais » ou avec fièvre/raideur = urgence."],
    faq:[{q:"Pourquoi ai-je mal à la tête tous les jours ?",a:"Des maux de tête quotidiens peuvent venir du stress, d'un mauvais sommeil, d'un problème de vue, d'une consommation trop fréquente d'antalgiques ou d'une migraine chronique. Ils justifient une consultation pour en trouver la cause."},{q:"Le mal de tête vient-il de la tension ?",a:"Une hypertension sévère peut donner des maux de tête, mais elle est le plus souvent silencieuse. Seul un contrôle de la tension permet de le vérifier."},{q:"Comment faire passer un mal de tête ?",a:"Repos au calme, hydratation, antalgique simple sans abus, et correction du sommeil. Si les maux de tête sont fréquents ou s'aggravent, consultez."},{q:"Quand un mal de tête est-il inquiétant ?",a:"S'il est brutal et intense « comme jamais », avec fièvre et raideur de la nuque, des troubles de la parole ou de la vision, ou après un traumatisme : appelez les secours."}] },
  { slug:"tension-normale-c-est-quoi-maroc", spec:"cardiologie", aboutEntity:"Hypertension artérielle",
    title:"C'est quoi une tension normale ?", excerpt:"C'est quoi une tension normale ? Inférieure à 140/90 au cabinet, idéalement autour de 120/80. On parle d'hypertension à partir de 135/85 en automesure. Réponse claire, adaptée au Maroc.",
    metaTitle:"C'est quoi une tension normale ? | Maroc", metaDesc:"C'est quoi une tension normale ? Inférieure à 140/90 mmHg au cabinet (idéalement 120/80), et hypertension à partir de 135/85 en automesure. Que signifient les deux chiffres. Au Maroc.",
    content:cTensionNormale, keyTakeaways:["Tension normale : < 140/90 au cabinet, idéalement ~120/80.","Automesure : hypertension à partir de 135/85.","Le diagnostic repose sur des mesures répétées.","Faire contrôler sa tension dès 40 ans."],
    faq:[{q:"Quelle est la tension normale par âge ?",a:"Les seuils sont les mêmes à l'âge adulte : on parle d'hypertension à partir de 140/90 au cabinet. Chez la personne âgée, l'objectif sous traitement peut être adapté par le médecin."},{q:"Que veulent dire les deux chiffres de la tension ?",a:"Le premier (systolique) est la pression quand le cœur se contracte ; le second (diastolique) quand il se relâche. Par exemple 12/8 signifie 120/80 mmHg."},{q:"Une tension à 14/9 est-elle grave ?",a:"14/9 (140/90) correspond au seuil de l'hypertension. Sur des mesures répétées, cela justifie une prise en charge, d'autant plus en présence d'autres facteurs de risque."},{q:"Comment bien mesurer sa tension ?",a:"Au repos, assis, le dos appuyé, sans avoir fumé ni bu de café, avec un brassard à hauteur du cœur, en réalisant 2 à 3 mesures espacées."}] },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.upsert({ where:{slug:CATEGORY.slug}, update:{name:CATEGORY.name,description:CATEGORY.description,color:CATEGORY.color}, create:CATEGORY, select:{id:true,slug:true} });
  console.log(`✓ Catégorie  /blog/categorie/${cat.slug}  (${CATEGORY.name})`);
  const now = new Date();
  for (const art of ARTICLES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:cat.id, metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:3, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`✓ Question  /blog/${post.slug}`);
  }
  console.log(`\nQuestions fréquentes : ${ARTICLES.length} articles publiés.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
