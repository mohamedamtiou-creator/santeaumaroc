/**
 * Rédige les réponses UNIQUES des pages intention « quel médecin pour X ? »
 * (sort du near-duplicate des réponses composées). Pose `intentAnswer` (FR) et
 * `intentAnswerAr` (AR) sur les topics dont `intentSlug` est déjà renseigné.
 *
 * La QUESTION reste composée (`Quel médecin consulter pour X ?` / la variante
 * AR) : déjà unique par symptôme et calée sur la requête réelle des patients.
 *
 * Contenu = AIGUILLAGE (quel spécialiste, généraliste en 1er recours, urgences
 * renvoyées à l'encadré red-flags relu du topic). PAS de diagnostic ni de
 * posologie. Indexation sous le verrou YMYL du topic (`reviewedAt`/`arReviewedAt`).
 *
 *   npx tsx --env-file=.env scripts/seed-intent-content.ts
 */
import { prisma } from "@/lib/prisma";

const CONTENT: Record<string, { fr: string; ar: string }> = {
  anxiete: {
    fr: "Pour une anxiété qui dure et retentit sur le sommeil, le travail ou la vie quotidienne, consultez d'abord votre médecin généraliste : il élimine une cause physique et vous oriente. En cas de crises répétées, d'idées noires ou de forte détresse, un psychiatre (ou un psychologue pour un suivi) est le spécialiste adapté.",
    ar: "إذا استمرّ القلق وأثّر على نومك أو عملك أو حياتك اليومية، ابدأ باستشارة طبيب عام يستبعد سببًا جسديًا ويوجّهك. وعند نوبات متكرّرة أو أفكار سوداء أو ضيق شديد، يكون طبيب نفسي (أو أخصائي نفسي للمتابعة) هو المختصّ المناسب.",
  },
  "brulures-urinaires": {
    fr: "Des brûlures en urinant évoquent souvent une infection urinaire : un médecin généraliste peut la diagnostiquer et la traiter rapidement. En cas de récidives, de sang dans les urines, de douleurs lombaires ou chez l'homme, un urologue approfondit le bilan. Consultez sans tarder en cas de fièvre ou de douleur au dos.",
    ar: "غالبًا ما تدلّ الحُرقة عند التبوّل على التهاب بولي يمكن لطبيب عام تشخيصه وعلاجه بسرعة. وعند تكرّر الحالة أو وجود دم في البول أو ألم بالخاصرة أو لدى الرجل، يُعمّق طبيب المسالك البولية الفحص. استشِر دون تأخير عند الحمّى أو ألم الظهر.",
  },
  constipation: {
    fr: "Une constipation passagère se gère avec votre médecin généraliste (hydratation, fibres, adaptation des habitudes). Si elle s'installe, alterne avec des diarrhées, s'accompagne de sang, de douleurs ou d'un amaigrissement, un gastro-entérologue recherche une cause digestive. Ne laissez pas traîner un changement récent et durable du transit.",
    ar: "يمكن التعامل مع الإمساك العابر مع طبيب عام (الترطيب، الألياف، تعديل العادات). وإذا استمرّ أو تناوب مع إسهال أو صاحبه دم أو ألم أو فقدان وزن، يبحث أخصائي أمراض الجهاز الهضمي عن سبب هضمي. لا تُهمل تغيّرًا حديثًا ودائمًا في التبرّز.",
  },
  demangeaisons: {
    fr: "Des démangeaisons localisées ou passagères relèvent d'abord du médecin généraliste. Si elles persistent, s'étendent, s'accompagnent de lésions ou de plaques, ou résistent aux traitements simples, le dermatologue est le spécialiste de la peau à consulter. Des démangeaisons de tout le corps sans éruption peuvent aussi justifier un bilan.",
    ar: "الحكة الموضعية أو العابرة تُقيَّم أولًا مع طبيب عام. وإذا استمرّت أو انتشرت أو صاحبتها آفات وبُقع أو قاومت العلاجات البسيطة، يكون طبيب الأمراض الجلدية هو المختصّ. والحكة المعمّمة دون طفح قد تستوجب أيضًا فحصًا أعمق.",
  },
  diarrhee: {
    fr: "Une diarrhée aiguë guérit le plus souvent seule ; un médecin généraliste suffit pour évaluer la déshydratation et traiter. Si elle dure plus de quelques semaines, revient, contient du sang ou s'accompagne d'un amaigrissement, consultez un gastro-entérologue. Surveillez surtout l'hydratation chez l'enfant et la personne âgée.",
    ar: "غالبًا ما يشفى الإسهال الحاد وحده، ويكفي طبيب عام لتقييم الجفاف والعلاج. أمّا إذا دام أسابيع أو تكرّر أو حوى دمًا أو صاحبه فقدان وزن، فاستشِر أخصائي أمراض الجهاز الهضمي. راقب الترطيب خصوصًا عند الطفل والمُسنّ.",
  },
  "douleur-thoracique": {
    fr: "Une douleur à la poitrine intense, oppressante, qui irradie au bras ou à la mâchoire, ou accompagnée d'essoufflement, est une urgence : appelez les secours. Hors urgence, pour une gêne récurrente à l'effort ou des palpitations, le cardiologue est le spécialiste indiqué ; votre médecin généraliste peut organiser le premier bilan.",
    ar: "ألم الصدر الشديد أو الضاغط الذي ينتشر إلى الذراع أو الفكّ، أو المصحوب بضيق نفس، حالة طارئة: اتصل بالإسعاف. وخارج الطوارئ، عند انزعاج متكرّر مع المجهود أو خفقان، يكون طبيب القلب هو المختصّ، ويمكن لطبيبك العام تنظيم الفحص الأول.",
  },
  "douleur-au-genou": {
    fr: "Après un traumatisme, un blocage ou un gonflement du genou, orientez-vous vers un chirurgien orthopédiste (traumatologie). Pour une douleur d'usure ou inflammatoire sans accident, un rhumatologue ou votre médecin généraliste peut débuter le bilan. Un kinésithérapeute complète souvent la prise en charge.",
    ar: "بعد رضّة أو انغلاق أو تورّم في الركبة، توجّه إلى جرّاح العظام (طب الرضوض). أمّا ألم التآكل أو الالتهاب دون حادث، فيمكن لطبيب الروماتيزم أو طبيبك العام بدء الفحص. وكثيرًا ما يُكمِل أخصائي العلاج الطبيعي الرعاية.",
  },
  "douleurs-articulaires": {
    fr: "Des douleurs touchant plusieurs articulations, avec raideur matinale ou gonflement, orientent vers le rhumatologue, spécialiste des articulations. Votre médecin généraliste réalise le premier examen et les analyses de débrouillage. Consultez plus vite si une articulation est chaude, rouge et très douloureuse, ou en cas de fièvre associée.",
    ar: "آلام تصيب عدّة مفاصل مع تيبّس صباحي أو تورّم توجّه إلى طبيب الروماتيزم، مختصّ المفاصل. ويُجري طبيبك العام الفحص الأول والتحاليل الأولية. استشِر أسرع إذا كان مفصل حارًّا وأحمر وشديد الألم، أو عند حمّى مصاحبة.",
  },
  "eruption-cutanee": {
    fr: "Une éruption cutanée qui persiste, s'étend ou récidive relève du dermatologue. Votre médecin généraliste peut traiter les formes simples et juger de l'urgence. Consultez rapidement si l'éruption s'accompagne de fièvre, d'un gonflement du visage, de difficultés à respirer ou de cloques étendues.",
    ar: "الطفح الجلدي الذي يستمرّ أو ينتشر أو يتكرّر يعود إلى طبيب الأمراض الجلدية. ويمكن لطبيبك العام علاج الحالات البسيطة وتقدير درجة الاستعجال. استشِر بسرعة إذا صاحب الطفح حمّى أو تورّم في الوجه أو صعوبة في التنفّس أو فقاعات واسعة.",
  },
  essoufflement: {
    fr: "Un essoufflement d'apparition brutale ou au repos est une urgence : appelez les secours. Pour une gêne respiratoire qui s'installe à l'effort, un pneumologue explore les poumons ; si une origine cardiaque est suspectée, un cardiologue. Votre médecin généraliste oriente vers le bon spécialiste après un premier examen.",
    ar: "ضيق النفس المفاجئ أو أثناء الراحة حالة طارئة: اتصل بالإسعاف. أمّا صعوبة التنفّس التي تظهر تدريجيًا مع المجهود، فيستكشف الرئتين طبيب الجهاز التنفسي؛ وإذا اشتُبِه في أصل قلبي، فطبيب القلب. ويوجّهك طبيبك العام إلى المختصّ المناسب بعد فحص أوّلي.",
  },
  fatigue: {
    fr: "Une fatigue persistante s'explore d'abord avec le médecin généraliste : il recherche les causes fréquentes (sommeil, anémie, thyroïde, stress, infections) par un examen et des analyses, puis oriente vers un spécialiste si besoin. Consultez plus vite si la fatigue est majeure, d'installation rapide ou accompagnée d'un amaigrissement.",
    ar: "التعب المستمرّ يُستكشف أولًا مع طبيب عام يبحث عن الأسباب الشائعة (النوم، فقر الدم، الغدة الدرقية، التوتر، العدوى) بفحص وتحاليل، ثم يوجّه إلى مختصّ عند الحاجة. استشِر أسرع إذا كان التعب شديدًا أو سريع الظهور أو مصحوبًا بفقدان وزن.",
  },
  fievre: {
    fr: "Une fièvre isolée de courte durée s'évalue avec le médecin généraliste, qui en cherche la cause et juge de la nécessité d'examens. Consultez sans tarder si la fièvre est élevée, dure plusieurs jours, revient, ou s'accompagne de raideur de nuque, de confusion, d'essoufflement ou d'une forte altération de l'état général.",
    ar: "الحمّى المعزولة قصيرة المدّة تُقيَّم مع طبيب عام يبحث عن سببها ويقرّر الحاجة إلى فحوص. استشِر دون تأخير إذا كانت مرتفعة أو استمرّت أيامًا أو تكرّرت، أو صاحبها تيبّس الرقبة أو تشوّش أو ضيق نفس أو تدهور واضح في الحالة العامة.",
  },
  insomnie: {
    fr: "Pour une insomnie ponctuelle, le médecin généraliste évalue les habitudes de sommeil et les facteurs déclenchants. Si les troubles durent, retentissent sur la journée ou s'accompagnent de ronflements et de pauses respiratoires, un médecin du sommeil approfondit le bilan. Un suivi psychologique aide en cas d'anxiété associée.",
    ar: "للأرق العابر، يُقيّم طبيب عام عادات النوم والعوامل المحفّزة. وإذا دامت الاضطرابات وأثّرت على النهار أو صاحبها شخير وتوقّفات في التنفّس، يعمّق طبيب اضطرابات النوم الفحص. وتساعد المتابعة النفسية عند وجود قلق مصاحب.",
  },
  "mal-de-dos": {
    fr: "La plupart des maux de dos communs s'améliorent avec le médecin généraliste et un kinésithérapeute. Si la douleur persiste, descend dans la jambe ou s'accompagne d'une raideur inflammatoire, un rhumatologue approfondit. Consultez en urgence en cas de perte de force, de troubles urinaires ou de fièvre associée.",
    ar: "معظم آلام الظهر الشائعة تتحسّن مع طبيب عام وأخصائي علاج طبيعي. وإذا استمرّ الألم أو نزل إلى الساق أو صاحبه تيبّس التهابي، يعمّق طبيب الروماتيزم الفحص. استشِر عاجلًا عند فقدان القوة أو اضطرابات بولية أو حمّى مصاحبة.",
  },
  "mal-de-gorge": {
    fr: "Un mal de gorge aigu est le plus souvent viral et s'évalue avec le médecin généraliste. Si les épisodes se répètent, durent, ou s'accompagnent d'une gêne à avaler ou d'une voix modifiée durable, un ORL examine la gorge. Consultez vite en cas de difficulté à respirer ou à ouvrir la bouche.",
    ar: "ألم الحلق الحاد غالبًا فيروسي ويُقيَّم مع طبيب عام. وإذا تكرّرت النوبات أو دامت أو صاحبها ألم عند البلع أو تغيّر دائم في الصوت، يفحص طبيب الأنف والأذن والحنجرة الحلق. استشِر بسرعة عند صعوبة التنفّس أو فتح الفم.",
  },
  "mal-de-tete": {
    fr: "Les maux de tête courants se gèrent avec le médecin généraliste. Pour des céphalées fréquentes, invalidantes ou d'allure migraineuse, le neurologue est le spécialiste indiqué. Consultez en urgence pour un mal de tête brutal et intense inhabituel, ou associé à de la fièvre, une raideur de nuque, des troubles de la vue ou de la parole.",
    ar: "الصداع الشائع يُدار مع طبيب عام. أمّا الصداع المتكرّر أو المُعيق أو ذو الطابع الشقيقي، فطبيب الأعصاب هو المختصّ. استشِر عاجلًا عند صداع مفاجئ وشديد غير معتاد، أو مع حمّى أو تيبّس الرقبة أو اضطراب الرؤية أو النطق.",
  },
  "mal-de-ventre": {
    fr: "Un mal de ventre passager s'évalue avec le médecin généraliste. S'il persiste, revient, ou s'accompagne de troubles du transit, de sang ou d'un amaigrissement, un gastro-entérologue recherche une cause digestive. Consultez en urgence pour une douleur brutale et intense, un ventre dur, des vomissements ou de la fièvre.",
    ar: "ألم البطن العابر يُقيَّم مع طبيب عام. وإذا استمرّ أو تكرّر أو صاحبه اضطراب في التبرّز أو دم أو فقدان وزن، يبحث أخصائي أمراض الجهاز الهضمي عن سبب هضمي. استشِر عاجلًا عند ألم مفاجئ وشديد أو بطن متصلّب أو تقيّؤ أو حمّى.",
  },
  "nausees-et-vomissements": {
    fr: "Des nausées et vomissements passagers s'évaluent avec le médecin généraliste, surtout pour prévenir la déshydratation. S'ils persistent, reviennent ou s'accompagnent de douleurs, d'un amaigrissement ou de sang, un gastro-entérologue en cherche la cause. Consultez vite en cas de vomissements incoercibles, de fort mal de tête ou de signes de déshydratation.",
    ar: "الغثيان والتقيّؤ العابران يُقيَّمان مع طبيب عام، خاصّة لتفادي الجفاف. وإذا استمرّا أو تكرّرا أو صاحبهما ألم أو فقدان وزن أو دم، يبحث أخصائي أمراض الجهاز الهضمي عن السبب. استشِر بسرعة عند تقيّؤ لا يتوقّف أو صداع شديد أو علامات جفاف.",
  },
  "perte-de-poids-inexpliquee": {
    fr: "Une perte de poids importante sans régime ni raison évidente doit toujours être explorée. Le médecin généraliste réalise le premier bilan ; un interniste (médecine interne) coordonne la recherche de la cause quand plusieurs pistes sont possibles. Consultez sans attendre, surtout si s'y ajoutent fatigue, fièvre ou sueurs nocturnes.",
    ar: "فقدان وزن ملحوظ دون حِمية أو سبب واضح يجب استكشافه دائمًا. يُجري طبيب عام الفحص الأول، ويُنسّق طبيب الطب الباطني البحث عن السبب حين تتعدّد الاحتمالات. استشِر دون انتظار، خصوصًا إذا أُضيف إليه تعب أو حمّى أو تعرّق ليلي.",
  },
  "saignement-de-nez": {
    fr: "Un saignement de nez cède le plus souvent en comprimant les narines quelques minutes ; le médecin généraliste suffit pour les cas simples. S'il se répète, est abondant ou difficile à arrêter, un ORL examine et traite la zone. Consultez en urgence si le saignement est massif, prolongé ou survient après un traumatisme.",
    ar: "غالبًا يتوقّف نزيف الأنف بالضغط على المنخرين بضع دقائق، ويكفي طبيب عام للحالات البسيطة. وإذا تكرّر أو كان غزيرًا أو صعب الإيقاف، يفحص طبيب الأنف والأذن والحنجرة المنطقة ويعالجها. استشِر عاجلًا عند نزيف كثيف أو مطوّل أو بعد رضّة.",
  },
  toux: {
    fr: "Une toux aiguë accompagne souvent un rhume et s'évalue avec le médecin généraliste. Si elle dure plusieurs semaines, revient, ou s'accompagne d'essoufflement, de sang ou d'un amaigrissement, un pneumologue explore les poumons. Au Maroc, une toux prolongée justifie d'écarter la tuberculose.",
    ar: "السعال الحاد يصاحب الزكام غالبًا ويُقيَّم مع طبيب عام. وإذا دام أسابيع أو تكرّر أو صاحبه ضيق نفس أو دم أو فقدان وزن، يستكشف طبيب الجهاز التنفسي الرئتين. وفي المغرب، يستوجب السعال المطوّل استبعاد السلّ.",
  },
  "troubles-de-la-vue": {
    fr: "Toute baisse ou tout trouble de la vue justifie un avis de l'ophtalmologue, spécialiste des yeux. Consultez en urgence pour une perte de vision brutale, des éclairs lumineux, un voile devant l'œil, une douleur oculaire intense ou une vision double d'apparition soudaine, qui peuvent traduire une atteinte grave.",
    ar: "أيّ انخفاض أو اضطراب في الرؤية يستوجب رأي طبيب العيون، مختصّ العين. استشِر عاجلًا عند فقدان مفاجئ للرؤية أو ومضات ضوئية أو ستار أمام العين أو ألم عيني شديد أو ازدواج مفاجئ في الرؤية، فقد تدلّ على إصابة خطيرة.",
  },
  vertiges: {
    fr: "Des vertiges avec sensation de rotation orientent souvent vers un problème de l'oreille interne, qu'un ORL explore. Le médecin généraliste réalise le premier examen et écarte d'autres causes. Consultez en urgence si les vertiges s'accompagnent de maux de tête intenses, de troubles de la parole, de la vue ou de la force.",
    ar: "الدوار مع إحساس بالدوران يوجّه غالبًا إلى مشكلة في الأذن الداخلية يستكشفها طبيب الأنف والأذن والحنجرة. ويُجري طبيب عام الفحص الأول ويستبعد أسبابًا أخرى. استشِر عاجلًا إذا صاحب الدوار صداع شديد أو اضطراب في النطق أو الرؤية أو القوة.",
  },

  // ── Maladies ──────────────────────────────────────────────
  allergie: {
    fr: "Pour une allergie qui revient (rhinite, urticaire, réactions alimentaires ou médicamenteuses), l'allergologue identifie le déclencheur par des tests et propose un traitement de fond. Votre médecin généraliste gère les formes simples et vous adresse au spécialiste. Une réaction avec gonflement du visage ou gêne à respirer est une urgence.",
    ar: "عند حساسية متكرّرة (التهاب الأنف، الشرى، تفاعلات غذائية أو دوائية)، يحدّد طبيب الحساسية المُحفِّز بالاختبارات ويقترح علاجًا أساسيًا. ويتكفّل طبيبك العام بالحالات البسيطة ويحيلك إلى المختصّ. أمّا تفاعل مع تورّم الوجه أو صعوبة في التنفّس فهو حالة طارئة.",
  },
  anemie: {
    fr: "Une anémie (fatigue, pâleur, essoufflement) se confirme par une prise de sang. Le médecin généraliste en cherche d'abord la cause fréquente (carence en fer, règles abondantes) ; en cas d'anémie sévère, inexpliquée ou persistante, un hématologue approfondit. Consultez vite en cas d'essoufflement important ou de malaise.",
    ar: "يُؤكَّد فقر الدم (تعب، شحوب، ضيق نفس) بتحليل دم. يبحث طبيب عام أولًا عن السبب الشائع (نقص الحديد، غزارة الطمث)؛ وعند فقر دم شديد أو غير مبرّر أو مستمرّ، يُعمّق طبيب أمراض الدم الفحص. استشِر بسرعة عند ضيق نفس واضح أو إغماء.",
  },
  arthrose: {
    fr: "Pour une arthrose (douleur mécanique, raideur d'une articulation), le rhumatologue confirme le diagnostic et organise la prise en charge ; le médecin généraliste assure le suivi courant et un kinésithérapeute aide à préserver la mobilité. Un avis orthopédique se discute si une chirurgie est envisagée.",
    ar: "عند الفصال العظمي (ألم ميكانيكي، تيبّس المفصل)، يؤكّد طبيب الروماتيزم التشخيص ويُنظّم الرعاية؛ ويتابع طبيب عام الحالة، ويساعد أخصائي العلاج الطبيعي على الحفاظ على الحركة. ويُناقَش رأي جرّاح العظام إذا طُرح خيار الجراحة.",
  },
  asthme: {
    fr: "L'asthme (essoufflement sifflant, toux nocturne, gêne à l'effort) se suit avec un pneumologue, qui confirme le diagnostic et ajuste le traitement de fond ; l'enfant peut être suivi par un pédiatre. Une crise qui ne cède pas au traitement habituel, avec difficulté à parler, est une urgence.",
    ar: "الربو (أزيز وضيق نفس، سعال ليلي، انزعاج مع المجهود) يُتابَع مع طبيب الجهاز التنفسي الذي يؤكّد التشخيص ويضبط العلاج الأساسي؛ ويمكن متابعة الطفل مع طبيب أطفال. أمّا نوبة لا تستجيب للعلاج المعتاد مع صعوبة في الكلام فهي حالة طارئة.",
  },
  depression: {
    fr: "Pour une dépression (tristesse durable, perte d'intérêt, troubles du sommeil et de l'appétit), le psychiatre est le spécialiste du diagnostic et du traitement ; un psychologue assure le suivi psychothérapeutique. Votre médecin généraliste peut débuter la prise en charge. En cas d'idées suicidaires, consultez en urgence.",
    ar: "عند الاكتئاب (حزن دائم، فقدان الاهتمام، اضطراب النوم والشهية)، يكون طبيب نفسي مختصّ التشخيص والعلاج؛ ويتكفّل أخصائي نفسي بالعلاج النفسي. ويمكن لطبيبك العام بدء الرعاية. وعند وجود أفكار انتحارية، استشِر فورًا.",
  },
  diabete: {
    fr: "Le diabète se suit avec un endocrinologue (diabétologue), qui adapte le traitement et surveille les complications ; le médecin généraliste assure le suivi régulier. Un ophtalmologue et d'autres spécialistes interviennent selon le retentissement. Consultez en urgence en cas de malaise, de soif intense avec confusion ou de sucre très élevé.",
    ar: "داء السكري يُتابَع مع طبيب الغدد الصمّاء (طبيب السكري) الذي يضبط العلاج ويرصد المضاعفات؛ ويؤمّن طبيب عام المتابعة المنتظمة. ويتدخّل طبيب العيون ومختصّون آخرون حسب التأثيرات. استشِر عاجلًا عند إغماء أو عطش شديد مع تشوّش أو ارتفاع كبير في السكّر.",
  },
  "hypertension-arterielle": {
    fr: "Une hypertension artérielle se suit avec le médecin généraliste pour l'essentiel ; le cardiologue intervient en cas de tension difficile à contrôler, de retentissement sur le cœur ou de bilan spécialisé. Consultez en urgence pour une tension très élevée avec maux de tête intenses, douleur thoracique ou troubles de la vue.",
    ar: "ارتفاع ضغط الدم يُتابَع أساسًا مع طبيب عام؛ ويتدخّل طبيب القلب عند ضغط يصعب ضبطه أو تأثير على القلب أو فحص متخصّص. استشِر عاجلًا عند ضغط مرتفع جدًّا مع صداع شديد أو ألم في الصدر أو اضطراب في الرؤية.",
  },
  hypothyroidie: {
    fr: "L'hypothyroïdie (fatigue, prise de poids, frilosité) se confirme par une prise de sang et se suit avec un endocrinologue, qui ajuste le traitement hormonal ; le médecin généraliste assure le renouvellement et la surveillance. Un bilan est utile en cas de fatigue persistante inexpliquée ou de projet de grossesse.",
    ar: "قصور الغدة الدرقية (تعب، زيادة الوزن، برودة) يُؤكَّد بتحليل دم ويُتابَع مع طبيب الغدد الصمّاء الذي يضبط العلاج الهرموني؛ ويؤمّن طبيب عام التجديد والمراقبة. والفحص مفيد عند تعب مستمرّ غير مبرّر أو تخطيط للحمل.",
  },
  migraine: {
    fr: "La migraine (céphalées pulsatiles, souvent avec nausées et gêne à la lumière) se prend en charge avec un neurologue quand les crises sont fréquentes ou invalidantes ; le médecin généraliste gère les formes simples. Consultez en urgence pour un mal de tête brutal inhabituel ou avec troubles de la parole, de la vue ou de la force.",
    ar: "الشقيقة (صداع نابض، غالبًا مع غثيان وانزعاج من الضوء) تُعالَج مع طبيب الأعصاب عند نوبات متكرّرة أو مُعيقة؛ ويتكفّل طبيب عام بالحالات البسيطة. استشِر عاجلًا عند صداع مفاجئ غير معتاد أو مع اضطراب في النطق أو الرؤية أو القوة.",
  },
  "reflux-gastro-oesophagien": {
    fr: "Le reflux gastro-œsophagien (brûlures remontant derrière le sternum, régurgitations) se gère d'abord avec le médecin généraliste (mesures hygiéno-diététiques, traitement). En cas de symptômes persistants, de gêne à avaler ou après 50 ans, un gastro-entérologue peut proposer une endoscopie. Consultez vite en cas de douleur thoracique ou d'amaigrissement.",
    ar: "الارتجاع المعدي المريئي (حُرقة تصعد خلف عظم القصّ، قلس) يُدار أولًا مع طبيب عام (تدابير غذائية وعلاج). وعند أعراض مستمرّة أو صعوبة في البلع أو بعد سنّ الخمسين، قد يقترح أخصائي أمراض الجهاز الهضمي تنظيرًا. استشِر بسرعة عند ألم في الصدر أو فقدان وزن.",
  },
};

async function main() {
  let n = 0;
  for (const [slug, { fr, ar }] of Object.entries(CONTENT)) {
    const res = await prisma.healthTopic.updateMany({
      where: { intentSlug: slug },
      data: { intentAnswer: fr, intentAnswerAr: ar },
    });
    if (res.count > 0) {
      console.log(`  ✎ ${slug}`);
      n++;
    } else {
      console.warn(`  ⚠ ${slug} : aucune page intention (intentSlug absent) — ignoré`);
    }
  }
  console.log(`\n✓ ${n}/${Object.keys(CONTENT).length} réponse(s) unique(s) rédigée(s) (FR + AR).`);
}

main().finally(() => prisma.$disconnect());
