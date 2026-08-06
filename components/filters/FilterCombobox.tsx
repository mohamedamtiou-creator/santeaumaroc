"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type FilterOpt = { slug: string; name: string };

/** Cache module : les listes ne changent qu'à l'import de données, et les deux
 *  combobox de la barre de filtres partagent la même requête. Sans cela, ouvrir
 *  « spécialité » puis « ville » déclencherait deux appels identiques. */
let cache: { specialties: FilterOpt[]; cities: FilterOpt[] } | null = null;
let inflight: Promise<{ specialties: FilterOpt[]; cities: FilterOpt[] }> | null = null;

function loadFilters() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/praticiens/filters")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        cache = { specialties: j.specialties ?? [], cities: j.cities ?? [] };
        return cache;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
}

/** Repli accent-insensible : « sale » doit trouver « Salé », « gyneco » « Gynéco- ». */
const fold = (s: string) => s.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase();

/** Plafond d'options affichées. Un listbox de 247 entrées reproduirait le problème
 *  de DOM qu'on vient de supprimer ; au-delà, c'est la recherche qui sert, pas le
 *  défilement. Le compte total reste annoncé sous la liste. */
const MAX_SHOWN = 40;

type Props = {
  /** Nom du champ transmis au formulaire (via un input caché). */
  name: string;
  /** Libellé accessible du champ. */
  label: string;
  /** Texte affiché quand aucun filtre n'est actif (= option « tout »). */
  allLabel: string;
  placeholder: string;
  /** Slug actif au montage. */
  value?: string;
  /** Libellé du slug actif — évite d'attendre le chargement pour afficher l'état. */
  valueLabel?: string;
  /** Options fournies directement (listes courtes). `null` → chargées à la demande. */
  options?: FilterOpt[] | null;
  /** Clé de la liste à charger quand `options` vaut null. */
  source?: "specialties" | "cities";
  /** Traduit un libellé serveur (FR en base) vers la locale affichée. */
  translate?: (name: string) => string;
  icon: React.ReactNode;
  className?: string;
  /** Libellés d'état, fournis par l'appelant (pas d'import de lib/i18n ici). */
  loadingLabel: string;
  emptyLabel: string;
  moreLabel: (n: number) => string;
};

/**
 * Combobox de filtre — motif WAI-ARIA « combobox with listbox popup ».
 *
 * Remplace un `<select>` natif de 247 `<option>` : personne ne fait défiler
 * 247 villes, et le rendu de la liste entière coûtait 17 % des nœuds de la page.
 * Ici la liste n'existe dans le DOM qu'une fois ouverte, plafonnée à 40 entrées,
 * et n'est téléchargée qu'au premier focus.
 *
 * Le formulaire parent lit un `<input type="hidden">` : la logique de soumission
 * de SearchFilters est inchangée. La sélection déclenche `requestSubmit()`, comme
 * le faisait le `onChange` du select.
 */
