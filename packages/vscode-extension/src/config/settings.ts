import * as vscode from "vscode";

export interface AiContextSettings {
  autoUpdate: boolean;
  updateOnSave: boolean;
  ignorePatterns: string[];
  showNotifications: boolean;
  preferredCliPath: string;
  autoScanOnOpen: boolean;
}

const SECTION = "aiContext";

/**
 * Centraliza a leitura de configurações num único lugar tipado.
 * Nenhum outro módulo deve chamar vscode.workspace.getConfiguration
 * diretamente — isso facilita trocar a fonte de config em testes.
 */
export function getSettings(): AiContextSettings {
  const config = vscode.workspace.getConfiguration(SECTION);

  return {
    autoUpdate: config.get<boolean>("autoUpdate", false),
    updateOnSave: config.get<boolean>("updateOnSave", false),
    ignorePatterns: config.get<string[]>("ignorePatterns", []),
    showNotifications: config.get<boolean>("showNotifications", true),
    preferredCliPath: config.get<string>("preferredCliPath", ""),
    autoScanOnOpen: config.get<boolean>("autoScanOnOpen", true),
  };
}
