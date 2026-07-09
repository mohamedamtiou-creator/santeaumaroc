import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
