# Sanford AI Studio — UI/UX Restyle Audit (Phase 0)

Date: November 10, 2026  
Status: Phase 0 Complete — Zero Code Changes  
Codebase: React 19 + TypeScript + Tailwind CSS v4 + Supabase + Vercel Serverless

---

## 1. Route & Page Mapping to Reference Screens

| Current Route | Current Page Component | Matching Reference Screen in `docs/design/` | Status & Migration Strategy |
|---|---|---|---|
| `/signin` | `src/pages/SignIn.tsx` | Page 6 of PDF / White & Red Sign-In | Match white & red card, Plus Jakarta Sans, eliminate redundant chrome |
| `/reset-password` | `src/pages/ResetPassword.tsx` | Sub-flow of Sign-In | Apply white & red form styles |
| `/studio` | `src/pages/Studio.tsx` | `screens/v2/Studio.reference.html` (`/studio/ecommerce/:id`) | Refactor into 3-column `StudioLayout`: Brief (left, 260px), Canvas (center), Inspector (right, 320px), StageBar & Deliver footer |
| `/history` | `src/pages/History.tsx` | Dedicated route (matches `03-SCREEN-MAP.md` note) | Retain 10-day retention and project restore; restyle with clean DataTable & filters inside `AppShell` |
| `/admin/users` & `/admin` | `src/pages/AdminUsers.tsx` | `screens/v2/Team.reference.html` (`/settings/team`) | Restyle into "Team and roles" with member permissions matrix, invite dialog, and access requests |
| `/` (currently redirects) | *None* | `screens/v2/Home.reference.html` | Build Home: Needs-you action cards, launchpad, in-progress carousel |
| *New* `/studio/social/:id` | *None* | `screens/v2/Social.reference.html` | Social Media Studio: 4 formats (IG post/story, WhatsApp, FB), live preview, calendar link |
| *New* `/studio/flyers/:id` | *None* | `screens/v2/Flyers.reference.html` | Retail Flyers Studio: 2×2, 3×2, 3×3 grid layouts, retailer presets, price import |
| *New* `/studio/packaging/:id` | *None* | `screens/v3/GiftBox.reference.html` | Gift Box Studio: interactive dieline, face inspector, concept vs production, pre-print gate |
| *New* `/products/:sku` | *None* | `screens/v3/ProductBrief.reference.html` | Product Brief: single source of truth (verified / proposed / missing facts) |
| *New* `/library/brand` | *None* | `screens/v3/BrandKit.reference.html` | Brand Kit Library: visual browser driven directly by `brand-kit/BRAND-KIT.json` |
| *New* `/work` | *None* | `screens/v2/Work.reference.html` & `Phone.reference.html` | My Work: unified inbox (tasks, approvals, mentions), keyboard shortcuts (J/K/A/R) |
| *New* `/calendar` | *None* | `screens/v2/Calendar.reference.html` | Campaign Calendar: monthly matrix + campaign sidebar |
| *New* `/settings/connections` | *None* | `screens/v2/Connections.reference.html` | Connections: selling channels, social accounts, agent autonomy, automation rules |

---

## 2. Current Styling & Design Inconsistencies Audit

1. **Colours doing multiple jobs:**
   - Red (`#E11D2E` / `#C8102E`) is currently used for generate buttons, Amazon tab badges, delete actions, errors, and toast alerts.
   - Violet/Indigo rings (`ring-indigo-500/50`) are currently applied to all selected cards, competing with product imagery.
   - Inconsistent status colors across Amazon Pass (`emerald`), Review (`amber`), and Fail (`rose`).
   - *Fix:* Adopt `tokens.css`: `--brand` (`#C8281E`) strictly reserved for the ONE primary action per screen. Selection becomes neutral 2px `--ink` (`#14161B`) ring.
2. **Four styles for "pick one" controls:**
   - Tabs, model selector pills, quality buttons, and platform selectors all use differing border radiuses and background treatments.
   - *Fix:* Universal `Segmented` component: white raised segment on grey track (`--track: #EEF0F3`).
3. **Typography fragmentation:**
   - Mix of system sans and arbitrary monospace (`font-mono`) in specs inputs and custom fields.
   - *Fix:* Single UI family: **Plus Jakarta Sans** across all text, inputs, and controls. 5-step scale: 28px page title, 20px panel, 16px section, 14px body, 12px captions.
4. **Export Toolbar Hierarchy:**
   - Equal visual weight between "Selected", "ZIP All", "Phone", and "Folder".
   - *Fix:* Clear hierarchy: One primary "Download ZIP" button + "More options" dropdown menu.
5. **Double Header (~100px of chrome):**
   - "Logged in as Administrator" top strip + primary Navbar consumes excessive vertical viewport.
   - *Fix:* Single 56px TopBar with breadcrumbs, command search (Cmd+K), Jobs tray, notifications bell, and avatar profile/logout menu.
