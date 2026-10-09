import {
  BOT_ROSTER,
  PROVIDER_TABS,
  RELAY_STAGES,
  getBot,
  getContextState,
  getInboxItem,
  getRelayStage,
  getWorkspace,
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
} from "./workbench-model.mjs";

const storage = (() => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
})();

let state = loadState(storage);

const byId = (id) => document.getElementById(id);
const workspaceSelect = byId("workspace-select");

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setStatusClass(element, stateClass) {
  if (!element) {
    return;
  }
  element.classList.remove("state-amber", "state-cyan", "state-muted");
  element.classList.add(stateClass);
}

function renderWorkspace(workspace, context) {
  if (workspaceSelect) {
    workspaceSelect.value = workspace.id;
  }
  setText(byId("goal-title"), workspace.goal);
  setText(byId("workspace-goal"), workspace.goal);
  setText(byId("workspace-context"), workspace.context);
  setText(byId("folder-name"), workspace.folder);
  setText(byId("worktree-name"), workspace.worktree);
  setText(byId("build-status"), workspace.buildStatus);
  setText(byId("task-title"), workspace.task);
  setText(byId("checkpoint-title"), workspace.checkpoint);
  setText(byId("share-workspace-name"), workspace.label);
  setText(byId("share-bot-name"), getBot(context.selectedBotId).name);
}

