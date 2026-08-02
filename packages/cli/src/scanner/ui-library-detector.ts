import path from "node:path";
import { pathExists } from "../utils/fs.js";
import type { UILibrary } from "../types/index.js";
import { hasDependency, type RootPackageJson } from "./package-json-reader.js";

const UI_DEPENDENCY_CHECKS: Array<{ library: UILibrary; dependency: string }> = [
  { library: "tailwind", dependency: "tailwindcss" },
  { library: "material-ui", dependency: "@mui/material" },
  { library: "bootstrap", dependency: "bootstrap" },
  { library: "chakra", dependency: "@chakra-ui/react" },
];

export function detectUILibraries(
  rootDir: string,
  pkg: RootPackageJson | null
): UILibrary[] {
  const found = new Set<UILibrary>();

  if (pkg) {
    for (const check of UI_DEPENDENCY_CHECKS) {
      if (hasDependency(pkg, check.dependency)) {
        found.add(check.library);
      }
    }

    const hasAnyRadix = Object.keys({
      ...pkg.dependencies,
      ...pkg.devDependencies,
    }).some((dep) => dep.startsWith("@radix-ui/"));

    if (hasAnyRadix) {
      found.add("radix");
    }
  }

  // shadcn/ui não é uma dependência instalada, e sim código copiado para o
  // projeto. O indicador confiável é o arquivo de configuração components.json
  // que o CLI do shadcn gera na raiz.
  if (pathExists(path.join(rootDir, "components.json"))) {
    found.add("shadcn");
  }

  return Array.from(found);
}
