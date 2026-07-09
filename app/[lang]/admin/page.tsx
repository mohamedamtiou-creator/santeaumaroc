import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Tableau de bord — Admin SantéauMaroc" };

async function getStats() {
  const [
    total, verified, inactive,
    pendingClaims, openTickets, newLeads, pendingOrders, pendingQuestions, openReports,
    recentClaims,
  ] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.count({ where: { isVerified: true } }),
    prisma.doctor.count({ where: { isActive: false } }),
    prisma.doctorClaim.count({ where: { status: "PENDING" } }),
    prisma.supportTicket.count({ where: { status: "open" } }),
    prisma.subscriptionLead.count({ where: { status: "NEW" } }),
    prisma.subscriptionOrder.count({ where: { status: "PENDING" } }),
    prisma.question.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.doctorClaim.findMany({
      where: { status: "PENDING" },
      include: {
        doctor: {
          include: {
            specialty: { select: { name: true } },
            city:      { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  return {
    total, verified, inactive,
    pendingClaims, openTickets, newLeads, pendingOrders, pendingQuestions, openReports,
    recentClaims,
  };
}

export default async function AdminDashboard() {
  const s = await getStats();

  const STATS = [
    { label: "Total praticiens", value: s.total,    color: "text-primary-700",   border: "border-primary-100"   },
    { label: "Vérifiés",         value: s.verified,  color: "text-secondary-700", border: "border-secondary-100" },
    { label: "Désactivés",       value: s.inactive,  color: "text-red-600",       border: "border-red-100"       },
    { label: "Signalements",     value: s.openReports, color: "text-amber-700",   border: "border-amber-100"     },
  ];

  /* Files d'attente actionnables */
  const QUEUES: {
    label: string; count: number; href: string; desc: string; icon: React.ReactNode;
  }[] = [
    {
      label: "Revendications", count: s.pendingClaims, href: "/admin/revendications?statut=attente",
      desc: "demandes à examiner",
      icon: <path d="M4 3v14M4 3l12 4-12 5" />,
    },
    {
      label: "Paiements", count: s.pendingOrders, href: "/admin/paiements?statut=a-valider",
      desc: "virements à valider",
      icon: <><rect x="2.5" y="5" width="15" height="10" rx="2" /><path d="M2.5 8.5h15M6 12h3" /></>,
    },
    {
      label: "Abonnements", count: s.newLeads, href: "/admin/abonnements?statut=nouveaux",
      desc: "leads à recontacter",
      icon: <><rect x="2" y="4.5" width="16" height="11" rx="2" /><path d="M2 8h16M5 12h3" /></>,
    },
    {
      label: "Support", count: s.openTickets, href: "/admin/support?statut=ouvertes",
      desc: "tickets ouverts",
      icon: <path d="M18 13a2 2 0 0 1-2 2H6l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8z" />,
    },
    {
      label: "Questions", count: s.pendingQuestions, href: "/admin/questions",
      desc: "questions à modérer",
      icon: <><path d="M3 4h14v9H7l-4 3z" /><path d="M7 7h6M7 10h4" /></>,
    },
  ];

  const totalToDo = s.pendingClaims + s.openTickets + s.newLeads + s.pendingOrders + s.pendingQuestions + s.openReports;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">Administration</p>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-1">
          {totalToDo === 0 ? (
            "Tout est à jour — aucune action en attente."
          ) : (
            <>
              <span className="font-semibold text-slate-700">{totalToDo}</span>
              {` élément${totalToDo > 1 ? "s" : ""} en attente d'action.`}
            </>
          )}
        </p>
      </div>

      {/* KPIs annuaire */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((kpi) => (
          <div key={kpi.label} className={`card p-5 border ${kpi.border}`}>
            <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
            <p className={`text-3xl font-bold tabular-nums ${kpi.color}`}>{kpi.value.toLocaleString("fr-MA")}</p>
          </div>
        ))}
      </div>

      {/* Centre d'action — files d'attente */}
      <section>
        <h2 className="font-semibold text-slate-900 mb-3">À traiter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUEUES.map((q) => {
            const urgent = q.count > 0;
            return (
              <Link
                key={q.label}
                href={q.href}
                className={`card p-4 flex items-center gap-3.5 transition-colors ${
                  urgent ? "border-amber-200 hover:border-amber-300" : "hover:border-slate-300"
                }`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  urgent ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"
                }`}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    {q.icon}
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{q.label}</p>
                  <p className="text-xs text-slate-500">{q.desc}</p>
                </div>
                <span className={`text-lg font-bold tabular-nums shrink-0 ${urgent ? "text-amber-600" : "text-slate-300"}`}>
                  {q.count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Revendications récentes en attente */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900">Demandes en attente</h2>
            {s.pendingClaims > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{s.pendingClaims}</span>
            )}
          </div>
          <Link href="/admin/revendications?statut=attente" className="text-sm text-primary-600 hover:underline font-medium">
            Voir tout →
          </Link>
        </div>

        {s.recentClaims.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-secondary-50 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5"/><circle cx="10" cy="10" r="8"/>
              </svg>
            </div>
            <p className="text-slate-500 text-sm">Aucune demande en attente</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {s.recentClaims.map((claim) => {
              const doc = claim.doctor;
              const name = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ") || "Médecin sans nom";
              const docs = (claim.documents as { url: string }[] | null) ?? [];
              return (
                <div key={claim.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
                    {[doc.prenom?.[0], doc.nom?.[0]].filter(Boolean).join("").toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{name}</p>
                    <p className="text-xs text-slate-500 truncate">{doc.specialty?.name ?? "—"} · {doc.city?.name ?? "—"} · {docs.length} doc{docs.length > 1 ? "s" : ""}</p>
                  </div>
                  <Link href={`/admin/praticiens/${doc.id}`} className="btn-primary text-xs py-1.5 px-3 shrink-0">
                    Examiner
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
