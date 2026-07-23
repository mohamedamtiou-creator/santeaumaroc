/**
 * Contenu de la landing /publier-un-article (FR + AR).
 *
 * Page de recrutement des contributeurs (médecins & pros de santé). Objectif CRO :
 * convertir un médecin pressé en auteur. Promesse HONNÊTE : ~5 min de rédaction
 * active ; la relecture médicale et l'indexation SEO sont prises en charge après
 * (argument de confiance, pas friction). Statique/ISR : les chiffres réels sont
 * injectés par la page. cf lib/methodology-content.ts pour la convention.
 */
import type { Locale } from "@/lib/i18n";

export type Benefit = { icon: string; title: string; desc: string };
export type Step = { title: string; desc: string; time?: string };
export type Faq = { q: string; a: string };

type PublishContent = {
  metaTitle: string;
  metaDesc: string;
  breadcrumb: string;
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: string[];
    promiseLabel: string;
    promiseValue: string;
  };
  proofTitle: string;
  statLabels: { readers: string; articles: string; authors: string; specialties: string; cities: string };
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefits: Benefit[];
  stepsTitle: string;
  stepsSubtitle: string;
  steps: Step[];
  weHandleTitle: string;
  weHandle: string[];
  editorTitle: string;
  editorSubtitle: string;
  editorFeatures: string[];
  whoTitle: string;
  whoIntro: string;
  trustTitle: string;
  trustBody: string;
  methodologyCta: string;
  charterCta: string;
  faqTitle: string;
  faq: Faq[];
  finalTitle: string;
  finalBody: string;
  finalCta: string;
  stickyCta: string;
};

