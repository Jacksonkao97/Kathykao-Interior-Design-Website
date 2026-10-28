import { absoluteUrl, siteConfig } from "@/lib/site";

export const personId = absoluteUrl("/#designer");
export const businessId = absoluteUrl("/#business");

export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": businessId,
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        email: siteConfig.email,
        image: absoluteUrl("/opengraph-image"),
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.location.city,
          addressCountry: siteConfig.location.country,
        },
        areaServed: siteConfig.areaServed,
        founder: { "@id": personId },
        knowsAbout: ["Interior design", "Space planning", "3D visualisation", "Joinery design", "Lighting design"],
        sameAs: siteConfig.social.map((link) => link.url),
      },
      {
        "@type": "Person",
        "@id": personId,
        name: siteConfig.designer,
        jobTitle: "Interior Designer",
        url: siteConfig.url,
        worksFor: { "@id": businessId },
        sameAs: siteConfig.social.map((link) => link.url),
      },
      {
        "@type": "WebSite",
        name: siteConfig.name,
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
