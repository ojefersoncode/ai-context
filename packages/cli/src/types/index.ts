export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "unknown";

export type Framework =
  | "next"
  | "react"
  | "vue"
  | "nuxt"
  | "angular"
  | "svelte"
  | "astro"
  | "unknown";

export type Language = "typescript" | "javascript";

export type Database =
  | "prisma"
  | "supabase"
  | "drizzle"
  | "mongodb"
  | "postgresql";

export type UILibrary =
  | "tailwind"
  | "radix"
  | "shadcn"
  | "material-ui"
  | "bootstrap"
  | "chakra";

export interface StackInfo {
  packageManager: PackageManager;
  framework: Framework;
  language: Language;
  databases: Database[];
  uiLibraries: UILibrary[];
  hasDocker: boolean;
  hasCI: boolean;
  isMonorepo: boolean;
}

export interface TreeNode {
  name: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

export interface ComponentInfo {
  name: string;
  filePath: string;
  isExported: boolean;
  props: string[];
  hooksUsed: string[];
}

export interface FunctionInfo {
  name: string;
  filePath: string;
  isAsync: boolean;
  isExported: boolean;
  parameters: string[];
}

export interface ClassInfo {
  name: string;
  filePath: string;
  isExported: boolean;
  methods: string[];
}

export interface InterfaceInfo {
  name: string;
  filePath: string;
  isExported: boolean;
  properties: string[];
}

export interface ExportInfo {
  name: string;
  filePath: string;
  kind: "function" | "class" | "interface" | "variable" | "default" | "type";
}

export interface ImportInfo {
  filePath: string;
  moduleSpecifier: string;
  namedImports: string[];
  isExternal: boolean;
}

export interface HookUsageInfo {
  name: string;
  filePath: string;
  isCustomHook: boolean;
}

export interface RouteInfo {
  routePath: string;
  filePath: string;
  routerType: "app" | "pages" | "unknown";
}

export interface FileHashEntry {
  filePath: string;
  hash: string;
}

export interface ManifestInfo {
  version: string;
  generatedAt: string;
  scanDurationMs: number;
  fileCount: number;
  framework: Framework;
  plugins: string[];
}

export interface ComponentsReport {
  components: ComponentInfo[];
  functions: FunctionInfo[];
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  exports: ExportInfo[];
  imports: ImportInfo[];
  hooks: HookUsageInfo[];
}

export interface ScannedFile {
  absolutePath: string;
  relativePath: string;
}

export interface ProjectContext {
  rootDir: string;
  files: ScannedFile[];
  stack: StackInfo;
  tree: TreeNode;
  components: ComponentsReport;
  routes: RouteInfo[];
  hashes: FileHashEntry[];
  manifest: ManifestInfo;
}
