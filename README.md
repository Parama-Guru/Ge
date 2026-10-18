# Ganesh Electricals

Responsive, animated company website with the original company content and page URLs.

## Stack

| Layer | Implementation |
|---|---|
| Framework | Next.js 16.4 App Router, React 19.3, TypeScript |
| Hosting | Static HTML export for GitHub Pages |
| 3D | Three.js 0.186, React Three Fiber 9.8, seven procedural electrical scenes and generated studio lighting |
| Animation | GSAP 3.15 / ScrollTrigger, CSS transitions, automatic image crossfades |
| Styling/state | Tailwind CSS 4 utilities, component CSS and React state |

Native scrolling is preserved. GSAP manages progressive reveals, staggered
content, drawn divider lines and count-up statistics. Tailwind is compiled at
build time; no CSS CDN is used. No second animation or state framework is needed.

## 3D architecture

- One fixed, transparent WebGL canvas (`src/components/world/`) is shared by
  every section of every page.
- Each content section declares a scene with `data-scene` and reserves a
  `.scene-window`. A scroll director in `site-shell.tsx` finds the section at
  the centre of the viewport and publishes live placements for every scene.
- The active object flies into its section's window; the outgoing object scrolls
  away with its own section and fades, so 3D never sits over another section's
  text. Glass sections use their scene as a dimmed full-screen backdrop.
- Scenes (all generated in code): cable, busbar, insulator string, switchgear,
  circuit breakers, connected network and copper coil. Page-to-scene mapping
  lives in `src/data/pages.json`.
- Rendering is on demand: it redraws on scroll, and ambient motion runs at
  about 30 fps. It stops when the tab is hidden, the menu is open or motion is
  paused.

The illustrations are original code-generated artwork, not engineering
specifications or claims about a particular product.

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
original content on all 14 endpoints, all 45 project rows, both organisation
hierarchies, navigation, 320–2560 px widths, accessibility, automatic image
rotation, pause controls, scene switching, 3D draw-call/triangle budgets,
first-visit transfer size, reduced motion, Data Saver, WebGL failure and
no-JavaScript navigation. GitHub Actions runs the browser suite with Chromium
before deployment.

The static export check runs in GitHub Actions without a browser. It checks
every endpoint's HTML, local assets and links, canonical URLs, unique titles and
descriptions, Open Graph/Twitter tags, structured data and the sitemap.

## Push and deploy

Remote: https://Parama-Guru@github.com/Parama-Guru/Ge.git

Pushes reuse the `Parama-Guru` login saved in Git Credential Manager; no
prompt or token is needed:

```powershell
$env:GCM_INTERACTIVE = 'never'
git push origin main
.\tools\deploy-status.ps1 -MaxWaitSec 300
```

Every push to `main` builds, tests and deploys the site through GitHub Actions.
`deploy-status.ps1` waits for the run for the current commit and fails if it
does not succeed. See [docs/3d-website-plan.md](docs/3d-website-plan.md) for the
one-time setup and the 3D website checklist.

Published address: **https://parama-guru.github.io/Ge/**

## Page and content continuity

Published URLs (one dedicated page per section of the original site):

| Endpoint | Content |
|---|---|
| `/Ge/`, `/Ge/index.html` | Overview of every section |
| `/Ge/about.html` | Company introduction and timeline |
| `/Ge/features.html` | Why choose us and statistics |
| `/Ge/clients.html` | Client logos and testimonials |
| `/Ge/contact.html` | Address, emails, phone and enquiry draft |
| `/Ge/founder.html` | Leadership |
| `/Ge/team.html`, `/Ge/org.html` | Both organisation charts |
| `/Ge/project1.html`–`/Ge/project4.html` | Projects by year |
| `/Ge/ehs.html` | Quality & Safety |
| `/Ge/downloads.html` | Downloads |

The homepage anchors `#about`, `#why-us`, `#clients` and `#contact` still work.
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
- After changing a 3D scene, point `SITE_URL` at the running local preview and
  run `npm run render:poster`, then rebuild. This renders one transparent WebP
  poster per scene from the live canvas, used until WebGL is ready and as the
  fallback.
- Three.js is deferred until the browser is idle; reduced-motion and
  Data Saver users get the lightweight posters without downloading the renderer.
- Procedural geometry, generated studio lighting, limited pixel density,
  local fonts, lazy images, native navigation and no route prefetching reduce
  unnecessary downloads. No external model or HDR files are required.
- Reduced-motion and Data Saver users do not load GSAP. Text remains in static
  HTML, and keyboard focus immediately reveals animated containers.
- Each page has a distinct title/description, canonical URL, social metadata
  and breadcrumb structured data. Organisation structured data uses published
  company details only.
- Sitemap and robots files are generated. The Pages workflow enables indexing;
  local builds remain noindex unless explicitly configured as above.

These are implementation improvements, not a promise of search ranking or a
substitute for post-deployment Core Web Vitals measurements.

## Repository scope and remaining business setup

`src/data/site.json` and required `public/media/` images are committed so a fresh
clone builds independently. Dependencies, build output and local test reports
(`quality/`) are ignored.

Review dated/conflicting source statistics, testimonials, personnel and image
permissions before public business use. The three missing brochure PDFs still
need to be supplied. The enquiry form prepares an email draft; it does not
pretend to send via a nonexistent backend. GitHub Pages cannot run a mail server.
