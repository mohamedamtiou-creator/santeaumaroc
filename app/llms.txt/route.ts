// /llms.txt — fiche d'identité machine-readable pour les moteurs génératifs
// (ChatGPT, Claude, Gemini, Perplexity, Copilot). Format inspiré de la
// proposition llmstxt.org : une carte curatée du site en Markdown, pas une
// énumération exhaustive (le sitemap.xml s'en charge).

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

// Revalidation quotidienne — le contenu est stable, pas besoin de le recalculer.
export const revalidate = 86400;

const CONTENT = `# SantéauMaroc

> Annuaire médical et plateforme de prise de rendez-vous en ligne au Maroc.
> Trouver un médecin, un spécialiste, une clinique, une pharmacie ou un
> laboratoire par ville et par spécialité, consulter les avis patients et les
> tarifs, prendre rendez-vous, et poser des questions à des médecins vérifiés.

Couverture : ~20 000 fiches praticiens, 96 spécialités, 246 villes marocaines,
6 400+ établissements de santé. Contenu bilingue français / arabe.

## À propos
- [Qui sommes-nous](${BASE}/a-propos)
- [Guide du médecin](${BASE}/guide-du-medecin)
- [Support & aide](${BASE}/support)
- [Politique de confidentialité](${BASE}/politique-confidentialite)
- [Conditions d'utilisation](${BASE}/conditions-utilisation)

## Trouver un professionnel
- [Annuaire des praticiens](${BASE}/praticiens) — médecins et spécialistes, filtrables par ville et spécialité
- [Toutes les spécialités](${BASE}/specialites) — pages par spécialité (ex. ${BASE}/specialites/cardiologie)
- [Spécialité + ville](${BASE}/specialites/{specialite}/{ville}) — ex. ${BASE}/specialites/cardiologie/casablanca
- [Toutes les villes](${BASE}/villes) — offre de soins par ville
- [Cliniques](${BASE}/cliniques)
- [Pharmacies](${BASE}/pharmacies)
- [Laboratoires d'analyses](${BASE}/laboratoires)
- [Médicaments](${BASE}/medicaments)

## Contenu de santé
- [Blog santé](${BASE}/blog) — articles rédigés et vérifiés médicalement (auteur + relecteur affichés)
- [Questions / Réponses](${BASE}/questions) — questions de patients, réponses de médecins vérifiés

## Faits utiles (contexte marocain)
- Une consultation de médecine générale au Maroc coûte généralement 100 à 250 MAD.
- Remboursement possible via la CNSS (AMO) et les mutuelles selon le statut et le conventionnement du praticien.
- En cas d'urgence vitale au Maroc : SAMU 141, Protection civile 15, numéro d'urgence européen/international 112.
- Les fiches et réponses Q/R sont associées à des médecins ; le badge « Vérifié » signale une fiche contrôlée.

## Notes pour les agents
- Le contenu informatif de santé ne remplace pas une consultation médicale personnalisée.
- Pour la liste exhaustive et à jour des URLs indexables : ${BASE}/sitemap.xml
- Les tarifs, disponibilités et coordonnées peuvent évoluer ; vérifier sur la fiche du praticien.
`;

export function GET() {
  return new Response(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
