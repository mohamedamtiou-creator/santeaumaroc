/**
 * Diagnostic d'envoi d'e-mail Resend.
 *
 * Usage :
 *   tsx --env-file=.env scripts/test-email.ts destinataire@exemple.com
 *
 * En prod, lancer avec l'environnement de prod chargé (mêmes variables que l'app).
 * Le script n'avale AUCUNE erreur : il affiche la réponse/erreur brute de Resend.
 */
import { Resend } from "resend";

const to = process.argv[2];

function mask(v?: string) {
  if (!v) return "(absente)";
  if (v.length <= 8) return `${v.slice(0, 2)}…`;
  return `${v.slice(0, 5)}…${v.slice(-2)} (len=${v.length})`;
}

async function main() {
  console.log("── Variables d'environnement ─────────────────");
  console.log("RESEND_API_KEY :", mask(process.env.RESEND_API_KEY));
  console.log("RESEND_FROM    :", process.env.RESEND_FROM ?? "(absente)");
  console.log("EMAIL_FROM     :", process.env.EMAIL_FROM ?? "(absente)");
  console.log("──────────────────────────────────────────────");

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY est absente — l'app ne peut pas s'authentifier auprès de Resend.");
    process.exit(1);
  }
  if (!to) {
    console.error("❌ Précisez un destinataire : tsx --env-file=.env scripts/test-email.ts vous@exemple.com");
    process.exit(1);
  }

  const from =
    process.env.RESEND_FROM ?? process.env.EMAIL_FROM ?? "SantéauMaroc <onboarding@resend.dev>";

  const resend = new Resend(process.env.RESEND_API_KEY);

  console.log(`Envoi d'un e-mail de test depuis « ${from} » vers « ${to} »…`);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Test d'envoi — SantéauMaroc",
    html: "<p>Ceci est un e-mail de test envoyé par scripts/test-email.ts.</p>",
  });

  if (error) {
    console.error("❌ Resend a renvoyé une erreur :");
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log("✅ Accepté par Resend. ID :", data?.id);
  console.log("→ Vérifiez maintenant l'onglet « Emails » du dashboard Resend pour le statut de livraison (delivered / bounced / …).");
}

main().catch((e) => {
  console.error("❌ Exception inattendue :", e);
  process.exit(1);
});
