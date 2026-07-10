# Typesetting Specification
### A Precision Specification for Single-Page Résumé Typesetting
#### First Principles → Derived Rules → Reference Implementation

**v1.0 — Kartavya Jharwal · Polymath Resume Dossier**

---

## 0. Scope and Epistemic Status

This document specifies the typesetting system for a single-page, unbound, information-dense reference document — a résumé/CV. This page class sits closer to a title page, colophon, or dictionary spread than to long-form book text. The document borrows the canon and terminology of book typesetting where that canon transfers, and explicitly declines to borrow it where it does not.

Every rule is tagged with its epistemic status, because "mathematically perfect typesetting" is a category error in roughly a third of the decisions a typesetter actually makes. Conflating a derived necessity with an aesthetic convention is the most common — and most easily caught — mistake in documents like this one.

| Tag | Meaning |
|-----|---------|
| **[N]** | **Necessary** — follows by derivation once prior parameters are fixed. Disputing it means disputing the math, not the taste. |
| **[E]** | **Empirical / heuristic** — grounded in long-standing type-design practice, but not a closed-form law. No vision-science citation is asserted where none is verifiable. |
| **[C]** | **Convention** — a free aesthetic parameter. Legitimate grounds for expert disagreement. |

Free parameters chosen in this document (page size, base size, ratios) are worked examples to keep the spec concrete and checkable — not claims that these are the *only* correct values.

---

## 1. The Base Unit (u)

**[C]** The base unit is defined as the leading (line-height) of body text, expressed in points. *Every other spatial value in the document is an integer or simple-fraction multiple of it.* This is the one non-negotiable structural commitment: a single generative unit, not independently-eyeballed margins, gaps, and sizes.

**[C]** Worked example: `u = 12pt` (= 1 pica — a real print-trade unit, not an arbitrary round number).

**[N]** Body size is then derived backward from `u` and a chosen leading ratio λ:

```
S0 = u / λ
```

**[E]** λ (leading-to-size ratio) should be tighter than book convention (λ ≈ 1.45–1.5) prescribes for résumé-width columns, because a short line lets the eye recover its horizontal position faster on the return sweep — it does not need the extra vertical air a long book line needs to prevent the eye from re-entering the wrong line.

Recommended range for résumé-width columns (typically 3.0–4.0 in / 76–100 mm): **λ ∈ [1.15, 1.30]**.

Worked example: λ = 1.263 → S0 = 12 / 1.263 = **9.5 pt**, rounded to a font-size step most engines and fonts handle cleanly.

### Implementation in this project

The CSS token system maps this directly:

```css
:root {
  --u:      12pt;     /* base unit = 1 pica */
  --lh:     1.263;    /* λ — leading ratio */
  --bf:     9.5pt;    /* S0 = u / λ (clamped for screen: clamp(9px, 1.25vh, 16px)) */
}
```

The `clamp()` on `--bf` is a screen-rendering adaptation — PDF/print always resolves to exactly 9.5 pt. The ratio is preserved either way.

---

## 2. The Modular Type Scale

**[C]** Ratio `r` is chosen from the compressed end of the standard modular-scale family. The golden ratio (1.618) is too aggressive for a three-level hierarchy on one page — it produces a name so large it unbalances the grey value before any content is read.

```
Sn = S0 × r^n
```

**Worked example, r = 1.2 (minor third), exactly three sizes — no more:**

| Level | Role | Formula | Raw value | Rounded (practical) |
|-------|------|---------|-----------|---------------------|
| L0 | Body / bullets | S0 | 9.5 pt | 9.5 pt |
| L1 | Title line (under name) | S0 × 1.2 | 11.4 pt | 11.5 pt |
| L2 | Name | S0 × 1.2² | 13.68 pt | 14 pt |

**[N]** Section labels (EXPERIENCE, EDUCATION) do **not** receive a fourth scale step — see §8. Introducing a fourth size to distinguish them would be a hierarchy error, not a refinement.

### Implementation in this project

```css
:root {
  --s0: var(--bf);                  /* 9.5 pt — body */
  --s1: calc(var(--bf) * 1.2);      /* 11.4 pt — labels */
  --s2: calc(var(--bf) * 1.44);     /* 13.68 pt — name (1.2²) */
}
```

