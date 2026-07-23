/**
 * Contenu bilingue (FR + AR) de l'espace auteur (tableau de bord, mes articles,
 * notifications, profil, layout). L'espace est authentifié + noindex → l'i18n
 * est un confort UX pour les auteurs arabophones (aucun enjeu SEO). Le RTL est
 * géré par le layout racine (`dir` sur <html>). cf lib/publier-content.ts.
 *
 * Les libellés de statut éditorial réutilisent EDITORIAL_LABELS (label/labelAr).
 */
import type { Locale } from "@/lib/i18n";

type EspaceContent = {
  eyebrow: string;
  status: { verified: string; pending: string; unverified: string };
  nav: { dashboard: string; articles: string; newArticle: string; profile: string; verification: string; notifications: string };
  banner: string;
  bannerCta: string;
  // Dashboard
  hello: string; // « Bonjour {name}, »
  spaceTitle: string;
  next: {
    verify: [string, string, string]; changes: [string, string, string]; pending: [string, string, string];
    first: [string, string, string]; draft: [string, string, string]; keep: [string, string, string];
  };
  badgesLabel: string;
  kpi: { published: string; inReview: string; drafts: string; views: string };
  audienceTitle: string; views: string; reads: string; audienceEmpty: string;
  todoTitle: string; btnNew: string; btnAll: string;
  // Mes articles
  articlesTitle: string;
  filters: { all: string; drafts: string; changes: string; review: string; published: string };
  emptyAll: string; emptyFiltered: string; emptyCta: string;
  modifiedOn: string; viewsSuffix: string; qualitySuffix: string; actionView: string; actionEdit: string; actionFix: string;
  untitled: string;
  // Notifications
  notifTitle: string; unread: string; markAll: string; notifEmpty: string; unreadDot: string;
  // Profil
  profilTitle: string; profilIntro: string; profilPublicLink: string;
  // Libellés de pièces justificatives (partagés vérification + formulaire licence)
  kindLabels: Record<string, string>;
  // Page vérification
  verification: {
    title: string; professionDeclared: string; verifiedMsg: string; pendingMsg: string; pendingMsg2: string;
    reassure: { title: string; desc: string }[]; submittedDocs: string; statusLabels: Record<string, string>;
    rejectReason: string; submitDossier: string; updateDossier: string;
  };
  // Formulaire onboarding (profession)
  onboarding: { professionQ: string; orgLegalName: string; continueCta: string; errGeneric: string; selectProfession: string };
  // Formulaire licence
  license: { ordreNumber: string; ordreHint: string; formatsNote: string; submitBtn: string; submitting: string; sent: string; errGeneric: string; requiredMissing: string };
  // Formulaire profil
  profileForm: {
    headline: string; headlineHint: string; jobTitle: string; years: string; specialty: string; city: string; dash: string;
    bio: string; bioAr: string; credentials: string; university: string; orderName: string; regNumber: string;
    languages: string; langHint: string; cabinet: string; website: string; linkedin: string; interests: string; interestsHint: string;
    save: string; saving: string; saved: string; errGeneric: string;
  };
  // Éditeur d'article
  editor: {
    tabFr: string; tabAr: string; arNotice: string;
    title: string; titlePh: string; excerpt: string; excerptHint: string; content: string; wordsHint: string; keyTakeaways: string;
    sourcesTitle: string; sourcesMin: string; sourcesHelp: string; sourceLabelPh: string; sourceUrlPh: string; sourcePublisherPh: string; sourceYearPh: string; addSource: string; removeSource: string;
    faqTitle: string; faqHelp: string; questionPh: string; answerPh: string; addFaq: string; removeFaq: string;
    category: string; evidence: string; conflict: string; conflictPh: string;
    cover: string; uploading: string; alt: string; altHint: string; altPh: string;
    advanced: string; metaTitle: string; metaTitleHint: string; metaDesc: string; aboutEntity: string; aboutPh: string; biblio: string;
    readyTitle: string; notReadyTitle: string; recommended: string;
    bTitle: string; bWords: string; bSources: string; bConflict: string; sH2: string; sFaq: string; sMeta: string; sAlt: string;
    saveDraft: string; submit: string; saving: string; saved: string; notSaved: string; verifyToSubmit: string; needVerif: string; needComplete: string;
    mReady: string; mLeft: string; errSave: string; errSubmit: string; errSubmitGeneric: string; errUpload: string; optional: string;
  };
};

