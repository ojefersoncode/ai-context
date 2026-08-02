import * as vscode from "vscode";

let statusBarItem: vscode.StatusBarItem | undefined;

export function createStatusBarItem(): vscode.StatusBarItem {
  statusBarItem ??= vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  statusBarItem.command = "ai-context.scan";
  setStatusBarIdle();
  statusBarItem.show();

  return statusBarItem;
}

export function setStatusBarIdle(): void {
  if (!statusBarItem) return;
  statusBarItem.text = "$(sparkle) AI Context";
  statusBarItem.tooltip = "Clique para escanear o projeto";
}

export function setStatusBarBusy(label: string): void {
  if (!statusBarItem) return;
  statusBarItem.text = `$(sync~spin) ${label}`;
  statusBarItem.tooltip = "AI Context está processando...";
}

export function setStatusBarError(): void {
  if (!statusBarItem) return;
  statusBarItem.text = "$(error) AI Context";
  statusBarItem.tooltip = "Última execução falhou. Veja o Output Channel.";
}
