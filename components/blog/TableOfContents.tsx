import { getDictionary, type Dictionary } from "@/lib/i18n";

export type Heading = { level: number; text: string; id: string };

/**
 * Identifiant d'ancre depuis le texte d'un titre.
 *
 * La classe de caractères conserve les lettres ARABES (U+0600–U+06FF) en plus de
 * l'alphabet latin : sans elles, un titre en arabe était entièrement filtré et
 * produisait `id=""` puis `id="-2"`, `id="-3"`… — donc un sommaire dont le
 * premier lien pointait sur `#` et un attribut `id` vide, invalide en HTML. Le
 * jeu latin est inchangé (le tiret reste filtré) pour ne pas modifier les
 * ancres françaises déjà en ligne.
 */
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9؀-ۿ\s]/g, "")
    // Ponctuation arabe : filtrée comme l'est « ? » côté français, pour des
    // ancres homogènes entre les deux langues.
    .replace(/[،؛؟٪۔]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Repli si un titre ne laisse aucun caractère exploitable (emoji, ponctuation seule). */
function slugOrFallback(s: string, index: number) {
  return slugify(s) || `section-${index + 1}`;
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  const seen: Record<string, number> = {};
  const re = /<h([23])[^>]*>([\s\S]*?)<\/h[23]>/gi;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(html)) !== null) {
    const text = stripTags(m[2]);
    const base = slugOrFallback(text, i++);
    seen[base] = (seen[base] ?? 0) + 1;
    const id = seen[base] > 1 ? `${base}-${seen[base]}` : base;
    headings.push({ level: parseInt(m[1]), text, id });
  }
  return headings;
}

export function addHeadingIds(html: string): string {
  const seen: Record<string, number> = {};
  let i = 0;
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi, (_, lvl, attrs, inner) => {
    const text = stripTags(inner);
    const base = slugOrFallback(text, i++);
    seen[base] = (seen[base] ?? 0) + 1;
    const id = seen[base] > 1 ? `${base}-${seen[base]}` : base;
    return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
  });
}

export function TableOfContents({
  headings,
  t = getDictionary("fr").blog,
}: {
  headings: Heading[];
  t?: Dictionary["blog"];
}) {
  if (headings.length < 2) return null;
  return (
    <nav aria-label={t.tocAria}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round">
          <path d="M2 4h12M2 8h8M2 12h10"/>
        </svg>
        {t.tocTitle}
      </p>
      <ol className="space-y-1">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ps-3 border-s-2 border-slate-100" : ""}>
            <a
              href={`#${h.id}`}
              className={`block py-0.5 text-[13px] leading-snug transition-colors hover:text-primary-600 ${
                h.level === 2
                  ? "font-semibold text-slate-700"
                  : "text-slate-500 font-normal"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
