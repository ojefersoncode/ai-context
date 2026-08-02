import path from "node:path";
import { pathExists } from "../utils/fs.js";
import { type RootPackageJson } from "./package-json-reader.js";

export function detectDocker(rootDir: string): boolean {
  return (
    pathExists(path.join(rootDir, "Dockerfile")) ||
    pathExists(path.join(rootDir, "docker-compose.yml")) ||
    pathExists(path.join(rootDir, "docker-compose.yaml"))
  );
}

export function detectCI(rootDir: string): boolean {
  return (
    pathExists(path.join(rootDir, ".github", "workflows")) ||
    pathExists(path.join(rootDir, ".gitlab-ci.yml")) ||
    pathExists(path.join(rootDir, ".circleci", "config.yml"))
  );
}

export function detectMonorepo(
  rootDir: string,
  pkg: RootPackageJson | null
): boolean {
  if (pathExists(path.join(rootDir, "pnpm-workspace.yaml"))) return true;
  if (pathExists(path.join(rootDir, "turbo.json"))) return true;
  if (pathExists(path.join(rootDir, "lerna.json"))) return true;
  if (pkg?.workspaces) return true;
  return false;
}
