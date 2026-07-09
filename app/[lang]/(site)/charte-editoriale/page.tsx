import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

// Date de dernière révision de la charte (E-E-A-T : signal de fraîcheur).
const LAST_UPDATED_ISO = "2026-07-01";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Charte éditoriale, transparence IA & vérification",
    description:
      "Comment SantéauMaroc produit et contrôle son contenu santé : ligne éditoriale, relecture médicale et sources, usage transparent de l'intelligence artificielle, critères de vérification des praticiens et modération des avis.",
    alternates: localizedAlternates("/charte-editoriale", locale),
    openGraph: {
      title: "Charte éditoriale & transparence — SantéauMaroc",
      description:
        "Nos standards de production du contenu santé, l'usage de l'IA et les critères de vérification des médecins.",
      url: "/charte-editoriale",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Charte éditoriale & transparence — SantéauMaroc",
      description: "Standards éditoriaux, transparence IA et vérification des praticiens.",
    },
  };
}

type Section = { title: string; paragraphs: string[]; items?: string[] };
type Copy = {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  updatedLabel: string;
  updatedHuman: string;
  sections: Section[];
  contactTitle: string;
  contactDesc: string;
  contactBtn: string;
  homeCrumb: string;
  crumb: string;
};

const COPY: Record<"fr" | "ar", Copy> = {
  fr: {
    eyebrow: "Transparence & confiance",
    heroTitle: "Charte éditoriale et transparence",
    heroSubtitle:
      "La santé est un domaine sensible. Voici, sans détour, comment nous produisons notre contenu, comment nous utilisons l'intelligence artificielle, et comment nous vérifions les praticiens référencés.",
    updatedLabel: "Dernière mise à jour",
    updatedHuman: "1er juillet 2026",
    sections: [
      {
        title: "1. Notre ligne éditoriale",
        paragraphs: [
          "Nos contenus de santé (articles du blog, fiches d'information) sont rédigés dans un objectif d'information générale et de vulgarisation. Ils sont pensés pour être clairs, exacts et utiles au public marocain.",
          "Chaque article publié indique son auteur, sa fonction et ses éléments de qualification, ainsi que sa date de publication et de dernière mise à jour. Nous privilégions un langage accessible sans sacrifier la rigueur.",
        ],
        items: [
          "Auteur identifié, avec fonction et qualifications affichées.",
          "Dates de publication et de mise à jour visibles sur chaque contenu.",
          "Sources de référence privilégiées : OMS, Ministère de la Santé et de la Protection sociale du Maroc, Ordre National des Médecins, ANAM, ainsi que la HAS et les sociétés savantes.",
        ],
      },
      {
        title: "2. Relecture et exactitude médicale",
        paragraphs: [
          "Les contenus à portée médicale font l'objet d'une relecture. Lorsqu'un contenu a été vérifié médicalement, le nom et la fonction du relecteur ainsi que la date de vérification sont affichés sur la page.",
          "Nous mettons à jour nos contenus lorsque les connaissances ou les recommandations évoluent. Aucun contenu de ce site ne remplace une consultation médicale personnalisée : en cas de doute ou de symptôme, consultez un professionnel de santé.",
        ],
      },
      {
        title: "3. Utilisation de l'intelligence artificielle",
        paragraphs: [
          "Nous utilisons l'IA de manière limitée et encadrée, jamais pour produire un avis médical à la place d'un professionnel. Nous préférons le dire clairement :",
        ],
        items: [
          "Résumés « L'essentiel » : certains résumés courts peuvent être générés ou assistés par IA à partir du contenu de la page. Ils sont signalés et ne constituent pas un avis médical.",
          "Modération assistée : les questions et avis peuvent passer par un filtrage automatique (détection de spam, contenu dangereux) ; les décisions sensibles restent soumises à une revue humaine.",
          "Réponses médicales : les réponses aux questions des patients sont rédigées par des médecins vérifiés — jamais par une IA.",
        ],
      },
      {
        title: "4. Vérification des praticiens",
        paragraphs: [
          "Un praticien peut revendiquer sa fiche pour la gérer. La revendication implique la fourniture de justificatifs (pièce d'identité, diplôme, numéro d'inscription professionnel), examinés par notre équipe.",
          "Le badge « Vérifié » signale une fiche dont l'identité et la qualité de praticien ont été contrôlées. Une fiche vérifiée peut répondre aux questions médicales de l'espace Questions/Réponses. Un praticien peut demander la correction ou le retrait de sa fiche à tout moment.",
        ],
        items: [
          "Justificatifs demandés : identité, diplôme, numéro d'inscription professionnel.",
          "Examen des documents par notre équipe avant attribution du badge.",
          "Documents stockés de façon privée et sécurisée, accès restreint.",
        ],
      },
      {
        title: "5. Avis des patients",
        paragraphs: [
          "Les avis publiés visent à refléter des expériences réelles. Ils sont modérés et peuvent être retirés s'ils enfreignent nos règles (propos diffamatoires, contenu hors sujet, faux avis).",
          "La note moyenne d'un praticien n'est affichée qu'à partir d'un nombre minimal d'avis, afin d'éviter les moyennes trompeuses fondées sur un seul retour.",
        ],
      },
      {
        title: "6. Indépendance et transparence commerciale",
        paragraphs: [
          "Les emplacements sponsorisés et les fiches mises en avant sont identifiés comme tels. Le fait qu'un praticien souscrive à une offre payante n'influence ni le contenu médical, ni la modération des avis, ni la véracité des informations affichées.",
        ],
      },
      {
        title: "7. Signaler une erreur",
        paragraphs: [
          "Nous corrigeons rapidement les erreurs factuelles. Si vous constatez une inexactitude sur une fiche, un article ou une réponse, écrivez-nous — chaque signalement est examiné.",
        ],
      },
    ],
    contactTitle: "Une erreur, une question sur nos méthodes ?",
    contactDesc: "Notre équipe examine chaque signalement et répond aux questions sur nos standards éditoriaux.",
    contactBtn: "Nous contacter",
    homeCrumb: "Accueil",
    crumb: "Charte éditoriale",
  },
  ar: {
    eyebrow: "الشفافية والثقة",
    heroTitle: "الميثاق التحريري والشفافية",
    heroSubtitle:
      "الصحة مجال حسّاس. نوضّح لكم بصراحة كيف ننتج محتوانا، وكيف نستعمل الذكاء الاصطناعي، وكيف نتحقّق من الأطباء المُدرَجين.",
    updatedLabel: "آخر تحديث",
    updatedHuman: "1 يوليوز 2026",
    sections: [
      {
        title: "1. خطّنا التحريري",
        paragraphs: [
          "تُكتب محتوياتنا الصحية (مقالات المدونة، بطاقات المعلومات) بهدف الإعلام العام والتبسيط. صُمّمت لتكون واضحة ودقيقة ومفيدة للجمهور المغربي.",
          "يُذكر في كل مقال منشور اسم كاتبه ووظيفته ومؤهلاته، وكذلك تاريخ النشر وآخر تحديث. نفضّل لغة في متناول الجميع دون التفريط في الدقّة.",
        ],
        items: [
          "كاتب مُعرَّف، مع إظهار الوظيفة والمؤهلات.",
          "تواريخ النشر والتحديث ظاهرة على كل محتوى.",
          "المصادر المرجعية المُعتمَدة: منظمة الصحة العالمية، وزارة الصحة والحماية الاجتماعية المغربية، الهيئة الوطنية للأطباء، الوكالة الوطنية للتأمين الصحي (ANAM)، إضافة إلى الهيئة العليا للصحة الفرنسية (HAS) والهيئات العلمية.",
        ],
      },
      {
        title: "2. المراجعة والدقّة الطبية",
        paragraphs: [
          "تخضع المحتويات ذات الطابع الطبي للمراجعة. عند التحقق طبياً من محتوى، يُعرض اسم المراجع ووظيفته وتاريخ التحقق على الصفحة.",
          "نُحدّث محتوياتنا عند تطوّر المعارف أو التوصيات. لا يُغني أي محتوى في هذا الموقع عن استشارة طبية شخصية: عند الشك أو ظهور عرض، استشر مختصاً في الصحة.",
        ],
      },
      {
        title: "3. استعمال الذكاء الاصطناعي",
        paragraphs: [
          "نستعمل الذكاء الاصطناعي بشكل محدود ومؤطَّر، وليس أبداً لإنتاج رأي طبي بدل المختص. نفضّل قول ذلك بوضوح:",
        ],
        items: [
          "ملخّصات «الأساسي»: قد تُولَّد بعض الملخّصات القصيرة أو تُساعد فيها تقنيات الذكاء الاصطناعي انطلاقاً من محتوى الصفحة. تُشار بوضوح ولا تُشكّل رأياً طبياً.",
          "إشراف مُعان: قد تمرّ الأسئلة والآراء عبر تصفية آلية (كشف المحتوى غير المرغوب أو الخطير)؛ وتبقى القرارات الحسّاسة خاضعة لمراجعة بشرية.",
          "الأجوبة الطبية: تُكتب أجوبة أسئلة المرضى من طرف أطباء مُوثَّقين — وليس عبر ذكاء اصطناعي.",
        ],
      },
      {
        title: "4. التحقق من الأطباء",
        paragraphs: [
          "يمكن للطبيب المطالبة ببطاقته لإدارتها. تتطلّب المطالبة تقديم وثائق (بطاقة التعريف، الشهادة، رقم التسجيل المهني) تُفحص من طرف فريقنا.",
          "تشير علامة «مُوثَّق» إلى بطاقة تمّ التحقق من هوية صاحبها وصفته كطبيب. يمكن لبطاقة موثَّقة الإجابة عن الأسئلة الطبية في فضاء الأسئلة والأجوبة. ويمكن للطبيب طلب تصحيح أو حذف بطاقته في أي وقت.",
        ],
        items: [
          "الوثائق المطلوبة: الهوية، الشهادة، رقم التسجيل المهني.",
          "فحص الوثائق من طرف فريقنا قبل منح العلامة.",
          "تُخزَّن الوثائق بشكل خاص وآمن مع ولوج محدود.",
        ],
      },
      {
        title: "5. آراء المرضى",
        paragraphs: [
          "تهدف الآراء المنشورة إلى عكس تجارب حقيقية. تخضع للإشراف ويمكن حذفها إن خالفت قواعدنا (تشهير، محتوى خارج الموضوع، آراء مزيّفة).",
          "لا يُعرض متوسط تقييم الطبيب إلا ابتداءً من عدد أدنى من الآراء، تفادياً للمتوسطات المضلِّلة المبنية على رأي واحد.",
        ],
      },
      {
        title: "6. الاستقلالية والشفافية التجارية",
        paragraphs: [
          "تُعرَّف المواضع المُموَّلة والبطاقات المُبرَزة على هذا النحو. اشتراك طبيب في عرض مؤدّى لا يؤثّر لا في المحتوى الطبي، ولا في الإشراف على الآراء، ولا في صحّة المعلومات المعروضة.",
        ],
      },
      {
        title: "7. الإبلاغ عن خطأ",
        paragraphs: [
          "نصحّح الأخطاء الواقعية بسرعة. إذا لاحظت معلومة غير دقيقة في بطاقة أو مقال أو جواب، راسلنا — يُدرَس كل إبلاغ.",
        ],
      },
    ],
    contactTitle: "خطأ أو سؤال حول منهجيتنا؟",
    contactDesc: "يدرس فريقنا كل إبلاغ ويجيب عن الأسئلة المتعلقة بمعاييرنا التحريرية.",
    contactBtn: "اتصل بنا",
    homeCrumb: "الرئيسية",
    crumb: "الميثاق التحريري",
  },
};

