import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";
import { RemboursementSimulateur } from "@/components/RemboursementSimulateur";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

// Dernière révision éditoriale (E-E-A-T). ⚠️ Contenu réglementaire à faire
// relire par un référent avant publication définitive (règles susceptibles
// d'évoluer avec la généralisation de l'AMO).
const LAST_UPDATED_ISO = "2026-07-02";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Remboursement AMO / CNSS au Maroc : consultation, médecin conventionné",
    description:
      "Comment fonctionne le remboursement des soins au Maroc : AMO, CNSS, médecin conventionné, tarif de référence (TNR), ticket modérateur et démarches. Guide clair, sources officielles.",
    alternates: localizedAlternates("/remboursement-amo-cnss", locale),
    openGraph: {
      title: "Remboursement AMO / CNSS au Maroc — Guide pratique",
      description:
        "AMO, CNSS, médecin conventionné, TNR, ticket modérateur et démarches de remboursement des soins au Maroc.",
      url: "/remboursement-amo-cnss",
      type: "article",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
    twitter: {
      card: "summary_large_image",
      title: "Remboursement AMO / CNSS au Maroc",
      description: "Guide pratique du remboursement des soins au Maroc.",
    },
  };
}

type QA = { q: string; a: string };
type Section = { title: string; paragraphs: string[]; items?: string[] };
type Copy = {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  updatedLabel: string;
  updatedHuman: string;
  sections: Section[];
  faqTitle: string;
  faqs: QA[];
  sourcesTitle: string;
  sources: { label: string; href: string }[];
  disclaimerTitle: string;
  disclaimer: string;
  ctaTitle: string;
  ctaText: string;
  ctaBtn: string;
  homeCrumb: string;
  crumb: string;
};

