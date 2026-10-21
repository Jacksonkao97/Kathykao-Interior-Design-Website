import { walls } from "@/components/three/plan";
import { cn } from "@/lib/utils";

/**
 * A static blueprint drawing of the story floor plan. Shown while the 3D
 * scene loads and as the fallback on devices without WebGL.
 */
export function PlanSketch({ className, drawn = true }: { className?: string; drawn?: boolean }) {
  return (
    <svg viewBox="-7.5 -5.5 15 11" className={cn("text-blueprint", className)} role="img" aria-label="Floor plan sketch">
      <defs>
        <pattern id="plan-grid" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
          <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.015" />
        </pattern>
      </defs>
      <rect x="-7" y="-5" width="14" height="10" fill="url(#plan-grid)" />
      {drawn && (
        <g stroke="currentColor" strokeLinecap="square" fill="none">
          {walls.map((w, i) => (
            <line
              key={i}
              x1={w.from[0]}
              y1={w.from[1]}
              x2={w.to[0]}
              y2={w.to[1]}
              strokeWidth={w.height ? 0.04 : 0.1}
            />
          ))}
          <path d="M -3.2 3.5 L -3.2 2.5 A 1 1 0 0 1 -2.2 3.5" strokeWidth="0.025" strokeDasharray="0.1 0.07" />
          <path d="M 1.5 0.3 L 2.6 0.3 A 1.1 1.1 0 0 1 1.5 1.4" strokeWidth="0.025" strokeDasharray="0.1 0.07" />
          <line x1="-5" y1="4.3" x2="5" y2="4.3" strokeWidth="0.02" />
          <text x="0" y="4.75" fontSize="0.32" textAnchor="middle" fill="currentColor" stroke="none">
            10 000
          </text>
        </g>
      )}
    </svg>
  );
}
