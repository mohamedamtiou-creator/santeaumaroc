// Icône SantéauMaroc — monogramme « Onde » : la lettre M (Maroc) dont le creux
// central ondule en S (Santé), dans un carré arrondi dégradé bleu→vert. Une seule
// géométrie continue, lisible jusqu'à 16 px. Réservée au favicon / app icon.

type Props = {
  size?: number;
  /** gradId : évite les collisions d'IDs SVG entre plusieurs instances. */
  gradId?: string;
  className?: string;
};

export function LogoMark({ size = 40, gradId = "lm", className }: Props) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${gradId}-g`} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill={`url(#${gradId}-g)`} />
      <path
        d="M30 88 L30 40 C45 40 51 53 60 61 C69 69 75 80 90 80"
        fill="none"
        stroke="#ffffff"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M90 80 L90 40 C75 40 69 53 60 61"
        fill="none"
        stroke="#ffffff"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
