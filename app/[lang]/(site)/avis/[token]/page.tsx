import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getDoctorInitials } from "@/lib/utils";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { TokenReviewForm } from "./_components/TokenReviewForm";

type Params = Promise<{ token: string }>;

// Lien privé envoyé par e-mail : ne jamais indexer.
export const metadata: Metadata = {
  title: "Donner mon avis — SantéauMaroc",
  robots: { index: false, follow: false },
};

export default async function ReviewByTokenPage({ params }: { params: Params }) {
  const { token } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.review;
  const L = t.landing;

  const appt = token
    ? await prisma.appointment.findUnique({
        where: { reviewToken: token },
        select: {
          patientId: true,
          doctorId: true,
          doctor: {
            select: {
              slug: true, civilite: true, prenom: true, nom: true, avatar: true,
              specialty: { select: { name: true } },
              city:      { select: { name: true } },
            },
          },
        },
      })
    : null;

  /* ── Lien invalide / expiré ─────────────────────────────── */
  if (!appt) {
    return (
      <div className="page-outer">
        <div className="max-w-md mx-auto card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.6" className="w-7 h-7" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16v.5" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900">{L.invalidTitle}</h1>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{L.invalidText}</p>
          <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-100 transition-colors">
            {L.backHome}
          </Link>
        </div>
      </div>
    );
  }

  const d = appt.doctor;
  const fullName = [d.civilite, d.prenom, d.nom].filter(Boolean).join(" ") || dict.doctor.fallbackName;

  // Pré-remplissage si le patient a déjà un avis pour ce médecin.
  const existing = await prisma.review.findUnique({
    where:  { patientId_doctorId: { patientId: appt.patientId, doctorId: appt.doctorId } },
    select: { rating: true, comment: true },
  });

  return (
    <div className="page-outer">
      <div className="max-w-md mx-auto">
        <div className="card overflow-hidden p-0">
          {/* Bandeau */}
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />

          <div className="p-5 sm:p-6">
            {/* Médecin */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center shrink-0">
                {d.avatar ? (
                  <Image src={d.avatar} alt={`Photo de ${fullName}`} width={56} height={56} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary-700 font-bold text-lg select-none" aria-hidden="true">
                    {getDoctorInitials(d.prenom, d.nom)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary-600">{L.eyebrow}</p>
                <h1 className="text-base font-bold text-slate-900 leading-tight truncate">{fullName}</h1>
                <p className="text-xs text-slate-500 truncate">
                  {tSpecialty(d.specialty.name, locale)} · {d.city.name}
                </p>
              </div>
            </div>

            {/* Intro */}
            <div className="mt-5">
              <h2 className="text-lg font-bold text-slate-900">{L.title}</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{L.intro}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-secondary-700 bg-secondary-50 border border-secondary-100 rounded-full px-2.5 py-1">
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0" aria-hidden="true">
                  <path d="M6 0.75L0.75 3.25V7c0 2.5 1.9 4.4 5.25 5.25C9.35 11.4 11.25 9.5 11.25 7V3.25z" fill="rgba(5,150,105,.18)" stroke="#059669" strokeWidth="1.1" strokeLinejoin="round" />
                  <path d="M3.75 6.5l1.75 1.75L9.25 4.5" stroke="#059669" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {L.verifiedNote}
              </p>
            </div>

            {/* Formulaire */}
            <div className="mt-5">
              <TokenReviewForm token={token} doctorSlug={d.slug} existing={existing} t={t} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
