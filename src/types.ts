export type Budget = 1 | 2 | 3; // 1 = under RM15, 2 = RM15–40, 3 = RM40+

export interface Place {
  id: string;
  name: string;
  emoji: string;
  cuisine: string;
  budget: Budget;
  halal: boolean;
  custom?: boolean; // added by the user (can be deleted)
}

export interface Filters {
  budgets: Budget[]; // empty = any
  cuisines: string[]; // empty = any
  halalOnly: boolean;
}
