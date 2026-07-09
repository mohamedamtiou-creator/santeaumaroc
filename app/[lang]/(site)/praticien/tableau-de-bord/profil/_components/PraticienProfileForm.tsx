"use client";

import { useActionState, useEffect, useState } from "react";
import { updatePraticienProfile } from "@/features/praticien/actions";
import { GroupedSelect } from "@/components/ui/GroupedSelect";
import type { FormState } from "@/lib/definitions";
import type { Dictionary, Locale } from "@/lib/i18n";
import { CONVENTION_OPTIONS, PAYMENT_OPTIONS } from "@/lib/doctor-options";

/* ── Types ──────────────────────────────────────────────────── */

type Props = {
  praticien: {
    civilite:             string | null;
    nom:                  string | null;
    prenom:               string | null;
    phone:                string;
    adresse:              string;
    latitude:             number | null;
    longitude:            number | null;
    description:          string | null;
    prix:                 number | null;
    experience:           number | null;
    langues:              string[];
    conventions:          string[];
    paymentMethods:       string[];
    motifs:               string[];
    consultationDuration: number;
    specialtyId:          string;
    cityId:               string;
  };
  specialties: { id: string; name: string; order: number }[];
  cities:      { id: string; name: string; order: number }[];
  locale: Locale;
  t: Dictionary["dashboard"]["praticien"];
};

/* ── Constantes ─────────────────────────────────────────────── */

const CIVILITES       = ["Dr", "Pr", "M.", "Mme"] as const;
const LANGUES_OPTIONS = ["Arabe", "Darija", "Français", "Anglais", "Espagnol", "Amazighe"] as const;
const DURATIONS       = [10, 15, 20, 30, 45, 60, 90] as const;
const DESC_MAX        = 600;
const MOTIF_MAX_LEN   = 80;
const MOTIFS_MAX      = 12;

/* ── Icônes ─────────────────────────────────────────────────── */

function IconUser() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5.5" r="2.5"/>
      <path d="M2.5 14c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5"/>
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z"/>
      <circle cx="8" cy="6" r="1.5"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3a1.2 1.2 0 0 1 1.2-1.2H4.6a.6.6 0 0 1 .58.46l.53 2.1a.6.6 0 0 1-.16.59L4.4 6.1a7.6 7.6 0 0 0 5.5 5.5l1.14-1.14a.6.6 0 0 1 .59-.16l2.1.53A.6.6 0 0 1 14.2 11.4v1.4A1.2 1.2 0 0 1 13 14h-.3C6.3 14 2 9.7 2 3.3V3z"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5"/>
      <path d="M8 4.5V8l2.5 1.5"/>
    </svg>
  );
}

function IconText() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4h11M2.5 8h11M2.5 12h7"/>
    </svg>
  );
}

function IconTag() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2.5h5l6.5 6.5a1.4 1.4 0 0 1 0 2L9 15.5a1.4 1.4 0 0 1-2 0L.5 9V4a1.5 1.5 0 0 1 1.5-1.5z"/>
      <circle cx="5" cy="5" r="1"/>
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5l5 2v4c0 3-2.2 4.9-5 5.8C5.2 12.4 3 10.5 3 7.5v-4l5-2z"/>
      <path d="M5.75 7.75L7.25 9.25 10.25 6.25"/>
    </svg>
  );
}

function IconSave() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9"
      className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 14.5v-13h8.5l2.5 2.5v10.5H2.5z"/>
      <path d="M5.5 14.5V9h5v5.5M5.5 1.5v3.5h5"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"
      className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 8.5l3.5 3.5 7-7"/>
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 13.5h13L8 2 1.5 13.5z"/>
      <path d="M8 6.5v3M8 11.5h.01"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 shrink-0 animate-spin" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Composants de formulaire ───────────────────────────────── */

