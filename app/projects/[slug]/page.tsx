import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { JsonLd } from "@/components/json-ld";
import { ProjectArt } from "@/components/project-art";
import { getProject, projects } from "@/lib/projects";
import { defaultShareImage, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { absoluteAssetUrl, breadcrumbSchema, personId, websiteId } from "@/lib/structured-data";

// Every project page is generated at build time; unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.title}, ${project.location}`,
    description: project.summary,
    path: `/projects/${project.slug}/`,
    type: "article",
    // Drawn by ./opengraph-image.tsx.
    image: {
      ...defaultShareImage,
      url: `/projects/${project.slug}/opengraph-image`,
      alt: project.coverAlt ?? `${project.title}, ${project.location}`,
    },
  });
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const galleryCount = project.gallery.length || 3;

  return (
    <article>
      <header className="container-page pt-12 md:pt-16">
        <Link href="/projects/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All projects
        </Link>
        <p className="eyebrow mt-10">
          {project.category} · {project.location}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl leading-[1.15] md:text-6xl">{project.title}</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{project.summary}</p>
      </header>

      <ProjectArt project={project} priority className="container-page mt-12 aspect-[16/9] md:mt-16" />

      <div className="container-page grid gap-12 py-16 md:grid-cols-[1fr_2fr] md:py-24">
        <dl className="grid h-fit grid-cols-2 gap-6 text-sm md:grid-cols-1">
          <div>
            <dt className="eyebrow">Location</dt>
            <dd className="mt-1">{project.location}</dd>
          </div>
          <div>
            <dt className="eyebrow">Year</dt>
            <dd className="mt-1">{project.year}</dd>
          </div>
          <div>
            <dt className="eyebrow">Area</dt>
            <dd className="mt-1">{project.area}</dd>
          </div>
          <div>
            <dt className="eyebrow">Scope</dt>
            <dd className="mt-1">{project.scope.join(", ")}</dd>
          </div>
        </dl>
        <div className="space-y-6 text-lg leading-relaxed">
          {project.story.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>

      <section aria-label="Gallery" className="container-page grid gap-6 pb-20 md:grid-cols-2">
        {/* Two portrait photos, then a wide one; a photo left alone on its row
            goes wide too. Plan artwork fills in until photos are added. */}
        {Array.from({ length: galleryCount }, (_, i) => i + 1).map((v) => (
          <ProjectArt
            key={v}
            project={project}
            variant={v}
            className={
              v % 3 === 0 || (v === galleryCount && v % 3 === 1) ? "aspect-[16/9] md:col-span-2" : "aspect-[4/5]"
            }
          />
        ))}
      </section>

      <nav aria-label="Next project" className="border-t border-border">
        <Link href={`/projects/${next.slug}/`} className="container-page group flex items-center justify-between py-12">
          <span>
            <span className="eyebrow">Next project</span>
            <span className="mt-2 block font-serif text-3xl md:text-4xl">{next.title}</span>
          </span>
          <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
        </Link>
      </nav>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          url: absoluteUrl(`/projects/${project.slug}/`),
          ...(project.cover && {
            image: [project.cover, ...project.gallery.map((photo) => photo.image)].map(absoluteAssetUrl),
          }),
          dateCreated: String(project.year),
          locationCreated: { "@type": "Place", name: project.location },
          genre: `${project.category} interior design`,
          keywords: project.scope.join(", "),
          creator: { "@id": personId },
          isPartOf: { "@id": websiteId },
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects/" },
          { name: project.title, path: `/projects/${project.slug}/` },
        ])}
      />
    </article>
  );
}
