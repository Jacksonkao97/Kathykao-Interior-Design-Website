import { assetUrl } from "@/lib/assets";
import { skills } from "@/lib/experience";
import { featuredProject, projects } from "@/lib/projects";
import { defaultShareImage } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";

// schema.org data for search engines. Server components only: it reads the
// projects from content/ at build time.

export const personId = absoluteUrl("/#designer");
export const businessId = absoluteUrl("/#business");
export const websiteId = absoluteUrl("/#website");

/** A photo or file URL that works off the site: Storage URLs as they are, site paths with the domain. */
export function absoluteAssetUrl(path: string) {
  const url = assetUrl(path);
  return /^https?:\/\//.test(url) ? url : absoluteUrl(url);
}

/** Every scope of work listed on a project, in first-seen order. */
const services = [...new Set(projects.flatMap((p) => p.scope))];

export function businessSchema() {
  const sameAs = siteConfig.social.map((link) => link.url);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        // ProfessionalService is the LocalBusiness type Google suggests for
        // design studios; schema.org has no interior designer type.
        "@type": "ProfessionalService",
        "@id": businessId,
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        email: siteConfig.email,
        logo: absoluteUrl("/icons/icon-512.png"),
        image: [
          ...(featuredProject.cover ? [absoluteAssetUrl(featuredProject.cover)] : []),
          absoluteUrl(defaultShareImage.url),
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.location.city,
          addressCountry: siteConfig.location.country,
        },
        areaServed: siteConfig.areaServed.map((name) => ({ "@type": "Place", name })),
        founder: { "@id": personId },
        knowsAbout: ["Interior design", ...services],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: siteConfig.email,
          url: absoluteUrl("/#contact"),
          areaServed: siteConfig.areaServed,
        },
        sameAs,
      },
      {
        "@type": "Person",
        "@id": personId,
        name: siteConfig.designer,
        jobTitle: "Interior Designer",
        url: siteConfig.url,
        worksFor: { "@id": businessId },
        knowsAbout: skills.flatMap((group) => group.items),
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: siteConfig.name,
        alternateName: siteConfig.designer,
        url: siteConfig.url,
        inLanguage: "en",
        publisher: { "@id": businessId },
      },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
