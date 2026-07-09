// Couche de contenu en darija (arabe marocain) — capte les requêtes santé
// vernaculaires (registre dominant du mobile au Maroc) que le contenu FR/arabe
// standard ne couvre pas. Script arabe (lecture dominante). Chaque entrée reste
// définitionnelle et non-prescriptive (YMYL) : elle explique le terme et oriente
// vers un professionnel / une recherche, sans donner d'avis médical.
//
// `href` pointe vers une page interne EXISTANTE (slug de spécialité réel, cf.
// prisma specialty.slug) pour le maillage — vérifié pour éviter les liens morts.

export type DarijaTerm = {
  /** Terme(s) en darija (script arabe), le plus courant en premier. */
  darija: string;
  /** Variantes / synonymes darija (pour la correspondance de requête). */
  variantes?: string[];
  /** Équivalent en français. */
  fr: string;
  /** Équivalent en arabe standard (MSA). */
  msa: string;
  /** Explication courte en darija (définitionnelle, non-prescriptive). */
  explication: string;
  /** Lien interne de maillage (spécialité, recherche, Q/R). */
  href: string;
};

export type DarijaCategory = {
  slug: string;
  /** Titre de la catégorie en darija. */
  titre: string;
  terms: DarijaTerm[];
};

export type DarijaFaq = {
  q: string;
  a: string;
  href?: string;
  hrefLabel?: string;
};

// ── Spécialistes : « chnou كيدير هاد الطبيب » (à quoi sert ce médecin) ──────────
const SPECIALISTES: DarijaTerm[] = [
  {
    darija: "طبيب عام",
    variantes: ["الطبيب العام", "دكتور عام"],
    fr: "Médecin généraliste",
    msa: "طبيب عام",
    explication: "أول طبيب اللي كتمشي ليه، كيشخّص وكيوجّهك للمختص إلا خاص.",
    href: "/specialites/medecine-generale",
  },
  {
    darija: "طبيب القلب",
    variantes: ["دكتور القلب", "طبيب ديال القلب"],
    fr: "Cardiologue",
    msa: "طبيب القلب",
    explication: "كيتعامل مع القلب والضغط وشرايين الدم.",
    href: "/specialites/cardiologie",
  },
  {
    darija: "طبيب السنان",
    variantes: ["دكتور السنان", "طبيب الأسنان"],
    fr: "Dentiste / Chirurgien-dentiste",
    msa: "طبيب الأسنان",
    explication: "كيداوي السنان واللثة، وكيدير الحشو والقلع وتنظيف السنان.",
    href: "/specialites/chirurgie-dentaire",
  },
  {
    darija: "طبيب العينين",
    variantes: ["دكتور العينين", "طبيب العيون"],
    fr: "Ophtalmologue",
    msa: "طبيب العيون",
    explication: "كيتعامل مع مشاكل البصر والعينين وكيكتب النظّارات.",
    href: "/specialites/ophtalmologie",
  },
  {
    darija: "طبيب الجلد",
    variantes: ["دكتور البشرة", "طبيب البشرة"],
    fr: "Dermatologue",
    msa: "طبيب الجلد",
    explication: "كيداوي مشاكل الجلد: الحبوب، الحساسية، الفطريات وغيرها.",
    href: "/specialites/dermatologie",
  },
  {
    darija: "طبيب الدراري",
    variantes: ["دكتور الدراري", "طبيب الأطفال"],
    fr: "Pédiatre",
    msa: "طبيب الأطفال",
    explication: "الطبيب المختص فصحة الدراري الصغار من الازدياد حتى المراهقة.",
    href: "/specialites/pediatrie",
  },
  {
    darija: "طبيب النسا",
    variantes: ["دكتور النسا", "طبيب النساء والتوليد"],
    fr: "Gynécologue-obstétricien",
    msa: "طبيب النساء والتوليد",
    explication: "كيتعامل مع صحة المرا، الدورة، الحمل والولادة.",
    href: "/specialites/gyneco-obstetrique",
  },
  {
    darija: "طبيب العظام",
    variantes: ["دكتور العظام", "جراح العظام"],
    fr: "Orthopédiste / Traumatologue",
    msa: "طبيب جراحة العظام",
    explication: "كيتعامل مع العظام، المفاصل، الكسور والالتواءات.",
    href: "/specialites/traumatologie-orthopedie",
  },
  {
    darija: "طبيب الأنف والأذن والحنجرة",
    variantes: ["دكتور ORL", "طبيب الأذن"],
    fr: "ORL (oto-rhino-laryngologiste)",
    msa: "طبيب الأنف والأذن والحنجرة",
    explication: "كيتعامل مع الأذن، الأنف، الحلق ومشاكل السمع.",
    href: "/specialites/oto-rhino-laryngologie",
  },
  {
    darija: "الطبيب النفساني",
    variantes: ["طبيب العقل", "الطبيب النفسي"],
    fr: "Psychiatre",
    msa: "الطبيب النفسي",
    explication: "كيعاون فمشاكل نفسية بحال الاكتئاب، القلق، والنوم.",
    href: "/specialites/psychiatrie",
  },
  {
    darija: "طبيب المسالك البولية",
    variantes: ["طبيب البول", "دكتور البروستات"],
    fr: "Urologue",
    msa: "طبيب المسالك البولية",
    explication: "كيتعامل مع الكلاوي، المثانة، البروستات ومجاري البول.",
    href: "/specialites/urologie-et-chirurgie-urologique",
  },
  {
    darija: "طبيب المفاصل",
    variantes: ["طبيب الروماتيزم", "دكتور المفاصل"],
    fr: "Rhumatologue",
    msa: "طبيب الروماتيزم",
    explication: "كيداوي وجيعة المفاصل، العظام، والروماتيزم.",
    href: "/specialites/rhumatologie",
  },
  {
    darija: "طبيب الجهاز الهضمي",
    variantes: ["طبيب المعدة", "طبيب الكرش"],
    fr: "Gastro-entérologue",
    msa: "طبيب الجهاز الهضمي",
    explication: "كيتعامل مع المعدة، الأمعاء، الكبد ومشاكل الهضم.",
    href: "/specialites/gastro-enterologie",
  },
  {
    darija: "طبيب الرئة",
    variantes: ["طبيب الصدر", "طبيب التنفّس"],
    fr: "Pneumologue",
    msa: "طبيب الرئة والجهاز التنفسي",
    explication: "كيتعامل مع الرئة، الربو، والسعال المزمن ومشاكل التنفّس.",
    href: "/specialites/pneumo-phtisiologie",
  },
  {
    darija: "طبيب الكلاوي",
    variantes: ["دكتور الكلي"],
    fr: "Néphrologue",
    msa: "طبيب الكلى",
    explication: "كيتعامل مع أمراض الكلاوي وتصفية الدم (الديال).",
    href: "/specialites/nephrologie",
  },
  {
    darija: "أخصائي الترويض الطبي",
    variantes: ["الكيني", "فيزيو"],
    fr: "Kinésithérapeute",
    msa: "أخصائي العلاج الطبيعي",
    explication: "كيعاون على استرجاع الحركة بعد كسر، عملية ولا وجيعة فالمفاصل.",
    href: "/specialites/kinesitherapie",
  },
  {
    darija: "القابلة",
    variantes: ["الفراسة", "داية"],
    fr: "Sage-femme",
    msa: "القابلة",
    explication: "كتتبع الحمل، الولادة، وصحة المرا والمولود.",
    href: "/specialites/sage-femme",
  },
];

