import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Assainissement du HTML des réponses médicales (sortie Tiptap) côté serveur.
 *
 * WHY: un client malveillant peut POSTer du HTML arbitraire à la Server Action
 * en contournant l'éditeur Tiptap. La défense XSS DOIT donc être côté serveur.
 * On applique une liste blanche stricte alignée sur ce que l'éditeur produit
 * (StarterKit + Link). Aucune image, aucun style inline, aucun script/iframe.
 *
 * Les liens sont neutralisés SEO/sécurité : rel="nofollow ugc noopener" +
 * target _blank, et seuls http/https/mailto sont autorisés (pas de javascript:).
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "strike", "del",
    "ul", "ol", "li", "blockquote", "h2", "h3", "h4",
    "a", "code", "pre", "hr",
  ],
  allowedAttributes: {
    // rel/target doivent être autorisés sinon ils sont supprimés APRÈS transformTags.
    a: ["href", "rel", "target"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href"],
  // Force la sécurisation des liens UGC (contenu généré par l'utilisateur).
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...(attribs.href ? { href: attribs.href } : {}),
        rel: "nofollow ugc noopener",
        target: "_blank",
      },
    }),
  },
  // Supprime totalement le contenu de ces balises si jamais elles passent.
  disallowedTagsMode: "discard",
  nonTextTags: ["style", "script", "textarea", "noscript", "iframe"],
};

export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty ?? "", OPTIONS).trim();
}

/** Extrait le texte brut (pour résumés, méta-description, snippets JSON-LD). */
export function htmlToPlainText(html: string): string {
  const text = sanitizeHtml(html ?? "", { allowedTags: [], allowedAttributes: {} });
  return text.replace(/\s+/g, " ").trim();
}
