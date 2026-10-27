import type { Metadata } from "next";
import Link from "next/link";

import { FeaturedModel } from "@/components/home/featured-model";
import { HeroSlideshow } from "@/components/home/hero-slideshow";
import { HomeSection } from "@/components/home/home-section";
import { LatestWork } from "@/components/home/latest-work";
import { featured, heroSlides } from "@/lib/home";
import { getProject, projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  // Falls back to the newest project if the featured one is renamed or removed in the CMS.
  const project = getProject(featured.slug) ?? projects[0];

  return (
    <>
      <h1 className="sr-only">
        {siteConfig.designer}, interior designer in {siteConfig.location.city}
      </h1>
      <HeroSlideshow slides={heroSlides} />

      <HomeSection id="featured" title="Featured project" sideLabel="Featured">
        <div className="grid justify-items-center text-center">
          <FeaturedModel
            still={featured.modelStill}
            alt={`White clay study model of the ${project.title}, seen from above`}
            label={`3D clay model of the ${project.title}. Drag to turn it.`}
          />
          <p className="caps text-muted-foreground">{featured.modelLabel} · drag to turn</p>
          <h3 className="title-caps mt-12">{project.title}</h3>
          <p className="mt-[18px] max-w-[62ch]">{featured.summary}</p>
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
      </HomeSection>

      <HomeSection id="latest" title="Latest work" sideLabel="Recent">
        <LatestWork projects={projects.slice(0, 6)} />
        <p className="mt-16 text-center">
          <Link href="/projects/" className="caps border-b border-current pb-[3px] transition-opacity hover:opacity-60">
            All projects
          </Link>
        </p>
      </HomeSection>
    </>
  );
}
