import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { formatAmount } from "@/features/subscription/plans";
import { getBankDetails, buildQrPayload, renderQrSvg } from "@/lib/bank-details";

export const metadata: Metadata = {
  title: "Paiement de l'abonnement — SantéauMaroc",
  robots: { index: false, follow: false },
};

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-sm font-semibold text-slate-800 text-end ${mono ? "font-mono" : ""}`} dir="ltr">
        {value}
      </span>
    </div>
  );
}

type Params = Promise<{ reference: string }>;

export default async function OrderPage({ params }: { params: Params }) {
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
      rejectionReason: true,
    },
  });
  if (!order || order.doctorId !== doctor.id) notFound();

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const sub = dict.dashboard.praticien.sub;
  const tp = dict.dashboard.praticien;

  const bank = await getBankDetails();
  const qrSvg = await renderQrSvg(
    buildQrPayload(bank, { amount: order.amount, currency: order.currency, reference: order.reference }),
  );

  const STATUS: Record<string, { label: string; cls: string }> = {
    PENDING: { label: sub.statusPending, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    VERIFIED: { label: sub.statusVerified, cls: "bg-secondary-50 text-secondary-700 border-secondary-200" },
    REJECTED: { label: sub.statusRejected, cls: "bg-red-50 text-red-600 border-red-200" },
    CANCELLED: { label: sub.statusCancelled, cls: "bg-slate-100 text-slate-500 border-slate-200" },
  };
  const st = STATUS[order.status] ?? STATUS.PENDING;
  const open = order.status === "PENDING";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="section-eyebrow mb-0.5">{tp.eyebrow}</p>
          <h1 className="text-xl font-bold text-slate-900">{sub.payTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">{sub.paySubtitle}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${st.cls}`}>
          {st.label}
        </span>
      </header>

      {/* Rejet : motif + relance */}
      {order.status === "REJECTED" && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-semibold text-red-700">{sub.statusRejected}</p>
          {order.rejectionReason && (
            <p className="text-xs text-red-600 mt-1">
              {sub.rejectedReason} : {order.rejectionReason}
            </p>
          )}
          <Link href="/tarifs/souscrire?cycle=annuel" className="btn-primary py-2 text-xs mt-3">
            {sub.renew}
          </Link>
        </div>
      )}

      {open && (
        <div className="grid md:grid-cols-[1fr_auto] gap-5">
          {/* Coordonnées bancaires */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3">{sub.payTitle}</h2>
            <div>
              <Row label={sub.bankHolder} value={bank.holder} />
              <Row label={sub.bankName} value={bank.bank} />
              <Row label={sub.bankRib} value={bank.rib} mono />
              {bank.iban && <Row label={sub.bankIban} value={bank.iban} mono />}
              {bank.swift && <Row label={sub.bankSwift} value={bank.swift} mono />}
            </div>

            <div className="mt-4 rounded-xl bg-primary-50 border border-primary-100 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-900/70">{sub.amountToPay}</span>
                <span className="text-lg font-extrabold text-primary-800 tabular-nums" dir="ltr">
                  {formatAmount(order.amount, order.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-900/70">{sub.reference}</span>
                <span className="text-sm font-bold text-primary-800 font-mono" dir="ltr">
                  {order.reference}
                </span>
              </div>
              <p className="text-[11px] text-primary-900/60">{sub.refHint}</p>
            </div>
          </div>

          {/* QR code */}
          <div className="card p-5 flex flex-col items-center justify-center gap-2 md:w-52">
            <div
              className="w-40 h-40 [&>svg]:w-full [&>svg]:h-full"
              role="img"
              aria-label={sub.qrAlt}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="text-[11px] text-slate-400 text-center">{sub.qrAlt}</p>
          </div>
        </div>
      )}

      {/* Confirmation / suivi */}
      <div className="card p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          {order.status === "VERIFIED" ? sub.statusVerified : sub.confTitle}
        </h2>
        <p className="text-xs text-slate-500 mb-4">{sub.confDesc}</p>
        <div>
          <Row label={sub.dossier} value={order.reference} mono />
          <Row label={sub.statusLabel} value={st.label} />
          {open && <Row label={sub.delay} value={sub.delayValue} />}
        </div>
        {order.status === "VERIFIED" && (
          <Link
            href={`/praticien/tableau-de-bord/abonnement/${order.reference}/facture`}
            className="btn-outline py-2 text-xs mt-4"
          >
            {sub.invoice}
          </Link>
        )}
        <p className="text-xs text-slate-500 mt-4">
          {sub.needHelp}{" "}
          <Link href="/support" className="text-primary-700 font-semibold hover:underline">
            {sub.contactSupport}
          </Link>
        </p>
      </div>

      <Link
        href="/praticien/tableau-de-bord/abonnement"
        className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
      >
        ← {sub.backToSubscription}
      </Link>
    </div>
  );
}
