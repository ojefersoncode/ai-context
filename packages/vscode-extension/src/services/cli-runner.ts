import { execa } from "execa";
import { logToOutput } from "../utils/output-channel.js";
import { getWorkspaceRoot, resolveCliCommand } from "./cli-resolver.js";
import type { CliCommandName, CliExecutionResult } from "../models/cli-result.js";

/**
 * Executa um subcomando da CLI ai-context (ex: "scan", "doctor") no
 * diretório raiz do workspace atual. Nunca lança exceção: falhas da CLI
 * (exit code != 0) viram um CliExecutionResult com success=false, para
 * que quem chamar decida como comunicar isso ao usuário.
 */
export async function runCliCommand(
  command: CliCommandName
): Promise<CliExecutionResult> {
  const cwd = getWorkspaceRoot();
  const cliPath = resolveCliCommand();
  const startedAt = Date.now();

  logToOutput(`$ ${cliPath} ${command} (cwd: ${cwd ?? "desconhecido"})`);

  if (!cwd) {
    logToOutput("Nenhum workspace aberto. Abortando execução.");
    return {
      command,
      success: false,
      durationMs: 0,
      stdout: "",
      stderr: "Nenhuma pasta de workspace está aberta no VS Code.",
      exitCode: null,
    };
  }

  try {
    const result = await execa(cliPath, [command], { cwd, reject: false });
    const durationMs = Date.now() - startedAt;

    logToOutput(result.stdout);
    if (result.stderr) logToOutput(result.stderr);
    logToOutput(`Concluído em ${durationMs}ms (exit code: ${result.exitCode})`);

    return {
      command,
      success: result.exitCode === 0,
      durationMs,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode ?? null,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : String(error);

    logToOutput(`Erro ao executar a CLI: ${message}`);

    return {
      command,
      success: false,
      durationMs,
      stdout: "",
      stderr: message,
      exitCode: null,
    };
  }
}
