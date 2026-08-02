import type { SourceFile } from "ts-morph";
import type { ExportInfo } from "../types/index.js";

export function extractExports(sourceFile: SourceFile): ExportInfo[] {
  const filePath = sourceFile.getFilePath();
  const exportInfos: ExportInfo[] = [];

  const exportedDeclarations = sourceFile.getExportedDeclarations();

  for (const [name, declarations] of exportedDeclarations) {
    for (const declaration of declarations) {
      const kindText = declaration.getKindName();
      let kind: ExportInfo["kind"] = "variable";

      if (kindText.includes("Function")) kind = "function";
      else if (kindText.includes("Class")) kind = "class";
      else if (kindText.includes("Interface")) kind = "interface";
      else if (kindText.includes("TypeAlias")) kind = "type";

      exportInfos.push({
        name: name === "default" ? "default" : name,
        filePath,
        kind: name === "default" ? "default" : kind,
      });
    }
  }

  return exportInfos;
}
