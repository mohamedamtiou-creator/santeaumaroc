"use client";

import { useSyncExternalStore } from "react";

/**
 * Carte « Horaires » avec statut d'ouverture en temps réel.
 *
 * POURQUOI un îlot CLIENT. Le statut (« Ouvert » / « Fermé · Ouvre lun. 09:00 »)
 * et le surlignage du jour courant dépendent de l'heure de lecture. Calculés au
 * rendu serveur, ils étaient figés dans le HTML mis en cache par l'ISR (24 h) :
 * une fiche rendue à 10 h affichait « Ouvert » toute la nuit, et le jour surligné
 * pouvait pointer la veille. Sur un annuaire médical, c'est un signal de confiance
 * qui devient un contresens.
 *
 * Les LIGNES d'horaires restent rendues au SSR (un composant client est aussi
 * pré-rendu en HTML) : le texte indexable est intact. Seules les décorations
 * dépendantes de l'heure attendent le montage, ce qui garantit qu'elles sont
 * toujours justes.
 *
 * CLS : le badge occupe une boîte réservée avant hydratation (même hauteur, même
 * largeur minimale), donc l'apparition du statut ne décale rien.
 */

export type ScheduleHour = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type ScheduleLabels = {
  /** Titre de la carte. */
  schedule: string;
  open: string;
  closed: string;
  /** « Ouvre à » — réouverture le jour même. */
  opensAt: string;
  /** « Ouvre » — réouverture un autre jour, suivi du nom du jour. */
  opensPrefix: string;
  /** Noms de jours, indexés par `dayOfWeek` (0 = dimanche). */
  dayNames: string[];
};

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

/**
 * L'horloge vue comme un store externe — le patron déjà retenu dans ce dépôt pour
 * les sources mutables hors React (cf. `useHasSession`). `getSnapshot` renvoie une
 * PRIMITIVE (« jour:minute ») pour que la comparaison d'identité de
 * `useSyncExternalStore` soit stable, et `getServerSnapshot` renvoie `null` : le
 * rendu serveur et le rendu d'hydratation affichent la boîte réservée, puis React
 * relit l'horloge côté client. Aucun `setState` dans un effet, aucune divergence
 * d'hydratation, et surtout aucune valeur figée par le cache ISR.
 */
const subscribeToClock = (onChange: () => void) => {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
};

/** Instant courant à l'heure de Casablanca — le fuseau de l'appareil peut différer. */
const clockSnapshot = (): string => {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
  return `${d.getDay()}:${d.getHours() * 60 + d.getMinutes()}`;
};

const serverClockSnapshot = (): null => null;

type Status = { isOpen: boolean; label: string; today: number };

function computeStatus(clock: string, hours: ScheduleHour[], t: ScheduleLabels): Status {
  const [today, now] = clock.split(":").map(Number);

  const isOpen = hours.some(
    (wh) => wh.dayOfWeek === today && now >= toMin(wh.startTime) && now < toMin(wh.endTime),
  );
  if (isOpen) return { isOpen: true, label: t.open, today };

  // Prochaine ouverture : plus tard aujourd'hui, sinon le premier jour ouvré des 7 suivants.
  for (let offset = 0; offset < 7; offset++) {
    const day = (today + offset) % 7;
    const next = hours
      .filter((wh) => wh.dayOfWeek === day && (offset > 0 || toMin(wh.startTime) > now))
      .sort((a, b) => toMin(a.startTime) - toMin(b.startTime))[0];
    if (next) {
      return {
        isOpen: false,
        today,
        label: offset === 0
          ? `${t.opensAt} ${next.startTime}`
          : `${t.opensPrefix} ${t.dayNames[day]} · ${next.startTime}`,
      };
    }
  }
  return { isOpen: false, label: "", today };
}

export function ScheduleCard({ hours, t }: { hours: ScheduleHour[]; t: ScheduleLabels }) {
  const clock = useSyncExternalStore(subscribeToClock, clockSnapshot, serverClockSnapshot);
  const status: Status | null = clock ? computeStatus(clock, hours, t) : null;

  if (hours.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-primary-500" aria-hidden="true">
            <circle cx="8" cy="8" r="7" />
            <path d="M8 4v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.schedule}
        </h2>

        {/* Boîte réservée : même hauteur avant/après hydratation → aucun décalage. */}
        <span className="inline-flex items-center h-[26px] shrink-0" aria-live="polite">
          {status?.label && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                status.isOpen
                  ? "bg-secondary-50 text-secondary-700 border border-secondary-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? "bg-secondary-500" : "bg-amber-500"}`} />
              {status.isOpen ? t.open : (
                <span>
                  <span className="text-amber-600 font-bold">{t.closed}</span>
                  <span className="font-normal text-amber-700"> · {status.label}</span>
                </span>
              )}
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {hours.map((wh, i) => {
          const isToday = status?.today === wh.dayOfWeek;
          // Le filet est TOUJOURS rendu (transparent quand il ne doit pas se voir) :
          // sinon la ligne du jour perdait 1 px en s'hydratant, soit un décalage.
          const rule = isToday || i === hours.length - 1 ? "border-transparent" : "border-slate-50";
          return (
            <div
              key={wh.id}
              className={`flex justify-between items-center text-sm py-1.5 border-b ${rule} ${
                isToday ? "bg-secondary-50 -mx-2 px-2 rounded-lg" : ""
              }`}
            >
              <span className={`font-medium w-10 shrink-0 ${isToday ? "text-secondary-700" : "text-slate-500"}`}>
                {t.dayNames[wh.dayOfWeek]}
              </span>
              <span className={`font-semibold tabular-nums ${isToday ? "text-secondary-800" : "text-slate-800"}`}>
                {wh.startTime} – {wh.endTime}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
