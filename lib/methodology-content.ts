/**
 * Contenu de la page /methodologie (FR + AR).
 *
 * Rôle E-E-A-T / Trust : expliciter COMMENT le contenu médical est produit,
 * la hiérarchie des niveaux de preuve, et les sources de référence. C'est une
 * page « signal de confiance » (pour Google) et une page très citable (pour les
 * moteurs IA), complémentaire de la charte éditoriale (gouvernance).
 *
 * Les sources listées sont des institutions réelles et vérifiées. Ne pas y
 * ajouter de lien non vérifié.
 */
import type { Locale } from "@/lib/i18n";

export const METHODOLOGY_REVIEWED = "2026-07-13"; // date de dernière revue de cette page

export type MethSection = { id: string; title: string; body: string[] };
export type EvidenceLevel = { tier: string; label: string; desc: string };
export type SourceRef = { name: string; scope: string; url: string };

type MethContent = {
  metaTitle: string;
  metaDesc: string;
  breadcrumb: string;
  title: string;
  intro: string;
  updatedLabel: string;
  sections: MethSection[];
  evidenceTitle: string;
  evidenceIntro: string;
  evidenceLevels: EvidenceLevel[];
  sourcesTitle: string;
  sourcesIntro: string;
  sources: SourceRef[];
  errorTitle: string;
  errorBody: string;
  contactCta: string;
  charterCta: string;
};

const FR: MethContent = {
  metaTitle: "Méthodologie & niveaux de preuve",
  metaDesc:
    "Comment SantéauMaroc produit ses contenus médicaux : hiérarchie des niveaux de preuve, sources scientifiques de référence (OMS, HAS, Cochrane, PubMed, Ministère de la Santé), relecture et mise à jour.",
  breadcrumb: "Méthodologie",
  title: "Notre méthodologie et nos niveaux de preuve",
  intro:
    "Sur des sujets de santé, la fiabilité de l'information n'est pas négociable. Cette page explique comment nous produisons nos contenus, comment nous hiérarchisons les preuves scientifiques et sur quelles sources de référence nous nous appuyons.",
  updatedLabel: "Page revue le",
  sections: [
    {
      id: "production",
      title: "Comment nous produisons nos contenus",
      body: [
        "Chaque contenu médical suit un cycle en quatre temps : recherche documentaire à partir de sources de référence, rédaction dans un langage clair, relecture au regard des recommandations en vigueur, puis mise à jour périodique.",
        "Nous privilégions les recommandations des autorités de santé et les synthèses de preuves plutôt qu'une étude isolée ou une opinion personnelle. Lorsqu'un sujet fait débat ou évolue, nous le signalons plutôt que de trancher artificiellement.",
      ],
    },
    {
      id: "adaptation-maroc",
      title: "Une information adaptée au contexte marocain",
      body: [
        "Nous contextualisons systématiquement l'information pour le Maroc : parcours de soins, disponibilité des examens, ordres de prix indicatifs et prise en charge par l'Assurance Maladie Obligatoire (AMO), sans jamais transposer sans discernement des données étrangères.",
      ],
    },
    {
      id: "limites",
      title: "Ce que nos contenus ne sont pas",
      body: [
        "Nos contenus sont fournis à titre informatif et pédagogique. Ils ne constituent ni un diagnostic, ni une prescription, et ne remplacent en aucun cas une consultation avec un professionnel de santé qualifié, seul à même d'évaluer votre situation individuelle.",
      ],
    },
    {
      id: "ia",
      title: "Transparence sur l'usage de l'intelligence artificielle",
      body: [
        "L'IA peut nous aider à structurer ou résumer l'information, mais elle ne remplace jamais la validation humaine sur les contenus médicaux. Un résumé généré n'est affiché que s'il dérive d'un contenu déjà vérifié, et il est identifié comme tel.",
      ],
    },
    {
      id: "mise-a-jour",
      title: "Fraîcheur et mise à jour",
      body: [
        "La médecine évolue. Nous affichons les dates de publication, de mise à jour et de relecture médicale, et nous réexaminons en priorité les contenus les plus sensibles et les plus consultés.",
      ],
    },
  ],
  evidenceTitle: "Notre hiérarchie des niveaux de preuve",
  evidenceIntro:
    "Toutes les sources n'ont pas la même valeur. Nous accordons le plus de poids aux synthèses de preuves et aux recommandations officielles, et le moins à l'avis isolé.",
  evidenceLevels: [
    { tier: "1", label: "Méta-analyses et revues systématiques", desc: "Synthèses rigoureuses de l'ensemble des études disponibles (ex. Cochrane). Le niveau de preuve le plus élevé." },
    { tier: "2", label: "Essais cliniques randomisés", desc: "Études comparatives contrôlées, conçues pour limiter les biais." },
    { tier: "3", label: "Recommandations des autorités de santé", desc: "Synthèses validées par des institutions (OMS, HAS, Ministère de la Santé) faisant autorité." },
    { tier: "4", label: "Études observationnelles", desc: "Études de cohorte ou cas-témoins, utiles mais plus exposées aux biais." },
    { tier: "5", label: "Avis d'experts", desc: "Consensus professionnel, mobilisé lorsque les preuves de plus haut niveau manquent." },
  ],
  sourcesTitle: "Nos sources de référence",
  sourcesIntro:
    "Nous nous appuyons en priorité sur les institutions et bases de données scientifiques suivantes :",
  sources: [
    { name: "Organisation mondiale de la Santé (OMS)", scope: "Recommandations et données de santé mondiales", url: "https://www.who.int/fr" },
    { name: "Haute Autorité de Santé (HAS)", scope: "Recommandations de bonne pratique", url: "https://www.has-sante.fr" },
    { name: "Cochrane", scope: "Revues systématiques et méta-analyses", url: "https://www.cochrane.org/fr" },
    { name: "PubMed", scope: "Base de données de la littérature médicale", url: "https://pubmed.ncbi.nlm.nih.gov" },
    { name: "Ministère de la Santé et de la Protection sociale (Maroc)", scope: "Politiques et données de santé nationales", url: "https://www.sante.gov.ma" },
    { name: "ANAM", scope: "Régulation de l'Assurance Maladie Obligatoire (AMO)", url: "https://anam.ma/anam/" },
  ],
  errorTitle: "Vous avez repéré une erreur ?",
  errorBody:
    "La rigueur est un travail continu. Si vous constatez une inexactitude ou une information dépassée, signalez-la-nous : nous l'examinerons et corrigerons si nécessaire.",
  contactCta: "Nous signaler une erreur",
  charterCta: "Consulter notre charte éditoriale",
};