const FR: PublishContent = {
  metaTitle: "Publier un article médical — Devenez auteur sur SantéauMaroc",
  metaDesc:
    "Médecins, dentistes, pharmaciens et professionnels de santé : partagez votre expertise avec des millions de lecteurs marocains. Rédigez en 5 minutes, nous relisons et optimisons. Page auteur SEO + badge « Auteur vérifié ».",
  breadcrumb: "Publier un article",
  hero: {
    eyebrow: "Plateforme contributive santé · Maroc",
    titleLead: "Vous écrivez.",
    titleAccent: "On s'occupe du reste.",
    subtitle:
      "Publiez des articles santé fiables, lus par les patients marocains. Nous assurons la relecture médicale, le SEO et la mise en forme — sous votre nom.",
    ctaPrimary: "Publier un article",
    ctaSecondary: "Voir un exemple d'auteur",
    trust: ["Gratuit", "Relecture médicale", "Badge « Auteur vérifié »", "Page auteur optimisée SEO"],
    promiseLabel: "Inclus",
    promiseValue: "Relecture + SEO",
  },
  proofTitle: "Une audience santé qui grandit chaque jour",
  statLabels: {
    readers: "lectures cumulées",
    articles: "articles publiés",
    authors: "professionnels",
    specialties: "spécialités",
    cities: "villes couvertes",
  },
  benefitsTitle: "Pourquoi les médecins publient sur SantéauMaroc",
  benefitsSubtitle: "Un seul article travaille pour vous, en continu.",
  benefits: [
    { icon: "eye", title: "Visibilité maximale", desc: "Vos articles ressortent sur Google et touchent les patients qui cherchent des réponses." },
    { icon: "award", title: "Autorité reconnue", desc: "Signature, diplômes et relecteur affichés : votre expertise devient une référence citable." },
    { icon: "trending-up", title: "Référencement durable", desc: "Chaque article est optimisé SEO et continue d'attirer des lecteurs pendant des années." },
    { icon: "users", title: "Des milliers de patients", desc: "Vous informez, vous rassurez, et vous devenez le médecin qu'on retient." },
    { icon: "building", title: "Votre cabinet mis en avant", desc: "Fiche praticien liée à vos articles : de la lecture à la prise de rendez-vous." },
    { icon: "star", title: "E-réputation renforcée", desc: "Une présence professionnelle maîtrisée, à votre nom, que vous contrôlez." },
    { icon: "id-card", title: "Page auteur dédiée", desc: "Une page personnelle optimisée qui regroupe tous vos articles et vos liens." },
    { icon: "badge-check", title: "Badge « Auteur vérifié »", desc: "Un gage de confiance visible par les lecteurs comme par les moteurs de recherche." },
  ],
  stepsTitle: "Vous écrivez, on gère la relecture, le SEO et la publication.",
  stepsSubtitle: "Un parcours pensé pour des médecins qui n'ont pas de temps à perdre.",
  steps: [
    { title: "Créez votre compte", desc: "Avec votre e-mail professionnel. Aucune carte bancaire.", time: "2 min" },
    { title: "Confirmez votre profession", desc: "Choisissez votre spécialité et téléversez votre inscription à l'Ordre.", time: "une fois" },
    { title: "Rédigez votre article", desc: "Un éditeur qui vous guide : structure, sources, SEO et version arabe assistés.", time: "à votre rythme" },
    { title: "C'est en ligne", desc: "Après notre relecture médicale, votre article est publié sous votre page auteur.", time: "on s'en charge" },
  ],
  weHandleTitle: "Ce dont nous nous occupons pour vous",
  weHandle: [
    "Relecture médicale par un pair",
    "Optimisation SEO (métadonnées, structure, maillage)",
    "Balisage Schema.org & AI Overviews",
    "Mise en forme et page auteur",
    "Suivi des vues et des lectures",
  ],
  editorTitle: "Un éditeur conçu pour les médecins pressés",
  editorSubtitle: "Tout ce qu'il faut pour un article fiable, rien de superflu.",
  editorFeatures: [
    "Rédaction bilingue français / arabe",
    "Sources & références en un clic",
    "FAQ et « à retenir » pour la visibilité IA",
    "Aide SEO intégrée (titre, méta, mots-clés)",
    "Déclaration de conflit d'intérêt & niveau de preuve",
    "Enregistrement automatique en brouillon",
  ],
  whoTitle: "Qui peut publier ?",
  whoIntro:
    "La plateforme est réservée aux professionnels de santé et institutions. L'identité de chaque auteur est vérifiée avant publication.",
  trustTitle: "La confiance avant tout",
  trustBody:
    "Chaque article cite ses sources, nomme son auteur et son relecteur, indique sa date de mise à jour et son niveau de preuve. Rien n'est publié sans relecture humaine — c'est notre engagement envers les patients comme envers Google.",
  methodologyCta: "Notre méthodologie",
  charterCta: "Charte éditoriale",
  faqTitle: "Vos questions, nos réponses",
  faq: [
    { q: "Combien de temps pour publier mon premier article ?", a: "La rédaction se fait à votre rythme, souvent en une seule session. La vérification de votre identité et la relecture médicale se font ensuite de notre côté, en quelques jours ouvrés — vous n'avez rien à surveiller." },
    { q: "Est-ce vraiment gratuit ?", a: "Oui. Publier, disposer d'une page auteur et obtenir le badge vérifié sont gratuits. Des options de mise en avant payantes existent, toujours clairement identifiées." },
    { q: "Qui peut devenir auteur ?", a: "Médecins, dentistes, pharmaciens, psychologues, nutritionnistes, kinésithérapeutes, sages-femmes, infirmiers, professeurs, chercheurs, ainsi que les associations, hôpitaux et cliniques." },
    { q: "Qui relit mes articles ?", a: "Un relecteur médical indépendant — jamais vous-même. Il vérifie la justesse et la conformité avant publication, ce qui protège votre crédibilité." },
    { q: "Puis-je écrire en arabe ?", a: "Oui. Chaque article peut avoir une version arabe, publiée après relecture au même titre que la version française." },
    { q: "Vais-je garder le contrôle de mes contenus ?", a: "Absolument. Vous restez l'auteur, vous pouvez mettre à jour ou retirer vos articles, et votre page auteur est à votre nom." },
  ],
  finalTitle: "Prêt à partager votre expertise ?",
  finalBody: "Rejoignez les professionnels qui construisent la première bibliothèque médicale du Maroc.",
  finalCta: "Publier mon premier article",
  stickyCta: "Publier un article",
};

