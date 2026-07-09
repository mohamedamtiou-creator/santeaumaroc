import type { Locale } from "./i18n";

export type CityContent = {
  description: string;
  highlights: string[];
};

const CITY_CONTENT: Record<string, CityContent> = {
  casablanca: {
    description:
      "Casablanca concentre la plus grande offre de soins privés du Maroc. La capitale économique dispose d'un réseau dense de cliniques, de cabinets médicaux et de centres de diagnostic répartis dans ses quartiers — du Maârif au Gauthier, en passant par Ain Diab et l'Aïn Chock. Les spécialistes de toutes disciplines y sont représentés, avec des délais de rendez-vous généralement courts. Les assurés CNSS et AMO trouvent facilement des praticiens conventionnés. La téléconsultation est également bien développée pour les consultations de suivi.",
    highlights: [
      "Offre médicale la plus dense du pays, toutes spécialités confondues",
      "Praticiens conventionnés CNSS / AMO dans tous les quartiers",
      "Cliniques privées concentrées sur le Maârif, le Gauthier et Sidi Maarouf",
      "Délais de rendez-vous parmi les plus courts à l'échelle nationale",
    ],
  },

  rabat: {
    description:
      "Rabat, capitale administrative du Maroc, dispose d'une offre médicale solide ancrée autour des institutions publiques (CHU Ibn Sina) et d'un tissu libéral en développement. Les quartiers d'Agdal, Hassan et l'Océan regroupent l'essentiel des cabinets privés. La proximité de Salé élargit le bassin de soins pour les habitants de la région. Les professeurs hospitalo-universitaires accessibles en consultation libérale font de Rabat une destination médicale de référence pour des avis spécialisés.",
    highlights: [
      "CHU Ibn Sina — centre de référence régional pour les cas complexes",
      "Forte concentration de spécialistes dans les quartiers Agdal et Hassan",
      "Professeurs hospitalo-universitaires accessibles en consultation privée",
      "Bassin de soins élargi avec la ville voisine de Salé",
    ],
  },

  marrakech: {
    description:
      "Marrakech a connu un développement rapide de son offre médicale privée ces dernières années, portée par la croissance démographique et le tourisme médical. Les cliniques modernes et les cabinets spécialisés se concentrent sur le quartier de Guéliz et à proximité de l'avenue Mohammed V. La Médina dispose également de médecins généralistes de proximité. Les spécialités en forte demande — cardiologie, orthopédie, ophtalmologie — bénéficient de plateaux techniques performants dans les principales cliniques privées.",
    highlights: [
      "Offre médicale privée en forte croissance, couvrant toutes les spécialités courantes",
      "Concentration de cliniques et cabinets dans le quartier Guéliz",
      "Tourisme médical actif : certains praticiens parlent arabe, français, anglais et espagnol",
      "Médecins généralistes accessibles y compris en Médina",
    ],
  },

  fes: {
    description:
      "Fès, troisième ville du Maroc, s'appuie sur son CHU Hassan II et sur un tissu de cliniques privées pour répondre aux besoins médicaux de sa région. Les quartiers de l'Atlas, de Narjiss et du Nouveau Fès accueillent la majorité des cabinets libéraux. L'université de médecine et de pharmacie forme de nombreux praticiens, ce qui contribue à une offre spécialisée variée. Médecine générale, pédiatrie, gynécologie et cardiologie y sont particulièrement bien représentées.",
    highlights: [
      "CHU Hassan II — centre hospitalier universitaire couvrant tout le nord-est marocain",
      "Forte présence de jeunes praticiens formés à la Faculté de médecine de Fès",
      "Spécialités phares : pédiatrie, gynécologie, cardiologie et chirurgie",
      "Tarifs de consultation généralement inférieurs à la moyenne nationale",
    ],
  },

  tanger: {
    description:
      "Tanger bénéficie d'une position géographique stratégique qui attire des praticiens formés aussi bien au Maroc qu'en Europe. La ville dispose d'hôpitaux publics et d'un nombre croissant de cliniques privées modernes, principalement concentrées sur le boulevard Mohammed VI et le quartier California. La forte croissance économique de la métropole du Nord stimule l'investissement dans les équipements médicaux. Plusieurs spécialistes exercent en libéral après une carrière hospitalière en Espagne ou en France.",
    highlights: [
      "Praticiens bilingues (français/espagnol) facilitant le suivi pour les expatriés",
      "Cliniques modernes concentrées sur le bd Mohammed VI et le quartier California",
      "Offre médicale en forte expansion portée par le dynamisme économique régional",
      "Téléconsultation disponible pour relier Tanger aux spécialistes de Rabat et Casablanca",
    ],
  },

  agadir: {
    description:
      "Agadir est le principal pôle médical du Souss-Massa. La ville accueille des cliniques privées bien équipées et des cabinets spécialisés couvrant la plupart des disciplines. Le secteur libéral se concentre autour du centre-ville et du quartier de la Baie. La forte population touristique a encouragé le développement de pratiques anglophones et d'une médecine esthétique de qualité. Le CHU Souss-Massa constitue le plateau technique de référence pour les cas nécessitant une hospitalisation.",
    highlights: [
      "Principal pôle de soins de la région Souss-Massa",
      "Médecins francophones, arabophones et quelques anglophones",
      "Cliniques privées bien équipées autour du centre-ville et de la Baie",
      "Médecine esthétique et thermale développée grâce à l'afflux touristique",
    ],
  },

  meknes: {
    description:
      "Meknès dispose d'un système de santé mixte alliant secteur public et libéral. Les médecins généralistes et pédiatres de ville sont nombreux dans les quartiers Hamria, Zitoune et Ismaïlia. La ville est rattachée au CHU de Fès pour les soins hautement spécialisés, mais elle compte ses propres cliniques privées pour la chirurgie, l'imagerie et les soins ambulatoires. Les tarifs de consultation y restent parmi les plus abordables du Maroc.",
    highlights: [
      "Réseau de médecins généralistes dense dans les quartiers centraux",
      "Cliniques privées pour chirurgie et imagerie médicale",
      "Recours au CHU de Fès pour les soins ultra-spécialisés",
      "Tarifs de consultation parmi les plus abordables du pays",
    ],
  },

  oujda: {
    description:
      "Oujda est le centre médical de référence de la région de l'Oriental. Son CHU Mohammed VI accueille les cas complexes en provenance des provinces environnantes. Le secteur libéral est actif dans les quartiers Sidi Yahia et Al Qods, avec une offre correcte en médecine générale, gynécologie et pédiatrie. La proximité de l'Algérie attire parfois des patients transfrontaliers pour des soins spécialisés.",
    highlights: [
      "CHU Mohammed VI — centre de référence pour toute la région de l'Oriental",
      "Spécialités bien représentées : gynécologie, pédiatrie, médecine interne",
      "Secteur libéral concentré dans les quartiers Sidi Yahia et Al Qods",
      "Tarifs compétitifs par rapport aux grandes métropoles",
    ],
  },

  kenitra: {
    description:
      "Kénitra bénéficie de la proximité de Rabat pour les soins très spécialisés, tout en développant son propre tissu médical libéral. Les quartiers du centre et de Bir Rami accueillent la majorité des cabinets. La ville dispose d'une polyclinique régionale et de plusieurs cliniques privées couvrant les actes courants. La croissance urbaine rapide de Kénitra entraîne une demande soutenue, notamment en pédiatrie et gynécologie.",
    highlights: [
      "Proximité de Rabat (45 min) pour les soins hautement spécialisés",
      "Polyclinique régionale + cliniques privées pour les actes courants",
      "Forte demande en pédiatrie et gynécologie liée à la croissance démographique",
      "Tarifs plus accessibles qu'à Rabat pour des soins de qualité équivalente",
    ],
  },

  sale: {
    description:
      "Salé forme avec Rabat une agglomération médicale intégrée. Les praticiens des deux villes sont facilement accessibles grâce aux infrastructures de transport. Salé dispose de ses propres cliniques et cabinets, notamment dans les quartiers Bettana, Tabriquet et Hay Salam. Les habitants peuvent choisir entre l'offre locale et les nombreux spécialistes de Rabat, selon leur besoin et leur budget.",
    highlights: [
      "Agglomération médicale intégrée avec Rabat — choix élargi de praticiens",
      "Cliniques locales dans les quartiers Bettana et Tabriquet",
      "Accès facile aux spécialistes de Rabat via le tramway et les axes routiers",
      "Tarifs généralement inférieurs à ceux pratiqués à Rabat",
    ],
  },

  tetouan: {
    description:
      "Tétouan dispose d'un réseau médical libéral développé, renforcé par la présence de praticiens ayant exercé en Espagne. La ville s'appuie sur son CHU et sur plusieurs cliniques privées concentrées autour du boulevard Mohammed V. La forte communauté marocaine résidant en Europe contribue à une demande de soins spécialisés pendant les périodes estivales. Médecine générale, ophtalmologie et orthopédie y sont bien représentées.",
    highlights: [
      "Praticiens hispanophones facilitant le suivi des MRE (Marocains Résidant à l'Étranger)",
      "CHU de Tétouan + cliniques privées pour tous les actes courants",
      "Afflux de patients pendant l'été — préférer la prise de RDV à l'avance",
      "Spécialités phares : ophtalmologie, orthopédie, médecine générale",
    ],
  },
};

