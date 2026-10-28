# Product Image Studio — Build Plan

Oct 28, 2026

## Overview

A single-page React app on Vercel: upload a white-background product photo, enter its name and verified features, and get 5 square feature images built from your attached prompt. Tick "Also make a poster" to get a portrait poster of the same product in the same run. An optional Settings panel sets model, quality, size and style, and every result downloads as a PNG (selected ones, or all at once as a ZIP).

Confirmed requirements:

- **5 generations.** Your prompt is written for 3 images. The plan splits the feature list into 5 groups and sends 5 separate requests, one per group, with "Image number" set 1 to 5.
- **Posters.** Tick "Also make a poster" before generating, and the run makes 1 portrait poster as well as the 5 feature images, from the same photo and features. The poster uses its own prompt (Prompts section).
- **Settings (was Controller).** Optional. The defaults work without touching it; it only matters if you later want faster, cheaper or sharper images. Choosing which files to download is done with a tick box on each image and a Download selected button.
- **Product info.** You give one product photo and its key features. The app splits the features into 5 groups, which you can edit before generating.
- **Save to device.** Browser download of each PNG, Download selected (ticked images only), and Download all (ZIP). Files are also kept in Supabase Storage so you can re-download later.

## Architecture and tech choices

React (Vite) runs on Vercel; every OpenAI call goes through a Vercel serverless function in `/api`, so the API key never reaches the browser. Supabase handles login, the database and file storage. Each image is its own function call, and the browser fires the 5 calls in parallel.

```text
                 5 calls                     photo + prompt
 +---------------------------+  ------>  +------------------------+  ------>  +--------------------+
 | Browser (React on Vercel) |           | /api/generate (Vercel) |           | OpenAI images.edit |
 | Studio, settings, download|           | one image per call     |           | Sunburst or Flare  |
 +---------------------------+           +------------------------+           +--------------------+
      |  sign in      ^ upload / download        | save PNG          | save row
      v               v                          v                   v
 +-------------------------------------------- Supabase -------------------------------------------+
 |   Auth (magic link, RLS)     Storage (photos in, PNGs out)     Postgres (projects, generations) |
 +-------------------------------------------------------------------------------------------------+
```

The browser uploads the photo to Storage, then calls the function 5 times (6 with a poster); each call sends the photo and prompt to OpenAI and saves the PNG and its row back to Supabase.

