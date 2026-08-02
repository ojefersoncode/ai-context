import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type {
  ComponentsReportData,
  ContextData,
  ManifestData,
  RecentFile,
  RouteData,
  StackData,
} from "../models/context-data.js";

const OUTPUT_DIR = ".ai-context";
const RECENT_FILES_LIMIT = 5;

async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  if (!existsSync(filePath)) return null;
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function computeRecentFiles(
  workspaceRoot: string,
  hashes: Array<{ filePath: string }> | null
): Promise<RecentFile[]> {
  if (!hashes) return [];

  const withMtime = await Promise.all(
    hashes.map(async (entry) => {
      try {
        const stats = await stat(path.join(workspaceRoot, entry.filePath));
        return { relativePath: entry.filePath, modifiedAt: stats.mtimeMs };
      } catch {
        return null;
      }
    })
  );

  return withMtime
    .filter((entry): entry is RecentFile => entry !== null)
    .sort((a, b) => b.modifiedAt - a.modifiedAt)
    .slice(0, RECENT_FILES_LIMIT);
}

/**
 * Lê o estado atual do .ai-context. Retorna null se o diretório ainda não
 * existir (o painel deve tratar isso mostrando um call-to-action para
 * rodar o scan inicial).
 *
 * Importante: este serviço só LÊ arquivos já gerados pela CLI. Ele nunca
 * escaneia o código-fonte do projeto — essa responsabilidade é exclusiva
 * da CLI, conforme a arquitetura definida para a extensão.
 */
export async function readContextData(
  workspaceRoot: string
): Promise<ContextData | null> {
  const outputDir = path.join(workspaceRoot, OUTPUT_DIR);
  if (!existsSync(outputDir)) return null;

  const [stack, manifest, routes, components, hashes] = await Promise.all([
    readJsonSafe<StackData>(path.join(outputDir, "stack.json")),
    readJsonSafe<ManifestData>(path.join(outputDir, "manifest.json")),
    readJsonSafe<RouteData[]>(path.join(outputDir, "routes.json")),
    readJsonSafe<ComponentsReportData>(path.join(outputDir, "components.json")),
    readJsonSafe<Array<{ filePath: string }>>(path.join(outputDir, "hashes.json")),
  ]);

  if (!stack || !manifest) return null;

  const recentFiles = await computeRecentFiles(workspaceRoot, hashes);

  return {
    stack,
    manifest,
    routes: routes ?? [],
    components: components ?? {
      components: [],
      functions: [],
      classes: [],
      interfaces: [],
      exports: [],
      imports: [],
      hooks: [],
    },
    recentFiles,
  };
}
