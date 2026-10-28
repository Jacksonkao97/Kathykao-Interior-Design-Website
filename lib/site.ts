import siteSettings from "@/content/site.json";

// Central site configuration. Contact details and social links come from
// content/site.json, which Kathy edits as "Site settings" in Pages CMS
// (.pages.yml); the rest can be overridden through environment variables
// (see .env.example).

export type SocialLink = { platform: string; url: string };

type SiteSettings = {
  email: string;
  whatsappNumber: string;
  city: string;
  countryCode: string;
  otherAreas?: string[];
  social?: SocialLink[];
  /** The project on the home page, as the CMS stores it: content/projects/<slug>.json. */
  featuredProject?: string;
  featuredText?: string;
  /** The home page description in search results and link previews. */
  description?: string;
};

// Typed by hand: TypeScript would otherwise infer the type from whatever the
// file holds today (an emptied list becomes never[]).
const settings = siteSettings as unknown as SiteSettings;

// The CMS checks these fields too, but a hand edit can slip through, so fail
// the build with a clear message instead of publishing a broken link.
function checkSettings() {
  const fail = (problem: string): never => {
    throw new Error(`content/site.json: ${problem}`);
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) fail(`"email" is not an email address`);
  if (!/^[1-9]\d{6,14}$/.test(settings.whatsappNumber)) {
    fail(`"whatsappNumber" must be digits only, with the country code and no + or spaces`);
  }
  if (!settings.city?.trim()) fail(`"city" is missing`);
  if (!/^[A-Z]{2}$/.test(settings.countryCode)) fail(`"countryCode" must be two capital letters, e.g. HK`);
  const social: SocialLink[] = (settings.social ?? []).filter((link) => link?.url?.trim());
  for (const link of social) {
    if (!/^https:\/\//.test(link.url)) fail(`the ${link.platform} link must start with https://`);
  }
  return social;
}

const social = checkSettings();

const DEFAULT_DESCRIPTION =
  "Kathy Kao is an interior designer creating calm, considered residential and hospitality spaces, from the first floor plan sketch to the finished room.";

export const siteConfig = {
  name: "Kathy Kao Interior Design",
  shortName: "Kathy Kao",
  designer: "Kathy Kao",
  /** The home page title; naming the city helps local searches. */
  title: `Kathy Kao — Interior Designer in ${settings.city}`,
  description: settings.description?.trim() || DEFAULT_DESCRIPTION,
  /** The line under the name on the share image. */
  tagline: "From paper plan to finished room.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://kathykao-personal-website.web.app").replace(/\/$/, ""),
  locale: "en_US",
  email: settings.email,
  whatsappNumber: settings.whatsappNumber,
  location: {
    city: settings.city,
    country: settings.countryCode,
  },
  /** The home city first, then the other places Kathy works. */
  areaServed: [...new Set([settings.city, ...(settings.otherAreas ?? []).map((area) => area.trim())])].filter(Boolean),
  social,
  /** The project shown as a clay model on the home page; app/page.tsx falls back to the newest. */
  featured: {
    slug: settings.featuredProject?.replace(/^.*\//, "").replace(/\.json$/, "") || undefined,
    /** Replaces the project summary under the model when set. */
    text: settings.featuredText?.trim() || undefined,
  },
  keywords: [
    "interior designer",
    "interior design",
    "residential interior design",
    "space planning",
    "3D interior visualisation",
    "floor plan design",
    "home renovation design",
    "Kathy Kao",
  ],
} as const;

/** The enquiry section at the foot of every page. */
export const contactCopy = {
  heading: "Let's talk about your space",
  lede: "Tell Kathy a little about your project. The form opens WhatsApp with your message ready to send.",
} as const;

export const navItems = [
  { href: "/projects/", label: "Projects" },
  { href: "/experience/", label: "About" },
] as const;

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
