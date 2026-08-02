import type { Command } from "commander";
import { scanProject } from "../core/use-cases/scan-project.use-case.js";
import { FileSystemOutputWriter } from "../writers/file-system-output-writer.js";
import { logger } from "../utils/logger.js";

export function registerScanCommand(program: Command): void {
  program
    .command("scan")
    .description("Escaneia o projeto e gera todos os arquivos do .ai-context")
    .action(async () => {
      const rootDir = process.cwd();
      const writer = new FileSystemOutputWriter(rootDir);

      const { context, durationMs } = await scanProject(rootDir, writer);

      logger.success(`scan concluído em ${durationMs}ms`);
      logger.info(`arquivos analisados: ${context.files.length}`);
      logger.info(`framework detectado: ${context.stack.framework}`);
      logger.info(`componentes encontrados: ${context.components.components.length}`);
      logger.info(`rotas encontradas: ${context.routes.length}`);
    });
}
