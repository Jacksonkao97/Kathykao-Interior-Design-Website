import fs from "node:fs";
import path from "node:path";

// Portfolio projects, one JSON file per project in content/projects/. Kathy
// edits them through Pages CMS (.pages.yml), which commits to `main`; the
// file name is the project's URL slug. Read at build time only, so import
// values from this module in server components and metadata routes, and
// only the types elsewhere.
//
// `cover` and gallery paths resolve through assetUrl(). Photos uploaded in
// the CMS live in public/images/projects/ and are resized after the build
// (scripts/resize-images.mjs). Covers under /placeholders/ are stand-in
// renders; without a cover, pages draw plan artwork in the project palette.
// `model` is a .glb uploaded to public/models/projects/, shown in white clay
// on the home page when the project is featured.

export const categories = ["Residential", "Hospitality", "Commercial"] as const;

export type GalleryImage = {
  image: string;
  /** Describes what the photo shows, for its alt text. */
  alt: string;
};

export type Project = {
  slug: string;
  title: string;
  category: (typeof categories)[number];
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
  gallery: GalleryImage[];
  /** A .glb 3D model, site-rooted, e.g. /models/projects/harbour-view.glb. */
  model?: string;
  /** Orders projects from the same year; lower comes first. */
  order?: number;
};

const CONTENT_DIR = path.join(process.cwd(), "content/projects");
const PUBLIC_DIR = path.join(process.cwd(), "public");

// Bigger models take too long to download on a phone and can run it out of
// memory. The CMS form suggests 15 MB.
const MAX_MODEL_MB = 30;

// Plan artwork colours for projects that don't set their own.
const DEFAULT_PALETTE: Project["palette"] = ["#ECE6DB", "#C8B9A2", "#8C7860", "#3A3631"];

const isText = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";
const textList = (value: unknown) => (Array.isArray(value) ? value.filter(isText) : []);

// The CMS checks required fields, but a hand edit can still slip through, so
// fail the build with a message that names the file instead of publishing a
// broken page.
function readProject(file: string): Project {
  const slug = path.basename(file, ".json");
  const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
  const fail = (problem: string): never => {
    throw new Error(`content/projects/${file}: ${problem}`);
  };

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    fail("the file name becomes the page URL, so use lowercase letters, numbers and dashes only");
  }
  for (const key of ["title", "location", "area", "summary"] as const) {
    if (!isText(data[key])) fail(`"${key}" is missing`);
  }
  if (!categories.includes(data.category)) fail(`"category" must be one of ${categories.join(", ")}`);
  if (!Number.isInteger(data.year)) fail(`"year" must be a whole number`);

  const model = isText(data.model) ? (data.model.startsWith("/") ? data.model : `/${data.model}`) : undefined;
  if (model) {
    if (!model.toLowerCase().endsWith(".glb")) fail(`"model" must be a .glb file`);
    const file = path.join(PUBLIC_DIR, decodeURIComponent(model));
    if (!fs.existsSync(file)) fail(`the model ${model} is not in public/`);
    const mb = fs.statSync(file).size / 1024 / 1024;
    if (mb > MAX_MODEL_MB) fail(`the model ${model} is ${mb.toFixed(0)} MB; keep it under ${MAX_MODEL_MB} MB`);
  }

  const palette = Array.isArray(data.palette) && data.palette.length === 4 ? data.palette : DEFAULT_PALETTE;
  const cover = isText(data.cover) ? data.cover : undefined;
  const gallery: GalleryImage[] = (Array.isArray(data.gallery) ? data.gallery : [])
    .filter((item: Partial<GalleryImage> | null) => isText(item?.image))
    .map((item: Partial<GalleryImage>) => ({
      image: item.image!,
      alt: isText(item.alt) ? item.alt : `${data.title}, ${data.location}`,
    }));

  return {
    slug,
    title: data.title,
    category: data.category,
    location: data.location,
    year: data.year,
    area: data.area,
    scope: textList(data.scope),
    summary: data.summary,
    story: textList(data.story),
    palette,
    cover,
    coverAlt: cover && isText(data.coverAlt) ? data.coverAlt : undefined,
    gallery,
    model,
    order: typeof data.order === "number" ? data.order : undefined,
  };
}

/** Newest year first; within a year by `order`, then by title. */
export const projects: Project[] = fs
  .readdirSync(CONTENT_DIR)
  .filter((file) => file.endsWith(".json"))
  .map(readProject)
  .sort(
    (a, b) =>
      b.year - a.year ||
      (a.order ?? Infinity) - (b.order ?? Infinity) ||
      a.title.localeCompare(b.title),
  );

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
