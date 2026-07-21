/**
 * Lot initial de hubs MALADIES (HealthTopic kind=DISEASE) — FR + AR.
 *
 * ⚠️ YMYL : seedé PUBLISHED mais reviewedAt/arReviewedAt = null → NOINDEX + hors
 * sitemap jusqu'à relecture. Après relecture : scripts/symptoms-approve.ts <slug>
 * (même modèle HealthTopic ; l'approve marche pour SYMPTOM et DISEASE).
 *
 *   Lancer : npx tsx --env-file=.env scripts/seed-diseases.ts
 *
 * Idempotent (upsert par slug, update:{}).
 */
import { prisma } from "@/lib/prisma";

const src = (arr: { label: string; url: string; publisher: string }[]) => JSON.stringify(arr);
const faq = (arr: { q: string; a: string }[]) => JSON.stringify(arr);
const OMS = { label: "Organisation mondiale de la santé (OMS)", url: "https://www.who.int", publisher: "OMS" };
const HAS = { label: "Haute Autorité de santé (HAS)", url: "https://www.has-sante.fr", publisher: "HAS" };

type Disease = {
  slug: string; term: string; termAr: string; specialty: string;
  shortAnswer: string; shortAnswerAr: string;
  causes: string; causesAr: string;
  redFlags: string; redFlagsAr: string;
  whenToConsult: string; whenToConsultAr: string;
  synonyms: string[]; faqJson: string; sources: string;
};

