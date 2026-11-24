# Femmora — For women who lead.

A demo storefront for **Femmora**, a premium formal-workwear brand created for MKTG 201 (Principles of Marketing), Group 1. The site reflects the team's final marketing strategy (Deliverable 3): burgundy and gold, trench coats as the hero product, three service tiers, and the "Beyond the Silhouette" launch.

**Live site:** https://moss1123.github.io/Femmora/

## What's inside

- **Home** — an interactive 3D clothing rack with three trench coats (ivory, burgundy, camel). Click a coat: it lifts off the rail, flies to the front, twirls and zooms into the page it represents. Below it, a scroll story covering the brand promise, the four differentiators, the looks, the tiers, the launch roadmap and the Private List.
- **Styling** — the "Dress the Woman You're Becoming" consultation campaign: one piece three ways, an occasion guide with formality levels, colour pairings and the capsule wardrobe.
- **The Collection** — a filterable range led by trench coats, with formality levels, made-to-measure pricing, quick view, capsule bundles and a shopping bag (demo checkout).
- **Custom Services** — tier comparison, the atelier process, a fit profile, corporate programmes, the Femmora Circle and a booking form for the Dolmen Mall Lahore flagship.

All visuals are drawn in code (3D garments, SVG illustrations, CSS textures) — there are no photographs. Forms and checkout are demo-only and send nothing.

## Run it locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build

```bash
npm run build          # production build served from /
npm run build:pages    # production build for GitHub Pages (served from /Femmora/)
```

Pushing to `main` deploys to GitHub Pages automatically (`.github/workflows/deploy.yml`).

## Built with

React 19, TypeScript, Vite, Three.js with React Three Fiber and drei, GSAP (ScrollTrigger, SplitText), Motion, Lenis and Zustand.
