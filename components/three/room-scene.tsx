"use client";

import { Line, PerformanceMonitor, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import type { Line2, LineSegments2 } from "three-stdlib";

import { useStoryStore } from "@/lib/store";

import { easeInOut, easeOutBack, range } from "./easing";
import { PLAN_SIZE, WALL_HEIGHT, WALL_THICKNESS, walls } from "./plan";
import { TIMELINE } from "./timeline";

type Progress = RefObject<number>;

const COLORS = {
  ink: new THREE.Color("#2c4a6b"),
  plaster: new THREE.Color("#efe8dc"),
  // Matches the page background so the sheet blends into the page.
  paper: new THREE.Color("#f5f0e8"),
  oak: new THREE.Color("#c9a57e"),
  sunNeutral: new THREE.Color("#ffffff"),
  sunWarm: new THREE.Color("#ffd6a3"),
};

const lerp = THREE.MathUtils.lerp;

const INTRO_PROGRESS = 0.12;
const INTRO_SECONDS = 2.5;

/**
 * Smooths the raw scroll progress so the scene eases between positions. On
 * first load it also sketches the first few lines by itself so the hero is
 * never an empty sheet.
 */
function ProgressDriver({ progress }: { progress: Progress }) {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    elapsed.current += dt;
    const intro = easeInOut(Math.min(1, elapsed.current / INTRO_SECONDS)) * INTRO_PROGRESS;
    const target = Math.max(useStoryStore.getState().progress, intro);
    progress.current = THREE.MathUtils.damp(progress.current, target, 5, dt);
  });
  return null;
}

// Box around the furnished room that the camera keeps in frame.
const FRAME_CORNERS = [-1, 1].flatMap((x) =>
  [0, WALL_HEIGHT].flatMap((y) =>
    [-1, 1].map((z) => new THREE.Vector3(x * (PLAN_SIZE.width / 2 + 0.5), y, z * (PLAN_SIZE.depth / 2 + 0.5))),
  ),
);
const TOP_DIR = new THREE.Vector3(0, 1, 0.0001).normalize();
const ANGLED_DIR = new THREE.Vector3(0.62, 0.66, 0.85).normalize();

function CameraRig({ progress }: { progress: Progress }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const v = useMemo(
    () => ({
      dir: new THREE.Vector3(),
      target: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      rel: new THREE.Vector3(),
    }),
    [],
  );
  const offsetKey = useRef("");

  useFrame(() => {
    const { width, height } = size;
    const aspect = width / height;
    const wide = aspect > 1.1;
    // Wide screens: story text sits on the left, so frame the room to the
    // right. Narrow screens: text cards sit at the bottom, so lift the room.
    const shiftX = wide ? 0.16 : 0;
    const shiftY = wide ? 0 : 0.14;
    const key = `${width}x${height}`;
    if (offsetKey.current !== key) {
      offsetKey.current = key;
      camera.setViewOffset(width, height, -shiftX * width, shiftY * height, width, height);
    }

    const t = easeInOut(range(progress.current, ...TIMELINE.camera));
    v.target.set(0, lerp(0, 0.6, t), 0);
    v.dir.lerpVectors(TOP_DIR, ANGLED_DIR, t).normalize();

    // Aim from unit distance to get the view basis, then back off until every
    // corner of the room fits inside the usable part of the frame.
    camera.position.copy(v.target).add(v.dir);
    camera.lookAt(v.target);
    camera.updateMatrixWorld();
    v.right.setFromMatrixColumn(camera.matrixWorld, 0);
    v.up.setFromMatrixColumn(camera.matrixWorld, 1);
    v.forward.setFromMatrixColumn(camera.matrixWorld, 2).negate();

    const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const tanX = tanY * aspect;
    const usableX = (1 - 2 * shiftX) * (wide ? 0.78 : 0.88);
    const usableY = (1 - 2 * shiftY) * 0.88;
    let dist = 0;
    for (const corner of FRAME_CORNERS) {
      v.rel.subVectors(corner, v.target);
      const depth = v.rel.dot(v.forward);
      dist = Math.max(
        dist,
        Math.abs(v.rel.dot(v.right)) / (tanX * usableX) - depth,
        Math.abs(v.rel.dot(v.up)) / (tanY * usableY) - depth,
      );
    }
    camera.position.copy(v.target).addScaledVector(v.dir, dist);
  });

  return null;
}

