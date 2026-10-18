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
- [ ] Do not rewrite, correct or invent company facts, dates, names or numbers.
- [ ] Every page stays readable and navigable without WebGL or JavaScript.
- [ ] Respect reduced motion and Data Saver; provide a pause control for
      continuous motion.

## Phase 0 – Foundation (done)

- [x] Next.js 16 static export, React 19, TypeScript.
- [x] Three.js 0.186 with React Three Fiber, GSAP ScrollTrigger, Tailwind 4.
- [x] Procedural cable hero (no external models or HDR files).
- [x] GitHub Pages deployment through GitHub Actions.
- [x] Unused files, scraped archive and obsolete code removed.
- [x] Pushes work from this machine without prompts (see "Publishing").

## Phase 1 – Visual direction

- [ ] Define one 3D design language for all pages: palette, materials
      (copper, insulation, steel, enamel), lighting and camera style.
- [ ] Choose a 3D motif per page, built in code:
  - [ ] Home: cable/conductor assembly with focus-pull reveal.
  - [ ] About / Features: busbars, terminals and insulators.
  - [ ] Projects: switchgear or panel detail behind the project tables.
  - [ ] Quality & Safety: protective equipment / clean assembly details.
  - [ ] Leadership / Org chart: subtle connected-node structure.
  - [ ] Downloads / Contact: quiet, low-cost scene.
- [ ] Animate the original logo presentation without altering the emblem.
- [ ] Desktop, tablet and portrait-phone compositions for each scene.

## Phase 2 – Shared 3D system

- [ ] One persistent canvas shared across sections, not a canvas per block.
- [ ] Scene registry: each section declares its scene and camera target.
- [ ] Scroll-linked camera choreography with GSAP ScrollTrigger
      (native scrolling; no scroll hijacking).
- [ ] Focus-pull / depth effect through a lightweight custom shader.
- [ ] Route transitions that keep the 3D world continuous between pages.
- [ ] Render only while visible; pause when hidden, offscreen or paused.
- [ ] Graceful fallback poster per scene for WebGL failure or Data Saver.

## Phase 3 – Page-by-page build

- [ ] Home: hero, about, features, statistics, testimonials, timeline,
      clients, contact — each with its own animated 3D moment.
- [ ] Leadership (`founder.html`).
- [ ] Organisation charts (`team.html`, `org.html`), both versions kept
      separate.
- [ ] Projects (`project1.html`–`project4.html`), all 45 rows unchanged.
- [ ] Quality & Safety (`ehs.html`), all policies and nine commitments.
- [ ] Downloads (`downloads.html`), unavailable PDFs stated honestly.
- [ ] Shared header, menu and footer integrated with the 3D world.

## Phase 4 – Performance budgets

- [ ] Draw calls: ≤ 60 mobile / ≤ 100 desktop per frame.
- [ ] Triangles: ≤ 60k mobile / ≤ 120k desktop.
- [ ] Pixel ratio capped (1–1.5).
- [ ] Initial transfer for home page ≤ 1.5 MB on mobile.
- [ ] No layout shift when the canvas loads.
- [ ] Geometry and materials shared and disposed correctly.

## Phase 5 – Verification (every change)

- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` and `npm run test:export` pass.
- [ ] `npm run test:site` passes against the local `/Ge` build:
      original content, all routes, 320–2560 px widths, accessibility,
      reduced motion, no-JavaScript, Data Saver, WebGL failure, 3D budgets.
- [ ] Visual review in the integrated browser at phone, laptop and
      large-screen sizes.
- [ ] Client/public review pass; log each finding as a new item below and
      fix it before release.

## Phase 6 – Release

- [ ] Commit with a short message only (no co-author lines).
- [ ] Push and confirm the deploy run succeeds.
- [ ] Re-check the live site: https://parama-guru.github.io/Ge/

## Findings to fix

Add review findings here as `- [ ] description (page, selector)`.

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
