// Study model of a two-room apartment (10 m × 7 m, metres, centred on the
// origin): living and dining on the west, bedroom on the east, entrance on
// the south. Every piece is a simple solid so it reads as a clay model.

export const CEILING = 2.6;
export const WALL_THICKNESS = 0.16;

export type Part =
  | { shape: "box"; position: [number, number, number]; size: [number, number, number] }
  | { shape: "cylinder"; position: [number, number, number]; radius: number; height: number }
  | { shape: "sphere"; position: [number, number, number]; radius: number };

type Vec3 = [number, number, number];

const box = (position: Vec3, size: Vec3): Part => ({ shape: "box", position, size });
const cylinder = (position: Vec3, radius: number, height: number): Part => ({ shape: "cylinder", position, radius, height });
const sphere = (position: Vec3, radius: number): Part => ({ shape: "sphere", position, radius });

// [x1, z1, x2, z2, from, to]: from/to are fractions of the ceiling height,
// so short pieces are window sills and lintels.
const WALLS: [number, number, number, number, number, number][] = [
  [-5, -3.5, -1.6, -3.5, 0, 1], [-1.6, -3.5, 0.2, -3.5, 0, 0.35], [-1.6, -3.5, 0.2, -3.5, 0.82, 1], [0.2, -3.5, 5, -3.5, 0, 1],
  [5, -3.5, 5, -1.2, 0, 1], [5, -1.2, 5, 0.8, 0, 0.35], [5, -1.2, 5, 0.8, 0.82, 1], [5, 0.8, 5, 3.5, 0, 1],
  [5, 3.5, -2.2, 3.5, 0, 1], [-2.2, 3.5, -3.2, 3.5, 0.8, 1], [-3.2, 3.5, -5, 3.5, 0, 1],
  [-5, 3.5, -5, -3.5, 0, 1],
  [1.5, -3.5, 1.5, 0.3, 0, 1], [1.5, 0.3, 1.5, 1.4, 0.8, 1], [1.5, 1.4, 1.5, 3.5, 0, 1],
];

const walls: Part[] = WALLS.map(([x1, z1, x2, z2, from, to]) => {
  const length = Math.hypot(x2 - x1, z2 - z1) + WALL_THICKNESS;
  const y0 = from * CEILING;
  const y1 = to * CEILING;
  const alongX = Math.abs(x2 - x1) > Math.abs(z2 - z1);
  return box(
    [(x1 + x2) / 2, (y0 + y1) / 2, (z1 + z2) / 2],
    alongX ? [length, y1 - y0, WALL_THICKNESS] : [WALL_THICKNESS, y1 - y0, length],
  );
});

const legs = (x: number, z: number, dx: number, dz: number, height: number, t = 0.05) =>
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => box([x + a * dx, height / 2, z + b * dz], [t, height, t]));

const chair = (x: number, z: number, backSide: 1 | -1) => [
  box([x, 0.45, z], [0.44, 0.05, 0.44]),
  box([x, 0.72, z + backSide * 0.2], [0.44, 0.5, 0.04]),
  ...legs(x, z, 0.18, 0.18, 0.43, 0.04),
];

const furniture: Part[] = [
  // Living room
  box([-2.4, 0.01, 0.6], [3.2, 0.02, 2.4]),
  box([-4.4, 0.22, 0.6], [0.9, 0.44, 2.4]),
  box([-4.78, 0.6, 0.6], [0.22, 0.6, 2.4]),
  box([-4.4, 0.3, -0.5], [0.9, 0.6, 0.2]),
  box([-4.4, 0.3, 1.7], [0.9, 0.6, 0.2]),
  box([-4.3, 0.5, 0.0], [0.7, 0.12, 0.72]),
  box([-4.3, 0.5, 0.6], [0.7, 0.12, 0.72]),
  box([-4.3, 0.5, 1.2], [0.7, 0.12, 0.72]),
  box([-2.7, 0.38, 0.6], [1.2, 0.05, 0.7]),
  box([-2.7, 0.18, 0.6], [0.9, 0.36, 0.45]),
  box([-1.0, 0.22, 0.6], [0.8, 0.44, 0.8]),
  box([-0.68, 0.62, 0.6], [0.16, 0.6, 0.8]),
  box([-3.2, 0.4, -3.18], [2.0, 0.8, 0.45]),
  box([-3.2, 0.815, -3.18], [2.04, 0.03, 0.48]),
  sphere([-2.6, 0.95, -3.18], 0.12),
  cylinder([-4.55, 0.22, -3.0], 0.25, 0.44),
  sphere([-4.55, 0.9, -3.0], 0.42),
  cylinder([-4.5, 0.02, 2.3], 0.18, 0.04),
  cylinder([-4.5, 0.8, 2.3], 0.015, 1.56),
  cylinder([-4.5, 1.55, 2.3], 0.24, 0.32),
  box([1.3, 1.0, -2.3], [0.32, 2.0, 1.6]),
  // Dining
  box([-0.7, 0.74, -2.0], [1.8, 0.05, 0.9]),
  ...legs(-0.7, -2.0, 0.8, 0.38, 0.72, 0.06),
  ...chair(-1.15, -2.75, -1),
  ...chair(-0.25, -2.75, -1),
  ...chair(-1.15, -1.25, 1),
  ...chair(-0.25, -1.25, 1),
  cylinder([-0.7, 2.3, -2.0], 0.01, 0.6),
  cylinder([-0.7, 1.92, -2.0], 0.28, 0.22),
  // Bedroom
  box([3.4, 0.01, 2.0], [2.6, 0.02, 2.6]),
  box([3.85, 0.18, 2.0], [2.0, 0.36, 1.7]),
  box([3.82, 0.44, 2.0], [1.9, 0.18, 1.6]),
  box([3.45, 0.56, 2.0], [1.25, 0.07, 1.66]),
  box([4.5, 0.6, 1.58], [0.36, 0.14, 0.62]),
  box([4.5, 0.6, 2.42], [0.36, 0.14, 0.62]),
  box([4.86, 0.6, 2.0], [0.1, 1.2, 1.8]),
  box([4.6, 0.25, 0.75], [0.42, 0.5, 0.4]),
  cylinder([4.6, 0.62, 0.75], 0.12, 0.22),
  box([4.6, 0.25, 3.2], [0.42, 0.5, 0.4]),
  cylinder([4.6, 0.62, 3.2], 0.12, 0.22),
  box([1.88, 1.05, -2.55], [0.6, 2.1, 1.7]),
  box([4.6, 0.74, -0.2], [0.6, 0.04, 1.3]),
  box([4.6, 0.36, -0.8], [0.5, 0.72, 0.04]),
  box([4.6, 0.36, 0.4], [0.5, 0.72, 0.04]),
  box([4.0, 0.46, -0.2], [0.44, 0.05, 0.44]),
  box([3.78, 0.72, -0.2], [0.04, 0.5, 0.44]),
  box([4.0, 0.22, -0.2], [0.06, 0.44, 0.06]),
];

const floor = box([0, -0.05, 0], [10 + WALL_THICKNESS, 0.1, 7 + WALL_THICKNESS]);

export const APARTMENT: Part[] = [floor, ...walls, ...furniture];