6. **Unbalanced Studio Columns:**
   - Left column scrolls endlessly, settings panel ends halfway leaving dead space.
   - *Fix:* `StudioLayout`: Sticky Brief panel (left, 260px), flexible center Canvas, Inspector panel (right, 320px).

---

## 3. Existing Features Preserved (Zero Regressions)

The following core features are fully intact and will remain operational in the new UI:
- **Shopify BuySanford Mode:** 6-slot pattern, top-right red corner slogans, 100% WebP export, SEO folder naming (`Sanford-[Product]-[Model]/...`).
- **Amazon Seller Central Mode:** 6 Amazon listing templates (Slot 1 Pure White #FFFFFF hero, Slot 2 zero-text lifestyle, Slots 3 & 4 circular badge infographics + full-width benefits banner, Slot 5 multi-color, Slot 6 dimension arrows + official warranty seal), 2000×2000px JPEG export (`MODEL.MAIN.jpg`), Amazon A+ Content modules.
- **Noon UAE Mode:** 6 dedicated photographic angles (Front, Back, Side, 3/4, Detail, Lifestyle), strict zero-text/promotional overlay rule, 2000×2000px JPEG export (`[SKU]_NOON_01_MAIN.jpg`), Noon A+ Content with English and Arabic RTL support.
- **Compliance Engines:** Interactive Amazon & Noon compliance evaluation modals with 4-corner canvas brightness sampling and seller rule checks.
- **Catalogue Vision Extraction:** PDF & image drag-and-drop parsing with client-side PDF rendering and OpenAI vision auto-fill.
- **Style Lock:** Slot 1 master visual style reference locking.
- **Exporting Options:** Single downloads, full ZIP archives, phone sharing (`navigator.share`), folder picker (`showDirectoryPicker`).
- **Data Retention & Telemetry:** 10-day project retention, reopen from history, staff credits monitoring, admin approval workflow.

---

## 4. Reference-Screen Features Requiring Backend Planning

| New Feature | UI Implementation | Backend / Data Strategy |
|---|---|---|
| Home "Needs You" cards & In-Progress list | Real component | Reads existing `projects` table; empty states for pending reviews |
| Social Media Studio | Real interactive studio | Client-side generation UI; social publishing connectors marked as "Needs backend" |
| Retail Flyers Studio | Real interactive studio | Client-side grid layout; PDF generation engine marked as "Needs backend" |
| Gift Box Packaging Studio | Real interactive dieline & faces | Reads `brand-kit/BRAND-KIT.json` for category colors; CMYK vector PDF export marked as "Needs backend" |
| Brand Kit Library | Real visual browser | 100% powered by existing `brand-kit/BRAND-KIT.json` (no backend needed!) |
| My Work & Phone Approval | Real task/approval inbox | Reads existing staff access status; task assignment table proposed in `BACKEND-TODO.md` |
| Campaign Calendar | Real monthly calendar | Client-side calendar grid; calendar persistence proposed in `BACKEND-TODO.md` |
| Connections & Automations | Real toggle settings | Stored in project/user settings; live API webhooks marked as "Needs backend" |

---

## 5. Phased Implementation Plan

1. **Phase 1 — Design Tokens & Base Components:**
   - Integrate `tokens.css` into global stylesheet; load Plus Jakarta Sans.
   - Build accessible component library in `src/components/ui/` (Button, IconButton, Field, Select, Textarea, Segmented, Tabs, Badge, Card, Drawer, Dialog, Toast, Skeleton, EmptyState, Switch, Avatar, StageBar, ImageTile).
   - Create `/dev/components` showcase route.
2. **Phase 2 — Universal App Shell:**
   - Build 232px collapsible Sidebar and 56px TopBar with breadcrumbs, Cmd+K search, Jobs tray, and avatar menu.
   - Add mobile bottom navigation bar (390px responsive).
   - Restyle `SignIn.tsx` and `ResetPassword.tsx`.
3. **Phase 3 — Studio Template (E-Commerce First):**
   - Implement `StudioLayout` (Brief, Canvas, Inspector, StageBar, Deliver footer).
   - Seamlessly migrate existing Shopify, Amazon, and Noon generators into the new layout without breaking any API calls.
4. **Phase 4 — Multi-Studio Expansion:**
   - Build Social Media Studio, Retail Flyers Studio, Gift Box Studio (with dieline map), and Product Brief.
   - Wire packaging artwork colors to `brand-kit/BRAND-KIT.json`.
5. **Phase 5 — Work, Calendar & Settings:**
   - Implement My Work, Phone Approval, Campaign Calendar, Team & Roles (restyling `AdminUsers.tsx`), Connections, and Brand Kit Library.
   - Restyle History page into a clean DataTable.
6. **Phase 6 — Polish, QA & Accessibility:**
   - Multi-viewport verification (1440px, 1024px, 390px).
   - 4.5:1 text contrast audit, keyboard navigation, and production build verification.

