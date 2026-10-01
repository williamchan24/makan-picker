/** Random number in [0, 1) using the browser's crypto RNG (fairer than Math.random). */
export function random(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 2 ** 32;
}

export function randomInt(maxExclusive: number): number {
  return Math.floor(random() * maxExclusive);
}
