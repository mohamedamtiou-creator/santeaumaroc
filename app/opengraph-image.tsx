import { ImageResponse } from "next/og";

// Pas de `runtime = "edge"` : l'image n'utilise que du SVG inline + polices
// système (aucun fs/fetch). Le runtime Node par défaut permet la GÉNÉRATION
// STATIQUE (image produite au build, servie par le CDN) au lieu d'un rendu edge
// à la demande — et supprime le warning « edge runtime disables static generation ».
export const alt = "SantéauMaroc — Annuaire médical marocain";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "92px",
              height: "92px",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.16)",
              border: "2px solid rgba(255,255,255,0.35)",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 120 120" fill="none">
              <path
                d="M30 88 L30 40 C45 40 51 53 60 61 C69 69 75 80 90 80"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M90 80 L90 40 C75 40 69 53 60 61"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: "62px", fontWeight: 800, letterSpacing: "-2px" }}>
            <span style={{ color: "white" }}>Santé</span>
            <span style={{ color: "#34d399" }}>au</span>
            <span style={{ color: "white" }}>Maroc</span>
          </div>
        </div>

        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            maxWidth: "860px",
            lineHeight: 1.5,
            marginBottom: "20px",
          }}
        >
          La santé, à portée de clic.
        </div>

        <div
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.55)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span>Plus de 20 000 praticiens au Maroc</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span>Prise de RDV en ligne</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span>Gratuit</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
