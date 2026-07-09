import { NextResponse } from "next/server";
import { tryGetSession } from "@/lib/dal";
import { readDocumentFile } from "@/lib/document-storage";

/*
 * Accès aux pièces justificatives (CIN, diplômes…) stockées en privé.
 * Réservé aux administrateurs — seuls écrans qui consultent ces documents.
 * Le navigateur de l'admin transmet le cookie de session avec la requête
 * <img>/<a>, ce qui autorise le streaming inline.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { filename } = await params;
  const file = await readDocumentFile(filename);
  if (!file) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type":           file.contentType,
      "Content-Disposition":    "inline",
      "Cache-Control":          "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
