import * as vscode from "vscode";
import { getSettings } from "../config/settings.js";

export function notifyInfo(message: string): void {
  if (getSettings().showNotifications) {
    void vscode.window.showInformationMessage(message);
  }
}

export function notifyError(message: string): void {
  // Erros sempre aparecem, independente da config — silenciar falhas
  // seria pior para o usuário do que um pouco de ruído.
  void vscode.window.showErrorMessage(message);
}

export async function askYesNo(message: string): Promise<boolean> {
  const YES = "Sim";
  const NO = "Agora não";
  const choice = await vscode.window.showInformationMessage(message, YES, NO);
  return choice === YES;
}

export async function askYesNoNever(
  message: string
): Promise<"yes" | "later" | "never"> {
  const YES = "Sim";
  const LATER = "Depois";
  const NEVER = "Nunca perguntar novamente para este projeto";

  const choice = await vscode.window.showInformationMessage(
    message,
    YES,
    LATER,
    NEVER
  );

  if (choice === YES) return "yes";
  if (choice === NEVER) return "never";
  return "later";
}
