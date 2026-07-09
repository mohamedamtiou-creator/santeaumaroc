import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoctorDetail } from "@/features/admin/actions";
import { VerificationPanel } from "./_components/VerificationPanel";
import { ActiveSection } from "./_components/ActiveSection";
import { PlanSection } from "./_components/PlanSection";
import { LocationSection } from "./_components/LocationSection";

export const metadata: Metadata = { title: "Dossier praticien — Admin SantéauMaroc" };

const LOG_LABELS: Record<string, { label: string; cls: string; icon: string }> = {
  SUBMITTED:         { label: "Demande soumise",        cls: "bg-primary-100 text-primary-700",   icon: "M4 4h12v12H4z M4 9h12" },
  DOCUMENTS_UPDATED: { label: "Documents mis à jour",   cls: "bg-slate-100 text-slate-600",       icon: "M4 4h12v12H4z M4 9h12" },
  APPROVED:          { label: "Vérification approuvée", cls: "bg-secondary-100 text-secondary-700", icon: "M2.5 8l4 4 7-7" },
  REJECTED:          { label: "Demande refusée",        cls: "bg-red-100 text-red-600",           icon: "M3 3l10 10M13 3L3 13" },
  REVOKED:           { label: "Vérification révoquée",  cls: "bg-amber-100 text-amber-700",       icon: "M8 5v4M8 11h.01" },
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

function DocPreview({ doc }: { doc: { url: string; name: string; size: number; type: string } }) {
  const isPdf = doc.type === "application/pdf";
  const isImg = doc.type.startsWith("image/");
  const sizeKb = Math.round(doc.size / 1024);
  return (
    <a
      href={doc.url} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-sm transition-all"
    >
      {/* Thumbnail */}
      <div className="h-32 bg-slate-50 flex items-center justify-center overflow-hidden">
        {isImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-red-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 4h16l8 8v24H8V4z M24 4v8h8"/>
              <path d="M12 22h16M12 27h10"/>
            </svg>
            <span className="text-xs font-bold text-red-500 uppercase">PDF</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="px-3 py-2 bg-white border-t border-slate-100">
        <p className="text-xs font-medium text-slate-700 truncate" title={doc.name}>{doc.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sizeKb} Ko · {isPdf ? "PDF" : doc.type.split("/")[1].toUpperCase()}</p>
      </div>
    </a>
  );
}

export default async function AdminDoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doctor = await getDoctorDetail(id);
  if (!doctor) notFound();

  const fullName = [doctor.civilite, doctor.prenom, doctor.nom].filter(Boolean).join(" ") || "Médecin sans nom";
  const initials = [doctor.prenom?.[0], doctor.nom?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const claim    = doctor.claims[0] ?? null;
  const hasPending = claim?.status === "PENDING";
  type DocItem = { url: string; name: string; size: number; type: string; category?: string };
  const allDocs: DocItem[] = Array.isArray(claim?.documents)
    ? (claim.documents as DocItem[])
    : [];
  const cinDocs    = allDocs.filter((d) => d.category === "cin");
  const diplomeDocs = allDocs.filter((d) => d.category === "diplome");
  const autreDocs  = allDocs.filter((d) => !d.category || d.category === "autre");

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/praticiens" className="hover:text-slate-700 transition-colors">Praticiens</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate">{fullName}</span>
      </div>

      {/* Header card */}
      <div className="card p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-5">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 ${
          doctor.isVerified ? "bg-secondary-100 text-secondary-700" : "bg-slate-100 text-slate-500"
        }`}>
          {doctor.avatar
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={doctor.avatar} alt={fullName} className="w-full h-full object-cover rounded-2xl" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
            {doctor.isVerified && (
              <span className="badge-verified inline-flex items-center gap-1">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 6l3 3 5-5"/>
                </svg>
                Vérifié
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{doctor.specialty?.name ?? "—"} · {doctor.city?.name ?? "—"}</p>
          <p className="text-sm text-slate-500 mt-0.5">{doctor.user?.email ?? "—"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Inscrit {doctor.user?.createdAt ? formatDate(doctor.user.createdAt) : "—"}
            </span>
            {doctor.experience && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{doctor.experience} ans d&apos;expérience</span>
            )}
            <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full">
              {doctor.isActive ? <span className="text-secondary-600 font-medium">Actif</span> : <span className="text-red-500 font-medium">Désactivé</span>}
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/praticiens/${doctor.slug}`} target="_blank" className="text-xs font-semibold text-slate-500 hover:text-primary-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-primary-200 transition-colors">
            Voir fiche →
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* LEFT — Documents + claim message */}
        <div className="flex flex-col gap-5">
          {/* Claim message */}
          {claim?.message && (
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h12v9H4z M4 13l3 3h9"/>
                </svg>
                Message du praticien
              </h2>
              <blockquote className="text-sm text-slate-600 leading-relaxed border-s-2 border-primary-200 ps-3 italic">
                {claim.message}
              </blockquote>
              {claim.updatedAt && (
                <p className="text-xs text-slate-500 mt-2">Soumis le {formatDate(claim.updatedAt)}</p>
              )}
            </div>
          )}

          {/* Documents par catégorie */}
          <div className="card p-5 flex flex-col gap-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3h8l4 4v11H5V3z M13 3v4h4"/>
              </svg>
              Documents justificatifs
            </h2>

            {/* CIN */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${cinDocs.length > 0 ? "bg-secondary-500" : "bg-red-400"}`} aria-hidden="true" />
                Pièce d&apos;identité (CIN)
                {cinDocs.length === 0 && <span className="text-red-400 font-normal normal-case tracking-normal ms-1">— non fournie</span>}
              </p>
              {cinDocs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cinDocs.map((doc, i) => <DocPreview key={i} doc={doc} />)}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Aucun fichier CIN soumis.</p>
              )}
            </div>

            {/* Numéro Ordre */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${claim?.ordreNumber ? "bg-secondary-500" : "bg-slate-300"}`} aria-hidden="true" />
                N° Ordre National des Médecins
                {!claim?.ordreNumber && !diplomeDocs.length && (
                  <span className="text-slate-500 font-normal normal-case tracking-normal ms-1">— non renseigné</span>
                )}
              </p>
              {claim?.ordreNumber ? (
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-lg">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-4 h-4 text-secondary-600 shrink-0" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="8" cy="8" r="7"/><path d="M5 8l2.5 2.5L11 5.5"/>
                  </svg>
                  <span className="text-sm font-bold text-secondary-800 tracking-wider">{claim.ordreNumber}</span>
                  <span className="text-xs text-secondary-600">à vérifier sur cnom.ma</span>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Non renseigné.</p>
              )}
            </div>

            {/* Diplôme */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${diplomeDocs.length > 0 ? "bg-secondary-500" : "bg-slate-300"}`} aria-hidden="true" />
                Diplôme de médecine
                {diplomeDocs.length === 0 && claim?.ordreNumber && (
                  <span className="text-slate-500 font-normal normal-case tracking-normal ms-1">— remplacé par le n° Ordre</span>
                )}
              </p>
              {diplomeDocs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {diplomeDocs.map((doc, i) => <DocPreview key={i} doc={doc} />)}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  {claim?.ordreNumber ? "Non requis (n° Ordre fourni)." : "Aucun diplôme soumis."}
                </p>
              )}
            </div>

            {/* Autres documents */}
            {autreDocs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Autres documents</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {autreDocs.map((doc, i) => <DocPreview key={i} doc={doc} />)}
                </div>
              </div>
            )}

            {allDocs.length === 0 && !claim?.ordreNumber && (
              <div className="flex items-center gap-3 py-4 text-center justify-center text-slate-500">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="w-8 h-8 text-slate-200" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 3h8l4 4v11H5V3z M13 3v4h4"/>
                </svg>
                <p className="text-sm">Aucun document soumis</p>
              </div>
            )}
          </div>

          {/* Admin note from last review */}
          {claim?.adminNote && claim.status !== "PENDING" && (
            <div className={`card p-4 border ${claim.status === "APPROVED" ? "border-secondary-200 bg-secondary-50" : "border-red-200 bg-red-50"}`}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5 ${claim.status === 'APPROVED' ? 'text-secondary-600' : 'text-red-600'}">
                {claim.status === "APPROVED" ? "Note d'approbation" : "Motif du refus"}
              </p>
              <p className="text-sm text-slate-700">{claim.adminNote}</p>
              {claim.reviewer && (
                <p className="text-xs text-slate-500 mt-1.5">Par {claim.reviewer.name} · {formatDate(claim.updatedAt ?? new Date())}</p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Visibilité (étape 1) → Vérification (étape 2) → Historique */}
        <div className="flex flex-col gap-5">
          {/* Étape 1 : Visibilité */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <h2 className="font-semibold text-slate-900">Visibilité dans l&apos;annuaire</h2>
            </div>
            <ActiveSection doctorId={doctor.id} isActive={doctor.isActive} isVerified={doctor.isVerified} />
          </div>

          {/* Plan & abonnement (gating Pro) */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full bg-secondary-600 text-white flex items-center justify-center shrink-0">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="12" height="8" rx="1.5"/><path d="M2 7h12"/></svg>
              </span>
              <h2 className="font-semibold text-slate-900">Plan &amp; abonnement</h2>
            </div>
            <PlanSection doctorId={doctor.id} plan={doctor.plan} />
          </div>

          {/* Localisation / coordonnées GPS (SEO local + schema geo) */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full bg-terra-600 text-white flex items-center justify-center shrink-0">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z"/>
                  <circle cx="8" cy="6" r="1.5"/>
                </svg>
              </span>
              <h2 className="font-semibold text-slate-900">Localisation</h2>
            </div>
            <LocationSection
              doctorId={doctor.id}
              adresse={doctor.adresse}
              cityName={doctor.city?.name ?? ""}
              latitude={doctor.latitude}
              longitude={doctor.longitude}
            />
          </div>

          {/* Étape 2 : Badge vérifié */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                doctor.isActive ? "bg-secondary-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>2</span>
              <h2 className={`font-semibold ${doctor.isActive ? "text-slate-900" : "text-slate-500"}`}>
                Badge « Médecin vérifié »
              </h2>
            </div>
            <VerificationPanel
              doctorId={doctor.id}
              isVerified={doctor.isVerified}
              isActive={doctor.isActive}
              hasPending={hasPending}
            />
          </div>

          {/* History */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Historique</h2>
            {doctor.verificationLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Aucune action enregistrée</p>
            ) : (
              <div className="relative">
                <div className="absolute start-3 top-1 bottom-1 w-px bg-slate-100" aria-hidden="true" />
                <div className="flex flex-col gap-4">
                  {doctor.verificationLogs.map((log) => {
                    const meta = LOG_LABELS[log.action] ?? { label: log.action, cls: "bg-slate-100 text-slate-600", icon: "M8 5v4M8 11h.01" };
                    return (
                      <div key={log.id} className="flex gap-3 ps-7 relative">
                        <div className={`absolute start-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${meta.cls}`}>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                            <path d={meta.icon}/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <p className="text-sm font-medium text-slate-800">{meta.label}</p>
                          {log.note && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{log.note}</p>}
                          <div className="flex items-center gap-1.5 mt-1">
                            <p className="text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                            {log.admin?.name && (
                              <>
                                <span className="text-slate-200">·</span>
                                <p className="text-xs text-slate-500">{log.admin.name}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
