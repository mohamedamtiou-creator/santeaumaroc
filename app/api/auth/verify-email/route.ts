import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/features/auth/actions";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/connexion?error=invalid-token", request.url));
  }

  const result = await verifyEmail(token);

  if (result.success) {
    return NextResponse.redirect(new URL("/connexion?verified=1", request.url));
  }

  return NextResponse.redirect(
    new URL(`/connexion?error=${encodeURIComponent(result.error ?? "error")}`, request.url)
  );
}
