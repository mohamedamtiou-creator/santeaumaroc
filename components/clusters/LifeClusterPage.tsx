import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { getDictionary, type Locale } from "@/lib/i18n";
import { CLUSTERS, type ClusterSlug } from "@/lib/life-clusters";
import { getClusterContent } from "@/lib/life-clusters-content";
import { getCluster, type ClusterEntry } from "@/lib/life-clusters-query";
import { getToolContent } from "@/lib/tools-content";
import { HubHero } from "@/components/health/HubHero";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { ToolIcon } from "@/components/outils/ToolIcon";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

/**
 * Gabarit unique des quatre hubs « parcours de vie ». Les pages de route ne font
 * que passer leur slug : toute la mise en forme vit ici, pour que les quatre
 * dossiers restent cohérents et n'aient qu'un seul endroit à faire évoluer.
 *
 * Server component : une seule résolution mise en cache par cluster et par
 * locale, et aucun JavaScript envoyé au navigateur — la page est une page de
 * navigation, pas une application.
 */

/** Le pictogramme dépend du type de contenu, pas de son sujet. */
function KindIcon({ kind }: { kind: Exclude<ClusterEntry["kind"], "tool"> }) {
  const paths = {
    topic: <><circle cx="8" cy="8" r="6.5" /><path d="M8 5.2v.01M8 7.4v3.4" /></>,
    exam: <><path d="M4.5 2.5h7v11h-7z" /><path d="M6.5 5.5h3M6.5 8h3M6.5 10.5h2" /></>,
    treatment: <><rect x="2" y="6" width="12" height="4" rx="2" /><path d="M8 6v4" /></>,
    post: <><path d="M3.5 2.5h6l3 3v8h-9z" /><path d="M9.5 2.5v3h3" /></>,
  } as const;
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      {paths[kind]}
    </svg>
  );
}