const FR: EspaceContent = {
  eyebrow: "Espace auteur",
  status: { verified: "✓ Auteur vérifié", pending: "Vérification en cours", unverified: "Non vérifié" },
  nav: { dashboard: "Tableau de bord", articles: "Mes articles", newArticle: "Nouvel article", profile: "Profil", verification: "Vérification", notifications: "Notifications" },
  banner: "Vous pouvez préparer des brouillons, mais la soumission exige la vérification de votre identité.",
  bannerCta: "Faire vérifier mes diplômes",
  hello: "Bonjour {name},",
  spaceTitle: "Votre espace auteur",
  next: {
    verify: ["Faites vérifier votre identité", "Une dernière étape avant de pouvoir publier : téléversez votre inscription à l'Ordre et vos diplômes.", "Compléter mon dossier"],
    changes: ["Un article attend vos corrections", "« {title} » — le relecteur a laissé des remarques à intégrer.", "Voir les corrections"],
    pending: ["Vérification en cours", "Pendant que nous vérifions votre dossier, prenez de l'avance : préparez un premier brouillon.", "Rédiger un brouillon"],
    first: ["Écrivez votre premier article", "Partagez votre expertise avec des milliers de patients. Vous êtes guidé à chaque étape.", "Commencer à écrire"],
    draft: ["Reprenez votre brouillon", "« {title} » vous attend. Terminez-le et soumettez-le à validation.", "Continuer"],
    keep: ["Continuez sur votre lancée", "Un nouvel article, c'est plus de visibilité et de patients touchés.", "Écrire un nouvel article"],
  },
  badgesLabel: "Vos badges :",
  kpi: { published: "Articles publiés", inReview: "En révision", drafts: "Brouillons", views: "Vues cumulées" },
  audienceTitle: "Audience — 30 derniers jours", views: "vues", reads: "lectures",
  audienceEmpty: "Pas encore de données de lecture. Les vues apparaîtront ici dès que vos articles seront consultés.",
  todoTitle: "À traiter", btnNew: "Nouvel article", btnAll: "Voir tous mes articles",
  articlesTitle: "Mes articles",
  filters: { all: "Tous", drafts: "Brouillons", changes: "Corrections", review: "En révision", published: "Publiés" },
  emptyAll: "Vous n'avez pas encore d'article.", emptyFiltered: "Aucun article dans cette catégorie.", emptyCta: "Écrire un article",
  modifiedOn: "Modifié le", viewsSuffix: "vues", qualitySuffix: "qualité", actionView: "Voir", actionEdit: "Modifier", actionFix: "Corriger",
  untitled: "Sans titre",
  notifTitle: "Notifications", unread: "non lues", markAll: "Tout marquer comme lu", notifEmpty: "Aucune notification.", unreadDot: "Non lu",
  profilTitle: "Mon profil public", profilIntro: "Ces informations alimentent votre page auteur et le balisage E-E-A-T de vos articles.", profilPublicLink: "Voir ma page publique",
  kindLabels: { ORDRE: "Inscription à l'Ordre", DIPLOME: "Diplôme", CARTE_PRO: "Carte professionnelle", RC: "Registre de commerce", STATUTS: "Statuts", AUTRE: "Autre" },
  verification: {
    title: "Vérification de votre identité", professionDeclared: "Profession déclarée :",
    verifiedMsg: "Votre identité est vérifiée. Vous pouvez soumettre vos articles.",
    pendingMsg: "Votre dossier est en cours de vérification.", pendingMsg2: "Vous serez notifié dès qu’il sera traité — vous n’avez rien à surveiller.",
    reassure: [
      { title: "Confidentiel", desc: "Vos documents sont stockés de façon privée et sécurisée. Ils ne sont visibles que par notre équipe de vérification — jamais publics." },
      { title: "Pourquoi ?", desc: "Vérifier votre identité protège votre crédibilité et garantit aux patients un contenu écrit par de vrais professionnels." },
      { title: "Délai", desc: "Un contrôle humain valide votre dossier en quelques jours ouvrés. Vous êtes notifié dès qu’il est traité." },
    ],
    submittedDocs: "Documents soumis", statusLabels: { PENDING: "En attente", APPROVED: "Validé", REJECTED: "Refusé" },
    rejectReason: "Motif du refus :", submitDossier: "Soumettre mon dossier", updateDossier: "Mettre à jour mon dossier",
  },
  onboarding: { professionQ: "Quelle est votre profession ?", orgLegalName: "Raison sociale de l’établissement", continueCta: "Continuer vers la vérification", errGeneric: "Une erreur est survenue.", selectProfession: "Sélectionnez votre profession." },
  license: { ordreNumber: "Numéro d’inscription à l’Ordre (INPE)", ordreHint: "Vous pouvez fournir le numéro et/ou le document scanné.", formatsNote: "Formats acceptés : JPG, PNG, PDF (max 5 Mo). Vos documents sont stockés de façon privée et ne sont accessibles qu’à notre équipe de vérification.", submitBtn: "Envoyer mon dossier", submitting: "Envoi…", sent: "Dossier envoyé. Votre identité sera vérifiée sous quelques jours ouvrés.", errGeneric: "Une erreur est survenue lors de l’envoi.", requiredMissing: "Document requis" },
  profileForm: {
    headline: "Titre affiché", headlineHint: "(ex. « Cardiologue · CHU Rabat »)", jobTitle: "Fonction", years: "Années d’exercice", specialty: "Spécialité", city: "Ville", dash: "—",
    bio: "Biographie", bioAr: "السيرة الذاتية (بالعربية)", credentials: "Diplômes / titres", university: "Université / institution", orderName: "Ordre professionnel", regNumber: "N° d’inscription (INPE)",
    languages: "Langues", langHint: "(séparées par virgules)", cabinet: "Lien cabinet", website: "Site web", linkedin: "LinkedIn", interests: "Domaines d’expertise", interestsHint: "(virgules)",
    save: "Enregistrer mon profil", saving: "…", saved: "Profil enregistré.", errGeneric: "Une erreur est survenue.",
  },
  editor: {
    tabFr: "Français", tabAr: "العربية", arNotice: "La version arabe n’est publiée qu’après relecture humaine (garde-fou YMYL). Laissez vide si non traduit.",
    title: "Titre", titlePh: "Ex. Diabète de type 2 : reconnaître les premiers signes", excerpt: "Résumé", excerptHint: "— une phrase d’accroche", content: "Contenu", wordsHint: "{n} mots · utilisez des sous-titres (H2) pour structurer", keyTakeaways: "À retenir (1 point par ligne, optionnel)",
    sourcesTitle: "Sources", sourcesMin: "{n}/2 min", sourcesHelp: "Citez au moins 2 sources d’autorité (OMS, HAS, PubMed, Ministère de la Santé…). C’est la clé de la confiance et du référencement.", sourceLabelPh: "Intitulé (ex. OMS — Diabète)", sourceUrlPh: "https://…", sourcePublisherPh: "Éditeur (OMS…)", sourceYearPh: "Année", addSource: "+ Ajouter une source", removeSource: "Supprimer la source",
    faqTitle: "FAQ", faqHelp: "Les questions/réponses améliorent votre visibilité (AI Overviews, extraits Google).", questionPh: "Question", answerPh: "Réponse", addFaq: "+ Ajouter une question", removeFaq: "Supprimer la question",
    category: "Catégorie", evidence: "Niveau de preuve", conflict: "Déclaration de conflit d’intérêt", conflictPh: "Aucun conflit d’intérêt à déclarer.",
    cover: "Image de couverture", uploading: "Envoi en cours…", alt: "Texte alternatif", altHint: "(accessibilité + SEO)", altPh: "Décrivez l’image en une phrase",
    advanced: "Options avancées (SEO)", metaTitle: "Meta title", metaTitleHint: "Repli : le titre de l’article", metaDesc: "Meta description", aboutEntity: "Entité médicale (Schema.org)", aboutPh: "Ex. Diabète de type 2", biblio: "Bibliographie",
    readyTitle: "Prêt à soumettre", notReadyTitle: "Avant de soumettre", recommended: "Recommandé",
    bTitle: "Titre et résumé renseignés", bWords: "Article d’au moins 300 mots ({n})", bSources: "Au moins 2 sources ({n})", bConflict: "Conflit d’intérêt déclaré", sH2: "Au moins un sous-titre (H2)", sFaq: "Une FAQ (visibilité IA)", sMeta: "Meta title & description (SEO)", sAlt: "Texte alternatif de l’image",
    saveDraft: "Enregistrer le brouillon", submit: "Soumettre à validation", saving: "Enregistrement…", saved: "Brouillon enregistré", notSaved: "Non enregistré", verifyToSubmit: "Faites vérifier votre identité pour soumettre.", needVerif: "Vérification requise", needComplete: "Complétez les points obligatoires",
    mReady: "✓ Prêt", mLeft: "{n} à finir", errSave: "Une erreur est survenue lors de l’enregistrement.", errSubmit: "Erreur lors de la soumission.", errSubmitGeneric: "Soumission refusée.", errUpload: "Échec de l’envoi de l’image.", optional: "(optionnel, recommandé)",
  },
};

