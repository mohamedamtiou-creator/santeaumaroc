#!/usr/bin/env node
/**
 * ── Étape « Ignored Build Step » de Vercel ───────────────────────────────────
 *
 * Branché par `vercel.json` (`ignoreCommand`). Convention Vercel, contre-intuitive :
 *   - code de sortie 0 → le build est ANNULÉ ;
 *   - code de sortie 1 → le build CONTINUE.
 *
 * POURQUOI : un déploiement de production pré-rend l'intégralité des pages SSG
 * (plusieurs milliers), et ce temps mural est facturé en Build CPU Minutes —
 * l'un des plus gros postes de la facture. Un commit qui ne touche QUE de la
 * documentation, des captures d'audit ou des fichiers de travail jetables ne
 * change rien au site déployé : le rebuild est intégralement gaspillé.
 *
 * PRINCIPE DE PRUDENCE : on n'annule que si TOUS les fichiers modifiés sont
 * reconnus comme non déployables. Le moindre doute — un chemin non listé, un
 * `git diff` qui échoue, un dépôt sans historique — déclenche le build. Se
 * tromper en construisant coûte quelques minutes de CPU ; se tromper en sautant
 * met le site en retard sur son code.
 *
 * ⚠️ LIMITE CONNUE, à garder en tête : la comparaison porte sur `HEAD^..HEAD`,
 * soit le DERNIER commit seulement (c'est la recette documentée par Vercel, et
 * aucune variable d'environnement n'expose le commit réellement déployé). Si un
 * même push contient plusieurs commits et que le dernier ne touche que de la
 * doc, le build est sauté alors que les commits précédents, eux, portaient du
 * code. Dans ce cas : relancer un déploiement depuis le tableau de bord Vercel,
 * ou pousser un commit de code. Pour éviter le piège, terminer une série de
 * commits par le commit de CODE, pas par celui de doc.
 *
 * ⚠️ `public/` n'est PAS dans la liste : ces fichiers font partie de la sortie
 * de déploiement, donc un changement là-bas exige un build.
 */

import { execFileSync } from "node:child_process";

/** Chemins (relatifs à la racine) qui ne changent RIEN au site déployé. */
const NON_DEPLOYABLE = [
  /^docs\//,
  /^[^/]+\.md$/, // README, AGENTS, CLAUDE, RELECTURE-… à la racine
  /^tmp-/, // fichiers de travail jetables (logs, captures, sondes)
  /\.log$/,
  /^audit-identity\//,
  /^audit-screenshots\//,
  /^test-screenshots\//,
  /^linkedin-assets\//,
  /^youtube-strategy\//,
  /^\.gitignore$/,
  /^\.vscode\//,
];

const SKIP = 0;
const BUILD = 1;

function finish(code, reason) {
  console.log(`${code === SKIP ? "BUILD ANNULÉ" : "BUILD LANCÉ"} — ${reason}`);
  process.exit(code);
}

let changed;
try {
  changed = execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
} catch {
  // Clone superficiel, commit initial, git indisponible… : on ne devine pas.
  finish(BUILD, "impossible de lister les fichiers modifiés (git diff HEAD^ HEAD)");
}

if (changed.length === 0) {
  finish(BUILD, "aucun fichier modifié détecté — cas inattendu, on ne prend pas de risque");
}

const deployable = changed.filter((f) => !NON_DEPLOYABLE.some((re) => re.test(f)));

if (deployable.length === 0) {
  finish(SKIP, `${changed.length} fichier(s) modifié(s), tous non déployables :\n  ${changed.join("\n  ")}`);
}

finish(
  BUILD,
  `${deployable.length} fichier(s) déployable(s) modifié(s) :\n  ${deployable.slice(0, 20).join("\n  ")}` +
    (deployable.length > 20 ? `\n  … et ${deployable.length - 20} autre(s)` : ""),
);
