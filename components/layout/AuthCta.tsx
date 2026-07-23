"use client";

import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { SignupMenu } from "./SignupMenu";
import { useHasSession } from "./useHasSession";

type SignupOption = { href: string; label: string; description: string };

type Props = {
  t: { login: string; mySpace: string; signup: string };
  signupOptions: SignupOption[];
};

/**
 * CTA d'auth du chrome desktop. Client : lit l'indice de session pour afficher
 * « Mon espace » (connecté) ou « Connexion » + menu d'inscription (déconnecté).
 * Permet au layout de rester statique (aucune lecture de cookie côté serveur).
 */
export function AuthCta({ t, signupOptions }: Props) {
  const hasSession = useHasSession();

  if (hasSession) {
    return (
      <Link href="/mon-espace" className="btn-primary text-sm py-2 px-4">
        {t.mySpace}
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/connexion"
        className="hidden sm:block text-sm font-medium text-slate-600 hover:text-primary-700 px-3 py-2 transition-colors"
      >
        {t.login}
      </Link>
      <SignupMenu label={t.signup} options={signupOptions} />
    </>
  );
}
