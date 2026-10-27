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
}: {
  project: Project;
  priority?: boolean;
  artClassName?: string;
  sizes?: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <article className="group min-w-0">
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
        <Heading className="title-caps mt-7 min-[900px]:mt-10">{project.title}</Heading>
        <p className="mt-[18px] line-clamp-5 max-w-[62ch] min-[900px]:line-clamp-none">{project.summary}</p>
        <p className="caps mt-[18px] text-muted-foreground">
          {project.category}
          <span className="px-2.5" aria-hidden>
            |
          </span>
          <span className="sr-only">, </span>
          {project.location}
          <span className="px-2.5" aria-hidden>
            |
          </span>
          <span className="sr-only">, </span>
          {project.year}
        </p>
      </Link>
    </article>
  );
}
