# Pipeline « pages intention » — montée en volume vers 300

Route `/quel-medecin-pour/[slug]` (+ index `/quel-medecin-pour`), adossée à
`HealthTopic` (cf. mémoire *intent-pages*). Ce document décrit **comment passer
des 33 pages actuelles aux ~300 du plan**, sans publier de contenu YMYL à
l'aveugle. **Rien n'est rédigé tant que la liste de candidats n'est pas validée.**

## État actuel (2026-07-24)

| | Nombre |
|---|---:|
| HealthTopic SYMPTOM (relus FR+AR) | 23 |
| HealthTopic DISEASE (relus FR+AR) | 10 |
| **Pages intention live** (`intentSlug` posé, réponses uniques FR+AR) | **33** |
| Candidats proposés (Waves 1-4, validés techniquement) | 232 |
| **Total projeté si tous seedés** | **265** |

Reste ~35 pour atteindre 300 → **Wave finale** (longue traîne, à sourcer sur la
demande réelle : Google Search Console + Google Suggest/PAA, FR + darija).

Les 232 candidats sont répartis en 4 vagues dans `intent-candidates.ts` :
- **Wave 1** (129) : épidémiologie MA + rôle groupes de spécialistes.
- **Wave 2** (53) : top motifs téléconsultation FR (Qare, Livi, ameli) + endémies/carences MA (kyste hydatique, brucellose, vitamine D, rétinopathie diabétique).
- **Wave 3** (18) : dico médical FR (VIDAL, Elsan, hopital.fr) + travel-health MA.
- **Wave 4** (32) : dico médical EN (NHS Health A-Z) + top motifs primary care (Mayo/Cleveland/WebMD), affections courantes manquantes.

Tiers : T1 42 (forte demande) · T2 114 (fréquent) · T3 76 (longue traîne → confirmer GSC).

## Le livrable à valider : `scripts/data/intent-candidates.ts`

129 candidats **priorisés par l'épidémiologie marocaine réelle** et organisés
par spécialité (rôle « groupes de spécialistes »). Chaque entrée =
`{ slug, term, kind, specialty, tier, note? }`.

- **tier 1** (39) : forte demande / prévalence MA → à faire en premier.
- **tier 2** (82) : fréquent.
- **tier 3** (8) : longue traîne, **à confirmer par GSC avant rédaction**.

Sources d'amorçage (à joindre au dossier E-E-A-T) : STEPS 2017, Revue Marocaine
de Santé Publique, rapport CESE santé mentale 2022, enquête MS 2022, données
leishmaniose/tuberculose. Détail des chiffres en tête du fichier candidats.

### Comment valider / élaguer
1. Ouvrir `scripts/data/intent-candidates.ts`.
2. **Supprimer** les lignes non pertinentes, **corriger** un `term`/`specialty`,
   **ajouter** des candidats issus de tes exports GSC (respecter le type).
3. Rejouer le contrôle (spécialités valides, zéro doublon/collision) :
   ```
   npx tsx --env-file=.env scripts/validate-intent-candidates.ts
   ```
   Il doit afficher `issues → 0/0/0/0`.

## Le pipeline (par lot de ~30-40, après validation)

Chaque candidat devient un **HealthTopic complet et bilingue**, relu, avant
d'exposer sa page intention. Étapes :

