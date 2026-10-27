// Placeholder portfolio content. Replace with real projects; `cover` and
// `gallery` paths resolve through assetUrl() so they can live in Firebase
// Storage. Covers under /placeholders/ are stand-in renders in /public until
// real photography exists; without a cover, pages draw plan artwork.

export type Project = {
  slug: string;
  title: string;
  category: "Residential" | "Hospitality" | "Commercial";
  location: string;
  year: number;
  area: string;
  scope: string[];
  summary: string;
  story: string[];
  palette: [string, string, string, string];
  cover?: string;
  /** Describes what the cover shows, for its alt text. */
  coverAlt?: string;
  gallery?: string[];
};

export const projects: Project[] = [
  {
    slug: "harbour-view-apartment",
    title: "Harbour View Apartment",
    category: "Residential",
    location: "Hong Kong",
    year: 2025,
    area: "110 m²",
    scope: ["Space planning", "Joinery design", "Lighting", "Furniture & styling"],
    summary:
      "A compact family apartment opened up around the view, with oak joinery that hides storage for a household of four.",
    story: [
      "The original layout split the flat into five small rooms that all turned their backs on the harbour. We removed two non-structural walls and organised the plan around a single long sightline from the entrance to the window.",
      "A run of white oak joinery absorbs storage, a study nook and a fold-away dining table, so the living space stays clear day to day and expands when friends visit.",
      "Warm limewash walls, linen and brushed brass keep the palette soft against the strong light off the water.",
    ],
    palette: ["#EDE4D6", "#C9B79C", "#8A6F52", "#3E4A45"],
    cover: "/placeholders/curtain-umber.jpg",
    coverAlt: "Linen curtains framing a wide opening, with an oak bench below",
  },
  {
    slug: "tea-house-renewal",
    title: "Tea House Renewal",
    category: "Hospitality",
    location: "Taipei",
    year: 2024,
    area: "180 m²",
    scope: ["Concept design", "Material selection", "Custom furniture", "Site coordination"],
    summary:
      "A 1970s shophouse reworked into a quiet tea room with a courtyard of light at its centre.",
    story: [
      "The brief asked for calm in the middle of a busy street. We pulled the seating back from the facade and cut a light well into the middle of the plan so every table looks onto greenery.",
      "Reclaimed cypress, hand-trowelled plaster and terrazzo made with local stone tie the space to its neighbourhood.",
      "Lighting is kept low and indirect, layered so the room shifts gently from bright mornings to warm evenings.",
    ],
    palette: ["#E9E1D3", "#B9A88A", "#6E5B45", "#2F3B33"],
    cover: "/placeholders/niche-grey.jpg",
    coverAlt: "Ceramic vessels resting in a deep plaster niche",
  },
  {
    slug: "mid-levels-kitchen",
    title: "Mid-Levels Kitchen",
    category: "Residential",
    location: "Hong Kong",
    year: 2025,
    area: "18 m²",
    scope: ["Kitchen design", "Joinery", "Lighting"],
    summary: "A small galley kitchen rebuilt in pale oak and honed stone, with everything stored out of sight.",
    story: [
      "The old kitchen was a narrow corridor with cupboards on every wall. We kept the footprint but moved the sink under the window and ran a single line of tall storage along the back.",
      "Pale oak fronts with no handles keep the room quiet, while a honed stone worktop wraps up the wall as a splashback.",
      "Two paper pendants and a strip of light under the shelves make it a calm place to cook at night.",
    ],
    palette: ["#EFE8DC", "#D2C0A4", "#9C805F", "#3F3A33"],
    cover: "/placeholders/kitchen-warm-p.jpg",
    coverAlt: "Pale oak kitchen island under two pendant lamps",
  },
  {
    slug: "garden-terrace-house",
    title: "Garden Terrace House",
    category: "Residential",
    location: "Singapore",
    year: 2024,
    area: "260 m²",
    scope: ["Full renovation", "Kitchen design", "Bespoke joinery", "Landscape coordination"],
    summary:
      "A three-storey terrace house reconnected to its garden, with a kitchen that becomes the heart of the home.",
    story: [
      "The ground floor now runs uninterrupted from the street to the garden. Full-height sliding doors let the kitchen and dining area spill outside.",
      "Upstairs, bedrooms are kept simple and restful, with built-in wardrobes faced in fluted timber and tall windows that frame the trees.",
      "Natural ventilation guided the plan, so the house stays cool with far less air conditioning.",
    ],
    palette: ["#ECE7DC", "#A7B29A", "#5F6E55", "#2E332B"],
    cover: "/placeholders/sofa-warm-p.jpg",
    coverAlt: "Low linen sofa and floor lamp",
  },
  {
    slug: "sai-kung-guesthouse",
    title: "Sai Kung Guesthouse",
    category: "Hospitality",
    location: "Hong Kong",
    year: 2024,
    area: "240 m²",
    scope: ["Concept design", "Furniture", "Styling"],
    summary: "Six guest rooms by the sea, each with a bed, a chair, a lamp and a view.",
    story: [
      "The owners wanted a guesthouse that felt like staying with friends. Each room has the same few pieces, chosen well, so the view does the rest.",
      "Lime-washed walls, linen and woven grass soften the salt air, and every room has a deep sill to sit on.",
      "A shared kitchen and long table on the ground floor gives guests a reason to meet.",
    ],
    palette: ["#E8E6DD", "#B7BBA8", "#6F7663", "#30352E"],
    cover: "/placeholders/bed-sage-p.jpg",
    coverAlt: "Bedroom with linen bedding and a bedside lamp in soft green-grey light",
  },
  {
    slug: "studio-loft-office",
    title: "Studio Loft Office",
    category: "Commercial",
    location: "Hong Kong",
    year: 2023,
    area: "320 m²",
    scope: ["Workplace strategy", "Space planning", "Acoustic design", "FF&E"],
    summary:
      "An industrial loft turned into a flexible studio for a creative agency, balancing open collaboration and quiet focus.",
    story: [
      "Interviews with the team shaped a plan of zones rather than rooms: a busy front of house, a central project table and quiet booths along the back wall.",
      "Acoustic felt, timber slats and planting soften the concrete shell without hiding its character.",
      "Furniture on castors means the main floor can turn into an event space in under an hour.",
    ],
    palette: ["#E6E2DC", "#B4ACA2", "#6B635B", "#2B2A28"],
    cover: "/placeholders/kitchen-umber.jpg",
    coverAlt: "Dark oak kitchen with a long island and two paper pendants",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
