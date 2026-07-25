/**
 * Lot 3 « comment traiter X ? » (montée en volume, ~23 entrées). Voir treatment-content.ts.
 * Relecture humaine à faire → noindex si le topic ne l'est pas encore.
 */
import type { TreatmentSeed } from "./treatment-content";

export const TREATMENT_CONTENT_3: TreatmentSeed[] = [
  {
    slug: "diabete",
    summary: "Le diabète se gère au long cours avec un médecin traitant : équilibre alimentaire, activité physique régulière, suivi du poids et surveillance de la glycémie. Un endocrinologue intervient pour les cas complexes ou déséquilibrés. Le but est d'éviter les complications (yeux, reins, cœur, pieds) par un contrôle durable, un dépistage régulier et une bonne éducation thérapeutique.",
    steps: [
      "Consulter un médecin généraliste devant une soif intense, des envies fréquentes d'uriner ou une fatigue persistante, et faire confirmer le diagnostic par une prise de sang.",
      "Mettre en place une hygiène de vie adaptée : alimentation équilibrée, réduction des sucres rapides, activité physique régulière et suivi du poids.",
      "Apprendre à surveiller sa glycémie et respecter le suivi médical prescrit, sans jamais modifier soi-même son traitement.",
      "Réaliser les dépistages réguliers des complications : fond d'œil, reins, pieds, bilan cardiovasculaire.",
      "Consulter en urgence en cas de malaise, de confusion, de vomissements ou de glycémie très anormale.",
    ],
    summaryAr: "يُدار مرض السكري على المدى الطويل مع طبيب معالج: توازن غذائي، نشاط بدني منتظم، مراقبة الوزن ومتابعة نسبة السكر في الدم. يتدخّل طبيب الغدد في الحالات المعقّدة أو غير المتوازنة. الهدف هو تفادي المضاعفات (العينان، الكليتان، القلب، القدمان) عبر ضبط دائم وفحص منتظم وتربية علاجية جيّدة.",
    stepsAr: [
      "استشر طبيبًا عامًّا عند العطش الشديد أو كثرة التبوّل أو التعب المستمر، وأكّد التشخيص بتحليل دم.",
      "اعتمد نمط حياة ملائمًا: تغذية متوازنة، تقليل السكريات السريعة، نشاط بدني منتظم ومتابعة الوزن.",
      "تعلّم مراقبة نسبة السكر في دمك والتزم بالمتابعة الطبية الموصوفة، دون تغيير علاجك بنفسك أبدًا.",
      "أجرِ الفحوص المنتظمة للمضاعفات: قاع العين، الكليتان، القدمان، تقييم القلب والأوعية.",
      "استشر بشكل عاجل عند الإغماء أو التشوّش أو التقيّؤ أو ارتفاع أو انخفاض حادّ في السكر.",
    ],
    relatedTopicSlugs: ["obesite", "hypercholesterolemie"],
  },
  {
    slug: "hypercholesterolemie",
    summary: "Un cholestérol élevé se corrige d'abord par l'alimentation et l'activité physique, sous le suivi d'un médecin généraliste. Un bilan sanguin évalue le risque cardiovasculaire global. Le cardiologue intervient pour les situations à haut risque. L'objectif est de protéger le cœur et les artères durablement, sans jamais s'automédiquer, grâce à un suivi régulier et à des habitudes de vie adaptées.",
    steps: [
      "Faire un bilan lipidique sur prescription du médecin généraliste, surtout en cas d'antécédents familiaux ou de facteurs de risque.",
      "Adopter une alimentation pauvre en graisses saturées, riche en fibres, et pratiquer une activité physique régulière.",
      "Réduire les facteurs aggravants : tabac, excès de poids, sédentarité et consommation d'alcool.",
      "Respecter le suivi et les contrôles sanguins prescrits pour ajuster la prise en charge avec le médecin.",
      "Consulter sans tarder en cas de douleur thoracique, d'essoufflement inhabituel ou de malaise.",
    ],
    summaryAr: "يُصحَّح ارتفاع الكوليسترول أولًا عبر التغذية والنشاط البدني، تحت متابعة طبيب عام. يقيّم تحليل الدم الخطر القلبي الوعائي الإجمالي. يتدخّل طبيب القلب في الحالات عالية الخطورة. الهدف حماية القلب والشرايين بشكل دائم، دون تداوٍ ذاتي، بفضل متابعة منتظمة وعادات حياة ملائمة.",
    stepsAr: [
      "أجرِ تحليلًا للدهون بوصفة من الطبيب العام، خصوصًا عند وجود سوابق عائلية أو عوامل خطر.",
      "اعتمد تغذية قليلة الدهون المشبعة وغنية بالألياف، ومارس نشاطًا بدنيًّا منتظمًا.",
      "قلّل العوامل المفاقمة: التدخين، زيادة الوزن، قلّة الحركة وتناول الكحول.",
      "التزم بالمتابعة وتحاليل الدم الموصوفة لضبط التدبير مع الطبيب.",
      "استشر دون تأخير عند ألم في الصدر أو ضيق تنفّس غير معتاد أو إغماء.",
    ],
    relatedTopicSlugs: ["angine-de-poitrine", "obesite", "diabete"],
  },
  {
    slug: "anemie",
    summary: "L'anémie se traite après en avoir trouvé la cause, avec un médecin généraliste qui prescrit un bilan sanguin. La prise en charge dépend de l'origine (carence, saignement, maladie). Une alimentation adaptée peut aider, mais toute supplémentation doit être encadrée. L'hématologue intervient pour les formes complexes. Une fatigue importante ou un essoufflement nécessitent un avis médical rapide.",
    steps: [
      "Consulter un médecin devant une fatigue persistante, une pâleur, un essoufflement ou des vertiges, et faire réaliser une prise de sang.",
      "Identifier la cause avec le médecin : carence alimentaire, saignements, ou maladie sous-jacente.",
      "Adopter une alimentation adaptée selon les conseils du médecin, sans se supplémenter seul.",
      "Respecter le suivi prescrit et refaire les contrôles sanguins pour vérifier l'amélioration.",
      "Consulter en urgence en cas d'essoufflement au repos, de douleur thoracique ou de malaise.",
    ],
    summaryAr: "يُعالَج فقر الدم بعد معرفة سببه، مع طبيب عام يصف تحليلًا للدم. يعتمد التدبير على المصدر (نقص، نزيف، مرض). قد تساعد تغذية ملائمة، لكن أي مكمّل يجب أن يكون تحت إشراف. يتدخّل طبيب أمراض الدم في الأشكال المعقّدة. التعب الشديد أو ضيق التنفّس يستدعيان رأيًا طبيًّا سريعًا.",
    stepsAr: [
      "استشر طبيبًا عند تعب مستمر أو شحوب أو ضيق تنفّس أو دوار، وأجرِ تحليلًا للدم.",
      "حدّد السبب مع الطبيب: نقص غذائي، نزيف، أو مرض كامن.",
      "اعتمد تغذية ملائمة وفق نصائح الطبيب، دون تناول مكمّلات بمفردك.",
      "التزم بالمتابعة الموصوفة وأعد التحاليل الدموية للتأكّد من التحسّن.",
      "استشر بشكل عاجل عند ضيق تنفّس أثناء الراحة أو ألم صدري أو إغماء.",
    ],
    relatedTopicSlugs: ["carence-en-fer", "fatigue"],
  },
  {
    slug: "carence-en-fer",
    summary: "Une carence en fer se corrige après avoir identifié sa cause avec un médecin généraliste, sur la base d'un bilan sanguin. Une alimentation riche en fer aide, mais toute supplémentation doit être médicalement encadrée. Chez la femme, des règles abondantes sont une cause fréquente. Une fatigue marquée ou des signes d'anémie justifient une consultation sans attendre.",
    steps: [
      "Consulter un médecin devant une fatigue, une pâleur, une chute de cheveux ou un essoufflement, et faire doser le fer par une prise de sang.",
      "Rechercher la cause avec le médecin : alimentation, saignements, règles abondantes ou trouble digestif.",
      "Privilégier une alimentation riche en fer selon les conseils du médecin.",
      "Suivre la supplémentation uniquement si elle est prescrite, et respecter les contrôles sanguins.",
      "Reconsulter si la fatigue persiste ou en cas de saignements inexpliqués.",
    ],
    summaryAr: "يُصحَّح نقص الحديد بعد تحديد سببه مع طبيب عام، بناءً على تحليل دم. تساعد التغذية الغنية بالحديد، لكن أي مكمّل يجب أن يكون تحت إشراف طبّي. عند المرأة، تُعدّ الدورة الغزيرة سببًا شائعًا. التعب الواضح أو علامات فقر الدم تبرّر استشارة دون تأخير.",
    stepsAr: [
      "استشر طبيبًا عند تعب أو شحوب أو تساقط شعر أو ضيق تنفّس، وقِس الحديد بتحليل دم.",
      "ابحث عن السبب مع الطبيب: تغذية، نزيف، دورة غزيرة أو اضطراب هضمي.",
      "فضّل تغذية غنية بالحديد وفق نصائح الطبيب.",
      "اتّبع المكمّلات فقط إن كانت موصوفة، والتزم بالتحاليل الدموية.",
      "أعد الاستشارة إذا استمرّ التعب أو عند نزيف غير مبرّر.",
    ],
    relatedTopicSlugs: ["anemie", "fatigue"],
  },
  {
    slug: "carence-en-vitamine-d",
    summary: "Une carence en vitamine D se confirme par une prise de sang prescrite par un médecin. L'exposition raisonnée au soleil et une alimentation adaptée aident, mais toute supplémentation doit être encadrée pour éviter les excès. Un endocrinologue intervient dans les cas particuliers. Des douleurs osseuses ou une fatigue persistante justifient une consultation, surtout chez les personnes âgées ou peu exposées au soleil.",
    steps: [
      "Consulter un médecin en cas de fatigue, de douleurs osseuses ou musculaires, ou de facteurs de risque, et faire doser la vitamine D si nécessaire.",
      "S'exposer raisonnablement à la lumière du jour selon les conseils du médecin.",
      "Adopter une alimentation adaptée, sans prendre de compléments de sa propre initiative.",
      "Suivre la supplémentation uniquement si elle est prescrite et respecter les contrôles.",
      "Reconsulter si les symptômes persistent ou s'aggravent.",
    ],
    summaryAr: "يُؤكَّد نقص فيتامين د بتحليل دم يصفه الطبيب. يساعد التعرّض المعقول للشمس وتغذية ملائمة، لكن أي مكمّل يجب أن يكون تحت إشراف لتفادي الإفراط. يتدخّل طبيب الغدد في الحالات الخاصّة. آلام العظام أو التعب المستمر تبرّر استشارة، خصوصًا لدى المسنّين أو قليلي التعرّض للشمس.",
    stepsAr: [
      "استشر طبيبًا عند تعب أو آلام عظمية أو عضلية أو وجود عوامل خطر، وقِس فيتامين د عند اللزوم.",
      "تعرّض بشكل معقول لضوء النهار وفق نصائح الطبيب.",
      "اعتمد تغذية ملائمة، دون تناول مكمّلات من تلقاء نفسك.",
      "اتّبع المكمّلات فقط إن كانت موصوفة والتزم بالفحوص.",
      "أعد الاستشارة إذا استمرّت الأعراض أو تفاقمت.",
    ],
    relatedTopicSlugs: ["fatigue"],
  },
  {
    slug: "obesite",
    summary: "L'obésité se prend en charge sur la durée avec un médecin généraliste, autour d'une alimentation équilibrée, d'une activité physique progressive et d'un accompagnement psychologique si besoin. Un nutritionniste ou un endocrinologue peut compléter le suivi. L'objectif est une perte de poids réaliste et durable, jamais des régimes extrêmes. Un dépistage des complications (diabète, cœur, articulations) fait partie du parcours.",
    steps: [
      "Consulter un médecin généraliste pour un bilan complet et identifier les causes et facteurs associés.",
      "Fixer des objectifs réalistes et adopter une alimentation équilibrée et une activité physique progressive.",
      "Se faire accompagner si besoin par un nutritionniste, un psychologue ou un endocrinologue.",
      "Dépister et surveiller les complications éventuelles : diabète, tension, cholestérol, articulations.",
      "Maintenir un suivi régulier pour ancrer les changements dans la durée et éviter les régimes dangereux.",
    ],
    summaryAr: "تُدار السمنة على المدى الطويل مع طبيب عام، حول تغذية متوازنة ونشاط بدني تدريجي ومرافقة نفسية عند الحاجة. قد يكمّل المتابعةَ اختصاصيُّ تغذية أو طبيب غدد. الهدف فقدان وزن واقعي ودائم، لا حميات قاسية. ويشمل المسار فحص المضاعفات (السكري، القلب، المفاصل).",
    stepsAr: [
      "استشر طبيبًا عامًّا لإجراء تقييم شامل وتحديد الأسباب والعوامل المرتبطة.",
      "حدّد أهدافًا واقعية واعتمد تغذية متوازنة ونشاطًا بدنيًّا تدريجيًّا.",
      "استعن عند الحاجة باختصاصي تغذية أو أخصّائي نفسي أو طبيب غدد.",
      "افحص وراقب المضاعفات المحتملة: السكري، الضغط، الكوليسترول، المفاصل.",
      "حافظ على متابعة منتظمة لترسيخ التغييرات على المدى البعيد وتفادي الحميات الخطيرة.",
    ],
    relatedTopicSlugs: ["diabete", "hypercholesterolemie", "apnee-du-sommeil"],
  },
  {
    slug: "apnee-du-sommeil",
    summary: "L'apnée du sommeil se confirme par un enregistrement du sommeil, prescrit après consultation d'un médecin. La prise en charge associe hygiène de vie (poids, alcool, tabac) et, selon les cas, un appareillage adapté proposé par un spécialiste du sommeil ou un ORL. L'objectif est de restaurer un sommeil réparateur et de prévenir les risques cardiovasculaires. Une somnolence marquée au volant impose la prudence.",
    steps: [
      "Consulter un médecin devant des ronflements importants, une somnolence diurne ou des pauses respiratoires signalées par l'entourage.",
      "Réaliser un enregistrement du sommeil pour confirmer le diagnostic et évaluer la sévérité.",
      "Agir sur les facteurs favorisants : surpoids, alcool le soir, tabac, position de sommeil.",
      "Mettre en place le traitement proposé par le spécialiste et en respecter le suivi.",
      "Redoubler de prudence en cas de somnolence au volant et le signaler au médecin.",
    ],
    summaryAr: "يُؤكَّد انقطاع التنفّس أثناء النوم بتسجيل للنوم يُوصف بعد استشارة طبيب. يجمع التدبير بين نمط حياة صحّي (الوزن، الكحول، التدخين) وأحيانًا جهاز ملائم يقترحه أخصّائي النوم أو طبيب الأنف والأذن والحنجرة. الهدف استعادة نوم مريح والوقاية من مخاطر القلب. النعاس الشديد أثناء القيادة يفرض الحذر.",
    stepsAr: [
      "استشر طبيبًا عند شخير قوي أو نعاس نهاري أو توقّفات تنفّسية يلاحظها المحيطون.",
      "أجرِ تسجيلًا للنوم لتأكيد التشخيص وتقييم درجة الخطورة.",
      "تعامل مع العوامل المساعدة: زيادة الوزن، الكحول مساءً، التدخين، وضعية النوم.",
      "طبّق العلاج الذي يقترحه الأخصّائي والتزم بمتابعته.",
      "ضاعف الحذر عند النعاس أثناء القيادة وأبلغ الطبيب بذلك.",
    ],
    relatedTopicSlugs: ["obesite"],
  },
  {
    slug: "calculs-biliaires",
    summary: "Les calculs biliaires sans symptôme sont souvent simplement surveillés par un médecin. En cas de douleurs répétées ou de complication, une consultation en gastro-entérologie ou chirurgie oriente vers l'ablation de la vésicule. Une alimentation moins grasse peut limiter les crises. Une douleur intense du ventre à droite, une fièvre ou une jaunisse imposent une consultation en urgence.",
    steps: [
      "Consulter un médecin en cas de douleurs répétées sous les côtes à droite, souvent après un repas gras.",
      "Confirmer les calculs par une imagerie prescrite (échographie) et évaluer le risque avec le médecin.",
      "Adopter une alimentation moins riche en graisses pour limiter les crises.",
      "Discuter avec un chirurgien de l'ablation de la vésicule si les crises se répètent ou se compliquent.",
      "Consulter en urgence en cas de douleur intense, de fièvre, de vomissements ou de jaunisse.",
    ],
    summaryAr: "غالبًا ما تُراقَب حصى المرارة عديمة الأعراض من طرف الطبيب فقط. عند الآلام المتكرّرة أو حدوث مضاعفة، توجّه استشارة أمراض الجهاز الهضمي أو الجراحة نحو استئصال المرارة. قد تحدّ تغذية أقلّ دسمًا من النوبات. الألم الشديد في أعلى البطن يمينًا أو الحمّى أو اليرقان تفرض استشارة عاجلة.",
    stepsAr: [
      "استشر طبيبًا عند آلام متكرّرة تحت الأضلاع يمينًا، غالبًا بعد وجبة دسمة.",
      "أكّد وجود الحصى بتصوير موصوف (صدى) وقيّم الخطر مع الطبيب.",
      "اعتمد تغذية أقلّ دسمًا للحدّ من النوبات.",
      "ناقش مع الجرّاح استئصال المرارة إن تكرّرت النوبات أو تعقّدت.",
      "استشر بشكل عاجل عند ألم شديد أو حمّى أو تقيّؤ أو يرقان.",
    ],
    relatedTopicSlugs: ["jaunisse", "mal-de-ventre"],
  },
  {
    slug: "cataracte",
    summary: "La cataracte se soigne par une intervention chirurgicale, seul traitement efficace, décidée avec un ophtalmologue quand la gêne visuelle devient importante. Avant l'opération, un simple ajustement des lunettes peut aider. Le suivi ophtalmologique régulier permet de choisir le bon moment. Une baisse de vision progressive ou un éblouissement gênant justifient une consultation spécialisée sans attendre.",
    steps: [
      "Consulter un ophtalmologue devant une vision progressivement trouble, un éblouissement ou des couleurs ternies.",
      "Faire évaluer la gêne et le stade de la cataracte lors d'un examen ophtalmologique complet.",
      "Adapter temporairement les lunettes tant que la gêne reste modérée.",
      "Décider avec l'ophtalmologue du moment de l'intervention chirurgicale.",
      "Respecter le suivi post-opératoire et consulter vite en cas de douleur ou de baisse brutale de vision.",
    ],
    summaryAr: "يُعالَج الساد (الماء الأبيض) بعملية جراحية، وهي العلاج الفعّال الوحيد، تُقرَّر مع طبيب العيون عندما يصبح الإزعاج البصري كبيرًا. قبل العملية، قد يساعد تعديل بسيط للنظّارات. تتيح المتابعة المنتظمة اختيار الوقت المناسب. تراجع البصر التدريجي أو الوهج المزعج يبرّران استشارة مختصّة دون تأخير.",
    stepsAr: [
      "استشر طبيب عيون عند ضبابية متزايدة في الرؤية أو وهج أو بهتان في الألوان.",
      "قيّم درجة الإزعاج ومرحلة الساد خلال فحص شامل للعين.",
      "عدّل النظّارات مؤقّتًا ما دام الإزعاج معتدلًا.",
      "قرّر مع طبيب العيون موعد العملية الجراحية.",
      "التزم بالمتابعة بعد العملية واستشر بسرعة عند ألم أو تراجع مفاجئ في البصر.",
    ],
    relatedTopicSlugs: ["astigmatisme"],
  },
  {
    slug: "conjonctivite",
    summary: "La conjonctivite guérit souvent en quelques jours avec des soins d'hygiène et des mesures simples, sur conseil d'un médecin ou d'un pharmacien. La cause (virale, bactérienne ou allergique) oriente la conduite à tenir. Une bonne hygiène des mains limite la contagion. Une douleur vive, une baisse de vision ou une sensibilité à la lumière imposent une consultation ophtalmologique rapide.",
    steps: [
      "Reconnaître les signes : œil rouge, larmoiement, sensation de grain de sable ou sécrétions.",
      "Nettoyer l'œil avec des soins d'hygiène simples et se laver soigneusement les mains pour éviter la contagion.",
      "Demander conseil à un pharmacien ou à un médecin pour identifier la cause probable.",
      "Éviter le port de lentilles et le partage de serviettes le temps de la guérison.",
      "Consulter un ophtalmologue en cas de douleur intense, de baisse de vision ou de photophobie.",
    ],
    summaryAr: "غالبًا ما يشفى التهاب الملتحمة خلال أيّام بعناية بالنظافة وتدابير بسيطة، بنصيحة من طبيب أو صيدلي. يوجّه السبب (فيروسي أو جرثومي أو تحسّسي) طريقة التعامل. تحدّ نظافة اليدين الجيّدة من العدوى. الألم الحادّ أو تراجع البصر أو الحساسية للضوء تفرض استشارة عيون سريعة.",
    stepsAr: [
      "تعرّف على العلامات: احمرار العين، دماع، إحساس بحبيبات رمل أو إفرازات.",
      "نظّف العين بعناية بسيطة واغسل يديك جيّدًا لتفادي العدوى.",
      "اطلب نصيحة صيدلي أو طبيب لتحديد السبب المحتمل.",
      "تجنّب العدسات ومشاركة المناشف إلى حين الشفاء.",
      "استشر طبيب عيون عند ألم شديد أو تراجع بصر أو حساسية للضوء.",
    ],
    relatedTopicSlugs: ["allergie"],
  },
  {
    slug: "angine-de-poitrine",
    summary: "L'angine de poitrine est un signal d'alerte du cœur qui impose une consultation cardiologique. La prise en charge associe contrôle des facteurs de risque (tabac, cholestérol, tension, diabète), hygiène de vie et suivi spécialisé. L'objectif est de protéger le cœur et de prévenir l'infarctus. Une douleur thoracique intense, prolongée ou au repos impose d'appeler les secours immédiatement.",
    steps: [
      "Consulter rapidement un médecin devant une douleur ou une oppression dans la poitrine à l'effort.",
      "Réaliser le bilan cardiologique prescrit pour évaluer le cœur et les artères.",
      "Agir sur les facteurs de risque : arrêt du tabac, alimentation, cholestérol, tension, diabète.",
      "Suivre le traitement et les recommandations du cardiologue, avec des contrôles réguliers.",
      "Appeler les secours en urgence si la douleur est intense, prolongée, survient au repos ou s'accompagne d'un malaise.",
    ],
    summaryAr: "الذبحة الصدرية إشارة إنذار من القلب تفرض استشارة طبيب القلب. يجمع التدبير بين ضبط عوامل الخطر (التدخين، الكوليسترول، الضغط، السكري) ونمط حياة صحّي ومتابعة مختصّة. الهدف حماية القلب والوقاية من الاحتشاء. الألم الصدري الشديد أو المطوّل أو أثناء الراحة يفرض الاتّصال بالإسعاف فورًا.",
    stepsAr: [
      "استشر طبيبًا بسرعة عند ألم أو ضغط في الصدر أثناء المجهود.",
      "أجرِ تقييم القلب الموصوف لفحص القلب والشرايين.",
      "تعامل مع عوامل الخطر: الإقلاع عن التدخين، التغذية، الكوليسترول، الضغط، السكري.",
      "اتّبع العلاج وتوصيات طبيب القلب مع فحوص منتظمة.",
      "اتّصل بالإسعاف بشكل عاجل إن كان الألم شديدًا أو مطوّلًا أو حدث أثناء الراحة أو صاحبه إغماء.",
    ],
    relatedTopicSlugs: ["hypercholesterolemie", "douleur-thoracique"],
  },
  {
    slug: "carie-dentaire",
    summary:
      "La carie est une destruction progressive de la dent par les bactéries. Une fois installée, elle ne guérit pas seule : seul un chirurgien-dentiste peut nettoyer la zone atteinte et restaurer la dent. Plus on consulte tôt, plus le soin est simple. En prévention, l'hygiène quotidienne et les contrôles réguliers restent essentiels.",
    steps: [
      "Consulter un chirurgien-dentiste dès l'apparition d'une sensibilité, d'une douleur ou d'une tache sur une dent.",
      "Laisser le praticien examiner la bouche et, si besoin, réaliser une radiographie pour évaluer l'étendue de l'atteinte.",
      "Suivre le soin proposé pour nettoyer la partie abîmée et restaurer la dent afin de préserver sa fonction.",
      "Adopter au quotidien un brossage soigneux et limiter les aliments et boissons sucrés, selon les conseils reçus.",
      "Programmer des contrôles réguliers pour dépister d'éventuelles nouvelles caries à un stade précoce.",
    ],
    summaryAr:
      "التسوس هو تلف تدريجي للسن تسببه البكتيريا، ولا يشفى من تلقاء نفسه بمجرد ظهوره: وحده طبيب الأسنان يمكنه تنظيف المنطقة المصابة وترميم السن. كلما استشرت مبكرا كان العلاج أبسط. وللوقاية، تبقى النظافة اليومية والفحوص المنتظمة أساسية.",
    stepsAr: [
      "استشر طبيب أسنان فور ظهور حساسية أو ألم أو بقعة على أحد الأسنان.",
      "دع الطبيب يفحص الفم، وإذا لزم الأمر يجري صورة إشعاعية لتقدير مدى الإصابة.",
      "اتبع العلاج المقترح لتنظيف الجزء المتضرر وترميم السن حفاظا على وظيفته.",
      "احرص يوميا على تفريش دقيق للأسنان وقلّل من الأطعمة والمشروبات السكرية وفق النصائح المتلقاة.",
      "احجز فحوصا منتظمة لاكتشاف أي تسوس جديد في مرحلة مبكرة.",
    ],
    relatedTopicSlugs: ["mal-de-dents", "abces-dentaire", "gingivite"],
  },
  {
    slug: "aphtes",
    summary:
      "Les aphtes sont de petites ulcérations douloureuses de la bouche, le plus souvent bénignes et spontanément résolutives en une à deux semaines. La prise en charge vise surtout à soulager la gêne et à identifier d'éventuels facteurs déclenchants. Des aphtes très fréquents, étendus ou persistants justifient l'avis d'un professionnel de santé.",
    steps: [
      "Repérer d'éventuels facteurs favorisants : certains aliments, un frottement dentaire, la fatigue ou le stress.",
      "Adopter une hygiène buccale douce et privilégier des aliments qui n'irritent pas la lésion pendant la cicatrisation.",
      "Surveiller l'évolution : un aphte isolé disparaît en général en une à deux semaines.",
      "Consulter un professionnel de santé si les aphtes sont récidivants, très nombreux, très douloureux ou durent au-delà de deux semaines.",
    ],
    summaryAr:
      "القلاع الفموي عبارة عن تقرحات صغيرة مؤلمة في الفم، غالبا حميدة وتلتئم تلقائيا خلال أسبوع إلى أسبوعين. تهدف الرعاية أساسا إلى تخفيف الانزعاج وتحديد العوامل المحفزة المحتملة. أما القلاع المتكرر جدا أو الواسع أو المستمر فيستدعي رأي مختص في الصحة.",
    stepsAr: [
      "تعرّف على العوامل المحفزة المحتملة: بعض الأطعمة، احتكاك سنّي، الإرهاق أو التوتر.",
      "اعتمد نظافة فموية لطيفة وفضّل أطعمة لا تهيّج التقرح أثناء الالتئام.",
      "راقب التطور: القلاع المنعزل يزول عادة خلال أسبوع إلى أسبوعين.",
      "استشر مختصا في الصحة إذا كان القلاع متكررا أو كثير العدد أو شديد الألم أو استمر أكثر من أسبوعين.",
    ],
    relatedTopicSlugs: ["mal-de-dents"],
  },
  {
    slug: "bruxisme",
    summary:
      "Le bruxisme est le fait de serrer ou grincer des dents, souvent la nuit et sans s'en rendre compte. Il peut user les dents et provoquer des douleurs de la mâchoire ou des maux de tête. La prise en charge associe la réduction des tensions, la protection des dents et le traitement des causes, sous supervision d'un professionnel.",
    steps: [
      "Reconnaître les signes : dents usées, mâchoire douloureuse au réveil, maux de tête ou bruit de grincement signalé par l'entourage.",
      "Consulter un chirurgien-dentiste pour évaluer l'état des dents et de l'articulation de la mâchoire.",
      "Explorer les facteurs contributifs, notamment le stress et les troubles du sommeil, avec un professionnel.",
      "Envisager avec le praticien une protection dentaire adaptée pour limiter l'usure la nuit.",
      "Mettre en place des mesures de détente et un suivi régulier pour surveiller l'évolution.",
    ],
    summaryAr:
      "صريف الأسنان هو إطباق الأسنان أو حكّها ببعضها، غالبا أثناء الليل ودون وعي. قد يؤدي إلى تآكل الأسنان وآلام في الفك أو صداع. تجمع الرعاية بين تخفيف التوتر وحماية الأسنان ومعالجة الأسباب، تحت إشراف مختص.",
    stepsAr: [
      "تعرّف على العلامات: أسنان متآكلة، فك مؤلم عند الاستيقاظ، صداع أو صوت صرير يلاحظه المحيطون.",
      "استشر طبيب أسنان لتقييم حالة الأسنان ومفصل الفك.",
      "استكشف مع مختص العوامل المساهمة، خصوصا التوتر واضطرابات النوم.",
      "ناقش مع الطبيب وسيلة حماية سنّية مناسبة للحد من التآكل ليلا.",
      "اعتمد تدابير للاسترخاء ومتابعة منتظمة لمراقبة التطور.",
    ],
    relatedTopicSlugs: ["stress", "mal-de-tete"],
  },
  {
    slug: "abces-dentaire",
    summary:
      "L'abcès dentaire est une infection qui provoque une accumulation de pus, avec une douleur souvent intense et parfois un gonflement. C'est une urgence dentaire : il ne disparaît pas seul et peut s'étendre. Une consultation rapide auprès d'un chirurgien-dentiste est nécessaire pour traiter l'infection et la dent en cause.",
    steps: [
      "Consulter rapidement un chirurgien-dentiste dès l'apparition d'une douleur forte, d'un gonflement ou d'un goût inhabituel dans la bouche.",
      "Décrire les symptômes et laisser le praticien examiner la dent, au besoin avec une radiographie.",
      "Suivre la prise en charge proposée pour évacuer l'infection et traiter la dent concernée.",
      "Consulter sans délai en cas de fièvre, de gonflement du visage ou de difficulté à avaler ou respirer.",
      "Assurer un suivi et renforcer l'hygiène bucco-dentaire pour éviter une récidive.",
    ],
    summaryAr:
      "الخراج السني عدوى تسبب تجمّع القيح، مع ألم غالبا شديد وأحيانا تورم. إنه حالة طارئة في طب الأسنان: لا يزول وحده وقد ينتشر. تلزم استشارة سريعة لطبيب الأسنان لمعالجة العدوى والسن المسبب لها.",
    stepsAr: [
      "استشر طبيب أسنان بسرعة فور ظهور ألم قوي أو تورم أو طعم غير معتاد في الفم.",
      "صف الأعراض ودع الطبيب يفحص السن، بصورة إشعاعية عند الحاجة.",
      "اتبع الرعاية المقترحة لتصريف العدوى ومعالجة السن المعني.",
      "استشر دون تأخير في حال الحمى أو تورم الوجه أو صعوبة البلع أو التنفس.",
      "احرص على المتابعة وتعزيز نظافة الفم والأسنان لتفادي الانتكاس.",
    ],
    relatedTopicSlugs: ["mal-de-dents", "carie-dentaire", "gingivite"],
  },
  {
    slug: "acouphenes",
    summary:
      "Les acouphènes sont des sons (bourdonnements, sifflements) perçus sans source extérieure. Ils sont fréquents et rarement graves, mais peuvent gêner le sommeil et la concentration. La prise en charge commence par un bilan pour en rechercher la cause, puis vise à réduire la gêne et à mieux vivre avec, sous suivi d'un professionnel.",
    steps: [
      "Consulter un médecin ORL pour un examen de l'audition et la recherche d'une cause éventuelle.",
      "Protéger ses oreilles du bruit fort et limiter l'exposition prolongée aux sons intenses.",
      "Mettre en place, avec le professionnel, des approches pour réduire la gêne et détourner l'attention du bruit.",
      "Prendre en compte le stress et le sommeil, qui peuvent amplifier la perception des acouphènes.",
      "Consulter rapidement si les acouphènes sont soudains, d'un seul côté ou accompagnés d'une baisse d'audition ou de vertiges.",
    ],
    summaryAr:
      "الطنين هو أصوات (أزيز أو صفير) تُسمع دون مصدر خارجي. وهو شائع ونادرا ما يكون خطيرا، لكنه قد يعيق النوم والتركيز. تبدأ الرعاية بتقييم للبحث عن السبب، ثم تهدف إلى تخفيف الانزعاج والتأقلم معه، تحت متابعة مختص.",
    stepsAr: [
      "استشر طبيب أنف وأذن وحنجرة لفحص السمع والبحث عن سبب محتمل.",
      "احمِ أذنيك من الضجيج القوي وقلّل التعرض المطوّل للأصوات الشديدة.",
      "اعتمد مع المختص أساليب لتخفيف الانزعاج وصرف الانتباه عن الصوت.",
      "خذ بعين الاعتبار التوتر والنوم، إذ قد يضخّمان الإحساس بالطنين.",
      "استشر بسرعة إذا كان الطنين مفاجئا أو في أذن واحدة أو مصحوبا بتراجع السمع أو الدوار.",
    ],
    relatedTopicSlugs: ["vertiges", "stress"],
  },
  {
    slug: "ballonnements",
    summary:
      "Les ballonnements sont une sensation de ventre gonflé, souvent liée à l'alimentation, au transit ou au stress. Ils sont généralement bénins et s'améliorent avec des ajustements simples du mode de vie. Un médecin peut aider à identifier des déclencheurs et écarter une cause sous-jacente lorsque la gêne est fréquente ou persistante.",
    steps: [
      "Observer les moments d'apparition et repérer les aliments ou situations qui semblent déclencher la gêne.",
      "Manger lentement, à horaires réguliers, et limiter les aliments qui provoquent des gaz selon votre ressenti.",
      "Bouger régulièrement et prêter attention au stress, qui influence la digestion.",
      "Consulter un médecin si les ballonnements sont fréquents, très gênants ou s'accompagnent d'autres symptômes.",
      "Consulter sans tarder en cas de perte de poids, de sang dans les selles ou de douleur intense.",
    ],
    summaryAr:
      "الانتفاخ هو إحساس بامتلاء البطن، غالبا مرتبط بالتغذية أو حركة الأمعاء أو التوتر. عادة ما يكون حميدا ويتحسن بتعديلات بسيطة في نمط الحياة. يمكن للطبيب المساعدة في تحديد المحفزات واستبعاد سبب كامن عندما يكون الانزعاج متكررا أو مستمرا.",
    stepsAr: [
      "لاحظ أوقات الظهور وحدّد الأطعمة أو الحالات التي يبدو أنها تثير الانزعاج.",
      "تناول الطعام ببطء وفي مواعيد منتظمة، وقلّل الأطعمة المسببة للغازات حسب إحساسك.",
      "مارس الحركة بانتظام وانتبه للتوتر لأنه يؤثر في الهضم.",
      "استشر طبيبا إذا كان الانتفاخ متكررا أو مزعجا جدا أو مصحوبا بأعراض أخرى.",
      "استشر دون تأخير في حال فقدان الوزن أو دم في البراز أو ألم شديد.",
    ],
    relatedTopicSlugs: ["flatulences", "mal-de-ventre"],
  },
  {
    slug: "burn-out",
    summary:
      "Le burn-out est un épuisement profond lié au travail, mêlant fatigue durable, perte de motivation et sentiment d'inefficacité. Il ne se règle pas par un simple repos et nécessite d'être reconnu tôt. La prise en charge associe une mise à distance des facteurs de stress et un accompagnement par un professionnel de santé.",
    steps: [
      "Reconnaître les signaux d'alerte : fatigue qui persiste malgré le repos, cynisme, difficultés de concentration et perte de sens.",
      "En parler à un professionnel de santé (médecin ou psychologue) pour faire le point et être orienté.",
      "Aménager, quand c'est possible, une mise à distance des facteurs de stress et un temps de récupération.",
      "Mettre en place un accompagnement pour retrouver un équilibre et prévenir la rechute.",
      "Consulter rapidement en cas de détresse importante, d'idées noires ou d'incapacité à fonctionner au quotidien.",
    ],
    summaryAr:
      "الاحتراق النفسي إرهاق عميق مرتبط بالعمل، يجمع بين تعب مستمر وفقدان الحافز والشعور بعدم الفعالية. لا يُحلّ براحة بسيطة ويجب التعرّف عليه مبكرا. تجمع الرعاية بين الابتعاد عن عوامل التوتر ومواكبة من مختص في الصحة.",
    stepsAr: [
      "تعرّف على علامات الإنذار: تعب يستمر رغم الراحة، سلبية، صعوبة في التركيز وفقدان للمعنى.",
      "تحدّث إلى مختص في الصحة (طبيب أو أخصائي نفسي) لتقييم الوضع والتوجيه.",
      "رتّب، متى أمكن، ابتعادا عن عوامل التوتر ووقتا للتعافي.",
      "اعتمد مواكبة لاستعادة التوازن والوقاية من الانتكاس.",
      "استشر بسرعة في حال ضائقة كبيرة أو أفكار سوداء أو عجز عن أداء المهام اليومية.",
    ],
    relatedTopicSlugs: ["stress", "anxiete"],
  },
  {
    slug: "arret-du-tabac",
    summary:
      "Arrêter de fumer est le geste le plus bénéfique pour la santé, et les bénéfices apparaissent très vite. Le sevrage est plus facile lorsqu'il est préparé et accompagné. Un professionnel de santé peut proposer un plan adapté, un soutien face aux envies et un suivi pour tenir dans la durée et éviter la rechute.",
    steps: [
      "Choisir une date d'arrêt et noter ses motivations personnelles pour s'y référer dans les moments difficiles.",
      "En parler à un professionnel de santé (médecin, pharmacien ou tabacologue) pour être accompagné et évaluer les aides disponibles.",
      "Anticiper les situations à risque et préparer des stratégies pour gérer les envies de fumer.",
      "S'appuyer sur son entourage et sur un suivi régulier pour rester motivé.",
      "Ne pas se décourager en cas de rechute : la reprise d'une nouvelle tentative fait partie du parcours, avec l'aide d'un professionnel.",
    ],
    summaryAr:
      "الإقلاع عن التدخين هو أنفع خطوة للصحة، وتظهر فوائده بسرعة كبيرة. يكون الإقلاع أسهل حين يُحضَّر له ويُواكب. يمكن لمختص في الصحة أن يقترح خطة مناسبة ودعما لمواجهة الرغبة الملحّة ومتابعة للاستمرار وتفادي الانتكاس.",
    stepsAr: [
      "اختر تاريخا للإقلاع ودوّن دوافعك الشخصية للرجوع إليها في اللحظات الصعبة.",
      "تحدّث إلى مختص في الصحة (طبيب أو صيدلي أو أخصائي في التبغ) للمواكبة وتقييم المساعدات المتاحة.",
      "توقّع المواقف الخطرة وحضّر استراتيجيات للتعامل مع الرغبة في التدخين.",
      "استند إلى محيطك وإلى متابعة منتظمة للحفاظ على الحافز.",
      "لا تيأس عند الانتكاس: بدء محاولة جديدة جزء من المسار، بمساعدة مختص.",
    ],
    relatedTopicSlugs: ["addiction", "stress"],
  },
  {
    slug: "allergie",
    summary:
      "Une allergie est une réaction excessive du système immunitaire à une substance habituellement inoffensive. Les symptômes varient (nez, yeux, peau, respiration) et peuvent être gênants. La prise en charge repose sur l'identification des déclencheurs, leur évitement et un suivi médical ; une réaction sévère est une urgence vitale.",
    steps: [
      "Noter les symptômes et les circonstances de survenue pour aider à repérer les déclencheurs possibles.",
      "Consulter un médecin, qui pourra orienter vers un bilan allergologique si nécessaire.",
      "Réduire l'exposition aux facteurs identifiés dans l'environnement et le quotidien.",
      "Suivre le plan de prise en charge défini avec le professionnel de santé.",
      "Appeler les secours immédiatement en cas de gonflement du visage, de gêne à respirer ou de malaise : ce sont des signes de réaction grave.",
    ],
    summaryAr:
      "الحساسية تفاعل مفرط من الجهاز المناعي تجاه مادة غير ضارة عادة. تتنوع الأعراض (الأنف، العينان، الجلد، التنفس) وقد تكون مزعجة. تقوم الرعاية على تحديد المحفزات وتجنّبها ومتابعة طبية؛ والتفاعل الشديد حالة طارئة تهدد الحياة.",
    stepsAr: [
      "دوّن الأعراض وظروف ظهورها للمساعدة في تحديد المحفزات المحتملة.",
      "استشر طبيبا، إذ قد يوجّهك إلى تقييم للحساسية عند الحاجة.",
      "قلّل التعرّض للعوامل المحددة في محيطك وحياتك اليومية.",
      "اتبع خطة الرعاية المحددة مع مختص في الصحة.",
      "اتصل بالإسعاف فورا في حال تورم الوجه أو صعوبة التنفس أو الإغماء: فهذه علامات تفاعل خطير.",
    ],
    relatedTopicSlugs: ["allergie-alimentaire", "eczema"],
  },
  {
    slug: "gingivite",
    summary:
      "La gingivite est une inflammation des gencives, souvent due à l'accumulation de plaque dentaire ; elles deviennent rouges, gonflées et saignent facilement. Prise tôt, elle est réversible grâce à une bonne hygiène et à un détartrage. Sans soin, elle peut évoluer vers une atteinte plus profonde des tissus de soutien de la dent.",
    steps: [
      "Repérer les signes : gencives rouges, gonflées ou qui saignent lors du brossage.",
      "Consulter un chirurgien-dentiste pour un examen et, si besoin, un nettoyage professionnel des dents.",
      "Améliorer l'hygiène quotidienne avec un brossage soigneux et un nettoyage entre les dents.",
      "Limiter les facteurs aggravants, notamment le tabac, selon les conseils reçus.",
      "Assurer des contrôles réguliers pour éviter la récidive et une évolution vers une atteinte plus grave.",
    ],
    summaryAr:
      "التهاب اللثة تهيّج يصيب اللثة، غالبا بسبب تراكم البلاك السني؛ فتصبح حمراء ومتورمة وتنزف بسهولة. إذا عولج مبكرا كان قابلا للتراجع بفضل نظافة جيدة وإزالة الجير. ودون علاج قد يتطور إلى إصابة أعمق في الأنسجة الداعمة للسن.",
    stepsAr: [
      "تعرّف على العلامات: لثة حمراء أو متورمة أو تنزف عند التفريش.",
      "استشر طبيب أسنان للفحص وإجراء تنظيف احترافي للأسنان عند الحاجة.",
      "حسّن النظافة اليومية بتفريش دقيق وتنظيف ما بين الأسنان.",
      "قلّل العوامل المفاقمة، خصوصا التبغ، وفق النصائح المتلقاة.",
      "احرص على فحوص منتظمة لتفادي الانتكاس والتطور نحو إصابة أخطر.",
    ],
    relatedTopicSlugs: ["mauvaise-haleine", "carie-dentaire"],
  },
  {
    slug: "urticaire",
    summary:
      "L'urticaire se manifeste par des plaques rouges en relief qui démangent, apparaissant puis disparaissant sur la peau. Elle est le plus souvent bénigne et passagère. La prise en charge cherche à en identifier le déclencheur et à soulager les démangeaisons ; un gonflement du visage ou une gêne respiratoire imposent une consultation urgente.",
    steps: [
      "Noter le moment d'apparition et les facteurs possibles (aliment, contact, chaleur, infection récente).",
      "Éviter, quand c'est possible, le déclencheur suspecté et les frottements sur les zones atteintes.",
      "Consulter un médecin si les poussées se répètent, durent ou gênent le quotidien.",
      "Suivre les conseils du professionnel pour apaiser les démangeaisons et surveiller l'évolution.",
      "Appeler les secours en urgence en cas de gonflement des lèvres ou du visage, ou de difficulté à respirer.",
    ],
    summaryAr:
      "الشرى يظهر على شكل بقع حمراء بارزة مثيرة للحكة، تظهر ثم تختفي على الجلد. وهو غالبا حميد وعابر. تسعى الرعاية إلى تحديد المحفّز وتخفيف الحكة؛ أما تورّم الوجه أو ضيق التنفس فيفرضان استشارة عاجلة.",
    stepsAr: [
      "دوّن وقت الظهور والعوامل المحتملة (طعام، ملامسة، حرارة، عدوى حديثة).",
      "تجنّب متى أمكن المحفّز المشتبه به واحتكاك المناطق المصابة.",
      "استشر طبيبا إذا تكررت النوبات أو استمرت أو أعاقت حياتك اليومية.",
      "اتبع نصائح المختص لتهدئة الحكة ومراقبة التطور.",
      "اتصل بالإسعاف بشكل عاجل في حال تورم الشفتين أو الوجه أو صعوبة التنفس.",
    ],
    relatedTopicSlugs: ["demangeaisons", "allergie", "allergie-alimentaire"],
  },
];
