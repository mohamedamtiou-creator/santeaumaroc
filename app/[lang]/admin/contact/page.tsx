import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";

export const metadata: Metadata = { title: "Demandes de contact — Admin SantéauMaroc" };

const SUBJECTS = [
  "Besoin d'assistance",
  "Partenariat / Marketing",
  "Relation presse",
  "Publicité",
  "Suggestions / Boite à idées",
  "Modération",
  "Bug / Problème technique",
  "Modification de coordonnées dans l'annuaire",
  "Suppression de coordonnées dans l'annuaire",
  "Autre",
];

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

type SearchParams = Promise<{ sujet?: string; page?: string }>;

export default async function AdminContactPage({ searchParams }: { searchParams: SearchParams }) {
  const { sujet, page: pageParam } = await searchParams;
  const { page, skip, take } = parsePage(pageParam);

  const where = sujet ? { subject: sujet } : undefined;

  const [contacts, filteredTotal, totalCount] = await Promise.all([
    prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.contactRequest.count({ where }),
    prisma.contactRequest.count(),
  ]);

  const buildUrl = buildPageUrl("/admin/contact", { sujet });

  return (
    <div className="max-w-5xl">

      {/* En-tête */}
      <div className="mb-6">
        <AdminPageHeader
          title="Demandes de contact"
          subtitle={`${totalCount} demande${totalCount !== 1 ? "s" : ""} reçue${totalCount !== 1 ? "s" : ""}`}
        />
      </div>

      {/* Filtres par sujet */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <a
          href="/admin/contact"
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
            !sujet
              ? "bg-primary-600 border-primary-600 text-white"
              : "bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
          }`}
        >
          Tous
        </a>
        {SUBJECTS.map((s) => (
          <a
            key={s}
            href={`/admin/contact?sujet=${encodeURIComponent(s)}`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              sujet === s
                ? "bg-primary-600 border-primary-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      {/* Contenu */}
      {contacts.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-6 h-6 text-slate-300" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-600">Aucune demande</p>
          <p className="text-sm text-slate-500">Aucune demande ne correspond à ce filtre.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="card p-5 hover:border-primary-100 transition-colors"
            >
              <div className="flex items-start gap-4">

                {/* Avatar initiales */}
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center shrink-0 select-none">
                  {initials(c.name)}
                </div>

                <div className="flex-1 min-w-0">

                  {/* Ligne 1 : nom + sujet + date */}
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-semibold text-slate-900 truncate">{c.name}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                        {c.subject}
                      </span>
                    </div>
                    <time
                      dateTime={c.createdAt.toISOString()}
                      className="text-xs text-slate-500 whitespace-nowrap shrink-0"
                    >
                      {formatDate(c.createdAt)}
                    </time>
                  </div>

                  {/* Ligne 2 : coordonnées */}
                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                        className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                        <rect x="1" y="3" width="14" height="10" rx="2"/>
                        <path d="m1 5 7 4.5L15 5" strokeLinecap="round"/>
                      </svg>
                      {c.email}
                    </a>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 hover:underline transition-colors"
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                          className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                          <path d="M2 3a1 1 0 0 1 1-1h1a1 1 0 0 1 .97.757l.5 2a1 1 0 0 1-.27.976l-.8.79a9 9 0 0 0 4.07 4.07l.79-.8a1 1 0 0 1 .976-.27l2 .5A1 1 0 0 1 14 11v1a1 1 0 0 1-1 1h-.5C6.82 13 3 9.18 3 4.5V4a1 1 0 0 1 0-.5V3z"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {c.phone}
                      </a>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    {c.message}
                  </p>

                  {/* Répondre */}
                  <div className="mt-3 flex justify-end">
                    <a
                      href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-600 hover:text-secondary-700 transition-colors"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                        className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3 2 8l5 2.5M14 3 9 15l-2-4.5M14 3 7 10.5"/>
                      </svg>
                      Répondre par email
                    </a>
                  </div>

                </div>
              </div>
            </div>
          ))}
          <div className="card p-0 overflow-hidden">
            <AdminListFooter page={page} total={filteredTotal} buildUrl={buildUrl} noun="demandes" />
          </div>
        </div>
      )}
    </div>
  );
}
