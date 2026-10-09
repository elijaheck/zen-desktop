import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => readFile(join(root, name), "utf8");

test("manifest exposes action and sidebar with no permissions", async () => {
  const manifest = JSON.parse(await read("manifest.json"));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.action.default_popup, "popup.html");
  assert.equal(manifest.sidebar_action.default_panel, "workbench.html");
  assert.equal(manifest.browser_specific_settings.gecko.id, "owner-workbench-local@eckos.local");
  assert.deepEqual(manifest.permissions, []);
  assert.deepEqual(manifest.host_permissions, []);
  assert.match(manifest.content_security_policy.extension_pages, /connect-src 'none'/);
  assert.match(manifest.content_security_policy.extension_pages, /script-src 'self'/);
  assert.match(manifest.content_security_policy.extension_pages, /object-src 'none'/);
});

test("workbench has exactly three primary panes and local boundary labels", async () => {
  const html = await read("workbench.html");
  const required = [
    "ECKO / Owner Workbench",
    "LOCAL PROJECTION · NO CONNECTIONS",
    "Inbox &amp; Decisions",
    "Workspace &amp; Preview",
    "Bots &amp; Control",
    "Needs You",
    "Active",
    "Waiting",
    "Recent",
    "FIXTURE · LOCAL ONLY",
    "STATIC LOCAL PREVIEW",
    "Cursor",
    "Codex",
    "Claude",
    "Grok",
    "NOT CONNECTED",
    "Approve",
    "Execute",
    "Verify",
    "Complete",
    "Grant",
    "Take back",
    "Revoke",
    "Draft a direction",
    "LOCAL DRAFT ONLY",
    "No messages or accounts are connected",
    "Nothing is captured, read, or transmitted"
  ];
  for (const value of required) {
    assert.match(html, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing ${value}`);
  }
  assert.equal((html.match(/data-primary-pane=/g) ?? []).length, 3);
  assert.equal((html.match(/class="pane /g) ?? []).length, 3);
  assert.doesNotMatch(html, /<iframe\b/i);
  assert.doesNotMatch(html, /src\s*=\s*["']https?:/i);
  assert.doesNotMatch(html, /href\s*=\s*["']https?:/i);
  assert.match(html, /<script type="module" src="workbench\.mjs"><\/script>/);
  assert.doesNotMatch(html, /<script(?! type="module")/);
  assert.doesNotMatch(html, /style\s*=/i);
});

test("owned source has no external request or browser inspection surface", async () => {
  const files = await readdir(root, { withFileTypes: true });
  const sourceNames = files.filter((entry) => entry.isFile() && /\.(mjs|html|css|json)$/.test(entry.name)).map((entry) => entry.name);
  const source = (await Promise.all(sourceNames.map((name) => read(name)))).join("\n");
  for (const prohibited of [
    /https?:\/\//,
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\bWebSocket\b/,
    /\bbrowser\.tabs\.query\b/,
    /\bbrowser\.cookies\b/,
    /\bbrowser\.history\b/,
    /\bbrowser\.runtime\.connect\b/,
    /\bnavigator\.sendBeacon\b/,
    /\binnerHTML\b/,
    /\bcontent_scripts\b/,
    /\bservice_worker\b/
  ]) {
    assert.doesNotMatch(source, prohibited, `prohibited ${prohibited}`);
  }
  const workbenchSource = `${await read("workbench.mjs")}\n${await read("popup.mjs")}`;
  assert.match(workbenchSource, /localStorage/);
  assert.match(workbenchSource, /sidebarAction\.open/);
  assert.match(workbenchSource, /tabs\.create/);
  assert.match(workbenchSource, /clipboard\.writeText/);
  assert.doesNotMatch(workbenchSource, /browser\.tabs\.query/);
});

test("popup presents full workbench first and sidebar as fallback", async () => {
  const html = await read("popup.html");
  assert.match(html, /Open Owner Workbench/);
  assert.match(html, /compact sidebar/i);
  assert.match(html, /LOCAL PROJECTION · NO CONNECTIONS/);
  assert.match(html, /Copy/);
  assert.doesNotMatch(html, /<iframe\b/i);
});

test("accessibility affordances keep focus and reduced motion local", async () => {
  const css = await read("workbench.css");
  const popupCss = await read("popup.css");
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /focus-visible/);
  assert.match(popupCss, /prefers-reduced-motion/);
  assert.match(popupCss, /focus-visible/);
});

