import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getBankDetails } from "@/lib/bank-details";
import { BankSettingsForm } from "./_components/BankSettingsForm";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";
import { SortableTh, parseDir, type SortDir } from "../_components/SortHeader";

export const metadata: Metadata = { title: "Paiements — Admin SantéauMaroc" };

type SortKey = "montant" | "date" | "statut";
const SORTS: Record<SortKey, (dir: SortDir) => Prisma.SubscriptionOrderOrderByWithRelationInput[]> = {
  montant: (dir) => [{ amount: dir }],
  date:    (dir) => [{ createdAt: dir }],
  statut:  (dir) => [{ status: dir }, { createdAt: "desc" }],
};
const DEFAULT_ORDER: Prisma.SubscriptionOrderOrderByWithRelationInput[] = [{ status: "asc" }, { createdAt: "desc" }];

const STATUS_CFG = {
  PENDING:   { label: "En attente",  cls: "bg-amber-50 border-amber-200 text-amber-700",             dot: "bg-amber-400"     },
  SUBMITTED: { label: "À vérifier",  cls: "bg-primary-50 border-primary-200 text-primary-700",       dot: "bg-primary-500"   },
  VERIFIED:  { label: "Validé",      cls: "bg-secondary-50 border-secondary-200 text-secondary-700", dot: "bg-secondary-500" },
  REJECTED:  { label: "Refusé",      cls: "bg-red-50 border-red-200 text-red-600",                   dot: "bg-red-400"       },
  CANCELLED: { label: "Annulé",      cls: "bg-slate-50 border-slate-200 text-slate-600",             dot: "bg-slate-400"     },
} as const;

const BILLING_LABELS: Record<string, string> = { MONTHLY: "Mensuel", ANNUAL: "Annuel" };

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

function doctorName(d: { civilite: string | null; prenom: string | null; nom: string | null; user: { name: string | null } | null }) {
  return d.user?.name ?? ([d.civilite, d.prenom, d.nom].filter(Boolean).join(" ").trim() || "Praticien");
}

type SearchParams = Promise<{ statut?: string; page?: string; tri?: string; dir?: string }>;

export default async function AdminPaiementsPage({ searchParams }: { searchParams: SearchParams }) {
  const { statut, page: pageParam, tri: triParam, dir: dirParam } = await searchParams;
  const { page, skip, take } = parsePage(pageParam);
  const tri: SortKey | undefined = triParam && triParam in SORTS ? (triParam as SortKey) : undefined;
  const dir = parseDir(dirParam);
  const orderBy = tri ? SORTS[tri](dir) : DEFAULT_ORDER;

  const statusFilter =
    statut === "a-valider" ? "PENDING"  :
    statut === "valides"   ? "VERIFIED" :
    statut === "refuses"   ? "REJECTED" :
    undefined;

  const where = statusFilter ? { status: statusFilter } : undefined;

  const [orders, filteredTotal, toReviewCount, totalCount] = await Promise.all([
    prisma.subscriptionOrder.findMany({
      where,
      orderBy,
      select: {
        id: true, reference: true, status: true, amount: true, currency: true,
        billing: true, featured: true, createdAt: true,
        doctor: { select: { civilite: true, prenom: true, nom: true, user: { select: { name: true } } } },
      },
      skip,
      take,
    }),
    prisma.subscriptionOrder.count({ where }),
    prisma.subscriptionOrder.count({ where: { status: "PENDING" } }),
    prisma.subscriptionOrder.count(),
  ]);

  const buildUrl = buildPageUrl("/admin/paiements", { statut, tri, dir });

  const bank = await getBankDetails();

  const FILTERS = [
    { label: "Tous",       value: undefined,   href: "/admin/paiements" },
    { label: "À valider",  value: "PENDING",   href: "/admin/paiements?statut=a-valider" },
    { label: "Validés",    value: "VERIFIED",  href: "/admin/paiements?statut=valides" },
    { label: "Refusés",    value: "REJECTED",  href: "/admin/paiements?statut=refuses" },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <AdminPageHeader
          title="Paiements"
          subtitle={`${totalCount} commande${totalCount !== 1 ? "s" : ""} · ${toReviewCount} à valider`}
        />
      </div>

      {/* Coordonnées de virement (éditables) */}
      <div className="card p-5 mb-5">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Coordonnées de virement</h2>
        <p className="text-xs text-slate-500 mb-4">
          Affichées au médecin sur sa page de paiement (RIB, IBAN, QR). Renseignez vos vraies coordonnées.
        </p>
        <BankSettingsForm initial={bank} />
      </div>

      {toReviewCount > 0 && !statusFilter && (
        <div className="mb-5 flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary-500 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-11a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l2 2a1 1 0 0 0 1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
          </svg>
          <p className="text-sm text-primary-800">
            <span className="font-semibold">{toReviewCount} virement{toReviewCount !== 1 ? "s" : ""}</span> à confirmer (rapprochez par la référence, puis validez).
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTERS.map((f) => {
          const active = f.value === statusFilter;
          return (
            <Link key={f.href} href={f.href}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                active ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
              }`}>
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-14 text-center">
          <p className="font-semibold text-slate-600">Aucune commande</p>
          <p className="text-sm text-slate-500">Aucune commande ne correspond à ce filtre.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Médecin</th>
                  <th className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Référence</th>
                  <SortableTh col="montant" label="Montant" basePath="/admin/paiements" tri={tri} dir={dir} params={{ statut }}
                    className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" />
                  <SortableTh col="date" label="Date" basePath="/admin/paiements" tri={tri} dir={dir} params={{ statut }}
                    className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" />
                  <SortableTh col="statut" label="Statut" basePath="/admin/paiements" tri={tri} dir={dir} params={{ statut }}
                    className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o) => {
                  const status = STATUS_CFG[o.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.PENDING;
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 truncate max-w-[170px]">{doctorName(o.doctor)}</p>
                        <p className="text-xs text-slate-500">
                          Pro · {BILLING_LABELS[o.billing] ?? o.billing}{o.featured ? " + Premium" : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600" dir="ltr">{o.reference}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 tabular-nums" dir="ltr">
                        {o.amount.toLocaleString("fr-FR")} {o.currency}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${status.cls}`}>{status.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/paiements/${o.id}`}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-0.5">
                          Voir
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true"><path d="m6 3 5 5-5 5" strokeLinecap="round"/></svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <AdminListFooter page={page} total={filteredTotal} buildUrl={buildUrl} noun="commandes" />
        </div>
      )}
    </div>
  );
}
