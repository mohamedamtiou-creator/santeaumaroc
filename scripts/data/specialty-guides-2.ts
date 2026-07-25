/**
 * Lot 2 des guides « quand consulter un [spécialité] ? » (12 spécialités). Voir specialty-guides.ts.
 * Relecture humaine à faire → noindex (verrous null).
 */
import type { SpecialtyGuideSeed } from "./specialty-guides";

export const SPECIALTY_GUIDES_2: SpecialtyGuideSeed[] = [
  {
    specialty: "psychiatrie",
    relatedSlugs: ["depression", "crise-d-angoisse", "anxiete", "autisme", "burn-out"],
    shortAnswer:
      "Consultez un psychiatre si une souffrance psychique dure depuis plusieurs semaines : tristesse profonde, angoisses envahissantes, insomnie persistante, idées noires, comportements qui vous échappent ou retentissent sur votre travail et vos relations. Le psychiatre évalue, oriente et coordonne une prise en charge adaptée. En cas d'idées suicidaires, ne restez pas seul et demandez de l'aide immédiatement.",
    reasons: [
      "Tristesse, perte d'intérêt ou fatigue morale qui durent plus de deux semaines",
      "Crises d'angoisse, anxiété permanente ou attaques de panique répétées",
      "Troubles du sommeil, de l'appétit ou de la concentration retentissant sur le quotidien",
      "Pensées obsédantes, rituels ou comportements que vous ne contrôlez plus",
      "Alternance d'états d'euphorie et de dépression, ou perte de contact avec la réalité",
      "Souffrance après un événement traumatisant (agression, accident, deuil)",
    ],
    redFlags: [
      "Idées suicidaires, projets de se faire du mal ou de mettre fin à ses jours",
      "Perte de contact avec la réalité : hallucinations, délire, agitation intense",
      "Refus de s'alimenter, de boire ou de se soigner mettant la vie en danger",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous dès qu'une souffrance psychique s'installe et perturbe votre vie depuis plusieurs semaines, ou lorsqu'un proche s'inquiète d'un changement de comportement. Votre médecin généraliste peut assurer un premier recours et vous orienter vers le psychiatre. Une consultation précoce facilite l'accompagnement et évite l'aggravation.",
    faq: [
      {
        q: "Quelle différence entre psychiatre et psychologue ?",
        a: "Le psychiatre est un médecin : il pose un diagnostic, assure un suivi médical et peut prescrire un traitement. Le psychologue propose un accompagnement et des thérapies par la parole, sans prescription. Les deux sont souvent complémentaires ; votre médecin peut vous orienter selon votre situation.",
      },
      {
        q: "Faut-il une lettre du médecin pour voir un psychiatre ?",
        a: "Au Maroc, vous pouvez consulter directement un psychiatre. Un courrier de votre généraliste reste utile : il transmet vos antécédents et facilite la coordination des soins. En cas de doute sur le professionnel à consulter, commencez par votre médecin traitant.",
      },
    ],
    shortAnswerAr:
      "استشر طبيبًا نفسيًا إذا استمرت معاناة نفسية لعدة أسابيع: حزن عميق، قلق مسيطر، أرق دائم، أفكار سوداء، أو سلوكيات تفلت من سيطرتك وتؤثر على عملك وعلاقاتك. يقيّم الطبيب النفسي حالتك ويوجّهك وينسّق رعاية مناسبة. عند وجود أفكار انتحارية، لا تبقَ وحدك واطلب المساعدة فورًا.",
    reasonsAr: [
      "حزن أو فقدان الاهتمام أو إرهاق نفسي يستمر أكثر من أسبوعين",
      "نوبات قلق أو توتر دائم أو نوبات هلع متكررة",
      "اضطرابات في النوم أو الشهية أو التركيز تؤثر على حياتك اليومية",
      "أفكار وسواسية أو طقوس أو سلوكيات لم تعد تتحكم فيها",
      "تناوب بين حالات نشوة واكتئاب، أو فقدان التواصل مع الواقع",
      "معاناة بعد حدث صادم (اعتداء، حادث، فقدان عزيز)",
    ],
    redFlagsAr: [
      "أفكار انتحارية أو نية إيذاء النفس أو إنهاء الحياة",
      "فقدان التواصل مع الواقع: هلوسة أو هذيان أو هياج شديد",
      "رفض الأكل أو الشرب أو العلاج بشكل يهدد الحياة",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا بمجرد أن تستقر معاناة نفسية وتعكّر حياتك منذ عدة أسابيع، أو حين يقلق أحد المقربين من تغيّر في سلوكك. يمكن لطبيبك العام أن يقدّم الرعاية الأولى ويوجّهك إلى الطبيب النفسي. الاستشارة المبكرة تسهّل المرافقة وتتجنّب تفاقم الحالة.",
    faqAr: [
      {
        q: "ما الفرق بين الطبيب النفسي والأخصائي النفسي؟",
        a: "الطبيب النفسي طبيب: يضع التشخيص ويتابع الحالة طبيًا ويمكنه وصف علاج. أما الأخصائي النفسي فيقدّم مرافقة وعلاجات بالكلام دون وصف أدوية. وغالبًا ما يكمّل أحدهما الآخر؛ ويمكن لطبيبك أن يوجّهك حسب حالتك.",
      },
      {
        q: "هل أحتاج إلى رسالة من الطبيب لزيارة الطبيب النفسي؟",
        a: "في المغرب يمكنك استشارة الطبيب النفسي مباشرة. ومع ذلك تبقى رسالة من طبيبك العام مفيدة: تنقل سوابقك الصحية وتسهّل تنسيق الرعاية. وإن ترددت في اختيار المختص، ابدأ بطبيبك المعالج.",
      },
    ],
  },
  {
    specialty: "oto-rhino-laryngologie",
    relatedSlugs: ["sinusite", "vertiges", "acouphenes", "angine", "otite"],
    shortAnswer:
      "Consultez un ORL pour un problème d'oreille, de nez ou de gorge qui persiste ou revient : baisse d'audition, bourdonnements, vertiges, nez bouché durable, sinusites à répétition, mal de gorge tenace, enrouement ou ronflement gênant. L'ORL examine ces zones, recherche la cause et vous oriente vers le soin ou l'examen adapté.",
    reasons: [
      "Baisse d'audition, oreille bouchée ou bourdonnements persistants",
      "Vertiges et troubles de l'équilibre à répétition",
      "Nez bouché durable, sinusites fréquentes ou perte de l'odorat",
      "Mal de gorge ou angines à répétition, difficulté à avaler",
      "Enrouement ou extinction de voix qui dure plus de deux à trois semaines",
      "Ronflement important ou pauses respiratoires signalées pendant le sommeil",
    ],
    redFlags: [
      "Perte d'audition brutale d'une oreille, en quelques heures",
      "Difficulté à respirer ou à avaler d'apparition rapide",
      "Ganglion du cou dur qui grossit, ou saignement inexpliqué de la gorge ou du nez",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous quand un symptôme ORL dure plus de deux à trois semaines, revient souvent ou gêne votre quotidien (sommeil, audition, voix). Votre médecin généraliste peut traiter les épisodes simples et vous adresser à l'ORL si le problème persiste, récidive ou nécessite un examen spécialisé.",
    faq: [
      {
        q: "Quand des sinusites à répétition justifient-elles un ORL ?",
        a: "Consultez un ORL si vos sinusites reviennent plusieurs fois par an, durent longtemps malgré la prise en charge de votre généraliste, ou s'accompagnent de nez bouché permanent et de perte de l'odorat. L'ORL recherche une cause locale (déviation, polypes) et propose un bilan adapté.",
      },
      {
        q: "Un ronflement doit-il inquiéter ?",
        a: "Un ronflement isolé est fréquent. Il mérite un avis si votre entourage observe des pauses respiratoires, ou si vous vous sentez très fatigué et somnolent le jour. L'ORL et le médecin peuvent évaluer un éventuel trouble du sommeil et orienter vers les examens utiles.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب الأنف والأذن والحنجرة لأي مشكل في الأذن أو الأنف أو الحلق يستمر أو يتكرر: ضعف السمع، طنين، دوار، انسداد أنف مستمر، التهابات جيوب متكررة، ألم حلق مزمن، بحّة أو شخير مزعج. يفحص الطبيب هذه المناطق ويبحث عن السبب ويوجّهك إلى العلاج أو الفحص المناسب.",
    reasonsAr: [
      "ضعف السمع أو انسداد الأذن أو طنين مستمر",
      "دوار متكرر واضطرابات في التوازن",
      "انسداد أنف مستمر أو التهابات جيوب متكررة أو فقدان حاسة الشم",
      "ألم حلق أو التهابات لوزتين متكررة وصعوبة في البلع",
      "بحّة أو فقدان الصوت يستمر أكثر من أسبوعين إلى ثلاثة",
      "شخير قوي أو توقّف في التنفس أثناء النوم يلاحظه المحيطون",
    ],
    redFlagsAr: [
      "فقدان مفاجئ للسمع في أذن واحدة خلال ساعات",
      "صعوبة مفاجئة في التنفس أو البلع",
      "عقدة صلبة في الرقبة تكبر، أو نزيف غير مبرّر من الحلق أو الأنف",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا حين يستمر عرض في الأذن أو الأنف أو الحلق أكثر من أسبوعين إلى ثلاثة، أو يتكرر كثيرًا أو يعكّر حياتك اليومية (النوم، السمع، الصوت). يمكن لطبيبك العام معالجة الحالات البسيطة وتحويلك إلى المختص إذا استمر المشكل أو تكرّر أو استلزم فحصًا متخصصًا.",
    faqAr: [
      {
        q: "متى تستوجب التهابات الجيوب المتكررة زيارة المختص؟",
        a: "استشر المختص إذا تكررت التهابات الجيوب عدة مرات في السنة، أو طالت رغم متابعة طبيبك العام، أو صاحبها انسداد أنف دائم وفقدان حاسة الشم. يبحث المختص عن سبب موضعي (انحراف، لحميات) ويقترح الفحص المناسب.",
      },
      {
        q: "هل الشخير مدعاة للقلق؟",
        a: "الشخير المعزول شائع. لكنه يستدعي استشارة إذا لاحظ المحيطون توقفًا في التنفس أثناء النوم، أو إذا شعرت بتعب شديد ونعاس في النهار. يمكن للمختص والطبيب تقييم اضطراب محتمل في النوم وتوجيهك للفحوص المفيدة.",
      },
    ],
  },
  {
    specialty: "urologie-et-chirurgie-urologique",
    relatedSlugs: ["brulures-urinaires", "calculs-renaux", "colique-nephretique", "andropause"],
    shortAnswer:
      "Consultez un urologue pour un trouble des voies urinaires ou de l'appareil génital masculin : brûlures ou envies pressantes persistantes, difficultés à uriner, fuites urinaires, sang dans les urines, douleurs des reins ou des bourses, ou gêne liée à la prostate. L'urologue recherche la cause et propose le bilan ou le suivi adapté.",
    reasons: [
      "Difficulté à uriner, jet faible ou envies fréquentes, surtout la nuit",
      "Brûlures urinaires ou infections urinaires qui reviennent",
      "Fuites urinaires ou incontinence gênant le quotidien",
      "Douleurs des reins, coliques ou antécédents de calculs",
      "Gêne, grosseur ou douleur au niveau des bourses ou de la verge",
      "Suivi de la prostate après un certain âge ou en cas d'antécédents familiaux",
    ],
    redFlags: [
      "Sang visible dans les urines, même une seule fois et sans douleur",
      "Impossibilité totale d'uriner avec douleur du bas-ventre (rétention aiguë)",
      "Douleur brutale et intense d'une bourse chez l'homme jeune",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous quand un trouble urinaire persiste, revient ou s'aggrave, ou en cas de gêne prostatique après la cinquantaine. Votre médecin généraliste traite les infections simples et vous oriente vers l'urologue si les symptômes récidivent, si un examen spécialisé est nécessaire ou pour un dépistage de la prostate.",
    faq: [
      {
        q: "À quel âge surveiller sa prostate ?",
        a: "La surveillance de la prostate se discute en général à partir de la cinquantaine, plus tôt en cas d'antécédents familiaux. Le rythme et les examens se décident avec le médecin ou l'urologue, selon votre situation. Consultez plus tôt si vous avez des troubles urinaires.",
      },
      {
        q: "Infections urinaires à répétition : quand voir un urologue ?",
        a: "Consultez un urologue si les infections urinaires reviennent souvent, résistent à la prise en charge habituelle, ou s'accompagnent de fièvre et de douleur des reins. L'urologue recherche une cause favorisante (calcul, obstacle) et propose un bilan adapté.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب المسالك البولية لأي اضطراب في الجهاز البولي أو التناسلي عند الرجل: حرقة أو إلحاح بولي مستمر، صعوبة في التبول، تسرّب بولي، دم في البول، آلام في الكلى أو الخصيتين، أو انزعاج مرتبط بالبروستاتة. يبحث الطبيب عن السبب ويقترح الفحص أو المتابعة المناسبة.",
    reasonsAr: [
      "صعوبة في التبول أو ضعف التدفق أو كثرة التبول خاصة ليلاً",
      "حرقة بولية أو التهابات بولية متكررة",
      "تسرّب بولي أو سلس بولي يعكّر الحياة اليومية",
      "آلام في الكلى أو مغص كلوي أو سوابق حصوات",
      "انزعاج أو كتلة أو ألم في الخصيتين أو القضيب",
      "متابعة البروستاتة بعد سنّ معينة أو عند وجود سوابق عائلية",
    ],
    redFlagsAr: [
      "دم ظاهر في البول ولو مرة واحدة ودون ألم",
      "انعدام تام للتبول مع ألم أسفل البطن (احتباس بولي حاد)",
      "ألم مفاجئ وحاد في الخصية عند الرجل الشاب",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا حين يستمر اضطراب بولي أو يتكرر أو يتفاقم، أو عند انزعاج بروستاتي بعد الخمسين. يعالج طبيبك العام الالتهابات البسيطة ويوجّهك إلى المختص إذا تكررت الأعراض أو استلزمت فحصًا متخصصًا أو للكشف عن البروستاتة.",
    faqAr: [
      {
        q: "في أي سنّ ينبغي مراقبة البروستاتة؟",
        a: "تُناقش مراقبة البروستاتة عادةً ابتداءً من الخمسين، وأبكر عند وجود سوابق عائلية. يُحدَّد الإيقاع والفحوص مع الطبيب أو المختص حسب حالتك. واستشر أبكر إذا كانت لديك اضطرابات بولية.",
      },
      {
        q: "التهابات بولية متكررة: متى أزور المختص؟",
        a: "استشر المختص إذا تكررت الالتهابات البولية كثيرًا، أو قاومت العلاج المعتاد، أو صاحبتها حمّى وألم في الكلى. يبحث المختص عن سبب مساعد (حصوة، عائق) ويقترح فحصًا مناسبًا.",
      },
    ],
  },
  {
    specialty: "endocrinologie-et-maladies-metaboliques",
    relatedSlugs: ["diabete", "carence-en-vitamine-d", "hypercholesterolemie", "diabete-gestationnel"],
    shortAnswer:
      "Consultez un endocrinologue pour un trouble hormonal ou métabolique : diabète, maladie de la thyroïde, nodule au cou, prise ou perte de poids inexpliquée, fatigue liée aux hormones, troubles du cholestérol ou anomalies découvertes sur une prise de sang. L'endocrinologue interprète le bilan, recherche la cause et organise le suivi adapté.",
    reasons: [
      "Diabète à équilibrer ou glycémie élevée découverte lors d'un bilan",
      "Signes de thyroïde perturbée : fatigue, frilosité, nervosité, palpitations",
      "Nodule ou gonflement à la base du cou (goitre)",
      "Prise ou perte de poids inexpliquée malgré des habitudes stables",
      "Anomalies persistantes du cholestérol ou du bilan métabolique",
      "Troubles hormonaux : pilosité, cycles, croissance ou puberté anormale",
    ],
    redFlags: [
      "Soif intense, urines très abondantes et amaigrissement rapide",
      "Palpitations fortes avec amaigrissement, tremblements et grande agitation",
      "Malaise avec sueurs, confusion ou perte de connaissance chez un diabétique",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous quand une prise de sang révèle une anomalie hormonale ou métabolique, quand des symptômes évocateurs durent, ou pour organiser le suivi d'un diabète ou d'une thyroïde. Votre médecin généraliste assure souvent le premier bilan et vous adresse à l'endocrinologue pour les situations complexes ou spécialisées.",
    faq: [
      {
        q: "Diabète : généraliste ou endocrinologue ?",
        a: "Un diabète stable est souvent suivi par le médecin généraliste. L'endocrinologue intervient pour les situations plus complexes : équilibre difficile, complications, grossesse ou traitement à ajuster. Les deux travaillent en coordination ; votre médecin vous oriente selon votre profil.",
      },
      {
        q: "Un nodule de la thyroïde est-il inquiétant ?",
        a: "La plupart des nodules thyroïdiens sont bénins, mais tout nodule mérite une évaluation. L'endocrinologue examine, prescrit les examens utiles et décide d'une simple surveillance ou d'un bilan plus poussé. Consultez sans tarder si le nodule grossit vite ou gêne pour avaler.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب الغدد لأي اضطراب هرموني أو استقلابي: السكري، أمراض الغدة الدرقية، عقدة في الرقبة، زيادة أو نقص وزن غير مبرّر، تعب مرتبط بالهرمونات، اضطرابات الكوليسترول أو خلل يُكتشف في تحليل الدم. يفسّر طبيب الغدد النتائج ويبحث عن السبب وينظّم المتابعة المناسبة.",
    reasonsAr: [
      "سكري يحتاج إلى ضبط أو ارتفاع سكر يُكتشف في تحليل",
      "علامات خلل الغدة الدرقية: تعب، برودة، عصبية، خفقان",
      "عقدة أو انتفاخ في قاعدة الرقبة (تضخم الغدة)",
      "زيادة أو نقص وزن غير مبرّر رغم ثبات العادات",
      "خلل مستمر في الكوليسترول أو التحليل الاستقلابي",
      "اضطرابات هرمونية: الشعر، الدورة، النمو أو بلوغ غير طبيعي",
    ],
    redFlagsAr: [
      "عطش شديد وبول غزير جدًا ونقص وزن سريع",
      "خفقان قوي مع نقص وزن ورعشة وهياج شديد",
      "إغماء مع تعرّق أو تشوّش أو فقدان وعي عند مريض السكري",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا حين يكشف تحليل دم عن خلل هرموني أو استقلابي، أو حين تستمر أعراض موحية، أو لتنظيم متابعة السكري أو الغدة الدرقية. غالبًا ما يقوم طبيبك العام بالفحص الأولي ويحوّلك إلى طبيب الغدد للحالات المعقّدة أو المتخصصة.",
    faqAr: [
      {
        q: "السكري: طبيب عام أم طبيب غدد؟",
        a: "غالبًا ما يتابع الطبيب العام السكري المستقر. ويتدخل طبيب الغدد في الحالات الأعقد: صعوبة الضبط، المضاعفات، الحمل أو تعديل العلاج. ويعمل الطبيبان بتنسيق؛ ويوجّهك طبيبك حسب حالتك.",
      },
      {
        q: "هل عقدة الغدة الدرقية مدعاة للقلق؟",
        a: "معظم عقد الغدة الدرقية حميدة، لكن كل عقدة تستحق تقييمًا. يفحص طبيب الغدد ويطلب الفحوص المفيدة ويقرر مراقبة بسيطة أو فحصًا أعمق. استشر دون تأخير إذا كبرت العقدة بسرعة أو أعاقت البلع.",
      },
    ],
  },
  {
    specialty: "pneumo-phtisiologie",
    relatedSlugs: ["asthme", "bpco", "bronchite", "crachats-de-sang"],
    shortAnswer:
      "Consultez un pneumologue pour un problème respiratoire qui dure ou s'aggrave : toux persistante, essoufflement à l'effort ou au repos, sifflements, crises d'asthme mal contrôlées, ou suivi d'une bronchite chronique. Le pneumologue explore les poumons et les bronches, recherche la cause et propose le bilan et le suivi adaptés.",
    reasons: [
      "Toux qui dure plus de trois semaines ou revient souvent",
      "Essoufflement inhabituel à l'effort, voire au repos",
      "Sifflements respiratoires ou oppression de la poitrine répétés",
      "Asthme mal contrôlé, avec crises fréquentes ou gênantes",
      "Bronchites à répétition, surtout chez un fumeur ou ancien fumeur",
      "Suivi d'une maladie respiratoire chronique déjà connue",
    ],
    redFlags: [
      "Difficulté à respirer d'apparition brutale ou lèvres bleutées",
      "Crachats de sang, même en petite quantité",
      "Douleur thoracique intense associée à un essoufflement soudain",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous quand une gêne respiratoire dure plus de trois semaines, s'aggrave ou limite vos activités, ou lorsqu'un asthme est mal contrôlé. Votre médecin généraliste traite les épisodes aigus simples et vous adresse au pneumologue pour un bilan spécialisé, un essoufflement inexpliqué ou une maladie chronique à suivre.",
    faq: [
      {
        q: "Une toux qui dure justifie-t-elle un pneumologue ?",
        a: "Une toux qui persiste au-delà de trois semaines, ou qui revient sans cause évidente, mérite un avis médical. Votre généraliste évalue d'abord ; il peut adresser au pneumologue si la cause reste incertaine, s'il faut un examen des poumons ou en cas de tabagisme.",
      },
      {
        q: "Suis-je concerné si je fume ou j'ai fumé ?",
        a: "Fumer ou avoir fumé augmente le risque de maladies respiratoires. Un essoufflement, une toux chronique ou des bronchites répétées justifient un avis. Le pneumologue peut proposer un bilan de la fonction respiratoire et un accompagnement, y compris pour arrêter le tabac.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب الرئة لأي مشكل تنفسي يستمر أو يتفاقم: سعال مزمن، ضيق نفس عند المجهود أو الراحة، صفير، نوبات ربو غير مضبوطة، أو متابعة التهاب شعبي مزمن. يستكشف طبيب الرئة الرئتين والشُّعب، ويبحث عن السبب، ويقترح الفحص والمتابعة المناسبين.",
    reasonsAr: [
      "سعال يستمر أكثر من ثلاثة أسابيع أو يتكرر كثيرًا",
      "ضيق نفس غير معتاد عند المجهود أو حتى في الراحة",
      "صفير في التنفس أو ضيق في الصدر متكرر",
      "ربو غير مضبوط، مع نوبات متكررة أو مزعجة",
      "التهابات شعبية متكررة، خاصة عند المدخن أو المدخن السابق",
      "متابعة مرض تنفسي مزمن معروف مسبقًا",
    ],
    redFlagsAr: [
      "صعوبة مفاجئة في التنفس أو ازرقاق الشفتين",
      "بصق دم ولو بكمية قليلة",
      "ألم صدري حاد مصحوب بضيق نفس مفاجئ",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا حين يستمر ضيق تنفسي أكثر من ثلاثة أسابيع أو يتفاقم أو يحدّ من نشاطك، أو حين يكون الربو غير مضبوط. يعالج طبيبك العام النوبات الحادة البسيطة ويحوّلك إلى طبيب الرئة لفحص متخصص أو ضيق نفس غير مبرّر أو مرض مزمن يحتاج متابعة.",
    faqAr: [
      {
        q: "هل السعال الطويل يستوجب زيارة طبيب الرئة؟",
        a: "السعال الذي يستمر أكثر من ثلاثة أسابيع، أو يتكرر دون سبب واضح، يستحق استشارة طبية. يقيّم طبيبك العام أولاً؛ وقد يحوّلك إلى طبيب الرئة إذا بقي السبب غير واضح، أو استلزم فحص الرئتين، أو في حالة التدخين.",
      },
      {
        q: "هل أنا معنيّ إذا كنت أدخّن أو دخّنت؟",
        a: "التدخين، حاليًا أو سابقًا، يرفع خطر أمراض التنفس. ضيق النفس أو السعال المزمن أو الالتهابات الشعبية المتكررة تستوجب استشارة. يمكن لطبيب الرئة اقتراح فحص لوظيفة التنفس ومرافقة، بما فيها الإقلاع عن التدخين.",
      },
    ],
  },
  {
    specialty: "chirurgie-dentaire",
    relatedSlugs: ["carie-dentaire", "abces-dentaire", "dent-de-sagesse", "aphtes", "bruxisme"],
    shortAnswer:
      "Consultez un chirurgien-dentiste pour toute douleur dentaire, carie, gencive qui saigne, dent cassée ou abcès, ainsi que pour un contrôle et un détartrage réguliers. Le dentiste examine dents et gencives, traite les lésions et prévient les complications. Une visite régulière permet de dépister tôt les problèmes, souvent indolores au début.",
    reasons: [
      "Douleur dentaire, sensibilité au chaud, au froid ou au sucré",
      "Carie visible, dent cassée, ébréchée ou plombage perdu",
      "Gencives qui saignent, gonflent ou se rétractent",
      "Douleur ou poussée difficile d'une dent de sagesse",
      "Mauvaise haleine persistante malgré une bonne hygiène",
      "Contrôle et détartrage réguliers de prévention",
    ],
    redFlags: [
      "Gonflement du visage ou de la joue avec fièvre (abcès qui s'étend)",
      "Douleur intense qui empêche de dormir ou de s'alimenter",
      "Traumatisme avec dent expulsée ou fracture de la mâchoire",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous dès l'apparition d'une douleur, d'une sensibilité ou d'un saignement des gencives, et n'attendez pas que la gêne devienne permanente. Un contrôle au moins une fois par an, avec détartrage, permet de dépister caries et problèmes de gencives tôt. Les enfants doivent aussi bénéficier de contrôles réguliers.",
    faq: [
      {
        q: "À quelle fréquence consulter le dentiste ?",
        a: "Un contrôle au moins une fois par an est recommandé, même sans douleur, avec un détartrage selon les besoins. Ce rythme peut être plus rapproché en cas de problèmes de gencives, de caries fréquentes ou sur avis du dentiste. Les enfants bénéficient aussi d'un suivi régulier.",
      },
      {
        q: "Faut-il attendre d'avoir mal pour consulter ?",
        a: "Non. De nombreux problèmes dentaires, comme les caries débutantes, sont indolores au début. Attendre la douleur signifie souvent une atteinte plus avancée. Les visites régulières permettent de traiter tôt, plus simplement, et d'éviter des soins lourds.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب الأسنان عند أي ألم في الأسنان، تسوّس، نزيف لثة، سنّ مكسورة أو خرّاج، وكذلك للمراقبة وإزالة الجير بانتظام. يفحص الطبيب الأسنان واللثة، ويعالج الإصابات، ويقي من المضاعفات. الزيارة المنتظمة تتيح الكشف المبكر عن المشاكل التي غالبًا ما تكون بلا ألم في البداية.",
    reasonsAr: [
      "ألم في الأسنان أو حساسية للحار أو البارد أو الحلو",
      "تسوّس ظاهر أو سنّ مكسورة أو مشقوقة أو حشو مفقود",
      "لثة تنزف أو تنتفخ أو تنحسر",
      "ألم أو بزوغ صعب لضرس العقل",
      "رائحة فم كريهة مستمرة رغم النظافة الجيدة",
      "مراقبة وإزالة الجير بانتظام للوقاية",
    ],
    redFlagsAr: [
      "انتفاخ الوجه أو الخد مع حمّى (خرّاج يمتد)",
      "ألم شديد يمنع النوم أو الأكل",
      "رضّ مع سقوط سنّ أو كسر في الفك",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا بمجرد ظهور ألم أو حساسية أو نزيف في اللثة، ولا تنتظر أن يصير الانزعاج دائمًا. المراقبة مرة في السنة على الأقل، مع إزالة الجير، تتيح الكشف المبكر عن التسوّس ومشاكل اللثة. ويحتاج الأطفال أيضًا إلى مراقبة منتظمة.",
    faqAr: [
      {
        q: "كم مرة ينبغي زيارة طبيب الأسنان؟",
        a: "يُنصح بمراقبة مرة في السنة على الأقل، حتى دون ألم، مع إزالة الجير حسب الحاجة. وقد يكون الإيقاع أقرب عند مشاكل اللثة أو التسوّس المتكرر أو بناءً على رأي الطبيب. ويستفيد الأطفال أيضًا من متابعة منتظمة.",
      },
      {
        q: "هل ننتظر الألم قبل الاستشارة؟",
        a: "لا. كثير من مشاكل الأسنان، كالتسوّس المبكر، بلا ألم في البداية. وانتظار الألم يعني غالبًا إصابة أكثر تقدمًا. الزيارات المنتظمة تتيح العلاج مبكرًا وبأبسط طريقة وتجنّب علاجات ثقيلة.",
      },
    ],
  },
  {
    specialty: "traumatologie-orthopedie",
    relatedSlugs: ["douleur-au-genou", "douleur-a-l-epaule", "douleur-a-la-hanche", "douleur-au-cou"],
    shortAnswer:
      "Consultez un chirurgien orthopédiste pour une douleur ou une gêne persistante des os, articulations, muscles ou tendons : entorse, douleur de genou, d'épaule ou de hanche, séquelles de traumatisme, hernie discale ou déformation. L'orthopédiste évalue l'articulation, propose un bilan d'imagerie et décide d'un traitement médical, de rééducation ou chirurgical.",
    reasons: [
      "Douleur persistante d'une articulation (genou, épaule, hanche)",
      "Suite d'entorse, de fracture ou de traumatisme mal récupéré",
      "Difficulté à marcher, à bouger ou perte de mobilité",
      "Douleur du dos avec irritation d'un nerf (sciatique, hernie)",
      "Fourmillements de la main évoquant un canal carpien",
      "Déformation articulaire ou usure gênant les gestes du quotidien",
    ],
    redFlags: [
      "Déformation visible ou os apparent après un choc (fracture ouverte)",
      "Impossibilité d'appuyer ou de bouger un membre après un traumatisme",
      "Membre froid, pâle, insensible, ou perte brutale de force ou du contrôle urinaire",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous quand une douleur articulaire ou musculaire persiste malgré le repos, limite vos mouvements ou récidive. Votre médecin généraliste gère les entorses simples et les douleurs aiguës, et vous adresse à l'orthopédiste pour un bilan d'imagerie, une gêne durable ou l'avis sur une éventuelle intervention.",
    faq: [
      {
        q: "Orthopédiste ou rhumatologue : lequel consulter ?",
        a: "L'orthopédiste s'occupe surtout des atteintes mécaniques et chirurgicales (fractures, entorses, usure nécessitant une opération). Le rhumatologue prend en charge les maladies articulaires et inflammatoires par un traitement médical. Votre généraliste vous oriente selon l'origine de la douleur.",
      },
      {
        q: "Une entorse nécessite-t-elle toujours un spécialiste ?",
        a: "La plupart des entorses simples se traitent avec repos et prise en charge par le médecin généraliste. Un avis orthopédique est utile en cas de douleur qui persiste, d'instabilité de l'articulation, d'impossibilité d'appuyer, ou si une fracture est suspectée.",
      },
    ],
    shortAnswerAr:
      "استشر جرّاح العظام والمفاصل عند ألم أو انزعاج مستمر في العظام أو المفاصل أو العضلات أو الأوتار: التواء، ألم الركبة أو الكتف أو الورك، آثار رضّ، انزلاق غضروفي أو تشوّه. يقيّم المختص المفصل، ويقترح فحصًا بالتصوير، ويقرر علاجًا طبيًا أو إعادة تأهيل أو جراحة.",
    reasonsAr: [
      "ألم مستمر في مفصل (الركبة، الكتف، الورك)",
      "أثر التواء أو كسر أو رضّ لم يُشفَ جيدًا",
      "صعوبة في المشي أو الحركة أو فقدان القدرة على الحركة",
      "ألم في الظهر مع تهيّج عصب (عرق النسا، انزلاق غضروفي)",
      "تنميل في اليد يوحي بمتلازمة النفق الرسغي",
      "تشوّه في المفصل أو تآكل يعيق حركات الحياة اليومية",
    ],
    redFlagsAr: [
      "تشوّه ظاهر أو عظم بارز بعد صدمة (كسر مفتوح)",
      "استحالة الاستناد أو تحريك طرف بعد رضّ",
      "طرف بارد شاحب فاقد للإحساس، أو فقدان مفاجئ للقوة أو للتحكّم في البول",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا حين يستمر ألم مفصلي أو عضلي رغم الراحة، أو يحدّ من حركتك، أو يتكرر. يعالج طبيبك العام الالتواءات البسيطة والآلام الحادة، ويحوّلك إلى المختص لفحص بالتصوير، أو انزعاج مستمر، أو رأي حول تدخّل جراحي محتمل.",
    faqAr: [
      {
        q: "جرّاح العظام أم طبيب الروماتيزم: من أستشير؟",
        a: "يهتم جرّاح العظام أساسًا بالإصابات الميكانيكية والجراحية (كسور، التواءات، تآكل يستلزم عملية). ويتكفّل طبيب الروماتيزم بأمراض المفاصل والالتهابات بعلاج طبي. ويوجّهك طبيبك العام حسب مصدر الألم.",
      },
      {
        q: "هل يستلزم الالتواء دائمًا مختصًا؟",
        a: "معظم الالتواءات البسيطة تُعالَج بالراحة ومتابعة الطبيب العام. ويكون رأي المختص مفيدًا عند ألم مستمر، أو عدم ثبات المفصل، أو استحالة الاستناد، أو الاشتباه في كسر.",
      },
    ],
  },
  {
    specialty: "nephrologie",
    relatedSlugs: ["calculs-renaux", "colique-nephretique", "hypertension-arterielle", "brulures-urinaires"],
    shortAnswer:
      "Consultez un néphrologue pour une maladie des reins : baisse de la fonction rénale, présence de protéines ou de sang dans les urines, hypertension difficile à contrôler, ou anomalies rénales sur une prise de sang. Le néphrologue évalue le fonctionnement des reins, recherche la cause et organise un suivi pour protéger la fonction rénale.",
    reasons: [
      "Fonction rénale abaissée découverte sur une prise de sang",
      "Protéines ou sang détectés de façon répétée dans les urines",
      "Hypertension artérielle difficile à équilibrer",
      "Gonflement des jambes, du visage ou des paupières",
      "Diabète ou maladie chronique avec retentissement sur les reins",
      "Antécédents familiaux de maladie rénale ou de dialyse",
    ],
    redFlags: [
      "Chute brutale ou arrêt des urines sur quelques heures",
      "Gonflement rapide du corps avec essoufflement au repos",
      "Confusion, nausées et grande fatigue chez un patient à reins fragiles",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous quand une prise de sang ou une analyse d'urine révèle une anomalie rénale, ou quand une hypertension reste mal contrôlée. Votre médecin généraliste dépiste et suit les cas simples ; il vous adresse au néphrologue en cas d'atteinte confirmée, de fonction rénale qui baisse ou de maladie rénale chronique.",
    faq: [
      {
        q: "Des protéines dans les urines, est-ce grave ?",
        a: "La présence de protéines dans les urines peut être passagère, mais si elle se répète, elle peut signaler une atteinte des reins. Un bilan est utile pour en chercher la cause. Votre médecin décide de la surveillance et peut vous adresser au néphrologue si nécessaire.",
      },
      {
        q: "Diabète et hypertension : faut-il surveiller ses reins ?",
        a: "Oui. Le diabète et l'hypertension figurent parmi les principales causes d'atteinte rénale. Un suivi régulier des reins, par prise de sang et analyse d'urine, permet de dépister tôt et de protéger la fonction rénale. Votre médecin organise cette surveillance.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب الكلى عند مرض في الكلى: تراجع وظيفة الكلى، وجود بروتين أو دم في البول، ارتفاع ضغط يصعب ضبطه، أو خلل كلوي في تحليل الدم. يقيّم طبيب الكلى عمل الكليتين، ويبحث عن السبب، وينظّم متابعة لحماية وظيفة الكلى.",
    reasonsAr: [
      "تراجع وظيفة الكلى يُكتشف في تحليل الدم",
      "بروتين أو دم يُكتشف بشكل متكرر في البول",
      "ارتفاع ضغط شرياني يصعب ضبطه",
      "انتفاخ في الساقين أو الوجه أو الجفون",
      "سكري أو مرض مزمن مع تأثير على الكلى",
      "سوابق عائلية لمرض كلوي أو تصفية دم (ديال)",
    ],
    redFlagsAr: [
      "توقّف مفاجئ أو انقطاع البول خلال ساعات",
      "انتفاخ سريع في الجسم مع ضيق نفس في الراحة",
      "تشوّش وغثيان وتعب شديد عند مريض ذي كلى هشّة",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا حين يكشف تحليل دم أو بول عن خلل كلوي، أو حين يبقى ارتفاع الضغط غير مضبوط. يكشف طبيبك العام الحالات البسيطة ويتابعها؛ ويحوّلك إلى طبيب الكلى عند إصابة مؤكدة، أو تراجع وظيفة الكلى، أو مرض كلوي مزمن.",
    faqAr: [
      {
        q: "هل وجود بروتين في البول خطير؟",
        a: "قد يكون وجود البروتين في البول عابرًا، لكنه إن تكرّر فقد يشير إلى إصابة في الكلى. ويكون الفحص مفيدًا للبحث عن السبب. ويقرر طبيبك المراقبة وقد يحوّلك إلى طبيب الكلى عند الحاجة.",
      },
      {
        q: "السكري وارتفاع الضغط: هل ينبغي مراقبة الكلى؟",
        a: "نعم. السكري وارتفاع الضغط من أهم أسباب إصابة الكلى. والمتابعة المنتظمة للكلى، بتحليل الدم والبول، تتيح الكشف المبكر وحماية وظيفتها. وينظّم طبيبك هذه المراقبة.",
      },
    ],
  },
  {
    specialty: "allergologie",
    relatedSlugs: ["allergie", "allergie-alimentaire", "rhinite-allergique", "asthme"],
    shortAnswer:
      "Consultez un allergologue pour des réactions allergiques répétées ou mal identifiées : rhinite saisonnière, urticaire, eczéma, allergie alimentaire suspectée, asthme d'origine allergique ou réactions à des médicaments. L'allergologue recherche les déclencheurs, réalise des tests adaptés et propose un plan pour éviter les allergènes et mieux vivre au quotidien.",
    reasons: [
      "Éternuements, nez qui coule et yeux qui piquent, surtout par saison",
      "Urticaire ou démangeaisons répétées sans cause évidente",
      "Réaction suspectée après un aliment, une piqûre ou un médicament",
      "Asthme déclenché par la poussière, les pollens ou les animaux",
      "Eczéma persistant ou qui s'aggrave à certaines périodes",
      "Besoin d'identifier précisément un allergène par des tests",
    ],
    redFlags: [
      "Gonflement des lèvres, de la langue ou de la gorge après un contact",
      "Difficulté à respirer ou sifflements brutaux après une exposition",
      "Malaise avec chute de tension juste après un aliment, une piqûre ou un médicament",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous quand des symptômes allergiques reviennent chaque année, gênent votre quotidien, ou quand vous suspectez un aliment ou un produit sans en être sûr. Votre médecin généraliste soulage les épisodes courants et vous adresse à l'allergologue pour des tests, une allergie sévère ou récidivante à identifier précisément.",
    faq: [
      {
        q: "Comment sait-on à quoi on est allergique ?",
        a: "L'allergologue s'appuie sur votre récit (circonstances, saison, aliments) puis réalise des tests cutanés ou sanguins adaptés. Ces examens aident à identifier les déclencheurs et à bâtir un plan d'éviction. Notez à l'avance les situations qui déclenchent vos symptômes.",
      },
      {
        q: "Une allergie alimentaire nécessite-t-elle toujours un bilan ?",
        a: "Une réaction claire et sévère après un aliment justifie un avis spécialisé sans tarder. Pour des symptômes plus flous, l'allergologue confirme ou écarte l'allergie par des tests, afin d'éviter des exclusions alimentaires inutiles et de sécuriser votre alimentation.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب الحساسية عند تفاعلات تحسّسية متكررة أو غير محدّدة: التهاب أنف موسمي، شرى، إكزيما، اشتباه في حساسية غذائية، ربو تحسّسي أو تفاعلات لأدوية. يبحث الطبيب عن المثيرات، ويجري فحوصًا مناسبة، ويقترح خطة لتجنّب المواد المسبّبة وتحسين الحياة اليومية.",
    reasonsAr: [
      "عطس وسيلان أنف وحكة في العينين، خاصة حسب الفصل",
      "شرى أو حكة متكررة دون سبب واضح",
      "اشتباه في تفاعل بعد طعام أو لسعة أو دواء",
      "ربو تثيره الغبار أو حبوب اللقاح أو الحيوانات",
      "إكزيما مستمرة أو تتفاقم في فترات معينة",
      "الحاجة إلى تحديد المادة المسبّبة بدقة عبر فحوص",
    ],
    redFlagsAr: [
      "انتفاخ الشفتين أو اللسان أو الحلق بعد تماس",
      "صعوبة مفاجئة في التنفس أو صفير بعد تعرّض",
      "إغماء مع هبوط ضغط مباشرة بعد طعام أو لسعة أو دواء",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا حين تتكرر الأعراض التحسّسية كل سنة، أو تعكّر حياتك، أو حين تشتبه في طعام أو منتج دون يقين. يخفّف طبيبك العام النوبات الشائعة ويحوّلك إلى طبيب الحساسية لإجراء فحوص، أو لتحديد حساسية شديدة أو متكررة بدقة.",
    faqAr: [
      {
        q: "كيف نعرف مصدر الحساسية؟",
        a: "يعتمد طبيب الحساسية على روايتك (الظروف، الفصل، الأطعمة) ثم يجري فحوصًا جلدية أو دموية مناسبة. تساعد هذه الفحوص على تحديد المثيرات وبناء خطة تجنّب. ودوّن مسبقًا الحالات التي تثير أعراضك.",
      },
      {
        q: "هل تستلزم الحساسية الغذائية دائمًا فحصًا؟",
        a: "التفاعل الواضح والشديد بعد طعام يستوجب رأيًا متخصصًا دون تأخير. أما الأعراض الغامضة، فيؤكّد طبيب الحساسية أو ينفي الحساسية عبر فحوص، لتجنّب استبعاد أطعمة دون داعٍ وتأمين تغذيتك.",
      },
    ],
  },
  {
    specialty: "medecine-generale",
    relatedSlugs: ["coup-de-chaleur", "crampes-musculaires", "carence-en-fer", "coup-de-soleil"],
    shortAnswer:
      "Consultez un médecin généraliste pour tout problème de santé courant, un premier avis, un suivi de maladie chronique, la prévention et les vaccinations. Premier recours, il examine, traite ce qui relève de son domaine, prescrit les examens utiles et vous oriente vers le bon spécialiste. C'est votre interlocuteur de référence qui coordonne l'ensemble de vos soins.",
    reasons: [
      "Symptômes courants : fièvre, fatigue, toux, douleurs, infections",
      "Premier avis pour un problème nouveau ou inexpliqué",
      "Suivi d'une maladie chronique (tension, diabète, cholestérol)",
      "Prévention, bilans de santé, vaccinations et dépistages",
      "Certificats médicaux et renouvellement de suivi",
      "Orientation vers le bon spécialiste et coordination des soins",
    ],
    redFlags: [
      "Douleur thoracique, essoufflement brutal ou malaise avec perte de connaissance",
      "Fièvre élevée persistante, confusion ou raideur de la nuque",
      "Aggravation rapide de l'état général ou saignement important",
    ],
    whenToConsult:
      "Prenez rendez-vous avec le généraliste dès qu'un symptôme vous inquiète, pour tout problème courant, ou pour organiser le suivi d'une maladie chronique et la prévention. C'est le premier recours à privilégier : il traite, oriente et assure la continuité des soins. Consultez aussi régulièrement, même en l'absence de symptôme, pour un suivi préventif.",
    faq: [
      {
        q: "Pourquoi passer par le généraliste avant un spécialiste ?",
        a: "Le généraliste connaît votre histoire de santé, pose un premier bilan et oriente vers le spécialiste le plus adapté, avec les examens utiles. Ce passage évite des consultations inutiles, améliore la coordination et s'inscrit dans le parcours de soins recommandé.",
      },
      {
        q: "À quelle fréquence consulter sans être malade ?",
        a: "Un suivi préventif régulier est utile même sans symptôme, pour contrôler tension, poids, vaccins et dépistages selon l'âge. Le rythme se décide avec votre médecin selon vos facteurs de risque. Ce suivi permet de repérer tôt d'éventuels problèmes.",
      },
    ],
    shortAnswerAr:
      "استشر الطبيب العام لأي مشكل صحي شائع، أو رأي أول، أو متابعة مرض مزمن، أو الوقاية والتلقيح. بوصفه أول جهة رعاية، يفحص ويعالج ما يدخل في اختصاصه، ويطلب الفحوص المفيدة، ويوجّهك إلى المختص المناسب. إنه مرجعك الذي ينسّق مجمل رعايتك الصحية.",
    reasonsAr: [
      "أعراض شائعة: حمّى، تعب، سعال، آلام، التهابات",
      "رأي أول لمشكل جديد أو غير مفسَّر",
      "متابعة مرض مزمن (الضغط، السكري، الكوليسترول)",
      "الوقاية، الفحوص الدورية، التلقيح والكشف المبكر",
      "الشهادات الطبية وتجديد المتابعة",
      "التوجيه إلى المختص المناسب وتنسيق الرعاية",
    ],
    redFlagsAr: [
      "ألم صدري أو ضيق نفس مفاجئ أو إغماء مع فقدان وعي",
      "حمّى عالية مستمرة أو تشوّش أو تيبّس في الرقبة",
      "تدهور سريع في الحالة العامة أو نزيف مهم",
    ],
    whenToConsultAr:
      "احجز موعدًا مع الطبيب العام بمجرد أن يقلقك عرض ما، أو لأي مشكل شائع، أو لتنظيم متابعة مرض مزمن والوقاية. إنه أول جهة يُفضَّل اللجوء إليها: يعالج ويوجّه ويضمن استمرارية الرعاية. واستشره أيضًا بانتظام، حتى دون أعراض، لمتابعة وقائية.",
    faqAr: [
      {
        q: "لماذا نمرّ بالطبيب العام قبل المختص؟",
        a: "يعرف الطبيب العام تاريخك الصحي، ويجري فحصًا أوليًا، ويوجّهك إلى المختص الأنسب مع الفحوص المفيدة. هذا المرور يتجنّب استشارات غير ضرورية، ويحسّن التنسيق، ويندرج ضمن مسار الرعاية الموصى به.",
      },
      {
        q: "كم مرة نستشير دون أن نكون مرضى؟",
        a: "المتابعة الوقائية المنتظمة مفيدة حتى دون أعراض، لمراقبة الضغط والوزن واللقاحات والكشف المبكر حسب السنّ. ويُحدَّد الإيقاع مع طبيبك حسب عوامل الخطر لديك. وتتيح هذه المتابعة رصد أي مشاكل مبكرًا.",
      },
    ],
  },
  {
    specialty: "oncologie-medicale",
    relatedSlugs: ["cancer-du-sein", "cancer-colorectal", "cancer-de-la-prostate", "cancer-de-la-peau"],
    shortAnswer:
      "L'oncologue médical intervient pour le dépistage, le diagnostic et le suivi des cancers, en lien avec votre médecin. Consultez-le si un examen ou un dépistage révèle une anomalie à explorer, pour un avis spécialisé, ou pour le suivi d'un cancer connu. Face à des signes inhabituels et persistants, parlez-en d'abord à votre médecin, qui vous orientera.",
    reasons: [
      "Anomalie détectée lors d'un dépistage (sein, côlon, prostate)",
      "Exploration d'une grosseur, d'un ganglion ou d'une lésion persistante",
      "Perte de poids inexpliquée ou fatigue durable à faire évaluer",
      "Avis spécialisé après des examens évoquant un cancer",
      "Suivi et accompagnement d'un cancer déjà diagnostiqué",
      "Conseil en cas d'antécédents familiaux et de dépistage rapproché",
    ],
    redFlags: [
      "Grosseur nouvelle ou ganglion dur qui grossit sans disparaître",
      "Saignement inhabituel ou persistant (selles, urines, entre les règles)",
      "Amaigrissement rapide et important avec fatigue inexpliquée",
    ],
    whenToConsult:
      "Face à des signes persistants ou inhabituels, consultez d'abord votre médecin généraliste, qui évalue, prescrit les examens utiles et vous adresse à l'oncologue si nécessaire. Le dépistage organisé (sein, côlon) se planifie selon l'âge et les antécédents. Un avis spécialisé précoce facilite la prise en charge ; il ne préjuge d'aucun diagnostic.",
    faq: [
      {
        q: "Quand faut-il penser au dépistage d'un cancer ?",
        a: "Le dépistage se planifie selon l'âge, le sexe et les antécédents familiaux, notamment pour le sein, le côlon et la prostate. Votre médecin vous indique les examens recommandés et leur rythme. Un dépistage régulier permet de repérer tôt d'éventuelles anomalies.",
      },
      {
        q: "Des symptômes signifient-ils forcément un cancer ?",
        a: "Non. La plupart des symptômes courants ont des causes bénignes. Mais des signes qui persistent ou inquiètent méritent un avis médical pour être explorés sereinement. Votre médecin décide des examens et d'une éventuelle orientation vers l'oncologue.",
      },
    ],
    shortAnswerAr:
      "يتدخل طبيب الأورام في الكشف المبكر عن السرطانات وتشخيصها ومتابعتها، بالتنسيق مع طبيبك. استشره إذا كشف فحص أو كشف مبكر عن خلل يحتاج استكشافًا، أو لرأي متخصص، أو لمتابعة سرطان معروف. وأمام علامات غير معتادة ومستمرة، تحدّث أولاً إلى طبيبك الذي سيوجّهك.",
    reasonsAr: [
      "خلل يُكتشف عند كشف مبكر (الثدي، القولون، البروستاتة)",
      "استكشاف كتلة أو عقدة أو آفة مستمرة",
      "نقص وزن غير مفسَّر أو تعب دائم يستوجب تقييمًا",
      "رأي متخصص بعد فحوص توحي بسرطان",
      "متابعة ومرافقة سرطان مشخَّص مسبقًا",
      "استشارة عند وجود سوابق عائلية وكشف مبكر مكثّف",
    ],
    redFlagsAr: [
      "كتلة جديدة أو عقدة صلبة تكبر ولا تختفي",
      "نزيف غير معتاد أو مستمر (البراز، البول، بين الدورات)",
      "نقص وزن سريع ومهم مع تعب غير مفسَّر",
    ],
    whenToConsultAr:
      "أمام علامات مستمرة أو غير معتادة، استشر أولاً طبيبك العام الذي يقيّم ويطلب الفحوص المفيدة ويحوّلك إلى طبيب الأورام عند الحاجة. ويُخطَّط الكشف المبكر المنظَّم (الثدي، القولون) حسب السنّ والسوابق. والرأي المتخصص المبكر يسهّل التكفّل، دون أن يعني أي تشخيص مسبق.",
    faqAr: [
      {
        q: "متى ينبغي التفكير في الكشف المبكر عن السرطان؟",
        a: "يُخطَّط الكشف المبكر حسب السنّ والجنس والسوابق العائلية، خاصة للثدي والقولون والبروستاتة. ويحدّد لك طبيبك الفحوص الموصى بها وإيقاعها. والكشف المنتظم يتيح رصد أي خلل محتمل مبكرًا.",
      },
      {
        q: "هل تعني الأعراض بالضرورة سرطانًا؟",
        a: "لا. معظم الأعراض الشائعة لها أسباب حميدة. لكن العلامات التي تستمر أو تقلق تستحق رأيًا طبيًا لاستكشافها بهدوء. ويقرر طبيبك الفحوص وتوجيهًا محتملاً إلى طبيب الأورام.",
      },
    ],
  },
  {
    specialty: "geriatrie",
    relatedSlugs: ["demence", "denutrition", "carence-en-vitamine-d"],
    shortAnswer:
      "Consultez un gériatre pour la santé de la personne âgée : troubles de la mémoire, chutes à répétition, perte d'autonomie, plusieurs maladies ou traitements à coordonner, dénutrition ou fragilité. Le gériatre réalise une évaluation globale, ajuste la prise en charge et aide à préserver l'autonomie et la qualité de vie au quotidien.",
    reasons: [
      "Troubles de la mémoire ou changements de comportement chez un aîné",
      "Chutes à répétition ou perte d'équilibre",
      "Perte d'autonomie progressive dans les gestes du quotidien",
      "Plusieurs maladies et traitements à coordonner et à alléger",
      "Perte d'appétit, amaigrissement ou dénutrition",
      "Bilan de fragilité pour préserver l'autonomie",
    ],
    redFlags: [
      "Chute avec traumatisme, impossibilité de se relever ou confusion soudaine",
      "Désorientation brutale, fièvre ou baisse de vigilance inhabituelle",
      "Refus de manger et de boire avec affaiblissement rapide",
    ],
    whenToConsult:
      "Hors urgence, prenez rendez-vous quand une personne âgée cumule troubles de la mémoire, chutes, perte de poids ou d'autonomie, ou de nombreux traitements. Votre médecin généraliste assure le suivi habituel et vous oriente vers le gériatre pour une évaluation globale, un avis sur les traitements ou l'organisation du maintien à domicile.",
    faq: [
      {
        q: "Quand consulter un gériatre plutôt que le généraliste ?",
        a: "Le généraliste reste le premier recours. Le gériatre apporte une évaluation globale quand plusieurs problèmes se cumulent : mémoire, chutes, dénutrition, autonomie, traitements multiples. Les deux travaillent ensemble pour adapter la prise en charge à la personne âgée.",
      },
      {
        q: "Les pertes de mémoire liées à l'âge sont-elles normales ?",
        a: "De légers oublis peuvent accompagner l'âge, mais des troubles qui s'aggravent, gênent le quotidien ou inquiètent l'entourage méritent une évaluation. Le gériatre distingue le vieillissement normal d'un trouble à explorer et propose un accompagnement adapté.",
      },
    ],
    shortAnswerAr:
      "استشر طبيب الشيخوخة لصحة المسنّ: اضطرابات الذاكرة، السقوط المتكرر، فقدان الاستقلالية، تعدّد الأمراض أو العلاجات التي تحتاج تنسيقًا، سوء التغذية أو الهشاشة. يجري الطبيب تقييمًا شاملاً، ويعدّل الرعاية، ويساعد على الحفاظ على الاستقلالية وجودة الحياة اليومية.",
    reasonsAr: [
      "اضطرابات ذاكرة أو تغيّرات سلوكية عند المسنّ",
      "سقوط متكرر أو فقدان التوازن",
      "فقدان تدريجي للاستقلالية في أعمال الحياة اليومية",
      "تعدّد الأمراض والعلاجات التي تحتاج تنسيقًا وتخفيفًا",
      "فقدان الشهية أو نقص الوزن أو سوء التغذية",
      "تقييم الهشاشة للحفاظ على الاستقلالية",
    ],
    redFlagsAr: [
      "سقوط مع رضّ أو استحالة النهوض أو تشوّش مفاجئ",
      "تشوّش مفاجئ أو حمّى أو انخفاض غير معتاد في اليقظة",
      "رفض الأكل والشرب مع ضعف سريع",
    ],
    whenToConsultAr:
      "خارج الحالات الطارئة، احجز موعدًا حين يجمع المسنّ بين اضطرابات الذاكرة والسقوط ونقص الوزن أو الاستقلالية، أو تعدّد العلاجات. يضمن طبيبك العام المتابعة المعتادة ويوجّهك إلى طبيب الشيخوخة لتقييم شامل، أو رأي حول العلاجات، أو تنظيم البقاء في المنزل.",
    faqAr: [
      {
        q: "متى نستشير طبيب الشيخوخة بدل الطبيب العام؟",
        a: "يبقى الطبيب العام أول جهة رعاية. ويقدّم طبيب الشيخوخة تقييمًا شاملاً حين تتراكم عدة مشاكل: الذاكرة، السقوط، سوء التغذية، الاستقلالية، تعدّد العلاجات. ويعمل الطبيبان معًا لتكييف الرعاية مع المسنّ.",
      },
      {
        q: "هل فقدان الذاكرة المرتبط بالسنّ أمر طبيعي؟",
        a: "قد يرافق نسيان خفيف تقدّم السنّ، لكن الاضطرابات التي تتفاقم أو تعيق الحياة اليومية أو تقلق المحيطين تستحق تقييمًا. ويميّز طبيب الشيخوخة بين الشيخوخة الطبيعية واضطراب يحتاج استكشافًا، ويقترح مرافقة مناسبة.",
      },
    ],
  },
];