// ── Symptômes & maladies courantes : le mot de tous les jours ─────────────────
const SYMPTOMES: DarijaTerm[] = [
  {
    darija: "السكّر",
    variantes: ["مرض السكّر", "السكري"],
    fr: "Diabète",
    msa: "داء السكري",
    explication: "ارتفاع نسبة السكّر فالدم؛ كيتطلب متابعة منتظمة مع طبيب.",
    href: "/specialites/endocrinologie-et-maladies-metaboliques",
  },
  {
    darija: "الضغط",
    variantes: ["ضغط الدم", "التونسيون"],
    fr: "Hypertension artérielle",
    msa: "ارتفاع ضغط الدم",
    explication: "ارتفاع ضغط الدم فالشرايين؛ كيتراقب مع طبيب القلب أو العام.",
    href: "/specialites/cardiologie",
  },
  {
    darija: "الكوليسترول",
    variantes: ["الشحمة فالدم"],
    fr: "Cholestérol",
    msa: "الكوليسترول",
    explication: "ارتفاع الدهون فالدم؛ كيزيد خطر مشاكل القلب.",
    href: "/specialites/endocrinologie-et-maladies-metaboliques",
  },
  {
    darija: "بوحمرون",
    variantes: ["الحمرة"],
    fr: "Rougeole",
    msa: "الحصبة",
    explication: "مرض معدي كيبان بحبوب حمرا وسخانة، بزّاف عند الدراري.",
    href: "/specialites/pediatrie",
  },
  {
    darija: "بوصفير",
    variantes: ["الصفير"],
    fr: "Jaunisse / Hépatite",
    msa: "اليرقان / التهاب الكبد",
    explication: "اصفرار فالعينين والجلد، غالباً مرتبط بمشكل فالكبد.",
    href: "/specialites/gastro-enterologie",
  },
  {
    darija: "السخانة",
    variantes: ["الحمّى", "الحرارة"],
    fr: "Fièvre",
    msa: "الحُمّى",
    explication: "ارتفاع حرارة الجسم؛ علامة على أن الجسم كيحارب شي مرض.",
    href: "/specialites/medecine-generale",
  },
  {
    darija: "الكحّة",
    variantes: ["السعال"],
    fr: "Toux",
    msa: "السعال",
    explication: "إلا طالت الكحّة ولا جاتها بحال الصعوبة فالتنفّس، شوف طبيب.",
    href: "/specialites/pneumo-phtisiologie",
  },
  {
    darija: "الربو",
    variantes: ["ضيق التنفّس"],
    fr: "Asthme",
    msa: "الربو",
    explication: "ضيق فالتنفّس متكرر بسبب التهاب فالمجاري التنفّسية.",
    href: "/specialites/pneumo-phtisiologie",
  },
  {
    darija: "الزكام",
    variantes: ["الرواح", "الرشح"],
    fr: "Rhume",
    msa: "الزكام",
    explication: "التهاب خفيف فالأنف والحلق، غالباً كيدوز بوحدو.",
    href: "/specialites/medecine-generale",
  },
  {
    darija: "التهاب الحلق",
    variantes: ["وجيعة الحلاقم", "الأنجين"],
    fr: "Angine / Mal de gorge",
    msa: "التهاب الحلق",
    explication: "وجيعة فالحلق مع صعوبة فالبلع، بزّاف عند الدراري.",
    href: "/specialites/oto-rhino-laryngologie",
  },
  {
    darija: "وجيعة الكرش",
    variantes: ["وجيعة المعدة", "الحبطة"],
    fr: "Maux de ventre / d'estomac",
    msa: "ألم البطن / المعدة",
    explication: "وجيعة فالكرش لها أسباب بزّاف؛ إلا استمرّات خاصك طبيب.",
    href: "/specialites/gastro-enterologie",
  },
  {
    darija: "الحرقة",
    variantes: ["الحموضة", "حرقة المعدة"],
    fr: "Brûlures d'estomac / Reflux",
    msa: "حرقة المعدة",
    explication: "حس بالحرقة فالصدر بعد الماكلة، مرتبط بحموضة المعدة.",
    href: "/specialites/gastro-enterologie",
  },
  {
    darija: "وجيعة الراس",
    variantes: ["الصداع", "الشقيقة"],
    fr: "Maux de tête / Migraine",
    msa: "الصداع",
    explication: "إلا كانت وجيعة الراس قوية ولا متكررة، ينصح بزيارة طبيب.",
    href: "/specialites/neurologie",
  },
  {
    darija: "الحساسية",
    variantes: ["الأليرجي"],
    fr: "Allergie",
    msa: "الحساسية",
    explication: "ردّ فعل ديال الجسم على شي حاجة (غبرة، ماكلة، دوا…).",
    href: "/specialites/allergologie",
  },
  {
    darija: "فقر الدم",
    variantes: ["الأنيميا", "نقص الدم"],
    fr: "Anémie",
    msa: "فقر الدم",
    explication: "نقص فكريات الدم الحمرا؛ كيجيب التعب والشحوب.",
    href: "/specialites/hematologie",
  },
  {
    darija: "الغدة",
    variantes: ["الغدة الدرقية", "التيرويد"],
    fr: "Thyroïde (troubles)",
    msa: "الغدة الدرقية",
    explication: "خلل فالغدة كيأثّر على الوزن، الطاقة والمزاج.",
    href: "/specialites/endocrinologie-et-maladies-metaboliques",
  },
  {
    darija: "البواسير",
    fr: "Hémorroïdes",
    msa: "البواسير",
    explication: "انتفاخ فالأوردة ديال المخرج؛ كيتعامل معاه طبيب مختص.",
    href: "/specialites/gastro-enterologie",
  },
  {
    darija: "الاكتئاب",
    variantes: ["الديبريسيون", "القلق"],
    fr: "Dépression / Anxiété",
    msa: "الاكتئاب والقلق",
    explication: "حالة نفسية كتأثّر على المزاج والنوم؛ العلاج ممكن وضروري.",
    href: "/specialites/psychiatrie",
  },
];

