# Kathy Kao — Interior Design

Portfolio site for an interior designer. The home page tells the design story in 3D: a flat floor plan is sketched on paper, the walls rise, furniture drops in and the room is lit, all driven by scroll.

## Stack

- **Next.js 16 (App Router)** with a static export (`output: "export"`), so every page is prerendered HTML for SEO.
- **Tailwind CSS v4 + shadcn/ui** components in `components/ui`.
- **React Three Fiber + drei** for the 3D scene, loaded only in the browser after the page text.
- **GSAP ScrollTrigger** maps scroll position to story progress.
- **Zustand** shares story progress between the scroll handler, the 3D scene and the step indicator.
- **Firebase Hosting** serves the `out/` folder with long-lived cache headers.

## Structure

```
app/                     routes (home, projects, projects/[slug], experience) + sitemap, robots, manifest, OG image
components/home/         scroll story section and 2D plan fallback
components/three/        3D scene, floor plan data and scroll timeline
components/ui/           shadcn/ui components
lib/                     site config, placeholder content, store, structured data
```

## Development

```bash
npm install
cp .env.example .env.local   # Firebase config is prefilled; set the WhatsApp number
npm run dev
```

`npm run build` writes the static site to `out/`. `npm run lint` and `npm run typecheck` should both pass.

## Content

Placeholder content lives in `lib/projects.ts`, `lib/experience.ts` and `lib/site.ts`. Projects without a `cover` image render generated plan artwork in the project's palette.

### Images and models (Firebase Storage)

The Firebase project is `kathykao-personal-website`. Upload project photos under `projects/` and 3D models under `models/` in its Storage bucket, then reference them by path, e.g. `cover: "projects/harbour-view/cover.webp"`. `lib/assets.ts` turns that into the bucket's public download URL (or `/public/...` when no bucket is configured).

- `storage.rules` makes `projects/` and `models/` publicly readable and blocks all writes from the web; upload from the Firebase console or CLI. Deploy rules with `firebase deploy --only storage`.
- Static export has no image optimizer, so upload images already resized (for example 1600px and 800px WebP).
- Set long caching on uploads so browsers and the CDN keep them: `gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" "gs://kathykao-personal-website.firebasestorage.app/projects/**"`. Use new filenames when replacing an image.
- `storage.cors.json` allows the 3D loader to fetch models cross-origin: `gsutil cors set storage.cors.json gs://kathykao-personal-website.firebasestorage.app`.

`lib/firebase.ts` exposes a lazily initialised Firebase app and Storage instance for browser code that needs the SDK (for example listing a folder or saving enquiries later). Nothing imports it yet, so it adds no weight to pages.

## Contact

The footer form on every page validates name, email and message, then opens WhatsApp (`wa.me`) with the enquiry filled in. The WhatsApp number, email, social links and service areas live in `content/site.json`, edited as **Site settings** in Pages CMS.

## Deploy

Merging to `main` deploys automatically: `.github/workflows/firebase-hosting-merge.yml` lints, builds and publishes `out/` to the live Firebase Hosting site. Every pull request also gets a preview URL (valid 7 days), posted as a PR comment by `.github/workflows/firebase-hosting-pull-request.yml`.

The workflows need, under **Settings > Secrets and variables > Actions**:

- Secret `FIREBASE_SERVICE_ACCOUNT_KATHYKAO_PERSONAL_WEBSITE`: JSON key of a service account with the Firebase Hosting Admin, Firebase Authentication Admin and API Keys Viewer roles.
- Variables with the same names as in `.env.example` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_FIREBASE_*`, optional `NEXT_PUBLIC_ASSET_BASE_URL`). They are baked into the static build.

To deploy by hand instead:

```bash
npm i -g firebase-tools
firebase login
npm run deploy               # project is set in .firebaserc
```
