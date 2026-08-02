import type { Command } from "commander";
import { cleanProject } from "../core/use-cases/clean-project.use-case.js";
import { FileSystemOutputWriter } from "../writers/file-system-output-writer.js";
import { logger } from "../utils/logger.js";

export function registerCleanCommand(program: Command): void {
  program
    .command("clean")
    .description("Remove o diretório .ai-context")
    .action(async () => {
      const rootDir = process.cwd();
      const writer = new FileSystemOutputWriter(rootDir);

      const result = await cleanProject(writer);

      if (!result.existed) {
        logger.warn(".ai-context não existe, nada para remover");
        return;
      }

      logger.success(".ai-context removido");
    });
}
