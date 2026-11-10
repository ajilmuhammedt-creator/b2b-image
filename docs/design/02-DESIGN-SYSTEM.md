# Design system — Sanford AI Studio app UI

White and red. One font. Sanford red marks only the single main action on each screen; everything else is ink and grey.

> Two separate colour systems:
> - **App UI** (this file, `design-tokens/`): white + red.
> - **Packaging artwork** (`brand-kit/BRAND-KIT.json`): category colours from the Sanford Brand & Packaging Kit. Never mix them.

## Colours

| Token | Hex | Use |
|---|---|---|
| `--brand` | #C8281E | One primary button per screen; today's date. White text on it = 5.6:1 |
| `--brand-hover` | #A8201A | Primary hover, text links |
| `--brand-tint` | #FDECEA | Focus halo, today background |
| `--ink` | #14161B | Text, active nav pill, selection ring |
| `--ink-2` | #2B2F38 | Labels |
| `--muted` | #4A505E | Secondary text |
| `--subtle` | #5F6675 | Captions (12 px min) |
| `--page` | #F5F6F8 | Page background |
| `--surface` | #FFFFFF | Cards, panels |
| `--track` | #EEF0F3 | Segmented track, chips |
| `--border` | #E4E6EB | Card borders |
| `--border-strong` | #D5D9E0 | Inputs, secondary buttons |
| `--ok-fg` / `--ok-bg` | #126C34 / #E7F6EC | Pass, Approved, Scheduled |
| `--warn-fg` / `--warn-bg` | #7A4F00 / #FFF4D6 | Warning, In review, Blocked |
| `--fail-fg` / `--fail-bg` | #FFFFFF / #14161B | Fail (black with a cross — never red) |

## Type

Font: **Plus Jakarta Sans** (400, 500, 600, 700, 800).
Scale: 28 page title · 20 panel title · 16 section · 14 body and controls · 12 captions (minimum).

## Spacing and shape

- Spacing: 4, 8, 12, 16, 24, 32
- Radius: 10 field · 12 button · 16 card · 20 sheet
- Touch targets ≥ 44 px; primary buttons 46–48 px tall
- Contrast ≥ 4.5:1 for all text

## Components

| Component | Rules |
|---|---|
| Button | primary (red, one per screen), secondary (outlined), ghost, destructive (outlined + bin icon + confirm dialog) |
| IconButton | 44×44, needs `aria-label` + tooltip |
| Field / Select / Textarea / DateInput | Label above, helper or error below, same font everywhere (no monospace) |
| Segmented | Every "pick one" control. Selected = white raised segment on grey track |
| Tabs | Page sections only. Active = ink text + 2 px ink underline |
| Badge | Lifecycle: Draft, In review, Approved, Delivered. Checks: Pass, Warning, Fail. Channel: Connected, Not connected |
| ImageTile | Image, slot name on its own line, status badge on image corner, checkbox, states: generating, failed, approved |
| StageBar | Brief → Generate → Review → Deliver (Packaging: Brief → Concept → Compose → Pre-print → Hand-off). Done = ink circle + tick, current = ink ring |
| Sidebar, TopBar, JobsTray, CommandMenu, NotificationsPanel | App shell |
| Card, Drawer, Dialog, Toast, Skeleton, EmptyState, Switch, Avatar, DataTable, CalendarMonth | Standard |

## Layout rules

- **Shell:** sidebar 232 px (collapsible) + top bar 56 px. Phone: bottom bar.
- **Studio layout (all studios):** Brief (left, ~260 px) · Canvas (middle, flexible) · Inspector (right, ~320 px) · bottom bar with progress + Deliver.
- **Selection:** 2 px ink ring. **Active nav:** dark pill, white text. Red never marks selection, toggles or nav.
- **Status words:** one lifecycle everywhere — Draft → In review → Approved → Delivered.
- **Every screen:** loading (skeleton), empty (what to do next), error (what happened + retry).