const DEFAULT_CONTENT: CityContent = {
  description:
    "Cette ville dispose de médecins et de spécialistes référencés sur SantéauMaroc. Consultez les profils pour connaître les tarifs, les horaires de consultation et les avis patients, puis prenez rendez-vous en ligne gratuitement.",
  highlights: [
    "Médecins et spécialistes vérifiés, disponibles sur SantéauMaroc",
    "Avis patients authentiques pour choisir en confiance",
    "Prise de rendez-vous en ligne — 100 % gratuit",
    "Informations sur les tarifs et les horaires de consultation",
  ],
};

/* ── Versions arabes ──────────────────────────────────────── */

const CITY_CONTENT_AR: Record<string, CityContent> = {
  casablanca: {
    description:
      "تضم الدار البيضاء أكبر عرض للرعاية الصحية الخاصة بالمغرب. تتوفر العاصمة الاقتصادية على شبكة كثيفة من العيادات والمكاتب الطبية ومراكز التشخيص موزّعة على أحيائها — من المعاريف إلى كوتييه، مرورًا بعين الذئاب وعين الشق. تُمثَّل فيها التخصصات بجميع فروعها، مع آجال مواعيد قصيرة عمومًا. ويجد المؤمَّنون لدى CNSS وAMO بسهولة ممارسين متعاقدين. كما أن الاستشارة عن بُعد متطورة جيدًا لمواعيد المتابعة.",
    highlights: [
      "أكثف عرض طبي في البلاد، بجميع التخصصات",
      "ممارسون متعاقدون مع CNSS / AMO في جميع الأحياء",
      "عيادات خاصة مُركَّزة في المعاريف وكوتييه وسيدي معروف",
      "آجال مواعيد من بين الأقصر على المستوى الوطني",
    ],
  },
  rabat: {
    description:
      "تتوفر الرباط، العاصمة الإدارية للمغرب، على عرض طبي متين يتمحور حول المؤسسات العمومية (المركز الاستشفائي ابن سينا) ونسيج حر في تطور. تضم أحياء أكدال وحسان والمحيط معظم المكاتب الخاصة. ويوسّع قرب مدينة سلا حوض الرعاية لسكان الجهة. ويجعل الأساتذة الجامعيون الاستشفائيون المتاحون في الاستشارة الخاصة من الرباط وجهة طبية مرجعية للآراء التخصصية.",
    highlights: [
      "المركز الاستشفائي ابن سينا — مركز مرجعي جهوي للحالات المعقدة",
      "تركّز قوي للأخصائيين في حيَّي أكدال وحسان",
      "أساتذة جامعيون استشفائيون متاحون في الاستشارة الخاصة",
      "حوض رعاية موسَّع مع مدينة سلا المجاورة",
    ],
  },
  marrakech: {
    description:
      "عرفت مراكش تطورًا سريعًا لعرضها الطبي الخاص في السنوات الأخيرة، مدفوعًا بالنمو الديمغرافي والسياحة العلاجية. تتركز العيادات الحديثة والمكاتب المتخصصة في حي جيليز وبالقرب من شارع محمد الخامس. كما تتوفر المدينة العتيقة على أطباء عامين للقرب. وتستفيد التخصصات ذات الطلب القوي — أمراض القلب، جراحة العظام، طب العيون — من تجهيزات تقنية عالية الأداء في كبرى العيادات الخاصة.",
    highlights: [
      "عرض طبي خاص في نمو قوي، يغطي جميع التخصصات الشائعة",
      "تركّز للعيادات والمكاتب في حي جيليز",
      "سياحة علاجية نشطة: بعض الممارسين يتحدثون العربية والفرنسية والإنجليزية والإسبانية",
      "أطباء عامون متاحون حتى في المدينة العتيقة",
    ],
  },
  fes: {
    description:
      "تعتمد فاس، ثالث مدن المغرب، على المركز الاستشفائي الحسن الثاني وعلى نسيج من العيادات الخاصة لتلبية الحاجيات الطبية لجهتها. تستقبل أحياء الأطلس والنرجس وفاس الجديد غالبية المكاتب الحرة. وتكوّن كلية الطب والصيدلة عددًا كبيرًا من الممارسين، مما يسهم في عرض تخصصي متنوع. ويُمثَّل الطب العام وطب الأطفال وأمراض النساء وأمراض القلب تمثيلًا جيدًا بشكل خاص.",
    highlights: [
      "المركز الاستشفائي الحسن الثاني — مركز جامعي يغطي كامل الشمال الشرقي المغربي",
      "حضور قوي لممارسين شباب تكوّنوا بكلية الطب بفاس",
      "تخصصات بارزة: طب الأطفال، أمراض النساء، أمراض القلب والجراحة",
      "أسعار استشارة أدنى عمومًا من المتوسط الوطني",
    ],
  },
  tanger: {
    description:
      "تستفيد طنجة من موقع جغرافي استراتيجي يجذب ممارسين تكوّنوا بالمغرب وبأوروبا على حد سواء. تتوفر المدينة على مستشفيات عمومية وعدد متزايد من العيادات الخاصة الحديثة، مركّزة أساسًا في شارع محمد السادس وحي كاليفورنيا. ويحفّز النمو الاقتصادي القوي لعاصمة الشمال الاستثمار في التجهيزات الطبية. ويزاول عدة أخصائيين القطاع الحر بعد مسار استشفائي بإسبانيا أو فرنسا.",
    highlights: [
      "ممارسون ثنائيو اللغة (فرنسية/إسبانية) يسهّلون المتابعة للمغاربة المقيمين بالخارج",
      "عيادات حديثة مركّزة في شارع محمد السادس وحي كاليفورنيا",
      "عرض طبي في توسّع قوي مدفوع بالدينامية الاقتصادية الجهوية",
      "الاستشارة عن بُعد متاحة لربط طنجة بأخصائيي الرباط والدار البيضاء",
    ],
  },
  agadir: {
    description:
      "أكادير هي القطب الطبي الرئيسي لجهة سوس ماسة. تستقبل المدينة عيادات خاصة مجهزة جيدًا ومكاتب متخصصة تغطي معظم الفروع. ويتركز القطاع الحر حول وسط المدينة وحي الخليج. وقد شجّع الإقبال السياحي القوي تطوير ممارسات ناطقة بالإنجليزية وطب تجميلي عالي الجودة. ويشكّل المركز الاستشفائي سوس ماسة المنصة التقنية المرجعية للحالات التي تتطلب الاستشفاء.",
    highlights: [
      "القطب العلاجي الرئيسي لجهة سوس ماسة",
      "أطباء ناطقون بالفرنسية والعربية وبعضهم بالإنجليزية",
      "عيادات خاصة مجهزة جيدًا حول وسط المدينة والخليج",
      "طب تجميلي وحموي متطور بفضل التدفق السياحي",
    ],
  },
  meknes: {
    description:
      "تتوفر مكناس على منظومة صحية مختلطة تجمع القطاعين العام والحر. الأطباء العامون وأطباء الأطفال بالمدينة كثيرون في أحياء حمرية والزيتون والإسماعيلية. وترتبط المدينة بالمركز الاستشفائي بفاس للعلاجات عالية التخصص، لكنها تتوفر على عياداتها الخاصة للجراحة والتصوير والعلاجات النهارية. وتبقى أسعار الاستشارة بها من بين الأكثر تيسّرًا بالمغرب.",
    highlights: [
      "شبكة كثيفة من الأطباء العامين في الأحياء المركزية",
      "عيادات خاصة للجراحة والتصوير الطبي",
      "اللجوء إلى المركز الاستشفائي بفاس للعلاجات فائقة التخصص",
      "أسعار استشارة من بين الأكثر تيسّرًا في البلاد",
    ],
  },
  oujda: {
    description:
      "وجدة هي المركز الطبي المرجعي لجهة الشرق. يستقبل مركزها الاستشفائي محمد السادس الحالات المعقدة الواردة من الأقاليم المجاورة. القطاع الحر نشط في حيَّي سيدي يحيى والقدس، مع عرض جيد في الطب العام وأمراض النساء وطب الأطفال. ويجذب قرب الجزائر أحيانًا مرضى عابرين للحدود لعلاجات تخصصية.",
    highlights: [
      "المركز الاستشفائي محمد السادس — مركز مرجعي لكامل جهة الشرق",
      "تخصصات ممثَّلة جيدًا: أمراض النساء، طب الأطفال، الطب الباطني",
      "قطاع حر مركّز في حيَّي سيدي يحيى والقدس",
      "أسعار تنافسية مقارنة بالحواضر الكبرى",
    ],
  },
  kenitra: {
    description:
      "تستفيد القنيطرة من قرب الرباط للعلاجات عالية التخصص، مع تطوير نسيجها الطبي الحر الخاص. تستقبل أحياء الوسط وبئر الرامي غالبية المكاتب. وتتوفر المدينة على مصحة جهوية متعددة التخصصات وعدة عيادات خاصة تغطي الأعمال الشائعة. ويُحدث النمو الحضري السريع للقنيطرة طلبًا متواصلًا، خاصة في طب الأطفال وأمراض النساء.",
    highlights: [
      "قرب الرباط (45 دقيقة) للعلاجات عالية التخصص",
      "مصحة جهوية + عيادات خاصة للأعمال الشائعة",
      "طلب قوي على طب الأطفال وأمراض النساء مرتبط بالنمو الديمغرافي",
      "أسعار أكثر تيسّرًا من الرباط لجودة علاج معادِلة",
    ],
  },
  sale: {
    description:
      "تشكّل سلا مع الرباط تجمّعًا طبيًا متكاملًا. ويسهل الوصول إلى ممارسي المدينتين بفضل بنيات النقل. وتتوفر سلا على عياداتها ومكاتبها الخاصة، خاصة في أحياء بطانة وتبريكت وحي السلام. ويمكن للسكان الاختيار بين العرض المحلي والعديد من أخصائيي الرباط، حسب حاجتهم وميزانيتهم.",
    highlights: [
      "تجمّع طبي متكامل مع الرباط — خيار موسَّع من الممارسين",
      "عيادات محلية في حيَّي بطانة وتبريكت",
      "وصول سهل إلى أخصائيي الرباط عبر الطرام والمحاور الطرقية",
      "أسعار أدنى عمومًا من تلك المعتمدة بالرباط",
    ],
  },
  tetouan: {
    description:
      "تتوفر تطوان على شبكة طبية حرة متطورة، معزّزة بحضور ممارسين زاولوا بإسبانيا. تعتمد المدينة على مركزها الاستشفائي وعلى عدة عيادات خاصة مركّزة حول شارع محمد الخامس. وتسهم الجالية المغربية الكبيرة المقيمة بأوروبا في طلب على العلاجات التخصصية خلال فترات الصيف. ويُمثَّل الطب العام وطب العيون وجراحة العظام تمثيلًا جيدًا.",
    highlights: [
      "ممارسون ناطقون بالإسبانية يسهّلون متابعة المغاربة المقيمين بالخارج",
      "المركز الاستشفائي بتطوان + عيادات خاصة لجميع الأعمال الشائعة",
      "تدفق المرضى خلال الصيف — يُفضَّل حجز الموعد مسبقًا",
      "تخصصات بارزة: طب العيون، جراحة العظام، الطب العام",
    ],
  },
};

