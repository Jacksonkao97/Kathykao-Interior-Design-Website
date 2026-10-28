import type { MetadataRoute } from "next";

import { heroSlides } from "@/lib/home";
import { featuredProject, projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";
import { absoluteAssetUrl } from "@/lib/structured-data";

export const dynamic = "force-static";

// Lists each page's photos too, so they can show in image search.
export default function sitemap(): MetadataRoute.Sitemap {
  const photos = (...paths: (string | undefined)[]) =>
    [...new Set(paths.filter((p): p is string => Boolean(p)))].map(absoluteAssetUrl);

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "monthly",
      priority: 1,
      images: photos(...heroSlides.map((slide) => slide.image), featuredProject.cover),
    },
    {
      url: absoluteUrl("/projects/"),
      changeFrequency: "monthly",
      priority: 0.9,
      images: photos(...projects.map((p) => p.cover)),
    },
    { url: absoluteUrl("/experience/"), changeFrequency: "yearly", priority: 0.7 },
    ...projects.map((p) => ({
      url: absoluteUrl(`/projects/${p.slug}/`),
      changeFrequency: "yearly" as const,
      priority: 0.8,
      images: photos(p.cover, ...p.gallery.map((photo) => photo.image)),
    })),
  ];
}
