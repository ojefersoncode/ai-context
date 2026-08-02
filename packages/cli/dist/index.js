#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";

// src/config/constants.ts
var OUTPUT_DIR_NAME = ".ai-context";
var OUTPUT_FILES = {
  project: "project.json",
  tree: "tree.json",
  components: "components.json",
  routes: "routes.json",
  styles: "styles.json",
  stack: "stack.json",
  hashes: "hashes.json",
  prompt: "prompt.md",
  manifest: "manifest.json"
};
var CLI_VERSION = "0.0.1";
var DEFAULT_IGNORE_PATTERNS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/.nuxt/**",
  "**/.output/**",
  "**/out/**",
  "**/coverage/**",
  `**/${OUTPUT_DIR_NAME}/**`,
  "**/.turbo/**",
  "**/.vercel/**"
];
var CODE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
var DEFAULT_PROMPT_MD = `# Regras para IA

Escreva aqui suas prefer\xEAncias e conven\xE7\xF5es para que modelos de IA sigam
ao trabalhar neste projeto. Este arquivo \xE9 preservado entre execu\xE7\xF5es de
\`ai-context update\`.

Exemplos:

- Sempre utilize TypeScript.
- Sempre criar componentes funcionais.
- Nunca utilize Bootstrap.
`;

// src/scanner/file-walker.ts
import fg from "fast-glob";
import ignore from "ignore";
import { readFile as readFile2 } from "fs/promises";
import path2 from "path";

// src/utils/fs.ts
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}
function pathExists(targetPath) {
  return existsSync(targetPath);
}
async function readJsonSafe(filePath) {
  if (!pathExists(filePath)) {
    return null;
  }
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
async function writeJsonPretty(filePath, data) {
  await ensureDir(path.dirname(filePath));
  const content = `${JSON.stringify(data, null, 2)}
`;
  await writeFile(filePath, content, "utf-8");
}
async function writeTextIfAbsent(filePath, content) {
  if (pathExists(filePath)) {
    return false;
  }
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, "utf-8");
  return true;
}
async function removeDir(dirPath) {
  await rm(dirPath, { recursive: true, force: true });
}

// src/scanner/file-walker.ts
async function walkProjectFiles(rootDir) {
  const ig = ignore();
  ig.add(DEFAULT_IGNORE_PATTERNS.map((p) => p.replace(/^\*\*\//, "").replace(/\/\*\*$/, "")));
  const gitignorePath = path2.join(rootDir, ".gitignore");
  if (pathExists(gitignorePath)) {
    const gitignoreContent = await readFile2(gitignorePath, "utf-8");
    ig.add(gitignoreContent);
  }
  const allPaths = await fg("**/*", {
    cwd: rootDir,
    dot: false,
    onlyFiles: true,
    ignore: DEFAULT_IGNORE_PATTERNS,
    followSymbolicLinks: false
  });
  const filtered = allPaths.filter((relativePath) => !ig.ignores(relativePath));
  return filtered.map((relativePath) => ({
    relativePath,
    absolutePath: path2.join(rootDir, relativePath)
  }));
}

// src/scanner/package-json-reader.ts
import path3 from "path";
async function readRootPackageJson(rootDir) {
  return readJsonSafe(path3.join(rootDir, "package.json"));
}
function getAllDependencies(pkg) {
  return { ...pkg.dependencies, ...pkg.devDependencies };
}
function hasDependency(pkg, name) {
  return name in getAllDependencies(pkg);
}

// src/scanner/database-detector.ts
var DATABASE_CHECKS = [
  { database: "prisma", dependency: "@prisma/client" },
  { database: "supabase", dependency: "@supabase/supabase-js" },
  { database: "drizzle", dependency: "drizzle-orm" },
  { database: "mongodb", dependency: "mongodb" },
  { database: "postgresql", dependency: "pg" }
];
function detectDatabases(pkg) {
  if (!pkg) return [];
  return DATABASE_CHECKS.filter(
    (check) => hasDependency(pkg, check.dependency)
  ).map((check) => check.database);
}