const COPY: Record<"fr" | "ar", Copy> = {
  fr: {
    eyebrow: "Guide pratique · Couverture médicale",
    heroTitle: "Remboursement des soins au Maroc : AMO, CNSS et médecin conventionné",
    heroSubtitle:
      "Comprendre qui gère votre couverture, ce que change un médecin conventionné, et comment vous êtes remboursé d'une consultation ou d'un acte médical au Maroc.",
    updatedLabel: "Dernière mise à jour",
    updatedHuman: "2 juillet 2026",
    sections: [
      {
        title: "Qu'est-ce que l'AMO ?",
        paragraphs: [
          "L'AMO (Assurance Maladie Obligatoire) est le régime de base de la couverture médicale au Maroc, instauré par la loi 65-00 (Code de la couverture médicale de base). Elle prend en charge une partie des frais de santé : consultations, médicaments, analyses, hospitalisation, etc.",
          "Dans le cadre de la généralisation de la protection sociale (loi-cadre 09-21), l'AMO a été étendue à de nouvelles catégories de population et sa gestion tend à être unifiée.",
        ],
      },
      {
        title: "Qui gère votre couverture ?",
        paragraphs: [
          "Le régime dont vous relevez dépend de votre situation professionnelle :",
        ],
        items: [
          "Salariés du secteur privé : AMO gérée par la CNSS (Caisse Nationale de Sécurité Sociale).",
          "Travailleurs non-salariés (professions libérales, commerçants, artisans, agriculteurs…) : régime AMO-TNS, également via la CNSS.",
          "Personnes sans ressources suffisantes : AMO-Tadamon, qui a remplacé le RAMED et est gérée par la CNSS depuis fin 2022.",
          "Fonctionnaires et agents du secteur public : historiquement via la CNOPS ; la gestion évolue dans le cadre de l'unification prévue par la réforme.",
        ],
      },
      {
        title: "Médecin « conventionné » : qu'est-ce que ça change ?",
        paragraphs: [
          "Le remboursement de l'AMO se calcule sur la base d'un Tarif National de Référence (TNR), fixé par convention entre les organismes gestionnaires et les professionnels de santé — et non sur le prix réellement demandé par le praticien.",
          "Un professionnel conventionné s'engage à appliquer les tarifs de la convention. Concrètement, si un médecin facture au-dessus du TNR, la différence reste à votre charge, car le remboursement porte sur le tarif de référence.",
        ],
      },
      {
        title: "Comment êtes-vous remboursé ?",
        paragraphs: [
          "Après une consultation ou un acte, vous êtes remboursé d'un pourcentage du TNR. Le taux dépend de votre régime, du type d'acte et du lieu de soins (le secteur public et l'hospitalisation sont généralement mieux pris en charge que les soins ambulatoires du privé).",
          "La part qui reste à votre charge s'appelle le ticket modérateur, à laquelle s'ajoute, le cas échéant, tout dépassement au-dessus du TNR. Les taux exacts évoluent : vérifiez-les auprès de votre caisse.",
        ],
      },
      {
        title: "Maladies chroniques et affections de longue durée (ALD)",
        paragraphs: [
          "Pour les affections de longue durée (ALD) et les affections lourdes et coûteuses (ALC) — diabète, insuffisance rénale, cancers, etc. —, la prise en charge est renforcée et le ticket modérateur peut être réduit ou supprimé, sous réserve d'une reconnaissance préalable par votre caisse.",
        ],
      },
      {
        title: "Vos démarches de remboursement",
        paragraphs: [
          "En pratique, le remboursement suit généralement ces étapes :",
        ],
        items: [
          "Le médecin remplit une feuille de soins ; conservez ordonnances, factures et justificatifs de paiement.",
          "Déposez votre dossier auprès de votre caisse (agence ou services en ligne, comme les e-services de la CNSS).",
          "Le remboursement est versé après traitement du dossier ; les délais varient selon la caisse et la complétude du dossier.",
          "Pour certains actes, le tiers payant peut vous dispenser d'avancer une partie des frais.",
        ],
      },
    ],
    faqTitle: "Questions fréquentes",
    faqs: [
      {
        q: "Combien la CNSS rembourse-t-elle pour une consultation ?",
        a: "Le remboursement porte sur un pourcentage du Tarif National de Référence (TNR), pas sur le prix payé au médecin. Le taux dépend de votre régime et du type de soins. Pour le montant exact applicable à votre situation, consultez votre caisse (CNSS).",
      },
      {
        q: "Comment savoir si un médecin est conventionné ?",
        a: "Vous pouvez le demander directement au cabinet, ou vous renseigner auprès de votre caisse. Un praticien conventionné applique les tarifs de la convention servant de base au remboursement.",
      },
      {
        q: "Que reste-t-il à ma charge ?",
        a: "Le ticket modérateur (la part non remboursée du tarif de référence), auquel s'ajoute tout dépassement si le médecin facture au-dessus du TNR.",
      },
      {
        q: "Quel est le délai de remboursement ?",
        a: "Il varie selon la caisse et la complétude de votre dossier. Les services en ligne permettent souvent de suivre l'avancement de votre demande.",
      },
      {
        q: "Je n'ai pas d'emploi salarié : suis-je couvert ?",
        a: "La généralisation de l'AMO couvre désormais les travailleurs non-salariés (AMO-TNS) et les personnes sans ressources suffisantes (AMO-Tadamon, ex-RAMED). Renseignez-vous auprès de la CNSS pour votre affiliation.",
      },
    ],
    sourcesTitle: "Sources officielles",
    sources: [
      { label: "CNSS — Caisse Nationale de Sécurité Sociale", href: "https://www.cnss.ma" },
      { label: "Ministère de la Santé et de la Protection sociale", href: "https://www.sante.gov.ma" },
    ],
    disclaimerTitle: "Information générale",
    disclaimer:
      "Cette page fournit une information générale sur la couverture médicale au Maroc, à jour à la date indiquée. Les règles, taux et démarches peuvent évoluer, notamment avec la généralisation de l'AMO. Elle ne remplace pas les informations officielles de votre caisse : vérifiez toujours votre situation auprès de la CNSS ou de l'organisme dont vous relevez.",
    ctaTitle: "Besoin d'un médecin ?",
    ctaText: "Trouvez un praticien près de chez vous et prenez rendez-vous en ligne.",
    ctaBtn: "Trouver un médecin",
    homeCrumb: "Accueil",
    crumb: "Remboursement AMO / CNSS",
  },
  ar: {
    eyebrow: "دليل عملي · التغطية الصحية",
    heroTitle: "استرداد مصاريف العلاج بالمغرب: AMO وCNSS والطبيب المُتعاقد",
    heroSubtitle:
      "افهم من يدير تغطيتك، وما الذي يغيّره الطبيب المُتعاقد، وكيف تُسترَد لك مصاريف استشارة أو عمل طبي بالمغرب.",
    updatedLabel: "آخر تحديث",
    updatedHuman: "2 يوليوز 2026",
    sections: [
      {
        title: "ما هو التأمين الإجباري عن المرض (AMO)؟",
        paragraphs: [
          "التأمين الإجباري عن المرض (AMO) هو النظام الأساسي للتغطية الصحية بالمغرب، أُحدث بموجب القانون 65-00 (مدونة التغطية الصحية الأساسية). يتكفّل بجزء من مصاريف الصحة: الاستشارات، الأدوية، التحاليل، الاستشفاء وغيرها.",
          "في إطار تعميم الحماية الاجتماعية (القانون-الإطار 09-21)، جرى توسيع AMO ليشمل فئات جديدة من السكان، مع توجّه نحو توحيد تدبيره.",
        ],
      },
      {
        title: "من يدير تغطيتك؟",
        paragraphs: ["يتوقف النظام الذي تنتمي إليه على وضعيتك المهنية:"],
        items: [
          "أُجراء القطاع الخاص: AMO يديره الصندوق الوطني للضمان الاجتماعي (CNSS).",
          "غير الأجراء (المهن الحرة، التجار، الحرفيون، الفلاحون…): نظام AMO-TNS، عبر CNSS أيضاً.",
          "الأشخاص بدون موارد كافية: AMO-Tadamon الذي حلّ محل RAMED، ويديره CNSS منذ أواخر 2022.",
          "موظفو وأعوان القطاع العام: تاريخياً عبر CNOPS؛ والتدبير في طور التوحيد ضمن الإصلاح.",
        ],
      },
      {
        title: "الطبيب «المُتعاقد»: ما الذي يتغيّر؟",
        paragraphs: [
          "يُحتسب استرداد AMO على أساس التعريفة الوطنية المرجعية (TNR) المحددة باتفاقية بين هيئات التدبير ومهنيي الصحة — وليس على أساس السعر الفعلي الذي يطلبه الطبيب.",
          "يلتزم المهني المُتعاقد بتطبيق تعريفات الاتفاقية. عملياً، إذا فوتر طبيبٌ فوق TNR، يبقى الفارق على عاتقك، لأن الاسترداد يخص التعريفة المرجعية.",
        ],
      },
      {
        title: "كيف تُسترَد لك المصاريف؟",
        paragraphs: [
          "بعد استشارة أو عمل طبي، تُسترَد لك نسبة من TNR. تتوقف النسبة على نظامك، ونوع العمل الطبي، ومكان العلاج (القطاع العام والاستشفاء يُغطَّيان عموماً أفضل من العلاجات الخارجية بالقطاع الخاص).",
          "الجزء الذي يبقى على عاتقك يُسمى «الجزء المتبقّي» (ticket modérateur)، يُضاف إليه عند الاقتضاء أي تجاوز فوق TNR. النسب الدقيقة تتغيّر: تحقّق منها لدى صندوقك.",
        ],
      },
      {
        title: "الأمراض المزمنة وطويلة الأمد",
        paragraphs: [
          "بالنسبة للأمراض طويلة الأمد والأمراض المكلفة — السكري، القصور الكلوي، السرطانات… — تكون التغطية مُعزَّزة وقد يُخفَّض أو يُلغى الجزء المتبقّي، شريطة الاعتراف المسبق من طرف صندوقك.",
        ],
      },
      {
        title: "إجراءات الاسترداد",
        paragraphs: ["عملياً، يتبع الاسترداد عادةً هذه الخطوات:"],
        items: [
          "يملأ الطبيب ورقة العلاجات؛ احتفظ بالوصفات والفواتير وإثباتات الأداء.",
          "أودِع ملفك لدى صندوقك (الوكالة أو الخدمات الإلكترونية، مثل خدمات CNSS الإلكترونية).",
          "يُصرَف الاسترداد بعد معالجة الملف؛ وتختلف الآجال حسب الصندوق واكتمال الملف.",
          "بالنسبة لبعض الأعمال الطبية، قد يُعفيك «الأداء من الغير» (tiers payant) من تسبيق جزء من المصاريف.",
        ],
      },
    ],
    faqTitle: "أسئلة شائعة",
    faqs: [
      {
        q: "كم يسترد CNSS مقابل استشارة؟",
        a: "يخص الاسترداد نسبة من التعريفة الوطنية المرجعية (TNR)، وليس السعر المؤدى للطبيب. تتوقف النسبة على نظامك ونوع العلاج. للمبلغ الدقيق المطبّق على وضعيتك، استشر صندوقك (CNSS).",
      },
      {
        q: "كيف أعرف أن طبيباً مُتعاقد؟",
        a: "يمكنك سؤال العيادة مباشرة، أو الاستفسار لدى صندوقك. الطبيب المُتعاقد يطبّق تعريفات الاتفاقية التي تُتخذ أساساً للاسترداد.",
      },
      {
        q: "ما الذي يبقى على عاتقي؟",
        a: "الجزء المتبقّي (غير المسترَد من التعريفة المرجعية)، يُضاف إليه أي تجاوز إذا فوتر الطبيب فوق TNR.",
      },
      {
        q: "ما هو أجل الاسترداد؟",
        a: "يختلف حسب الصندوق واكتمال ملفك. غالباً ما تتيح الخدمات الإلكترونية تتبّع تقدّم طلبك.",
      },
      {
        q: "لست أجيراً: هل أنا مُغطّى؟",
        a: "يشمل تعميم AMO الآن غير الأجراء (AMO-TNS) والأشخاص بدون موارد كافية (AMO-Tadamon، سابقاً RAMED). استفسر لدى CNSS حول انخراطك.",
      },
    ],
    sourcesTitle: "مصادر رسمية",
    sources: [
      { label: "CNSS — الصندوق الوطني للضمان الاجتماعي", href: "https://www.cnss.ma" },
      { label: "وزارة الصحة والحماية الاجتماعية", href: "https://www.sante.gov.ma" },
    ],
    disclaimerTitle: "معلومة عامة",
    disclaimer:
      "تقدّم هذه الصفحة معلومة عامة حول التغطية الصحية بالمغرب، محيّنة في التاريخ المشار إليه. قد تتغيّر القواعد والنسب والإجراءات، خاصة مع تعميم AMO. وهي لا تعوّض المعلومات الرسمية لصندوقك: تحقّق دائماً من وضعيتك لدى CNSS أو الهيئة التي تنتمي إليها.",
    ctaTitle: "تحتاج إلى طبيب؟",
    ctaText: "اعثر على طبيب قريب منك وخذ موعداً عبر الإنترنت.",
    ctaBtn: "ابحث عن طبيب",
    homeCrumb: "الرئيسية",
    crumb: "استرداد AMO / CNSS",
  },
};

