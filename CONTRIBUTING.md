# Contributing

This is a personal project. The guidelines here are primarily for Kartavya's own reference — a record of how decisions get made so that future edits stay coherent with the original design intent.

---

## The Cardinal Rules

**1. Root is production.**
`index.html` at root is what GitHub Pages serves. Never treat it as a draft. Every commit to main that touches `index.html` is a live deployment.

**2. Bun compiles data, it does not architect the UI.**
The build writes `public/data.js`. It does not restructure `index.html`, `assets/css/style.css`, or `assets/js/app.js`.

**3. PDFs are hand-built, never auto-generated.**
No Puppeteer. No headless Chrome. No CI PDF step. See the PDF workflow in the README.

**4. Keep runtime dependencies deliberate.**
Browser code is plain JavaScript with a small vendored state helper. Any external asset must degrade cleanly when unavailable.

---

## Adding a New Set Pair

A Set Pair is a named Role × Industry persona. Adding one takes four steps.

### Step 1 — Define the pair in `data/variants.json`

```jsonc
{
  "id": "pm-healthtech",               // slug, lowercase, hyphenated
  "role": "Product Manager",
  "industry": "HealthTech",
  "targeted": false,                    // true = gets traffic weight
  "weight": 0,                          // 0 = UI-only, never randomly served
  "description": "One-sentence summary shown as the resume's professional summary for this pair.",
  "location": "London, UK",
  "metrics": {
    "Experience": "4+ Yrs",
    "Projects": "8+",
    "Impact": "$20M+",
    "Specialization": "High"
  },
  "requiredKeywords": [
    "Product Strategy",
    "HealthTech",
    "Regulatory Compliance"
  ],
  "pdfFilename": "Kartavya_Jharwal_Resume_Product_Manager_HealthTech.pdf"
}
```

**On weights:** The three targeted pairs currently hold 30% each (total 90%). If you promote a pair to targeted, reduce the others proportionally so the total stays at ~100%. Non-targeted pairs share the remaining 10% or carry weight 0 for UI-only access.

### Step 2 — Tag bullets in `data/resume.json`

For every highlight that should appear in this variant, add `"pm-healthtech"` to its `variants` array:

```jsonc
{
  "text": "Designed a clinical trial recruitment platform adopted by 3 NHS trusts.",
  "variants": ["pm-healthtech", "all"]
}
```

Add `"all"` only to bullets that should appear in the universal Polymath view. Not every bullet needs to be in `all`.

Run `bun run validate` after tagging. It will catch missing keyword coverage and undefined variant references before they get committed.

### Step 3 — Rebuild

```bash
bun run build
```

This validates the source and writes the updated payload to `public/data.js`. Open the site through a local server, switch to the new pair, and verify the resume looks correct.

### Step 4 — Create the PDF

1. Browser → select the new variant from the dropdown
2. `Ctrl+P` → destination: **Save as PDF**
3. Margins: **None** | Paper size: **A4** | Background graphics: **On**
4. Save to `resumes/Kartavya_Jharwal_Resume_Product_Manager_HealthTech.pdf`
5. Commit `data/resume.json`, `data/variants.json`, `index.html`, and the new PDF together

---

## Editing Existing Bullet Points

All content lives in `data/resume.json`. Edit bullet text there, run `bun run build`, commit. The PDF for any affected variant should be regenerated.

**MBB formatting standard** — every bullet must follow Action → Context → Result with a quantified outcome:

```
✗  Responsible for managing the API integration project.
✓  Engineered the payments API integration for a digital banking platform,
   reducing transaction latency by 34% and achieving PCI-DSS Level 1 compliance.
```

The build validator checks for numeric metrics (`%`, `$`, `×`, `bps`, `k`, `million`). A bullet without one will generate a warning. Warnings do not fail the build but they should be resolved before committing.

---

## Editing the UI

The semantic shell is `index.html`, CSS is in `assets/css/style.css`, and browser logic is in `assets/js/app.js`.

**Do not edit `public/data.js` by hand.** Bun owns that generated file, and the next build will overwrite manual changes.

---

## CSS Conventions

Everything derives from the base unit `--u` (base font size × line height). Spacing values should be integer or simple-fractional multiples of `--u`, not arbitrary pixel values.

```css
/* Good */
margin-bottom: calc(var(--u) * 1.5);

/* Avoid */
margin-bottom: 22px;
```

The design has three type sizes: `--s0` (body), `--s1` (labels), `--s2` (name). Do not introduce a fourth. If something needs more visual weight, use `font-weight`, `letter-spacing`, or `color` before reaching for a new size.

Neumorphic shadow convention:
- **Outset (resting):** `box-shadow: 3px 3px 0 0 #000`
- **Inset (active/pressed):** `transform: translate(2px,2px); box-shadow: none`

---

## Commit Style

```
feat: add pm-healthtech set pair
fix: correct date format on MBB Consulting entry
style: tighten letter-spacing on metric labels
data: update pm-fintech bullets with Q2 2026 metrics
build: update validate.js keyword list for swe-web3
```

Scope is optional but helpful. Commits that touch `index.html` as a result of `bun run build` should say so:

```
data: add consulting-saas pair, rebuild via bun
```

---

## What Not to Do

- Do not commit `node_modules/`
- Do not add a bundler (Webpack, Vite, Rollup, Parcel)
- Do not add TypeScript
- Do not add a CSS framework
- Do not add a JS framework
- Do not add Puppeteer or any headless browser dependency
- Do not move CSS or JS out of `index.html` into separate files — the single-file constraint is intentional and load-performance critical
- Do not add a `dist/` directory — root is dist

---

*Kartavya Jharwal · kartavya.tech*