// src/scanner/framework-detector.ts
var FRAMEWORK_CHECKS = [
  { framework: "next", dependency: "next" },
  { framework: "nuxt", dependency: "nuxt" },
  { framework: "angular", dependency: "@angular/core" },
  { framework: "svelte", dependency: "svelte" },
  { framework: "astro", dependency: "astro" },
  { framework: "vue", dependency: "vue" },
  { framework: "react", dependency: "react" }
];
function detectFramework(pkg) {
  if (!pkg) return "unknown";
  for (const check of FRAMEWORK_CHECKS) {
    if (hasDependency(pkg, check.dependency)) {
      return check.framework;
    }
  }
  return "unknown";
}

// src/scanner/infra-detector.ts
import path4 from "path";
function detectDocker(rootDir) {
  return pathExists(path4.join(rootDir, "Dockerfile")) || pathExists(path4.join(rootDir, "docker-compose.yml")) || pathExists(path4.join(rootDir, "docker-compose.yaml"));
}
function detectCI(rootDir) {
  return pathExists(path4.join(rootDir, ".github", "workflows")) || pathExists(path4.join(rootDir, ".gitlab-ci.yml")) || pathExists(path4.join(rootDir, ".circleci", "config.yml"));
}
function detectMonorepo(rootDir, pkg) {
  if (pathExists(path4.join(rootDir, "pnpm-workspace.yaml"))) return true;
  if (pathExists(path4.join(rootDir, "turbo.json"))) return true;
  if (pathExists(path4.join(rootDir, "lerna.json"))) return true;
  if (pkg?.workspaces) return true;
  return false;
}

// src/scanner/language-detector.ts
import path5 from "path";
function detectLanguage(rootDir, files) {
  if (pathExists(path5.join(rootDir, "tsconfig.json"))) {
    return "typescript";
  }
  const hasTsFiles = files.some(
    (file) => file.relativePath.endsWith(".ts") || file.relativePath.endsWith(".tsx")
  );
  return hasTsFiles ? "typescript" : "javascript";
}

// src/scanner/package-manager-detector.ts
import path6 from "path";
function detectPackageManager(rootDir) {
  if (pathExists(path6.join(rootDir, "pnpm-lock.yaml"))) return "pnpm";
  if (pathExists(path6.join(rootDir, "bun.lockb"))) return "bun";
  if (pathExists(path6.join(rootDir, "yarn.lock"))) return "yarn";
  if (pathExists(path6.join(rootDir, "package-lock.json"))) return "npm";
  return "unknown";
}

// src/scanner/ui-library-detector.ts
import path7 from "path";
var UI_DEPENDENCY_CHECKS = [
  { library: "tailwind", dependency: "tailwindcss" },
  { library: "material-ui", dependency: "@mui/material" },
  { library: "bootstrap", dependency: "bootstrap" },
  { library: "chakra", dependency: "@chakra-ui/react" }
];
function detectUILibraries(rootDir, pkg) {
  const found = /* @__PURE__ */ new Set();
  if (pkg) {
    for (const check of UI_DEPENDENCY_CHECKS) {
      if (hasDependency(pkg, check.dependency)) {
        found.add(check.library);
      }
    }
    const hasAnyRadix = Object.keys({
      ...pkg.dependencies,
      ...pkg.devDependencies
    }).some((dep) => dep.startsWith("@radix-ui/"));
    if (hasAnyRadix) {
      found.add("radix");
    }
  }
  if (pathExists(path7.join(rootDir, "components.json"))) {
    found.add("shadcn");
  }
  return Array.from(found);
}

// src/scanner/stack-scanner.ts
async function scanStack(rootDir, files) {
  const pkg = await readRootPackageJson(rootDir);
  return {
    packageManager: detectPackageManager(rootDir),
    framework: detectFramework(pkg),
    language: detectLanguage(rootDir, files),
    databases: detectDatabases(pkg),
    uiLibraries: detectUILibraries(rootDir, pkg),
    hasDocker: detectDocker(rootDir),
    hasCI: detectCI(rootDir),
    isMonorepo: detectMonorepo(rootDir, pkg)
  };
}

// src/parser/ts-project-factory.ts
import path8 from "path";
import { Project } from "ts-morph";
function createTsMorphProject(rootDir) {
  const tsConfigPath = path8.join(rootDir, "tsconfig.json");
  if (pathExists(tsConfigPath)) {
    return new Project({
      tsConfigFilePath: tsConfigPath,
      skipAddingFilesFromTsConfig: true
    });
  }
  return new Project({
    useInMemoryFileSystem: false,
    compilerOptions: {
      allowJs: true,
      jsx: 4
    }
  });
}

