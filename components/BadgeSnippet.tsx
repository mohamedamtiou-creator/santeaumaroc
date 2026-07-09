"use client";

import { useState } from "react";

/**
 * Aperçu du badge + code d'intégration copiable. Le lien <a> pointe vers la
 * fiche du praticien : c'est lui qui porte le backlink (badge de vérification
 * légitime, ancre neutre via alt). Composant client (presse-papiers).
 */
export function BadgeSnippet({
  profileUrl,
  badgeUrl,
  altText,
  copyLabel,
  copiedLabel,
}: {
  profileUrl: string;
  badgeUrl: string;
  altText: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const snippet =
    `<a href="${profileUrl}" target="_blank" rel="noopener">\n` +
    `  <img src="${badgeUrl}" alt="${altText}" width="220" height="56" style="border:0" loading="lazy" />\n` +
    `</a>`;

  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : l'utilisateur peut sélectionner le texte */
    }
  }

  return (
    <div className="space-y-4">
      {/* Aperçu */}
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt={altText} width={220} height={56} />
      </div>

      {/* Code + copie */}
      <div className="relative">
        <textarea
          readOnly
          value={snippet}
          rows={4}
          dir="ltr"
          onFocus={(e) => e.currentTarget.select()}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-900 p-4 pe-28 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
          aria-label={copyLabel}
        />
        <button
          type="button"
          onClick={copy}
          className="btn-primary absolute end-3 top-3 h-8 px-3 text-xs"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}
