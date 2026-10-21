import type { MetadataRoute } from "next";

import { projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/projects/"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/experience/"), changeFrequency: "yearly", priority: 0.7 },
    ...projects.map((p) => ({
      url: absoluteUrl(`/projects/${p.slug}/`),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