function SectionHeader({ id, icon, label, description }: {
  id:           string;
  icon:         React.ReactNode;
  label:        string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-slate-100 mb-5">
      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 id={id} className="font-semibold text-slate-800">{label}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function Label({ htmlFor, children, optional }: {
  htmlFor:   string;
  children:  React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
      {optional && (
        <span className="ms-1.5 text-xs font-normal text-slate-500 tracking-wide">facultatif</span>
      )}
    </label>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
      <svg viewBox="0 0 10 10" fill="currentColor" className="w-2.5 h-2.5 shrink-0" aria-hidden="true">
        <circle cx="5" cy="5" r="4.5"/>
        <path d="M5 3.2v2M5 6.8h.01" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none"/>
      </svg>
      {errors[0]}
    </p>
  );
}

/* ── Composant principal ────────────────────────────────────── */

export function PraticienProfileForm({ praticien: p, specialties, cities, locale, t}: Props) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    updatePraticienProfile,
    undefined
  );
  const [selectedLangues, setSelectedLangues] = useState<string[]>(p.langues);
  const [conventions,     setConventions]     = useState<string[]>(p.conventions);
  const [paymentMethods,  setPaymentMethods]  = useState<string[]>(p.paymentMethods);
  const [motifs,          setMotifs]          = useState<string[]>(p.motifs);
  const [motifInput,      setMotifInput]      = useState("");
  const [descLength,      setDescLength]      = useState((p.description ?? "").length);
  const [showSuccess,     setShowSuccess]     = useState(false);

  // Affiche le succès quand l'état d'action change (ajustement pendant le rendu,
  // pas de setState synchrone dans un effet) ; l'effet ne gère que l'auto-masquage.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    setShowSuccess(state?.message === "ok");
  }
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 4000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  function toggleLangue(lang: string) {
    setSelectedLangues((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  // Bascule générique pour les groupes de cases à cocher (conventionnement, paiement).
  const toggleIn = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  function addMotif() {
    const value = motifInput.trim().replace(/\s+/g, " ").slice(0, MOTIF_MAX_LEN);
    if (!value) return;
    setMotifs((prev) =>
      prev.length >= MOTIFS_MAX || prev.some((m) => m.toLowerCase() === value.toLowerCase())
        ? prev
        : [...prev, value]
    );
    setMotifInput("");
  }

  function removeMotif(motif: string) {
    setMotifs((prev) => prev.filter((m) => m !== motif));
  }

  const motifsFull = motifs.length >= MOTIFS_MAX;

  const hasError = !!state?.message && state.message !== "ok";

  return (
    <form action={action} className="flex flex-col gap-8" noValidate>

      {/* ══════════════════════════════════════════════
          SECTION : Identité
          ══════════════════════════════════════════════ */}
      <section aria-labelledby="section-identite">
        <SectionHeader
          id="section-identite"
          icon={<IconUser />}
          label={t.secIdentity}
          description={t.secIdentityDesc}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="civilite" optional>{t.civilite}</Label>
            <select id="civilite" name="civilite" defaultValue={p.civilite ?? ""}
              className="input-field">
              <option value="">—</option>
              {CIVILITES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="prenom">{t.prenom} *</Label>
            <input id="prenom" name="prenom" type="text" defaultValue={p.prenom ?? ""}
              autoComplete="given-name" className="input-field" required />
            <FieldError errors={state?.errors?.prenom} />
          </div>
          <div>
            <Label htmlFor="nom">{t.nom} *</Label>
            <input id="nom" name="nom" type="text" defaultValue={p.nom ?? ""}
              autoComplete="family-name" className="input-field" required />
            <FieldError errors={state?.errors?.nom} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION : Localisation professionnelle
          ══════════════════════════════════════════════ */}
      <section aria-labelledby="section-localisation">
        <SectionHeader
          id="section-localisation"
          icon={<IconMapPin />}
          label={t.secLocation}
          description={t.secLocationDesc}
        />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialtyId">{t.specialty} *</Label>
              <GroupedSelect
                id="specialtyId" name="specialtyId"
                defaultValue={p.specialtyId}
                items={specialties}
                featuredLabel={t.specialtyFeatured}
                othersLabel={t.specialtyOthers}
                className="input-field"
                required
              />
              <FieldError errors={state?.errors?.specialtyId} />
            </div>
            <div>
              <Label htmlFor="cityId">{t.city} *</Label>
              <GroupedSelect
                id="cityId" name="cityId"
                defaultValue={p.cityId}
                items={cities}
                featuredLabel={t.cityFeatured}
                othersLabel={t.cityOthers}
                className="input-field"
                required
              />
              <FieldError errors={state?.errors?.cityId} />
            </div>
          </div>
          <div>
            <Label htmlFor="adresse">{t.address} *</Label>
            <input id="adresse" name="adresse" type="text" defaultValue={p.adresse}
              autoComplete="street-address"
              placeholder={t.addressPlaceholder}
              className="input-field" required />
            <FieldError errors={state?.errors?.adresse} />
          </div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude" optional>{t.latitude}</Label>
                <input id="latitude" name="latitude" type="number" step="any" min="-90" max="90"
                  defaultValue={p.latitude ?? ""}
                  inputMode="decimal" placeholder="33.9716"
                  className="input-field" />
                <FieldError errors={state?.errors?.latitude} />
              </div>
              <div>
                <Label htmlFor="longitude" optional>{t.longitude}</Label>
                <input id="longitude" name="longitude" type="number" step="any" min="-180" max="180"
                  defaultValue={p.longitude ?? ""}
                  inputMode="decimal" placeholder="-6.8498"
                  className="input-field" />
                <FieldError errors={state?.errors?.longitude} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{t.coordsHelp}</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION : Contact
          ══════════════════════════════════════════════ */}
      <section aria-labelledby="section-contact">
        <SectionHeader
          id="section-contact"
          icon={<IconPhone />}
          label={t.secContact}
          description={t.secContactDesc}
        />
        <div className="max-w-xs">
          <Label htmlFor="phone">{t.phone} *</Label>
          <input id="phone" name="phone" type="tel" defaultValue={p.phone}
            autoComplete="tel"
            placeholder={t.phonePlaceholder}
            className="input-field" required />
          <FieldError errors={state?.errors?.phone} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION : Consultation
          ══════════════════════════════════════════════ */}
      <section aria-labelledby="section-consultation">
        <SectionHeader
          id="section-consultation"
          icon={<IconClock />}
          label={t.secConsultation}
          description={t.secConsultationDesc}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="prix" optional>{t.price}</Label>
            <div className="relative">
              <input id="prix" name="prix" type="number" min="0" step="1"
                defaultValue={p.prix ?? ""}
                placeholder="200"
                className="input-field pe-14" />
              <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium select-none pointer-events-none">
                MAD
              </span>
            </div>
            <FieldError errors={state?.errors?.prix} />
          </div>
          <div>
            <Label htmlFor="consultationDuration">{t.durationLabelProfil}</Label>
            <select id="consultationDuration" name="consultationDuration"
              defaultValue={p.consultationDuration} className="input-field">
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d} min</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="experience" optional>{t.experience}</Label>
            <div className="relative">
              <input id="experience" name="experience" type="number" min="0" max="60"
                defaultValue={p.experience ?? ""}
                placeholder="10"
                className="input-field pe-12" />
              <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium select-none pointer-events-none">
                {t.yearsSuffix}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION : Prise en charge & paiement
          ══════════════════════════════════════════════ */}
      <section aria-labelledby="section-coverage">
        <SectionHeader
          id="section-coverage"
          icon={<IconShield />}
          label={t.secCoverage}
          description={t.secCoverageDesc}
        />
        <div className="flex flex-col gap-5">
          {/* Conventionnement */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              {t.conventionsLabel}
              <span className="ms-1.5 text-xs font-normal text-slate-500">{t.optional}</span>
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.conventionsLabel}>
              {CONVENTION_OPTIONS.map((opt) => {
                const checked = conventions.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`inline-flex items-center gap-2 text-sm cursor-pointer px-3.5 py-2 rounded-full border transition-all select-none ${
                      checked
                        ? "bg-primary-50 border-primary-300 text-primary-700 font-semibold shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input type="checkbox" checked={checked}
                      onChange={() => toggleIn(setConventions)(opt.value)} className="sr-only" />
                    {checked && (
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="w-3 h-3 shrink-0 text-primary-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 6l3 3 5-5"/>
                      </svg>
                    )}
                    {opt[locale]}
                  </label>
                );
              })}
            </div>
            <input type="hidden" name="conventions" value={conventions.join(",")} />
          </div>

          {/* Modes de paiement */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              {t.paymentLabel}
              <span className="ms-1.5 text-xs font-normal text-slate-500">{t.optional}</span>
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.paymentLabel}>
              {PAYMENT_OPTIONS.map((opt) => {
                const checked = paymentMethods.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`inline-flex items-center gap-2 text-sm cursor-pointer px-3.5 py-2 rounded-full border transition-all select-none ${
                      checked
                        ? "bg-primary-50 border-primary-300 text-primary-700 font-semibold shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input type="checkbox" checked={checked}
                      onChange={() => toggleIn(setPaymentMethods)(opt.value)} className="sr-only" />
                    {checked && (
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="w-3 h-3 shrink-0 text-primary-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 6l3 3 5-5"/>
                      </svg>
                    )}
                    {opt[locale]}
                  </label>
                );
              })}
            </div>
            <input type="hidden" name="paymentMethods" value={paymentMethods.join(",")} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION : Motifs de consultation
          ══════════════════════════════════════════════ */}
      <section aria-labelledby="section-motifs">
        <SectionHeader
          id="section-motifs"
          icon={<IconTag />}
          label={t.secMotifs}
          description={t.secMotifsDesc}
        />
        <div className="flex flex-col gap-3">
          {/* Chips des motifs ajoutés */}
          {motifs.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label={t.motifsLabel}>
              {motifs.map((motif) => (
                <li key={motif}>
                  <span className="inline-flex items-center gap-1.5 ps-3 pe-1.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium">
                    {motif}
                    <button
                      type="button"
                      onClick={() => removeMotif(motif)}
                      aria-label={`${t.motifsRemove} : ${motif}`}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-primary-500 hover:text-white hover:bg-primary-500 transition-colors"
                    >
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"
                        className="w-3 h-3" aria-hidden="true" strokeLinecap="round">
                        <path d="M3 3l6 6M9 3l-6 6"/>
                      </svg>
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Saisie d'un nouveau motif */}
          <div>
            <Label htmlFor="motif-input" optional>{t.motifsLabel}</Label>
            <div className="flex gap-2">
              <input
                id="motif-input"
                type="text"
                value={motifInput}
                maxLength={MOTIF_MAX_LEN}
                disabled={motifsFull}
                onChange={(e) => setMotifInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMotif();
                  }
                }}
                placeholder={t.motifsPlaceholder}
                className="input-field flex-1 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={addMotif}
                disabled={motifsFull || !motifInput.trim()}
                className="btn-secondary shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.motifsAdd}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {motifsFull ? t.motifsFull : t.motifsHint}
            </p>
          </div>

          {/* Valeur soumise — un motif par ligne (peut contenir des virgules). */}
          <input type="hidden" name="motifs" value={motifs.join("\n")} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION : Présentation
          ══════════════════════════════════════════════ */}
      <section aria-labelledby="section-presentation">
        <SectionHeader
          id="section-presentation"
          icon={<IconText />}
          label={t.secPresentation}
          description={t.secPresentationDesc}
        />
        <div className="flex flex-col gap-5">

          {/* Description */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <Label htmlFor="description" optional>{t.presentationLabel}</Label>
              <span className={`text-xs tabular-nums ${descLength > DESC_MAX - 60 ? "text-amber-600 font-semibold" : "text-slate-500"}`}>
                {descLength}&thinsp;/&thinsp;{DESC_MAX}
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={5}
              maxLength={DESC_MAX}
              defaultValue={p.description ?? ""}
              onChange={(e) => setDescLength(e.target.value.length)}
              placeholder={t.presentationPlaceholder}
              className="input-field resize-none leading-relaxed"
            />
          </div>

          {/* Langues */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              {t.languagesLabel}
              <span className="ms-1.5 text-xs font-normal text-slate-500">{t.optional}</span>
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.languagesLabel}>
              {LANGUES_OPTIONS.map((lang) => {
                const checked = selectedLangues.includes(lang);
                return (
                  <label
                    key={lang}
                    className={`inline-flex items-center gap-2 text-sm cursor-pointer px-3.5 py-2 rounded-full border transition-all select-none ${
                      checked
                        ? "bg-primary-50 border-primary-300 text-primary-700 font-semibold shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleLangue(lang)}
                      className="sr-only"
                    />
                    {checked && (
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="w-3 h-3 shrink-0 text-primary-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 6l3 3 5-5"/>
                      </svg>
                    )}
                    {t.languages[lang]}
                  </label>
                );
              })}
            </div>
            <input type="hidden" name="langues" value={selectedLangues.join(",")} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BARRE DE SAUVEGARDE
          ══════════════════════════════════════════════ */}
      <div className="border-t border-slate-100 pt-5 -mx-5 sm:-mx-6 px-5 sm:px-6">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">

          {/* Feedback */}
          <div className="min-h-[1.5rem] flex items-center">
            {showSuccess && (
              <div className="inline-flex items-center gap-2 text-sm text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-1.5">
                <IconCheck />
                {t.profileSaved}
              </div>
            )}
            {hasError && (
              <div role="alert" className="inline-flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                <IconAlert />
                {state!.message}
              </div>
            )}
            {/* Erreurs de champs groupées */}
            {!hasError && state?.errors && Object.keys(state.errors).length > 0 && (
              <div role="alert" className="inline-flex items-center gap-2 text-sm text-red-600">
                <IconAlert />
                {t.fixErrors}
              </div>
            )}
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full sm:w-auto"
          >
            {isPending ? (
              <><Spinner /> {t.saving}</>
            ) : (
              <><IconSave /> {t.saveChanges}</>
            )}
          </button>
        </div>
      </div>

    </form>
  );
}
