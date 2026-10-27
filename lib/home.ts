// Home page content. Placeholder copy and renders until the real project
// photography and descriptions are ready.

/** The home page hero carries this id; the header sits over it in light text. */
export const HERO_ID = "hero";

export type HeroSlide = {
  image: string;
  width: number;
  height: number;
  alt: string;
  title: string;
  caption: string;
};

export const heroSlides: HeroSlide[] = [
  {
    image: "/placeholders/curtain-warm.jpg",
    width: 2000,
    height: 1250,
    alt: "Sheer linen curtains drawn back from a wide opening, with an oak bench and ceramics",
    title: "Harbour View Apartment",
    caption:
      "In a family flat above Victoria Harbour, the rooms open towards the water. Linen, oak and lime plaster soften the light and give every corner a place to rest.",
  },
  {
    image: "/placeholders/arch-umber.jpg",
    width: 2000,
    height: 1250,
    alt: "Afternoon light across a plaster arch and a dark oak bench",
    title: "Tea House Renewal",
    caption: "A 1970s shophouse in Taipei, turned into a quiet tea room arranged around a single arch and a courtyard of light.",
  },
  {
    image: "/placeholders/dining-warm-h.jpg",
    width: 2000,
    height: 1250,
    alt: "Oak dining table under a paper pendant by a wide window",
    title: "Garden Terrace House",
    caption: "A terrace house in Singapore planned around one long table, where the family eats, works and gathers.",
  },
];

/** The project shown as a turning clay model in the second section. */
export const featured = {
  slug: "harbour-view-apartment",
  modelLabel: "Study model 1:50",
  modelStill: "/placeholders/model-clay.jpg",
  summary:
    "A family flat opened up around the view. Every room was modelled before anything was built, so the family could walk through their new home months before moving in.",
};
