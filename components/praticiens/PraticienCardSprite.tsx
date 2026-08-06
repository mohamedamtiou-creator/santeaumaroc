/**
 * Sprite SVG des icônes de PraticienCard.
 *
 * POURQUOI — une carte rend ~7 icônes ; un listing de 25 cartes en rendait ~171,
 * chacune redéclarant son `viewBox`, ses `stroke*` et ses `<path d="…">`. Mesuré
 * sur /praticiens : 49,6 KB dans le HTML + ~35 KB de plus dans le payload RSC
 * (les attributs SVG y sont re-sérialisés en JSON pour l'hydratation), soit ~17 %
 * d'un document de 493 KB. Le coût n'est pas le transfert (brotli écrase la
 * répétition) mais le PARSING — HTML et JSON — sur le fil principal, donc du TBT.
 *
 * COMMENT — les tracés sont déclarés UNE fois en `<symbol>`, les cartes ne
 * référencent plus qu'un `<use href="#…">`. Le nombre de nœuds DOM est inchangé
 * (`<svg><use/></svg>` ≈ `<svg><path/></svg>`) : le gain est en octets et en
 * parsing, pas en taille d'arbre.
 *
 * OÙ — rendu par le layout du groupe (site), et non par les pages : les cartes
 * sont rendues depuis au moins six endroits (page praticiens, PraticiensResults,
 * villes, spécialités, spécialité×ville, RelatedDoctors), dont des Client
 * Components qui rendent SANS que la page serveur soit montée. Le layout est le
 * seul point qui les couvre tous — en oublier un afficherait des icônes vides.
 *
 * `aria-hidden` + `display:none` : purement décoratif, hors de l'arbre
 * d'accessibilité. Attention, `display:none` sur le conteneur n'empêche PAS
 * `<use>` de résoudre ses références (contrairement à `hidden` sur certains
 * anciens moteurs) — c'est la forme recommandée.
 */
export function PraticienCardSprite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }} aria-hidden="true">
      {/* Étoile de notation. Ni fill ni stroke ici : l'appelant les pose sur le
          <svg> englobant (étoile pleine ambre vs vide grise) et ils sont hérités. */}
      <symbol id="pc-star" viewBox="0 0 12 12">
        <path d="M6 .5l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 7.5l-2.78 1.55.53-3.09L1.5 3.77l3.11-.45z" strokeWidth="1" />
      </symbol>

      {/* Badge « Vérifié » — bouclier + coche. */}
      <symbol id="pc-shield-check" viewBox="0 0 12 12" fill="none" stroke="currentColor"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 0.75L0.75 3.25V7c0 2.5 1.9 4.4 5.25 5.25C9.35 11.4 11.25 9.5 11.25 7V3.25z" strokeWidth="1.1" />
        <path d="M3.75 6.5l1.75 1.75L9.25 4.5" strokeWidth="1.4" />
      </symbol>

      {/* Étoile pleine du badge Pro (fill, pas de stroke). */}
      <symbol id="pc-star-solid" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 .5l1.55 3.14 3.45.5-2.5 2.44.59 3.42L6 8.79 2.91 10.4l.59-3.42L1 4.14l3.45-.5z" />
      </symbol>

      {/* Localisation (adresse + ville). */}
      <symbol id="pc-map-pin" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 1C3.79 1 2 2.79 2 5c0 3.28 4 9 4 9s4-5.72 4-9c0-2.21-1.79-4-4-4z" />
        <circle cx="6" cy="5" r="1.5" />
      </symbol>

      {/* Langues parlées. */}
      <symbol id="pc-globe" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25">
        <circle cx="7" cy="7" r="5.5" />
        <path d="M1.5 7h11M7 1.5c1.5 1.6 1.5 9.4 0 11M7 1.5c-1.5 1.6-1.5 9.4 0 11" strokeLinecap="round" />
      </symbol>

      {/* Conventionnement (AMO / CNSS / RAMED…). */}
      <symbol id="pc-shield" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 1L2 3v3.5C2 9.5 4.2 11.7 7 12.5c2.8-.8 5-3 5-6V3L7 1z" />
        <path d="M4.75 6.75L6.4 8.4 9.5 5.3" strokeWidth="1.4" />
      </symbol>

      {/* CTA « Prendre RDV ». */}
      <symbol id="pc-calendar" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2.25" y="3" width="11.5" height="11" rx="2" />
        <path d="M2.25 6.5h11.5M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round" />
      </symbol>

      {/* CTA « Appeler ». */}
      <symbol id="pc-phone" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z" />
      </symbol>

      {/* Chevron « voir le profil » / « plus de créneaux ». */}
      <symbol id="pc-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 3 5 5-5 5" />
      </symbol>
    </svg>
  );
}
