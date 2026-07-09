type CityIconDef = { d: string; bg: string; c: string };

const CITY_ICON_MAP: Record<string, CityIconDef> = {
  "Casablanca": { d: "M3 21h18M4 21V11l5-4 5 4V21M14 21V9l4-3v12M9 21v-4h3v4",                                                         bg: "bg-primary-50",   c: "text-primary-600"   },
  "Rabat":      { d: "M4 16h16M6 16V10l3 3 3-6 3 6 3-3v6M8 16v3h8v-3",                                                                 bg: "bg-amber-50",     c: "text-amber-600"     },
  "Marrakech":  { d: "M12 2l1.9 5.5H20l-5.3 3.9 2 6L12 14l-4.7 3.4 2-6L4 7.5h6.1L12 2z",                                              bg: "bg-terra-50",     c: "text-terra-600"     },
  "Fès":        { d: "M5 20V9a7 7 0 0 1 14 0v11M9 20v-5a3 3 0 0 1 6 0v5",                                                              bg: "bg-amber-50",     c: "text-amber-600"     },
  "Tanger":     { d: "M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 8v14M5 11h14M6 22c0-2 2-5 6-6M18 22c0-2-2-5-6-6",                         bg: "bg-primary-50",   c: "text-primary-600"   },
  "Agadir":     { d: "M12 4v2M12 18v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z", bg: "bg-amber-50", c: "text-amber-600" },
  "Meknès":     { d: "M4 20h16M6 20V12h4v8M14 20V12h4v8M6 12V8h4v4M14 12V8h4v4M6 8h12",                                                bg: "bg-primary-50",   c: "text-primary-600"   },
  "Oujda":      { d: "M12 6v2M5.6 8.6l1.4 1.4M18.4 8.6l-1.4 1.4M3 13h2M19 13h2M8 13a4 4 0 0 1 8 0M2 17h20",                          bg: "bg-secondary-50", c: "text-secondary-600" },
  "Kénitra":    { d: "M2 16h20M4 16V11a8 4 0 0 1 16 0v5M2 20h20",                                                                      bg: "bg-primary-50",   c: "text-primary-600"   },
  "Salé":       { d: "M9 20V6a3 3 0 0 1 6 0v14M7 20h10M11 6V3h2v3M11 20v-3h2v3",                                                       bg: "bg-primary-50",   c: "text-primary-600"   },
  "Témara":     { d: "M2 20h20M3 20V13l5-4 5 4v7M13 20V11l4-4 4 4v9M8 20v-4h3v4",                                                      bg: "bg-secondary-50", c: "text-secondary-600" },
  "Béni Mellal":{ d: "M2 20h20M2 20l5-9 3 5 3-5 7 9",                                                                                  bg: "bg-slate-100",    c: "text-slate-500"     },
  "El Jadida":  { d: "M4 20V9h16v11M4 9V6h4V3h8v3h4v3M2 20h20M9 20V14h6v6",                                                            bg: "bg-amber-50",     c: "text-amber-600"     },
  "Nador":      { d: "M12 2v12M4 14h16M7 14L12 2l5 12M3 20h18",                                                                        bg: "bg-primary-50",   c: "text-primary-600"   },
  "Settat":     { d: "M12 22V8M9 11c1-3 3-4 3-6M15 10c-1-3-3-4-3-6M8 15c1-2 3-2 4-2M16 14c-1-2-3-2-4-2",                              bg: "bg-secondary-50", c: "text-secondary-600" },
  "Laâyoune":   { d: "M2 16c3-3 6-4 10-4s7 1 10 4M2 20c3-3 6-5 10-5s7 2 10 5",                                                        bg: "bg-amber-50",     c: "text-amber-600"     },
  "Tétouan":    { d: "M2 20h20M2 20l4-8 4 6 4-8 6 10",                                                                                 bg: "bg-slate-100",    c: "text-slate-500"     },
  "Safi":       { d: "M2 10c3-4 5-4 6-4s3 2 6 2 3-2 6-2M2 15c3-4 5-4 6-4s3 2 6 2 3-2 6-2M2 20c3-4 5-4 6-4s3 2 6 2 3-2 6-2",         bg: "bg-primary-50",   c: "text-primary-600"   },
  "Mohammedia": { d: "M4 20h16M7 20V14h3v6M14 20V14h3v6M8 14V9h2v5M14 14V9h2v5M9 9h6M10 5v4M14 5v4M10 5h4",                           bg: "bg-slate-100",    c: "text-slate-500"     },
  "Khouribga":  { d: "M2 20h20M12 4L4 20M12 4l8 16M7 13h10",                                                                            bg: "bg-amber-50",     c: "text-amber-600"     },
  "Taza":       { d: "M2 20h20M6 20L12 6l6 14M4 14h16",                                                                                 bg: "bg-slate-100",    c: "text-slate-500"     },
  "Beni Mellal":{ d: "M2 20h20M2 20l5-9 3 5 3-5 7 9",                                                                                   bg: "bg-slate-100",    c: "text-slate-500"     },
};

const DEFAULT_ICON: CityIconDef = {
  d:  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  bg: "bg-primary-50",
  c:  "text-primary-600",
};

const SIZES = {
  sm: { wrap: "w-8 h-8 rounded-lg",    svg: "w-4 h-4"          },
  md: { wrap: "w-10 h-10 rounded-xl",  svg: "w-[18px] h-[18px]" },
  lg: { wrap: "w-14 h-14 rounded-2xl", svg: "w-7 h-7"          },
};

export function getCityIconDef(name: string): CityIconDef {
  if (CITY_ICON_MAP[name]) return CITY_ICON_MAP[name];
  const norm = (s: string) => s.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase();
  const key = Object.keys(CITY_ICON_MAP).find((k) => norm(k) === norm(name));
  return key ? CITY_ICON_MAP[key] : DEFAULT_ICON;
}

export function CityIcon({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const { d, bg, c } = getCityIconDef(name);
  const { wrap, svg } = SIZES[size];

  return (
    <div className={`${wrap} ${bg} flex items-center justify-center shrink-0`} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className={`${svg} ${c}`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    </div>
  );
}
