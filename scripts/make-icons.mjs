// Draws the site icons: an ink Libre Caslon "K" on cream paper, the same
// letter as the serif titles. Run `npm run icons` after changing the mark or
// the colours, then commit the files it writes:
//
//   app/favicon.ico      16, 32 and 48 px, for browser tabs and bookmarks
//   app/icon.svg         scales to any size in browsers that take SVG icons
//   app/apple-icon.png   180 px home screen icon on iPhone and iPad
//   public/icons/        192 and 512 px app icons for the web manifest, plus a
//                        maskable one with room for Android's round crop
//
// The glyph is turned into a path, so none of the files need the font.
import fs from "node:fs/promises";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const ROOT = process.cwd();
const CREAM = "#f5f1e5";
const INK = "#383839";
const LETTER = "K";

const fontFile = await fs.readFile(path.join(ROOT, "assets/fonts/libre-caslon-text-latin-700-normal.woff"));
const font = opentype.parse(fontFile.buffer.slice(fontFile.byteOffset, fontFile.byteOffset + fontFile.byteLength));

/** The letter on a 512 square, its outline centred and `scale` of the square tall. */
function iconSvg(scale) {
  const glyph = font.charToGlyph(LETTER).getPath(0, 0, 512);
  const box = glyph.getBoundingBox();
  const k = (512 * scale) / (box.y2 - box.y1);
  const x = 256 - ((box.x1 + box.x2) / 2) * k;
  const y = 256 - ((box.y1 + box.y2) / 2) * k;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">`,
    `<rect width="512" height="512" fill="${CREAM}"/>`,
    `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(4)})" fill="${INK}" d="${glyph.toPathData(1)}"/>`,
    `</svg>`,
  ].join("");
}

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// An .ico is a small directory of images; modern browsers accept PNG entries.
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

const mark = iconSvg(0.72);
// A larger letter stays legible at 16 px in a browser tab.
const tab = iconSvg(0.82);
// Android crops maskable icons to a circle inside the middle 80%.
const maskable = iconSvg(0.5);

const write = async (file, data) => {
  await fs.mkdir(path.dirname(path.join(ROOT, file)), { recursive: true });
  await fs.writeFile(path.join(ROOT, file), data);
  console.log(`make-icons: wrote ${file}`);
};

await write("app/icon.svg", mark);
await write("app/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tab, size) })))));
await write("app/apple-icon.png", await png(mark, 180));
await write("public/icons/icon-192.png", await png(mark, 192));
await write("public/icons/icon-512.png", await png(mark, 512));
await write("public/icons/icon-maskable-512.png", await png(maskable, 512));