// src/parser/class-parser.ts
function extractClasses(sourceFile) {
  const filePath = sourceFile.getFilePath();
  return sourceFile.getClasses().filter((cls) => Boolean(cls.getName())).map((cls) => ({
    name: cls.getName(),
    filePath,
    isExported: cls.isExported(),
    methods: cls.getMethods().map((m) => m.getName())
  }));
}

// src/parser/component-parser.ts
import { Node, SyntaxKind } from "ts-morph";
function isPascalCase(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}
function returnsJsx(node) {
  const jsxKinds = [
    SyntaxKind.JsxElement,
    SyntaxKind.JsxSelfClosingElement,
    SyntaxKind.JsxFragment
  ];
  let found = false;
  node.forEachDescendant((descendant) => {
    if (jsxKinds.includes(descendant.getKind())) {
      found = true;
    }
  });
  return found;
}
function extractPropsFromParams(params) {
  const first = params[0];
  if (!first) return [];
  const match = first.match(/\{([^}]*)\}/);
  if (!match || !match[1]) return [];
  return match[1].split(",").map((p) => p.trim().split(":")[0]?.trim() ?? "").filter(Boolean);
}
function extractComponents(sourceFile) {
  const filePath = sourceFile.getFilePath();
  const components = [];
  for (const fn of sourceFile.getFunctions()) {
    const name = fn.getName();
    if (name && isPascalCase(name) && returnsJsx(fn)) {
      components.push({
        name,
        filePath,
        isExported: fn.isExported(),
        props: extractPropsFromParams(fn.getParameters().map((p) => p.getText())),
        hooksUsed: []
      });
    }
  }
  for (const variableStatement of sourceFile.getVariableStatements()) {
    for (const declaration of variableStatement.getDeclarations()) {
      const name = declaration.getName();
      const initializer = declaration.getInitializer();
      if (name && isPascalCase(name) && initializer && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) && returnsJsx(initializer)) {
        components.push({
          name,
          filePath,
          isExported: variableStatement.isExported(),
          props: extractPropsFromParams(
            initializer.getParameters().map((p) => p.getText())
          ),
          hooksUsed: []
        });
      }
    }
  }
  return components;
}

// src/parser/export-parser.ts
function extractExports(sourceFile) {
  const filePath = sourceFile.getFilePath();
  const exportInfos = [];
  const exportedDeclarations = sourceFile.getExportedDeclarations();
  for (const [name, declarations] of exportedDeclarations) {
    for (const declaration of declarations) {
      const kindText = declaration.getKindName();
      let kind = "variable";
      if (kindText.includes("Function")) kind = "function";
      else if (kindText.includes("Class")) kind = "class";
      else if (kindText.includes("Interface")) kind = "interface";
      else if (kindText.includes("TypeAlias")) kind = "type";
      exportInfos.push({
        name: name === "default" ? "default" : name,
        filePath,
        kind: name === "default" ? "default" : kind
      });
    }
  }
  return exportInfos;
}

// src/parser/function-parser.ts
function extractFunctions(sourceFile) {
  const filePath = sourceFile.getFilePath();
  return sourceFile.getFunctions().filter((fn) => Boolean(fn.getName())).map((fn) => ({
    name: fn.getName(),
    filePath,
    isAsync: fn.isAsync(),
    isExported: fn.isExported(),
    parameters: fn.getParameters().map((p) => p.getName())
  }));
}

// src/parser/hook-parser.ts
import { Node as Node2 } from "ts-morph";
var BUILTIN_HOOKS = /* @__PURE__ */ new Set([
  "useState",
  "useEffect",
  "useContext",
  "useReducer",
  "useCallback",
  "useMemo",
  "useRef",
  "useLayoutEffect",
  "useImperativeHandle",
  "useTransition",
  "useDeferredValue",
  "useId",
  "useSyncExternalStore"
]);
function isHookName(name) {
  return /^use[A-Z]/.test(name);
}
function extractHookUsages(sourceFile) {
  const filePath = sourceFile.getFilePath();
  const hooks = [];
  const seen = /* @__PURE__ */ new Set();
  sourceFile.forEachDescendant((node) => {
    if (!Node2.isCallExpression(node)) return;
    const expression = node.getExpression();
    const name = expression.getText();
    if (isHookName(name) && !seen.has(name)) {
      seen.add(name);
      hooks.push({
        name,
        filePath,
        isCustomHook: !BUILTIN_HOOKS.has(name)
      });
    }
  });
  return hooks;
}

