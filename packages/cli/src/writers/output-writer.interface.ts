import type { ComponentsReport, ProjectContext } from "../types/index.js";

/**
 * Abstração do destino de saída do contexto gerado.
 *
 * Hoje a única implementação escreve em disco (.ai-context/*.json).
 * No futuro, quando existir um servidor MCP, poderemos ter um
 * `McpOutputWriter` que expõe os mesmos dados via protocolo em vez de
 * arquivos — sem que analyzers/scanner/parser precisem saber a diferença.
 */
export interface OutputWriter {
  writeAll(context: ProjectContext): Promise<void>;
  readExistingHashes(): Promise<ProjectContext["hashes"] | null>;
  readExistingComponents(): Promise<ComponentsReport | null>;
  clean(): Promise<void>;
  exists(): boolean;
}
