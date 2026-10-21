// Floor plan used by the home page story. Units are metres; the plan is
// centred on the origin with +z pointing toward the viewer in the 3D view.

export type Wall = {
  from: [number, number];
  to: [number, number];
  /** Fraction of full wall height; window sills are short walls. */
  height?: number;
};

export const WALL_HEIGHT = 2.6;
export const WALL_THICKNESS = 0.16;
export const PLAN_SIZE = { width: 10, depth: 7 };

export const walls: Wall[] = [
  // North wall with a window to the living room
  { from: [-5, -3.5], to: [-1.6, -3.5] },
  { from: [-1.6, -3.5], to: [0.2, -3.5], height: 0.35 },
  { from: [0.2, -3.5], to: [5, -3.5] },
  // East wall with a bedroom window
  { from: [5, -3.5], to: [5, -1.2] },
  { from: [5, -1.2], to: [5, 0.8], height: 0.35 },
  { from: [5, 0.8], to: [5, 3.5] },
  // South wall with the entrance
  { from: [5, 3.5], to: [-2.2, 3.5] },
  { from: [-3.2, 3.5], to: [-5, 3.5] },
  // West wall
  { from: [-5, 3.5], to: [-5, -3.5] },
  // Bedroom partition with a door
  { from: [1.5, -3.5], to: [1.5, 0.3] },
  { from: [1.5, 1.4], to: [1.5, 3.5] },
];
