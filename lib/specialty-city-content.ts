import type { Locale } from "./i18n";

/**
 * Enrichissement city-aware par spécialité, pour `/specialites/[slug]/[ville]`.
 *
 * Objectif SEO : sortir les combos spécialité×ville à fort trafic du near-duplicate.
 * Le patron générique de la page (lead + 1 FAQ « comment prendre RDV ») est identique
 * pour toutes les spécialités et toutes les villes — insuffisant pour « cardiologue +
 * grande ville », « pédiatre + grande ville », etc. Ici, chaque spécialité configurée
 * fournit :
 *   • un `lead` contextualisé (tarif local + ancrage géographique réel),
 *   • des FAQ propres à la ville (tarif local, garde/examens, RDV),
 * qui alimentent l'accordéon ET le JSON-LD FAQPage (mêmes données → synchro).
 *
 * Les ancrages géographiques (quartiers, CHU, spécificité) sont des FAITS DE VILLE,
 * donc mutualisés entre spécialités. Les tarifs et le contenu des FAQ sont propres à
 * chaque spécialité. Tout est indicatif (honoraires libres au Maroc). FR + AR.
 *
 * Pour ajouter une spécialité : écrire un builder et l'enregistrer dans `BUILDERS`.
 */

export type CityEnrichment = { lead: string; faqs: { q: string; a: string }[] };

/** Grandes métropoles où les honoraires du privé sont sensiblement plus élevés
 *  (aligné sur les tableaux de tarifs de `specialty-content.ts`). */
const BIG_CITIES = new Set(["casablanca", "rabat", "marrakech"]);

/** Ancrage géographique réel par ville (quartiers, CHU, spécificité), pour
 *  différencier le lead. Absent → clause omise (le tarif/tier suffit). */
const ANCHOR_FR: Record<string, string> = {
  casablanca: "avec des cabinets de proximité dans tous les quartiers, du Maârif à Aïn Chock",
  rabat: "d'Agdal à Hassan et l'Océan, en complément du CHU Ibn Sina",
  marrakech: "de Guéliz jusqu'à la Médina",
  fes: "dans un réseau dense adossé au CHU Hassan II",
  tanger: "avec des praticiens souvent bilingues (français / espagnol)",
  agadir: "premier pôle de soins du Souss-Massa",
  meknes: "parmi les tarifs de consultation les plus abordables du pays",
  oujda: "centre médical de référence de l'Oriental",
  kenitra: "à proximité immédiate de Rabat",
  sale: "en complément de l'offre voisine de Rabat",
  tetouan: "avec des praticiens souvent hispanophones, utile pour les MRE",
};

const ANCHOR_AR: Record<string, string> = {
  casablanca: "مع مكاتب للقرب في جميع الأحياء، من المعاريف إلى عين الشق",
  rabat: "من أكدال إلى حسان والمحيط، إلى جانب المركز الاستشفائي ابن سينا",
  marrakech: "من جيليز إلى المدينة العتيقة",
  fes: "ضمن شبكة كثيفة مسنودة بالمركز الاستشفائي الحسن الثاني",
  tanger: "مع ممارسين غالبًا ثنائيي اللغة (فرنسية / إسبانية)",
  agadir: "أول قطب علاجي بجهة سوس ماسة",
  meknes: "من بين أكثر أسعار الاستشارة تيسّرًا بالبلاد",
  oujda: "المركز الطبي المرجعي لجهة الشرق",
  kenitra: "على مقربة من الرباط",
  sale: "إلى جانب العرض المجاور بالرباط",
  tetouan: "مع ممارسين غالبًا ناطقين بالإسبانية، مفيد للمغاربة المقيمين بالخارج",
};

function anchorClause(citySlug: string, locale: Locale): string {
  const map = locale === "ar" ? ANCHOR_AR : ANCHOR_FR;
  return map[citySlug] ? ` ${map[citySlug]}` : "";
}

/** Fourchette de tarif locale selon le tier de ville (grande métropole vs autre). */
function tierPrice(citySlug: string, big: string, other: string): string {
  return BIG_CITIES.has(citySlug) ? big : other;
}

type Builder = (citySlug: string, cityName: string, total: number, locale: Locale) => CityEnrichment;

/* ── Médecine générale ───────────────────────────────────── */

const medecineGenerale: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "150 و300 درهم", "100 و200 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيبًا عامًّا في ${cityName}${anchor}. ` +
        `وباعتباره الخط الأول للحمى والعدوى ومتابعة الأمراض المزمنة أو تسليم شهادة طبية، يستقبلك الطبيب العام دون إحالة مسبقة. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طب عام في ${cityName}؟`, a: `في ${cityName}، تكلّف استشارة الطبيب العام عمومًا ${range} في القطاع الخاص (أتعاب حرّة). ويُسترجَع للمؤمَّنين لدى CNSS أو AMO نحو 80 % من التعريفة الوطنية المرجعية (TNR)، مع تحمّلهم حصّة تعديلية بنسبة 20 %.` },
        { q: `أين أجد طبيبًا عامًّا مناوبًا في ${cityName}؟`, a: `مساءً أو في عطلة نهاية الأسبوع أو يوم عطلة في ${cityName}، توجّه إلى طبيب مناوب أو مركز حراسة صحية أو أقرب مصلحة مستعجلات. وعلى صحة بالمغرب، صفِّ حسب « متاح اليوم » لتحديد الأطباء المفتوحين. وفي حالة الطوارئ الحيوية، اتصل بالإسعاف (15).` },
        { q: `كيف أحجز موعدًا مع طبيب عام في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح الأطباء العامّين المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا — دون رسوم تسجيل ومع تأكيد الموعد.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "150 à 300 MAD", "100 à 200 MAD");
  const syn = total > 1 ? "médecins généralistes" : "médecin généraliste";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Premier recours pour la fièvre, les infections, le suivi des maladies chroniques ou un certificat médical, le généraliste vous reçoit sans orientation préalable. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation de médecine générale à ${cityName} ?`, a: `À ${cityName}, une consultation chez un médecin généraliste coûte généralement ${range} dans le secteur privé (honoraires libres). Les assurés CNSS ou AMO sont remboursés à hauteur d'environ 80 % du tarif national de référence (TNR), un ticket modérateur de 20 % restant à leur charge.` },
      { q: `Où trouver un médecin généraliste de garde à ${cityName} ?`, a: `Le soir, le week-end ou un jour férié à ${cityName}, orientez-vous vers un médecin de garde, une permanence de soins ou le service des urgences le plus proche. Sur SantéauMaroc, filtrez par « Disponible aujourd'hui » pour repérer les praticiens ouverts. En cas d'urgence vitale, appelez le 15 (SAMU).` },
      { q: `Comment prendre rendez-vous avec un médecin généraliste à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les médecins généralistes référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription et avec confirmation du créneau.` },
    ],
  };
};

/* ── Cardiologie ─────────────────────────────────────────── */

const cardiologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "400 و600 درهم", "300 و500 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب قلب في ${cityName}${anchor}. ` +
        `لألم في الصدر أو خفقان أو ارتفاع ضغط الدم أو تقييم للقلب والشرايين، يُجري طبيب القلب تخطيط القلب (ECG) وتخطيط صدى القلب واختبار الجهد لوضع تشخيص دقيق. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة لدى طبيب قلب في ${cityName}؟`, a: `في ${cityName}، تتراوح استشارة طبيب القلب عمومًا ${range} في القطاع الخاص، وتُفوتَر الفحوص (تخطيط القلب، تخطيط صدى القلب، اختبار الجهد) على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.` },
        { q: `ما الفحوص القلبية التي يمكن إجراؤها في ${cityName}؟`, a: `يقترح أطباء القلب في ${cityName} عادةً تخطيط القلب (ECG) وتخطيط صدى القلب واختبار الجهد وهولتر على مدى 24 ساعة، وغالبًا ما تُجرى بالعيادة. وتتطلب بعض الفحوص (سكانير الشرايين التاجية، تصوير الشرايين) عيادة مجهّزة.` },
        { q: `كيف أحجز موعدًا مع طبيب قلب في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء القلب المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "400 à 600 MAD", "300 à 500 MAD");
  const syn = total > 1 ? "cardiologues" : "cardiologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Pour une douleur thoracique, des palpitations, de l'hypertension ou un bilan cardiovasculaire, le cardiologue réalise ECG, échocardiographie et épreuve d'effort afin de poser un diagnostic précis. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un cardiologue à ${cityName} ?`, a: `À ${cityName}, une consultation de cardiologie coûte généralement ${range} dans le secteur privé ; les examens (ECG, échocardiographie, épreuve d'effort) sont facturés en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.` },
      { q: `Quels examens cardiaques peut-on réaliser à ${cityName} ?`, a: `Les cardiologues à ${cityName} proposent généralement l'ECG, l'échocardiographie, l'épreuve d'effort et le Holter sur 24 h, souvent réalisés au cabinet. Certains examens (scanner coronarien, coronarographie) nécessitent une clinique équipée.` },
      { q: `Comment prendre rendez-vous avec un cardiologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les cardiologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Pédiatrie ───────────────────────────────────────────── */

const pediatrie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "250 و400 درهم", "200 و350 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب أطفال في ${cityName}${anchor}. ` +
        `من متابعة النمو والتلقيحات حسب الجدول الوطني المغربي إلى الحمى وأمراض الطفل، يرافق طبيب الأطفال طفلك من الولادة إلى المراهقة. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة لدى طبيب أطفال في ${cityName}؟`, a: `في ${cityName}، تتراوح استشارة طبيب الأطفال عمومًا ${range} في القطاع الخاص. وتبقى لقاحات البرنامج الوطني مجانية بمراكز الصحة العمومية. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.` },
        { q: `أين أجد طبيب أطفال مناوبًا في ${cityName}؟`, a: `مساءً أو في عطلة نهاية الأسبوع أو يوم عطلة في ${cityName}، توجّه إلى طبيب أطفال مناوب أو مستعجلات الأطفال أو طبيب عام. وعلى صحة بالمغرب، صفِّ حسب « متاح اليوم ». وفي حالة الطوارئ الحيوية (صعوبة في التنفس، خمول غير معتاد لدى الرضيع)، اتصل بالإسعاف (15).` },
        { q: `كيف أحجز موعدًا مع طبيب أطفال في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء الأطفال المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "250 à 400 MAD", "200 à 350 MAD");
  const syn = total > 1 ? "pédiatres" : "pédiatre";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Suivi de la croissance, vaccinations du calendrier marocain, fièvre et maladies de l'enfant : le pédiatre accompagne votre enfant de la naissance à l'adolescence. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un pédiatre à ${cityName} ?`, a: `À ${cityName}, une consultation pédiatrique coûte généralement ${range} dans le secteur privé. Les vaccins du programme national restent gratuits dans les centres de santé publics. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel.` },
      { q: `Où trouver un pédiatre de garde à ${cityName} ?`, a: `Le soir, le week-end ou un jour férié à ${cityName}, orientez-vous vers un pédiatre de garde, un service d'urgences pédiatriques ou un médecin généraliste. Sur SantéauMaroc, filtrez par « Disponible aujourd'hui ». En cas d'urgence vitale (difficulté à respirer, somnolence inhabituelle du nourrisson), appelez le 15 (SAMU).` },
      { q: `Comment prendre rendez-vous avec un pédiatre à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les pédiatres référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Gynécologie ─────────────────────────────────────────── */

const gynecologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "300 و500 درهم", "250 و400 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب نساء في ${cityName}${anchor}. ` +
        `من المتابعة السنوية والمسحة العنقية ووسائل منع الحمل إلى متابعة الحمل والكشف عن سرطانات المرأة، يرافق طبيب النساء صحة المرأة في كل الأعمار. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب نساء في ${cityName}؟`, a: `في ${cityName}، تتراوح استشارة طبيب النساء عمومًا ${range} في القطاع الخاص، وتُفوتَر الفحوص (التصوير بالصدى، متابعة الحمل) على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي، خاصة لمتابعة الحمل.` },
        { q: `أين أتابع حملي في ${cityName}؟`, a: `في ${cityName}، يؤمّن طبيب النساء والتوليد متابعة الحمل عبر استشارات شهرية وفحوص بالصدى (التأريخ، المورفولوجيا، النمو)، ويوجّه نحو عيادة أو مستشفى للولادة. ويُنصح ببدء المتابعة مبكرًا لضمان حسن تطوّر الحمل.` },
        { q: `كيف أحجز موعدًا مع طبيب نساء في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء النساء المُدرَجين في ${cityName}، واطّلع على آراء المريضات واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "300 à 500 MAD", "250 à 400 MAD");
  const syn = total > 1 ? "gynécologues" : "gynécologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Suivi gynécologique annuel, frottis, contraception, suivi de grossesse et dépistage des cancers féminins : le gynécologue accompagne la santé de la femme à tout âge. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un gynécologue à ${cityName} ?`, a: `À ${cityName}, une consultation gynécologique coûte généralement ${range} dans le secteur privé ; l'échographie et le suivi de grossesse sont facturés en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel, notamment pour le suivi de grossesse.` },
      { q: `Où faire suivre sa grossesse à ${cityName} ?`, a: `À ${cityName}, le gynécologue-obstétricien assure le suivi prénatal par des consultations mensuelles et des échographies (datation, morphologie, croissance), et oriente vers une clinique ou une maternité pour l'accouchement. Un suivi débuté tôt est essentiel au bon déroulement de la grossesse.` },
      { q: `Comment prendre rendez-vous avec un gynécologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les gynécologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Ophtalmologie ───────────────────────────────────────── */

const ophtalmologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "300 و500 درهم", "200 و400 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب عيون في ${cityName}${anchor}. ` +
        `من فحص البصر والنظارات والعدسات إلى الكشف عن الزرق (ابتداءً من 40 سنة) وإعتام عدسة العين ومتابعة السكري، يفحص طبيب العيون عينيك ويصف التصحيح المناسب. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب عيون في ${cityName}؟`, a: `في ${cityName}، تتراوح استشارة طبيب العيون عمومًا ${range} في القطاع الخاص، وتُفوتَر الفحوص (فحص قاع العين، OCT، قياس ضغط العين) على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.` },
        { q: `أين أُجري عملية الساد أو تصحيح قصر النظر (LASIK) في ${cityName}؟`, a: `تقترح عدة عيادات مجهّزة في ${cityName} جراحة الساد والجراحة الانكسارية (LASIK، PKR)، بعد تقييم أولي يتحقق من سُمك القرنية وثبات البصر. ولا يكون جميع المرضى مؤهلين لها.` },
        { q: `كيف أحجز موعدًا مع طبيب عيون في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء العيون المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "300 à 500 MAD", "200 à 400 MAD");
  const syn = total > 1 ? "ophtalmologues" : "ophtalmologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Contrôle de la vue, lunettes et lentilles, dépistage du glaucome (dès 40 ans), cataracte et suivi du diabète : l'ophtalmologue examine vos yeux et prescrit la correction adaptée. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un ophtalmologue à ${cityName} ?`, a: `À ${cityName}, une consultation ophtalmologique coûte généralement ${range} dans le secteur privé ; le fond d'œil, l'OCT ou la tonométrie sont facturés en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des actes médicaux.` },
      { q: `Où faire une opération de la cataracte ou de la myopie (LASIK) à ${cityName} ?`, a: `Plusieurs cliniques équipées à ${cityName} proposent la chirurgie de la cataracte et la chirurgie réfractive (LASIK, PKR), après un bilan préalable vérifiant l'épaisseur de la cornée et la stabilité de la vue. Tous les patients ne sont pas éligibles.` },
      { q: `Comment prendre rendez-vous avec un ophtalmologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les ophtalmologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Chirurgie dentaire ──────────────────────────────────── */

const chirurgieDentaire: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "150 و300 درهم", "100 و200 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب أسنان في ${cityName}${anchor}. ` +
        `من إزالة الجير وعلاج التسوّس إلى التيجان والأطقم والزرعات، يتكفّل طبيب الأسنان بصحة الفم والأسنان، مع فحص يُنصح به مرة إلى مرتين في السنة. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم يتقاضى طبيب الأسنان في ${cityName}؟`, a: `في ${cityName}، تتراوح الاستشارة البسيطة عمومًا ${range}، وإزالة الجير بين 200 و500 درهم، وعلاج التسوّس بين 150 و400 درهم في القطاع الخاص. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي للعلاجات الأساسية.` },
        { q: `كم يكلّف تاج أو زرعة سنية في ${cityName}؟`, a: `في ${cityName}، يتراوح التاج الخزفي عمومًا بين 1500 و3500 درهم، والزرعة السنية بين 5000 و12000 درهم. اطلب دائمًا تقديرًا مفصّلًا (devis) قبل أي علاج تعويضي؛ ولا تُسترجَع الأعمال التجميلية (التبييض، القشور) عمومًا.` },
        { q: `كيف أحجز موعدًا مع طبيب أسنان في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء الأسنان المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "150 à 300 MAD", "100 à 200 MAD");
  const syn = total > 1 ? "dentistes" : "dentiste";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Détartrage, soin des caries, couronnes, prothèses et implants : le chirurgien-dentiste prend en charge toute la santé bucco-dentaire, avec un contrôle conseillé une à deux fois par an. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte un dentiste à ${cityName} ?`, a: `À ${cityName}, une consultation simple coûte généralement ${range}, un détartrage entre 200 et 500 MAD et le soin d'une carie entre 150 et 400 MAD dans le secteur privé. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des soins de base.` },
      { q: `Quel est le prix d'une couronne ou d'un implant dentaire à ${cityName} ?`, a: `À ${cityName}, une couronne céramique coûte généralement entre 1 500 et 3 500 MAD et un implant dentaire entre 5 000 et 12 000 MAD. Demandez toujours un devis détaillé avant un traitement prothétique ; les actes esthétiques (blanchiment, facettes) ne sont généralement pas remboursés.` },
      { q: `Comment prendre rendez-vous avec un dentiste à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les dentistes référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Dermatologie ────────────────────────────────────────── */

const dermatologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "300 و500 درهم", "250 و400 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب أمراض جلدية في ${cityName}${anchor}. ` +
        `من حب الشباب والإكزيما والصدفية وتساقط الشعر ومراقبة الشامات إلى العلاجات التجميلية (التقشير، حمض الهيالورونيك)، يعالج طبيب الجلد البشرة والشعر والأظافر. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب أمراض جلدية في ${cityName}؟`, a: `في ${cityName}، تتراوح استشارة طبيب الجلد عمومًا ${range} في القطاع الخاص، وتُفوتَر الأعمال (الخزعة، العلاج بالتبريد، الليزر، التجميل) على حدة. ويُسترجَع للمؤمَّنين لدى CNSS أو AMO جزئيًّا في الأعمال الطبية؛ ولا تُسترجَع الأعمال التجميلية.` },
        { q: `أين أفحص شامة مشبوهة في ${cityName}؟`, a: `في ${cityName}، يفحص طبيب الجلد الشامات بالمنظار الجلدي (dermoscopie)، ويزيلها أو يأخذ خزعة عند الاشتباه. ويُعدّ الكشف المبكر عن الميلانوم مهمًّا بالمغرب بسبب التعرّض القوي للشمس.` },
        { q: `كيف أحجز موعدًا مع طبيب أمراض جلدية في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء الجلد المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "300 à 500 MAD", "250 à 400 MAD");
  const syn = total > 1 ? "dermatologues" : "dermatologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Acné, eczéma, psoriasis, chute de cheveux, surveillance des grains de beauté et soins esthétiques (peeling, acide hyaluronique) : le dermatologue traite la peau, les cheveux et les ongles. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un dermatologue à ${cityName} ?`, a: `À ${cityName}, une consultation dermatologique coûte généralement ${range} dans le secteur privé ; les actes (biopsie, cryothérapie, laser, esthétique) sont facturés en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des actes médicaux ; l'esthétique n'est pas remboursée.` },
      { q: `Où faire vérifier un grain de beauté suspect à ${cityName} ?`, a: `À ${cityName}, le dermatologue examine les grains de beauté au dermoscope et procède à leur retrait ou à une biopsie en cas de doute. Le dépistage précoce du mélanome est important au Maroc en raison de la forte exposition solaire.` },
      { q: `Comment prendre rendez-vous avec un dermatologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les dermatologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Traumatologie-orthopédie ────────────────────────────── */

const orthopedie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "400 و600 درهم", "300 و500 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب عظام في ${cityName}${anchor}. ` +
        `من آلام المفاصل والكسور والالتواءات إلى الفصال العظمي والانزلاق الغضروفي وبدائل الورك والركبة، يتكفّل طبيب العظام بالعظام والمفاصل والأربطة. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب عظام في ${cityName}؟`, a: `في ${cityName}، تتراوح استشارة طبيب العظام عمومًا ${range} في القطاع الخاص، وتُفوتَر الصور الإشعاعية والجراحة على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي للأعمال حسب الملف.` },
        { q: `أين أذهب في حالة كسر أو رضّ في ${cityName}؟`, a: `أمام كسر مُحتمَل أو تشوّه مفصلي أو ألم حاد بعد صدمة في ${cityName}، توجّه إلى أقرب مستعجلات استشفائية. ثم يتكفّل طبيب العظام بالتجبير أو الجراحة والمتابعة حتى الشفاء. وفي حالة الطوارئ الحيوية، اتصل بالإسعاف (15).` },
        { q: `كيف أحجز موعدًا مع طبيب عظام في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء العظام المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "400 à 600 MAD", "300 à 500 MAD");
  const syn = total > 1 ? "orthopédistes" : "orthopédiste";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Douleurs articulaires, fractures, entorses, arthrose, hernie discale, prothèses de hanche et de genou : l'orthopédiste prend en charge les os, les articulations et les ligaments. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un orthopédiste à ${cityName} ?`, a: `À ${cityName}, une consultation orthopédique coûte généralement ${range} dans le secteur privé ; la radiographie et la chirurgie sont facturées séparément. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des actes sur dossier.` },
      { q: `Où aller en cas de fracture ou de traumatisme à ${cityName} ?`, a: `Devant une fracture suspectée, une déformation ou une douleur intense après un choc à ${cityName}, rendez-vous aux urgences hospitalières les plus proches. L'orthopédiste prend ensuite le relais (plâtre, chirurgie, rééducation) jusqu'à la récupération. En cas d'urgence vitale, appelez le 15 (SAMU).` },
      { q: `Comment prendre rendez-vous avec un orthopédiste à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les orthopédistes référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Psychiatrie ─────────────────────────────────────────── */

const psychiatrie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "400 و600 درهم", "300 و500 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب نفسي في ${cityName}${anchor}. ` +
        `من الاكتئاب والقلق واضطرابات النوم إلى الإدمان أو الاضطراب ثنائي القطب، يشخّص الطبيب النفسي — وهو طبيب — ويمكنه وصف علاج، ويقترح متابعة سرّية. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز بسرّية عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف جلسة لدى طبيب نفسي في ${cityName}؟`, a: `في ${cityName}، تتراوح الجلسة لدى الطبيب النفسي عمومًا ${range} في القطاع الخاص، وتكون الاستشارة الأولى أطول (غالبًا 350–700 درهم). ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي بوصفة.` },
        { q: `طبيب نفسي أم أخصائي نفساني في ${cityName}: من أستشير؟`, a: `الطبيب النفسي طبيب يمكنه وصف الأدوية إلى جانب العلاج النفسي. أما الأخصائي النفساني (غير طبيب) فيركّز على العلاجات دون وصف. وهما متكاملان؛ وعند الشك يوجّه الطبيب العام نحو الأنسب. والاستشارة سرّية بالكامل.` },
        { q: `كيف أحجز موعدًا مع طبيب نفسي في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح الأطباء النفسيين المُدرَجين في ${cityName}، واطّلع على الملفات والمواعيد المتاحة، ثم احجز بسرّية عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "400 à 600 MAD", "300 à 500 MAD");
  const syn = total > 1 ? "psychiatres" : "psychiatre";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Dépression, troubles anxieux, troubles du sommeil, addictions ou trouble bipolaire : le psychiatre, médecin, diagnostique, peut prescrire un traitement et propose un suivi confidentiel. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne, en toute discrétion et gratuitement.`,
    faqs: [
      { q: `Combien coûte une séance chez un psychiatre à ${cityName} ?`, a: `À ${cityName}, une séance chez un psychiatre coûte généralement ${range} dans le secteur privé ; la première consultation, plus longue, est souvent facturée 350 à 700 MAD. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur prescription.` },
      { q: `Faut-il consulter un psychiatre ou un psychologue à ${cityName} ?`, a: `Le psychiatre est un médecin : il peut prescrire un traitement en plus des thérapies. Le psychologue (non-médecin) se concentre sur l'accompagnement sans prescription. Les deux sont complémentaires ; en cas de doute, le médecin généraliste oriente. La consultation reste strictement confidentielle.` },
      { q: `Comment prendre rendez-vous avec un psychiatre à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les psychiatres référencés à ${cityName}, consultez leurs profils et leurs disponibilités, puis réservez en ligne, en toute discrétion et gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Oto-rhino-laryngologie (ORL) ────────────────────────── */

const orl: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "300 و500 درهم", "250 و400 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب أنف وأذن وحنجرة في ${cityName}${anchor}. ` +
        `من التهابات الأذن وضعف السمع والطنين والدوار إلى التهاب الجيوب والحساسية والتهاب اللوزتين المتكرر أو انقطاع النفس النومي، يستكشف طبيب الأنف والأذن والحنجرة الأذن والأنف والحلق لدى الكبار والأطفال. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب أنف وأذن وحنجرة في ${cityName}؟`, a: `في ${cityName}، تتراوح الاستشارة عمومًا ${range} في القطاع الخاص، ويُفوتَر تخطيط السمع (audiogramme) والأعمال الجراحية على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.` },
        { q: `أين أُجري تخطيطًا للسمع (audiogramme) في ${cityName}؟`, a: `في ${cityName}، يُجري طبيب الأنف والأذن والحنجرة تخطيط السمع بالعيادة عند ضعف السمع أو الطنين، ويتكفّل لدى الطفل بالتهابات الأذن واللوزتين واللحمية. ويحسّن الكشف المبكر التكفّل.` },
        { q: `كيف أحجز موعدًا مع طبيب أنف وأذن وحنجرة في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء الأنف والأذن والحنجرة المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "300 à 500 MAD", "250 à 400 MAD");
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ORL${anchor}. ` +
      `Otites, baisse d'audition, acouphènes, vertiges, sinusites, allergies, angines à répétition ou apnée du sommeil : l'oto-rhino-laryngologiste explore l'oreille, le nez et la gorge chez l'adulte et l'enfant. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un ORL à ${cityName} ?`, a: `À ${cityName}, une consultation ORL coûte généralement ${range} dans le secteur privé ; l'audiogramme et les actes chirurgicaux sont facturés en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel.` },
      { q: `Où faire un bilan auditif (audiogramme) à ${cityName} ?`, a: `À ${cityName}, l'ORL réalise l'audiogramme au cabinet en cas de baisse d'audition ou d'acouphènes, et prend en charge chez l'enfant les otites à répétition, les amygdales et les végétations. Un dépistage précoce améliore la prise en charge.` },
      { q: `Comment prendre rendez-vous avec un ORL à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les ORL référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Urologie ────────────────────────────────────────────── */

const urologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "400 و600 درهم", "300 و500 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب مسالك بولية في ${cityName}${anchor}. ` +
        `من التهابات المسالك البولية المتكررة والحصى الكلوية واضطرابات التبوّل إلى صحة البروستاتا ومشاكل الخصوبة أو الانتصاب لدى الرجل، يتكفّل طبيب المسالك البولية بالجهازين البولي والتناسلي الذكري. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب مسالك بولية في ${cityName}؟`, a: `في ${cityName}، تتراوح الاستشارة عمومًا ${range} في القطاع الخاص، وتُفوتَر الفحوص (التصوير بالصدى، تحليل PSA) والأعمال الجراحية على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.` },
        { q: `أين أُجري كشفًا للبروستاتا (PSA) في ${cityName}؟`, a: `في ${cityName}، يُنصح الرجال ابتداءً من 50 سنة (أو 45 عند وجود سوابق عائلية) بكشف للبروستاتا يجمع بين فحص سريري وتحليل دم PSA. ويتكفّل طبيب المسالك البولية بالمتابعة حسب السن والسوابق.` },
        { q: `كيف أحجز موعدًا مع طبيب مسالك بولية في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء المسالك البولية المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "400 à 600 MAD", "300 à 500 MAD");
  const syn = total > 1 ? "urologues" : "urologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Infections urinaires à répétition, calculs rénaux, troubles de la miction, santé de la prostate, fertilité ou troubles de l'érection : l'urologue prend en charge l'appareil urinaire et l'appareil génital masculin. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un urologue à ${cityName} ?`, a: `À ${cityName}, une consultation d'urologie coûte généralement ${range} dans le secteur privé ; les examens (échographie, dosage du PSA) et les actes chirurgicaux sont facturés en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel.` },
      { q: `Où faire un dépistage de la prostate (PSA) à ${cityName} ?`, a: `À ${cityName}, un dépistage de la prostate est proposé à l'homme dès 50 ans (ou 45 ans en cas d'antécédents familiaux), associant un examen clinique et un dosage sanguin du PSA. L'urologue adapte la surveillance à votre âge et à vos antécédents.` },
      { q: `Comment prendre rendez-vous avec un urologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les urologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Gastro-entérologie ──────────────────────────────────── */

const gastroEnterologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "400 و600 درهم", "300 و500 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب جهاز هضمي في ${cityName}${anchor}. ` +
        `من الارتجاع وحرقة المعدة والقرحة وآلام البطن واضطرابات العبور إلى الكشف عن سرطان القولون ومتابعة التهاب الكبد، يتكفّل طبيب الجهاز الهضمي بالجهاز الهضمي والكبد. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب جهاز هضمي في ${cityName}؟`, a: `في ${cityName}، تتراوح الاستشارة عمومًا ${range} في القطاع الخاص، ويُفوتَر التنظير (تنظير المعدة، تنظير القولون) على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي حسب الملف.` },
        { q: `أين أُجري تنظير القولون أو المعدة في ${cityName}؟`, a: `في ${cityName}، يُجرى تنظير المعدة وتنظير القولون في عيادة أو مركز مجهّز، غالبًا تحت تخدير خفيف، ويتيح التشخيص وأحيانًا العلاج (إزالة السلائل). ويُنصح بالكشف عن سرطان القولون ابتداءً من 50 سنة.` },
        { q: `كيف أحجز موعدًا مع طبيب جهاز هضمي في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء الجهاز الهضمي المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "400 à 600 MAD", "300 à 500 MAD");
  const syn = total > 1 ? "gastro-entérologues" : "gastro-entérologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Reflux, brûlures d'estomac, ulcère, douleurs abdominales, troubles du transit, dépistage du cancer du côlon ou suivi d'une hépatite : le gastro-entérologue prend en charge l'appareil digestif et le foie. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un gastro-entérologue à ${cityName} ?`, a: `À ${cityName}, une consultation coûte généralement ${range} dans le secteur privé ; la fibroscopie (gastroscopie) et la coloscopie sont facturées en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur dossier.` },
      { q: `Où faire une coloscopie ou une gastroscopie à ${cityName} ?`, a: `À ${cityName}, la gastroscopie et la coloscopie se réalisent en clinique ou en centre équipé, souvent sous sédation, et permettent le diagnostic et parfois le traitement (retrait de polypes). Le dépistage du cancer du côlon est recommandé dès 50 ans.` },
      { q: `Comment prendre rendez-vous avec un gastro-entérologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les gastro-entérologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Pneumo-phtisiologie ─────────────────────────────────── */

const pneumologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "400 و600 درهم", "300 و500 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب أمراض الصدر في ${cityName}${anchor}. ` +
        `من الربو والانسداد الرئوي المزمن (BPCO) والعدوى التنفسية والحساسية إلى انقطاع النفس النومي والسل والإقلاع عن التدخين، يتكفّل طبيب أمراض الصدر بالرئتين والقصبات. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب أمراض الصدر في ${cityName}؟`, a: `في ${cityName}، تتراوح الاستشارة عمومًا ${range} في القطاع الخاص، وتُفوتَر الاستكشافات (قياس التنفّس، السكانير الصدري) على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.` },
        { q: `أين أُجري استكشافًا تنفسيًّا (قياس التنفّس) في ${cityName}؟`, a: `في ${cityName}، يُجري طبيب أمراض الصدر قياس التنفّس (spirométrie) لتشخيص الربو والانسداد الرئوي المزمن ومتابعتهما. ويبقى كشف السل وعلاجه مجانيَّين في إطار البرنامج الوطني.` },
        { q: `كيف أحجز موعدًا مع طبيب أمراض الصدر في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء أمراض الصدر المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "400 à 600 MAD", "300 à 500 MAD");
  const syn = total > 1 ? "pneumologues" : "pneumologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Asthme, BPCO, toux persistante, allergies respiratoires, apnée du sommeil, tuberculose ou aide au sevrage tabagique : le pneumologue prend en charge les poumons et les bronches. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un pneumologue à ${cityName} ?`, a: `À ${cityName}, une consultation coûte généralement ${range} dans le secteur privé ; les explorations (spirométrie, scanner thoracique) sont facturées en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel.` },
      { q: `Où faire une exploration respiratoire (spirométrie) à ${cityName} ?`, a: `À ${cityName}, le pneumologue réalise l'exploration fonctionnelle respiratoire (spirométrie) pour diagnostiquer et suivre l'asthme et la BPCO. Le dépistage et le traitement de la tuberculose restent gratuits dans le cadre du programme national.` },
      { q: `Comment prendre rendez-vous avec un pneumologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les pneumologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Neurologie ──────────────────────────────────────────── */

const neurologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "400 و600 درهم", "300 و500 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب أعصاب في ${cityName}${anchor}. ` +
        `من الشقيقة والصرع والسكتة الدماغية إلى داء باركنسون والزهايمر والتصلّب المتعدّد واضطرابات الذاكرة والتوازن، يتكفّل طبيب الأعصاب بالجهاز العصبي. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب أعصاب في ${cityName}؟`, a: `في ${cityName}، تتراوح الاستشارة عمومًا ${range} في القطاع الخاص، وتُفوتَر الفحوص التكميلية (تخطيط الدماغ EEG، تخطيط العضلات EMG، الرنين المغناطيسي) على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.` },
        { q: `ماذا أفعل في حالة سكتة دماغية في ${cityName}؟`, a: `أمام شلل مفاجئ أو انحراف الفم أو اضطراب في النطق (اختبار FAST) في ${cityName}، اتصل فورًا بالإسعاف (15): كل دقيقة تهمّ للحدّ من العواقب. ثم يؤمّن طبيب الأعصاب الحصيلة والمتابعة (الشقيقة، الصرع، الذاكرة).` },
        { q: `كيف أحجز موعدًا مع طبيب أعصاب في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء الأعصاب المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "400 à 600 MAD", "300 à 500 MAD");
  const syn = total > 1 ? "neurologues" : "neurologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Migraines, épilepsie, accident vasculaire cérébral (AVC), maladie de Parkinson ou d'Alzheimer, sclérose en plaques, troubles de la mémoire ou de l'équilibre : le neurologue prend en charge le système nerveux. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un neurologue à ${cityName} ?`, a: `À ${cityName}, une consultation neurologique coûte généralement ${range} dans le secteur privé ; les examens complémentaires (EEG, EMG, IRM cérébrale) sont facturés en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel.` },
      { q: `Que faire en cas d'AVC à ${cityName} ?`, a: `Devant une paralysie soudaine, une bouche déviée ou des troubles de la parole (test FAST) à ${cityName}, appelez immédiatement le 15 (SAMU) : chaque minute compte pour limiter les séquelles. Le neurologue assure ensuite le bilan et le suivi (migraines, épilepsie, mémoire).` },
      { q: `Comment prendre rendez-vous avec un neurologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les neurologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Endocrinologie et maladies métaboliques ─────────────── */

const endocrinologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "300 و500 درهم", "250 و400 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب غدد صمّاء في ${cityName}${anchor}. ` +
        `من داء السكري واضطرابات الغدة الدرقية إلى السمنة واضطرابات الكوليسترول والهرمونات، يشخّص طبيب الغدد الصمّاء ويتابع الأمراض الاستقلابية والهرمونية. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب غدد صمّاء في ${cityName}؟`, a: `في ${cityName}، تتراوح الاستشارة عمومًا ${range} في القطاع الخاص، وتُفوتَر التحاليل البيولوجية (السكر، HbA1c، الهرمونات) والتصوير بالصدى على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.` },
        { q: `أين أتابع السكري أو الغدة الدرقية في ${cityName}؟`, a: `في ${cityName}، يؤمّن طبيب الغدد الصمّاء متابعة داء السكري (توازن، HbA1c، الوقاية من المضاعفات) واضطرابات الغدة الدرقية (قصور/فرط النشاط، عقيدات) عبر تحاليل منتظمة وتعديل العلاج.` },
        { q: `كيف أحجز موعدًا مع طبيب غدد صمّاء في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء الغدد الصمّاء المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "300 à 500 MAD", "250 à 400 MAD");
  const syn = total > 1 ? "endocrinologues" : "endocrinologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Diabète, troubles de la thyroïde, obésité, cholestérol ou troubles hormonaux : l'endocrinologue diagnostique et suit les maladies métaboliques et hormonales, en lien étroit avec la prévention des complications. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un endocrinologue à ${cityName} ?`, a: `À ${cityName}, une consultation d'endocrinologie coûte généralement ${range} dans le secteur privé ; les analyses biologiques (glycémie, HbA1c, bilan hormonal) et l'échographie sont facturées en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel.` },
      { q: `Où faire suivre son diabète ou sa thyroïde à ${cityName} ?`, a: `À ${cityName}, l'endocrinologue assure le suivi du diabète (équilibre, HbA1c, prévention des complications) et des troubles de la thyroïde (hypo/hyperthyroïdie, nodules) par des bilans réguliers et l'ajustement du traitement.` },
      { q: `Comment prendre rendez-vous avec un endocrinologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les endocrinologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Rhumatologie ────────────────────────────────────────── */

const rhumatologie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "300 و500 درهم", "250 و400 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب روماتيزم في ${cityName}${anchor}. ` +
        `من الأرثروز وآلام الظهر والروماتيزمات الالتهابية إلى النقرس وهشاشة العظام والآلام المفصلية المزمنة، يتكفّل طبيب الروماتيزم طبيًّا بالمفاصل والعظام. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة طبيب روماتيزم في ${cityName}؟`, a: `في ${cityName}، تتراوح الاستشارة عمومًا ${range} في القطاع الخاص، وتُفوتَر الفحوص (الأشعة، قياس كثافة العظام، تحاليل الدم) على حدة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.` },
        { q: `أين أُجري قياس كثافة العظام (هشاشة العظام) في ${cityName}؟`, a: `في ${cityName}، يصف طبيب الروماتيزم قياس كثافة العظام للكشف عن هشاشة العظام، خاصة لدى المرأة بعد سنّ اليأس أو عند وجود عوامل خطر. ويوجّه بعده الوقاية (الكالسيوم، فيتامين D) وعند الحاجة علاجًا.` },
        { q: `كيف أحجز موعدًا مع طبيب روماتيزم في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء الروماتيزم المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "300 à 500 MAD", "250 à 400 MAD");
  const syn = total > 1 ? "rhumatologues" : "rhumatologue";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Arthrose, mal de dos, rhumatismes inflammatoires, goutte, ostéoporose ou douleurs articulaires chroniques : le rhumatologue prend en charge médicalement les articulations et les os. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un rhumatologue à ${cityName} ?`, a: `À ${cityName}, une consultation de rhumatologie coûte généralement ${range} dans le secteur privé ; les examens (radiographie, densitométrie osseuse, bilan sanguin) sont facturés en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel.` },
      { q: `Où faire une densitométrie osseuse (ostéoporose) à ${cityName} ?`, a: `À ${cityName}, le rhumatologue prescrit la densitométrie osseuse pour dépister l'ostéoporose, surtout chez la femme après la ménopause ou en cas de facteurs de risque. Elle oriente ensuite la prévention (calcium, vitamine D) et, si besoin, un traitement.` },
      { q: `Comment prendre rendez-vous avec un rhumatologue à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les rhumatologues référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Orthodontie ─────────────────────────────────────────── */

const orthodontie: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "300 و500 درهم", "200 و400 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} طبيب تقويم أسنان في ${cityName}${anchor}. ` +
        `من الأسنان المتراكبة أو المتباعدة إلى اختلال إطباق الفكين لدى الطفل والبالغ، يصحّح طبيب تقويم الأسنان وضعية الأسنان والفكين بواسطة تقويم معدني أو خزفي أو أجهزة شفّافة متحرّكة. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة تقويم الأسنان في ${cityName}؟`, a: `في ${cityName}، تتراوح استشارة أو حصيلة التقويم عمومًا ${range} في القطاع الخاص. أما العلاج الكامل فيختلف: نحو 8000 إلى 20000 درهم للتقويم المعدني و15000 إلى 40000 درهم للأجهزة الشفّافة. ويُسلَّم تقدير مفصّل قبل البدء.` },
        { q: `في أي سنّ يُجرى أول فحص تقويم للطفل في ${cityName}؟`, a: `يُنصح بأول فحص تقويم نحو 7-8 سنوات لرصد اختلالات النمو والتدخّل في الوقت الأنسب. ويبقى التقويم ممكنًا كذلك لدى البالغين بفضل حلول أكثر تحفّظًا.` },
        { q: `كيف أحجز موعدًا مع طبيب تقويم أسنان في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أطباء تقويم الأسنان المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "300 à 500 MAD", "200 à 400 MAD");
  const syn = total > 1 ? "orthodontistes" : "orthodontiste";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Dents mal alignées, chevauchées ou espacées, décalage des mâchoires chez l'enfant comme chez l'adulte : l'orthodontiste corrige la position des dents et des mâchoires par des bagues métalliques ou céramiques et des gouttières transparentes. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte un traitement orthodontique à ${cityName} ?`, a: `À ${cityName}, un bilan orthodontique coûte généralement ${range}, tandis qu'un traitement complet varie selon la technique : environ 8 000 à 20 000 MAD pour des bagues et 15 000 à 40 000 MAD pour des gouttières transparentes. Un devis détaillé est remis avant de commencer.` },
      { q: `À quel âge faire un premier bilan orthodontique à ${cityName} ?`, a: `Un premier bilan est recommandé vers 7-8 ans pour repérer les anomalies de croissance et intervenir au meilleur moment. L'orthodontie reste toutefois possible à l'âge adulte, grâce à des solutions plus discrètes.` },
      { q: `Comment prendre rendez-vous avec un orthodontiste à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les orthodontistes référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Chirurgie générale ──────────────────────────────────── */

const chirurgieGenerale: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "400 و600 درهم", "300 و500 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} جرّاح عام في ${cityName}${anchor}. ` +
        `من الفتق والتهاب الزائدة الدودية وحصى المرارة إلى أمراض الجهاز الهضمي والطوارئ البطنية، يتكفّل الجرّاح العام جراحيًّا بأمراض البطن والأنسجة الرخوة، مع تفضيل التقنيات قليلة التوغّل (تنظير البطن). ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف استشارة جرّاح عام في ${cityName}؟`, a: `في ${cityName}، تتراوح الاستشارة عمومًا ${range} في القطاع الخاص، وتخضع العملية والاستشفاء لتكفّل منفصل. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي حسب الملف.` },
        { q: `متى تستشير جرّاحًا عامًّا في ${cityName}؟`, a: `في ${cityName}، تأتي استشارة الجراحة العامة غالبًا بعد توجيه (الطبيب المعالج، طبيب الجهاز الهضمي، المستعجلات) بشأن فتق أو حصى المرارة أو التهاب الزائدة أو مرض بطني آخر. ويقيّم الجرّاح دواعي العملية ويفضّل تنظير البطن عند الإمكان.` },
        { q: `كيف أحجز موعدًا مع جرّاح عام في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح الجرّاحين العامّين المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "400 à 600 MAD", "300 à 500 MAD");
  const syn = total > 1 ? "chirurgiens généralistes" : "chirurgien généraliste";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Hernie, appendicite, calculs de la vésicule, pathologies digestives ou urgences abdominales : le chirurgien généraliste prend en charge chirurgicalement l'abdomen et les tissus mous, en privilégiant les techniques mini-invasives (cœlioscopie). ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une consultation chez un chirurgien généraliste à ${cityName} ?`, a: `À ${cityName}, une consultation coûte généralement ${range} dans le secteur privé ; l'intervention et l'hospitalisation font l'objet d'une prise en charge distincte. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur dossier.` },
      { q: `Quand consulter un chirurgien généraliste à ${cityName} ?`, a: `À ${cityName}, la consultation de chirurgie générale fait souvent suite à une orientation (médecin traitant, gastro-entérologue, urgences) pour une hernie, des calculs de la vésicule, une appendicite ou une autre pathologie abdominale. Le chirurgien évalue l'indication opératoire et privilégie, quand c'est possible, la cœlioscopie.` },
      { q: `Comment prendre rendez-vous avec un chirurgien à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les chirurgiens généralistes référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Acupuncture ─────────────────────────────────────────── */

const acupuncture: Builder = (citySlug, cityName, total, locale) => {
  const anchor = anchorClause(citySlug, locale);
  if (locale === "ar") {
    const range = tierPrice(citySlug, "300 و500 درهم", "200 و400 درهم");
    return {
      lead:
        `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} أخصائي وخز بالإبر في ${cityName}${anchor}. ` +
        `من الآلام المزمنة (أسفل الظهر، الرقبة، الأرثروز) إلى الشقيقة والغثيان والاضطرابات المرتبطة بالتوتّر، يُكمّل الوخز بالإبر التكفّل الطبي دون أن يعوّضه. ` +
        `قارن الملفات الموثّقة والأسعار (${range} عمومًا للجلسة) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
      faqs: [
        { q: `كم تكلّف جلسة وخز بالإبر في ${cityName}؟`, a: `في ${cityName}، تتراوح الجلسة عمومًا ${range} حسب الممارس، وغالبًا ما تكون الجلسة الأولى أطول. وعادةً ما تلزم عدة جلسات، ونادرًا ما يُسترجَع الوخز بالإبر من CNSS/AMO حسب العقد.` },
        { q: `لأي اضطرابات أستشير أخصائي الوخز بالإبر في ${cityName}؟`, a: `في ${cityName}، يُلجأ إلى الوخز بالإبر خاصة للآلام المزمنة (أسفل الظهر، الرقبة، الأرثروز) والشقيقة والغثيان والاضطرابات المرتبطة بالتوتّر. وهو يُكمّل متابعة طبية ولا يعوّض تشخيصًا أو علاجًا موصوفًا.` },
        { q: `كيف أحجز موعدًا لجلسة وخز بالإبر في ${cityName}؟`, a: `على صحة بالمغرب، تصفّح أخصائيي الوخز بالإبر المُدرَجين في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
      ],
    };
  }
  const range = tierPrice(citySlug, "300 à 500 MAD", "200 à 400 MAD");
  const syn = total > 1 ? "acupuncteurs" : "acupuncteur";
  return {
    lead:
      `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
      `Douleurs chroniques (lombalgie, cervicalgie, arthrose), migraines, nausées ou troubles liés au stress : l'acupuncture complète, sans le remplacer, un suivi médical conventionnel. ` +
      `Comparez les profils vérifiés, les tarifs (généralement ${range} la séance), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
    faqs: [
      { q: `Combien coûte une séance d'acupuncture à ${cityName} ?`, a: `À ${cityName}, une séance coûte généralement ${range} selon le praticien, la première étant souvent plus longue. Plusieurs séances sont habituellement nécessaires ; l'acupuncture est rarement remboursée par la CNSS/AMO selon les contrats.` },
      { q: `Pour quels troubles consulter un acupuncteur à ${cityName} ?`, a: `À ${cityName}, l'acupuncture est surtout sollicitée pour les douleurs chroniques (lombalgie, cervicalgie, arthrose), les migraines, les nausées et les troubles liés au stress. Elle complète un suivi médical et ne remplace ni un diagnostic ni un traitement prescrit.` },
      { q: `Comment prendre rendez-vous pour une séance d'acupuncture à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les acupuncteurs référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
    ],
  };
};

/* ── Fabrique générique (spécialités du lot « restantes » créées en workflow) ──
 * Chaque config fournit synonymes FR/AR, tarifs par tier, une phrase de lead et une
 * FAQ « métier » spécifiques. La fabrique en dérive lead + [tarif, métier, RDV], FR+AR.
 * Le token « {V} » est remplacé par le nom de ville. Les tarifs AR sont dérivés du FR. */
type ExtraCfg = {
  slug: string;
  synFr: string; synPlFr: string; synAr: string;
  art: "un" | "une"; acteFr: string; acteAr: string;
  bigFr: string; otherFr: string;
  tarifExtraFr?: string; tarifExtraAr?: string;
  remboursementFr?: string; remboursementAr?: string;
  leadMidFr: string; leadMidAr: string;
  metierQFr: string; metierAFr: string; metierQAr: string; metierAAr: string;
};

const frPriceToAr = (p: string) => p.replace(" à ", " و").replace(" MAD", " درهم");

function makeBuilder(cfg: ExtraCfg): Builder {
  return (citySlug, cityName, total, locale) => {
    const anchor = anchorClause(citySlug, locale);
    if (locale === "ar") {
      const range = tierPrice(citySlug, frPriceToAr(cfg.bigFr), frPriceToAr(cfg.otherFr));
      const remb = cfg.remboursementAr ?? "ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي.";
      return {
        lead:
          `يُدرج موقع صحة بالمغرب ${total.toLocaleString("ar-MA")} ${cfg.synAr} في ${cityName}${anchor}. ` +
          `${cfg.leadMidAr} ` +
          `قارن الملفات الموثّقة والأسعار (${range} عمومًا) واللغات المتحدَّث بها وآراء المرضى، ثم احجز موعدك عبر الإنترنت مجانًا.`,
        faqs: [
          { q: `كم تكلّف ${cfg.acteAr} لدى ${cfg.synAr} في ${cityName}؟`, a: `في ${cityName}، تتراوح ${cfg.acteAr} عمومًا ${range} في القطاع الخاص${cfg.tarifExtraAr ?? ""}. ${remb}` },
          { q: cfg.metierQAr.replace(/\{V\}/g, cityName), a: cfg.metierAAr.replace(/\{V\}/g, cityName) },
          { q: `كيف أحجز موعدًا مع ${cfg.synAr} في ${cityName}؟`, a: `على صحة بالمغرب، ابحث عن ${cfg.synAr} في ${cityName}، واطّلع على آراء المرضى واللغات والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا ودون رسوم تسجيل.` },
        ],
      };
    }
    const range = tierPrice(citySlug, cfg.bigFr, cfg.otherFr);
    const remb = cfg.remboursementFr ?? "Les assurés CNSS ou AMO bénéficient d'un remboursement partiel.";
    const syn = total > 1 ? cfg.synPlFr : cfg.synFr;
    return {
      lead:
        `À ${cityName}, SantéauMaroc référence ${total.toLocaleString("fr")} ${syn}${anchor}. ` +
        `${cfg.leadMidFr} ` +
        `Comparez les profils vérifiés, les tarifs (généralement ${range}), les langues parlées et les avis patients, puis prenez rendez-vous en ligne gratuitement.`,
      faqs: [
        { q: `Combien coûte une ${cfg.acteFr} chez ${cfg.art} ${cfg.synFr} à ${cityName} ?`, a: `À ${cityName}, une ${cfg.acteFr} coûte généralement ${range} dans le secteur privé${cfg.tarifExtraFr ?? ""}. ${remb}` },
        { q: cfg.metierQFr.replace(/\{V\}/g, cityName), a: cfg.metierAFr.replace(/\{V\}/g, cityName) },
        { q: `Comment prendre rendez-vous avec ${cfg.art} ${cfg.synFr} à ${cityName} ?`, a: `Sur SantéauMaroc, parcourez les ${cfg.synPlFr} référencés à ${cityName}, consultez leurs avis patients, leurs langues parlées et leurs disponibilités, puis réservez en ligne gratuitement — sans frais d'inscription.` },
      ],
    };
  };
}

const EXTRA_SPECS: ExtraCfg[] = [
  {
    slug: "nephrologie", synFr: "néphrologue", synPlFr: "néphrologues", synAr: "طبيب كلى",
    art: "un", acteFr: "consultation", acteAr: "استشارة", bigFr: "300 à 500 MAD", otherFr: "250 à 400 MAD",
    leadMidFr: "Insuffisance rénale, hypertension d'origine rénale, protéinurie, calculs ou suivi rénal du diabète : le néphrologue prend en charge médicalement les maladies des reins (à distinguer de l'urologue, chirurgien).",
    leadMidAr: "من القصور الكلوي وارتفاع ضغط الدم الكلوي والبيلة البروتينية إلى الحصى ومتابعة الكلى لدى مرضى السكري، يتكفّل طبيب الكلى طبيًّا بأمراض الكلى (يختلف عن جرّاح المسالك البولية).",
    metierQFr: "Où faire un bilan rénal (créatinine, protéinurie) à {V} ?",
    metierAFr: "À {V}, le néphrologue s'appuie sur des analyses de sang (créatinine, DFG), des analyses d'urine et une échographie des reins pour dépister et suivre une maladie rénale, fréquente en cas de diabète ou d'hypertension.",
    metierQAr: "أين أُجري تقييمًا للكلى (الكرياتينين، البيلة البروتينية) في {V}؟",
    metierAAr: "في {V}، يعتمد طبيب الكلى على تحاليل الدم (الكرياتينين، DFG) وتحاليل البول والتصوير بالصدى للكلى لكشف ومتابعة مرض كلوي، شائع لدى مرضى السكري وارتفاع ضغط الدم.",
  },
  {
    slug: "kinesitherapie", synFr: "kinésithérapeute", synPlFr: "kinésithérapeutes", synAr: "أخصائي علاج طبيعي",
    art: "un", acteFr: "séance", acteAr: "جلسة", bigFr: "150 à 300 MAD", otherFr: "120 à 250 MAD",
    leadMidFr: "Rééducation après une fracture, une entorse ou une chirurgie, mal de dos, rééducation respiratoire ou neurologique : le kinésithérapeute intervient sur prescription, en plusieurs séances.",
    leadMidAr: "إعادة التأهيل بعد كسر أو التواء أو عملية، وآلام الظهر، وإعادة التأهيل التنفسي أو العصبي: يتدخّل أخصائي العلاج الطبيعي بوصفة طبية، عبر عدة جلسات.",
    metierQFr: "Pour quelle rééducation consulter un kinésithérapeute à {V} ?",
    metierAFr: "À {V}, le kinésithérapeute intervient sur prescription médicale pour la rééducation après une fracture, une entorse ou une chirurgie, le mal de dos, ou la rééducation respiratoire et neurologique. Plusieurs séances sont généralement nécessaires.",
    metierQAr: "لأي إعادة تأهيل أستشير أخصائي العلاج الطبيعي في {V}؟",
    metierAAr: "في {V}، يتدخّل أخصائي العلاج الطبيعي بوصفة طبية لإعادة التأهيل بعد كسر أو التواء أو عملية، ولآلام الظهر، ولإعادة التأهيل التنفسي والعصبي. وعادةً ما تلزم عدة جلسات.",
  },
  {
    slug: "sage-femme", synFr: "sage-femme", synPlFr: "sages-femmes", synAr: "قابلة",
    art: "une", acteFr: "consultation", acteAr: "استشارة", bigFr: "200 à 400 MAD", otherFr: "150 à 300 MAD",
    leadMidFr: "Suivi de grossesse, préparation à l'accouchement, accouchement, suivi post-natal et contraception : la sage-femme accompagne la grossesse normale et oriente vers le gynécologue en cas de risque.",
    leadMidAr: "متابعة الحمل، والتحضير للولادة، والولادة، والمتابعة بعد الولادة، ووسائل منع الحمل: ترافق القابلة الحمل الطبيعي وتوجّه نحو طبيب النساء عند وجود خطر.",
    metierQFr: "La sage-femme peut-elle suivre ma grossesse à {V} ?",
    metierAFr: "À {V}, la sage-femme assure le suivi d'une grossesse normale, la préparation à l'accouchement, l'accouchement et le suivi post-natal, ainsi que la contraception. Elle oriente vers le gynécologue-obstétricien en cas de grossesse à risque.",
    metierQAr: "هل يمكن للقابلة متابعة حملي في {V}؟",
    metierAAr: "في {V}، تؤمّن القابلة متابعة الحمل الطبيعي والتحضير للولادة والولادة والمتابعة بعدها، إضافة إلى وسائل منع الحمل. وتوجّه نحو طبيب النساء والتوليد عند وجود حمل مُعرَّض للخطر.",
  },
  {
    slug: "psychologie", synFr: "psychologue", synPlFr: "psychologues", synAr: "أخصائي نفسي",
    art: "un", acteFr: "séance", acteAr: "جلسة", bigFr: "300 à 500 MAD", otherFr: "250 à 400 MAD",
    remboursementFr: "Le psychologue n'étant pas médecin, ses séances sont rarement remboursées par la CNSS/AMO.",
    remboursementAr: "وبما أن الأخصائي النفسي ليس طبيبًا، نادرًا ما تُسترجَع جلساته من CNSS/AMO.",
    leadMidFr: "Anxiété, dépression, stress, deuil, difficultés relationnelles : le psychologue (non-médecin) propose écoute et thérapies (TCC), sans prescription de médicaments et en toute confidentialité.",
    leadMidAr: "القلق والاكتئاب والتوتّر والحداد والصعوبات العلائقية: يقترح الأخصائي النفسي (غير الطبيب) الإنصات والعلاجات النفسية (TCC)، دون وصف أدوية وبسرّية تامة.",
    metierQFr: "Psychologue ou psychiatre à {V} : lequel consulter ?",
    metierAFr: "À {V}, le psychologue (non-médecin) propose un accompagnement et des thérapies sans prescription ; le psychiatre, médecin, peut prescrire un traitement. Les deux sont complémentaires, et la consultation reste strictement confidentielle.",
    metierQAr: "أخصائي نفسي أم طبيب نفسي في {V}: من أستشير؟",
    metierAAr: "في {V}، يقترح الأخصائي النفسي (غير الطبيب) مرافقة وعلاجات دون وصف؛ أما الطبيب النفسي فيمكنه وصف علاج. وهما متكاملان، وتبقى الاستشارة سرّية تمامًا.",
  },
  {
    slug: "allergologie", synFr: "allergologue", synPlFr: "allergologues", synAr: "طبيب حساسية",
    art: "un", acteFr: "consultation", acteAr: "استشارة", bigFr: "300 à 500 MAD", otherFr: "250 à 400 MAD",
    tarifExtraFr: " ; les tests cutanés (prick-tests) sont facturés en plus",
    tarifExtraAr: "، وتُفوتَر الاختبارات الجلدية (prick-tests) على حدة",
    leadMidFr: "Rhinite allergique, asthme, allergies alimentaires ou médicamenteuses, eczéma : l'allergologue identifie les allergènes par des tests et propose un traitement, voire une désensibilisation.",
    leadMidAr: "التهاب الأنف التحسّسي والربو والحساسية الغذائية أو الدوائية والإكزيما: يحدّد طبيب الحساسية المُحسِّسات عبر اختبارات ويقترح علاجًا، وقد يقترح إزالة التحسّس.",
    metierQFr: "Où faire des tests d'allergie (prick-tests) à {V} ?",
    metierAFr: "À {V}, l'allergologue réalise des tests cutanés (prick-tests) pour identifier les allergènes responsables de rhinite, d'asthme ou d'allergies alimentaires, fréquents en période de pollens et de poussière, et peut proposer une désensibilisation.",
    metierQAr: "أين أُجري اختبارات الحساسية (prick-tests) في {V}؟",
    metierAAr: "في {V}، يُجري طبيب الحساسية اختبارات جلدية (prick-tests) لتحديد المُحسِّسات المسبّبة لالتهاب الأنف أو الربو أو الحساسية الغذائية، الشائعة في مواسم الغبار وحبوب اللقاح، وقد يقترح إزالة التحسّس.",
  },
  {
    slug: "medecine-du-sport", synFr: "médecin du sport", synPlFr: "médecins du sport", synAr: "طبيب طب رياضي",
    art: "un", acteFr: "consultation", acteAr: "استشارة", bigFr: "300 à 600 MAD", otherFr: "250 à 450 MAD",
    leadMidFr: "Certificat d'aptitude, bilan avant reprise, prévention et soin des blessures sportives, test d'effort : le médecin du sport accompagne sportifs amateurs et confirmés.",
    leadMidAr: "شهادة الأهلية، والحصيلة قبل استئناف الرياضة، والوقاية من الإصابات الرياضية وعلاجها، واختبار الجهد: يرافق طبيب الطب الرياضي الرياضيين هواةً ومحترفين.",
    metierQFr: "Où obtenir un certificat de non contre-indication au sport à {V} ?",
    metierAFr: "À {V}, le médecin du sport délivre le certificat d'aptitude après un examen (et un test d'effort si nécessaire), prévient et soigne les blessures et accompagne la reprise sportive.",
    metierQAr: "أين أحصل على شهادة عدم وجود مانع لممارسة الرياضة في {V}؟",
    metierAAr: "في {V}، يسلّم طبيب الطب الرياضي شهادة الأهلية بعد فحص (واختبار جهد عند الحاجة)، ويقي من الإصابات ويعالجها ويرافق استئناف الرياضة.",
  },
  {
    slug: "nutrition", synFr: "nutritionniste", synPlFr: "nutritionnistes", synAr: "أخصائي تغذية",
    art: "un", acteFr: "consultation", acteAr: "استشارة", bigFr: "300 à 500 MAD", otherFr: "200 à 400 MAD",
    leadMidFr: "Surpoids, diabète, cholestérol, rééquilibrage alimentaire ou troubles du comportement alimentaire : le nutritionniste établit un plan alimentaire personnalisé et un suivi.",
    leadMidAr: "زيادة الوزن والسكري والكوليسترول وإعادة التوازن الغذائي أو اضطرابات السلوك الغذائي: يضع أخصائي التغذية برنامجًا غذائيًّا شخصيًّا ومتابعة.",
    metierQFr: "Comment se passe un suivi nutritionnel à {V} ?",
    metierAFr: "À {V}, le nutritionniste établit un bilan et un plan alimentaire personnalisé (surpoids, diabète, cholestérol) avec des consultations de suivi régulières. Le médecin nutritionniste peut prescrire des examens ; le diététicien accompagne l'alimentation.",
    metierQAr: "كيف تجري متابعة غذائية في {V}؟",
    metierAAr: "في {V}، يضع أخصائي التغذية حصيلة وبرنامجًا غذائيًّا شخصيًّا (زيادة الوزن، السكري، الكوليسترول) مع استشارات متابعة منتظمة. ويمكن لطبيب التغذية وصف فحوص، بينما يرافق أخصائي الحمية التغذية.",
  },
  {
    slug: "medecine-esthetique", synFr: "médecin esthétique", synPlFr: "médecins esthétiques", synAr: "طبيب تجميل",
    art: "un", acteFr: "consultation", acteAr: "استشارة", bigFr: "300 à 600 MAD", otherFr: "250 à 450 MAD",
    remboursementFr: "Les actes de médecine esthétique ne sont pas remboursés par la CNSS/AMO ; un devis est remis avant tout acte.",
    remboursementAr: "لا تُسترجَع أعمال طب التجميل من CNSS/AMO؛ ويُسلَّم تقدير مفصّل قبل أي عمل.",
    leadMidFr: "Injections d'acide hyaluronique, botox, peeling, laser ou mésothérapie : le médecin esthétique réalise des actes non chirurgicaux, réservés aux médecins qualifiés.",
    leadMidAr: "حقن حمض الهيالورونيك والبوتوكس والتقشير والليزر والميزوثيرابي: يُجري طبيب التجميل أعمالًا غير جراحية، محصورة في الأطباء المؤهّلين.",
    metierQFr: "Quels actes de médecine esthétique propose-t-on à {V} ?",
    metierAFr: "À {V}, le médecin esthétique propose des actes non chirurgicaux : injections d'acide hyaluronique, botox, peeling, laser, mésothérapie. Ces actes esthétiques ne sont pas remboursés ; privilégiez un médecin qualifié et un devis clair.",
    metierQAr: "ما أعمال طب التجميل المتاحة في {V}؟",
    metierAAr: "في {V}، يقترح طبيب التجميل أعمالًا غير جراحية: حقن حمض الهيالورونيك، البوتوكس، التقشير، الليزر، الميزوثيرابي. ولا تُسترجَع هذه الأعمال؛ يُفضَّل طبيب مؤهّل وتقدير واضح.",
  },
  {
    slug: "geriatrie", synFr: "gériatre", synPlFr: "gériatres", synAr: "طبيب مسنّين",
    art: "un", acteFr: "consultation", acteAr: "استشارة", bigFr: "300 à 600 MAD", otherFr: "250 à 450 MAD",
    leadMidFr: "Polypathologie, chutes, troubles de la mémoire, dénutrition, perte d'autonomie : le gériatre évalue la santé globale de la personne âgée et ajuste les traitements pour éviter les interactions.",
    leadMidAr: "تعدّد الأمراض، والسقوط، واضطرابات الذاكرة، وسوء التغذية، وفقدان الاستقلالية: يقيّم طبيب المسنّين الصحة العامة للشخص المسنّ ويضبط العلاجات لتفادي التداخلات.",
    metierQFr: "Quand consulter un gériatre pour un proche âgé à {V} ?",
    metierAFr: "À {V}, le gériatre est indiqué en cas de fragilité, de chutes répétées, de troubles de la mémoire, de dénutrition ou de perte d'autonomie. Il fait le point sur l'ensemble des maladies et des traitements pour préserver l'autonomie.",
    metierQAr: "متى أستشير طبيب مسنّين لقريب مسنّ في {V}؟",
    metierAAr: "في {V}، يُنصح بطبيب المسنّين عند الهشاشة أو تكرار السقوط أو اضطرابات الذاكرة أو سوء التغذية أو فقدان الاستقلالية. ويراجع مجمل الأمراض والعلاجات للحفاظ على الاستقلالية.",
  },
  {
    slug: "neurochirurgie", synFr: "neurochirurgien", synPlFr: "neurochirurgiens", synAr: "جرّاح أعصاب ودماغ",
    art: "un", acteFr: "consultation", acteAr: "استشارة", bigFr: "400 à 700 MAD", otherFr: "300 à 500 MAD",
    tarifExtraFr: " ; l'intervention et l'hospitalisation font l'objet d'une prise en charge distincte",
    tarifExtraAr: "، وتخضع العملية والاستشفاء لتكفّل منفصل",
    leadMidFr: "Hernie discale, canal lombaire étroit, tumeur du cerveau ou de la moelle, suite de traumatisme crânien : le neurochirurgien opère le système nerveux, souvent sur orientation (à distinguer du neurologue, médical).",
    leadMidAr: "الانزلاق الغضروفي، وتضيّق القناة القطنية، وأورام الدماغ أو النخاع، وتبعات رضّ الرأس: يُجري جرّاح الأعصاب عمليات الجهاز العصبي، غالبًا بعد توجيه (يختلف عن طبيب الأعصاب الطبّي).",
    metierQFr: "Quand consulter un neurochirurgien à {V} ?",
    metierAFr: "À {V}, la consultation de neurochirurgie fait souvent suite à une orientation (neurologue, urgences) pour une hernie discale, un canal lombaire étroit, une tumeur ou après un traumatisme. Toute urgence (déficit brutal) impose d'appeler le 15 (SAMU).",
    metierQAr: "متى أستشير جرّاح أعصاب في {V}؟",
    metierAAr: "في {V}، تأتي استشارة جراحة الأعصاب غالبًا بعد توجيه (طبيب أعصاب، مستعجلات) بشأن انزلاق غضروفي أو تضيّق القناة القطنية أو ورم أو بعد رضّ. وتفرض كل حالة طارئة (عجز مفاجئ) الاتصال بالإسعاف (15).",
  },
];

const BUILDERS: Record<string, Builder> = {
  ...Object.fromEntries(EXTRA_SPECS.map((c) => [c.slug, makeBuilder(c)])),
  "medecine-generale": medecineGenerale,
  "cardiologie": cardiologie,
  "pediatrie": pediatrie,
  "gyneco-obstetrique": gynecologie,
  "ophtalmologie": ophtalmologie,
  "chirurgie-dentaire": chirurgieDentaire,
  "dermatologie": dermatologie,
  "traumatologie-orthopedie": orthopedie,
  "psychiatrie": psychiatrie,
  "oto-rhino-laryngologie": orl,
  "urologie-et-chirurgie-urologique": urologie,
  "gastro-enterologie": gastroEnterologie,
  "pneumo-phtisiologie": pneumologie,
  "neurologie": neurologie,
  "endocrinologie-et-maladies-metaboliques": endocrinologie,
  "rhumatologie": rhumatologie,
  "orthodontie": orthodontie,
  "chirurgie-generale": chirurgieGenerale,
  "acupuncture": acupuncture,
};

/**
 * Renvoie l'enrichissement city-aware d'une spécialité configurée, ou `null`
 * pour toute spécialité non configurée (la page retombe alors sur le patron
 * générique). `cityName` doit déjà être localisé (via `tCity`).
 */
export function getSpecialtyCityContent(
  slug: string,
  citySlug: string,
  cityName: string,
  total: number,
  locale: Locale,
): CityEnrichment | null {
  const build = BUILDERS[slug];
  return build ? build(citySlug, cityName, total, locale) : null;
}
