import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export function pathExists(targetPath: string): boolean {
  return existsSync(targetPath);
}

export async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  if (!pathExists(filePath)) {
    return null;
  }
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJsonPretty(
  filePath: string,
  data: unknown
): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const content = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(filePath, content, "utf-8");
}

export async function writeTextIfAbsent(
  filePath: string,
  content: string
): Promise<boolean> {
  if (pathExists(filePath)) {
    return false;
  }
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, "utf-8");
  return true;
}

export async function removeDir(dirPath: string): Promise<void> {
  await rm(dirPath, { recursive: true, force: true });
}
