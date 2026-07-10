# Architecture — Polymath Resume Dossier

This document covers the technical decisions behind the system — not just what it does, but why it is built the way it is. It is a living reference for Kartavya and any contributors who need to understand the reasoning before touching the code.

---

## First Principles

Every decision in this project flows from one constraint: **the output must be a single static HTML file deployable to GitHub Pages with zero server dependencies, zero runtime frameworks, and a Lighthouse score of 100/100 across all four categories.**

Everything else — the build pipeline, the data schema, the animation strategy, the PDF workflow — is downstream of that constraint.

---

## Deployment Model

```
GitHub repository (main branch)
│
├── index.html          ← GitHub Pages serves this directly from root
├── resumes/            ← PDF assets served as static files
└── assets/             ← Images, fonts
```

GitHub Pages serves from the repository root on the `main` branch. There is no `dist/` directory, no build branch, no CI/CD compilation step for the HTML. Bun writes directly to `index.html` at root. What is committed is what is served.

This means:
- Zero deployment config
- Zero build minutes on GitHub Actions
- Instant cache invalidation on push
- The committed `index.html` is always readable as a real file, not a build artifact

---

## The Two Runtimes

There are exactly two execution contexts in this project and they are completely separate.

### 1. Build time (Bun, developer machine only)

```
bun/src/
├── validate.js     → reads data/, exits non-zero on schema errors
├── compile.js      → filters data by variant, formats, minifies payload
└── test.js         → assertion suite on data integrity
```

Bun runs locally. It never runs in GitHub Actions. It never runs in CI. Its sole output is a mutation to `index.html` — specifically, it replaces the data block inside the `<script>` tag with a freshly compiled, minified payload derived from `data/resume.json` and `data/variants.json`.

PDF generation is also local-only. Bun has no role in it. See the PDF section below.

### 2. Runtime (browser, pure vanilla JS)

```
index.html
├── <style>         → all CSS inline, single file
└── <script>        → all JS inline, single file
```

The browser receives one file. It contains the compiled data payload, the rendering logic, the state machine, and the animation scaffolding. No external JS dependencies are fetched at runtime unless explicitly opted into (CDN libs for Three.js/Anime.js are loaded with `defer` and degrade gracefully if blocked).

---

## Data Layer

### JSON Resume (FOSS foundation)

