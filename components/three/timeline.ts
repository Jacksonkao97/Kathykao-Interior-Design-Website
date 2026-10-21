// Scroll windows (0 → 1 of the story section) for each phase of the scene.
// Text steps on the page line up with these: sketch, plan, build, furnish, light.
export const TIMELINE = {
  draw: [0.02, 0.32],
  rise: [0.34, 0.52],
  camera: [0.3, 0.62],
  floor: [0.42, 0.62],
  grid: [0.36, 0.56],
  furnish: [0.58, 0.84],
  light: [0.8, 0.98],
} as const;
