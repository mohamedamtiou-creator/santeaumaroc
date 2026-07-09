import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ResetPasswordForm } from "./_components/ResetPasswordForm";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Réinitialisation du mot de passe — SantéauMaroc" };

type ResetT = Dictionary["auth"]["resetPassword"];

type SearchParams = Promise<{ token?: string }>;

async function validateToken(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: token, resetPasswordTokenExpiry: { gt: new Date() } },
    select: { id: true },
  });
  return user !== null;
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 4 6 12v14c0 10 8 16 18 18 10-2 18-8 18-18V12L24 4z"/>
      <path d="m16 24 6 6 10-10"/>
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-amber-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 6 4 42h40L24 6z"/>
      <path d="M24 20v10M24 34h.01"/>
    </svg>
  );
}

export default async function ReinitialiserMotDePassePage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;
  const t = getDictionary(await getLocale()).auth.resetPassword;

  if (!token) return <InvalidToken reason={t.reasonMissing} t={t} />;

  const isValid = await validateToken(token);
  if (!isValid) return <InvalidToken reason={t.reasonInvalid} t={t} />;

  return (
    <div className="card p-8">
      <div className="text-center mb-7">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
          <ShieldIcon />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{t.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {t.desc}
        </p>
      </div>
      <ResetPasswordForm token={token} t={t.form} />
    </div>
  );
}

function InvalidToken({ reason, t }: { reason: string; t: ResetT }) {
  return (
    <div className="card p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
        <AlertTriangleIcon />
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">{t.invalidTitle}</h1>
      <p className="text-slate-500 text-sm mb-7">{reason}</p>
      <div className="flex flex-col gap-3">
        <Link href="/auth/mot-de-passe-oublie" className="btn-primary justify-center py-2.5 text-sm">
          {t.requestNew}
        </Link>
        <Link href="/connexion" className="text-sm text-secondary-600 hover:text-secondary-700 hover:underline">
          {t.backToLogin}
        </Link>
      </div>
    </div>
  );
}
