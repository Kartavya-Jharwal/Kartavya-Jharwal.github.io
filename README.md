# Polymath Resume Dossier

> *"Not a jack of all trades — a budding master of all traits."*

A recruiter-facing adaptive resume engine built for **Kartavya Jharwal**. Every cold visit to the domain resolves to a hyper-specialized profile tuned for the exact role and industry the recruiter is hiring for — surrounded by a dashboard UI that makes it unmistakably clear this depth of specialization is just one active node inside a much larger polymathic operating system.

This flips the Teal / Resume.io paradigm on its head. Those tools are *internally* focused — you build and manage resumes for yourself. This is *externally* focused — the resume finds the recruiter, reads the context, and presents exactly what they need to see.

---

## Live Deployments

| Context | URL |
|---|---|
| Primary portfolio | `kartavya.tech` |
| Resume subdomain | `resume.kartavya.tech` |
| GitHub Pages slug | `kartavya-jharwal.github.io/polymath-resume-dossier` |

### Deep Link Syntax

For direct applications, cold outreach, and recruiter emails — bypass the randomizer entirely and lock a specific variant:

```
https://resume.kartavya.tech/?role=Product+Manager&industry=FinTech
https://resume.kartavya.tech/?role=Systems+Engineer&industry=Web3
https://resume.kartavya.tech/?role=Strategy+Consultant&industry=Healthcare
```

Every deep link is tracked as a named GA4 event so you can see exactly which variant a recruiter opened, how long they stayed, and whether they downloaded.

---

## The Core Mechanic

### Set Pairs — not arbitrary mixing

Roles and industries are **not** combined dynamically. That would produce incoherent resumes. Instead the system runs on a strictly curated list of Set Pairs — each one is a hand-crafted persona with its own summary, filtered experience bullets, skill emphasis, and performance metrics.

| ID | Role | Industry | Targeted | Traffic Weight |
|---|---|---|---|---|
| `pm-fintech` | Product Manager | FinTech | ✓ | 30% |
| `swe-web3` | Systems Engineer | Web3 | ✓ | 30% |
| `consult-health` | Strategy Consultant | Healthcare | ✓ | 30% |
| `pm-web3` | Product Manager | Web3 | | 3.33% |
| `consult-fintech` | Strategy Consultant | FinTech | | 3.33% |
| `all` | Polymath | Universal | | UI only |

The three targeted pairs absorb 90% of cold traffic. The remaining pairs are reachable via the dropdown. The `all` (Polymath / Universal) pair is the only one that shows the full cross-domain picture — it is never randomly served, only deliberately selected.

The number of pairs is not fixed. The engine scales up or down to any count without structural changes — add a new object to `data/variants.json`, tag the relevant bullets in `data/resume.json`, drop a PDF in `resumes/`, rebuild.

### Weighted Randomization

Cold visits to the root domain run through a client-side weighted selector on page load. No server, no database, no cookies required. The three targeted pairs each carry a 30% probability. Once a variant is served, the dropdown reorders itself so related roles cluster near the top — a PM/FinTech visitor sees other commercial roles first, not infra engineering roles.

---

## Project Structure

```
polymath-resume-dossier/
│
├── index.html          ← production HTML shell served by GitHub Pages
│
├── data/
│   ├── resume.json     ← JSON Resume standard, extended with variant tags
│   └── variants.json   ← Set Pair definitions, weights, metrics, PDF names
│
├── bun/
│   └── src/            ← validation, compilation, and integrity tests
│
├── assets/
│   ├── css/            ← production styles
│   ├── img/            ← production logo assets
│   └── js/             ← browser renderer and vendored state helper
│
├── public/
│   ├── data.js         ← deterministic generated profile payload
│   └── resumes/        ← pre-built ATS-compliant PDFs
│
├── resumes/            ← local PDF source workspace
│   └── Kartavya_Jharwal_Resume_[Role]_[Industry].pdf
│
├── package.json
├── bun.lock
├── .gitignore
├── README.md           ← you are here
└── CONTRIBUTING.md
```

