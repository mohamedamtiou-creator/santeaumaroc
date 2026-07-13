import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { getDoctorInitials, formatDoctorName, hasReliableRating } from "@/lib/utils";
import { hasProAccess, isFeaturedActive } from "@/lib/plan";
import { toLocale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { tConvention, isConvention } from "@/lib/doctor-options";

// Runtime Node (pas edge) : accès Prisma requis pour lire la fiche.
export const alt = "Fiche praticien — SantéauMaroc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = Promise<{ lang: string; slug: string }>;

/* ── Palette de marque (Medical Clarity System) ─────────────────────────── */
const NAVY = "#0C1E3F";
const EMERALD = "#34d399";
const AMBER = "#fbbf24";

/* ── Chargement de polices TTF (Satori ne lit pas le woff2) ──────────────────
   Inter est sous-ensemblé au strict jeu latin utilisé dans une fiche (lettres,
   accents FR, chiffres, ponctuation) → ~35 Ko/graisse au lieu de ~320 Ko.
   Cairo (arabe) est chargé entier (~89 Ko) car les glyphes arabes sont
   dynamiques. Les téléchargements sont mémoïsés par graisse pour tout le
   cycle de vie du serveur. En cas d'échec réseau, on rend sans police custom
   (repli Satori) plutôt que de casser l'image. */
const LATIN_SUBSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,'’\"-–·/()&!?:%+" +
  "éèêëàâäáãçíîïìóôöòõúûüùñœæÉÈÊËÀÂÄÁÃÇÍÎÏÌÓÔÖÒÕÚÛÜÙÑŒÆ";

const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

function loadGoogleFont(family: string, weight: number, text?: string): Promise<ArrayBuffer | null> {
  const key = `${family}:${weight}:${text ? "sub" : "full"}`;
  const cached = fontCache.get(key);
  if (cached) return cached;

  const promise = (async () => {
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
  })();

  fontCache.set(key, promise);
  return promise;
}

async function loadFonts() {
  const [inter600, inter700, inter800, cairo600, cairo700] = await Promise.all([
    loadGoogleFont("Inter", 600, LATIN_SUBSET),
    loadGoogleFont("Inter", 700, LATIN_SUBSET),
    loadGoogleFont("Inter", 800, LATIN_SUBSET),
    loadGoogleFont("Cairo", 600),
    loadGoogleFont("Cairo", 700),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 600 | 700 | 800; style: "normal" }[] = [];
  const push = (name: string, data: ArrayBuffer | null, weight: 600 | 700 | 800) => {
    if (data) fonts.push({ name, data, weight, style: "normal" });
  };
  push("Inter", inter600, 600);
  push("Inter", inter700, 700);
  push("Inter", inter800, 800);
  // Cairo assure les glyphes arabes (repli par glyphe de Satori).
  push("Cairo", cairo600, 600);
  push("Cairo", cairo700, 700);
  return fonts;
}

/* ── Icônes (inline, monochromes) ────────────────────────────────────────── */
function StarIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill={AMBER}>
      <path d="M12 2l2.9 6.06 6.6.86-4.84 4.55 1.22 6.57L12 17.6 6.12 20.6l1.22-6.57L2.5 8.92l6.6-.86z" />
    </svg>
  );
}
function CalendarCheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
      <path d="m8.5 14 2.2 2.2L15.5 11" />
    </svg>
  );
}
function ShieldCheckIcon({ color = "white" }: { color?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5.2v6.3c0 4.6 3.4 8.1 8 9.3 4.6-1.2 8-4.7 8-9.3V5.2L12 2z" />
      <path d="m8.6 12 2.4 2.4L15.8 9.6" />
    </svg>
  );
}
function VerifiedBadge({ size: s = 62 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: `${s}px`, height: `${s}px`, borderRadius: "999px",
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        border: "5px solid white", boxShadow: "0 8px 20px rgba(4,120,87,0.45)",
      }}
    >
      <svg width={s * 0.52} height={s * 0.52} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 13 4 4L19 7" />
      </svg>
    </div>
  );
}
function BrandMark({ box = 60, stroke = 12 }: { box?: number; stroke?: number }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: `${box}px`, height: `${box}px`, borderRadius: `${box * 0.26}px`,
        background: "rgba(255,255,255,0.14)", border: "2px solid rgba(255,255,255,0.34)",
      }}
    >
      <svg width={box * 0.62} height={box * 0.62} viewBox="0 0 120 120" fill="none">
        <path d="M30 88 L30 40 C45 40 51 53 60 61 C69 69 75 80 90 80" stroke="white" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M90 80 L90 40 C75 40 69 53 60 61" stroke="white" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
