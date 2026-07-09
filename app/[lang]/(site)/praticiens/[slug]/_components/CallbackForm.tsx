"use client";

import { useActionState, useId, useRef, useState } from "react";
import { submitCallback, type CallbackState } from "../_actions";
import type { Dictionary } from "@/lib/i18n";

/** Sentinelle « Autre » : bascule vers un champ texte libre. */
const OTHER = "__other__";

type Props = {
  doctorId: string;
  t: Dictionary["doctor"]["callback"];
  /** Motifs propres au médecin (prioritaires) ; sinon repli sur les motifs génériques. */
  doctorMotifs?: string[];
  /** Libellés motifs réutilisés du tunnel RDV — évite d'ajouter des clés i18n. */
  motifT: Pick<Dictionary["rdv"], "reasonChips" | "reasonOther" | "reasonOtherPlaceholder">;
  /** Numéro composable (valeur après `tel:`) ; affiche le bouton « Appeler le cabinet ». */
  callHref?: string | null;
  /** Libellé du bouton d'appel direct. */
  callOfficeLabel?: string;
};

export function CallbackForm({ doctorId, t, doctorMotifs, motifT, callHref, callOfficeLabel }: Props) {
  const [state, action, isPending] = useActionState<CallbackState, FormData>(
    submitCallback,
    {},
  );
  // ids uniques : le formulaire est rendu 2× (mobile + desktop) → évite les id/name dupliqués
  const uid = useId();
  const nameId = `cb-name-${uid}`;
  const phoneId = `cb-phone-${uid}`;
  const slotId = `cb-slot-${uid}`;
  const reasonGroup = `cb-reason-${uid}`; // name du groupe radio (unique par instance)

  /* Motif : chip prédéfini, « Autre » (texte libre), ou aucun (facultatif).
     Les motifs saisis par le médecin priment sur les motifs génériques —
     même logique que le tunnel de réservation en ligne (BookingForm). */
  const reasonChips =
    doctorMotifs && doctorMotifs.length > 0 ? doctorMotifs.slice(0, 8) : motifT.reasonChips;
  const [reasonChoice, setReasonChoice] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const otherRef = useRef<HTMLInputElement>(null);

  const finalReason = reasonChoice === OTHER ? otherText.trim() : (reasonChoice ?? "");

  function selectReason(value: string) {
    setReasonChoice(value);
    if (value === OTHER) requestAnimationFrame(() => otherRef.current?.focus());
  }

  if (state.success) {
    return (
      <div className="rounded-2xl border border-secondary-200 bg-secondary-50/70 p-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"
            className="w-6 h-6" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        </div>
        <p className="font-bold text-slate-900">{t.successTitle}</p>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t.successText}</p>
      </div>
    );
  }

  return (
    <>
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="doctorId" value={doctorId} />
      {/* Honeypot anti-spam (caché aux utilisateurs et lecteurs d'écran).
          `sr-only` plutôt qu'un décalage `-left-[9999px]` : en RTL, un left
          négatif gonfle la largeur scrollable de 9999px (overflow horizontal +
          viewport décalé sur /ar). Le clip de `sr-only` masque sans déborder. */}
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={nameId} className="text-xs font-semibold text-slate-700">{t.name}</label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder={t.namePh}
          aria-invalid={state.errors?.name ? true : undefined}
          className="input-field text-sm bg-white"
        />
        {state.errors?.name && <p className="text-xs text-red-600">{state.errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={phoneId} className="text-xs font-semibold text-slate-700">{t.phone}</label>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          required
          placeholder={t.phonePh}
          aria-invalid={state.errors?.phone ? true : undefined}
          className="input-field text-sm bg-white"
        />
        {state.errors?.phone && <p className="text-xs text-red-600">{state.errors.phone}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={slotId} className="text-xs font-semibold text-slate-700">{t.slot}</label>
        <select id={slotId} name="preferredSlot" className="input-field text-sm bg-white" defaultValue="asap">
          <option value="asap">{t.slotAsap}</option>
          <option value="morning">{t.slotMorning}</option>
          <option value="afternoon">{t.slotAfternoon}</option>
        </select>
      </div>

      {/* Motif — chips de sélection rapide (moins de friction qu'un champ texte).
          Vrais boutons radio : mono-choix annoncé aux lecteurs d'écran, navigation
          aux flèches native, re-clic = désélection (le motif reste facultatif). */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-xs font-semibold text-slate-700">
          {t.reason} <span className="font-normal text-slate-400">· {t.reasonOptional}</span>
        </legend>
        {/* Valeur soumise à l'action serveur (chip choisi ou texte « Autre »). */}
        <input type="hidden" name="reason" value={finalReason} />
        <div className="flex flex-wrap gap-2 mt-1">
          {[...reasonChips, OTHER].map((value) => {
            const on = reasonChoice === value;
            const label = value === OTHER ? motifT.reasonOther : value;
            return (
              <label key={value} className="cursor-pointer select-none">
                <input
                  type="radio"
                  name={reasonGroup}
                  value={value}
                  checked={on}
                  onChange={() => selectReason(value)}
                  onClick={() => { if (on) setReasonChoice(null); }}
                  className="peer sr-only"
                />
                <span
                  className="inline-flex items-center justify-center min-h-[2.75rem] px-4 rounded-full text-xs font-semibold border transition-colors
                    border-slate-200 bg-white text-slate-600
                    peer-hover:border-secondary-300 peer-hover:bg-secondary-50
                    peer-checked:bg-secondary-600 peer-checked:border-secondary-600 peer-checked:text-white
                    peer-checked:peer-hover:bg-secondary-700 peer-checked:peer-hover:border-secondary-700 peer-checked:peer-hover:text-white
                    peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-secondary-400 peer-focus-visible:ring-offset-1"
                >
                  {label}
                </span>
              </label>
            );
          })}
        </div>
        {reasonChoice === OTHER && (
          <input
            ref={otherRef}
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder={motifT.reasonOtherPlaceholder}
            maxLength={200}
            className="input-field text-sm bg-white mt-2"
          />
        )}
      </fieldset>

      {state.serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          {state.serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-secondary py-3.5 w-full justify-center text-[15px] font-semibold"
      >
        {isPending ? (
          <>
            <svg className="animate-spin w-4 h-4 me-2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t.sending}
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9"
              className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4a1 1 0 0 1 1-1h2l1 3.5-2 1.2a9 9 0 0 0 3.3 3.3L9.5 9 13 10v2a1 1 0 0 1-1 1A10 10 0 0 1 3 4z" />
            </svg>
            {t.submit}
          </>
        )}
      </button>
    </form>

    {/* Appel direct au cabinet : alternative au rappel. Le motif choisi ci-dessus
        est rappelé juste au-dessus du bouton — un lien `tel:` ne peut pas le
        transporter, on invite donc le patient à le mentionner de vive voix. */}
    {callHref && (
      <div className="mt-3">
        {finalReason && (
          <div
            aria-live="polite"
            className="flex items-start gap-2 mb-2 rounded-xl border border-secondary-100 bg-secondary-50/70 px-3 py-2"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="#059669" strokeWidth="1.75"
              className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM8 5v3.5M8 11h.01" />
            </svg>
            <p className="text-xs text-slate-600 leading-snug">
              {t.callReasonHint} <span className="font-semibold text-slate-800">{finalReason}</span>
            </p>
          </div>
        )}
        <a
          href={`tel:${callHref}`}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors border border-primary-100"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
            className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 1h3l1.5 3.5-2 1.5a8 8 0 0 0 3.5 3.5L10.5 8 14 9.5V13c0 1-.9 1.5-2 1.5C5.5 14.5 1.5 10.5 1.5 4A2 2 0 0 1 3 1z"/>
          </svg>
          {callOfficeLabel}
        </a>
      </div>
    )}
    </>
  );
}
