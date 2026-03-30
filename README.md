# CrushMatch Prank Site

Minimal pink prank website with:

- Multi-language prank landing page (`Eng`, `Vie`, `Cn`)
- Submission storage in `data/submissions.json`
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
- `DATA_DIR`: where prank submissions are stored

## Deploy

### Render

This project is a better fit for Render than Vercel because submissions are currently saved to a local JSON file.

Recommended setup:

1. Push this repo to GitHub.
2. In Render, create a new Blueprint or Web Service from this repo.
3. If you use the included [`render.yaml`](/Users/mee/Downloads/crushmatchai/render.yaml), Render will prefill the service config and persistent disk.
4. Set `ADMIN_PASSWORD` and `SESSION_SECRET` in the Render dashboard.
5. Deploy.

Without a persistent disk, Render's filesystem is ephemeral and your saved prank submissions will disappear after redeploys or restarts.

### Vercel

Vercel is not recommended for the current version of this app.

Why:

- Vercel Functions have a read-only filesystem
- only temporary `/tmp` storage is writable
- this app expects persistent file-based storage for `data/submissions.json`

If you want Vercel later, move submission storage from JSON file to a real database or hosted KV store first.
