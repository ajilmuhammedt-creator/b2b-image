# Sanford AI Studio — UI/UX hand-off for Antigravity

This folder restyles your **existing** Sanford AI Studio app (React + Supabase + Vercel + GitHub). It changes how the app looks and how screens are laid out. It does **not** change your database, Supabase functions, AI calls or business logic.

## What's inside

| File | What it is |
|---|---|
| `01-ANTIGRAVITY-PROMPT.md` | The prompts to paste into Antigravity, one phase at a time |
| `02-DESIGN-SYSTEM.md` | Colours, type, spacing, components and layout rules for the app |
| `03-SCREEN-MAP.md` | Which reference screen matches which page/route in your app |
| `design-tokens/tokens.css` | CSS variables for the app UI (white and red theme) |
| `design-tokens/tailwind.tokens.js` | The same tokens for `tailwind.config` |
| `brand-kit/BRAND-KIT.json` | Sanford packaging rules as data (category colours, sizes, checks). Used only for packaging artwork, never for the app UI |
| `screens/v2/*.reference.html` | Reference designs for the main app screens |
| `screens/v3/*.reference.html` | Reference designs for Gift box studio, Product brief, Brand kit |

The `.reference.html` files are design references written for the design canvas. They will **not** open as normal web pages. Antigravity reads their layout, inline styles, labels and sample data. Do not copy them into the app as-is.

## How to use it (step by step)

1. **Make a safe branch first.** In Antigravity's terminal:
   `git checkout -b ui-v3-restyle`
   Every change goes on this branch, and Vercel gives you a preview link for it. Your live app is not touched until you merge.
2. **Copy this whole folder into your repo** as `docs/design/` (so you have `docs/design/README.md`, `docs/design/screens/...` and so on). Commit it.
3. **Take screenshots** of each screen from the Sanford AI Studio design canvas (open a screen, press Play or focus it, screenshot). Save them as `docs/design/screenshots/<ScreenName>.png`. Antigravity follows pictures much better than code alone.
4. **Open `01-ANTIGRAVITY-PROMPT.md`.** Paste the *Standing instructions* first, then *Phase 0*. Read what it reports.
5. Paste one phase at a time. After each phase: open the Vercel preview link, click through, then commit.
6. When every phase looks right, open a pull request on GitHub and merge.

## Also attach in Antigravity (you already have these)

- `Sanford-Brand-Packaging-Kit.pdf`
- `09-SF5905GM-C-GIFTBOX-IMAGE-PROMPT.json`

Full build reference (database tables, pipeline, connectors): the "Sanford AI Studio — Antigravity build prompt (v2)" doc.