function renderInbox(context) {
  const item = getInboxItem(context.selectedItemId);
  setText(byId("selected-item-marker"), item.marker);
  setText(byId("selected-item-title"), item.title);
  setText(byId("selected-item-source"), `Source / ${item.source}`);
  setText(byId("selected-item-reason"), item.reason);
  setText(byId("selected-item-next-unlock"), item.nextUnlock);

  document.querySelectorAll("[data-inbox-item]").forEach((button) => {
    const selected = button.dataset.inboxItem === item.id;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function renderLifecycle(context) {
  const stage = getRelayStage(context.relayStage);
  const stageIndex = RELAY_STAGES.findIndex((candidate) => candidate.id === stage.id);
  const approvalRecorded = context.approvalRecorded === true;

  document.querySelectorAll("[data-stage-item]").forEach((item) => {
    const itemIndex = RELAY_STAGES.findIndex((candidate) => candidate.id === item.dataset.stageItem);
    item.classList.toggle("is-current", itemIndex === stageIndex);
    item.classList.toggle("is-complete", itemIndex < stageIndex);
    item.classList.toggle("is-approved", item.dataset.stageItem === "approval" && approvalRecorded);
  });

  document.querySelectorAll("[data-stage]").forEach((button) => {
    const buttonStage = getRelayStage(button.dataset.stage);
    const isApprovalButton = buttonStage.id === "approval";
    const isCurrent = buttonStage.id === stage.id;
    button.setAttribute(
      "aria-label",
      isApprovalButton
        ? approvalRecorded ? "Owner approval recorded locally" : "Record owner approval locally"
        : isCurrent ? `Current local stage: ${buttonStage.label}` : `Move local demo to ${buttonStage.label}`
    );
    button.setAttribute("aria-pressed", String(isApprovalButton ? approvalRecorded : isCurrent));
    const label = button.querySelector("strong");
    if (isApprovalButton) {
      setText(label, approvalRecorded ? "Approved" : "Approve");
    }
  });

  setText(byId("relay-stage-label"), `CURRENT MARKER / ${stage.label.toUpperCase()}`);
  setText(
    byId("relay-stage-description"),
    stage.id === "approval" && approvalRecorded
      ? "Owner approval is recorded as a local demo marker."
      : stage.description
  );
  setText(byId("relay-safety"), stage.safety);
  setText(byId("relay-status"), context.lastEvent.message);

  const decisionLabels = {
    pending: "PENDING",
    approved: "APPROVED · LOCAL",
    denied: "DENIED · LOCAL",
    revise: "REVISION · LOCAL"
  };
  const decisionClass = context.decisionStatus === "approved" ? "state-cyan" : context.decisionStatus === "pending" ? "state-amber" : "state-muted";
  setText(byId("approval-state"), decisionLabels[context.decisionStatus] ?? decisionLabels.pending);
  setStatusClass(byId("approval-state"), decisionClass);

  const receiptCopy = {
    approval: "Approval marker only. Execution remains gated and no live receipt exists.",
    execution: "Execution marker only. There is no live result or provider receipt.",
    verification: "Verification marker only. No command, provider, or runtime was executed.",
    complete: "Complete marker only. This is not a live completion or external receipt."
  };
  setText(byId("receipt-detail"), receiptCopy[stage.id] ?? "No execution receipt exists. Advance the relay to see labeled local markers.");
  setText(byId("receipt-provenance"), context.lastEvent.provenance ?? "FIXTURE · LOCAL ONLY");
}

function renderProviders(context) {
  const selected = context.selectedProviderId;
  const provider = PROVIDER_TABS.find((candidate) => candidate.id === selected) ?? PROVIDER_TABS[0];
  document.querySelectorAll("[data-provider]").forEach((button) => {
    const isSelected = button.dataset.provider === selected;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });
  setText(byId("provider-status"), `${provider.label} is a local provider tab fixture. No provider is connected.`);
}

function renderBots(workspace, context) {
  const selectedBot = getBot(context.selectedBotId);
  document.querySelectorAll("[data-bot]").forEach((button) => {
    const isSelected = button.dataset.bot === selectedBot.id;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  setText(byId("selected-bot-name"), selectedBot.name);
  setText(byId("selected-bot-role"), `${selectedBot.role} · ${selectedBot.context}`);
  setText(byId("selected-bot-provider"), selectedBot.provider);
  setText(byId("selected-bot-status"), selectedBot.status.toUpperCase());
  setText(byId("conversation-context"), workspace.label);
  setText(byId("conversation-name"), workspace.conversation);
  setText(byId("conversation-copy"), `“${workspace.conversationCopy}”`);
  setText(byId("bot-task"), workspace.task);
  setText(byId("bot-summary"), selectedBot.summary);
  const avatar = document.querySelector(".bot-avatar-large");
  setText(avatar, selectedBot.name.slice(0, 1));
  setStatusClass(byId("selected-bot-status"), selectedBot.id === "atlas" ? "state-cyan" : selectedBot.id === "ledger" ? "state-amber" : "state-muted");
}

function renderShare(context) {
  const labels = {
    revoked: "REVOKED",
    granted: "GRANTED · LOCAL",
    "taken-back": "TAKEN BACK · LOCAL"
  };
  const stateClass = context.browserShareState === "granted" ? "state-cyan" : context.browserShareState === "taken-back" ? "state-amber" : "state-muted";
  setText(byId("share-state"), labels[context.browserShareState] ?? labels.revoked);
  setStatusClass(byId("share-state"), stateClass);
  setText(
    byId("share-status"),
    context.browserShareState === "granted"
      ? "Browser-share grant is local policy state only; nothing is captured, read, or transmitted."
      : context.browserShareState === "taken-back"
        ? "Browser-share access was taken back locally. Nothing is captured, read, or transmitted."
        : "Browser share is revoked locally. Nothing is captured, read, or transmitted."
  );
}

function render() {
  const workspace = getWorkspace(state.workspaceId);
  const context = getContextState(state);
  renderWorkspace(workspace, context);
  renderInbox(context);
  renderLifecycle(context);
  renderProviders(context);
  renderBots(workspace, context);
  renderShare(context);
  document.title = `ECKO / Owner Workbench · ${workspace.label}`;
}

function commit(nextState) {
  state = saveState(nextState, storage);
  render();
}

workspaceSelect?.addEventListener("change", (event) => {
  commit(selectWorkspace(state, event.target.value));
});

document.querySelectorAll("[data-inbox-item]").forEach((button) => {
  button.addEventListener("click", () => {
    commit(selectInboxItem(state, button.dataset.inboxItem));
  });
});

document.querySelectorAll("[data-provider]").forEach((button) => {
  button.addEventListener("click", () => {
    commit(selectProvider(state, button.dataset.provider));
  });
});

document.querySelectorAll("[data-bot]").forEach((button) => {
  button.addEventListener("click", () => {
    commit(selectBot(state, button.dataset.bot));
  });
});

document.querySelectorAll("[data-stage]").forEach((button) => {
  button.addEventListener("click", () => {
    commit(transitionRelay(state, button.dataset.stage));
  });
});

document.querySelectorAll("[data-decision]").forEach((button) => {
  button.addEventListener("click", () => {
    const decision = button.dataset.decision;
    commit(decision === "reset" ? resetState(state) : recordDecision(state, decision));
  });
});

document.querySelectorAll("[data-share-action]").forEach((button) => {
  button.addEventListener("click", () => {
    commit(setBrowserShare(state, button.dataset.shareAction));
  });
});

render();

