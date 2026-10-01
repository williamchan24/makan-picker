import type { Filters, Place } from './types';
import { DEFAULT_PLACES } from './data';

export interface State {
  places: Place[];
  filters: Filters;
  history: string[]; // last few picks (names)
}

const KEY = 'makan-picker:v1';

export const defaultState = (): State => ({
  places: structuredClone(DEFAULT_PLACES),
  filters: { budgets: [], cuisines: [], halalOnly: false },
  history: [],
});

export function load(): State {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? { ...defaultState(), ...(JSON.parse(saved) as State) } : defaultState();
  } catch {
    return defaultState();
  }
}

export function save(state: State): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage blocked — app still works for this visit */
  }
}
