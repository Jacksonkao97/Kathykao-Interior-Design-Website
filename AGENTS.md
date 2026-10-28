# Kathy Kao Interior Design — agent guide

Portfolio website for interior designer Kathy Kao. Pages: home (photo
slideshow, a turning clay 3D model of the featured project, latest work),
projects (index and one static page per project), experience (labelled
"About" in the nav), and a contact form in the footer of every page.

## Layout

- The Next.js project lives at the **repo root**: `app/`, `components/`, `lib/`,
  `package.json`. Do not add a `src/` folder or nest the app in a subfolder.
- `app/`: routes plus the metadata routes (`sitemap.ts`, `robots.ts`,
  `manifest.ts`, `opengraph-image.tsx`).
- `components/ui/`: shadcn/ui components, written by hand (the shadcn CLI
  registry may be unreachable). Follow the shadcn "new-york" style.
- `components/home/`: home page sections (hero slideshow, featured model,
  latest work, section frame with side labels).
- `components/three/`: the React Three Fiber clay model (`clay-model.tsx`)
  and the apartment it shows (`apartment.ts`, plain boxes, cylinders and
  spheres in metres).
- `lib/`: site config (`site.ts`), placeholder content (`home.ts`,
  `experience.ts`), the project loader (`projects.ts`), structured data,
  asset URLs and Firebase setup.
- `content/projects/`: one JSON file per project; the file name is the URL
  slug. Kathy edits these in Pages CMS (see "Editing content").
- `content/site.json`: contact details and social links, also edited in the
  CMS.
- `public/images/projects/`: photos uploaded through the CMS, served at
  `/images/projects/…`.
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
- The model turns under a fixed sun (the group rotates, not the camera), so
  shadows sweep through the rooms. Parts carry a `tone` that picks one of a
  few clay materials.
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

- Kathy edits projects and site settings at app.pagescms.org, signed in by email as a Pages CMS
  collaborator (no GitHub account). `.pages.yml` defines the form. Saving
  commits to `main`, which deploys the site in a few minutes.
- `lib/projects.ts` reads `content/projects/*.json` at build time and fails
  the build with the file name when a project is invalid, so a bad edit never
  goes live. Import its values only in server components and metadata routes.
- When you add a project field, add it to the `Project` type, the loader and
  `.pages.yml` together. `settings.content.merge` keeps keys the form doesn't
  show (such as `palette`).
- `content/site.json` holds the contact details: email, WhatsApp number,
  city, other areas served and social links. `lib/site.ts` imports it into
  `siteConfig` and checks it at build time; the footer hides empty links.

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
