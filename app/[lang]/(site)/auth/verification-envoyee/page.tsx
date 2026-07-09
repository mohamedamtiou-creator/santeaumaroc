import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Metadata } from "next";
import { ResendVerification } from "./_components/ResendVerification";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Vérifiez votre e-mail — SantéauMaroc",
};

type SearchParams = Promise<{ callbackUrl?: string; email?: string }>;

function MailIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="40" height="28" rx="4"/>
      <path d="M4 15l20 13 20-13"/>
    </svg>
  );
}

export default async function VerificationEnvoyeePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { callbackUrl, email } = await searchParams;
  const dict = getDictionary(await getLocale()).auth;
  const t = dict.verifyEmailSent;

  const loginHref = callbackUrl?.startsWith("/")
    ? `/connexion?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/connexion";

  return (
    <div className="card p-8 text-center">
      {/* Icône */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary-50 flex items-center justify-center">
        <MailIcon />
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-2">
        {t.title}
      </h1>
      <p className="text-slate-500 text-sm mb-1">
        {t.desc}
      </p>
      <p className="text-slate-500 text-xs mb-7">
        {t.expiry}
      </p>

      <Link href={loginHref} className="btn-outline text-sm px-6 py-2.5 inline-flex">
        {t.backToLogin}
      </Link>

      <ResendVerification email={email} t={dict.resend} />
    </div>
  );
}
