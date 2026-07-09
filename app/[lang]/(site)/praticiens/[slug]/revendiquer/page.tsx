import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { getDoctorInitials } from "@/lib/utils";
import { ClaimWizard } from "./_components/ClaimWizard";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await prisma.doctor.findUnique({
    where:  { slug },
    select: { prenom: true, nom: true, civilite: true },
  });
  if (!doc) return { title: "Praticien introuvable", robots: { index: false, follow: false } };
  const name = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ");
  return {
    title: `Revendiquer la fiche de ${name} — SantéauMaroc`,
    robots: { index: false, follow: false },
  };
}

/* ── Écrans d'état (carte centrée) ───────────────────────────── */

function StateCard({
  tone, title, text, action,
}: {
  tone: "amber" | "primary";
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  const ring = tone === "amber" ? "bg-amber-50 text-amber-500" : "bg-primary-50 text-primary-600";
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/praticiens" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-6">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Retour à l&apos;annuaire
        </Link>
        <div className="card p-8 text-center">
          <div className={`w-14 h-14 rounded-2xl ${ring} flex items-center justify-center mx-auto mb-4`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-7 h-7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{text}</p>
          {action}
        </div>
      </div>
    </main>
  );
}

/* Écran « dossier reçu » — affiché juste après la soumission (la page se re-rend
 * côté serveur) et à chaque retour sur la page tant que la demande est en attente. */
function ClaimReceivedScreen() {
  const steps = [
    { title: "Dossier reçu", desc: "Vos pièces nous sont parvenues.", done: true },
    { title: "Vérification par notre équipe", desc: "Sous 24 à 48 h ouvrées.", done: false },
    { title: "La fiche est à vous", desc: "Vous gérez votre profil et vos rendez-vous.", done: false },
  ];
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="card p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary-50 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-7 h-7 text-secondary-500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M7.5 12.5l3 3 6-6.5" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-1.5">Demande envoyée&nbsp;!</h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Notre équipe examine votre dossier et vous recevrez un e-mail dès qu&apos;il est traité.
            </p>
          </div>

          <ol className="flex flex-col gap-0 mb-6">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3 pb-4 last:pb-0 relative">
                {i < steps.length - 1 && (
                  <span className="absolute start-[13px] top-7 bottom-0 w-px bg-slate-200" aria-hidden="true" />
                )}
                <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  s.done ? "bg-secondary-500 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                  {s.done ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25"
                      className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 8.5l3.5 3.5L13 4" />
                    </svg>
                  ) : <span className="text-xs font-bold">{i + 1}</span>}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link href="/praticien/tableau-de-bord" className="btn-primary w-full justify-center">
            Accéder à mon espace
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function RevendiquerPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [session, doc] = await Promise.all([
    tryGetSession(),
    prisma.doctor.findUnique({
      where:  { slug },
      select: {
        id: true, slug: true, prenom: true, nom: true, civilite: true,
        userId: true, adresse: true, avatar: true,
        specialty: { select: { name: true } },
        city:      { select: { name: true } },
      },
    }),
  ]);

  if (!doc) notFound();

  /* ── Fiche déjà revendiquée ── */
  if (doc.userId) {
    if (session?.userId && doc.userId === session.userId) redirect("/praticien/tableau-de-bord");
    redirect(`/praticiens/${slug}`);
  }

  const role = session?.role ?? null;

  /* ── Admin : ne peut pas revendiquer ── */
  if (role === "ADMIN") {
    return (
      <StateCard
        tone="amber"
        title="Action indisponible"
        text="Un compte administrateur ne peut pas revendiquer une fiche médecin."
        action={<Link href={`/praticiens/${slug}`} className="btn-primary">Retour à la fiche</Link>}
      />
    );
  }

  let mode: "guest" | "doctor" | "patient" = "guest";
  let prevRejection: string | undefined;

  if (session?.userId) {
    mode = role === "DOCTOR" ? "doctor" : "patient";

    /* Profil publié + demande existante : requêtes parallèles (un seul aller-retour). */
    const [ownProfile, existingClaim] = await Promise.all([
      prisma.doctor.findUnique({
        where:  { userId: session.userId },
        select: { isActive: true, isVerified: true },
      }),
      prisma.doctorClaim.findUnique({
        where:  { doctorId_userId: { doctorId: doc.id, userId: session.userId } },
        select: { status: true, adminNote: true },
      }),
    ]);

    /* Gère déjà un profil publié → bloquer */
    if (ownProfile && (ownProfile.isActive || ownProfile.isVerified)) {
      return (
        <StateCard
          tone="amber"
          title="Vous gérez déjà un profil actif"
          text="Votre compte est déjà associé à un profil médecin publié. Pour toute modification, contactez le support."
          action={<Link href="/praticien/tableau-de-bord" className="btn-primary">Accéder à mon tableau de bord</Link>}
        />
      );
    }

    /* Demande existante */
    if (existingClaim?.status === "PENDING") {
      return <ClaimReceivedScreen />;
    }
    if (existingClaim?.status === "REJECTED") {
      prevRejection = existingClaim.adminNote ?? "Dossier incomplet ou non conforme.";
    }
  }

  /* ── Mise en page principale ── */
  const name     = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ");
  const initials = getDoctorInitials(doc.prenom ?? "", doc.nom ?? "");

  return (
    <main className="min-h-screen bg-slate-50">
      {/* En-tête */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/praticiens/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors shrink-0">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 3L5 8l5 5" />
            </svg>
            Retour à la fiche
          </Link>
          <span className="text-slate-200">/</span>
          <span className="text-sm font-medium text-slate-700 truncate">Revendiquer</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Récupérez votre fiche en quelques minutes</h1>
          <p className="text-slate-500 text-sm">
            Confirmez votre identité, déposez deux justificatifs, et notre équipe valide sous 24 à 48 h ouvrées.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Formulaire (wizard) */}
          <div className="lg:col-span-2">
            <div className="card p-6 md:p-8">
              <ClaimWizard
                ficheId={doc.id}
                ficheSlug={slug}
                fiche={{
                  name,
                  specialty: doc.specialty.name,
                  city:      doc.city.name,
                  adresse:   doc.adresse ?? "",
                  avatar:    doc.avatar,
                  initials,
                }}
                mode={mode}
                prevRejection={prevRejection}
              />
            </div>
          </div>

          {/* Aide */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Documents acceptés</p>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                {[
                  "Carte d'identité nationale (CIN)",
                  "Diplôme de médecine",
                  "N° d'inscription à l'Ordre National des Médecins",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                      className="w-4 h-4 text-secondary-500 shrink-0 mt-px" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 8.5l3.5 3.5L13 4" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">Formats : JPG, PNG, PDF · Max 5 Mo par fichier</p>
            </div>

            <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm text-primary-700">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-5 h-5 shrink-0 mt-0.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="10" cy="10" r="8" /><path d="M10 6v5l3 2" />
              </svg>
              <span>Traitement sous <strong>24 à 48 h ouvrées</strong> après réception de votre dossier complet.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