**GitHub Pages serves from root.** The browser loads `index.html`, `assets/css/style.css`, `assets/js/app.js`, and the generated `public/data.js` payload directly. Bun validates the source JSON and deterministically rebuilds `public/data.js`.

---

## Data Schema

Built on the open-source [JSON Resume](https://jsonresume.org/schema/) standard, extended with a `variants` tag array on every highlight and skill entry.

```jsonc
// data/resume.json (abbreviated)
{
  "basics": {
    "name": "Kartavya Jharwal",
    "email": "KartavyaJharwal@gmail.com",
    "location": { "city": "London" }
  },
  "work": [
    {
      "name": "Company Name",
      "position": "Role Title",
      "highlights": [
        {
          "text": "Shipped X, which achieved Y, measured by Z.",
          "variants": ["pm-fintech", "consult-fintech", "all"]
        }
      ]
    }
  ],
  "skills": [
    {
      "name": "Domain Cluster",
      "keywords": ["Skill A", "Skill B"],
      "variants": ["pm-fintech", "all"]
    }
  ]
}
```

The `variants` array on each bullet is the entire filtering mechanism. When the engine compiles variant `pm-fintech`, it walks every job's highlights and only keeps bullets that include `"pm-fintech"` or `"all"` in their tag list. Jobs with zero matching bullets are dropped entirely. The result is a resume that reads like it was written exclusively for that role.

---

## Bun Build Pipeline

Bun handles three things and nothing else:

1. **Validate** — parses `data/resume.json` against the JSON Resume schema, checks that every variant reference points to a defined pair, runs ATS keyword compliance checks for each targeted variant, and exits non-zero on any hard error.

2. **Compile** — walks the data, applies variant filters, formats dates with proper en dashes, resolves PDF filenames, and writes `public/data.js`.

3. **Test** — checks every compiled profile, verifies required sections, and proves that repeated builds produce byte-identical output.

```bash
bun run validate   # schema check + keyword compliance
bun run build      # validate → compile public/data.js
bun run test       # build + compiled-payload integrity suite
```

**PDF generation never runs in this pipeline.** PDFs are authored locally, placed in `resumes/`, and committed. CI never touches them.

---

## PDF Workflow

PDFs are ATS-compliant, vector-text documents. They are built once locally and committed as static assets.

**Naming convention:**
```
Kartavya_Jharwal_Resume_[Role]_[Industry].pdf
```

**Local generation steps:**
1. Run `bun run build` to get the latest compiled HTML
2. Open in Chrome/Arc, select the target variant from the dropdown
3. `Ctrl+P` → Save as PDF → Margins: None → Background graphics: On
4. Save to `resumes/` using the naming convention above
5. Commit

The download button on the right sidebar dynamically resolves its `href` to the correct filename based on the active variant. Recruiters get a file named after the exact role they're viewing, not a generic `resume.pdf`.

---

## Design System

The UI runs on a deliberate visual tension: a brutalist high-contrast dashboard wrapped around a mathematically pristine A4 document.

**Outside (dashboard):**
- Pitch black `#0a0a0a` background with hard `1px solid #262626` grid borders
- Neumorphic controls — `box-shadow: 3px 3px 0 0 #000` outset, collapses to inset on press
- Ambient div glows at top-left and bottom-right corners to pull focus toward center
- Quantitative odometer metrics in the right sidebar that roll on variant switch

**Inside (A4 document):**
- White `#fff` canvas, `1:√2` aspect ratio, margins derived geometrically from page proportions (not arbitrary values)
- Source Serif 4 optical-size axis for body text, Inter for the dashboard UI and document headers
- Three type sizes only — body (9.5 pt), labels (11.4 pt), name (13.68 pt) — on a minor-third scale (r = 1.2)
- Every vertical spacing value is an integer or simple-fraction multiple of the base unit `u = 12 pt`
- No color, no tags, no icons inside the document — pure typographic hierarchy, one lever changed per transition
- All bullet points follow Action → Context → Result structure with quantified outcomes
- En dashes for date ranges, true small caps for section labels, tabular figures in date columns, oldstyle figures in prose

The full derivation — base unit, type scale, margin construction, baseline grid lock, hanging punctuation calibration, figure treatment, tracking heuristics, ink density procedure, and typeface selection criteria — is formally specified in [`TYPESETTING.md`](./TYPESETTING.md).

**Scaling:** The A4 canvas is sized by a `ResizeObserver` on the stage container, making it immune to browser zoom. A `±` control in the right sidebar applies an independent `transform: scale()` to the document contents only, so the recruiter can zoom text without touching the canvas geometry. The full technical explanation is in [`ARCHITECTURE.md — Zoom Architecture`](./ARCHITECTURE.md#zoom-architecture).

---

## Animation Stack (wired, partially active)

| Library | Role | Status |
|---|---|---|
| CSS transitions | Sheet fade/slide on variant switch | ✓ Active |
| CSS `@keyframes` | Metric odometer roll | ✓ Active |
| Anime.js | Logo glow pulse, dropdown morphs | Scaffolded |
| Three.js | Radial glow shader behind A4 canvas | Scaffolded |

The Three.js canvas sits behind the A4 sheet as a fixed `<canvas id="three-canvas">`. It renders a soft radial gradient shader that breathes on a sine wave and shifts subtly on mouse move. Color temperature shifts slightly between variants. The canvas is pointer-events-none so it never interferes with document interaction.

---

## Analytics

Static site, no backend. All telemetry is client-side GA4 events.

| Event | Fired When | Payload |
|---|---|---|
| `cold_visit` | Random variant served on load | `{pair}` |
| `deeplink` | URL param variant resolved | `{pair, role, industry}` |
| `variant_switch` | Dropdown changed | `{from, to}` |
| `pdf_download` | Download button clicked | `{variant}` |
| `splash_dismissed` | Mobile splash closed | `{device}` |

Privacy: no PII, no cookies, no consent banner needed for GA4 in analytics-only mode.

---

## Mobile

Mobile viewports show a splash blocker screen first — an A4 document is unreadable at 390px width without forcing pinch-to-zoom on every line of text. The splash is a deliberate gate, not an apology. Once dismissed, the document reflows into a single-column readable layout. All controls (matrix dropdowns, download, metrics) collapse into a draggable bottom drawer with two magnetic snap points: a peek state at 15vh showing the active pair and download button, and an expanded state at 80vh showing the full matrix.

---

## Performance Budget

| Metric | Target |
|---|---|
| Lighthouse Performance | 100 |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 |
| FCP | < 1.0s |
| LCP | < 1.5s |
| CLS | 0 |
| JS payload (no libs) | < 20KB |
| JS payload (with Three.js) | < 150KB |

---

## Documentation Map

| Document | What it covers |
|---|---|
| `README.md` | Overview, deployments, Set Pairs, commands, PDF workflow, design summary, contact |
| [`TYPESETTING.md`](./TYPESETTING.md) | Full typesetting specification — base unit, type scale, margin derivation, baseline grid, hanging punctuation, figure treatment, tracking, ink density, typeface selection, reference CSS |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Technical decisions — deployment model, data layer, rendering, zoom decoupling, animation stack, PDF rationale, accessibility, telemetry |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Adding Set Pairs, editing bullets, MBB bullet format, CSS conventions, commit style, hard do-not-do list |

---

## Contact

**Kartavya Jharwal**  
London, UK · Jaipur, India · Open to relocation

[linkedin.com/in/kartavyajharwal](https://www.linkedin.com/in/kartavyajharwal/) ·
[github.com/Kartavya-Jharwal](https://github.com/Kartavya-Jharwal) ·
[KartavyaJharwal@gmail.com](mailto:KartavyaJharwal@gmail.com) ·
Kjharwal@student.hult.edu ·
WhatsApp [@KartavyaJharwal](https://wa.me/KartavyaJharwal)

---

*Built with vanilla JS, CSS, JSON Resume, and Bun. Deployed to GitHub Pages.*
*Resume content © Kartavya Jharwal. All rights reserved.*
