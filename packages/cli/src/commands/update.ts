import type { Command } from "commander";
import { updateProject } from "../core/use-cases/update-project.use-case.js";
import { FileSystemOutputWriter } from "../writers/file-system-output-writer.js";
import { logger } from "../utils/logger.js";

export function registerUpdateCommand(program: Command): void {
  program
    .command("update")
    .description("Atualiza apenas os arquivos modificados desde o último scan")
    .action(async () => {
      const rootDir = process.cwd();
      const writer = new FileSystemOutputWriter(rootDir);

      const result = await updateProject(rootDir, writer);

      if (result.ranFullScan) {
        logger.info("nenhum estado anterior encontrado, rodando scan completo");
        logger.success(`scan concluído em ${result.result?.durationMs}ms`);
        return;
      }

      if (!result.hadChanges) {
        logger.success("nenhuma mudança detectada, .ai-context já está atualizado");
        return;
      }

      const { added, modified, removed } = result.changedFiles;
      logger.success(`update concluído em ${result.result?.durationMs}ms`);
      logger.info(`${added.length} adicionado(s), ${modified.length} modificado(s), ${removed.length} removido(s)`);
    });
}
