import { existsSync } from "node:fs";
import path from "node:path";
import * as vscode from "vscode";
import { getSettings } from "../config/settings.js";

/**
 * Descobre qual executável da CLI usar, nesta ordem de prioridade:
 *
 * 1. Caminho customizado definido em `aiContext.preferredCliPath`
 * 2. Binário local ao workspace (node_modules/.bin/ai-context) — cobre o
 *    caso mais comum: o projeto tem `ai-context-cli` como devDependency
 * 3. `ai-context` assumido disponível no PATH global (instalado via
 *    `npm install -g`) — deixamos o próprio shell resolver
 */
export function resolveCliCommand(): string {
  const settings = getSettings();

  if (settings.preferredCliPath.trim().length > 0) {
    return settings.preferredCliPath.trim();
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
    const binName = process.platform === "win32" ? "ai-context.cmd" : "ai-context";
    const localBinPath = path.join(
      workspaceFolder.uri.fsPath,
      "node_modules",
      ".bin",
      binName
    );

    if (existsSync(localBinPath)) {
      return localBinPath;
    }
  }

  return "ai-context";
}

export function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
