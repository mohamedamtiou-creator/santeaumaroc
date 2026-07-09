import "server-only";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

/*
 * Coordonnées de virement pour les abonnements.
 * Source de vérité : la table `bank_settings` (singleton id="default"),
 * éditée par l'admin dans /admin/paiements. Fallback sur les variables
 * d'environnement (BANK_HOLDER/NAME/RIB/IBAN/SWIFT) si la ligne est vide.
 */

export type BankDetails = {
  holder: string;
  bank: string;
  rib: string;
  iban: string;
  swift: string;
};

export async function getBankDetails(): Promise<BankDetails> {
  const row = await prisma.bankSettings.findUnique({ where: { id: "default" } });
  const env = {
    holder: process.env.BANK_HOLDER ?? "",
    bank: process.env.BANK_NAME ?? "",
    rib: process.env.BANK_RIB ?? "",
    iban: process.env.BANK_IBAN ?? "",
    swift: process.env.BANK_SWIFT ?? "",
  };
  return {
    holder: row?.holder || env.holder,
    bank: row?.bank || env.bank,
    rib: row?.rib || env.rib,
    iban: row?.iban || env.iban,
    swift: row?.swift || env.swift,
  };
}

/** Au moins le RIB ou l'IBAN renseigné → les coordonnées sont exploitables. */
export function bankConfigured(bank: BankDetails): boolean {
  return !!(bank.rib || bank.iban);
}

/** Contenu texte encodé dans le QR code (toutes les infos du virement). */
export function buildQrPayload(
  bank: BankDetails,
  opts: { amount: number; currency: string; reference: string },
): string {
  return [
    `Beneficiaire: ${bank.holder}`,
    `Banque: ${bank.bank}`,
    `RIB: ${bank.rib}`,
    bank.iban ? `IBAN: ${bank.iban}` : "",
    bank.swift ? `SWIFT: ${bank.swift}` : "",
    `Montant: ${opts.amount} ${opts.currency}`,
    `Reference: ${opts.reference}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Génère un QR code SVG (string inline) à partir d'un texte. */
export async function renderQrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, {
    type: "svg",
    margin: 1,
    width: 200,
    errorCorrectionLevel: "M",
  });
}
