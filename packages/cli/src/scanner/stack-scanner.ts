import type { ScannedFile, StackInfo } from "../types/index.js";
import { detectDatabases } from "./database-detector.js";
import { detectFramework } from "./framework-detector.js";
import { detectDocker, detectCI, detectMonorepo } from "./infra-detector.js";
import { detectLanguage } from "./language-detector.js";
import { detectPackageManager } from "./package-manager-detector.js";
import { readRootPackageJson } from "./package-json-reader.js";
import { detectUILibraries } from "./ui-library-detector.js";

export async function scanStack(
  rootDir: string,
  files: ScannedFile[]
): Promise<StackInfo> {
  const pkg = await readRootPackageJson(rootDir);

  return {
    packageManager: detectPackageManager(rootDir),
    framework: detectFramework(pkg),
    language: detectLanguage(rootDir, files),
    databases: detectDatabases(pkg),
    uiLibraries: detectUILibraries(rootDir, pkg),
    hasDocker: detectDocker(rootDir),
    hasCI: detectCI(rootDir),
    isMonorepo: detectMonorepo(rootDir, pkg),
  };
}
