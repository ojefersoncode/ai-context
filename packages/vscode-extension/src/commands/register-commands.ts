import * as vscode from "vscode";
import { registerCommand as registerInit } from "./init.js";
import { registerCommand as registerScan } from "./scan.js";
import { registerCommand as registerUpdate } from "./update.js";
import { registerCommand as registerClean } from "./clean.js";
import { registerCommand as registerDoctor } from "./doctor.js";
import { registerCommand as registerOpenContextFolder } from "./open-context-folder.js";
import { registerCommand as registerCopyProjectPrompt } from "./copy-project-prompt.js";

export function registerAllCommands(context: vscode.ExtensionContext): void {
  registerInit(context);
  registerScan(context);
  registerUpdate(context);
  registerClean(context);
  registerDoctor(context);
  registerOpenContextFolder(context);
  registerCopyProjectPrompt(context);
}
