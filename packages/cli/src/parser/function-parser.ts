import type { SourceFile } from "ts-morph";
import type { FunctionInfo } from "../types/index.js";

export function extractFunctions(sourceFile: SourceFile): FunctionInfo[] {
  const filePath = sourceFile.getFilePath();

  return sourceFile
    .getFunctions()
    .filter((fn) => Boolean(fn.getName()))
    .map((fn) => ({
      name: fn.getName() as string,
      filePath,
      isAsync: fn.isAsync(),
      isExported: fn.isExported(),
      parameters: fn.getParameters().map((p) => p.getName()),
    }));
}
