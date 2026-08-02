export const OUTPUT_DIR_NAME = ".ai-context";

export const OUTPUT_FILES = {
  project: "project.json",
  tree: "tree.json",
  components: "components.json",
  routes: "routes.json",
  styles: "styles.json",
  stack: "stack.json",
  hashes: "hashes.json",
  prompt: "prompt.md",
  manifest: "manifest.json",
} as const;

export const CLI_VERSION = "0.0.1";

/**
 * Diretórios sempre ignorados, independente do .gitignore do projeto.
 * Isso evita que o scan trave em node_modules gigantes ou em builds.
 */
export const DEFAULT_IGNORE_PATTERNS = [
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
  "**/.vercel/**",
];

export const CODE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

export const DEFAULT_PROMPT_MD = `# Regras para IA

Escreva aqui suas preferências e convenções para que modelos de IA sigam
ao trabalhar neste projeto. Este arquivo é preservado entre execuções de
\`ai-context update\`.

Exemplos:

- Sempre utilize TypeScript.
- Sempre criar componentes funcionais.
- Nunca utilize Bootstrap.
`;
