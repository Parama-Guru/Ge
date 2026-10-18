# 3D website plan and checklist

Goal: rebuild the Ganesh Electricals website as one cohesive, animated 3D
experience. The current site has a 3D hero, but the rest is still mostly a
conventional page layout; this plan closes that gap.

## Ground rules

- [x] All company content comes from the original site (`src/data/site.json`).
- [x] Keep the original page URLs: `index.html`, `founder.html`, `team.html`,
      `org.html`, `project1.html`–`project4.html`, `ehs.html`, `downloads.html`.
- [x] Normal website navigation; no slideshow, page counters, mode switches
      or click-a-building navigation.
- [x] Do not rewrite, correct or invent company facts, dates, names or numbers.
- [x] Every page stays readable and navigable without WebGL or JavaScript.
- [x] Respect reduced motion and Data Saver; provide a pause control for
      continuous motion.

## Phase 0 – Foundation (done)

- [x] Next.js 16 static export, React 19, TypeScript.
- [x] Three.js 0.186 with React Three Fiber, GSAP ScrollTrigger, Tailwind 4.
- [x] Procedural cable hero (no external models or HDR files).
- [x] GitHub Pages deployment through GitHub Actions.
- [x] Unused files, scraped archive and obsolete code removed.
- [x] Pushes work from this machine without prompts (see "Publishing").

## Phase 1 – Visual direction

- [x] Define one 3D design language for all pages: palette, materials
      (copper, insulation, steel, enamel), lighting and camera style.
- [x] Choose a 3D motif per page, built in code:
  - [x] Home: cable/conductor assembly with focus-pull reveal.
  - [x] About / Features: busbars, terminals and insulators.
  - [x] Projects: switchgear or panel detail behind the project tables.
  - [x] Quality & Safety: protective equipment / clean assembly details.
  - [x] Leadership / Org chart: subtle connected-node structure.
  - [x] Downloads / Contact: quiet, low-cost scene.
- [x] Animate the original logo presentation without altering the emblem.
- [x] Desktop, tablet and portrait-phone compositions for each scene.

## Phase 2 – Shared 3D system

- [x] One persistent canvas shared across sections, not a canvas per block.
- [x] Scene registry: each section declares its scene and camera target.
- [x] Scroll-linked object choreography driven by native scrolling
      (no scroll hijacking); GSAP ScrollTrigger for content reveals.
- [x] Focus-pull effect on every scene change (GPU-composited CSS blur on
      the canvas, no extra render pass).
- [ ] Route transitions that keep the 3D world continuous between pages.
      Deferred: pages are plain HTML links (no prefetching, minimal data);
      each page restores its scene from a poster, then the live render.
- [x] Render only while visible; pause when hidden, offscreen or paused.
- [x] Graceful fallback poster per scene for WebGL failure or Data Saver.

## Phase 3 – Page-by-page build

- [x] Home: hero, about, features, statistics, projects, clients, contact —
      each with its own animated 3D moment (timeline and testimonials live
      on their dedicated pages).
- [x] Leadership (`founder.html`).
- [x] Organisation charts (`team.html`, `org.html`), both versions kept
      separate.
- [x] Projects (`project1.html`–`project4.html`), all 45 rows unchanged.
- [x] Quality & Safety (`ehs.html`), all policies and nine commitments.
- [x] Downloads (`downloads.html`), unavailable PDFs stated honestly.
- [x] Shared header, menu and footer integrated with the 3D world.

## Phase 3a – Dedicated endpoints

Every section of the original homepage gets its own page; the original URLs
and homepage anchors keep working.

| Endpoint | Content (from the original site) |
|---|---|
| `/` and `/index.html` | Overview with links to every page |
| `/about.html` | Company introduction, timeline |
| `/features.html` | Why choose us, three principles, statistics |
| `/clients.html` | Client statement, 12 logos, testimonials |
| `/contact.html` | Address, emails, phone, enquiry draft |
| `/founder.html` | Leadership |
| `/team.html`, `/org.html` | Both organisation charts |
| `/project1.html`–`/project4.html` | Projects by year |
| `/ehs.html` | Quality & Safety |
| `/downloads.html` | Downloads |

- [x] Create the four new endpoints and link them from header, menu and footer.
- [x] Keep `#about`, `#why-us`, `#clients`, `#contact` on the homepage,
      each linking to its dedicated page.
- [x] Custom 404 page with links back to every endpoint.
- [ ] Every endpoint returns HTTP 200 on GitHub Pages under `/Ge/`.

