import { NextRequest, NextResponse } from "next/server";
import { tryGetSession } from "@/lib/dal";
import { rateLimit } from "@/lib/rate-limit";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { saveDocumentFile, DocumentValidationError } from "@/lib/document-storage";

export async function POST(req: NextRequest) {
  const e = getDictionary(await getLocale()).dashboard.errors;

  // Authentification suffisante : aucun profil requis (F-04 — découplage).
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") {
    return NextResponse.json({ error: e.unauthorized }, { status: 401 });
  }

  // 20 uploads de documents par heure par utilisateur
  const limit = rateLimit(`upload-doc:${session.userId}`, 20, 60 * 60 * 1_000);
  if (!limit.success) {
    return NextResponse.json({ error: e.tooManyUploads }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: e.noFile }, { status: 400 });
  }

  try {
    // Stockage privé hors /public (F-03) ; URL d'accès via route protégée.
    const saved = await saveDocumentFile(file, session.userId);
    return NextResponse.json(saved);
  } catch (err) {
    if (err instanceof DocumentValidationError && err.reason === "TOO_LARGE") {
      return NextResponse.json({ error: e.docSize }, { status: 400 });
    }
    return NextResponse.json({ error: e.docFormat }, { status: 400 });
  }
}
