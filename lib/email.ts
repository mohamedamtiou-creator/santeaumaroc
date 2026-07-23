import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// En dev : utilise l'adresse de test Resend si le domaine n'est pas encore vérifié
const FROM =
  process.env.RESEND_FROM ?? process.env.EMAIL_FROM ?? "SantéauMaroc <onboarding@resend.dev>";

// Destinataire des notifications internes (leads, demandes commerciales).
const ADMIN_TO =
  process.env.ADMIN_EMAIL ?? process.env.LEADS_EMAIL ?? "contact@santeaumaroc.com";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/* ──────────────────────────────────────────────
 * Design tokens — alignés sur la charte « Medical Clarity »
 * ────────────────────────────────────────────── */
const C = {
  primary: "#2563eb", // bleu médical (CTA principal)
  primaryDark: "#1e3a8a",
  emerald: "#059669", // vert santé (CTA positif / succès)
  emeraldDark: "#047857",
  ink: "#0f172a", // titres
  body: "#475569", // texte courant (contraste AA)
  muted: "#64748b", // méta / pied de page (contraste AA)
  faint: "#94a3b8",
  line: "#e2e8f0", // bordures
  page: "#eef2f7", // fond de la page
  panel: "#f8fafc", // fonds de cartes/pied de page
  white: "#ffffff",
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

async function send(payload: Parameters<typeof resend.emails.send>[0]) {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    console.error("[Resend] Échec d'envoi →", JSON.stringify(error));
    throw new Error(error.message);
  }
  console.log("[Resend] E-mail envoyé →", data?.id);
}

/* ──────────────────────────────────────────────
 * Coquille HTML — table-based, compatible Gmail / Outlook / Apple Mail / mobile
 * ────────────────────────────────────────────── */

/** Texte d'aperçu (preheader) affiché dans la boîte de réception, masqué dans le corps. */
function preheaderBlock(text: string) {
  if (!text) return "";
  const spacer = "&#847;&zwnj;&nbsp;".repeat(60); // pousse le vrai contenu hors de l'aperçu
  return `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.page};">${text}${spacer}</div>`;
}

