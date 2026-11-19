# Sanford AI Image Studio — Fix List 2 (19 Nov 2026)

Do these in order, one task at a time, and stop after each so it can be tested.
Do not change the approved look of the generated images except where a task says so.

## Do by hand first (not for the agent)

- [ ] Supabase: rotate the service-role (secret) key. The old one is committed in git history and pushed to GitHub.
- [ ] Put the new key in `.env.local` and in Vercel env vars as `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] GitHub: revoke the personal access token stored in this repo's git remote URL, then reconnect with `gh auth login` and run
      `git remote set-url origin https://github.com/ajilmuhammedt-creator/b2b-image.git`.
- [ ] Supabase → Auth: turn on leaked password protection.

---

## Task 1: Remove hard-coded keys

```text
In api/_lib/supabase-server.ts remove DEFAULT_SERVICE_ROLE_KEY and the hard-coded URL fallback.
If SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing, throw a clear error at startup.
In src/lib/supabase.ts remove the hard-coded anon key and URL fallbacks; read only from VITE_ env vars.
Never put any key or token in source code.
```

**Done when:** `git grep eyJhbGciOi` returns nothing, and the app still works with `.env.local`.

---

## Task 2: Lock down storage

```text
1. Make the source-images and generated-images buckets PRIVATE.
2. Replace the storage policies so a signed-in user can only insert, update, delete and read objects whose
   first folder is their own user id: (storage.foldername(name))[1] = auth.uid()::text.
3. Replace every getPublicUrl() in src/lib/projectStorage.ts with createSignedUrl(path, 3600).
4. Put the new SQL in supabase/schema.sql and a new migration file.
```

**Done when:** an image URL stops working when opened in a private window, and History still shows thumbnails.

---

## Task 3: Harden /api/generate

```text
1. sourceImagePath and styleRefPath must start with `${userId}/`; otherwise return 403.
   Remove the code that fetches an arbitrary http(s) URL for the source image.
2. Whitelist settings on the server:
   model: gpt-image-2.5-sunburst | gpt-image-2.5-flare
   quality: low | medium | high   (reject xhigh and max unless the user is an admin)
   featureSize: 1024x1024 | 2048x2048, posterSize: 1024x1536 | 1536x1024
   Anything else returns 400.
3. Fix the type error at api/generate.ts line ~383: new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' }).
4. Style Lock: styleRefPath is accepted but never sent to OpenAI. Either send it as the second image
   when Style Lock is on, or remove the Style Lock setting from the UI.
```

**Done when:** a request with another user's image path returns 403, and `quality: "max"` from a staff account returns 400.

---

## Task 4: Auth gaps

```text
1. api/_lib/requireUser.ts: if the user has NO profiles row, return 403 (today they are let through).
2. api/notify-admin-staff-login.ts has no authentication. Require a valid Supabase token (requireUser
   without the approved check, since pending users call it), and only allow staffEmail equal to the
   token's email. Keep the cooldown.
3. Supabase: revoke EXECUTE on public.is_admin() and public.handle_new_user() from anon and authenticated
   (the trigger and RLS policies still work). Add this to schema.sql.
```

**Done when:** calling `/api/notify-admin-staff-login` without a token returns 401.

---

## Task 5: Stop wrong text on generated images

```text
1. Slot 3/4 banner (root cause of "Air Fryer" in the red banner):
   In api/parse-catalogue.ts, the slot-3 instructions say the bottom banner shows the product name/category,
   and line ~251 falls back to the product title. Change both: the banner must be ONE product feature taken
   from the verified specs (e.g. "4L Capacity"), never the product name or category. If no suitable feature
   exists, leave the banner empty instead of using the title. Same for slot 4: no generic fallback text such
   as "Key Features & Specifications".
   Then apply the "Feature Highlight" prompt from the earlier task (banner feature + max 2 callouts).
2. Warranty must come from the product data only:
   - api/_lib/prompts.ts (Slot 6) hard-codes "1 YEAR" in the ribbon. Use the supplied warranty text
     (e.g. "2 YEARS SERVICE WARRANTY").
   - api/parse-catalogue.ts line ~245 defaults to "1 Year Service Warranty" when none is found. Remove that default.
   - If no warranty is supplied, draw NO warranty ribbon at all.
```

**Done when:** an air fryer regenerated with "2 Years Service Warranty" shows "2 YEARS" on Slot 6, a product with no warranty shows no ribbon, and no red banner shows the product name.
