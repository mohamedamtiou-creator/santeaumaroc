import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { tryGetSession } from "@/lib/dal";
import { rateLimit } from "@/lib/rate-limit";
import { canContribute } from "@/lib/contributor";

/*
 * Upload d'images d'article (couverture, illustrations) par les contributeurs.
 * Stockage PUBLIC (public/uploads/articles/) — ce sont des médias éditoriaux
 * destinés à être servis, contrairement aux licences (stockage privé).
 */

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 4 * 1024 * 1024; // 4 Mo

export async function POST(req: NextRequest) {
  const session = await tryGetSession();
  if (!session?.userId || !canContribute(session.role)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  const limit = rateLimit(`upload-article-media:${session.userId}`, 40, 60 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json({ error: "Trop d'envois. Réessayez plus tard." }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Format non supporté (JPG, PNG ou WebP)." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 4 Mo)." }, { status: 400 });
  }

  const filename = `${session.userId.slice(0, 8)}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/articles/${filename}` });
}
