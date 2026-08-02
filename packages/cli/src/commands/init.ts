import type { Command } from "commander";
import { initProject } from "../core/use-cases/init-project.use-case.js";
import { FileSystemOutputWriter } from "../writers/file-system-output-writer.js";
import { logger } from "../utils/logger.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Inicializa o .ai-context no projeto atual")
    .action(async () => {
      const rootDir = process.cwd();
      const writer = new FileSystemOutputWriter(rootDir);

      const result = await initProject(rootDir, writer);

      if (result.alreadyInitialized) {
        logger.warn(".ai-context já existe. Use `ai-context update` ou `ai-context scan`.");
        return;
      }

      logger.success(
        `.ai-context criado em ${result.scanResult?.durationMs}ms (${result.scanResult?.context.files.length} arquivos)`
      );
    });
}
