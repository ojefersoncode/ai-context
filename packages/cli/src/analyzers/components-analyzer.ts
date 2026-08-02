import type { Project } from "ts-morph";
import { CODE_EXTENSIONS } from "../config/constants.js";
import { extractClasses } from "../parser/class-parser.js";
import { extractComponents } from "../parser/component-parser.js";
import { extractExports } from "../parser/export-parser.js";
import { extractFunctions } from "../parser/function-parser.js";
import { extractHookUsages } from "../parser/hook-parser.js";
import { extractImports } from "../parser/import-parser.js";
import { extractInterfaces } from "../parser/interface-parser.js";
import type { ComponentsReport, ScannedFile } from "../types/index.js";

function isCodeFile(relativePath: string): boolean {
  return CODE_EXTENSIONS.some((ext) => relativePath.endsWith(ext));
}

export function analyzeComponents(
  project: Project,
  files: ScannedFile[]
): ComponentsReport {
  const codeFiles = files.filter((file) => isCodeFile(file.relativePath));

  for (const file of codeFiles) {
    if (!project.getSourceFile(file.absolutePath)) {
      project.addSourceFileAtPathIfExists(file.absolutePath);
    }
  }

  const report: ComponentsReport = {
    components: [],
    functions: [],
    classes: [],
    interfaces: [],
    exports: [],
    imports: [],
    hooks: [],
  };

  for (const file of codeFiles) {
    const sourceFile = project.getSourceFile(file.absolutePath);
    if (!sourceFile) continue;

    report.components.push(...extractComponents(sourceFile));
    report.functions.push(...extractFunctions(sourceFile));
    report.classes.push(...extractClasses(sourceFile));
    report.interfaces.push(...extractInterfaces(sourceFile));
    report.exports.push(...extractExports(sourceFile));
    report.imports.push(...extractImports(sourceFile));
    report.hooks.push(...extractHookUsages(sourceFile));
  }

  return report;
}
