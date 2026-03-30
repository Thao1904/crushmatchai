# CrushMatch Prank Site

Minimal pink prank website with:

- Multi-language prank landing page (`Eng`, `Vie`, `Cn`)
- Submission storage via Supabase or local JSON fallback
- Protected admin page at `/admin`
- CSV export for all submissions

## Run

1. Copy `.env.example` to `.env`
2. Change `ADMIN_PASSWORD` and `SESSION_SECRET`
3. Run `npm start`
4. Open `http://127.0.0.1:3000`

## Production env

Use `.env.production.example` as the production template.

Required values:

- `ADMIN_PASSWORD`: admin page password
- `SESSION_SECRET`: long random secret for signed admin sessions
- `HOST`: use `0.0.0.0` in hosted environments
- `PORT`: hosting platform port
- `SUPABASE_URL`: your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for inserts and admin reads
- `SUPABASE_TABLE`: defaults to `submissions`

## Deploy

### Render

This project works well on Render free tier when Supabase is used for persistent storage.

Recommended setup:

1. Push this repo to GitHub.
2. In Render, create a new Blueprint or Web Service from this repo.
3. If you use the included [`render.yaml`](/Users/mee/Downloads/crushmatchai/render.yaml), Render will prefill the service config for the free tier.
4. Create a Supabase project.
5. Run the SQL in [`supabase-schema.sql`](/Users/mee/Downloads/crushmatchai/supabase-schema.sql).
6. Set `ADMIN_PASSWORD`, `SESSION_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` in the Render dashboard.
7. Deploy.

Notes:

- With Supabase configured, prank submissions persist across deploys and restarts.
- Without Supabase env vars, the app falls back to local `data/submissions.json`.
- Keep `SUPABASE_SERVICE_ROLE_KEY` on the server only. Never expose it in browser code.

### Vercel

Vercel is not recommended for the current version of this app.

Why:

- Vercel Functions have a read-only filesystem
- only temporary `/tmp` storage is writable
- this app expects persistent file-based storage for `data/submissions.json`

If you want Vercel later, move submission storage from JSON file to a real database or hosted KV store first.
