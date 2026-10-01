/**
 * Wheel maths. Angles are in degrees, measured CLOCKWISE from 12 o'clock
 * (where the pointer sits). Slice i covers [i * size, (i + 1) * size).
 */

export const sliceSize = (count: number) => 360 / count;

/** Point on a circle for an angle measured clockwise from the top. */
export function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

/** SVG path for a pie slice. */
export function slicePath(cx: number, cy: number, r: number, start: number, end: number): string {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${largeArc} 1 ${b.x} ${b.y} Z`;
}

/** Which slice is under the pointer after the wheel has rotated `rotation` degrees clockwise. */
export function indexAtPointer(rotation: number, count: number): number {
  const underPointer = (((-rotation) % 360) + 360) % 360; // wheel angle now at the top
  return Math.floor(underPointer / sliceSize(count)) % count;
}

/**
 * Work out the final rotation so the wheel lands on `winner`.
 * `offset` (0–1) is where inside the slice it stops — kept away from the edges so it's never ambiguous.
 */
export function targetRotation(current: number, winner: number, count: number, offset: number, extraTurns = 5): number {
  const size = sliceSize(count);
  const landingAngle = winner * size + size * (0.15 + 0.7 * offset); // wheel angle that must end at the top
  const wanted = (360 - landingAngle) % 360; // rotation (mod 360) that puts it there
  const currentMod = ((current % 360) + 360) % 360;
  const delta = (wanted - currentMod + 360) % 360;
  return current + extraTurns * 360 + delta;
}
