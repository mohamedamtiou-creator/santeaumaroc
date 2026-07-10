// next/link nu (pas LocaleLink) : le Footer est un Server Component avec `locale`
// en prop → hrefs préfixés côté serveur via localeHref, sans îlot client par lien
// (≈20 liens, présents sur CHAQUE page).
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { getDictionary, localeHref, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-xs">
      <span className="text-secondary-500" aria-hidden="true">{icon}</span>
      {label}
    </div>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const f = dict.footer;
  const year = new Date().getFullYear();

  const columns = [
    {
      title: f.cols.findCare,
      links: [
        { href: "/praticiens",  label: f.links.allDoctors },
        { href: "/specialites", label: f.links.bySpecialty },
        { href: "/villes",      label: f.links.byCity },
        { href: "/praticiens",  label: f.links.bookAppt },
      ],
    },
    {
      title: f.cols.establishments,
      links: [
        { href: "/pharmacies",   label: f.links.pharmacies },
        { href: "/cliniques",    label: f.links.clinics },
        { href: "/laboratoires", label: f.links.labs },
        { href: "/medicaments",  label: f.links.medicines },
      ],
    },
    {
      title: f.cols.health,
      links: [
        { href: "/blog",                     label: f.links.blog },
        { href: "/specialites",              label: f.links.specialties },
        { href: "/sante-darija",             label: f.links.darija },
        { href: "/remboursement-amo-cnss",   label: f.links.reimbursement },
        { href: "/observatoire-sante-maroc", label: f.links.observatory },
      ],
    },
    {
      title: f.cols.about,
      links: [
        { href: "/a-propos",                  label: f.links.aboutUs },
        { href: "/tarifs",                    label: f.links.pricing },
        { href: "/contact",                   label: f.links.contact },
        { href: "/presse",                    label: f.links.press },
        { href: "/support",                   label: f.links.support },
        { href: "/charte-editoriale",         label: f.links.editorial },
        { href: "/plan-du-site",              label: f.siteMap },
        { href: "/conditions-utilisation",    label: f.links.cgu },
        { href: "/politique-confidentialite", label: f.links.privacy },
      ],
    },
  ];

  return (
    <footer className="bg-primary-950 text-slate-400 safe-area-bottom">

      {/* ── Bande de confiance ────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <TrustItem
            icon={
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8 1L2 3.5v5C2 12 5 14.5 8 15.5c3-1 6-3.5 6-7v-5L8 1z"/>
                <path d="M5.5 8l1.5 1.5 3.5-3.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            }
            label={f.trust.secure}
          />
          <TrustItem
            icon={
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.354 5.646a.5.5 0 0 0-.708-.708L7 9.586 5.354 7.94a.5.5 0 0 0-.708.708l2 2a.5.5 0 0 0 .708 0l4-4z"/>
              </svg>
            }
            label={f.trust.verified}
          />
          <TrustItem
            icon={
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 5a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1zm0 7.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
            }
            label={f.trust.free}
          />
          <TrustItem
            icon={
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2H1V3zM1 7h14v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7z"/>
              </svg>
            }
            label={f.trust.online}
          />
        </div>
      </div>

      {/* ── Contenu principal ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10">

          {/* Marque */}
          <div>
            <Link href={localeHref(locale, "/")} className="inline-flex items-center mb-4 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950" aria-label={dict.common.home}>
              <Logo className="text-xl select-none" dark gradId="lm-foot" locale={locale} />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              {f.tagline}
            </p>
            <p className="mt-4 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {f.country}
            </p>

            {/* Espace praticien — point d'entrée du parcours pro */}
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-white font-semibold text-sm">{f.practitioner.title}</p>
              <p className="text-xs text-slate-400 mt-1 mb-3">
                {f.practitioner.text}
              </p>
              <Link
                href={localeHref(locale, "/inscription-praticien")}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-400 hover:text-secondary-300 transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="5" r="2.5" />
                  <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5" />
                  <path d="M11 9v3M9.5 10.5h3" />
                </svg>
                {f.practitioner.cta}
              </Link>
              {/* py-1.5 → cible tap ≥ 24 px de haut (WCAG 2.2 target-size) ;
                  slate-300 (et non -400) pour un contraste suffisant sur primary-950. */}
              <Link
                href={localeHref(locale, "/gerer-ma-fiche")}
                className="mt-1 block py-1.5 text-xs text-slate-300 hover:text-secondary-300 transition-colors"
              >
                {f.practitioner.manageCta}
              </Link>
              <Link
                href={localeHref(locale, "/guide-du-medecin")}
                className="block py-1.5 text-xs text-slate-300 hover:text-secondary-300 transition-colors"
              >
                {f.practitioner.guideCta}
              </Link>
              <Link
                href={localeHref(locale, "/badge")}
                className="block py-1.5 text-xs text-slate-300 hover:text-secondary-300 transition-colors"
              >
                {f.practitioner.badgeCta}
              </Link>
            </div>
          </div>

          {/* Colonnes de liens */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.href}-${link.label}`}>
                    <Link
                      href={localeHref(locale, link.href)}
                      className="hover:text-secondary-400 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Numéros d'urgence ─────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-xs font-bold text-white/90 uppercase tracking-widest text-center mb-1.5">
            {f.emergency.title}
          </p>
          <p className="text-xs text-white/90 text-center mb-3">
            {f.emergency.note}
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <a href="tel:141" className="inline-flex items-center gap-1.5 py-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2h3l1.5 3.5-1.75 1.25A9 9 0 0 0 10.25 10.25L11.5 8.5 15 10v3A2 2 0 0 1 13 15C6.925 15 2 10.075 2 4A2 2 0 0 1 4 2z"/>
              </svg>
              <span className="whitespace-nowrap">{f.emergency.samu} · <strong className="text-white tabular-nums">141</strong></span>
            </a>
            <a href="tel:15" className="inline-flex items-center gap-1.5 py-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2h3l1.5 3.5-1.75 1.25A9 9 0 0 0 10.25 10.25L11.5 8.5 15 10v3A2 2 0 0 1 13 15C6.925 15 2 10.075 2 4A2 2 0 0 1 4 2z"/>
              </svg>
              <span className="whitespace-nowrap">{f.emergency.firefighters} · <strong className="text-white tabular-nums">15</strong></span>
            </a>
            {/* 112 : numéro d'urgence universel, joignable depuis tout mobile (même sans carte SIM). */}
            <a href="tel:112" className="inline-flex items-center gap-1.5 py-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="1" width="8" height="14" rx="2"/>
                <path d="M7 12.5h2" strokeLinecap="round"/>
              </svg>
              <span className="whitespace-nowrap">{f.emergency.mobile} · <strong className="text-white tabular-nums">112</strong></span>
            </a>
          </div>
        </div>

        {/* ── Bas de page ───────────────────────────────── */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {year} SantéauMaroc. {f.rights}</p>
          <div className="flex items-center gap-4">
            <Link href={localeHref(locale, "/plan-du-site")} className="hover:text-secondary-400 transition-colors duration-150">
              {f.siteMap}
            </Link>
            <p className="hidden sm:block">{f.directory}</p>
            <LanguageSwitcher locale={locale} variant="dark" />
          </div>
        </div>
      </div>
    </footer>
  );
}
