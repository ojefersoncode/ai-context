import { existsSync } from "node:fs";
import path from "node:path";
import * as vscode from "vscode";
import { getWorkspaceRoot } from "../services/cli-resolver.js";
import { notifyError } from "../notifications/notifier.js";

export function registerCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "ai-context.openContextFolder",
    async () => {
      const workspaceRoot = getWorkspaceRoot();
      if (!workspaceRoot) {
        notifyError("Nenhuma pasta de workspace está aberta no VS Code.");
        return;
      }

      const contextFolder = path.join(workspaceRoot, ".ai-context");
      if (!existsSync(contextFolder)) {
        notifyError(
          '.ai-context ainda não existe. Rode "AI Context: Scan Project" primeiro.'
        );
        return;
      }

      await vscode.commands.executeCommand(
        "revealFileInOS",
        vscode.Uri.file(contextFolder)
      );
    }
  );

  context.subscriptions.push(disposable);
}
