import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Shared pieces of the link preview images (app/opengraph-image.tsx and
// app/projects/[slug]/opengraph-image.tsx): the site's fonts, colours and a
// loader that crops a photo to fit. Build time only.

export const shareImageSize = { width: 1200, height: 630 };

export const ogColors = { paper: "#f5f1e5", ink: "#383839", muted: "#6b6a66" };

const font = (file: string) => fs.readFile(path.join(process.cwd(), "assets/fonts", file));

/** Libre Caslon Text for titles and Jost for the small caps labels, as on the site. */
export async function ogFonts() {
  const [caslon, caslonBold, jost] = await Promise.all([
    font("libre-caslon-text-latin-400-normal.woff"),
    font("libre-caslon-text-latin-700-normal.woff"),
    font("jost-latin-400-normal.woff"),
  ]);
  return [
    { name: "Caslon", data: caslon, weight: 400 as const, style: "normal" as const },
    { name: "Caslon", data: caslonBold, weight: 700 as const, style: "normal" as const },
    { name: "Jost", data: jost, weight: 400 as const, style: "normal" as const },
  ];
}

/**
 * A photo from public/ cropped to `width` x `height`, as a data URL. Camera
 * photos from the CMS can be many megabytes, so they are shrunk first.
 * Returns undefined for photos that aren't in public/ or can't be read, and
 * the image is drawn without one.
 */
export async function ogPhoto(src: string | undefined, width: number, height: number) {
  if (!src?.startsWith("/")) return undefined;
  try {
    const file = path.join(process.cwd(), "public", decodeURIComponent(src));
    const jpeg = await sharp(file).rotate().resize(width, height, { fit: "cover" }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return undefined;
  }
}

/** Small letter-spaced sans caps, like the site's `caps` labels. */
export const capsStyle = {
  fontFamily: "Jost",
  fontSize: 20,
  letterSpacing: 4,
  textTransform: "uppercase",
  color: ogColors.muted,
} as const;

/** Bold serif caps with wide tracking, like the site's `title-caps`. */
export const titleCapsStyle = {
  fontFamily: "Caslon",
  fontWeight: 700,
  textTransform: "uppercase",
  color: ogColors.ink,
} as const;
