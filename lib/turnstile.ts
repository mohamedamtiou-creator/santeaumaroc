import "server-only";

/**
 * Vérification CAPTCHA Cloudflare Turnstile — anti-bot du tunnel « poser ».
 *
 * Dégradation gracieuse : si `TURNSTILE_SECRET_KEY` est absente, la vérification
 * est neutre (renvoie true) et seuls honeypot + rate-limit protègent le formulaire.
 * Quand activé : un jeton invalide ou manquant est refusé (fail-closed).
 */
export function isTurnstileEnabled(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  if (!isTurnstileEnabled()) return true; // gracieux : pas de clé → on n'exige rien
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error("[turnstile] vérification échouée", e);
    return false;
  }
}
