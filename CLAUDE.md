# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run electron   # Launch Electron app (requires dev server running)
npm run build      # Production build
npm run lint       # ESLint
```

To run the full app: start `npm run dev` in one terminal, then `npm run electron` in another.

## Architecture

This is an **Electron + React/Vite** desktop score bug — a small always-on-top overlay that shows live NBA scores.

**Two-process Electron model:**
- [electron.cjs](electron.cjs) — main process. Creates a frameless, transparent, always-on-top 400×110 window that loads `http://localhost:5173`. Handles `close-window` IPC.
- [preload.cjs](preload.cjs) — exposes `window.electronAPI.closeWindow()` to the renderer via `contextBridge`.
- [src/App.jsx](src/App.jsx) — the entire React UI. No router, no component split; single component.

**Data flow in `App.jsx`:**
- Polls ESPN public API every 10 seconds for the NBA scoreboard (`/apis/site/v2/sports/basketball/nba/scoreboard`), storing all games in state.
- On game selection change, polls ESPN summary API every 10 seconds for play-by-play (`/apis/site/v2/sports/basketball/nba/summary?event=<id>`).
- Auto-selects the first game on initial load (guarded by `hasSelected` ref to avoid resetting selection on re-fetches).
- Displays: team logos from `a.espncdn.com`, scores, game status (live quarter/clock, final, or tip-off time), and the most recent play.

**IPC:** The close button in the React UI calls `window.electronAPI.closeWindow()` → IPC → `app.quit()`.