| Part | Choice | Why |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript, Tailwind | Fast to build in Antigravity; static deploy on Vercel |
| Image calls | Vercel Node function `/api/generate` | Hobby allows up to 300 s per call, Pro up to 800 s ([Vercel limits](https://vercel.com/docs/functions/limitations)); one image takes well under that |
| Model | `gpt-image-2.5-sunburst` default, `gpt-image-2.5-flare` as the fast option | OpenAI positions Sunburst for editing precision and Flare for speed ([OpenAI guide](https://developers.openai.com/api/docs/guides/image-generation)) |
| Endpoint | Image API `images.edit`, product photo as reference image | The edits endpoint can create a new image using reference images |
| Files | Supabase Storage: `source-images`, `generated-images` | Browser uploads the photo directly; functions save results there and return a path, not base64 |
| Data | Supabase Postgres: `projects`, `generations` | History, re-download, regenerate one slot |
| Login | Supabase Auth (email magic link) + RLS | Stops strangers spending your OpenAI credit |

Why not Supabase Edge Functions for the OpenAI call: they allow only 2 s of CPU time per request and return 504 if no response comes within 150 s ([Supabase limits](https://supabase.com/docs/guides/functions/limits)). Decoding and re-uploading large PNGs may hit the CPU cap. I'm not certain it would, but Vercel functions avoid the question.

Two things I believe but you should verify: Vercel's request-body limit for functions is about 4.5 MB (hence uploading the photo straight to Storage), and the Hobby plan is meant for non-commercial use, so a business tool may need Pro.

## Screens and UI

Three screens: Login, Studio (where all the work happens) and History. Studio is three columns on desktop and stacks on mobile.

**Studio layout**

1. **Left: Product input.** Drag-and-drop photo (PNG/JPG/WebP, preview shown), Product name, Feature list (one per line), Colours available (optional). Button: Split into 5 groups, which fills 5 editable group boxes.
2. **Centre: Results.** 5 square cards labelled Image 1 to 5. Each card shows a spinner, then the image, with Download, Regenerate and Copy prompt. A 6th Poster card appears when Also make a poster is ticked. Every card has a tick box for downloading. Top bar: Generate, Also make a poster (tick box), Download selected, Download all (ZIP).
3. **Right: Settings (optional).** The settings below. Changes apply to the next generation, not to finished images.

**Settings (optional; the defaults work)**

| Setting | Options | Default |
| --- | --- | --- |
| Model | Sunburst (precise) / Flare (fast) | Sunburst |
| Quality | low, medium, high, xhigh, max | medium for drafts, high for final |
| Feature image size | 1024x1024, 2048x2048 | 1024x1024 |
| Poster size | 1024x1536 portrait, 1536x1024 landscape | 1024x1536 |
| Accent colour | Auto (model picks) or a colour picker | Auto |
| Style lock | Use approved Image 1 as style reference for 2 to 5 | Off |
| Images per run | 1 to 5 | 5 |
| Background | white, pale tint | white |

Style lock follows step 7 of your prompt notes. When it is on, images 2 to 5 wait for Image 1, so the run is sequential and slower.

OpenAI lists quality values low, medium, high, xhigh, max and auto for Sunburst ([model page](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst)), and the 2.5 models accept custom WIDTHxHEIGHT sizes ([API reference](https://developers.openai.com/api/reference/resources/images.md)). Confirm 2048x2048 works on your account before shipping that option.

**History**: a grid of past projects (thumbnail, name, date). Opening one reloads its images into Studio for re-download or regenerate.

## Data model (Supabase)

Two tables and two private storage buckets, all locked to the signed-in user by RLS. Run this in the Supabase SQL editor.

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  features text[] not null,
  colors text[],
  feature_groups jsonb not null default '[]',  -- [["5500 RPM motor","3 speeds"], ...] x5
  source_image_path text not null,             -- source-images/{user_id}/{project_id}/original.png
  created_at timestamptz default now()
);

create table generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('feature','poster')),
  slot int,                                    -- 1-5 for feature, null for poster
  model text not null,
  quality text not null,
  size text not null,
  settings jsonb not null default '{}',        -- accent colour, style lock, background
  prompt text not null,                        -- the exact prompt sent
  status text not null default 'pending' check (status in ('pending','done','failed')),
  image_path text,                             -- generated-images/{user_id}/{project_id}/{id}.png
  error text,
  usage jsonb,                                 -- token usage returned by OpenAI
  created_at timestamptz default now()
);

alter table projects enable row level security;
alter table generations enable row level security;
create policy "own projects" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own generations" on generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Storage: create buckets `source-images` and `generated-images` as **private**. Add storage policies so a user can read and write only under a folder named with their own user id. The browser shows images through short-lived signed URLs.

Keeping `prompt` and `usage` on every row lets you see exactly what produced each image and what it cost.

## API endpoints

Two Vercel functions do all the server work; both check the Supabase login token before doing anything.

| Endpoint | Input | Does | Returns |
| --- | --- | --- | --- |
| `POST /api/split-features` | product name, feature list | Asks an OpenAI text model to split features into 5 balanced groups (JSON) | `groups: string[][]` |
| `POST /api/generate` | `projectId`, `kind`, `slot`, `settings` | Builds the prompt, calls the image edit endpoint, saves the PNG, updates the row | `{ id, imagePath }` |

For `split-features`, pick a current small text model from OpenAI's models page; a simple round-robin split in the browser is the fallback if the call fails.

**`/api/generate` steps**

1. Read `Authorization: Bearer <supabase access token>`, verify it, get `user_id`.
2. Load the project row; check it belongs to the user.
3. Insert a `generations` row with status `pending`.
4. Download the source photo from Storage (service-role client). If style lock is on and slot > 1, also download approved Image 1.
5. Build the prompt from the template (Prompts section) with the group for this slot.
6. Call OpenAI, one image per call:

```ts
const result = await openai.images.edit({
  model: settings.model,            // 'gpt-image-2.5-sunburst' | 'gpt-image-2.5-flare'
  image: refs,                      // [productPhoto] or [productPhoto, styleRef]
  prompt,
  size: kind === 'poster' ? settings.posterSize : settings.featureSize,
  quality: settings.quality,
  output_format: 'png',
  n: 1,
  safety_identifier: sha256(userId), // OpenAI recommends a hashed per-user id
});
const png = Buffer.from(result.data[0].b64_json, 'base64');
```

7. Upload `png` to `generated-images/{user_id}/{project_id}/{generation_id}.png`; set status `done`, save `image_path` and `usage`.
8. On error: one retry after 3 s for 429 or 5xx, then status `failed` with the message, shown on the card.

**Config**

- `vercel.json`: `{"functions": {"api/*.ts": {"maxDuration": 300}}}`
- Server env (Vercel only): `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Browser env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Never prefix the OpenAI or service-role key with `VITE_`, or it ships to the browser.
- Spend guard: refuse a request if the user already has more than 50 generations in the last 24 hours (adjust to taste).

Parameter names above follow OpenAI's current guide; check the [API reference](https://developers.openai.com/api/reference/resources/images.md) against your SDK version, since parameters have changed between model generations.

## Prompts

Your attached prompt becomes the feature-image template with one change: Image number runs 1 to 5. The poster uses a new template below that reuses your Product Accuracy rules word for word.

**Feature template** (`src/prompts/feature.txt`)

- Copy everything between `--- PROMPT START ---` and `--- PROMPT END ---` from `prompts/ecommerce-image-prompt.txt`, unchanged.
- Replace `[1, 2, or 3]` with `[1 to 5]`.
- The server fills `[PRODUCT NAME]`, `[FULL FEATURE LIST]`, `[SELECTED FEATURE GROUP]` and the image number.
- If Settings sets an accent colour, append one line under VISUAL STYLE: `Use [HEX] as the accent colour.`
- If style lock is on, the existing line about a style reference already covers the second image.

**Example: the portable fan split into 5 groups**

| Image | Feature group |
| --- | --- |
| 1 | 5500 RPM brushless motor, three speeds |
| 2 | Up to 4.5 hours on low speed, removable 1800mAh battery |
| 3 | Type-C charging, 5-hour charge time, red and green charging indicators |
| 4 | Built-in phone holder, compact portable design |
| 5 | Sky Blue / Yellow / Light Pink / Green colour options |

**Poster template** (`src/prompts/poster.txt`, new)

```text
Create ONE premium portrait e-commerce poster using the attached product photograph and the supplied product information.

PRODUCT INFORMATION
Product name: [PRODUCT NAME]
All verified key features: [FULL FEATURE LIST]
Colour options: [COLOURS, or "none supplied"]
Language: English

PRODUCT ACCURACY
[Insert your PRODUCT ACCURACY block here, unchanged.]

POSTER STYLE
Make the product the hero: large, sharp, realistic, with soft studio lighting and a subtle shadow or reflection.
Use a clean white background or a soft gradient of one restrained accent colour that complements the actual product. [ACCENT LINE]
Place one bold headline of no more than six words near the top and a one-line subheading under it.
Add three or four short feature callouts with small, simple icons, taken only from the supplied features.
Show colour options as labelled swatches only when colours are supplied.
Use dark, high-contrast, modern bold sans-serif type. Keep generous margins; all text must be readable on a phone.

COPY
Use only the supplied information. Preserve every number, unit and specification exactly.
Do not add prices, discounts, logos, certifications or claims that were not supplied.

OUTPUT
Generate exactly ONE complete portrait poster. Not a collage.
No outer frame, watermark, instructions, placeholders or production notes.
```

If you later want offer text or a price on posters, add an optional Offer field to the form and a matching `[OFFER]` line; leave it out when empty.

## Download and save to device

Every image downloads as a PNG named after the product; Download all bundles the 5 images and the poster into one ZIP.

| Action | How it works | File name |
| --- | --- | --- |
| Download (one card) | Fetch the signed URL as a blob, then click a hidden `<a download>`. A plain link to a Supabase URL won't force a download, because browsers ignore `download` on cross-origin links. | `{product-slug}-feature-{n}.png` |
| Download poster | Same as above | `{product-slug}-poster.png` |
| Download all | Fetch each blob, zip with JSZip, download the ZIP. Download selected does the same for ticked cards only | `{product-slug}-images.zip` |
| Save to phone (mobile) | `navigator.share({ files })` opens the share sheet, where Save Image puts it in Photos | same as above |
| Save to folder (desktop Chrome/Edge) | Optional: `showDirectoryPicker()` writes all files into a folder you choose | same as above |

Show the Save to phone button only when `navigator.canShare?.({ files })` returns true, and the folder option only when `showDirectoryPicker` exists. I'm fairly confident about which browsers support these, but test on your own phone, since share-sheet support has varied across iOS and Android versions.

## Build phases for Antigravity

Save this file in the repo root as `PLAN.md`, add your prompt file as `prompts/ecommerce-image-prompt.txt`, then give the agent one phase at a time. Test each phase before starting the next.

**Phase 0: setup you do by hand**

- [ ] Create a Supabase project; run the SQL from the Data model section; create the two private buckets and their storage policies
- [ ] Turn on email magic-link login in Supabase Auth; add your Vercel URL to the redirect URLs
- [ ] Create an OpenAI API key; complete API Organization Verification if the image models ask for it; set a monthly spend limit
- [ ] Create a GitHub repo and a Vercel project linked to it; add the env vars from the API endpoints section

**Phase 1: scaffold and login**

```text
Read PLAN.md. Scaffold a Vite + React + TypeScript app with Tailwind and @supabase/supabase-js.
Add email magic-link login with Supabase Auth, a protected /studio route and a /history route.
Three-column Studio layout (Input, Results, Settings) that stacks on mobile. No image features yet.
```

Done when: you can log in on the deployed Vercel URL and see the empty Studio.

**Phase 2: upload and product form**

```text
Following PLAN.md (Screens and UI, Data model), build the Input column: drag-and-drop photo upload with preview,
product name, feature list (one per line), optional colours. On save, upload the photo directly to the
source-images bucket under {user_id}/{project_id}/ and insert a projects row. Add a Split into 5 groups
button that calls /api/split-features and shows 5 editable group boxes saved to projects.feature_groups.
```

Done when: a project row appears in Supabase with the photo path and 5 groups.

**Phase 3: the generate function**

```text
Following PLAN.md (API endpoints, Prompts), create api/generate.ts and api/split-features.ts as Vercel
Node functions. Verify the Supabase access token, build the prompt from src/prompts/feature.txt or poster.txt,
call openai.images.edit with the product photo as reference, upload the PNG to generated-images, and update
the generations row. Add vercel.json with maxDuration 300. Keep OPENAI_API_KEY and the service-role key server-side only.
```

Done when: one call from the browser console returns an image path and the PNG opens in Supabase Storage.

**Phase 4: results grid and settings**

```text
Build the Results column (5 cards, each with a download tick box) and the Settings panel exactly as in PLAN.md.
Generate fires 5 parallel /api/generate calls; each card shows its own spinner, image, error, Regenerate and Copy prompt.
If Style lock is on, generate slot 1 first, then 2 to 5 with image 1 as a second reference.
```

Done when: 5 images arrive for a real product and Regenerate replaces only that card.

**Phase 5: poster**

```text
Add an "Also make a poster" tick box next to Generate. When ticked, the same run also calls /api/generate with
kind 'poster' and src/prompts/poster.txt, shown as a 6th Poster card, size from the Settings panel's Poster size.
```

Done when: ticking the box gives 5 feature images plus 1 poster; unticked gives only the 5.

**Phase 6: downloads**

```text
Implement every row of the Download and save to device table in PLAN.md, including Download selected,
JSZip for Download all, and feature-detected share-sheet and folder-save buttons.
```

**Phase 7: history and polish**

```text
Build /history (grid of past projects with thumbnail, name, date) that reopens a project in Studio.
Add the 24-hour spend guard, empty states, toast errors, and file-type and size checks on upload (max 10 MB).
```

Done when: you can run a full product from upload to ZIP on both laptop and phone.

## Costs, limits and risks

A full run (5 images + 1 poster) should cost roughly US$0.05 to 0.25 at medium to high quality, but treat that as an estimate until you see real `usage` numbers in your own rows.

- **Pricing basis.** OpenAI lists Sunburst at $5 per 1M text input tokens, $8 per 1M image input tokens and $30 per 1M image output tokens ([model page](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst)). One third-party benchmark measured a 1024x1024 Sunburst image at about $0.008 (low) and $0.017 (medium), and average times of about 22 s for Sunburst and 14 s for Flare ([Segmind](https://blog.segmind.com/gpt-image-2-5-api-the-ultimate-guide-to-flare-and-sunburst/)). Those are not official figures.
- **Product accuracy drift.** The model can still alter buttons, logos or proportions. Keep a human check before publishing, as your prompt notes say; Regenerate per card makes fixing one image cheap.
- **Spelling in the artwork.** Small text can come out misspelled. Keep callouts short; check every image before it goes to a store listing.
- **Model names change.** These models were released in September 2026 and may be renamed or superseded. Pin the dated snapshot (for example `gpt-image-2.5-sunburst-2026-09-08`) in production so results stay consistent, and keep the model name in one config constant.
- **Rate limits.** 5 parallel calls per run is usually fine, but your OpenAI tier sets the real limit; the retry in step 8 handles brief 429s.
- **Runaway spend.** The 24-hour cap per user plus an OpenAI monthly limit protects you if a key leaks or a bug loops.

**To verify before building**

- [ ] Exact parameter names in your installed `openai` SDK version (`quality`, `size`, `output_format`, `safety_identifier`)
- [ ] Whether 2048x2048 works for feature images on your account
- [ ] Vercel Hobby vs Pro for commercial use, and the function request-body limit
- [ ] Share-sheet saving on your own iPhone or Android

**Sources** (opened 28 Oct 2026)

- [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation)
- [OpenAI Images API reference](https://developers.openai.com/api/reference/resources/images.md)
- [OpenAI gpt-image-2.5-sunburst model page](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst)
- [Vercel Functions limits](https://vercel.com/docs/functions/limitations)
- [Supabase Edge Functions limits](https://supabase.com/docs/guides/functions/limits)
- [Segmind GPT Image 2.5 benchmark (third party)](https://blog.segmind.com/gpt-image-2-5-api-the-ultimate-guide-to-flare-and-sunburst/)
