import type { Command } from "commander";
import { runDoctor } from "../core/use-cases/doctor-project.use-case.js";
import { FileSystemOutputWriter } from "../writers/file-system-output-writer.js";
import { logger } from "../utils/logger.js";

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Verifica a integridade do .ai-context e do ambiente")
    .action(async () => {
      const rootDir = process.cwd();
      const writer = new FileSystemOutputWriter(rootDir);

      const report = await runDoctor(rootDir, writer);

      for (const check of report.checks) {
        const line = check.detail ? `${check.label} — ${check.detail}` : check.label;
        if (check.ok) {
          logger.success(line);
        } else {
          logger.error(line);
        }
      }

      if (!report.healthy) {
        process.exitCode = 1;
      }
    });
}
