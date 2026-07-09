import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/dal";
import { ProfileForm } from "./_components/ProfileForm";
import { PasswordForm } from "./_components/PasswordForm";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Mon profil — SantéauMaroc" };

function UserCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <circle cx="10" cy="8" r="3"/>
      <path d="M3.5 17.5c0-3.31 2.91-6 6.5-6s6.5 2.69 6.5 6"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-slate-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="12" height="9" rx="2"/>
      <path d="M7 9V7a3 3 0 0 1 6 0v2"/>
    </svg>
  );
}

export default async function ProfilPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const t = getDictionary(await getLocale()).dashboard.patient;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="section-eyebrow mb-0.5">{t.eyebrow}</p>
        <h1 className="text-xl font-bold text-slate-900">{t.profileTitle}</h1>
        <div className="mt-3 h-px"
          style={{ background: "linear-gradient(90deg, #bfdbfe 0%, #a7f3d0 60%, transparent 100%)" }} />
      </header>

      {/* Informations personnelles */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
            <UserCircleIcon />
          </div>
          <h2 className="font-semibold text-slate-900">{t.personalInfo}</h2>
        </div>
        <ProfileForm name={user.name} phone={user.phone ?? ""} email={user.email} t={t} />
      </div>

      {/* Changer le mot de passe */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
            <LockIcon />
          </div>
          <h2 className="font-semibold text-slate-900">{t.changePasswordTitle}</h2>
        </div>
        <PasswordForm t={t} />
      </div>
    </div>
  );
}
