// Placeholder portfolio content. Replace with real projects; `cover` and
// `gallery` paths resolve through assetUrl() so they can live in Firebase
// Storage. Until real photos exist, pages render generated plan artwork.

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
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
