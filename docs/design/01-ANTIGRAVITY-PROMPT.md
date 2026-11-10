# Antigravity prompts — restyle the existing Sanford AI Studio

Paste these into Antigravity **one block at a time**. Wait for each phase to finish, check the Vercel preview, commit, then paste the next.

---

## Standing instructions (paste at the start of every new session)

```text
You are restyling an EXISTING app: Sanford AI Studio (React, Supabase, Vercel, GitHub).
The design hand-off is in docs/design/. Read docs/design/README.md, 02-DESIGN-SYSTEM.md and 03-SCREEN-MAP.md before any task.

Rules:
- Change the UI and UX only. Do NOT change Supabase tables, RLS policies, Edge Functions, API routes, AI/model calls, env variables or business logic unless I explicitly ask.
- Keep every existing feature and route working. If a reference screen shows something the app does not have yet, add the UI with a clear empty state and list it as "needs backend" in your report. Never fake data in production code.
- Use only the tokens in docs/design/design-tokens/. No new colours, fonts, shadows or button styles.
- The files in docs/design/screens/ are references (canvas format, not runnable). Read their layout, spacing, labels and states; rebuild them with our real components and real data.
- docs/design/brand-kit/BRAND-KIT.json is for packaging ARTWORK only. Never use its colours for app UI.
- Red (#C8281E) is only for the ONE main action button on a screen and today's date. Selection = dark ring, active nav = dark pill.
- Every screen needs loading, empty and error states, works at 390 px wide, and keeps keyboard focus visible.
- Work in small steps: plan, show me the plan, wait for my OK, build, run, tell me what changed and which files.
- Do not delete files you didn't create; ask first.
```

---

## Phase 0 — Audit (no code changes)

```text
Audit the current app against docs/design/. Do not change any code yet.
1. List every route/page and its main components, and map each one to a reference screen in 03-SCREEN-MAP.md (or "no match").
2. List where colours, fonts, spacing and buttons are currently defined (CSS files, Tailwind config, UI library, inline styles).
3. List every existing feature that a reference screen does NOT show, so we don't lose it.
4. List every reference-screen feature the app does NOT have yet, and say if it needs backend work.
5. Propose the order of phases 1–6 below for this codebase and estimate which files each phase touches.
Write the result to docs/design/AUDIT.md and show me a summary.
```

## Phase 1 — Design tokens and base components

```text
Phase 1: foundation only.
1. Add docs/design/design-tokens/tokens.css to the global styles and merge tailwind.tokens.js into tailwind.config (keep existing config working).
2. Load fonts: Plus Jakarta Sans (app UI). Remove other UI fonts except where packaging previews need the brand-kit stand-ins.
3. Build or restyle these shared components to match 02-DESIGN-SYSTEM.md: Button (primary/secondary/ghost/destructive), IconButton, Field, Select, Textarea, Segmented, Tabs, Badge (lifecycle + checks), Card, Drawer, Dialog, Toast, Skeleton, EmptyState, Switch, Avatar, StageBar, ImageTile.
4. Create a /dev/components page showing every variant and state.
5. Replace old button/input/badge styles across the app with these components. No layout changes yet.
Show me /dev/components and the list of files changed.
```

## Phase 2 — App shell

```text
Phase 2: app shell. Match screens/v2/Home.reference.html (sidebar + top bar).
1. Sidebar 232 px, collapsible to icons: Home, My work (count badge), Calendar, Products, Studios (E-commerce, Social media, Packaging, Retail flyers), Library (Brand kit, Templates), Settings. Active item = dark pill.
2. Top bar 56 px: page title/breadcrumb, search button (Ctrl/Cmd+K opens a command menu), Jobs tray (live count of running generation jobs from our existing jobs data; if none exists, show the button with an empty state), notifications bell, avatar menu (profile, sign out).
3. Remove the old double header ("Logged in as" strip). Move user + logout into the avatar menu.
4. Phone width: sidebar becomes a bottom bar (Home, My work, Calendar, Studios, More).
5. Keep all existing routes. Restyle the sign-in page to match the white-and-red sign-in.
```

## Phase 3 — Studio template (E-commerce first)

```text
Phase 3: one layout for every studio. Match screens/v2/Studio.reference.html.
1. Build a StudioLayout: header (project name, product chip, StageBar Brief > Generate > Review > Deliver, one primary action), left Brief panel (collapsible), middle Canvas (image tiles), right Inspector (large preview, checks, versions, change request, Approve / Send back), bottom bar ("3 of 6 approved" + Deliver button, disabled until all approved).
2. Move the current Studio page (catalogue upload, specs, slot customization, studio settings, generated images) into this layout. Keep every existing control and API call; only move and restyle them. Studio settings (model, quality, sizes, background, accent, style lock) go into the Brief panel under "More settings".
3. Image tiles: title on its own line (no truncation like "Her o..."), status badge on the image corner, checkbox top-left, states for generating (progress), failed check, approved.
4. Export: one "Download ZIP" button plus a "More" menu (phone, folder, other formats). Format shown once in the toolbar, not on every tile.
```

## Phase 4 — Other studios

```text
Phase 4: apply StudioLayout to the other studios that exist in the app. References:
- Social media: screens/v2/Social.reference.html
- Retail flyers: screens/v2/Flyers.reference.html
- Packaging (gift box): screens/v3/GiftBox.reference.html — includes the flat dieline map, clickable faces, Inspector with "where each item comes from", Concept proof / Production toggle, pre-print gate in the footer.
- Product brief: screens/v3/ProductBrief.reference.html
For studios the app doesn't have yet, create the page with real empty states and list the backend work needed. Do not invent data.
For packaging artwork colours, read the product's category token from brand-kit/BRAND-KIT.json (kitchen, grooming, cooling, lighting, aircooler-gold).
```

## Phase 5 — Work, calendar, settings

```text
Phase 5: team screens. References:
- My work (tasks + approvals + mentions in one list, detail on the right, J/K/A/R shortcuts): screens/v2/Work.reference.html
- Phone approval: screens/v2/Phone.reference.html
- Campaign calendar: screens/v2/Calendar.reference.html
- Team and roles: screens/v2/Team.reference.html
- Connections and agent: screens/v2/Connections.reference.html
- Brand kit library: screens/v3/BrandKit.reference.html
Wire to existing data where it exists. Where tables don't exist yet, build the UI with empty states and write the needed tables/migrations as a PROPOSAL in docs/design/BACKEND-TODO.md (don't run migrations).
```

## Phase 6 — Polish and QA

```text
Phase 6: quality pass.
1. Check every page at 1440, 1024 and 390 px wide. No sideways scrolling.
2. Keyboard: every control reachable, visible focus ring, icon buttons have aria-labels.
3. Contrast: all text 4.5:1 or better; no text smaller than 12 px.
4. Red appears only on one primary button per screen.
5. Loading, empty and error states present on every page.
6. Run the build and lint; fix errors. Report anything that still differs from the references.
```