export function FilterCombobox({
  name, label, allLabel, placeholder, value = "", valueLabel,
  options = null, source, translate, icon, className,
  loadingLabel, emptyLabel, moreLabel,
}: Props) {
  const listId = useId();
  const optId = (i: number) => `${listId}-o${i}`;

  const [slug, setSlug] = useState(value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loaded, setLoaded] = useState<FilterOpt[] | null>(options);
  const [loading, setLoading] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Libellé affiché quand le champ n'a pas le focus : le filtre actif, sinon « tout ».
  const selectedLabel = useMemo(() => {
    if (!slug) return "";
    const hit = loaded?.find((o) => o.slug === slug);
    if (hit) return translate ? translate(hit.name) : hit.name;
    return valueLabel ?? slug;
  }, [slug, loaded, valueLabel, translate]);

  function ensureLoaded() {
    if (loaded || loading || !source) return;
    setLoading(true);
    loadFilters()
      .then((d) => setLoaded(d[source]))
      .catch(() => setLoaded([]))
      .finally(() => setLoading(false));
  }

  const matches = useMemo(() => {
    if (!loaded) return [];
    const q = fold(query.trim());
    const list = q
      ? loaded.filter((o) => fold(translate ? translate(o.name) : o.name).includes(q) || fold(o.slug).includes(q))
      : loaded;
    return list.slice(0, MAX_SHOWN);
  }, [loaded, query, translate]);

  const totalMatches = useMemo(() => {
    if (!loaded) return 0;
    const q = fold(query.trim());
    if (!q) return loaded.length;
    return loaded.filter((o) => fold(translate ? translate(o.name) : o.name).includes(q) || fold(o.slug).includes(q)).length;
  }, [loaded, query, translate]);

  // Fermeture au clic extérieur. `pointerdown` et non `click` : le clic sur une
  // option doit être traité avant que le blur ne referme la liste.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Maintient l'option active dans le viewport du listbox au clavier.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`#${CSS.escape(optId(active))}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]); // eslint-disable-line react-hooks/exhaustive-deps

  function commit(opt: FilterOpt | null) {
    setSlug(opt ? opt.slug : "");
    setQuery("");
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
    // Laisse React écrire la valeur de l'input caché avant de soumettre.
    requestAnimationFrame(() => inputRef.current?.form?.requestSubmit());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { setOpen(true); ensureLoaded(); return; }
      const n = matches.length + 1; // +1 : l'entrée « tout » en tête
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + dir + n) % n);
      return;
    }
    if (e.key === "Enter") {
      if (!open) return;
      e.preventDefault();
      if (active === 0) commit(null);
      else if (active > 0 && matches[active - 1]) commit(matches[active - 1]);
      return;
    }
    if (e.key === "Escape") {
      if (!open) return;
      e.preventDefault();
      setOpen(false);
      setQuery("");
      setActive(-1);
      return;
    }
    if (e.key === "Home" && open) { e.preventDefault(); setActive(0); return; }
    if (e.key === "End" && open)  { e.preventDefault(); setActive(matches.length); return; }
    if (e.key === "Tab") setOpen(false);
  }

  const showList = open && !loading && loaded !== null;

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <input type="hidden" name={name} value={slug} />

      <span className="absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        {icon}
      </span>

      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? optId(active) : undefined}
        aria-label={label}
        autoComplete="off"
        className="input-field ps-10 pe-8 h-11 w-full cursor-pointer"
        placeholder={slug ? undefined : placeholder}
        value={open ? query : selectedLabel}
        onFocus={() => { setOpen(true); ensureLoaded(); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1); ensureLoaded(); }}
        onKeyDown={onKeyDown}
      />

      {slug && !open && (
        <button
          type="button"
          onClick={() => commit(null)}
          aria-label={`${label} — ${allLabel}`}
          className="absolute end-2.5 top-1/2 -translate-y-1/2 w-5 h-5 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {open && loading && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500 shadow-lg">
          {loadingLabel}
        </div>
      )}

      {showList && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <li
            id={optId(0)}
            role="option"
            aria-selected={!slug}
            onPointerDown={(e) => { e.preventDefault(); commit(null); }}
            onMouseEnter={() => setActive(0)}
            className={`cursor-pointer px-3 py-2 text-sm ${active === 0 ? "bg-primary-50 text-primary-800" : "text-slate-500"}`}
          >
            {allLabel}
          </li>

          {matches.map((o, i) => (
            <li
              key={o.slug}
              id={optId(i + 1)}
              role="option"
              aria-selected={o.slug === slug}
              onPointerDown={(e) => { e.preventDefault(); commit(o); }}
              onMouseEnter={() => setActive(i + 1)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                active === i + 1 ? "bg-primary-50 text-primary-800"
                : o.slug === slug ? "font-semibold text-primary-700"
                : "text-slate-700"
              }`}
            >
              {translate ? translate(o.name) : o.name}
            </li>
          ))}

          {matches.length === 0 && (
            <li role="presentation" className="px-3 py-2 text-sm text-slate-400">{emptyLabel}</li>
          )}

          {totalMatches > matches.length && (
            <li role="presentation" className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-400">
              {moreLabel(totalMatches - matches.length)}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
