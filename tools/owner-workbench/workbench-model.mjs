/**
 * Local-only model for the ECKO Owner Workbench projection.
 *
 * There are no browser APIs in this module. The UI passes an extension-local
 * storage object when it wants to persist the small, sanitized demo state.
 * Provider names, inbox items, receipts, and browser sharing are fixtures;
 * none of them represent a connected account, tab, bot, or runtime.
 */

export const STATE_VERSION = 2;
export const STORAGE_KEY = "owner-workbench:demo-state:v2";
export const LEGACY_STORAGE_KEY = "owner-workbench:demo-state:v1";

export const PROVIDER_TABS = Object.freeze([
  Object.freeze({ id: "cursor", label: "Cursor", status: "NOT CONNECTED" }),
  Object.freeze({ id: "codex", label: "Codex", status: "NOT CONNECTED" }),
  Object.freeze({ id: "claude", label: "Claude", status: "NOT CONNECTED" }),
  Object.freeze({ id: "grok", label: "Grok", status: "NOT CONNECTED" })
]);

export const BOT_ROSTER = Object.freeze([
  Object.freeze({
    id: "atlas",
    name: "Atlas",
    role: "Owner dispatch",
    context: "Owner",
    status: "Ready locally",
    provider: "FIXTURE · OFFLINE",
    summary: "Keeps owner decisions and next unlocks visible."
  }),
  Object.freeze({
    id: "morrow",
    name: "Morrow",
    role: "Personal planning",
    context: "Personal",
    status: "Waiting locally",
    provider: "FIXTURE · OFFLINE",
    summary: "Holds a quiet planning thread for the personal workspace."
  }),
  Object.freeze({
    id: "ledger",
    name: "Ledger",
    role: "Business operations",
    context: "Business",
    status: "Active locally",
    provider: "FIXTURE · OFFLINE",
    summary: "Keeps the business build checkpoint ready for review."
  })
]);

const INBOX_GROUPS = Object.freeze([
  Object.freeze({
    id: "needs-you",
    label: "Needs You",
    items: Object.freeze([
      Object.freeze({
        id: "handoff",
        title: "Review the staged workspace hand-off",
        source: "Owner thread / staged hand-off",
        reason: "A local build checkpoint is ready for your decision.",
        nextUnlock: "Approve the checkpoint to unlock the simulated execution marker.",
        action: "Approve the staged checkpoint",
        marker: "NEEDS DECISION"
      }),
      Object.freeze({
        id: "scope",
        title: "Choose the next slice of the owner surface",
        source: "Goal note / local fixture",
        reason: "Two safe local directions are waiting for an owner choice.",
        nextUnlock: "Keep, revise, or reset the local direction before any hand-off.",
        action: "Choose a local direction",
        marker: "OWNER CHOICE"
      })
    ])
  }),
  Object.freeze({
    id: "active",
    label: "Active",
    items: Object.freeze([
      Object.freeze({
        id: "canvas",
        title: "Build canvas is staged beside the preview",
        source: "Workspace / local worktree",
        reason: "The active build fixture has a checkpoint to inspect.",
        nextUnlock: "Inspect the static preview and leave a local draft direction.",
        action: "Inspect the build canvas",
        marker: "ACTIVE"
      })
    ])
  }),
  Object.freeze({
    id: "waiting",
    label: "Waiting",
    items: Object.freeze([
      Object.freeze({
        id: "provider",
        title: "Provider hand-off is deliberately offline",
        source: "Provider boundary / local fixture",
        reason: "Cursor, Codex, Claude, and Grok have no connection here.",
        nextUnlock: "A future adapter would need explicit permission and receipts.",
        action: "Review the boundary",
        marker: "WAITING"
      })
    ])
  }),
  Object.freeze({
    id: "recent",
    label: "Recent",
    items: Object.freeze([
      Object.freeze({
        id: "receipt",
        title: "Local inspection marker recorded",
        source: "Receipt tray / local projection",
        reason: "The workbench records only what you click in this fixture.",
        nextUnlock: "Reset the demo to replay the owner-gated lifecycle.",
        action: "Inspect the local marker",
        marker: "LOCAL MARKER"
      })
    ])
  })
]);

