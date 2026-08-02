import { hashFile } from "../utils/hash.js";
import type { FileHashEntry, ScannedFile } from "../types/index.js";

export async function computeFileHashes(
  files: ScannedFile[]
): Promise<FileHashEntry[]> {
  const entries = await Promise.all(
    files.map(async (file) => ({
      filePath: file.relativePath,
      hash: await hashFile(file.absolutePath),
    }))
  );

  return entries.sort((a, b) => a.filePath.localeCompare(b.filePath));
}

/**
 * Compara hashes antigos com os novos e retorna os caminhos (relativos)
 * que foram adicionados, modificados ou removidos. É isso que permite ao
 * comando `update` reprocessar só o necessário.
 */
export function diffHashes(
  previous: FileHashEntry[],
  current: FileHashEntry[]
): { added: string[]; modified: string[]; removed: string[] } {
  const previousMap = new Map(previous.map((e) => [e.filePath, e.hash]));
  const currentMap = new Map(current.map((e) => [e.filePath, e.hash]));

  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];

  for (const [filePath, hash] of currentMap) {
    const previousHash = previousMap.get(filePath);
    if (previousHash === undefined) {
      added.push(filePath);
    } else if (previousHash !== hash) {
      modified.push(filePath);
    }
  }

  for (const filePath of previousMap.keys()) {
    if (!currentMap.has(filePath)) {
      removed.push(filePath);
    }
  }

  return { added, modified, removed };
}
