import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { APARTMENT, type Part, type Tone } from "./apartment";

// The clay model is drawn as one merged mesh per tone, so even a detailed
// model costs a handful of draw calls. That keeps phones, which drop the
// WebGL context when a page asks too much of the GPU, rendering smoothly.

/** One merged geometry per clay tone. */
export type ClayGeometry = Partial<Record<Tone, THREE.BufferGeometry>>;

type Piece = { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4; tone: Tone };

/** Longest side of the footprint, in metres, that every model is scaled to. */
const FOOTPRINT = 10.5;

function floats(attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) {
  // getX/Y/Z unpack interleaved and quantized data that the merge can't use.
  const out = new Float32Array(attribute.count * 3);
  for (let i = 0; i < attribute.count; i++) {
    out[i * 3] = attribute.getX(i);
    out[i * 3 + 1] = attribute.getY(i);
    out[i * 3 + 2] = attribute.getZ(i);
  }
  return new THREE.BufferAttribute(out, 3);
}

/** Copy a piece into world space with just an index, positions and normals. */
function bake({ geometry, matrix }: Piece) {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", floats(position));
  const source = geometry.getIndex();
  const index = source ? Uint32Array.from(source.array) : Uint32Array.from({ length: position.count }, (_, i) => i);
  // A mirrored transform turns faces inside out unless the winding flips too.
  if (matrix.determinant() < 0) {
    for (let i = 0; i + 2 < index.length; i += 3) [index[i + 1], index[i + 2]] = [index[i + 2], index[i + 1]];
  }
  out.setIndex(new THREE.BufferAttribute(index, 1));
  if (normal) out.setAttribute("normal", floats(normal));
  else out.computeVertexNormals();
  out.applyMatrix4(matrix);
  return out;
}

function merge(pieces: Piece[]): ClayGeometry {
  const byTone: Partial<Record<Tone, THREE.BufferGeometry[]>> = {};
  for (const piece of pieces) (byTone[piece.tone] ??= []).push(bake(piece));
  const merged: ClayGeometry = {};
  for (const [tone, list] of Object.entries(byTone) as [Tone, THREE.BufferGeometry[]][]) {
    const geometry = mergeGeometries(list);
    list.forEach((g) => g.dispose());
    if (geometry) merged[tone] = geometry;
  }
  return merged;
}

function partGeometry(part: Part): THREE.BufferGeometry {
  if (part.shape === "cylinder") {
    return new THREE.CylinderGeometry(part.radiusTop ?? part.radius, part.radius, part.height, 32);
  }
  if (part.shape === "sphere") return new THREE.IcosahedronGeometry(part.radius, 3);
  const [w, h, d] = part.size;
  if (!part.round) return new THREE.BoxGeometry(w, h, d);
  return new RoundedBoxGeometry(w, h, d, 2, Math.min(part.round, Math.min(w, h, d) / 2 - 0.001));
}

/** The hand-built study apartment in components/three/apartment.ts. */
export function apartmentGeometry(): ClayGeometry {
  const pieces = APARTMENT.map((part) => {
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...part.position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(part.rotation ?? [0, 0, 0]))),
      new THREE.Vector3(1, 1, 1),
    );
    return { geometry: partGeometry(part), matrix, tone: part.tone };
  });
  const merged = merge(pieces);
  pieces.forEach((p) => p.geometry.dispose());
  return merged;
}

const hsl = { h: 0, s: 0, l: 0 };

/** Pick a clay tone from the material the designer used: glass stays glass, greens become leaves, the rest by lightness. */
function toneOf(material: THREE.Material): Tone {
  const m = material as THREE.MeshStandardMaterial & { transmission?: number };
  if (/glass|glaz/i.test(m.name) || (m.transparent && m.opacity < 0.7) || (m.transmission ?? 0) > 0.2) return "glass";
  if (!m.color) return "wall";
  m.color.getHSL(hsl, THREE.SRGBColorSpace);
  if (hsl.s > 0.2 && hsl.h > 0.17 && hsl.h < 0.45 && hsl.l > 0.1 && hsl.l < 0.8) return "leaf";
  if (hsl.l >= 0.72) return "wall";
  if (hsl.l >= 0.5) return "soft";
  if (hsl.l >= 0.3) return "floor";
  return "wood";
}

/**
 * A model uploaded in the CMS (any glTF scene), turned into clay: centred,
 * sitting on the ground and scaled so its footprint matches the study
 * apartment, so the camera, light and shadows fit it without tuning.
 */
export function sceneGeometry(scene: THREE.Object3D): ClayGeometry {
  scene.updateMatrixWorld(true);
  const pieces: Piece[] = [];
  scene.traverseVisible((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry.getAttribute("position")) return;
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    pieces.push({ geometry: mesh.geometry, matrix: mesh.matrixWorld, tone: toneOf(material) });
  });
  if (pieces.length === 0) throw new Error("The model has no meshes");
  const merged = merge(pieces);

  const box = new THREE.Box3();
  for (const geometry of Object.values(merged)) {
    geometry.computeBoundingBox();
    box.union(geometry.boundingBox!);
  }
  const size = box.getSize(new THREE.Vector3());
  const scale = FOOTPRINT / Math.max(size.x, size.z, 1e-6);
  const centre = box.getCenter(new THREE.Vector3());
  const fit = new THREE.Matrix4()
    .makeScale(scale, scale, scale)
    .multiply(new THREE.Matrix4().makeTranslation(-centre.x, -box.min.y, -centre.z));
  for (const geometry of Object.values(merged)) {
    geometry.applyMatrix4(fit);
    geometry.computeBoundingSphere();
  }
  return merged;
}