const AR: PublishContent = {
  metaTitle: "انشر مقالاً طبياً — كن كاتباً على SantéauMaroc",
  metaDesc:
    "أطباء، أطباء أسنان، صيادلة ومهنيو الصحة: شاركوا خبرتكم مع ملايين القراء المغاربة. اكتبوا في 5 دقائق، ونحن نراجع ونُحسّن. صفحة كاتب محسّنة + شارة « كاتب موثَّق ».",
  breadcrumb: "انشر مقالاً",
  hero: {
    eyebrow: "منصّة المحتوى الصحي التشاركية · المغرب",
    titleLead: "أنت تكتب.",
    titleAccent: "ونحن نتكفّل بالباقي.",
    subtitle:
      "انشر مقالات صحية موثوقة يقرأها المرضى المغاربة. نتكفّل بالمراجعة الطبية وتحسين محرّكات البحث والتنسيق — باسمك.",
    ctaPrimary: "انشر مقالاً",
    ctaSecondary: "اطّلع على نموذج كاتب",
    trust: ["مجاني", "مراجعة طبية", "شارة « كاتب موثَّق »", "صفحة كاتب محسّنة"],
    promiseLabel: "مشمول",
    promiseValue: "مراجعة + SEO",
  },
  proofTitle: "جمهور صحي يكبر كل يوم",
  statLabels: {
    readers: "قراءة تراكمية",
    articles: "مقال منشور",
    authors: "مهني صحة",
    specialties: "تخصّص",
    cities: "مدينة مغطّاة",
  },
  benefitsTitle: "لماذا ينشر الأطباء على SantéauMaroc",
  benefitsSubtitle: "مقال واحد يعمل لصالحك، باستمرار.",
  benefits: [
    { icon: "eye", title: "ظهور أقصى", desc: "تظهر مقالاتك على Google وتصل إلى المرضى الباحثين عن أجوبة." },
    { icon: "award", title: "سلطة معترف بها", desc: "التوقيع والشهادات والمراجع ظاهرة: تصبح خبرتك مرجعاً موثوقاً." },
    { icon: "trending-up", title: "ترتيب دائم", desc: "كل مقال مُحسَّن لمحرّكات البحث ويظلّ يجذب القرّاء لسنوات." },
    { icon: "users", title: "آلاف المرضى", desc: "تُعلِم وتطمئن وتصبح الطبيب الذي يُتذكَّر." },
    { icon: "building", title: "إبراز عيادتك", desc: "بطاقة الممارس مرتبطة بمقالاتك: من القراءة إلى حجز الموعد." },
    { icon: "star", title: "سمعة رقمية أقوى", desc: "حضور مهني مُتحكَّم فيه، باسمك." },
    { icon: "id-card", title: "صفحة كاتب خاصة", desc: "صفحة شخصية محسّنة تجمع كل مقالاتك وروابطك." },
    { icon: "badge-check", title: "شارة « كاتب موثَّق »", desc: "دليل ثقة يراه القرّاء ومحرّكات البحث." },
  ],
  stepsTitle: "أنت تكتب، ونحن نتكفّل بالمراجعة وSEO والنشر.",
  stepsSubtitle: "مسار مُصمَّم لأطباء لا وقت لديهم لإضاعته.",
  steps: [
    { title: "أنشئ حسابك", desc: "ببريدك المهني. دون أي بطاقة بنكية.", time: "دقيقتان" },
    { title: "أكّد مهنتك", desc: "اختر تخصّصك وحمّل تسجيلك في الهيئة.", time: "مرّة واحدة" },
    { title: "حرّر مقالك", desc: "محرّر يرشدك: البنية والمصادر وSEO والنسخة العربية بمساعدة.", time: "على راحتك" },
    { title: "أصبح منشوراً", desc: "بعد مراجعتنا الطبية، يُنشر مقالك ضمن صفحة الكاتب.", time: "نتكفّل به" },
  ],
  weHandleTitle: "ما نتكفّل به عنك",
  weHandle: [
    "مراجعة طبية من قِبل زميل",
    "تحسين SEO (البيانات الوصفية، البنية، الروابط)",
    "ترميز Schema.org وAI Overviews",
    "التنسيق وصفحة الكاتب",
    "تتبّع المشاهدات والقراءات",
  ],
  editorTitle: "محرّر مُصمَّم للأطباء المشغولين",
  editorSubtitle: "كل ما يلزم لمقال موثوق، دون زوائد.",
  editorFeatures: [
    "تحرير بالفرنسية والعربية",
    "المصادر والمراجع بنقرة",
    "أسئلة شائعة و« أهم النقاط » لظهور الذكاء الاصطناعي",
    "مساعدة SEO مدمجة (العنوان، الوصف، الكلمات)",
    "تصريح تضارب المصالح ومستوى الدليل",
    "حفظ تلقائي كمسودة",
  ],
  whoTitle: "من يمكنه النشر؟",
  whoIntro: "المنصّة مخصّصة لمهنيي الصحة والمؤسسات. يُتحقَّق من هوية كل كاتب قبل النشر.",
  trustTitle: "الثقة أولاً",
  trustBody:
    "كل مقال يذكر مصادره، ويُسمّي كاتبه ومراجعه، ويشير إلى تاريخ تحديثه ومستوى الدليل. لا شيء يُنشر دون مراجعة بشرية — هذا التزامنا تجاه المرضى وGoogle معاً.",
  methodologyCta: "منهجيتنا",
  charterCta: "الميثاق التحريري",
  faqTitle: "أسئلتكم، أجوبتنا",
  faq: [
    { q: "كم من الوقت لنشر أول مقال؟", a: "التحرير يتمّ على راحتك، غالباً في جلسة واحدة. أما التحقق من هويتك والمراجعة الطبية فنتكفّل بهما نحن خلال أيام عمل قليلة — دون أن تراقب شيئاً." },
    { q: "هل هو مجاني فعلاً؟", a: "نعم. النشر وصفحة الكاتب وشارة التوثيق مجانية. توجد خيارات إبراز مدفوعة، محدّدة دائماً بوضوح." },
    { q: "من يمكنه أن يصبح كاتباً؟", a: "أطباء، أطباء أسنان، صيادلة، أخصائيون نفسيون، أخصائيو تغذية، أخصائيو علاج طبيعي، قابلات، ممرّضون، أساتذة، باحثون، إضافةً إلى الجمعيات والمستشفيات والعيادات." },
    { q: "من يراجع مقالاتي؟", a: "مراجع طبي مستقل — لا أنت. يتحقّق من الدقة والمطابقة قبل النشر، ما يحمي مصداقيتك." },
    { q: "هل يمكنني الكتابة بالعربية؟", a: "نعم. لكل مقال نسخة عربية، تُنشر بعد المراجعة مثل النسخة الفرنسية." },
    { q: "هل أحتفظ بالتحكّم في محتواي؟", a: "بالتأكيد. تبقى الكاتب، ويمكنك تحديث مقالاتك أو سحبها، وصفحتك باسمك." },
  ],
  finalTitle: "مستعدّ لمشاركة خبرتك؟",
  finalBody: "انضمّ إلى المهنيين الذين يبنون أول مكتبة طبية في المغرب.",
  finalCta: "انشر أول مقال لي",
  stickyCta: "انشر مقالاً",
};

export function publishContent(locale: Locale): PublishContent {
  return locale === "ar" ? AR : FR;
}
