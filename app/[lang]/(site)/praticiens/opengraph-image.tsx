import { ImageResponse } from "next/og";
import { toLocale } from "@/lib/i18n";
import { rtlWords } from "@/lib/og-rtl";
import { PRERENDERED_LOCALES } from "@/lib/cache-ttl";

export const alt =
  "SantéauMaroc — annuaire médical du Maroc : trouvez le bon médecin, toutes spécialités, partout au Maroc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * ── Carte OG de marque pour TOUT l'espace praticiens ────────────────────────
 *
 * POURQUOI CETTE IMAGE EXISTE, ET POURQUOI ELLE N'EST PAS PERSONNALISÉE
 * ─────────────────────────────────────────────────────────────────────────────
 * Une version précédente vivait dans `[slug]/opengraph-image.tsx` et rendait une
 * carte sur mesure par médecin (photo, note, conventionnement, CTA). Elle a été
 * supprimée : sur ~20 690 fiches en ISR à la demande, CHAQUE passage de crawler
 * sur une fiche froide déclenchait, uniquement pour cette image :
 *   - une invocation de fonction supplémentaire (route distincte de la page) ;
 *   - une requête Prisma avec agrégat `_count` sur les avis ;
 *   - cinq sous-ensembles de police téléchargés (`fontCache` = Map de process,
 *     donc vidé à chaque cold start) ;
 *   - un rendu Satori + rastérisation PNG 1200×630 — le poste CPU le plus lourd
 *     du projet ;
 *   - un jeu d'entrées ISR écrit, et quelques centaines de Ko de transfert
 *     depuis l'origine.
 *
 * Or cette dépense n'achetait rien de mesurable : Google n'utilise pas `og:image`
 * comme signal de classement, et une carte personnalisée ne sert QUE lors d'un
 * partage social réel — un événement rare et concentré sur une poignée de fiches,
 * alors que le coût, lui, était payé sur les 20 690, au rythme des robots.
 *
 * CE QUI REND CELLE-CI QUASI GRATUITE
 * ─────────────────────────────────────────────────────────────────────────────
 * Elle est posée au niveau du segment `praticiens` et ne lit PAS `params.slug` :
 * il n'existe donc qu'UNE image par locale, au lieu d'une par fiche.
 *
 * Le `generateStaticParams` ci-dessous est indispensable, et c'est un piège
 * vérifié au build : sans lui, la route apparaît en `ƒ` (rendu à la demande) et
 * n'obtient aucune entrée de pré-rendu — le segment parent `[lang]` a bien son
 * propre `generateStaticParams`, mais il ne suffit pas à faire pré-rendre une
 * route d'image de métadonnées. Avec lui, la variante FR passe en `●` et son PNG
 * est produit une fois au build, puis servi par le CDN.
 *
 * L'arabe n'y est pas, par alignement sur la politique du site
 * (`PRERENDERED_LOCALES`, cf. lib/cache-ttl.ts : l'AR doublait le build et les
 * écritures ISR pour une fraction du trafic). `dynamicParams` valant `true` par
 * défaut, `/ar/...` est calculé à la première requête puis mis en cache — soit un
 * unique objet, pas 20 690.
 *
 * Par héritage de segment, l'image couvre `praticiens`, `praticiens/[slug]` et
 * leurs enfants (`/rdv`, `/revendiquer`). Aucune métadonnée à écrire dans les
 * pages : Next émet lui-même `og:image`, ses dimensions et son type.
 *
 * ⚠️ NE PAS y réintroduire d'accès Prisma ni de lecture de `params.slug` : l'un
 * comme l'autre ramènerait une image par fiche, donc le coût décrit plus haut.
 */
export function generateStaticParams() {
  return PRERENDERED_LOCALES.map((lang) => ({ lang }));
}

/* ── Palette de marque (Medical Clarity System) ─────────────────────────── */
const NAVY = "#0C1E3F";
const EMERALD = "#34d399";

/* ── Polices TTF (Satori ne lit pas le woff2) ────────────────────────────────
   Chargées au BUILD uniquement (deux rendus au total), donc sans mémoïsation ni
   sous-ensemblage sophistiqué : Inter est restreint au texte réellement composé,
   Cairo est chargé entier pour les glyphes arabes. Tout échec réseau → repli
   Satori sur les polices système plutôt qu'un build cassé. */