/** Walls start as ink lines drawn on paper, then rise into 3D. */
function Walls({ progress }: { progress: Progress }) {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.ink, roughness: 0.95 }), []);
  const data = useMemo(
    () =>
      walls.map((w) => {
        const dx = w.to[0] - w.from[0];
        const dz = w.to[1] - w.from[1];
        const length = Math.hypot(dx, dz);
        return { ...w, length, dir: [dx / length, dz / length] as const, angle: -Math.atan2(dz, dx) };
      }),
    [],
  );

  useFrame(() => {
    const p = progress.current;
    const [drawStart, drawEnd] = TIMELINE.draw;
    const span = drawEnd - drawStart;
    const slot = (span / data.length) * 2.2;
    const rise = easeInOut(range(p, ...TIMELINE.rise));
    material.color.copy(COLORS.ink).lerp(COLORS.plaster, rise);

    data.forEach((w, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const start = drawStart + ((span - slot) * i) / (data.length - 1);
      const drawn = easeInOut(range(p, start, start + slot));
      mesh.visible = drawn > 0.001;
      if (!mesh.visible) return;
      const len = w.length * drawn + WALL_THICKNESS;
      const height = lerp(0.03, WALL_HEIGHT * (w.height ?? 1), rise);
      mesh.scale.set(len, height, lerp(0.07, WALL_THICKNESS, rise));
      const along = (w.length * drawn) / 2;
      mesh.position.set(w.from[0] + w.dir[0] * along, height / 2, w.from[1] + w.dir[1] * along);
    });
  });

  return (
    <group>
      {data.map((w, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          rotation-y={w.angle}
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

function arc(cx: number, cz: number, radius: number, from: number, to: number) {
  const points: [number, number, number][] = [[cx, 0.02, cz]];
  for (let i = 0; i <= 16; i++) {
    const a = from + ((to - from) * i) / 16;
    points.push([cx + Math.cos(a) * radius, 0.02, cz + Math.sin(a) * radius]);
  }
  points.push([cx, 0.02, cz]);
  return points;
}

/** Blueprint annotations: grid, door swings, dimension line. Fade out as walls rise. */
function Annotations({ progress }: { progress: Progress }) {
  const grid = useMemo(() => {
    const helper = new THREE.GridHelper(14, 28, "#2c4a6b", "#9fb3c8");
    const mat = helper.material as THREE.Material;
    mat.transparent = true;
    mat.depthWrite = false;
    return helper;
  }, []);
  const lines = useRef<(Line2 | LineSegments2 | null)[]>([]);
  const doors = useMemo(
    () => [arc(-3.2, 3.5, 1, -Math.PI / 2, 0), arc(1.5, 0.3, 1.1, 0, Math.PI / 2)],
    [],
  );
  const dimension = useMemo(
    () =>
      [
        [-5, 0.02, 4.3],
        [5, 0.02, 4.3],
      ] as [number, number, number][],
    [],
  );

  useFrame(() => {
    const p = progress.current;
    const shown = range(p, 0.08, 0.2) * (1 - range(p, ...TIMELINE.grid));
    (grid.material as THREE.Material).opacity = (1 - range(p, ...TIMELINE.grid)) * 0.55;
    grid.visible = (grid.material as THREE.Material).opacity > 0.01;
    for (const line of lines.current) {
      if (!line) continue;
      line.material.opacity = shown;
      line.visible = shown > 0.01;
    }
  });

  return (
    <group>
      <primitive object={grid} position={[0, 0.003, 0]} />
      {[...doors, dimension].map((points, i) => (
        <Line
          key={i}
          ref={(el) => {
            lines.current[i] = el;
          }}
          points={points}
          color="#2c4a6b"
          lineWidth={1.2}
          dashed={i < doors.length}
          dashSize={0.12}
          gapSize={0.08}
          transparent
        />
      ))}
    </group>
  );
}

function Floor({ progress }: { progress: Progress }) {
  const floor = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.paper, roughness: 0.85 }), []);

  useFrame(() => {
    const t = easeInOut(range(progress.current, ...TIMELINE.floor));
    floor.color.copy(COLORS.paper).lerp(COLORS.oak, t);
  });

  return (
    <mesh rotation-x={-Math.PI / 2} material={floor} receiveShadow>
      <planeGeometry args={[PLAN_SIZE.width, PLAN_SIZE.depth]} />
    </mesh>
  );
}

function useMaterials() {
  return useMemo(() => {
    const m = (color: string, roughness = 0.8) => new THREE.MeshStandardMaterial({ color, roughness });
    return {
      fabric: m("#d8c9b2", 1),
      linen: m("#f1ebe0", 1),
      wood: m("#8a6a4a", 0.6),
      darkWood: m("#5b4633", 0.6),
      rug: m("#b8a58a", 1),
      green: m("#6c8a5b", 0.9),
      terracotta: m("#b5643c", 0.9),
      metal: m("#2b2a28", 0.4),
    };
  }, []);
}

type Placement = { position: [number, number, number]; rotation?: number };

/** Drops a piece of furniture into place at its slot in the furnish phase. */
function Appear({
  progress,
  index,
  total,
  position,
  rotation = 0,
  children,
}: Placement & { progress: Progress; index: number; total: number; children: ReactNode }) {
  const inner = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = inner.current;
    if (!g) return;
    const [s, e] = TIMELINE.furnish;
    const slot = (e - s) * 0.32;
    const start = s + ((e - s - slot) * index) / Math.max(1, total - 1);
    const t = range(progress.current, start, start + slot);
    g.visible = t > 0;
    g.scale.setScalar(Math.max(0.0001, easeOutBack(t)));
    g.position.y = (1 - easeInOut(t)) * 0.8;
  });

  return (
    <group position={position} rotation-y={rotation}>
      <group ref={inner}>{children}</group>
    </group>
  );
}

