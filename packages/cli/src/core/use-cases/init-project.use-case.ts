import type { OutputWriter } from "../../writers/output-writer.interface.js";
import { scanProject, type ScanResult } from "./scan-project.use-case.js";

export interface InitResult {
  alreadyInitialized: boolean;
  scanResult?: ScanResult;
}

export async function initProject(
  rootDir: string,
  writer: OutputWriter
): Promise<InitResult> {
  if (writer.exists()) {
    return { alreadyInitialized: true };
  }

  const scanResult = await scanProject(rootDir, writer);
  return { alreadyInitialized: false, scanResult };
}
