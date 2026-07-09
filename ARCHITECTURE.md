# Architecture Overview

## Core Philosophy

**No TypeScript. No Puppeteer. No Framework Bloat.**

This is a **pure JavaScript static site generator** that:
1. Validates JSON Resume schema
2. Compiles variant-filtered content
3. Generates a single HTML file with embedded data
4. Deploys to CDN (GitHub Pages / kartavya.tech)

## Key Design Decisions

### 1. Pure JavaScript (Not TypeScript)
**Why:** TypeScript adds build complexity without meaningful benefit for a ~500 LOC project.

**Trade-offs:**
- ✅ Zero type-checking overhead
- ✅ Simpler mental model
- ✅ Faster iteration
- ❌ No compile-time type safety (mitigated by runtime validation)

### 2. JSON Resume Standard (FOSS)
**Why:** Don't reinvent schemas. Use the open-source [jsonresume.org](https://jsonresume.org/schema/) standard.

**Benefits:**
- ✅ Portable data (works with other resume tools)
- ✅ Well-documented structure
- ✅ Community validation
- ✅ Future-proof

**Extension:** Added `variants` array to highlights and skills for filtering.

### 3. No Puppeteer (Manual PDFs)
**Why:** Headless browser PDF generation is:
- Complex (Chromium dependencies)
- Slow (~5-10s per PDF)
- Brittle (layout shifts, font rendering issues)
- Overkill for 6 static PDFs

**Solution:** Manually create PDFs once, store in `/public/resumes/`. Update only when content changes.

### 4. Bun for Build Only
**Why:** Bun is fast (~50ms builds) and has native TS support for tests.

**What Bun Does:**
- ✅ Schema validation
- ✅ Variant compilation
- ✅ Static HTML generation
- ✅ Asset copying
- ✅ (Future) Lighthouse testing

**What Bun Doesn't Do:**
- ❌ Runtime serving (use any static file server)
- ❌ PDF generation (manual workflow)
- ❌ Hot reloading (not needed for static builds)

## Data Flow

```
┌─────────────────────────────────────┐
│  data/resume.json                   │
│  - JSON Resume standard             │
│  - Extended with "variants" tags    │
└──────────────┬──────────────────────┘
               │
               ├─────────────────────────────┐
               │                             │
               ▼                             ▼
┌──────────────────────┐      ┌──────────────────────┐
│  data/variants.json  │      │  build/validate.js   │
│  - Set Pair configs  │      │  - Schema checks     │
│  - Weights, metrics  │      │  - Variant refs      │
└──────────┬───────────┘      │  - Keyword ATS       │
           │                  └──────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  build/compile.js                   │
│  1. Load data                       │
│  2. Filter highlights by variant    │
│  3. Format dates (en dash)          │
│  4. Generate data script            │
│  5. Inject into index.html          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  dist/index.html                    │
│  - Single file with embedded data   │
│  - Pure client-side hydration       │
│  - Zero backend dependencies        │
└─────────────────────────────────────┘
```

## Variant System

### Set Pairs (Not Arbitrary Mixing)

**Bad:** `Role[]` × `Industry[]` = exponential combinations

**Good:** Curated `SetPair[]` with explicit filtering

```javascript
{
  "id": "pm-fintech",
  "role": "Product Manager",
  "industry": "FinTech",
  "targeted": true,
  "weight": 30,
  "requiredKeywords": ["Product Strategy", "Payments", "API Design"]
}
```

### Filtering Logic

1. **Highlights**: Only show bullets tagged with `variants: ["pm-fintech", "all"]`
2. **Skills**: Only show skills tagged with matching variants
3. **Experience**: Only show companies with ≥1 matching highlight

**Result:** Each variant sees 3-4 companies with 2-4 bullets each = fits on A4 page

### Weighted Randomization

```javascript
// 3 targeted pairs get 30% each = 90% traffic
// 3 other pairs share remaining 10%
// "all" pair is UI-accessible but never randomly served

const targeted = P.filter(p => p.tgt);
const pick = targeted[Math.floor(Math.random() * targeted.length)];
```

## URL Parameters

Deep linking to specific variants:

```
https://resume.kartavya.tech/?role=Product+Manager&industry=FinTech
```

**Use cases:**
- Email signatures
- LinkedIn profile
- Job applications
- Recruiter outreach

**Analytics:** Every deep link is tracked with `gtag('event', 'deeplink', {...})`