// src/parser/import-parser.ts
function extractImports(sourceFile) {
  const filePath = sourceFile.getFilePath();
  return sourceFile.getImportDeclarations().map((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    const isExternal = !moduleSpecifier.startsWith(".") && !moduleSpecifier.startsWith("/");
    return {
      filePath,
      moduleSpecifier,
      namedImports: importDecl.getNamedImports().map((named) => named.getName()),
      isExternal
    };
  });
}

// src/parser/interface-parser.ts
function extractInterfaces(sourceFile) {
  const filePath = sourceFile.getFilePath();
  return sourceFile.getInterfaces().map((iface) => ({
    name: iface.getName(),
    filePath,
    isExported: iface.isExported(),
    properties: iface.getProperties().map((p) => p.getName())
  }));
}

// src/analyzers/components-analyzer.ts
function isCodeFile(relativePath) {
  return CODE_EXTENSIONS.some((ext) => relativePath.endsWith(ext));
}
function analyzeComponents(project, files) {
  const codeFiles = files.filter((file) => isCodeFile(file.relativePath));
  for (const file of codeFiles) {
    if (!project.getSourceFile(file.absolutePath)) {
      project.addSourceFileAtPathIfExists(file.absolutePath);
    }
  }
  const report = {
    components: [],
    functions: [],
    classes: [],
    interfaces: [],
    exports: [],
    imports: [],
    hooks: []
  };
  for (const file of codeFiles) {
    const sourceFile = project.getSourceFile(file.absolutePath);
    if (!sourceFile) continue;
    report.components.push(...extractComponents(sourceFile));
    report.functions.push(...extractFunctions(sourceFile));
    report.classes.push(...extractClasses(sourceFile));
    report.interfaces.push(...extractInterfaces(sourceFile));
    report.exports.push(...extractExports(sourceFile));
    report.imports.push(...extractImports(sourceFile));
    report.hooks.push(...extractHookUsages(sourceFile));
  }
  return report;
}

// src/analyzers/tree-analyzer.ts
function buildTree(rootName, files) {
  const root = { name: rootName, type: "directory", children: [] };
  for (const file of files) {
    const segments = file.relativePath.split("/");
    let currentNode = root;
    segments.forEach((segment, index) => {
      const isFile = index === segments.length - 1;
      currentNode.children ??= [];
      let child = currentNode.children.find((c) => c.name === segment);
      if (!child) {
        child = isFile ? { name: segment, type: "file" } : { name: segment, type: "directory", children: [] };
        currentNode.children.push(child);
      }
      currentNode = child;
    });
  }
  sortTree(root);
  return root;
}
function sortTree(node) {
  if (!node.children) return;
  node.children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  for (const child of node.children) {
    sortTree(child);
  }
}

// src/utils/hash.ts
import { createHash } from "crypto";
import { readFile as readFile3 } from "fs/promises";
async function hashFile(absolutePath) {
  const content = await readFile3(absolutePath);
  return createHash("sha256").update(content).digest("hex");
}

