import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { ClaimActions } from "./_components/ClaimActions";

export const metadata: Metadata = { title: "Revendication — Admin SantéauMaroc" };

const STATUS_CFG = {
  PENDING:  { label: "En attente",  cls: "bg-amber-50 border-amber-200 text-amber-700"             },
  APPROVED: { label: "Approuvée",   cls: "bg-secondary-50 border-secondary-200 text-secondary-700" },
  REJECTED: { label: "Refusée",     cls: "bg-red-50 border-red-200 text-red-600"                   },
} as const;

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

type DocItem = { url: string; name: string; size: number; type: string; category?: string };

function DocPreview({ doc }: { doc: DocItem }) {
  const isPdf = doc.type === "application/pdf";
  const isImg = doc.type.startsWith("image/");
  const sizeKb = Math.round(doc.size / 1024);

  return (
    <a
      href={doc.url} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-sm transition-all"
    >
      <div className="h-28 bg-slate-50 flex items-center justify-center overflow-hidden">
        {isImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-10 h-10 text-red-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 4h16l8 8v24H8V4z M24 4v8h8"/>
              <path d="M12 22h16M12 27h10"/>
            </svg>
            <span className="text-xs font-bold text-red-500 uppercase">PDF</span>
          </div>
        )}
      </div>
      <div className="px-3 py-2 bg-white border-t border-slate-100">
        <p className="text-xs font-medium text-slate-700 truncate" title={doc.name}>{doc.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {sizeKb} Ko · {isPdf ? "PDF" : doc.type.split("/")[1]?.toUpperCase() ?? "—"}
        </p>
      </div>
    </a>
  );
}

