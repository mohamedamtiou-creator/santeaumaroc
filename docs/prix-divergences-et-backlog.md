# Silo prix — divergences à arbitrer et backlog éditorial

> Généré le 1er août 2026, à l'issue de la mise en place du référentiel
> (`lib/prix-reference.ts`). Ce document liste ce qu'un développeur **ne peut pas
> corriger seul** : des montants qui exigent une source réelle et une relecture
> par un praticien en exercice.
>
> Il complète `RELECTURE-MEDICALE-YMYL.md`, dont la section 1 (« PRIX,
> priorité n°1 ») n'a toujours aucune case cochée.

---

## 1. État du TNR au 1er août 2026 : en transition non résolue

La grille officielle **n'est pas récupérable publiquement** : `anam.ma` renvoie
un HTTP 403 sur la page « Tarification nationale de référence » comme sur la page
« Nomenclature des actes médicaux ». Aucun PDF de grille tarifaire n'est
téléchargeable.

Les sources de presse se contredisent :

| Source | Date | Ce qu'elle affirme |
|---|---|---|
| [Aujourd'hui le Maroc](https://aujourdhui.ma/societe/amo-cnss-tout-ce-quil-faut-savoir-sur-la-revision-de-la-tnr-de-plusieurs-actes-medicaux) | 18/01/2020 | Généraliste 80 → **150 MAD**, spécialiste 150 → **250 MAD**, taux porté de 70 % à **80 %** |
| [EcoActu](https://ecoactu.ma/revision-tarification-nationale-de-reference/) | — | CNSS rembourse **70 %** du TNR, sur des barèmes de **2006** |
| [Le Brief](https://www.lebrief.ma/4264-cnss-anam-la-nouvelle-tarification-nationale-de-lamo/) | 01/2026 | Trois conventions ANAM/CNSS signées le **13/01/2026**, effet 2 mois après publication au BO |
| [Le Matin](https://lematin.ma/societe/tarification-de-reference-de-lamo-la-relance-du-secteur-prive-de-la-sante/358512) | 18/06/2026 | La CNSS approuve la révision, **mais une convention reste à signer** pour l'application effective |

**Conséquence appliquée dans le code** : tout montant de registre `tnr` porte
`revisionEnCours: true` et s'affiche avec la mention « la tarification nationale
de référence est en cours de révision ». Le taux est exposé en **fourchette
70–80 %**, jamais en valeur unique — une fausse précision sur un remboursement
est plus nuisible qu'une fourchette honnête.

### À faire
- [ ] Obtenir la grille TNR en vigueur (contact ANAM/CNSS, ou BO si publié).
- [ ] Confirmer le taux ambulatoire applicable : 70 % ou 80 % ?
- [ ] Une fois confirmé : passer les montants concernés en `statut: "valide"` et
      retirer `revisionEnCours` dans `lib/prix-reference.ts`.

---

## 2. Douze actes publiés à deux montants différents

Relevé entre le corpus blog (tel que listé dans `RELECTURE-MEDICALE-YMYL.md`) et
les champs `priceMin`/`priceMax` de `MedicalExam` en base. **Le même acte, deux
prix, sur le même site.**

| Acte | Corpus blog | Base examens | Écart haut |
|---|---:|---:|---:|
| Scanner | 800 – 2 000 | 800 – 2 500 | +500 |
| IRM | 1 500 – 3 500 | 1 500 – 4 000 | +500 |
| Coloscopie | 1 500 – 3 500 | 1 500 – 4 000 | +500 |
| Échographie | 200 – 500 | 250 – 700 | +200 (et +50 en bas) |
| Épreuve d'effort | 400 – 800 | 400 – 1 000 | +200 |
| Radiographie | 100 – 300 | 100 – 400 | +100 |
| Écho-doppler | 400 – 800 | 400 – 900 | +100 |
| Mammographie | 300 – 600 | 300 – 700 | +100 |
| EEG | 300 – 600 | 300 – 700 | +100 |
| Holter ECG | 400 – 800 | 400 – 900 | +100 |
| Spirométrie | 200 – 400 | 200 – 500 | +100 |
| Ostéodensitométrie | 300 – 600 | 300 – 700 | +100 |
| ECG | 100 – 250 | 100 – 250 | identique |
| Fond d'œil | 150 – 400 | 150 – 400 | identique |
| Gastroscopie | 1 000 – 2 500 | 1 000 – 2 500 | identique |
| Prise de sang | non chiffré | 150 – 600 | — |
| MAPA / Holter tensionnel | 400 – 800 | **absent de la base** | — |

### Pourquoi ce n'est pas corrigé automatiquement

Le corpus blog est du HTML injecté par les scripts de seed
(`seed-blog-examens*.cjs`). Réécrire 227 articles depuis le code reviendrait à
modifier du contenu médical publié sans relecture — exactement ce que le dossier
YMYL interdit.

### À faire
- [ ] Arbitrer une fourchette unique par acte (l'une des deux, ou une troisième
      issue d'une grille réelle).
- [ ] Porter la valeur retenue dans `MedicalExam` (base) — qui devient l'unique
      propriétaire du montant.
- [ ] Mettre à jour les seeds blog concernés pour qu'ils citent la fiche
      `/examens/[slug]` au lieu de répéter un chiffre.
- [ ] Créer la fiche `MedicalExam` manquante pour la MAPA.

---

## 3. Backlog : ~20 fiches d'analyses biologiques

La catégorie `biologie` ne compte que **trois** fiches (`prise-de-sang`,
`analyse-urine`, `test-grossesse`), contre 14 en exploration et 11 en imagerie.
C'est le plus gros trou de contenu du silo, et la requête « prix analyse sang »
se décline en réalité par analyse.

**Ces fiches n'ont volontairement pas été générées automatiquement** : une fiche
`MedicalExam` contient `shortAnswer`, `indications`, `procedure`, `preparation`
et `precautions` — du contenu médical soumis au verrou `reviewedAt`. Le générer
sans praticien reviendrait à publier du YMYL non relu.

Cibles proposées, par volume de recherche attendu :

| Priorité | Analyse | Slug proposé |
|---|---|---|
| 1 | Glycémie à jeun | `glycemie` |
| 1 | Hémoglobine glyquée (HbA1c) | `hemoglobine-glyquee` |
| 1 | Numération formule sanguine | `numeration-formule-sanguine` |
| 1 | Bilan lipidique / cholestérol | `bilan-lipidique` |
| 1 | TSH (thyroïde) | `tsh` |
| 2 | Créatinine / fonction rénale | `creatinine` |
| 2 | Bilan hépatique (transaminases) | `bilan-hepatique` |
| 2 | Ferritine | `ferritine` |
| 2 | CRP (protéine C-réactive) | `crp` |
| 2 | Vitamine D | `vitamine-d` |
| 3 | Ionogramme sanguin | `ionogramme` |
| 3 | Acide urique | `acide-urique` |
| 3 | Groupe sanguin | `groupe-sanguin` |
| 3 | Sérologie hépatite B | `serologie-hepatite-b` |
| 3 | Test de grossesse sanguin (bêta-HCG) | `beta-hcg` |
| 3 | Spermogramme | `spermogramme` |
| 3 | ECBU (examen cytobactériologique des urines) | `ecbu` |
| 3 | Coproculture | `coproculture` |
| 3 | Frottis sanguin / paludisme | `frottis-sanguin` |
| 3 | Bilan thyroïdien complet (T3, T4) | `bilan-thyroidien` |

### À faire par fiche
- [ ] Rédaction médicale FR (gabarit `MedicalExam` existant).
- [ ] Fourchette de prix **sourcée** (grille de laboratoire réelle, datée).
- [ ] Base de remboursement / taux si l'acte est à la nomenclature.
- [ ] Relecture praticien → `reviewedAt`.
- [ ] Traduction AR → `arReviewedAt`.

Aucun développement n'est requis : le gabarit, le rendu, le balisage de prix, le
hreflang et le sitemap sont déjà en place. Chaque fiche ajoutée est
immédiatement une page indexable et balisée.

---

## 4. Concurrence : le terrain n'est pas vide

`sahha.ma` publie déjà, révisé au **8 mai 2026** :

- une grille de **25+ spécialités** ;
- une relecture médicale **signée et nommée** (Dr Hassan Amzil, ex-ANAM) ;
- la distinction explicite **TNR / honoraires libres** ;
- un **simulateur de remboursement CNSS**.

Source : <https://sahha.ma/articles/tarif-consultation-specialiste-maroc-2026-grille-comparative>

**Implication stratégique.** Sur les consultations, il faut battre un titulaire
bien exécuté, sans données propres — nos fourchettes sont éditoriales comme les
siennes, et sa relecture est nommée alors que la nôtre n'existe pas encore.

L'avantage défendable est ailleurs : les **5 916 médicaments** avec taux et base
de remboursement officiels, et surtout les **457 médicaments dont le prix de
vente dépasse la base de remboursement** — un reste à charge réel, calculable, que
personne ne publie. C'est ce qui a été mis en ligne en priorité
(`/remboursement-amo-cnss/medicaments`).

### À faire
- [ ] Obtenir une **relecture médicale nommée** pour le silo prix — c'est le
      principal écart E-E-A-T avec le concurrent, et il ne se comble pas par
      du code.
