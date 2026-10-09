# ECKO Owner Workbench · Local Projection

This directory is an isolated Firefox/Zen Manifest V3 extension proof. It is a static, local projection of the ECKO Owner Workbench: a dark three-pane desktop surface for owner decisions, an active build canvas, and visible bot teammates. It is not a connected product.

## Local setup

1. In Zen, open `about:debugging#/runtime/this-firefox`.
2. Choose **Load Temporary Add-on**.
3. Select `/Users/elijaheck/Projects/zen-owner-workbench/tools/owner-workbench/manifest.json`.
4. Open the extension action and choose **Open Owner Workbench**. This canonical full extension tab is the main surface.
5. If a full tab cannot be opened, choose **Open compact sidebar fallback** or copy the local extension URL from the popup. The sidebar is intentionally a readable fallback, not the product surface.

Temporary add-ons are removed when Zen restarts; reload the manifest from `about:debugging` after a restart. A persistent signed XPI is outside this proof.

## Cursor preview (local pages, not Zen)

Cursor cannot host Zen or Gecko. The in-editor view is always Cursor's Simple Browser.

To keep a basic Zen page in the **side** panel while you edit: **Tasks: Run Task → Preview Zen Side Panel**. That starts the local server on `127.0.0.1:8765`, opens `http://127.0.0.1:8765/zen-side.html` beside the editor, and tries to move that tab into the Secondary Side Bar (the right side section). If it stays in the middle, drag the **Simple Browser** tab onto the right side bar.

The wider ECKO proof is still **Tasks: Run Task → Preview Owner Workbench** (`/workbench.html`). Open `/Applications/Zen.app` if you want the real browser.

## What the proof demonstrates

- `Inbox & Decisions` groups fixture items under **Needs You**, **Active**, **Waiting**, and **Recent**. Detail shows source, reason, Next Unlock, exact owner actions, a separate **Approve → Execute → Verify → Complete** lifecycle, and a compact inspection tray.
- `Workspace & Preview` shows a local Folder Map, Goal, worktree/checkpoint timeline, distinct `Cursor`, `Codex`, `Claude`, and `Grok` provider labels (all **NOT CONNECTED**), and a browser-shaped **STATIC LOCAL PREVIEW**. It never embeds a remote page or inspects an active tab.
- `Bots & Control` keeps the named roster **Atlas**, **Morrow**, and **Ledger** visible with roles, context, status, and `FIXTURE · OFFLINE` provider identity. The composer is labeled **Draft a direction · Local draft only** and cannot steer a bot.
- **Owner**, **Personal**, and **Business** switch context without deleting the other contexts' local demo state. Grant, Take back, Revoke, Approve, Deny, Request revision, Reset, and receipt inspection only update namespaced local fixture state.

## Privacy and integration boundary

This proof requests zero permissions and zero host permissions. It contains no content script, background worker, network call, remote asset, cookie/history access, account connection, private message access, active-tab inspection, command execution, provider/Hermes/Brain connection, filesystem access, or iframe. The only browser operations are opening this extension's own page from the popup and copying that page URL as a manual fallback.

The state is a sanitized, versioned object under `owner-workbench:demo-state:v2` in extension-local `localStorage`. A legacy v1 key is read only for safe migration; no private browser or provider data is ever persisted. `FIXTURE · LOCAL ONLY` is provenance, not a real receipt or result.

## Checks

From this directory, run:

```sh
npm test
npm run build:check
python3 -m json.tool manifest.json
git diff --check -- tools/owner-workbench
```

These checks use Node's built-in test runner and no dependency install. A full Zen build is a non-goal because generated browser sources are absent from this checkout.
