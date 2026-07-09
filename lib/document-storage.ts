import "server-only";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

/*
 * Stockage privé des pièces justificatives (CIN, diplômes…).
 * Les fichiers sont écrits HORS de /public — ils ne sont jamais servis
 * directement par le serveur de fichiers. L'accès passe exclusivement par la
 * route protégée GET /api/documents/[filename] (réservée aux admins).
 */

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg":      "jpg",
  "image/jpg":       "jpg",
  "image/png":       "png",
  "image/webp":      "webp",
  "application/pdf":  "pdf",
};
export const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 Mo

const STORAGE_DIR = path.join(process.cwd(), "storage", "documents");
const FILENAME_RE = /^[A-Za-z0-9._-]+$/;
const EXT_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf",
};

export type SavedDocument = { url: string; name: string; size: number; type: string };

/** Erreurs typées pour un mapping de message côté appelant. */
export class DocumentValidationError extends Error {
  constructor(public reason: "UNSUPPORTED_TYPE" | "TOO_LARGE") {
    super(reason);
    this.name = "DocumentValidationError";
  }
}

/** Valide et écrit un fichier dans le stockage privé. Renvoie l'URL d'accès protégée. */
export async function saveDocumentFile(file: File, prefix: string): Promise<SavedDocument> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new DocumentValidationError("UNSUPPORTED_TYPE");
  if (file.size > MAX_DOC_SIZE) throw new DocumentValidationError("TOO_LARGE");

  const safePrefix = prefix.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40) || "doc";
  const filename   = `${safePrefix}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;

  if (!existsSync(STORAGE_DIR)) await mkdir(STORAGE_DIR, { recursive: true });
  await writeFile(path.join(STORAGE_DIR, filename), Buffer.from(await file.arrayBuffer()));

  return { url: `/api/documents/${filename}`, name: file.name, size: file.size, type: file.type };
}

/** Lit un document du stockage privé. Renvoie null si nom invalide ou fichier absent. */
export async function readDocumentFile(
  filename: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!FILENAME_RE.test(filename) || filename.includes("..")) return null;

  const resolved = path.resolve(STORAGE_DIR, filename);
  if (resolved !== path.join(STORAGE_DIR, filename)) return null; // anti-traversée
  if (!existsSync(resolved)) return null;

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = EXT_CONTENT_TYPE[ext] ?? "application/octet-stream";
  const buffer = await readFile(resolved);
  return { buffer, contentType };
}