async function loadGoogleFont(family: string, weight: number, text?: string): Promise<ArrayBuffer | null> {
  try {
    const url =
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}` +
      (text ? `&text=${encodeURIComponent(text)}` : "");
    const css = await fetch(url, { cache: "force-cache" }).then((r) => r.text());
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/);
    if (!match) return null;
    return await fetch(match[1], { cache: "force-cache" }).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

function BrandMark({ box = 72 }: { box?: number }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: `${box}px`, height: `${box}px`, borderRadius: `${box * 0.26}px`,
        background: "rgba(255,255,255,0.14)", border: "2px solid rgba(255,255,255,0.34)",
      }}
    >
      <svg width={box * 0.62} height={box * 0.62} viewBox="0 0 120 120" fill="none">
        <path d="M30 88 L30 40 C45 40 51 53 60 61 C69 69 75 80 90 80" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M90 80 L90 40 C75 40 69 53 60 61" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Wordmark({ fontSize = 42 }: { fontSize?: number }) {
  return (
    // Les trois fragments restent dans l'ordre source même en AR : `rr` n'est
    // appliqué qu'aux rangées PARENTES, jamais ici.
    // `fontFamily` explicite : en AR la pile racine commence par Cairo, or le
    // logotype est latin et doit rester en Inter.
    <div style={{ display: "flex", fontFamily: "Inter, sans-serif", fontSize: `${fontSize}px`, fontWeight: 800, letterSpacing: "-1px" }}>
      <span style={{ color: "white" }}>Santé</span>
      <span style={{ color: EMERALD }}>au</span>
      <span style={{ color: "white" }}>Maroc</span>
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={EMERALD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5.2v6.3c0 4.6 3.4 8.1 8 9.3 4.6-1.2 8-4.7 8-9.3V5.2L12 2z" />
      <path d="m8.6 12 2.4 2.4L15.8 9.6" />
    </svg>
  );
}

type Params = Promise<{ lang: string }>;

export default async function Image({ params }: { params: Params }) {
  const { lang } = await params;
  const rtl = toLocale(lang) === "ar";

  /**
   * ── Règle de rédaction : ne promettre que ce qui vaut pour TOUTES les fiches ──
   *
   * Cette carte est héritée par les ~20 690 fiches praticien : c'est elle qui
   * s'affiche quand n'importe laquelle est partagée. Toute mention doit donc être
   * vraie de l'ANNUAIRE, jamais du statut d'un médecin en particulier.
   *
   * Deux puces ont été retirées pour cette raison :
   *   - « Profils vérifiés » : `isVerified` ne concerne qu'une fraction des
   *     fiches (la base migrée est majoritairement non vérifiée) ;
   *   - « Rendez-vous en ligne » : conditionné à `hasProAccess`.
   * Affichées sur toutes les fiches, elles affirmaient au partage quelque chose
   * de faux pour la plupart d'entre elles — sur un sujet YMYL, c'est un risque de
   * réputation disproportionné au regard du gain.
   *
   * Les libellés retenus décrivent ce que la page apporte (coordonnées, horaires,
   * avis, gratuité), ce qui est vrai partout et reste concret pour le lecteur.
   */
  // Copie AR volontairement plus courte que la FR : Satori aère fortement chaque
  // espace arabe (cf. `rtlWords`), donc moins de mots = rendu plus net.
  const t = rtl
    ? {
        eyebrow: "الدليل الطبي المغربي",
        headline: "طبيبك المناسب",
        sub: "كل التخصصات، كل المدن",
        chips: ["العنوان والتوقيت", "آراء المرضى", "مجاني"],
      }
    : {
        eyebrow: "Annuaire médical du Maroc",
        headline: "Trouvez le bon médecin",
        sub: "Toutes les spécialités, partout au Maroc",
        chips: ["Coordonnées et horaires", "Avis de patients", "100 % gratuit"],
      };

  // Texte latin réellement composé — borne le sous-ensemble Inter téléchargé.
  const latinText = rtl
    ? "SantéauMaroc santeaumaroc.com"
    : `SantéauMaroc santeaumaroc.com ${t.eyebrow}${t.headline}${t.sub}${t.chips.join("")}`;

  // Cairo est chargé en 700 ET 800 : le titre est en 800 et doit disposer de la
  // vraie graisse, plutôt que de la 700 servie par approximation.
  const [inter700, inter800, cairo700, cairo800] = await Promise.all([
    loadGoogleFont("Inter", 700, latinText),
    loadGoogleFont("Inter", 800, latinText),
    rtl ? loadGoogleFont("Cairo", 700) : Promise.resolve(null),
    rtl ? loadGoogleFont("Cairo", 800) : Promise.resolve(null),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 700 | 800; style: "normal" }[] = [];
  if (inter700) fonts.push({ name: "Inter", data: inter700, weight: 700, style: "normal" });
  if (inter800) fonts.push({ name: "Inter", data: inter800, weight: 800, style: "normal" });
  if (cairo700) fonts.push({ name: "Cairo", data: cairo700, weight: 700, style: "normal" });
  if (cairo800) fonts.push({ name: "Cairo", data: cairo800, weight: 800, style: "normal" });

  // Miroir RTL : `direction` étant inopérant sous Satori (cf. `rtlWords`), les
  // rangées multi-éléments sont retournées explicitement par le flex.
  const rr = rtl ? { flexDirection: "row-reverse" as const } : {};

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column",
          padding: "64px", justifyContent: "space-between",
          // Police dominante en tête de pile : Cairo en AR, Inter en FR. Les
          // éléments latins de la carte AR (logotype, domaine) rétablissent Inter
          // explicitement.
          fontFamily: rtl ? "Cairo, Inter, sans-serif" : "Inter, sans-serif",
          background: `linear-gradient(125deg, ${NAVY} 0%, #143a7d 47%, #0b6b54 100%)`,
          overflow: "hidden",
        }}
      >
        {/* Décor : halos + filigrane de marque */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 86% 6%, rgba(52,211,153,0.30) 0%, transparent 42%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 4% 104%, rgba(59,130,246,0.34) 0%, transparent 46%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "8px", background: `linear-gradient(90deg, ${EMERALD} 0%, #38bdf8 55%, transparent 100%)` }} />
        <svg width="560" height="560" viewBox="0 0 120 120" fill="none"
          style={{ position: "absolute", bottom: "-150px", opacity: 0.06, ...(rtl ? { left: "-90px", transform: "scaleX(-1)" } : { right: "-90px" }) }}>
          <path d="M30 88 L30 40 C45 40 51 53 60 61 C69 69 75 80 90 80" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M90 80 L90 40 C75 40 69 53 60 61" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* En-tête : marque + eyebrow */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", ...rr }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", ...rr }}>
            <BrandMark box={68} />
            <Wordmark fontSize={40} />
          </div>
          <div
            style={{ display: "flex", alignItems: "center", fontSize: "22px", fontWeight: 700, color: "rgba(255,255,255,0.92)", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)", padding: "10px 22px", borderRadius: "999px" }}
          >
            {rtlWords(t.eyebrow, rtl)}
          </div>
        </div>

        {/* Corps : accroche */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: rtl ? "flex-end" : "flex-start" }}>
          {/* Titre plus petit en AR : à taille de fonte égale, Cairo occupe
              nettement plus de largeur qu'Inter — en 84 px le titre arabe
              débordait du cadre utile (dernier mot rogné). 66 px le fait tenir
              et l'équilibre optiquement avec la version latine. */}
          <div style={{ display: "flex", fontSize: rtl ? "66px" : "84px", fontWeight: 800, color: "white", lineHeight: 1.06, letterSpacing: rtl ? "0" : "-3px", textShadow: "0 2px 14px rgba(8,20,45,0.35)" }}>
            {rtlWords(t.headline, rtl)}
          </div>
          <div style={{ display: "flex", fontSize: rtl ? "32px" : "36px", fontWeight: 700, color: EMERALD, marginTop: "20px" }}>
            {rtlWords(t.sub, rtl)}
          </div>
        </div>

        {/* Pied : puces de confiance + domaine.
            Les tailles sont serrées volontairement : les trois puces les plus
            longues (FR) plus le domaine remplissent presque toute la largeur
            utile (1200 − 2×64 = 1072 px). En 24 px avec 22 px de padding, le
            domaine débordait du padding droit — d'où 22 px, un padding de 18 px
            et `flexShrink: 0` sur le domaine, qui ne doit jamais être rogné. */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", ...rr }}>
          <div style={{ display: "flex", gap: "12px", ...rr }}>
            {t.chips.map((c) => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: "9px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.24)", padding: "11px 18px", borderRadius: "999px", fontSize: "22px", fontWeight: 700, color: "white", ...rr }}>
                <ShieldCheckIcon />
                <span style={{ display: "flex" }}>{rtlWords(c, rtl)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexShrink: 0, fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 700, color: "rgba(255,255,255,0.82)" }}>
            santeaumaroc.com
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
