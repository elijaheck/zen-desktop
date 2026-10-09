## Learned User Preferences
- Talk in short, plain language; Elijah asked to be spoken to more simply.
- Keep a basic Zen view visible in Cursor’s side panel while editing; a main-editor preview or a GitHub link is not enough.
- He wants to see the UI in the Cursor app, work with it, and prompt edits at the same time.
- Do not compile or embed Zen.app/Gecko inside Cursor.

## Learned Workspace Facts
- This checkout is `zen-browser/desktop` on `dev`; `origin` is `https://github.com/elijaheck/zen-desktop.git` and `upstream` is `https://github.com/zen-browser/desktop.git`.
- Local testable UI lives in `tools/owner-workbench/` as untracked WIP; do not commit or push it unless asked.
- Cursor cannot host Zen; the in-editor view is Simple Browser of local HTML (`zen-side.html` for the side panel, `workbench.html` for the full workbench).
- Local preview is `python3 -m http.server` on `127.0.0.1:8765`; tasks are Preview Owner Workbench and Preview Zen Side Panel.
- Do not bootstrap a full Firefox/Zen compile (`npm run init` / `npm run build`) unless explicitly requested.
- Reuse this clone; do not write a second checkout into Brain `zenuin`.