// src/analyzers/hash-analyzer.ts
async function computeFileHashes(files) {
  const entries = await Promise.all(
    files.map(async (file) => ({
      filePath: file.relativePath,
      hash: await hashFile(file.absolutePath)
    }))
  );
  return entries.sort((a, b) => a.filePath.localeCompare(b.filePath));
}
function diffHashes(previous, current) {
  const previousMap = new Map(previous.map((e) => [e.filePath, e.hash]));
  const currentMap = new Map(current.map((e) => [e.filePath, e.hash]));
  const added = [];
  const modified = [];
  const removed = [];
  for (const [filePath, hash] of currentMap) {
    const previousHash = previousMap.get(filePath);
    if (previousHash === void 0) {
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

// src/parser/route-parser.ts
var APP_ROUTE_FILES = /* @__PURE__ */ new Set([
  "page.tsx",
  "page.ts",
  "page.jsx",
  "page.js",
  "route.ts",
  "route.js"
]);
function toRoutePath(segments) {
  const cleaned = segments.filter((segment) => !(segment.startsWith("(") && segment.endsWith(")"))).map((segment) => {
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
function discoverRoutes(files) {
  const routes = [];
  for (const file of files) {
    const parts = file.relativePath.split("/");
    const fileName = parts[parts.length - 1] ?? "";
    const appIndex = parts.indexOf("app");
    if (appIndex !== -1 && APP_ROUTE_FILES.has(fileName)) {
      const segments = parts.slice(appIndex + 1, -1);
      routes.push({
        routePath: toRoutePath(segments),
        filePath: file.relativePath,
        routerType: "app"
      });
      continue;
    }
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
        routerType: "pages"
      });
    }
  }
  return routes;
}

// src/core/use-cases/scan-project.use-case.ts
import path9 from "path";
async function scanProject(rootDir, writer) {
  const startedAt = Date.now();
  const files = await walkProjectFiles(rootDir);
  const stack = await scanStack(rootDir, files);
  const tree = buildTree(path9.basename(rootDir), files);
  const routes = discoverRoutes(files);
  const hashes = await computeFileHashes(files);
  const project = createTsMorphProject(rootDir);
  const components = analyzeComponents(project, files);
  const durationMs = Date.now() - startedAt;
  const context = {
    rootDir,
    files,
    stack,
    tree,
    components,
    routes,
    hashes,
    manifest: {
      version: CLI_VERSION,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      scanDurationMs: durationMs,
      fileCount: files.length,
      framework: stack.framework,
      plugins: []
    }
  };
  await writer.writeAll(context);
  return { context, durationMs };
}

// src/core/use-cases/init-project.use-case.ts
async function initProject(rootDir, writer) {
  if (writer.exists()) {
    return { alreadyInitialized: true };
  }
  const scanResult = await scanProject(rootDir, writer);
  return { alreadyInitialized: false, scanResult };
}

// src/writers/file-system-output-writer.ts
import path10 from "path";
var FileSystemOutputWriter = class {
  outputDir;
  constructor(rootDir) {
    this.outputDir = path10.join(rootDir, OUTPUT_DIR_NAME);
  }
  exists() {
    return pathExists(this.outputDir);
  }
  async readExistingHashes() {
    return readJsonSafe(
      path10.join(this.outputDir, OUTPUT_FILES.hashes)
    );
  }
  async readExistingComponents() {
    return readJsonSafe(
      path10.join(this.outputDir, OUTPUT_FILES.components)
    );
  }
  async clean() {
    await removeDir(this.outputDir);
  }
  async writeAll(context) {
    const projectSummary = {
      rootDir: context.rootDir,
      fileCount: context.files.length,
      framework: context.stack.framework,
      language: context.stack.language,
      packageManager: context.stack.packageManager,
      isMonorepo: context.stack.isMonorepo,
      generatedAt: context.manifest.generatedAt
    };
    const stylesSummary = {
      uiLibraries: context.stack.uiLibraries
    };
    await Promise.all([
      writeJsonPretty(this.pathFor("project"), projectSummary),
      writeJsonPretty(this.pathFor("tree"), context.tree),
      writeJsonPretty(this.pathFor("components"), context.components),
      writeJsonPretty(this.pathFor("routes"), context.routes),
      writeJsonPretty(this.pathFor("styles"), stylesSummary),
      writeJsonPretty(this.pathFor("stack"), context.stack),
      writeJsonPretty(this.pathFor("hashes"), context.hashes),
      writeJsonPretty(this.pathFor("manifest"), context.manifest),
      writeTextIfAbsent(this.pathFor("prompt"), DEFAULT_PROMPT_MD)
    ]);
  }
  pathFor(key) {
    return path10.join(this.outputDir, OUTPUT_FILES[key]);
  }
};

// src/utils/logger.ts
var PREFIX = "ai-context";
var logger = {
  info(message) {
    console.log(`[${PREFIX}] ${message}`);
  },
  success(message) {
    console.log(`[${PREFIX}] \u2714 ${message}`);
  },
  warn(message) {
    console.warn(`[${PREFIX}] \u26A0 ${message}`);
  },
  error(message) {
    console.error(`[${PREFIX}] \u2716 ${message}`);
  }
};

// src/commands/init.ts
function registerInitCommand(program2) {
  program2.command("init").description("Inicializa o .ai-context no projeto atual").action(async () => {
    const rootDir = process.cwd();
    const writer = new FileSystemOutputWriter(rootDir);
    const result = await initProject(rootDir, writer);
    if (result.alreadyInitialized) {
      logger.warn(".ai-context j\xE1 existe. Use `ai-context update` ou `ai-context scan`.");
      return;
    }
    logger.success(
      `.ai-context criado em ${result.scanResult?.durationMs}ms (${result.scanResult?.context.files.length} arquivos)`
    );
  });
}

// src/commands/scan.ts
function registerScanCommand(program2) {
  program2.command("scan").description("Escaneia o projeto e gera todos os arquivos do .ai-context").action(async () => {
    const rootDir = process.cwd();
    const writer = new FileSystemOutputWriter(rootDir);
    const { context, durationMs } = await scanProject(rootDir, writer);
    logger.success(`scan conclu\xEDdo em ${durationMs}ms`);
    logger.info(`arquivos analisados: ${context.files.length}`);
    logger.info(`framework detectado: ${context.stack.framework}`);
    logger.info(`componentes encontrados: ${context.components.components.length}`);
    logger.info(`rotas encontradas: ${context.routes.length}`);
  });
}

// src/core/use-cases/update-project.use-case.ts
import path11 from "path";
async function updateProject(rootDir, writer) {
  const previousHashes = await writer.readExistingHashes();
  const previousComponents = await writer.readExistingComponents();
  if (!previousHashes || !previousComponents) {
    const result = await scanProject(rootDir, writer);
    return {
      ranFullScan: true,
      hadChanges: true,
      changedFiles: { added: [], modified: [], removed: [] },
      result
    };
  }
  const startedAt = Date.now();
  const files = await walkProjectFiles(rootDir);
  const currentHashes = await computeFileHashes(files);
  const changedFiles = diffHashes(previousHashes, currentHashes);
  const hasChanges = changedFiles.added.length > 0 || changedFiles.modified.length > 0 || changedFiles.removed.length > 0;
  if (!hasChanges) {
    return {
      ranFullScan: false,
      hadChanges: false,
      changedFiles
    };
  }
  const stack = await scanStack(rootDir, files);
  const tree = buildTree(path11.basename(rootDir), files);
  const routes = discoverRoutes(files);
  const filesToReparse = files.filter(
    (file) => changedFiles.added.includes(file.relativePath) || changedFiles.modified.includes(file.relativePath)
  );
  const project = createTsMorphProject(rootDir);
  const freshReport = analyzeComponents(project, filesToReparse);
  const touchedPaths = /* @__PURE__ */ new Set([
    ...changedFiles.added,
    ...changedFiles.modified,
    ...changedFiles.removed
  ]);
  const mergedComponents = mergeComponentsReport(
    previousComponents,
    freshReport,
    touchedPaths,
    rootDir
  );
  const durationMs = Date.now() - startedAt;
  const context = {
    rootDir,
    files,
    stack,
    tree,
    components: mergedComponents,
    routes,
    hashes: currentHashes,
    manifest: {
      version: CLI_VERSION,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      scanDurationMs: durationMs,
      fileCount: files.length,
      framework: stack.framework,
      plugins: []
    }
  };
  await writer.writeAll(context);
  return {
    ranFullScan: false,
    hadChanges: true,
    changedFiles,
    result: { context, durationMs }
  };
}
function mergeComponentsReport(previous, fresh, touchedRelativePaths, rootDir) {
  const isTouched = (absoluteFilePath) => {
    const relative = path11.relative(rootDir, absoluteFilePath);
    return touchedRelativePaths.has(relative);
  };
  const keep = (items) => items.filter((item) => !isTouched(item.filePath));
  return {
    components: [...keep(previous.components), ...fresh.components],
    functions: [...keep(previous.functions), ...fresh.functions],
    classes: [...keep(previous.classes), ...fresh.classes],
    interfaces: [...keep(previous.interfaces), ...fresh.interfaces],
    exports: [...keep(previous.exports), ...fresh.exports],
    imports: [...keep(previous.imports), ...fresh.imports],
    hooks: [...keep(previous.hooks), ...fresh.hooks]
  };
}

// src/commands/update.ts
function registerUpdateCommand(program2) {
  program2.command("update").description("Atualiza apenas os arquivos modificados desde o \xFAltimo scan").action(async () => {
    const rootDir = process.cwd();
    const writer = new FileSystemOutputWriter(rootDir);
    const result = await updateProject(rootDir, writer);
    if (result.ranFullScan) {
      logger.info("nenhum estado anterior encontrado, rodando scan completo");
      logger.success(`scan conclu\xEDdo em ${result.result?.durationMs}ms`);
      return;
    }
    if (!result.hadChanges) {
      logger.success("nenhuma mudan\xE7a detectada, .ai-context j\xE1 est\xE1 atualizado");
      return;
    }
    const { added, modified, removed } = result.changedFiles;
    logger.success(`update conclu\xEDdo em ${result.result?.durationMs}ms`);
    logger.info(`${added.length} adicionado(s), ${modified.length} modificado(s), ${removed.length} removido(s)`);
  });
}

// src/core/use-cases/clean-project.use-case.ts
async function cleanProject(writer) {
  const existed = writer.exists();
  if (existed) {
    await writer.clean();
  }
  return { existed };
}

// src/commands/clean.ts
function registerCleanCommand(program2) {
  program2.command("clean").description("Remove o diret\xF3rio .ai-context").action(async () => {
    const rootDir = process.cwd();
    const writer = new FileSystemOutputWriter(rootDir);
    const result = await cleanProject(writer);
    if (!result.existed) {
      logger.warn(".ai-context n\xE3o existe, nada para remover");
      return;
    }
    logger.success(".ai-context removido");
  });
}

// src/core/use-cases/doctor-project.use-case.ts
import path12 from "path";
async function runDoctor(rootDir, writer) {
  const checks = [];
  const nodeMajorVersion = Number(process.versions.node.split(".")[0]);
  checks.push({
    label: "Vers\xE3o do Node.js >= 18",
    ok: nodeMajorVersion >= 18,
    detail: `detectado: v${process.versions.node}`
  });
  const initialized = writer.exists();
  checks.push(
    initialized ? { label: `${OUTPUT_DIR_NAME} existe`, ok: true } : {
      label: `${OUTPUT_DIR_NAME} existe`,
      ok: false,
      detail: "rode `ai-context init` ou `ai-context scan`"
    }
  );
  if (!initialized) {
    return { checks, healthy: false };
  }
  const outputDir = path12.join(rootDir, OUTPUT_DIR_NAME);
  for (const [key, fileName] of Object.entries(OUTPUT_FILES)) {
    const filePath = path12.join(outputDir, fileName);
    checks.push({
      label: `arquivo ${fileName} presente`,
      ok: pathExists(filePath)
    });
    void key;
  }
  const previousHashes = await writer.readExistingHashes();
  if (previousHashes) {
    const files = await walkProjectFiles(rootDir);
    const currentHashes = await computeFileHashes(files);
    const diff = diffHashes(previousHashes, currentHashes);
    const inSync = diff.added.length === 0 && diff.modified.length === 0 && diff.removed.length === 0;
    checks.push(
      inSync ? { label: "Contexto sincronizado com o c\xF3digo atual", ok: true } : {
        label: "Contexto sincronizado com o c\xF3digo atual",
        ok: false,
        detail: `${diff.added.length} novo(s), ${diff.modified.length} modificado(s), ${diff.removed.length} removido(s) \u2014 rode \`ai-context update\``
      }
    );
  }
  const healthy = checks.every((check) => check.ok);
  return { checks, healthy };
}

// src/commands/doctor.ts
function registerDoctorCommand(program2) {
  program2.command("doctor").description("Verifica a integridade do .ai-context e do ambiente").action(async () => {
    const rootDir = process.cwd();
    const writer = new FileSystemOutputWriter(rootDir);
    const report = await runDoctor(rootDir, writer);
    for (const check of report.checks) {
      const line = check.detail ? `${check.label} \u2014 ${check.detail}` : check.label;
      if (check.ok) {
        logger.success(line);
      } else {
        logger.error(line);
      }
    }
    if (!report.healthy) {
      process.exitCode = 1;
    }
  });
}

// src/index.ts
var program = new Command();
program.name("ai-context").description(
  "Gera e mant\xE9m o diret\xF3rio .ai-context: um contexto estruturado do seu projeto para modelos de IA."
).version("0.0.1");
registerInitCommand(program);
registerScanCommand(program);
registerUpdateCommand(program);
registerCleanCommand(program);
registerDoctorCommand(program);
program.parseAsync(process.argv).catch((error) => {
  console.error("Erro inesperado:", error);
  process.exitCode = 1;
});
//# sourceMappingURL=index.js.map