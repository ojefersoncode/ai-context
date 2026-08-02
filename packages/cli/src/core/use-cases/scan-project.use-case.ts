import { CLI_VERSION } from "../../config/constants.js";
import { walkProjectFiles } from "../../scanner/file-walker.js";
import { scanStack } from "../../scanner/stack-scanner.js";
import { createTsMorphProject } from "../../parser/ts-project-factory.js";
import { analyzeComponents } from "../../analyzers/components-analyzer.js";
import { buildTree } from "../../analyzers/tree-analyzer.js";
import { computeFileHashes } from "../../analyzers/hash-analyzer.js";
import { discoverRoutes } from "../../parser/route-parser.js";
import type { OutputWriter } from "../../writers/output-writer.interface.js";
import type { ProjectContext } from "../../types/index.js";
import path from "node:path";

export interface ScanResult {
  context: ProjectContext;
  durationMs: number;
}

export async function scanProject(
  rootDir: string,
  writer: OutputWriter
): Promise<ScanResult> {
  const startedAt = Date.now();

  const files = await walkProjectFiles(rootDir);
  const stack = await scanStack(rootDir, files);
  const tree = buildTree(path.basename(rootDir), files);
  const routes = discoverRoutes(files);
  const hashes = await computeFileHashes(files);

  const project = createTsMorphProject(rootDir);
  const components = analyzeComponents(project, files);

  const durationMs = Date.now() - startedAt;

  const context: ProjectContext = {
    rootDir,
    files,
    stack,
    tree,
    components,
    routes,
    hashes,
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

  return { context, durationMs };
}
