import { existsSync } from "node:fs";
import path from "node:path";
import * as vscode from "vscode";
import { registerAllCommands } from "./commands/register-commands.js";
import { registerContextWatcher } from "./watchers/context-watcher.js";
import { createStatusBarItem } from "./providers/status-bar.provider.js";
import { getSettings } from "./config/settings.js";
import { askYesNoNever } from "./notifications/notifier.js";
import { getWorkspaceRoot } from "./services/cli-resolver.js";
import { executeCliCommandWithFeedback } from "./commands/run-cli-command.helper.js";
import { logToOutput } from "./utils/output-channel.js";
import { ContextPanelViewProvider } from "./views/context-panel.webview.js";

const NEVER_ASK_KEY = "ai-context.neverAskInit";

export function activate(context: vscode.ExtensionContext): void {
  logToOutput("Extensão AI Context ativada.");

  registerAllCommands(context);
  registerContextWatcher(context);
  createStatusBarItem();
  registerContextPanel(context);

  void checkInitialSetup(context);
}

function registerContextPanel(context: vscode.ExtensionContext): void {
  const provider = new ContextPanelViewProvider();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ContextPanelViewProvider.viewId,
      provider
    )
  );

  // O painel só reflete o que já está em disco (.ai-context/*.json) — ele
  // nunca dispara análise por conta própria, só atualiza a visualização
  // quando os arquivos gerados pela CLI mudam.
  const panelWatcher = vscode.workspace.createFileSystemWatcher(
    "**/.ai-context/*.json"
  );
  panelWatcher.onDidChange(() => void provider.refresh());
  panelWatcher.onDidCreate(() => void provider.refresh());
  panelWatcher.onDidDelete(() => void provider.refresh());
  context.subscriptions.push(panelWatcher);
}

export function deactivate(): void {
  // Todos os disposables foram registrados em context.subscriptions,
  // então o próprio VS Code cuida da limpeza — nada a fazer aqui.
}

/**
 * Ao ativar a extensão, se o projeto ainda não tem .ai-context e o usuário
 * não pediu para nunca mais perguntar, oferece gerar agora.
 */
async function checkInitialSetup(
  context: vscode.ExtensionContext
): Promise<void> {
  const settings = getSettings();
  if (!settings.autoScanOnOpen) return;

  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) return;

  const alreadyExists = existsSync(path.join(workspaceRoot, ".ai-context"));
  if (alreadyExists) return;

  const neverAsk = context.workspaceState.get<boolean>(NEVER_ASK_KEY, false);
  if (neverAsk) return;

  const choice = await askYesNoNever(
    "Este projeto ainda não possui AI Context. Deseja gerar agora?"
  );

  if (choice === "yes") {
    await executeCliCommandWithFeedback("init");
  } else if (choice === "never") {
    await context.workspaceState.update(NEVER_ASK_KEY, true);
  }
}
