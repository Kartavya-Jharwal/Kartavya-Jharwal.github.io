# Polymath Resume Dossier

**The anti-Teal**: A static resume engine that serves recruiters hyper-specialized profiles while revealing polymathic depth.

## Architecture

**Pure separation**: HTML, CSS, and JavaScript in separate files. Bun only populates data during build.

```
┌─────────────────────────────────────────────────────────┐
│  Build Time (Bun)                                       │
│  ├─ Validate JSON Resume schema                         │
│  ├─ Compile variant-filtered content                    │
│  └─ Inject data into static/data.js                     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Runtime (Pure Vanilla JS)                              │
│  ├─ Targeted DOM updates on variant switch              │
│  ├─ Anime.js for vector animations                      │
│  ├─ Three.js for center canvas glow                     │
│  └─ Motion CSS for content transitions                  │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
polymath-resume-dossier/
├── build/
│   ├── validate.js         # Schema validation
│   ├── compile.js          # Data compilation (outputs static/data.js)
│   └── test.js             # Build tests
├── data/
│   ├── resume.json         # JSON Resume with variant tags
│   └── variants.json       # Set Pair definitions
├── static/
│   ├── css/
│   │   ├── reset.css       # CSS reset
│   │   ├── tokens.css      # Design tokens (colors, spacing)
│   │   ├── layout.css      # Grid system
│   │   ├── typography.css  # A4 document styles
│   │   └── animations.css  # Motion CSS transitions
│   ├── js/
│   │   ├── data.js         # Compiled variant data (generated)
│   │   ├── state.js        # State management
│   │   ├── render.js       # Targeted DOM updates
│   │   └── animations.js   # Anime.js + Three.js setup
│   └── lib/
│       ├── anime.min.js    # Anime.js (vector animations)
│       └── three.min.js    # Three.js (canvas glow)
├── public/
│   └── resumes/            # Pre-made PDFs
├── index.html              # Clean HTML structure only
└── package.json
```

## Key Principles

### 1. Bun for Build Only
- **Validates** JSON schema
- **Compiles** variant data
- **Generates** `static/data.js`
- **Copies** files to `dist/`

### 2. Targeted DOM Updates
No full re-renders. On variant switch:
```javascript
// Only update what changed
updateName(newVariant.d.name);
updateSummary(newVariant.d.sum);
updateExperience(newVariant.d.exp);  // Diff and patch
updateMetrics(newVariant.m);         // Odometer animation
```

### 3. Animation Stack
- **Anime.js**: Vector animations (logo glow, metric rollers)
- **Three.js**: 3D canvas glow effect behind A4 sheet
- **Motion CSS**: Content fade/slide transitions on update

### 4. Set Pairs (6 curated combinations)

| ID | Role | Industry | Weight |
|----|------|----------|--------|
| `pm-fintech` | Product Manager | FinTech | 30% |
| `swe-web3` | Systems Engineer | Web3 | 30% |
| `consult-health` | Strategy Consultant | Healthcare | 30% |
| `pm-web3` | Product Manager | Web3 | 3.33% |
| `consult-fintech` | Strategy Consultant | FinTech | 3.33% |
| `all` | Polymath | Universal | 0% (UI only) |

## Commands

```bash
# Validate JSON schema + keywords
bun run validate

# Build static site (generates static/data.js + copies to dist/)
bun run build

# Run tests
bun run test

# Serve locally
bun run serve

# Clean build artifacts
bun run clean
```

## Deep Linking

Direct link to specific variants:
```
https://resume.kartavya.tech/?role=Product+Manager&industry=FinTech
```

Tracked via Google Analytics 4:
```javascript
track('deeplink', {pair: 'pm-fintech', source: 'email'});
```

## Animation Details

### Anime.js (Vector Animations)
- Logo ambient glow pulse
- Metric odometer rolling on variant switch
- Smooth dropdown morph transitions

### Three.js (Center Glow)
- Radial gradient shader behind A4 canvas
- Subtle parallax on mouse move
- Color shifts based on active variant

### Motion CSS (Content Transitions)
```css
@media (prefers-reduced-motion: no-preference) {
  .resume-content {
    view-transition-name: resume-content;
  }
}
```

## Deployment

**Primary**: `kartavya.tech`  
**Subdomain**: `resume.kartavya.tech`

Deploy via:
- GitHub Pages
- Netlify
- Vercel (static)
- Any CDN

## PDF Workflow

PDFs are **manually created** (no Puppeteer):

1. Open `dist/index.html` in browser
2. Select variant from dropdown
3. Print to PDF (Ctrl+P, margins: none)
4. Save to `public/resumes/[Name]_[Role]_[Industry].pdf`

The download button auto-links to the correct PDF.

## Performance

- **Build time**: ~50ms
- **Bundle size**: ~120KB (with anime.js/three.js)
- **FCP**: <1s
- **No layout shift**: Motion CSS view transitions
- **Target**: Lighthouse 100/100

## License

Private project. Resume content © Kartavya Jain

---

**Tech Stack**: Vanilla JS, CSS, JSON Resume, Bun (build only)  
**Animation**: Anime.js, Three.js, Motion CSS  
**Deployment**: kartavya.tech / resume.kartavya.tech


