/**
 * Lot 3 des guides « quand consulter un [spécialité] ? » (16 spécialités patient-facing).
 * Voir specialty-guides.ts. Relecture humaine à faire → noindex (verrous null).
 */
import type { SpecialtyGuideSeed } from "./specialty-guides";

export const SPECIALTY_GUIDES_3: SpecialtyGuideSeed[] = [
  {
    specialty: "medecine-interne",
    relatedSlugs: ["lupus", "syndrome-de-fatigue-chronique", "perte-de-poids-inexpliquee", "fatigue"],
    shortAnswer: "Consultez un interniste quand des symptômes touchent plusieurs organes, persistent sans cause claire ou déroutent les autres médecins : fièvre prolongée, fatigue inexpliquée, amaigrissement, douleurs diffuses, anomalies de bilan sanguin. Spécialiste de la vision d'ensemble, il coordonne les examens et oriente vers le bon confrère.",
    reasons: [
      "Symptômes touchant plusieurs organes sans diagnostic établi",
      "Fatigue, fièvre ou amaigrissement inexpliqués qui durent",
      "Suspicion de maladie auto-immune ou inflammatoire (lupus, vascularite)",
      "Anomalies de bilan sanguin à explorer globalement",
      "Coordination du suivi en cas de plusieurs maladies chroniques associées",
      "Second avis pour un tableau clinique complexe ou inclassable",
    ],
    redFlags: [
      "Fièvre élevée persistant plus de trois semaines sans explication",
      "Amaigrissement rapide et important non voulu",
      "Sueurs nocturnes abondantes associées à une grande fatigue",
    ],
    whenToConsult: "Prenez rendez-vous avec un interniste, souvent adressé par votre médecin traitant, lorsque des symptômes persistent malgré des consultations et que le diagnostic reste flou, ou quand plusieurs organes semblent atteints en même temps. C'est aussi le bon interlocuteur pour faire le point global si vous cumulez plusieurs maladies chroniques. En cas de signe d'alerte aigu, orientez-vous d'abord vers les urgences.",
    faq: [
      {
        q: "Quelle est la différence entre un interniste et un médecin généraliste ?",
        a: "Le généraliste assure le suivi de premier recours au quotidien. L'interniste est un spécialiste des situations complexes ou pluri-organes : il approfondit les cas difficiles et coordonne les explorations quand le diagnostic n'est pas clair. Les deux travaillent en complément.",
      },
      {
        q: "Faut-il une lettre d'adressage pour voir un interniste ?",
        a: "Ce n'est pas obligatoire, mais un courrier de votre médecin résumant vos symptômes, traitements et examens déjà réalisés fait gagner un temps précieux et évite de refaire des bilans. Apportez tous vos résultats récents à la consultation.",
      },
    ],
    shortAnswerAr: "استشر طبيب الأمراض الباطنية عندما تصيب الأعراض عدة أعضاء أو تستمر دون سبب واضح أو تحيّر الأطباء الآخرين: حمى مطوّلة، تعب غير مبرر، فقدان الوزن، آلام منتشرة، أو اضطرابات في تحاليل الدم. بصفته اختصاصي النظرة الشاملة، ينسّق الفحوصات ويوجّهك نحو الاختصاصي المناسب.",
    reasonsAr: [
      "أعراض تصيب عدة أعضاء دون تشخيص محدّد",
      "تعب أو حمى أو فقدان وزن غير مبرر ويستمر",
      "الاشتباه في مرض مناعي ذاتي أو التهابي (الذئبة، التهاب الأوعية)",
      "اضطرابات في تحاليل الدم تحتاج إلى استكشاف شامل",
      "تنسيق المتابعة عند وجود عدة أمراض مزمنة مصاحبة",
      "رأي ثانٍ في حالة سريرية معقّدة أو يصعب تصنيفها",
    ],
    redFlagsAr: [
      "حمى مرتفعة تستمر أكثر من ثلاثة أسابيع دون تفسير",
      "فقدان وزن سريع وكبير دون قصد",
      "تعرّق ليلي غزير مصحوب بتعب شديد",
    ],
    whenToConsultAr: "احجز موعداً مع طبيب الأمراض الباطنية، غالباً بتوجيه من طبيبك المعالج، عندما تستمر الأعراض رغم الاستشارات ويبقى التشخيص غامضاً، أو عندما يبدو أن عدة أعضاء مصابة في آن واحد. وهو أيضاً المخاطب المناسب لإجراء تقييم شامل إذا كنت تجمع بين عدة أمراض مزمنة. أما في حالة وجود علامة إنذار حادة، فتوجّه أولاً إلى قسم المستعجلات.",
    faqAr: [
      {
        q: "ما الفرق بين طبيب الأمراض الباطنية والطبيب العام؟",
        a: "الطبيب العام يضمن المتابعة الأولية اليومية. أما طبيب الأمراض الباطنية فهو اختصاصي في الحالات المعقّدة أو التي تصيب عدة أعضاء: يعمّق دراسة الحالات الصعبة وينسّق الفحوصات عندما يكون التشخيص غير واضح. ويكمّل كل منهما عمل الآخر.",
      },
      {
        q: "هل أحتاج إلى رسالة توجيه لزيارة طبيب الأمراض الباطنية؟",
        a: "ليس أمراً إلزامياً، لكن رسالة من طبيبك تلخّص أعراضك وعلاجاتك والفحوصات التي أُجريت توفّر وقتاً ثميناً وتجنّب تكرار التحاليل. أحضِر جميع نتائجك الحديثة إلى الموعد.",
      },
    ],
  },
  {
    specialty: "psychologie",
    relatedSlugs: ["burn-out", "stress", "depression", "crise-d-angoisse"],
    shortAnswer: "Consultez un psychologue lorsque le mal-être, l'anxiété, une épreuve de vie ou des difficultés relationnelles pèsent sur votre quotidien. Le psychologue propose un accompagnement et une thérapie par la parole, sans prescription de médicaments. Il aide à comprendre ce que vous traversez et à retrouver des ressources, à votre rythme.",
    reasons: [
      "Anxiété, stress chronique ou sentiment de mal-être persistant",
      "Épreuve de vie difficile : deuil, séparation, perte d'emploi",
      "Baisse de moral, perte d'envie ou d'estime de soi",
      "Difficultés relationnelles, familiales ou de couple",
      "Épuisement professionnel ou surcharge émotionnelle",
      "Besoin de mieux se comprendre ou de mettre des mots sur ses émotions",
    ],
    redFlags: [
      "Pensées de suicide ou de se faire du mal",
      "Incapacité soudaine à assurer le quotidien (se lever, se nourrir)",
      "Détresse intense après un choc ou un traumatisme récent",
    ],
    whenToConsult: "Prenez rendez-vous avec un psychologue dès que la souffrance psychique dure, revient ou vous empêche de fonctionner normalement, sans attendre d'aller très mal. Un accompagnement précoce est souvent plus court et plus efficace. Si un traitement médicamenteux paraît nécessaire, le psychologue vous orientera vers un psychiatre. En cas de pensées suicidaires, contactez sans délai les urgences ou une ligne d'écoute.",
    faq: [
      {
        q: "Quelle est la différence entre un psychologue et un psychiatre ?",
        a: "Le psychologue accompagne par la parole et propose des thérapies, mais ne prescrit pas de médicaments. Le psychiatre est médecin et peut prescrire un traitement. Les deux sont souvent complémentaires : on peut suivre une thérapie avec un psychologue tout en étant suivi par un psychiatre.",
      },
      {
        q: "Combien de séances faut-il prévoir ?",
        a: "Cela dépend de votre situation et de vos objectifs. Certaines difficultés se travaillent en quelques séances, d'autres demandent un suivi plus long. Le psychologue en discute avec vous dès les premières rencontres et ajuste le rythme selon vos besoins.",
      },
    ],
    shortAnswerAr: "استشر أخصائياً نفسياً عندما يثقل الضيق النفسي أو القلق أو محنة حياتية أو صعوبات في العلاقات على حياتك اليومية. يقدّم الأخصائي النفسي مرافقة وعلاجاً بالكلام دون وصف أدوية. يساعدك على فهم ما تمرّ به وعلى استعادة قدراتك، وفق إيقاعك الخاص.",
    reasonsAr: [
      "قلق أو توتر مزمن أو شعور دائم بالضيق النفسي",
      "محنة حياتية صعبة: فقدان عزيز، انفصال، فقدان العمل",
      "انخفاض المعنويات أو فقدان الرغبة أو تقدير الذات",
      "صعوبات في العلاقات العائلية أو الزوجية",
      "إرهاق مهني أو حمل عاطفي مفرط",
      "الحاجة إلى فهم الذات بشكل أفضل أو التعبير عن المشاعر",
    ],
    redFlagsAr: [
      "أفكار انتحارية أو الرغبة في إيذاء النفس",
      "عجز مفاجئ عن أداء المهام اليومية (النهوض، الأكل)",
      "ضيق نفسي شديد بعد صدمة أو رضّة نفسية حديثة",
    ],
    whenToConsultAr: "احجز موعداً مع أخصائي نفسي بمجرد أن يستمر الألم النفسي أو يتكرّر أو يمنعك من أداء حياتك بشكل طبيعي، دون انتظار تدهور حالتك كثيراً. فالمرافقة المبكرة غالباً ما تكون أقصر وأكثر فعالية. وإذا بدا العلاج الدوائي ضرورياً، سيوجّهك الأخصائي النفسي إلى طبيب نفسي. وفي حالة وجود أفكار انتحارية، اتصل فوراً بالمستعجلات أو بخط للإصغاء.",
    faqAr: [
      {
        q: "ما الفرق بين الأخصائي النفسي والطبيب النفسي؟",
        a: "الأخصائي النفسي يرافق بالكلام ويقدّم علاجات نفسية، لكنه لا يصف الأدوية. أما الطبيب النفسي فهو طبيب ويمكنه وصف العلاج الدوائي. وغالباً ما يكمّل كل منهما الآخر: يمكن متابعة علاج بالكلام مع أخصائي نفسي مع المتابعة لدى طبيب نفسي.",
      },
      {
        q: "كم عدد الجلسات المطلوبة؟",
        a: "يعتمد ذلك على وضعك وأهدافك. بعض الصعوبات تُعالج في بضع جلسات، وأخرى تتطلّب متابعة أطول. يناقش الأخصائي النفسي ذلك معك منذ اللقاءات الأولى ويعدّل الإيقاع حسب حاجتك.",
      },
    ],
  },
  {
    specialty: "nutrition",
    relatedSlugs: ["obesite", "denutrition", "diabete", "intolerance-au-lactose"],
    shortAnswer: "Consultez un nutritionniste ou diététicien pour adapter votre alimentation à un objectif de santé : perte ou prise de poids, diabète, cholestérol, troubles digestifs ou intolérances. Il établit un bilan alimentaire personnalisé et un plan réaliste, sans régime miracle, pour améliorer durablement vos habitudes et votre équilibre métabolique.",
    reasons: [
      "Surpoids ou obésité à prendre en charge durablement",
      "Diabète, cholestérol élevé ou autre maladie métabolique",
      "Perte de poids ou dénutrition à corriger",
      "Troubles digestifs, intolérances ou allergies alimentaires",
      "Alimentation à adapter (grossesse, sport, végétarisme)",
      "Besoin d'un accompagnement pour changer durablement ses habitudes",
    ],
    redFlags: [
      "Amaigrissement rapide et involontaire non expliqué",
      "Rapport à la nourriture très perturbé (privations, crises)",
      "Grande fatigue ou malaises liés à l'alimentation",
    ],
    whenToConsult: "Prenez rendez-vous avec un professionnel de la nutrition quand vous souhaitez modifier durablement votre alimentation, quand une maladie (diabète, cholestérol, troubles digestifs) impose une adaptation, ou après un avis médical recommandant un suivi diététique. Un accompagnement structuré vaut mieux qu'un régime restrictif isolé. Si vous suspectez un trouble du comportement alimentaire, un avis médical et psychologique est aussi conseillé.",
    faq: [
      {
        q: "Quelle différence entre nutritionniste et diététicien ?",
        a: "Le médecin nutritionniste est un médecin qui peut poser un diagnostic, prescrire des examens et un traitement. Le diététicien est un professionnel de l'alimentation qui élabore les conseils et plans alimentaires au quotidien. Ils travaillent souvent ensemble selon la complexité de la situation.",
      },
      {
        q: "Peut-on consulter sans être en surpoids ?",
        a: "Oui, tout à fait. On consulte aussi pour équilibrer son alimentation, gérer une maladie, un sport, une grossesse, des troubles digestifs ou simplement pour de meilleures habitudes. Le poids n'est qu'un motif parmi d'autres.",
      },
    ],
    shortAnswerAr: "استشر اختصاصي التغذية لتكييف نظامك الغذائي مع هدف صحي: إنقاص الوزن أو زيادته، السكري، الكوليسترول، اضطرابات الهضم أو عدم التحمّل الغذائي. يضع تقييماً غذائياً شخصياً وخطة واقعية، دون حميات وهمية، لتحسين عاداتك وتوازنك الأيضي بشكل دائم.",
    reasonsAr: [
      "زيادة الوزن أو السمنة التي تحتاج إلى تكفّل دائم",
      "السكري أو ارتفاع الكوليسترول أو مرض أيضي آخر",
      "فقدان وزن أو سوء تغذية يحتاج إلى تصحيح",
      "اضطرابات هضمية أو عدم تحمّل أو حساسية غذائية",
      "نظام غذائي يحتاج إلى تكييف (الحمل، الرياضة، النظام النباتي)",
      "الحاجة إلى مرافقة لتغيير العادات بشكل دائم",
    ],
    redFlagsAr: [
      "فقدان وزن سريع وغير إرادي دون تفسير",
      "علاقة مضطربة جداً بالطعام (حرمان، نوبات أكل)",
      "تعب شديد أو إغماءات مرتبطة بالتغذية",
    ],
    whenToConsultAr: "احجز موعداً مع اختصاصي التغذية عندما ترغب في تغيير نظامك الغذائي بشكل دائم، أو عندما يفرض مرض (السكري، الكوليسترول، اضطرابات الهضم) تكييفاً غذائياً، أو بعد نصيحة طبية توصي بمتابعة غذائية. فالمرافقة المنظّمة أفضل من حمية تقييدية منعزلة. وإذا اشتبهت في اضطراب في السلوك الغذائي، يُنصح أيضاً برأي طبي ونفسي.",
    faqAr: [
      {
        q: "ما الفرق بين طبيب التغذية وأخصائي الحمية؟",
        a: "طبيب التغذية طبيب يمكنه وضع تشخيص وطلب فحوصات ووصف علاج. أما أخصائي الحمية فهو مختص في التغذية يضع النصائح والخطط الغذائية اليومية. وغالباً ما يعملان معاً حسب تعقيد الحالة.",
      },
      {
        q: "هل يمكن الاستشارة دون وجود زيادة في الوزن؟",
        a: "نعم بالتأكيد. تتم الاستشارة أيضاً لتوازن التغذية، أو لإدارة مرض أو رياضة أو حمل أو اضطرابات هضمية، أو ببساطة لعادات أفضل. فالوزن ليس سوى سبب من بين أسباب أخرى.",
      },
    ],
  },
  {
    specialty: "medecine-du-sport",
    relatedSlugs: ["tendinite", "entorse", "crampes-musculaires", "douleur-au-genou"],
    shortAnswer: "Consultez un médecin du sport pour une blessure liée à l'activité physique, un certificat d'aptitude, une reprise après arrêt ou une douleur qui limite vos performances. Il évalue votre condition, prévient les blessures et adapte l'effort à votre santé, que vous soyez sportif occasionnel ou de compétition.",
    reasons: [
      "Blessure musculaire, tendineuse ou articulaire liée au sport",
      "Certificat médical d'aptitude à la pratique ou à la compétition",
      "Reprise du sport après une blessure, une maladie ou une pause",
      "Douleur récurrente à l'effort qui limite la performance",
      "Bilan avant de commencer une activité physique intense",
      "Conseils de prévention et d'adaptation de l'entraînement",
    ],
    redFlags: [
      "Douleur thoracique, malaise ou essoufflement anormal à l'effort",
      "Impossibilité de poser le pied ou de bouger une articulation après un choc",
      "Palpitations ou perte de connaissance pendant le sport",
    ],
    whenToConsult: "Prenez rendez-vous avec un médecin du sport avant de reprendre ou d'intensifier une activité, pour un certificat d'aptitude, ou lorsqu'une douleur revient à chaque effort sans céder au repos. C'est aussi utile après une blessure pour organiser une reprise progressive et sûre. En cas de douleur thoracique, de malaise ou d'essoufflement anormal pendant l'effort, arrêtez et consultez en urgence.",
    faq: [
      {
        q: "Faut-il être sportif de haut niveau pour consulter ?",
        a: "Non. Le médecin du sport reçoit aussi les sportifs occasionnels, les débutants et les personnes qui veulent reprendre une activité en sécurité. Son rôle est d'adapter l'effort à votre santé, quel que soit votre niveau.",
      },
      {
        q: "Le médecin du sport peut-il délivrer un certificat d'aptitude ?",
        a: "Oui, l'évaluation de l'aptitude et la rédaction du certificat font partie de ses missions. Selon votre âge, vos antécédents et le sport visé, il peut demander des examens complémentaires, comme un bilan cardiaque, avant de le délivrer.",
      },
    ],
    shortAnswerAr: "استشر طبيب الطب الرياضي عند إصابة مرتبطة بالنشاط البدني، أو للحصول على شهادة لياقة، أو عند استئناف الرياضة بعد توقّف، أو لألم يحدّ من أدائك. يقيّم لياقتك ويقي من الإصابات ويكيّف الجهد مع حالتك الصحية، سواء كنت رياضياً عرضياً أو منافساً.",
    reasonsAr: [
      "إصابة عضلية أو وترية أو مفصلية مرتبطة بالرياضة",
      "شهادة طبية للياقة لممارسة الرياضة أو المنافسة",
      "استئناف الرياضة بعد إصابة أو مرض أو انقطاع",
      "ألم متكرر عند الجهد يحدّ من الأداء",
      "تقييم قبل البدء في نشاط بدني مكثّف",
      "نصائح للوقاية وتكييف التدريب",
    ],
    redFlagsAr: [
      "ألم في الصدر أو إغماء أو ضيق نفس غير طبيعي عند الجهد",
      "عدم القدرة على وضع القدم أو تحريك مفصل بعد صدمة",
      "خفقان أو فقدان الوعي أثناء الرياضة",
    ],
    whenToConsultAr: "احجز موعداً مع طبيب الطب الرياضي قبل استئناف نشاط أو تكثيفه، أو للحصول على شهادة لياقة، أو عندما يعود الألم مع كل جهد ولا يزول بالراحة. وهو مفيد أيضاً بعد إصابة لتنظيم استئناف تدريجي وآمن. وفي حالة ألم في الصدر أو إغماء أو ضيق نفس غير طبيعي أثناء الجهد، توقّف واستشر بشكل عاجل.",
    faqAr: [
      {
        q: "هل يجب أن أكون رياضياً محترفاً لأستشير؟",
        a: "لا. يستقبل طبيب الطب الرياضي أيضاً الرياضيين العرضيين والمبتدئين ومن يريدون استئناف نشاط بأمان. فدوره هو تكييف الجهد مع حالتك الصحية مهما كان مستواك.",
      },
      {
        q: "هل يمكن لطبيب الطب الرياضي منح شهادة لياقة؟",
        a: "نعم، تقييم اللياقة وتحرير الشهادة جزء من مهامه. وحسب عمرك وسوابقك والرياضة المستهدفة، قد يطلب فحوصات إضافية، مثل تقييم للقلب، قبل منحها.",
      },
    ],
  },
  {
    specialty: "sexologie",
    relatedSlugs: ["troubles-de-l-erection", "ejaculation-precoce", "vaginisme"],
    shortAnswer: "Consultez un sexologue en cas de difficulté durable dans votre vie intime : baisse de désir, douleurs, troubles de l'érection, éjaculation, ou tension dans le couple autour de la sexualité. Dans un cadre confidentiel et respectueux, il aide à comprendre l'origine du trouble et à retrouver une vie intime épanouie.",
    reasons: [
      "Baisse ou perte de désir qui pèse sur le couple",
      "Douleurs pendant les rapports intimes",
      "Troubles de l'érection ou de l'éjaculation",
      "Difficultés d'entente ou de communication autour de la sexualité",
      "Appréhension ou blocage face à l'intimité",
      "Questions sur la sexualité après une maladie, une grossesse ou avec l'âge",
    ],
    redFlags: [
      "Douleur intense ou saignement lors des rapports",
      "Trouble apparu brutalement avec d'autres symptômes physiques",
      "Souffrance psychologique importante ou repli sur soi",
    ],
    whenToConsult: "Prenez rendez-vous avec un sexologue quand une difficulté intime dure, se répète et affecte votre bien-être ou votre couple, sans gêne ni tabou : c'est une consultation de santé comme une autre. Une prise en charge précoce évite que le trouble ne s'installe. Si des symptômes physiques accompagnent le problème (douleur, saignement), un avis médical préalable est recommandé.",
    faq: [
      {
        q: "La consultation est-elle confidentielle ?",
        a: "Oui, comme toute consultation de santé, elle est couverte par le secret professionnel. Le sexologue accueille votre parole sans jugement, dans un cadre respectueux et bienveillant. Vous abordez ce que vous souhaitez, à votre rythme.",
      },
      {
        q: "Peut-on consulter seul ou faut-il venir en couple ?",
        a: "Les deux sont possibles. Certaines difficultés se travaillent individuellement, d'autres gagnent à être abordées à deux. Le sexologue vous conseille la formule la mieux adaptée à votre situation lors des premières séances.",
      },
    ],
    shortAnswerAr: "استشر طبيب الجنس عند وجود صعوبة دائمة في حياتك الحميمية: انخفاض الرغبة، آلام، اضطرابات الانتصاب أو القذف، أو توتر زوجي مرتبط بالعلاقة. في إطار سري ومحترم، يساعدك على فهم أصل الاضطراب واستعادة حياة حميمية متوازنة.",
    reasonsAr: [
      "انخفاض أو فقدان الرغبة بما يثقل على العلاقة الزوجية",
      "آلام أثناء العلاقة الحميمية",
      "اضطرابات في الانتصاب أو القذف",
      "صعوبات في التفاهم أو التواصل حول العلاقة الحميمية",
      "تخوّف أو تحفّظ إزاء العلاقة الحميمية",
      "أسئلة حول الحياة الحميمية بعد مرض أو حمل أو مع التقدّم في السن",
    ],
    redFlagsAr: [
      "ألم شديد أو نزيف أثناء العلاقة",
      "اضطراب ظهر فجأة مع أعراض جسدية أخرى",
      "معاناة نفسية كبيرة أو انطواء على الذات",
    ],
    whenToConsultAr: "احجز موعداً مع طبيب الجنس عندما تستمر صعوبة حميمية وتتكرّر وتؤثّر على راحتك أو علاقتك الزوجية، دون حرج أو محرّم: فهي استشارة صحية كأي استشارة أخرى. التكفّل المبكر يمنع ترسّخ الاضطراب. وإذا رافقت المشكلةَ أعراضٌ جسدية (ألم، نزيف)، يُنصح برأي طبي مسبق.",
    faqAr: [
      {
        q: "هل الاستشارة سرية؟",
        a: "نعم، مثل أي استشارة صحية، فهي مشمولة بالسر المهني. يستقبل طبيب الجنس كلامك دون حكم، في إطار محترم ولطيف. تتناول ما تشاء، وفق إيقاعك الخاص.",
      },
      {
        q: "هل يمكن الاستشارة بمفرد أم يجب الحضور كزوجين؟",
        a: "كلاهما ممكن. بعض الصعوبات تُعالج بشكل فردي، وأخرى يُفضّل تناولها كزوجين. ينصحك طبيب الجنس بالصيغة الأنسب لحالتك خلال الجلسات الأولى.",
      },
    ],
  },
  {
    specialty: "angiologie",
    relatedSlugs: ["varices", "jambes-lourdes", "phlebite", "maladie-de-raynaud"],
    shortAnswer: "Consultez un angiologue pour les troubles des veines et des artères : varices, jambes lourdes ou gonflées, sensation de froid ou de fourmillements aux extrémités, ou suspicion de phlébite. Spécialiste de la circulation, il examine vos vaisseaux, souvent par échographie Doppler, pour prévenir et prendre en charge les maladies vasculaires.",
    reasons: [
      "Varices ou veines apparentes gênantes ou douloureuses",
      "Jambes lourdes, gonflées ou douloureuses en fin de journée",
      "Sensation de froid, doigts qui blanchissent (maladie de Raynaud)",
      "Suivi de la circulation en cas de diabète ou de tabagisme",
      "Difficulté à marcher avec douleur des mollets à l'effort",
      "Suivi après une phlébite ou un traitement vasculaire",
    ],
    redFlags: [
      "Mollet chaud, rouge, gonflé et douloureux d'un seul côté",
      "Douleur brutale et froideur d'un membre",
      "Plaie du pied qui ne cicatrise pas, surtout chez le diabétique",
    ],
    whenToConsult: "Prenez rendez-vous avec un angiologue quand des varices deviennent gênantes, quand vos jambes sont régulièrement lourdes ou gonflées, ou pour surveiller votre circulation si vous êtes diabétique, fumeur ou à risque vasculaire. Un bilan par échographie Doppler permet d'agir tôt. En cas de mollet brutalement chaud, rouge et douloureux, ou d'un membre froid et douloureux, consultez en urgence : il peut s'agir d'une phlébite ou d'une occlusion.",
    faq: [
      {
        q: "Qu'est-ce qu'une échographie Doppler ?",
        a: "C'est un examen indolore et sans danger qui utilise les ultrasons pour visualiser vos veines et artères et mesurer la circulation du sang. L'angiologue le réalise souvent en consultation pour évaluer varices, phlébite ou état des artères.",
      },
      {
        q: "Les varices sont-elles seulement un problème esthétique ?",
        a: "Non. Au-delà de l'aspect, les varices peuvent provoquer douleurs, lourdeurs et complications. L'angiologue évalue leur retentissement sur la circulation et propose une prise en charge adaptée, du traitement conservateur aux gestes spécialisés.",
      },
    ],
    shortAnswerAr: "استشر طبيب الأوعية الدموية عند اضطرابات الأوردة والشرايين: الدوالي، ثقل الساقين أو تورّمها، الإحساس بالبرودة أو التنميل في الأطراف، أو الاشتباه في التهاب وريدي خثاري. بصفته اختصاصي الدورة الدموية، يفحص أوعيتك، غالباً بالصدى دوبلر، للوقاية من أمراض الأوعية والتكفّل بها.",
    reasonsAr: [
      "دوالي أو أوردة ظاهرة مزعجة أو مؤلمة",
      "ساقان ثقيلتان أو متورّمتان أو مؤلمتان في نهاية اليوم",
      "إحساس بالبرودة أو أصابع تبيضّ (داء رينو)",
      "متابعة الدورة الدموية في حالة السكري أو التدخين",
      "صعوبة في المشي مع ألم في الساقين عند الجهد",
      "متابعة بعد التهاب وريدي خثاري أو علاج وعائي",
    ],
    redFlagsAr: [
      "ساق دافئة وحمراء ومتورّمة ومؤلمة من جهة واحدة",
      "ألم مفاجئ وبرودة في أحد الأطراف",
      "جرح في القدم لا يلتئم، خاصة عند مريض السكري",
    ],
    whenToConsultAr: "احجز موعداً مع طبيب الأوعية الدموية عندما تصبح الدوالي مزعجة، أو عندما تكون ساقاك ثقيلتين أو متورّمتين بانتظام، أو لمراقبة دورتك الدموية إذا كنت مصاباً بالسكري أو مدخّناً أو معرّضاً لخطر وعائي. يتيح تقييم بالصدى دوبلر التدخّل المبكر. وفي حالة ساق دافئة وحمراء ومؤلمة فجأة، أو طرف بارد ومؤلم، استشر بشكل عاجل: فقد يكون التهاباً وريدياً خثارياً أو انسداداً.",
    faqAr: [
      {
        q: "ما هو الصدى دوبلر؟",
        a: "هو فحص غير مؤلم وآمن يستخدم الموجات فوق الصوتية لرؤية أوردتك وشرايينك وقياس تدفّق الدم. غالباً ما يجريه طبيب الأوعية أثناء الاستشارة لتقييم الدوالي أو التهاب وريدي أو حالة الشرايين.",
      },
      {
        q: "هل الدوالي مجرّد مشكلة جمالية؟",
        a: "لا. إلى جانب المظهر، قد تسبّب الدوالي آلاماً وثقلاً ومضاعفات. يقيّم طبيب الأوعية تأثيرها على الدورة الدموية ويقترح تكفّلاً مناسباً، من العلاج المحافظ إلى التدخّلات المتخصّصة.",
      },
    ],
  },
  {
    specialty: "hematologie",
    relatedSlugs: ["anemie", "leucemie", "lymphome", "drepanocytose"],
    shortAnswer: "Consultez un hématologue pour les anomalies du sang repérées sur un bilan : anémie, taux anormaux de globules ou de plaquettes, troubles de la coagulation, ou ganglions gonflés persistants. Spécialiste du sang et de la moelle osseuse, il approfondit les résultats, précise le diagnostic et organise le suivi adapté.",
    reasons: [
      "Anémie persistante ou mal expliquée",
      "Anomalies des globules ou des plaquettes sur la prise de sang",
      "Ganglions gonflés qui persistent sans infection claire",
      "Tendance anormale aux saignements ou aux bleus",
      "Suivi d'une maladie du sang connue (drépanocytose, thalassémie)",
      "Bilan d'une fatigue importante avec anomalies sanguines",
    ],
    redFlags: [
      "Saignements abondants ou spontanés, bleus multiples inexpliqués",
      "Fièvre persistante avec sueurs nocturnes et amaigrissement",
      "Ganglions durs qui grossissent rapidement",
    ],
    whenToConsult: "Prenez rendez-vous avec un hématologue, généralement adressé par votre médecin, lorsqu'une prise de sang révèle des anomalies à approfondir ou qu'une maladie du sang doit être suivie. Apportez tous vos bilans, y compris les anciens, pour comparer l'évolution. En cas de saignements abondants, de fièvre persistante avec amaigrissement ou de ganglions grossissant vite, ne tardez pas à consulter.",
    faq: [
      {
        q: "Une anomalie sur ma prise de sang est-elle forcément grave ?",
        a: "Non. Beaucoup d'anomalies sont bénignes ou transitoires, comme une anémie par carence en fer. L'hématologue analyse l'ensemble du bilan et votre contexte pour distinguer ce qui nécessite des examens complémentaires de ce qui est sans gravité.",
      },
      {
        q: "Comment se déroule la première consultation ?",
        a: "L'hématologue reprend votre histoire médicale, examine vos résultats et vous examine. Il peut demander des analyses complémentaires pour préciser le diagnostic. Apporter vos bilans sanguins récents et anciens l'aide à suivre l'évolution dans le temps.",
      },
    ],
    shortAnswerAr: "استشر طبيب أمراض الدم عند اكتشاف اضطرابات في الدم عبر تحليل: فقر الدم، مستويات غير طبيعية للكريات أو الصفيحات، اضطرابات التخثّر، أو عقد لمفاوية متورّمة مستمرة. بصفته اختصاصي الدم والنخاع العظمي، يعمّق دراسة النتائج ويحدّد التشخيص وينظّم المتابعة المناسبة.",
    reasonsAr: [
      "فقر دم مستمر أو غير مبرر",
      "اضطرابات في الكريات أو الصفيحات في تحليل الدم",
      "عقد لمفاوية متورّمة تستمر دون عدوى واضحة",
      "ميل غير طبيعي للنزيف أو ظهور كدمات",
      "متابعة مرض دموي معروف (فقر الدم المنجلي، الثلاسيميا)",
      "تقييم تعب شديد مصحوب باضطرابات دموية",
    ],
    redFlagsAr: [
      "نزيف غزير أو تلقائي، كدمات متعدّدة غير مبرّرة",
      "حمى مستمرة مع تعرّق ليلي وفقدان وزن",
      "عقد لمفاوية صلبة تكبر بسرعة",
    ],
    whenToConsultAr: "احجز موعداً مع طبيب أمراض الدم، غالباً بتوجيه من طبيبك، عندما يكشف تحليل دم عن اضطرابات تحتاج إلى تعمّق أو عندما يستوجب مرض دموي متابعة. أحضِر جميع تحاليلك، بما فيها القديمة، لمقارنة التطوّر. وفي حالة نزيف غزير أو حمى مستمرة مع فقدان وزن أو عقد لمفاوية تكبر بسرعة، لا تتأخّر في الاستشارة.",
    faqAr: [
      {
        q: "هل يعني اضطراب في تحليل دمي بالضرورة أنه خطير؟",
        a: "لا. كثير من الاضطرابات حميدة أو عابرة، مثل فقر الدم الناتج عن نقص الحديد. يحلّل طبيب أمراض الدم التحليل كاملاً وسياقك للتمييز بين ما يحتاج إلى فحوصات إضافية وما هو غير خطير.",
      },
      {
        q: "كيف تجري الاستشارة الأولى؟",
        a: "يراجع طبيب أمراض الدم تاريخك الطبي ويفحص نتائجك ويفحصك سريرياً. وقد يطلب تحاليل إضافية لتحديد التشخيص. إحضار تحاليل الدم الحديثة والقديمة يساعده على متابعة التطوّر عبر الزمن.",
      },
    ],
  },
  {
    specialty: "maladies-infectieuses",
    relatedSlugs: ["hepatite-virale", "covid-19", "brucellose", "diarrhee-du-voyageur"],
    shortAnswer: "Consultez un infectiologue pour une fièvre qui persiste, une infection difficile à traiter, un dépistage (VIH, hépatites, IST) ou des conseils avant ou après un voyage. Spécialiste des infections, il identifie le microbe en cause, oriente les examens et adapte la prise en charge, dans un cadre confidentiel et sans jugement.",
    reasons: [
      "Fièvre qui persiste ou revient sans cause identifiée",
      "Infection qui ne guérit pas ou récidive malgré les traitements",
      "Dépistage et suivi VIH, hépatites virales ou IST",
      "Conseils et vaccins avant un voyage à l'étranger",
      "Symptômes au retour d'un voyage (fièvre, diarrhée)",
      "Contact avec une maladie contagieuse ou après une exposition",
    ],
    redFlags: [
      "Fièvre élevée avec raideur de la nuque, confusion ou taches sur la peau",
      "Fièvre au retour d'une zone à risque (paludisme possible)",
      "Difficulté à respirer ou état général qui se dégrade vite",
    ],
    whenToConsult: "Prenez rendez-vous avec un infectiologue quand une fièvre ou une infection se prolonge, résiste aux traitements, ou avant un voyage nécessitant vaccins et conseils. Le dépistage du VIH, des hépatites ou des IST est confidentiel et sans jugement : mieux vaut consulter tôt. En cas de fièvre avec raideur de nuque, confusion ou fièvre au retour d'une zone à risque, rendez-vous sans délai aux urgences.",
    faq: [
      {
        q: "Le dépistage d'une IST ou du VIH est-il confidentiel ?",
        a: "Oui, totalement. La consultation et les résultats sont couverts par le secret médical. L'infectiologue vous informe sans jugement, vous accompagne dans la démarche et vous oriente vers le suivi ou le traitement adapté si besoin.",
      },
      {
        q: "Quand consulter avant un voyage ?",
        a: "Idéalement quatre à six semaines avant le départ, car certains vaccins demandent plusieurs doses ou un délai pour être efficaces. L'infectiologue adapte les conseils et vaccins à votre destination, la durée du séjour et votre état de santé.",
      },
    ],
    shortAnswerAr: "استشر طبيب الأمراض المعدية عند حمى مستمرة، أو عدوى يصعب علاجها، أو للكشف (فيروس نقص المناعة، التهاب الكبد، الأمراض المنقولة جنسياً)، أو لنصائح قبل السفر أو بعده. بصفته اختصاصي العدوى، يحدّد الجرثوم المسبّب ويوجّه الفحوصات ويكيّف التكفّل، في إطار سري ودون حكم.",
    reasonsAr: [
      "حمى تستمر أو تعود دون سبب محدّد",
      "عدوى لا تُشفى أو تتكرّر رغم العلاجات",
      "الكشف والمتابعة لفيروس نقص المناعة أو التهاب الكبد الفيروسي أو الأمراض المنقولة جنسياً",
      "نصائح ولقاحات قبل السفر إلى الخارج",
      "أعراض عند العودة من سفر (حمى، إسهال)",
      "التماس مع مرض معدٍ أو بعد التعرّض له",
    ],
    redFlagsAr: [
      "حمى مرتفعة مع تيبّس في الرقبة أو تشوّش أو بقع على الجلد",
      "حمى عند العودة من منطقة عالية الخطورة (احتمال الملاريا)",
      "صعوبة في التنفّس أو تدهور سريع للحالة العامة",
    ],
    whenToConsultAr: "احجز موعداً مع طبيب الأمراض المعدية عندما تطول حمى أو عدوى، أو تقاوم العلاجات، أو قبل سفر يستلزم لقاحات ونصائح. الكشف عن فيروس نقص المناعة أو التهاب الكبد أو الأمراض المنقولة جنسياً سري ودون حكم: فالأفضل الاستشارة مبكراً. وفي حالة حمى مع تيبّس الرقبة أو تشوّش، أو حمى عند العودة من منطقة خطرة، توجّه فوراً إلى المستعجلات.",
    faqAr: [
      {
        q: "هل الكشف عن مرض منقول جنسياً أو فيروس نقص المناعة سري؟",
        a: "نعم، تماماً. الاستشارة والنتائج مشمولة بالسر الطبي. يعلمك طبيب الأمراض المعدية دون حكم، ويرافقك في المسعى، ويوجّهك نحو المتابعة أو العلاج المناسب عند الحاجة.",
      },
      {
        q: "متى تجب الاستشارة قبل السفر؟",
        a: "من الأفضل قبل المغادرة بأربعة إلى ستة أسابيع، لأن بعض اللقاحات تتطلّب عدة جرعات أو مهلة لتصبح فعّالة. يكيّف طبيب الأمراض المعدية النصائح واللقاحات حسب وجهتك ومدة الإقامة وحالتك الصحية.",
      },
    ],
  },
  {
    specialty: "orthodontie",
    relatedSlugs: ["dents-mal-alignees", "bruxisme"],
    shortAnswer:
      "Consultez un orthodontiste si vos dents ou celles de votre enfant sont mal alignées, se chevauchent ou s'écartent, si vous avez un décalage des mâchoires, une gêne pour mordre ou mastiquer, ou pour évaluer la pose d'un appareil dentaire. Un bilan précoce chez l'enfant permet d'anticiper le meilleur moment de traitement.",
    reasons: [
      "Dents qui se chevauchent, mal positionnées ou trop espacées",
      "Décalage entre les mâchoires du haut et du bas (menton en avant ou en retrait)",
      "Bilan orthodontique de l'enfant vers 7-8 ans pour anticiper un traitement",
      "Gêne pour fermer la bouche, mordre ou mastiquer correctement",
      "Souhait d'aligner les dents à l'âge adulte (appareil discret, gouttières)",
      "Suivi ou pose d'un appareil dentaire et contrôles réguliers",
    ],
    redFlags: [
      "Douleur ou blocage soudain de la mâchoire empêchant d'ouvrir ou fermer la bouche",
      "Traumatisme dentaire avec dent déplacée ou expulsée après un choc",
      "Gonflement du visage avec fièvre autour d'une dent ou d'un appareil",
    ],
    whenToConsult:
      "Prenez rendez-vous chez l'orthodontiste dès que vous remarquez un chevauchement, un espacement ou un décalage des mâchoires, sans attendre. Chez l'enfant, un premier bilan vers 7-8 ans est conseillé même sans gêne visible, car certaines corrections sont plus simples pendant la croissance. Chez l'adulte, un alignement reste possible à tout âge : une consultation permet d'évaluer les options et de vérifier au préalable la santé des gencives et des dents.",
    faq: [
      {
        q: "À quel âge emmener son enfant chez l'orthodontiste ?",
        a: "Un premier bilan est généralement conseillé vers 7-8 ans, quand les premières dents définitives apparaissent. Cela permet de repérer tôt un décalage des mâchoires et de choisir le meilleur moment pour un éventuel traitement. Seul l'orthodontiste peut décider s'il faut agir tout de suite ou attendre.",
      },
      {
        q: "Peut-on aligner ses dents à l'âge adulte ?",
        a: "Oui, l'alignement des dents est possible à tout âge tant que les gencives et l'os sont en bonne santé. Plusieurs solutions existent, dont des appareils discrets. Une consultation permet d'évaluer votre situation et de vous orienter vers l'option la plus adaptée.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب تقويم الأسنان إذا كانت أسنانك أو أسنان طفلك غير منتظمة أو متراكبة أو متباعدة، أو إذا كان هناك اختلاف في إطباق الفكين، أو صعوبة في العض والمضغ، أو لتقييم تركيب جهاز تقويم. الفحص المبكر لدى الطفل يساعد على تحديد أنسب وقت للعلاج.",
    reasonsAr: [
      "أسنان متراكبة أو غير منتظمة أو متباعدة أكثر من اللازم",
      "اختلاف بين الفك العلوي والفك السفلي (تقدّم الذقن أو تراجعه)",
      "فحص تقويمي للطفل حوالي سن 7-8 سنوات لتوقّع الحاجة إلى علاج",
      "صعوبة في إغلاق الفم أو العض أو المضغ بشكل صحيح",
      "الرغبة في تنظيم الأسنان في سن البلوغ (جهاز خفي، قوالب شفافة)",
      "متابعة أو تركيب جهاز تقويم والمراقبة المنتظمة",
    ],
    redFlagsAr: [
      "ألم أو انغلاق مفاجئ في الفك يمنع فتح الفم أو إغلاقه",
      "رضّة على الأسنان مع إزاحة سن أو سقوطه بعد صدمة",
      "تورّم في الوجه مع حمّى حول سن أو جهاز تقويم",
    ],
    whenToConsultAr:
      "احجز موعداً لدى طبيب تقويم الأسنان بمجرد ملاحظة تراكب أو تباعد في الأسنان أو اختلاف في الفكين، دون انتظار. عند الطفل، يُنصح بفحص أول حوالي سن 7-8 سنوات حتى بدون إزعاج ظاهر، لأن بعض التصحيحات تكون أسهل أثناء النمو. أما البالغ فيمكنه تنظيم أسنانه في أي عمر: تتيح الاستشارة تقييم الخيارات والتأكد مسبقاً من سلامة اللثة والأسنان.",
    faqAr: [
      {
        q: "في أي سن يُصطحب الطفل إلى طبيب تقويم الأسنان؟",
        a: "يُنصح عادة بفحص أول حوالي سن 7-8 سنوات، عند ظهور الأسنان الدائمة الأولى. هذا يسمح بالكشف المبكر عن اختلاف في الفكين واختيار أنسب وقت لعلاج محتمل. وحده طبيب التقويم يقرر ما إذا كان يجب التدخل فوراً أو الانتظار.",
      },
      {
        q: "هل يمكن تنظيم الأسنان في سن البلوغ؟",
        a: "نعم، تنظيم الأسنان ممكن في أي عمر ما دامت اللثة والعظم في حالة جيدة. توجد عدة حلول من بينها أجهزة خفية. تتيح الاستشارة تقييم حالتك وتوجيهك نحو الخيار الأنسب.",
      },
    ],
  },
  {
    specialty: "kinesitherapie",
    relatedSlugs: ["douleur-au-genou", "douleur-a-l-epaule", "hernie-discale", "mal-de-dos"],
    shortAnswer:
      "Consultez un kinésithérapeute, généralement sur prescription médicale, pour rééduquer une articulation ou un muscle après une blessure, une opération ou une entorse, soulager des douleurs du dos, du cou ou des articulations, retrouver de la mobilité et reprendre vos activités. Le kinésithérapeute accompagne la récupération mais n'établit pas de diagnostic médical.",
    reasons: [
      "Rééducation après une entorse, une fracture ou une opération",
      "Douleurs persistantes du dos, du cou ou des épaules",
      "Récupération de la mobilité et de la force après une blessure",
      "Tendinite, raideur articulaire ou suites d'un traumatisme sportif",
      "Rééducation respiratoire ou après un alitement prolongé",
      "Prévention des chutes et maintien de l'autonomie chez la personne âgée",
    ],
    redFlags: [
      "Douleur intense apparue brutalement avec impossibilité de bouger un membre",
      "Perte de sensibilité, faiblesse marquée ou perte de force d'un membre",
      "Fièvre, gonflement chaud et rouge d'une articulation",
    ],
    whenToConsult:
      "La kinésithérapie se fait le plus souvent sur prescription d'un médecin, qui pose le diagnostic et fixe les objectifs. Prenez rendez-vous une fois la prescription obtenue, sans trop tarder après une blessure ou une opération : une rééducation précoce favorise une meilleure récupération. Pour des douleurs chroniques du dos ou des articulations, parlez-en d'abord à votre médecin, qui vous orientera si besoin vers un kinésithérapeute.",
    faq: [
      {
        q: "Faut-il une ordonnance pour voir un kinésithérapeute ?",
        a: "Dans la plupart des cas, la kinésithérapie se fait sur prescription d'un médecin, qui définit le motif et le nombre de séances. C'est aussi utile pour le remboursement. Votre médecin traitant ou un spécialiste peut établir cette prescription après avoir examiné votre situation.",
      },
      {
        q: "Le kinésithérapeute peut-il poser un diagnostic ?",
        a: "Non, le kinésithérapeute est un professionnel paramédical : il ne pose pas de diagnostic médical et ne prescrit pas de médicaments. Il évalue vos capacités de mouvement et conduit la rééducation dans le cadre fixé par le médecin. Toute douleur nouvelle ou inhabituelle doit être signalée au médecin.",
      },
    ],
    shortAnswerAr:
      "استشر أخصائي العلاج الطبيعي (الترويض الطبي)، غالباً بوصفة طبية، لإعادة تأهيل مفصل أو عضلة بعد إصابة أو عملية أو التواء، وتخفيف آلام الظهر أو الرقبة أو المفاصل، واستعادة الحركة والعودة إلى نشاطك. يرافق أخصائي العلاج الطبيعي عملية التعافي لكنه لا يضع تشخيصاً طبياً.",
    reasonsAr: [
      "إعادة التأهيل بعد التواء أو كسر أو عملية جراحية",
      "آلام مستمرة في الظهر أو الرقبة أو الكتفين",
      "استعادة الحركة والقوة بعد إصابة",
      "التهاب الأوتار أو تصلّب المفاصل أو آثار إصابة رياضية",
      "إعادة تأهيل تنفسي أو بعد ملازمة الفراش لفترة طويلة",
      "الوقاية من السقوط والحفاظ على استقلالية المسنّ",
    ],
    redFlagsAr: [
      "ألم شديد ظهر فجأة مع عجز عن تحريك أحد الأطراف",
      "فقدان الإحساس أو ضعف واضح أو فقدان القوة في أحد الأطراف",
      "حمّى وتورّم حار وأحمر في أحد المفاصل",
    ],
    whenToConsultAr:
      "يتم العلاج الطبيعي في أغلب الأحيان بوصفة من طبيب يضع التشخيص ويحدد الأهداف. احجز موعداً بمجرد الحصول على الوصفة، دون تأخير كبير بعد إصابة أو عملية، لأن إعادة التأهيل المبكرة تساعد على تعافٍ أفضل. أما بالنسبة لآلام الظهر أو المفاصل المزمنة، تحدّث أولاً مع طبيبك الذي سيوجّهك عند الحاجة إلى أخصائي العلاج الطبيعي.",
    faqAr: [
      {
        q: "هل يلزم وصفة طبية لزيارة أخصائي العلاج الطبيعي؟",
        a: "في معظم الحالات يتم العلاج الطبيعي بوصفة من طبيب يحدد السبب وعدد الحصص، وهو مفيد أيضاً للتعويض. يمكن لطبيبك المعالج أو طبيب مختص تحرير هذه الوصفة بعد فحص حالتك.",
      },
      {
        q: "هل يمكن لأخصائي العلاج الطبيعي وضع تشخيص؟",
        a: "لا، أخصائي العلاج الطبيعي مهني شبه طبي: لا يضع تشخيصاً طبياً ولا يصف أدوية. يقيّم قدراتك الحركية ويقود إعادة التأهيل ضمن الإطار الذي حدده الطبيب. أي ألم جديد أو غير معتاد يجب إبلاغ الطبيب به.",
      },
    ],
  },
  {
    specialty: "medecine-physique-et-readaptation-fonctionnelle",
    relatedSlugs: ["avc", "hernie-discale", "mal-de-dos"],
    shortAnswer:
      "Consultez un médecin de médecine physique et de réadaptation (MPR) pour organiser la rééducation et retrouver de l'autonomie après un AVC, un traumatisme, une opération ou face à un handicap. Ce spécialiste coordonne le parcours de récupération fonctionnelle, évalue vos capacités et vous accompagne dans la reprise des gestes du quotidien.",
    reasons: [
      "Rééducation et récupération de l'autonomie après un AVC",
      "Suites d'un traumatisme grave, d'un accident ou d'une opération lourde",
      "Handicap moteur nécessitant un programme de réadaptation",
      "Douleurs chroniques et limitations fonctionnelles persistantes",
      "Prise en charge d'un appareillage, d'une orthèse ou d'une prothèse",
      "Maladies neurologiques évolutives avec perte progressive de mobilité",
    ],
    redFlags: [
      "Apparition soudaine d'une faiblesse d'un côté du corps ou de troubles de la parole",
      "Perte brutale de la sensibilité, de la marche ou du contrôle des sphincters",
      "Fièvre et douleur intense sur une zone opérée ou appareillée",
    ],
    whenToConsult:
      "La consultation en MPR intervient le plus souvent sur adressage d'un médecin ou d'un hôpital, après un événement qui a réduit votre autonomie (AVC, accident, chirurgie). Prenez rendez-vous dès que la phase aiguë est stabilisée, car une réadaptation précoce et coordonnée améliore la récupération. Pour un handicap installé ou des limitations chroniques, ce spécialiste peut être consulté pour organiser un programme adapté et un suivi dans la durée.",
    faq: [
      {
        q: "Quelle différence entre médecin de réadaptation et kinésithérapeute ?",
        a: "Le médecin de médecine physique et de réadaptation est un médecin qui évalue vos capacités, pose le cadre et coordonne l'ensemble de la rééducation. Le kinésithérapeute est un professionnel paramédical qui réalise les séances de rééducation. Les deux travaillent souvent ensemble dans un même parcours de soins.",
      },
      {
        q: "Quand consulter après un AVC ?",
        a: "La réadaptation est envisagée dès que l'état est stabilisé, souvent pendant l'hospitalisation puis en suivi. Plus la prise en charge est précoce et coordonnée, meilleures sont les chances de récupérer de l'autonomie. Le médecin qui vous suit vous orientera vers le spécialiste de réadaptation au bon moment.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب الطب الفيزيائي وإعادة التأهيل الوظيفي لتنظيم إعادة التأهيل واستعادة الاستقلالية بعد جلطة دماغية أو رضّة أو عملية أو في حالة إعاقة. ينسّق هذا المختص مسار التعافي الوظيفي، ويقيّم قدراتك، ويرافقك في استعادة حركات الحياة اليومية.",
    reasonsAr: [
      "إعادة التأهيل واستعادة الاستقلالية بعد جلطة دماغية",
      "آثار رضّة خطيرة أو حادث أو عملية جراحية كبيرة",
      "إعاقة حركية تستلزم برنامج إعادة تأهيل",
      "آلام مزمنة ومحدوديات وظيفية مستمرة",
      "التكفّل بجهاز مساعد أو دعامة أو طرف اصطناعي",
      "أمراض عصبية تطوّرية مع فقدان تدريجي للحركة",
    ],
    redFlagsAr: [
      "ظهور مفاجئ لضعف في أحد جانبي الجسم أو اضطراب في النطق",
      "فقدان مفاجئ للإحساس أو للمشي أو للتحكم في المصرّات",
      "حمّى وألم شديد في منطقة خضعت لعملية أو مركّب بها جهاز",
    ],
    whenToConsultAr:
      "تتم استشارة طبيب إعادة التأهيل في أغلب الأحيان بتوجيه من طبيب أو مستشفى، بعد حدث قلّص استقلاليتك (جلطة دماغية، حادث، جراحة). احجز موعداً بمجرد استقرار المرحلة الحادة، لأن إعادة التأهيل المبكرة والمنسّقة تحسّن التعافي. أما في حالة إعاقة مستقرة أو محدوديات مزمنة، فيمكن استشارة هذا المختص لتنظيم برنامج ملائم ومتابعة على المدى الطويل.",
    faqAr: [
      {
        q: "ما الفرق بين طبيب إعادة التأهيل وأخصائي العلاج الطبيعي؟",
        a: "طبيب الطب الفيزيائي وإعادة التأهيل هو طبيب يقيّم قدراتك ويضع الإطار وينسّق مجمل إعادة التأهيل. أما أخصائي العلاج الطبيعي فهو مهني شبه طبي ينجز حصص إعادة التأهيل. وغالباً ما يعملان معاً ضمن مسار علاجي واحد.",
      },
      {
        q: "متى تجب الاستشارة بعد جلطة دماغية؟",
        a: "يُنظر في إعادة التأهيل بمجرد استقرار الحالة، غالباً أثناء الاستشفاء ثم في المتابعة. كلما كان التكفّل مبكراً ومنسّقاً، تحسّنت فرص استعادة الاستقلالية. الطبيب الذي يتابعك سيوجّهك إلى مختص إعادة التأهيل في الوقت المناسب.",
      },
    ],
  },
  {
    specialty: "neurochirurgie",
    relatedSlugs: ["hernie-discale", "sciatique", "mal-de-tete"],
    shortAnswer:
      "Le neurochirurgien est consulté sur adressage spécialisé, quand un problème du cerveau, de la moelle ou de la colonne vertébrale peut nécessiter une opération : hernie discale résistante au traitement, tumeur, compression d'un nerf. On y est généralement orienté par un médecin après des examens d'imagerie ; ce n'est pas un premier recours.",
    reasons: [
      "Hernie discale invalidante ne répondant pas au traitement médical",
      "Compression de la moelle ou d'un nerf confirmée par imagerie",
      "Tumeur du cerveau, de la moelle ou de la colonne vertébrale",
      "Sciatique sévère et persistante avec retentissement important",
      "Suites d'un traumatisme crânien ou vertébral nécessitant un avis chirurgical",
      "Névralgies rebelles ou malformations vasculaires cérébrales",
    ],
    redFlags: [
      "Perte de force ou paralysie d'un membre s'installant rapidement",
      "Perte de contrôle des urines ou des selles avec engourdissement du périnée",
      "Mal de tête brutal et intense inhabituel, avec vomissements ou troubles de la conscience",
    ],
    whenToConsult:
      "On consulte un neurochirurgien après avoir été adressé par un médecin (généraliste, neurologue, rhumatologue) et réalisé des examens d'imagerie. Prenez le rendez-vous dès que ce spécialiste vous est recommandé, surtout si la douleur ou la gêne s'aggrave malgré le traitement. Devant des signes d'alerte comme une paralysie qui progresse ou une perte de contrôle des sphincters, il s'agit d'une urgence : rendez-vous immédiatement aux urgences.",
    faq: [
      {
        q: "Une hernie discale doit-elle toujours être opérée ?",
        a: "Non. La plupart des hernies discales s'améliorent avec un traitement médical et de la rééducation. La chirurgie est envisagée seulement dans certains cas, notamment en cas d'échec du traitement ou de signes de compression nerveuse. Seul le spécialiste, après imagerie, peut poser cette indication.",
      },
      {
        q: "Comment obtient-on un rendez-vous en neurochirurgie ?",
        a: "Le plus souvent, on est orienté par son médecin ou un spécialiste après des examens comme une IRM. Ce parcours permet d'arriver avec les bons documents et un dossier complet. La neurochirurgie n'est généralement pas un premier recours pour une douleur récente.",
      },
    ],
    shortAnswerAr:
      "تتم استشارة جرّاح الأعصاب بتوجيه مختص، عندما تستوجب مشكلة في الدماغ أو النخاع أو العمود الفقري تدخلاً جراحياً محتملاً: انزلاق غضروفي مقاوم للعلاج، ورم، انضغاط عصب. يُوجَّه المريض عادة من قبل طبيب بعد فحوص تصوير؛ وهو ليس مرجعاً أولياً.",
    reasonsAr: [
      "انزلاق غضروفي معطّل لا يستجيب للعلاج الطبي",
      "انضغاط النخاع أو عصب مؤكَّد بالتصوير",
      "ورم في الدماغ أو النخاع أو العمود الفقري",
      "عرق النسا الشديد والمستمر مع تأثير كبير",
      "آثار رضّة في الجمجمة أو العمود الفقري تستلزم رأياً جراحياً",
      "آلام عصبية مستعصية أو تشوهات وعائية دماغية",
    ],
    redFlagsAr: [
      "فقدان القوة أو شلل في أحد الأطراف يتفاقم بسرعة",
      "فقدان التحكم في البول أو البراز مع تنميل في منطقة العجان",
      "صداع مفاجئ وشديد غير معتاد، مع قيء أو اضطراب في الوعي",
    ],
    whenToConsultAr:
      "تتم استشارة جرّاح الأعصاب بعد توجيه من طبيب (عام، طبيب أعصاب، طبيب روماتيزم) وإجراء فحوص تصوير. احجز الموعد بمجرد أن يُنصح لك بهذا المختص، خاصة إذا تفاقم الألم أو الإزعاج رغم العلاج. وأمام علامات إنذار مثل شلل يتقدّم أو فقدان التحكم في المصرّات، فالأمر يشكّل حالة طارئة: توجّه فوراً إلى المستعجلات.",
    faqAr: [
      {
        q: "هل يجب دائماً إجراء عملية للانزلاق الغضروفي؟",
        a: "لا. معظم حالات الانزلاق الغضروفي تتحسّن بالعلاج الطبي وإعادة التأهيل. لا يُنظر في الجراحة إلا في بعض الحالات، خاصة عند فشل العلاج أو وجود علامات انضغاط عصبي. وحده المختص، بعد التصوير، يمكنه تحديد هذه الحاجة.",
      },
      {
        q: "كيف يُحصل على موعد في جراحة الأعصاب؟",
        a: "غالباً ما يتم التوجيه من قبل الطبيب أو مختص بعد فحوص مثل الرنين المغناطيسي. يتيح هذا المسار الحضور بالوثائق المناسبة وملف كامل. وجراحة الأعصاب ليست عادة مرجعاً أولياً لألم حديث.",
      },
    ],
  },
  {
    specialty: "chirurgie-generale",
    relatedSlugs: ["appendicite", "calculs-biliaires", "hernie-hiatale"],
    shortAnswer:
      "Le chirurgien généraliste est consulté, souvent sur adressage, pour évaluer et opérer des affections courantes de l'abdomen : hernie de l'aine, appendicite, calculs de la vésicule biliaire, kyste. Après un examen et parfois une imagerie, il détermine si une intervention est nécessaire et vous explique la marche à suivre.",
    reasons: [
      "Hernie de l'aine ou de l'abdomen gênante ou qui grossit",
      "Calculs de la vésicule biliaire responsables de douleurs répétées",
      "Avis chirurgical pour des douleurs abdominales persistantes",
      "Kyste, abcès ou lésion nécessitant un geste chirurgical",
      "Bilan avant une intervention programmée et suivi après opération",
      "Nodule ou masse à explorer sur adressage du médecin",
    ],
    redFlags: [
      "Douleur abdominale intense et brutale, surtout en bas à droite, avec fièvre",
      "Ventre dur, gonflé et très douloureux avec arrêt des gaz et vomissements",
      "Hernie soudain dure, douloureuse et impossible à réduire",
    ],
    whenToConsult:
      "On consulte le chirurgien généraliste le plus souvent après avoir été adressé par son médecin, pour une hernie, des calculs biliaires ou une masse à évaluer. Prenez rendez-vous sans tarder si une gêne s'installe ou s'aggrave, afin de discuter de l'intérêt d'une opération à froid. En revanche, une douleur abdominale violente et soudaine, avec fièvre ou vomissements, relève des urgences et non d'une consultation programmée.",
    faq: [
      {
        q: "Une hernie de l'aine doit-elle toujours être opérée ?",
        a: "La chirurgie est souvent proposée pour une hernie de l'aine, car elle ne disparaît pas seule et peut se compliquer. Le moment de l'opération dépend de la gêne et du risque. Seul le chirurgien, après examen, peut poser l'indication et vous en expliquer les modalités.",
      },
      {
        q: "Douleur au ventre à droite : faut-il aller aux urgences ?",
        a: "Une douleur intense et brutale en bas à droite du ventre, surtout avec fièvre, nausées ou ventre dur, peut évoquer une urgence comme une appendicite. Dans ce cas, rendez-vous aux urgences sans attendre. Pour une gêne modérée et durable, parlez-en à votre médecin qui vous orientera.",
      },
    ],
    shortAnswerAr:
      "تتم استشارة الجرّاح العام، غالباً بتوجيه، لتقييم وعلاج أمراض شائعة في البطن: فتق المغبن، التهاب الزائدة الدودية، حصى المرارة، الكيس. بعد الفحص وأحياناً التصوير، يحدد ما إذا كان التدخل ضرورياً ويشرح لك الخطوات اللازمة.",
    reasonsAr: [
      "فتق في المغبن أو البطن مزعج أو يكبر حجمه",
      "حصى في المرارة تسبب آلاماً متكررة",
      "رأي جراحي لآلام بطنية مستمرة",
      "كيس أو خرّاج أو آفة تستلزم تدخلاً جراحياً",
      "فحص قبل عملية مبرمجة ومتابعة بعد الجراحة",
      "عقدة أو كتلة يجب استكشافها بتوجيه من الطبيب",
    ],
    redFlagsAr: [
      "ألم بطني شديد ومفاجئ، خاصة أسفل اليمين، مصحوب بحمّى",
      "بطن صلب ومنتفخ ومؤلم جداً مع انقطاع الغازات وقيء",
      "فتق أصبح فجأة صلباً ومؤلماً ويتعذّر إرجاعه",
    ],
    whenToConsultAr:
      "تتم استشارة الجرّاح العام في أغلب الأحيان بعد التوجيه من قبل طبيبك، من أجل فتق أو حصى في المرارة أو كتلة يجب تقييمها. احجز موعداً دون تأخير إذا استقرّ إزعاج أو تفاقم، لمناقشة جدوى عملية غير مستعجلة. أما الألم البطني العنيف والمفاجئ، مع حمّى أو قيء، فيندرج ضمن المستعجلات وليس ضمن استشارة مبرمجة.",
    faqAr: [
      {
        q: "هل يجب دائماً إجراء عملية لفتق المغبن؟",
        a: "غالباً ما تُقترح الجراحة لفتق المغبن، لأنه لا يزول وحده وقد تحدث له مضاعفات. يتوقف توقيت العملية على درجة الإزعاج والخطر. وحده الجرّاح، بعد الفحص، يمكنه تحديد الحاجة وشرح تفاصيلها لك.",
      },
      {
        q: "ألم في البطن جهة اليمين: هل يجب التوجه إلى المستعجلات؟",
        a: "ألم شديد ومفاجئ أسفل يمين البطن، خاصة مع حمّى أو غثيان أو بطن صلب، قد يوحي بحالة طارئة مثل التهاب الزائدة الدودية. في هذه الحالة توجّه إلى المستعجلات دون انتظار. أما الإزعاج المعتدل والمستمر فتحدّث عنه مع طبيبك الذي سيوجّهك.",
      },
    ],
  },
  {
    specialty: "medecine-esthetique",
    relatedSlugs: ["chute-de-cheveux", "acne", "coup-de-soleil"],
    shortAnswer:
      "Consultez un médecin en médecine esthétique pour évaluer, dans un cadre médical, des demandes concernant l'aspect de la peau ou du visage : rides, taches, relâchement, cicatrices. Le rôle du médecin est d'abord d'écouter votre demande, d'écarter un problème de santé et de vous informer honnêtement des options, des limites et des risques, sans pression.",
    reasons: [
      "Rides ou signes de vieillissement du visage que vous souhaitez évaluer",
      "Taches, teint irrégulier ou relâchement de la peau",
      "Cicatrices ou marques que vous aimeriez atténuer",
      "Demande d'information sur un acte esthétique et ses alternatives",
      "Avis médical préalable pour vérifier l'absence de contre-indication",
      "Suivi après un acte esthétique déjà réalisé",
    ],
    redFlags: [
      "Rougeur, chaleur, douleur ou gonflement inhabituel après un acte",
      "Fièvre, écoulement ou plaie qui ne cicatrise pas après une intervention",
      "Modification rapide d'une tache ou d'un grain de beauté (à montrer à un dermatologue)",
    ],
    whenToConsult:
      "Prenez rendez-vous quand vous souhaitez un avis médical sur une demande esthétique, avant tout acte. Une bonne consultation commence par écarter un problème de santé sous-jacent et par une information claire sur les bénéfices attendus, les limites et les risques. Choisissez un médecin qualifié et méfiez-vous des offres trop insistantes ou commerciales : une décision esthétique se prend sans précipitation, après un vrai temps de réflexion.",
    faq: [
      {
        q: "Comment choisir un praticien en médecine esthétique ?",
        a: "Privilégiez un médecin dûment qualifié, qui prend le temps d'examiner votre demande, d'expliquer les options, les limites et les risques, et qui ne vous met pas la pression. Un devis clair et un délai de réflexion sont des signes de sérieux. En cas de doute, demandez un second avis.",
      },
      {
        q: "Un acte esthétique est-il sans risque ?",
        a: "Aucun acte médical n'est totalement sans risque. Un médecin sérieux vous informe des effets possibles et des précautions avant de proposer quoi que ce soit. C'est pourquoi une consultation préalable, honnête et sans pression, est indispensable pour décider en connaissance de cause.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب الطب التجميلي لتقييم طلبات تتعلق بمظهر البشرة أو الوجه ضمن إطار طبي: التجاعيد، البقع، الترهّل، الندوب. دور الطبيب أولاً هو الإنصات إلى طلبك، واستبعاد مشكلة صحية، وإطلاعك بصدق على الخيارات وحدودها ومخاطرها، دون أي ضغط.",
    reasonsAr: [
      "تجاعيد أو علامات شيخوخة الوجه ترغب في تقييمها",
      "بقع أو لون بشرة غير منتظم أو ترهّل في الجلد",
      "ندوب أو آثار ترغب في تخفيفها",
      "طلب معلومات حول إجراء تجميلي وبدائله",
      "رأي طبي مسبق للتأكد من عدم وجود موانع",
      "متابعة بعد إجراء تجميلي سبق القيام به",
    ],
    redFlagsAr: [
      "احمرار أو حرارة أو ألم أو تورّم غير معتاد بعد إجراء",
      "حمّى أو إفراز أو جرح لا يلتئم بعد تدخّل",
      "تغيّر سريع في بقعة أو شامة (يجب عرضها على طبيب جلد)",
    ],
    whenToConsultAr:
      "احجز موعداً عندما ترغب في رأي طبي حول طلب تجميلي، قبل أي إجراء. تبدأ الاستشارة الجيدة باستبعاد مشكلة صحية كامنة وبمعلومات واضحة عن الفوائد المرجوّة والحدود والمخاطر. اختر طبيباً مؤهّلاً واحذر من العروض المُلحّة أو التجارية: فالقرار التجميلي يُتّخذ دون تسرّع، بعد وقت حقيقي للتفكير.",
    faqAr: [
      {
        q: "كيف أختار ممارساً في الطب التجميلي؟",
        a: "فضّل طبيباً مؤهّلاً حسب الأصول، يأخذ وقته لفحص طلبك وشرح الخيارات وحدودها ومخاطرها، ولا يمارس عليك أي ضغط. الفاتورة التقديرية الواضحة ومهلة التفكير علامتان على الجدية. وعند الشك اطلب رأياً ثانياً.",
      },
      {
        q: "هل الإجراء التجميلي خالٍ من المخاطر؟",
        a: "لا يوجد إجراء طبي خالٍ تماماً من المخاطر. الطبيب الجادّ يطلعك على الآثار المحتملة والاحتياطات قبل اقتراح أي شيء. لذلك تبقى الاستشارة المسبقة، الصادقة ودون ضغط، ضرورية لاتخاذ قرار عن دراية.",
      },
    ],
  },
  {
    specialty: "podologie",
    relatedSlugs: ["diabete", "douleurs-articulaires"],
    shortAnswer:
      "Consultez un podologue pour les problèmes des pieds et des ongles : douleurs à la marche, cors et durillons, ongle incarné, déformations comme l'hallux valgus. Le suivi podologique est particulièrement important en cas de diabète, pour prévenir les complications du pied. Le podologue soigne, conseille et oriente vers un médecin si nécessaire.",
    reasons: [
      "Douleurs des pieds à la marche ou en position debout prolongée",
      "Cors, durillons ou callosités gênants",
      "Ongle incarné ou problèmes d'ongles récurrents",
      "Déformation du pied comme l'hallux valgus (oignon)",
      "Suivi préventif du pied chez la personne diabétique",
      "Besoin de semelles adaptées pour un déséquilibre à la marche",
    ],
    redFlags: [
      "Plaie du pied qui ne cicatrise pas, surtout en cas de diabète",
      "Pied rouge, chaud, gonflé et douloureux avec fièvre",
      "Perte de sensibilité, changement de couleur ou froideur d'un pied",
    ],
    whenToConsult:
      "Prenez rendez-vous chez le podologue dès que des douleurs des pieds gênent la marche, qu'un ongle s'incarne ou qu'une déformation s'installe. Si vous êtes diabétique, un suivi podologique régulier est recommandé même sans douleur, car la sensibilité des pieds peut être réduite. Devant une plaie qui ne guérit pas ou un pied rouge et chaud avec fièvre, consultez rapidement un médecin : cela peut nécessiter une prise en charge urgente.",
    faq: [
      {
        q: "Pourquoi le suivi des pieds est-il important en cas de diabète ?",
        a: "Le diabète peut diminuer la sensibilité des pieds et ralentir la cicatrisation. Une petite plaie peut alors passer inaperçue et se compliquer. Un suivi podologique régulier aide à repérer tôt les zones à risque. Toute plaie qui ne guérit pas doit être montrée rapidement à un professionnel de santé.",
      },
      {
        q: "Faut-il opérer un hallux valgus (oignon) ?",
        a: "Pas toujours. Le podologue peut proposer des mesures pour soulager la gêne, comme des conseils de chaussage ou des semelles. La chirurgie n'est envisagée que dans certains cas, sur avis médical. Une consultation permet d'évaluer votre situation et de vous orienter si besoin.",
      },
    ],
    shortAnswerAr:
      "استشر أخصائي تقويم الأقدام لمشاكل القدمين والأظافر: آلام عند المشي، مسامير اللحم والجُساءات، ظفر غاطس، تشوّهات مثل وكعة إبهام القدم. تكون المتابعة عند القدم مهمة بشكل خاص في حالة السكري، للوقاية من مضاعفات القدم. يعالج الأخصائي ويقدّم النصح ويوجّه إلى طبيب عند الحاجة.",
    reasonsAr: [
      "آلام في القدمين عند المشي أو الوقوف الطويل",
      "مسامير لحم أو جُساءات أو تصلّبات مزعجة",
      "ظفر غاطس أو مشاكل متكررة في الأظافر",
      "تشوّه في القدم مثل وكعة إبهام القدم",
      "متابعة وقائية للقدم لدى مريض السكري",
      "الحاجة إلى نعال ملائمة لاختلال في المشي",
    ],
    redFlagsAr: [
      "جرح في القدم لا يلتئم، خاصة في حالة السكري",
      "قدم حمراء وحارة ومنتفخة ومؤلمة مع حمّى",
      "فقدان الإحساس أو تغيّر اللون أو برودة في إحدى القدمين",
    ],
    whenToConsultAr:
      "احجز موعداً لدى أخصائي القدم بمجرد أن تعيق آلام القدمين المشي، أو عند غوص ظفر، أو استقرار تشوّه. إذا كنت مصاباً بالسكري، يُنصح بمتابعة منتظمة للقدم حتى دون ألم، لأن حسّ القدمين قد يكون منخفضاً. وأمام جرح لا يلتئم أو قدم حمراء وحارة مع حمّى، استشر طبيباً بسرعة: قد يستلزم الأمر تكفّلاً عاجلاً.",
    faqAr: [
      {
        q: "لماذا تُعدّ متابعة القدمين مهمة في حالة السكري؟",
        a: "قد يخفّض السكري حسّ القدمين ويبطّئ التئام الجروح. عندها قد يمرّ جرح صغير دون أن يُلاحَظ وتحدث له مضاعفات. تساعد المتابعة المنتظمة عند القدم على الكشف المبكر عن المناطق المعرّضة للخطر. وأي جرح لا يلتئم يجب عرضه بسرعة على مهني صحي.",
      },
      {
        q: "هل يجب إجراء عملية لوكعة إبهام القدم؟",
        a: "ليس دائماً. يمكن لأخصائي القدم اقتراح تدابير لتخفيف الإزعاج، مثل نصائح حول الحذاء أو النعال. ولا يُنظر في الجراحة إلا في بعض الحالات، بناءً على رأي طبي. تتيح الاستشارة تقييم حالتك وتوجيهك عند الحاجة.",
      },
    ],
  },
  {
    specialty: "orthophonie",
    relatedSlugs: ["autisme", "avc", "extinction-de-voix"],
    shortAnswer:
      "Consultez un orthophoniste, souvent sur prescription médicale, pour les troubles du langage, de la parole, de la voix, de la lecture ou de la déglutition, chez l'enfant comme chez l'adulte : retard de langage, difficultés d'apprentissage, bégaiement, ou rééducation après un AVC. L'orthophoniste évalue et rééduque la communication, mais ne pose pas de diagnostic médical.",
    reasons: [
      "Retard de langage ou de parole chez l'enfant",
      "Difficultés de lecture, d'écriture ou d'apprentissage scolaire",
      "Bégaiement ou trouble de l'articulation",
      "Rééducation du langage après un AVC ou un traumatisme cérébral",
      "Troubles de la voix ou extinction de voix qui se prolonge",
      "Difficultés à avaler (troubles de la déglutition)",
    ],
    redFlags: [
      "Perte soudaine de la parole ou difficulté brutale à parler (urgence, penser à l'AVC)",
      "Régression : un enfant qui perd des mots ou des compétences déjà acquises",
      "Fausses routes fréquentes en avalant, avec toux ou étouffement",
    ],
    whenToConsult:
      "La prise en charge orthophonique se fait le plus souvent sur prescription d'un médecin, après évaluation. Pour un enfant, n'attendez pas si le langage tarde à se développer ou si l'école signale des difficultés : une prise en charge précoce est plus efficace. Chez l'adulte, l'orthophonie intervient notamment après un AVC ou pour des troubles de la voix. En cas de perte soudaine de la parole, il s'agit d'une urgence : appelez les secours.",
    faq: [
      {
        q: "À partir de quand s'inquiéter d'un retard de langage chez l'enfant ?",
        a: "Chaque enfant évolue à son rythme, mais si le langage tarde nettement par rapport aux enfants du même âge, ou si l'entourage ou l'école s'inquiète, il vaut mieux en parler. Le médecin pourra évaluer la situation et orienter vers un orthophoniste. Une prise en charge précoce donne de meilleurs résultats.",
      },
      {
        q: "Faut-il une prescription pour consulter un orthophoniste ?",
        a: "Dans la plupart des cas, la rééducation orthophonique se fait sur prescription d'un médecin, qui oriente après un premier examen. C'est aussi utile pour la prise en charge. Votre médecin traitant, un pédiatre ou un spécialiste peut établir cette prescription.",
      },
    ],
    shortAnswerAr:
      "استشر أخصائي تقويم النطق (الأرطوفونيا)، غالباً بوصفة طبية، لاضطرابات اللغة والكلام والصوت والقراءة أو البلع، لدى الطفل والبالغ على السواء: تأخّر لغوي، صعوبات تعلّم، تلعثم، أو إعادة تأهيل بعد جلطة دماغية. يقيّم الأخصائي التواصل ويعيد تأهيله، لكنه لا يضع تشخيصاً طبياً.",
    reasonsAr: [
      "تأخّر في اللغة أو الكلام لدى الطفل",
      "صعوبات في القراءة أو الكتابة أو التعلّم المدرسي",
      "تلعثم أو اضطراب في نطق الحروف",
      "إعادة تأهيل اللغة بعد جلطة دماغية أو رضّة دماغية",
      "اضطرابات في الصوت أو فقدان صوت يطول أمده",
      "صعوبات في البلع (اضطرابات البلع)",
    ],
    redFlagsAr: [
      "فقدان مفاجئ للكلام أو صعوبة مفاجئة في النطق (حالة طارئة، فكّر في الجلطة الدماغية)",
      "تراجع: طفل يفقد كلمات أو مهارات سبق أن اكتسبها",
      "اختناقات متكررة أثناء البلع، مع سعال أو شرقة",
    ],
    whenToConsultAr:
      "يتم التكفّل الأرطوفوني في أغلب الأحيان بوصفة من طبيب، بعد التقييم. بالنسبة للطفل، لا تنتظر إذا تأخّر تطوّر اللغة أو أشارت المدرسة إلى صعوبات: فالتكفّل المبكر أكثر فعالية. أما لدى البالغ فيتدخّل تقويم النطق خصوصاً بعد جلطة دماغية أو لاضطرابات الصوت. وفي حالة فقدان مفاجئ للكلام، فالأمر طارئ: اتصل بالإسعاف.",
    faqAr: [
      {
        q: "متى نقلق من تأخّر اللغة لدى الطفل؟",
        a: "كل طفل يتطوّر بوتيرته الخاصة، لكن إذا تأخّرت اللغة بوضوح مقارنة بأطفال العمر نفسه، أو إذا قلق المحيط أو المدرسة، فمن الأفضل التحدّث في الأمر. يمكن للطبيب تقييم الوضع والتوجيه نحو أخصائي تقويم النطق. والتكفّل المبكر يعطي نتائج أفضل.",
      },
      {
        q: "هل يلزم وصفة لاستشارة أخصائي تقويم النطق؟",
        a: "في معظم الحالات تتم إعادة التأهيل الأرطوفوني بوصفة من طبيب يوجّه بعد فحص أولي، وهو مفيد أيضاً للتكفّل. يمكن لطبيبك المعالج أو طبيب الأطفال أو طبيب مختص تحرير هذه الوصفة.",
      },
    ],
  },
];
