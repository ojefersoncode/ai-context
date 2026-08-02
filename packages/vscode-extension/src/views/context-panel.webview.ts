import * as vscode from "vscode";
import { getWorkspaceRoot } from "../services/cli-resolver.js";
import { readContextData } from "../services/context-data.service.js";
import { buildProjectPrompt } from "../services/prompt-generator.service.js";
import { buildWebviewHtml } from "./webview-html.js";
import { notifyError, notifyInfo } from "../notifications/notifier.js";
import { executeCliCommandWithFeedback } from "../commands/run-cli-command.helper.js";

export class ContextPanelViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = "aiContext.panel";

  private view: vscode.WebviewView | undefined;

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };

    webviewView.webview.onDidReceiveMessage((message: { action?: string }) => {
      void this.handleMessage(message.action);
    });

    void this.refresh();
  }

  async refresh(): Promise<void> {
    if (!this.view) return;

    const workspaceRoot = getWorkspaceRoot();
    const data = workspaceRoot ? await readContextData(workspaceRoot) : null;

    this.view.webview.html = buildWebviewHtml(data);
  }

  private async handleMessage(action: string | undefined): Promise<void> {
    switch (action) {
      case "scan":
        await executeCliCommandWithFeedback("scan");
        await this.refresh();
        return;
      case "update":
        await executeCliCommandWithFeedback("update");
        await this.refresh();
        return;
      case "doctor":
        await executeCliCommandWithFeedback("doctor");
        return;
      case "copyPrompt":
        await this.copyPrompt();
        return;
      case "refresh":
        await this.refresh();
        return;
      default:
        return;
    }
  }

  private async copyPrompt(): Promise<void> {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) return;

    const data = await readContextData(workspaceRoot);
    if (!data) {
      notifyError('.ai-context ainda não existe. Rode "Scan" primeiro.');
      return;
    }

    await vscode.env.clipboard.writeText(buildProjectPrompt(data));
    notifyInfo("Prompt do projeto copiado para a área de transferência.");
  }
}
