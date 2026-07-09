import type { TimeSlot, WorkingHourRecord, AbsenceRecord, ManagedSlot } from "@/lib/types";

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("fr-MA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("fr-MA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Renvoie une présentation de médecin exploitable, ou `null` si le champ
 * `description` est vide, factice ou trop court pour constituer une vraie
 * biographie. Beaucoup de fiches migrées contiennent des données-poubelle
 * (« Test », « .", « import »…) qui, laissées telles quelles, polluent la
 * balise <meta description>, le bloc « À propos » et le JSON-LD.
 *
 * Règles : trim ; rejet si < 40 caractères (trop court pour une présentation),
 * si aucune lettre (latine ou arabe), ou si le texte entier est un marqueur
 * de remplissage connu. Source unique, partagée par la fiche et l'audit DB.
 */
const DESCRIPTION_PLACEHOLDER = /^(?:test(?:ing)?|todo|xxx+|aaa+|azerty|lorem(?:\s+ipsum)?|rien|n[ée]ant|aucun|non|n\/?a|na|desc(?:ription)?|\W+)$/i;

export function cleanDoctorDescription(desc: string | null | undefined): string | null {
  if (!desc) return null;
  const t = desc.trim();
  if (t.length < 40) return null;
  if (!/[a-zà-ÿ؀-ۿ]/i.test(t)) return null;
  if (DESCRIPTION_PLACEHOLDER.test(t)) return null;
  return t;
}

/**
 * Convertit un champ téléphone (souvent en texte libre : « 0652218080 / 0522581016 »,
 * « 06 67 03 41 03 », « Urgence: 06… ») en numéro composable pour un href `tel:`.
 * Garde le premier numéro, ne conserve que « + » et les chiffres. Renvoie `null`
 * si rien d'exploitable — on n'affiche alors pas de lien d'appel.
 */
export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const first = phone.split(/[\/;,]|\bou\b/i)[0];   // 1er numéro avant un séparateur
  const cleaned = first.replace(/[^\d+]/g, "");
  return cleaned.replace(/\D/g, "").length >= 6 ? cleaned : null;
}

/**
 * Normalise la CASSE d'une adresse en texte libre pour l'affichage, sans toucher
 * la donnée en base. Beaucoup de fiches migrées ont des adresses en CAPITALES
 * criardes (« RADIOLOGIE EL MOUSTAKBAL ») mêlées à du minuscule (« sidi maarouf »).
 * Règle : Title Case sur chaque mot, en préservant les jetons avec chiffres
 * (« Villa 76 »), les mots-outils français (« de », « la »…), et la casse
 * canonique des acronymes et enseignes connus (CHU, BIM, BricoMa, Label'Vie…).
 * « RADIOLOGIE EL MOUSTAKBAL » → « Radiologie El Moustakbal » ; « Bd » reste « Bd ».
 */
// Casse canonique (clé = lettres en minuscules, sans ponctuation → rendu exact).
// Ne lister QUE ce qui dévie du Title Case par défaut, ou qu'on veut verrouiller.
const ADDRESS_CANONICAL = new Map<string, string>([
  // Acronymes médicaux / administratifs
  ["chu", "CHU"], ["chp", "CHP"], ["chr", "CHR"], ["chn", "CHN"], ["chic", "CHIC"],
  ["orl", "ORL"], ["irm", "IRM"], ["tdm", "TDM"], ["cnss", "CNSS"], ["amo", "AMO"],
  ["samu", "SAMU"], ["rdc", "RDC"], ["gsm", "GSM"],
  // Enseignes marocaines (grande distribution, ameublement, prêt-à-porter)
  ["bim", "BIM"], ["marjane", "Marjane"], ["acima", "Acima"], ["aswak", "Aswak"],
  ["assalam", "Assalam"], ["carrefour", "Carrefour"], ["atacadao", "Atacadão"],
  ["labelvie", "Label'Vie"], ["bricoma", "BricoMa"], ["kitea", "Kitea"],
  ["mobilia", "Mobilia"], ["kaoba", "Kaoba"], ["marwa", "Marwa"],
  ["diamantine", "Diamantine"], ["yatout", "Yatout"],
  // Opérateurs / repères urbains fréquemment cités dans les adresses
  ["inwi", "inwi"], ["iam", "IAM"], ["ooredoo", "Ooredoo"], ["ocp", "OCP"],
  ["oncf", "ONCF"], ["ctm", "CTM"], ["lydec", "LYDEC"], ["redal", "Redal"],
  ["onee", "ONEE"], ["adm", "ADM"], ["ram", "RAM"],
  ["bmce", "BMCE"], ["cih", "CIH"], ["bmci", "BMCI"], ["cdg", "CDG"],
]);

// Mots-outils français gardés en minuscules quand ils ne sont pas en tête.
// Volontairement SANS « el »/« al » (noms arabes → « El Moustakbal »), ni « d »/« l »
// isolés (élision gérée à part ; « Bloc D » doit rester majuscule).
const ADDRESS_LOWER_WORDS = new Set([
  "de", "du", "des", "la", "le", "les", "et", "en", "à", "au", "aux",
  "sur", "sous", "par", "pour", "dans", "ès", "ou",
]);

function titleCaseRuns(word: string): string {
  // Title Case sur chaque suite de lettres (gère traits d'union et apostrophes).
  return word.replace(/\p{L}+/gu, (run) =>
    run.charAt(0).toLocaleUpperCase("fr") + run.slice(1).toLocaleLowerCase("fr"),
  );
}

export function formatStreetAddress(adresse: string | null | undefined): string {
  if (!adresse) return "";
  return adresse
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")   // un seul espace après chaque virgule
    .replace(/,\s*$/, "")         // pas de virgule finale
    .split(" ")
    .map((word, i) => {
      if (/\d/.test(word)) return word;                                  // « 76 », « N°12 » inchangés
      // Casse canonique (acronymes + enseignes) en préservant la ponctuation autour.
      const lead = word.match(/^[^\p{L}]*/u)![0];
      const trail = word.match(/[^\p{L}]*$/u)![0];
      const core = word.slice(lead.length, word.length - trail.length);
      const key = core.replace(/[^\p{L}]/gu, "").toLocaleLowerCase("fr");
      const canon = ADDRESS_CANONICAL.get(key);
      if (canon) return lead + canon + trail;                                // « (bim) » → « (BIM) »
      if (/^[ivx]{1,4}$/.test(key)) return word.toUpperCase();               // chiffres romains : II, V, VI… (Hassan II, Mohammed VI)
      if (i > 0 && ADDRESS_LOWER_WORDS.has(key)) return word.toLocaleLowerCase("fr"); // « De » → « de » (hors tête)
      // Title Case, puis article élidé en minuscule hors tête : « L'Hôpital » → « l'Hôpital ».
      const titled = titleCaseRuns(word);
      return i > 0 ? titled.replace(/^([LD])(['’])/, (_, a, ap) => a.toLowerCase() + ap) : titled;
    })
    .join(" ");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getDoctorInitials(
  prenom: string | null | undefined,
  nom: string | null | undefined,
): string {
  return [(prenom ?? "")[0], (nom ?? "")[0]].filter(Boolean).join("").toUpperCase() || "?";
}

// ── Noms de médecins ───────────────────────────────────────────────────────
// Beaucoup de fiches migrées stockent le nom en CAPITALES criardes
// (« BENABDALLAH », prénom « LEILA »). On normalise la casse à l'AFFICHAGE
// uniquement, sans toucher la donnée. Source unique, partagée par toutes les
// surfaces (fiche, Q/R, cartes) pour éviter les rendus incohérents.

type DoctorNameParts = {
  civilite?: string | null;
  prenom?: string | null;
  nom?: string | null;
};

// Title Case sur chaque suite de lettres (gère traits d'union et apostrophes) :
// « BEN-ALI » → « Ben-Ali », « EL AMRANI » → « El Amrani ».
function titleCasePerson(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\p{L}+/gu, (run) => run.charAt(0).toLocaleUpperCase("fr") + run.slice(1).toLocaleLowerCase("fr"));
}

// Normalise la civilité médicale : « DR »/« dr. »/« docteur » → « Dr »,
// « PR »/« professeur » → « Pr ». En contexte médical (tous répondeurs sont
// des médecins), on retombe sur « Dr » quand la civilité est absente.
function formatCivilite(civilite: string | null | undefined): string {
  const c = (civilite ?? "").trim().toLowerCase().replace(/\.$/, "");
  if (!c) return "Dr";
  if (c === "pr" || c === "professeur") return "Pr";
  if (c === "dr" || c === "docteur") return "Dr";
  return titleCasePerson(civilite!);
}

/** Nom complet formaté : « Dr Leila Benabdallah » (ou « Médecin » si vide). */
export function formatDoctorName(d: DoctorNameParts): string {
  if (!d.prenom && !d.nom) return "Médecin";
  return [formatCivilite(d.civilite), d.prenom ? titleCasePerson(d.prenom) : null, d.nom ? titleCasePerson(d.nom) : null]
    .filter(Boolean)
    .join(" ");
}

/** Nom court et formel pour les CTA : « Dr Benabdallah » (nom, pas prénom). */
export function formatDoctorShortName(d: DoctorNameParts): string {
  const civ = formatCivilite(d.civilite);
  if (d.nom) return `${civ} ${titleCasePerson(d.nom)}`;
  if (d.prenom) return `${civ} ${titleCasePerson(d.prenom)}`;
  return "Médecin";
}

// ── Fiabilité des notes ─────────────────────────────────────────────────────
// Une note affichée sous ce seuil d'avis est un anti-signal (moyenne « 5,0 »
// bâtie sur 1 avis paraît fausse) plutôt qu'une preuve. Seuil unique, aligné
// sur la fiche praticien.
export const MIN_REVIEWS_FOR_RATING = 3;

/** Vraie si la note agrégée est assez étayée pour être affichée / citée en SEO. */
export function hasReliableRating(averageRating: number, reviewCount: number): boolean {
  return reviewCount >= MIN_REVIEWS_FOR_RATING && averageRating > 0;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function deslugify(slug: string, list: string[]): string | undefined {
  return list.find((item) => slugify(item) === slug);
}

/**
 * Date du jour au format YYYY-MM-DD à l'heure du Maroc (Africa/Casablanca).
 * À utiliser partout où l'on a besoin d'« aujourd'hui » comme chaîne de date :
 * évite le décalage d'un jour de `new Date().toISOString()` (UTC) et de
 * `getFullYear/getMonth/getDate` (fuseau serveur) autour de minuit.
 * `en-CA` produit nativement « YYYY-MM-DD ».
 */
export function casablancaTodayStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/**
 * « Maintenant » avec les champs locaux (getHours/getDay/getDate/getMonth/getFullYear)
 * alignés sur l'heure du Maroc. À utiliser pour l'heure/le jour courants (salut,
 * jour de la semaine, bornes de semaine) au lieu de `new Date()` (fuseau serveur).
 * ⚠️ L'instant absolu est décalé : ne lire QUE les champs locaux, ne pas l'utiliser
 * pour un calcul de durée ni le persister.
 */
export function casablancaNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
}

const DEFAULT_WORKING_HOURS = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
  dayOfWeek,
  startTime: "09:00",
  endTime: "17:00",
  isActive: true,
}));

export function generateAvailableSlots(
  bookedSlots: { date: string; time: string }[],
  workingHours: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[],
  consultationDuration = 30,
  absences: AbsenceRecord[] = [],
  options?: { leadHours?: number; maxDays?: number }
): TimeSlot[] {
  const leadHours = options?.leadHours ?? 1;
  const maxDays   = options?.maxDays   ?? 60;

  const slots: TimeSlot[] = [];
  const bookedSet = new Set(bookedSlots.map((s) => `${s.date}-${s.time}`));
  const effective = workingHours.length > 0 ? workingHours : DEFAULT_WORKING_HOURS;
  const whMap = new Map(effective.map((wh) => [wh.dayOfWeek, wh]));

  // Earliest bookable moment = now + leadHours
  const earliest = new Date(Date.now() + leadHours * 60 * 60 * 1000);

  // Ancre « aujourd'hui » à l'heure du Maroc, puis itère en UTC-midi : le jour de
  // la semaine ET la date émise dérivent du MÊME jour ancré. Sinon `getDay()`
  // (fuseau serveur) et `toISOString()` (UTC) divergent autour de minuit → les
  // créneaux d'un jour ouvré s'affichaient sur un jour fermé (ex. dimanche).
  // Midi UTC : jamais de bascule de jour (Maroc = UTC+0/+1).
  const base = new Date(`${casablancaTodayStr()}T12:00:00Z`);

  for (let i = 0; i <= maxDays; i++) {
    const date = new Date(base);
    date.setUTCDate(date.getUTCDate() + i);
    const dayOfWeek = date.getUTCDay();

    const wh = whMap.get(dayOfWeek);
    if (!wh || !wh.isActive) continue;

    const dateStr = date.toISOString().split("T")[0];
    const [sh, sm] = wh.startTime.split(":").map(Number);
    const [eh, em] = wh.endTime.split(":").map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;

    while (cur + consultationDuration <= end) {
      const hh   = Math.floor(cur / 60);
      const mm   = cur % 60;
      const time = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

      // Skip slots before the lead-time threshold
      const slotDt = new Date(`${dateStr}T${time}:00`);
      if (slotDt <= earliest) { cur += consultationDuration; continue; }

      const key        = `${dateStr}-${time}`;
      const inAbsence  = isSlotInAbsence(dateStr, time, absences);
      slots.push({ date: dateStr, time, available: !bookedSet.has(key) && !inAbsence });
      cur += consultationDuration;
    }
  }

  return slots;
}

function isSlotInAbsence(date: string, time: string, absences: AbsenceRecord[]): boolean {
  for (const absence of absences) {
    if (date < absence.startDate || date > absence.endDate) continue;
    if (absence.allDay) return true;
    if (absence.startTime && absence.endTime) {
      if (time >= absence.startTime && time < absence.endTime) return true;
    }
  }
  return false;
}

export function generateManagedSlots(
  workingHours: WorkingHourRecord[],
  consultationDuration: number,
  bookedSet: Set<string>,
  blockedSet: Set<string>,
  days = 30,
  absences: AbsenceRecord[] = []
): ManagedSlot[] {
  const result: ManagedSlot[] = [];
  const effective = workingHours.length > 0 ? workingHours : DEFAULT_WORKING_HOURS;
  const whMap = new Map(effective.map((wh) => [wh.dayOfWeek, wh]));

  // Jour + date ancrés au même fuseau (Maroc) — cf. generateAvailableSlots.
  const base = new Date(`${casablancaTodayStr()}T12:00:00Z`);

  for (let i = 1; i <= days; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    const wh = whMap.get(d.getUTCDay());
    if (!wh || !wh.isActive) continue;

    const dateStr = d.toISOString().split("T")[0];
    const [sh, sm] = wh.startTime.split(":").map(Number);
    const [eh, em] = wh.endTime.split(":").map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;

    while (cur + consultationDuration <= end) {
      const time = `${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`;
      const key = `${dateStr}-${time}`;
      let status: ManagedSlot["status"] = "available";
      if (bookedSet.has(key)) status = "booked";
      else if (blockedSet.has(key)) status = "blocked";
      else if (isSlotInAbsence(dateStr, time, absences)) status = "absent";
      result.push({ date: dateStr, time, status });
      cur += consultationDuration;
    }
  }

  return result;
}

export const MAJOR_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Salé",
  "Témara",
  "Béni Mellal",
  "El Jadida",
  "Nador",
  "Settat",
  "Laâyoune",
  "Tétouan",
  "Safi",
  "Mohammedia",
];


export const SPECIALTIES = [
  "Généraliste",
  "Cardiologue",
  "Dermatologue",
  "Gynécologue",
  "Ophtalmologiste",
  "Pédiatre",
  "Orthopédiste",
  "Neurologue",
  "Pneumologue",
  "Gastro-entérologue",
  "Urologue",
  "Psychiatre",
  "Endocrinologue",
  "ORL",
  "Dentiste",
  "Rhumatologue",
  "Chirurgien plasticien",
  "Radiologue",
  "Infectiologue",
  "Hématologue",
  "Oncologue",
  "Néphrologue",
];
