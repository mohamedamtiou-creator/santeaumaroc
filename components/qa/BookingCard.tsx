import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import type { Dictionary, Locale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { getDoctorInitials, formatDoctorName, formatDoctorShortName, hasReliableRating } from "@/lib/utils";

type QaT = Dictionary["qa"];

export type BookingDoctor = {
  slug: string;
  nom: string | null;
  prenom: string | null;
  civilite: string | null;
  avatar: string | null;
  isVerified: boolean;
  isPro: boolean;
  specialtyName: string;
  cityName: string;
  averageRating: number;
  reviewCount: number;
};

/**
 * Bloc de conversion : invite à consulter le médecin qui a répondu.
 * Affiché en sidebar (sticky) sur desktop et en ligne sur mobile.
 */
export function BookingCard({ doctor, t, locale }: { doctor: BookingDoctor; t: QaT; locale: Locale }) {
  const name = formatDoctorName(doctor);
  return (
    <section className="card p-5" aria-labelledby="booking-title">
      <p id="booking-title" className="section-eyebrow mb-3">{t.bookingTitle}</p>
      <div className="flex items-center gap-3">
        {doctor.avatar ? (
          <Image src={doctor.avatar} alt={name} width={52} height={52} className="w-13 h-13 rounded-full object-cover shrink-0" style={{ width: 52, height: 52 }} />
        ) : (
          <div className="avatar-ring w-13 h-13 shrink-0" style={{ width: 52, height: 52 }}>
            <div className="avatar-ring-inner grid place-items-center bg-primary-50 text-primary-700 font-bold">{getDoctorInitials(doctor.prenom, doctor.nom)}</div>
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-slate-900 leading-tight flex items-center gap-2 flex-wrap">
            <Link href={`/praticiens/${doctor.slug}`} className="hover:text-primary-700">{name}</Link>
            {doctor.isPro && <span className="inline-flex items-center rounded-md bg-accent-50 text-accent-700 border border-accent-200 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide">PRO</span>}
          </p>
          <p className="text-[13px] text-slate-500 mt-0.5">{tSpecialty(doctor.specialtyName, locale)}{doctor.cityName ? ` · ${doctor.cityName}` : ""}</p>
          <p className="mt-1 flex items-center gap-2 text-xs">
            {doctor.isVerified && (
              <span className="badge-verified text-[11px]"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true"><path d="m4 8 3 3 5-6" /></svg>{t.verifiedBadge}</span>
            )}
            {hasReliableRating(doctor.averageRating, doctor.reviewCount) && <span className="text-accent-600 font-semibold">★ {doctor.averageRating.toFixed(1)}</span>}
          </p>
        </div>
      </div>
      <Link href={`/praticiens/${doctor.slug}`} className="btn-primary w-full justify-center mt-4 py-2.5 text-sm">
        {t.ctaWithDoctor.replace("{doctor}", formatDoctorShortName(doctor))}
      </Link>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5 2.5 4v3.5c0 3 2.3 5.3 5.5 6.5 3.2-1.2 5.5-3.5 5.5-6.5V4L8 1.5z" /></svg>
        {t.bookingReassure}
      </p>
    </section>
  );
}
