import path from "node:path";
import { pathExists } from "../utils/fs.js";
import type { Language, ScannedFile } from "../types/index.js";

export function detectLanguage(
  rootDir: string,
  files: ScannedFile[]
): Language {
  if (pathExists(path.join(rootDir, "tsconfig.json"))) {
    return "typescript";
  }

  const hasTsFiles = files.some(
    (file) =>
      file.relativePath.endsWith(".ts") || file.relativePath.endsWith(".tsx")
  );

  return hasTsFiles ? "typescript" : "javascript";
}
