"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import type { Tone } from "./apartment";
import { apartmentGeometry, type ClayGeometry, sceneGeometry } from "./clay-geometry";

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

/** Loads an uploaded .glb as clay, or builds the study apartment when there is none. */
function useClayGeometry(modelUrl: string | undefined, onError?: () => void) {
  const [loaded, setLoaded] = useState<{ url: string; geometry: ClayGeometry } | null>(null);
  const apartment = useMemo(() => (modelUrl ? null : apartmentGeometry()), [modelUrl]);
  useEffect(() => {
    if (!modelUrl) return;
    let cancelled = false;
    // The bundler copies three's Draco decoder into the build, so nothing
    // loads from another site.
    const draco = new DRACOLoader();
    const loader = new GLTFLoader()
      .setDRACOLoader(draco)
      .setMeshoptDecoder(MeshoptDecoder)
      // Clay has no textures, so skip decoding them: photo textures are
      // often most of a model's memory, which phones run short of. The loader
      // treats a null texture as no texture.
      .register(() => ({
        name: "clay_skip_textures",
        loadTexture: () => Promise.resolve(null as unknown as THREE.Texture),
      }));
    loader
      .loadAsync(modelUrl)
      .then((gltf) => {
        const geometry = sceneGeometry(gltf.scene);
        gltf.scene.traverse((object) => (object as THREE.Mesh).geometry?.dispose());
        if (cancelled) Object.values(geometry).forEach((g) => g.dispose());
        else setLoaded({ url: modelUrl, geometry });
      })
      .catch((error) => {
        console.error(`Could not show the 3D model ${modelUrl}`, error);
        if (!cancelled) onError?.();
      })
      .finally(() => draco.dispose());
    return () => {
      cancelled = true;
    };
  }, [modelUrl, onError]);

  const geometry = apartment ?? (loaded && loaded.url === modelUrl ? loaded.geometry : null);
  useEffect(() => () => Object.values(geometry ?? {}).forEach((g) => g.dispose()), [geometry]);
  return geometry;
}

function Model({
  geometry,
  materials,
  onReady,
}: {
  geometry: ClayGeometry;
  materials: Record<Tone, THREE.Material>;
  onReady?: () => void;
}) {
  useEffect(() => onReady?.(), [onReady]);
  return (
    <>
      {(Object.entries(geometry) as [Tone, THREE.BufferGeometry][]).map(([tone, g]) => (
        <mesh
          key={tone}
          geometry={g}
          material={materials[tone]}
          castShadow={tone !== "glass"}
          receiveShadow={tone !== "glass"}
        />
      ))}
    </>
  );
}

/**
 * Clay-and-card study model of the featured project: the .glb uploaded for
 * it in the CMS, or the hand-built study apartment. `onError` fires when the
 * model can't load or the browser drops the WebGL context, so the page can
 * fall back to the still image.
 */
export default function ClayModel({
  active,
  still,
  modelUrl,
  onReady,
  onError,
}: {
  active: boolean;
  still: boolean;
  modelUrl?: string;
  onReady?: () => void;
  onError?: () => void;
}) {
  const materials = useMemo(() => {
    const byTone = {} as Record<Tone, THREE.Material>;
    for (const tone of Object.keys(TONES) as Tone[]) byTone[tone] = new THREE.MeshStandardMaterial(TONES[tone]);
    return byTone;
  }, []);
  const geometry = useClayGeometry(modelUrl, onError);
  // Phones get a lighter canvas and shadow map; they drop the WebGL context
  // (and the model with it) when a page uses too much GPU memory.
  const small = Math.min(window.screen.width, window.screen.height) < 768;

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, small ? 1.5 : 2]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 28, near: 0.1, far: 100, position: [0, 17, 19] }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) =>
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onError?.();
        })
      }
      style={{ touchAction: "pan-y", cursor: "grab" }}
      aria-hidden
    >
      <hemisphereLight args={["#fffaf2", "#bfb5a6", 1.7]} />
      <directionalLight
        position={[-8, 11, 5]}
        intensity={8}
        color="#fff1e0"
        castShadow
        shadow-mapSize={small ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={small ? 3 : 5}
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
        {geometry && <Model geometry={geometry} materials={materials} onReady={onReady} />}
      </Turntable>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.1} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
    </Canvas>
  );
}
