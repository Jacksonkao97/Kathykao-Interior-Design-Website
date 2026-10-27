// Shrinks the project photos in the static export after `next build`.
// Photos uploaded through Pages CMS land in public/images/projects/ at full
// camera size, and next/image runs unoptimized, so this keeps the deployed
// copies small. Only out/ is touched; the originals in the repo stay as
// uploaded. Rotating by EXIF and re-encoding also strips camera metadata such
// as GPS location from the published files.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "out/images/projects");
const MAX_EDGE = 2400;
const MAX_BYTES = 400 * 1024;

const encoders = {
  ".jpg": (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  ".jpeg": (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  ".png": (img) => img.png({ compressionLevel: 9, palette: true, quality: 85 }),
  ".webp": (img) => img.webp({ quality: 80 }),
};

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(file);
    else yield file;
  }
}

let changed = 0;
for await (const file of walk(DIR)) {
  const encode = encoders[path.extname(file).toLowerCase()];
  if (!encode) continue;
  const input = await fs.readFile(file);
  const { width = 0, height = 0, exif } = await sharp(input).metadata();
  const tooBig = Math.max(width, height) > MAX_EDGE || input.length > MAX_BYTES;
  if (!tooBig && !exif) continue;

  const output = await encode(
    sharp(input).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true }),
  ).toBuffer();
  if (output.length < input.length || exif) {
    await fs.writeFile(file, output);
    changed++;
    console.log(
      `resize-images: ${path.relative(DIR, file)} ${Math.round(input.length / 1024)} KB -> ${Math.round(output.length / 1024)} KB`,
    );
  }
}
console.log(`resize-images: ${changed} photo(s) resized or stripped in out/images/projects`);