const AR: EspaceContent = {
  eyebrow: "فضاء الكاتب",
  status: { verified: "✓ كاتب موثَّق", pending: "التحقق جارٍ", unverified: "غير موثَّق" },
  nav: { dashboard: "لوحة التحكم", articles: "مقالاتي", newArticle: "مقال جديد", profile: "الملف الشخصي", verification: "التحقق", notifications: "الإشعارات" },
  banner: "يمكنك تحضير المسودّات، لكن الإرسال يتطلّب التحقق من هويتك.",
  bannerCta: "التحقق من شهاداتي",
  hello: "مرحباً {name}،",
  spaceTitle: "فضاء الكاتب الخاص بك",
  next: {
    verify: ["تحقّق من هويتك", "خطوة أخيرة قبل النشر: حمّل تسجيلك في الهيئة وشهاداتك.", "إكمال ملفّي"],
    changes: ["مقال ينتظر تعديلاتك", "« {title} » — ترك المراجع ملاحظات لإدماجها.", "عرض التعديلات"],
    pending: ["التحقق جارٍ", "بينما نتحقّق من ملفّك، خذ زمام المبادرة: حضّر مسودّة أولى.", "تحرير مسودّة"],
    first: ["اكتب أول مقال لك", "شارك خبرتك مع آلاف المرضى. أنت مُرشَد في كل خطوة.", "ابدأ الكتابة"],
    draft: ["استأنف مسودّتك", "« {title} » في انتظارك. أكملها وأرسلها للمصادقة.", "متابعة"],
    keep: ["واصل تقدّمك", "مقال جديد يعني ظهوراً أكبر ومرضى أكثر.", "كتابة مقال جديد"],
  },
  badgesLabel: "شاراتك :",
  kpi: { published: "مقالات منشورة", inReview: "قيد المراجعة", drafts: "مسودّات", views: "مشاهدات تراكمية" },
  audienceTitle: "الجمهور — آخر 30 يوماً", views: "مشاهدات", reads: "قراءات",
  audienceEmpty: "لا بيانات قراءة بعد. ستظهر المشاهدات هنا بمجرّد قراءة مقالاتك.",
  todoTitle: "للمعالجة", btnNew: "مقال جديد", btnAll: "عرض كل مقالاتي",
  articlesTitle: "مقالاتي",
  filters: { all: "الكل", drafts: "مسودّات", changes: "تعديلات", review: "قيد المراجعة", published: "منشورة" },
  emptyAll: "ليس لديك مقال بعد.", emptyFiltered: "لا مقال في هذه الفئة.", emptyCta: "اكتب مقالاً",
  modifiedOn: "عُدّل في", viewsSuffix: "مشاهدة", qualitySuffix: "جودة", actionView: "عرض", actionEdit: "تعديل", actionFix: "تصحيح",
  untitled: "بدون عنوان",
  notifTitle: "الإشعارات", unread: "غير مقروءة", markAll: "تعليم الكل كمقروء", notifEmpty: "لا إشعارات.", unreadDot: "غير مقروء",
  profilTitle: "ملفي العمومي", profilIntro: "تُغذّي هذه المعلومات صفحة الكاتب والترميز E-E-A-T لمقالاتك.", profilPublicLink: "عرض صفحتي العمومية",
  kindLabels: { ORDRE: "التسجيل في الهيئة", DIPLOME: "الشهادة", CARTE_PRO: "البطاقة المهنية", RC: "السجل التجاري", STATUTS: "القوانين الأساسية", AUTRE: "أخرى" },
  verification: {
    title: "التحقق من هويتك", professionDeclared: "المهنة المصرَّح بها :",
    verifiedMsg: "تم التحقق من هويتك. يمكنك إرسال مقالاتك.",
    pendingMsg: "ملفك قيد التحقق.", pendingMsg2: "ستُشعَر بمجرّد معالجته — لا شيء عليك مراقبته.",
    reassure: [
      { title: "سرّي", desc: "تُخزَّن مستنداتك بشكل خاص وآمن. لا يراها إلا فريق التحقق لدينا — وليست عمومية أبداً." },
      { title: "لماذا؟", desc: "التحقق من هويتك يحمي مصداقيتك ويضمن للمرضى محتوى كتبه مهنيون حقيقيون." },
      { title: "المدة", desc: "يصادق فريق بشري على ملفك خلال أيام عمل قليلة. تُشعَر بمجرّد معالجته." },
    ],
    submittedDocs: "المستندات المُرسَلة", statusLabels: { PENDING: "قيد الانتظار", APPROVED: "مُصادَق", REJECTED: "مرفوض" },
    rejectReason: "سبب الرفض :", submitDossier: "إرسال ملفي", updateDossier: "تحديث ملفي",
  },
  onboarding: { professionQ: "ما هي مهنتك؟", orgLegalName: "الاسم القانوني للمؤسسة", continueCta: "المتابعة نحو التحقق", errGeneric: "حدث خطأ.", selectProfession: "اختر مهنتك." },
  license: { ordreNumber: "رقم التسجيل في الهيئة (INPE)", ordreHint: "يمكنك تقديم الرقم و/أو المستند الممسوح.", formatsNote: "الصيغ المقبولة : JPG، PNG، PDF (حد أقصى 5 ميغا). تُخزَّن مستنداتك بشكل خاص ولا يطّلع عليها إلا فريق التحقق.", submitBtn: "إرسال ملفي", submitting: "جارٍ الإرسال…", sent: "تم إرسال الملف. سيتم التحقق من هويتك خلال أيام عمل قليلة.", errGeneric: "حدث خطأ أثناء الإرسال.", requiredMissing: "مستند مطلوب" },
  profileForm: {
    headline: "العنوان المعروض", headlineHint: "(مثال : « طبيب قلب · المركز الاستشفائي الرباط »)", jobTitle: "الوظيفة", years: "سنوات الممارسة", specialty: "التخصّص", city: "المدينة", dash: "—",
    bio: "السيرة الذاتية", bioAr: "السيرة الذاتية (بالعربية)", credentials: "الشهادات / الألقاب", university: "الجامعة / المؤسسة", orderName: "الهيئة المهنية", regNumber: "رقم التسجيل (INPE)",
    languages: "اللغات", langHint: "(مفصولة بفواصل)", cabinet: "رابط العيادة", website: "الموقع", linkedin: "LinkedIn", interests: "مجالات الخبرة", interestsHint: "(فواصل)",
    save: "حفظ ملفي", saving: "…", saved: "تم حفظ الملف.", errGeneric: "حدث خطأ.",
  },
  editor: {
    tabFr: "Français", tabAr: "العربية", arNotice: "النسخة العربية لا تُنشر إلا بعد مراجعة بشرية (ضمان YMYL). اتركها فارغة إن لم تُترجم.",
    title: "العنوان", titlePh: "مثال : داء السكري من النوع 2 : التعرّف على العلامات الأولى", excerpt: "الملخّص", excerptHint: "— جملة جذّابة", content: "المحتوى", wordsHint: "{n} كلمة · استعمل عناوين فرعية (H2) للتنظيم", keyTakeaways: "أهم النقاط (نقطة في كل سطر، اختياري)",
    sourcesTitle: "المصادر", sourcesMin: "{n}/2 كحدّ أدنى", sourcesHelp: "استشهد بمصدرين موثوقين على الأقل (OMS، HAS، PubMed، وزارة الصحة…). إنها مفتاح الثقة والترتيب.", sourceLabelPh: "العنوان (مثال : OMS — السكري)", sourceUrlPh: "https://…", sourcePublisherPh: "الناشر (OMS…)", sourceYearPh: "السنة", addSource: "+ إضافة مصدر", removeSource: "حذف المصدر",
    faqTitle: "الأسئلة الشائعة", faqHelp: "الأسئلة/الأجوبة تحسّن ظهورك (AI Overviews، مقتطفات Google).", questionPh: "سؤال", answerPh: "جواب", addFaq: "+ إضافة سؤال", removeFaq: "حذف السؤال",
    category: "الفئة", evidence: "مستوى الدليل", conflict: "تصريح تضارب المصالح", conflictPh: "لا تضارب مصالح للتصريح به.",
    cover: "صورة الغلاف", uploading: "جارٍ الإرسال…", alt: "النص البديل", altHint: "(الوصول + SEO)", altPh: "صف الصورة في جملة",
    advanced: "خيارات متقدّمة (SEO)", metaTitle: "Meta title", metaTitleHint: "افتراضي : عنوان المقال", metaDesc: "Meta description", aboutEntity: "كيان طبي (Schema.org)", aboutPh: "مثال : داء السكري من النوع 2", biblio: "المراجع",
    readyTitle: "جاهز للإرسال", notReadyTitle: "قبل الإرسال", recommended: "موصى به",
    bTitle: "العنوان والملخّص مملوءان", bWords: "مقال من 300 كلمة على الأقل ({n})", bSources: "مصدران على الأقل ({n})", bConflict: "تصريح تضارب المصالح", sH2: "عنوان فرعي واحد على الأقل (H2)", sFaq: "أسئلة شائعة (ظهور الذكاء الاصطناعي)", sMeta: "Meta title و description (SEO)", sAlt: "النص البديل للصورة",
    saveDraft: "حفظ المسودّة", submit: "إرسال للمصادقة", saving: "جارٍ الحفظ…", saved: "تم حفظ المسودّة", notSaved: "غير محفوظ", verifyToSubmit: "تحقّق من هويتك لتتمكّن من الإرسال.", needVerif: "التحقق مطلوب", needComplete: "أكمل النقاط الإلزامية",
    mReady: "✓ جاهز", mLeft: "{n} متبقّية", errSave: "حدث خطأ أثناء الحفظ.", errSubmit: "خطأ أثناء الإرسال.", errSubmitGeneric: "رُفض الإرسال.", errUpload: "فشل إرسال الصورة.", optional: "(اختياري، موصى به)",
  },
};

export function espaceContent(locale: Locale): EspaceContent {
  return locale === "ar" ? AR : FR;
}