export default async function RemboursementPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang) === "ar" ? "ar" : "fr";
  const t = COPY[locale];
  const url = `${BASE}/remboursement-amo-cnss`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        "name": t.heroTitle,
        "url": url,
        "description": t.heroSubtitle,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "dateModified": LAST_UPDATED_ISO,
        "lastReviewed": LAST_UPDATED_ISO,
        "audience": { "@type": "MedicalAudience", "audienceType": "Patient" },
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
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        "mainEntity": t.faqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.homeCrumb, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.crumb, "item": url },
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

          {/* ── Simulateur interactif (outil linkable) ──── */}
          <RemboursementSimulateur locale={locale} />

          {/* ── Sections ────────────────────────────────── */}
          {t.sections.map((s, i) => (
            <section key={i} className="mb-10">
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

          {/* ── FAQ ─────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{t.faqTitle}</h2>
            <div className="space-y-3">
              {t.faqs.map((f, i) => (
                <details key={i} className="card p-4 group">
                  <summary className="font-semibold text-slate-800 cursor-pointer list-none flex items-start justify-between gap-3">
                    <span>{f.q}</span>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                      className="w-4 h-4 mt-1 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </summary>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── Sources ─────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">{t.sourcesTitle}</h2>
            <ul className="space-y-1.5 text-sm">
              {t.sources.map((src, i) => (
                <li key={i}>
                  <a href={src.href} target="_blank" rel="noopener noreferrer nofollow"
                    className="text-primary-700 hover:text-primary-800 underline underline-offset-2">
                    {src.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Disclaimer YMYL ─────────────────────────── */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 mb-10">
            <p className="text-sm font-bold text-amber-800 mb-1">{t.disclaimerTitle}</p>
            <p className="text-sm text-amber-900/80 leading-relaxed">{t.disclaimer}</p>
          </div>

          {/* ── CTA ─────────────────────────────────────── */}
          <section>
            <div
              className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 58%, #047857 100%)" }}
            >
              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{t.ctaTitle}</h2>
                <p className="text-white/75 text-sm mb-7 max-w-md mx-auto leading-relaxed">{t.ctaText}</p>
                <Link href="/praticiens" className="btn-ghost-white px-8 py-3">{t.ctaBtn}</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
