import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

// Runtime Node (pas edge) : nécessaire pour l'accès Prisma.
export const alt = "Article — Blog Santé · SantéauMaroc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

// Couleur d'accent par catégorie (aligné au design system).
const CATEGORY_ACCENT: Record<string, string> = {
  blue:   "#3b82f6",
  green:  "#34d399",
  amber:  "#fbbf24",
  rose:   "#fb7185",
  indigo: "#818cf8",
};

// Absolutise une URL d'image (les covers peuvent être relatives).
function absolutize(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.16)",
          border: "2px solid rgba(255,255,255,0.35)",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 120 120" fill="none">
          <path d="M30 88 L30 40 C45 40 51 53 60 61 C69 69 75 80 90 80" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M90 80 L90 40 C75 40 69 53 60 61" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ display: "flex", fontSize: "34px", fontWeight: 800, letterSpacing: "-1px" }}>
        <span style={{ color: "white" }}>Santé</span>
        <span style={{ color: "#34d399" }}>au</span>
        <span style={{ color: "white" }}>Maroc</span>
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.post
    .findUnique({
      where: { slug, status: "PUBLISHED" },
      select: {
        title: true,
        coverImage: true,
        readingTime: true,
        reviewedAt: true,
        category: { select: { name: true, color: true } },
        author: { select: { name: true } },
      },
    })
    .catch(() => null);

  const title = post?.title ?? "Blog Santé — Conseils médicaux au Maroc";
  const categoryName = post?.category.name ?? "Conseils Santé";
  const accent = CATEGORY_ACCENT[post?.category.color ?? "blue"] ?? CATEGORY_ACCENT.blue;
  const cover = post?.coverImage ? absolutize(post.coverImage) : null;
  const isReviewed = !!post?.reviewedAt;

  // Échelle du titre selon sa longueur, pour éviter le débordement.
  const len = title.length;
  const titleSize = len <= 42 ? 66 : len <= 80 ? 54 : 44;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "linear-gradient(135deg, #10497E 0%, #1668B0 55%, #0C9468 100%)",
        }}
      >
        {/* Fond : photo de couverture + voile sombre pour la lisibilité du texte */}
        {cover && (
          <img
            src={cover}
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: cover
              ? "linear-gradient(180deg, rgba(8,24,42,0.55) 0%, rgba(8,24,42,0.78) 100%)"
              : "transparent",
          }}
        />

        {/* Barre d'accent supérieure (couleur de catégorie) */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "10px", background: accent }} />

        {/* Contenu */}
        <div style={{ position: "relative", display: "flex", padding: "60px 64px 0" }}>
          <Brand />
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "0 64px 56px", gap: "26px" }}>
          {/* Badges : catégorie + relecture médicale */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                fontWeight: 700,
                color: "#0E1C2B",
                background: accent,
                padding: "8px 18px",
                borderRadius: "999px",
              }}
            >
              {categoryName}
            </div>
            {isReviewed && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "white",
                  background: "rgba(12,148,104,0.85)",
                  padding: "8px 18px",
                  borderRadius: "999px",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 1.5 2.5 4v3.5c0 3 2.3 5.3 5.5 6.5 3.2-1.2 5.5-3.5 5.5-6.5V4L8 1.5z" />
                  <path d="m5.8 8 1.6 1.6L10.5 6.5" />
                </svg>
                Vérifié médicalement
              </div>
            )}
          </div>

          {/* Titre */}
          <div
            style={{
              display: "flex",
              fontSize: `${titleSize}px`,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.12,
              letterSpacing: "-1.5px",
              maxWidth: "1040px",
              textShadow: "0 2px 12px rgba(8,24,42,0.4)",
            }}
          >
            {title}
          </div>

          {/* Pied : auteur + temps de lecture */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "22px", color: "rgba(255,255,255,0.85)" }}>
            {post?.author.name && <span style={{ display: "flex" }}>{post.author.name}</span>}
            {post?.author.name && post?.readingTime && <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>}
            {post?.readingTime && <span style={{ display: "flex" }}>{post.readingTime} min de lecture</span>}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