const DEFAULT_CONTENT_AR: CityContent = {
  description:
    "تتوفر هذه المدينة على أطباء وأخصائيين مُدرَجين على صحة بالمغرب. اطّلع على الملفات لمعرفة الأسعار وأوقات الاستشارة وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.",
  highlights: [
    "أطباء وأخصائيون موثوقون، متاحون على صحة بالمغرب",
    "آراء مرضى حقيقية للاختيار بثقة",
    "حجز المواعيد عبر الإنترنت — مجاني 100%",
    "معلومات حول الأسعار وأوقات الاستشارة",
  ],
};

export function getCityContent(slug: string, locale: Locale = "fr"): CityContent {
  if (locale === "ar") return CITY_CONTENT_AR[slug] ?? DEFAULT_CONTENT_AR;
  return CITY_CONTENT[slug] ?? DEFAULT_CONTENT;
}

export type CityFaq = { q: string; a: string };

/** FAQ contextualisée ville, générée à partir des compteurs réels (FR + AR).
 *  Alimente l'accordéon ET le JSON-LD FAQPage (mêmes données → schéma synchronisé).
 *  Les fourchettes de tarifs sont indicatives (honoraires libres au Maroc). */
export function getCityFaqs(
  locale: Locale,
  { cityName, total, specialtiesCount }: { cityName: string; total: number; specialtiesCount: number },
): CityFaq[] {
  if (locale === "ar") {
    return [
      {
        q: `كم عدد الأطباء المُدرَجين في ${cityName}؟`,
        a: `يُدرج موقع صحة بالمغرب ${total} ممارسًا في ${cityName}، موزّعين على ${specialtiesCount} تخصصًا. اطّلع على الملفات الموثّقة وآراء المرضى والمواعيد المتاحة لاختيار الطبيب المناسب لحاجتك.`,
      },
      {
        q: `كيف أحجز موعدًا مع طبيب في ${cityName}؟`,
        a: `صفِّ حسب التخصص، قارن الملفات الموثّقة وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا ودون رسوم تسجيل.`,
      },
      {
        q: `ما هو سعر الاستشارة في ${cityName}؟`,
        a: `على سبيل الإرشاد، تتراوح استشارة الطب العام بين 100 و250 درهمًا، والاستشارة التخصصية بين 150 و400 درهم حسب الطبيب. ويستفيد المؤمَّنون لدى CNSS أو AMO من تعويض جزئي.`,
      },
    ];
  }
  return [
    {
      q: `Combien de médecins sont référencés à ${cityName} ?`,
      a: `SantéauMaroc référence ${total.toLocaleString("fr")} praticiens à ${cityName}, répartis sur ${specialtiesCount} spécialités. Consultez les profils vérifiés, les avis patients et les disponibilités pour choisir le praticien adapté à votre besoin.`,
    },
    {
      q: `Comment prendre rendez-vous avec un médecin à ${cityName} ?`,
      a: `Filtrez par spécialité, comparez les profils vérifiés et les avis patients, puis réservez votre rendez-vous en ligne gratuitement — sans frais d'inscription ni commission.`,
    },
    {
      q: `Quel est le tarif d'une consultation à ${cityName} ?`,
      a: `À titre indicatif, une consultation de médecine générale coûte entre 100 et 250 MAD, et une consultation spécialisée entre 150 et 400 MAD selon le praticien. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.`,
    },
  ];
}
