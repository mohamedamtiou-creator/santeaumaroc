"use client";

type Props = {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  durationMin: number;
  label: string;
};

/** Échappe les caractères spéciaux du format iCalendar (RFC 5545). */
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** YYYYMMDDTHHMMSS — heure « flottante » interprétée dans le fuseau local de l'agenda. */
function fmt(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `T${p(d.getHours())}${p(d.getMinutes())}00`
  );
}

export function AddToCalendarButton({
  uid, title, description, location, date, time, durationMin, label,
}: Props) {
  function download() {
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + durationMin * 60_000);

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SanteauMaroc//RDV//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}@santeaumaroc.com`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${esc(title)}`,
      ...(description ? [`DESCRIPTION:${esc(description)}`] : []),
      ...(location ? [`LOCATION:${esc(location)}`] : []),
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(title)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rendez-vous-santeaumaroc.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="flex items-center justify-center gap-2 w-full rounded-xl border border-primary-100 bg-primary-50 text-primary-700
        px-4 py-3 text-sm font-semibold hover:bg-primary-100 transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6h12M5 2v2M11 2v2M8 8v4M6 10h4"/>
      </svg>
      {label}
    </button>
  );
}
