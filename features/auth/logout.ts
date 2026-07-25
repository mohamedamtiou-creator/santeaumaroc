"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

/**
 * Action de déconnexion isolée dans un fichier LÉGER (aucune dépendance serveur
 * lourde : ni bcrypt, ni prisma, ni email). Importée directement par les
 * composants CLIENT (navs des tableaux de bord) via `<form action={logout}>`.
 *
 * ⚠️ Ne PAS ré-importer `logout` depuis `features/auth/actions.ts` dans un
 * composant client : ce module « use server » tire tout le graphe serveur, ce
 * qui fait échouer Turbopack avec « Module … module factory is not available ».
 */
export async function logout() {
  await deleteSession();
  redirect("/");
}