export const WORKSPACES = Object.freeze([
  Object.freeze({
    id: "owner",
    label: "Owner",
    goal: "Decide what unlocks the next build slice",
    context: "Owner control surface · one local goal",
    botName: "Atlas",
    botRole: "Owner dispatch",
    selectedBotId: "atlas",
    folder: "ECKO / Owner Workbench",
    worktree: "owner-workbench / fixture",
    branch: "local-proof",
    buildStatus: "Checkpoint ready",
    conversation: "Atlas · owner decision thread",
    conversationCopy: "I can stage the next local marker when you choose a direction.",
    task: "Review the staged workspace hand-off",
    checkpoint: "Checkpoint 03 · source rail composed beside preview"
  }),
  Object.freeze({
    id: "personal",
    label: "Personal",
    goal: "Keep a calm local plan in view",
    context: "Personal planning surface · one local goal",
    botName: "Morrow",
    botRole: "Personal planning",
    selectedBotId: "morrow",
    folder: "Personal / Planning Desk",
    worktree: "personal-plan / fixture",
    branch: "planning-proof",
    buildStatus: "Waiting on owner",
    conversation: "Morrow · personal planning thread",
    conversationCopy: "The plan is staged locally; nothing has been sent or scheduled.",
    task: "Choose one quiet next step",
    checkpoint: "Checkpoint 01 · personal context remains namespaced"
  }),
  Object.freeze({
    id: "business",
    label: "Business",
    goal: "Inspect the business build before hand-off",
    context: "Business operations surface · one local goal",
    botName: "Ledger",
    botRole: "Business operations",
    selectedBotId: "ledger",
    folder: "Business / Operations Canvas",
    worktree: "business-ops / fixture",
    branch: "ops-proof",
    buildStatus: "Active locally",
    conversation: "Ledger · business operations thread",
    conversationCopy: "The operations checkpoint is visible for local inspection only.",
    task: "Inspect the operations checkpoint",
    checkpoint: "Checkpoint 05 · business preview staged"
  })
]);

export const RELAY_STAGES = Object.freeze([
  Object.freeze({
    id: "approval",
    label: "Approval",
    shortLabel: "01 · APPROVE",
    description: "Owner decision awaits an explicit local approval click.",
    safety: "No command, provider, or runtime executed."
  }),
  Object.freeze({
    id: "execution",
    label: "Execution",
    shortLabel: "02 · EXECUTE",
    description: "A simulated execution hand-off is shown for inspection.",
    safety: "No command, provider, or runtime executed."
  }),
  Object.freeze({
    id: "verification",
    label: "Verification",
    shortLabel: "03 · VERIFY",
    description: "A simulated receipt check keeps execution and completion separate.",
    safety: "No command, provider, or runtime executed."
  }),
  Object.freeze({
    id: "complete",
    label: "Complete",
    shortLabel: "04 · COMPLETE",
    description: "The demo journey is complete without claiming a live result.",
    safety: "No command, provider, or runtime executed."
  })
]);

const WORKSPACE_IDS = new Set(WORKSPACES.map((workspace) => workspace.id));
const RELAY_STAGE_IDS = new Set(RELAY_STAGES.map((stage) => stage.id));
const BOT_IDS = new Set(BOT_ROSTER.map((bot) => bot.id));
const PROVIDER_IDS = new Set(PROVIDER_TABS.map((provider) => provider.id));
const SHARE_STATES = new Set(["revoked", "granted", "taken-back"]);
const INBOX_ITEM_IDS = new Set(
  INBOX_GROUPS.flatMap((group) => group.items.map((item) => item.id))
);

const DEFAULT_ITEM_BY_WORKSPACE = Object.freeze({
  owner: "handoff",
  personal: "scope",
  business: "canvas"
});

export function getWorkspace(workspaceId) {
  return WORKSPACES.find((workspace) => workspace.id === workspaceId) ?? WORKSPACES[0];
}

export function getBot(botId) {
  return BOT_ROSTER.find((bot) => bot.id === botId) ?? BOT_ROSTER[0];
}

export function getProvider(providerId) {
  return PROVIDER_TABS.find((provider) => provider.id === providerId) ?? PROVIDER_TABS[0];
}

export function getRelayStage(stageId) {
  return RELAY_STAGES.find((stage) => stage.id === stageId) ?? RELAY_STAGES[0];
}