The three tokens `--s0`, `--s1`, `--s2` are the only font-size values used anywhere in the document interior. This is enforced by convention, not by a linter — adding a fourth is flagged in `CONTRIBUTING.md`.

---

## 3. Page Construction — Margins Derived, Not Chosen

**[E]** The classical Van de Graaf / Villard de Honnecourt canon (documented by Tschichold) constructs margins geometrically from the page's own proportions rather than from a settings-dialog default. It was built for **bound, facing-page books**, dividing each page into ninths with an asymmetric inner/outer margin for the gutter.

**[N]** A résumé is a single unbound sheet — there is no gutter, so the inner/outer asymmetry has no referent and collapses to a symmetric left/right margin. What *does* transfer is the canon's core property: **the text block shares the page's own aspect ratio.**

**[C]** The divisor is the second free parameter the classical canon leaves implicit. Van de Graaf's *ninths* were sized for luxury book margins — generous, meant for a slow long-form read. A résumé is a dense reference document, closer in reading mode to a dictionary or directory, which historically used tighter divisions. This spec recommends **n ∈ [10, 16]**, not the classical n = 9, and flags this as a deliberate, reasoned departure rather than an oversight.

```
unit_x          = W / n
left margin     = right margin = unit_x
text_width      = W − 2·unit_x
text_height     = text_width × (H / W)    [preserves page aspect ratio in text block]
vertical_margin = H − text_height         [distributed top:bottom per §C below]
```

**[C]** The classical canon splits remaining vertical margin top:bottom ≈ 1:2 (more weight at the foot, so the text block does not read as sliding off the page). This ratio is aesthetic, inherited from the two-page canon, and is the single most legitimate point of expert pushback in this section — a tighter footing ratio (1:1.5) is equally defensible for a document not meant to sit open on a lectern.

**Worked examples, n = 12:**

| Page | W × H | Margins L/R | Text width | Text height | Top | Bottom |
|------|-------|-------------|------------|-------------|-----|--------|
| US Letter | 215.9 × 279.4 mm | 18.0 mm | 179.9 mm | 232.8 mm | 15.5 mm | 31.1 mm |
| A4 | 210 × 297 mm | 17.5 mm | 175.0 mm | 247.5 mm | 16.5 mm | 33.0 mm |

### Implementation in this project

The A4 canvas sits inside a fixed-proportion `1:√2` container scaled by a `ResizeObserver` on the stage element. Physical margins are applied via padding derived from the base unit:

```css
.sheet {
  padding:
    calc(1.06 * var(--u))    /* top    ≈ 12.7 pt */
    calc(1.85 * var(--u))    /* right  ≈ 22.2 pt */
    calc(1.06 * var(--u))    /* bottom ≈ 12.7 pt */
    calc(2.97 * var(--u));   /* left   ≈ 35.6 pt */
}
```

The left/right asymmetry (2.97u vs 1.85u) is a deliberate aesthetic choice for the digital rendering — it anchors the text block optically on the page without requiring gutter math. The left margin is heavier, reflecting the historical convention that the text block sits in the upper-inner quadrant of the page.

---

## 4. Baseline Grid Lock

**[N]** Once `u` and the page margins exist, every text baseline is constrained to:

```
baseline_k = top_margin + k·u        (k = 0, 1, 2, …)
```

**[N]** Any element set at a size other than S0 must have its leading rounded to the nearest **integer multiple of u** — not its own naturally-computed leading — otherwise it desyncs every baseline beneath it for the rest of the page.

Worked example: name at 14 pt with a naturally tight display leading (~15.4 pt) is forced to `2u = 24 pt` leading, consuming two grid rows and re-entering sync cleanly at row 3.

**[N — with a real limitation]** No mainstream software, including CSS, has a native "lock arbitrary element to baseline grid" primitive. This constraint is *enforced by convention* — every value used downstream must be manually verified as a multiple of `u`. This is a genuine open point, not a solved one; see §13.

### Implementation in this project

The name element forces a two-row grid snap:

```css
.r-name {
  font-size:   var(--s2);                  /* 14 pt */
  line-height: calc(var(--u) * 2);         /* 24 pt — 2u, grid re-sync */
  letter-spacing: var(--tr-display);
}
```

All spacing tokens (`--sp-section`, `--sp-item`, `--sp-tight`) are integer or simple-fraction multiples of `--u`, enforcing grid continuity through sections:

