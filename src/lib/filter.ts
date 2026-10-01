import type { Filters, Place } from '../types';

export function applyFilters(places: Place[], f: Filters): Place[] {
  return places.filter(
    (p) =>
      (f.budgets.length === 0 || f.budgets.includes(p.budget)) &&
      (f.cuisines.length === 0 || f.cuisines.includes(p.cuisine)) &&
      (!f.halalOnly || p.halal),
  );
}

/** Unique cuisines in the order they first appear */
export function cuisinesOf(places: Place[]): string[] {
  return [...new Set(places.map((p) => p.cuisine))];
}
