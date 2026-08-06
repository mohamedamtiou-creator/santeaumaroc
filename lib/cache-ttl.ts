/**
 * Paliers de fraîcheur — source unique des TTL de cache.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LA RÈGLE DU BINÔME
 * ─────────────────────────────────────────────────────────────────────────────
 * La fenêtre ISR effective d'une route est le MINIMUM de tous les `revalidate`
 * rencontrés dans son arbre — segment, layouts, et chaque `cachedQuery` /
 * `unstable_cache` traversé (documenté par Next : « the lowest revalidate across
 * each layout and page of a single route will determine the revalidation
 * frequency of the entire route »).
 *
 * Autrement dit : allonger `export const revalidate` SANS allonger le
 * `cachedQuery` correspondant ne fait STRICTEMENT RIEN. Le dépôt en portait la
 * trace — une fiche praticien déclarée à 86400 était servie à 3600 parce que
 * `getDoctorProfile` passait par `cachedQuery(…, 3600)`.
 *
 * DEUX INVARIANTS À TENIR :
 *   1. Toute donnée lue par une page passe par un palier de ce fichier.
 *   2. Le littéral `export const revalidate` d'une page ÉGALE le plus petit
 *      palier de son arbre. Pas plus grand : une valeur supérieure est
 *      décorative et ment au lecteur.
 *
 * `export const revalidate` doit rester un littéral numérique — Next l'extrait
 * statiquement (`revalidate = 600` est valide, `revalidate = 60 * 10` ne l'est
 * pas), donc on ne peut PAS y écrire `TTL.DIRECTORY`. Chaque page rappelle le
 * palier en commentaire au-dessus de son littéral.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI CES VALEURS SONT SÛRES
 * ─────────────────────────────────────────────────────────────────────────────
 * Ce sont des PLAFONDS de dérive, pas des délais de publication. Toute mutation
 * passe par `lib/revalidate.ts`, qui expire immédiatement la route ET le tag de
 * données correspondants, dans les deux locales. Le TTL n'est plus que le filet
 * pour ce qui échappe aux Server Actions (import SQL, écriture directe en base).
 *
 * C'était l'inverse avant : les invalidations FR étant des no-op (cf.
 * `lib/revalidate.ts`), le TTL d'une heure portait SEUL toute la fraîcheur du
 * site — et facturait 13 objets ISR réécrits par page et par cycle.
 */
export const TTL = {
  /**
   * 7 jours — contenu sans aucune donnée vivante.
   * Réservé aux pages dont le rendu ne dépend que du référentiel figé ou de
   * contenu rédactionnel : silo remboursement AMO/CNSS, observatoire, pages
   * institutionnelles. Ne PAS l'utiliser dès qu'un compteur de médecins, une
   * note moyenne ou une liste d'articles entre dans le rendu.
   */
  STATIC: 604800,

  /**
   * 24 heures — référentiel annuaire et contenu éditorial qui s'y adosse.
   * Fiches praticien et établissement, métadonnées et compteurs de spécialité /
   * ville, index alphabétiques, articles de blog, questions, et toutes les pages
   * santé (elles embarquent `<RelatedDoctors>`, donc de la donnée vivante :
   * c'est ce bloc qui fixe leur plafond réel à 24 h, pas 7 jours).
   */
  DIRECTORY: 86400,

  /**
   * 6 heures — listes de praticiens paginées et filtrées.
   * Palier le plus court parce que ces listes portent les créneaux de rendez-vous
   * affichés en pastilles sur les cartes (`DoctorCardDTO.slots`), qui bougent à
   * chaque réservation.
   *
   * Une pastille périmée n'engage rien : elle mène au tunnel `/praticiens/[slug]/rdv`,
   * rendu DYNAMIQUEMENT (lecture de session), qui recalcule la disponibilité
   * réelle et refuse un créneau déjà pris. L'invariant anti-double-réservation
   * est tenu là, pas dans le cache de listing.
   *
   * On n'expire PAS ce palier à chaque réservation : la clé de cache inclut tous
   * les filtres (ville, tri, dispo, conventionnement, langue, page, jour), donc
   * l'invalidation serait forcément globale — une réservation purgerait des
   * milliers d'entrées et déclencherait une tempête de régénérations. Le TTL est
   * le bon outil ici.
   */
  LISTING: 21600,
} as const;

export type TtlTier = (typeof TTL)[keyof typeof TTL];

/**
 * Locales PRÉ-RENDUES au build. Les autres restent servies — simplement générées
 * à la première visite, puis mises en cache comme n'importe quelle page ISR.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI L'ARABE N'EST PLUS PRÉ-RENDU
 * ─────────────────────────────────────────────────────────────────────────────
 * Le segment racine `[lang]` multiplie TOUT le build par le nombre de locales :
 * chaque `generateStaticParams` enfant est exécuté une fois par jeu de params du
 * parent. Mesuré sur le build de référence, c'était exactement moitié-moitié —
 * 5 013 pages FR (2,09 Go) contre 5 010 pages AR (2,19 Go), pour 128 126 objets
 * de cache ISR écrits à chaque déploiement.
 *
 * Or l'arabe est la moitié du build et une petite part du trafic : ce sont donc
 * précisément les pages « écrites mais jamais lues » qui creusaient le ratio
 * écriture/lecture (1,47 écriture par lecture, là où un ISR sain tourne à 1 pour
 * 50). On les payait deux fois — en minutes de build CPU, puis en écritures ISR —
 * pour un cache le plus souvent invalidé avant d'avoir servi.
 *
 * CE QUI NE CHANGE PAS, CÔTÉ SEO :
 *   - les URLs `/ar/**` répondent toujours 200 et rendent le même HTML ;
 *   - elles restent déclarées au sitemap avec leur `hreflang` (app/sitemap.ts) ;
 *   - `dynamicParams` vaut `true` par défaut → génération à la demande, puis
 *     cache normal pour toutes les visites suivantes ;
 *   - les verrous d'indexabilité AR existants (relecture `arReviewedAt`, etc.)
 *     sont inchangés.
 * Le seul effet est un premier octet plus lent sur la toute première visite
 * d'une URL arabe donnée, une fois par cycle de cache.
 *
 * ⚠️ Remettre "ar" ici RE-DOUBLE le build et les écritures ISR. À ne faire que si
 * le trafic arabe devient comparable au trafic français.
 */
export const PRERENDERED_LOCALES = ["fr"] as const;
