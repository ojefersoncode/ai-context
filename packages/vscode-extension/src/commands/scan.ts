import * as vscode from "vscode";
import { executeCliCommandWithFeedback } from "./run-cli-command.helper.js";

export function registerCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("ai-context.scan", async () => {
    await executeCliCommandWithFeedback("scan");
  });

  context.subscriptions.push(disposable);
}
