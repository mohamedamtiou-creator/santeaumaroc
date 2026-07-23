import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { getContributorUser } from "@/lib/dal";
import { isVerifiedAuthor, AUTHOR_STATUS } from "@/lib/contributor";
import { toLocale } from "@/lib/i18n";
import { espaceContent } from "@/lib/espace-content";

export const metadata: Metadata = {
  title: "Espace auteur — SantéauMaroc",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/espace-auteur", key: "dashboard" as const },
  { href: "/espace-auteur/articles", key: "articles" as const },
  { href: "/espace-auteur/articles/nouveau", key: "newArticle" as const },
  { href: "/espace-auteur/profil", key: "profile" as const },
  { href: "/espace-auteur/verification", key: "verification" as const },
  { href: "/espace-auteur/notifications", key: "notifications" as const },
];

export default async function EspaceAuteurLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const t = espaceContent(locale);
  const user = await getContributorUser();
  const verified = isVerifiedAuthor(user.authorStatus);
  const pending = user.authorStatus === AUTHOR_STATUS.PENDING;

  return (
    <main className="page-outer">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">{t.eyebrow}</p>
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {user.doctorProfile && (
              <Link href="/praticien/tableau-de-bord" className="text-sm font-medium text-primary-700 hover:text-primary-800 hover:underline">
                {locale === "ar" ? "فضاء الممارس ←" : "Espace praticien →"}
              </Link>
            )}
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${verified ? "bg-secondary-50 text-secondary-700" : pending ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
              {verified ? t.status.verified : pending ? t.status.pending : t.status.unverified}
            </span>
          </div>
        </div>

        <nav className="flex flex-wrap gap-1 border-b border-slate-200 mb-6 -mx-1" aria-label={t.eyebrow}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-700 rounded-lg hover:bg-slate-50">
              {t.nav[n.key]}
            </Link>
          ))}
        </nav>

        {!verified && !pending && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 mb-6">
            {t.banner}{" "}
            <Link href="/espace-auteur/verification" className="underline font-semibold">{t.bannerCta}</Link>
          </div>
        )}

        {children}
      </div>
    </main>
  );
}
