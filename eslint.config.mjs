import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Images générées (conventions Next `opengraph-image`, `icon`, etc.) : rendues
  // par Satori via `next/og`, PAS par le navigateur. `<img>` y est REQUIS
  // (next/image n'y fonctionne pas) et l'attribut `alt` n'a aucun sens. On y
  // désactive donc ces deux règles — sinon faux positifs selon la version du
  // plugin Next (elles se déclenchent en local mais pas sur le sandbox Vercel).
  {
    files: [
      "**/opengraph-image.tsx",
      "**/twitter-image.tsx",
      "**/icon.tsx",
      "**/apple-icon.tsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
      "jsx-a11y/alt-text": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripts de seed/maintenance et fichiers temporaires : hors build de l'app,
    // exécutés manuellement (tsx/node), pas soumis aux règles du bundle applicatif.
    "scripts/**",
    "tmp-*.cjs",
    "tmp-*.mjs",
    "test-*.cjs",
  ]),
]);

export default eslintConfig;
