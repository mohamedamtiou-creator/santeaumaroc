import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";

const PATH = "/politique-confidentialite";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang) === "ar" ? "ar" : "fr";
  const m = META[locale];
  return {
    title: m.title,
    description: m.description,
    alternates: localizedAlternates(PATH, locale),
    openGraph: {
      title: m.title,
      description: m.ogDescription,
      url: PATH,
      type: "website",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
  };
}

type Locale = "fr" | "ar";

const META: Record<Locale, { title: string; description: string; ogDescription: string }> = {
  fr: {
    title: "Politique de confidentialité — SantéauMaroc",
    description:
      "Découvrez comment SantéauMaroc collecte, utilise et protège vos données personnelles conformément à la réglementation marocaine et aux standards internationaux.",
    ogDescription: "Comment SantéauMaroc collecte, utilise et protège vos données personnelles.",
  },
  ar: {
    title: "سياسة الخصوصية — SantéauMaroc",
    description:
      "اكتشف كيف تجمع منصة SantéauMaroc بياناتك الشخصية وتستعملها وتحميها وفقاً للتشريع المغربي والمعايير الدولية.",
    ogDescription: "كيف تجمع SantéauMaroc بياناتك الشخصية وتستعملها وتحميها.",
  },
};

// Icônes des droits (indépendantes de la langue, appariées par index à COPY.*.rights).
const RIGHT_ICONS = [
  "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  "M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16",
  "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
  "M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z",
  "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
];

const EMAIL = "privacy@santeaumaroc.com";

type Block = { p: string } | { ul: string[] };

interface Copy {
  eyebrow: string;
  h1: string;
  updatedLabel: string;
  updatedDate: string;
  sommaire: string;
  trustBadge: string;
  chapeau: string;
  toc: { id: string; label: string }[];
  prose: Record<string, { title: string; blocks: Block[] }>;
  collecte: {
    title: string;
    intro: string;
    cards: { title: string; items: string[] }[];
    outro: string;
  };
  droits: {
    title: string;
    intro: string;
    rights: { title: string; desc: string }[];
    outro: string;
  };
  contact: {
    title: string;
    intro: string;
    dpoLabel: string;
    formLabel: string;
    formText: string;
    courrierLabel: string;
    courrierText: string;
    outro: string;
  };
  related: { conditionsLabel: string; conditionsDesc: string; contactLabel: string; contactDesc: string };
}