export function getInboxItem(itemId) {
  return INBOX_GROUPS.flatMap((group) => group.items).find((item) => item.id === itemId)
    ?? INBOX_GROUPS[0].items[0];
}

function event(type, message) {
  return {
    type,
    message,
    provenance: "FIXTURE · LOCAL ONLY"
  };
}

function createContextState(workspaceId) {
  const workspace = getWorkspace(workspaceId);
  return {
    selectedItemId: DEFAULT_ITEM_BY_WORKSPACE[workspace.id] ?? "handoff",
    selectedBotId: workspace.selectedBotId,
    selectedProviderId: "cursor",
    relayStage: "approval",
    approvalRecorded: false,
    decisionStatus: "pending",
    browserShareState: "revoked",
    lastEvent: event("reset", "Local projection ready. No command, provider, or runtime executed.")
  };
}

function copyEvent(candidate) {
  return {
    type: candidate?.type ?? "reset",
    message: candidate?.message ?? "Local projection ready. No command, provider, or runtime executed.",
    provenance: "FIXTURE · LOCAL ONLY"
  };
}

function copyContext(context, workspaceId) {
  const workspace = getWorkspace(workspaceId);
  const safeContext = context && typeof context === "object" ? context : {};
  return {
    selectedItemId: INBOX_ITEM_IDS.has(safeContext.selectedItemId)
      ? safeContext.selectedItemId
      : DEFAULT_ITEM_BY_WORKSPACE[workspace.id] ?? "handoff",
    selectedBotId: BOT_IDS.has(safeContext.selectedBotId) ? safeContext.selectedBotId : workspace.selectedBotId,
    selectedProviderId: PROVIDER_IDS.has(safeContext.selectedProviderId)
      ? safeContext.selectedProviderId
      : "cursor",
    relayStage: RELAY_STAGE_IDS.has(safeContext.relayStage) ? safeContext.relayStage : "approval",
    approvalRecorded: safeContext.approvalRecorded === true,
    decisionStatus: ["pending", "approved", "denied", "revise"].includes(safeContext.decisionStatus)
      ? safeContext.decisionStatus
      : safeContext.approvalRecorded === true
        ? "approved"
        : "pending",
    browserShareState: SHARE_STATES.has(safeContext.browserShareState)
      ? safeContext.browserShareState
      : safeContext.browserShareGranted === true
        ? "granted"
        : "revoked",
    lastEvent: copyEvent(safeContext.lastEvent)
  };
}

function copyContexts(contexts) {
  return Object.fromEntries(
    WORKSPACES.map((workspace) => [workspace.id, copyContext(contexts?.[workspace.id], workspace.id)])
  );
}

// Keep the v1 read-only field names available to callers while keeping the
// persisted v2 object strictly namespaced under `contexts`.
function withActiveAliases(state) {
  for (const [name, read] of Object.entries({
    relayStage: (active) => active.relayStage,
    approvalRecorded: (active) => active.approvalRecorded,
    browserShareGranted: (active) => active.browserShareState === "granted",
    lastEvent: (active) => active.lastEvent
  })) {
    Object.defineProperty(state, name, {
      configurable: true,
      enumerable: false,
      get() {
        return read(getContextState(this));
      }
    });
  }
  return state;
}

export function createInitialState(workspaceId = "owner") {
  const safeWorkspaceId = WORKSPACE_IDS.has(workspaceId) ? workspaceId : "owner";
  const contexts = Object.fromEntries(
    WORKSPACES.map((workspace) => [workspace.id, createContextState(workspace.id)])
  );
  return withActiveAliases({
    version: STATE_VERSION,
    workspaceId: safeWorkspaceId,
    contexts
  });
}

export function getContextState(state, workspaceId = state?.workspaceId) {
  const safeWorkspaceId = WORKSPACE_IDS.has(workspaceId) ? workspaceId : "owner";
  return state?.contexts?.[safeWorkspaceId] ?? createContextState(safeWorkspaceId);
}

function copyState(state) {
  const safeWorkspaceId = WORKSPACE_IDS.has(state?.workspaceId) ? state.workspaceId : "owner";
  return withActiveAliases({
    version: STATE_VERSION,
    workspaceId: safeWorkspaceId,
    contexts: copyContexts(state?.contexts)
  });
}

