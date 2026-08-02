import type { OutputWriter } from "../../writers/output-writer.interface.js";

export interface CleanResult {
  existed: boolean;
}

export async function cleanProject(writer: OutputWriter): Promise<CleanResult> {
  const existed = writer.exists();
  if (existed) {
    await writer.clean();
  }
  return { existed };
}
