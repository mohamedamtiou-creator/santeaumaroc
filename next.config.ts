import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// CAPTCHA (Cloudflare Turnstile) — n'ouvre la CSP que si le CAPTCHA est configuré.
const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? " https://challenges.cloudflare.com" : "";

// Google AdSense — n'ouvre la CSP aux domaines pub QUE si la pub est activée
// (NEXT_PUBLIC_ADS_ENABLED=true, cf. lib/ads/config.ts). Tant que la pub est
// off, la surface d'attaque reste identique à aujourd'hui.
//  - `*.googlesyndication.com` : pagead2/tpc/safeframe (scripts + iframes d'annonces)
//  - `*.google.com`            : CMP « Funding Choices » (fundingchoicesmessages…),
//                                reCAPTCHA (www.google.com/recaptcha), adservice…
//  - `www.gstatic.com`         : ressources reCAPTCHA du message de consentement
//  - `*.adtrafficquality.google` : anti-fraude AdSense récent
const adsOn = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
const adsScript  = adsOn ? " https://*.googlesyndication.com https://*.google.com https://www.gstatic.com https://*.googleadservices.com https://*.adtrafficquality.google" : "";
const adsFrame   = adsOn ? " https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.google.com https://*.adtrafficquality.google" : "";
const adsImg     = adsOn ? " https://*.googlesyndication.com https://*.g.doubleclick.net https://*.google.com https://www.gstatic.com https://*.adtrafficquality.google" : "";
const adsConnect = adsOn ? " https://*.googlesyndication.com https://*.g.doubleclick.net https://*.google.com https://*.adtrafficquality.google" : "";

// 'unsafe-eval' is required by Next.js HMR in development only
const scriptSrc = (isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'") + turnstile + adsScript;

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
      "img-src 'self' data: blob:" + adsImg,
      "font-src 'self'",
      "connect-src 'self'" + turnstile + adsConnect,
      "media-src 'self'",
      "object-src 'none'",
      // Cadres autorisés = Turnstile et/ou iframes publicitaires AdSense. Ne bascule
      // sur 'none' que si aucun des deux n'est actif (X-Frame-Options: DENY et
      // frame-ancestors 'none' continuent d'interdire qu'ON soit embarqué).
      (turnstile || adsFrame) ? "frame-src" + turnstile + adsFrame : "frame-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

// Alias de spécialités → slug canonique en base. Les patients tapent le terme
// grand public (« gynécologie », « dentiste », « ORL ») ou le nom de métier
// (« cardiologue »), mais les spécialités sont enregistrées sous des slugs plus
// techniques (« gyneco-obstetrique », « chirurgie-dentaire », « oto-rhino-
// laryngologie »). Sans redirection, ces URL renvoient un 404. Ne JAMAIS mettre
// ici une clé qui est déjà un slug valide (ex. « sexologie », « radiologie ») :
// la redirection court-circuiterait la vraie page.
const specialtyAliases: Record<string, string> = {
  // Gynécologie
  "gynecologie": "gyneco-obstetrique",
  "gynecologue": "gyneco-obstetrique",
  // ORL
  "orl": "oto-rhino-laryngologie",
  // Dentaire
  "dentiste": "chirurgie-dentaire",
  "dentaire": "chirurgie-dentaire",
  // Pédiatrie
  "pediatre": "pediatrie",
  // Dermatologie
  "dermatologue": "dermatologie",
  // Cardiologie
  "cardiologue": "cardiologie",
  // Ophtalmologie
  "ophtalmologue": "ophtalmologie",
  "ophtalmologiste": "ophtalmologie",
  "ophtalmo": "ophtalmologie",
  "oculiste": "ophtalmologie",
  // Psychiatrie / psychologie
  "psychiatre": "psychiatrie",
  "psychologue": "psychologie",
  // Radiologie
  "radiologue": "radiologie",
  // Rhumatologie
  "rhumatologue": "rhumatologie",
  // Neurologie / neurochirurgie
  "neurologue": "neurologie",
  "neurochirurgien": "neurochirurgie",
  // Urologie
  "urologue": "urologie-et-chirurgie-urologique",
  "urologie": "urologie-et-chirurgie-urologique",
  // Gastro-entérologie
  "gastro-enterologue": "gastro-enterologie",
  "gastroenterologie": "gastro-enterologie",
  "gastro": "gastro-enterologie",
  // Néphrologie
  "nephrologue": "nephrologie",
  // Endocrinologie / diabète
  "endocrinologue": "endocrinologie-et-maladies-metaboliques",
  "endocrinologie": "endocrinologie-et-maladies-metaboliques",
  "diabetologue": "endocrinologie-et-maladies-metaboliques",
  "diabetologie": "endocrinologie-et-maladies-metaboliques",
  // Pneumologie
  "pneumologue": "pneumo-phtisiologie",
  "pneumologie": "pneumo-phtisiologie",
  // Médecine générale
  "generaliste": "medecine-generale",
  "medecin-generaliste": "medecine-generale",
  // Kinésithérapie
  "kine": "kinesitherapie",
  "kinesitherapeute": "kinesitherapie",
  // Ostéopathie
  "osteopathe": "osteopathie",
  // Nutrition / diététique
  "nutritionniste": "nutrition",
  "dieteticien": "dietetique",
  "dieteticienne": "dietetique",
  // Allergologie / angiologie
  "allergologue": "allergologie",
  "angiologue": "angiologie",
  "phlebologue": "angiologie",
  // Stomatologie / maxillo-facial
  "stomatologue": "stomatologie-et-chirurgie-maxillo-faciale",
  "stomatologie": "stomatologie-et-chirurgie-maxillo-faciale",
  // Traumatologie / orthopédie
  "traumatologue": "traumatologie-orthopedie",
  "traumatologie": "traumatologie-orthopedie",
  "orthopediste": "traumatologie-orthopedie",
  "orthopedie": "traumatologie-orthopedie",
  // Anesthésie-réanimation
  "anesthesiste": "anesthesie-reanimation",
  // Orthophonie
  "orthophoniste": "orthophonie",
  // Oncologie / cancérologie
  "oncologue": "oncologie-medicale",
  "oncologie": "oncologie-medicale",
  "cancerologue": "cancerologie",
};

// Génère les redirections 308 pour chaque alias, en FR (/) et AR (/ar).
const specialtyAliasRedirects = Object.entries(specialtyAliases).flatMap(
  ([alias, slug]) => [
    { source: `/specialites/${alias}`,     destination: `/specialites/${slug}`,     permanent: true },
    { source: `/ar/specialites/${alias}`,  destination: `/ar/specialites/${slug}`,  permanent: true },
  ],
);

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
      // Alias de spécialités populaires → slug canonique (FR + AR). Cf.
      // `specialtyAliases` ci-dessus : évite les 404 sur les termes grand public
      // et nom de métier (gynécologie, dentiste, ORL, cardiologue…).
      ...specialtyAliasRedirects,
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
