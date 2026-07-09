import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderActions } from "./_components/OrderActions";

export const metadata: Metadata = { title: "Paiement — Admin SantéauMaroc" };

const STATUS_CFG = {
  PENDING:   { label: "En attente",  cls: "bg-amber-50 border-amber-200 text-amber-700"             },
  SUBMITTED: { label: "À vérifier",  cls: "bg-primary-50 border-primary-200 text-primary-700"       },
  VERIFIED:  { label: "Validé",      cls: "bg-secondary-50 border-secondary-200 text-secondary-700" },
  REJECTED:  { label: "Refusé",      cls: "bg-red-50 border-red-200 text-red-600"                   },
  CANCELLED: { label: "Annulé",      cls: "bg-slate-50 border-slate-200 text-slate-600"             },
} as const;

const BILLING_LABELS: Record<string, string> = { MONTHLY: "Mensuel", ANNUAL: "Annuel" };

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-sm font-semibold text-slate-800 text-end ${mono ? "font-mono" : ""}`} dir="ltr">{value}</span>
    </div>
  );
}

type Params = Promise<{ id: string }>;

export default async function AdminPaiementDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const order = await prisma.subscriptionOrder.findUnique({
    where: { id },
    select: {
      id: true, reference: true, status: true, amount: true, currency: true,
      billing: true, featured: true, rejectionReason: true,
      createdAt: true, periodStart: true, periodEnd: true, reviewedAt: true,
      doctor: {
        select: {
          id: true, slug: true, civilite: true, prenom: true, nom: true, phone: true,
          plan: true, planExpiresAt: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!order) notFound();

  const status = STATUS_CFG[order.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.PENDING;
  const d = order.doctor;
  const name = d.user?.name ?? ([d.civilite, d.prenom, d.nom].filter(Boolean).join(" ").trim() || "Praticien");
  const canAct = order.status === "PENDING";

  return (
    <div className="max-w-4xl">
      <nav className="text-xs text-slate-500 mb-4">
        <Link href="/admin/paiements" className="hover:text-primary-700">Paiements</Link>
        <span className="mx-1.5">/</span>
        <span className="font-mono text-slate-700">{order.reference}</span>
      </nav>

      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Virement {name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pro · {BILLING_LABELS[order.billing] ?? order.billing}{order.featured ? " + Mise en avant Premium" : ""}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${status.cls}`}>{status.label}</span>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-5">
        {/* Colonne gauche */}
        <div className="flex flex-col gap-5">
          {/* Validation du virement */}
          {canAct ? (
            <div className="card p-5">
              <p className="text-sm text-slate-600 mb-4">
                Vérifiez la réception du virement sur votre compte bancaire (rapprochement par la référence{" "}
                <span className="font-mono font-semibold text-slate-800">{order.reference}</span>), puis validez pour activer le compte.
              </p>
              <OrderActions orderId={order.id} />
            </div>
          ) : order.status === "REJECTED" && order.rejectionReason ? (
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Motif du refus</p>
              <p className="text-sm text-red-600">{order.rejectionReason}</p>
            </div>
          ) : null}
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Commande</h2>
            <Row label="Référence" value={order.reference} mono />
            <Row label="Montant" value={`${order.amount.toLocaleString("fr-FR")} ${order.currency}`} />
            <Row label="Créée le" value={formatDate(order.createdAt)} />
            {order.periodEnd && <Row label="Échéance" value={formatDate(order.periodEnd)} />}
          </div>

          <div className="card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Médecin</h2>
            <Row label="Nom" value={name} />
            {d.user?.email && <Row label="E-mail" value={d.user.email} />}
            {d.phone && <Row label="Téléphone" value={d.phone} />}
            <Row label="Plan actuel" value={d.plan} />
            <div className="mt-3 flex flex-col gap-1.5">
              {d.user?.email && (
                <a href={`mailto:${d.user.email}`} className="btn-outline py-1.5 text-xs justify-center">E-mail</a>
              )}
              {d.phone && (
                <a href={`tel:${d.phone}`} className="btn-outline py-1.5 text-xs justify-center">Appeler</a>
              )}
              {d.slug && (
                <Link href={`/admin/praticiens/${d.id}`} className="text-xs text-primary-600 hover:underline text-center">
                  Voir la fiche praticien
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
