import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionPayload = {
  userId: string;
  role: string;
  expiresAt: Date;
};

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET is not set");
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
  setAuthHint(cookieStore, expiresAt);
}

/**
 * Cookie-indice NON httpOnly, lu côté client par le chrome (Navbar) pour choisir
 * l'UI « Connexion » vs « Mon espace » sans forcer le rendu dynamique du layout.
 * Ne contient aucune donnée sensible (simple présence). Le vrai contrôle d'accès
 * reste le cookie `session` httpOnly + les gardes du proxy.
 */
function setAuthHint(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  expiresAt: Date,
) {
  cookieStore.set("sm_auth", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function updateSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  const payload = await decrypt(cookie);

  if (!cookie || !payload) return null;

  // Re-sign with a fresh expiry — never reuse the old token unchanged.
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newSession = await encrypt({ userId: payload.userId, role: payload.role, expiresAt });

  cookieStore.set("session", newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
  setAuthHint(cookieStore, expiresAt);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("sm_auth");
}
