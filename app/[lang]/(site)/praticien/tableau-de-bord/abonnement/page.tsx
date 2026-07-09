import type { Metadata } from "next";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { formatAmount } from "@/features/subscription/plans";
import { StartTrialButton } from "./_components/StartTrialButton";
import { DashHeader } from "../_components/DashHeader";
import { Pagination } from "@/components/ui/Pagination";
import { parsePage, totalPages, buildPageUrl } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Mon abonnement — SantéauMaroc",
  robots: { index: false, follow: false },
};

const DAY = 86_400_000;
const ORDERS_PER_PAGE = 10;

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId } = await verifySession();
  const { page, skip, take } = parsePage((await searchParams).page, ORDERS_PER_PAGE);

  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: {
      id: true,
      plan: true,
      planActivatedAt: true,
      planExpiresAt: true,
      featuredUntil: true,
      trialEndsAt: true,
      trialUsedAt: true,
    },
  });
  if (!doctor) return null;

  const [orders, ordersTotal] = await Promise.all([
    prisma.subscriptionOrder.findMany({
      where: { doctorId: doctor.id },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        reference: true,
        status: true,
        amount: true,
        currency: true,
        billing: true,
        featured: true,
        createdAt: true,
      },
    }),
    prisma.subscriptionOrder.count({ where: { doctorId: doctor.id } }),
  ]);
  const ordersPages = totalPages(ordersTotal, ORDERS_PER_PAGE);

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const sub = dict.dashboard.praticien.sub;
  const tp = dict.dashboard.praticien;
  const fmtDate = (d: Date) =>
    d.toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const now = new Date().getTime();
  const isPro = doctor.plan === "PRO";
  const activated = doctor.planActivatedAt?.getTime() ?? null;
  const expires = doctor.planExpiresAt?.getTime() ?? null;
  const featuredActive = !!(doctor.featuredUntil && doctor.featuredUntil.getTime() > now);
  const daysLeft = expires ? Math.max(0, Math.ceil((expires - now) / DAY)) : null;
  const expiringSoon = !!(isPro && expires && expires > now && expires - now <= 30 * DAY);

  let progress = 0;
  if (isPro && expires && activated && expires > activated) {
    progress = Math.min(100, Math.max(0, Math.round(((now - activated) / (expires - activated)) * 100)));
  }

  // Essai gratuit Pro
  const trialEndsMs = doctor.trialEndsAt?.getTime() ?? null;
  const trialStartMs = doctor.trialUsedAt?.getTime() ?? null;
  const trialActive = !isPro && !!trialEndsMs && trialEndsMs > now;
  const trialUsed = !!doctor.trialUsedAt;
  const trialEligible = !isPro && !trialActive && !trialUsed;
  const trialDaysLeft = trialActive && trialEndsMs ? Math.max(0, Math.ceil((trialEndsMs - now) / DAY)) : 0;
  const trialProgress =
    trialActive && trialStartMs && trialEndsMs && trialEndsMs > trialStartMs
      ? Math.min(100, Math.max(0, Math.round(((now - trialStartMs) / (trialEndsMs - trialStartMs)) * 100)))
      : 0;

  const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
    PENDING: { label: sub.statusPending, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    SUBMITTED: { label: sub.statusSubmitted, cls: "bg-primary-50 text-primary-700 border-primary-200" },
    VERIFIED: { label: sub.statusVerified, cls: "bg-secondary-50 text-secondary-700 border-secondary-200" },
    REJECTED: { label: sub.statusRejected, cls: "bg-red-50 text-red-600 border-red-200" },
    CANCELLED: { label: sub.statusCancelled, cls: "bg-slate-100 text-slate-500 border-slate-200" },
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <DashHeader eyebrow={tp.overviewEyebrow} title={sub.myTitle} />

      {/* Bannière « expire bientôt » */}
      {expiringSoon && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3" role="alert">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v4M10 13.5h.01" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{sub.expiringSoon}</p>
            <p className="text-xs text-amber-700 mt-0.5 mb-3">{sub.expiringSoonDesc}</p>
            <Link href="/tarifs/souscrire?renew=1&cycle=annuel" className="btn-secondary py-2 text-xs">
              {sub.renew}
            </Link>
          </div>
        </div>
      )}

      {/* Carte formule actuelle */}
      <div className="card overflow-hidden p-0">
        <div className="h-1" style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{sub.currentPlan}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {isPro ? "Pro" : trialActive ? "Pro" : sub.planFree}
                </span>
                {trialActive && <span className="badge-primary">{sub.trialBadge}</span>}
                {featuredActive && (
                  <span className="badge-accent">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                      <path d="M8 1l2 4 4.5.5-3.3 3 1 4.5L8 11l-4.2 2 1-4.5-3.3-3L6 5z" />
                    </svg>
                    {sub.premiumBadge}
                  </span>
                )}
              </div>
            </div>
            {!isPro && !trialActive && (
              <Link href="/tarifs/souscrire?cycle=annuel" className="btn-secondary py-2 text-xs shrink-0">
                {sub.upgradePro}
              </Link>
            )}
          </div>

          {isPro ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">{sub.startDate}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {doctor.planActivatedAt ? fmtDate(doctor.planActivatedAt) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{sub.expiryDate}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {doctor.planExpiresAt ? fmtDate(doctor.planExpiresAt) : sub.noExpiry}
                  </p>
                </div>
              </div>

              {daysLeft !== null && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">
                      {daysLeft > 0 ? sub.daysLeft.replace("{n}", String(daysLeft)) : sub.expired}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background:
                          daysLeft <= 30
                            ? "linear-gradient(90deg,#f59e0b,#d97706)"
                            : "linear-gradient(90deg,#2563eb,#059669)",
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/tarifs/souscrire?renew=1&cycle=annuel" className="btn-secondary py-2 text-xs">
                  {sub.renew}
                </Link>
                <Link href="/tarifs/souscrire?cycle=mensuel" className="btn-outline py-2 text-xs">
                  {sub.changeOffer}
                </Link>
              </div>
            </>
          ) : trialActive ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">
                    {sub.trialDaysLeft.replace("{n}", String(trialDaysLeft))}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">{trialProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${trialProgress}%`, background: "linear-gradient(90deg,#2563eb,#059669)" }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {sub.expiryDate} : {doctor.trialEndsAt ? fmtDate(doctor.trialEndsAt) : "—"}
              </p>
              <Link href="/tarifs/souscrire?cycle=annuel" className="btn-secondary py-2 text-xs self-start">
                {sub.trialConvertCta}
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500">{sub.planFreeDesc}</p>
              {trialUsed && <p className="text-xs text-slate-400">{sub.trialEndedNote}</p>}
            </>
          )}
        </div>
      </div>

      {/* Essai gratuit — éligible (jamais utilisé) */}
      {trialEligible && (
        <div className="card p-5 flex items-start gap-4 border border-secondary-200 bg-secondary-50/40">
          <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v4M10 14v4M2 10h4M14 10h4" />
              <circle cx="10" cy="10" r="3" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">{sub.trialCtaTitle}</p>
            <p className="text-xs text-slate-600 mt-0.5 mb-3">{sub.trialCtaDesc}</p>
            <StartTrialButton label={sub.trialStart} />
          </div>
        </div>
      )}

      {/* Upsell Premium */}
      {isPro && !featuredActive && (
        <div className="card p-5 flex items-start gap-4 border border-accent-200 bg-accent-50/40">
          <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path d="M10 1l2.5 5 5.5.7-4 3.7 1 5.6L10 13.8 5 16l1-5.6-4-3.7 5.5-.7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">{sub.upsellFeaturedTitle}</p>
            <p className="text-xs text-slate-600 mt-0.5 mb-3">{sub.upsellFeaturedDesc}</p>
            <Link href="/tarifs/souscrire?cycle=annuel&featured=1" className="btn-primary py-2 text-xs">
              {sub.upsellFeaturedCta}
            </Link>
          </div>
        </div>
      )}

      {/* Historique */}
      <div className="card p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{sub.history}</h2>
        {ordersTotal === 0 ? (
          <p className="text-sm text-slate-500">{sub.noHistory}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {orders.map((o) => {
              const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.PENDING;
              return (
                <li key={o.reference} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 font-mono">{o.reference}</p>
                    <p className="text-xs text-slate-500">
                      {fmtDate(o.createdAt)} · {formatAmount(o.amount, o.currency)} ·{" "}
                      {o.billing === "ANNUAL" ? sub.cycleAnnual : sub.cycleMonthly}
                      {o.featured ? ` + ${sub.premiumBadge}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>
                      {st.label}
                    </span>
                    {o.status === "VERIFIED" ? (
                      <Link
                        href={`/praticien/tableau-de-bord/abonnement/${o.reference}/facture`}
                        className="text-xs font-semibold text-primary-700 hover:underline"
                      >
                        {sub.invoice}
                      </Link>
                    ) : (
                      <Link
                        href={`/praticien/tableau-de-bord/abonnement/${o.reference}`}
                        className="text-xs font-semibold text-primary-700 hover:underline"
                      >
                        {sub.viewOrder}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination
          page={page}
          totalPages={ordersPages}
          buildUrl={buildPageUrl("/praticien/tableau-de-bord/abonnement", { page: String(page) })}
          t={dict.pagination}
        />
      </div>
    </div>
  );
}
