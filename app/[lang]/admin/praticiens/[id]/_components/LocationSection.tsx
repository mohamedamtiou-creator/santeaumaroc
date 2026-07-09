"use client";

import { useState, useTransition } from "react";
import { setDoctorCoordinates } from "@/features/admin/actions";

type Props = {
  doctorId:  string;
  adresse:   string;
  cityName:  string;
  latitude:  number | null;
  longitude: number | null;
};

export function LocationSection({ doctorId, adresse, cityName, latitude, longitude }: Props) {
  const [lat, setLat] = useState(latitude != null ? String(latitude) : "");
  const [lng, setLng] = useState(longitude != null ? String(longitude) : "");
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const hasCoords = latitude != null && longitude != null;
  const mapsSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${adresse}, ${cityName}, Maroc`)}`;

  function handleSave() {
    setFeedback(null);
    const latNum = lat.trim() === "" ? null : Number(lat);
    const lngNum = lng.trim() === "" ? null : Number(lng);
    if (latNum !== null && Number.isNaN(latNum)) { setFeedback({ ok: false, msg: "Latitude invalide." }); return; }
    if (lngNum !== null && Number.isNaN(lngNum)) { setFeedback({ ok: false, msg: "Longitude invalide." }); return; }
    if ((latNum === null) !== (lngNum === null)) {
      setFeedback({ ok: false, msg: "Renseignez les deux valeurs, ou laissez-les vides toutes les deux." });
      return;
    }
    start(async () => {
      try {
        await setDoctorCoordinates(doctorId, latNum, lngNum);
        setFeedback({ ok: true, msg: latNum === null ? "Coordonnées effacées." : "Coordonnées enregistrées." });
      } catch (e) {
        setFeedback({ ok: false, msg: e instanceof Error ? e.message : "Erreur lors de l'enregistrement." });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* État actuel */}
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
        hasCoords ? "bg-secondary-50 border-secondary-200" : "bg-slate-50 border-slate-200"
      }`}>
        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          hasCoords ? "bg-secondary-500" : "bg-slate-300"
        }`}>
          <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.75"
            className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z"/>
            <circle cx="8" cy="6" r="1.5"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-slate-900">
            {hasCoords ? "Coordonnées GPS renseignées" : "Coordonnées GPS manquantes"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {hasCoords
              ? "Le schema geo (lat/lng) est émis sur la fiche publique — utile au SEO local et au pack Google Maps."
              : "Sans coordonnées, le bloc geo n'apparaît pas dans les données structurées de la fiche."}
          </p>
        </div>
      </div>

      {/* Aide : récupérer les coordonnées depuis Google Maps */}
      <a
        href={mapsSearch} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
          className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z"/>
          <circle cx="8" cy="6" r="1.5"/>
        </svg>
        Localiser sur Google Maps (clic droit → coordonnées)
      </a>

      {/* Champs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="admin-lat" className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
          <input
            id="admin-lat" type="number" step="any" inputMode="decimal"
            value={lat} onChange={(e) => setLat(e.target.value)}
            placeholder="33.9716"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="admin-lng" className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
          <input
            id="admin-lng" type="number" step="any" inputMode="decimal"
            value={lng} onChange={(e) => setLng(e.target.value)}
            placeholder="-6.8498"
            className="input-field"
          />
        </div>
      </div>

      {feedback && (
        <p role="alert" className={`text-xs ${feedback.ok ? "text-secondary-700" : "text-red-600"}`}>
          {feedback.msg}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-primary-300 bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-60"
      >
        {pending ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            En cours…
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9"
              className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 14.5v-13h8.5l2.5 2.5v10.5H2.5z"/>
              <path d="M5.5 14.5V9h5v5.5M5.5 1.5v3.5h5"/>
            </svg>
            Enregistrer les coordonnées
          </>
        )}
      </button>
    </div>
  );
}
