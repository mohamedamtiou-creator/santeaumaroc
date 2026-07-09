require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const content = `<p>Au Maroc, une personne sur dix souffre de diabète — et la moitié l'ignore. Le diabète de type 2 est devenu la première maladie métabolique du pays, avec près de <strong>3 millions de cas recensés</strong>, un chiffre qui continue d'augmenter chaque année. Fatigue inexpliquée, soif excessive, cicatrisation lente… ces signaux discrets méritent d'être pris au sérieux. Comprendre cette maladie, c'est déjà se donner les moyens d'agir.</p>

<h2>Qu'est-ce que le diabète de type 2 ?</h2>
<p>Le diabète de type 2 est une maladie chronique qui se caractérise par un taux de sucre (glucose) trop élevé dans le sang — ce que l'on appelle l'<strong>hyperglycémie</strong>. Contrairement au diabète de type 1, qui est une maladie auto-immune apparaissant généralement dès l'enfance, le type 2 se développe progressivement, le plus souvent après 40 ans.</p>
<p>Dans ce cas, le pancréas produit encore de l'insuline — l'hormone qui permet au glucose d'entrer dans les cellules — mais l'organisme n'y répond plus correctement. On parle de <strong>résistance à l'insuline</strong>. Avec le temps, le pancréas s'épuise et la glycémie reste durablement élevée.</p>

<h3>Diabète de type 2 vs type 1 : quelle différence ?</h3>
<ul>
<li><strong>Type 1 :</strong> maladie auto-immune, insulino-dépendant dès le diagnostic, survient souvent chez les jeunes.</li>
<li><strong>Type 2 :</strong> lié au mode de vie et à la génétique, traitable en premier lieu par l'alimentation et l'activité physique, peut évoluer vers un traitement médicamenteux.</li>
</ul>

<h2>Les symptômes du diabète à ne pas ignorer</h2>
<p>Le diabète de type 2 est souvent qualifié de « maladie silencieuse » car il peut évoluer pendant des années sans symptômes visibles. Pourtant, certains signes doivent alerter :</p>
<ul>
<li>Soif intense et fréquente (polydipsie)</li>
<li>Urines abondantes, surtout la nuit (polyurie)</li>
<li>Fatigue persistante sans raison apparente</li>
<li>Vision floue ou troubles visuels</li>
<li>Cicatrisation lente des plaies</li>
<li>Infections fréquentes (urinaires, cutanées)</li>
<li>Fourmillements ou engourdissements dans les mains et les pieds</li>
</ul>
<p>Si vous présentez plusieurs de ces symptômes, une simple prise de sang suffit pour mesurer votre glycémie. N'attendez pas : un diagnostic précoce change radicalement le pronostic.</p>

<blockquote>Le saviez-vous ? Selon l'IDF (Fédération Internationale du Diabète), plus de 45 % des diabétiques marocains ne sont pas diagnostiqués. Agir tôt permet d'éviter les complications graves.</blockquote>

<h2>Qui est à risque ? Les facteurs favorisants</h2>
<p>Certains profils sont davantage exposés au diabète de type 2. Connaître ces facteurs de risque permet d'agir en amont :</p>
<ol>
<li><strong>Surpoids et obésité</strong> — notamment la graisse abdominale, très fréquente dans la population marocaine adulte.</li>
<li><strong>Sédentarité</strong> — un mode de vie peu actif favorise la résistance à l'insuline.</li>
<li><strong>Alimentation déséquilibrée</strong> — excès de sucres rapides, de graisses saturées, faible consommation de légumes.</li>
<li><strong>Antécédents familiaux</strong> — avoir un parent diabétique multiplie le risque par deux.</li>
<li><strong>Âge</strong> — le risque augmente significativement après 45 ans.</li>
<li><strong>Diabète gestationnel</strong> — les femmes ayant eu un diabète pendant la grossesse sont plus à risque.</li>
<li><strong>Hypertension artérielle ou excès de cholestérol</strong> — souvent associés au diabète de type 2.</li>
</ol>

<h2>Comment prévenir le diabète de type 2 ?</h2>
<p>La bonne nouvelle : le diabète de type 2 est en grande partie <strong>évitable</strong>. Des études montrent que des changements de mode de vie peuvent réduire le risque de développer la maladie de 50 à 70 %.</p>

<h3>Adopter un régime diabétique équilibré</h3>
<p>L'alimentation joue un rôle central dans la prévention et le contrôle de la glycémie. Quelques principes fondamentaux :</p>
<ul>
<li>Privilégier les glucides complexes (pain complet, légumineuses, semoule complète) aux sucres rapides.</li>
<li>Augmenter la consommation de légumes verts, riches en fibres.</li>
<li>Réduire les sucreries, pâtisseries et boissons sucrées — y compris les jus de fruits industriels.</li>
<li>Manger à heures régulières et éviter les grignotages.</li>
<li>Limiter les graisses animales et privilégier l'huile d'olive.</li>
</ul>

<h3>Bouger régulièrement</h3>
<p>L'activité physique améliore la sensibilité à l'insuline et aide à maintenir un poids sain. <strong>30 minutes de marche rapide par jour</strong>, cinq fois par semaine, suffisent à réduire significativement le risque. La marche, la natation ou le vélo sont des activités accessibles à tous.</p>

<h3>Surveiller sa glycémie</h3>
<p>Si vous êtes à risque, demandez à votre médecin un dosage de la glycémie à jeun lors de votre prochain bilan de santé. Un taux entre 1,00 et 1,25 g/L indique un <em>prédiabète</em> — un signal d'alarme qui justifie une prise en charge immédiate.</p>

<h2>Les traitements du diabète de type 2</h2>
<p>Il n'existe pas de traitement définitif du diabète de type 2, mais la maladie se gère très bien avec un suivi adapté. Le traitement repose sur plusieurs piliers :</p>

<h3>Les mesures hygiéno-diététiques</h3>
<p>En première intention, le médecin recommande toujours une modification de l'alimentation et une augmentation de l'activité physique. Pour les diabètes débutants et modérés, ces seules mesures peuvent suffire à normaliser la glycémie.</p>

<h3>Les médicaments antidiabétiques</h3>
<p>Lorsque les règles hygiéno-diététiques ne suffisent plus, un traitement médicamenteux est prescrit. Les plus courants au Maroc :</p>
<ul>
<li><strong>Metformine</strong> — médicament de référence, réduit la production de glucose par le foie.</li>
<li><strong>Sulfamides hypoglycémiants</strong> — stimulent la sécrétion d'insuline.</li>
<li><strong>Inhibiteurs de SGLT2 et analogues du GLP-1</strong> — nouvelles classes thérapeutiques, de plus en plus prescrites.</li>
</ul>

<h3>L'insuline</h3>
<p>Dans les formes évoluées, quand le pancréas ne produit plus assez d'insuline, des injections quotidiennes peuvent devenir nécessaires. Ce n'est pas un échec : c'est simplement une évolution naturelle de la maladie qui se traite.</p>

<h3>Le suivi régulier</h3>
<p>Un contrôle médical tous les trois mois est recommandé pour surveiller l'<strong>HbA1c</strong> (hémoglobine glyquée), qui reflète la glycémie moyenne sur les trois derniers mois. Un bilan annuel complet (yeux, reins, pieds, cœur) permet de dépister les complications avant qu'elles s'installent.</p>

<hr>

<h2>Vivre avec le diabète de type 2 au quotidien</h2>
<p>Le diabète ne doit pas empêcher de mener une vie normale et épanouissante. Des milliers de Marocains diabétiques travaillent, voyagent et profitent pleinement de leur vie en appliquant quelques règles simples : surveiller leur glycémie, respecter leur traitement, adapter leur alimentation et rester actifs.</p>
<p>L'éducation thérapeutique — apprendre à mieux connaître sa maladie — est aujourd'hui reconnue comme un pilier du traitement. Rejoindre un groupe de patients ou consulter régulièrement une diététicienne peut faire une vraie différence.</p>

<h2>Conclusion : agissez maintenant, pas demain</h2>
<p>Le diabète de type 2 est une réalité de santé publique au Maroc, mais c'est aussi une maladie que l'on peut prévenir, détecter tôt et contrôler efficacement. Si vous ressentez des symptômes inhabituels, si vous avez des antécédents familiaux ou si vous n'avez pas fait de bilan depuis longtemps, <strong>consultez un médecin généraliste ou un endocrinologue</strong>. Un simple dosage de glycémie peut vous éviter des années de complications. Sur santeaumaroc.com, trouvez en quelques clics un praticien près de chez vous pour un suivi adapté et personnalisé.</p>`;

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true, email: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.findFirst({
    where: { slug: "maladies-traitements" },
    select: { id: true },
  });
  if (!cat) { console.error("Catégorie introuvable."); process.exit(1); }

  // Calcul reading time : ~1100 mots / 200 = ~6 min
  const post = await prisma.post.upsert({
    where: { slug: "diabete-type-2-maroc" },
    update: {},
    create: {
      title:       "Diabète de type 2 au Maroc : comprendre, prévenir et vivre avec la maladie",
      slug:        "diabete-type-2-maroc",
      excerpt:     "Le diabète de type 2 touche près de 3 millions de Marocains. Apprenez à reconnaître les signes, à prévenir la maladie et à mieux gérer votre glycémie au quotidien.",
      content,
      coverImage:  null,
      categoryId:  cat.id,
      authorId:    admin.id,
      status:      "PUBLISHED",
      publishedAt: new Date(),
      readingTime: 6,
      featured:    false,
      metaTitle:   "Diabète type 2 au Maroc : symptômes, causes et traitement",
      metaDesc:    "3 millions de Marocains touchés par le diabète type 2. Découvrez les symptômes, les traitements et les conseils pour prévenir et vivre avec la maladie.",
    },
  });

  console.log("✓ Article créé  :", post.title);
  console.log("  URL           : /blog/" + post.slug);
  console.log("  Catégorie     : Maladies & Traitements");
  console.log("  Lecture       :", post.readingTime, "min");
  console.log("  Meta titre    :", post.metaTitle);
  console.log("  Meta desc     :", post.metaDesc);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
