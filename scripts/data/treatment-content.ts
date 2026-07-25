/**
 * Contenu « comment traiter X ? » (angle parcours) pour des HealthTopic EXISTANTS.
 * Bilingue FR + AR, semé sans toucher aux verrous → reste noindex jusqu'à relecture
 * humaine (`reviewedAt`/`arReviewedAt`). ORIENTATION uniquement : jamais de
 * posologie, de nom de médicament précis ni de diagnostic — toujours renvoi vers un
 * professionnel. `summary` = 40-70 mots (réponse directe, extractible IA).
 * `steps` = grandes étapes du parcours de soins (pas un protocole).
 */
export type TreatmentSeed = {
  slug: string; // slug d'un HealthTopic existant
  summary: string;
  steps: string[];
  summaryAr: string;
  stepsAr: string[];
  relatedTopicSlugs?: string[]; // maillage topic ↔ topic (slugs existants)
};

export const TREATMENT_CONTENT: TreatmentSeed[] = [
  {
    slug: "migraine",
    summary:
      "La migraine se traite à deux niveaux : soulager la crise dès les premiers signes, et, si les crises sont fréquentes, un traitement de fond prescrit par le médecin. Le repos au calme, l'hydratation et l'identification des facteurs déclenchants aident. Un neurologue ou un médecin généraliste adapte la prise en charge à votre cas.",
    steps: [
      "Consultez un médecin généraliste pour confirmer qu'il s'agit bien de migraines et écarter une autre cause.",
      "Notez vos crises (fréquence, durée, déclencheurs) dans un agenda pour aider le diagnostic.",
      "Traitement de la crise : agir tôt, se reposer au calme, selon la prescription du médecin.",
      "Si les crises sont fréquentes ou invalidantes, le médecin peut proposer un traitement de fond.",
      "Un neurologue intervient pour les formes résistantes ou atypiques.",
    ],
    summaryAr:
      "يُعالَج الصداع النصفي على مستويين: تخفيف النوبة عند أوّل علاماتها، وعند تكرّرها علاجٌ وقائيّ يصفه الطبيب. تساعد الراحة في مكان هادئ، شرب الماء وتحديد العوامل المُحفِّزة. يُكيّف طبيب الأعصاب أو الطبيب العام التكفّل حسب حالتك.",
    stepsAr: [
      "استشر طبيباً عاماً لتأكيد أنّها نوبات صداع نصفي واستبعاد سبب آخر.",
      "دوّن نوباتك (التكرار، المدّة، المُحفِّزات) في مفكّرة لمساعدة التشخيص.",
      "علاج النوبة: التدخّل مبكراً والراحة في مكان هادئ، حسب وصفة الطبيب.",
      "عند تكرّر النوبات أو إعاقتها لحياتك، قد يقترح الطبيب علاجاً وقائياً.",
      "يتدخّل طبيب الأعصاب في الأشكال المقاوِمة أو غير النمطية.",
    ],
    relatedTopicSlugs: ["mal-de-tete", "vertiges", "anxiete"],
  },
  {
    slug: "mal-de-dos",
    summary:
      "La plupart des maux de dos communs s'améliorent en quelques semaines en restant actif, en évitant le repos strict au lit et avec la kinésithérapie. Le médecin généraliste évalue la douleur et oriente si besoin. Si elle persiste, descend dans la jambe ou s'accompagne de signes d'alerte, un rhumatologue approfondit.",
    steps: [
      "Rester actif : le repos strict au lit prolongé est déconseillé.",
      "Consulter un médecin généraliste si la douleur gêne le quotidien ou dure.",
      "Kinésithérapie et exercices adaptés, sur conseil médical.",
      "Rhumatologue en cas de douleur persistante, inflammatoire ou irradiante.",
      "Consulter en urgence en cas de perte de force, de troubles urinaires ou de fièvre.",
    ],
    summaryAr:
      "معظم آلام الظهر الشائعة تتحسّن خلال أسابيع مع البقاء نشيطاً، تجنّب الراحة التامّة في الفراش، والعلاج الطبيعي. يقيّم الطبيب العام الألم ويوجّه عند الحاجة. إذا استمرّ أو نزل إلى الساق أو رافقته علامات إنذار، يتعمّق طبيب الروماتيزم.",
    stepsAr: [
      "ابقَ نشيطاً: يُنصَح بتجنّب الراحة التامّة الطويلة في الفراش.",
      "استشر طبيباً عاماً إذا أعاق الألم حياتك اليومية أو طال.",
      "علاج طبيعي وتمارين مُكيّفة، بنصيحة طبية.",
      "طبيب الروماتيزم عند ألم مستمرّ أو التهابي أو مُمتدّ.",
      "استشر بشكل عاجل عند فقدان القوّة أو اضطرابات بولية أو حُمّى.",
    ],
    relatedTopicSlugs: ["sciatique", "douleurs-articulaires", "arthrose"],
  },
  {
    slug: "hypertension-arterielle",
    summary:
      "L'hypertension se prend en charge dans la durée en associant des mesures d'hygiène de vie (alimentation moins salée, activité physique, arrêt du tabac, gestion du stress) et, souvent, un traitement prescrit et suivi par le médecin. Un contrôle régulier de la tension et des examens permettent d'ajuster la prise en charge.",
    steps: [
      "Confirmer le diagnostic par plusieurs mesures de la tension chez le médecin.",
      "Adopter une alimentation moins salée, une activité physique régulière, arrêter le tabac.",
      "Suivre le traitement prescrit sans jamais l'arrêter de soi-même.",
      "Surveiller sa tension et faire les examens de suivi demandés.",
      "Cardiologue ou néphrologue pour les formes compliquées ou résistantes.",
    ],
    summaryAr:
      "يُدبَّر ارتفاع ضغط الدم على المدى الطويل بالجمع بين تدابير نمط الحياة (تقليل الملح، النشاط البدني، الإقلاع عن التدخين، إدارة التوتّر) وغالباً علاجٍ يصفه الطبيب ويتابعه. تسمح المراقبة المنتظمة للضغط والفحوص بتعديل التكفّل.",
    stepsAr: [
      "تأكيد التشخيص بعدّة قياسات للضغط عند الطبيب.",
      "اعتماد غذاء أقلّ ملحاً، نشاط بدني منتظم، والإقلاع عن التدخين.",
      "الالتزام بالعلاج الموصوف دون إيقافه ذاتياً أبداً.",
      "مراقبة الضغط وإجراء فحوص المتابعة المطلوبة.",
      "طبيب القلب أو الكلى للأشكال المُعقّدة أو المقاوِمة.",
    ],
    relatedTopicSlugs: ["hypercholesterolemie", "diabete", "angine-de-poitrine"],
  },
  {
    slug: "acne",
    summary:
      "L'acné se traite selon sa sévérité, avec des soins locaux adaptés et, dans les formes plus marquées, un traitement prescrit et suivi par le dermatologue. Une routine douce, éviter de percer les lésions et la patience sont essentiels : les résultats prennent plusieurs semaines. Le médecin oriente le traitement selon votre peau.",
    steps: [
      "Nettoyer la peau en douceur, éviter les produits agressifs et de percer les boutons.",
      "Consulter un médecin généraliste ou un dermatologue pour évaluer la sévérité.",
      "Suivre le traitement local ou général prescrit, avec régularité.",
      "Laisser le temps agir : les effets apparaissent après plusieurs semaines.",
      "Dermatologue pour l'acné sévère, cicatricielle ou résistante.",
    ],
    summaryAr:
      "يُعالَج حبّ الشباب حسب شدّته، بعناية موضعية مناسبة، وفي الأشكال الأوضح علاجٌ يصفه طبيب الجلد ويتابعه. الروتين اللطيف، تجنّب عصر البثور والصبر أساسية: تحتاج النتائج عدّة أسابيع. يوجّه الطبيب العلاج حسب بشرتك.",
    stepsAr: [
      "تنظيف البشرة بلطف، تجنّب المنتجات القاسية وعصر البثور.",
      "استشارة طبيب عام أو طبيب جلد لتقييم الشدّة.",
      "الالتزام بالعلاج الموضعي أو العام الموصوف بانتظام.",
      "إعطاء الوقت للعلاج: تظهر النتائج بعد عدّة أسابيع.",
      "طبيب الجلد لحبّ الشباب الشديد أو المُخلِّف للندبات أو المقاوِم.",
    ],
    relatedTopicSlugs: ["demangeaisons", "eczema", "chute-de-cheveux"],
  },
  {
    slug: "eczema",
    summary:
      "L'eczéma se contrôle en hydratant quotidiennement la peau, en évitant les irritants et les facteurs déclenchants, et avec les soins prescrits lors des poussées. Il ne se « guérit » pas en une fois mais se stabilise bien avec un suivi. Le dermatologue adapte le traitement et recherche d'éventuelles allergies.",
    steps: [
      "Hydrater la peau tous les jours avec un émollient adapté.",
      "Identifier et éviter les irritants et facteurs déclenchants.",
      "Consulter un médecin pour les poussées et suivre les soins prescrits.",
      "Dermatologue ou allergologue si les poussées sont fréquentes ou étendues.",
    ],
    summaryAr:
      "يُضبَط الإكزيما بترطيب البشرة يومياً، تجنّب المُهيّجات والعوامل المُحفِّزة، والعناية الموصوفة أثناء الهجمات. لا «يُشفى» دفعةً واحدة لكنّه يستقرّ جيداً مع المتابعة. يُكيّف طبيب الجلد العلاج ويبحث عن حساسية محتملة.",
    stepsAr: [
      "ترطيب البشرة يومياً بمُرطّب مناسب.",
      "تحديد وتجنّب المُهيّجات والعوامل المُحفِّزة.",
      "استشارة طبيب أثناء الهجمات والالتزام بالعناية الموصوفة.",
      "طبيب الجلد أو الحساسية إذا كانت الهجمات متكرّرة أو واسعة.",
    ],
    relatedTopicSlugs: ["demangeaisons", "acne", "allergie"],
  },
  {
    slug: "brulures-d-estomac",
    summary:
      "Les brûlures d'estomac occasionnelles s'atténuent avec des mesures simples : repas plus légers, éviter les aliments qui les déclenchent, ne pas s'allonger juste après manger, réduire tabac et alcool. Si elles sont fréquentes, le médecin évalue la cause et propose un traitement. Un gastro-entérologue intervient si les symptômes persistent.",
    steps: [
      "Adopter des repas plus légers et éviter les aliments déclencheurs.",
      "Ne pas s'allonger juste après manger ; surélever la tête du lit si besoin.",
      "Réduire tabac et alcool.",
      "Consulter un médecin si les brûlures sont fréquentes ou gênantes.",
      "Gastro-entérologue en cas de symptômes persistants ou de signes d'alerte.",
    ],
    summaryAr:
      "تخفّ حُرقة المعدة العابرة بتدابير بسيطة: وجبات أخفّ، تجنّب الأطعمة المُحفِّزة، عدم الاستلقاء مباشرة بعد الأكل، تقليل التدخين والكحول. عند تكرّرها، يقيّم الطبيب السبب ويقترح علاجاً. يتدخّل طبيب الجهاز الهضمي إذا استمرّت الأعراض.",
    stepsAr: [
      "اعتماد وجبات أخفّ وتجنّب الأطعمة المُحفِّزة.",
      "عدم الاستلقاء مباشرة بعد الأكل؛ رفع رأس السرير عند الحاجة.",
      "تقليل التدخين والكحول.",
      "استشارة طبيب إذا كانت الحُرقة متكرّرة أو مُزعجة.",
      "طبيب الجهاز الهضمي عند أعراض مستمرّة أو علامات إنذار.",
    ],
    relatedTopicSlugs: ["mal-de-ventre", "ballonnements", "gastrite"],
  },
  {
    slug: "grippe",
    summary:
      "La grippe guérit le plus souvent seule en quelques jours : repos, hydratation et surveillance des symptômes suffisent dans les formes simples. Le médecin peut soulager la fièvre et les courbatures. Les personnes fragiles (âgées, femmes enceintes, maladies chroniques) doivent consulter, et la vaccination reste la meilleure prévention.",
    steps: [
      "Se reposer, bien s'hydrater et surveiller l'évolution.",
      "Soulager fièvre et courbatures selon l'avis du médecin.",
      "Limiter la contagion (masque, lavage des mains).",
      "Consulter rapidement si personne fragile, essoufflement ou aggravation.",
      "Penser à la vaccination annuelle en prévention.",
    ],
    summaryAr:
      "تُشفى الإنفلونزا غالباً وحدها خلال أيام: الراحة، شرب السوائل ومراقبة الأعراض تكفي في الأشكال البسيطة. يمكن للطبيب تخفيف الحُمّى وآلام العضلات. على الأشخاص الهشّين (المسنّون، الحوامل، الأمراض المزمنة) الاستشارة، ويبقى التلقيح أفضل وقاية.",
    stepsAr: [
      "الراحة، شرب السوائل بكثرة ومراقبة التطوّر.",
      "تخفيف الحُمّى وآلام العضلات حسب رأي الطبيب.",
      "الحدّ من العدوى (الكمامة، غسل اليدين).",
      "الاستشارة بسرعة عند شخص هشّ أو ضيق تنفّس أو تدهور.",
      "التفكير في التلقيح السنوي للوقاية.",
    ],
    relatedTopicSlugs: ["fievre", "toux", "covid-19"],
  },
  {
    slug: "otite",
    summary:
      "L'otite nécessite un examen du tympan par un médecin, car la prise en charge dépend du type d'otite. La douleur peut être soulagée selon la prescription. Certaines otites guérissent seules, d'autres justifient un traitement. Un ORL intervient pour les otites à répétition ou compliquées, surtout chez l'enfant.",
    steps: [
      "Consulter un médecin pour examiner le tympan et préciser le type d'otite.",
      "Soulager la douleur selon la prescription.",
      "Suivre le traitement éventuel et les consignes de surveillance.",
      "ORL en cas d'otites répétées, de baisse d'audition ou de complications.",
    ],
    summaryAr:
      "يستلزم التهاب الأذن فحصَ طبلة الأذن عند طبيب، لأنّ التكفّل يعتمد على نوع الالتهاب. يمكن تخفيف الألم حسب الوصفة. بعض الالتهابات تُشفى وحدها وأخرى تستوجب علاجاً. يتدخّل طبيب الأنف والأذن والحنجرة عند الالتهابات المتكرّرة أو المُعقّدة، خاصّةً عند الطفل.",
    stepsAr: [
      "استشارة طبيب لفحص طبلة الأذن وتحديد نوع الالتهاب.",
      "تخفيف الألم حسب الوصفة.",
      "الالتزام بالعلاج المحتمل وتعليمات المراقبة.",
      "طبيب الأنف والأذن والحنجرة عند التهابات متكرّرة أو ضعف سمع أو مضاعفات.",
    ],
    relatedTopicSlugs: ["mal-de-gorge", "angine", "acouphenes"],
  },
  {
    slug: "hemorroides",
    summary:
      "Les hémorroïdes se soulagent d'abord par des mesures simples : lutter contre la constipation (fibres, hydratation), une bonne hygiène et des soins locaux sur avis médical. En cas de douleur ou de saignement, il faut consulter pour confirmer l'origine. Un gastro-entérologue ou un proctologue propose un geste si les symptômes persistent.",
    steps: [
      "Lutter contre la constipation : fibres, eau, activité physique.",
      "Soins locaux et hygiène adaptée, sur conseil médical.",
      "Consulter pour tout saignement afin d'en confirmer l'origine.",
      "Proctologue ou gastro-entérologue pour un traitement instrumental si besoin.",
    ],
    summaryAr:
      "تُخفَّف البواسير أولاً بتدابير بسيطة: مكافحة الإمساك (الألياف، شرب الماء)، نظافة جيدة وعناية موضعية بنصيحة طبية. عند الألم أو النزيف يجب الاستشارة لتأكيد المصدر. يقترح طبيب الجهاز الهضمي أو طبيب المستقيم إجراءً إذا استمرّت الأعراض.",
    stepsAr: [
      "مكافحة الإمساك: ألياف، ماء، نشاط بدني.",
      "عناية موضعية ونظافة مناسبة، بنصيحة طبية.",
      "الاستشارة عند أيّ نزيف لتأكيد مصدره.",
      "طبيب المستقيم أو الجهاز الهضمي لعلاج أداتي عند الحاجة.",
    ],
    relatedTopicSlugs: ["constipation", "sang-dans-les-selles", "mal-de-ventre"],
  },
  {
    slug: "anxiete",
    summary:
      "L'anxiété se prend en charge en agissant sur l'hygiène de vie (sommeil, activité physique, réduction des excitants), par un accompagnement psychologique comme les thérapies cognitivo-comportementales, et parfois un traitement prescrit et suivi par le médecin. Parler à un professionnel est la première étape ; un psychiatre ou un psychologue accompagne la démarche.",
    steps: [
      "En parler à un médecin généraliste, premier interlocuteur pour faire le point.",
      "Améliorer sommeil et activité physique, réduire café et excitants.",
      "Envisager un suivi psychologique (thérapie cognitivo-comportementale).",
      "Un traitement peut être proposé et suivi par le médecin si nécessaire.",
      "Psychiatre ou psychologue pour un accompagnement adapté.",
    ],
    summaryAr:
      "يُتكفَّل بالقلق بالعمل على نمط الحياة (النوم، النشاط البدني، تقليل المنبّهات)، بمرافقة نفسية كالعلاج المعرفي السلوكي، وأحياناً علاجٍ يصفه الطبيب ويتابعه. التحدّث إلى مختصّ هو الخطوة الأولى؛ يرافق الطبيب النفسي أو الأخصائي النفسي هذا المسار.",
    stepsAr: [
      "التحدّث إلى طبيب عام، أول مُحاوِر لتقييم الوضع.",
      "تحسين النوم والنشاط البدني، تقليل القهوة والمنبّهات.",
      "التفكير في مرافقة نفسية (علاج معرفي سلوكي).",
      "قد يُقترح علاجٌ يتابعه الطبيب عند الحاجة.",
      "الطبيب النفسي أو الأخصائي النفسي لمرافقة مناسبة.",
    ],
    relatedTopicSlugs: ["crise-d-angoisse", "depression", "insomnie"],
  },
];
