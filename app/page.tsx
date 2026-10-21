import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BlueprintStory } from "@/components/home/blueprint-story";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  alternates: { canonical: "/" },
};

const services = [
  {
    title: "Space planning",
    body: "Layouts that follow how you actually live, with storage and circulation worked out from day one.",
  },
  {
    title: "Concept & materials",
    body: "Mood, palette and finishes brought together into a clear direction you can touch and compare.",
  },
  {
    title: "3D visualisation",
    body: "Walk through your space before anything is built, and make decisions with confidence.",
  },
  {
    title: "Joinery & furniture",
    body: "Bespoke cabinetry and carefully sourced pieces, scaled to the room and detailed to last.",
  },
  {
    title: "Site coordination",
    body: "I work alongside contractors and suppliers so the finished space matches the design.",
  },
];

export default function HomePage() {
  return (
    <>
      <BlueprintStory />

      <section aria-labelledby="services-heading" className="border-t border-border py-24 md:py-32">
        <div className="container-page grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">What I do</p>
            <h2 id="services-heading" className="mt-4 text-4xl md:text-5xl">
              From first sketch to final cushion.
            </h2>
          </div>
          <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {services.map((service, i) => (
              <li key={service.title} className="border-t border-border pt-5">
                <span className="text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-2xl">{service.title}</h3>
                <p className="mt-2 text-muted-foreground">{service.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="bg-card py-24 md:py-32">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 id="featured-heading" className="mt-4 text-4xl md:text-5xl">
                Recent projects
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/projects/">
                All projects <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-10">
            {projects.slice(0, 2).map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
