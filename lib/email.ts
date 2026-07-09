import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// En dev : utilise l'adresse de test Resend si le domaine n'est pas encore vérifié
const FROM =
  process.env.EMAIL_FROM ?? "SantéauMaroc <onboarding@resend.dev>";

// Destinataire des notifications internes (leads, demandes commerciales).
const ADMIN_TO =
  process.env.ADMIN_EMAIL ?? process.env.LEADS_EMAIL ?? "contact@santeaumaroc.com";

async function send(payload: Parameters<typeof resend.emails.send>[0]) {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    console.error("[Resend] Échec d'envoi →", JSON.stringify(error));
    throw new Error(error.message);
  }
  console.log("[Resend] E-mail envoyé →", data?.id);
}

function emailLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 58%,#047857 100%);padding:24px 32px;">
      <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">Santé<span style="color:#6ee7b7;">au</span>Maroc</span>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.65);font-size:12px;">La santé, à portée de clic.</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #f1f5f9;background:#f8fafc;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">
        © 2026 SantéauMaroc &nbsp;·&nbsp; Annuaire médical marocain<br/>
        Vous recevez cet e-mail car vous avez créé un compte sur SantéauMaroc.
      </p>
    </div>

  </div>
</body>
</html>`;
}

function ctaButton(href: string, label: string, color = "#2563eb") {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:8px 0;">${label}</a>`;
}

function fallbackLink(url: string) {
  return `<p style="margin:20px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
    Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
    <a href="${url}" style="color:#2563eb;word-break:break-all;">${url}</a>
  </p>`;
}