const AR: MethContent = {
  metaTitle: "المنهجية ومستويات الإثبات",
  metaDesc:
    "كيف تُنتج «الصحة في المغرب» محتوياتها الطبية: تدرّج مستويات الإثبات، المصادر العلمية المرجعية (منظمة الصحة العالمية، HAS، Cochrane، PubMed، وزارة الصحة)، المراجعة والتحديث.",
  breadcrumb: "المنهجية",
  title: "منهجيتنا ومستويات الإثبات لدينا",
  intro:
    "في مواضيع الصحة، موثوقية المعلومة غير قابلة للتفاوض. تشرح هذه الصفحة كيف نُنتج محتوياتنا، وكيف نُرتّب الأدلة العلمية، وعلى أي مصادر مرجعية نعتمد.",
  updatedLabel: "روجعت الصفحة في",
  sections: [
    {
      id: "production",
      title: "كيف نُنتج محتوياتنا",
      body: [
        "يمرّ كل محتوى طبي بأربع مراحل: بحث وثائقي انطلاقاً من مصادر مرجعية، تحرير بلغة واضحة، مراجعة في ضوء التوصيات المعمول بها، ثم تحديث دوري.",
        "نُفضّل توصيات السلطات الصحية وخلاصات الأدلة على دراسة معزولة أو رأي شخصي. وعندما يكون الموضوع محل نقاش أو يتطور، نُشير إلى ذلك بدل الحسم المصطنع.",
      ],
    },
    {
      id: "adaptation-maroc",
      title: "معلومة ملائمة للسياق المغربي",
      body: [
        "نُكيّف المعلومة دائماً مع المغرب: مسار العلاج، توفر الفحوصات، الأسعار الإرشادية، والتغطية عبر التأمين الإجباري عن المرض (AMO)، دون نقل معطيات أجنبية دون تمحيص.",
      ],
    },
    {
      id: "limites",
      title: "ما ليست عليه محتوياتنا",
      body: [
        "محتوياتنا لأغراض إعلامية وتربوية. لا تُشكّل تشخيصاً ولا وصفة طبية، ولا تُغني بأي حال عن استشارة مهني صحي مؤهل، وهو وحده القادر على تقييم وضعك الفردي.",
      ],
    },
    {
      id: "ia",
      title: "الشفافية حول استعمال الذكاء الاصطناعي",
      body: [
        "قد يساعدنا الذكاء الاصطناعي على هيكلة المعلومة أو تلخيصها، لكنه لا يحلّ محل المراجعة البشرية في المحتوى الطبي. لا يُعرض أي ملخّص مُولَّد إلا إذا كان مُشتقاً من محتوى مُتحقَّق منه، ويُشار إليه بوضوح.",
      ],
    },
    {
      id: "mise-a-jour",
      title: "حداثة المحتوى وتحديثه",
      body: [
        "الطب يتطور. نعرض تواريخ النشر والتحديث والمراجعة الطبية، ونُعيد فحص المحتويات الأكثر حساسية والأكثر زيارة أولاً.",
      ],
    },
  ],
  evidenceTitle: "تدرّج مستويات الإثبات لدينا",
  evidenceIntro:
    "ليست كل المصادر متساوية القيمة. نمنح أكبر وزن لخلاصات الأدلة والتوصيات الرسمية، وأقلّه للرأي المعزول.",
  evidenceLevels: [
    { tier: "1", label: "التحليلات البعدية والمراجعات المنهجية", desc: "خلاصات صارمة لمجمل الدراسات المتاحة (مثل Cochrane). أعلى مستوى إثبات." },
    { tier: "2", label: "التجارب السريرية العشوائية", desc: "دراسات مقارنة محكومة، مُصمَّمة للحد من التحيّز." },
    { tier: "3", label: "توصيات السلطات الصحية", desc: "خلاصات مُصادق عليها من مؤسسات مرجعية (منظمة الصحة العالمية، HAS، وزارة الصحة)." },
    { tier: "4", label: "الدراسات الرصدية", desc: "دراسات أفواج أو حالات-شواهد، مفيدة لكن أكثر عرضة للتحيّز." },
    { tier: "5", label: "آراء الخبراء", desc: "توافق مهني، يُلجأ إليه عند غياب أدلة أعلى مستوى." },
  ],
  sourcesTitle: "مصادرنا المرجعية",
  sourcesIntro: "نعتمد أولاً على المؤسسات وقواعد البيانات العلمية التالية:",
  sources: [
    { name: "منظمة الصحة العالمية (OMS)", scope: "توصيات ومعطيات الصحة العالمية", url: "https://www.who.int/ar" },
    { name: "الهيئة العليا للصحة (HAS)", scope: "توصيات الممارسة الجيدة", url: "https://www.has-sante.fr" },
    { name: "Cochrane", scope: "مراجعات منهجية وتحليلات بعدية", url: "https://www.cochrane.org/fr" },
    { name: "PubMed", scope: "قاعدة بيانات الأدبيات الطبية", url: "https://pubmed.ncbi.nlm.nih.gov" },
    { name: "وزارة الصحة والحماية الاجتماعية (المغرب)", scope: "السياسات والمعطيات الصحية الوطنية", url: "https://www.sante.gov.ma" },
    { name: "ANAM", scope: "تنظيم التأمين الإجباري عن المرض (AMO)", url: "https://anam.ma/anam/" },
  ],
  errorTitle: "لاحظت خطأ؟",
  errorBody:
    "الدقّة عمل مستمر. إذا لاحظت معلومة غير دقيقة أو متجاوَزة، أبلغنا بها: سنفحصها ونصحّحها عند الاقتضاء.",
  contactCta: "أبلغنا عن خطأ",
  charterCta: "الاطلاع على ميثاقنا التحريري",
};

export function methodologyContent(locale: Locale): MethContent {
  return locale === "ar" ? AR : FR;
}
