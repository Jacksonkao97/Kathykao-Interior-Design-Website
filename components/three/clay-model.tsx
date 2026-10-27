"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { APARTMENT, type Part } from "./apartment";

const TURN_SPEED = 0.05; // radians per second when nobody is dragging
const DRAG_SPEED = 0.008; // radians per pixel dragged

function Piece({ part, material }: { part: Part; material: THREE.Material }) {
  return (
    <mesh position={part.position} material={material} castShadow receiveShadow>
      {part.shape === "box" && <boxGeometry args={part.size} />}
      {part.shape === "cylinder" && <cylinderGeometry args={[part.radius, part.radius, part.height, 28]} />}
      {part.shape === "sphere" && <icosahedronGeometry args={[part.radius, 2]} />}
    </mesh>
  );
}

/**
 * Turns the model slowly and lets visitors drag it round. Pointer events
 * come straight from the canvas so vertical swipes still scroll the page.
 */
function Turntable({ still }: { still: boolean }) {
  const camera = useThree((s) => s.camera);
  const canvas = useThree((s) => s.gl.domElement);
  const size = useThree((s) => s.size);
  const turn = useRef({ angle: 0.75, velocity: 0, dragging: false, lastX: 0 });

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
      t.angle -= dx * DRAG_SPEED;
      t.velocity = -dx * 0.4;
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
    // Pull back on narrow screens so the whole flat stays in frame.
    const distance = 27 * Math.max(1, 1.2 / (size.width / size.height));
    camera.position.set(Math.sin(t.angle) * distance * 0.78, distance * 0.62, Math.cos(t.angle) * distance * 0.78);
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}

/** White clay study model of the featured apartment. */
export default function ClayModel({ active, still, onReady }: { active: boolean; still: boolean; onReady?: () => void }) {
  const clay = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e6e1d9", roughness: 0.95 }), []);

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 28, near: 0.1, far: 100, position: [14, 17, 16] }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => onReady?.()}
      style={{ touchAction: "pan-y", cursor: "grab" }}
      aria-hidden
    >
      <hemisphereLight args={["#ffffff", "#cfc7bb", 3]} />
      <directionalLight
        position={[-7, 12, 6]}
        intensity={6.5}
        color="#fff4e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      {APARTMENT.map((part, i) => (
        <Piece key={i} part={part} material={clay} />
      ))}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.1} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.18} />
      </mesh>
      <Turntable still={still} />
    </Canvas>
  );
}