const DISEASES: Disease[] = [
  {
    slug: "diabete", term: "Diabète", termAr: "داء السكري", specialty: "endocrinologie-et-maladies-metaboliques",
    shortAnswer: "Le diabète est une maladie chronique caractérisée par un taux de sucre (glycémie) trop élevé dans le sang. Le type 2, le plus fréquent, est lié au mode de vie et à l'hérédité ; le type 1 est auto-immun. Non contrôlé, il expose à des complications du cœur, des reins, des yeux et des nerfs.",
    shortAnswerAr: "داء السكري مرض مزمن يتميّز بارتفاع نسبة السكر في الدم. النوع 2، الأكثر شيوعاً، مرتبط بنمط الحياة والوراثة؛ والنوع 1 مناعي ذاتي. دون تحكم، يعرّض لمضاعفات في القلب والكلى والعينين والأعصاب.",
    causes: "Surpoids et sédentarité (type 2)\nHérédité et antécédents familiaux\nÂge et alimentation déséquilibrée\nMécanisme auto-immun (type 1)",
    causesAr: "الوزن الزائد والخمول (النوع 2)\nالوراثة والسوابق العائلية\nالسن والتغذية غير المتوازنة\nآلية مناعية ذاتية (النوع 1)",
    redFlags: "Soif intense, urines abondantes et amaigrissement rapide\nSomnolence, confusion ou haleine fruitée (urgence)\nPlaie du pied qui ne cicatrise pas",
    redFlagsAr: "عطش شديد وتبوّل غزير ونقص وزن سريع\nنعاس أو تشوّش أو رائحة نفس فاكهية (طارئ)\nجرح في القدم لا يلتئم",
    whenToConsult: "Consultez en cas de symptômes évocateurs, de facteurs de risque, ou pour un dépistage. Un suivi régulier de la glycémie et de l'HbA1c est essentiel.",
    whenToConsultAr: "استشر عند أعراض موحية أو عوامل خطر أو للكشف. المتابعة المنتظمة للسكر وHbA1c أساسية.",
    synonyms: ["Diabète sucré", "Hyperglycémie chronique"],
    faqJson: faq([
      { q: "Le diabète se guérit-il ?", a: "Le diabète de type 2 ne se guérit pas mais se contrôle très bien, voire se met en rémission, par l'hygiène de vie et le traitement. Le type 1 nécessite de l'insuline à vie." },
      { q: "Quels sont les premiers signes du diabète ?", a: "Soif intense, envies fréquentes d'uriner, fatigue et parfois amaigrissement. Beaucoup de diabètes de type 2 sont toutefois silencieux au début." },
    ]),
    sources: src([OMS, HAS]),
  },
  {
    slug: "hypertension-arterielle", term: "Hypertension artérielle", termAr: "ارتفاع ضغط الدم", specialty: "cardiologie",
    shortAnswer: "L'hypertension artérielle (HTA) est une pression du sang trop élevée dans les artères de façon durable. Souvent silencieuse, elle augmente le risque d'infarctus, d'AVC et d'insuffisance rénale. Elle se contrôle par l'hygiène de vie et, si besoin, des médicaments.",
    shortAnswerAr: "ارتفاع ضغط الدم هو ضغط مرتفع باستمرار في الشرايين. غالباً صامت، ويزيد خطر الاحتشاء والسكتة والقصور الكلوي. يمكن التحكم فيه بنمط الحياة وأدوية عند الحاجة.",
    causes: "Âge, hérédité et surpoids\nExcès de sel, sédentarité, stress\nTabac et alcool\nCertaines maladies rénales ou hormonales",
    causesAr: "السن والوراثة والوزن الزائد\nالإفراط في الملح والخمول والتوتر\nالتدخين والكحول\nبعض أمراض الكلى أو الهرمونات",
    redFlags: "Maux de tête violents avec troubles de la vue\nDouleur thoracique ou essoufflement soudain\nTrouble de la parole ou paralysie (urgence AVC)",
    redFlagsAr: "صداع شديد مع اضطراب الرؤية\nألم صدري أو ضيق تنفس مفاجئ\nاضطراب الكلام أو شلل (طارئ سكتة)",
    whenToConsult: "Faites contrôler votre tension régulièrement, surtout après 40 ans ou en cas de facteurs de risque. Consultez si elle reste élevée.",
    whenToConsultAr: "افحص ضغطك بانتظام، خاصة بعد 40 سنة أو عند عوامل خطر. استشر إذا بقي مرتفعاً.",
    synonyms: ["HTA", "Tension élevée"],
    faqJson: faq([
      { q: "L'hypertension est-elle dangereuse sans symptômes ?", a: "Oui. Elle est souvent silencieuse mais abîme progressivement les artères, le cœur et les reins. D'où l'importance du dépistage." },
      { q: "Comment faire baisser sa tension ?", a: "Réduire le sel, bouger, perdre du poids, arrêter le tabac — et prendre un traitement si le médecin le prescrit." },
    ]),
    sources: src([OMS, HAS]),
  },
  {
    slug: "asthme", term: "Asthme", termAr: "الربو", specialty: "pneumo-phtisiologie",
    shortAnswer: "L'asthme est une maladie inflammatoire chronique des bronches qui provoque des crises d'essoufflement, une toux et des sifflements. Déclenché par des allergènes, l'effort ou les infections, il se contrôle bien par un traitement de fond inhalé et l'éviction des facteurs déclenchants.",
    shortAnswerAr: "الربو مرض التهابي مزمن في القصبات يسبّب نوبات ضيق تنفس وسعالاً وأزيزاً. تحفّزه المواد المسببة للحساسية أو الجهد أو العدوى، ويمكن التحكم فيه بعلاج أساسي مستنشق وتجنّب المحفزات.",
    causes: "Terrain allergique (acariens, pollens, animaux)\nInfections respiratoires\nEffort, air froid, pollution\nTabac et irritants",
    causesAr: "أرضية تحسسية (عث الغبار، اللقاح، الحيوانات)\nالتهابات تنفسية\nالجهد والهواء البارد والتلوث\nالتدخين والمهيّجات",
    redFlags: "Crise qui ne cède pas au traitement de secours\nEssoufflement au repos, difficulté à parler\nLèvres ou ongles bleutés (urgence)",
    redFlagsAr: "نوبة لا تستجيب لعلاج الطوارئ\nضيق تنفس أثناء الراحة، صعوبة الكلام\nازرقاق الشفتين أو الأظافر (طارئ)",
    whenToConsult: "Consultez pour un asthme mal contrôlé (crises fréquentes, réveils nocturnes) et appelez les secours en cas de crise sévère.",
    whenToConsultAr: "استشر عند ربو غير متحكَّم فيه (نوبات متكررة، استيقاظ ليلي) واتصل بالإسعاف عند نوبة شديدة.",
    synonyms: ["Maladie asthmatique"],
    faqJson: faq([
      { q: "L'asthme se guérit-il ?", a: "Il ne se guérit pas mais se contrôle très bien : bien traité, on peut mener une vie et une activité physique normales." },
      { q: "Peut-on faire du sport avec de l'asthme ?", a: "Oui, un asthme bien contrôlé permet le sport. Le médecin adapte le traitement et l'échauffement au besoin." },
    ]),
    sources: src([OMS, HAS]),
  },
  {
    slug: "hypothyroidie", term: "Hypothyroïdie", termAr: "قصور الغدة الدرقية", specialty: "endocrinologie-et-maladies-metaboliques",
    shortAnswer: "L'hypothyroïdie est un fonctionnement au ralenti de la glande thyroïde, qui ne produit plus assez d'hormones. Elle provoque fatigue, frilosité, prise de poids et ralentissement. Fréquente et bénigne, elle se traite efficacement par un apport d'hormone thyroïdienne.",
    shortAnswerAr: "قصور الغدة الدرقية هو تباطؤ عملها فلا تنتج ما يكفي من الهرمونات. يسبّب تعباً وبرودة وزيادة وزن وتباطؤاً. شائع وحميد، ويُعالَج بفعالية بتعويض الهرمون الدرقي.",
    causes: "Maladie auto-immune (thyroïdite de Hashimoto)\nSuites de chirurgie ou de traitement de la thyroïde\nCarence ou excès d'iode\nCertains médicaments",
    causesAr: "مرض مناعي ذاتي (التهاب هاشيموتو)\nبعد جراحة أو علاج الغدة\nنقص أو زيادة اليود\nبعض الأدوية",
    redFlags: "Fatigue extrême, ralentissement important\nPrise de poids rapide inexpliquée\nRalentissement du cœur, gonflement du visage",
    redFlagsAr: "تعب شديد وتباطؤ كبير\nزيادة وزن سريعة غير مفسّرة\nتباطؤ القلب وتورّم الوجه",
    whenToConsult: "Consultez en cas de fatigue persistante, de frilosité et de prise de poids inexpliquée : un simple dosage sanguin de la TSH permet le diagnostic.",
    whenToConsultAr: "استشر عند تعب مستمر وبرودة وزيادة وزن غير مفسّرة: قياس TSH في الدم يكفي للتشخيص.",
    synonyms: ["Thyroïde lente"],
    faqJson: faq([
      { q: "Comment diagnostique-t-on l'hypothyroïdie ?", a: "Par une prise de sang mesurant la TSH (et parfois la T4). Un taux de TSH élevé oriente vers une hypothyroïdie." },
      { q: "Le traitement est-il à vie ?", a: "Le plus souvent oui, par la lévothyroxine, avec une dose ajustée selon les contrôles sanguins." },
    ]),
    sources: src([OMS, HAS]),
  },
  {
    slug: "depression", term: "Dépression", termAr: "الاكتئاب", specialty: "psychiatrie",
    shortAnswer: "La dépression est une maladie fréquente qui associe tristesse durable, perte d'intérêt et de plaisir, fatigue et troubles du sommeil pendant plusieurs semaines. Ce n'est pas une faiblesse : elle se soigne bien par une psychothérapie et, selon la sévérité, des médicaments.",
    shortAnswerAr: "الاكتئاب مرض شائع يجمع حزناً مستمراً وفقدان الاهتمام والمتعة وتعباً واضطراب نوم لعدة أسابيع. ليس ضعفاً: يُعالَج جيداً بالعلاج النفسي، وحسب الشدة بأدوية.",
    causes: "Facteurs de stress ou deuil\nAntécédents personnels ou familiaux\nFacteurs biologiques et hormonaux\nMaladies chroniques associées",
    causesAr: "عوامل توتر أو حداد\nسوابق شخصية أو عائلية\nعوامل بيولوجية وهرمونية\nأمراض مزمنة مصاحبة",
    redFlags: "Idées noires ou pensées suicidaires (urgence)\nIncapacité à assurer le quotidien\nAggravation rapide de l'humeur",
    redFlagsAr: "أفكار سوداء أو انتحارية (طارئ)\nعجز عن تدبير الحياة اليومية\nتدهور سريع في المزاج",
    whenToConsult: "Consultez sans attendre si la tristesse dure et retentit sur votre vie, et en urgence en présence d'idées suicidaires.",
    whenToConsultAr: "استشر دون تأخير إذا استمر الحزن وأثّر على حياتك، وطارئاً عند وجود أفكار انتحارية.",
    synonyms: ["Épisode dépressif", "Dépression nerveuse"],
    faqJson: faq([
      { q: "La dépression est-elle une vraie maladie ?", a: "Oui, c'est une maladie médicale reconnue, pas une faiblesse de caractère. Elle se soigne efficacement." },
      { q: "Faut-il forcément des médicaments ?", a: "Non : les formes légères à modérées répondent souvent à la psychothérapie seule. Les médicaments s'ajoutent selon la sévérité." },
    ]),
    sources: src([OMS, HAS]),
  },
  {
    slug: "anemie", term: "Anémie", termAr: "فقر الدم", specialty: "hematologie",
    shortAnswer: "L'anémie est une baisse du taux d'hémoglobine dans le sang, qui réduit le transport de l'oxygène. Elle provoque fatigue, pâleur et essoufflement. La cause la plus fréquente est le manque de fer. Le traitement dépend de la cause, qu'il faut toujours rechercher.",
    shortAnswerAr: "فقر الدم انخفاض في نسبة الهيموغلوبين في الدم يقلّل نقل الأكسجين. يسبّب تعباً وشحوباً وضيق تنفس. أكثر الأسباب شيوعاً نقص الحديد. يعتمد العلاج على السبب الذي يجب البحث عنه دائماً.",
    causes: "Carence en fer (règles abondantes, saignement digestif)\nCarence en vitamines (B12, folates)\nMaladies chroniques ou inflammatoires\nAnomalies de l'hémoglobine",
    causesAr: "نقص الحديد (دورة غزيرة، نزيف هضمي)\nنقص الفيتامينات (B12، الفولات)\nأمراض مزمنة أو التهابية\nشذوذات الهيموغلوبين",
    redFlags: "Essoufflement au moindre effort, palpitations\nPâleur intense, malaises\nSaignements abondants ou selles noires",
    redFlagsAr: "ضيق تنفس عند أدنى جهد وخفقان\nشحوب شديد وإغماءات\nنزيف غزير أو براز أسود",
    whenToConsult: "Consultez en cas de fatigue persistante avec pâleur ou essoufflement : une prise de sang précise le type d'anémie et oriente vers sa cause.",
    whenToConsultAr: "استشر عند تعب مستمر مع شحوب أو ضيق تنفس: تحليل الدم يحدّد نوع فقر الدم ويوجّه نحو سببه.",
    synonyms: ["Manque de globules rouges"],
    faqJson: faq([
      { q: "L'anémie est-elle grave ?", a: "Le plus souvent bénigne et corrigeable, mais elle peut révéler une cause à traiter (saignement, carence). Il faut toujours l'explorer." },
      { q: "Comment corriger une anémie par manque de fer ?", a: "Par une supplémentation en fer plusieurs mois et surtout en traitant la cause du manque de fer." },
    ]),
    sources: src([OMS, HAS]),
  },
  {
    slug: "arthrose", term: "Arthrose", termAr: "الفصال العظمي (خشونة المفاصل)", specialty: "rhumatologie",
    shortAnswer: "L'arthrose est une usure progressive du cartilage des articulations, très fréquente avec l'âge. Elle touche surtout le genou, la hanche, la colonne et les mains, et provoque douleurs et raideur. Elle se contrôle par l'activité physique, la perte de poids et le traitement de la douleur.",
    shortAnswerAr: "الفصال العظمي تآكل تدريجي لغضروف المفاصل، شائع جداً مع التقدّم في السن. يصيب خاصة الركبة والورك والعمود واليدين، ويسبّب ألماً وتيبّساً. يمكن التحكم فيه بالنشاط البدني وإنقاص الوزن وعلاج الألم.",
    causes: "Âge et usure articulaire\nSurpoids (articulations portantes)\nAntécédents de traumatisme\nHérédité et surmenage articulaire",
    causesAr: "السن وتآكل المفصل\nالوزن الزائد (المفاصل الحاملة)\nسوابق رضّ\nالوراثة والإجهاد المفصلي",
    redFlags: "Articulation rouge, chaude et très gonflée\nBlocage articulaire ou perte de mobilité rapide\nDouleur nocturne intense inhabituelle",
    redFlagsAr: "مفصل أحمر ساخن وشديد التورّم\nانحصار مفصلي أو فقدان سريع للحركة\nألم ليلي شديد غير معتاد",
    whenToConsult: "Consultez si les douleurs articulaires deviennent gênantes, limitent vos activités ou résistent aux mesures habituelles.",
    whenToConsultAr: "استشر إذا أصبحت آلام المفاصل مزعجة أو حدّت من نشاطك أو قاومت التدابير المعتادة.",
    synonyms: ["Ostéoarthrose", "Usure articulaire"],
    faqJson: faq([
      { q: "Faut-il éviter de bouger avec de l'arthrose ?", a: "Non : l'activité physique adaptée entretient l'articulation et réduit la douleur. Le repos prolongé aggrave la raideur." },
      { q: "L'arthrose est-elle inévitable avec l'âge ?", a: "Elle est fréquente, mais on peut réduire le risque et ralentir son évolution en gardant un poids sain et une activité régulière." },
    ]),
    sources: src([OMS, HAS]),
  },
  {
    slug: "reflux-gastro-oesophagien", term: "Reflux gastro-œsophagien", termAr: "الارتجاع المعدي المريئي", specialty: "gastro-enterologie",
    shortAnswer: "Le reflux gastro-œsophagien (RGO) est la remontée du contenu acide de l'estomac vers l'œsophage. Il provoque des brûlures derrière le sternum et des remontées acides, surtout après les repas ou en position allongée. Fréquent et bénin, il peut devenir chronique.",
    shortAnswerAr: "الارتجاع المعدي المريئي هو صعود محتوى المعدة الحمضي نحو المريء. يسبّب حرقة خلف عظم القص وارتجاعاً حمضياً، خاصة بعد الأكل أو الاستلقاء. شائع وحميد وقد يصبح مزمناً.",
    causes: "Repas copieux, gras, épicés\nSurpoids et grossesse\nTabac, alcool, café\nHernie hiatale",
    causesAr: "وجبات دسمة ودهنية وحارة\nالوزن الزائد والحمل\nالتدخين والكحول والقهوة\nفتق الحجاب الحاجز",
    redFlags: "Difficulté ou douleur à avaler, amaigrissement\nVomissements de sang ou selles noires\nDouleur thoracique inhabituelle",
    redFlagsAr: "صعوبة أو ألم في البلع ونقص وزن\nتقيؤ دم أو براز أسود\nألم صدري غير معتاد",
    whenToConsult: "Consultez si les symptômes sont fréquents, persistent malgré les mesures simples, ou en présence d'un signe d'alerte.",
    whenToConsultAr: "استشر إذا كانت الأعراض متكررة أو استمرت رغم التدابير البسيطة أو ظهرت علامة إنذار.",
    synonyms: ["RGO", "Reflux acide", "Brûlures d'estomac"],
    faqJson: faq([
      { q: "Le reflux est-il dangereux ?", a: "Le plus souvent bénin, mais un reflux chronique doit être évalué pour éviter des complications sur l'œsophage." },
      { q: "Que faire contre les brûlures d'estomac ?", a: "Repas plus légers, éviter de s'allonger après manger, perdre du poids, et un traitement anti-acide si les symptômes persistent." },
    ]),
    sources: src([OMS, HAS]),
  },
  {
    slug: "migraine", term: "Migraine", termAr: "الشقيقة", specialty: "neurologie",
    shortAnswer: "La migraine est une maladie neurologique fréquente qui provoque des crises de maux de tête intenses, souvent d'un seul côté, pulsatiles, aggravées par l'effort et accompagnées de nausées ou d'une gêne à la lumière. Elle se traite par un traitement de crise et, si besoin, un traitement de fond.",
    shortAnswerAr: "الشقيقة مرض عصبي شائع يسبّب نوبات صداع شديد، غالباً في جهة واحدة، نابضاً، يزداد بالجهد ويصاحبه غثيان أو انزعاج من الضوء. تُعالَج بعلاج للنوبة، وعند الحاجة بعلاج أساسي.",
    causes: "Prédisposition héréditaire\nStress, fatigue, manque de sommeil\nCertains aliments, alcool, hormones\nÉcrans, bruit et lumière",
    causesAr: "استعداد وراثي\nتوتر وتعب وقلة نوم\nبعض الأطعمة والكحول والهرمونات\nالشاشات والضجيج والضوء",
    redFlags: "Mal de tête brutal et inhabituel « en coup de tonnerre »\nCéphalée avec fièvre, raideur de nuque ou trouble de la vue\nMigraine qui change de caractère",
    redFlagsAr: "صداع مفاجئ وغير معتاد «كالصاعقة»\nصداع مع حمى أو تيبّس الرقبة أو اضطراب الرؤية\nشقيقة تغيّر طابعها",
    whenToConsult: "Consultez si les crises sont fréquentes ou invalidantes, et en urgence devant tout signe d'alerte neurologique.",
    whenToConsultAr: "استشر إذا كانت النوبات متكررة أو مُعيقة، وطارئاً عند أي علامة إنذار عصبية.",
    synonyms: ["Céphalée migraineuse"],
    faqJson: faq([
      { q: "Migraine et mal de tête, est-ce pareil ?", a: "Non : la migraine est une maladie avec des crises typiques (douleur pulsatile, nausées, gêne à la lumière), plus intense qu'un simple mal de tête." },
      { q: "La migraine se soigne-t-elle ?", a: "On ne la guérit pas, mais on la contrôle bien : traitement pris tôt pendant la crise et, si les crises sont fréquentes, traitement de fond." },
    ]),
    sources: src([OMS, HAS]),
  },
  {
    slug: "allergie", term: "Allergie", termAr: "الحساسية", specialty: "allergologie",
    shortAnswer: "L'allergie est une réaction excessive du système immunitaire à une substance habituellement inoffensive (pollen, acariens, aliment, médicament). Elle se manifeste par des éternuements, un nez qui coule, de l'urticaire ou, plus rarement, une réaction grave. L'éviction et les antihistaminiques sont la base du traitement.",
    shortAnswerAr: "الحساسية ردّ فعل مفرط من الجهاز المناعي تجاه مادة غير مؤذية عادة (لقاح، عث الغبار، طعام، دواء). تظهر بالعطس وسيلان الأنف والشرى، ونادراً بردّ فعل خطير. التجنّب ومضادات الهيستامين أساس العلاج.",
    causes: "Terrain allergique héréditaire\nPollens, acariens, poils d'animaux\nCertains aliments ou médicaments\nPiqûres d'insectes",
    causesAr: "أرضية تحسسية وراثية\nاللقاح وعث الغبار ووبر الحيوانات\nبعض الأطعمة أو الأدوية\nلسعات الحشرات",
    redFlags: "Gonflement du visage, de la gorge ou de la langue\nGêne respiratoire, sifflements, malaise (choc anaphylactique — urgence)\nUrticaire généralisée d'apparition brutale",
    redFlagsAr: "تورّم الوجه أو الحلق أو اللسان\nضيق تنفس أو أزيز أو إغماء (صدمة تأقية — طارئ)\nشرى منتشر مفاجئ",
    whenToConsult: "Consultez un allergologue pour identifier l'allergène et adapter le traitement, et appelez les secours en cas de réaction grave.",
    whenToConsultAr: "استشر طبيب حساسية لتحديد المُحسِّس وتكييف العلاج، واتصل بالإسعاف عند ردّ فعل خطير.",
    synonyms: ["Réaction allergique", "Terrain atopique"],
    faqJson: faq([
      { q: "Comment savoir à quoi je suis allergique ?", a: "Des tests allergologiques cutanés (prick-tests) et parfois des analyses de sang permettent d'identifier l'allergène en cause." },
      { q: "Une allergie peut-elle être grave ?", a: "Rarement, mais une réaction généralisée (anaphylaxie) avec gêne respiratoire est une urgence vitale nécessitant les secours." },
    ]),
    sources: src([OMS, HAS]),
  },
];

