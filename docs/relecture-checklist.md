# Checklist de relecture médicale ciblée (YMYL)

Contenu concerné : fiches **Examens** (`/examens`), **Traitements** (`/traitements`),
**Maladies** (`/maladies`) et **Symptômes** (`/symptomes`) — tous adossés aux modèles
`MedicalExam`, `Treatment` et `HealthTopic`.

**Principe** : le temps de relecture est rare. On se concentre sur les champs où une
erreur **fait du mal** (sécurité patient), pas sur le style. Compter **~4 min/fiche**
pour P0–P2 en français, **+~3 min** pour l'arabe.

> ⚠️ Tant qu'une fiche n'est pas relue (`reviewedAt` nul), elle reste **`noindex` +
> hors sitemap**, et aucune signature « relu par la rédaction médicale » ne s'affiche.
> La relecture est donc le geste qui **autorise l'indexation** ET **appose la caution
> éditoriale**. Ne cochez « relu » que si le contenu est réellement vérifié.

---

## P0 — Sécurité (systématique, non négociable)

- [ ] **`redFlags` / Signes d'alerte** : chaque ligne est un vrai signe d'urgence ;
      aucun signe grave **manquant** ; le seuil « consulter / urgence » est juste
      (ni alarmiste, ni faussement rassurant).
- [ ] **`whenToConsult` / Quand consulter** : n'incite jamais à *retarder* une
      consultation nécessaire.
- [ ] **`precautions` / contre-indications** (examens) : les majeures sont présentes —
      grossesse, pacemaker/implant (IRM), allergie iode/produit de contraste,
      traitement anticoagulant (gestes invasifs : coloscopie, biopsie, ponction lombaire).
- [ ] **Traitements** : aucune posologie chiffrée hasardeuse ; pas d'incitation à
      l'auto-médication ; mention « ne pas arrêter/modifier sans avis médical ».
- [ ] **Numéros d'urgence** corrects (141 SAMU / 15).

## P1 — Exactitude factuelle

- [ ] **`shortAnswer`** : pas de contresens. *(C'est le texte extrait par Google et les
      moteurs IA — impact maximal.)*
- [ ] **`indications`** (examens) / **`options`** (traitements) : à jour, cohérentes,
      rien d'obsolète ou hors usage recommandé.
- [ ] **`causes`** : plausibles, pas d'inversion cause / symptôme.
- [ ] Cohérence **spécialité ↔ contenu** (le bon spécialiste est associé).

## P2 — Prix & conformité Maroc

- [ ] **`priceMin` / `priceMax`** (examens) : ordre de grandeur crédible pour le Maroc
      (secteur privé, MAD).
- [ ] **`reimbursement`** : mention AMO/CNSS correcte.
- [ ] **`sources`** : URLs valides, éditeur (OMS/HAS/société savante) cohérent.

## P3 — Version arabe (le plus scruté)

> Ne poser `arReviewedAt` (cocher « relu AR ») **que** si ce bloc est validé.
> Sinon la fiche reste en **repli français** pour la version `/ar`.

- [ ] La traduction **ne perd ni n'altère aucun red flag / contre-indication**.
- [ ] Terminologie médicale arabe correcte (pas de calque ni de faux-ami).
- [ ] Sens équivalent au FR sur `shortAnswer` + `redFlags`.

## À survoler / faible enjeu

FAQ, synonymes, maillage (`relatedSlugs`/`glossarySlugs`), `preparation` détaillée,
formulations stylistiques. Utiles, mais pas prioritaires pour la sécurité.

---

## Process

1. Réviser dans l'admin :
   - Examens → `/admin/examens`
   - Traitements → `/admin/traitements`
   - Maladies & symptômes → `/admin/symptomes` (colonne « Type » : Maladie / Symptôme)
2. Corriger inline, puis cocher **« Marquer comme relu (FR) »** (et **« relu (AR) »**
   seulement si P3 est validé).
3. En alternative / en lot, via les scripts (après relecture) :
   ```bash
   # FR — autorise l'indexation
   npx tsx --env-file=.env scripts/exams-approve.ts [slug]
   npx tsx --env-file=.env scripts/treatments-approve.ts [slug]
   npx tsx --env-file=.env scripts/symptoms-approve.ts [slug]   # symptômes ET maladies (même modèle)
   # AR — autorise l'affichage/indexation arabe (uniquement si traduction présente)
   npx tsx --env-file=.env scripts/exams-approve-ar.ts [slug]
   npx tsx --env-file=.env scripts/treatments-approve-ar.ts [slug]
   ```
   *(sans `[slug]` : traite tout le lot non encore relu.)*

**Ordre conseillé** : examens d'imagerie / biologie d'abord (factuels, peu risqués) →
maladies → **traitements en dernier** (enjeu posologie / red flags le plus élevé).

**Budget indicatif** : ~4–5 h pour les 70 fiches actuelles en français, +~3 min/fiche
pour l'arabe.

---

## Rappel gouvernance E-E-A-T

- La signature affichée est **« Vérifié par la rédaction médicale de SantéauMaroc »**
  (attribution non nominative, honnête) — elle n'apparaît qu'une fois la relecture faite.
- **Ne jamais inventer un médecin relecteur fictif** (nom, titre, n° INPE) : c'est une
  fausse caution médicale, sanctionnée par Google (E-E-A-T fabriqué) et trompeuse pour
  les patients.
- Dès qu'un **relecteur médecin réel** est disponible, on remplace l'attribution
  rédaction par sa signature nominative (champs déjà prêts : `User.jobTitle`,
  `credentials`, `registrationNumber`).
