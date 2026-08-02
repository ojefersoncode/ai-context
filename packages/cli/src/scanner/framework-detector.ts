import type { Framework } from "../types/index.js";
import { hasDependency, type RootPackageJson } from "./package-json-reader.js";

/**
 * Ordem importa: frameworks "filhos" (Next.js usa React por baixo) devem
 * ser checados antes dos "pais" para não classificar errado.
 */
const FRAMEWORK_CHECKS: Array<{ framework: Framework; dependency: string }> = [
  { framework: "next", dependency: "next" },
  { framework: "nuxt", dependency: "nuxt" },
  { framework: "angular", dependency: "@angular/core" },
  { framework: "svelte", dependency: "svelte" },
  { framework: "astro", dependency: "astro" },
  { framework: "vue", dependency: "vue" },
  { framework: "react", dependency: "react" },
];

export function detectFramework(pkg: RootPackageJson | null): Framework {
  if (!pkg) return "unknown";

  for (const check of FRAMEWORK_CHECKS) {
    if (hasDependency(pkg, check.dependency)) {
      return check.framework;
    }
  }

  return "unknown";
}
