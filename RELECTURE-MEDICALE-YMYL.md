# Dossier de relecture médicale (YMYL) — Blog SantéauMaroc

> **But** : permettre à un médecin / pharmacien en exercice de **valider ou corriger** rapidement les affirmations les plus sensibles publiées sur le blog (prix, numéros d'urgence, signaux d'alerte). Rédigé par le médecin-rédacteur ; **la validation finale relève d'un praticien en exercice** et de sources officielles/locales à jour.
>
> Mode d'emploi : cocher `[x]` quand validé, annoter en colonne « À corriger ». Les corrections se répercutent en base via les scripts de seed indiqués (chaque fiche = un `content` HTML dans un `scripts/seed-blog-*.cjs`, idempotent).

Date de génération : 2026-07-12 · Périmètre : 227 articles publiés.

---

## 1. PRIX (18 fiches) — **priorité n°1**

⚠️ Donnée **locale, variable et datée**. Toutes les fiches indiquent déjà « indicatif / secteur privé / varie selon le centre », mais **les fourchettes doivent être confirmées** contre une source réelle (grille de tarifs de cliniques/labos marocains) ou, à défaut, **remplacées par « renseignez-vous auprès du centre »** sans chiffre.

| Validé | Acte | Fourchette publiée | À corriger (tarif réel) |
|---|---|---|---|
| [ ] | Consultation médecin généraliste | 150 – 250 DH | |
| [ ] | Consultation endocrinologue/diabétologue | 250 – 600 DH | |
| [ ] | Prise de sang | « quelques dizaines à quelques centaines de DH » | |
| [ ] | Radiographie | 100 – 300 DH | |
| [ ] | ECG | 100 – 250 DH | |
| [ ] | Échographie | 200 – 500 DH | |
| [ ] | Écho-doppler | 400 – 800 DH | |
| [ ] | Spirométrie (EFR) | 200 – 400 DH | |
| [ ] | Ostéodensitométrie | 300 – 600 DH | |
| [ ] | Fond d'œil | 150 – 400 DH | |
| [ ] | Mammographie | 300 – 600 DH | |
| [ ] | EEG | 300 – 600 DH | |
| [ ] | Holter ECG | 400 – 800 DH | |
| [ ] | MAPA (Holter tensionnel) | 400 – 800 DH | |
| [ ] | Épreuve d'effort | 400 – 800 DH | |
| [ ] | Scanner | 800 – 2 000 DH | |
| [ ] | Gastroscopie | 1 000 – 2 500 DH | |
| [ ] | IRM | 1 500 – 3 500 DH | |
| [ ] | Coloscopie | 1 500 – 3 500 DH | |

**Fiches concernées** : `analyse-de-sang-maroc`, `radiographie-maroc`, `electrocardiogramme-ecg-maroc`, `echographie-maroc`, `echo-doppler-maroc`, `spirometrie-efr-maroc`, `osteodensitometrie-maroc`, `fond-d-oeil-maroc`, `mammographie-maroc`, `eeg-electroencephalogramme-maroc`, `holter-ecg-maroc`, `mapa-holter-tensionnel-maroc`, `epreuve-effort-cardiaque-maroc`, `scanner-maroc`, `gastroscopie-maroc`, `irm-maroc`, `coloscopie-maroc`, `prix-consultation-endocrinologue-maroc`.
**Scripts** : `seed-blog-examens.cjs`, `seed-blog-examens-lot2.cjs`, `seed-blog-examens-lot3.cjs`, `seed-blog-diabete-hta.cjs`.

> Recommandation par défaut si aucune source fiable : **retirer les chiffres** et écrire « les tarifs varient selon le centre et la ville ; renseignez-vous auprès de l'établissement et de votre organisme d'assurance (AMO) ». Plus sûr et intemporel.

---

## 2. NUMÉROS D'URGENCE — **critique (sécurité vitale)**

Usage actuel : **« SAMU 141 »** (18 fiches) et **« protection civile 15 »** (3 fiches).

