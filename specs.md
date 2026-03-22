# Weekend Planner App — Specifications

## Overview

A simple iOS-native planning app for two parents to allocate weekend tasks across Saturday and Sunday. The app is personal and protected by a 4-digit PIN code. The tech stack is Python backend, React frontend, and a Neon (PostgreSQL) database, hosted on Vercel.

---

## Tech Stack

- **Frontend:** React (iOS-native feel, hosted on Vercel)
- **Backend:** Python (hosted on Vercel as serverless functions)
- **Database:** Neon (PostgreSQL)
- **Platform target:** iOS (mobile-first, but not a native Swift app — React web app styled for iOS)

---

## Design & UI/UX

- Clean, minimal, and user-friendly layout
- No loud or "vibe-coded" color schemes (no purple gradients, no neon)
- Clean card-based UI, calm tones, readable fonts
- Touch-friendly — large tap targets, easy drag-and-drop
- Responsive layout optimized for phone screen sizes

---

## Authentication

- A 4-digit PIN code is shown on the first/launch screen
- No username or password — just the PIN entry
- After correct PIN entry, the user is taken to the main planning screen
- Designed to keep planning private without full authentication overhead, no additional security layers needed in v1
- The PIN is configurable (from the configuration page)
- Future: can be upgraded to a real login system

---

## Main Screen — Weekend Planner

The main screen has two areas: a horizontally scrollable tile tray at the top, and a day grid below it. Saturday and Sunday are shown as tabs — the user switches between them rather than scrolling past both at once.

### Layout

```
[ SAT ]  [ SUN ]                  ← segmented control

[ tile ] [ tile ] [ tile ] [ + ]  ← horizontal scrollable tile tray

[ MORNING   | Parent 1 | Parent 2 ]
[ NOON      | Parent 1 | Parent 2 ]
[ AFTERNOON | Parent 1 | Parent 2 ]
[ EVENING   | Parent 1 | Parent 2 ]
```

### Segmented Control — SAT / SUN

- A segmented control at the top of the screen switches between Saturday and Sunday views, which call separate database elements but are visually identical
- The tile tray and the day grid below both update to reflect the selected day
- The tile tray contents are the same for both days (shared tile library)

### Tile Tray (Drag Source)

- A single horizontally scrollable row of tiles, pinned above the day grid
- Tiles scroll to the right if there are more than fit on screen
- A `+` button is always visible at the right end of the tray to add a new tile
- Tiles remain in the tray after being dragged to a slot (they are copied, not moved), unless the tile has the `multi_slot: false` property. This will reset as soon as the planning is reset (= after the weekend)
- The tray is shared across Saturday and Sunday — it shows all available tiles regardless of which day tab is active

### Day Grid

- Two columns: one per parent (headers show the configurable parent names, no repeated headers)
- Four rows: Morning, Noon, Afternoon, Evening
- Row labels are shown on the left side
- Each cell is a drop target for tiles dragged from the tile tray

### Parent Names

- Both column header names are set by the user in the configuration page
- No default names are hardcoded — users enter their own names on first use

---

## Tiles

Each tile represents a task or activity. Tiles are stored in the database and persist between weekends.

### Tile Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `name` | string | required | The display label of the tile |
| `text_configurable` | boolean | false | If true, the tile name can be edited inline when dragging/placing it (e.g., for tasks that need a specific detail) |
| `multi_slot` | boolean | false | If true, the tile can be dragged to more than one day part (e.g., "Groceries" can appear in both morning and afternoon). If false, placing it in one slot removes it from others. |
| `required` | boolean | false | If true, the tile must be allocated to at least one person and one day part for the weekend. If not allocated, a warning is shown. |

### Required Tile Warning

- If any tile marked as `required` has not been placed in any slot by the time the user is viewing the main screen, a large red banner is displayed at the top of the screen
- The banner names the unallocated required tile(s) and prompts the user to plan them

### Tile Creation (Quick Add)

- A `+` button at the bottom of the tiles column on the main screen opens an inline/modal form
- The form asks for: tile name, and the three boolean properties (text configurable, multi-slot, required)
- The new tile is saved to the database immediately

---

## Configuration Page

Accessible via a button at the bottom of the main screen.

### Features

- **Manage tiles:** View all tiles, edit their properties (name, text_configurable, multi_slot, required), delete tiles
- **Set parent names:** Enter or edit the column header name for each of the two parents
- **Change PIN:** Update the 4-digit access code

---

## Weekend Reset

- The weekend planning (i.e., which tiles are placed in which slots) resets automatically each week after the weekend ends (after Sunday)
- The tiles themselves (the task library) are never reset — they persist in the database
- Reset logic: all slot allocations are cleared at the start of a new week (Monday)

---

## Data Model (High-level)

### `tiles` table
- `id` (primary key)
- `name` (string)
- `text_configurable` (boolean)
- `multi_slot` (boolean)
- `required` (boolean)

### `allocations` table
- `id` (primary key)
- `tile_id` (foreign key → tiles)
- `person` (enum: person_1 | person_2)
- `day` (enum: saturday | sunday)
- `slot` (enum: morning | noon | afternoon | evening)
- `custom_text` (string, nullable — used when tile is text_configurable)
- `week_start` (date — used to scope allocations to the current weekend)

### `settings` table
- `pin` (4-digit string)
- `name_person_1` (string)
- `name_person_2` (string)

---

## Out of Scope (v1)

- Multi-user accounts or real authentication
- Notifications or reminders
- Recurring task scheduling beyond the weekly reset
- Sharing or exporting the plan
- Dark mode (can be added later)
