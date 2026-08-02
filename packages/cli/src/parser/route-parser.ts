import type { RouteInfo, ScannedFile } from "../types/index.js";

const APP_ROUTE_FILES = new Set([
  "page.tsx",
  "page.ts",
  "page.jsx",
  "page.js",
  "route.ts",
  "route.js",
]);

function toRoutePath(segments: string[]): string {
  const cleaned = segments
    // remove grupos de rota "(group)" — não afetam a URL
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .map((segment) => {
      // [slug] -> :slug  |  [...slug] -> *slug
      if (segment.startsWith("[...")) {
        return `*${segment.slice(4, -1)}`;
      }
      if (segment.startsWith("[")) {
        return `:${segment.slice(1, -1)}`;
      }
      return segment;
    });

  const routePath = `/${cleaned.join("/")}`;
  return routePath === "/" ? "/" : routePath.replace(/\/$/, "");
}

export function discoverRoutes(files: ScannedFile[]): RouteInfo[] {
  const routes: RouteInfo[] = [];

  for (const file of files) {
    const parts = file.relativePath.split("/");
    const fileName = parts[parts.length - 1] ?? "";

    // App Router: qualquer coisa dentro de app/, terminando em page.* ou route.*
    const appIndex = parts.indexOf("app");
    if (appIndex !== -1 && APP_ROUTE_FILES.has(fileName)) {
      const segments = parts.slice(appIndex + 1, -1);
      routes.push({
        routePath: toRoutePath(segments),
        filePath: file.relativePath,
        routerType: "app",
      });
      continue;
    }

    // Pages Router: arquivos dentro de pages/, exceto _app, _document, api/ opcionalmente incluído
    const pagesIndex = parts.indexOf("pages");
    if (pagesIndex !== -1) {
      const nameWithoutExt = fileName.replace(/\.(tsx|ts|jsx|js)$/, "");
      if (nameWithoutExt.startsWith("_")) continue;

      const segments = [...parts.slice(pagesIndex + 1, -1)];
      if (nameWithoutExt !== "index") {
        segments.push(nameWithoutExt);
      }

      routes.push({
        routePath: toRoutePath(segments),
        filePath: file.relativePath,
        routerType: "pages",
      });
    }
  }

  return routes;
}
