import path from "node:path";
import { CLI_VERSION } from "../../config/constants.js";
import { walkProjectFiles } from "../../scanner/file-walker.js";
import { scanStack } from "../../scanner/stack-scanner.js";
import { createTsMorphProject } from "../../parser/ts-project-factory.js";
import { analyzeComponents } from "../../analyzers/components-analyzer.js";
import { buildTree } from "../../analyzers/tree-analyzer.js";
import { computeFileHashes, diffHashes } from "../../analyzers/hash-analyzer.js";
import { discoverRoutes } from "../../parser/route-parser.js";
import type { OutputWriter } from "../../writers/output-writer.interface.js";
import type { ComponentsReport, ProjectContext, ScannedFile } from "../../types/index.js";
import { scanProject, type ScanResult } from "./scan-project.use-case.js";

export interface UpdateResult {
  ranFullScan: boolean;
  hadChanges: boolean;
  changedFiles: { added: string[]; modified: string[]; removed: string[] };
  result?: ScanResult;
}

export async function updateProject(
  rootDir: string,
  writer: OutputWriter
): Promise<UpdateResult> {
  const previousHashes = await writer.readExistingHashes();
  const previousComponents = await writer.readExistingComponents();

  // Sem estado anterior: não há o que "atualizar" incrementalmente,
  // então caímos para um scan completo.
  if (!previousHashes || !previousComponents) {
    const result = await scanProject(rootDir, writer);
    return {
      ranFullScan: true,
      hadChanges: true,
      changedFiles: { added: [], modified: [], removed: [] },
      result,
    };
  }

  const startedAt = Date.now();

  const files = await walkProjectFiles(rootDir);
  const currentHashes = await computeFileHashes(files);
  const changedFiles = diffHashes(previousHashes, currentHashes);

  const hasChanges =
    changedFiles.added.length > 0 ||
    changedFiles.modified.length > 0 ||
    changedFiles.removed.length > 0;

  if (!hasChanges) {
    return {
      ranFullScan: false,
      hadChanges: false,
      changedFiles,
    };
  }

  const stack = await scanStack(rootDir, files);
  const tree = buildTree(path.basename(rootDir), files);
  const routes = discoverRoutes(files);

  const filesToReparse: ScannedFile[] = files.filter(
    (file) =>
      changedFiles.added.includes(file.relativePath) ||
      changedFiles.modified.includes(file.relativePath)
  );

  const project = createTsMorphProject(rootDir);
  const freshReport = analyzeComponents(project, filesToReparse);

  const touchedPaths = new Set([
    ...changedFiles.added,
    ...changedFiles.modified,
    ...changedFiles.removed,
  ]);

  const mergedComponents = mergeComponentsReport(
    previousComponents,
    freshReport,
    touchedPaths,
    rootDir
  );

  const durationMs = Date.now() - startedAt;

  const context: ProjectContext = {
    rootDir,
    files,
    stack,
    tree,
    components: mergedComponents,
    routes,
    hashes: currentHashes,
    manifest: {
      version: CLI_VERSION,
      generatedAt: new Date().toISOString(),
      scanDurationMs: durationMs,
      fileCount: files.length,
      framework: stack.framework,
      plugins: [],
    },
  };

  await writer.writeAll(context);

  return {
    ranFullScan: false,
    hadChanges: true,
    changedFiles,
    result: { context, durationMs },
  };
}

/**
 * Remove do relatório anterior tudo que pertencia a arquivos tocados
 * (modificados ou removidos) e injeta os resultados recém-parseados.
 * Isso evita reparsear o projeto inteiro a cada update.
 */
function mergeComponentsReport(
  previous: ComponentsReport,
  fresh: ComponentsReport,
  touchedRelativePaths: Set<string>,
  rootDir: string
): ComponentsReport {
  const isTouched = (absoluteFilePath: string): boolean => {
    const relative = path.relative(rootDir, absoluteFilePath);
    return touchedRelativePaths.has(relative);
  };

  const keep = <T extends { filePath: string }>(items: T[]): T[] =>
    items.filter((item) => !isTouched(item.filePath));

  return {
    components: [...keep(previous.components), ...fresh.components],
    functions: [...keep(previous.functions), ...fresh.functions],
    classes: [...keep(previous.classes), ...fresh.classes],
    interfaces: [...keep(previous.interfaces), ...fresh.interfaces],
    exports: [...keep(previous.exports), ...fresh.exports],
    imports: [...keep(previous.imports), ...fresh.imports],
    hooks: [...keep(previous.hooks), ...fresh.hooks],
  };
}