// ── Examens & analyses : « شنو هاد الفحص » ────────────────────────────────────
const EXAMENS: DarijaTerm[] = [
  {
    darija: "تحاليل الدم",
    variantes: ["الأناليز", "تحليل الدم"],
    fr: "Analyses de sang",
    msa: "تحاليل الدم",
    explication: "فحوصات فالمختبر باش نعرفو السكّر، الدم، الكلي وغيرها.",
    href: "/laboratoires",
  },
  {
    darija: "الراديو",
    variantes: ["الأشعة", "صورة العظام"],
    fr: "Radiographie",
    msa: "التصوير بالأشعة",
    explication: "صورة بالأشعة كتبيّن العظام والرئة.",
    href: "/specialites/radiologie",
  },
  {
    darija: "الإيكو",
    variantes: ["الإيكوغرافي", "التصوير بالصدى"],
    fr: "Échographie",
    msa: "التصوير بالموجات فوق الصوتية",
    explication: "فحص بالموجات كيبيّن الأعضاء الداخلية والحمل.",
    href: "/specialites/radiologie",
  },
  {
    darija: "السكانير",
    variantes: ["السكانيرة"],
    fr: "Scanner (TDM)",
    msa: "التصوير المقطعي",
    explication: "تصوير دقيق للجسم بالأشعة باش نشوفو تفاصيل أكثر.",
    href: "/specialites/radio-diagnostic-et-imagerie-medicale",
  },
];