export function selectWorkspace(state, workspaceId) {
  const next = copyState(state);
  const workspace = getWorkspace(workspaceId);
  next.workspaceId = workspace.id;
  next.contexts[workspace.id].lastEvent = event(
    "workspace",
    `Switched to ${workspace.label}. Other workspace demo state remains stored locally; no command, provider, or runtime executed.`
  );
  return next;
}

export function selectInboxItem(state, itemId) {
  const next = copyState(state);
  const context = next.contexts[next.workspaceId];
  if (INBOX_ITEM_IDS.has(itemId)) {
    context.selectedItemId = itemId;
    context.lastEvent = event("inbox", "Selected a local fixture item. No command, provider, or runtime executed.");
  }
  return next;
}

export function selectBot(state, botId) {
  const next = copyState(state);
  const context = next.contexts[next.workspaceId];
  if (BOT_IDS.has(botId)) {
    context.selectedBotId = botId;
    context.lastEvent = event("bot", `Selected ${getBot(botId).name} as a local fixture. No command, provider, or runtime executed.`);
  }
  return next;
}

export function selectProvider(state, providerId) {
  const next = copyState(state);
  const context = next.contexts[next.workspaceId];
  if (PROVIDER_IDS.has(providerId)) {
    context.selectedProviderId = providerId;
    context.lastEvent = event("provider", `${getProvider(providerId).label} remains not connected. No command, provider, or runtime executed.`);
  }
  return next;
}

export function transitionRelay(state, targetStage) {
  const next = copyState(state);
  const context = next.contexts[next.workspaceId];
  const current = getRelayStage(context.relayStage);
  const targetIndex = RELAY_STAGES.findIndex((stage) => stage.id === targetStage);
  const currentIndex = RELAY_STAGES.findIndex((stage) => stage.id === current.id);

  if (targetIndex < 0) {
    context.lastEvent = event("blocked", "Unknown local relay state. No command, provider, or runtime executed.");
    return next;
  }

  if (targetStage === "approval" && current.id === "approval") {
    if (context.approvalRecorded === true) {
      context.lastEvent = event("noop", "Owner approval is already recorded locally. No command, provider, or runtime executed.");
      return next;
    }
    context.approvalRecorded = true;
    context.decisionStatus = "approved";
    context.lastEvent = event("approval", "Owner approval recorded as a local marker only. No command, provider, or runtime executed.");
    return next;
  }

  if (context.approvalRecorded !== true && targetIndex > 0) {
    context.relayStage = "approval";
    context.lastEvent = event("blocked", "Execution is gated until the owner records approval. No command, provider, or runtime executed.");
    return next;
  }

  if (targetIndex === currentIndex) {
    context.lastEvent = event("noop", `${current.label} is already selected. Approval, execution, verification, and completion remain distinct; no command, provider, or runtime executed.`);
    return next;
  }

  if (targetIndex !== currentIndex + 1) {
    context.lastEvent = event("blocked", `Move one relay stage at a time from ${current.label}. Approval remains separate from execution and completion; no command, provider, or runtime executed.`);
    return next;
  }

  const target = RELAY_STAGES[targetIndex];
  context.relayStage = target.id;
  context.lastEvent = event(target.id, `${target.label} demo marker recorded. ${target.safety}`);
  return next;
}

export function recordDecision(state, decision) {
  if (decision === "approve") {
    return transitionRelay(state, "approval");
  }
  const next = copyState(state);
  const context = next.contexts[next.workspaceId];
  if (decision === "deny") {
    context.decisionStatus = "denied";
    context.lastEvent = event("deny", "Owner denial recorded as a local marker only. No command, provider, or runtime executed.");
  } else if (decision === "revise") {
    context.decisionStatus = "revise";
    context.lastEvent = event("revise", "Revision requested as a local marker only. No command, provider, or runtime executed.");
  } else if (decision === "receipt") {
    context.lastEvent = event("receipt", "Receipt tray inspected. This is a local marker, not a real receipt or result.");
  } else {
    context.lastEvent = event("blocked", "Unknown local owner action. No command, provider, or runtime executed.");
  }
  return next;
}

