import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { tryGetSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};
const MAX_SIZE = 2 * 1024 * 1024; // 2 Mo

export async function POST(req: NextRequest) {
  const e = getDictionary(await getLocale()).dashboard.errors;
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") {
    return NextResponse.json({ error: e.unauthorized }, { status: 401 });
  }

  // 10 uploads par heure par médecin
  const limit = rateLimit(`upload-avatar:${session.userId}`, 10, 60 * 60 * 1_000);
  if (!limit.success) {
    return NextResponse.json({ error: e.tooManyUploads }, { status: 429 });
  }

  const doctor = await prisma.doctor.findUnique({
    where:  { userId: session.userId },
    select: { id: true, avatar: true, slug: true },
  });
  if (!doctor) {
    return NextResponse.json({ error: e.profileNotFound }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: e.noFile }, { status: 400 });
  }
  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json(
      { error: e.avatarFormat },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: e.avatarSize },
      { status: 400 }
    );
  }

  const ext      = ALLOWED_TYPES[file.type];
  const filename = `${doctor.id}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  const filepath  = path.join(uploadDir, filename);

  // Supprimer l'ancien avatar s'il a une extension différente
  if (doctor.avatar) {
    const oldPath = path.join(process.cwd(), "public", doctor.avatar);
    if (existsSync(oldPath) && oldPath !== filepath) {
      await unlink(oldPath).catch(() => null);
    }
  }

  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const avatarUrl = `/uploads/avatars/${filename}`;

  await prisma.doctor.update({
    where: { id: doctor.id },
    data:  { avatar: avatarUrl },
  });

  revalidatePath("/praticien/tableau-de-bord");
  revalidatePath("/praticien/tableau-de-bord/profil");
  if (doctor.slug) revalidatePath(`/praticiens/${doctor.slug}`);

  return NextResponse.json({ url: avatarUrl });
}

export async function DELETE(req: NextRequest) {
  const e = getDictionary(await getLocale()).dashboard.errors;
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") {
    return NextResponse.json({ error: e.unauthorized }, { status: 401 });
  }

  const doctor = await prisma.doctor.findUnique({
    where:  { userId: session.userId },
    select: { id: true, avatar: true, slug: true },
  });
  if (!doctor) {
    return NextResponse.json({ error: e.profileNotFound }, { status: 404 });
  }

  if (doctor.avatar) {
    const oldPath = path.join(process.cwd(), "public", doctor.avatar);
    if (existsSync(oldPath)) await unlink(oldPath).catch(() => null);
  }

  await prisma.doctor.update({
    where: { id: doctor.id },
    data:  { avatar: null },
  });

  revalidatePath("/praticien/tableau-de-bord");
  revalidatePath("/praticien/tableau-de-bord/profil");
  if (doctor.slug) revalidatePath(`/praticiens/${doctor.slug}`);

  return NextResponse.json({ ok: true });
}