const COPY: Record<Locale, Copy> = {
  fr: {
    eyebrow: "Légal",
    h1: "Politique de confidentialité",
    updatedLabel: "Dernière mise à jour :",
    updatedDate: "1er juin 2026",
    sommaire: "Sommaire",
    trustBadge: "Vos données sont protégées et ne sont jamais vendues à des tiers.",
    chapeau:
      "SantéauMaroc accorde une importance capitale à la protection de vos données personnelles. Cette politique décrit de manière transparente comment nous collectons, utilisons et sécurisons vos informations, conformément à la loi marocaine 09-08 relative à la protection des personnes physiques.",
    toc: [
      { id: "responsable", label: "1. Responsable du traitement" },
      { id: "collecte", label: "2. Données collectées" },
      { id: "finalites", label: "3. Finalités du traitement" },
      { id: "base-legale", label: "4. Base légale" },
      { id: "destinataires", label: "5. Destinataires" },
      { id: "conservation", label: "6. Durée de conservation" },
      { id: "droits", label: "7. Vos droits" },
      { id: "transferts", label: "8. Transferts internationaux" },
      { id: "cookies", label: "9. Cookies" },
      { id: "securite", label: "10. Sécurité" },
      { id: "mineurs", label: "11. Mineurs" },
      { id: "contact", label: "12. Contact & DPO" },
    ],
    prose: {
      responsable: {
        title: "1. Responsable du traitement",
        blocks: [
          { p: "Le responsable du traitement des données personnelles collectées via la plateforme SantéauMaroc est la société <strong>SantéauMaroc SARL</strong>, dont le siège social est situé à Casablanca, Maroc." },
          { p: `Pour toute question relative à vos données personnelles, vous pouvez nous contacter à : <a href="mailto:${EMAIL}">${EMAIL}</a>` },
        ],
      },
      finalites: {
        title: "3. Finalités du traitement",
        blocks: [
          { p: "Vos données sont traitées pour les finalités suivantes :" },
          { ul: [
            "Création et gestion de votre compte utilisateur ;",
            "Facilitation de la prise de rendez-vous en ligne ;",
            "Envoi de confirmations et rappels de rendez-vous ;",
            "Vérification de l’identité et des qualifications des praticiens ;",
            "Amélioration continue de nos services ;",
            "Lutte contre la fraude et sécurisation de la plateforme ;",
            "Respect de nos obligations légales et réglementaires.",
          ] },
        ],
      },
      "base-legale": {
        title: "4. Base légale du traitement",
        blocks: [
          { p: "Nos traitements reposent sur les bases légales suivantes :" },
          { ul: [
            "<strong>Exécution du contrat :</strong> traitement nécessaire à la fourniture de nos services ;",
            "<strong>Consentement :</strong> pour les communications marketing et les cookies non essentiels ;",
            "<strong>Obligation légale :</strong> conservation de certaines données imposée par la loi ;",
            "<strong>Intérêt légitime :</strong> amélioration des services, sécurité informatique, prévention de la fraude.",
          ] },
        ],
      },
      destinataires: {
        title: "5. Destinataires des données",
        blocks: [
          { p: "Vos données personnelles ne sont <strong>jamais vendues</strong> à des tiers. Elles peuvent être partagées uniquement dans les cas suivants :" },
          { ul: [
            "<strong>Le praticien concerné</strong> reçoit les informations nécessaires à la gestion du rendez-vous (nom, coordonnées) ;",
            "<strong>Nos sous-traitants techniques</strong> (hébergement, e-mailing) opèrent sous contrats garantissant la confidentialité de vos données ;",
            "<strong>Les autorités compétentes</strong> en cas d’obligation légale ou judiciaire.",
          ] },
        ],
      },
      conservation: {
        title: "6. Durée de conservation",
        blocks: [
          { p: "Nous conservons vos données le temps strictement nécessaire aux finalités poursuivies :" },
          { ul: [
            "Données de compte actif : pendant toute la durée de votre relation avec SantéauMaroc ;",
            "Données de rendez-vous : 5 ans à compter de la consultation ;",
            "Données de navigation et logs : 13 mois maximum ;",
            "Documents de vérification praticien : durée d’activité sur la plateforme + 1 an.",
          ] },
          { p: "À l’expiration de ces délais, vos données sont supprimées ou anonymisées de manière irréversible." },
        ],
      },
      transferts: {
        title: "8. Transferts internationaux de données",
        blocks: [
          { p: "Nos serveurs sont hébergés au Maroc et en Europe. En cas de transfert hors de ces zones, nous veillons à ce que des garanties appropriées soient en place (clauses contractuelles types, certification)." },
        ],
      },
      cookies: {
        title: "9. Cookies et traceurs",
        blocks: [
          { p: "SantéauMaroc utilise des cookies pour assurer le bon fonctionnement de la plateforme et améliorer votre expérience." },
          { ul: [
            "<strong>Cookies essentiels :</strong> nécessaires au fonctionnement de la plateforme (authentification, sécurité). Ils ne peuvent pas être désactivés.",
            "<strong>Cookies analytiques :</strong> nous aident à comprendre l’utilisation de la plateforme pour l’améliorer. Soumis à votre consentement.",
            "<strong>Cookies de préférence :</strong> mémorisent vos réglages (langue, ville par défaut).",
          ] },
          { p: "Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur. Le refus de cookies analytiques n’affecte pas votre accès aux services." },
        ],
      },
      securite: {
        title: "10. Sécurité des données",
        blocks: [
          { p: "SantéauMaroc met en œuvre des mesures techniques et organisationnelles rigoureuses pour protéger vos données contre tout accès non autorisé, perte ou divulgation :" },
          { ul: [
            "Chiffrement des données en transit (TLS/SSL) et au repos ;",
            "Authentification sécurisée et gestion stricte des accès ;",
            "Audits de sécurité réguliers et tests de pénétration ;",
            "Plan de réponse aux incidents de sécurité.",
          ] },
          { p: "En cas de violation de données susceptible d’affecter vos droits, nous nous engageons à vous en informer dans les délais prescrits par la loi." },
        ],
      },
      mineurs: {
        title: "11. Mineurs",
        blocks: [
          { p: "Les services de SantéauMaroc sont destinés aux personnes majeures (18 ans et plus). Nous ne collectons pas sciemment de données personnelles concernant des mineurs. Si vous êtes parent et constatez que votre enfant a fourni des données, contactez-nous pour en demander la suppression." },
        ],
      },
    },
    collecte: {
      title: "2. Données collectées",
      intro: "Nous collectons différentes catégories de données selon votre profil :",
      cards: [
        { title: "Patients", items: ["Nom, prénom, adresse e-mail", "Numéro de téléphone", "Historique des rendez-vous", "Avis et évaluations déposés"] },
        { title: "Praticiens", items: ["Identité professionnelle", "Coordonnées du cabinet", "Documents de vérification", "Disponibilités et agenda"] },
      ],
      outro: "Nous collectons également des <strong>données de navigation</strong> (adresse IP, type de navigateur, pages visitées) via des cookies et outils d’analyse, dans le but d’améliorer nos services.",
    },
    droits: {
      title: "7. Vos droits",
      intro: "Conformément à la loi marocaine 09-08 et aux standards du RGPD européen, vous disposez des droits suivants sur vos données personnelles :",
      rights: [
        { title: "Droit d’accès", desc: "Obtenez une copie complète de vos données personnelles détenues par SantéauMaroc." },
        { title: "Droit de rectification", desc: "Corrigez ou mettez à jour vos informations personnelles à tout moment." },
        { title: "Droit à l’effacement", desc: "Demandez la suppression de vos données (sous réserve d’obligations légales)." },
        { title: "Droit d’opposition", desc: "Refusez le traitement de vos données à des fins de prospection ou de profilage." },
        { title: "Droit à la limitation", desc: "Suspendez temporairement le traitement de vos données dans certains cas." },
        { title: "Droit à la portabilité", desc: "Recevez vos données dans un format structuré et lisible par machine." },
      ],
      outro: `Pour exercer vos droits, contactez notre délégué à la protection des données à <a href="mailto:${EMAIL}">${EMAIL}</a>. Nous nous engageons à répondre dans un délai de <strong>30 jours</strong>.`,
    },
    contact: {
      title: "12. Contact et délégué à la protection des données",
      intro: "Pour toute question relative à cette politique ou à vos données personnelles :",
      dpoLabel: "E-mail DPO :",
      formLabel: "Formulaire de contact :",
      formText: "santeaumaroc.com/contact",
      courrierLabel: "Courrier :",
      courrierText: "SantéauMaroc SARL — DPO, Casablanca, Maroc",
      outro: "Vous avez également le droit d’introduire une réclamation auprès de la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) du Maroc.",
    },
    related: {
      conditionsLabel: "Conditions d’utilisation",
      conditionsDesc: "Règles d’utilisation de la plateforme SantéauMaroc.",
      contactLabel: "Nous contacter",
      contactDesc: "Une question sur vos données ? Notre équipe vous répond.",
    },
  },

  ar: {
    eyebrow: "قانوني",
    h1: "سياسة الخصوصية",
    updatedLabel: "آخر تحديث:",
    updatedDate: "1 يونيو 2026",
    sommaire: "المحتويات",
    trustBadge: "بياناتك محمية ولا تُباع أبداً لأطراف ثالثة.",
    chapeau:
      "توليّ SantéauMaroc أهمية قصوى لحماية بياناتك الشخصية. توضّح هذه السياسة بشفافية كيف نجمع معلوماتك ونستعملها ونؤمّنها، وفقاً للقانون المغربي 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.",
    toc: [
      { id: "responsable", label: "1. المسؤول عن المعالجة" },
      { id: "collecte", label: "2. البيانات المجمَّعة" },
      { id: "finalites", label: "3. أغراض المعالجة" },
      { id: "base-legale", label: "4. الأساس القانوني" },
      { id: "destinataires", label: "5. المرسل إليهم" },
      { id: "conservation", label: "6. مدة الاحتفاظ" },
      { id: "droits", label: "7. حقوقك" },
      { id: "transferts", label: "8. النقل الدولي" },
      { id: "cookies", label: "9. ملفات الارتباط" },
      { id: "securite", label: "10. الأمن" },
      { id: "mineurs", label: "11. القاصرون" },
      { id: "contact", label: "12. الاتصال ومسؤول الحماية" },
    ],
    prose: {
      responsable: {
        title: "1. المسؤول عن المعالجة",
        blocks: [
          { p: "المسؤول عن معالجة البيانات الشخصية المجمَّعة عبر منصة SantéauMaroc هو شركة <strong>SantéauMaroc SARL</strong>، الكائن مقرها الاجتماعي بالدار البيضاء، المغرب." },
          { p: `لأي استفسار يتعلق ببياناتك الشخصية، يمكنك مراسلتنا على: <a href="mailto:${EMAIL}">${EMAIL}</a>` },
        ],
      },
      finalites: {
        title: "3. أغراض المعالجة",
        blocks: [
          { p: "تُعالَج بياناتك للأغراض التالية:" },
          { ul: [
            "إنشاء حسابك وإدارته؛",
            "تسهيل حجز المواعيد عبر الإنترنت؛",
            "إرسال تأكيدات وتذكيرات المواعيد؛",
            "التحقق من هوية الأطباء ومؤهلاتهم؛",
            "التحسين المستمر لخدماتنا؛",
            "مكافحة الاحتيال وتأمين المنصة؛",
            "الامتثال لالتزاماتنا القانونية والتنظيمية.",
          ] },
        ],
      },
      "base-legale": {
        title: "4. الأساس القانوني للمعالجة",
        blocks: [
          { p: "تستند معالجاتنا إلى الأسس القانونية التالية:" },
          { ul: [
            "<strong>تنفيذ العقد:</strong> معالجة ضرورية لتقديم خدماتنا؛",
            "<strong>الموافقة:</strong> بالنسبة للمراسلات التسويقية وملفات الارتباط غير الضرورية؛",
            "<strong>الالتزام القانوني:</strong> الاحتفاظ ببعض البيانات كما يفرضه القانون؛",
            "<strong>المصلحة المشروعة:</strong> تحسين الخدمات، أمن المعلومات، والوقاية من الاحتيال.",
          ] },
        ],
      },
      destinataires: {
        title: "5. المرسل إليهم",
        blocks: [
          { p: "لا تُباع بياناتك الشخصية <strong>أبداً</strong> لأطراف ثالثة. ولا يمكن مشاركتها إلا في الحالات التالية:" },
          { ul: [
            "<strong>الطبيب المعني</strong> يتلقى المعلومات اللازمة لإدارة الموعد (الاسم، بيانات الاتصال)؛",
            "<strong>مقدّمو الخدمات التقنية</strong> (الاستضافة، إرسال البريد) يعملون بموجب عقود تضمن سرية بياناتك؛",
            "<strong>السلطات المختصة</strong> في حال وجود التزام قانوني أو قضائي.",
          ] },
        ],
      },
      conservation: {
        title: "6. مدة الاحتفاظ",
        blocks: [
          { p: "نحتفظ ببياناتك للمدة الضرورية فقط لتحقيق الأغراض المتوخاة:" },
          { ul: [
            "بيانات الحساب النشط: طوال مدة علاقتك مع SantéauMaroc؛",
            "بيانات المواعيد: 5 سنوات ابتداءً من تاريخ الاستشارة؛",
            "بيانات التصفح والسجلات: 13 شهراً كحد أقصى؛",
            "وثائق التحقق من الأطباء: مدة النشاط على المنصة + سنة واحدة.",
          ] },
          { p: "عند انتهاء هذه المدد، تُحذف بياناتك أو تُجهَّل بشكل لا رجعة فيه." },
        ],
      },
      transferts: {
        title: "8. النقل الدولي للبيانات",
        blocks: [
          { p: "خوادمنا مستضافة في المغرب وأوروبا. وفي حال نقل البيانات خارج هذه المناطق، نحرص على وجود ضمانات ملائمة (بنود تعاقدية نموذجية، شهادات اعتماد)." },
        ],
      },
      cookies: {
        title: "9. ملفات تعريف الارتباط والمتتبِّعات",
        blocks: [
          { p: "تستعمل SantéauMaroc ملفات تعريف الارتباط لضمان حسن اشتغال المنصة وتحسين تجربتك." },
          { ul: [
            "<strong>ملفات ضرورية:</strong> لازمة لاشتغال المنصة (المصادقة، الأمن). لا يمكن تعطيلها.",
            "<strong>ملفات تحليلية:</strong> تساعدنا على فهم استعمال المنصة لتحسينها. تخضع لموافقتك.",
            "<strong>ملفات التفضيلات:</strong> تحفظ إعداداتك (اللغة، المدينة الافتراضية).",
          ] },
          { p: "يمكنك إدارة تفضيلاتك عبر إعدادات متصفحك. ورفض الملفات التحليلية لا يؤثر على وصولك إلى الخدمات." },
        ],
      },
      securite: {
        title: "10. أمن البيانات",
        blocks: [
          { p: "تطبّق SantéauMaroc تدابير تقنية وتنظيمية صارمة لحماية بياناتك من أي وصول غير مصرّح به أو فقدان أو إفشاء:" },
          { ul: [
            "تشفير البيانات أثناء النقل (TLS/SSL) وأثناء التخزين؛",
            "مصادقة آمنة وإدارة صارمة للصلاحيات؛",
            "تدقيقات أمنية منتظمة واختبارات اختراق؛",
            "خطة للاستجابة للحوادث الأمنية.",
          ] },
          { p: "في حال خرق للبيانات قد يمسّ بحقوقك، نلتزم بإخبارك داخل الآجال التي يحددها القانون." },
        ],
      },
      mineurs: {
        title: "11. القاصرون",
        blocks: [
          { p: "خدمات SantéauMaroc موجّهة للأشخاص الراشدين (18 سنة فما فوق). ولا نجمع عن قصد بيانات شخصية تخصّ القاصرين. إذا كنت وليّ أمر ولاحظت أن طفلك قدّم بيانات، فاتصل بنا لطلب حذفها." },
        ],
      },
    },
    collecte: {
      title: "2. البيانات المجمَّعة",
      intro: "نجمع فئات مختلفة من البيانات حسب ملفك:",
      cards: [
        { title: "المرضى", items: ["الاسم، النسب، البريد الإلكتروني", "رقم الهاتف", "سجل المواعيد", "الآراء والتقييمات المنشورة"] },
        { title: "الأطباء", items: ["الهوية المهنية", "عنوان وهاتف العيادة", "وثائق التحقق", "أوقات التوفر والأجندة"] },
      ],
      outro: "كما نجمع <strong>بيانات التصفح</strong> (عنوان IP، نوع المتصفح، الصفحات المُزارة) عبر ملفات تعريف الارتباط وأدوات التحليل، بهدف تحسين خدماتنا.",
    },
    droits: {
      title: "7. حقوقك",
      intro: "وفقاً للقانون المغربي 09-08 ومعايير النظام الأوروبي العام لحماية البيانات (RGPD)، تتمتع بالحقوق التالية على بياناتك الشخصية:",
      rights: [
        { title: "حق الاطلاع", desc: "احصل على نسخة كاملة من بياناتك الشخصية التي تحتفظ بها SantéauMaroc." },
        { title: "حق التصحيح", desc: "صحّح معلوماتك الشخصية أو حدّثها في أي وقت." },
        { title: "حق المحو", desc: "اطلب حذف بياناتك (مع مراعاة الالتزامات القانونية)." },
        { title: "حق الاعتراض", desc: "ارفض معالجة بياناتك لأغراض التسويق أو التنميط." },
        { title: "حق الحد من المعالجة", desc: "أوقف معالجة بياناتك مؤقتاً في حالات معينة." },
        { title: "حق قابلية النقل", desc: "استلم بياناتك في صيغة منظّمة وقابلة للقراءة آلياً." },
      ],
      outro: `لممارسة حقوقك، اتصل بمسؤول حماية البيانات لدينا على <a href="mailto:${EMAIL}">${EMAIL}</a>. نلتزم بالرد خلال أجل <strong>30 يوماً</strong>.`,
    },
    contact: {
      title: "12. الاتصال ومسؤول حماية البيانات",
      intro: "لأي سؤال يتعلق بهذه السياسة أو ببياناتك الشخصية:",
      dpoLabel: "بريد مسؤول الحماية:",
      formLabel: "نموذج الاتصال:",
      formText: "santeaumaroc.com/contact",
      courrierLabel: "البريد:",
      courrierText: "SantéauMaroc SARL — DPO، الدار البيضاء، المغرب",
      outro: "كما يحق لك تقديم شكاية لدى اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي (CNDP) بالمغرب.",
    },
    related: {
      conditionsLabel: "شروط الاستعمال",
      conditionsDesc: "قواعد استعمال منصة SantéauMaroc.",
      contactLabel: "اتصل بنا",
      contactDesc: "سؤال حول بياناتك؟ فريقنا يجيبك.",
    },
  },
};

export default async function PolitiqueConfidentialitePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale: Locale = toLocale((await params).lang) === "ar" ? "ar" : "fr";
  const t = COPY[locale];

  return (
    <>
      {/* ── Hero compact ─────────────────────────────── */}
      <div className="hero-bg relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          aria-hidden="true"
        />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <p className="section-eyebrow text-secondary-300 mb-3">{t.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t.h1}</h1>
          <p className="text-white/70 text-sm">
            {t.updatedLabel} <span className="text-white font-medium">{t.updatedDate}</span>
          </p>
        </div>
      </div>

      {/* ── Contenu ──────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[240px_1fr] gap-10 items-start">

          {/* ── Sommaire sticky ─────────────────────── */}
          <nav className="hidden lg:block sticky top-24" aria-label={t.sommaire}>
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{t.sommaire}</p>
              <ul className="flex flex-col gap-1">
                {t.toc.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block text-xs text-slate-500 hover:text-primary-600 py-1 px-2 rounded-lg hover:bg-primary-50 transition-colors leading-snug"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust badge */}
            <div className="mt-4 card p-4 bg-secondary-50 border-secondary-100 text-center">
              <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center mx-auto mb-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-5 h-5 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2L4 4.5v5C4 13.2 6.8 16.8 10 18c3.2-1.2 6-4.8 6-8.5v-5L10 2z"/>
                  <path d="m7.5 10 2 2 3-3.5"/>
                </svg>
              </div>
              <p className="text-xs font-semibold text-secondary-800 leading-snug">{t.trustBadge}</p>
            </div>
          </nav>

          {/* ── Corps du texte ───────────────────────── */}
          <article>

            {/* Chapeau */}
            <div className="card p-5 mb-8 bg-secondary-50 border-secondary-100 text-sm text-secondary-800 leading-relaxed">
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-5 h-5 text-secondary-500 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2L4 4.5v5C4 13.2 6.8 16.8 10 18c3.2-1.2 6-4.8 6-8.5v-5L10 2z"/>
                  <path d="m7.5 10 2 2 3-3.5"/>
                </svg>
                <p>{t.chapeau}</p>
              </div>
            </div>

            {/* 1. Responsable */}
            <PrivacySection title={t.prose.responsable.title} id="responsable">
              <Blocks blocks={t.prose.responsable.blocks} />
            </PrivacySection>

            {/* 2. Données collectées */}
            <PrivacySection title={t.collecte.title} id="collecte">
              <p>{t.collecte.intro}</p>
              <div className="grid sm:grid-cols-2 gap-3 my-3">
                {t.collecte.cards.map((cat, i) => (
                  <div key={cat.title} className={`rounded-xl border p-4 ${i === 0 ? "bg-primary-50 border-primary-100" : "bg-secondary-50 border-secondary-100"}`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">{cat.title}</p>
                    <ul className="flex flex-col gap-1">
                      {cat.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-primary-500" : "bg-secondary-500"} mt-1.5 shrink-0`} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p dangerouslySetInnerHTML={{ __html: t.collecte.outro }} />
            </PrivacySection>

            {/* 3. Finalités */}
            <PrivacySection title={t.prose.finalites.title} id="finalites">
              <Blocks blocks={t.prose.finalites.blocks} />
            </PrivacySection>

            {/* 4. Base légale */}
            <PrivacySection title={t.prose["base-legale"].title} id="base-legale">
              <Blocks blocks={t.prose["base-legale"].blocks} />
            </PrivacySection>

            {/* 5. Destinataires */}
            <PrivacySection title={t.prose.destinataires.title} id="destinataires">
              <Blocks blocks={t.prose.destinataires.blocks} />
            </PrivacySection>

            {/* 6. Conservation */}
            <PrivacySection title={t.prose.conservation.title} id="conservation">
              <Blocks blocks={t.prose.conservation.blocks} />
            </PrivacySection>

            {/* 7. Vos droits */}
            <PrivacySection title={t.droits.title} id="droits">
              <p>{t.droits.intro}</p>
              <div className="grid sm:grid-cols-2 gap-3 my-4">
                {t.droits.rights.map((r, i) => (
                  <div key={r.title} className="card-flat rounded-xl p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                        className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d={RIGHT_ICONS[i]} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 mb-0.5">{r.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p dangerouslySetInnerHTML={{ __html: t.droits.outro }} />
            </PrivacySection>

            {/* 8. Transferts */}
            <PrivacySection title={t.prose.transferts.title} id="transferts">
              <Blocks blocks={t.prose.transferts.blocks} />
            </PrivacySection>

            {/* 9. Cookies */}
            <PrivacySection title={t.prose.cookies.title} id="cookies">
              <Blocks blocks={t.prose.cookies.blocks} />
            </PrivacySection>

            {/* 10. Sécurité */}
            <PrivacySection title={t.prose.securite.title} id="securite">
              <Blocks blocks={t.prose.securite.blocks} />
            </PrivacySection>

            {/* 11. Mineurs */}
            <PrivacySection title={t.prose.mineurs.title} id="mineurs">
              <Blocks blocks={t.prose.mineurs.blocks} />
            </PrivacySection>

            {/* 12. Contact */}
            <PrivacySection title={t.contact.title} id="contact">
              <p>{t.contact.intro}</p>
              <ul>
                <li>
                  <strong>{t.contact.dpoLabel}</strong>{" "}
                  <a href={`mailto:${EMAIL}`} className="text-primary-600 hover:underline font-medium">{EMAIL}</a>
                </li>
                <li>
                  <strong>{t.contact.formLabel}</strong>{" "}
                  <Link href="/contact" className="text-primary-600 hover:underline font-medium">{t.contact.formText}</Link>
                </li>
                <li>
                  <strong>{t.contact.courrierLabel}</strong> {t.contact.courrierText}
                </li>
              </ul>
              <p>{t.contact.outro}</p>
            </PrivacySection>

            {/* Liens connexes */}
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <div className="card p-5 hover:border-primary-200 transition-colors group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="2" width="14" height="12" rx="2"/><path d="M1 6h14"/>
                    </svg>
                  </div>
                  <Link href="/conditions-utilisation" className="font-semibold text-sm text-slate-900 hover:text-primary-700">
                    {t.related.conditionsLabel}
                  </Link>
                </div>
                <p className="text-xs text-slate-500">{t.related.conditionsDesc}</p>
              </div>
              <div className="card p-5 hover:border-secondary-200 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                      className="w-4 h-4 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3a1 1 0 0 1 1-1h2l1 4-2 1a11 11 0 0 0 4 4l1-2 4 1v2a1 1 0 0 1-1 1A12 12 0 0 1 2 3z"/>
                    </svg>
                  </div>
                  <Link href="/contact" className="font-semibold text-sm text-slate-900 hover:text-secondary-700">
                    {t.related.contactLabel}
                  </Link>
                </div>
                <p className="text-xs text-slate-500">{t.related.contactDesc}</p>
              </div>
            </div>

          </article>
        </div>
      </div>
    </>
  );
}

/* ── Rendu générique de blocs (paragraphes / listes) ─────────── */

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        "p" in b ? (
          <p key={i} dangerouslySetInnerHTML={{ __html: b.p }} />
        ) : (
          <ul key={i}>
            {b.ul.map((li, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: li }} />
            ))}
          </ul>
        ),
      )}
    </>
  );
}

/* ── Composant section légale ────────────────────────────────── */

function PrivacySection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-secondary-500 to-primary-500 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm text-slate-600 leading-relaxed [&_ul]:ps-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_li]:list-disc [&_strong]:text-slate-800 [&_strong]:font-semibold [&_a]:text-primary-600 [&_a]:font-medium hover:[&_a]:underline">
        {children}
      </div>
    </section>
  );
}
