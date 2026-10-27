"use client";

import { RoundedBoxGeometry } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { APARTMENT, type Part, type Tone } from "./apartment";

const TURN_SPEED = 0.06; // radians per second when nobody is dragging
const DRAG_SPEED = 0.008; // radians per pixel dragged

const TONES: Record<Tone, THREE.MeshStandardMaterialParameters> = {
  wall: { color: "#ece8e1", roughness: 0.95 },
  floor: { color: "#d6cec2", roughness: 1 },
  soft: { color: "#e3dccf", roughness: 1 },
  wood: { color: "#cdbfac", roughness: 0.85 },
  glass: {
    color: "#dfe7e8",
    roughness: 0.1,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  },
  leaf: { color: "#c3c7ae", roughness: 1 },
};

function Piece({ part, material }: { part: Part; material: THREE.Material }) {
  const glass = part.tone === "glass";
  return (
    <mesh
      position={part.position}
      rotation={part.rotation}
      material={material}
      castShadow={!glass}
      receiveShadow={!glass}
    >
      {part.shape === "box" &&
        (part.round ? (
          <RoundedBoxGeometry
            args={part.size}
            radius={Math.min(part.round, Math.min(...part.size) / 2 - 0.001)}
            smoothness={3}
          />
        ) : (
          <boxGeometry args={part.size} />
        ))}
      {part.shape === "cylinder" && (
        <cylinderGeometry args={[part.radiusTop ?? part.radius, part.radius, part.height, 32]} />
      )}
      {part.shape === "sphere" && <icosahedronGeometry args={[part.radius, 3]} />}
    </mesh>
  );
}

/**
 * Turns the model under a fixed sun, so shadows sweep across the rooms as
 * it goes round, and lets visitors drag it. Pointer events come straight
 * from the canvas so vertical swipes still scroll the page.
 */
function Turntable({ still, children }: { still: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const canvas = useThree((s) => s.gl.domElement);
  const size = useThree((s) => s.size);
  const turn = useRef({ angle: -0.75, velocity: 0, dragging: false, lastX: 0 });

  useEffect(() => {
    const t = turn.current;
    const down = (e: PointerEvent) => {
      t.dragging = true;
      t.lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!t.dragging) return;
      const dx = e.clientX - t.lastX;
      t.lastX = e.clientX;
      t.angle += dx * DRAG_SPEED;
      t.velocity = dx * 0.4;
    };
    const up = () => (t.dragging = false);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [canvas]);

  useFrame((_, delta) => {
    const t = turn.current;
    const dt = Math.min(delta, 0.05);
    if (!t.dragging) {
      t.angle += (still ? 0 : TURN_SPEED) * dt + t.velocity * dt;
      t.velocity *= 0.92;
    }
    if (group.current) group.current.rotation.y = t.angle;
    // Pull back on narrow screens so the whole flat stays in frame.
    const distance = 27 * Math.max(1, 1.25 / (size.width / size.height));
    camera.position.set(0, distance * 0.8, distance * 0.6);
    camera.lookAt(0, -0.2, 0);
  });

  return <group ref={group}>{children}</group>;
}

/** Clay-and-card study model of the featured apartment. */
export default function ClayModel({
  active,
  still,
  onReady,
}: {
  active: boolean;
  still: boolean;
  onReady?: () => void;
}) {
  const materials = useMemo(() => {
    const byTone = {} as Record<Tone, THREE.Material>;
    for (const tone of Object.keys(TONES) as Tone[]) byTone[tone] = new THREE.MeshStandardMaterial(TONES[tone]);
    return byTone;
  }, []);

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 28, near: 0.1, far: 100, position: [0, 17, 19] }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => onReady?.()}
      style={{ touchAction: "pan-y", cursor: "grab" }}
      aria-hidden
    >
      <hemisphereLight args={["#fffaf2", "#bfb5a6", 1.7]} />
      <directionalLight
        position={[-8, 11, 5]}
        intensity={8}
        color="#fff1e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={5}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
      {/* Cool fill from the other side so shaded walls keep some form. */}
      <directionalLight position={[7, 6, -6]} intensity={0.9} color="#e8eef5" />
      <Turntable still={still}>
        {APARTMENT.map((part, i) => (
          <Piece key={i} part={part} material={materials[part.tone]} />
        ))}
      </Turntable>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.1} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
    </Canvas>
  );
}