export const DARIJA_CATEGORIES: DarijaCategory[] = [
  { slug: "specialistes", titre: "شكون كيداوي شنو؟ (الأطباء المختصين)", terms: SPECIALISTES },
  { slug: "symptomes", titre: "الأمراض والأعراض بالدارجة", terms: SYMPTOMES },
  { slug: "examens", titre: "الفحوصات والتحاليل", terms: EXAMENS },
];

// ── FAQ darija : questions pratiques fréquentes (non-prescriptives) ───────────
export const DARIJA_FAQ: DarijaFaq[] = [
  {
    q: "شحال كيخلّص طبيب عام فالمغرب؟",
    a: "استشارة الطبيب العام غالباً ما بين 100 و250 درهم، حسب الطبيب والمدينة. الأسعار إرشادية — تأكّد ديما مع الطبيب قبل الموعد.",
    href: "/specialites/medecine-generale",
    hrefLabel: "لقا طبيب عام",
  },
  {
    q: "كيفاش ناخذ موعد مع طبيب عبر الإنترنت؟",
    a: "قلّب على الطبيب حسب التخصص والمدينة، اختار الطبيب اللي يناسبك، وحجز الموعد ديالك مباشرة عبر الموقع، بلاش.",
    href: "/praticiens",
    hrefLabel: "احجز موعد",
  },
  {
    q: "واش خاصني نجيب شي وثائق ملي نمشي للطبيب؟",
    a: "جيب بطاقة التعريف الوطنية، بطاقة AMO/CNSS إلا عندك تغطية، والتحاليل ولا الوصفات القدام باش يكون عند الطبيب صورة كاملة.",
    href: "/remboursement-amo-cnss",
    hrefLabel: "التغطية الصحية",
  },
  {
    q: "فوقاش خاصني نمشي للمستعجلات دغيا؟",
    a: "إلا كانت عندك وجيعة قوية فالصدر، صعوبة فالتنفّس، نزيف قوي، فقدان الوعي، ولا علامات شلل — ماتسناش، عيّط دغيا: SAMU 141، الوقاية المدنية 15، ولا 112 من أي هاتف.",
  },
  {
    q: "شكون كيجاوب على الأسئلة الطبية فالموقع؟",
    a: "غير الأطباء الموثّقين هوما اللي كيجاوبو على أسئلة المرضى — ماشي ذكاء اصطناعي. الأجوبة إعلامية وماكتعوّضش استشارة طبية.",
    href: "/questions",
    hrefLabel: "الأسئلة والأجوبة",
  },
  {
    q: "واش استعمال الموقع مجاني؟",
    a: "إيه، البحث على طبيب ومقارنة الأطباء وأخذ الموعد كلشي مجاني بالكامل بالنسبة للمرضى.",
    href: "/praticiens",
    hrefLabel: "ابدا البحث",
  },
];

export const DARIJA_TERM_COUNT = DARIJA_CATEGORIES.reduce((n, c) => n + c.terms.length, 0);
