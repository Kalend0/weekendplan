# LLM Dev Prompt — Weekend Planner App

Build a full-stack weekend planning web app from scratch. Follow every requirement below exactly. Do not add features, abstractions, or complexity beyond what is specified.

---

## Tech Stack

- **Frontend:** React (no Next.js — plain React with Vite), deployed to Vercel
- **Backend:** Python serverless functions (Vercel `/api` directory, using FastAPI or plain ASGI handlers)
- **Database:** Neon (PostgreSQL), accessed via `psycopg2` or `asyncpg`
- **Styling:** Plain CSS or CSS modules — no Tailwind, no component libraries. Clean, minimal, card-based UI. Calm tones (whites, light grays, soft neutrals). No purple, no neon, no gradients.
- **Target:** Mobile-first, optimized for iOS Safari. Touch-friendly. Large tap targets.

---

## Project Structure

```
/
├── api/                  # Python serverless functions (Vercel)
│   ├── tiles.py
│   ├── allocations.py
│   └── settings.py
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── vercel.json
├── vite.config.js
└── requirements.txt
```

---

## Database Schema

Create these three tables in Neon (PostgreSQL). Include a migration SQL file at `db/schema.sql`.

```sql
CREATE TABLE tiles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  text_configurable BOOLEAN NOT NULL DEFAULT FALSE,
  multi_slot BOOLEAN NOT NULL DEFAULT FALSE,
  required BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE allocations (
  id SERIAL PRIMARY KEY,
  tile_id INTEGER NOT NULL REFERENCES tiles(id) ON DELETE CASCADE,
  person TEXT NOT NULL CHECK (person IN ('person_1', 'person_2')),
  day TEXT NOT NULL CHECK (day IN ('saturday', 'sunday')),
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'noon', 'afternoon', 'evening')),
  custom_text TEXT,
  week_start DATE NOT NULL
);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  pin CHAR(4) NOT NULL,
  name_person_1 TEXT NOT NULL,
  name_person_2 TEXT NOT NULL,
  CHECK (id = 1)  -- single-row table
);
```

---

## API Endpoints

All endpoints are Python serverless functions under `/api`.

### Tiles
- `GET /api/tiles` — return all tiles
- `POST /api/tiles` — create a tile `{ name, text_configurable, multi_slot, required }`
- `PUT /api/tiles/:id` — update a tile's properties
- `DELETE /api/tiles/:id` — delete a tile (cascades to allocations)

### Allocations
- `GET /api/allocations?week_start=YYYY-MM-DD` — return all allocations for the given week
- `POST /api/allocations` — create an allocation `{ tile_id, person, day, slot, custom_text, week_start }`
- `DELETE /api/allocations/:id` — remove an allocation
- `DELETE /api/allocations?week_start=YYYY-MM-DD` — clear all allocations for a week (used for reset)

### Settings
- `GET /api/settings` — return current settings (pin, name_person_1, name_person_2)
- `PUT /api/settings` — update any settings fields

---

## Frontend — Screens

### 1. PIN Screen (`/`)

- Full-screen centered layout
- App title at top
- Four large PIN digit input circles (no text field — tap individual digit buttons 0–9 below)
- On correct PIN: navigate to main screen, store session in `sessionStorage`
- On wrong PIN: shake animation, clear digits
- PIN is loaded from `GET /api/settings`
- If settings have no PIN yet (first run), redirect to config screen to set one

### 2. Main Screen (`/plan`)

Protected — redirect to PIN screen if not authenticated.

**Structure (top to bottom):**

1. **App bar** — app name left, config button (gear icon) right
2. **Required tile warning banner** — shown only when any `required` tile has no allocation for the current `week_start`. Red background, lists the tile names, full width.
3. **Segmented control** — two segments: `SAT` and `SUN`. Switches the active day. Default: whichever day is closer (Saturday if before or on Saturday, Sunday otherwise).
4. **Tile tray** — horizontally scrollable single row of tile chips. Each chip shows the tile name. A `+` button is always visible at the far right end of the row (does not scroll away).
5. **Day grid** — a 2-column grid with a label column on the left:
   - Left label column: MORNING / NOON / AFTERNOON / EVENING (rotated or stacked text)
   - Parent 1 column (header = `name_person_1` from settings)
   - Parent 2 column (header = `name_person_2` from settings)
   - Each of the 8 cells (4 slots × 2 parents) is a drop zone

**Drag and drop behaviour:**
- Tiles in the tray are draggable (use the HTML5 drag-and-drop API or a lightweight touch-compatible library such as `@dnd-kit/core`)
- Dropping a tile onto a cell creates an allocation via `POST /api/allocations`
- The tile remains in the tray after being dropped (it is copied, not removed), **except** when `multi_slot = false`: in that case, after dropping, the tile is visually greyed out in the tray and cannot be dragged again until the weekend resets
- If a tile has `text_configurable = true`, dropping it opens a small inline prompt asking the user to enter a custom label before the allocation is saved
- Allocations already placed in a cell are shown as chips inside the cell, with a small `×` to remove them (calls `DELETE /api/allocations/:id`)
- A cell can hold multiple allocations

**Week start calculation:**
- `week_start` is always the date of the most recent Monday (ISO week)
- Compute this on the frontend and pass it with every allocation request

### 3. Configuration Screen (`/config`)

Accessible via the gear icon on the main screen. No PIN re-entry required.

Sections:
1. **Parent names** — two text inputs labeled "Person 1 name" and "Person 2 name". Save button calls `PUT /api/settings`.
2. **PIN** — one text input (max 4 digits, numeric). Save button calls `PUT /api/settings`.
3. **Tiles** — list of all tiles. Each row shows the tile name and its three boolean properties as toggle switches (text configurable / multi-slot / required). A delete button removes the tile. An edit button opens an inline form to rename.

---

## Weekend Reset

- On app load (main screen mount), compute the current `week_start` (most recent Monday)
- Allocations are always scoped to `week_start` — old allocations are simply not fetched, not deleted
- No scheduled job needed: stale allocations are ignored by scoping all queries to the current `week_start`
- This means the plan resets automatically each week without any cron or server-side automation

---

## UI Details

- **Font:** System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- **Colors:** White background, `#f5f5f5` for card surfaces, `#333` for primary text, `#888` for secondary text. One accent color (a calm mid-blue such as `#4a90d9`) for the segmented control active state and buttons.
- **Tile chips:** Rounded pill shape, light gray background, dark text, small shadow
- **Drop zones:** Light border, slightly darker background on drag-over
- **Required warning banner:** `background: #e53e3e`, white text, padding, full width, above the segmented control
- **Segmented control:** Pill-shaped container, active segment has white background with subtle shadow, inactive is transparent
- **Spacing:** Generous padding (16px gutters). The day grid cells should be tall enough to be easy drop targets on a phone (minimum 64px height).

---

## Vercel Configuration

`vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Python runtime: add `"framework": null` and specify `"functions": { "api/*.py": { "runtime": "python3.11" } }`.

---

## Environment Variables

The app reads the Neon connection string from `DATABASE_URL`. Set this in Vercel's environment variable settings. In local dev, use a `.env` file (never commit it).

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

---

## Constraints & Rules

- Do not use any CSS framework (no Tailwind, no Bootstrap, no Material UI)
- Do not add any features not listed above
- Do not mock the database — all API functions must connect to Neon via `DATABASE_URL`
- Do not add authentication middleware beyond the PIN check on the frontend
- The settings table always has exactly one row (seed it on first deploy if empty)
- All API responses are JSON
- Handle CORS in the Python functions so the Vite dev server can reach them locally
