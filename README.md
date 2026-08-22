# kartavya.tech — Design Document & Architecture Spec

> **This README is the design spec and architecture document.** It defines what this site is, who it's for, and how it should work. Treat it as `design.md`.

> [!IMPORTANT]
> **Purpose-Built Digital Contact Landing Card & Gateway**  
> The main landing page deployed at CNAME `kartavya.tech` is **intentionally purpose-built as an interactive digital contact card**. Rather than a traditional multi-page corporate website, it functions as a high-density, glassmorphic entry point. It prioritizes immediate context-aware contact pathways (email selector, calendar, socials, Telegram), identity framing (*Ambitious Polymath*), and direct links to downstream project maps, microsites, and subfolders across the GitHub Pages ecosystem.

---

## What this is

**kartavya.tech** is my personal identity homepage — a permanent stake in the ground on the internet. One place to understand who I am, how to reach me, and where to go next.

People arrive here specifically to **understand me**: who I am, how I think, how to reach me, and where to go next if they want more.

The site is inspired by **personal identity websites** — handmade, layered, folder-based homes on the web where each subdirectory feels like a room in someone's digital house. The root page is the front door. Everything else is a door you choose to walk through.

**Domain:** [kartavya.tech](https://kartavya.tech)  
**Repo:** GitHub Pages static site  
**SEO & Sitemap:** Root `sitemap.xml` (ecosystem map: this origin + GitHub Pages rooms), `robots.txt` (including generative crawlers), `llms.txt` agent briefing, `404.html`, and JSON-LD Person / WebSite / ContactPage+ProfilePage.

---

## Design philosophy

The homepage leads with personality and intent. Subfolders are themed spaces — each with its own character, all linking back home. Navigation feels like a map: visitors choose their path. Contact is not buried. The site should feel like you met someone, not like you downloaded a template.

This is a living personal site — handmade, intentional, with room to grow into adjacent folders over time.

---

## Visitor journey

The site is structured in **layers of intent**. Each layer answers a different question. A visitor may stop at any layer — that's fine.

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — Front door (index / root)                    │
│  "You're here. Get in touch."                           │
│  Primary action: contact                                 │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  LAYER 2 — Identity                                     │
│  "Understand what Ambitious Polymath means."            │
│  Secondary action: read / explore the polymath idea     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  LAYER 3+ — Rooms (subfolders)                          │
│  "Go deeper into projects, work, experiments."          │
│  Tertiary action: navigate to subsequent spaces         │
└─────────────────────────────────────────────────────────┘
```

### Layer 1 — Get in touch (primary)

If someone lands on kartavya.tech, the first message is clear: **you can reach me here.**

Contact is not a flat icon row. It is **complex by design** — different channels and addresses for different contexts. The UI should make that legible without overwhelming the front door.

#### Email (three addresses, three purposes)

| Address | Purpose |
|---|---|
| [KartavyaJharwal@gmail.com](mailto:KartavyaJharwal@gmail.com) | Primary — general contact, professional reach-out |
| [kjisgreatforever@gmail.com](mailto:kjisgreatforever@gmail.com) | Legacy / fun — the old address, still mine, still valid |
| [kjharwal@student.hult.edu](mailto:kjharwal@student.hult.edu) | Academic — Hult outreach, university context |

Implemented on homepage as a context picker modal — three labeled addresses plus copy-to-clipboard.

#### Other channels

| Channel | URL | Context |
|---|---|---|
| Calendar | [cal.com/kartavya](https://cal.com/kartavya) | Schedule a meeting |
| Telegram | [@Kartavya_jharwal](https://t.me/Kartavya_jharwal) | Direct message |
| LinkedIn | [linkedin.com/in/kartavyajharwal](https://www.linkedin.com/in/kartavyajharwal/) | Professional network |
| GitHub | [github.com/Kartavya-Jharwal](https://github.com/Kartavya-Jharwal) | Code & projects |
| Instagram | [@kartavya_jharwal](https://instagram.com/kartavya_jharwal) | Personal / visual |

Layer 1 should feel immediate — not hidden behind scroll, not competing with project showcases.

### Layer 2 — Ambitious Polymath (identity)

After contact, the site invites understanding: **what does "Ambitious Polymath" actually mean for me?**

This is not a buzzword tagline. It is the framing device for how I operate across disciplines.

**Core definition (from current content):**

> A *polymath* is someone whose expertise spans a significant number of different subject areas — such a person is known to draw on complex bodies of knowledge to solve specific problems.

**Three pillars:**

| Pillar | Description |
|---|---|
| **Technology** | Software development, AI research, and digital innovation |
| **Business** | Strategic thinking, entrepreneurship, and global markets |
| **Creativity** | Design thinking, problem-solving, and innovation approaches |

**Personal summary:**

> My interdisciplinary approach combines technical skills, business acumen, and creative thinking to solve complex problems in unique ways.

**Anchor quote:**

> *"Study the science of art. Study the art of science. Develop your senses. Learn how to see. Realize that everything connects to everything else."*  
> — Leonardo da Vinci

### Layer 3+ — Rooms (subfolders)

After identity, visitors who want more enter **subsequent spaces** — project folders, collections, experiments. Each room has its own URL, its own feel, but always links back home.

The root is the person; the folders are the facets.

---

## Identity & roles

### Name & tagline

- **Name:** Kartavya Jharwal
- **Tagline:** Ambitious Polymath
- **Locations:** London · Jaipur

### Three roles

These describe *how I show up*, not job titles on a CV.

| Role | Essence |
|---|---|
| **Founder's Associate** | Building alongside founders — strategy, ops, and venture thinking from the inside |
| **Storyteller** | Narrative, communication, synthesis across disciplines |
| **Strategic Design** | Design-led technical work — systems, interfaces, and intentional product thinking |

### Role depth (hover / expand on homepage)

**Founder's Associate**
- Go-to-Market for Early-Stage Startups
- Fundraising and Due Diligence
- Business Strategy and Architecture

**Storyteller**
- Brand Ecosystem and Visual Design
- Design Thinking
- Stakeholder Alignment
- Cultural and Emotional Narratives

**Strategic Design**
- Insights to Strategy
- Systems Thinking and Implementation Strategy
- Technical Prototyping and AI Integration

---

## Site map

### Current state

```
kartavya.tech/
├── index.html          ← Layer 1 + 2 (contact + polymath)
├── home/               ← post-card site index (HOME button, new tab)
├── classic/            ← stub redirect → /home/
├── assets/
│   ├── logo/           ← categorised KJ marks (white/dark/neutral/bw + masters + social OG)
│   ├── css/            ← tokens, core, cursors, polymath, enhancements
│   ├── js/             ← site, cursor, polymath, shaders
│   └── webfonts/
├── archive/            ← deprecated code (do not deploy)
└── CNAME               ← kartavya.tech
```

### Target state (ground-up redesign)

```
kartavya.tech/
├── index.html              ← Front door: contact + identity
│
├── projects/               ← Layer 3: project rooms (from .Portfolio)
│   └── index.html
│
├── [future rooms]          ← expansion as needed
│   ├── garden/             ← ideas, essays (if built)
│   └── ...
│
└── assets/                 ← shared identity assets (logo, fonts, etc.)
```

Each subfolder is a **room**: self-contained, linkable, with a clear path back to `/`.

---

## Known projects (Layer 3 content)

Extracted from `.Portfolio/` — candidates for `/projects/`:

| Project | Type | Notes |
|---|---|---|
| **Personal Site** | Web | This site — kartavya.tech |
| **EcoLithify** | Web app | Sustainability / eco project |
| **The Bard** | Web app | Creative writing tool |
| **Amanuensis** | Tool | GitHub repo |
| **Bloom** | Tool | GitHub repo |
| **Numerology Calculator** | Tool | GitHub repo |
| **Quickie** | Tool | GitHub repo |

Project pages live in subfolders. The root page does not try to showcase all of them — it **points to the room** where they live.

---

## Visual & interaction direction

### Tone

- Personal, warm, present
- Confident, not loud
- Handmade with modern craft — intentional layout, readable type, personality over polish

### Background image + accent

Replace the wallpaper by overwriting one file: `assets/css/images/bg-main.jpg`

Accent stays the existing blue (`--color-primary` / `#9ec5ff` in `assets/css/design-tokens.css`). To change it later, edit that one token. No wallpaper switching system.

### Root page (`index.html`) should feel like

1. **A front door** — name, tagline, locations, three roles
2. **A handshake** — contact prominent and scannable, with context for each channel
3. **An invitation** — "Ambitious Polymath" opens identity (Layer 2), not a modal trap
4. **A map** — clear links outward to project rooms (Layer 3), when they exist

### Removed (coverage / dead-code pass)

- `main.css` (~86 KB html5up legacy) → archived as `main.legacy.css`, replaced by `core.css` (~8 KB)
- `theme.css` trimmed to tokens + base typography only
- Custom SVG cursor stack, `name-animation.js`, Font Awesome kit CDN (prior pass)
- `assets/sass/` source tree (unused; site is plain CSS)
- Duplicate modal CSS, orphan `satoshi.css` / `name-simple.css`

### File layout (CSS / JS)

| File | Role |
|---|---|
| `core.css` | Layout shell, card grain, logo plate, side/touch tooltips, contact icons, modal frame |
| `cursors.css` | 12px rest ball; hover blob at 65% of social cell; pairing glyphs; hide on name/logo |
| `polymath.css` | Layer 2 identity content |
| `enhancements.css` | Role-preview Kawase veil, skill cards, email UI, easter egg |
| `site.js` | Roles + veil origin, location times, logo tone, touch tooltips |
| `cursor-effects.js` | Contextual orb (pairings, city-tinted home, polymath hover) |
| `polymath.js` | Modal open/close + focus trap |
| `enhancements.js` | Particles |
| `bg-shader.js` | Optional wallpaper shader (off by default) |

### Landing card — current behaviour

- **Card:** glass + fractal grain; no main-page scrollbar; portrait contact-card spacing on vertical phones
- **Logo:** transparent white mark on the same glass plate as the card; 2% grow on hover (frog-rollout timing); cursor hidden over the plate
- **Tooltips:** beside the trigger on laptop, above + tap-to-show on mobile
- **Roles:** hover/tap opens a preview card; grey-cyan Kawase blur radiates from the card; logo stays sharp
- **Cursor (fine pointer, desktop):** 12px empty ball at rest; grows on socials / Home / cities / Ambitious Polymath. Pairings: briefcase, `<>`, camera, document, SMS, phone. Home uses a house icon tinted by the base city
- **HOME:** `home/`, larger label, opens in a new tab (`classic/` redirects there)

### What we keep

- Single background image (ssets/css/images/bg-main.jpg) + existing blue accent
- KJ logo mark — organised under `assets/logo/` (`white-transparent` is the live lockup; `bw-opaque-black` is unused on the plate)
- Satoshi as primary typeface
- Accessibility baseline: skip link, ARIA labels, keyboard nav, reduced-motion support
- Location tags (London · Jaipur) with live-time captions that stay inside the card
- Duct tape — CDN font fallbacks, inline guards, pragmatic workarounds that keep the site working

### Open design questions

- [ ] Is Layer 2 inline on the homepage, or its own `/about/` room?
- [ ] How do project rooms link back — consistent footer, breadcrumb, or "← home" stamp?
- [ ] Light mode, dark mode, or single theme?
- [x] How to present three emails — expandable `<details>` with context labels

---

## Code & assets

**Preserve the duct tape.** Inline fallbacks, CDN guards, and pragmatic hacks that keep things running stay unless there is a clear replacement. Do not strip dead code on principle — only remove what is genuinely unused.

**Use Lighthouse** to identify and remove unused CSS and JS. Coverage and audit reports are the gate for deletion, not aesthetics or tidiness.

| Item | Value |
|---|---|
| Hosting | GitHub Pages |
| Domain | kartavya.tech (CNAME) |
| Stack | Static HTML / CSS / JS — no build step required |
| Assets | Local fonts (Satoshi), logo PNGs in `assets/logo/` |
| Performance pass | Lighthouse — unused CSS/JS removal only |

No framework mandate. Prefer simplicity and deployability over tooling.

---

## Content changelog

Full history: [`CHANGELOG.md`](CHANGELOG.md).

| Date | Change |
|---|---|
| 2026-07-04 | README rewritten as design document. Passion/, Cards.html removed. Entrepreneur → Founder's Associate. Software Engineer → Strategic Design. |
| 2026-07-05 | Replaced `main.css` with `core.css`; polymath split into `polymath.css` + `polymath.js`. |
| 2026-08-23 | Landing-card polish: glass logo plate, Kawase role veil, pairing cursor, organised logos, updated role copy. |
| 2026-08-23 | SEO / GEO / agentic: `/home/` index, ecosystem sitemap, `llms.txt` briefing, ContactPage+ProfilePage JSON-LD, OG 1200×630 tags. |

---

*This is my homepage. Everything else is a room off of it.*
