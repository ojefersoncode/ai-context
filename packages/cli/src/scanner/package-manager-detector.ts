import path from "node:path";
import { pathExists } from "../utils/fs.js";
import type { PackageManager } from "../types/index.js";

export function detectPackageManager(rootDir: string): PackageManager {
  if (pathExists(path.join(rootDir, "pnpm-lock.yaml"))) return "pnpm";
  if (pathExists(path.join(rootDir, "bun.lockb"))) return "bun";
  if (pathExists(path.join(rootDir, "yarn.lock"))) return "yarn";
  if (pathExists(path.join(rootDir, "package-lock.json"))) return "npm";
  return "unknown";
}
