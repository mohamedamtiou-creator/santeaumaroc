import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TicketActions } from "./_components/TicketActions";

export const metadata: Metadata = { title: "Ticket support — Admin SantéauMaroc" };

const STATUS_CFG = {
  open:        { label: "Ouverte",   cls: "bg-amber-50 border-amber-200 text-amber-700"                },
  in_progress: { label: "En cours",  cls: "bg-primary-50 border-primary-200 text-primary-700"          },
  resolved:    { label: "Résolue",   cls: "bg-secondary-50 border-secondary-200 text-secondary-700"    },
  closed:      { label: "Fermée",    cls: "bg-slate-50 border-slate-200 text-slate-600"                 },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  compte:      "Compte & Connexion",
  rdv:         "Rendez-vous",
  fiche:       "Fiche praticien",
  technique:   "Problème technique",
  signalement: "Signalement",
  autre:       "Autre question",
};

const ROLE_CFG: Record<string, { label: string; cls: string }> = {
  PATIENT: { label: "Patient",   cls: "bg-primary-50 text-primary-700"    },
  DOCTOR:  { label: "Praticien", cls: "bg-secondary-50 text-secondary-700" },
  ADMIN:   { label: "Admin",     cls: "bg-slate-100 text-slate-600"       },
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

type Params = Promise<{ id: string }>;

export default async function AdminTicketPage({ params }: { params: Params }) {
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user:      { select: { name: true, email: true, role: true, createdAt: true } },
      repliedBy: { select: { name: true } },
    },
  });
  if (!ticket) notFound();

  const status = STATUS_CFG[ticket.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.open;
  const role   = ROLE_CFG[ticket.user.role] ?? ROLE_CFG.PATIENT;

  return (
    <div className="max-w-4xl">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6" aria-label="Fil d'Ariane">
        <Link href="/admin/support" className="hover:text-primary-600 transition-colors">Support</Link>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-hidden="true">
          <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
        </svg>
        <span className="text-slate-600 font-medium">#{ticket.id.slice(0, 8).toUpperCase()}</span>
      </nav>

      {/* Titre */}
      <div className="flex items-start gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${status.cls}`}>
              {status.label}
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {CATEGORY_LABELS[ticket.category] ?? ticket.category}
            </span>
            {ticket.priority === "urgent" && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                Urgent
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-slate-900 leading-snug">{ticket.subject}</h1>
          <p className="text-xs text-slate-500 mt-1">Reçu le {formatDate(ticket.createdAt)}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-4">

          {/* Message */}
          <div className="card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Message</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
            {ticket.phone && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-4 h-4 text-slate-500 shrink-0" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Contact : <strong className="text-slate-700">{ticket.phone}</strong></span>
              </div>
            )}
          </div>

          {/* Réponse existante */}
          {ticket.adminReply && (
            <div className="card p-5 border-secondary-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded bg-secondary-100 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-secondary-600" aria-hidden="true">
                    <path d="M15 2H1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2l2 3 2-3h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
                  </svg>
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-700">Réponse envoyée</h2>
                {ticket.repliedAt && (
                  <span className="text-xs text-slate-500 ms-auto">{formatDate(ticket.repliedAt)}</span>
                )}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.adminReply}</p>
              {ticket.repliedBy && (
                <p className="mt-2 text-xs text-slate-500">Par {ticket.repliedBy.name}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="card p-5">
            <TicketActions
              ticketId={ticket.id}
              currentStatus={ticket.status}
              existingReply={ticket.adminReply}
            />
          </div>
        </div>

        {/* Panneau droit */}
        <aside className="space-y-4">

          {/* Infos utilisateur */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Utilisateur</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center shrink-0 uppercase">
                {ticket.user.name.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{ticket.user.name}</p>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${role.cls}`}>
                  {role.label}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="w-3.5 h-3.5 shrink-0" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM1 6l7 5 7-5"/>
                </svg>
                <span className="truncate">{ticket.user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="w-3.5 h-3.5 shrink-0" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5"/><polyline points="8 4 8 8 10 10"/>
                </svg>
                <span>Membre depuis {new Intl.DateTimeFormat("fr-MA", { month: "long", year: "numeric" }).format(new Date(ticket.user.createdAt))}</span>
              </div>
            </div>
          </div>

          {/* Référence */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Référence</h3>
            <p className="font-mono font-bold text-slate-800">#{ticket.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-slate-500 mt-1">{ticket.id}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
