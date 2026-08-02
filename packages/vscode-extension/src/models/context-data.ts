export interface StackData {
  packageManager: string;
  framework: string;
  language: string;
  databases: string[];
  uiLibraries: string[];
  hasDocker: boolean;
  hasCI: boolean;
  isMonorepo: boolean;
}

export interface ManifestData {
  version: string;
  generatedAt: string;
  scanDurationMs: number;
  fileCount: number;
  framework: string;
  plugins: string[];
}

export interface RouteData {
  routePath: string;
  filePath: string;
  routerType: string;
}

export interface ComponentsReportData {
  components: unknown[];
  functions: unknown[];
  classes: unknown[];
  interfaces: unknown[];
  exports: unknown[];
  imports: unknown[];
  hooks: unknown[];
}

export interface RecentFile {
  relativePath: string;
  modifiedAt: number;
}

export interface ContextData {
  stack: StackData;
  manifest: ManifestData;
  routes: RouteData[];
  components: ComponentsReportData;
  recentFiles: RecentFile[];
}