async function main() {
  const specialties = await prisma.specialty.findMany({ select: { id: true, slug: true } });
  const speId = new Map(specialties.map((s) => [s.slug, s.id]));

  let ok = 0;
  const missing: string[] = [];
  for (const d of DISEASES) {
    const specialtyId = speId.get(d.specialty) ?? null;
    if (!specialtyId) missing.push(`${d.slug} → ${d.specialty}`);
    await prisma.healthTopic.upsert({
      where: { slug: d.slug },
      update: {},
      create: {
        kind: "DISEASE",
        term: d.term, slug: d.slug, shortAnswer: d.shortAnswer,
        causes: d.causes, redFlags: d.redFlags, whenToConsult: d.whenToConsult,
        faqJson: d.faqJson, synonyms: d.synonyms, specialtyId,
        sources: d.sources,
        termAr: d.termAr, shortAnswerAr: d.shortAnswerAr, causesAr: d.causesAr,
        redFlagsAr: d.redFlagsAr, whenToConsultAr: d.whenToConsultAr,
        status: "PUBLISHED",
        reviewedAt: null, arReviewedAt: null,
      },
    });
    ok++;
  }

  console.log(`✓ Maladies seedées : ${ok}/${DISEASES.length}`);
  if (missing.length) console.log(`  ⚠ spécialité introuvable : ${missing.join(", ")}`);
  console.log("ℹ Toutes en NOINDEX (reviewedAt=null). Relecture puis scripts/symptoms-approve.ts <slug>.");
}

main().finally(() => prisma.$disconnect());
