import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { NavSearch } from "./NavSearch";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AuthCta } from "./AuthCta";

// Composant serveur statique : la locale vient du segment [lang] (prop), l'état
// d'auth est résolu côté client (AuthCta / MobileMenu) → aucune lecture
// cookie/header ici, le chrome reste pré-rendable.
export function Navbar({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.nav;

  // Liens primaires (affichés à plat sur desktop, listés dans le menu mobile).
  const primaryLinks = [
    { href: "/praticiens", label: t.doctors },
    { href: "/questions",  label: t.questions },
    { href: "/blog",       label: t.blog },
  ];

  // Options du CTA d'inscription (partagées desktop / mobile).
  const signupOptions = [
    { href: "/inscription",            ...dict.signup.patient },
    { href: "/inscription-praticien",  ...dict.signup.practitioner },
  ];

  return (
    <header
      className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50"
      style={{ boxShadow: "0 1px 0 0 rgb(0 0 0 / 0.06)" }}
    >
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">

        {/* ── Logo ───────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center shrink-0 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label={dict.common.home}
        >
          <Logo className="text-xl select-none" gradId="lm-nav" textClassName="hidden sm:inline-flex" locale={locale} />
        </Link>

        {/* ── Recherche persistante (action principale) ─ */}
        <div className="flex-1 flex justify-center min-w-0">
          <NavSearch placeholder={t.searchPlaceholder} buttonLabel={t.searchButton} />
        </div>

        {/* ── Navigation desktop ──────────────────── */}
        <div className="hidden lg:flex items-center gap-1 text-sm font-medium shrink-0">
          <NavLink href="/praticiens" label={t.doctors} />
          <NavLink href="/questions" label={t.questions} />
          <NavLink href="/blog" label={t.blog} />
        </div>

        {/* ── Actions ─────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <LanguageSwitcher locale={locale} />
          </div>

          <MobileMenu
            primaryLinks={primaryLinks}
            signupOptions={signupOptions}
            t={t}
          />

          <AuthCta
            t={{ login: t.login, mySpace: t.mySpace, signup: t.signup }}
            signupOptions={signupOptions}
          />
        </div>
      </nav>
    </header>
  );
}
