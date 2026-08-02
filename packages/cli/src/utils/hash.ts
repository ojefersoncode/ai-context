import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export async function hashFile(absolutePath: string): Promise<string> {
  const content = await readFile(absolutePath);
  return createHash("sha256").update(content).digest("hex");
}

export function hashString(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
