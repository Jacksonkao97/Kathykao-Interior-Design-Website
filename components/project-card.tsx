import Link from "next/link";

import { ProjectArt } from "@/components/project-art";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/projects/${project.slug}/`} className="block">
        <ProjectArt
          project={project}
          priority={priority}
          className="aspect-[4/3] rounded-lg transition-transform duration-700 group-hover:scale-[1.015]"
        />
        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="text-2xl">{project.title}</h3>
          <span className="shrink-0 text-sm text-muted-foreground">{project.year}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.category} · {project.location}
        </p>
        <p className="mt-3 text-muted-foreground">{project.summary}</p>
      </Link>
    </article>
  );
}
