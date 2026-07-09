// Logo SantéauMaroc — lockup affiché dans la navbar et le footer :
// icône « Onde » (monogramme S·M) + wordmark « SantéauMaroc » (Inter, extra-bold,
// tracking serré). Le « au » est mis en valeur en vert. Même présentation que la
// proposition d'identité (icône + wordmark côte à côte).

import { LogoMark } from "./LogoMark";

type Props = {
  /** Classe de taille de police du wordmark, ex. "text-xl". */
  className?: string;
  /** Sur fond sombre : texte clair, accent vert clair. */
  dark?: boolean;
  /** Taille (px) de l'icône carrée. */
  iconSize?: number;
  /** Affiche l'icône à gauche du wordmark (défaut: true). */
  showIcon?: boolean;
  /** ID de gradient unique (évite les collisions SVG entre instances). */
  gradId?: string;
  /**
   * Classes contrôlant l'affichage du wordmark (display + responsive).
   * Défaut "inline-flex" (toujours visible). Ex. "hidden sm:inline-flex"
   * pour n'afficher que l'icône sur mobile.
   */
  textClassName?: string;
  /** Locale active. En "ar", le wordmark devient « الصحة في المغرب » (RTL). */
  locale?: string;
};

// Wordmark par locale. Le terme central (« au » / « في ») reçoit l'accent vert.
// L'arabe est la traduction littérale de « Santé au Maroc ».
const WORDMARK: Record<string, { pre: string; mid: string; post: string; label: string; spaced: boolean }> = {
  fr: { pre: "Santé", mid: "au", post: "Maroc", label: "SantéauMaroc", spaced: false },
  ar: { pre: "الصحة", mid: "في", post: "المغرب", label: "الصحة في المغرب", spaced: true },
};

export function Logo({
  className = "text-xl",
  dark = false,
  iconSize = 32,
  showIcon = true,
  gradId = "lm",
  textClassName = "inline-flex",
  locale = "fr",
}: Props) {
  const main = dark ? "text-white" : "text-[#2563eb]";
  const accent = dark ? "text-[#34d399]" : "text-[#059669]";

  const isAr = locale === "ar";
  const w = WORDMARK[isAr ? "ar" : "fr"];

  return (
    <span
      role="img"
      aria-label={w.label}
      dir={isAr ? "rtl" : "ltr"}
      className={`inline-flex items-center gap-2 font-extrabold tracking-tight leading-none ${className}`}
    >
      {showIcon && <LogoMark size={iconSize} gradId={gradId} className="shrink-0" />}
      <span className={`${textClassName} items-baseline ${w.spaced ? "gap-1.5" : ""}`} aria-hidden="true">
        <span className={main}>{w.pre}</span>
        <span className={accent}>{w.mid}</span>
        <span className={main}>{w.post}</span>
      </span>
    </span>
  );
}
