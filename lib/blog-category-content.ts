/**
 * Contenu éditorial des pages catégorie /blog/categorie/[slug].
 * Transforme un simple filtre en page d'atterrissage indexable (intro de
 * cocon + FAQ) : signaux E-E-A-T, longue traîne et extraction IA (AEO/GEO).
 *
 * Repli : si une catégorie n'est pas listée ici, la page utilise sa
 * `description` en intro et n'affiche pas de FAQ.
 */

import type { Locale } from "@/lib/i18n";

export type CategoryFaq = { q: string; a: string };
export type CategoryContent = {
  introFr: string;
  introAr: string;
  faqFr: CategoryFaq[];
  faqAr: CategoryFaq[];
};

const CONTENT: Record<string, CategoryContent> = {
  "prevention-sante": {
    introFr:
      "La prévention est le moyen le plus efficace de rester en bonne santé : se faire vacciner, dépister tôt et adopter de bonnes habitudes évite la majorité des maladies évitables. Retrouvez ici des conseils pratiques, vérifiés par des professionnels de santé, adaptés au contexte marocain.",
    introAr:
      "الوقاية هي أنجع وسيلة للحفاظ على الصحة: التلقيح، الكشف المبكر والعادات السليمة تتفادى معظم الأمراض. تجد هنا نصائح عملية يراجعها مهنيو الصحة وملائمة للسياق المغربي.",
    faqFr: [
      { q: "Quels dépistages faire et à quel âge au Maroc ?", a: "Les dépistages recommandés dépendent de l'âge et des facteurs de risque : tension et glycémie dès 40 ans, mammographie tous les deux ans à partir de 40 ans, suivi dentaire et ophtalmologique réguliers. Votre médecin traitant adapte ce calendrier à votre situation." },
      { q: "La prévention est-elle prise en charge par l'AMO ?", a: "Plusieurs actes de dépistage et la vaccination sont pris en charge sous conditions par l'assurance maladie obligatoire. Renseignez-vous auprès de votre organisme (CNSS, CNOPS) ou de votre médecin." },
    ],
    faqAr: [
      { q: "ما هي الفحوصات الواجب إجراؤها وفي أي سن بالمغرب؟", a: "تعتمد الفحوصات الموصى بها على السن وعوامل الخطر: قياس الضغط والسكري ابتداءً من 40 سنة، التصوير الإشعاعي للثدي كل سنتين بدءاً من 40 سنة، ومتابعة منتظمة للأسنان والعيون. يحدد طبيبك المعالج هذا الجدول حسب حالتك." },
      { q: "هل تغطي التأمين الإجباري عن المرض الوقاية؟", a: "تُغطى عدة فحوصات والتلقيح وفق شروط من طرف التأمين الإجباري عن المرض. استفسر لدى صندوقك (CNSS، CNOPS) أو طبيبك." },
    ],
  },
  "nutrition-bien-etre": {
    introFr:
      "Bien manger est l'un des piliers de la santé. De l'alimentation méditerranéenne à la gestion du poids, découvrez des conseils nutritionnels concrets et ancrés dans la cuisine marocaine, pour prévenir le diabète, l'hypertension et les maladies cardiovasculaires.",
    introAr:
      "التغذية السليمة من أعمدة الصحة. من النظام المتوسطي إلى التحكم في الوزن، اكتشف نصائح غذائية ملموسة ومتجذّرة في المطبخ المغربي للوقاية من السكري وارتفاع الضغط وأمراض القلب.",
    faqFr: [
      { q: "La cuisine marocaine est-elle bonne pour la santé ?", a: "Dans sa forme traditionnelle — légumineuses, légumes, huile d'olive, poisson, épices — la cuisine marocaine est proche du régime méditerranéen, reconnu comme l'un des plus protecteurs au monde." },
      { q: "Faut-il consulter un nutritionniste ?", a: "Un médecin nutritionniste ou une diététicienne est recommandé en cas de diabète, surpoids, ou objectif spécifique, pour un accompagnement personnalisé et sûr." },
    ],
    faqAr: [
      { q: "هل المطبخ المغربي صحي؟", a: "في شكله التقليدي — البقول، الخضر، زيت الزيتون، السمك والتوابل — يقترب المطبخ المغربي من النظام المتوسطي المعروف بأنه من أكثر الأنظمة وقايةً في العالم." },
      { q: "هل يجب استشارة أخصائي تغذية؟", a: "يُنصح بطبيب تغذية أو أخصائي حمية في حالات السكري أو زيادة الوزن أو هدف خاص، لمواكبة شخصية وآمنة." },
    ],
  },
  "maladies-traitements": {
    introFr:
      "Comprendre sa maladie, c'est mieux la gérer. Diabète, hypertension, asthme, allergies : ces guides expliquent simplement les symptômes, les traitements et le moment où il faut consulter un spécialiste, à partir de sources médicales fiables.",
    introAr:
      "فهم المرض يعني التحكم فيه بشكل أفضل. السكري، ارتفاع الضغط، الربو، الحساسية: تشرح هذه الأدلة بأسلوب بسيط الأعراض والعلاجات ومتى تجب استشارة المختص، استناداً إلى مصادر طبية موثوقة.",
    faqFr: [
      { q: "Quand consulter un spécialiste plutôt qu'un généraliste ?", a: "Le médecin généraliste est le premier recours. Il vous oriente vers un spécialiste (cardiologue, endocrinologue, pneumologue…) lorsque le diagnostic ou le suivi l'exige." },
      { q: "Ces articles remplacent-ils une consultation ?", a: "Non. Ils informent mais ne se substituent jamais à un avis médical. Consultez toujours un professionnel de santé pour un diagnostic ou un traitement." },
    ],
    faqAr: [
      { q: "متى تجب استشارة مختص بدل الطبيب العام؟", a: "الطبيب العام هو أول وجهة. يوجّهك نحو مختص (طبيب قلب، غدد، رئة…) حين يتطلب التشخيص أو المتابعة ذلك." },
      { q: "هل تغني هذه المقالات عن الاستشارة؟", a: "لا. فهي تُعلِم لكنها لا تعوّض الرأي الطبي. استشر دائماً مهنيّ صحة للتشخيص أو العلاج." },
    ],
  },
  symptomes: {
    introFr:
      "Un symptôme — douleur, fièvre, toux, essoufflement — est un signal du corps, pas un diagnostic. Ces guides expliquent, pour chaque symptôme, les causes fréquentes et les causes graves à ne pas manquer, ce que l'on peut faire à la maison, et surtout quand consulter ou appeler les urgences. Une information claire et vérifiée, qui ne remplace jamais l'avis d'un professionnel de santé.",
    introAr:
      "العَرَض — ألم، حمى، سعال، ضيق في التنفس — إشارة من الجسم وليس تشخيصاً. تشرح هذه الأدلة لكل عرَض أسبابه الشائعة والأسباب الخطيرة التي يجب عدم إغفالها، وما يمكن فعله في المنزل، ومتى تجب الاستشارة أو الاتصال بالمستعجلات. معلومة واضحة وموثوقة لا تعوّض أبداً رأي مهني الصحة.",
    faqFr: [
      { q: "Un symptôme suffit-il à poser un diagnostic ?", a: "Non. Un même symptôme (douleur, fièvre, toux…) peut avoir de nombreuses causes, bénignes ou graves. Seul un professionnel de santé, après examen, peut poser un diagnostic. Ces guides aident à comprendre et à savoir quand consulter, sans jamais s'y substituer." },
      { q: "Comment savoir si un symptôme est une urgence ?", a: "Certains signes imposent d'appeler les secours sans attendre : douleur intense dans la poitrine, difficulté à respirer, malaise, signes d'AVC (visage déformé, faiblesse d'un côté, trouble de la parole), saignement important. Chaque fiche précise les signes d'urgence propres au symptôme." },
    ],
    faqAr: [
      { q: "هل يكفي عرَض واحد لوضع تشخيص؟", a: "لا. قد يكون للعرَض نفسه (ألم، حمى، سعال…) أسباب عديدة، بعضها بسيط وبعضها خطير. وحده مهنيّ الصحة، بعد الفحص، يمكنه وضع التشخيص. تساعد هذه الأدلة على الفهم ومعرفة متى تجب الاستشارة، دون أن تعوّضها أبداً." },
      { q: "كيف أعرف أن العرَض حالة مستعجلة؟", a: "بعض العلامات توجب الاتصال بالمستعجلات فوراً: ألم شديد في الصدر، صعوبة في التنفس، إغماء، علامات السكتة الدماغية (تشوّه الوجه، ضعف في جهة واحدة، اضطراب النطق)، نزيف مهم. تحدّد كل بطاقة علامات الخطر الخاصة بالعرَض." },
    ],
  },
  examens: {
    introFr:
      "Prise de sang, IRM, scanner, échographie, ECG, coloscopie… Un examen prescrit soulève souvent des questions : à quoi sert-il, comment se déroule-t-il, faut-il se préparer, est-ce douloureux ou risqué, et combien ça coûte ? Ces guides répondent simplement, avec des repères de prix indicatifs au Maroc. Ils n'interprètent pas vos résultats à votre place : cela reste le rôle de votre médecin.",
    introAr:
      "تحليل الدم، التصوير بالرنين المغناطيسي، السكانير، الإيكوغرافيا، تخطيط القلب، تنظير القولون… غالباً ما يثير الفحص المطلوب أسئلة: ما فائدته، كيف يجري، هل يتطلب تحضيراً، هل هو مؤلم أو خطير، وكم يكلّف؟ تجيب هذه الأدلة ببساطة، مع مؤشرات أسعار تقريبية بالمغرب. وهي لا تفسّر نتائجك مكانك: فذلك يبقى من دور طبيبك.",
    faqFr: [
      { q: "Faut-il une ordonnance pour faire un examen ?", a: "La plupart des examens (imagerie, analyses, endoscopies) se réalisent sur prescription médicale, qui conditionne aussi la prise en charge par l'assurance maladie (AMO). Votre médecin choisit l'examen le plus adapté à votre situation." },
      { q: "Puis-je interpréter mes résultats moi-même ?", a: "Non. Un résultat isolé, normal ou anormal, n'a de sens qu'au regard de votre situation globale. Seul votre médecin interprète les résultats, les recoupe et décide de la suite. Ces guides aident à comprendre l'examen, pas à poser un diagnostic." },
    ],
    faqAr: [
      { q: "هل يلزم وصفة طبية لإجراء فحص؟", a: "تُجرى معظم الفحوصات (التصوير، التحاليل، التنظير) بوصفة طبية، وهي تشترط أيضاً التغطية من طرف التأمين الإجباري عن المرض. يختار طبيبك الفحص الأنسب لحالتك." },
      { q: "هل يمكنني تفسير نتائجي بنفسي؟", a: "لا. لا معنى لنتيجة معزولة، طبيعية كانت أو غير طبيعية، إلا في سياق حالتك العامة. وحده طبيبك يفسّر النتائج ويربطها ويقرّر الخطوة التالية. تساعد هذه الأدلة على فهم الفحص، لا على وضع تشخيص." },
    ],
  },
  medicaments: {
    introFr:
      "Bien connaître ses médicaments, c'est mieux se soigner et éviter les erreurs. Ces fiches expliquent simplement à quoi servent les médicaments courants, comment les prendre, leurs contre-indications, effets secondaires et interactions. Elles informent, mais ne remplacent jamais l'avis de votre médecin ou de votre pharmacien : ne modifiez pas un traitement sans avis et lisez toujours la notice.",
    introAr:
      "معرفة أدويتك جيداً تعني علاجاً أفضل وتفادي الأخطاء. تشرح هذه البطاقات ببساطة فائدة الأدوية الشائعة، وكيفية تناولها، وموانع استعمالها وآثارها الجانبية وتفاعلاتها. إنها تُعلِم لكنها لا تعوّض أبداً رأي طبيبك أو الصيدلي: لا تغيّر علاجاً دون استشارة واقرأ دائماً النشرة.",
    faqFr: [
      { q: "Peut-on prendre un médicament sans ordonnance ?", a: "Certains médicaments (paracétamol, par exemple) sont disponibles sans ordonnance pour des troubles bénins et de courte durée. Mais même sans ordonnance, il faut respecter les doses, lire la notice et demander conseil au pharmacien, surtout en cas de maladie, de grossesse ou d'autres traitements." },
      { q: "Ces fiches remplacent-elles l'avis du médecin ou du pharmacien ?", a: "Non. Elles donnent une information générale pour mieux comprendre les médicaments courants, mais ne remplacent jamais une consultation ni les conseils personnalisés de votre médecin ou de votre pharmacien, qui tiennent compte de votre situation." },
    ],
    faqAr: [
      { q: "هل يمكن تناول دواء دون وصفة طبية؟", a: "بعض الأدوية (كالباراسيتامول) متاحة دون وصفة لاضطرابات بسيطة وقصيرة. لكن حتى دون وصفة، يجب احترام الجرعات وقراءة النشرة واستشارة الصيدلي، خاصة في حالة المرض أو الحمل أو تناول أدوية أخرى." },
      { q: "هل تغني هذه البطاقات عن رأي الطبيب أو الصيدلي؟", a: "لا. فهي تقدّم معلومة عامة لفهم الأدوية الشائعة، لكنها لا تعوّض أبداً الاستشارة ولا النصائح الشخصية لطبيبك أو صيدليك، التي تراعي حالتك الخاصة." },
    ],
  },
  "questions-frequentes": {
    introFr:
      "Les réponses claires et directes aux questions de santé les plus posées : diabète, tension, AVC, fatigue, migraine, toux… Chaque réponse va à l'essentiel, puis renvoie vers un guide complet. Une information fiable qui ne remplace jamais l'avis de votre médecin.",
    introAr:
      "أجوبة واضحة ومباشرة على أكثر الأسئلة الصحية تداولاً: السكري، الضغط، السكتة الدماغية، التعب، الشقيقة، السعال… يذهب كل جواب إلى جوهر الموضوع ثم يحيل على دليل مفصّل. معلومة موثوقة لا تعوّض أبداً رأي طبيبك.",
    faqFr: [
      { q: "Ces réponses remplacent-elles une consultation ?", a: "Non. Elles donnent une information générale et fiable pour comprendre et savoir quand consulter, mais ne remplacent jamais un avis médical personnalisé, seul à même de poser un diagnostic et de prescrire un traitement." },
      { q: "Comment sont choisies ces questions ?", a: "Ce sont les questions de santé les plus fréquemment posées, traitées de façon claire et concise, avec un renvoi vers nos fiches complètes (maladies, symptômes, examens) pour approfondir." },
    ],
    faqAr: [
      { q: "هل تغني هذه الأجوبة عن الاستشارة؟", a: "لا. فهي تقدّم معلومة عامة وموثوقة للفهم ولمعرفة متى تجب الاستشارة، لكنها لا تعوّض أبداً رأياً طبياً شخصياً، وحده القادر على وضع تشخيص ووصف علاج." },
      { q: "كيف تُختار هذه الأسئلة؟", a: "هي أكثر الأسئلة الصحية تداولاً، مُعالَجة بوضوح واختصار، مع إحالة على بطاقاتنا المفصّلة (أمراض، أعراض، فحوصات) للتعمّق." },
    ],
  },
  "sante-femme": {
    introFr:
      "De la grossesse au dépistage des cancers en passant par la ménopause, la santé de la femme mérite un suivi attentif à chaque étape de la vie. Des conseils clairs et bienveillants, validés par des professionnels, pour prendre soin de soi en confiance.",
    introAr:
      "من الحمل إلى الكشف عن السرطانات مروراً بسن اليأس، تستحق صحة المرأة متابعة دقيقة في كل مرحلة من الحياة. نصائح واضحة ولطيفة يصادق عليها مهنيون، للعناية بنفسك بثقة.",
    faqFr: [
      { q: "À quelle fréquence consulter un gynécologue ?", a: "Un suivi gynécologique annuel est recommandé, et plus rapproché en cas de grossesse, de symptômes ou d'antécédents particuliers." },
      { q: "Le dépistage du cancer du sein est-il remboursé ?", a: "La mammographie est prise en charge sous conditions par l'AMO. Des campagnes de dépistage gratuit sont aussi organisées chaque année (Octobre Rose)." },
    ],
    faqAr: [
      { q: "ما وتيرة استشارة طبيب النساء؟", a: "يُنصح بمتابعة سنوية لدى طبيب النساء، وبوتيرة أقرب في حالة الحمل أو الأعراض أو سوابق خاصة." },
      { q: "هل الكشف عن سرطان الثدي مغطّى؟", a: "يُغطّى التصوير الإشعاعي للثدي وفق شروط من طرف التأمين الإجباري. كما تُنظَّم حملات كشف مجانية كل سنة (أكتوبر الوردي)." },
    ],
  },
  "sante-enfant": {
    introFr:
      "Vaccins, fièvre, maladies courantes, suivi de croissance : la santé de l'enfant demande une attention particulière à chaque âge. Retrouvez ici des guides clairs et rassurants, validés par des professionnels, pour accompagner les parents au quotidien et savoir quand consulter un pédiatre au Maroc.",
    introAr:
      "اللقاحات، الحمى، الأمراض الشائعة ومتابعة النمو: تتطلب صحة الطفل عناية خاصة في كل سن. تجد هنا أدلة واضحة ومطمئنة يصادق عليها مهنيون، لمواكبة الآباء يومياً ومعرفة متى تجب استشارة طبيب الأطفال بالمغرب.",
    faqFr: [
      { q: "À quelle fréquence consulter un pédiatre ?", a: "Les consultations sont rapprochées la première année (suivi de croissance et vaccins), puis espacées. Un suivi régulier permet de vérifier le développement de l'enfant et de mettre à jour les vaccinations." },
      { q: "Quand emmener son enfant aux urgences ?", a: "En cas de fièvre élevée chez un nourrisson, de difficultés à respirer, de somnolence inhabituelle, de convulsions ou de déshydratation. Dans le doute, contactez un médecin sans attendre." },
    ],
    faqAr: [
      { q: "ما وتيرة استشارة طبيب الأطفال؟", a: "تكون الاستشارات متقاربة في السنة الأولى (متابعة النمو واللقاحات) ثم تتباعد. تتيح المتابعة المنتظمة التحقق من نمو الطفل وتحديث التلقيحات." },
      { q: "متى يجب نقل الطفل إلى المستعجلات؟", a: "في حالة حمى مرتفعة لدى الرضيع، صعوبة في التنفس، خمول غير معتاد، تشنجات أو جفاف. عند الشك، اتصل بطبيب دون انتظار." },
    ],
  },
  "sante-senior": {
    introFr:
      "Bien vieillir, cela se prépare et cela s'accompagne. Prévenir les chutes, entretenir sa mémoire et ses muscles, bien se nourrir, préserver son autonomie et son sommeil : ces guides pratiques et bienveillants aident les seniors et leurs proches à garder longtemps une bonne qualité de vie, au Maroc. Ils ne remplacent jamais l'avis de votre médecin.",
    introAr:
      "الشيخوخة السليمة تُحضَّر وتُواكَب. الوقاية من السقوط، والحفاظ على الذاكرة والعضلات، والتغذية الجيدة، والحفاظ على الاستقلالية والنوم: تساعد هذه الأدلة العملية اللطيفة المسنّين وذويهم على الحفاظ طويلاً على جودة حياة جيدة بالمغرب. وهي لا تعوّض أبداً رأي طبيبك.",
    faqFr: [
      { q: "Comment bien vieillir et rester en bonne santé ?", a: "En restant physiquement actif, en stimulant sa mémoire et sa vie sociale, en mangeant équilibré, en prévenant les chutes et en suivant régulièrement ses maladies chroniques. Beaucoup de problèmes liés à l'âge se préviennent quand on agit tôt." },
      { q: "Quand s'inquiéter pour la santé d'un proche âgé ?", a: "Devant une perte de poids, des chutes, un repli sur soi, des troubles de la mémoire qui s'aggravent ou des difficultés nouvelles pour les gestes du quotidien. Ces signes doivent amener à consulter le médecin sans attendre." },
    ],
    faqAr: [
      { q: "كيف نشيخ بصحة جيدة؟", a: "بالبقاء نشيطاً بدنياً، وتحفيز الذاكرة والحياة الاجتماعية، والتغذية المتوازنة، والوقاية من السقوط، والمتابعة المنتظمة للأمراض المزمنة. كثير من مشاكل التقدم في السن يمكن الوقاية منها عند التصرف مبكراً." },
      { q: "متى نقلق على صحة قريب مسنّ؟", a: "عند فقدان الوزن، أو السقوط المتكرر، أو الانطواء، أو تدهور الذاكرة، أو صعوبات جديدة في أعمال الحياة اليومية. توجب هذه العلامات استشارة الطبيب دون تأخير." },
    ],
  },
  "sante-mentale": {
    introFr:
      "Anxiété, dépression, stress, troubles du sommeil : la santé mentale est aussi importante que la santé physique. Souvent taboue, elle se soigne pourtant très bien lorsqu'on en parle. Retrouvez ici des repères clairs et bienveillants pour comprendre, déculpabiliser et savoir vers qui se tourner au Maroc.",
    introAr:
      "القلق، الاكتئاب، التوتر، اضطرابات النوم: الصحة النفسية لا تقل أهمية عن الصحة الجسدية. رغم أنها غالباً موضوع محظور، فإنها تُعالَج جيداً عند الحديث عنها. تجد هنا معالم واضحة ولطيفة للفهم ورفع الحرج ومعرفة الجهة المناسبة بالمغرب.",
    faqFr: [
      { q: "Quand faut-il consulter pour un problème de santé mentale ?", a: "Lorsque la souffrance dure, perturbe le quotidien (sommeil, travail, relations) ou s'accompagne d'idées noires. Il n'est jamais trop tôt pour demander de l'aide : consulter est un signe de force, pas de faiblesse." },
      { q: "Psychiatre ou psychologue : quelle différence ?", a: "Le psychiatre est un médecin : il diagnostique et peut prescrire un traitement. Le psychologue accompagne par la parole et les thérapies. Les deux sont souvent complémentaires." },
    ],
    faqAr: [
      { q: "متى تجب استشارة مختص في الصحة النفسية؟", a: "عندما تستمر المعاناة وتعرقل الحياة اليومية (النوم، العمل، العلاقات) أو ترافقها أفكار سوداء. لا يكون الوقت مبكراً أبداً لطلب المساعدة: الاستشارة دليل قوة لا ضعف." },
      { q: "طبيب نفسي أم أخصائي نفسي: ما الفرق؟", a: "الطبيب النفسي طبيب يشخّص ويمكنه وصف علاج. الأخصائي النفسي يواكب عبر الكلام والعلاجات النفسية. وغالباً ما يتكاملان." },
    ],
  },
  "parcours-soin": {
    introFr:
      "Choisir le bon médecin, préparer sa consultation, comprendre l'AMO et les mutuelles, savoir quand consulter un spécialiste : bien se soigner au Maroc, c'est aussi maîtriser son parcours de soin. Retrouvez ici des guides pratiques et clairs pour devenir acteur de votre santé et tirer le meilleur du système de soins marocain.",
    introAr:
      "اختيار الطبيب المناسب، تحضير الاستشارة، فهم التأمين الإجباري والتأمين التكميلي، ومعرفة متى تستشير المختص: العلاج الجيد بالمغرب يمر أيضاً عبر التحكم في مسار العلاج. تجد هنا أدلة عملية وواضحة لتصبح فاعلاً في صحتك وتستفيد من المنظومة الصحية المغربية.",
    faqFr: [
      { q: "Comment bien choisir son médecin au Maroc ?", a: "Vérifiez la spécialité adaptée à votre besoin, la proximité, les avis d'autres patients, les tarifs et la disponibilité. Un annuaire médical en ligne permet de comparer ces critères et de prendre rendez-vous facilement." },
      { q: "La consultation est-elle remboursée au Maroc ?", a: "Une partie des consultations et soins est prise en charge par l'assurance maladie obligatoire (AMO), via la CNSS pour les salariés du privé ou la CNOPS pour le public, selon un barème. Une mutuelle complémentaire peut couvrir le reste." },
    ],
    faqAr: [
      { q: "كيف أختار طبيبي بشكل جيد بالمغرب؟", a: "تحقق من التخصص المناسب لحاجتك، القرب، آراء المرضى الآخرين، الأسعار والتوفر. يتيح الدليل الطبي على الإنترنت مقارنة هذه المعايير وحجز موعد بسهولة." },
      { q: "هل تُعوَّض الاستشارة بالمغرب؟", a: "يُغطّى جزء من الاستشارات والعلاجات عبر التأمين الإجباري عن المرض (CNSS للقطاع الخاص أو CNOPS للعام) وفق جدول محدد. وقد يغطي التأمين التكميلي الباقي." },
    ],
  },
  medecins: {
    introFr:
      "Développer sa patientèle, gagner en visibilité et digitaliser son cabinet : ces guides s'adressent aux professionnels de santé qui veulent tirer parti du numérique, dans le respect de la déontologie. Conseils pratiques, e-réputation, gestion des rendez-vous et présence en ligne.",
    introAr:
      "تطوير قاعدة المرضى، اكتساب الظهور ورقمنة العيادة: هذه الأدلة موجهة لمهنيي الصحة الراغبين في الاستفادة من الرقمنة مع احترام أخلاقيات المهنة. نصائح عملية، السمعة الإلكترونية، تدبير المواعيد والحضور على الإنترنت.",
    faqFr: [
      { q: "Référencer son cabinet en ligne est-il conforme à la déontologie ?", a: "Oui. Informer les patients de sa spécialité, ses horaires et son adresse relève de l'information de service, distincte de la publicité commerciale encadrée par le Code de déontologie médicale." },
      { q: "Comment rejoindre SantéauMaroc en tant que médecin ?", a: "Créez gratuitement votre profil depuis la page d'inscription praticien, complétez vos informations, puis activez la prise de rendez-vous en ligne via un abonnement adapté." },
    ],
    faqAr: [
      { q: "هل إدراج العيادة على الإنترنت متوافق مع أخلاقيات المهنة؟", a: "نعم. إعلام المرضى بالتخصص والتوقيت والعنوان هو معلومة خدمية تختلف عن الإشهار التجاري الذي تؤطّره مدونة أخلاقيات الطب." },
      { q: "كيف ينضم الطبيب إلى الصحة في المغرب؟", a: "أنشئ ملفك مجاناً من صفحة تسجيل الأطباء، أكمل معلوماتك، ثم فعّل الحجز عبر الإنترنت عبر اشتراك ملائم." },
    ],
  },
};

export function categoryContent(slug: string): CategoryContent | null {
  return CONTENT[slug] ?? null;
}

export function categoryIntro(slug: string, locale: Locale, fallback: string): string {
  const c = CONTENT[slug];
  if (!c) return fallback;
  return locale === "ar" ? c.introAr : c.introFr;
}

export function categoryFaq(slug: string, locale: Locale): CategoryFaq[] {
  const c = CONTENT[slug];
  if (!c) return [];
  return locale === "ar" ? c.faqAr : c.faqFr;
}
