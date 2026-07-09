import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { LeadForm } from "./_components/LeadForm";

export const metadata: Metadata = {
  title: "Demande d'activation — SantéauMaroc",
  // Étape de tunnel → non indexable
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ offre?: string; cycle?: string }>;

export default async function ActiverPage({ searchParams }: { searchParams: SearchParams }) {
  const { offre, cycle } = await searchParams;
  const plan: "PRO" | "CABINET" = offre?.toLowerCase() === "cabinet" ? "CABINET" : "PRO";
  const billing: "MONTHLY" | "ANNUAL" | null =
    plan === "PRO" ? (cycle?.toLowerCase() === "annuel" ? "ANNUAL" : "MONTHLY") : null;

  const locale = await getLocale();
  const t = getDictionary(locale).tarifs.lead;

  const session = await tryGetSession();
  const user = session?.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true, phone: true },
      })
    : null;

  const planLabel = plan === "PRO" ? t.planPro : t.planCabinet;
  const billingLabel = billing === "ANNUAL" ? t.billingAnnual : t.billingMonthly;

  return (
    <div className="page-outer max-w-2xl">

      {/* Retour */}
      <Link href="/tarifs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-6">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
        {t.backToPlans}
      </Link>

      {/* En-tête */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {t.title.replace("{plan}", planLabel)}
        </h1>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">{t.subtitle}</p>
      </header>

      {/* Récap offre */}
      <div className="card p-4 mb-5 flex items-center gap-4 bg-gradient-to-b from-secondary-50/50 to-white border-secondary-100">
        <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 16.3 4.7 18.6l.9-5.3L1.7 9.5l5.4-.8L10 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-700">{t.recapPlan}</p>
          <p className="text-sm font-bold text-slate-900">{planLabel}</p>
        </div>
        {billing && (
          <div className="text-end shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.recapBilling}</p>
            <p className="text-sm font-semibold text-slate-700">{billingLabel}</p>
          </div>
        )}
      </div>

      <LeadForm
        plan={plan}
        billing={billing}
        t={t}
        defaults={{ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" }}
      />
    </div>
  );
}