function sanitizeCallbackUrl(raw?: string): string {
  if (!raw) return "";
  try {
    const appOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").origin;
    const parsed = new URL(raw, appOrigin);
    // Only allow same-origin paths — never redirect to external domains
    if (parsed.origin !== appOrigin) return "";
    return parsed.pathname + parsed.search;
  } catch {
    return "";
  }
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
  callbackUrl?: string,
) {
  const base     = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
  const safePath = sanitizeCallbackUrl(callbackUrl);
  const url      = safePath ? `${base}&callbackUrl=${encodeURIComponent(safePath)}` : base;
  await send({
    from: FROM,
    to: email,
    subject: "Confirmez votre adresse e-mail — SantéauMaroc",
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Confirmez votre e-mail</h2>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        Merci de vous être inscrit sur SantéauMaroc. Cliquez sur le bouton ci-dessous pour activer votre compte.
      </p>
      ${ctaButton(url, "Confirmer mon adresse e-mail")}
      ${fallbackLink(url)}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;">Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez cet e-mail.</p>
    `),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reinitialiser-mot-de-passe?token=${token}`;
  await send({
    from: FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe — SantéauMaroc",
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Réinitialisez votre mot de passe</h2>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte SantéauMaroc.
      </p>
      ${ctaButton(url, "Réinitialiser mon mot de passe", "#047857")}
      ${fallbackLink(url)}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;">Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.</p>
    `),
  });
}

export async function sendVerificationApprovedEmail(
  email: string,
  name: string,
  note?: string
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/praticien/tableau-de-bord`;
  await send({
    from: FROM,
    to: email,
    subject: "Votre profil a été vérifié — SantéauMaroc",
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">🎉 Profil vérifié !</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        Félicitations ! Votre profil médecin sur SantéauMaroc a été <strong style="color:#047857;">vérifié</strong>.
        Vous bénéficiez maintenant du badge « Médecin vérifié » et d'une meilleure visibilité dans les résultats de recherche.
      </p>
      ${note ? `<div style="background:#f0fdf4;border-left:3px solid #047857;padding:12px 16px;border-radius:6px;margin:0 0 20px;">
        <p style="margin:0;color:#065f46;font-size:13px;"><strong>Note de l'équipe :</strong> ${note}</p>
      </div>` : ""}
      ${ctaButton(url, "Accéder à mon espace", "#047857")}
      ${fallbackLink(url)}
    `),
  });
}

export async function sendVerificationRejectedEmail(
  email: string,
  name: string,
  reason: string
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/praticien/tableau-de-bord/verification`;
  await send({
    from: FROM,
    to: email,
    subject: "Demande de vérification — Informations complémentaires requises",
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Demande de vérification</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        Après examen de votre dossier, nous ne sommes pas en mesure de valider votre vérification pour le moment.
      </p>
      <div style="background:#fef2f2;border-left:3px solid #dc2626;padding:12px 16px;border-radius:6px;margin:0 0 20px;">
        <p style="margin:0;color:#991b1b;font-size:13px;"><strong>Motif :</strong> ${reason}</p>
      </div>
      <p style="color:#64748b;font-size:13px;margin:0 0 20px;">
        Vous pouvez soumettre à nouveau votre demande avec les documents corrigés depuis votre espace praticien.
      </p>
      ${ctaButton(url, "Soumettre à nouveau", "#2563eb")}
      ${fallbackLink(url)}
    `),
  });
}

export async function sendSupportTicketConfirmation(
  email: string,
  name: string,
  ticketId: string,
  subject: string,
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/support`;
  await send({
    from: FROM,
    to: email,
    subject: `Demande reçue : ${subject} — SantéauMaroc`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Votre demande a été reçue</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        Nous avons bien reçu votre demande d'aide. Notre équipe vous répondra dans les <strong>24 à 48 heures</strong>.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Référence</p>
        <p style="margin:0;color:#1e293b;font-size:15px;font-weight:700;font-family:monospace;">#${ticketId.slice(0, 8).toUpperCase()}</p>
        <p style="margin:6px 0 0;color:#64748b;font-size:13px;">${subject}</p>
      </div>
      ${ctaButton(url, "Suivre ma demande")}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;">Conservez cette référence pour tout suivi de votre demande.</p>
    `),
  });
}

export async function sendSupportTicketReply(
  email: string,
  name: string,
  ticketId: string,
  subject: string,
  reply: string,
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/support`;
  await send({
    from: FROM,
    to: email,
    subject: `Réponse à votre demande : ${subject} — SantéauMaroc`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Réponse à votre demande</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        L'équipe SantéauMaroc a répondu à votre demande <strong style="color:#1e293b;">${subject}</strong>.
      </p>
      <div style="background:#f0fdf4;border-left:3px solid #059669;padding:16px;border-radius:0 8px 8px 0;margin:0 0 24px;">
        <p style="margin:0 0 6px;color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Réponse de notre équipe</p>
        <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.7;">${reply.replace(/\n/g, "<br/>")}</p>
      </div>
      ${ctaButton(url, "Voir ma demande", "#059669")}
      ${fallbackLink(url)}
    `),
  });
}

/** Confirmation au médecin après une demande d'activation d'abonnement (tunnel sales-assisté). */
export async function sendSubscriptionLeadConfirmation(
  email: string,
  name: string,
  planLabel: string,
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/tarifs`;
  await send({
    from: FROM,
    to: email,
    subject: `Votre demande d'activation ${planLabel} — SantéauMaroc`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Demande bien reçue&nbsp;!</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        Nous avons bien reçu votre demande d'activation de l'offre <strong style="color:#1e293b;">${planLabel}</strong>.
        Un conseiller vous recontacte sous <strong>24&nbsp;heures ouvrées</strong> pour configurer votre compte
        et vous transmettre une facture conforme (ICE, TVA). Le règlement se fait par virement — aucune carte n'est demandée.
      </p>
      <div style="background:#f0fdf4;border-left:3px solid #059669;padding:14px 16px;border-radius:0 8px 8px 0;margin:0 0 24px;">
        <p style="margin:0;color:#065f46;font-size:13px;line-height:1.6;">
          ✓ Sans engagement &nbsp;·&nbsp; ✓ Activation sous 24&nbsp;h &nbsp;·&nbsp; ✓ Votre fiche reste gratuite si vous changez d'avis
        </p>
      </div>
      ${ctaButton(url, "Revoir les offres", "#059669")}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;">Une question d'ici là&nbsp;? Répondez simplement à cet e-mail.</p>
    `),
  });
}

/** Notification interne à l'équipe commerciale : nouveau lead d'abonnement. */
export async function sendSubscriptionLeadAdminNotification(lead: {
  id: string;
  plan: string;
  billing?: string | null;
  name: string;
  email: string;
  phone: string;
  city?: string | null;
  specialty?: string | null;
  message?: string | null;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/admin`;
  const row = (label: string, value?: string | null) =>
    value
      ? `<tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;width:120px;vertical-align:top;">${label}</td><td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:600;">${value}</td></tr>`
      : "";
  await send({
    from: FROM,
    to: ADMIN_TO,
    subject: `🩺 Nouveau lead ${lead.plan} — ${lead.name}`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Nouvelle demande d'activation</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        Un médecin souhaite activer l'offre <strong style="color:#1e293b;">${lead.plan}</strong>. À recontacter sous 24&nbsp;h.
      </p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:8px 16px;margin:0 0 20px;">
        ${row("Offre", lead.billing ? `${lead.plan} (${lead.billing})` : lead.plan)}
        ${row("Nom", lead.name)}
        ${row("E-mail", lead.email)}
        ${row("Téléphone", lead.phone)}
        ${row("Ville", lead.city)}
        ${row("Spécialité", lead.specialty)}
        ${row("Message", lead.message)}
        ${row("Référence", `#${lead.id.slice(0, 8).toUpperCase()}`)}
      </table>
      ${ctaButton(url, "Ouvrir l'administration")}
    `),
  });
}

/* ──────────────────────────────────────────────
 * Abonnement par virement bancaire (tunnel self-service Pro)
 * ────────────────────────────────────────────── */

type OrderBank = {
  holder: string;
  bank: string;
  rib: string;
  iban: string;
  swift: string;
};

const fmtMad = (amount: number, currency = "MAD") =>
  `${amount.toLocaleString("fr-FR")} ${currency}`;

/** Au médecin : coordonnées de virement + référence + montant exact. */
export async function sendSubscriptionOrderInstructions(
  email: string,
  name: string,
  order: { reference: string; amount: number; currency: string; planLabel: string },
  bank: OrderBank,
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/praticien/tableau-de-bord/abonnement/${order.reference}`;
  const row = (label: string, value?: string | null) =>
    value
      ? `<tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;width:130px;vertical-align:top;">${label}</td><td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:600;">${value}</td></tr>`
      : "";
  await send({
    from: FROM,
    to: email,
    subject: `Finalisez votre abonnement ${order.planLabel} — virement bancaire`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Plus qu'une étape&nbsp;: le virement</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        Votre demande d'abonnement <strong style="color:#1e293b;">${order.planLabel}</strong> est enregistrée.
        Effectuez un virement avec les coordonnées ci-dessous, puis téléversez votre justificatif depuis votre espace.
        Votre compte sera activé dès validation.
      </p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:8px 16px;margin:0 0 16px;">
        ${row("Titulaire", bank.holder)}
        ${row("Banque", bank.bank)}
        ${row("RIB", bank.rib)}
        ${row("IBAN", bank.iban)}
        ${row("SWIFT / BIC", bank.swift)}
      </table>
      <div style="background:#eff6ff;border-left:3px solid #2563eb;padding:14px 16px;border-radius:0 8px 8px 0;margin:0 0 20px;">
        <p style="margin:0 0 4px;color:#1e3a8a;font-size:13px;">Montant exact à virer&nbsp;: <strong>${fmtMad(order.amount, order.currency)}</strong></p>
        <p style="margin:0;color:#1e3a8a;font-size:13px;">Référence à indiquer&nbsp;: <strong style="font-family:monospace;">${order.reference}</strong></p>
      </div>
      <p style="margin:0 0 8px;color:#64748b;font-size:13px;">⚠️ Indiquez impérativement la référence dans le motif du virement&nbsp;: elle nous permet de rapprocher votre paiement.</p>
      ${ctaButton(url, "Téléverser mon justificatif", "#059669")}
      ${fallbackLink(url)}
    `),
  });
}

/** À l'équipe : un nouveau virement attend vérification. */
export async function sendSubscriptionOrderAdminNotification(order: {
  reference: string;
  amount: number;
  currency: string;
  planLabel: string;
  doctorName: string;
  email: string;
  phone?: string | null;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/admin/paiements`;
  await send({
    from: FROM,
    to: ADMIN_TO,
    subject: `💳 Virement à vérifier — ${order.doctorName} (${fmtMad(order.amount, order.currency)})`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Justificatif de virement reçu</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        <strong style="color:#1e293b;">${order.doctorName}</strong> a soumis un justificatif pour l'offre
        <strong>${order.planLabel}</strong>. Vérifiez le virement puis validez pour activer le compte.
      </p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:8px 16px;margin:0 0 20px;">
        <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;width:120px;">Référence</td><td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:600;font-family:monospace;">${order.reference}</td></tr>
        <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;">Montant</td><td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:600;">${fmtMad(order.amount, order.currency)}</td></tr>
        <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;">E-mail</td><td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:600;">${order.email}</td></tr>
        ${order.phone ? `<tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;">Téléphone</td><td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:600;">${order.phone}</td></tr>` : ""}
      </table>
      ${ctaButton(url, "Vérifier les paiements")}
    `),
  });
}

/** Au médecin : abonnement activé. */
export async function sendSubscriptionActivatedEmail(
  email: string,
  name: string,
  info: { planLabel: string; periodEnd: Date; featured: boolean },
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/praticien/tableau-de-bord/abonnement`;
  const endStr = info.periodEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  await send({
    from: FROM,
    to: email,
    subject: `🎉 Votre abonnement ${info.planLabel} est actif — SantéauMaroc`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Abonnement activé&nbsp;!</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        Votre virement a été validé. Votre offre <strong style="color:#1e293b;">${info.planLabel}</strong> est
        active jusqu'au <strong>${endStr}</strong>.${info.featured ? " La <strong>mise en avant Premium</strong> est également activée." : ""}
      </p>
      <div style="background:#f0fdf4;border-left:3px solid #059669;padding:14px 16px;border-radius:0 8px 8px 0;margin:0 0 24px;">
        <p style="margin:0;color:#065f46;font-size:13px;line-height:1.6;">
          ✓ Prise de RDV en ligne &nbsp;·&nbsp; ✓ Rappels &nbsp;·&nbsp; ✓ Mise en avant${info.featured ? " Premium" : ""}
        </p>
      </div>
      ${ctaButton(url, "Voir mon abonnement", "#059669")}
      ${fallbackLink(url)}
    `),
  });
}

/** Au médecin : virement rejeté (motif). */
export async function sendSubscriptionRejectedEmail(
  email: string,
  name: string,
  reason: string,
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/praticien/tableau-de-bord/abonnement`;
  await send({
    from: FROM,
    to: email,
    subject: "Votre paiement n'a pas pu être validé — SantéauMaroc",
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Paiement non validé</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/><br/>
        Nous n'avons pas pu valider votre virement pour le moment.
      </p>
      <div style="background:#fef2f2;border-left:3px solid #dc2626;padding:12px 16px;border-radius:6px;margin:0 0 20px;">
        <p style="margin:0;color:#991b1b;font-size:13px;"><strong>Motif&nbsp;:</strong> ${reason}</p>
      </div>
      <p style="color:#64748b;font-size:13px;margin:0 0 20px;">
        Vous pouvez téléverser un nouveau justificatif ou nous contacter depuis votre espace.
      </p>
      ${ctaButton(url, "Régulariser mon abonnement", "#2563eb")}
      ${fallbackLink(url)}
    `),
  });
}

export async function sendAppointmentConfirmationEmail(
  email: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Rendez-vous confirmé avec ${doctorName} — SantéauMaroc`,
    html: `
      <p>Bonjour ${patientName},</p>
      <p>Votre rendez-vous avec <strong>${doctorName}</strong> est confirmé pour le <strong>${date} à ${time}</strong>.</p>
      <p>Pensez à arriver quelques minutes avant l'heure prévue.</p>
    `,
  });
}

/**
 * Demande d'avis post-consultation (collecte d'avis vérifiés).
 * Déclenchée quand le médecin marque le rendez-vous « honoré ».
 * Le lien porte un token : le patient laisse son avis sans se reconnecter,
 * et l'avis est automatiquement rattaché au rendez-vous (= « Consultation vérifiée »).
 */
export async function sendReviewRequestEmail(
  email: string,
  patientName: string,
  doctorName: string,
  token: string,
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/avis/${token}`;
  await send({
    from: FROM,
    to: email,
    subject: `Comment s'est passée votre consultation avec ${doctorName} ?`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Votre avis compte</h2>
      <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour <strong>${patientName}</strong>,<br/><br/>
        Vous avez récemment consulté <strong>${doctorName}</strong>. En partageant votre expérience,
        vous aidez d'autres patients à choisir leur médecin en toute confiance.
        Cela ne prend qu'une minute.
      </p>
      ${ctaButton(url, "Donner mon avis", "#047857")}
      ${fallbackLink(url)}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
        Votre avis sera publié sous votre prénom et signalé comme « Consultation vérifiée ».
        Si vous préférez ne pas répondre, ignorez simplement cet e-mail.
      </p>
    `),
  });
}

/**
 * Notifie le demandeur (et les suiveurs) qu'un médecin a répondu à une question.
 * Échec non bloquant : appelé en best-effort depuis la Server Action de réponse.
 */
export async function sendAnswerPublishedEmail(
  email: string,
  questionTitle: string,
  doctorName: string,
  slug: string,
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/questions/${slug}`;
  await send({
    from: FROM,
    to: email,
    subject: `Un médecin a répondu : « ${questionTitle} »`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Vous avez une réponse</h2>
      <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour,<br/><br/>
        <strong>${doctorName}</strong> a publié une réponse à la question que vous suivez :<br/>
        <strong>« ${questionTitle} »</strong>.
      </p>
      ${ctaButton(url, "Lire la réponse", "#047857")}
      ${fallbackLink(url)}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
        Les réponses sont des informations générales et ne remplacent pas une consultation médicale.
      </p>
    `),
  });
}

/**
 * Digest hebdomadaire au médecin : questions sans réponse dans sa spécialité.
 * Alimente le flywheel de contenu (plus de réponses → plus de pages SEO).
 */
export async function sendDoctorDigestEmail(
  email: string,
  specialtyName: string,
  questions: { title: string; slug: string }[],
  total: number,
) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const dashUrl = `${base}/praticien/tableau-de-bord/reponses`;
  const list = questions
    .slice(0, 5)
    .map(
      (q) =>
        `<li style="margin:0 0 8px;"><a href="${base}/questions/${q.slug}" style="color:#2563eb;text-decoration:none;">${q.title}</a></li>`,
    )
    .join("");
  await send({
    from: FROM,
    to: email,
    subject: `${total} question${total > 1 ? "s" : ""} de patients en attente — ${specialtyName}`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Des patients attendent votre expertise</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.7;">
        ${total} question${total > 1 ? "s" : ""} récente${total > 1 ? "s" : ""} en <strong>${specialtyName}</strong>
        ${total > 1 ? "n'ont" : "n'a"} pas encore de réponse. En répondant, vous gagnez en visibilité auprès des patients.
      </p>
      <ul style="margin:0 0 24px;padding-left:18px;color:#334155;font-size:14px;line-height:1.6;">${list}</ul>
      ${ctaButton(dashUrl, "Répondre aux questions", "#047857")}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
        Vous recevez ce résumé car vous êtes médecin vérifié sur SantéauMaroc.
      </p>
    `),
  });
}

/** Notifie le demandeur que sa question a été publiée après relecture. */
export async function sendQuestionPublishedEmail(
  email: string,
  questionTitle: string,
  slug: string,
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/questions/${slug}`;
  await send({
    from: FROM,
    to: email,
    subject: `Votre question est en ligne : « ${questionTitle} »`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Votre question est publiée</h2>
      <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.7;">
        Bonjour,<br/><br/>
        Votre question <strong>« ${questionTitle} »</strong> a été relue et publiée.
        Vous serez notifié dès qu'un médecin vérifié y répondra.
      </p>
      ${ctaButton(url, "Voir ma question")}
      ${fallbackLink(url)}
    `),
  });
}
