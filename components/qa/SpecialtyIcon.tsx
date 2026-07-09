/**
 * Icône distincte par spécialité pour la grille des catégories Q/R.
 *
 * Résolution heuristique par mot-clé sur le libellé (même esprit grossier que
 * lib/specialty-family) : sert à DIFFÉRENCIER visuellement les cartes, pas à
 * établir une iconographie médicale exacte. Repli stéthoscope.
 * Composant serveur, viewBox 20×20, trait `currentColor`.
 */

type IconKey =
  | "heart" | "person" | "venus" | "cross" | "droplet" | "leaf" | "pill"
  | "bone" | "sparkle" | "ear" | "brain" | "tooth" | "eye" | "lungs"
  | "kidney" | "virus" | "stethoscope";

function resolve(name: string): IconKey {
  const n = name.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "");
  if (/cardio|angio|vascul|veine/.test(n)) return "heart";
  if (/pediat|nourrisson|nteant|enfant/.test(n)) return "person";
  if (/gyneco|obstet|sage-?femme|matern/.test(n)) return "venus";
  if (/traumato|orthop|rhumat|osseu/.test(n)) return "bone";
  if (/urgence|catastrophe|reanim|anesth|chirurg/.test(n)) return "cross";
  if (/endocrin|diabet|metabol/.test(n)) return "droplet";
  if (/nutrition|dietet|allerg/.test(n)) return "leaf";
  if (/gastro|hepato|digest|entero/.test(n)) return "pill";
  if (/dermato|dermat|peau/.test(n)) return "sparkle";
  if (/oto|rhino|laryng|orl/.test(n)) return "ear";
  if (/neuro|psychiatr|psycholog|mental/.test(n)) return "brain";
  if (/dent|stomato/.test(n)) return "tooth";
  if (/ophtalmo|oeil|oculair|vision/.test(n)) return "eye";
  if (/pneumo|phtisio|tabaco|respir|poumon/.test(n)) return "lungs";
  if (/uro|andro|nephro|renal/.test(n)) return "kidney";
  if (/infect|virolog|parasit|microbio/.test(n)) return "virus";
  return "stethoscope";
}

const PATHS: Record<IconKey, React.ReactNode> = {
  heart: <path d="M10 15.5 3.9 9.4a3.4 3.4 0 0 1 4.8-4.8l1.3 1.3 1.3-1.3a3.4 3.4 0 0 1 4.8 4.8L10 15.5z" />,
  person: <><circle cx="10" cy="6.2" r="2.6" /><path d="M4.9 16a5.1 5.1 0 0 1 10.2 0" /></>,
  venus: <><circle cx="10" cy="7" r="3.4" /><path d="M10 10.4V17M7.6 14h4.8" /></>,
  cross: <><rect x="3.6" y="3.6" width="12.8" height="12.8" rx="3.4" /><path d="M10 7v6M7 10h6" /></>,
  droplet: <path d="M10 3s5 5.2 5 8.5a5 5 0 0 1-10 0C5 8.2 10 3 10 3z" />,
  leaf: <><path d="M4 16C4 9.4 9.4 4 16 4c0 6.6-5.4 12-12 12z" /><path d="M4 16c2.8-2.8 5-4.8 8-6.4" /></>,
  pill: <><rect x="3.6" y="7.5" width="12.8" height="5" rx="2.5" transform="rotate(-45 10 10)" /><path d="M7.5 7.5 12.5 12.5" /></>,
  bone: <><path d="M6.4 6.4 13.6 13.6" /><circle cx="5.3" cy="5.3" r="1.5" /><circle cx="6.9" cy="4.2" r="1.3" /><circle cx="14.7" cy="14.7" r="1.5" /><circle cx="13.1" cy="15.8" r="1.3" /></>,
  sparkle: <path d="M10 3.5v13M4.2 6.8l11.6 6.4M15.8 6.8 4.2 13.2" />,
  ear: <path d="M6.5 9a3.5 3.5 0 1 1 7 0c0 2-1.5 2.5-2 3.8s-.6 2.2-2 2.2A2.5 2.5 0 0 1 7 12.5" />,
  brain: <><path d="M9 4.6a2.2 2.2 0 0 0-4 1.2c-1 .4-1.6 1.3-1.6 2.3a2.3 2.3 0 0 0 1.2 2 2.2 2.2 0 0 0 2 2.7H9zM9 4.6v8.2" /><path d="M11 4.6a2.2 2.2 0 0 1 4 1.2c1 .4 1.6 1.3 1.6 2.3a2.3 2.3 0 0 1-1.2 2 2.2 2.2 0 0 1-2 2.7H11zM11 4.6v8.2" /></>,
  tooth: <path d="M6.4 3.6C5 3.6 4 4.9 4 6.7c0 2.6.9 3.6 1.4 6.3.3 1.6 1.6 1.7 2-.4.3-1.4.4-2.2 1.1-2.2h1c.7 0 .8.8 1.1 2.2.4 2.1 1.7 2 2 .4.5-2.7 1.4-3.7 1.4-6.3 0-1.8-1-3.1-2.4-3.1-1.2 0-2 .7-3 .7s-1.8-.7-3-.7z" />,
  eye: <><path d="M2.5 10S5.5 5 10 5s7.5 5 7.5 5-3 5-7.5 5-7.5-5-7.5-5z" /><circle cx="10" cy="10" r="2.2" /></>,
  lungs: <path d="M10 3.5v5M10 8.5c-.5-1.3-1.8-1.6-2.8-1.1S6 9.1 6 11.1c0 2.1.3 3.7 1.8 3.7S10 13.4 10 11.5zM10 8.5c.5-1.3 1.8-1.6 2.8-1.1S14 9.1 14 11.1c0 2.1-.3 3.7-1.8 3.7S10 13.4 10 11.5z" />,
  kidney: <path d="M11.5 4.5c-3.1 0-5.5 2.5-5.5 5.7S8 15.5 10 15.5c1.4 0 1.7-1.3 1.7-2.7 0-1.3-.8-1.9-.8-3.1s1-1.9 2.1-1.9" />,
  virus: <><circle cx="10" cy="10" r="4" /><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7 6.1 6.1M13.9 13.9l1.4 1.4M15.3 4.7 13.9 6.1M6.1 13.9l-1.4 1.4" /></>,
  stethoscope: <><path d="M5 3.5v3.4a3 3 0 0 0 6 0V3.5M4 3.5h1.6M10.4 3.5H12M8 10v2.2a4 4 0 0 0 4 4 3 3 0 0 0 3-3v-1.3" /><circle cx="15" cy="11" r="1.6" /></>,
};

export function SpecialtyIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[resolve(name)]}
    </svg>
  );
}
