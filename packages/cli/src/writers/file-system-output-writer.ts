import path from "node:path";
import { OUTPUT_DIR_NAME, OUTPUT_FILES, DEFAULT_PROMPT_MD } from "../config/constants.js";
import {
  pathExists,
  readJsonSafe,
  removeDir,
  writeJsonPretty,
  writeTextIfAbsent,
} from "../utils/fs.js";
import type { ComponentsReport, FileHashEntry, ProjectContext } from "../types/index.js";
import type { OutputWriter } from "./output-writer.interface.js";

export class FileSystemOutputWriter implements OutputWriter {
  private readonly outputDir: string;

  constructor(rootDir: string) {
    this.outputDir = path.join(rootDir, OUTPUT_DIR_NAME);
  }

  exists(): boolean {
    return pathExists(this.outputDir);
  }

  async readExistingHashes(): Promise<FileHashEntry[] | null> {
    return readJsonSafe<FileHashEntry[]>(
      path.join(this.outputDir, OUTPUT_FILES.hashes)
    );
  }

  async readExistingComponents(): Promise<ComponentsReport | null> {
    return readJsonSafe<ComponentsReport>(
      path.join(this.outputDir, OUTPUT_FILES.components)
    );
  }

  async clean(): Promise<void> {
    await removeDir(this.outputDir);
  }

  async writeAll(context: ProjectContext): Promise<void> {
    const projectSummary = {
      rootDir: context.rootDir,
      fileCount: context.files.length,
      framework: context.stack.framework,
      language: context.stack.language,
      packageManager: context.stack.packageManager,
      isMonorepo: context.stack.isMonorepo,
      generatedAt: context.manifest.generatedAt,
    };

    const stylesSummary = {
      uiLibraries: context.stack.uiLibraries,
    };

    await Promise.all([
      writeJsonPretty(this.pathFor("project"), projectSummary),
      writeJsonPretty(this.pathFor("tree"), context.tree),
      writeJsonPretty(this.pathFor("components"), context.components),
      writeJsonPretty(this.pathFor("routes"), context.routes),
      writeJsonPretty(this.pathFor("styles"), stylesSummary),
      writeJsonPretty(this.pathFor("stack"), context.stack),
      writeJsonPretty(this.pathFor("hashes"), context.hashes),
      writeJsonPretty(this.pathFor("manifest"), context.manifest),
      writeTextIfAbsent(this.pathFor("prompt"), DEFAULT_PROMPT_MD),
    ]);
  }

  private pathFor(key: keyof typeof OUTPUT_FILES): string {
    return path.join(this.outputDir, OUTPUT_FILES[key]);
  }
}
