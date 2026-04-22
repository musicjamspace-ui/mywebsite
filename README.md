# Jamspace (client)

Next.js UI. The API lives in **`../server/`**.

**Clean tree in the editor:** open **`client/jamspace.code-workspace`** in VS Code / Cursor (File → Open Workspace from File…). The sidebar will show only **client** and **server** — not a stray root `node_modules`.

**Wrong `node_modules`:** `client/node_modules` and `server/node_modules` are **correct** (Next.js and Express need them). Only **`jamspace/node_modules`** next to `client` and `server` is wrong.

**Delete the root one:** stop **all** `npm run dev` terminals, then from **`client/`** run:

`npm run clean-root`

Or delete `jamspace/node_modules` and `jamspace/.next` in File Explorer.

**Do not** run `npm install` in `jamspace` — the root `package.json` will **error on purpose** so a new root `node_modules` is not created. Install only in **`client/`** or **`server/`**.

## Setup

From **`client/`** (not the parent folder):

```bash
npm install
```

Ensure MySQL has the **`jamspace`** database (`../server/database.sql`). **`server/.env`** is set up for typical local defaults (`root`, no password); add **`MYSQL_PASSWORD`** there if yours uses a password.

## Run locally (two terminals)

1. **API** — in one terminal:

   ```bash
   cd server
   npm install   # first time only
   npm run dev
   ```

   API: [http://localhost:3001](http://localhost:3001)

2. **UI** — in another terminal:

   ```bash
   cd client
   npm install   # first time only
   npm run dev
   ```

   App: [http://localhost:8080](http://localhost:8080)

From **`client/`** you can also start the API with **`npm run dev:server`** (same as `cd ../server && npm run dev`).

**One command (optional):** `npm run dev:with-api` in **`client/`** starts Next and the API together (used by Playwright e2e).

## Other scripts

- `npm run build` / `npm run start` — production UI (run **`server`** separately for a full stack).
- `npm run lint` — ESLint
- `npm run test` — Vitest

## Routes

- `/` — public availability
- `/book` — staff booking (login against API)

App routes: `src/app/`. Screen components: `src/views/`.
