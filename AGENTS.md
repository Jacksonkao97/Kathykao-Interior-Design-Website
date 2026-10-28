# Kathy Kao Interior Design — agent guide

Portfolio website for interior designer Kathy Kao. Pages: home (photo
slideshow, a turning clay 3D model of the featured project, latest work),
projects (index and one static page per project), experience (labelled
"About" in the nav), and a contact form in the footer of every page.

## Layout

- The Next.js project lives at the **repo root**: `app/`, `components/`, `lib/`,
  `package.json`. Do not add a `src/` folder or nest the app in a subfolder.
- `app/`: routes plus the metadata routes (`sitemap.ts`, `robots.ts`,
  `manifest.ts`, `opengraph-image.tsx` and one per project under
  `projects/[slug]/`) and the icons (`favicon.ico`, `icon.svg`,
  `apple-icon.png`; the manifest's app icons are in `public/icons/`).
  `scripts/make-icons.mjs` (`npm run icons`) draws all the icons.
- `assets/fonts/`: Libre Caslon Text and Jost as .woff, for the share images
  (`lib/og.ts`) and the icons. Not served on the site.
- `components/ui/`: shadcn/ui components, written by hand (the shadcn CLI
  registry may be unreachable). Follow the shadcn "new-york" style.
- `components/home/`: home page sections (hero slideshow, featured model,
  latest work, section frame with side labels).
- `components/three/`: the React Three Fiber clay model (`clay-model.tsx`),
  the study apartment it shows by default (`apartment.ts`, plain boxes,
  cylinders and spheres in metres) and the code that turns the apartment or
  an uploaded .glb into merged clay meshes (`clay-geometry.ts`).
- `lib/`: site config (`site.ts`), placeholder home copy (`home.ts`), the
  project and About loaders (`projects.ts`, `experience.ts`), structured data,
  asset URLs and Firebase setup.
- `content/projects/`: one JSON file per project; the file name is the URL
  slug. Kathy edits these in Pages CMS (see "Editing content").
- `content/site.json`: contact details, social links and the featured
  project, also edited in the CMS.
- `content/about.json`: the About page (`/experience/`): headline, intro, bio,
  experience, education, skills and awards, also edited in the CMS.
- `public/images/projects/`: photos uploaded through the CMS, served at
  `/images/projects/…`. `public/models/projects/`: .glb models uploaded
  through the CMS, served at `/models/projects/…`.
- `public/placeholders/`: stand-in renders used until real photography
  exists. Referenced with site-rooted paths (`/placeholders/…`), which
  `assetUrl()` passes through unchanged.

## Stack

- Next.js 16 App Router with a **static export** (`output: "export"`,
  `trailingSlash: true`). Every route must prerender at build time, so no server
  features: no Server Actions, route handlers that read requests, `cookies()`,
  `headers()`, rewrites, redirects or ISR. Dynamic routes need
  `generateStaticParams` and `dynamicParams = false`. Metadata routes export
  `dynamic = "force-static"`.
- `next/image` runs with `images.unoptimized`. Reference images through
  `assetUrl()` in `lib/assets.ts`. Images uploaded to Firebase Storage must be
  resized first; CMS photos in `public/images/projects/` are resized and
  stripped of camera metadata in `out/` by `scripts/resize-images.mjs`
  (`postbuild`).
- Tailwind CSS v4. Theme tokens live in `app/globals.css` (cream paper and
  soft ink, after Norm Architects). Fonts are Jost (sans, body and caps
  labels) and Libre Caslon Text (serif). Utilities: `caps` for small
  letter-spaced labels, `title-caps` for bold serif titles, `page-inner` for
  the home page gutter.
- React Three Fiber + drei for 3D.
- TypeScript 6. Stay below 6.1 until `typescript-eslint` supports newer
  versions.

## The home page

- Order: hero slideshow, featured project, latest work, then the footer's
  contact section. Copy and slides live in `lib/home.ts`; latest work shows
  the first six projects (newest year first, then `order`) in two rows (wide photo first,
  then mirrored).
- The page `<h1>` is visually hidden; slide and section titles are `<h2>`.
- The header is fixed. On `/` it sits over the hero (element `#hero`) in light
  text and turns solid once the hero scrolls away; other pages get a spacer.
- The featured model shows a still render first. three.js loads with
  `next/dynamic` and `ssr: false` only when the section nears the screen,
  renders only while on screen, and never loads without WebGL. It turns
  slowly and can be dragged; it stops turning for reduced motion. Don't use
  drei helpers that download assets at runtime (for example `Environment`
  presets).
- The featured project is picked in Site settings. If it has a `model`
  (.glb), that model shows in clay over the project's cover photo; otherwise
  the study apartment shows over `/placeholders/model-clay.jpg`. Uploaded
  models are centred, set on the ground and scaled to the apartment's
  footprint; their materials map to clay tones by colour and their textures
  are never decoded. Draco and meshopt models load with decoders the bundler
  copies into the build.
- The model turns under a fixed sun (the group rotates, not the camera), so
  shadows sweep through the rooms. Parts carry a `tone` that picks one of a
  few clay materials.
- Phones drop the WebGL context when a page uses too much GPU memory, which
  used to leave a blank box. Keep the model light: draw one merged mesh per
  tone (never a mesh per part), and keep the phone limits in `ClayModel`
  (pixel ratio 1.5, 1024 shadow map). If the context is lost or the canvas
  throws, `FeaturedModel` removes it and shows the still image again.
- Scroll fades: add `data-reveal` to an element and `<ScrollFades>` (in the
  root layout) fades it in on entering the screen and out on leaving. Set
  `--reveal-delay` to stagger a row. Don't put it on the hero.
- Mutating three.js objects inside `useFrame` is intended.
  `react-hooks/immutability` is turned off only for `components/three/**`.
- Shadows use `shadows="percentage"`, because three r18x removed
  `PCFSoftShadowMap`. The `THREE.Clock` deprecation warning comes from R3F
  itself and is expected.

## Content rules

- **Never show prices** anywhere on the site.
- Enquiries go through the footer form (name, email, description), which
  opens WhatsApp via `wa.me/<whatsappNumber>` with the message filled in.
  There is no backend.
- Placeholder copy is fine, but keep it in `lib/` data files or `content/`,
  not hard-coded in components.

## Editing content

- Kathy edits projects, site settings and the About page at app.pagescms.org, signed in by email as a Pages CMS
  collaborator (no GitHub account). `.pages.yml` defines the form. Saving
  commits to `main`, which deploys the site in a few minutes.
- `lib/projects.ts` reads `content/projects/*.json` at build time and fails
  the build with the file name when a project is invalid, so a bad edit never
  goes live. Import its values only in server components and metadata routes.
- When you add a project field, add it to the `Project` type, the loader and
  `.pages.yml` together. `settings.content.merge` keeps keys the form doesn't
  show (such as `palette`).
- `content/site.json` holds the contact details: email, WhatsApp number,
  city, other areas served and social links, plus `featuredProject` (stored
  by the CMS as `content/projects/<slug>.json`) and optional `featuredText`.
  `lib/site.ts` imports it into `siteConfig` and checks it at build time; the
  footer hides empty links. `lib/site.ts` is also used by client components,
  so it must not import `lib/projects.ts`.
- A project's `model` must be a .glb that exists under `public/` and is under
  30 MB, or the build fails. The CMS form asks for under 15 MB.
- `content/about.json` feeds `lib/experience.ts`, which drops half-filled
  rows; the About page hides empty sections.

## SEO

SEO is a top priority. For every new page:
- Export `metadata` or `generateMetadata` built with `pageMetadata()` from
  `lib/seo.ts`: title, description, canonical URL (with a trailing slash),
  Open Graph and X tags. Next merges metadata shallowly, so a page that sets
  `openGraph` by hand loses the site name and share image.
- Add JSON-LD with `<JsonLd>` (see `lib/structured-data.ts`), including a
  `BreadcrumbList`.
- Add the route to `app/sitemap.ts`.
- Use one `<h1>` per page and semantic landmarks, and give every image meaningful alt
  text.

Share images are drawn at build time with `next/og` in the site's fonts. The
home one sits beside the featured project's cover; a project's sits beside its
own cover, so CMS edits show in link previews. A segment's opengraph-image file
does not override a page's own `openGraph.images`, so the project page links
to its image itself. The site description in search results comes from
"Search description" in Site settings when Kathy fills it in.

## Firebase

- Project `kathykao-personal-website`. Hosting serves `out/`, with cache headers
  set in `firebase.json`.
- Project photos go under `projects/` and 3D models under `models/` in Storage.
  `storage.rules` allows public reads there and no writes from the web.
- Config comes from `NEXT_PUBLIC_*` env vars (see `.env.example`). Copy it to
  `.env.local` for local work. CI reads them from the repo's Actions variables.
- GitHub Actions deploy PR previews and merges to `main`
  (`.github/workflows/`).
- Google Analytics 4 (`components/analytics.tsx`, gtag via `next/script`)
  loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, which only the
  merge-to-`main` workflow does, so previews and local work aren't counted.

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
