import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// CAPTCHA (Cloudflare Turnstile) — n'ouvre la CSP que si le CAPTCHA est configuré.
const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? " https://challenges.cloudflare.com" : "";

// 'unsafe-eval' is required by Next.js HMR in development only
const scriptSrc = (isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'") + turnstile;

const securityHeaders = [
  // No iframes anywhere — strongest clickjacking protection
  { key: "X-Frame-Options",        value: "DENY" },
  // Block MIME sniffing attacks
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disable legacy XSS auditor (it can introduce new vulnerabilities)
  { key: "X-XSS-Protection",       value: "0" },
  // Limit referrer info sent cross-origin
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  // Restrict powerful browser APIs
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // DNS prefetch for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // HSTS — enforce HTTPS for 2 years, eligible for preload list (production only)
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      // Avatars uploadés (/uploads), data URIs, blobs (previews). Pas de CDN externe.
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'" + turnstile,
      "media-src 'self'",
      "object-src 'none'",
      "frame-src" + (turnstile ? turnstile : " 'none'"),
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Cache headers only in production — dev HMR needs uncached responses.
      // NB : PAS de règle sur `/_next/static/(.*)` — Next (next start ET Vercel)
      // pose déjà `public, max-age=31536000, immutable` sur ces assets hashés.
      // Un header custom y est redondant et déclenche le warning Vercel
      // « Custom Cache-Control headers detected ».
      ...(isProd
        ? [
            // Public assets — versioned manually; cache 1 week with revalidation
            {
              source: "/favicon\\.(svg|ico)",
              headers: [
                { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
              ],
            },
          ]
        : []),
    ];
  },

  images: {
    // Aucune image distante : avatars locaux (/uploads) + initiales rendues en HTML.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Next 16 : par défaut seul q=75 est autorisé. 65 pour les couvertures blog
    // (photos → gain ~25 % de poids, différence visuelle imperceptible).
    qualities: [65, 75],
  },

  compress: true,
  trailingSlash: false,

  // Client-side Router Cache
  // dynamic: 30s — filtered list pages stay cached for back-navigation
  // static: 3600s — SSG pages (specialites, villes) kept in router cache 1 h
  experimental: {
    // 404 global pour les URL ne matchant aucune route. Indispensable ici : le
    // layout racine est porté par un segment dynamique (`app/[lang]`), donc Next
    // ne peut composer un 404 via layout + not-found → `app/global-not-found.tsx`.
    globalNotFound: true,
    staleTimes: {
      dynamic: 30,
      static: 3600,
    },
    // Le tunnel de revendication soumet les pièces justificatives (CIN + diplôme)
    // en une seule Server Action atomique : 2 fichiers de 5 Mo max → marge à 12 Mo.
    serverActions: {
      bodySizeLimit: "12mb",
    },
    // Tree-shaking dirigé des libs à barrel (imports nommés → imports directs).
    // Bénéficie surtout aux bundles admin/Q-R où vit l'éditeur riche TipTap.
    optimizePackageImports: ["@tiptap/react", "@tiptap/starter-kit"],
  },

  async redirects() {
    return [
      // www → non-www canonical redirect (prevents duplicate domain indexing)
      {
        source:      "/:path*",
        has:         [{ type: "host", value: "www.santeaumaroc.com" }],
        destination: "https://santeaumaroc.com/:path*",
        permanent:   true,
      },
      // http → https (belt-and-suspenders; hosting layer usually handles this)
      {
        source:      "/:path*",
        has:         [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://santeaumaroc.com/:path*",
        permanent:   true,
      },
    ];
  },
};

export default nextConfig;