The data schema is built on [jsonresume.org](https://jsonresume.org/schema/) — an open standard with broad tooling support. This means the raw data in `data/resume.json` is portable: it can be fed into other resume tools, validators, and parsers without modification.

### Variant Extension

The standard schema is extended with a single additional field: a `variants` string array on every `highlight` entry and every `skill` entry.

```jsonc
{
  "highlights": [
    {
      "text": "Built X achieving Y, reducing Z by 34%.",
      "variants": ["pm-fintech", "consult-fintech", "all"]
    }
  ]
}
```

This is the entire filtering mechanism. There is no separate content store per variant. All content lives in one file. The `variants` field determines which compiled outputs include that bullet.

### Why one file, not N files per variant

The obvious alternative is one JSON file per variant — six files for six personas. The problem with that approach is content drift. When you update a bullet in one file, you have to remember to update it in every other file that shares that bullet. This is a maintenance trap that compounds with every new pair added.

The single-source-of-truth approach with tag filtering means you edit one place. The build step applies the filter. Consistency is structural, not disciplinary.

---

## Set Pair Architecture

### What a Set Pair is

A Set Pair is a named configuration that specifies:
- A target role (`Product Manager`)
- A target industry (`FinTech`)
- A traffic weight for randomized cold visits
- A location string for the contact line
- A set of quantitative metrics for the right sidebar
- A `requiredKeywords` list for ATS compliance checking at build time
- A PDF filename that resolves the download button href

### What a Set Pair is not

A Set Pair is not a dynamic combination of any role × any industry. The system does not generate all possible permutations. Every pair is hand-curated because the summary, the emphasis, and the bullet selection for `Product Manager / FinTech` is substantively different from `Product Manager / Web3` — they are not the same persona with a label swapped.

### Scalability

The pair count is not fixed. `data/variants.json` is an array. Adding a new pair requires:
1. A new object in `data/variants.json`
2. The relevant bullets in `data/resume.json` tagged with the new variant ID
3. A PDF dropped in `resumes/`
4. `bun run build`

No structural changes to the HTML, CSS, or rendering logic.

---

## Rendering Architecture

### No framework

The render layer is plain DOM manipulation. There is no virtual DOM, no reactive state system, no component model. This is a deliberate choice — the complexity budget for a single-page resume application does not justify a framework.

### Targeted updates on variant switch

When the recruiter changes the dropdown, the engine does not tear down and rebuild the entire document. It performs targeted updates only on the elements that changed:

```
Variant switch → diff previous vs. next
  → update contact line          (one text swap)
  → update summary paragraph     (one text swap)
  → rebuild experience section   (new innerHTML)
  → rebuild education section    (new innerHTML)
  → rebuild skills line          (one text swap)
  → animate metrics odometers    (keyframe injection)
  → update download href         (attribute swap)
```

The A4 sheet fades out slightly during the transition via a CSS class toggle, then fades back in after the new content is written. The total transition takes ~280ms.

### The redact mode

The right sidebar includes a redact toggle. When active, it replaces the candidate's personal contact details (email, phone, LinkedIn, WhatsApp) with redacted blocks — visually rendered as black bars in the style of a declassified document. This lets Kartavya share the live URL in contexts where he doesn't want contact information publicly indexed or visible at first glance, while keeping the full resume content readable.

---

## Zoom Architecture

Browser zoom and document zoom are decoupled by design.

**The problem:** CSS `zoom` or `transform: scale()` applied to the A4 sheet as a function of `window.devicePixelRatio` or viewport size works correctly until the recruiter uses `Ctrl++` to zoom their browser. At that point, the viewport shrinks, the A4 canvas rescales, and the document becomes illegible.

**The solution:**

The A4 canvas is sized using a JavaScript `ResizeObserver` on the stage container, not via viewport units or CSS alone. The observer calculates the maximum height that fits within the stage at the current layout, derives the correct width from the `1:√2` aspect ratio, and applies those as explicit pixel values via inline style. This calculation is viewport-agnostic — it responds to the *container* dimensions, not the window.

```js
// Concept
const observer = new ResizeObserver(() => {
  const h = stage.clientHeight * 0.94;
  const w = h / Math.SQRT2;
  wrap.style.height = h + 'px';
  wrap.style.width  = w + 'px';
});
observer.observe(stage);
```

On top of this, a `±` zoom control in the right sidebar applies an independent `transform: scale()` to the sheet contents only — not the wrapper. This lets the recruiter zoom in on bullet text without triggering reflow or changing any layout geometry.

---

## Animation Architecture

### CSS (always active)

- **Sheet swap transition:** `.wrap.swap { opacity: 0; transform: translateY(5px); }` — toggled on variant switch, removed after content write, producing a clean fade-slide
- **Metric odometer:** `@keyframes roll` — translateY from 20px → 0, runs on the `<span>` inside each metric value on every variant switch
- **Skeleton pulse:** `@keyframes skeleton-pulse` — opacity oscillation on placeholder elements during initial load

### Anime.js (loaded async, graceful degradation)

Used for anything that benefits from spring physics or sequenced timelines:
- Logo glow pulse (continuous, amplitude modulated sine)
- Dropdown morph on role change (stagger sequence across options)
- Metric value entrance (coordinated stagger across all four odometers)

If Anime.js fails to load (blocked CDN, offline), the CSS fallbacks cover the same transitions. No functionality is lost.

### Three.js (loaded async, graceful degradation)

A `<canvas id="three-canvas">` sits behind the A4 sheet at `z-index: 0`, `pointer-events: none`. It renders a full-screen radial gradient shader — a soft white glow centered on the canvas, breathing on a low-frequency sine wave, shifting its focal point ±10% on mouse move to create a parallax depth effect.

The shader is ~30 lines of GLSL. No 3D geometry, no scene graph complexity — just a `PlaneGeometry(2,2)` filling the clip space with a fragment shader doing distance-based falloff.

When Three.js is absent (blocked or disabled), the CSS ambient glows (`.glow.tl`, `.glow.br`) fill the same visual role. The difference is subtle enough that no recruiter will notice.

---

## PDF Architecture

### Why no automated PDF generation

The obvious approach is Puppeteer or Playwright running headlessly to print the document to PDF. This was explicitly rejected for three reasons:

1. **ATS compliance.** Headless-browser PDFs embed text as positioned absolute spans with fractional coordinates. ATS systems parse PDFs by reading the content stream in order. Headless output frequently scrambles reading order, breaks hyphenation, and embeds metadata that flags the document as machine-generated.

2. **Build complexity.** Puppeteer requires a Chromium binary (~280MB). That is a dependency that needs versioning, caching, and maintenance. For six PDFs that change a few times a year, this is unjustifiable overhead.

3. **Font fidelity.** The A4 document uses Source Serif 4 with optical sizing and specific OpenType feature settings. Print-to-PDF from a real browser with the fonts loaded produces a higher-fidelity output than any headless renderer.

### The manual workflow

PDFs are produced by a human, in a real browser, once per content change. The steps are documented in the README. The output files are committed to `resumes/` as static assets and served by GitHub Pages directly. The download button resolves its href dynamically based on the active variant, so each PDF gets a recruiter-meaningful filename:

```
Kartavya_Jharwal_Resume_Product_Manager_FinTech.pdf
Kartavya_Jharwal_Resume_Systems_Engineer_Web3.pdf
```

---

## Accessibility

- Semantic HTML throughout: `<main>`, `<aside>`, `<header>` regions
- All interactive controls are native `<button>` and `<select>` elements — keyboard navigable by default
- The redact toggle announces its state via `aria-pressed`
- The download link carries a descriptive `aria-label` that includes the variant name
- Motion respects `prefers-reduced-motion` — transitions are skipped, odometers snap rather than roll
- Color contrast in the dashboard UI meets WCAG AA (muted text on dark background is the only borderline case, reviewed manually)
- The A4 document interior is WCAG AAA — black text on white

---

## Telemetry

Client-side GA4, no cookies, no PII.

The tracking calls are wrapped in a single `track(event, payload)` utility that no-ops cleanly if `window.gtag` is undefined (ad blockers, privacy browsers). The telemetry is informational, not functional — the site works identically with or without it.

Key signals tracked:
- Which variant a recruiter saw on cold arrival
- Whether they arrived via a deep link (and from which source if a UTM is appended)
- Which variants they explored beyond the initial one
- Whether they downloaded a PDF and which variant it was for
- Time-on-page proxied via a `beforeunload` event payload

---

## What Is Not In This Project

To be explicit about scope:

- No React, Vue, Svelte, or any component framework
- No Tailwind or utility CSS framework
- No Webpack, Vite, Rollup, or bundler (Bun is used as a script runner only)
- No TypeScript
- No SSR or edge rendering
- No database
- No API
- No authentication
- No Puppeteer or headless PDF generation in any environment
- No cookie banners
- No service workers (considered, deferred — no offline use case)
- No `dist/` directory — root IS the distribution

---

*Last updated: 2026-07-09*
*Author: Kartavya Jharwal*
