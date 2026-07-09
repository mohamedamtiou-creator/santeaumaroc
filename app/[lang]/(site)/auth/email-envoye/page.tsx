import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "E-mail envoyé — SantéauMaroc",
};

function MailSentIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="40" height="28" rx="4"/>
      <path d="M4 15l20 13 20-13"/>
      <path d="M34 4l6 6-6 6"/>
      <path d="M40 10H28"/>
    </svg>
  );
}

export default async function EmailEnvoyePage() {
  const t = getDictionary(await getLocale()).auth.emailSent;
  return (
    <div className="card p-8 text-center">
      {/* Icône */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
        <MailSentIcon />
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

      <Link href="/connexion" className="btn-outline text-sm px-6 py-2.5 inline-flex">
        {t.backToLogin}
      </Link>
    </div>
  );
}
