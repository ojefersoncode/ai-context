import fg from "fast-glob";
import ignore from "ignore";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_IGNORE_PATTERNS } from "../config/constants.js";
import { pathExists } from "../utils/fs.js";
import type { ScannedFile } from "../types/index.js";

/**
 * Varre o projeto respeitando o .gitignore do usuário além dos nossos
 * próprios padrões padrão (node_modules, dist, .ai-context, etc).
 *
 * Por que fast-glob + ignore em vez de apenas fast-glob com !patterns:
 * o .gitignore pode ter regras complexas (negação, wildcards aninhados)
 * que a lib `ignore` implementa fielmente ao spec do git, enquanto
 * replicar isso manualmente em padrões de glob seria frágil.
 */
export async function walkProjectFiles(
  rootDir: string
): Promise<ScannedFile[]> {
  const ig = ignore();
  ig.add(DEFAULT_IGNORE_PATTERNS.map((p) => p.replace(/^\*\*\//, "").replace(/\/\*\*$/, "")));

  const gitignorePath = path.join(rootDir, ".gitignore");
  if (pathExists(gitignorePath)) {
    const gitignoreContent = await readFile(gitignorePath, "utf-8");
    ig.add(gitignoreContent);
  }

  const allPaths = await fg("**/*", {
    cwd: rootDir,
    dot: false,
    onlyFiles: true,
    ignore: DEFAULT_IGNORE_PATTERNS,
    followSymbolicLinks: false,
  });

  const filtered = allPaths.filter((relativePath) => !ig.ignores(relativePath));

  return filtered.map((relativePath) => ({
    relativePath,
    absolutePath: path.join(rootDir, relativePath),
  }));
}
