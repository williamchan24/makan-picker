import { describe, expect, it } from 'vitest';
import { indexAtPointer, targetRotation, slicePath } from './wheel';
import { applyFilters } from './filter';
import { DEFAULT_PLACES } from '../data';

describe('wheel maths', () => {
  it('finds the slice under the pointer', () => {
    // 4 slices of 90°. No rotation → slice 0 is at the top.
    expect(indexAtPointer(0, 4)).toBe(0);
    // Rotate 90° clockwise → the last slice (3) moves under the pointer.
    expect(indexAtPointer(90, 4)).toBe(3);
    expect(indexAtPointer(-90, 4)).toBe(1);
  });

  it('always lands on the chosen winner', () => {
    for (let count = 2; count <= 15; count++) {
      for (let winner = 0; winner < count; winner++) {
        for (const offset of [0, 0.5, 0.999]) {
          const current = Math.random() * 5000;
          const end = targetRotation(current, winner, count, offset);
          expect(indexAtPointer(end, count)).toBe(winner);
          expect(end - current).toBeGreaterThanOrEqual(5 * 360); // always spins forward
        }
      }
    }
  });

  it('draws a valid slice path', () => {
    expect(slicePath(100, 100, 100, 0, 90)).toMatch(/^M 100 100 L 100 0 A 100 100 0 0 1 200 100 Z$/);
  });
});

describe('filters', () => {
  it('filters by budget, cuisine and halal', () => {
    const result = applyFilters(DEFAULT_PLACES, { budgets: [1], cuisines: ['Mamak'], halalOnly: true });
    expect(result.map((p) => p.name)).toEqual(['Nasi Kandar', 'Roti Canai']);
  });

  it('returns everything with no filters', () => {
    expect(applyFilters(DEFAULT_PLACES, { budgets: [], cuisines: [], halalOnly: false })).toHaveLength(DEFAULT_PLACES.length);
  });
});
