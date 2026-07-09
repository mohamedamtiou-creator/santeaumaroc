import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentDoctor } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDoctorInitials } from "@/lib/utils";
import { PraticienProfileForm } from "./_components/PraticienProfileForm";
import { AvatarUpload } from "./_components/AvatarUpload";
import { DashHeader } from "../_components/DashHeader";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Mon profil — SantéauMaroc" };

/* ── Icônes ─────────────────────────────────────────────────── */

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" className="w-3 h-3 shrink-0"
      aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 0.75L0.75 3.25V7c0 2.5 1.9 4.4 5.25 5.25C9.35 11.4 11.25 9.5 11.25 7V3.25z" strokeWidth="1.1"/>
      <path d="M3.75 6.5l1.75 1.75L9.25 4.5" strokeWidth="1.4"/>
    </svg>
  );
}


function IconExternalLink() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 2.5H2.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5"/>
      <path d="M7.5 1.5h5v5M12.5 1.5l-6 6"/>
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z"/>
      <path d="M9.5 4l2.5 2.5"/>
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default async function PraticienProfilPage() {
  const [doctor, specialties, cities] = await Promise.all([
    getCurrentDoctor(),
    prisma.specialty.findMany({
      select:  { id: true, name: true, order: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.city.findMany({
      select:  { id: true, name: true, order: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  if (!doctor) return null;

  const locale = await getLocale();
  const dash = getDictionary(locale).dashboard;
  const tp = dash.praticien;
  const fullName = [doctor.civilite, doctor.prenom, doctor.nom].filter(Boolean).join(" ") || "—";
  const initials = getDoctorInitials(doctor.prenom, doctor.nom);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">

      {/* ── En-tête ──────────────────────────────────── */}
      <DashHeader eyebrow={tp.overviewEyebrow} title={tp.profileTitle} />

      {/* ── Carte identité ───────────────────────────── */}
      <div className="card overflow-hidden p-0">
        {/* Bande de couleur */}
        <div className="h-1"
          style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />

        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">

          {/* Avatar */}
          <div className="shrink-0">
            <AvatarUpload
              currentAvatar={doctor.avatar ?? null}
              initials={initials}
              fullName={fullName}
              t={tp}
            />
          </div>

          {/* Résumé du profil */}
          <div className="flex flex-col gap-3 flex-1 min-w-0 text-center sm:text-start">

            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{fullName}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {doctor.specialty.name}
                <span className="mx-1.5 text-slate-300">·</span>
                {doctor.city.name}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {doctor.isVerified && (
                <span className="badge-verified">
                  <ShieldCheckIcon />
                  {dash.verifiedDoctor}
                </span>
              )}
              {doctor.isActive ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full text-white shadow-sm bg-secondary-500">
                  <svg viewBox="0 0 6 6" className="w-1.5 h-1.5 shrink-0" aria-hidden="true">
                    <circle cx="3" cy="3" r="3" fill="white" fillOpacity="0.8"/>
                  </svg>
                  {tp.activeBadge}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full text-slate-500 shadow-sm bg-slate-200">
                  <svg viewBox="0 0 6 6" className="w-1.5 h-1.5 shrink-0" aria-hidden="true">
                    <circle cx="3" cy="3" r="3" fill="#94a3b8"/>
                  </svg>
                  {tp.inactiveBadge}
                </span>
              )}
            </div>

            {/* Lien profil public */}
            {doctor.slug && (
              <div className="flex justify-center sm:justify-start">
                <Link
                  href={`/praticiens/${doctor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  <IconExternalLink />
                  {tp.viewPublic}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Carte formulaire ─────────────────────────── */}
      <div className="card p-5 sm:p-6">

        {/* En-tête de la carte */}
        <div className="flex items-start gap-3 mb-7">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
            <IconEdit />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{tp.editProfile}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {tp.editProfileDesc}
            </p>
          </div>
        </div>

        <PraticienProfileForm
          praticien={{ ...doctor, prix: doctor.prix ? doctor.prix.toNumber() : null }}
          specialties={specialties}
          cities={cities}
          locale={locale}
          t={tp}
        />
      </div>
    </div>
  );
}
