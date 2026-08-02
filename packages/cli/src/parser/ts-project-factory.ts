import path from "node:path";
import { Project } from "ts-morph";
import { pathExists } from "../utils/fs.js";

/**
 * Cria um Project do ts-morph.
 *
 * Se o projeto do usuário tiver tsconfig.json, usamos ele diretamente —
 * isso dá ao ts-morph informações de paths/aliases corretas. Caso
 * contrário (projeto JS puro), criamos um Project "solto" em memória e
 * adicionamos os arquivos manualmente.
 */
export function createTsMorphProject(rootDir: string): Project {
  const tsConfigPath = path.join(rootDir, "tsconfig.json");

  if (pathExists(tsConfigPath)) {
    return new Project({
      tsConfigFilePath: tsConfigPath,
      skipAddingFilesFromTsConfig: true,
    });
  }

  return new Project({
    useInMemoryFileSystem: false,
    compilerOptions: {
      allowJs: true,
      jsx: 4 /* ts.JsxEmit.ReactJSX */,
    },
  });
}
