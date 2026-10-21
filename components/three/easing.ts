export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Maps `p` from the [start, end] window to 0 → 1. */
export const range = (p: number, start: number, end: number) => clamp01((p - start) / (end - start));

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
