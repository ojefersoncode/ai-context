import * as vscode from "vscode";
import { runCliCommand } from "../services/cli-runner.js";
import { notifyError, notifyInfo } from "../notifications/notifier.js";
import {
  setStatusBarBusy,
  setStatusBarError,
  setStatusBarIdle,
} from "../providers/status-bar.provider.js";
import type { CliCommandName, CliExecutionResult } from "../models/cli-result.js";

const PROGRESS_LABELS: Record<CliCommandName, string> = {
  init: "Inicializando AI Context...",
  scan: "Escaneando projeto...",
  update: "Atualizando AI Context...",
  clean: "Limpando AI Context...",
  doctor: "Verificando AI Context...",
};

const SUCCESS_LABELS: Record<CliCommandName, string> = {
  init: "AI Context inicializado com sucesso.",
  scan: "Scan concluído com sucesso.",
  update: "Contexto atualizado com sucesso.",
  clean: "AI Context removido.",
  doctor: "Verificação concluída. Veja o Output Channel para detalhes.",
};

export async function executeCliCommandWithFeedback(
  command: CliCommandName
): Promise<CliExecutionResult> {
  const label = PROGRESS_LABELS[command];
  setStatusBarBusy(label);

  const result = await vscode.window.withProgress<CliExecutionResult>(
    {
      location: vscode.ProgressLocation.Notification,
      title: label,
      cancellable: false,
    },
    () => runCliCommand(command)
  );

  if (result.success) {
    setStatusBarIdle();
    notifyInfo(SUCCESS_LABELS[command]);
  } else {
    setStatusBarError();
    notifyError(
      `AI Context: falha ao rodar "${command}". Veja o Output Channel "AI Context" para detalhes.`
    );
  }

  return result;
}