function Furniture({ progress, lampShade }: { progress: Progress; lampShade: THREE.MeshStandardMaterial }) {
  const mat = useMaterials();

  const pieces: (Placement & { node: ReactNode })[] = [
    {
      position: [-2.1, 0, 1.1],
      node: (
        <mesh material={mat.rug} position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[3.4, 0.02, 2.4]} />
        </mesh>
      ),
    },
    {
      position: [-2.1, 0, 2.75],
      node: (
        <group>
          <RoundedBox args={[2.5, 0.42, 0.95]} radius={0.08} position={[0, 0.21, 0]} material={mat.fabric} castShadow />
          <RoundedBox args={[2.5, 0.55, 0.22]} radius={0.08} position={[0, 0.6, 0.36]} material={mat.fabric} castShadow />
          <RoundedBox args={[0.22, 0.6, 0.95]} radius={0.08} position={[-1.25, 0.3, 0]} material={mat.fabric} castShadow />
          <RoundedBox args={[0.22, 0.6, 0.95]} radius={0.08} position={[1.25, 0.3, 0]} material={mat.fabric} castShadow />
        </group>
      ),
    },
    {
      position: [-2.1, 0, 1.0],
      node: (
        <mesh material={mat.wood} position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 40]} />
        </mesh>
      ),
    },
    {
      position: [-4.1, 0, 0.6],
      rotation: Math.PI / 2.4,
      node: (
        <group>
          <RoundedBox args={[0.9, 0.42, 0.85]} radius={0.08} position={[0, 0.21, 0]} material={mat.terracotta} castShadow />
          <RoundedBox args={[0.9, 0.5, 0.18]} radius={0.07} position={[0, 0.6, 0.34]} material={mat.terracotta} castShadow />
        </group>
      ),
    },
    {
      position: [-2.4, 0, -2.1],
      node: (
        <group>
          <mesh material={mat.darkWood} position={[0, 0.74, 0]} castShadow>
            <boxGeometry args={[1.8, 0.05, 0.95]} />
          </mesh>
          {[
            [-0.8, -0.38],
            [0.8, -0.38],
            [-0.8, 0.38],
            [0.8, 0.38],
          ].map(([x, z], i) => (
            <mesh key={i} material={mat.darkWood} position={[x, 0.36, z]} castShadow>
              <boxGeometry args={[0.06, 0.72, 0.06]} />
            </mesh>
          ))}
          {[-0.45, 0.45].flatMap((x) =>
            [-0.75, 0.75].map((z) => (
              <group key={`${x}${z}`} position={[x, 0, z]} rotation-y={z > 0 ? Math.PI : 0}>
                <mesh material={mat.linen} position={[0, 0.45, 0]} castShadow>
                  <boxGeometry args={[0.45, 0.06, 0.45]} />
                </mesh>
                <mesh material={mat.linen} position={[0, 0.72, -0.2]} castShadow>
                  <boxGeometry args={[0.45, 0.5, 0.05]} />
                </mesh>
                <mesh material={mat.wood} position={[0, 0.21, 0]}>
                  <boxGeometry args={[0.36, 0.42, 0.36]} />
                </mesh>
              </group>
            )),
          )}
        </group>
      ),
    },
    {
      position: [3.3, 0, -2.25],
      node: (
        <group>
          <RoundedBox args={[1.9, 0.45, 2.1]} radius={0.06} position={[0, 0.225, 0]} material={mat.wood} castShadow />
          <RoundedBox args={[1.8, 0.2, 1.9]} radius={0.08} position={[0, 0.52, 0.05]} material={mat.linen} castShadow />
          <RoundedBox args={[1.9, 0.9, 0.1]} radius={0.04} position={[0, 0.45, -1.05]} material={mat.darkWood} castShadow />
          <RoundedBox args={[0.6, 0.14, 0.38]} radius={0.06} position={[-0.42, 0.68, -0.72]} material={mat.fabric} />
          <RoundedBox args={[0.6, 0.14, 0.38]} radius={0.06} position={[0.42, 0.68, -0.72]} material={mat.fabric} />
          <RoundedBox args={[1.84, 0.06, 0.9]} radius={0.03} position={[0, 0.64, 0.5]} material={mat.terracotta} />
        </group>
      ),
    },
    {
      position: [4.55, 0, 2.3],
      node: (
        <mesh material={mat.darkWood} position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.6, 2.1, 1.8]} />
        </mesh>
      ),
    },
    {
      position: [0.8, 0, 3.0],
      node: <Plant pot={mat.terracotta} leaves={mat.green} scale={1} />,
    },
    {
      position: [-4.5, 0, -3.0],
      node: <Plant pot={mat.linen} leaves={mat.green} scale={1.25} />,
    },
    {
      position: [-3.75, 0, 2.95],
      node: (
        <group>
          <mesh material={mat.metal} position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.04, 24]} />
          </mesh>
          <mesh material={mat.metal} position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.6, 8]} />
          </mesh>
          <mesh material={lampShade} position={[0, 1.62, 0]}>
            <cylinderGeometry args={[0.16, 0.24, 0.3, 32, 1, true]} />
          </mesh>
        </group>
      ),
    },
  ];

  return (
    <group>
      {pieces.map(({ node, ...placement }, i) => (
        <Appear key={i} progress={progress} index={i} total={pieces.length} {...placement}>
          {node}
        </Appear>
      ))}
    </group>
  );
}