## Phase 3b – Efficient loading

- [x] HTML and text render first; Three.js loads only after the page is idle.
- [x] Three.js is never downloaded for reduced motion or Data Saver.
- [x] Per-scene transparent WebP fallback poster (720 px, 5–22 KiB).
- [x] Responsive images (`srcset`) and lazy loading below the fold.
- [x] Locally hosted fonts, Latin subsets, `font-display: swap`.
- [x] No route prefetching; no external models, HDRs or CDNs.
- [x] Render on demand at ≤ 30 fps ambient; pause when the tab is hidden.
- [x] Measured transfer per page recorded by the browser tests:
      ≤ 1.5 MB home, ≤ 1 MB other pages on first visit.

## Phase 3c – SEO

- [x] Unique `<title>` and meta description per endpoint.
- [x] Canonical URL per endpoint (`https://parama-guru.github.io/Ge/...`).
- [x] Open Graph and Twitter card metadata per endpoint.
- [x] Organization structured data using published details only.
- [x] BreadcrumbList structured data on every inner page.
- [x] One `<h1>` per page and a logical heading order.
- [x] Descriptive `alt` text on every content image.
- [x] `sitemap.xml` lists every endpoint; `robots.txt` points to it.
- [x] `theme-color`, `lang="en"`, favicon.
- [x] Export check fails on missing titles, descriptions, canonicals,
      duplicate titles or broken internal links.

## Phase 4 – Performance budgets

- [x] Draw calls: ≤ 60 mobile / ≤ 100 desktop per frame.
- [x] Triangles: ≤ 60k mobile / ≤ 120k desktop.
- [x] Pixel ratio capped (1–1.5).
- [x] Initial transfer for home page ≤ 1.5 MB on mobile.
- [x] No layout shift when the canvas loads.
- [x] Geometry and materials shared and disposed correctly.

## Phase 5 – Verification (every change)

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` and `npm run test:export` pass.
- [x] `npm run test:site` passes against the local `/Ge` build:
      original content, all routes, 320–2560 px widths, accessibility,
      reduced motion, no-JavaScript, Data Saver, WebGL failure, 3D budgets.
- [x] Visual review in the integrated browser at phone, laptop and
      large-screen sizes.
- [x] Client/public review pass; log each finding as a new item below and
      fix it before release.

## Phase 6 – Release

- [ ] Commit with a short message only (no co-author lines).
- [ ] Push and confirm the deploy run succeeds.
- [ ] Re-check the live site: https://parama-guru.github.io/Ge/

## Findings to fix

Add review findings here as `- [ ] description (page, selector)`.

- [x] Glass sections showed a large grey 3D shape behind cards; backdrop scene now sits right, dimmed and blurred (depth of field), constrained to its own section.
- [x] Outgoing 3D object overlapped the next section during transitions; each scene now follows its own window and fades out with it.
- [x] Sticky header let content show through; now near-opaque with blur.
- [x] Large empty gaps between home sections and on mobile; section heights reduced and objects stay in their own windows.
- [x] Insulator string clipped near the header; framing reduced.
- [x] Inner page heroes filled the first screen; hero shortened so the first card is visible.
- [x] Project tables needed sideways scrolling on phones; rows now stack as labelled cards, year tabs in a 2×2 grid.
- [x] Same 3D object repeated across pages; per-page pose/mirror variants, Leadership uses the cable scene, project heroes show the year range.
- [x] Timeline line stopped before the last dot; drawn fully once in view.
- [x] Removed the non-original timeline note; downloads now say "Available on request by email."
- [x] Statistics crowded at desktop width; tabular figures and wider spacing.
- [x] Menu overlay showed page text and was misaligned with the header; now opaque and aligned.

## Publishing

One-time setup on this machine (already done):

```powershell
git config credential.helper                 # manager
git credential-manager github list           # includes Parama-Guru
git remote set-url origin https://Parama-Guru@github.com/Parama-Guru/Ge.git
git config user.name  "parama-Guru"
git config user.email "paramaguruvh@gmail.com"
```

If `Parama-Guru` is missing from the list, sign in once in a normal terminal:
`git credential-manager github login --username Parama-Guru`.

Each release:

```powershell
git add -A
git commit -m "Short message"
$env:GCM_INTERACTIVE = 'never'
git push origin main
.\tools\deploy-status.ps1 -MaxWaitSec 300
```

`deploy-status.ps1` reads the saved login through Git Credential Manager,
never prints the token, and exits with success only when the deploy run for
the current commit completes successfully.
