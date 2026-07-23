# SantéauMaroc — Plan d'implémentation SEO Phase 1 (0–6 mois)

> **Objectif** : générer un trafic organique massif et faire de SantéauMaroc la référence SEO santé au Maroc.
> **Cibles** : 5 000 pages SEO indexables · 500 guides santé · 20 000 fiches médecins.
> **Rédigé le** : 24/07/2026 — à partir d'une cartographie complète du code existant.

---

## 0. Reframing : Phase 1 = montée en charge, pas greenfield

La cartographie du code (routes, schéma Prisma, infra SEO) montre que **l'essentiel de l'architecture demandée existe déjà et fonctionne**. Reconstruire à partir de zéro régresserait des mois de travail. Ce plan est donc un **audit d'écart + feuille de route de scaling**.

### Ce qui EXISTE déjà (ne pas reconstruire)

| Type de page demandé | Route existante | État |
|---|---|---|
| Spécialité + ville | `/specialites/[slug]/[ville]` | ✅ ISR 3600s, `generateStaticParams`, noindex si <3 médecins, contenu ville-aware, FAQPage JSON-LD |
| Spécialité (hub) | `/specialites/[slug]` | ✅ ISR, ItemList de Physician (top 8), pré-rendu ~100 |
| Symptômes | `/symptomes/[slug]` | ✅ `HealthTopic kind=SYMPTOM`, MedicalWebPage + MedicalSymptom, verrou `reviewedAt` |
| Pathologies / maladies | `/maladies/[slug]` | ✅ `HealthTopic kind=DISEASE`, MedicalCondition JSON-LD |
| Examens | `/examens/[slug]` | ✅ `MedicalExam`, MedicalTest, prix min-max MAD |
| Traitements | `/traitements/[slug]` | ✅ `Treatment`, MedicalTherapy |
| Guides santé | `/blog/[slug]` | ✅ `Post` : cocons pilier/satellite, sources, evidenceLevel, FAQ, TOC |
| Glossaire | `/glossaire/[slug]` | ✅ `GlossaryTerm`, DefinedTerm |
| Q/R | `/questions/[slug]` | ✅ `Question`+`Answer`, QAPage, ISR 300s |
| Fiches médecins | `/praticiens/[slug]` | ⚠️ EXISTE mais **100 % dynamique** (voir lacune #2) |
| Villes | `/villes`, `/villes/[slug]` | ✅ |
| Sitemap segmenté | `app/sitemap.ts` | ✅ `generateSitemaps` → core / doctors / combos / content |
| robots + crawlers IA | `app/robots.ts` | ✅ Allowlist GPTBot, PerplexityBot, ClaudeBot, etc. |
| JSON-LD | inline dans pages | ✅ 25+ types schema.org (Physician, MedicalWebPage, FAQPage, QAPage, DefinedTerm…) |
| hreflang FR/AR + verrous YMYL | `lib/hreflang.ts` | ✅ AR annoncé seulement si `arReviewedAt` |
| Pipeline contenu bilingue | `scripts/*` | ✅ drafts `_ar_out`/`_qa_out` → seed → `*-approve.ts` |

### Les 4 VRAIES lacunes (le cœur de la Phase 1)

1. **VOLUME de contenu** — glossaire 81, symptômes 23, maladies/examens/traitements partiels. Le squelette est là ; le contenu ne l'est pas encore à l'échelle des 5 000 pages.
2. **Fiches médecins 100 % dynamiques** — `/praticiens/[slug]` n'a **pas** de `generateStaticParams`. 20 690 fiches rendues à la volée = risque d'indexation (crawl budget), TTFB élevé (cf. audit perf : sans pooler PG, pics 5-9s), coût. Les 20 000 « fiches » existent en base : le travail = **pré-rendu ISR + enrichissement**, pas création.
3. **Pages intention `/quel-medecin-pour-...`** — INEXISTANTES. Fort levier featured snippet / AI Overview, faible coût.
4. **Maillage interne statique** — `lib/blog-related.ts` (~200 slugs hand-mappés) + `specialty-family.ts` (heuristique). Ne scale pas à 5 000 pages. À rendre **programmatique** (graphe de contenu).

> ⚠️ **Contrainte technique projet** (AGENTS.md) : « This is NOT the Next.js you know ». Avant tout code touchant `generateStaticParams` à grande échelle, ISR/`revalidate`, PPR, ou `generateSitemaps`, **lire `node_modules/next/dist/docs/`**. Ce plan ne présuppose aucune API précise de Next 16 non vérifiée.

---

## 1. Écart cible vs existant (le calcul des volumes)

### 1.1 — 5 000 pages SEO

Le volume vient **majoritairement de combinaisons programmatiques**, pas de rédaction manuelle.

| Type de page | Existant (indexable) | Cible Phase 1 | Levier |
|---|---:|---:|---|
| Spécialité × ville (combos) | ~variable (≥3 médecins) | **2 000–3 000** | Programmatique. ~100 spé × villes à densité suffisante |
| Symptômes | 23 | **300** | Seed IA + relecture |
| Maladies / pathologies | partiel | **300** | Seed IA + relecture |
| Examens | partiel | **120** | Seed IA + relecture |
| Traitements | partiel | **120** | Seed IA + relecture |
| Glossaire | 81 | **600** | Seed IA + relecture (attention pages minces → regrouper) |
| Q/R | 472 | **1 000** | Cocons Q/R (déjà outillé `seed-qa-cocons`) |
| Pages intention `/quel-medecin-pour-*` | 0 | **300** | Nouveau type, gabarit unique |
| Hubs spécialité + hubs villes | ~150 | ~250 | Enrichissement |
| **Total indexable** | | **~5 000+** | |

**Insight** : atteindre 5 000 pages tient à **3 leviers seulement** — combos spé×ville (le plus gros), catalogues médicaux (symptômes/maladies/examens/traitements/glossaire), et Q/R + intention. Aucun ne demande de rédaction longue ; tous passent par le pipeline IA + relecture existant.

### 1.2 — 500 guides santé

`Post` (blog) : **227 articles existants** → **+273**. Structure cocon pilier/satellite déjà en place (`pillarId`/`satellites`). Cibler ~30 cocons santé majeurs (diabète, HTA, grossesse, migraine, vaccination, santé femme/enfant, cancer, santé mentale…) × ~8-15 satellites.

### 1.3 — 20 000 fiches médecins

**Elles existent déjà en base** (~20 690 `Doctor`). Le livrable n'est pas de les créer mais de :
- passer `/praticiens/[slug]` en **pré-rendu / ISR** (lacune #2),
- **enrichir** le contenu SEO faible (beaucoup de `description` = « Test » selon audits antérieurs),
- garantir l'indexation (sitemap doctors.xml existe déjà).

---

## 2. Architecture des dossiers Next.js

Structure existante à **conserver** (route groups + segment locale `[lang]`) :

```
app/
├── robots.ts                      ✅ existant
├── sitemap.ts                     ✅ existant (generateSitemaps)
├── opengraph-image.tsx            ✅ fallback marque
├── global-not-found.tsx           ✅
└── [lang]/
    ├── (site)/                    ← tout le public
    │   ├── specialites/[slug]/[ville]/     ✅
    │   ├── villes/[slug]/                   ✅
    │   ├── symptomes/[slug]/                ✅
    │   ├── maladies/[slug]/                 ✅
    │   ├── examens/[slug]/                  ✅
    │   ├── traitements/[slug]/              ✅
    │   ├── glossaire/[slug]/                ✅
    │   ├── questions/[slug]/                ✅
    │   ├── blog/[slug]/                     ✅
    │   ├── praticiens/[slug]/               ⚠️ ajouter generateStaticParams
    │   └── quel-medecin-pour/[slug]/        ➕ NOUVEAU (pages intention)
    └── admin/                     ✅ hors (site)
```

**Ajouts Phase 1 (dossiers) :**
- `app/[lang]/(site)/quel-medecin-pour/[slug]/page.tsx` — gabarit intention (voir §5).
- `app/[lang]/(site)/{symptomes,maladies,examens,traitements}/[slug]/opengraph-image.tsx` — OG dynamiques (aujourd'hui seuls blog + médecin en ont).
- `lib/content-graph.ts` — moteur de maillage programmatique (voir §8).
- `lib/seo/` — regrouper les helpers JSON-LD éparpillés inline (refacto non bloquante).

---

## 3. Schéma PostgreSQL / Prisma — modifications

Le schéma (48 modèles) couvre déjà tous les types de contenu. Modifications **ciblées** (via `db push`, pas `migrate dev` — convention projet) :

### 3.1 — `Specialty` : ajouter bilingue + SEO (lacune identifiée)

Aujourd'hui `Specialty` n'a **ni champs bilingues ni title/description** ; le contenu vit en dur dans `lib/specialty-content.ts` (FR only). Pour scaler et servir l'AR :

```prisma
model Specialty {
  // existant : id, name, slug, icon, order, relations…
  nameAr        String?
  intro         String?   @db.Text   // lead FR
  introAr       String?   @db.Text
  whenToConsult String?   @db.Text
  whenToConsultAr String? @db.Text
  metaTitle     String?
  metaDesc      String?
  metaTitleAr   String?
  metaDescAr    String?
  reviewedAt    DateTime?            // verrou YMYL cohérent avec le reste
  arReviewedAt  DateTime?
}
```
> Migration progressive : garder `lib/specialty-content.ts` comme fallback tant que la base n'est pas peuplée (repli champ par champ, comme `blogLocalized`).

### 3.2 — Pages intention `/quel-medecin-pour-*`

**Option A (recommandée)** : réutiliser `HealthTopic` avec un champ `whichDoctor` déjà quasi présent (`specialtyId` + `whenToConsult`). Générer la page intention à partir du symptôme/maladie lié → **pas de nouveau modèle**, juste une nouvelle route + un champ optionnel :

```prisma
model HealthTopic {
  // existant…
  intentSlug   String?  @unique   // ex: "mal-au-genou" → /quel-medecin-pour/mal-au-genou
  intentAnswer String?  @db.Text  // réponse featured-snippet 40-60 mots
  intentAnswerAr String? @db.Text
}
```
Ceci évite de dupliquer le contenu (anti-cannibalisation, principe déjà appliqué dans le schéma).

### 3.3 — Graphe de maillage interne (lacune #4)

Le maillage est aujourd'hui des tableaux TS statiques. Pour le rendre programmatique sans requêtes lourdes au runtime, **table de liens matérialisée** (recalculée par script, lue via `cachedQuery`) :

```prisma
model ContentLink {
  id         String   @id @default(cuid())
  fromType   ContentType   // SPECIALTY | SYMPTOM | DISEASE | EXAM | TREATMENT | POST | CITY | QUESTION | INTENT
  fromSlug   String
  toType     ContentType
  toSlug     String
  relation   LinkRelation  // TREATS | DIAGNOSED_BY | RELATED | LOCATED_IN | ANSWERS | PILLAR_OF
  weight     Int      @default(1)   // pour trier/plafonner les liens affichés
  @@index([fromType, fromSlug])
  @@unique([fromType, fromSlug, toType, toSlug, relation])
}
```
Alternative légère si l'on veut éviter une table : garder les `relatedSlugs[]`/`glossarySlugs[]` existants et générer le reste à la volée depuis `specialtyId` partagé. **Recommandation** : `ContentLink` matérialisé — traversable, testable, cache-friendly.

### 3.4 — Rien d'autre

`MedicalExam`, `Treatment`, `GlossaryTerm`, `Question`, `Answer`, `Post` ont déjà tous les champs nécessaires (bilingue, `reviewedAt`/`arReviewedAt`, `sources`, `faqJson`, `qualityScore`, `evidenceLevel`, `pillarId`). **Ne rien ajouter.**

---

## 4. Modèles de données & taxonomies (le contenu à produire)

Alimenter les catalogues. Chaque item = ligne créée `reviewedAt=null` (noindex) → relecture → `*-approve.ts`.

| Catalogue | Table | Volume cible | Source de la liste |
|---|---|---:|---|
| Spécialités | `Specialty` | ~100 (existant) | Nomenclature ordre des médecins MA |
| Villes | `City` | ~250 (existant, 234 géocodées) | Découpage administratif MA |
| Symptômes | `HealthTopic SYMPTOM` | 300 | Motifs de consultation fréquents (top requêtes GSC + Google Suggest FR/Darija) |
| Maladies | `HealthTopic DISEASE` | 300 | CIM-10 grand public + prévalence MA |
| Examens | `MedicalExam` | 120 | Imagerie / biologie / exploration |
| Traitements | `Treatment` | 120 | Par spécialité |
| Glossaire | `GlossaryTerm` | 600 | Termes issus des articles + symptômes |
| Q/R | `Question`/`Answer` | 1 000 | People-Also-Ask + questions patients réelles |
| Intention | `HealthTopic.intentSlug` | 300 | « quel médecin pour X » (Google Suggest) |
| Guides | `Post` | 500 | Cocons pilier/satellite |

**Priorisation par la demande réelle** (ne pas créer à l'aveugle) : construire la liste des slugs à partir de **Google Search Console** (requêtes impressions), **Google Suggest/PAA** scrapés, et des **volumes de recherche** FR + Darija. Un symptôme sans demande = page mince pénalisante.

---

## 5. Routes dynamiques & conventions d'URL

### Conventions (existantes, à conserver)
- Slugs FR sans accents, minuscules, tirets : `/symptomes/mal-de-tete`.
- Locale par segment : FR à `/`, AR à `/ar/...`.
- Canonical auto-référent + hreflang via `lib/hreflang.ts`. AR annoncé **seulement si `arReviewedAt`**.
- **noindex, follow** pour : combos <3 médecins, contenu non relu (`reviewedAt=null`), vues filtrées/triées (paramètres query), pagination au-delà de la page 1 sauf canonical.

### Nouveau : pages intention
```
/quel-medecin-pour/[slug]      → ex: /quel-medecin-pour/mal-au-genou
```
Gabarit court, format featured snippet :
1. **Réponse directe** (40-60 mots, `<p>` en tête) : « Pour une douleur au genou persistante, consultez d'abord un **rhumatologue** ou un **médecin du sport**… »
2. Tableau « selon le symptôme → spécialiste ».
3. Quand consulter en urgence (red flags).
4. CTA → liste médecins de la spécialité (× ville si géolocalisé).
5. FAQ (FAQPage JSON-LD).
6. Liens : symptôme lié, examens, maladies. (via `ContentLink`)

JSON-LD : `MedicalWebPage` + `FAQPage` + `BreadcrumbList`.

---

## 6. Composants réutilisables

Un patron `MedicalContentPage` existe déjà de fait (symptômes/maladies/examens/traitements partagent la structure short-answer → causes → red flags → spécialiste → FAQ → sources). **Consolider** en composants partagés pour éviter le fork :

- `<MedicalArticleLayout>` — trame commune (short answer, sections, red-flag box, sources, note de relecture, EssentielBox).
- `<RelatedContentRail>` — lit `ContentLink`, rend « spécialistes / examens / maladies / villes liées » (remplace le maillage statique).
- `<DoctorCTA>` — bloc conversion vers `/specialites/[slug]` ou `/specialites/[slug]/[ville]`.
- `<FaqSection>` + `faqJson` → FAQPage JSON-LD (helper unique).
- `<Breadcrumb>` (existant, partagé).
- `<JsonLd type=…>` — centraliser l'émission schema.org (aujourd'hui inline).
- `<ArticleSources>` (existant) + `<ReviewNote>` (fraîcheur / relecteur, E-E-A-T).
- OG images : factoriser un `ogTemplate()` partagé (le patron médecin/blog existe).

---

## 7. Stratégie de génération des pages (résumé exécutable)

1. **Combos spé×ville** (2 000-3 000 pages) : déjà générés par `generateStaticParams` sur `/specialites/[slug]/[ville]` avec seuil ≥3 médecins. **Action** : vérifier la couverture réelle (compter les combos ≥3 médecins), enrichir le contenu ville-aware (`lib/specialty-city-content.ts`), s'assurer que le seuil noindex est correct. **Coût quasi nul en création — c'est déjà là.**
2. **Catalogues médicaux** (symptômes/maladies/examens/traitements/glossaire) : pipeline IA §8 → seed → relecture → approve.
3. **Q/R** : `seed-qa-cocons` existant, monter à 1 000.
4. **Pages intention** : générer depuis `HealthTopic` (§3.2).
5. **Guides** : cocons `Post`, plateforme contributive existante + IA.
6. **20 000 fiches** : §9 (pré-rendu ISR + enrichissement).

---

## 8. Système de génération de contenu IA + contrôle qualité

Le projet a **déjà** le squelette (drafts `_ar_out`/`_qa_out` → seed → `*-approve.ts`, + `qualityScore`/`qualityReport`/`evidenceLevel`/`editorialStatus` sur `Post`). **Systématiser et industrialiser :**

### Pipeline
```
1. INTENT MINING   → liste de slugs priorisés (GSC + Suggest + PAA + volumes)   [semi-auto]
2. GÉNÉRATION IA   → un draft par slug, prompt gabarité par type de contenu     [auto, sous-agents]
                     sortie structurée: shortAnswer, causes[], redFlags[],
                     whenToConsult, faqJson, sources[], + variante AR
3. QUALITÉ AUTO    → score sur 100 (réutiliser qualityReport):                  [auto]
                     - unicité (anti-duplication inter-pages, n-grammes)
                     - lisibilité, densité, longueur
                     - présence sources vérifiables (URLs OMS/HAS/sociétés savantes)
                     - présence disclaimer médical si YMYL
                     - format snippet (réponse ≤ 320 car en tête)
4. SEED (noindex)  → insertion reviewedAt=null → page servie noindex,follow
5. RELECTURE HUMAINE (YMYL) → admin /admin/{symptomes,examens,…}                [humain]
                     obligatoire pour tout contenu médical sensible
6. APPROVE         → *-approve.ts pose reviewedAt (FR) puis arReviewedAt (AR)    [humain déclenche]
                     → page devient indexable
```

### Garde-fous E-E-A-T (obligatoires)
- **Sources** : chaque page médicale cite des sources vérifiables (`sources` JSON déjà normalisé par `lib/article-content.ts`). Prompt IA interdit d'affirmer sans source.
- **Disclaimer** médical + « quand consulter en urgence » sur tout symptôme/maladie/traitement.
- **Relecteur nommé** + date de relecture (E-E-A-T incarnée). ⚠️ Audit antérieur : **un seul auteur générique en base** — recruter/afficher de vrais relecteurs est le levier E-E-A-T #1.
- **Anti-cannibalisation** : le contenu court (symptôme/glossaire) **lie** vers le guide pilier, ne le duplique pas (principe déjà dans le schéma).
- **Bilingue verrouillé** : AR jamais indexé sans `arReviewedAt` (déjà appliqué).

### Prompts (gabarits par type)
Un prompt-template par type (symptôme, maladie, examen, traitement, glossaire, intention, guide), avec variables `{ville}`, `{spécialité}`, `{terme}`. Sortie JSON stricte validée par schéma (mêmes champs que la table). Interdictions explicites : pas de posologie précise, pas de diagnostic, toujours orienter vers un professionnel.

---

## 9. Maillage interne (programmatique)

Remplacer le maillage statique par le **graphe `ContentLink`** (§3.3), recalculé par script `scripts/build-content-graph.ts` et lu via `cachedQuery`.

### Règles de génération des liens (déterministes)
- **Symptôme → spécialiste** : `HealthTopic.specialtyId` → `Specialty`.
- **Spécialiste → villes** : top villes par densité de médecins → combos.
- **Symptôme ↔ maladies/examens/traitements** : partage `specialtyId` + proximité sémantique (synonymes/tags).
- **Tout → guide pilier** : `relatedSlugs[]` existant.
- **Guide → spécialiste + villes** : `lib/blog-related.ts` (à migrer dans le graphe).
- **Q/R → spécialiste + médecins** : `Question.specialtyId`/`cityId`.

Exemple de chaîne (celle du brief) entièrement dérivable :
```
Migraine (symptôme) → Neurologue (spécialité) → IRM (examen) → Casablanca (ville) → Médecins → RDV
```

### Affichage
`<RelatedContentRail>` plafonne à ~6-8 liens par bloc (tri par `weight`), pour ne pas diluer le PageRank interne. Chaque page a 1 lien retour vers son hub (spécialité) et vers l'accueil thématique.

---

## 10. Sitemap, indexation & mises à jour

### Existant (conserver)
- `generateSitemaps()` → 4 segments (core / doctors / combos / content), hreflang conditionnel, `revalidate 86400`.
- robots avec allowlist crawlers IA.

### Ajouts Phase 1
- **Image sitemap** (absent) : pour OG/avatars médecins et images de guides → Google Images.
- **IndexNow / Google Indexing API** : ping automatique à chaque `approve` (nouvelle page indexable) → indexation en heures, pas semaines. Critique pour 5 000 pages.
- **Segmentation fine** : quand doctors.xml approche 50 000 URLs, paginer (déjà prévu par `generateSitemaps`).
- **`lastModified` fiable** : lier à `updatedAt`/`reviewedAt` réels (pas `now()`), pour signaler la fraîcheur.
- **RSS** blog (mentionné dans le brief, à vérifier) → Discover/agrégateurs.
- **Gestion du crawl budget** : les ~20k fiches dynamiques (lacune #2) gaspillent le budget. Les passer en ISR pré-rendu concentre le crawl sur du contenu servable rapidement.

### Fiches médecins (lacune #2) — plan technique
- Ajouter `generateStaticParams` sur `/praticiens/[slug]` **filtré** (ex : médecins vérifiés / actifs / avec contenu riche d'abord) + ISR `revalidate`, la disponibilité/créneaux restant en client (patron déjà utilisé : contexte client + API `/api/praticiens/[id]/me`).
- ⚠️ **Piège connu** (mémoire projet) : pré-rendre en masse **sature Postgres au build** (`P2037 too many connections`) faute de pooler → plafonner le pool de connexions en phase build (`NEXT_PHASE`). Déjà documenté, réutiliser le correctif.
- Fallback ISR (`dynamicParams`) pour les fiches non pré-générées au build → générées à la première visite puis mises en cache.

---

## 11. Plan de développement — sprints de 2 semaines

Hypothèse : 1 dev full-stack + relecture médicale externe. Estimations en **jours-dev (j)**. Chaque sprint = 10 j.

### Sprint 1 — Fondations scaling & mesure
| # | Tâche | Est. | Critère d'acceptation |
|---|---|---:|---|
| 1.1 | Instrumentation : brancher GSC + tableau de bord positions/impressions/pages indexées | 1,5 j | Dashboard live, baseline capturée |
| 1.2 | Audit couverture combos spé×ville (compter ≥3 médecins) | 1 j | Rapport : X combos indexables aujourd'hui vs potentiel |
| 1.3 | `generateStaticParams` + ISR sur `/praticiens/[slug]` (filtré vérifiés d'abord) + fix pool PG build | 3 j | Build passe sans P2037 ; fiches vérifiées pré-rendues ; Lighthouse ≥95 sur échantillon |
| 1.4 | Image sitemap + IndexNow ping sur approve | 2 j | Nouvelles pages pingées ; image sitemap valide |
| 1.5 | Intent mining : pipeline liste de slugs priorisés (GSC + Suggest) | 2,5 j | CSV de 500+ slugs priorisés par type |
> **Priorité** : P0. Débloque mesure + crawl budget.

### Sprint 2 — Graphe de maillage + composants
| # | Tâche | Est. | Critère d'acceptation |
|---|---|---:|---|
| 2.1 | Modèle `ContentLink` + `scripts/build-content-graph.ts` | 3 j | Graphe peuplé ; règles §9 déterministes testées |
| 2.2 | `<RelatedContentRail>` lisant le graphe (via cachedQuery) | 2 j | Rendu sur symptôme/maladie/examen ; ≤8 liens ; cache hit vérifié |
| 2.3 | Consolidation `<MedicalArticleLayout>` + `<JsonLd>` + `<FaqSection>` | 3 j | Un seul composant partagé ; pas de régression JSON-LD (Rich Results Test) |
| 2.4 | Migration `blog-related.ts` → graphe | 2 j | Anciens liens reproduits, plus aucun slug hardcodé |
> **Priorité** : P0. Le maillage conditionne l'autorité thématique.

### Sprint 3 — Pipeline IA industrialisé
| # | Tâche | Est. | Critère d'acceptation |
|---|---|---:|---|
| 3.1 | Prompts gabarités par type + sortie JSON validée | 3 j | 6 gabarits ; validation schéma ; 0 hallucination de source sur échantillon |
| 3.2 | Scoring qualité auto (unicité/sources/lisibilité/snippet) | 3 j | Score/100 par draft ; seuil de blocage < 70 |
| 3.3 | Générateur de drafts en lot (sous-agents → `_out/`) + seed noindex | 2 j | 100 drafts symptômes générés, seedés noindex |
| 3.4 | Écran admin de relecture par lot (déjà partiel) | 2 j | Relecteur valide/rejette en lot ; approve pose reviewedAt |
> **Priorité** : P0/P1.

### Sprint 4 — Volume vague 1 (symptômes + maladies)
| # | Tâche | Est. | Critère d'acceptation |
|---|---|---:|---|
| 4.1 | Générer + relire + approuver 150 symptômes | 4 j (dont relecture) | 150 symptômes indexables FR ; sources OK |
| 4.2 | Générer + relire + approuver 150 maladies | 4 j | 150 maladies indexables FR |
| 4.3 | OG images dynamiques symptômes/maladies | 2 j | OG rendu correct FR/AR (Satori, Cairo pour AR) |
> **Priorité** : P1. +300 pages.

### Sprint 5 — Pages intention + examens/traitements
| # | Tâche | Est. | Critère d'acceptation |
|---|---|---:|---|
| 5.1 | Route `/quel-medecin-pour/[slug]` + gabarit + `intentSlug` | 3 j | 50 pages live ; featured-snippet format ; FAQPage valide |
| 5.2 | Générer 200 pages intention depuis HealthTopic | 2 j | 200 indexables, liées au graphe |
| 5.3 | Examens : monter à 120 (générer/relire/approuver) | 2,5 j | 120 examens indexables, prix MAD renseignés |
| 5.4 | Traitements : monter à 120 | 2,5 j | 120 traitements indexables |
> **Priorité** : P1. +~440 pages.

### Sprint 6 — Combos spé×ville + Specialty bilingue
| # | Tâche | Est. | Critère d'acceptation |
|---|---|---:|---|
| 6.1 | Champs bilingues/SEO sur `Specialty` + repli `specialty-content.ts` | 2 j | AR servable ; fallback FR sans casse |
| 6.2 | Enrichir contenu ville-aware combos + vérifier couverture 2 000+ | 4 j | 2 000+ combos indexables, contenu non dupliqué (unicité ville) |
| 6.3 | Hubs villes enrichis + maillage combos ↔ symptômes | 2 j | Chaque combo lie symptômes/examens pertinents |
| 6.4 | Traduction AR + approve vague symptômes/maladies (arReviewedAt) | 2 j | AR indexé pour le lot relu |
> **Priorité** : P1. Le plus gros gisement de pages.

### Sprint 7 — Glossaire + Q/R volume
| # | Tâche | Est. | Critère d'acceptation |
|---|---|---:|---|
| 7.1 | Glossaire 81 → 600 (générer/relire/approuver, éviter pages minces) | 4 j | 600 termes indexables ou regroupés ; DefinedTermSet |
| 7.2 | Q/R 472 → 1 000 via cocons | 3 j | 1 000 questions publiées, liées spécialité/ville |
| 7.3 | Pages intention → 300 | 1,5 j | 300 live |
| 7.4 | Audit anti-duplication global (n-grammes inter-pages) | 1,5 j | Rapport ; 0 cluster dupliqué > seuil |
> **Priorité** : P2.

### Sprint 8 — Guides (cocons) + fiches médecins enrichissement
| # | Tâche | Est. | Critère d'acceptation |
|---|---|---:|---|
| 8.1 | 30 cocons pilier/satellite → +150 guides (plateforme contributive + IA) | 5 j | 150 nouveaux `Post` publiés, reliés pilier |
| 8.2 | Enrichissement SEO fiches médecins (nettoyer `description` poubelle, bios) | 3 j | Échantillon : meta descriptions uniques, pas de « Test » |
| 8.3 | Étendre `generateStaticParams` fiches au-delà des vérifiés (par vagues) | 2 j | Build stable ; couverture montée |
> **Priorité** : P2. Vers 500 guides (suite en Phase 2).

> **Sprints 9–12 (mois 5–6)** : montée en charge résiduelle (guides 350→500, combos AR, symptômes/maladies vague 2), boucle d'optimisation pilotée par GSC (retravailler les pages en position 5-15), off-page/autorité (hors périmètre technique mais critique : audit antérieur = levier #1 restant).

---

## 12. Métriques de succès & instrumentation

### KPIs primaires (Search Console)
| Métrique | Baseline (S1) | Cible M3 | Cible M6 |
|---|---|---|---|
| Pages indexées | à mesurer | 2 500 | 5 000 |
| Impressions organiques / mois | baseline | ×3 | ×8 |
| Clics organiques / mois | baseline | ×3 | ×10 |
| Requêtes en top 10 | baseline | +500 | +2 000 |
| Position moyenne | baseline | −3 | −6 |
| Pages en featured snippet / AI Overview | 0 | 50 | 250 |

### KPIs de conversion (le trafic doit servir le business)
- Taux clic vers fiche médecin depuis pages contenu.
- Clics `tel:` (`PhoneClick` déjà tracké) + demandes de rappel (`CallbackRequest`).
- RDV initiés / confirmés depuis trafic organique.
- Assist conversion : % de sessions RDV ayant touché ≥1 page SEO.

### KPIs qualité / santé technique
- Core Web Vitals (LCP/CLS/INP) — CLS déjà à 0, maintenir.
- Lighthouse ≥95 (perf/SEO/a11y) sur chaque gabarit.
- % pages avec source vérifiable + relecteur nommé (E-E-A-T).
- Taux de pages noindex (contenu non relu) — doit décroître.
- Couverture AR (pages `arReviewedAt`) — l'arabe est un gisement quasi vierge (audits : AR ~0 % indexé au départ, désormais en cours).

### Dispositif de mesure
- GSC + export API hebdo → dashboard (tâche 1.1).
- `ArticleAnalytics` (déjà en base) pour vues/lecture par page.
- Revue mensuelle : cohorte de pages par sprint → temps d'indexation, position à 30/60/90 j.

---

## Annexe — Risques & décisions ouvertes

1. **Relecteurs médicaux réels** = pré-requis E-E-A-T et blocage YMYL. Sans eux, tout contenu reste `noindex`. **Décision produit/recrutement, pas technique.** C'est le risque #1 du plan.
2. **Qualité IA vs pénalité « helpful content »** : la génération massive doit passer le scoring unicité + relecture, sinon risque de déclassement global. Ne jamais publier sans relecture pour le YMYL.
3. **Pages minces** (glossaire, combos <3 médecins) : garder les seuils noindex ; regrouper plutôt que multiplier.
4. **Charge PG au build** (P2037) : correctif connu à réappliquer avant tout pré-rendu massif.
5. **Next 16 spécifique** : valider `generateStaticParams` à 20k + ISR + PPR dans `node_modules/next/dist/docs/` avant implémentation.
6. **Rythme de publication** : lisser les mises en index (IndexNow par lots) pour éviter un pic suspect.

---

*Ce plan capitalise sur l'architecture existante (routes, schéma, pipeline, sitemaps, JSON-LD, hreflang) et cible les 4 lacunes réelles : volume de contenu, pré-rendu des fiches, pages intention, maillage programmatique. Il évite délibérément de reconstruire l'existant.*
