import test from "node:test";
import assert from "node:assert/strict";
import {
  LEGACY_STORAGE_KEY,
  PROVIDER_TABS,
  RELAY_STAGES,
  STATE_VERSION,
  STORAGE_KEY,
  WORKSPACES,
  createInitialState,
  getContextState,
  loadState,
  recordDecision,
  resetState,
  saveState,
  selectBot,
  selectInboxItem,
  selectProvider,
  selectWorkspace,
  setBrowserShare,
  transitionRelay
} from "../workbench-model.mjs";

test("workspace fixture has three contexts and stable named bots", () => {
  assert.deepEqual(
    WORKSPACES.map(({ id, label, botName }) => ({ id, label, botName })),
    [
      { id: "owner", label: "Owner", botName: "Atlas" },
      { id: "personal", label: "Personal", botName: "Morrow" },
      { id: "business", label: "Business", botName: "Ledger" }
    ]
  );
  assert.deepEqual(PROVIDER_TABS.map(({ label, status }) => ({ label, status })), [
    { label: "Cursor", status: "NOT CONNECTED" },
    { label: "Codex", status: "NOT CONNECTED" },
    { label: "Claude", status: "NOT CONNECTED" },
    { label: "Grok", status: "NOT CONNECTED" }
  ]);
});

test("relay is explicitly gated and advances one distinct stage at a time", () => {
  let state = createInitialState();
  assert.equal(state.version, STATE_VERSION);
  assert.equal(getContextState(state).relayStage, "approval");
  assert.equal(getContextState(state).approvalRecorded, false);

  state = transitionRelay(state, "execution");
  assert.equal(getContextState(state).relayStage, "approval");
  assert.match(getContextState(state).lastEvent.message, /execution is gated/i);

  state = transitionRelay(state, "approval");
  assert.equal(getContextState(state).approvalRecorded, true);
  assert.equal(getContextState(state).decisionStatus, "approved");
  assert.match(getContextState(state).lastEvent.message, /approval recorded/i);

  state = transitionRelay(state, "execution");
  assert.equal(getContextState(state).relayStage, "execution");
  state = transitionRelay(state, "verification");
  assert.equal(getContextState(state).relayStage, "verification");
  state = transitionRelay(state, "complete");
  assert.equal(getContextState(state).relayStage, "complete");
  assert.deepEqual(RELAY_STAGES.map(({ id }) => id), ["approval", "execution", "verification", "complete"]);
});

test("deny, revise, reset, and receipt actions remain local markers", () => {
  let state = createInitialState();
  state = recordDecision(state, "deny");
  assert.equal(getContextState(state).decisionStatus, "denied");
  assert.match(getContextState(state).lastEvent.message, /denial recorded/i);
  state = recordDecision(state, "revise");
  assert.equal(getContextState(state).decisionStatus, "revise");
  state = recordDecision(state, "receipt");
  assert.match(getContextState(state).lastEvent.message, /not a real receipt/i);
  state = transitionRelay(state, "approval");
  state = transitionRelay(state, "execution");
  state = resetState(state);
  assert.equal(getContextState(state).relayStage, "approval");
  assert.equal(getContextState(state).approvalRecorded, false);
  assert.equal(getContextState(state).decisionStatus, "pending");
});

test("workspace switching preserves each context's local demo state", () => {
  let state = createInitialState();
  state = transitionRelay(state, "approval");
  state = transitionRelay(state, "execution");
  state = setBrowserShare(state, "granted");
  state = selectInboxItem(state, "scope");
  state = selectProvider(state, "claude");

  state = selectWorkspace(state, "personal");
  assert.equal(getContextState(state).relayStage, "approval");
  assert.equal(getContextState(state).browserShareState, "revoked");
  state = transitionRelay(state, "approval");
  state = selectBot(state, "morrow");
  state = setBrowserShare(state, "taken-back");

  state = selectWorkspace(state, "owner");
  assert.equal(getContextState(state).relayStage, "execution");
  assert.equal(getContextState(state).approvalRecorded, true);
  assert.equal(getContextState(state).browserShareState, "granted");
  assert.equal(getContextState(state).selectedItemId, "scope");
  assert.equal(getContextState(state).selectedProviderId, "claude");

  state = selectWorkspace(state, "personal");
  assert.equal(getContextState(state).relayStage, "approval");
  assert.equal(getContextState(state).browserShareState, "taken-back");
  assert.equal(getContextState(state).selectedBotId, "morrow");
});

test("grant, take-back, and revoke state are explicit and namespaced", () => {
  let state = createInitialState();
  state = setBrowserShare(state, "granted");
  assert.equal(getContextState(state).browserShareState, "granted");
  state = setBrowserShare(state, "taken-back");
  assert.equal(getContextState(state).browserShareState, "taken-back");
  state = setBrowserShare(state, "revoked");
  assert.equal(getContextState(state).browserShareState, "revoked");
  assert.match(getContextState(state).lastEvent.message, /revoked locally/i);
});

test("only the v2 namespaced demo state is persisted and malformed state is safe", () => {
  const store = new Map();
  const storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value)
  };
  let state = createInitialState();
  state = transitionRelay(state, "approval");
  state = setBrowserShare(state, "granted");
  saveState(state, storage);
  assert.deepEqual([...store.keys()], [STORAGE_KEY]);
  assert.deepEqual(loadState(storage), state);
  assert.equal(store.has(LEGACY_STORAGE_KEY), false);

  store.set(STORAGE_KEY, "{not-json");
  const recovered = loadState(storage);
  assert.equal(recovered.version, STATE_VERSION);
  assert.equal(getContextState(recovered).relayStage, "approval");
  assert.equal(getContextState(recovered).approvalRecorded, false);
  assert.equal(getContextState(recovered).browserShareState, "revoked");
});

test("v1 state migrates without resurrecting an unapproved stage", () => {
  const storage = {
    getItem: (key) => key === LEGACY_STORAGE_KEY
      ? JSON.stringify({ workspaceId: "business", relayStage: "complete", browserShareGranted: true, lastEvent: { type: "complete", message: "stale" } })
      : null,
    setItem: () => {}
  };
  const state = loadState(storage);
  assert.equal(state.version, STATE_VERSION);
  assert.equal(state.workspaceId, "business");
  assert.equal(getContextState(state).relayStage, "approval");
  assert.equal(getContextState(state).approvalRecorded, false);
  assert.equal(getContextState(state).browserShareState, "granted");
  assert.match(getContextState(state).lastEvent.message, /migrated/i);
});

