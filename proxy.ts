import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

/** Chemins servis hors du segment [lang] (assets, API, fichiers de métadonnées). */
function isPassthrough(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/opengraph-image" ||
    /\.[^/]+$/.test(pathname) // robots.txt, sitemap/*.xml, *.png, favicon.ico, llms.txt…
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPassthrough(pathname)) return NextResponse.next();

  // ── Locale portée par l'URL ────────────────────────────────────────────
  // FR = racine sans préfixe (réécrite en interne vers /fr/* → variante SSG,
  // URL propre conservée). AR = préfixe /ar (mappe nativement sur [lang]=ar).
  let locale: "fr" | "ar" = "fr";
  let bare = pathname; // chemin logique, sans préfixe de locale
  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    locale = "ar";
    bare = pathname === "/ar" ? "/" : pathname.slice(3);
  } else if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    // /fr n'est qu'un chemin interne : les accès publics sont redirigés vers
    // l'URL propre pour éviter le contenu dupliqué.
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/fr" ? "/" : pathname.slice(3);
    return NextResponse.redirect(url, 308);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  // Repli pour les composants encore basés sur getLocale() (transition).
  if (locale === "ar") requestHeaders.set("x-locale", "ar");

  // ── Gardes d'authentification (sur le chemin logique) ───────────────────
  const needsAuthCheck =
    bare.startsWith("/tableau-de-bord") ||
    bare.startsWith("/praticien/tableau-de-bord") ||
    bare.startsWith("/admin") ||
    bare === "/connexion" ||
    bare === "/inscription";

  if (needsAuthCheck) {
    const cookieStore = await cookies();
    const session = await decrypt(cookieStore.get("session")?.value);
    const loginBase = locale === "ar" ? "/ar/connexion" : "/connexion";
    const homeBase = locale === "ar" ? "/ar" : "/";

    const redirectLogin = () => {
      const url = new URL(loginBase, request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    };

    if (bare.startsWith("/praticien/tableau-de-bord")) {
      if (!session?.userId) return redirectLogin();
      if (session.role !== "DOCTOR") return NextResponse.redirect(new URL(homeBase === "/" ? "/tableau-de-bord" : "/ar/tableau-de-bord", request.url));
    } else if (bare.startsWith("/tableau-de-bord")) {
      if (!session?.userId) return redirectLogin();
    } else if (bare.startsWith("/admin")) {
      if (!session?.userId) return redirectLogin();
      if (session.role !== "ADMIN") return NextResponse.redirect(new URL(homeBase, request.url));
    } else if (bare === "/connexion" || bare === "/inscription") {
      if (session?.userId) {
        return NextResponse.redirect(new URL(homeBase === "/" ? "/tableau-de-bord" : "/ar/tableau-de-bord", request.url));
      }
    }
  }

  // ── Réécriture FR → /fr/* (URL propre conservée) ────────────────────────
  if (locale === "fr") {
    const url = request.nextUrl.clone();
    url.pathname = `/fr${bare === "/" ? "" : bare}`;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // AR : /ar/* mappe déjà sur [lang]=ar → simple passage avec en-têtes.
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Tout sauf _next et api (les autres exclusions sont gérées dans isPassthrough).
  matcher: ["/((?!_next|api).*)"],
};
