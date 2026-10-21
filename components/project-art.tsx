import Image from "next/image";

import { assetUrl } from "@/lib/assets";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

// Small deterministic PRNG so each project gets a stable layout.
function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

type Rect = { x: number; y: number; w: number; h: number };

function splitRooms(rand: () => number, rect: Rect, depth: number): Rect[] {
  if (depth === 0 || (rect.w < 120 && rect.h < 90)) return [rect];
  const vertical = rect.w > rect.h ? rand() > 0.2 : rand() > 0.8;
  const t = 0.35 + rand() * 0.3;
  if (vertical) {
    const w = rect.w * t;
    return [
      ...splitRooms(rand, { ...rect, w }, depth - 1),
      ...splitRooms(rand, { ...rect, x: rect.x + w, w: rect.w - w }, depth - 1),
    ];
  }
  const h = rect.h * t;
  return [
    ...splitRooms(rand, { ...rect, h }, depth - 1),
    ...splitRooms(rand, { ...rect, y: rect.y + h, h: rect.h - h }, depth - 1),
  ];
}

/**
 * Project imagery. Uses the real cover photo when one is set, otherwise draws
 * a coloured plan in the project's palette as a placeholder.
 */
export function ProjectArt({
  project,
  className,
  variant = 0,
  priority = false,
}: {
  project: Project;
  className?: string;
  variant?: number;
  priority?: boolean;
}) {
  const photo = variant === 0 ? project.cover : project.gallery?.[variant - 1];
  if (photo) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={assetUrl(photo)}
          alt={`${project.title}, ${project.location}`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const rand = seeded(`${project.slug}-${variant}`);
  const rooms = splitRooms(rand, { x: 40, y: 30, w: 320, h: 240 }, 3);
  const [base, light, mid, dark] = project.palette;

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor: base }}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        {rooms.map((r, i) => {
          const fill = [light, base, mid, light][i % 4];
          return (
            <g key={i}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={fill} fillOpacity={0.55} stroke={dark} strokeWidth={3} />
              {r.w > 70 && r.h > 60 && (
                <rect
                  x={r.x + r.w * 0.25}
                  y={r.y + r.h * 0.3}
                  width={r.w * 0.5}
                  height={r.h * 0.4}
                  rx={6}
                  fill={i % 2 ? mid : dark}
                  fillOpacity={0.35}
                />
              )}
              {r.w > 50 && r.h > 50 && i % 3 === 0 && (
                <circle cx={r.x + r.w - 18} cy={r.y + 18} r={8} fill={dark} fillOpacity={0.5} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
