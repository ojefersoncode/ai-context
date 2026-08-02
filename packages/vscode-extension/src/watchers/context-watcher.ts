import * as vscode from "vscode";
import { getSettings } from "../config/settings.js";
import { askYesNo } from "../notifications/notifier.js";
import { runCliCommand } from "../services/cli-runner.js";
import { executeCliCommandWithFeedback } from "../commands/run-cli-command.helper.js";

const DEBOUNCE_MS = 2000;
const WATCH_GLOB = "**/*.{ts,tsx,js,jsx,json}";

let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleUpdateCheck(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void handlePotentialOutOfDateContext();
  }, DEBOUNCE_MS);
}

async function handlePotentialOutOfDateContext(): Promise<void> {
  const settings = getSettings();

  if (settings.autoUpdate) {
    // Silencioso: só loga no Output Channel, sem notificação nem progress
    // bar, para não incomodar o usuário a cada salvamento.
    await runCliCommand("update");
    return;
  }

  if (!settings.showNotifications) return;

  const shouldUpdate = await askYesNo(
    "O contexto do projeto está desatualizado. Atualizar agora?"
  );

  if (shouldUpdate) {
    await executeCliCommandWithFeedback("update");
  }
}

/**
 * Registra o watcher de arquivos e o listener de "salvar arquivo".
 * Ambos convergem para a mesma lógica de decisão (silencioso vs perguntar),
 * evitando duplicar a regra de negócio em dois lugares.
 */
export function registerContextWatcher(
  context: vscode.ExtensionContext
): void {
  const watcher = vscode.workspace.createFileSystemWatcher(WATCH_GLOB);

  watcher.onDidChange(() => scheduleUpdateCheck());
  watcher.onDidCreate(() => scheduleUpdateCheck());
  watcher.onDidDelete(() => scheduleUpdateCheck());

  context.subscriptions.push(watcher);

  const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.uri.fsPath.includes(".ai-context")) return;

    const settings = getSettings();
    if (settings.updateOnSave) {
      scheduleUpdateCheck();
    }
  });

  context.subscriptions.push(saveListener);
}
