import * as vscode from "vscode";
import { getWorkspaceRoot } from "../services/cli-resolver.js";
import { readContextData } from "../services/context-data.service.js";
import { buildProjectPrompt } from "../services/prompt-generator.service.js";
import { notifyError, notifyInfo } from "../notifications/notifier.js";

export function registerCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "ai-context.copyProjectPrompt",
    async () => {
      const workspaceRoot = getWorkspaceRoot();
      if (!workspaceRoot) {
        notifyError("Nenhuma pasta de workspace está aberta no VS Code.");
        return;
      }

      const data = await readContextData(workspaceRoot);
      if (!data) {
        notifyError(
          '.ai-context ainda não existe. Rode "AI Context: Scan Project" primeiro.'
        );
        return;
      }

      const prompt = buildProjectPrompt(data);
      await vscode.env.clipboard.writeText(prompt);
      notifyInfo("Prompt do projeto copiado para a área de transferência.");
    }
  );

  context.subscriptions.push(disposable);
}
