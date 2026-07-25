import { NextResponse } from "next/server";

/**
 * Déconnexion via Route Handler (POST), appelée par un `<form method="post"
 * action="/api/logout">` NATIF dans les navs des tableaux de bord.
 *
 * Volontairement PAS une server action : un formulaire HTML classique fait une
 * navigation POST plein écran et n'instancie AUCUN module client React. Cela
 * élimine à la racine l'erreur Turbopack « Module … module factory is not
 * available » qui frappait `<form action={logout}>` (server action référencée
 * depuis un composant client). Cf. mémoire turbopack-server-action-client.
 *
 * Les cookies sont supprimés directement sur la réponse de redirection (patron
 * fiable en Route Handler). 303 → le navigateur suit en GET vers l'accueil.
 */
export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  res.cookies.delete("session");
  res.cookies.delete("sm_auth");
  return res;
}
