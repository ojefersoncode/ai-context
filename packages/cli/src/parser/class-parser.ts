import type { SourceFile } from "ts-morph";
import type { ClassInfo } from "../types/index.js";

export function extractClasses(sourceFile: SourceFile): ClassInfo[] {
  const filePath = sourceFile.getFilePath();

  return sourceFile
    .getClasses()
    .filter((cls) => Boolean(cls.getName()))
    .map((cls) => ({
      name: cls.getName() as string,
      filePath,
      isExported: cls.isExported(),
      methods: cls.getMethods().map((m) => m.getName()),
    }));
}