function Plant({ pot, leaves, scale }: { pot: THREE.Material; leaves: THREE.Material; scale: number }) {
  return (
    <group scale={scale}>
      <mesh material={pot} position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 24]} />
      </mesh>
      <mesh material={leaves} position={[0, 0.7, 0]} castShadow>
        <icosahedronGeometry args={[0.38, 1]} />
      </mesh>
      <mesh material={leaves} position={[0.12, 1.0, 0.05]} castShadow>
        <icosahedronGeometry args={[0.24, 1]} />
      </mesh>
    </group>
  );
}

function Lights({
  progress,
  lampShade,
}: {
  progress: Progress;
  lampShade: THREE.MeshStandardMaterial;
}) {
  const ambient = useRef<THREE.AmbientLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const lamp = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const p = progress.current;
    const built = easeInOut(range(p, ...TIMELINE.rise));
    const lit = easeInOut(range(p, ...TIMELINE.light));
    if (ambient.current) ambient.current.intensity = lerp(2.4, 0.9, built) - lit * 0.25;
    if (sun.current) {
      sun.current.intensity = lerp(0.4, 2.2, built);
      sun.current.color.copy(COLORS.sunNeutral).lerp(COLORS.sunWarm, lit);
    }
    if (lamp.current) lamp.current.intensity = lit * 6;
    lampShade.emissiveIntensity = lit * 1.2;
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={2.4} />
      <hemisphereLight args={["#fff8ee", "#c9b59a", 0.5]} />
      <directionalLight
        ref={sun}
        position={[7, 11, 5]}
        intensity={0.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
        shadow-radius={4}
      />
      <pointLight ref={lamp} position={[-3.75, 1.5, 2.95]} color="#ffbe7a" distance={6} decay={1.6} intensity={0} />
    </>
  );
}

function Scene() {
  const progress = useRef(useStoryStore.getState().progress);
  const lampShade = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#fff3df", emissive: "#ffcf8a", emissiveIntensity: 0 }),
    [],
  );

  return (
    <>
      <ProgressDriver progress={progress} />
      <CameraRig progress={progress} />
      <Lights progress={progress} lampShade={lampShade} />
      <Floor progress={progress} />
      <Annotations progress={progress} />
      <Walls progress={progress} />
      <Furniture progress={progress} lampShade={lampShade} />
    </>
  );
}

export default function RoomScene({ active, onReady }: { active: boolean; onReady?: () => void }) {
  const [dpr, setDpr] = useState(1.5);

  return (
    <Canvas
      // three r18x removed PCFSoftShadowMap, which `shadows={true}` asks for;
      // PCF with a blur radius on the light gives the same soft edges.
      shadows="percentage"
      flat
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 35, near: 0.1, far: 200, position: [0, 20, 0.001] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))} />
      <Scene />
    </Canvas>
  );
}
