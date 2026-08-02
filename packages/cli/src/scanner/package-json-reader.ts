import path from "node:path";
import { readJsonSafe } from "../utils/fs.js";

export interface RootPackageJson {
  name?: string;
  workspaces?: string[] | { packages?: string[] };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function readRootPackageJson(
  rootDir: string
): Promise<RootPackageJson | null> {
  return readJsonSafe<RootPackageJson>(path.join(rootDir, "package.json"));
}

export function getAllDependencies(pkg: RootPackageJson): Record<string, string> {
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

export function hasDependency(pkg: RootPackageJson, name: string): boolean {
  return name in getAllDependencies(pkg);
}
