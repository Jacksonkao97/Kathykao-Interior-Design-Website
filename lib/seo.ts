import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

/** The site's share image, drawn by app/opengraph-image.tsx. */
export const defaultShareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `${siteConfig.designer}, interior designer in ${siteConfig.location.city}`,
};

/**
 * Title, description, canonical URL and link preview tags for one page.
 *
 * Next merges metadata shallowly, so a page that sets `openGraph` or
 * `twitter` replaces the root layout's whole object. Building every page's
 * tags here keeps the site name, locale and share image on all of them.
 * Next copies the Open Graph image into the X (Twitter) tags.
 */
export function pageMetadata({
  title,
  socialTitle,
  description,
  path,
  type = "website",
  image = defaultShareImage,
}: {
  /** The <title>, before the root layout's " | Kathy Kao Interior Design". */
  title: Metadata["title"];
  /** The headline in link previews, when it should differ from `title`. */
  socialTitle?: string;
  description: string;
  /** Site-rooted with a trailing slash, e.g. /projects/. */
  path: string;
  type?: "website" | "article" | "profile";
  image?: typeof defaultShareImage;
}): Metadata {
  const shareTitle = socialTitle ?? (typeof title === "string" ? title : siteConfig.title);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: shareTitle,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
    },
  };
}
