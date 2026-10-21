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
cp .env.example .env.local   # set site URL and WhatsApp number
npm run dev
```

`npm run build` writes the static site to `out/`. `npm run lint` and `npm run typecheck` should both pass.

## Content

Placeholder content lives in `lib/projects.ts`, `lib/experience.ts` and `lib/site.ts`. Projects without a `cover` image render generated plan artwork in the project's palette. Add `cover` / `gallery` paths to show real photos; they resolve through `lib/assets.ts` against `NEXT_PUBLIC_ASSET_BASE_URL` (Firebase Storage) or `/public`.

Because static export has no image optimizer, upload images already resized (for example 1600px and 800px WebP) and set `Cache-Control: public, max-age=31536000` on them in Firebase Storage. `storage.cors.json` can be applied with `gsutil cors set storage.cors.json gs://<bucket>`.

## Contact

The footer form on every page validates name, email and message, then opens WhatsApp (`wa.me`) with the enquiry filled in. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to the real number.

## Deploy

Merging to `main` deploys automatically: `.github/workflows/firebase-hosting-merge.yml` lints, builds and publishes `out/` to the live Firebase Hosting site. Every pull request also gets a preview URL (valid 7 days), posted as a PR comment by `.github/workflows/firebase-hosting-pull-request.yml`.

The workflows need, under **Settings > Secrets and variables > Actions**:

- Secret `FIREBASE_SERVICE_ACCOUNT_KATHYKAO_PERSONAL_WEBSITE`: JSON key of a service account with the Firebase Hosting Admin, Firebase Authentication Admin and API Keys Viewer roles.
- Variables with the same names as in `.env.example` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_FIREBASE_*`, optional `NEXT_PUBLIC_ASSET_BASE_URL`). They are baked into the static build.

To deploy by hand instead:

```bash
npm i -g firebase-tools
firebase login
# set the project id in .firebaserc
npm run deploy
```
