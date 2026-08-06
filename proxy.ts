import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

/** Chemins servis hors du segment [lang] (assets, API, fichiers de métadonnées). */
function isPassthrough(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/opengraph-image" ||
    // Assets & fichiers de métadonnées à extension (robots.txt, sitemap/*.xml,
    // *.png, favicon.ico, llms.txt…). On EXCLUT `.html` : ce sont d'anciennes
    // URLs du site PHP (`{id}-{slug}.html`) qui ne correspondent à aucune route.
    // En les laissant suivre la réécriture de locale, une URL inconnue affiche
    // bien le 404 premium (global-not-found) au lieu du 404 par défaut de Next.
    (/\.[^/]+$/.test(pathname) && !pathname.endsWith(".html"))
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
    bare === "/mon-espace" ||
    bare.startsWith("/tableau-de-bord") ||
    bare.startsWith("/praticien/tableau-de-bord") ||
    bare.startsWith("/espace-auteur") ||
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

    if (bare === "/mon-espace") {
      // Hub « Mon espace » : redirection EDGE par rôle (307, jamais pré-rendu).
      if (!session?.userId) return redirectLogin();
      const pfx = locale === "ar" ? "/ar" : "";
      let target = "/tableau-de-bord"; // patient par défaut
      if (session.role === "ADMIN") target = "/admin";
      else if (session.role === "EDITOR") target = "/admin/articles";
      else if (session.role === "DOCTOR") target = "/praticien/tableau-de-bord";
      else if (session.role === "CONTRIBUTOR") target = "/espace-auteur";
      return NextResponse.redirect(new URL(pfx + target, request.url));
    } else if (bare.startsWith("/praticien/tableau-de-bord")) {
      if (!session?.userId) return redirectLogin();
      if (session.role !== "DOCTOR") return NextResponse.redirect(new URL(homeBase === "/" ? "/tableau-de-bord" : "/ar/tableau-de-bord", request.url));
    } else if (bare.startsWith("/espace-auteur")) {
      // Garde de login edge ; le contrôle « peut contribuer » reste dans la page.
      if (!session?.userId) return redirectLogin();
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
  /*
   * ⚠️ Le matcher est la SEULE exclusion gratuite.
   *
   * Depuis Next 16, le proxy s'exécute dans le runtime Node.js (« Proxy defaults
   * to the Node.js runtime », doc proxy.md) : chaque chemin qui matche démarre
   * une fonction serverless — facturée en invocation, en Active CPU et en mémoire
   * provisionnée. Un `return NextResponse.next()` en tête de `proxy()` ne rattrape
   * rien : la fonction a déjà été invoquée.
   *
   * `isPassthrough` laissait justement passer robots.txt, sitemap/*.xml,
   * favicon.ico, les polices et tous les assets de `public/` — après invocation.
   * On les sort donc ici, au niveau du routeur, où ils ne coûtent rien.
   *
   * Liste d'EXTENSIONS explicite plutôt qu'un `\.[^/]+$` générique, pour une
   * raison précise : `.html` doit CONTINUER d'entrer. Ce sont les anciennes URLs
   * du site PHP (`{id}-{slug}.html`) ; en les laissant suivre la réécriture de
   * locale, une URL inconnue affiche le 404 premium (global-not-found) au lieu du
   * 404 par défaut de Next. Ajouter `html` à cette liste casserait cela.
   *
   * `isPassthrough` reste en place comme filet (dev, chemins non prévus ici).
   */
  matcher: [
    "/((?!_next|api|.*\\.(?:ico|png|jpe?g|gif|svg|webp|avif|woff2?|ttf|otf|eot|txt|xml|json|webmanifest|css|js|map|pdf|mp4|webm)$).*)",
  ],
};
