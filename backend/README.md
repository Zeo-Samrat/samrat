# Old Stone — Backend

A tiny Node.js/Express server with one job: when someone submits the
"Book Free Counselling" form on the website, it emails you (and only you —
nothing is saved to a database) the name, phone, destination and message.

## 1. Install

```bash
cd backend
npm install
```

## 2. Configure email

```bash
cp .env.example .env
```

Open `.env` and fill in your SMTP details. For Gmail:

1. Turn on 2-Step Verification on the Google account (oldstoneform@gmail.com).
2. Go to Google Account → Security → App passwords.
3. Create an app password for "Mail" and paste the 16-character code into
   `SMTP_PASS` in `.env`. (Your normal Gmail password will NOT work here.)

`NOTIFY_TO` is the inbox that receives every enquiry — leave it as
`oldstoneform@gmail.com`, or point it anywhere else.

## 3. Run it

```bash
npm start
```

You should see:

```
✓ SMTP connection ready
Old Stone backend listening on http://localhost:4000
```

## 4. Connect the website

In `script.js` (in the site's root folder, next to `index.html`), set:

```js
const API_BASE_URL = "http://localhost:4000";
```

While you're testing locally, open `index.html` in a browser and submit the
form — an email should land in the inbox within a few seconds.

## 5. Deploying (once you pick a host)

This is a plain Node process, so it runs anywhere Node runs:

- **Render / Railway / Fly.io** — easiest option, free tier available.
  Push this `backend/` folder as its own repo (or subfolder), set the same
  environment variables from `.env` in their dashboard, deploy, then copy
  the URL they give you into `API_BASE_URL` in `script.js`.
- **VPS (DigitalOcean, Hetzner, etc.)** — install Node, copy this folder up,
  `npm install --production`, then run it with a process manager so it
  survives reboots/crashes:
  ```bash
  npm install -g pm2
  pm2 start server.js --name old-stone-backend
  pm2 save
  ```
  Put it behind Nginx as a reverse proxy with HTTPS (Let's Encrypt/Certbot).
- **Shared hosting (cPanel)** — only works if the host supports "Node.js App"
  in cPanel (many do, under Setup Node.js App). Upload the folder, set the
  entry point to `server.js`, add the same environment variables there.

Whichever you choose, once deployed:
1. Update `CORS_ORIGIN` in the backend's environment variables to your real
   site domain (e.g. `https://oldstoneeducation.com`) instead of `*`.
2. Update `API_BASE_URL` in `script.js` to the backend's live URL.
3. Serve everything over HTTPS — plain HTTP will get blocked by browsers
   calling a cross-origin API in most modern setups.

## API

**POST `/api/consult`**

```json
{
  "name": "Sita Shrestha",
  "phone": "9841510662",
  "destination": "Australia",
  "message": "Interested in a master's in IT."
}
```

Response on success: `{ "ok": true }`
Response on error: `{ "ok": false, "error": "..." }` with a 4xx/5xx status.

**GET `/api/health`** — quick check that the server is up.
