import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { formatAmount } from "@/features/subscription/plans";
import { getBankDetails } from "@/lib/bank-details";
import { PrintButton } from "./_components/PrintButton";

export const metadata: Metadata = {
  title: "Facture — SantéauMaroc",
  robots: { index: false, follow: false },
};

type Params = Promise<{ reference: string }>;

export default async function FacturePage({ params }: { params: Params }) {
  const { reference } = await params;
  const { userId } = await verifySession();

  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!doctor) return null;

  const order = await prisma.subscriptionOrder.findUnique({
    where: { reference },
    select: {
      doctorId: true,
      reference: true,
      status: true,
      amount: true,
      currency: true,
      billing: true,
      featured: true,
      periodStart: true,
      periodEnd: true,
      reviewedAt: true,
      createdAt: true,
      doctor: {
        select: {
          civilite: true,
          prenom: true,
          nom: true,
          adresse: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!order || order.doctorId !== doctor.id || order.status !== "VERIFIED") notFound();

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const sub = dict.dashboard.praticien.sub;
  const bank = await getBankDetails();
  const fmtDate = (d: Date | null) =>
    d ? d.toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";

  const d = order.doctor;
  const clientName = d.user?.name ?? ([d.civilite, d.prenom, d.nom].filter(Boolean).join(" ").trim() || "—");
  const designation =
    `${sub.planPro} (${order.billing === "ANNUAL" ? sub.cycleAnnual : sub.cycleMonthly})` +
    (order.featured ? ` + ${sub.addonFeatured}` : "");

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/praticien/tableau-de-bord/abonnement"
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
        >
          ← {sub.backToSubscription}
        </Link>
        <PrintButton label={sub.print} />
      </div>

      <div className="card p-6 sm:p-8 print:shadow-none print:border-0">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <span className="text-lg font-extrabold text-slate-900">
              Santé<span className="text-secondary-600">au</span>Maroc
            </span>
            <p className="text-xs text-slate-500 mt-1">{bank.holder}</p>
          </div>
          <div className="text-end">
            <p className="text-lg font-bold text-slate-900">{sub.invoiceTitle}</p>
            <p className="text-xs text-slate-500 font-mono mt-1" dir="ltr">{order.reference}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {sub.invoiceDate} : {fmtDate(order.reviewedAt ?? order.createdAt)}
            </p>
          </div>
        </div>

        {/* Facturé à */}
        <div className="py-5 border-b border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{sub.invoiceFor}</p>
          <p className="text-sm font-semibold text-slate-800">{clientName}</p>
          {d.user?.email && <p className="text-xs text-slate-500">{d.user.email}</p>}
          {d.adresse && <p className="text-xs text-slate-500">{d.adresse}</p>}
        </div>

        {/* Lignes */}
        <div className="py-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400 pb-2 border-b border-slate-100">
            <span>{sub.invoiceItem}</span>
            <span>{sub.invoiceAmount}</span>
          </div>
          <div className="flex items-center justify-between py-3 text-sm text-slate-800">
            <span>{designation}</span>
            <span className="tabular-nums" dir="ltr">{formatAmount(order.amount, order.currency)}</span>
          </div>
          <p className="text-xs text-slate-500">
            {fmtDate(order.periodStart)} → {fmtDate(order.periodEnd)}
          </p>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
          <span className="text-sm font-bold text-slate-900">{sub.total}</span>
          <span className="text-lg font-extrabold text-slate-900 tabular-nums" dir="ltr">
            {formatAmount(order.amount, order.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
