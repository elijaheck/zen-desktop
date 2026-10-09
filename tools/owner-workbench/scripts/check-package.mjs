import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const manifestPath = join(root, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function check(condition, message) {
  assert.ok(condition, message);
}

check(manifest.manifest_version === 3, "manifest_version must be 3");
check(manifest.action?.default_popup === "popup.html", "action popup must be popup.html");
check(manifest.sidebar_action?.default_panel === "workbench.html", "sidebar panel must be workbench.html");
check(manifest.browser_specific_settings?.gecko?.id === "owner-workbench-local@eckos.local", "stable Firefox temporary add-on ID is required");
check(Array.isArray(manifest.permissions) && manifest.permissions.length === 0, "permissions must be empty");
check(Array.isArray(manifest.host_permissions) && manifest.host_permissions.length === 0, "host_permissions must be empty");
const csp = manifest.content_security_policy?.extension_pages ?? "";
check(csp.includes("script-src 'self'"), "CSP must keep scripts local");
check(csp.includes("object-src 'none'"), "CSP must disable objects");
check(csp.includes("connect-src 'none'"), "CSP must disable connections");
check(csp.includes("style-src 'self'"), "CSP must keep styles local");

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const allFiles = walk(root);
const sourceFiles = allFiles.filter((path) => {
  const rel = relative(root, path);
  return /\.(mjs|html|css|json)$/.test(path)
    && !rel.startsWith("tests/")
    && !rel.startsWith("output/")
    && rel !== "scripts/check-package.mjs";
});

const manifestFiles = [
  manifest.action.default_popup,
  manifest.action.default_icon?.["16"],
  manifest.action.default_icon?.["32"],
  manifest.action.default_icon?.["48"],
  manifest.sidebar_action.default_panel,
  manifest.sidebar_action.default_icon,
  manifest.icons?.["16"],
  manifest.icons?.["32"],
  manifest.icons?.["48"]
].filter(Boolean);

const htmlFiles = ["popup.html", "workbench.html", "zen-side.html"];
const referenced = new Set(manifestFiles);
for (const htmlFile of htmlFiles) {
  const html = readFileSync(join(root, htmlFile), "utf8");
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    referenced.add(match[1]);
  }
}
for (const file of referenced) {
  if (file.startsWith("#")) {
    continue;
  }
  check(!file.includes("://") && !file.startsWith("/"), `referenced asset must be local: ${file}`);
  check(existsSync(join(root, file)), `missing referenced asset: ${file}`);
}

const forbidden = [
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
  /\bservice_worker\b/,
  /\biframe\b/
];
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    check(!pattern.test(source), `${pattern} is prohibited in ${relative(root, file)}`);
  }
}

for (const file of sourceFiles.filter((path) => path.endsWith(".mjs"))) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  check(result.status === 0, `JavaScript parse failed for ${relative(root, file)}: ${result.stderr}`);
}

const model = await import(pathToFileURL(join(root, "workbench-model.mjs")));
check(model.STATE_VERSION === 2, "model must expose state version 2");
check(model.WORKSPACES.length === 3, "model must expose three contexts");
check(model.PROVIDER_TABS.map((provider) => provider.label).join(",") === "Cursor,Codex,Claude,Grok", "provider labels must stay distinct");
check(model.RELAY_STAGES.map((stage) => stage.id).join(",") === "approval,execution,verification,complete", "relay order must be deterministic");
const visiblePanes = (readFileSync(join(root, "workbench.html"), "utf8").match(/data-primary-pane=/g) ?? []).length;
check(visiblePanes === 3, "workbench must have exactly three primary panes");
console.log(`build:check passed · recursively scanned ${sourceFiles.length} source files · local MV3 surface valid`);

