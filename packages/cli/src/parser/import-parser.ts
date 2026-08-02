import type { SourceFile } from "ts-morph";
import type { ImportInfo } from "../types/index.js";

export function extractImports(sourceFile: SourceFile): ImportInfo[] {
  const filePath = sourceFile.getFilePath();

  return sourceFile.getImportDeclarations().map((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    const isExternal =
      !moduleSpecifier.startsWith(".") && !moduleSpecifier.startsWith("/");

    return {
      filePath,
      moduleSpecifier,
      namedImports: importDecl
        .getNamedImports()
        .map((named) => named.getName()),
      isExternal,
    };
  });
}
