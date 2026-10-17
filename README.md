# Ganesh Electricals

Responsive, animated company website with the original company content and page URLs.

## Stack

| Layer | Implementation |
|---|---|
| Framework | Next.js 16.4 App Router, React 19.3, TypeScript |
| Hosting | Static HTML export for GitHub Pages |
| 3D | Three.js 0.186, React Three Fiber 9.8, selective post-processing |
| Animation | Native CSS transitions, automatic image crossfades, Three.js animation |
| Styling/state | Scoped CSS classes and React state |

Extra scroll/state/animation frameworks are deliberately avoided: this site does
not need three overlapping animation engines or scroll hijacking.

## Local development

Node.js 24 and npm are recommended.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Development links use clean internal routes; the
static build produces the original `.html` filenames for publication.

## Test the actual GitHub Pages build

```powershell
$env:NEXT_PUBLIC_BASE_PATH='/Ge'
$env:NEXT_PUBLIC_SITE_URL='https://parama-guru.github.io/Ge'
$env:NEXT_PUBLIC_INDEXABLE='true'
npm run build
npm run test:export
npm run start
```

Open http://127.0.0.1:3000/Ge/.

In another terminal:

```powershell
$env:SITE_URL='http://127.0.0.1:3000/Ge'
npm run test:site
```

The browser tests use a locally installed Microsoft Edge browser. They verify
original content, all 45 project rows, both organisation hierarchies, navigation,
responsive widths, accessibility, automatic image rotation, pause/manual
controls, data-saving behaviour and the real Three.js renderer.

The static export check runs in GitHub Actions without a browser and checks
all original HTML files, local assets/links, canonical URLs, unique titles,
metadata, sitemap and exclusion of raw archives.

## Push and deploy

Remote: https://github.com/Parama-Guru/Ge.git

```powershell
git push -u origin main
```

Then:

1. Open the repository's **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. In **Actions**, run or rerun **Deploy website to GitHub Pages**.
   The first push can start a run before Pages is enabled; rerun it after
   setting the source if that happens.

The workflow builds and deploys automatically on subsequent pushes to `main`.
No personal access token needs to be committed or added to the application.

Expected published address after successful deployment:
**https://parama-guru.github.io/Ge/**

The code is prepared for this address; local validation does not mean a remote
deployment has happened. The first push and repository setting are owner actions.

## Page and content continuity

Published URLs:

- `/Ge/` and `/Ge/index.html`
- `/Ge/founder.html`, `/Ge/team.html`, `/Ge/org.html`
- `/Ge/project1.html` through `/Ge/project4.html`
- `/Ge/ehs.html`, `/Ge/downloads.html`

About, Features, Clients and Contact retain their homepage anchors.
All 45 project rows, original statistics, dates, testimonials and the two
different organisation charts are preserved. No archive/research links or
presentation-mode controls appear on the customer-facing site.

## Loading, animation and SEO

- Banner images change automatically every five seconds while visible.
  Rotation pauses for hover/focus, hidden tabs, explicit pause, reduced motion
  and Data Saver. Previous/next controls remain available.
- Responsive 480/960/1600px WebP banner images avoid sending desktop-sized images
  to small screens. Only current/transition images are mounted.
- Regenerate image variants with `npm run optimize:media` after replacing the
  full-width banner files.
- After changing the 3D scene, point `SITE_URL` at the running local preview and
  run `npm run render:poster`, then rebuild. The poster generator hides all HTML
  controls before capture so obsolete interface elements cannot be baked in.
- Three.js is deferred until after initial content; reduced-motion and
  Data Saver users get the lightweight poster without downloading the renderer.
- Instanced geometry, limited pixel density, local fonts, lazy images, native
  navigation and no route prefetching keep avoidable work/downloads down.
- Each page has a distinct title/description, canonical URL and social metadata.
  Organisation structured data uses published company details only.
- Sitemap and robots files are generated. The Pages workflow enables indexing;
  local builds remain noindex unless explicitly configured as above.

These are implementation improvements, not a promise of search ranking or a
substitute for post-deployment Core Web Vitals measurements.

## Repository scope and remaining business setup

`src/data/site.json` and required `public/media/` images are committed so a fresh
clone builds independently. Raw scrape archives, old plans, screenshots,
validation reports, dependencies and build output are ignored. Raw archives
are also removed from the deployable output.

Review dated/conflicting source statistics, testimonials, personnel and image
permissions before public business use. The three missing brochure PDFs still
need to be supplied. The enquiry form prepares an email draft; it does not
pretend to send via a nonexistent backend. GitHub Pages cannot run a mail server.
