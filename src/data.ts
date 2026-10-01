import type { Budget, Place } from './types';

export const BUDGET_LABELS: Record<Budget, string> = {
  1: 'Cheap eats (< RM15)',
  2: 'Mid (RM15–40)',
  3: 'Treat (RM40+)',
};

export const SHORT_BUDGET: Record<Budget, string> = { 1: 'RM', 2: 'RM RM', 3: 'RM RM RM' };

/** Starter list — food types, not specific restaurants. Users can add their own. */
export const DEFAULT_PLACES: Place[] = [
  { id: 'd1', name: 'Nasi Kandar', emoji: '🍛', cuisine: 'Mamak', budget: 1, halal: true },
  { id: 'd2', name: 'Roti Canai', emoji: '🫓', cuisine: 'Mamak', budget: 1, halal: true },
  { id: 'd3', name: 'Nasi Lemak', emoji: '🍚', cuisine: 'Malay', budget: 1, halal: true },
  { id: 'd4', name: 'Satay', emoji: '🍢', cuisine: 'Malay', budget: 2, halal: true },
  { id: 'd5', name: 'Chicken Rice', emoji: '🍗', cuisine: 'Chinese', budget: 1, halal: false },
  { id: 'd6', name: 'Pan Mee', emoji: '🍜', cuisine: 'Chinese', budget: 1, halal: false },
  { id: 'd7', name: 'Dim Sum', emoji: '🥟', cuisine: 'Chinese', budget: 2, halal: false },
  { id: 'd8', name: 'Steamboat', emoji: '🍲', cuisine: 'Chinese', budget: 3, halal: false },
  { id: 'd9', name: 'Banana Leaf', emoji: '🍃', cuisine: 'Indian', budget: 2, halal: true },
  { id: 'd10', name: 'Tomyam', emoji: '🌶️', cuisine: 'Thai', budget: 2, halal: true },
  { id: 'd11', name: 'Ramen', emoji: '🍜', cuisine: 'Japanese', budget: 2, halal: false },
  { id: 'd12', name: 'Sushi', emoji: '🍣', cuisine: 'Japanese', budget: 3, halal: false },
  { id: 'd13', name: 'Korean BBQ', emoji: '🔥', cuisine: 'Korean', budget: 3, halal: false },
  { id: 'd14', name: 'Burgers', emoji: '🍔', cuisine: 'Western', budget: 2, halal: true },
  { id: 'd15', name: 'Pizza', emoji: '🍕', cuisine: 'Western', budget: 2, halal: true },
];

/** Slice colours: light pastels with dark text read well in both light and dark mode. */
export const SLICE_COLOURS = ['#c7d2fe', '#fde68a', '#a7f3d0', '#fbcfe8', '#bae6fd', '#fed7aa'];