```css
--sp-section: calc(var(--u) * 2.25);
--sp-item:    calc(var(--u) * 1.5);
--sp-tight:   calc(var(--u) * 0.4);
```

---

## 5. Optical Alignment (Hanging Punctuation)

**[E — explicitly not a universal constant]** Bullets, dashes, and quotation marks are optically lighter than letterforms at the same coordinate origin because their ink occupies less of their advance width. There is **no single correct hang value** — it is a function of the specific glyph's ink-bounding-box within the specific font.

**Calibration procedure:**

```
hang_offset = (glyph_advance_width − glyph_ink_width) / 2  [+ small visual compensation]
```

In practice, for common bullet/dash glyphs in text-weight fonts, this resolves to roughly **0.15 em – 0.30 em** — stated as an empirical range requiring per-typeface verification by eye, or by extracting real glyph bounding boxes programmatically (e.g. via `opentype.js` at build time), not applied as a fixed constant across typefaces.

### Implementation in this project

Calibrated manually for Source Serif 4 / Inter at the body sizes used:

```css
.r-ul {
  list-style: none;
  padding-left: 1.1em;           /* en-dash hang calibrated for Source Serif 4 */
}
.r-ul li::before {
  content: '\2013';              /* U+2013 EN DASH — not a hyphen */
  position: absolute;
  left: -1.1em;
  color: #777;
}
```

The value `1.1em` is a calibration target for this specific font pairing. If the typeface changes, re-measure. The `opentype.js` build-time extraction is noted as a future improvement in §13.

**Note on `hanging-punctuation` CSS property:** The native property exists but has negligible cross-browser support at time of writing (meaningful only in Safari). The manual `margin-left` / `padding-left` approach above is the primary method, not a fallback.

---

## 6. Figure Treatment (Tabular vs. Oldstyle)

**[N, given the stated goal]** Two figure contexts exist on this page and they require different figure styles:

| Context | Rule | Rationale |
|---------|------|-----------|
| Numerals in a column meant to align vertically (date ranges, left-aligned) | **Tabular** (fixed advance width) | Numerals must stack into straight columns |
| Numerals inside running prose (inline in a bullet: "led a team of 12") | **Oldstyle / proportional** | Matches lowercase x-height rhythm; lining figures at cap-height visually shout inside a sentence |

**[C]** Most fonts default to one style or the other — the default must be overridden explicitly per context. Relying on a font's default is not a decision; it is an accident.

### Implementation in this project

```css
/* Document default — oldstyle proportional for body prose */
.sheet {
  font-variant-numeric: proportional-nums oldstyle-nums;
}

/* Override to tabular lining for date columns and metric figures */
.r-dt,
.r-co,
.metric .v {
  font-variant-numeric: tabular-nums lining-nums;
}
```

---

## 7. Tracking as a Function of Size

**[E — heuristic, no closed-form law asserted]** There is no verified physical or perceptual formula connecting tracking to point size. The long-standing type-design practice — historically hand-adjusted per master in metal type, now often interpolated via an optical-size axis in variable fonts — is:

| Size band | Direction | Practical range |
|-----------|-----------|-----------------|
| Display (L2, 14 pt+) | Negative (tighten) | −0.01 em to −0.02 em |
| Body (L0, 9.5 pt) | Neutral | 0 (as designed) |
| Small-caps section labels (~8–9 pt) | Positive (open up) | +0.04 em to +0.08 em |

**[N]** If the chosen typeface has a genuine optical-size axis, registering the correct optical-size value at each size is strictly preferable to a manual tracking adjustment — the font's interpolated masters encode this relationship more correctly than a uniform offset can.

### Implementation in this project

```css
:root {
  --tr-display: -0.025em;    /* name — slightly tighter than the worked example,
                                tuned by eye for Source Serif 4 at 14 pt */
  --tr-body:    0;            /* body text — no adjustment */
  --tr-label:   0.06em;       /* small-caps section labels — opened up */
}
```

Source Serif 4 exposes an optical size axis (`opsz`). The CSS `font-optical-sizing: auto` rule is set on `.sheet`, allowing the browser to register the correct master per rendered size automatically — the manual tracking tokens above are a supplement, not a replacement, for fonts that lack the axis.

---

## 8. Hierarchy: One Variable Per Transition

