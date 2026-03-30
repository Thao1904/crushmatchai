# CrushMatch Prank Site

Minimal pink prank website with:

- Multi-language prank landing page (`Eng`, `Vie`, `Cn`)
- Submission storage in `data/submissions.json`
- Optional Google Sheets sync on each submission
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
- `GOOGLE_SHEETS_WEBHOOK_URL`: optional Apps Script webhook URL for backup logging

## Deploy

### Render

This project is a better fit for Render than Vercel because submissions are currently saved to a local JSON file.

Recommended setup:

1. Push this repo to GitHub.
2. In Render, create a new Blueprint or Web Service from this repo.
3. If you use the included [`render.yaml`](/Users/mee/Downloads/crushmatchai/render.yaml), Render will prefill the service config for the free tier.
4. Set `ADMIN_PASSWORD` and `SESSION_SECRET` in the Render dashboard.
5. Deploy.

Important:

- Render free tier does not support persistent disks
- prank submissions saved to `data/submissions.json` can disappear after redeploys, restarts, or instance replacement
- if you want durable prank data, upgrade to a Render plan with disks or move storage to a database
- if you set `GOOGLE_SHEETS_WEBHOOK_URL`, each submission is also posted to Google Sheets as a lightweight backup

## Google Sheets backup

If you want every submission copied into Google Sheets:

1. Create a Google Sheet and add a tab named `Submissions`
2. Open `Extensions` -> `Apps Script`
3. Paste the code from [`google-apps-script.gs`](/Users/mee/Downloads/crushmatchai/google-apps-script.gs)
4. Deploy it as a Web App
5. Set access so your server can call it
6. Copy the Web App URL into `GOOGLE_SHEETS_WEBHOOK_URL`

The backend sends each saved submission to that webhook after writing local JSON. If Google Sheets fails, the prank flow still succeeds and the server only logs the error.

### Vercel

Vercel is not recommended for the current version of this app.

Why:

- Vercel Functions have a read-only filesystem
- only temporary `/tmp` storage is writable
- this app expects persistent file-based storage for `data/submissions.json`

If you want Vercel later, move submission storage from JSON file to a real database or hosted KV store first.
