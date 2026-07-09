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