**[N — the single-lever constraint itself, given the stated ink-density goal]**
**[C — which specific variable is assigned to which transition]**

| Transition | Lever changed | Levers explicitly held constant |
|------------|--------------|----------------------------------|
| Body → Title line (L0 → L1) | Size only | weight, tracking, case |
| Title line → Name (L1 → L2) | Size only | weight, tracking, case |
| Body → Section label | Case + tracking only (small caps, +tracking) | size, weight, color |
| Bullet body → Company / role line | Weight only (medium vs. regular) | size, case, tracking |

Section labels deliberately do **not** get bold, a larger size, or a color change simultaneously — spending three levers to do one job is precisely the failure mode that breaks flat ink density (§10).

### Implementation in this project

```css
/* Section labels — case and tracking only, nothing else */
.r-lbl {
  font-family:     var(--sans);
  font-size:       var(--s1);           /* same size as surrounding text labels */
  font-weight:     400;                 /* NOT bold */
  font-variant-caps: all-small-caps;   /* lever 1: case */
  letter-spacing:  var(--tr-label);    /* lever 2: tracking */
  border-bottom:   0.75px solid #ccc;  /* structural separator, not hierarchy signal */
}

/* Company/role — weight only */
.r-co {
  font-weight: 500;    /* lever: weight */
  font-size:   inherit;
  font-variant-caps: normal;
  letter-spacing: var(--tr-body);
}
```

---

## 9. Micro-typography Floor (Correctness, Not Taste)

**[N]** These are Unicode-correctness issues, not aesthetic choices. Violating them is a bug, not a style disagreement.

| Rule | Correct | Incorrect |
|------|---------|-----------|
| Date ranges | En dash `U+2013` — `2019–2021` | Hyphen-minus `U+002D` — `2019-2021` |
| Apostrophes / closing quotes | Right single quotation mark `U+2019` — `'` | Straight quote `U+0027` — `'` |
| Non-breaking space | `U+00A0` between elements that must not break across a line (initials: `J.\u00A0Q.\u00A0Public`; number + word: `12\u00A0years`) | Regular space `U+0020` |
| Small caps | Font's own `smcp` / `c2sc` glyphs via `font-variant-caps` | Scaled capitals (scaled caps thin under magnification; stroke-weight mismatch is visible at arm's length) |
| Ligatures | `fi`, `fl`, `ffi`, `ffl` via `font-variant-ligatures: common-ligatures` | Disabled (missing is neutral; suppressing them where the font provides them is actively wrong) |

### Implementation in this project

All en dashes in the data layer are stored as the literal `\u2013` character in `data/resume.json`. The build validator checks for hyphen-minus in date fields and throws a warning. Non-breaking spaces between numbers and their units are applied by the `nb()` utility function at render time:

```js
// nb() — insert non-breaking space between digit and following unit
function nb(s) {
  return s.replace(/(\d)\s+(?=[A-Za-z%$€£])/g, '$1\u00a0');
}
```

---

## 10. Ink Density / Grey Value — A Testable Procedure

**[N — the procedure is objective and computable]**
**[C — the specific threshold below]**

1. Render the page to raster (300 dpi).
2. Convert to greyscale luminance.
3. Apply a Gaussian blur (σ ≈ 8–12 px — tune until individual letterforms dissolve but paragraph-block shapes remain).
4. Measure luminance variance across the blurred image, excluding true whitespace margins.

**[C]** Target: no local 1 cm² patch should deviate more than roughly **15%** from the page's median grey value. This threshold is a workable practical target, not a literature-derived constant — the point is that it converts "does this look right" into something a script can check, which is the actual contribution here, independent of the exact number chosen.

This procedure is not yet wired into the Bun build pipeline but is the intended home for it — a `bun/src/ink-density.js` script that renders the current variant HTML to a raster via a local Chromium print call (dev-environment only, never in CI), analyses the result, and outputs a pass/fail with a variance heatmap.

---

## 11. Typeface Selection Criteria

**[N]** These are required *properties*, not a required *font* — the spec is typeface-agnostic:

- A genuine optical-size axis (or true separate text/display masters — not one master scaled uniformly)
- True small caps
- Both oldstyle and lining figures, each in both tabular and proportional widths (four total figure sets)
- Sufficient hinting quality at 9–10 pt for a 300 dpi print/PDF target
- A real italic (not a synthetic oblique/skew)