function DocSection({
  title, docs, dot, missing,
}: {
  title: string; docs: DocItem[]; dot: string; missing: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${docs.length > 0 ? "bg-secondary-500" : "bg-red-400"}`} aria-hidden="true" />
        {title}
        {docs.length === 0 && <span className="text-red-400 font-normal normal-case tracking-normal ms-1">— {missing}</span>}
      </p>
      {docs.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {docs.map((doc, i) => <DocPreview key={i} doc={doc} />)}
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic">Aucun fichier soumis.</p>
      )}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-800">{children}</dd>
    </div>
  );
}

export default async function AdminClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await verifySession();
  if (session.role !== "ADMIN") notFound();

  const claim = await prisma.doctorClaim.findUnique({
    where:   { id },
    include: {
      doctor: {
        select: {
          id: true, nom: true, prenom: true, civilite: true,
          slug: true, userId: true, isVerified: true, isActive: true,
          specialty: { select: { name: true } },
          city:      { select: { name: true } },
        },
      },
      user:     { select: { id: true, name: true, email: true, createdAt: true } },
      reviewer: { select: { name: true } },
    },
  });
  if (!claim) notFound();

  const doc        = claim.doctor;
  const doctorName = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ") || "Médecin sans nom";
  const initials   = [doc.prenom?.[0], doc.nom?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const cfg        = STATUS_CFG[claim.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.PENDING;
  const isPending  = claim.status === "PENDING";
  const isUnclaimed = !doc.userId;

  /* ── Documents ─────────────────────────────── */
  const allDocs: DocItem[] = Array.isArray(claim.documents)
    ? (claim.documents as DocItem[])
    : [];
  const cinDocs     = allDocs.filter((d) => d.category === "cin");
  const diplomeDocs = allDocs.filter((d) => d.category === "diplome");
  const autreDocs   = allDocs.filter((d) => !d.category || d.category === "autre");

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/revendications" className="hover:text-slate-700 transition-colors">
          Revendications
        </Link>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className="w-3.5 h-3.5 text-slate-300" aria-hidden="true">
          <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
        </svg>
        <span className="text-slate-700 font-medium truncate">{doctorName}</span>
      </nav>

      {/* En-tête */}
      <div className="card p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-5">
        <div className="w-14 h-14 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">{doctorName}</h1>
            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-sm text-slate-500">{doc.specialty?.name ?? "—"} · {doc.city?.name ?? "—"}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {doc.isVerified && (
              <span className="text-xs font-medium text-secondary-700 bg-secondary-50 border border-secondary-200 px-2 py-0.5 rounded-full">Vérifié</span>
            )}
            {doc.isActive
              ? <span className="text-xs font-medium text-secondary-700 bg-secondary-50 border border-secondary-200 px-2 py-0.5 rounded-full">Actif</span>
              : <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Inactif</span>
            }
            {isUnclaimed
              ? <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Fiche non revendiquée</span>
              : <span className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Fiche déjà revendiquée</span>
            }
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {doc.slug && (
            <Link href={`/praticiens/${doc.slug}`} target="_blank"
              className="text-xs font-semibold text-slate-500 hover:text-primary-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-primary-200 transition-colors">
              Voir fiche →
            </Link>
          )}
          <Link href={`/admin/praticiens/${doc.id}`}
            className="text-xs font-semibold text-slate-500 hover:text-primary-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-primary-200 transition-colors">
            Dossier admin →
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── Colonne principale : documents + message ── */}
        <div className="flex flex-col gap-5">

          {/* Message du demandeur */}
          {claim.message && (
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-4 h-4 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h12v9H4z M4 13l3 3h9"/>
                </svg>
                Message du demandeur
              </h2>
              <blockquote className="text-sm text-slate-600 leading-relaxed border-s-2 border-primary-200 ps-3 italic">
                {claim.message}
              </blockquote>
              <p className="text-xs text-slate-500 mt-2">Soumis le {formatDate(claim.createdAt)}</p>
            </div>
          )}

          {/* Documents justificatifs */}
          <div className="card p-5 flex flex-col gap-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3h8l4 4v11H5V3z M13 3v4h4"/>
              </svg>
              Documents justificatifs
            </h2>

            <DocSection title="Pièce d'identité (CIN)" docs={cinDocs}     dot="bg-secondary-500" missing="non fournie" />
            <DocSection title="Diplôme de médecine"    docs={diplomeDocs} dot="bg-primary-500"   missing="non fourni"  />
            {autreDocs.length > 0 && (
              <DocSection title="Autres documents"     docs={autreDocs}   dot="bg-slate-400"     missing=""            />
            )}

            {allDocs.length === 0 && (
              <p className="text-sm text-slate-500 italic text-center py-4">Aucun document soumis.</p>
            )}
          </div>
        </div>

        {/* ── Colonne droite : infos + décision ── */}
        <div className="flex flex-col gap-5">

          {/* Demandeur */}
          <div className="card p-5 flex flex-col gap-3">
            <h2 className="font-semibold text-slate-900 text-sm">Demandeur</h2>
            <dl className="flex flex-col gap-3">
              <InfoRow label="Nom">{claim.user?.name ?? <span className="text-slate-500">—</span>}</InfoRow>
              <InfoRow label="Email">
                {claim.user?.email ? (
                  <a href={`mailto:${claim.user.email}`} className="text-primary-600 hover:underline">
                    {claim.user.email}
                  </a>
                ) : <span className="text-slate-500">—</span>}
              </InfoRow>
              <InfoRow label="Compte créé le">
                {claim.user?.createdAt ? formatDate(claim.user.createdAt) : "—"}
              </InfoRow>
            </dl>
          </div>

          {/* N° Ordre */}
          {claim.ordreNumber && (
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                N° Ordre National des Médecins
              </p>
              <p className="font-mono font-semibold text-slate-900 text-sm">{claim.ordreNumber}</p>
              <p className="text-xs text-slate-500 mt-1">À vérifier auprès du CNOM Maroc</p>
            </div>
          )}

          {/* Décision / résultat */}
          <div className="card p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-slate-900 text-sm">
              {isPending ? "Décision" : "Résultat de l'examen"}
            </h2>

            {isPending && isUnclaimed ? (
              <ClaimActions claimId={claim.id} />
            ) : isPending && !isUnclaimed ? (
              <>
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <svg viewBox="0 0 16 16" fill="none" stroke="#d97706" strokeWidth="1.75"
                    className="w-5 h-5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11h.01"/>
                  </svg>
                  <p className="text-sm text-amber-800">
                    Cette fiche a été revendiquée par un autre compte entre-temps.
                  </p>
                </div>
                <ClaimActions claimId={claim.id} />
              </>
            ) : claim.status === "APPROVED" ? (
              <div className="flex items-center gap-3 bg-secondary-50 border border-secondary-200 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5"
                    className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 8l4 4 7-7"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-secondary-800">Revendication approuvée</p>
                  <p className="text-xs text-secondary-600 mt-0.5">
                    {claim.reviewedAt && `Le ${formatDate(claim.reviewedAt)}`}
                    {claim.reviewer?.name && ` par ${claim.reviewer.name}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5"
                      className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3l10 10M13 3L3 13"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-red-800">Revendication refusée</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      {claim.reviewedAt && `Le ${formatDate(claim.reviewedAt)}`}
                      {claim.reviewer?.name && ` par ${claim.reviewer.name}`}
                    </p>
                  </div>
                </div>
                {claim.adminNote && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Motif du refus</p>
                    <p className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-800">
                      {claim.adminNote}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
