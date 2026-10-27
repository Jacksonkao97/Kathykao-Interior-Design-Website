// Resolves an asset path (project photos, GLB models) against the asset CDN.
// In production this points at Firebase Storage; with no bucket configured
// it falls back to files in /public.
// Defaults to the public download endpoint of the project's Firebase Storage
// bucket when NEXT_PUBLIC_ASSET_BASE_URL is not set.
const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const base = (
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
  (bucket ? `https://firebasestorage.googleapis.com/v0/b/${bucket}/o` : "")
).replace(/\/$/, "");

export function assetUrl(path: string) {
  // Site-rooted paths ("/placeholders/…") are files in /public, served as is.
  if (path.startsWith("/")) return path;
  const clean = path.replace(/^\//, "");
  if (!base) return `/${clean}`;
  // Firebase Storage REST URLs need the object path encoded as one segment.
  if (base.includes("firebasestorage.googleapis.com")) {
    return `${base}/${encodeURIComponent(clean)}?alt=media`;
  }
  return `${base}/${clean}`;
}
