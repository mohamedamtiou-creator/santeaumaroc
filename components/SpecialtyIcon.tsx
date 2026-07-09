type Size = "sm" | "md" | "lg";

export function SpecialtyIcon({ name, size = "sm" }: { name: string; size?: Size }) {
  const n = name.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "");

  // Palette réduite à 3 couleurs système :
  // primary (blue)   — sciences médicales, diagnostic, médecine interne
  // secondary (vert) — santé, vie, soins du quotidien
  // amber            — actes techniques, chirurgie, imagerie

  let d  = "M7 4V3M17 4V3M7 4a5 5 0 0 0 10 0M12 4v9M9.5 13a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0z";
  let bg = "bg-primary-50";
  let c  = "text-primary-600";

  if      (/cardio/.test(n))               { d = "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"; bg = "bg-primary-50"; c = "text-primary-600"; }
  else if (/ped/.test(n))                  { d = "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M8 10.5h1M15 10.5h1M9 14.5c.8 1.5 2.2 2.5 3 2.5s2.2-1 3-2.5"; bg = "bg-secondary-50"; c = "text-secondary-600"; }
  else if (/gynec|obstet/.test(n))         { d = "M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M12 15v6M9.5 18.5h5"; bg = "bg-secondary-50"; c = "text-secondary-600"; }
  else if (/dermatol/.test(n))             { d = "M10 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M3 21v-2a7 7 0 0 1 7.3-6.97 M17 21l-3.5-3.5m0 0a3.5 3.5 0 1 0-5-5 3.5 3.5 0 0 0 5 5z"; bg = "bg-secondary-50"; c = "text-secondary-600"; }
  else if (/ophtalm/.test(n))              { d = "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"; bg = "bg-primary-50"; c = "text-primary-600"; }
  else if (/orthop|traumato/.test(n))      { d = "M7 6m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0 M17 18m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0 M9.8 8.3L14.2 15.7"; bg = "bg-amber-50"; c = "text-amber-600"; }
  else if (/neurolog/.test(n))             { d = "M9 3A3 3 0 0 0 6 6c0 1.5.8 2.8 2 3.5C6.7 10.8 6 12.3 6 14a6 6 0 0 0 12 0c0-1.7-.7-3.2-2-4.5C17.2 8.8 18 7.5 18 6a3 3 0 0 0-6 0 M12 6c0 2-1.5 3.8-3 5"; bg = "bg-primary-50"; c = "text-primary-600"; }
  else if (/psychiatr|psycholog/.test(n))  { d = "M12 2a7 7 0 0 0-5 11.9V17a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3.1A7 7 0 0 0 12 2z M9.5 20.5h5M10.5 22h3"; bg = "bg-secondary-50"; c = "text-secondary-600"; }
  else if (/\borl\b|oto/.test(n))          { d = "M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z M8 11a4 4 0 0 0 8 0 M12 15v4M8 19h8"; bg = "bg-primary-50"; c = "text-primary-600"; }
  else if (/chirurg/.test(n))              { d = "M6 3l12 18M18 3L6 21 M5 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"; bg = "bg-amber-50"; c = "text-amber-600"; }
  else if (/radiolog|imagerie/.test(n))    { d = "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 7v5l3 2.5"; bg = "bg-amber-50"; c = "text-amber-600"; }
  else if (/gastro/.test(n))               { d = "M12 3C9 3 7 5 7 8c0 2 1 3.5 2.5 4.5C8 14 7 15.5 7 17c0 2.8 2.2 5 5 5s5-2.2 5-5c0-1.5-1-3-2.5-4.5C16 11.5 17 10 17 8c0-3-2-5-5-5z"; bg = "bg-secondary-50"; c = "text-secondary-600"; }
  else if (/urolog|nephro/.test(n))        { d = "M12 2C8.7 2 6 5 6 8.5c0 4 2.6 7 6 7s6-3 6-7C18 5 15.3 2 12 2z M8 22c0-2.2 1.8-4 4-4s4 1.8 4 4"; bg = "bg-primary-50"; c = "text-primary-600"; }
  else if (/pneumo/.test(n))               { d = "M12 3v8 M9 3h6a3 3 0 0 1 3 3v4c2 1 3 3 3 5a4 4 0 0 1-8 0 4 4 0 0 1-8 0c0-2 1-4 3-5V6a3 3 0 0 1 3-3z"; bg = "bg-primary-50"; c = "text-primary-600"; }
  else if (/rhuma/.test(n))                { d = "M8 11V8a4 4 0 0 1 8 0v3 M5 11h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6z"; bg = "bg-secondary-50"; c = "text-secondary-600"; }
  else if (/endocrin|diabet/.test(n))      { d = "M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M7 12c-3 0-5 1.5-5 3.5 0 3 4.5 6.5 10 6.5s10-3.5 10-6.5C22 13.5 20 12 17 12 M12 14v4"; bg = "bg-secondary-50"; c = "text-secondary-600"; }
  else if (/stomato|dentist|dent/.test(n)) { d = "M12 3C9 3 6 5.5 6 8.5c0 1.5.5 2.8 1.4 3.7L8 20c.2 1 .9 1.5 1.7 1.5.7 0 1.3-.4 1.6-1L12 18l.7 2.5c.3.6.9 1 1.6 1 .8 0 1.5-.5 1.7-1.5l.6-7.8A6 6 0 0 0 18 8.5C18 5.5 15 3 12 3z"; bg = "bg-secondary-50"; c = "text-secondary-600"; }
  else if (/oncolog|cancer/.test(n))       { d = "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"; bg = "bg-amber-50"; c = "text-amber-600"; }
  else if (/gen|intern/.test(n))           { d = "M7 4V3M17 4V3M7 4a5 5 0 0 0 10 0M12 4v9M9.5 13a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0z"; bg = "bg-primary-50"; c = "text-primary-600"; }
  else if (/optique|optom|optic/.test(n))  { d = "M5 10a3 3 0 0 0 6 0M5 10a3 3 0 0 1 6 0M13 10a3 3 0 0 0 6 0M13 10a3 3 0 0 1 6 0M11 12V8M2 10h3M19 10h3"; bg = "bg-slate-100"; c = "text-slate-500"; }
  else if (/anesthes|reanimat/.test(n))    { d = "M3 21l4.5-4.5M7.5 16.5l9-9M15 5l3-3M18 2l4 4M10 14l3 3M6 18l-3 3"; bg = "bg-amber-50"; c = "text-amber-600"; }

  const containerCls =
    size === "lg" ? "w-16 h-16 rounded-2xl" :
    size === "md" ? "w-11 h-11 rounded-xl"  :
                    "w-9 h-9 rounded-xl";
  const iconCls =
    size === "lg" ? "w-8 h-8"       :
    size === "md" ? "w-5 h-5"       :
                    "w-[18px] h-[18px]";

  return (
    <div className={`${containerCls} ${bg} flex items-center justify-center shrink-0`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        className={`${iconCls} ${c}`} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </div>
  );
}
