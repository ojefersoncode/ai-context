export type CliCommandName = "init" | "scan" | "update" | "clean" | "doctor";

export interface CliExecutionResult {
  command: CliCommandName;
  success: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}