## Typography & Layout

### A4 Constraints

```
Width  : Height = 1 : √2 ≈ 1 : 1.4142
595.27pt × 841.89pt (at 72 DPI)
```

### Van de Graaf Canon Margins

```
Top    : 1.06u
Right  : 1.85u
Bottom : 1.06u
Left   : 2.97u

where u = baseFont × lineHeight
```

**Why Van de Graaf?** Geometric harmony derived from page proportions, not arbitrary inches.

### Baseline Grid

All vertical spacing is integer multiples of `u`:
- Section spacing: `2.25u`
- Item spacing: `1.5u`
- Tight spacing: `0.4u`

**Result:** Perfect vertical rhythm, no half-pixel rendering.

## PDF Workflow

### 1. Manual Creation
- Open `dist/index.html` in browser
- Select variant from dropdown
- Print to PDF (Ctrl+P)
- Choose "Save as PDF"
- Settings: Margins = None, Background graphics = On

### 2. Naming Convention
```
[FirstName]_[LastName]_Resume_[Role]_[Industry].pdf
```

### 3. Storage
Place in `public/resumes/`. Build script copies to `dist/resumes/`.

### 4. Download Button
```javascript
function pdfHref(pair) {
  return `resumes/${pair.role.replace(/\s+/g,'_')}_${pair.industry.replace(/\s+/g,'_')}.pdf`;
}
```

## Analytics (Static Site)

**Challenge:** No server-side logging on static CDN.

**Solution:** Client-side events pushed to Google Analytics 4:

```javascript
function track(event, data) {
  if (window.gtag) {
    window.gtag('event', event, data);
  }
}

// Examples
track('cold_visit', {pair: 'pm-fintech'});
track('variant_switch', {from: 'pm-fintech', to: 'swe-web3'});
track('pdf_download', {variant: 'pm-fintech'});
```

**Metrics to track:**
- Cold visits vs deep links
- Most viewed variants
- PDF downloads per variant
- Time on page
- Variant switching patterns

## Deployment

### GitHub Pages
```bash
git subtree push --prefix dist origin gh-pages
```

### Custom Domain (kartavya.tech)
1. Add CNAME record: `resume.kartavya.tech` → `[username].github.io`
2. Enable HTTPS in GitHub settings
3. Deploy via GitHub Actions (future)

### CDN Optimization
- Minify HTML (future)
- Compress assets (Brotli/Gzip)
- Set cache headers (`Cache-Control: public, max-age=31536000`)

## Future Enhancements

### Phase 2: Animation
- Reserve CSS class hooks for anime.js/GSAP
- Odometer metric rolling on variant switch
- Smooth canvas scaling transitions

### Phase 3: Audio
- Curated lo-fi soundtrack
- Autoplay bypass via splash interaction
- Brutalist music player UI in sidebar

### Phase 4: Lighthouse 100/100
- Critical CSS inlining
- Font preloading
- Image optimization (logo at 1x/2x/3x)
- Accessibility audit

## Performance Budget

| Metric | Target | Current |
|--------|--------|---------|
| FCP | <1.8s | ~0.5s |
| LCP | <2.5s | ~1.0s |
| CLS | <0.1 | 0 |
| TTI | <3.8s | ~1.5s |
| Lighthouse | 100 | TBD |

## Maintenance

### Adding a New Variant

1. Edit `data/variants.json`:
```json
{
  "id": "new-variant",
  "role": "New Role",
  "industry": "New Industry",
  "targeted": false,
  "weight": 3.33,
  "description": "...",
  "requiredKeywords": [...]
}
```

2. Tag highlights in `data/resume.json`:
```json
{
  "text": "Achievement statement",
  "variants": ["new-variant", "all"]
}
```

3. Create PDF:
- Build site: `bun run build`
- Open in browser, select variant
- Print to PDF
- Save to `public/resumes/`

4. Rebuild: `bun run build`

### Updating Content

1. Edit `data/resume.json` (JSON Resume standard)
2. Run validation: `bun run validate`
3. Rebuild: `bun run build`
4. Regenerate affected PDFs

### Adjusting Weights

Edit `data/variants.json` weights. Must sum to ~100% (or 0 for non-random variants).

---

**Last updated:** 2026-07-08  
**Build time:** ~50ms  
**Bundle size:** ~90KB (uncompressed HTML)
