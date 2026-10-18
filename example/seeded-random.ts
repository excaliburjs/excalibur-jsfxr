/**
 * jsfxr reaches for the global Math.random in two places that matter to this example:
 *
 *  1. `JsfxrResource.rangeValue()` - how a `{ min, max }` SoundConfig parameter is resolved.
 *  2. `SoundEffect.getRawBuffer()` - the 32-entry noise buffer used by wave_type 3 (NOISE).
 *
 * Both feed the generated PCM, so a waveform rendered from an unseeded run is different on
 * every reload and could never be a golden master. Rather than relying on the test harness's
 * global Math.random seed (which would make the *page* only deterministic under Playwright,
 * and would still shift if engine boot consumed a different number of draws), the example
 * swaps in its own fixed-seed PRNG for exactly the duration of a generation call.
 */
export function makeRandom(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x9e3779b9) | 0;
    let t = Math.imul(s ^ (s >>> 16), 0x21f0aaad);
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
    return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

/** Runs `fn` with Math.random replaced by a fresh fixed-seed PRNG, then restores it. */
export function withSeededRandom<T>(seed: number, fn: () => T): T {
  const original = Math.random;
  Math.random = makeRandom(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

/** Stable per-sound seed so the same sound generates identically on every page and every run. */
export function seedForName(name: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash | 0;
}
