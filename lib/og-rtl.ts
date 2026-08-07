/**
 * Composition de texte ARABE dans les images `ImageResponse` (`next/og`).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SATORI NE RÉORDONNE PAS LA BIDI
 * ─────────────────────────────────────────────────────────────────────────────
 * Satori — le moteur derrière `ImageResponse` — shape correctement les glyphes
 * arabes : les formes contextuelles et les ligatures obligatoires sont justes
 * (`@vercel/og` embarque le module Bidi d'opentype.js, qui fait ce travail-là).
 * Mais il n'applique AUCUN réordonnancement bidirectionnel : les mots sont posés
 * dans l'ordre source, de gauche à droite. Une phrase arabe de plusieurs mots
 * s'affiche donc à l'envers.
 *
 * Vérifié sur Next 16.2.9 en rendant « اعثر على طبيبك اليوم » sous sept
 * configurations. AUCUNE ne corrige l'ordre :
 *   - sans style, `direction: rtl`, `display: flex` + `direction: rtl`,
 *     `display: block` + `textAlign: right`, `display: block` + `direction: rtl`
 *     → tous identiques, mots en LTR ;
 *   - attribut JSX `dir="rtl"` → ignoré ;
 *   - caractère de forçage RLO (U+202E) → n'inverse rien ET casse le shaping du
 *     premier mot (glyphe manquant).
 * Seule l'inversion de l'ordre des mots côté JS produit le rendu correct.
 *
 * ⚠️ COROLLAIRE : l'alignement à droite ne peut pas non plus reposer sur
 * `direction: rtl`. Il passe par le flex — `alignItems`/`justifyContent:
 * flex-end` pour les blocs, `flexDirection: row-reverse` pour miroiter une
 * rangée de plusieurs éléments.
 *
 * ⚠️ Si une version future de Satori implémente la bidi, cet appel deviendra un
 * double-retournement (donc un bug) : retirer `rtlWords` et revérifier
 * visuellement — ne pas empiler un correctif par-dessus.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * L'ESPACEMENT INTER-MOTS EST LARGE, ET C'EST SATORI AUSSI
 * ─────────────────────────────────────────────────────────────────────────────
 * Satori rembourre la boîte de chaque mot arabe : mesuré à fonds colorés, l'encre
 * de deux mots voisins reste séparée d'environ 0,5 em même sans aucun caractère
 * espace entre eux. Ce n'est pas un défaut de Cairo — la même phrase en Tajawal
 * donne un espacement identique. Aucun levier ne le corrige :
 *   - `wordSpacing` (la propriété prévue pour ça) est purement ignoré ;
 *   - une marge négative uniforme est inutilisable, l'approche d'un mot arabe
 *     dépendant de sa lettre finale : à −14 px sur un titre de 66 px, « اعثر على »
 *     se collait tandis que « الطبيب المناسب » restait espacé, et à −7 px sur un
 *     sous-titre de 32 px les mots fusionnaient (« فيكلمدنالمغرب ») ;
 *   - changer de police n'y fait rien, et c'est même risqué : Noto Sans Arabic
 *     fait PLANTER le rendu (« lookupType: 5 - substFormat: 3 is not yet
 *     supported » — l'opentype.js embarqué ne lit pas sa table GSUB).
 *
 * Le seul levier restant est rédactionnel : garder les lignes arabes COURTES,
 * puisque c'est le nombre d'espaces qui rend l'aération visible. Les cartes OG
 * arabes ont donc une copie plus ramassée que leur équivalent français.
 */

/**
 * Retourne l'ordre des MOTS pour un rendu RTL correct sous Satori.
 *
 * N'inverse jamais les CARACTÈRES : chaque mot conserve ses glyphes et son
 * shaping. Les libellés restent donc écrits dans l'ordre LOGIQUE côté source
 * (lisibles en revue), et seul l'affichage est retourné.
 *
 * @param text  libellé dans l'ordre logique.
 * @param rtl   `true` si le texte servi est réellement arabe. Passer `false`
 *              laisse la chaîne intacte — utile quand un repli FR est possible
 *              (article sans traduction relue, par exemple) : la locale de l'URL
 *              ne suffit pas à décider, c'est la langue du texte SERVI qui compte.
 */
export function rtlWords(text: string, rtl: boolean): string {
  return rtl ? text.split(" ").reverse().join(" ") : text;
}

/**
 * Sous-ensemble de police à télécharger pour un rendu : Satori ne lit pas le
 * woff2, donc les polices viennent de l'API CSS2 de Google en TTF, et on borne
 * le téléchargement au texte réellement composé (`&text=`).
 *
 * ⚠️ Ne PAS sous-ensembler l'arabe : ses glyphes dépendent du contexte (formes
 * initiale/médiane/finale, ligatures), un sous-ensemble par caractères casse le
 * shaping. On charge la police arabe entière.
 */
export function latinSubset(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
