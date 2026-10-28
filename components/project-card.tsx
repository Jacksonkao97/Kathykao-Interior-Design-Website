import Link from "next/link";

import { ProjectArt } from "@/components/project-art";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * Photo, letter-spaced title, summary and a meta line. The photo dims and
 * shows "View" on hover. `artClassName` sets the photo's shape.
 */
export function ProjectCard({
  project,
  priority,
  artClassName = "aspect-[4/3]",
  sizes,
  headingLevel: Heading = "h3",
  revealDelay = 0,
}: {
  project: Project;
  priority?: boolean;
  artClassName?: string;
  sizes?: string;
  headingLevel?: "h2" | "h3";
  /** Milliseconds to wait before fading in, to stagger a row. */
  revealDelay?: number;
}) {
  return (
    <article
      data-reveal
      style={{ "--reveal-delay": `${revealDelay}ms` } as React.CSSProperties}
      className="group min-w-0"
    >
      <Link href={`/projects/${project.slug}/`} className="block">
        <div className="relative">
          <ProjectArt project={project} priority={priority} sizes={sizes} className={cn("bg-muted", artClassName)} />
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center bg-[rgb(30_26_22/0.28)] text-[17px] tracking-[0.3em] text-white uppercase opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            View
          </span>
        </div>
        {/* Narrow cards on small phones can't fit a long word at full tracking. */}
        <Heading className="title-caps mt-7 [overflow-wrap:anywhere] max-[559px]:tracking-[0.24em] min-[900px]:mt-10">
          {project.title}
        </Heading>
        <p className="mt-[18px] line-clamp-5 max-w-[62ch] min-[900px]:line-clamp-none">{project.summary}</p>
        {/* Each detail stays whole, so the line wraps between them in narrow cards. */}
        <p className="caps mt-[18px] flex flex-wrap text-muted-foreground">
          {[project.category, project.location, project.year].map((detail, i) => (
            <span key={i} className="whitespace-nowrap">
              {i > 0 && (
                <>
                  <span className="px-2.5" aria-hidden>
                    |
                  </span>
                  <span className="sr-only">, </span>
                </>
              )}
              {detail}
            </span>
          ))}
        </p>
      </Link>
    </article>
  );
}
