import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Assistance IA pré-publication & résumé — Q/R médicales.
 *
 * Dégradation gracieuse : si `ANTHROPIC_API_KEY` est absente (ou en cas d'erreur
 * réseau/parse), toutes les fonctions renvoient `null` et le tunnel fonctionne
 * en modération 100 % manuelle. Modèle économique `claude-haiku-4-5`
 * (classification rapide ; pas de `effort` — non supporté sur Haiku).
 */

const MODEL = "claude-haiku-4-5";

export function isAiEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic(); // lit ANTHROPIC_API_KEY
  return _client;
}

/** Extrait le premier objet JSON d'une réponse texte (tolère les ``` fences). */
function parseJson<T>(text: string): T | null {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function firstText(resp: Anthropic.Message): string {
  for (const block of resp.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

export type QaPreCheck = {
  isMedical: boolean;
  correctedTitle: string;
  suggestedSpecialtySlug: string | null;
  suggestedTags: string[];
  urgencyLevel: "NONE" | "ADVICE" | "URGENT";
  danger: boolean;
  dangerReason: string | null;
  duplicateSlugs: string[];
};

const URGENCY = new Set(["NONE", "ADVICE", "URGENT"]);

/**
 * Vérification avant publication : titre corrigé, spécialité/tags suggérés,
 * niveau d'urgence, détection de danger/désinformation, doublons candidats.
 */
export async function preCheckQuestion(input: {
  title: string;
  body?: string | null;
  specialties: { slug: string; name: string }[];
  candidates: { slug: string; title: string }[];
}): Promise<QaPreCheck | null> {
  if (!isAiEnabled()) return null;

  const system =
    "Tu es un assistant de modération pour une plateforme marocaine de questions/réponses médicales. " +
    "Le public est francophone. Réponds UNIQUEMENT par un objet JSON valide, sans texte autour, sans balises de code. " +
    "Champs attendus : " +
    "isMedical (bool : la question relève-t-elle de la santé), " +
    "correctedTitle (string : titre clair, orthographe corrigée, sans données personnelles identifiantes, max 200 car.), " +
    "suggestedSpecialtySlug (string|null : un slug parmi la liste fournie, sinon null), " +
    "suggestedTags (string[] : 1 à 5 mots-clés courts en minuscules), " +
    "urgencyLevel ('NONE'|'ADVICE'|'URGENT' : URGENT si signes de gravité nécessitant des secours immédiats), " +
    "danger (bool : contenu dangereux, automédication risquée ou désinformation), " +
    "dangerReason (string|null), " +
    "duplicateSlugs (string[] : slugs des questions candidates quasi identiques, sinon []).";

  const payload = {
    question: { title: input.title, body: input.body ?? "" },
    specialties: input.specialties.map((s) => ({ slug: s.slug, name: s.name })),
    candidates: input.candidates,
  };

  try {
    const resp = await client().messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    });
    const raw = parseJson<Partial<QaPreCheck>>(firstText(resp));
    if (!raw) return null;

    const validSlugs = new Set(input.specialties.map((s) => s.slug));
    const candidateSlugs = new Set(input.candidates.map((c) => c.slug));
    const urgency = (raw.urgencyLevel && URGENCY.has(raw.urgencyLevel) ? raw.urgencyLevel : "NONE") as QaPreCheck["urgencyLevel"];

    return {
      isMedical: raw.isMedical !== false,
      correctedTitle: (raw.correctedTitle || input.title).toString().slice(0, 200),
      suggestedSpecialtySlug:
        raw.suggestedSpecialtySlug && validSlugs.has(raw.suggestedSpecialtySlug) ? raw.suggestedSpecialtySlug : null,
      suggestedTags: Array.isArray(raw.suggestedTags)
        ? raw.suggestedTags.map((t) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 5)
        : [],
      urgencyLevel: urgency,
      danger: raw.danger === true,
      dangerReason: raw.dangerReason ? String(raw.dangerReason).slice(0, 300) : null,
      duplicateSlugs: Array.isArray(raw.duplicateSlugs)
        ? raw.duplicateSlugs.map(String).filter((s) => candidateSlugs.has(s)).slice(0, 5)
        : [],
    };
  } catch (e) {
    console.error("[qa-ai] preCheckQuestion", e);
    return null;
  }
}

/**
 * Génère « L'essentiel » (1 à 3 phrases) à partir de la meilleure réponse,
 * pour l'extraction par les AI Overviews. Texte brut en entrée.
 */
export async function summarizeBestAnswer(input: {
  questionTitle: string;
  answerPlainText: string;
}): Promise<string | null> {
  if (!isAiEnabled()) return null;
  const answer = input.answerPlainText.slice(0, 6000);
  if (answer.length < 80) return null;

  try {
    const resp = await client().messages.create({
      model: MODEL,
      max_tokens: 300,
      system:
        "Tu résumes une réponse médicale pour le grand public francophone. " +
        "Produis 1 à 3 phrases claires et prudentes (l'essentiel à retenir), sans diagnostic, " +
        "en invitant à consulter si nécessaire. Réponds uniquement par le résumé, sans préambule.",
      messages: [
        { role: "user", content: `Question : ${input.questionTitle}\n\nRéponse du médecin :\n${answer}` },
      ],
    });
    const text = firstText(resp).trim();
    return text ? text.slice(0, 600) : null;
  } catch (e) {
    console.error("[qa-ai] summarizeBestAnswer", e);
    return null;
  }
}

/**
 * Traduit « L'essentiel » en arabe standard moderne (page AR).
 * ⚠️ Sortie NON relue : elle ne doit être servie qu'APRÈS relecture humaine
 * (garde-fou page : `arReviewedAt >= aiSummaryAt`). cf lib/qa-summary.
 */
export async function translateSummaryToArabic(frSummary: string): Promise<string | null> {
  if (!isAiEnabled()) return null;
  const text = frSummary.trim();
  if (text.length < 10) return null;
  try {
    const resp = await client().messages.create({
      model: MODEL,
      max_tokens: 400,
      system:
        "Tu traduis un court résumé médical du français vers l'arabe standard moderne, " +
        "pour le grand public. Traduction fidèle, claire et prudente. Réponds uniquement " +
        "par la traduction, sans préambule ni translittération.",
      messages: [{ role: "user", content: text }],
    });
    const out = firstText(resp).trim();
    return out ? out.slice(0, 800) : null;
  } catch (e) {
    console.error("[qa-ai] translateSummaryToArabic", e);
    return null;
  }
}
