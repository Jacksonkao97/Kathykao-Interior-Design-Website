// Study model of a two-room apartment (10 m × 7 m, metres, centred on the
// origin): living, dining and a galley kitchen on the west, bedroom on the
// east, entrance on the south. Every piece is a simple solid so it reads as
// a card-and-clay architect's model, in a few soft tones.

export const CEILING = 2.6;
export const WALL_THICKNESS = 0.16;

type Vec3 = [number, number, number];

/** Model materials: white walls, a darker floor, textiles, timber, glass and plants. */
export type Tone = "wall" | "floor" | "soft" | "wood" | "glass" | "leaf";

type Common = { position: Vec3; rotation?: Vec3; tone: Tone };

export type Part =
  | (Common & { shape: "box"; size: Vec3; round?: number })
  | (Common & {
      shape: "cylinder";
      radius: number;
      radiusTop?: number;
      height: number;
    })
  | (Common & { shape: "sphere"; radius: number });

const box = (tone: Tone, position: Vec3, size: Vec3, round = 0, rotation?: Vec3): Part => ({
  shape: "box",
  tone,
  position,
  size,
  round,
  rotation,
});
const cylinder = (
  tone: Tone,
  position: Vec3,
  radius: number,
  height: number,
  radiusTop = radius,
  rotation?: Vec3,
): Part => ({
  shape: "cylinder",
  tone,
  position,
  radius,
  radiusTop,
  height,
  rotation,
});
const sphere = (tone: Tone, position: Vec3, radius: number): Part => ({
  shape: "sphere",
  tone,
  position,
  radius,
});

// [x1, z1, x2, z2, from, to]: from/to are fractions of the ceiling height,
// so short pieces are window sills and lintels.
const WALLS: [number, number, number, number, number, number][] = [
  [-5, -3.5, -1.6, -3.5, 0, 1],
  [-1.6, -3.5, 0.2, -3.5, 0, 0.35],
  [-1.6, -3.5, 0.2, -3.5, 0.82, 1],
  [0.2, -3.5, 5, -3.5, 0, 1],
  [5, -3.5, 5, -1.2, 0, 1],
  [5, -1.2, 5, 0.8, 0, 0.35],
  [5, -1.2, 5, 0.8, 0.82, 1],
  [5, 0.8, 5, 3.5, 0, 1],
  [5, 3.5, -2.2, 3.5, 0, 1],
  [-2.2, 3.5, -3.2, 3.5, 0.8, 1],
  [-3.2, 3.5, -5, 3.5, 0, 1],
  [-5, 3.5, -5, -3.5, 0, 1],
  [1.5, -3.5, 1.5, 0.3, 0, 1],
  [1.5, 0.3, 1.5, 1.4, 0.8, 1],
  [1.5, 1.4, 1.5, 3.5, 0, 1],
];

const walls: Part[] = WALLS.map(([x1, z1, x2, z2, from, to]) => {
  const length = Math.hypot(x2 - x1, z2 - z1) + WALL_THICKNESS;
  const y0 = from * CEILING;
  const y1 = to * CEILING;
  const alongX = Math.abs(x2 - x1) > Math.abs(z2 - z1);
  return box(
    "wall",
    [(x1 + x2) / 2, (y0 + y1) / 2, (z1 + z2) / 2],
    alongX ? [length, y1 - y0, WALL_THICKNESS] : [WALL_THICKNESS, y1 - y0, length],
  );
});

const SILL = 0.35 * CEILING;
const HEAD = 0.82 * CEILING;
const DOOR = 0.8 * CEILING;

/** Window frame, glazing bar and pane for an opening in a wall along X or Z. */
function windowIn(alongX: boolean, wall: number, from: number, to: number): Part[] {
  const mid = (from + to) / 2;
  const span = to - from;
  const h = HEAD - SILL;
  const y = (SILL + HEAD) / 2;
  const at = (along: number, across: number, yy: number): Vec3 => (alongX ? [along, yy, across] : [across, yy, along]);
  const size = (along: number, across: number, height: number): Vec3 =>
    alongX ? [along, height, across] : [across, height, along];
  const inward = wall > 0 ? -1 : 1;
  return [
    box("wood", at(mid, wall + inward * 0.1, SILL + 0.02), size(span + 0.1, 0.24, 0.04), 0.008),
    box("wood", at(from + 0.03, wall, y), size(0.06, 0.1, h)),
    box("wood", at(to - 0.03, wall, y), size(0.06, 0.1, h)),
    box("wood", at(mid, wall, HEAD - 0.03), size(span, 0.1, 0.06)),
    box("wood", at(mid, wall, y), size(0.05, 0.08, h)),
    box("glass", at(mid, wall, y), size(span - 0.06, 0.02, h - 0.06)),
  ];
}

