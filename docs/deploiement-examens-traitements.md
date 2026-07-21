# Déploiement — Examens, Traitements & Maladies

Procédure pour mettre en prod le vertical **Examens / Traitements / Maladies** (+ hub
`/prix`, hub ville enrichi, section `/maladies`) livré en juillet 2026.

## Ce qui est déployé

- **2 nouvelles tables** : `medical_exams`, `treatments`.
- **Contenu** : 30 examens + 30 traitements + 10 maladies (les maladies utilisent la
  table **existante** `health_topics`, `kind = DISEASE`).
- **Code** : routes `/examens`, `/traitements`, `/maladies`, `/prix` (+ hub ville
  enrichi), admin CRUD, signature de relecture éditoriale, scripts d'approbation.
- **Décision éditoriale (Option A, FR + AR)** : le contenu est publié **indexable en
  FR ET en AR dès le chargement** (`reviewedAt` + `arReviewedAt` posés) sous la
  responsabilité de la rédaction — le badge « Contenu vérifié médicalement — rédaction de
  SantéauMaroc » s'affiche. hreflang réciproque FR↔AR, canonical auto-référent par langue.
  ⚠️ L'AR est traduit automatiquement et **non relu** : relecture médicale FR **et AR**
  recommandée *a posteriori* (voir `docs/relecture-checklist.md`, section P3 pour l'arabe).

## Prérequis

- Accès à la base **prod** en connexion **directe** (port 5432, `?sslmode=require`) —
  **pas** l'URL *pooled* PgBouncer (port 6543), qui casse les batchs/DDL.
- `psql` + Node/`npx` en local, ou un contexte réseau qui joint la prod.

---

## Étape 1 — Migration du schéma (crée les 2 tables)

Purement **additif** : 2 `CREATE TABLE` + index + clés étrangères vers `specialties`.
Aucun `ALTER`/`DROP`, aucune donnée existante touchée.

```powershell
psql "<DATABASE_URL_PROD>" -1 -f prisma/manual-migrations/20260721_medical_exams_treatments.sql
```
`-1` = tout dans une transaction (tout ou rien). À lancer **une seule fois**
(les `CREATE TABLE` sans `IF NOT EXISTS` échoueraient au 2e passage — garde-fou voulu).

*Alternative Prisma* (même résultat, moins auditable) : `DATABASE_URL=<prod> npx prisma db push`.

## Étape 2 — Déployer le code

Déploiement habituel (Vercel). À faire **après** l'étape 1, sinon l'app interroge des
tables inexistantes.

## Étape 3 — Charger le contenu

### Option A — SQL portable (le plus simple, zéro Node/.env) ✅ recommandé
Coller `prisma/manual-migrations/20260721_seed_examens_traitements_maladies.sql` dans la
console SQL de l'hébergeur (ou `psql -f`), **après** l'étape 1.
- `specialtyId` résolu par **sous-requête sur le slug** → portable entre bases.
- **Idempotent** (`ON CONFLICT (slug) DO NOTHING`) + transaction `BEGIN/COMMIT`.
- **FR + AR indexables dès le chargement** (`reviewedAt` + `arReviewedAt` = now(),
  Option A). Le SQL reflète l'état de relecture de la base source.
- Régénérable : `npx tsx --env-file=.env scripts/export-seed-sql.ts`.
```powershell
psql "<DATABASE_URL_PROD>" -1 -f prisma/manual-migrations/20260721_seed_examens_traitements_maladies.sql
```

### Option B — Seeds tsx (si tu préfères Node)
⚠️ **Ne pas utiliser `--env-file=.env`** (c'est le dev) : risque de seeder la mauvaise
base. Utiliser un fichier d'env **dédié prod**.

1. Créer `.env.prod` (**à gitignorer**) :
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```
   *(Sur Vercel : `vercel env pull .env.prod --environment=production`.)*

2. Lancer les seeds (idempotents — `upsert` par slug) :
   ```powershell
   npx tsx --env-file=.env.prod scripts/seed-exams-treatments.ts   # 30 examens + 30 traitements
   npx tsx --env-file=.env.prod scripts/seed-diseases.ts           # 10 maladies (health_topics)
   ```

Dépendance : ces seeds rattachent chaque fiche à une **spécialité par slug** (19 slugs,
voir étape 4). Une spécialité absente → `specialtyId` null + avertissement (non bloquant,
la fiche s'affiche sans le lien « quel médecin consulter »).

## Étape 4 — Vérifications

**Pré-vol — confirmer qu'on vise la prod** (pas le compte de dev) :
```powershell
psql "<DATABASE_URL_PROD>" -c "SELECT count(*) FROM specialties;"   # ~96 attendu
```

**Spécialités requises présentes** (0 ligne = OK) :
```sql
SELECT unnest(ARRAY[
  'allergologie','anatomo-pathologie','biologie-medicale','cardiologie','dermatologie',
  'endocrinologie-et-maladies-metaboliques','gastro-enterologie','gyneco-obstetrique','hematologie',
  'medecine-generale','medecine-nucleaire','neurologie','ophtalmologie','oto-rhino-laryngologie',
  'pathologie-du-sommeil-et-de-la-vigilance','pneumo-phtisiologie','psychiatrie','radiologie','rhumatologie'
]) AS needed
EXCEPT
SELECT slug FROM specialties;
```

**Contenu chargé** :
```powershell
psql "<DATABASE_URL_PROD>" -c "SELECT (SELECT count(*) FROM medical_exams) AS examens, (SELECT count(*) FROM treatments) AS traitements, (SELECT count(*) FROM health_topics WHERE kind='DISEASE') AS maladies;"
```
Attendu : 30 / 30 / 10.

**Front** : `/examens`, `/traitements`, `/maladies`, `/prix` répondent en 200 ; les fiches
FR **et** `/ar/*` sont **indexables** (badge « vérifié médicalement », `reviewedBy` en
JSON-LD, contenu arabe servi, hreflang réciproque). Nouveau contenu visible/à jour sous
~1 h (ISR `revalidate=3600`) ou après redéploiement.

## Étape 5 — Relecture *a posteriori* (recommandée)

**FR et AR sont déjà indexables** (Option A). Les fiches sont donc en ligne et
référençables **sans relecture humaine** — la relecture médicale reste **fortement
recommandée** pour corriger d'éventuelles erreurs sur du contenu YMYL déjà publié,
en priorité **la version arabe** (traduction automatique non vérifiée). Suivre
`docs/relecture-checklist.md` (section P3 = arabe).

Scripts d'appoint (si tu remets une fiche en `noindex` puis la republies) :
```powershell
# FR
npx tsx --env-file=.env.prod scripts/exams-approve.ts [slug]
npx tsx --env-file=.env.prod scripts/treatments-approve.ts [slug]
# AR
npx tsx --env-file=.env.prod scripts/exams-approve-ar.ts [slug]
npx tsx --env-file=.env.prod scripts/treatments-approve-ar.ts [slug]
npx tsx --env-file=.env.prod scripts/health-topics-approve-ar.ts [slug]   # maladies (+ symptômes)
```
(sans `[slug]` : traite tout le lot éligible.)

---

## Notes

- **Idempotence** : seeds et scripts `*-approve` sont ré-exécutables sans risque.
- **Rollback** : le code peut être redéployé en arrière sans toucher la base ; les 2
  tables restent (inertes). Pour retirer complètement : `DROP TABLE treatments,
  medical_exams;` (⚠️ supprime le contenu chargé).
- **Indexation arabe** : chantier séparé, voir `docs/indexation-ar-runbook.md`.
- **Connexion** : toujours la connexion **directe** pour migration + seeds ; l'app en
  runtime peut utiliser le pooler.

## Séquence résumée

```
1. psql prod ← prisma/manual-migrations/20260721_medical_exams_treatments.sql   (une fois)
2. deploy code (Vercel)
3. npx tsx --env-file=.env.prod scripts/seed-exams-treatments.ts
4. npx tsx --env-file=.env.prod scripts/seed-diseases.ts
5. vérifs (étape 4)
6. (plus tard) relecture → scripts *-approve[-ar].ts
```
