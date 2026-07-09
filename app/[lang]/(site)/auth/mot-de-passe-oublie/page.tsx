import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Mot de passe oublié — SantéauMaroc" };

function KeyIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="26" r="10"/>
      <path d="M26.2 19.8 38 8"/>
      <path d="M38 8h4v4"/>
      <path d="M34 12h4"/>
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round">
      <path d="m10 3-5 5 5 5"/>
    </svg>
  );
}

export default async function MotDePasseOubliePage() {
  const t = getDictionary(await getLocale()).auth.forgotPassword;
  return (
    <div className="card p-8">
      {/* Icône + titre */}
      <div className="text-center mb-7">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
          <KeyIcon />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{t.title}</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
          {t.desc}
        </p>
      </div>

      <ForgotPasswordForm t={t.form} />

      <p className="mt-6 text-center text-sm">
        <Link href="/connexion" className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-secondary-700 font-medium hover:underline">
          <ChevronLeftIcon />
          {t.backToLogin}
        </Link>
      </p>
    </div>
  );
}
