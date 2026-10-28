import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { PageIntro } from "@/components/page-intro";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { breadcrumbSchema, personId, websiteId } from "@/lib/structured-data";

const description =
  "Residential, hospitality and workplace interiors by Kathy Kao, from compact city apartments to garden houses and tea rooms.";

export const metadata: Metadata = pageMetadata({
  title: "Interior Design Projects",
  socialTitle: `Interior design projects by ${siteConfig.designer}`,
  description,
  path: "/projects/",
});

export default function ProjectsPage() {
  return (
    <>
      <PageIntro eyebrow="Portfolio" title="Spaces shaped around the people who use them.">
        <p>{description}</p>
      </PageIntro>
      <section aria-label="Projects" className="container-page">
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
          isPartOf: { "@id": websiteId },
          author: { "@id": personId },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absoluteUrl(`/projects/${p.slug}/`),
              name: p.title,
            })),
          },
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
