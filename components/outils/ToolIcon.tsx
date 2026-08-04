import type { ToolSlug } from "@/lib/health-tools";

/**
 * Pictogramme d'un outil — SVG inline (aucune requête réseau, aucun sprite à
 * charger) et purement décoratif : le libellé textuel porte toujours le sens.
 */
const PATHS: Record<ToolSlug, React.ReactNode> = {
  // Cadran gradué et aiguille — la lecture d'un indice sur une échelle
  "calcul-imc": (
    <>
      <path d="M3.5 17.5a8.5 8.5 0 1 1 17 0" />
      <path d="m12 17.5 4.3-5" />
      <circle cx="12" cy="17.5" r="1.15" />
    </>
  ),
  // Mètre ruban enroulé — la mesure d'un tour
  "tour-de-taille": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" />
    </>
  ),
  // Flamme : l'énergie dépensée
  "calcul-calories": (
    <path d="M12 21c3.2 0 5.8-2.3 5.8-5.3 0-4.4-4.6-6.2-4.6-6.2s.7 2.5-.9 3.7c-1.4 1.1-1.9-1.4-1.9-1.4S6.2 13.7 6.2 15.7C6.2 18.7 8.8 21 12 21z" />
  ),
  // Goutte d'eau et niveau
  "besoins-en-eau": (
    <>
      <path d="M12 3s5.5 6 5.5 9.8A5.5 5.5 0 0 1 12 18.3a5.5 5.5 0 0 1-5.5-5.5C6.5 9 12 3 12 3z" />
      <path d="M7.2 14.2c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2" />
    </>
  ),
  // Tracé d'électrocardiogramme dans un cœur
  "frequence-cardiaque": (
    <>
      <path d="M12 20.5S3.5 15.2 3.5 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.6c0 5.6-8.5 10.9-8.5 10.9z" />
      <path d="M6.5 12h2.2l1.3-2.4 1.9 4.4 1.5-2h2.6" />
    </>
  ),
  // Calendrier avec repère de terme
  "date-accouchement": (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <path d="m9.5 14.5 1.75 1.75L15 12.5" />
    </>
  ),
  // Deux échelles à convertir : semaines d'un côté, mois de l'autre
  "semaines-grossesse": (
    <>
      <path d="M3.5 8.5h17M3.5 15.5h17" />
      <path d="M7 6.5v4M12 6.5v4M17 6.5v4" />
      <path d="M9.5 13.5v4M14.5 13.5v4" />
    </>
  ),
  // Cycle : flèche circulaire et jour marqué
  ovulation: (
    <>
      <path d="M20 12a8 8 0 1 1-3.2-6.4" />
      <path d="M20.5 4v4h-4" />
      <circle cx="12" cy="12" r="2.25" />
    </>
  ),
  // Seringue et calendrier : le rendez-vous vaccinal
  "calendrier-vaccinal": (
    <>
      <rect x="3" y="4.5" width="12" height="11" rx="2.5" />
      <path d="M6.5 3v3M11.5 3v3M3 9h12" />
      <path d="m15.5 20 5-5M17 13.5l3 3M18.5 16.5 21 14" />
    </>
  ),
  // Pipette graduée : l'instrument même de la dose
  "dose-paracetamol": (
    <>
      <path d="M9 3.5h6M12 3.5v3.5" />
      <path d="M8.5 7h7l-1 12.5a1.6 1.6 0 0 1-1.6 1.5h-1.8a1.6 1.6 0 0 1-1.6-1.5L8.5 7z" />
      <path d="M9.6 11h4.8M9.8 14.5h4.4" />
    </>
  ),
  // Tensiomètre : brassard et tracé
  "tension-arterielle": (
    <>
      <path d="M3.5 13h3l2-4 2.5 7 2.5-9 2 6h5" />
      <path d="M3.5 17.5h17" />
    </>
  ),
  // Goutte de sang et graduation
  "risque-diabete": (
    <>
      <path d="M12 3.5s5 5.4 5 9a5 5 0 0 1-10 0c0-3.6 5-9 5-9z" />
      <path d="M9.5 13.5h5" />
    </>
  ),
};

export function ToolIcon({ slug, className }: { slug: ToolSlug; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[slug]}
    </svg>
  );
}
