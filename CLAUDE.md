# CLAUDE.md — Weekend Planner Project Rules

## Tech Stack

- **Frontend:** React (mobile-first, iOS-optimized)
- **Backend:** Python (serverless functions for Vercel)
- **Database:** Neon (PostgreSQL)
- **Hosting:** Vercel
- Always use `python3` for all Python run commands

## Design Principles

- Clean, minimal, user-friendly layout — no loud colors, no purple/neon vibe-coding aesthetic
- Clean card-based UI, calm tones, readable fonts
- Mobile-first — optimize for iOS phone screen sizes
- Large tap targets, smooth drag-and-drop interactions

## Code Style

- Keep components simple and focused — no over-engineering
- Prefer editing existing files over creating new ones
- Do not add unnecessary comments, docstrings, or type annotations to unchanged code
- No backwards-compatibility shims or unused code

## App-specific Context

- Parent column header names are user-configured (no hardcoded defaults) — read from settings
- The 4-digit PIN is the only authentication mechanism in v1
- Tile allocations reset weekly (Monday); tile definitions persist forever in the database
- The `required` tile warning is a prominent red banner on the main screen

## Workflow

- Always read files before editing them
- Run `python3` not `python`
- Do not commit unless explicitly asked
- Ask before taking any destructive or irreversible action
