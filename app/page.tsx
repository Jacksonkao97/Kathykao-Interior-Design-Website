import type { Metadata } from "next";
import Link from "next/link";

import { FeaturedModel } from "@/components/home/featured-model";
import { HeroSlideshow } from "@/components/home/hero-slideshow";
import { HomeSection } from "@/components/home/home-section";
import { LatestWork } from "@/components/home/latest-work";
import { featuredModel, heroSlides } from "@/lib/home";
import { getProject, projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  // Falls back to the newest project if the featured one is renamed or removed in the CMS.
  const project = (siteConfig.featured.slug && getProject(siteConfig.featured.slug)) || projects[0];
  // An uploaded model shows over the project's cover photo; without one, the
  // study apartment shows over its own clay render.
  const model = project.model
    ? { url: project.model, still: project.cover, label: featuredModel.uploadedLabel }
    : { url: undefined, still: featuredModel.studyStill, label: featuredModel.studyLabel };

  return (
    <>
      <h1 className="sr-only">
        {siteConfig.designer}, interior designer in {siteConfig.location.city}
      </h1>
      <HeroSlideshow slides={heroSlides} />

      <HomeSection id="featured" title="Featured project" sideLabel="Featured">
        <div className="grid justify-items-center text-center">
          <FeaturedModel
            modelUrl={model.url}
            still={model.still}
            alt={
              model.url
                ? (project.coverAlt ?? `${project.title}, ${project.location}`)
                : `White clay study model of the ${project.title}, seen from above`
            }
            label={`3D clay model of the ${project.title}. Drag to turn it.`}
          />
          <p data-reveal className="caps text-muted-foreground">
            {model.label} · drag to turn
          </p>
          <div data-reveal className="grid justify-items-center">
            <h3 className="title-caps mt-12">{project.title}</h3>
            <p className="mt-[18px] max-w-[62ch]">{siteConfig.featured.text ?? project.summary}</p>
            <p className="caps mt-[18px] text-muted-foreground">
              {project.category} · {project.location} · {project.year}
            </p>
            <Link
              href={`/projects/${project.slug}/`}
              className="caps mt-[30px] border-b border-current pb-[3px] transition-opacity hover:opacity-60"
            >
              View project
            </Link>
          </div>
        </div>
      </HomeSection>

      <HomeSection id="latest" title="Latest work" sideLabel="Recent">
        <LatestWork projects={projects.slice(0, 6)} />
        <p data-reveal className="mt-16 text-center">
          <Link href="/projects/" className="caps border-b border-current pb-[3px] transition-opacity hover:opacity-60">
            All projects
          </Link>
        </p>
      </HomeSection>
    </>
  );
}
