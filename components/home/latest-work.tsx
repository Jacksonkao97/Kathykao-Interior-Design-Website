import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

const WIDE = "(min-width: 900px) 50vw, 100vw";
const NARROW = "(min-width: 900px) 25vw, 50vw";

/**
 * Two rows of three: a wide photo then two narrow ones, and the mirror image
 * below. On smaller screens the wide card spans the row above the other two.
 */
export function LatestWork({ projects }: { projects: Project[] }) {
  const rows = [projects.slice(0, 3), projects.slice(3, 6)];
  return (
    <div className="grid gap-[72px]">
      {rows.map((row, r) => {
        const wideIndex = r === 0 ? 0 : row.length - 1;
        return (
          <div
            key={r}
            className={cn(
              "grid grid-cols-2 items-start gap-x-[18px] gap-y-16",
              r === 0
                ? "min-[900px]:grid-cols-[minmax(0,2.06fr)_minmax(0,1fr)_minmax(0,1fr)]"
                : "min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2.06fr)]",
            )}
          >
            {row.map((project, i) => {
              const wide = i === wideIndex;
              return (
                <div key={project.slug} className={cn("min-w-0", wide && "-order-1 col-span-full min-[900px]:order-none min-[900px]:col-span-1")}>
                  <ProjectCard
                    project={project}
                    sizes={wide ? WIDE : NARROW}
                    artClassName="aspect-[4/5] min-[900px]:aspect-auto min-[900px]:h-[clamp(220px,29.3vw,440px)]"
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
