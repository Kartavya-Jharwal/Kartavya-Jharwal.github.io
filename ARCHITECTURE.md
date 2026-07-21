# Architecture — Polymath Resume Dossier

This document covers the technical decisions behind the system — not just what it does, but why it is built the way it is. It is a living reference for Kartavya and any contributors who need to understand the reasoning before touching the code.

> **Typesetting decisions** — the base unit system, type scale, margin derivation, baseline grid, figure treatment, hanging punctuation, and tracking — are specified in full in [`TYPESETTING.md`](./TYPESETTING.md). This document references that spec where relevant but does not repeat it. If a CSS token or spacing value in the code looks arbitrary, the derivation is in TYPESETTING.md.

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

GitHub Pages serves from the repository root on the `main` branch. There is no `dist/` directory or build branch. Bun writes the deterministic profile payload to `public/data.js`; the committed HTML, CSS, JavaScript, and payload are what the browser receives.

This means:
- Zero deployment config
- Zero build minutes on GitHub Actions
- Instant cache invalidation on push
- The committed `index.html` remains a readable source file rather than a generated bundle

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

Bun runs locally. Its build output is `public/data.js`, derived from `data/resume.json` and `data/variants.json`. Validation runs before compilation, and the test command verifies both profile integrity and deterministic output.

PDF generation is also local-only. Bun has no role in it. See the PDF section below.

### 2. Runtime (browser, pure vanilla JS)

```
index.html              → semantic shell
assets/css/style.css    → presentation and print rules
assets/js/app.js        → rendering and interaction logic
public/data.js          → generated profile payload
```

The browser runtime is framework-free application code with a small vendored Zustand-compatible state helper. Fonts and the icon webfont are loaded from CDNs; the resume renderer itself has no network API dependency.

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

### No UI framework

The render layer uses plain DOM manipulation with a small vendored state store. There is no virtual DOM or component runtime; targeted DOM updates keep the browser surface compact.

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

