import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadActions } from "./_components/LeadActions";

export const metadata: Metadata = { title: "Demande d'abonnement — Admin SantéauMaroc" };

const STATUS_CFG = {
  NEW:       { label: "Nouveau",  cls: "bg-amber-50 border-amber-200 text-amber-700"             },
  CONTACTED: { label: "Contacté", cls: "bg-primary-50 border-primary-200 text-primary-700"       },
  CONVERTED: { label: "Converti", cls: "bg-secondary-50 border-secondary-200 text-secondary-700" },
  CLOSED:    { label: "Fermé",    cls: "bg-slate-50 border-slate-200 text-slate-600"             },
} as const;

const PLAN_LABELS: Record<string, string> = { PRO: "Pro", CABINET: "Cabinet / Clinique" };
const BILLING_LABELS: Record<string, string> = { MONTHLY: "Mensuel", ANNUAL: "Annuel" };

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

type Params = Promise<{ id: string }>;

function InfoLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600">
      <span className="text-slate-400 shrink-0 mt-0.5">{icon}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

export default async function AdminLeadPage({ params }: { params: Params }) {
  const { id } = await params;

  const lead = await prisma.subscriptionLead.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, role: true } } },
  });
  if (!lead) notFound();

  const status = STATUS_CFG[lead.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.NEW;
  const planLabel = PLAN_LABELS[lead.plan] ?? lead.plan;

  return (
    <div className="max-w-4xl">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6" aria-label="Fil d'Ariane">
        <Link href="/admin/abonnements" className="hover:text-primary-600 transition-colors">Abonnements</Link>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-hidden="true"><path d="m6 3 5 5-5 5" strokeLinecap="round"/></svg>
        <span className="text-slate-600 font-medium">#{lead.id.slice(0, 8).toUpperCase()}</span>
      </nav>

      {/* Titre */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${status.cls}`}>{status.label}</span>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            Offre {planLabel}{lead.billing ? ` · ${BILLING_LABELS[lead.billing] ?? lead.billing}` : ""}
          </span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 leading-snug">{lead.name}</h1>
        <p className="text-xs text-slate-500 mt-1">Reçu le {formatDate(lead.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Principal */}
        <div className="lg:col-span-2 space-y-4">

          {/* Contact rapide */}
          <div className="card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Recontacter</h2>
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${lead.phone}`} className="btn-secondary py-2.5 px-4 text-sm">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z"/></svg>
                <span dir="ltr">{lead.phone}</span>
              </a>
              <a href={`mailto:${lead.email}`} className="btn-outline py-2.5 px-4 text-sm">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M2 4l6 4.5L14 4"/></svg>
                E-mail
              </a>
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Message</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.message}</p>
            </div>
          )}

          {/* Actions statut */}
          <div className="card p-5">
            <LeadActions leadId={lead.id} currentStatus={lead.status} />
          </div>
        </div>

        {/* Panneau droit */}
        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Coordonnées</h3>
            <div className="space-y-2.5">
              <InfoLine icon={
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="6" r="3"/><path d="M2.5 14c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4"/></svg>
              }><span className="font-medium text-slate-700">{lead.name}</span></InfoLine>
              <InfoLine icon={
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M2 4l6 4.5L14 4"/></svg>
              }><a href={`mailto:${lead.email}`} className="text-primary-600 hover:underline truncate block" dir="ltr">{lead.email}</a></InfoLine>
              <InfoLine icon={
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z"/></svg>
              }><a href={`tel:${lead.phone}`} className="text-slate-700 tabular-nums" dir="ltr">{lead.phone}</a></InfoLine>
              {lead.city && (
                <InfoLine icon={
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 1C5.8 1 4 2.8 4 5c0 3.3 4 9 4 9s4-5.7 4-9c0-2.2-1.8-4-4-4z"/><circle cx="8" cy="5" r="1.5"/></svg>
                }>{lead.city}</InfoLine>
              )}
              {lead.specialty && (
                <InfoLine icon={
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 1.5a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0v-2a3 3 0 0 0-3-3zM3 8.5c0 3 2 5 5 5s5-2 5-5"/></svg>
                }>{lead.specialty}</InfoLine>
              )}
            </div>

            {lead.user && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Compte lié</p>
                <Link href={`/admin/praticiens`} className="text-xs font-semibold text-primary-600 hover:underline">
                  {lead.user.name} · {lead.user.role}
                </Link>
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Référence</h3>
            <p className="font-mono font-bold text-slate-800">#{lead.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-slate-500 mt-1 break-all">{lead.id}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
