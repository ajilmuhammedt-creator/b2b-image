# Octopus B2B Product Image Studio

A modern React application for B2B e-commerce suppliers and buyers: upload a single white-background product photograph, enter its verified features and specifications, and generate **5 grounded 1:1 square feature images** plus an optional **portrait e-commerce poster** in a single run.

Powered by OpenAI's `gpt-image-2.5-sunburst` & `gpt-image-2.5-flare` reference image editing endpoint, Supabase Auth & Storage, and Vercel Serverless Functions.

---

## Key Features

1. **5 Grounded Feature Generations**: Splits product features into 5 balanced groups (using `gpt-4o-mini`) and renders 5 high-fidelity square e-commerce images strictly grounded in the original photograph.
2. **Portrait Poster Canvas**: Optional "Also make a poster" mode generates a 1024×1536 (or 1536×1024) portrait hero poster with typography, callouts, and swatches.
3. **Studio Settings Panel**:
   - Model selection: `Sunburst (precise)` vs `Flare (fast)`.
   - Quality level: `low`, `medium` (default), `high`, `xhigh`, `max`.
   - Feature image dimensions: `1024x1024` or `2048x2048`.
   - Poster dimensions: `1024x1536` (portrait) or `1536x1024` (landscape).
   - Accent colour: Auto (model selected) or custom HEX color picker.
   - Style Lock: Sequentially uses approved Image 1 as master layout/typography reference for images 2 to 5.
   - Background: Clean white or pale tinted background.
4. **Flexible Downloads & Saving**:
   - Individual PNG download for any card (`{product-slug}-feature-{n}.png` / `{product-slug}-poster.png`).
   - Download Selected: bundles ticked cards into a ZIP archive.
   - Download All (ZIP): bundles the entire image set + poster into `{product-slug}-images.zip` using JSZip.
   - Save to Phone: native Web Share API integration (`navigator.share`) for mobile photo libraries.
   - Save to Folder: Chromium File System Access API (`showDirectoryPicker`) for direct desktop downloads.
5. **Project History & Library (`/history`)**:
   - Browse past projects with preview thumbnails, image counts, and timestamps.
   - One-click reopening in the Studio to re-download or regenerate individual slots.
6. **24-Hour Spend Guard**:
   - Client-side rate protection against runaway spend (capped at 50 generations/24h).

---

## Architecture

```text
                 5-6 parallel calls             photo + prompt
 +---------------------------+  --------->  +------------------------+  --------->  +--------------------+
 | Browser (React on Vercel) |              | /api/generate (Vercel) |              | OpenAI images.edit |
 | Studio, settings, download|              | one image per call     |              | Sunburst or Flare  |
 +---------------------------+              +------------------------+              +--------------------+
      |  sign in      ^ upload / download        | save PNG          | save row
      v               v                          v                   v
 +-------------------------------------------- Supabase -------------------------------------------+
 |   Auth (magic link, RLS)     Storage (photos in, PNGs out)     Postgres (projects, generations) |
 +-------------------------------------------------------------------------------------------------+
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, JSZip.
- **Backend**: Vercel Serverless Functions in `/api/`:
  - `POST /api/split-features`: Intelligent balanced grouping of features.
  - `POST /api/generate`: Server-side OpenAI Images Edit calls + Supabase Storage upload.
- **Local Dev Server**: Vite plugin proxies `/api/*` endpoints directly, allowing 100% offline-ready local development without extra tooling.

---

## Supabase Database Setup

Run the following SQL script in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) to initialize the database tables and Row Level Security (RLS) policies:

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  features text[] not null,
  colors text[],
  feature_groups jsonb not null default '[]',
  source_image_path text not null,
  created_at timestamptz default now()
);

create table generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('feature','poster')),
  slot int,
  model text not null,
  quality text not null,
  size text not null,
  settings jsonb not null default '{}',
  prompt text not null,
  status text not null default 'pending' check (status in ('pending','done','failed')),
  image_path text,
  error text,
  usage jsonb,
  created_at timestamptz default now()
);

alter table projects enable row level security;
alter table generations enable row level security;

create policy "own projects" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own generations" on generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Storage Buckets
The application automatically creates or uses two buckets:
- `source-images`
- `generated-images`

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your configuration:

```env
# Client environment variables (Safe to expose)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_anon_key_here

# Server-only environment variables (Never expose to client)
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

3. **Build for production**:
   ```bash
   npm run build
   ```

---

## Deployment on Vercel

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. In Project Settings > Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
4. Deploy! `vercel.json` automatically sets serverless function duration up to 300 seconds and manages single-page application routing.

