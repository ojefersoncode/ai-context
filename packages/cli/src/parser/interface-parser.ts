import type { SourceFile } from "ts-morph";
import type { InterfaceInfo } from "../types/index.js";

export function extractInterfaces(sourceFile: SourceFile): InterfaceInfo[] {
  const filePath = sourceFile.getFilePath();

  return sourceFile.getInterfaces().map((iface) => ({
    name: iface.getName(),
    filePath,
    isExported: iface.isExported(),
    properties: iface.getProperties().map((p) => p.getName()),
  }));
}
