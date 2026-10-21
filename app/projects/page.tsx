import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { PageIntro } from "@/components/page-intro";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/structured-data";

const description =
  "Residential, hospitality and workplace interiors by Kathy Kao, from compact city apartments to garden houses and tea rooms.";

export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: { canonical: "/projects/" },
  openGraph: { title: "Interior Design Projects", description, url: "/projects/" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageIntro eyebrow="Portfolio" title="Spaces shaped around the people who use them.">
        <p>{description}</p>
      </PageIntro>
      <section aria-label="Projects" className="container-page pb-24 md:pb-32">
        <div className="grid gap-16 md:grid-cols-2 md:gap-x-10 md:gap-y-20">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} priority={i < 2} />
          ))}
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Interior Design Projects",
          description,
          url: absoluteUrl("/projects/"),
          hasPart: projects.map((p) => ({
            "@type": "CreativeWork",
            name: p.title,
            url: absoluteUrl(`/projects/${p.slug}/`),
          })),
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects/" },
        ])}
      />
    </>
  );
}
