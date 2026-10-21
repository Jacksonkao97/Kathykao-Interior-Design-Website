// Resolves an asset path (project photos, GLB models) against the asset CDN.
// In production this points at Firebase Storage; locally it falls back to
// files in /public.
const base = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").replace(/\/$/, "");

export function assetUrl(path: string) {
  const clean = path.replace(/^\//, "");
  if (!base) return `/${clean}`;
  // Firebase Storage REST URLs need the object path encoded as one segment.
  if (base.includes("firebasestorage.googleapis.com")) {
    return `${base}/${encodeURIComponent(clean)}?alt=media`;
  }
  return `${base}/${clean}`;
}
