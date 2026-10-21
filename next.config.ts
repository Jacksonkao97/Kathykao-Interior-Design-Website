import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export: every route is prerendered to `out/` and served by
  // Firebase Hosting straight from its CDN.
  output: "export",
  // Emit `/projects/index.html` instead of `/projects.html` so Firebase
  // Hosting serves clean URLs without rewrites.
  trailingSlash: true,
  images: {
    // The default image optimizer needs a server. Images are pre-sized and
    // served from Firebase Storage / Hosting with long cache headers instead.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
