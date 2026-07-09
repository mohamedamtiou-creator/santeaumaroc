import type { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Connexion — SantéauMaroc",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  callbackUrl?: string;
  redirect?: string;
  reset?: string;
  verified?: string;
  error?: string;
}>;

type StatusBanner = {
  kind: "success" | "error";
  message: string;
} | null;

function getStatusBanner(
  params: { reset?: string; verified?: string; error?: string },
  t: Dictionary["auth"]["login"],
): StatusBanner {
  if (params.verified === "1")
    return { kind: "success", message: t.bannerVerified };
  if (params.reset === "success")
    return { kind: "success", message: t.bannerReset };
  if (params.error)
    return {
      kind: "error",
      message:
        params.error === "invalid-token"
          ? t.bannerInvalidToken
          : decodeURIComponent(params.error),
    };
  return null;
}

const VALUE_PROP_ICONS = [
  (
    <svg key="v0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5" />
      <path d="m12 12 3 3" />
    </svg>
  ),
  (
    <svg key="v1" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="13" rx="1.5" />
      <path d="M2 6.5h12M5.5 1v2M10.5 1v2" />
    </svg>
  ),
  (
    <svg key="v2" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5a5.5 5.5 0 0 1 5.5 5.5c0 4-3 6.5-5.5 7-2.5-.5-5.5-3-5.5-7A5.5 5.5 0 0 1 8 1.5z" />
      <path d="M5.5 8l2 2 3-3" />
    </svg>
  ),
];

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale).auth.login;
  const banner = getStatusBanner(params, t);
  // Support both ?callbackUrl= and legacy ?redirect= (from revendiquer page)
  const callbackUrl = params.callbackUrl ?? params.redirect;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Mobile hero ─────────────────────────────── */}
      <div className="hero-bg lg:hidden px-5 pt-8 pb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary-300 mb-2">{t.eyebrowMobile}</p>
        <h1 className="text-2xl font-bold text-white mb-1.5 leading-snug">
          {t.titleMobile}
        </h1>
        <p className="text-sm text-white/75 leading-relaxed">
          {t.subtitleMobile}
        </p>
      </div>

      {/* ── Main grid ───────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-14 lg:grid lg:grid-cols-[1fr_440px] lg:gap-14 lg:items-center lg:min-h-[calc(100vh-4rem)]">

        {/* ── Left panel (desktop only) ─────────────── */}
        <div className="hidden lg:flex flex-col justify-center">

          <p className="section-eyebrow mb-3">{t.eyebrowDesktop}</p>
          <h2 className="text-[2.4rem] font-bold text-slate-900 leading-tight mb-4">
            {t.titleDesktop1}<br />{t.titleDesktop2}
          </h2>
          <p className="text-slate-600 text-base leading-relaxed max-w-sm mb-10">
            {t.subtitleDesktop}
          </p>

          {/* Value props */}
          <div className="space-y-3.5 mb-10">
            {t.valueProps.map((text, i) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 text-primary-600">
                  {VALUE_PROP_ICONS[i]}
                </div>
                <span className="text-sm text-slate-700 font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Security badge */}
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-3.5 py-2 w-fit">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-secondary-500 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1a5 5 0 0 1 5 5c0 3.5-2.5 6-5 6.5C4.5 12 2 9.5 2 6a5 5 0 0 1 5-5z" />
              <rect x="5" y="6.5" width="4" height="3" rx="0.5" />
              <path d="M7 6.5V5a1 1 0 0 1 2 0" />
            </svg>
            {t.securityBadge}
          </div>
        </div>

        {/* ── Right panel: Form ───────────────────────── */}
        <div>
          <div className="card overflow-hidden p-0 shadow-lg shadow-slate-200/70">
            <div
              className="h-1.5"
              style={{ background: "linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)" }}
            />
            <div className="p-6 sm:p-8">

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900 mb-1">{t.cardTitle}</h1>
                <p className="text-sm text-slate-500">{t.cardSubtitle}</p>
              </div>

              {/* Status banner */}
              {banner && (
                <div
                  className={`mb-5 flex items-start gap-2.5 p-3.5 rounded-xl text-sm ${
                    banner.kind === "success"
                      ? "bg-secondary-50 border border-secondary-200 text-secondary-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                  role="alert"
                >
                  {banner.kind === "success" ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="m5 8 2.5 2.5 3.5-4" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="M8 5.5v3M8 10.5h.01" />
                    </svg>
                  )}
                  {banner.message}
                </div>
              )}

              <LoginForm callbackUrl={callbackUrl} t={t.form} />

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