Families in the optical-axis serif register (Tiempos Text, Untitled Serif, Source Serif 4) or quality sans with complete figure sets (Söhne, National, Graphik) are cited as illustrative, not prescriptive.

### Implementation in this project

**Document interior:** Source Serif 4 (Google Fonts, variable). Chosen for: optical-size axis (`opsz 8–60`), true small caps, complete figure sets, generous hinting at small sizes, and free/open licensing.

**Dashboard UI and document headers:** Inter (Google Fonts, variable). Chosen for: exceptional hinting at small sizes, complete figure sets, and legibility at the 9–10 pt range used in the contact line and section labels.

Both are loaded via `<link rel="preconnect">` + `display=swap` with system-stack fallbacks. The fallback stacks are chosen to approximate the optical size and weight class of the primary fonts, not just any sans/serif:

```css
--sans:  'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
--serif: 'Source Serif 4', Georgia, Cambria, 'Times New Roman', serif;
```

---

## 12. Reference Implementation — CSS Tokens

The complete token set as implemented in `index.html`. All values are traceable to sections above.

```css
:root {
  /* §1 — Base unit and leading */
  --u:   calc(var(--bf) * var(--lh));   /* 12 pt at S0=9.5, λ=1.263 */
  --bf:  clamp(9px, 1.25vh, 16px);      /* S0, screen-adaptive */
  --lh:  1.3;                            /* λ — leading ratio (screen rounding of 1.263) */

  /* §2 — Modular scale, r = 1.2 */
  --s0:  var(--bf);                      /* body */
  --s1:  calc(var(--bf) * 1.2);          /* labels */
  --s2:  calc(var(--bf) * 1.44);         /* name (1.2²) */

  /* §4 — Spacing: multiples of u */
  --sp-section: calc(var(--u) * 2.25);
  --sp-item:    calc(var(--u) * 1.5);
  --sp-tight:   calc(var(--u) * 0.4);

  /* §7 — Tracking */
  --tr-display: -0.025em;
  --tr-label:   0.06em;
  --tr-body:    0;
}
```

---

## 13. Known Limitations — Open for Review

Stated plainly:

1. **No true Knuth–Plass global paragraph optimisation in CSS.** `text-wrap: pretty` only re-scores the last ~4 lines of a block — it is not whole-paragraph optimisation. A genuine gap versus TeX.

2. **No HZ-style micro-justification** (per-glyph width modulation, per Zapf/URW's hz-program) exists in CSS at any browser.

3. **Hanging punctuation is manually calibrated per font**, not computed automatically from glyph metrics. A build step extracting real ink-bounding-boxes via `opentype.js` at build time would close this but is not yet implemented.

4. **Baseline-grid enforcement is convention-only.** CSS has no native equivalent to a page-layout application's grid-snapping. Correctness depends on every downstream value actually being checked as a multiple of `--u`.

5. **The 1:2 footing ratio in §3 is an inherited aesthetic**, not re-derived from single-sheet geometry — a legitimate point of disagreement.

6. **The tracking-vs-size function in §7 is a practitioner heuristic.** No vision-science source is cited for the specific ranges given, deliberately, to avoid asserting unverified figures.

7. **The n = 12 margin divisor in §3 is a reasoned substitution for the classical n = 9**, not a literature value — the most debatable single number in this document.

8. **Screen-to-print delta.** The `clamp()` on `--bf` means the document renders at a slightly different absolute size on screen than in print. The proportional system is preserved, but absolute point values diverge. The PDF workflow (print from real browser at 100% zoom) closes this gap for the downloadable artefact.

---

## 14. References

- Robert Bringhurst, *The Elements of Typographic Style*
- Jan Tschichold, *The Form of the Book* (documents the Van de Graaf / Villard de Honnecourt canon)
- Josef Müller-Brockmann, *Grid Systems in Graphic Design*
- D. E. Knuth & M. F. Plass, "Breaking Paragraphs into Lines," *Software: Practice and Experience*, 1981
- Hermann Zapf, writings on the URW hz-program (micro-justification)
- MDN Web Docs, `text-wrap` / `text-wrap-style` CSS specifications

---

*This document covers typographic decisions only. For layout architecture, animation, zoom decoupling, and the Bun build pipeline, see [`ARCHITECTURE.md`](./ARCHITECTURE.md).*