/** Floor-length pleated curtain: a row of slim upright cylinders. */
function curtain(x0: number, x1: number, z: number): Part[] {
  const folds = Math.round((x1 - x0) / 0.085);
  return Array.from({ length: folds }, (_, i) =>
    cylinder("soft", [x0 + (i + 0.5) * ((x1 - x0) / folds), 1.21, z + (i % 2 ? 0.03 : -0.03)], 0.045, 2.38),
  );
}

/** A door leaf hinged at (x, z), opened so it points along `angle` (radians, three.js Y rotation). */
function door(x: number, z: number, angle: number, width: number): Part {
  const half = width / 2;
  return box(
    "wood",
    [x + Math.cos(angle) * half, DOOR / 2 - 0.02, z - Math.sin(angle) * half],
    [width, DOOR - 0.04, 0.04],
    0.01,
    [0, angle, 0],
  );
}

const legs = (x: number, z: number, dx: number, dz: number, height: number, t = 0.05) =>
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].map(([a, b]) => box("wood", [x + a * dx, height / 2, z + b * dz], [t, height, t]));

const chair = (x: number, z: number, backSide: 1 | -1) => [
  box("wood", [x, 0.45, z], [0.44, 0.05, 0.44], 0.015),
  box("wood", [x, 0.72, z + backSide * 0.2], [0.44, 0.5, 0.04], 0.015),
  ...legs(x, z, 0.18, 0.18, 0.43, 0.04),
];

/** Pot with a loose cluster of foliage. */
const plant = (x: number, z: number, scale = 1): Part[] => [
  cylinder("soft", [x, 0.2 * scale, z], 0.2 * scale, 0.4 * scale, 0.25 * scale),
  sphere("leaf", [x, 0.72 * scale, z], 0.3 * scale),
  sphere("leaf", [x + 0.16 * scale, 0.98 * scale, z + 0.08 * scale], 0.24 * scale),
  sphere("leaf", [x - 0.12 * scale, 1.08 * scale, z - 0.1 * scale], 0.22 * scale),
  sphere("leaf", [x + 0.02 * scale, 1.3 * scale, z], 0.16 * scale),
];

/** Table lamp: stem and a tapered shade. */
const lamp = (x: number, y: number, z: number): Part[] => [
  cylinder("wood", [x, y + 0.01, z], 0.07, 0.02),
  cylinder("wood", [x, y + 0.12, z], 0.012, 0.22),
  cylinder("soft", [x, y + 0.3, z], 0.15, 0.2, 0.1),
];