function emailLayout(content: string, preheader = "") {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>SantéauMaroc</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
    img{-ms-interpolation-mode:bicubic;border:0;line-height:100%;outline:none;text-decoration:none;}
    a{color:${C.primary};}
    @media only screen and (max-width:600px){
      .sm-full{width:100%!important;max-width:100%!important;}
      .sm-px{padding-left:24px!important;padding-right:24px!important;}
      .sm-py{padding-top:28px!important;padding-bottom:28px!important;}
      .sm-btn a{display:block!important;width:auto!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${C.page};font-family:${FONT};">
  ${preheaderBlock(preheader)}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${C.page};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="sm-full" style="width:600px;max-width:600px;background-color:${C.white};border-radius:16px;overflow:hidden;border:1px solid ${C.line};">

          <!-- Barre d'accent (dégradé de marque, avec repli couleur pleine) -->
          <tr>
            <td height="4" bgcolor="${C.primary}" style="height:4px;line-height:4px;font-size:0;background:linear-gradient(90deg,${C.primary} 0%,${C.emerald} 100%);">&nbsp;</td>
          </tr>

          <!-- En-tête : wordmark en HTML (aucune image = aucun blocage) -->
          <tr>
            <td class="sm-px" style="padding:28px 40px 4px;">
              <span style="font-size:22px;font-weight:800;letter-spacing:-0.4px;color:${C.primary};">Santé<span style="color:${C.emerald};">au</span>Maroc</span>
              <div style="margin-top:4px;color:${C.faint};font-size:12px;">La santé, à portée de clic.</div>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td class="sm-px sm-py" style="padding:24px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td class="sm-px" style="padding:24px 40px;background-color:${C.panel};border-top:1px solid ${C.line};">
              <p style="margin:0 0 6px;color:${C.muted};font-size:12px;line-height:1.6;">
                © 2026 SantéauMaroc · Annuaire médical marocain
              </p>
              <p style="margin:0;color:${C.faint};font-size:11px;line-height:1.6;">
                Vous recevez cet e-mail suite à une action sur votre compte SantéauMaroc.
                Une question ? Répondez simplement à ce message.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ──────────────────────────────────────────────
 * Composants de contenu réutilisables
 * ────────────────────────────────────────────── */

function heading(text: string) {
  return `<h1 style="margin:0 0 12px;color:${C.ink};font-size:22px;line-height:1.3;font-weight:700;">${text}</h1>`;
}

function paragraph(html: string) {
  return `<p style="margin:0 0 16px;color:${C.body};font-size:15px;line-height:1.7;">${html}</p>`;
}

function greeting(name?: string) {
  return name
    ? paragraph(`Bonjour <strong style="color:${C.ink};">${name}</strong>,`)
    : paragraph("Bonjour,");
}

/** Bouton « bulletproof » : VML pour Outlook, anchor pour les autres clients. */
function ctaButton(href: string, label: string, color = C.primary) {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="sm-btn" style="margin:24px 0 4px;">
    <tr>
      <td align="center" bgcolor="${color}" style="border-radius:10px;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:48px;v-text-anchor:middle;width:300px;" arcsize="21%" strokecolor="${color}" fillcolor="${color}">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:${FONT};font-size:15px;font-weight:bold;">${label}</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-- -->
        <a href="${href}" style="display:inline-block;padding:14px 34px;color:#ffffff;font-family:${FONT};font-size:15px;font-weight:600;line-height:20px;text-decoration:none;border-radius:10px;">${label}</a>
        <!--<![endif]-->
      </td>
    </tr>
  </table>`;
}

function fallbackLink(url: string) {
  return `<p style="margin:16px 0 0;color:${C.faint};font-size:12px;line-height:1.6;">
    Le bouton ne fonctionne pas ? Copiez-collez ce lien dans votre navigateur :<br/>
    <a href="${url}" style="color:${C.primary};word-break:break-all;">${url}</a>
  </p>`;
}

type NoteVariant = "success" | "info" | "warning" | "danger";
const NOTE_STYLES: Record<NoteVariant, { bg: string; border: string; text: string }> = {
  success: { bg: "#f0fdf4", border: C.emerald, text: "#065f46" },
  info: { bg: "#eff6ff", border: C.primary, text: "#1e3a8a" },
  warning: { bg: "#fffbeb", border: "#d97706", text: "#92610a" },
  danger: { bg: "#fef2f2", border: "#dc2626", text: "#991b1b" },
};

/** Encadré coloré (note du relecteur, motif de refus, rappel important…). */
function noteBox(variant: NoteVariant, html: string, label?: string) {
  const s = NOTE_STYLES[variant];
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
    <tr>
      <td style="background-color:${s.bg};border-left:3px solid ${s.border};border-radius:0 8px 8px 0;padding:14px 16px;">
        ${label ? `<p style="margin:0 0 4px;color:${s.text};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">${label}</p>` : ""}
        <p style="margin:0;color:${s.text};font-size:14px;line-height:1.6;">${html}</p>
      </td>
    </tr>
  </table>`;
}

/** Carte de détails : liste label/valeur (RDV, virement, référence de ticket…). */
function detailCard(rows: Array<[string, string | null | undefined]>, opts?: { accent?: string }) {
  const visible = rows.filter(([, v]) => v);
  const body = visible
    .map(([label, value], i) => {
      const divider = i > 0 ? `border-top:1px solid ${C.line};` : "";
      return `<tr>
          <td style="padding:11px 0;${divider}color:${C.muted};font-size:12px;text-transform:uppercase;letter-spacing:0.03em;width:120px;vertical-align:top;">${label}</td>
          <td style="padding:11px 0 11px 16px;${divider}color:${C.ink};font-size:14px;font-weight:600;line-height:1.5;vertical-align:top;">${value}</td>
        </tr>`;
    })
    .join("");
  const accentBorder = opts?.accent ? `border-left:3px solid ${opts.accent};` : "";
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${C.panel};border:1px solid ${C.line};${accentBorder}border-radius:12px;margin:0 0 24px;">
    <tr><td style="padding:2px 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${body}
      </table>
    </td></tr>
  </table>`;
}

function sanitizeCallbackUrl(raw?: string): string {
  if (!raw) return "";
  try {
    const appOrigin = new URL(APP_URL).origin;
    const parsed = new URL(raw, appOrigin);
    // Only allow same-origin paths — never redirect to external domains
    if (parsed.origin !== appOrigin) return "";
    return parsed.pathname + parsed.search;
  } catch {
    return "";
  }
}

/* ──────────────────────────────────────────────
 * Comptes & authentification
 * ────────────────────────────────────────────── */

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
  callbackUrl?: string,
) {
  const base = `${APP_URL}/auth/verify-email?token=${token}`;
  const safePath = sanitizeCallbackUrl(callbackUrl);
  const url = safePath ? `${base}&callbackUrl=${encodeURIComponent(safePath)}` : base;
  await send({
    from: FROM,
    to: email,
    subject: "Confirmez votre adresse e-mail — SantéauMaroc",
    html: emailLayout(
      `
      ${heading("Confirmez votre adresse e-mail")}
      ${greeting(name)}
      ${paragraph("Bienvenue sur SantéauMaroc ! Il ne reste qu'une étape : confirmez votre adresse pour activer votre compte et commencer à prendre rendez-vous.")}
      ${ctaButton(url, "Confirmer mon adresse")}
      ${fallbackLink(url)}
      ${paragraph(`<span style="color:${C.faint};font-size:12px;">Ce lien expire dans <strong>24 heures</strong>. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail.</span>`)}
    `,
      "Plus qu'une étape pour activer votre compte SantéauMaroc.",
    ),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${APP_URL}/auth/reinitialiser-mot-de-passe?token=${token}`;
  await send({
    from: FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe — SantéauMaroc",
    html: emailLayout(
      `
      ${heading("Réinitialisez votre mot de passe")}
      ${greeting(name)}
      ${paragraph("Nous avons reçu une demande de réinitialisation du mot de passe de votre compte. Cliquez ci-dessous pour en choisir un nouveau.")}
      ${ctaButton(url, "Choisir un nouveau mot de passe", C.emerald)}
      ${fallbackLink(url)}
      ${paragraph(`<span style="color:${C.faint};font-size:12px;">Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez rien demandé, ignorez cet e-mail : votre mot de passe reste inchangé.</span>`)}
    `,
      "Créez un nouveau mot de passe pour votre compte SantéauMaroc.",
    ),
  });
}

/* ──────────────────────────────────────────────
 * Rendez-vous & avis patients
 * ────────────────────────────────────────────── */

export async function sendAppointmentConfirmationEmail(
  email: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
) {
  const url = `${APP_URL}/tableau-de-bord/rendez-vous`;
  await send({
    from: FROM,
    to: email,
    subject: `Rendez-vous confirmé avec ${doctorName} — SantéauMaroc`,
    html: emailLayout(
      `
      ${heading("Votre rendez-vous est confirmé")}
      ${greeting(patientName)}
      ${paragraph("Bonne nouvelle, votre demande de rendez-vous est bien enregistrée. Voici le récapitulatif :")}
      ${detailCard(
        [
          ["Praticien", doctorName],
          ["Date", date],
          ["Heure", time],
        ],
        { accent: C.emerald },
      )}
      ${noteBox("info", "Pensez à arriver quelques minutes en avance et à vous munir de votre carte d'identité et, le cas échéant, de vos documents médicaux.")}
      ${ctaButton(url, "Gérer mon rendez-vous", C.emerald)}
      ${paragraph(`<span style="color:${C.faint};font-size:12px;">Un empêchement ? Prévenez le cabinet au plus tôt afin de libérer le créneau pour un autre patient.</span>`)}
    `,
      `${doctorName} · ${date} à ${time}`,
    ),
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
  const url = `${APP_URL}/avis/${token}`;
  await send({
    from: FROM,
    to: email,
    subject: `Comment s'est passée votre consultation avec ${doctorName} ?`,
    html: emailLayout(
      `
      ${heading("Votre avis compte")}
      ${greeting(patientName)}
      ${paragraph(`Vous avez récemment consulté <strong style="color:${C.ink};">${doctorName}</strong>. En partageant votre expérience, vous aidez d'autres patients à choisir leur médecin en toute confiance. Cela ne prend qu'une minute.`)}
      ${ctaButton(url, "Donner mon avis", C.emerald)}
      ${fallbackLink(url)}
      ${paragraph(`<span style="color:${C.faint};font-size:12px;">Votre avis sera publié sous votre prénom et signalé comme « Consultation vérifiée ». Si vous préférez ne pas répondre, ignorez simplement cet e-mail.</span>`)}
    `,
      `Partagez votre expérience avec ${doctorName} en une minute.`,
    ),
  });
}

/* ──────────────────────────────────────────────
 * Vérification du profil médecin
 * ────────────────────────────────────────────── */

export async function sendVerificationApprovedEmail(email: string, name: string, note?: string) {
  const url = `${APP_URL}/praticien/tableau-de-bord`;
  await send({
    from: FROM,
    to: email,
    subject: "Votre profil est vérifié — SantéauMaroc",
    html: emailLayout(
      `
      ${heading("🎉 Votre profil est vérifié")}
      ${greeting(name)}
      ${paragraph(`Félicitations ! Votre profil médecin a été <strong style="color:${C.emeraldDark};">vérifié</strong>. Vous bénéficiez désormais du badge « Médecin vérifié » et d'une meilleure visibilité dans les résultats de recherche.`)}
      ${note ? noteBox("success", note, "Note de l'équipe") : ""}
      ${ctaButton(url, "Accéder à mon espace", C.emerald)}
      ${fallbackLink(url)}
    `,
      "Félicitations, votre profil médecin est désormais vérifié.",
    ),
  });
}

export async function sendVerificationRejectedEmail(email: string, name: string, reason: string) {
  const url = `${APP_URL}/praticien/tableau-de-bord/verification`;
  await send({
    from: FROM,
    to: email,
    subject: "Vérification de votre profil — informations complémentaires requises",
    html: emailLayout(
      `
      ${heading("Informations complémentaires requises")}
      ${greeting(name)}
      ${paragraph("Après examen de votre dossier, nous ne sommes pas en mesure de valider votre vérification pour le moment.")}
      ${noteBox("danger", reason, "Motif")}
      ${paragraph("Vous pouvez soumettre à nouveau votre demande avec les documents corrigés depuis votre espace praticien.")}
      ${ctaButton(url, "Soumettre à nouveau")}
      ${fallbackLink(url)}
    `,
      "Une précision est nécessaire pour vérifier votre profil.",
    ),
  });
}

/* ──────────────────────────────────────────────
 * Support
 * ────────────────────────────────────────────── */

export async function sendSupportTicketConfirmation(
  email: string,
  name: string,
  ticketId: string,
  subject: string,
) {
  const url = `${APP_URL}/support`;
  await send({
    from: FROM,
    to: email,
    subject: `Demande reçue : ${subject} — SantéauMaroc`,
    html: emailLayout(
      `
      ${heading("Votre demande a bien été reçue")}
      ${greeting(name)}
      ${paragraph("Merci de nous avoir contactés. Notre équipe vous répondra dans les <strong>24 à 48 heures</strong>.")}
      ${detailCard([
        ["Référence", `#${ticketId.slice(0, 8).toUpperCase()}`],
        ["Sujet", subject],
      ])}
      ${ctaButton(url, "Suivre ma demande")}
      ${paragraph(`<span style="color:${C.faint};font-size:12px;">Conservez cette référence pour tout suivi de votre demande.</span>`)}
    `,
      "Nous avons bien reçu votre demande — réponse sous 24 à 48 h.",
    ),
  });
}

export async function sendSupportTicketReply(
  email: string,
  name: string,
  ticketId: string,
  subject: string,
  reply: string,
) {
  const url = `${APP_URL}/support`;
  await send({
    from: FROM,
    to: email,
    subject: `Réponse à votre demande : ${subject} — SantéauMaroc`,
    html: emailLayout(
      `
      ${heading("Réponse à votre demande")}
      ${greeting(name)}
      ${paragraph(`Notre équipe a répondu à votre demande <strong style="color:${C.ink};">${subject}</strong> (réf. #${ticketId.slice(0, 8).toUpperCase()}).`)}
      ${noteBox("success", reply.replace(/\n/g, "<br/>"), "Réponse de notre équipe")}
      ${ctaButton(url, "Voir ma demande", C.emerald)}
      ${fallbackLink(url)}
    `,
      `Notre équipe a répondu à « ${subject} ».`,
    ),
  });
}

/* ──────────────────────────────────────────────
 * Abonnement — tunnel sales-assisté (lead)
 * ────────────────────────────────────────────── */

/** Confirmation au médecin après une demande d'activation d'abonnement (tunnel sales-assisté). */
export async function sendSubscriptionLeadConfirmation(
  email: string,
  name: string,
  planLabel: string,
) {
  const url = `${APP_URL}/tarifs`;
  await send({
    from: FROM,
    to: email,
    subject: `Votre demande d'activation ${planLabel} — SantéauMaroc`,
    html: emailLayout(
      `
      ${heading("Demande bien reçue")}
      ${greeting(name)}
      ${paragraph(`Nous avons bien reçu votre demande d'activation de l'offre <strong style="color:${C.ink};">${planLabel}</strong>. Un conseiller vous recontacte sous <strong>24 heures ouvrées</strong> pour configurer votre compte et vous transmettre une facture conforme (ICE, TVA). Le règlement se fait par virement — aucune carte n'est demandée.`)}
      ${noteBox("success", "✓ Sans engagement &nbsp;·&nbsp; ✓ Activation sous 24 h &nbsp;·&nbsp; ✓ Votre fiche reste gratuite si vous changez d'avis")}
      ${ctaButton(url, "Revoir les offres", C.emerald)}
      ${paragraph(`<span style="color:${C.faint};font-size:12px;">Une question d'ici là ? Répondez simplement à cet e-mail.</span>`)}
    `,
      `Un conseiller vous recontacte sous 24 h pour activer ${planLabel}.`,
    ),
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
  const url = `${APP_URL}/admin`;
  await send({
    from: FROM,
    to: ADMIN_TO,
    subject: `Nouveau lead ${lead.plan} — ${lead.name}`,
    html: emailLayout(
      `
      ${heading("Nouvelle demande d'activation")}
      ${paragraph(`Un médecin souhaite activer l'offre <strong style="color:${C.ink};">${lead.plan}</strong>. À recontacter sous 24 h.`)}
      ${detailCard([
        ["Offre", lead.billing ? `${lead.plan} (${lead.billing})` : lead.plan],
        ["Nom", lead.name],
        ["E-mail", lead.email],
        ["Téléphone", lead.phone],
        ["Ville", lead.city],
        ["Spécialité", lead.specialty],
        ["Message", lead.message],
        ["Référence", `#${lead.id.slice(0, 8).toUpperCase()}`],
      ])}
      ${ctaButton(url, "Ouvrir l'administration")}
    `,
      `${lead.name} — offre ${lead.plan}`,
    ),
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
  const url = `${APP_URL}/praticien/tableau-de-bord/abonnement/${order.reference}`;
  await send({
    from: FROM,
    to: email,
    subject: `Finalisez votre abonnement ${order.planLabel} — virement bancaire`,
    html: emailLayout(
      `
      ${heading("Plus qu'une étape : le virement")}
      ${greeting(name)}
      ${paragraph(`Votre demande d'abonnement <strong style="color:${C.ink};">${order.planLabel}</strong> est enregistrée. Effectuez un virement avec les coordonnées ci-dessous, puis téléversez votre justificatif depuis votre espace. Votre compte sera activé dès validation.`)}
      ${detailCard([
        ["Titulaire", bank.holder],
        ["Banque", bank.bank],
        ["RIB", bank.rib],
        ["IBAN", bank.iban],
        ["SWIFT / BIC", bank.swift],
      ])}
      ${noteBox(
        "info",
        `Montant exact à virer : <strong>${fmtMad(order.amount, order.currency)}</strong><br/>Référence à indiquer : <strong style="font-family:monospace;">${order.reference}</strong>`,
      )}
      ${noteBox("warning", "Indiquez impérativement la référence dans le motif du virement : elle nous permet de rapprocher votre paiement.")}
      ${ctaButton(url, "Téléverser mon justificatif", C.emerald)}
      ${fallbackLink(url)}
    `,
      `Virement de ${fmtMad(order.amount, order.currency)} — réf. ${order.reference}`,
    ),
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
  const url = `${APP_URL}/admin/paiements`;
  await send({
    from: FROM,
    to: ADMIN_TO,
    subject: `Virement à vérifier — ${order.doctorName} (${fmtMad(order.amount, order.currency)})`,
    html: emailLayout(
      `
      ${heading("Justificatif de virement reçu")}
      ${paragraph(`<strong style="color:${C.ink};">${order.doctorName}</strong> a soumis un justificatif pour l'offre <strong>${order.planLabel}</strong>. Vérifiez le virement puis validez pour activer le compte.`)}
      ${detailCard([
        ["Référence", order.reference],
        ["Montant", fmtMad(order.amount, order.currency)],
        ["E-mail", order.email],
        ["Téléphone", order.phone],
      ])}
      ${ctaButton(url, "Vérifier les paiements")}
    `,
      `${order.doctorName} — ${fmtMad(order.amount, order.currency)} à vérifier`,
    ),
  });
}

/** Au médecin : abonnement activé. */
export async function sendSubscriptionActivatedEmail(
  email: string,
  name: string,
  info: { planLabel: string; periodEnd: Date; featured: boolean },
) {
  const url = `${APP_URL}/praticien/tableau-de-bord/abonnement`;
  const endStr = info.periodEnd.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  await send({
    from: FROM,
    to: email,
    subject: `🎉 Votre abonnement ${info.planLabel} est actif — SantéauMaroc`,
    html: emailLayout(
      `
      ${heading("🎉 Votre abonnement est actif")}
      ${greeting(name)}
      ${paragraph(`Votre virement a été validé. Votre offre <strong style="color:${C.ink};">${info.planLabel}</strong> est active jusqu'au <strong>${endStr}</strong>.${info.featured ? " La <strong>mise en avant Premium</strong> est également activée." : ""}`)}
      ${noteBox("success", `✓ Prise de RDV en ligne &nbsp;·&nbsp; ✓ Rappels &nbsp;·&nbsp; ✓ Mise en avant${info.featured ? " Premium" : ""}`)}
      ${ctaButton(url, "Voir mon abonnement", C.emerald)}
      ${fallbackLink(url)}
    `,
      `Votre offre ${info.planLabel} est active jusqu'au ${endStr}.`,
    ),
  });
}

/** Au médecin : virement rejeté (motif). */
export async function sendSubscriptionRejectedEmail(email: string, name: string, reason: string) {
  const url = `${APP_URL}/praticien/tableau-de-bord/abonnement`;
  await send({
    from: FROM,
    to: email,
    subject: "Votre paiement n'a pas pu être validé — SantéauMaroc",
    html: emailLayout(
      `
      ${heading("Paiement non validé")}
      ${greeting(name)}
      ${paragraph("Nous n'avons pas pu valider votre virement pour le moment.")}
      ${noteBox("danger", reason, "Motif")}
      ${paragraph("Vous pouvez téléverser un nouveau justificatif ou nous contacter depuis votre espace.")}
      ${ctaButton(url, "Régulariser mon abonnement")}
      ${fallbackLink(url)}
    `,
      "Une action est nécessaire pour valider votre paiement.",
    ),
  });
}

/* ──────────────────────────────────────────────
 * Espace Questions / Réponses
 * ────────────────────────────────────────────── */

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
  const url = `${APP_URL}/questions/${slug}`;
  await send({
    from: FROM,
    to: email,
    subject: `Un médecin a répondu : « ${questionTitle} »`,
    html: emailLayout(
      `
      ${heading("Vous avez une réponse")}
      ${greeting()}
      ${paragraph(`<strong style="color:${C.ink};">${doctorName}</strong> a publié une réponse à la question que vous suivez :`)}
      ${noteBox("info", `« ${questionTitle} »`)}
      ${ctaButton(url, "Lire la réponse", C.emerald)}
      ${fallbackLink(url)}
      ${paragraph(`<span style="color:${C.faint};font-size:12px;">Les réponses sont des informations générales et ne remplacent pas une consultation médicale.</span>`)}
    `,
      `${doctorName} a répondu à votre question.`,
    ),
  });
}

/** Notifie le demandeur que sa question a été publiée après relecture. */
export async function sendQuestionPublishedEmail(
  email: string,
  questionTitle: string,
  slug: string,
) {
  const url = `${APP_URL}/questions/${slug}`;
  await send({
    from: FROM,
    to: email,
    subject: `Votre question est en ligne : « ${questionTitle} »`,
    html: emailLayout(
      `
      ${heading("Votre question est publiée")}
      ${greeting()}
      ${paragraph(`Votre question <strong style="color:${C.ink};">« ${questionTitle} »</strong> a été relue et publiée. Vous serez notifié dès qu'un médecin vérifié y répondra.`)}
      ${ctaButton(url, "Voir ma question")}
      ${fallbackLink(url)}
    `,
      "Votre question est désormais visible par les médecins.",
    ),
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
  const dashUrl = `${APP_URL}/praticien/tableau-de-bord/reponses`;
  const list = questions
    .slice(0, 5)
    .map(
      (q) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line};">
          <a href="${APP_URL}/questions/${q.slug}" style="color:${C.primary};text-decoration:none;font-size:14px;font-weight:600;line-height:1.5;">${q.title}</a>
        </td></tr>`,
    )
    .join("");
  await send({
    from: FROM,
    to: email,
    subject: `${total} question${total > 1 ? "s" : ""} de patients en attente — ${specialtyName}`,
    html: emailLayout(
      `
      ${heading("Des patients attendent votre expertise")}
      ${paragraph(`${total} question${total > 1 ? "s" : ""} récente${total > 1 ? "s" : ""} en <strong style="color:${C.ink};">${specialtyName}</strong> ${total > 1 ? "n'ont" : "n'a"} pas encore de réponse. En répondant, vous gagnez en visibilité auprès des patients.`)}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 8px;">${list}</table>
      ${ctaButton(dashUrl, "Répondre aux questions", C.emerald)}
      ${paragraph(`<span style="color:${C.faint};font-size:12px;">Vous recevez ce résumé car vous êtes médecin vérifié sur SantéauMaroc.</span>`)}
    `,
      `${total} question${total > 1 ? "s" : ""} en attente dans votre spécialité.`,
    ),
  });
}

/* ──────────────────────────────────────────────
 * Plateforme contributive « Publier un article »
 * ────────────────────────────────────────────── */

const AUTHOR_DASH = () => `${APP_URL}/espace-auteur`;

/** À l'équipe : un article vient d'être soumis à la relecture médicale. */
export async function sendArticleSubmittedAdminEmail(info: {
  articleTitle: string;
  authorName: string;
  postId: string;
}) {
  const url = `${APP_URL}/admin/articles`;
  await send({
    from: FROM,
    to: ADMIN_TO,
    subject: `Article à relire — ${info.authorName}`,
    html: emailLayout(
      `
      ${heading("Nouvel article soumis")}
      ${paragraph(`<strong style="color:${C.ink};">${info.authorName}</strong> a soumis l'article <strong>« ${info.articleTitle} »</strong> à la relecture médicale.`)}
      ${ctaButton(url, "Ouvrir la file de modération")}
    `,
      `${info.authorName} — « ${info.articleTitle} »`,
    ),
  });
}

/** À l'auteur : décision de l'éditeur (approuvé / corrections / refus). */
export async function sendArticleDecisionEmail(
  email: string,
  name: string,
  info: { decision: "APPROVE" | "CHANGES" | "REJECT"; articleTitle: string; note?: string | null },
) {
  const map = {
    APPROVE: {
      subject: `Votre article est approuvé — « ${info.articleTitle} »`,
      title: "🎉 Article approuvé",
      intro: "Bonne nouvelle ! Après relecture médicale, votre article est approuvé et sera publié.",
      color: C.emerald,
      cta: "Voir mon article",
      variant: "success" as NoteVariant,
      preheader: "Votre article a passé la relecture médicale.",
    },
    CHANGES: {
      subject: `Corrections demandées — « ${info.articleTitle} »`,
      title: "Corrections demandées",
      intro:
        "Notre relecteur a demandé quelques ajustements avant publication. Vous pouvez les appliquer puis re-soumettre.",
      color: C.primary,
      cta: "Modifier mon article",
      variant: "warning" as NoteVariant,
      preheader: "Quelques ajustements avant publication.",
    },
    REJECT: {
      subject: `Votre article n'a pas été retenu — « ${info.articleTitle} »`,
      title: "Article non retenu",
      intro: "Après examen, nous ne pouvons pas publier cet article en l'état.",
      color: C.primary,
      cta: "Accéder à mon espace",
      variant: "danger" as NoteVariant,
      preheader: "Décision concernant votre article.",
    },
  }[info.decision];

  await send({
    from: FROM,
    to: email,
    subject: map.subject,
    html: emailLayout(
      `
      ${heading(map.title)}
      ${greeting(name)}
      ${paragraph(map.intro)}
      ${info.note ? noteBox(map.variant, info.note, "Note du relecteur") : ""}
      ${ctaButton(AUTHOR_DASH(), map.cta, map.color)}
      ${fallbackLink(AUTHOR_DASH())}
    `,
      map.preheader,
    ),
  });
}

/** À l'auteur : son article est en ligne. */
export async function sendArticleLiveEmail(
  email: string,
  name: string,
  info: { articleTitle: string; slug: string },
) {
  const url = `${APP_URL}/blog/${info.slug}`;
  await send({
    from: FROM,
    to: email,
    subject: `🚀 Votre article est publié — « ${info.articleTitle} »`,
    html: emailLayout(
      `
      ${heading("🚀 Votre article est en ligne")}
      ${greeting(name)}
      ${paragraph(`Votre article <strong style="color:${C.ink};">« ${info.articleTitle} »</strong> est publié et visible par les lecteurs de SantéauMaroc. Partagez-le pour maximiser sa portée.`)}
      ${ctaButton(url, "Voir mon article", C.emerald)}
      ${fallbackLink(url)}
    `,
      "Votre article est désormais visible par les lecteurs.",
    ),
  });
}

/** À l'auteur : identité vérifiée (badge « Auteur vérifié ») ou dossier à compléter. */
export async function sendAuthorVerificationEmail(
  email: string,
  name: string,
  info: { approved: boolean; note?: string | null },
) {
  if (info.approved) {
    const url = `${AUTHOR_DASH()}/articles/nouveau`;
    await send({
      from: FROM,
      to: email,
      subject: "Vous êtes désormais auteur vérifié — SantéauMaroc",
      html: emailLayout(
        `
        ${heading("🎉 Vous êtes auteur vérifié")}
        ${greeting(name)}
        ${paragraph(`Votre identité professionnelle est <strong style="color:${C.emeraldDark};">vérifiée</strong>. Vous obtenez le badge « Auteur vérifié » et pouvez dès maintenant rédiger et soumettre vos articles.`)}
        ${ctaButton(url, "Écrire mon premier article", C.emerald)}
        ${fallbackLink(url)}
      `,
        "Votre identité est vérifiée — à vous d'écrire !",
      ),
    });
    return;
  }
  const url = `${AUTHOR_DASH()}/verification`;
  await send({
    from: FROM,
    to: email,
    subject: "Vérification auteur — informations complémentaires requises",
    html: emailLayout(
      `
      ${heading("Dossier à compléter")}
      ${greeting(name)}
      ${paragraph("Nous n'avons pas pu valider votre dossier d'auteur pour le moment.")}
      ${info.note ? noteBox("danger", info.note, "Motif") : ""}
      ${ctaButton(url, "Compléter mon dossier")}
      ${fallbackLink(url)}
    `,
      "Une précision est nécessaire pour valider votre dossier d'auteur.",
    ),
  });
}
