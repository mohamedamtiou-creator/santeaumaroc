"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { useRouter } from "next/navigation";
import { askQuestion } from "@/features/qa/actions";
import { findSimilarQuestions, type QaSimilar } from "@/features/qa/list-actions";
import { TurnstileWidget } from "@/components/qa/TurnstileWidget";
import type { FormState } from "@/lib/definitions";
import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

// Indices d'urgence côté client (miroir léger de lib/qa) → affiche la bannière
// secours dès la saisie. Le serveur reste la source de vérité.
const URGENT_HINT = /douleur\s+(thoraciqu|à\s+la\s+poitrine|poitrine)|mal\s+à\s+respirer|difficult\w*\s+à\s+respirer|perte\s+de\s+connaissance|infarctus|crise\s+cardiaque|h[ée]morragie|suicid|étouff/i;

const TITLE_MAX = 200;
const BODY_MAX = 4000;
const DRAFT_KEY = "qa-ask-draft";
const ASK_PATH = "/questions/poser";

type Draft = { title: string; body: string; specialtyId: string; isAnonymous: boolean };

export function AskForm({
  specialties, isAuthed, t, locale,
}: {
  specialties: { id: string; name: string }[];
  isAuthed: boolean;
  t: QaT;
  locale?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<FormState, FormData>(askQuestion, undefined);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [similar, setSimilar] = useState<QaSimilar[]>([]);
  const seqRef = useRef(0);
  const uid = useId();
  const showUrgent = URGENT_HINT.test(title);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Restaure un éventuel brouillon (retour de connexion via auth tardive).
  // localStorage n'existe pas au SSR : la lecture doit se faire après montage,
  // pas dans un initializer d'état (qui casserait l'hydratation).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Partial<Draft>;
      /* eslint-disable react-hooks/set-state-in-effect -- hydratation-safe : restauration unique depuis localStorage */
      if (d.title) setTitle(d.title);
      if (d.body) setBody(d.body);
      if (d.specialtyId) setSpecialtyId(d.specialtyId);
      if (d.isAnonymous) setIsAnonymous(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* localStorage indisponible — sans gravité */
    }
  }, []);

  // Auth tardive : le serveur renvoie UNAUTH (sans rien écrire). On conserve le
  // brouillon et on redirige vers la connexion, qui ramène ici ensuite.
  useEffect(() => {
    if (state?.code === "UNAUTH") {
      try {
        const draft: Draft = { title, body, specialtyId, isAnonymous };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch { /* ignore */ }
      router.push(`/connexion?callbackUrl=${encodeURIComponent(ASK_PATH)}`);
    } else if (state?.message === "ok") {
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    }
  }, [state, title, body, specialtyId, isAnonymous, router]);

  // Détection live de questions similaires (debounce) — réduit les doublons et
  // donne une réponse immédiate quand elle existe déjà.
  useEffect(() => {
    const q = title.trim();
    const handle = setTimeout(() => {
      const seq = ++seqRef.current;
      if (q.length < 8) {
        setSimilar((prev) => (prev.length ? [] : prev));
        return;
      }
      findSimilarQuestions(q)
        .then((res) => {
          if (seq === seqRef.current) setSimilar(res);
        })
        .catch(() => {});
    }, 400);
    return () => clearTimeout(handle);
  }, [title]);

  if (state?.message === "ok") {
    return <AskSuccess t={t} urgent={state.code === "URGENT"} />;
  }

  return (
    <form action={action} className="card p-5 sm:p-6 flex flex-col gap-4">
      {/* Honeypot anti-bot — `sr-only` (et non `-left-[9999px]`) : en RTL un left
          négatif crée 9999px d'overflow horizontal. Le clip masque sans déborder. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />

      {showUrgent && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong className="block mb-0.5">{t.urgencyTitle}</strong>
          {t.urgencyText} <span className="font-semibold" dir="ltr">{t.urgencyEmergency} · {t.urgencySamu} · {t.urgencyMobile}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`q-title-${uid}`} className="text-sm font-semibold text-slate-700">{t.askTitleLabel}</label>
        <input
          id={`q-title-${uid}`}
          name="title"
          type="text"
          required
          minLength={10}
          maxLength={TITLE_MAX}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.askTitlePlaceholder}
          className="input-field"
          aria-invalid={state?.errors?.title ? true : undefined}
          aria-describedby={[`q-title-hint-${uid}`, state?.errors?.title ? `q-title-err-${uid}` : null].filter(Boolean).join(" ")}
        />
        <div className="flex items-center justify-between gap-3">
          <p id={`q-title-hint-${uid}`} className="text-xs text-slate-500">{t.askTitleHint}</p>
          {title.length > 0 && (
            <span className="text-xs text-slate-500 tabular-nums shrink-0" dir="ltr" role="status" aria-live="polite">{title.length}/{TITLE_MAX}</span>
          )}
        </div>
        {state?.errors?.title && <p id={`q-title-err-${uid}`} role="alert" className="text-xs text-red-600">{state.errors.title[0]}</p>}

        {/* Exemples cliquables — apprend à formuler + déclenche la recherche live. */}
        {title.length === 0 && (
          <div className="mt-1">
            <p className="text-xs font-semibold text-slate-500 mb-1.5">{t.askExamplesTitle}</p>
            <div className="flex flex-wrap gap-1.5">
              {[t.askExample1, t.askExample2, t.askExample3, t.askExample4].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setTitle(ex)}
                  className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-secondary-50 hover:text-secondary-700 border border-slate-200 text-slate-600 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Questions similaires détectées. */}
        {similar.length > 0 && (
          <div className="mt-1.5 rounded-xl border border-secondary-200 bg-secondary-50/60 p-3.5">
            <p className="text-sm font-semibold text-slate-800">{t.askSimilarTitle}</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-2.5">{t.askSimilarHint}</p>
            <ul className="flex flex-col gap-1.5">
              {similar.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/questions/${s.slug}`}
                    target="_blank"
                    rel="noopener"
                    className="group flex items-start gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 hover:border-secondary-300 transition-colors"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4 shrink-0 text-secondary-500 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="4.5" /><path d="m11 11 3 3" /></svg>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-slate-800 leading-snug group-hover:text-secondary-700 line-clamp-2">{s.title}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                        {s.specialtyName && <span>{s.specialtyName}</span>}
                        {s.hasAnswers && (
                          <span className="inline-flex items-center gap-1 text-secondary-600 font-semibold">
                            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5 5 9l4.5-5.5" /></svg>
                            {s.answersText}
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`q-body-${uid}`} className="text-sm font-semibold text-slate-700">{t.askBodyLabel}</label>
        <textarea
          id={`q-body-${uid}`}
          name="body"
          rows={4}
          maxLength={BODY_MAX}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.askBodyPlaceholder}
          className="input-field text-sm"
        />
        {body.length > 0 && (
          <span className="text-xs text-slate-500 tabular-nums self-end" dir="ltr" role="status" aria-live="polite">{body.length}/{BODY_MAX}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`q-spec-${uid}`} className="text-sm font-semibold text-slate-700">{t.askSpecialtyLabel}</label>
        <select
          id={`q-spec-${uid}`}
          name="specialtyId"
          className="input-field"
          value={specialtyId}
          onChange={(e) => setSpecialtyId(e.target.value)}
        >
          <option value="">{t.askSpecialtyPlaceholder}</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <p className="text-xs text-slate-500">{t.askSpecialtyHint}</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            name="isAnonymous"
            className="accent-primary-600"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          {t.askAnonymous}
        </label>
        <p className="text-xs text-slate-500 ps-7">
          {t.askAnonymousHint} {t.askPrivacyNote}{" "}
          <Link href="/politique-confidentialite" className="underline hover:text-secondary-600">{t.askPrivacyLink}</Link>
        </p>
      </div>

      {turnstileSiteKey && <TurnstileWidget siteKey={turnstileSiteKey} locale={locale} />}

      {state?.message && state.message !== "ok" && state.code !== "UNAUTH" && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">{state.message}</p>
      )}

      {!isAuthed && (
        <p className="text-xs text-slate-500 -mt-1">{t.askLoginNote}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        className="btn-primary justify-center py-3 text-[15px] font-semibold"
      >
        {pending ? t.askSubmitting : isAuthed ? t.askSubmit : t.askLoginCta}
      </button>
    </form>
  );
}

// ── Écran de succès : modération honnête + relance + cross-sell RDV ────────────
// Pas de suivi ici : la question est encore PENDING (le patient ne peut pas la
// voir) et l'auteur est de toute façon notifié par e-mail à la 1re réponse.
function AskSuccess({ t, urgent }: { t: QaT; urgent: boolean }) {
  return (
    <div className="card p-6 sm:p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" className="w-7 h-7" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
      </div>
      <p className="font-bold text-slate-900 text-lg">{t.askSuccessTitle}</p>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-sm mx-auto">{t.askSuccessModeration}</p>

      {urgent && (
        <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-start max-w-md mx-auto">
          {t.askUrgentReminder}
        </p>
      )}

      {/* Réassurance : notification e-mail automatique (sans suivi explicite). */}
      <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4 shrink-0 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4.5h12v8H2z" /><path d="m2.5 5 5.5 4 5.5-4" /></svg>
        {t.askSuccessFollowDesc}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        {/* Recharge la page pour repartir d'un formulaire vierge (reset useActionState). */}
        <button type="button" onClick={() => window.location.reload()} className="btn-outline text-sm">{t.askSuccessAnother}</button>
        <Link href="/questions" className="text-sm font-semibold text-secondary-600 hover:text-secondary-700">{t.showAll} →</Link>
      </div>

      {/* Cross-sell : réponse personnalisée → prise de rendez-vous. */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-sm text-slate-600 mb-3">{t.askSuccessBookTitle}</p>
        <Link href="/praticiens" className="btn-primary inline-flex text-sm">{t.askSuccessBookCta} →</Link>
      </div>
    </div>
  );
}
