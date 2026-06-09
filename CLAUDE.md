# Aria Home Flow — Project Instructions

## What is this?
Interactive prototype of Aria's home screen onboarding flow.
Built with React 18 + Babel standalone (no build step, runs in browser).

## Live URL
https://nettawit.github.io/aria-funnel/

## Deploy workflow
Edit files here → `git add . && git commit -m "..." && git push` → live in ~30s

## Key files
- `round-13.jsx` — ALL logic, components, states, flows
- `index.html` — CSS, fonts, animation keyframes
- `logo.svg` — Wix logo (official SVG)
- `image-1781023178778.webp` — avatar photo

## Design system
Wix Harmony. Use `/harmony-spec` for full token reference.
Storybook: https://www.wix-pages.com/wix-design-system-employees/

## App flow
Steps 0–3 = intro screens → Step 4 = HomeFlow → Step 5 = GeneratingScreen

## Detection logic (HomeFlow)
- `detectName()` — site name
- `detectType()` — business type
- `detectUnique()` — unique angle / long description
- `stateKey` = "000"→"111", debounced 1.2s
- `isTyping` = true while user types, clears after 1.5s → triggers border pulse

## Template images
Wix CDN URLs, organized by category (TPL_GENERAL, TPL_FOOD, TPL_FASHION, etc.)
Category selected automatically based on prompt keywords.

## Owner
Netta Witztum — nettaw@wix.com