export default async function CharteEditorialePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang) === "ar" ? "ar" : "fr";
  const t = COPY[locale];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE}/charte-editoriale#page`,
        "name": t.heroTitle,
        "url": `${BASE}/charte-editoriale`,
        "description": t.heroSubtitle,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "dateModified": LAST_UPDATED_ISO,
        "lastReviewed": LAST_UPDATED_ISO,
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}/#website`, "url": BASE },
        "publisher": {
          "@type": "Organization",
          "@id": `${BASE}/#organization`,
          "name": "SantéauMaroc",
          "url": BASE,
          "logo": `${BASE}/logo.svg`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.homeCrumb, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.crumb, "item": `${BASE}/charte-editoriale` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="hero-bg relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20">
          <p className="section-eyebrow text-secondary-300 mb-4">{t.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-white/75 text-lg leading-relaxed">{t.heroSubtitle}</p>
          <p className="mt-6 text-sm text-white/60">
            {t.updatedLabel} : <time dateTime={LAST_UPDATED_ISO}>{t.updatedHuman}</time>
          </p>
        </div>
      </div>

      <main className="page-outer">
        <div className="max-w-3xl mx-auto">

          {/* ── Sommaire (ancres profondes + éligibilité sitelinks) ── */}
          <nav aria-label={locale === "ar" ? "في هذه الصفحة" : "Sur cette page"} className="mb-10 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              {locale === "ar" ? "في هذه الصفحة" : "Sur cette page"}
            </p>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {t.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#s-${i + 1}`} className="text-sm text-primary-600 hover:text-primary-700 hover:underline leading-relaxed">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {t.sections.map((s, i) => (
            <section key={i} id={`s-${i + 1}`} className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h2>
              {s.paragraphs.map((p, j) => (
                <p key={j} className="text-slate-600 leading-relaxed mb-3">{p}</p>
              ))}
              {s.items && (
                <ul className="mt-2 space-y-2">
                  {s.items.map((it, k) => (
                    <li key={k} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25"
                        className="w-4 h-4 mt-1 shrink-0 text-secondary-600 rtl:-scale-x-100" aria-hidden="true"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8.5l3.5 3.5L13 5" />
                      </svg>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* ── CTA contact ──────────────────────────────── */}
          <section>
            <div
              className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 58%, #047857 100%)" }}
            >
              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{t.contactTitle}</h2>
                <p className="text-white/75 text-sm mb-7 max-w-md mx-auto leading-relaxed">{t.contactDesc}</p>
                <Link href="/contact" className="btn-ghost-white px-8 py-3">{t.contactBtn}</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
