import * as vscode from "vscode";

let channel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
  channel ??= vscode.window.createOutputChannel("AI Context");
  return channel;
}

export function logToOutput(message: string): void {
  const timestamp = new Date().toLocaleTimeString();
  getOutputChannel().appendLine(`[${timestamp}] ${message}`);
}
