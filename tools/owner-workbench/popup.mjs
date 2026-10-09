const browserApi = globalThis.browser;
const workbenchUrl = (() => {
  try {
    return browserApi?.runtime?.getURL("workbench.html") ?? "workbench.html";
  } catch {
    return "workbench.html";
  }
})();

const fallbackStatus = document.getElementById("fallback-status");
const urlInput = document.getElementById("workbench-url");

function setStatus(message) {
  if (fallbackStatus) {
    fallbackStatus.textContent = message;
  }
}

if (urlInput) {
  urlInput.value = workbenchUrl;
}

document.getElementById("open-rail")?.addEventListener("click", async () => {
  try {
    if (typeof browserApi?.sidebarAction?.open !== "function") {
      throw new Error("Sidebar API unavailable");
    }
    await browserApi.sidebarAction.open();
    setStatus("Compact sidebar fallback requested. If Zen keeps this popup open, use the manual URL below.");
  } catch {
    setStatus("Zen could not open the compact sidebar here. Use Copy and open the workbench URL manually.");
  }
});

document.getElementById("open-tab")?.addEventListener("click", async () => {
  try {
    if (typeof browserApi?.tabs?.create !== "function") {
      throw new Error("Tabs API unavailable");
    }
    await browserApi.tabs.create({ url: workbenchUrl });
    setStatus("Canonical Owner Workbench tab requested. If Zen blocks it, use Copy below.");
  } catch {
    setStatus("Zen could not open a tab here. Use Copy and open the workbench URL manually.");
  }
});

document.getElementById("copy-url")?.addEventListener("click", async () => {
  let copied = false;
  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(workbenchUrl);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied && urlInput) {
    urlInput.focus();
    urlInput.select();
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
  }

  setStatus(copied ? "Copied. Open the local extension URL in a new Zen tab." : "URL selected. Copy it manually, then open a new Zen tab.");
});
