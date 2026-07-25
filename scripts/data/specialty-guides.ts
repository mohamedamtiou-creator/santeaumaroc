/**
 * Contenu des guides « Quand consulter un [spécialité] ? » (route /quand-consulter).
 * Bilingue FR + AR, semé sans verrou → noindex jusqu'à relecture humaine
 * (`reviewedAt`/`arReviewedAt`). ORIENTATION uniquement : motifs de consultation,
 * signes d'alerte, quand prendre rendez-vous — jamais de diagnostic ni de posologie.
 * `specialty` = slug d'une Specialty existante. `relatedSlugs` = HealthTopic liés.
 */
export type Faq = { q: string; a: string };

export type SpecialtyGuideSeed = {
  specialty: string; // slug d'une Specialty existante
  relatedSlugs?: string[];

  // ── FR ──
  shortAnswer: string;
  reasons: string[];
  redFlags: string[];
  whenToConsult: string;
  faq: Faq[];

  // ── AR ──
  shortAnswerAr: string;
  reasonsAr: string[];
  redFlagsAr: string[];
  whenToConsultAr: string;
  faqAr: Faq[];
};

export const SPECIALTY_GUIDES: SpecialtyGuideSeed[] = [
  {
    specialty: "dermatologie",
    relatedSlugs: ["acne", "eczema", "psoriasis", "demangeaisons", "chute-de-cheveux", "cancer-de-la-peau"],
    shortAnswer:
      "Consultez un dermatologue pour un problème de peau, de cheveux ou d'ongles qui dure, s'aggrave ou vous inquiète : bouton ou grain de beauté qui change, acné persistante, plaques, démangeaisons tenaces, chute de cheveux importante. Un médecin généraliste peut orienter en premier recours.",
    reasons: [
      "Grain de beauté qui change de forme, de couleur ou de taille",
      "Acné persistante ou laissant des cicatrices",
      "Plaques, rougeurs ou desquamation qui durent (eczéma, psoriasis)",
      "Démangeaisons tenaces sans cause évidente",
      "Chute de cheveux importante ou inhabituelle",
      "Lésion, plaie ou verrue qui ne guérit pas",
    ],
    redFlags: [
      "Grain de beauté qui saigne, gratte ou grossit rapidement",
      "Plaie qui ne cicatrise pas depuis plusieurs semaines",
      "Éruption étendue avec fièvre ou atteinte de l'état général",
    ],
    whenToConsult:
      "Pour un motif chronique, prenez rendez-vous sans urgence mais sans trop attendre : plus une lésion suspecte est vue tôt, mieux c'est. Devant un grain de beauté qui change, consultez rapidement.",
    faq: [
      { q: "Faut-il une lettre du médecin traitant pour voir un dermatologue ?", a: "Au Maroc, vous pouvez consulter directement un dermatologue. Un médecin généraliste peut toutefois vous orienter et assurer le suivi." },
      { q: "À quelle fréquence surveiller ses grains de beauté ?", a: "Une surveillance annuelle est raisonnable si vous avez de nombreux grains de beauté ou des antécédents ; consultez sans attendre si l'un d'eux change." },
    ],
    shortAnswerAr:
      "استشِر طبيب الجلد لمشكلة في الجلد أو الشعر أو الأظافر تدوم أو تتفاقم أو تُقلقك: شامة تتغيّر، حبّ شباب مستمرّ، بُقع، حكّة عنيدة، تساقط شعر مهمّ. يمكن لطبيب عام التوجيه في أول استشارة.",
    reasonsAr: [
      "شامة تتغيّر شكلاً أو لوناً أو حجماً",
      "حبّ شباب مستمرّ أو يُخلّف ندوباً",
      "بُقع أو احمرار أو تقشّر يدوم (إكزيما، صدفية)",
      "حكّة عنيدة دون سبب واضح",
      "تساقط شعر مهمّ أو غير معتاد",
      "آفة أو جُرح أو ثؤلول لا يلتئم",
    ],
    redFlagsAr: [
      "شامة تنزف أو تحكّ أو تكبر بسرعة",
      "جُرح لا يلتئم منذ عدّة أسابيع",
      "طفح واسع مع حُمّى أو تدهور الحالة العامّة",
    ],
    whenToConsultAr:
      "لسبب مزمن، احجز موعداً دون استعجال لكن دون تأخير كبير: كلّما رُئيت آفة مشبوهة مبكراً كان أفضل. أمام شامة تتغيّر، استشِر بسرعة.",
    faqAr: [
      { q: "هل تلزم رسالة من الطبيب المعالِج لرؤية طبيب الجلد؟", a: "بالمغرب يمكنك استشارة طبيب الجلد مباشرةً. غير أنّ طبيباً عاماً يمكنه توجيهك وضمان المتابعة." },
      { q: "كم مرّة أراقب شاماتي؟", a: "المراقبة السنوية معقولة إذا كانت لديك شامات كثيرة أو سوابق؛ استشِر دون تأخير إذا تغيّرت إحداها." },
    ],
  },
  {
    specialty: "neurologie",
    relatedSlugs: ["migraine", "avc", "epilepsie", "vertiges", "demence"],
    shortAnswer:
      "Consultez un neurologue pour des maux de tête inhabituels ou fréquents, des malaises ou pertes de connaissance, des troubles de la mémoire, des fourmillements, une faiblesse ou des troubles de l'équilibre persistants. Devant des signes d'AVC, il s'agit d'une urgence : appelez les secours immédiatement.",
    reasons: [
      "Maux de tête fréquents, intenses ou d'apparition nouvelle",
      "Malaises, pertes de connaissance ou mouvements anormaux",
      "Troubles de la mémoire ou de la concentration qui s'aggravent",
      "Fourmillements, engourdissements ou faiblesse d'un membre",
      "Tremblements ou troubles de l'équilibre persistants",
    ],
    redFlags: [
      "Faiblesse ou paralysie brutale d'un côté, bouche déviée, trouble de la parole (AVC → urgence)",
      "Mal de tête brutal et intense « comme jamais »",
      "Première crise convulsive ou perte de connaissance inexpliquée",
    ],
    whenToConsult:
      "Un motif chronique (migraines, troubles de la mémoire) justifie un rendez-vous programmé, souvent après un premier avis du généraliste. Tout signe évoquant un AVC impose d'appeler les secours sans délai.",
    faq: [
      { q: "Migraine : quand voir un neurologue plutôt qu'un généraliste ?", a: "Le généraliste gère la plupart des migraines. Le neurologue intervient si elles sont fréquentes, invalidantes, résistantes ou atypiques." },
      { q: "Les troubles de mémoire relèvent-ils toujours du neurologue ?", a: "Un premier bilan par le médecin généraliste ou le gériatre est fréquent ; il oriente vers le neurologue si nécessaire." },
    ],
    shortAnswerAr:
      "استشِر طبيب الأعصاب لصداع غير معتاد أو متكرّر، إغماءات أو فقدان وعي، اضطرابات ذاكرة، تنميل، ضعف أو اضطرابات توازن مستمرّة. أمام علامات السكتة الدماغية، الأمر طارئ: اتّصل بالإسعاف فوراً.",
    reasonsAr: [
      "صداع متكرّر أو شديد أو ظهر حديثاً",
      "إغماءات أو فقدان وعي أو حركات غير طبيعية",
      "اضطرابات ذاكرة أو تركيز تتفاقم",
      "تنميل أو خدر أو ضعف في طرف",
      "رعشة أو اضطرابات توازن مستمرّة",
    ],
    redFlagsAr: [
      "ضعف أو شلل مفاجئ في جهة، انحراف الفم، اضطراب النطق (سكتة → طوارئ)",
      "صداع مفاجئ وشديد «لم يسبق مثله»",
      "أول نوبة تشنّج أو فقدان وعي غير مُفسَّر",
    ],
    whenToConsultAr:
      "السبب المزمن (صداع نصفي، اضطرابات ذاكرة) يستوجب موعداً مُبرمَجاً، غالباً بعد رأي أوّلي من الطبيب العام. أيّ علامة تُوحي بسكتة تفرض الاتّصال بالإسعاف دون تأخير.",
    faqAr: [
      { q: "الصداع النصفي: متى أرى طبيب الأعصاب بدل الطبيب العام؟", a: "يُدبّر الطبيب العام معظم حالات الصداع النصفي. يتدخّل طبيب الأعصاب إذا كانت متكرّرة أو مُعيقة أو مقاوِمة أو غير نمطية." },
      { q: "هل اضطرابات الذاكرة من اختصاص طبيب الأعصاب دائماً؟", a: "غالباً ما يبدأ التقييم عند الطبيب العام أو طبيب الشيخوخة، الذي يوجّه إلى طبيب الأعصاب عند الحاجة." },
    ],
  },
  {
    specialty: "cardiologie",
    relatedSlugs: ["hypertension-arterielle", "angine-de-poitrine", "palpitations", "douleur-thoracique", "hypercholesterolemie"],
    shortAnswer:
      "Consultez un cardiologue en cas de palpitations, d'essoufflement anormal, de douleurs thoraciques à l'effort, d'hypertension, ou pour un bilan si vous avez des facteurs de risque (tabac, diabète, cholestérol, antécédents familiaux). Une douleur thoracique intense est une urgence : appelez les secours.",
    reasons: [
      "Palpitations ou battements irréguliers",
      "Essoufflement inhabituel à l'effort ou au repos",
      "Douleur ou oppression thoracique à l'effort",
      "Hypertension artérielle à évaluer ou à suivre",
      "Bilan de facteurs de risque (tabac, diabète, cholestérol, hérédité)",
    ],
    redFlags: [
      "Douleur thoracique intense, prolongée, irradiant au bras ou à la mâchoire (→ urgence)",
      "Essoufflement brutal ou malaise avec sueurs",
      "Perte de connaissance à l'effort",
    ],
    whenToConsult:
      "Pour un bilan ou un suivi, prenez rendez-vous de façon programmée, souvent sur orientation du médecin généraliste. Toute douleur thoracique évoquant un infarctus impose d'appeler immédiatement les secours.",
    faq: [
      { q: "À partir de quel âge faire un bilan cardiaque ?", a: "Il n'y a pas d'âge unique : le médecin le propose selon vos facteurs de risque. Une hypertension ou un antécédent familial avancent l'échéance." },
      { q: "Hypertension : généraliste ou cardiologue ?", a: "Le généraliste suit la plupart des hypertensions. Le cardiologue intervient pour les formes compliquées, résistantes ou avec retentissement." },
    ],
    shortAnswerAr:
      "استشِر طبيب القلب عند خفقان، ضيق تنفّس غير طبيعي، آلام صدرية عند المجهود، ارتفاع ضغط، أو لإجراء فحص إذا كانت لديك عوامل خطر (تدخين، سكري، كوليسترول، سوابق عائلية). الألم الصدري الشديد طارئ: اتّصل بالإسعاف.",
    reasonsAr: [
      "خفقان أو نبضات غير منتظمة",
      "ضيق تنفّس غير معتاد عند المجهود أو الراحة",
      "ألم أو ضغط صدري عند المجهود",
      "ارتفاع ضغط الدم للتقييم أو المتابعة",
      "فحص عوامل الخطر (تدخين، سكري، كوليسترول، وراثة)",
    ],
    redFlagsAr: [
      "ألم صدري شديد ومطوّل يمتدّ إلى الذراع أو الفكّ (→ طوارئ)",
      "ضيق تنفّس مفاجئ أو إغماء مع تعرّق",
      "فقدان وعي أثناء المجهود",
    ],
    whenToConsultAr:
      "للفحص أو المتابعة، احجز موعداً مُبرمَجاً، غالباً بتوجيه من الطبيب العام. أيّ ألم صدري يُوحي باحتشاء يفرض الاتّصال بالإسعاف فوراً.",
    faqAr: [
      { q: "من أيّ سنّ أُجري فحصاً للقلب؟", a: "لا يوجد سنّ وحيد: يقترحه الطبيب حسب عوامل الخطر لديك. يُقدّم ارتفاع الضغط أو سابقة عائلية هذا الموعد." },
      { q: "ارتفاع الضغط: طبيب عام أم طبيب قلب؟", a: "يتابع الطبيب العام معظم حالات ارتفاع الضغط. يتدخّل طبيب القلب في الأشكال المُعقّدة أو المقاوِمة أو ذات المضاعفات." },
    ],
  },
  {
    specialty: "gastro-enterologie",
    relatedSlugs: ["brulures-d-estomac", "mal-de-ventre", "ballonnements", "constipation", "diarrhee", "hemorroides"],
    shortAnswer:
      "Consultez un gastro-entérologue pour des troubles digestifs qui durent : douleurs abdominales, brûlures d'estomac fréquentes, transit perturbé, ballonnements persistants, ou pour un dépistage (côlon) selon l'âge et les antécédents. Un saignement digestif ou une douleur intense justifie une consultation rapide.",
    reasons: [
      "Brûlures d'estomac ou remontées fréquentes",
      "Douleurs abdominales récurrentes",
      "Transit durablement perturbé (diarrhée, constipation)",
      "Ballonnements persistants ou inconfort digestif",
      "Dépistage du cancer colorectal selon l'âge et les antécédents",
    ],
    redFlags: [
      "Sang dans les selles ou selles noires",
      "Perte de poids inexpliquée, difficulté à avaler",
      "Douleur abdominale intense et brutale",
    ],
    whenToConsult:
      "Des symptômes qui durent plus de quelques semaines justifient un rendez-vous, souvent après un premier avis du généraliste. Un saignement ou des signes d'alerte imposent de consulter rapidement.",
    faq: [
      { q: "Quand faire une coloscopie de dépistage ?", a: "Le médecin propose le dépistage selon votre âge et vos antécédents familiaux ; il ne se décide pas seul et dépend de chaque situation." },
      { q: "Brûlures d'estomac occasionnelles : faut-il consulter ?", a: "Des brûlures rares s'améliorent souvent avec des mesures simples. Si elles deviennent fréquentes ou gênantes, consultez." },
    ],
    shortAnswerAr:
      "استشِر طبيب الجهاز الهضمي لاضطرابات هضمية تدوم: آلام بطنية، حُرقة معدة متكرّرة، اضطراب العبور، انتفاخ مستمرّ، أو للكشف (القولون) حسب السنّ والسوابق. النزيف الهضمي أو الألم الشديد يستوجب استشارة سريعة.",
    reasonsAr: [
      "حُرقة معدة أو ارتجاع متكرّر",
      "آلام بطنية متكرّرة",
      "اضطراب دائم في العبور (إسهال، إمساك)",
      "انتفاخ مستمرّ أو انزعاج هضمي",
      "الكشف عن سرطان القولون والمستقيم حسب السنّ والسوابق",
    ],
    redFlagsAr: [
      "دم في البراز أو براز أسود",
      "فقدان وزن غير مُفسَّر، صعوبة في البلع",
      "ألم بطني شديد ومفاجئ",
    ],
    whenToConsultAr:
      "الأعراض التي تدوم أكثر من بضعة أسابيع تستوجب موعداً، غالباً بعد رأي أوّلي من الطبيب العام. النزيف أو علامات الإنذار تفرض استشارة سريعة.",
    faqAr: [
      { q: "متى أُجري تنظير قولون للكشف؟", a: "يقترح الطبيب الكشف حسب سنّك وسوابقك العائلية؛ لا يُقرَّر وحده ويعتمد على كلّ حالة." },
      { q: "حُرقة معدة عابرة: هل أستشير؟", a: "الحُرقة النادرة تتحسّن غالباً بتدابير بسيطة. إذا صارت متكرّرة أو مُزعجة، استشِر." },
    ],
  },
  {
    specialty: "gyneco-obstetrique",
    relatedSlugs: ["absence-de-regles", "mycose-vaginale", "contraception", "douleur-au-sein", "diabete-gestationnel"],
    shortAnswer:
      "Consultez un gynécologue pour le suivi gynécologique régulier, la contraception, des règles douloureuses ou irrégulières, des douleurs pelviennes, le suivi de grossesse, ou tout symptôme inhabituel. Un dépistage régulier (frottis) fait partie de la prévention. Certains symptômes justifient une consultation rapide.",
    reasons: [
      "Suivi gynécologique et dépistage réguliers",
      "Contraception : choix et suivi",
      "Règles douloureuses, absentes ou irrégulières",
      "Douleurs pelviennes ou pertes inhabituelles",
      "Suivi de grossesse",
    ],
    redFlags: [
      "Saignements abondants ou en dehors des règles",
      "Douleur pelvienne intense et brutale",
      "Fièvre avec douleurs pelviennes",
    ],
    whenToConsult:
      "Un suivi et un dépistage réguliers sont recommandés même sans symptôme. Devant une douleur intense, une fièvre ou des saignements anormaux, consultez rapidement.",
    faq: [
      { q: "À quelle fréquence faire un suivi gynécologique ?", a: "Un suivi régulier est conseillé ; le rythme du dépistage (frottis) est précisé par le médecin selon votre âge et vos antécédents." },
      { q: "Peut-on consulter une sage-femme plutôt qu'un gynécologue ?", a: "La sage-femme assure le suivi gynécologique de prévention et la contraception chez la femme en bonne santé, et oriente si besoin." },
    ],
    shortAnswerAr:
      "استشِري طبيب النساء للمتابعة النسائية المنتظمة، وسائل منع الحمل، دورة مؤلمة أو غير منتظمة، آلام حوضية، متابعة الحمل، أو أيّ عَرَض غير معتاد. الكشف المنتظم جزء من الوقاية. بعض الأعراض تستوجب استشارة سريعة.",
    reasonsAr: [
      "متابعة نسائية وكشف منتظمان",
      "وسائل منع الحمل: الاختيار والمتابعة",
      "دورة مؤلمة أو غائبة أو غير منتظمة",
      "آلام حوضية أو إفرازات غير معتادة",
      "متابعة الحمل",
    ],
    redFlagsAr: [
      "نزيف غزير أو خارج فترة الدورة",
      "ألم حوضي شديد ومفاجئ",
      "حُمّى مع آلام حوضية",
    ],
    whenToConsultAr:
      "يُنصَح بمتابعة وكشف منتظمين حتى دون أعراض. أمام ألم شديد أو حُمّى أو نزيف غير طبيعي، استشيري بسرعة.",
    faqAr: [
      { q: "كم مرّة أُجري متابعة نسائية؟", a: "يُنصَح بمتابعة منتظمة؛ يحدّد الطبيب وتيرة الكشف حسب سنّك وسوابقك." },
      { q: "هل يمكن استشارة قابلة بدل طبيب النساء؟", a: "تضمن القابلة المتابعة النسائية الوقائية ووسائل منع الحمل لدى المرأة السليمة، وتوجّه عند الحاجة." },
    ],
  },
  {
    specialty: "pediatrie",
    relatedSlugs: ["bronchiolite", "coliques-du-nourrisson", "diarrhee-du-nourrisson", "coqueluche"],
    shortAnswer:
      "Consultez un pédiatre pour le suivi de croissance et les vaccinations de l'enfant, ainsi que pour toute inquiétude sur son développement, son alimentation, son sommeil ou une maladie qui traîne. Chez le nourrisson, certains signes (fièvre, gêne respiratoire, refus de boire) imposent une consultation rapide.",
    reasons: [
      "Suivi de croissance et vaccinations",
      "Fièvre ou infections répétées",
      "Inquiétude sur le développement, le sommeil ou l'alimentation",
      "Troubles digestifs du nourrisson (coliques, diarrhée)",
      "Maladie qui traîne ou qui inquiète les parents",
    ],
    redFlags: [
      "Nourrisson de moins de 3 mois avec fièvre",
      "Gêne respiratoire, teint anormal ou somnolence inhabituelle",
      "Refus de boire, signes de déshydratation",
    ],
    whenToConsult:
      "Le suivi régulier et les vaccinations sont programmés. Devant une fièvre du très jeune nourrisson, une gêne respiratoire ou une déshydratation, consultez sans attendre.",
    faq: [
      { q: "Jusqu'à quel âge consulter un pédiatre ?", a: "Le pédiatre suit généralement l'enfant jusqu'à l'adolescence ; le relais avec le médecin généraliste se fait ensuite selon les besoins." },
      { q: "Fièvre chez l'enfant : quand s'inquiéter ?", a: "L'âge, le comportement et les signes associés comptent plus que le chiffre. Un nourrisson fébrile ou un enfant abattu doit être vu rapidement." },
    ],
    shortAnswerAr:
      "استشِر طبيب الأطفال لمتابعة النموّ والتلقيحات، ولأيّ قلق حول تطوّر الطفل أو تغذيته أو نومه أو مرض يطول. عند الرضيع، بعض العلامات (حُمّى، صعوبة تنفّس، رفض الرضاعة) تفرض استشارة سريعة.",
    reasonsAr: [
      "متابعة النموّ والتلقيحات",
      "حُمّى أو التهابات متكرّرة",
      "قلق حول التطوّر أو النوم أو التغذية",
      "اضطرابات هضمية عند الرضيع (مغص، إسهال)",
      "مرض يطول أو يُقلق الوالدين",
    ],
    redFlagsAr: [
      "رضيع أقلّ من 3 أشهر مع حُمّى",
      "صعوبة تنفّس، لون غير طبيعي أو نعاس غير معتاد",
      "رفض الرضاعة، علامات جفاف",
    ],
    whenToConsultAr:
      "المتابعة المنتظمة والتلقيحات مُبرمَجة. أمام حُمّى الرضيع الصغير جداً أو صعوبة تنفّس أو جفاف، استشِر دون تأخير.",
    faqAr: [
      { q: "إلى أيّ سنّ أستشير طبيب أطفال؟", a: "يتابع طبيب الأطفال الطفل عموماً حتى المراهقة؛ ثمّ ينتقل الأمر إلى الطبيب العام حسب الحاجة." },
      { q: "حُمّى عند الطفل: متى أقلق؟", a: "السنّ والسلوك والعلامات المرافِقة أهمّ من الرقم. الرضيع المحموم أو الطفل الخامل يجب أن يُرى بسرعة." },
    ],
  },
  {
    specialty: "ophtalmologie",
    relatedSlugs: ["conjonctivite", "cataracte", "astigmatisme", "dmla"],
    shortAnswer:
      "Consultez un ophtalmologue pour une baisse de la vue, une gêne persistante, un contrôle de la vision ou des lunettes, et un dépistage régulier (tension oculaire, fond d'œil) surtout après 40 ans ou en cas de diabète. Une perte de vue brutale ou une douleur oculaire intense est une urgence.",
    reasons: [
      "Baisse ou trouble de la vision",
      "Contrôle de la vue et prescription de lunettes",
      "Yeux rouges, secs ou irrités de façon persistante",
      "Dépistage (glaucome, rétine) après 40 ans ou si diabète",
      "Suivi en cas de maladie chronique (diabète, hypertension)",
    ],
    redFlags: [
      "Perte de vision brutale, même transitoire",
      "Douleur oculaire intense avec œil rouge",
      "Éclairs, mouches ou voile devant l'œil d'apparition soudaine",
    ],
    whenToConsult:
      "Un contrôle régulier est recommandé, surtout après 40 ans ou en cas de diabète. Toute perte de vue brutale ou douleur oculaire intense impose de consulter en urgence.",
    faq: [
      { q: "À quelle fréquence contrôler sa vue ?", a: "Un contrôle tous les 1 à 2 ans est raisonnable selon l'âge et les facteurs de risque ; le médecin adapte ce rythme." },
      { q: "Diabète : pourquoi un suivi ophtalmologique ?", a: "Le diabète peut atteindre la rétine sans symptôme au début ; un fond d'œil régulier permet de dépister tôt." },
    ],
    shortAnswerAr:
      "استشِر طبيب العيون عند تراجع الرؤية، انزعاج مستمرّ، مراقبة النظر أو النظّارات، وكشف منتظم (ضغط العين، قاع العين) خاصّةً بعد 40 سنة أو عند السكري. فقدان الرؤية المفاجئ أو ألم العين الشديد طارئ.",
    reasonsAr: [
      "تراجع أو اضطراب الرؤية",
      "مراقبة النظر ووصف النظّارات",
      "عيون حمراء أو جافّة أو مُتهيّجة باستمرار",
      "كشف (الزَّرَق، الشبكية) بعد 40 سنة أو عند السكري",
      "متابعة عند مرض مزمن (سكري، ارتفاع ضغط)",
    ],
    redFlagsAr: [
      "فقدان مفاجئ للرؤية، ولو عابر",
      "ألم شديد في العين مع احمرار",
      "ومضات أو ذباب أو حجاب أمام العين يظهر فجأةً",
    ],
    whenToConsultAr:
      "يُنصَح بمراقبة منتظمة، خاصّةً بعد 40 سنة أو عند السكري. أيّ فقدان مفاجئ للرؤية أو ألم شديد في العين يفرض استشارة عاجلة.",
    faqAr: [
      { q: "كم مرّة أراقب نظري؟", a: "مراقبة كلّ سنة إلى سنتين معقولة حسب السنّ وعوامل الخطر؛ يُكيّف الطبيب هذه الوتيرة." },
      { q: "السكري: لماذا متابعة عند طبيب العيون؟", a: "قد يُصيب السكري الشبكية دون أعراض في البداية؛ يسمح فحص قاع العين المنتظم بالكشف المبكر." },
    ],
  },
  {
    specialty: "rhumatologie",
    relatedSlugs: ["arthrose", "mal-de-dos", "douleurs-articulaires", "bursite"],
    shortAnswer:
      "Consultez un rhumatologue pour des douleurs articulaires, osseuses ou du dos qui durent, des articulations gonflées ou raides le matin, ou un suivi d'arthrose ou d'ostéoporose. Le médecin généraliste évalue souvent en premier et oriente. Une articulation très douloureuse, chaude et fébrile justifie une consultation rapide.",
    reasons: [
      "Douleurs articulaires ou osseuses persistantes",
      "Raideur matinale prolongée des articulations",
      "Articulation gonflée, chaude ou déformée",
      "Mal de dos chronique ou inflammatoire",
      "Suivi d'arthrose, d'ostéoporose ou de maladie inflammatoire",
    ],
    redFlags: [
      "Articulation très douloureuse, chaude et gonflée avec fièvre",
      "Douleur du dos avec perte de force ou troubles urinaires",
      "Amaigrissement ou fièvre associés aux douleurs",
    ],
    whenToConsult:
      "Des douleurs qui durent plusieurs semaines justifient un avis, souvent après le médecin généraliste. Une articulation chaude et fébrile ou des signes neurologiques imposent de consulter rapidement.",
    faq: [
      { q: "Arthrose : généraliste ou rhumatologue ?", a: "Le généraliste gère beaucoup de cas d'arthrose. Le rhumatologue intervient en cas de doute diagnostique, de douleur résistante ou de maladie inflammatoire." },
      { q: "La kinésithérapie remplace-t-elle le rhumatologue ?", a: "Elle est complémentaire : le médecin pose l'indication et le kinésithérapeute réalise la rééducation." },
    ],
    shortAnswerAr:
      "استشِر طبيب الروماتيزم لآلام مفصلية أو عظمية أو في الظهر تدوم، مفاصل مُنتفخة أو مُتيبّسة صباحاً، أو متابعة خشونة أو هشاشة عظام. غالباً ما يقيّم الطبيب العام أولاً ويوجّه. مفصل شديد الألم وحارّ مع حُمّى يستوجب استشارة سريعة.",
    reasonsAr: [
      "آلام مفصلية أو عظمية مستمرّة",
      "تيبّس صباحي مطوّل في المفاصل",
      "مفصل مُنتفخ أو حارّ أو مُشوَّه",
      "ألم ظهر مزمن أو التهابي",
      "متابعة خشونة أو هشاشة عظام أو مرض التهابي",
    ],
    redFlagsAr: [
      "مفصل شديد الألم، حارّ ومُنتفخ مع حُمّى",
      "ألم ظهر مع فقدان قوّة أو اضطرابات بولية",
      "نقص وزن أو حُمّى مرافِقة للآلام",
    ],
    whenToConsultAr:
      "الآلام التي تدوم عدّة أسابيع تستوجب رأياً، غالباً بعد الطبيب العام. مفصل حارّ محموم أو علامات عصبية تفرض استشارة سريعة.",
    faqAr: [
      { q: "الخشونة: طبيب عام أم طبيب روماتيزم؟", a: "يُدبّر الطبيب العام حالات كثيرة من الخشونة. يتدخّل طبيب الروماتيزم عند شكّ تشخيصي أو ألم مقاوِم أو مرض التهابي." },
      { q: "هل يُغني العلاج الطبيعي عن طبيب الروماتيزم؟", a: "هو مُكمِّل: يضع الطبيب الاستطباب ويُجري أخصائي العلاج الطبيعي إعادة التأهيل." },
    ],
  },
];
