import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionary, toLocale } from "@/lib/i18n";

type Params = Promise<{ lang: string }>;
import { SupportForm } from "./_components/SupportForm";

export const metadata: Metadata = {
  title: "Centre d'aide — SantéauMaroc",
  description: "Soumettez une demande d'aide ou signalez un problème. Notre équipe vous répond sous 48h.",
  // Espace authentifié (tickets personnels) — hors index.
  robots: { index: false, follow: false },
};

// Classes visuelles par statut — le libellé vient du dictionnaire (i18n).
const STATUS_CLS: Record<string, string> = {
  open:        "bg-amber-50 border-amber-200 text-amber-700",
  in_progress: "bg-primary-50 border-primary-200 text-primary-700",
  resolved:    "bg-secondary-50 border-secondary-200 text-secondary-700",
  closed:      "bg-slate-50 border-slate-200 text-slate-600",
};

function formatDate(d: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(d));
}

export default async function SupportPage({ params }: { params: Params }) {
  const session = await verifySession();
  const locale = toLocale((await params).lang);
  const ts = getDictionary(locale).support;

  const [user, tickets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, phone: true, role: true },
    }),
    prisma.supportTicket.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true, category: true, subject: true,
        status: true, priority: true, createdAt: true,
      },
    }),
  ]);

  return (
    <div className="page-outer max-w-5xl">

      {/* ── En-tête ──────────────────────────────── */}
      <header className="mb-8">
        <p className="section-eyebrow mb-1.5">{ts.eyebrow}</p>
        <h1 className="section-title">{ts.title}</h1>
        <p className="section-subtitle mt-2">
          {ts.subtitle}
        </p>
      </header>

      {/* ── Grille principale ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Formulaire */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h2 className="font-semibold text-slate-900">{ts.newRequest}</h2>
          </div>
          <SupportForm defaultPhone={user?.phone} t={ts} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">

          {/* Délai */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-secondary-50 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-3.5 h-3.5 text-secondary-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">{ts.delayTitle}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{ts.delayNormal}</span>
                <span className="font-semibold text-slate-800">{ts.delayNormalValue}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{ts.delayUrgent}</span>
                <span className="font-semibold text-rose-600">{ts.delayUrgentValue}</span>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">{ts.faqTitle}</h3>
            <div className="space-y-3">
              {ts.faq.map((item, i) => (
                <div key={i} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-xs font-semibold text-slate-700 mb-1">{item.q}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact alternatif */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">{ts.altContactTitle}</h3>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {ts.altContactLink}
            </Link>
          </div>
        </aside>
      </div>

      {/* ── Mes demandes ─────────────────────────── */}
      {tickets.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4 h-4 text-slate-500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {ts.myRequestsTitle}
          </h2>
          <div className="card overflow-hidden p-0">
            <div className="divide-y divide-slate-100">
              {tickets.map((t) => {
                const statusCls = STATUS_CLS[t.status] ?? STATUS_CLS.open;
                const statusLabel = ts.statuses[t.status as keyof typeof ts.statuses] ?? ts.statuses.open;
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${statusCls}`}>
                          {statusLabel}
                        </span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ts.categories[t.category as keyof typeof ts.categories] ?? t.category}
                        </span>
                        {t.priority === "urgent" && (
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            {ts.urgent}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate mt-1">{t.subject}</p>
                    </div>
                    <time className="text-xs text-slate-500 shrink-0">{formatDate(t.createdAt, locale)}</time>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