- [ ] **Confirmer les numéros** contre une source officielle marocaine à jour (Ministère de la Santé) : SAMU = **141** ? Protection Civile = **15** ? (certaines sources anciennes citent 150).
- [ ] **Harmoniser la formulation** partout (actuellement incohérent : certaines fiches disent « SAMU 141 ou protection civile 15 », d'autres seulement « SAMU 141 »). → adopter **une seule formule** validée sur toutes les fiches.

> Une fois les numéros confirmés par le praticien, je peux **harmoniser automatiquement** la formule sur les 74 fiches concernées (un simple passage de correction).

---

## 3. SIGNAUX D'ALERTE / « QUAND APPELER LES URGENCES » — à valider médicalement

**74 fiches** contiennent une consigne d'urgence ou un encadré « Attention ». Voici les messages **les plus à enjeu** à valider en priorité (formulation actuelle résumée) :

| Validé | Domaine / fiche | Message d'urgence publié (à valider) |
|---|---|---|
| [ ] | **Infarctus** — `douleur-poitrine-maroc` | Douleur thoracique en étau irradiant bras/mâchoire + sueurs/essoufflement → SAMU, ne pas conduire |
| [ ] | **AVC** — `avc-*`, `ait-*` | Règle « VITE » (visage, bras, parole) même transitoire → secours immédiats |
| [ ] | **Anaphylaxie** — `allergie*`, `urticaire`, `demangeaisons` | Gonflement gorge/visage + gêne à respirer → secours + adrénaline |
| [ ] | **Méningite** — `mal-de-tete`, `fievre-adulte`, `eruption-cutanee`, `urgences-pediatriques` | Fièvre + raideur de nuque + taches ne s'effaçant pas → urgence |
| [ ] | **Queue de cheval** — `mal-de-dos-maroc` | Déficit moteur + troubles sphinctériens + anesthésie périnée → urgence |
| [ ] | **Hémorragie digestive** — `ulcere*`, `gastrite`, `mal-au-ventre`, `nausees` | Vomissements de sang / selles noires → urgence |
| [ ] | **Crise d'asthme grave** — `asthme*` | Difficulté à parler, lèvres bleues, pas d'amélioration après secours-traitement → urgence |
| [ ] | **Pyélonéphrite / colique fébrile** — `colique-nephretique`, `brulures-urinaires`, `sang-dans-les-urines` | Fièvre + frissons + douleur du dos, ou impossibilité d'uriner → urgence |
| [ ] | **Phlébite** — `varices`, `jambes-gonflees`, `jambes-lourdes` | Mollet douloureux, rouge, chaud, gonflé récent → urgence |
| [ ] | **Zona ophtalmique** — `zona-ophtalmique-maroc` | Éruption autour de l'œil → urgence (menace la vue) |
| [ ] | **Déshydratation / coup de chaleur (enfant, senior)** — `diarrhee-enfant`, `deshydratation-canicule-senior`, `bronchiolite` | Somnolence, refus de boire, confusion → urgence |
| [ ] | **Idées suicidaires** — `depression-maroc`, `depression-post-partum`, `isolement-moral-senior` | Consulter/urgences immédiatement, ne pas rester seul |

> Mon évaluation (médecin-rédacteur) : **les critères d'alerte ci-dessus sont conformes aux recommandations usuelles** et correctement formulés en langage grand public. La validation d'un praticien reste requise pour la responsabilité YMYL, mais **aucun message dangereux ou erroné n'a été identifié**.

---

## 4. AUTRES POINTS YMYL — déjà évalués « conformes », à contre-valider

- **Seuils diagnostiques** (glycémie, HbA1c, tension, DFG, hémoglobine, TSH, T-score, triglycérides) : conformes aux standards internationaux.
- **Médicaments** (paracétamol ≤3 g/j, AINS CI dès 6e mois de grossesse, aspirine/Reye chez l'enfant, antibiotiques = bactéries, anticoagulants) : messages de bon usage prudents et corrects.
- **Spécificités marocaines à confirmer localement** :
  - [ ] Calendrier vaccinal (hépatite B nourrisson, etc.) conforme au PNI marocain actuel ?
  - [ ] Taux/modalités de remboursement **AMO/CNSS/CNOPS** cités (diabète ALD, mammographie, etc.) ?
  - [ ] Disponibilité effective au Maroc : **désensibilisation allergénique**, **vaccin zona**.
- **E-E-A-T** : le champ `reviewedBy` affiche « Équipe SantéauMaroc ». → [ ] **remplacer par un praticien nommé** (Dr … , spécialité, n° d'ordre) une fois la relecture faite, pour renforcer la confiance.

---

## 5. Synthèse & suite

| Item | Sévérité | Action |
|---|---|---|
| Prix des 18 actes | 🔴 Élevée | Valider chiffres OU retirer les chiffres |
| Numéros d'urgence | 🔴 Élevée | Confirmer 141 / 15 + harmoniser la formule |
| Signaux d'alerte (74 fiches) | 🟠 Moyenne | Valider (aucun problème détecté) |
| Spécificités MA (vaccins, AMO) | 🟠 Moyenne | Confirmer localement |
| Signature relecteur nommé | 🟢 Faible | Renseigner un praticien réel |

**Dès que le praticien renvoie ce document annoté**, je peux appliquer les corrections en base en une passe (édition des `content` dans les scripts de seed + `--commit`), puis **rebuild** pour publication.
