// Central site configuration. Placeholder values are marked with TODO and
// can be overridden through environment variables (see .env.example).

export const siteConfig = {
  name: "Kathy Kao Interior Design",
  shortName: "Kathy Kao",
  designer: "Kathy Kao",
  title: "Kathy Kao — Interior Designer",
  description:
    "Kathy Kao is an interior designer creating calm, considered residential and hospitality spaces, from the first floor plan sketch to the finished room.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://kathykao-personal-website.web.app").replace(/\/$/, ""),
  locale: "en_US",
  // TODO: replace with the real details.
  email: "hello@kathykao.design",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "85200000000",
  location: {
    city: "Hong Kong",
    country: "HK",
  },
  areaServed: ["Hong Kong", "Taipei", "Singapore"],
  social: {
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
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