const living: Part[] = [
  // Rug, sofa with cushions, coffee table and armchair
  box("soft", [-2.4, 0.01, 0.6], [3.2, 0.02, 2.4], 0.008),
  box("soft", [-4.4, 0.22, 0.6], [0.9, 0.44, 2.4], 0.04),
  box("soft", [-4.78, 0.6, 0.6], [0.22, 0.6, 2.4], 0.05),
  box("soft", [-4.4, 0.3, -0.5], [0.9, 0.6, 0.2], 0.05),
  box("soft", [-4.4, 0.3, 1.7], [0.9, 0.6, 0.2], 0.05),
  box("soft", [-4.3, 0.5, 0.0], [0.7, 0.12, 0.72], 0.05),
  box("soft", [-4.3, 0.5, 0.6], [0.7, 0.12, 0.72], 0.05),
  box("soft", [-4.3, 0.5, 1.2], [0.7, 0.12, 0.72], 0.05),
  box("soft", [-4.56, 0.76, -0.05], [0.16, 0.42, 0.42], 0.07, [0, 0, -0.2]),
  box("soft", [-4.56, 0.76, 1.3], [0.16, 0.42, 0.42], 0.07, [0, 0, -0.2]),
  box("wood", [-2.7, 0.38, 0.6], [1.2, 0.05, 0.7], 0.015),
  box("wood", [-2.7, 0.18, 0.6], [0.9, 0.36, 0.45], 0.01),
  box("wall", [-2.95, 0.43, 0.45], [0.32, 0.05, 0.24], 0.006),
  box("wall", [-2.93, 0.47, 0.46], [0.26, 0.03, 0.2], 0.006),
  cylinder("soft", [-2.4, 0.44, 0.75], 0.07, 0.07, 0.13),
  box("soft", [-1.0, 0.22, 0.6], [0.8, 0.44, 0.8], 0.06),
  box("soft", [-0.68, 0.62, 0.6], [0.16, 0.6, 0.8], 0.06),
  box("soft", [-1.0, 0.5, 0.25], [0.8, 0.14, 0.12], 0.05),
  box("soft", [-1.0, 0.5, 0.95], [0.8, 0.14, 0.12], 0.05),
  // Sideboard with vases and books under a framed print
  box("wood", [-3.2, 0.4, -3.18], [2.0, 0.8, 0.45], 0.01),
  box("wood", [-3.2, 0.815, -3.18], [2.04, 0.03, 0.48], 0.01),
  sphere("wall", [-2.6, 0.95, -3.18], 0.12),
  cylinder("wall", [-2.35, 0.98, -3.2], 0.05, 0.3, 0.035),
  box("wall", [-3.85, 0.86, -3.2], [0.36, 0.06, 0.26], 0.006),
  box("wall", [-3.85, 0.91, -3.2], [0.3, 0.04, 0.22], 0.006),
  box("wood", [-3.2, 1.65, -3.39], [1.0, 0.75, 0.03]),
  box("wall", [-3.2, 1.65, -3.37], [0.86, 0.61, 0.02]),
  // Art over the sofa, plant, floor lamp
  box("wood", [-4.9, 1.65, 0.6], [0.03, 0.8, 1.1]),
  box("wall", [-4.88, 1.65, 0.6], [0.02, 0.66, 0.96]),
  ...plant(-4.5, -2.95),
  cylinder("wood", [-4.5, 0.02, 2.3], 0.18, 0.04),
  cylinder("wood", [-4.5, 0.8, 2.3], 0.015, 1.56),
  cylinder("soft", [-4.5, 1.55, 2.3], 0.26, 0.32, 0.18),
  // Curtains either side of the north window
  ...curtain(-2.12, -1.64, -3.3),
  ...curtain(0.26, 0.7, -3.3),
  cylinder("wood", [-0.7, 2.44, -3.3], 0.015, 3.2, 0.015, [0, 0, Math.PI / 2]),
];

const dining: Part[] = [
  box("wood", [-0.9, 0.74, -2.0], [1.8, 0.05, 0.9], 0.015),
  ...legs(-0.9, -2.0, 0.8, 0.38, 0.72, 0.06),
  ...chair(-1.35, -2.75, -1),
  ...chair(-0.45, -2.75, -1),
  ...chair(-1.35, -1.25, 1),
  ...chair(-0.45, -1.25, 1),
  cylinder("wall", [-0.75, 0.8, -2.0], 0.06, 0.08, 0.16),
  cylinder("wall", [-1.25, 0.86, -1.95], 0.04, 0.2, 0.03),
  cylinder("wood", [-0.9, 2.3, -2.0], 0.01, 0.6),
  cylinder("soft", [-0.9, 1.9, -2.0], 0.32, 0.24, 0.08),
];

