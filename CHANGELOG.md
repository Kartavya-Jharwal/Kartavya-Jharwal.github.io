# Changelog

All notable changes to the kartavya.tech landing card. The README remains the design spec.

## 2026-08-23 — Contact-card SEO / GEO / agentic

- Root stays the contact card; depth lives in `llms.txt`, JSON-LD, and aria — not extra on-card copy
- `classic/` renamed to `home/` as the temporary post-card index; `classic/` redirects
- Sitemap is an ecosystem map (this origin + GitHub Pages rooms + planned resume subdomain); Nirmana is https
- `robots.txt` points at `llms.txt`; briefing covers coined Ambitious Polymath, visual card story, and rooms
- JSON-LD: single ContactPage+ProfilePage node; Person `relatedLink` mirrors rooms; speakable on visible nodes
- OG still tags assume 1200×630 `assets/logo/social/og.png` (drop the photo into that path)

## 2026-08-23 — SEO, GEO, and agentic metadata

Kept the existing Person / ContactPage story and layered:

- Richer title, description, keywords, `og:profile`, locale, image alt, `rel="me"`
- JSON-LD graph: Person (occupations, knowsAbout, contactPoints, alumniOf Hult), WebSite, ProfilePage, speakable
- `llms.txt` briefing for generative engines and agents
- `robots.txt` allows major AI crawlers
- Homepage `lastmod` in `sitemap.xml`

## 2026-08-23 — Landing-card polish

### Card & layout
- Glassmorphic contact card with fractal grain overlay on the card and logo plate
- Transparent white KJ mark (`assets/logo/white-transparent`) instead of the opaque black `_bw` square
- Logo assets sorted into `white-transparent`, `dark-transparent`, `neutral-transparent`, `bw-opaque-black`, `masters`, and `social`
- Portrait phones get taller vertical rhythm (polymath → roles → Home)
- No scrollbar on the main screen
- HOME button copy, larger type, `classic/` in a new tab

### Interaction
- Laptop tooltips float beside the trigger; mobile tooltips sit above and work on tap
- Role previews: grey-cyan Kawase-style blur radiating from the card; logo stays sharp; hover no longer jitters
- Custom cursor: 12px empty ball at rest; grows to 65% of a social cell on Home, cities, socials, and Ambitious Polymath
- Pairing glyphs: LinkedIn → briefcase, GitHub → `<>`, Instagram → camera, Telegram → SMS, Email → document, Calendar → phone
- Cursor hidden on the name and logo plate; logo + plate scale 2% on hover (frog-rollout timing)

### Content
- Founder's Associate: Go-to-Market, fundraising / due diligence, business strategy and architecture
- Strategic Design: insights to strategy, systems thinking, technical prototyping and AI integration
- Storyteller: brand ecosystem, design thinking, stakeholder alignment, cultural and emotional narratives

## 2026-07-05 — CSS split
- Replaced `main.css` with `core.css`; polymath split into `polymath.css` + `polymath.js`

## 2026-07-04 — Design document
- README rewritten as the architecture spec
- Role labels: Entrepreneur → Founder's Associate; Software Engineer → Strategic Design