function Wordmark({ fontSize = 36 }: { fontSize?: number }) {
  return (
    <div style={{ display: "flex", fontSize: `${fontSize}px`, fontWeight: 800, letterSpacing: "-1px" }}>
      <span style={{ color: "white" }}>Santé</span>
      <span style={{ color: EMERALD }}>au</span>
      <span style={{ color: "white" }}>Maroc</span>
    </div>
  );
}
function ChevronArrow({ flip }: { flip: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
      style={flip ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── Chargement robuste de l'avatar en data-URI ──────────────────────────────
   Les avatars migrés sont peu fiables (souvent absents/cassés) : plutôt que de
   laisser Satori afficher une boîte blanche sur un `<img src>` en échec, on
   récupère les octets nous-mêmes, on valide que c'est bien une image, et on
   embarque en data-URI. Tout échec → `null` → repli sur le monogramme.
   Les assets locaux (`/uploads/...`) sont lus sur disque (indépendant de l'URL
   de base et de l'origine) ; seules les URL externes passent par fetch. */
const AVATAR_MAX_BYTES = 4_000_000;

function extMime(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  return ext === "png" ? "image/png"
    : ext === "webp" ? "image/webp"
    : ext === "gif" ? "image/gif"
    : "image/jpeg";
}

async function loadAvatar(raw: string): Promise<string | null> {
  try {
    if (/^https?:\/\//i.test(raw)) {
      const res = await fetch(raw, { cache: "force-cache" });
      if (!res.ok) return null;
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.startsWith("image/")) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.byteLength || buf.byteLength > AVATAR_MAX_BYTES) return null;
      return `data:${ct};base64,${buf.toString("base64")}`;
    }
    // Asset public servi depuis le disque (public/…).
    const rel = raw.replace(/^\/+/, "");
    const buf = await readFile(join(process.cwd(), "public", rel));
    if (!buf.byteLength || buf.byteLength > AVATAR_MAX_BYTES) return null;
    return `data:${extMime(rel)};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/* ── Puces de confiance (types) ──────────────────────────────────────────── */
type Chip = { kind: "rating" | "book" | "conv" | "plain"; label: string; sub?: string };

export default async function Image({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const rtl = locale === "ar";

  const p = await prisma.doctor
    .findUnique({
      where: { slug },
      select: {
        civilite: true, prenom: true, nom: true, avatar: true,
        averageRating: true, isVerified: true, experience: true,
        plan: true, planExpiresAt: true, trialEndsAt: true, featuredUntil: true,
        conventions: true,
        specialty: { select: { name: true } },
        city: { select: { name: true } },
        _count: { select: { reviews: { where: { isPublic: true } } } },
      },
    })
    .catch(() => null);

  const fonts = await loadFonts();

  const fullName = p ? formatDoctorName(p) : "SantéauMaroc";
  const initials = p ? getDoctorInitials(p.prenom, p.nom) : "SM";
  const specialty = p ? tSpecialty(p.specialty.name, locale) : "";
  const city = p?.city.name ?? "";
  const rating = p?.averageRating ?? 0;
  const reviewCount = p?._count.reviews ?? 0;
  const isVerified = !!p?.isVerified;
  const isPremium = isFeaturedActive(p?.featuredUntil);
  const canBook = hasProAccess(p?.plan, p?.planExpiresAt, p?.trialEndsAt);
  const photo = p?.avatar ? await loadAvatar(p.avatar) : null;

  const t = rtl
    ? {
        eyebrow: isVerified ? "ملف موثّق" : "الدليل الطبي للمغرب",
        premium: "بريميوم",
        avis: "تقييم",
        book: "حجز موعد عبر الإنترنت",
        conv: "متعاقد مع",
        exp: "سنوات خبرة",
        profile: "ملف على SantéauMaroc",
        ctaBook: "احجز موعدك عبر الإنترنت",
        ctaView: "عرض الملف والتواصل",
      }
    : {
        eyebrow: isVerified ? "Profil vérifié" : "Annuaire médical du Maroc",
        premium: "Premium",
        avis: "avis",
        book: "Réservable en ligne",
        conv: "Conventionné",
        exp: "ans d'expérience",
        profile: "Profil sur SantéauMaroc",
        ctaBook: "Prendre rendez-vous en ligne",
        ctaView: "Voir le profil & contacter",
      };

  // Sélection des puces (max 3), par ordre de valeur : note fiable → RDV en
  // ligne → conventionnement. Repli sur expérience / présence si rien d'autre.
  const chips: Chip[] = [];
  if (hasReliableRating(rating, reviewCount)) {
    chips.push({ kind: "rating", label: rating.toFixed(1).replace(".", ","), sub: `${reviewCount} ${t.avis}` });
  }
  if (canBook) chips.push({ kind: "book", label: t.book });
  const convList = (p?.conventions ?? []).filter(isConvention).slice(0, 2);
  if (convList.length) {
    // Libellé scindé : préfixe (mono-script) + codes latins, réassemblés par le
    // flex — évite le mélange arabe+latin dans un seul run (rendu bidi bancal).
    chips.push({ kind: "conv", label: t.conv, sub: convList.map((c) => tConvention(c, locale)).join(" · ") });
  }
  if (chips.length === 0) {
    if (p?.experience) chips.push({ kind: "plain", label: `${p.experience} ${t.exp}` });
    else chips.push({ kind: "plain", label: t.profile });
  }
  const shownChips = chips.slice(0, 3);

  const ctaLabel = canBook ? t.ctaBook : t.ctaView;

  // Échelle du nom selon la longueur, pour éviter tout débordement.
  const nl = fullName.length;
  const nameSize = nl <= 15 ? 72 : nl <= 21 ? 62 : nl <= 28 ? 54 : nl <= 36 ? 46 : 40;

  // Miroir RTL. Satori applique la bidi À L'INTÉRIEUR d'un run de texte (un span
  // arabe pur s'affiche donc correctement), mais IGNORE `direction` pour l'ordre
  // des éléments flex : plusieurs enfants sont posés dans l'ordre source, de
  // gauche à droite. On mirroite donc explicitement chaque rangée multi-éléments
  // avec `row-reverse`, et on scinde les libellés mixtes arabe+latin en spans
  // mono-script (chacun rendu correctement, l'ordre étant géré par le flex).
  const rr = rtl ? { flexDirection: "row-reverse" as const } : {};

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column",
          padding: "60px 64px", justifyContent: "space-between",
          direction: rtl ? "rtl" : "ltr",
          fontFamily: "Inter, Cairo, sans-serif",
          background: `linear-gradient(125deg, ${NAVY} 0%, #143a7d 47%, #0b6b54 100%)`,
          overflow: "hidden",
        }}
      >
        {/* Décor : halos lumineux + filigrane de marque */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 86% 6%, rgba(52,211,153,0.30) 0%, transparent 42%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 4% 104%, rgba(59,130,246,0.34) 0%, transparent 46%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "8px", background: `linear-gradient(90deg, ${EMERALD} 0%, #38bdf8 55%, transparent 100%)` }} />
        <svg width="560" height="560" viewBox="0 0 120 120" fill="none"
          style={{ position: "absolute", bottom: "-150px", opacity: 0.06, ...(rtl ? { left: "-90px", transform: "scaleX(-1)" } : { right: "-90px" }) }}>
          <path d="M30 88 L30 40 C45 40 51 53 60 61 C69 69 75 80 90 80" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M90 80 L90 40 C75 40 69 53 60 61" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* En-tête : marque + eyebrow/Premium */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", ...rr }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", ...rr }}>
            <BrandMark box={58} />
            <Wordmark fontSize={34} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", ...rr }}>
            {isPremium && (
              <div style={{ display: "flex", alignItems: "center", fontSize: "20px", fontWeight: 700, color: NAVY, background: `linear-gradient(135deg, #fcd34d, ${AMBER})`, padding: "8px 18px", borderRadius: "999px" }}>
                {t.premium}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "20px", fontWeight: 600, color: "rgba(255,255,255,0.92)", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)", padding: "8px 18px", borderRadius: "999px", ...rr }}>
              {isVerified && <ShieldCheckIcon />}
              <span style={{ display: "flex" }}>{t.eyebrow}</span>
            </div>
          </div>
        </div>

        {/* Corps : avatar + identité */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "46px", ...rr }}>
          {/* Avatar cerclé + badge vérifié */}
          <div style={{ position: "relative", display: "flex", flexShrink: 0 }}>
            <div style={{ display: "flex", padding: "6px", borderRadius: "46px", background: `linear-gradient(135deg, ${EMERALD} 0%, #3b82f6 100%)`, boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
              <div style={{ width: "224px", height: "224px", borderRadius: "40px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #ffffff 0%, #eaf2ff 100%)" }}>
                {photo ? (
                  // Rendu par Satori (ImageResponse) : <img> requis, next/image inopérant.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" width={224} height={224} style={{ width: "224px", height: "224px", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "104px", fontWeight: 800, color: "#143a7d", letterSpacing: "-3px" }}>{initials}</span>
                )}
              </div>
            </div>
            {isVerified && (
              <div style={{ position: "absolute", bottom: "-6px", display: "flex", ...(rtl ? { left: "-6px" } : { right: "-6px" }) }}>
                <VerifiedBadge size={64} />
              </div>
            )}
          </div>

          {/* Identité (alignée à droite en RTL) */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: rtl ? "flex-end" : "flex-start", textAlign: rtl ? "right" : "left" }}>
            <div style={{ display: "flex", fontSize: `${nameSize}px`, fontWeight: 800, color: "white", lineHeight: 1.04, letterSpacing: rtl ? "0" : "-2px", textShadow: "0 2px 14px rgba(8,20,45,0.35)" }}>
              {fullName}
            </div>
            {(specialty || city) && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "18px", fontSize: "34px", ...rr }}>
                {specialty && <span style={{ display: "flex", color: EMERALD, fontWeight: 700 }}>{specialty}</span>}
                {specialty && city && <span style={{ display: "flex", width: "7px", height: "7px", borderRadius: "999px", background: "rgba(255,255,255,0.5)" }} />}
                {city && <span style={{ display: "flex", color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{city}</span>}
              </div>
            )}

            {/* Puces de confiance */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "28px", ...rr }}>
              {shownChips.map((c, i) => {
                if (c.kind === "book") {
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)", padding: "12px 22px", borderRadius: "999px", fontSize: "26px", fontWeight: 700, color: NAVY, ...rr }}>
                      <CalendarCheckIcon />
                      <span style={{ display: "flex" }}>{c.label}</span>
                    </div>
                  );
                }
                if (c.kind === "rating") {
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.24)", padding: "12px 22px", borderRadius: "999px", ...rr }}>
                      <StarIcon />
                      <span style={{ display: "flex", fontSize: "27px", fontWeight: 700, color: "white" }}>{c.label}</span>
                      <span style={{ display: "flex", fontSize: "22px", fontWeight: 600, color: "rgba(255,255,255,0.72)" }}>{c.sub}</span>
                    </div>
                  );
                }
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.24)", padding: "12px 22px", borderRadius: "999px", fontSize: "24px", fontWeight: 600, color: "white", ...rr }}>
                    {c.kind === "conv" && <ShieldCheckIcon color={EMERALD} />}
                    <span style={{ display: "flex" }}>{c.label}</span>
                    {c.kind === "conv" && c.sub && <span style={{ display: "flex", direction: "ltr" }}>{c.sub}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pied : CTA + domaine */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", ...rr }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "white", padding: "16px 30px", borderRadius: "999px", fontSize: "26px", fontWeight: 700, color: NAVY, boxShadow: "0 14px 34px rgba(0,0,0,0.28)", ...rr }}>
            <span style={{ display: "flex" }}>{ctaLabel}</span>
            <ChevronArrow flip={rtl} />
          </div>
          <div style={{ display: "flex", fontSize: "24px", fontWeight: 600, color: "rgba(255,255,255,0.82)", direction: "ltr" }}>
            santeaumaroc.com
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