export async function LifeClusterPage({ slug, locale }: { slug: ClusterSlug; locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.clusters;
  const cluster = CLUSTERS[slug];
  const content = getClusterContent(slug, locale);
  const { sections, specialties, cities, contentCount } = await getCluster(slug, locale);

  const path = `/${slug}`;
  const abs = (p: string) => `${locale === "ar" ? `${BASE}/ar` : BASE}${p}`;
  const reviewedDate = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(cluster.reviewed));

  const mainSpecialty = specialties[0] ?? null;

  // Liste plate de tout ce que le dossier relie — sert l'ItemList JSON-LD et
  // signale aux moteurs que la page est un carrefour, non un contenu concurrent.
  const flatItems = sections.flatMap((s) =>
    s.entries.map((e) =>
      e.kind === "tool"
        ? { name: getToolContent(e.slug, locale).name, url: abs(`/outils/${e.slug}`) }
        : { name: e.item.label, url: abs(e.item.href) },
    ),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${abs(path)}#page`,
        "name": content.h1,
        "description": content.metaDesc,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}#website` },
        "lastReviewed": cluster.reviewed,
        "reviewedBy": { "@type": "Organization", "name": "Rédaction médicale SantéauMaroc", "url": BASE },
        "audience": { "@type": "MedicalAudience", "audienceType": "Patient" },
        ...(mainSpecialty && { "about": { "@type": "MedicalSpecialty", "name": mainSpecialty.name } }),
        "significantLink": flatItems.slice(0, 25).map((i) => i.url),
      },
      {
        "@type": "ItemList",
        "itemListElement": flatItems.map((item, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": item.name,
          "url": item.url,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": content.name, "item": abs(path) },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <HubHero
        eyebrow={t.eyebrow}
        title={content.h1}
        intro={content.intro}
        countChip={t.count.replace("{n}", String(contentCount))}
        chips={dict.healthHub}
      />

      <div className="page-outer">
        <div className="max-w-4xl mx-auto">
          {/* Cadrage éditorial — le seul contenu propre au hub */}
          <section aria-labelledby="cluster-editorial" className="mb-10 rounded-2xl border border-secondary-200 bg-secondary-50/50 p-5 sm:p-6">
            <h2 id="cluster-editorial" className="text-base font-bold text-slate-900 mb-2" dir="auto">
              {content.editorialTitle}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed" dir="auto">{content.editorialBody}</p>
            <p className="mt-3 text-xs text-slate-500">{t.updatedOn.replace("{date}", reviewedDate)}</p>
          </section>

          {/* Le parcours, section par section */}
          {sections.map((section) => {
            const sc = content.sections[section.key];
            if (!sc) return null;
            return (
              <section key={section.key} aria-labelledby={`sec-${section.key}`} className="mb-10">
                <h2 id={`sec-${section.key}`} className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight" dir="auto">
                  {sc.title}
                </h2>
                <p className="mt-1.5 mb-4 text-slate-600 leading-relaxed" dir="auto">{sc.lead}</p>

                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {section.entries.map((entry) => {
                    if (entry.kind === "tool") {
                      const tool = getToolContent(entry.slug, locale);
                      return (
                        <li key={`tool-${entry.slug}`}>
                          <Link
                            href={`/outils/${entry.slug}`}
                            className="group flex h-full items-center gap-3 rounded-xl border border-primary-200 bg-primary-50/40 px-4 py-3 transition-all hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                            dir="auto"
                          >
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 ring-1 ring-primary-100">
                              <ToolIcon slug={entry.slug} className="w-4 h-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[11px] font-bold uppercase tracking-wider text-primary-600">
                                {t.kinds.tool}
                              </span>
                              <span className="block font-semibold text-slate-900 leading-snug group-hover:text-primary-700">
                                {tool.name}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    }

                    return (
                      <li key={`${entry.kind}-${entry.item.slug}`}>
                        <Link
                          href={entry.item.href}
                          className="group flex h-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:border-secondary-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2"
                          dir="auto"
                        >
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:text-secondary-600">
                            <KindIcon kind={entry.kind} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              {t.kinds[entry.kind]}
                            </span>
                            <span className="block font-semibold text-slate-900 leading-snug group-hover:text-secondary-700">
                              {entry.item.label}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {/* Conversion : le bon professionnel */}
          {specialties.length > 0 && (
            <section aria-labelledby="cluster-specialties" className="mb-10 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 sm:p-6">
              <h2 id="cluster-specialties" className="text-lg font-bold text-slate-900">{t.specialtiesTitle}</h2>
              <p className="text-sm text-slate-500 mt-0.5 mb-4">{t.specialtiesLead}</p>
              <div className="flex flex-wrap gap-2.5">
                {specialties.map((s, i) => (
                  <Link
                    key={s.slug}
                    href={`/specialites/${s.slug}`}
                    className={i === 0
                      ? "btn-primary"
                      : "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"}
                    dir="auto"
                  >
                    {t.seeSpecialty.replace("{specialty}", s.plural)}
                    {i === 0 && (
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Villes : combos spécialité × ville (déjà indexables) */}
          {mainSpecialty && cities.length > 0 && (
            <section aria-labelledby="cluster-cities" className="mb-10">
              <h2 id="cluster-cities" className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3" dir="auto">
                {t.citiesTitle.replace("{specialty}", mainSpecialty.plural)}
              </h2>
              <ul className="flex flex-wrap gap-2.5">
                {cities.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/specialites/${cluster.citySpecialtySlug}/${c.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      dir="auto"
                    >
                      {c.name}
                      <span className="text-xs font-semibold text-slate-400 tabular-nums">{c.doctors}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <BlogFaq items={content.faq} t={dict.blog} />

          {/* Maillage horizontal entre dossiers + entrée du cluster outils */}
          <section aria-labelledby="cluster-siblings" className="mt-12 pt-8 border-t border-slate-100">
            <h2 id="cluster-siblings" className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
              {t.siblingsTitle}
            </h2>
            <ul className="flex flex-wrap gap-2.5">
              {cluster.siblingSlugs.map((sibling) => (
                <li key={sibling}>
                  <Link
                    href={`/${sibling}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:border-secondary-300 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
                    dir="auto"
                  >
                    {getClusterContent(sibling, locale).name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/outils"
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/50 px-3.5 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {t.allTools}
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m4 2 4 4-4 4" /></svg>
                </Link>
              </li>
            </ul>
          </section>

          <p className="mt-10 text-xs text-slate-400 leading-relaxed" dir="auto">{t.disclaimer}</p>
        </div>
      </div>
    </>
  );
}