export function setBrowserShare(state, grantedOrAction) {
  const action = typeof grantedOrAction === "boolean"
    ? grantedOrAction ? "granted" : "revoked"
    : grantedOrAction;
  const next = copyState(state);
  const context = next.contexts[next.workspaceId];
  if (!SHARE_STATES.has(action)) {
    context.lastEvent = event("blocked", "Unknown local browser-share action. No command, provider, or runtime executed.");
    return next;
  }
  context.browserShareState = action;
  const message = action === "granted"
    ? "Browser-share grant is scoped to this workspace and named bot locally. Nothing is captured, read, or transmitted; no command, provider, or runtime executed."
    : action === "taken-back"
      ? "Browser-share access was taken back locally. Nothing was captured, read, or transmitted; no command, provider, or runtime executed."
      : "Browser-share access was revoked locally. Nothing was captured, read, or transmitted; no command, provider, or runtime executed.";
  context.lastEvent = event("browser-share", message);
  return next;
}

export function resetState(state) {
  const next = copyState(state);
  const workspaceId = next.workspaceId;
  next.contexts[workspaceId] = createContextState(workspaceId);
  next.contexts[workspaceId].lastEvent = event("reset", "Local demo reset to approval. Other workspace state remains stored locally; no command, provider, or runtime executed.");
  return next;
}

function sanitizeMessage(message) {
  const raw = typeof message === "string" ? message.slice(0, 360) : "Local projection ready.";
  return /no command, provider, or runtime executed/i.test(raw)
    ? raw
    : `${raw} No command, provider, or runtime executed.`;
}

function sanitizeEvent(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return event("reset", "Local projection ready. No command, provider, or runtime executed.");
  }
  return event(
    typeof candidate.type === "string" ? candidate.type.slice(0, 40) : "reset",
    sanitizeMessage(candidate.message)
  );
}

function sanitizeContext(candidate, workspaceId) {
  const safe = copyContext(candidate, workspaceId);
  const requestedStage = safe.relayStage;
  if (safe.approvalRecorded !== true && requestedStage !== "approval") {
    safe.relayStage = "approval";
    safe.lastEvent = event("blocked", "Stored relay state was reset to approval until the owner records approval. No command, provider, or runtime executed.");
  } else {
    safe.lastEvent = sanitizeEvent(candidate?.lastEvent);
  }
  return safe;
}

function migrateLegacyState(candidate) {
  const migrated = createInitialState(candidate?.workspaceId);
  const workspaceId = migrated.workspaceId;
  migrated.contexts[workspaceId] = sanitizeContext({
    selectedBotId: getWorkspace(workspaceId).selectedBotId,
    selectedProviderId: "cursor",
    selectedItemId: DEFAULT_ITEM_BY_WORKSPACE[workspaceId],
    relayStage: candidate?.relayStage,
    approvalRecorded: candidate?.approvalRecorded,
    decisionStatus: candidate?.approvalRecorded === true ? "approved" : "pending",
    browserShareState: candidate?.browserShareGranted === true ? "granted" : "revoked",
    lastEvent: candidate?.lastEvent
  }, workspaceId);
  migrated.contexts[workspaceId].lastEvent = event("migration", "Migrated the local demo to the namespaced v2 model. No command, provider, or runtime executed.");
  return migrated;
}

export function sanitizeState(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return createInitialState();
  }
  if (candidate.version !== STATE_VERSION || !candidate.contexts || typeof candidate.contexts !== "object") {
    return migrateLegacyState(candidate);
  }
  const safeWorkspaceId = WORKSPACE_IDS.has(candidate.workspaceId) ? candidate.workspaceId : "owner";
  return withActiveAliases({
    version: STATE_VERSION,
    workspaceId: safeWorkspaceId,
    contexts: Object.fromEntries(
      WORKSPACES.map((workspace) => [workspace.id, sanitizeContext(candidate.contexts[workspace.id], workspace.id)])
    )
  });
}

export function loadState(storage) {
  if (!storage || typeof storage.getItem !== "function") {
    return createInitialState();
  }
  try {
    const raw = storage.getItem(STORAGE_KEY) ?? storage.getItem(LEGACY_STORAGE_KEY);
    return raw ? sanitizeState(JSON.parse(raw)) : createInitialState();
  } catch {
    return createInitialState();
  }
}

export function saveState(state, storage) {
  const safeState = sanitizeState(state);
  if (storage && typeof storage.setItem === "function") {
    storage.setItem(STORAGE_KEY, JSON.stringify(safeState));
  }
  return safeState;
}
