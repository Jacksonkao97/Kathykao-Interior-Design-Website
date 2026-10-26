# Kathy Kao Interior Design — agent guide

Portfolio website for interior designer Kathy Kao. Pages: home (a scroll-driven
3D story), projects (index and one static page per project), experience, and a
contact form in the footer of every page.

## Layout

- The Next.js project lives at the **repo root**: `app/`, `components/`, `lib/`,
  `package.json`. Do not add a `src/` folder or nest the app in a subfolder.
- `app/`: routes plus the metadata routes (`sitemap.ts`, `robots.ts`,
  `manifest.ts`, `opengraph-image.tsx`).
- `components/ui/`: shadcn/ui components, written by hand (the shadcn CLI
  registry may be unreachable). Follow the shadcn "new-york" style.
- `components/home/`: the scroll story section and its 2D plan fallback.
- `components/three/`: the React Three Fiber scene (`room-scene.tsx`), floor
  plan data (`plan.ts`) and scroll windows for each phase (`timeline.ts`).
- `lib/`: site config (`site.ts`), placeholder content (`projects.ts`,
  `experience.ts`), the Zustand store, structured data, asset URLs and
  Firebase setup.

## Stack

- Next.js 16 App Router with a **static export** (`output: "export"`,
  `trailingSlash: true`). Every route must prerender at build time, so no server
  features: no Server Actions, route handlers that read requests, `cookies()`,
  `headers()`, rewrites, redirects or ISR. Dynamic routes need
  `generateStaticParams` and `dynamicParams = false`. Metadata routes export
  `dynamic = "force-static"`.
- `next/image` runs with `images.unoptimized`. Upload images to Firebase
  Storage already resized, and reference them through `assetUrl()` in
  `lib/assets.ts`.
- Tailwind CSS v4. Theme tokens live in `app/globals.css` (warm paper and ink
  palette, terracotta accent, blueprint blue). Fonts are Fraunces (serif
  headings) and Manrope (body).
- React Three Fiber + drei for 3D, GSAP ScrollTrigger for scroll, Zustand
  for shared state.
- TypeScript 6. Stay below 6.1 until `typescript-eslint` supports newer
  versions.

## The home page scroll story

- Five steps: sketch → plan → build → furnish → light. Each step is one screen
  of text over a sticky canvas. Step text is server-rendered, so it stays in the
  HTML for SEO. Only the first step uses the page `<h1>`.
- ScrollTrigger writes progress (0 → 1) to `useStoryStore`. The scene reads it
  every frame with `useStoryStore.getState()` inside `useFrame`, never through
  React state, so scrolling doesn't re-render components.
- Phase timing lives in `components/three/timeline.ts`. Keep it lined up with
  the step copy in `components/home/blueprint-story.tsx`.
- three.js loads with `next/dynamic` and `ssr: false`, and stops rendering
  when the section is off screen. Browsers without WebGL get the static
  `PlanSketch`. Don't use drei helpers that download assets at runtime (for
  example `Environment` presets).
- Mutating three.js objects inside `useFrame` is intended.
  `react-hooks/immutability` is turned off only for `components/three/**`.
- Shadows use `shadows="percentage"`, because three r18x removed
  `PCFSoftShadowMap`. The `THREE.Clock` deprecation warning comes from R3F
  itself and is expected.

## Content rules

- **Never show prices** anywhere on the site.
- Enquiries go through the footer form (name, email, description), which
  opens WhatsApp via `wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>` with the message
  filled in. There is no backend.
- Placeholder copy is fine, but keep it in `lib/` data files, not hard-coded in
  components.

## SEO

SEO is a top priority. For every new page:
- Export `metadata` or `generateMetadata` with a title, description and a
  canonical URL (`alternates.canonical`, with a trailing slash).
- Add JSON-LD with `<JsonLd>` (see `lib/structured-data.ts`), including a
  `BreadcrumbList`.
- Add the route to `app/sitemap.ts`.
- Use one `<h1>` per page and semantic landmarks, and give every image meaningful alt
  text.

## Firebase

- Project `kathykao-personal-website`. Hosting serves `out/`, with cache headers
  set in `firebase.json`.
- Project photos go under `projects/` and 3D models under `models/` in Storage.
  `storage.rules` allows public reads there and no writes from the web.
- Config comes from `NEXT_PUBLIC_*` env vars (see `.env.example`). Copy it to
  `.env.local` for local work. CI reads them from the repo's Actions variables.
- GitHub Actions deploy PR previews and merges to `main`
  (`.github/workflows/`).

## Checks

Run these before pushing, in this order. CI runs them the same way:

```bash
npm run lint
npm run build      # also generates the route types (PageProps, LayoutProps)
npm run typecheck  # run after build, or it can't find the generated types
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