1. **Rédaction du contenu triage** (FR d'abord) pour chaque topic. Champs requis
   du modèle `HealthTopic` (cf. `prisma/schema.prisma`) :

   | Champ | Contenu |
   |---|---|
   | `kind` | `SYMPTOM` \| `DISEASE` |
   | `term`, `slug` | libellé + slug (sans accents) |
   | `shortAnswer` | 40-70 mots, extractible IA |
   | `causes` | causes fréquentes, 1/ligne |
   | `redFlags` | signes d'alerte, 1/ligne |
   | `whenToConsult` | paragraphe « quand consulter » (hors urgence) |
   | `faqJson` | `[{q,a}]` |
   | `specialtyId` | via le `specialty` slug du candidat |
   | `sources` | `[{label,url,publisher?,year?}]` (obligatoire YMYL) |
   | `synonyms` | « aussi appelé » + darija utile à la recherche |
   | `reviewedAt` | **`null`** → noindex tant que non relu |

   Suivre le format des seeds existants : `scripts/seed-symptoms.ts`,
   `seed-symptoms-2.ts` (symptômes), et le lot maladies. **Interdits YMYL** :
   pas de posologie précise, pas de diagnostic, toujours orienter vers un pro.
   ⚠️ Les 3 candidats **cancer-*** sont `note: YMYL sensible` → cadrage
   dépistage/orientation uniquement, relecture stricte.

2. **Traduction AR** des mêmes champs (`termAr`, `shortAnswerAr`, `causesAr`,
   `redFlagsAr`, `whenToConsultAr`, `faqJsonAr`, `sourcesAr`), `arReviewedAt=null`.

3. **Seed** en base (topic `reviewedAt=null`, `arReviewedAt=null` → tout noindex).

4. **Attacher la page intention** : `intentSlug = slug` sur les topics éligibles :
   ```
   npx tsx --env-file=.env scripts/seed-intent-pages.ts            # tous
   npx tsx --env-file=.env scripts/seed-intent-pages.ts <slug>     # ciblé
   ```
   Le script ne pose `intentSlug` que sur les topics **déjà relus + avec
   spécialité** → une page intention n'apparaît jamais avant relecture.

5. **Réponse intention unique** (sort du near-duplicate composé) : ajouter le
   couple FR/AR dans `scripts/seed-intent-content.ts` (map `CONTENT`) puis
   rejouer le script. La question reste composée (déjà unique + calée requête).

6. **Relecture humaine** (YMYL) puis ouverture de l'indexation :
   ```
   npx tsx --env-file=.env scripts/symptoms-approve.ts <slug>          # FR (par slug, tout kind)
   npx tsx --env-file=.env scripts/health-topics-approve-ar.ts <slug>  # AR
   ```
   > ⚠️ En mode « tout ouvrir », `symptoms-approve.ts` ne cible que `kind=SYMPTOM`.
   > Pour approuver les **maladies** en masse, approuver par slug, ou ajouter un
   > `health-topics-approve.ts` (FR, sans filtre de kind) calqué sur l'AR.

7. **Rebuild** (`npm run build`) — les pages relues entrent au sitemap
   (`app/sitemap.ts`, segment `core`, hreflang AR conditionné à `arReviewedAt`)
   et deviennent indexables.

## Garde-fous

- **Indexation = verrou YMYL du topic** (`reviewedAt` FR / `arReviewedAt` AR).
  Aucune page intention n'est indexée avant relecture.
- **Anti-page-mince** : ne rédiger que des candidats à demande réelle. tier 3 =
  à confirmer GSC. Un symptôme sans demande = page mince pénalisante.
- **Build** : le catalogue grossit → surveiller le nombre de pages statiques ;
  le plafond de workers/pool PG est déjà posé (cf. mémoire *build-pg-connections*).

## Wave finale (→ 300)

Une fois les Waves 1-3 rédigées + relues (233), sourcer ~67 slugs supplémentaires depuis :
- **GSC** : requêtes à impressions sans page dédiée (FR + darija translittérée).
- **Google Suggest / PAA** sur « quel médecin pour … », « … symptômes », « … c'est quoi ».
- Compléter par spécialités encore sous-couvertes.
Les ajouter à `intent-candidates.ts`, revalider, puis dérouler le même pipeline.

## Sources d'amorçage (recherche du 2026-07-24)

- Épidémio MA : STEPS 2017, Revue Marocaine de Santé Publique, rapport CESE santé
  mentale 2022, enquête MS 2022 (dépression 26,5 %, anxiété 9 %).
- Endémies MA : leishmaniose cutanée, tuberculose (~35k cas/an), hydatidose
  (hyperendémie), brucellose, carence vitamine D (76-90 %).
- Demande FR (proxy audience francophone) : ameli.fr, Qare, Livi, VIDAL, Elsan,
  hopital.fr (fiches maladies + top motifs de téléconsultation).
- Dico médical EN : NHS Health A-Z (nhs.uk/conditions), + « most common reasons
  to see a doctor » (Mayo Clinic, Cleveland Clinic, WebMD, MedlinePlus).
