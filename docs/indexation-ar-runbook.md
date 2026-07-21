# Runbook — Indexation arabe (Search Console)

Objectif : faire **réellement indexer** par Google la version arabe (`/ar`) du site.
Le socle technique est en place ; ce chantier est **opérationnel** (Search Console) +
**volume de contenu AR relu**. Il ne se code pas.

## État de départ (audit du 21/07/2026)

**Technique — OK, aucun blocage :**
- `metadataBase` défini → hreflang en URL absolue.
- Canonical **auto-référent** par langue (`/ar/…` se déclare canonique de lui-même, ne
  pointe PAS vers le FR — c'est LE point critique, et il est correct).
- hreflang réciproque `fr-MA` / `ar-MA` / `x-default` (métadonnées + sitemap), déclaré
  **uniquement** quand la traduction est relue (`arReviewedAt`), sinon FR seul.
- `robots.txt` autorise `/ar` ; proxy `/ar → [lang]=ar`.

**Surface AR réellement éligible aujourd'hui : ~699 pages**
| Type | AR live |
|---|---|
| Blog | 227 |
| Questions/Réponses | 472 |
| Glossaire | 0 ⚠️ (FR indexé mais AR jamais validé) |
| Symptômes / Maladies / Examens / Traitements | 0 |

> ⚠️ « AR servi » ≠ « AR indexé ». Google doit encore le crawler et **choisir** de
> l'indexer. C'est ce que ce runbook pilote.

---

## Étape 1 — Search Console : propriété & sitemaps (une fois)

1. Propriété **domaine** (`santeaumaroc.com`) — couvre `/` ET `/ar` d'un coup.
   *(Une propriété « préfixe d'URL » sur `/` ne verrait pas `/ar` : préférer la
   propriété domaine, validée par DNS.)*
2. Soumettre les 4 sitemaps :
   - `/sitemap/core.xml` · `/sitemap/doctors.xml` · `/sitemap/combos.xml` · `/sitemap/content.xml`
   - Les URLs AR ne sont **pas** des `<loc>` séparés : elles sont déclarées en
     `alternates` hreflang dans ces mêmes sitemaps (mécanisme standard). Rien à ajouter.

## Étape 2 — Vérifier hreflang & indexabilité (échantillon)

Pour 3–5 URLs AR à fort potentiel (ex. `/ar/blog/<slug>`, `/ar/questions/<slug>`) :
1. **Inspection d'URL** → « Tester l'URL en direct ».
2. Vérifier :
   - [ ] « L'URL sera indexée » (pas de `noindex`).
   - [ ] **Canonical retenue par Google = l'URL `/ar` elle-même** (❗ si Google retient
         la version FR comme canonique, l'AR ne sera jamais indexé — signaler).
   - [ ] hreflang détectés (fr-MA / ar-MA / x-default).
3. Rapport **Pages** → filtrer les URL contenant `/ar/` : lire les motifs d'exclusion
   (« Autre page avec balise canonique correcte », « Explorée, non indexée », etc.).
4. Rapport **International / hreflang** (ou via un outil tiers) : zéro erreur de
   réciprocité / code région.

## Étape 3 — Forcer l'amorçage

- **Demander l'indexation** manuellement pour ~10–20 URLs AR phares (blog piliers,
  Q/R à fort volume). Amorce le crawl ; le reste suit via sitemap.
- Vérifier dans les **logs / rapport Crawl** que Googlebot passe bien sur `/ar/*`.

## Étape 4 — Élargir la surface AR (quick wins, dans l'app)

Plus il y a d'AR relu, plus il y a d'AR indexable. Priorité :
1. **Glossaire AR** : 39 termes FR indexés mais AR à 0. Si les traductions existent
   (`termAr`/`definitionAr`), les valider pour ouvrir 39 pages AR d'un coup.
2. **Contenu de cette session** après relecture AR (voir `docs/relecture-checklist.md`
   P3) : `scripts/exams-approve-ar.ts`, `treatments-approve-ar.ts` (+ symptômes/maladies
   via validation `arReviewedAt`).
3. Ne jamais ouvrir l'AR d'une fiche dont la traduction n'est pas relue (YMYL).

## Étape 5 — Mesurer (KPI, hebdomadaire)

| KPI | Source | Cible |
|---|---|---|
| Pages AR indexées / soumises | Search Console (filtre `/ar/`) | ↗ vers ~100 % de la surface AR relue |
| Taux d'indexation **AR vs FR** | Search Console | réduire l'écart |
| Impressions / clics AR | Performances (filtre requêtes arabes / pays MA) | ↗ |
| Erreurs hreflang | Search Console / outil | 0 |

Cadence : **hebdomadaire** au lancement (le temps que l'AR soit crawlé), puis mensuel.

## Étape 6 — Au-delà de l'indexation

L'indexation ouvre la porte ; le **classement** AR dépend ensuite de :
- **l'autorité off-page arabe** (quelques liens / citations en arabe) — levier le plus faible aujourd'hui ;
- la **profondeur du contenu AR** (volume relu) ;
- l'E-E-A-T (signature de relecture, déjà en place conditionnellement).

---

### Rappel — ce qui est déjà fait (ne pas refaire)
Canonical, hreflang, metadataBase, robots, sitemaps AR, garde-fous `arReviewedAt`.
**Aucune modification de code n'est requise pour indexer l'AR** — seulement de
l'exécution Search Console et du contenu AR relu.