All text injected into the DOM goes through the `nb()` micro-typography utility before insertion, which enforces non-breaking spaces between numbers and their following units (per [TYPESETTING.md §9](./TYPESETTING.md#9-micro-typography-floor-correctness-not-taste)). En dashes in date ranges are stored as `\u2013` in the data layer — never as hyphen-minus.

### The redact mode

The right sidebar includes a redact toggle. When active, it replaces the candidate's personal contact details (email, phone, LinkedIn, WhatsApp) with redacted blocks — visually rendered as black bars in the style of a declassified document. This lets Kartavya share the live URL in contexts where he doesn't want contact information publicly indexed or visible at first glance, while keeping the full resume content readable.

---

## Zoom Architecture

Browser zoom and document zoom are decoupled by design.

**The problem:** CSS `zoom` or `transform: scale()` applied to the A4 sheet as a function of `window.devicePixelRatio` or viewport size works correctly until the recruiter uses `Ctrl++` to zoom their browser. At that point, the viewport shrinks, the A4 canvas rescales, and the document becomes illegible.

**The solution:**

The A4 canvas is sized using a JavaScript `ResizeObserver` on the stage container, not via viewport units or CSS alone. The observer calculates the maximum height that fits within the stage at the current layout, derives the correct width from the `1:√2` aspect ratio (per [TYPESETTING.md §3](./TYPESETTING.md#3-page-construction--margins-derived-not-chosen)), and applies those as explicit pixel values via inline style. This calculation is viewport-agnostic — it responds to the *container* dimensions, not the window.

```js
// Concept
const observer = new ResizeObserver(() => {
  const h = stage.clientHeight * 0.94;
  const w = h / Math.SQRT2;        // 1:√2 — A4 aspect ratio
  wrap.style.height = h + 'px';
  wrap.style.width  = w + 'px';
});
observer.observe(stage);
```

A critical side effect of this approach: because the wrapper dimensions are fixed in absolute pixels, the internal CSS token `--bf` (which drives the entire type scale via `clamp(9px, 1.25vh, 16px)`) continues resolving relative to the *viewport height*, not the wrapper. This means browser zoom changes the type scale slightly while the canvas dimensions stay fixed. The `±` zoom control in the right sidebar compensates for this by applying an independent `transform: scale()` to the sheet contents only — not the wrapper — letting the recruiter adjust text size without triggering reflow or breaking the canvas geometry.

The full type scale derivation and the relationship between `--bf`, `--u`, and the spacing tokens is in [TYPESETTING.md §1–2](./TYPESETTING.md#1-the-base-unit-u).

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

3. **Font fidelity.** The A4 document uses Source Serif 4 with optical sizing (`font-optical-sizing: auto`, `opsz` axis) and specific OpenType feature settings — true small caps, oldstyle figures in prose, tabular lining figures in date columns (per [TYPESETTING.md §6](./TYPESETTING.md#6-figure-treatment-tabular-vs-oldstyle) and [§11](./TYPESETTING.md#11-typeface-selection-criteria)). Print-to-PDF from a real browser with the fonts loaded and the OpenType features resolved produces a higher-fidelity output than any headless renderer.

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
- The A4 document interior is WCAG AAA — black `#111` on white `#fff`
- True small caps are used for section labels (font's own `smcp` glyphs via `font-variant-caps: all-small-caps`) — never scaled capitals, which thin out under magnification and produce visible stroke-weight mismatch (per [TYPESETTING.md §9](./TYPESETTING.md#9-micro-typography-floor-correctness-not-taste))

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

## Document Typesetting

The internal layout of the A4 canvas — base unit derivation, type scale, margin construction, baseline grid, hanging punctuation, figure treatment, tracking, ink density, and typeface selection — is specified in full in [`TYPESETTING.md`](./TYPESETTING.md).

The short version of the decisions made there and how they surface in code:

| Decision | Where specified | CSS token / rule |
|----------|----------------|-----------------|
| Base unit `u = 12pt` | [TYPESETTING.md §1](./TYPESETTING.md#1-the-base-unit-u) | `--u: calc(var(--bf) * var(--lh))` |
| Type scale r = 1.2, 3 sizes only | [TYPESETTING.md §2](./TYPESETTING.md#2-the-modular-type-scale) | `--s0`, `--s1`, `--s2` |
| A4 margins, n = 12 divisor | [TYPESETTING.md §3](./TYPESETTING.md#3-page-construction--margins-derived-not-chosen) | `.sheet { padding: ... }` |
| Baseline grid, name forced to 2u | [TYPESETTING.md §4](./TYPESETTING.md#4-baseline-grid-lock) | `.r-name { line-height: calc(var(--u) * 2) }` |
| Hanging punctuation, 1.1em calibration | [TYPESETTING.md §5](./TYPESETTING.md#5-optical-alignment-hanging-punctuation) | `.r-ul { padding-left: 1.1em }` |
| Tabular figures in date columns | [TYPESETTING.md §6](./TYPESETTING.md#6-figure-treatment-tabular-vs-oldstyle) | `.r-dt { font-variant-numeric: tabular-nums lining-nums }` |
| Tracking per size band | [TYPESETTING.md §7](./TYPESETTING.md#7-tracking-as-a-function-of-size) | `--tr-display`, `--tr-label`, `--tr-body` |
| One lever per hierarchy transition | [TYPESETTING.md §8](./TYPESETTING.md#8-hierarchy-one-variable-per-transition) | `.r-lbl` (case+tracking only), `.r-co` (weight only) |
| En dash, NBSP, true small caps | [TYPESETTING.md §9](./TYPESETTING.md#9-micro-typography-floor-correctness-not-taste) | `nb()` utility, `\u2013` in data layer |

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

---

*For typographic decisions (type scale, margins, baseline grid, figure treatment, hanging punctuation, ink density), see [`TYPESETTING.md`](./TYPESETTING.md).*
*For adding new Set Pairs, editing bullets, and commit conventions, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).*
