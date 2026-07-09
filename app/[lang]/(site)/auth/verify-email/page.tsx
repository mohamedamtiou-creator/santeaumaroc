import { redirect } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Metadata } from "next";
import { verifyEmail } from "@/features/auth/actions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Vérification e-mail — SantéauMaroc",
};

type SearchParams = Promise<{ token?: string; callbackUrl?: string }>;

function StatusCard({
  kind,
  title,
  message,
  signIn,
  newSignup,
}: {
  kind: "success" | "error";
  title: string;
  message: string;
  signIn: string;
  newSignup: string;
}) {
  const isSuccess = kind === "success";

  return (
    <div className="card p-8 text-center">
      <div
        className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center ${
          isSuccess ? "bg-secondary-50" : "bg-red-50"
        }`}
      >
        {isSuccess ? (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-8 h-8 text-secondary-600"
            aria-hidden="true"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="20" cy="20" r="16" />
            <path d="M12 20.5l5.5 5.5L28 14" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-8 h-8 text-red-500"
            aria-hidden="true"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="20" cy="20" r="16" />
            <path d="M20 13v8M20 27h.01" />
          </svg>
        )}
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-500 text-sm mb-7 leading-relaxed max-w-xs mx-auto">
        {message}
      </p>

      {isSuccess ? (
        <Link href="/connexion?verified=1" className="btn-secondary px-8 py-2.5">
          {signIn}
        </Link>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/inscription" className="btn-outline px-6 py-2.5 text-sm">
            {newSignup}
          </Link>
          <Link href="/connexion" className="btn-secondary px-6 py-2.5 text-sm">
            {signIn}
          </Link>
        </div>
      )}
    </div>
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token, callbackUrl } = await searchParams;
  const t = getDictionary(await getLocale()).auth.verifyEmail;

  if (!token) {
    return (
      <StatusCard
        kind="error"
        title={t.invalidTitle}
        message={t.invalidMsg}
        signIn={t.signIn}
        newSignup={t.newSignup}
      />
    );
  }

  const result = await verifyEmail(token);

  if (result.success) {
    const dest = callbackUrl?.startsWith("/")
      ? `/connexion?verified=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/connexion?verified=1";
    redirect(dest);
  }

  return (
    <StatusCard
      kind="error"
      title={t.expiredTitle}
      message={result.error ?? t.expiredMsg}
      signIn={t.signIn}
      newSignup={t.newSignup}
    />
  );
}
