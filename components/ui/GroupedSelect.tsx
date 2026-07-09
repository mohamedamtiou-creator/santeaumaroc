import type { SelectHTMLAttributes } from "react";

export type SelectOption = { id: string; name: string; order: number };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  items:         SelectOption[];
  featuredLabel: string;
  othersLabel:   string;
};

/**
 * <select> avec <optgroup> automatique.
 * Les items dont order < 100 sont regroupés sous featuredLabel,
 * les autres sous othersLabel.
 * Si tous les items ont order ≥ 100 (aucune priorité définie),
 * affiche une liste plate sans séparateur.
 */
export function GroupedSelect({
  items,
  featuredLabel,
  othersLabel,
  children,
  ...selectProps
}: Props) {
  const featured = items.filter((i) => i.order < 100);
  const others   = items.filter((i) => i.order >= 100);
  const grouped  = featured.length > 0 && others.length > 0;

  return (
    <select {...selectProps}>
      {/* Placeholder option passé via children (ex: <option value="" disabled>) */}
      {children}

      {grouped ? (
        <>
          <optgroup label={featuredLabel}>
            {featured.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </optgroup>
          <optgroup label={othersLabel}>
            {others.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </optgroup>
        </>
      ) : (
        items.map((i) => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))
      )}
    </select>
  );
}