const kitchen: Part[] = [
  box("wood", [1.11, 0.42, -1.95], [0.62, 0.84, 2.9], 0.01),
  box("wall", [1.11, 0.86, -1.95], [0.66, 0.04, 2.94], 0.008),
  box("floor", [1.1, 0.885, -1.55], [0.4, 0.012, 0.5]),
  cylinder("wall", [1.34, 1.0, -1.55], 0.015, 0.26),
  box("wall", [1.27, 1.12, -1.55], [0.16, 0.02, 0.02]),
  box("floor", [1.1, 0.885, -2.6], [0.5, 0.012, 0.55]),
  box("wood", [1.26, 1.86, -2.35], [0.34, 0.7, 2.0], 0.01),
  box("wood", [1.3, 1.55, -0.9], [0.24, 0.03, 0.9], 0.005),
  cylinder("wall", [1.3, 1.64, -1.1], 0.05, 0.15, 0.06),
  cylinder("wall", [1.3, 1.62, -0.85], 0.07, 0.1, 0.07),
  box("wood", [1.11, 0.42, -3.36], [0.62, 0.84, 0.1]),
];

const entrance: Part[] = [
  door(-3.15, 3.42, (70 * Math.PI) / 180, 0.92),
  box("wood", [-1.55, 0.22, 3.22], [0.9, 0.44, 0.34], 0.015),
  box("wall", [-1.55, 1.45, 3.4], [0.6, 0.85, 0.02], 0.01),
];

const bedroom: Part[] = [
  box("soft", [3.4, 0.01, 2.0], [2.6, 0.02, 2.6], 0.008),
  box("wood", [3.85, 0.18, 2.0], [2.0, 0.36, 1.7], 0.015),
  box("soft", [3.82, 0.44, 2.0], [1.9, 0.18, 1.6], 0.06),
  box("soft", [3.45, 0.56, 2.0], [1.25, 0.07, 1.66], 0.03),
  box("soft", [3.0, 0.58, 2.0], [0.42, 0.08, 1.7], 0.035),
  box("soft", [4.5, 0.62, 1.58], [0.36, 0.14, 0.62], 0.06),
  box("soft", [4.5, 0.62, 2.42], [0.36, 0.14, 0.62], 0.06),
  box("wood", [4.86, 0.6, 2.0], [0.1, 1.2, 1.8], 0.02),
  box("wood", [4.9, 1.75, 2.0], [0.03, 0.6, 0.9]),
  box("wall", [4.88, 1.75, 2.0], [0.02, 0.48, 0.78]),
  box("wood", [4.6, 0.25, 0.75], [0.42, 0.5, 0.4], 0.01),
  ...lamp(4.6, 0.5, 0.75),
  box("wood", [4.6, 0.25, 3.2], [0.42, 0.5, 0.4], 0.01),
  ...lamp(4.6, 0.5, 3.2),
  box("wood", [2.62, 0.21, 2.0], [0.36, 0.42, 1.2], 0.015),
  // Wardrobe with door lines, desk and chair by the window, plant
  box("wood", [1.88, 1.05, -2.55], [0.6, 2.1, 1.7], 0.01),
  box("floor", [2.185, 1.05, -2.55], [0.01, 2.0, 0.012]),
  box("wood", [4.6, 0.74, -0.2], [0.6, 0.04, 1.3], 0.008),
  box("wood", [4.6, 0.36, -0.8], [0.5, 0.72, 0.04]),
  box("wood", [4.6, 0.36, 0.4], [0.5, 0.72, 0.04]),
  box("wall", [4.55, 0.77, -0.45], [0.3, 0.02, 0.22], 0.005),
  ...lamp(4.75, 0.76, 0.2),
  box("wood", [4.0, 0.46, -0.2], [0.44, 0.05, 0.44], 0.015),
  box("wood", [3.78, 0.72, -0.2], [0.04, 0.5, 0.44], 0.015),
  box("wood", [4.0, 0.22, -0.2], [0.06, 0.44, 0.06]),
  box("soft", [4.88, 1.88, -0.2], [0.03, 0.5, 1.9]),
  ...plant(4.55, -3.05, 0.85),
  door(1.58, 1.36, (15 * Math.PI) / 180, 1.0),
];

const floor = box("floor", [0, -0.05, 0], [10 + WALL_THICKNESS, 0.1, 7 + WALL_THICKNESS]);

export const APARTMENT: Part[] = [
  floor,
  ...walls,
  ...windowIn(true, -3.5, -1.6, 0.2),
  ...windowIn(false, 5, -1.2, 0.8),
  ...living,
  ...dining,
  ...kitchen,
  ...entrance,
  ...bedroom,
];
