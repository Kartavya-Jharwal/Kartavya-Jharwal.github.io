# Polymath Resume Dossier

**The anti-Teal**: A static resume engine that flips the traditional paradigm. Instead of building hundreds of resumes *for* yourself, this builds them *for* recruiters—serving hyper-specialized profiles while subtly revealing polymathic depth.

## Philosophy

Modern polymaths face the "jack of all trades, master of none" bias. This system solves that by:
- Serving recruiters a **hyper-specialized expert** for their exact role
- Surrounding that with a **high-contrast dashboard UI** that reveals multi-domain mastery
- Using **curated Set Pairs** (Role × Industry) instead of arbitrary mixing
- **Weighted randomization** ensures your top 3 target roles get most traffic

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  JSON Resume Data (FOSS Standard)                       │
│  ├─ data/resume.json     # Work, education, skills     │
│  └─ data/variants.json   # Set Pairs with filters      │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Bun Build Pipeline (Pure JavaScript)                   │
│  ├─ Validate schema & variants                          │
│  ├─ Compile filtered variants                           │
│  └─ Generate static HTML with embedded data             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Static Output (Zero Runtime Dependencies)              │
│  ├─ dist/index.html      # Single-file app             │
│  └─ dist/resumes/*.pdf   # Pre-made PDFs               │
└─────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- ✅ **Pure JavaScript** (no TypeScript complexity)
- ✅ **JSON Resume standard** (FOSS, portable, tool-compatible)
- ✅ **Static compilation** (no runtime frameworks)
- ✅ **Manual PDFs** (no Puppeteer/headless browser in build)
- ✅ **Bun for build only** (validation, compilation, Lighthouse tests)

## Domain Setup

**Primary**: `kartavya.tech`  
**Resume Subdomain**: `resume.kartavya.tech`

### Deep Linking

Direct link to specific variants:
```
https://resume.kartavya.tech/?role=Product+Manager&industry=FinTech
```

## Set Pairs (Role × Industry)

Curated combinations, not arbitrary mixes:

| ID | Role | Industry | Targeted? | Weight |
|----|------|----------|-----------|--------|
| `pm-fintech` | Product Manager | FinTech | ✓ | 30% |
| `swe-web3` | Systems Engineer | Web3 | ✓ | 30% |
| `consult-health` | Strategy Consultant | Healthcare | ✓ | 30% |
| `pm-web3` | Product Manager | Web3 | | 3.33% |
| `consult-fintech` | Strategy Consultant | FinTech | | 3.33% |
| `all` | Polymath | Universal | (fallback) | 0% |

**Weighted Randomization**: Cold visits randomly select one of the 3 targeted pairs. The "everything for everyone" pair is accessible via UI but never randomly served.

## Data Schema

Based on [JSON Resume](https://jsonresume.org/schema/) with extensions:

```json
{
  "work": [
    {
      "name": "Company Name",
      "position": "Role",
      "startDate": "2020-01-01",
      "endDate": "",
      "highlights": [
        {
          "text": "Impact statement with metrics",
          "variants": ["pm-fintech", "consult-fintech", "all"]
        }
      ]
    }
  ],
  "skills": [
    {
      "name": "Category",
      "keywords": ["Skill1", "Skill2"],
      "variants": ["pm-fintech", "all"]
    }
  ]
}
```

## Build Commands

```bash
# Validate JSON schema
bun run validate

# Build static site
bun run build

# Serve locally
bun run serve

# Clean output
bun run clean
```

## File Structure

```
polymath-resume-dossier/
├── data/
│   ├── resume.json         # JSON Resume data with variant tags
│   └── variants.json       # Set Pair definitions
├── build/
│   ├── validate.js         # Schema validation
│   └── compile.js          # Static site generation
├── public/
│   └── resumes/            # Pre-made PDF files
│       ├── Alex_Polymath_Resume_Product_Manager_FinTech.pdf
│       ├── Alex_Polymath_Resume_Systems_Engineer_Web3.pdf
│       └── ...
├── dist/                   # Build output (gitignored)
│   ├── index.html
│   └── resumes/
├── index.html              # Template (source of truth)
└── package.json
```

## PDF Workflow

PDFs are **manually created** and stored in `public/resumes/`. The build script does NOT generate them.

**Naming convention:**
```
[FirstName]_[LastName]_Resume_[Role]_[Industry].pdf
```

Examples:
- `Alex_Polymath_Resume_Product_Manager_FinTech.pdf`
- `Alex_Polymath_Resume_Systems_Engineer_Web3.pdf`

The download button dynamically links to the correct PDF based on active variant.

## Design System

**Visual Tension**: Brutalist dashboard wrapping a pristine A4 document.

- **A4 Canvas**: 1:√2 aspect ratio with Van de Graaf canon margins
- **Typography**: Serif (Georgia/Source Serif) for document, Sans (Inter) for UI
- **Colors**: Black/white with ambient div glows
- **No Splash on Desktop**: Base layers load progressively
- **Mobile Splash Blocker**: Prevents bad mobile A4 experience

## Metadata & Analytics

First-time implementation for a static site:

```javascript
function track(event, data) {
  if (window.gtag) {
    window.gtag('event', event, data);
  }
}

// Track events
track('cold_visit', {pair: 'pm-fintech'});
track('deeplink', {pair: 'swe-web3', source: 'email'});
track('variant_switch', {from: 'pm-fintech', to: 'swe-web3'});
track('pdf_download', {variant: 'pm-fintech'});
```

## Future Scope (Reserved)

- **Animation libraries**: anime.js, GSAP, Three.js (space reserved in CSS)
- **Audio player**: Curated lo-fi soundtrack with autoplay bypass
- **Lighthouse optimization**: Target 100/100 across all metrics

## License

Private project. Résumé content © Kartavya Jain

---

**Built with**: Bun, JSON Resume standard, pure JavaScript  
**Deployed to**: `kartavya.tech` and `resume.kartavya.tech`

