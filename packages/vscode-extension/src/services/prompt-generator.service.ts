import type { ContextData } from "../models/context-data.js";

const FRAMEWORK_LABELS: Record<string, string> = {
  next: "Next.js",
  react: "React",
  vue: "Vue",
  nuxt: "Nuxt",
  angular: "Angular",
  svelte: "Svelte",
  astro: "Astro",
  unknown: "um framework não identificado",
};

const UI_LABELS: Record<string, string> = {
  tailwind: "Tailwind CSS",
  radix: "Radix UI",
  shadcn: "shadcn/ui",
  "material-ui": "Material UI",
  bootstrap: "Bootstrap",
  chakra: "Chakra UI",
};

const DATABASE_LABELS: Record<string, string> = {
  prisma: "Prisma",
  supabase: "Supabase",
  drizzle: "Drizzle",
  mongodb: "MongoDB",
  postgresql: "PostgreSQL",
};

function joinNatural(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0] as string;
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

/**
 * Gera um prompt de contexto geral do projeto, pronto para colar em
 * qualquer agente de IA (Copilot Chat, Claude, ChatGPT, Cursor, etc.).
 *
 * Esta é a base da funcionalidade descrita como objetivo futuro: um
 * resumo automático como "Este projeto utiliza Next.js, Tailwind CSS,
 * Radix UI e Supabase...". A extensão de recomendação de arquivos
 * específicos por tarefa (ex: "para implementar X, modifique apenas
 * esses arquivos") depende de análise semântica mais profunda e fica
 * para uma etapa futura — o comentário no final do prompt já sinaliza
 * isso para o agente de IA.
 */
export function buildProjectPrompt(data: ContextData): string {
  const frameworkLabel =
    FRAMEWORK_LABELS[data.stack.framework] ?? data.stack.framework;

  const uiLabels = data.stack.uiLibraries
    .map((lib) => UI_LABELS[lib] ?? lib)
    .filter(Boolean);

  const dbLabels = data.stack.databases
    .map((db) => DATABASE_LABELS[db] ?? db)
    .filter(Boolean);

  const lines: string[] = [];

  let intro = `Este projeto utiliza ${frameworkLabel}`;
  if (uiLabels.length > 0) intro += `, ${joinNatural(uiLabels)}`;
  if (dbLabels.length > 0) intro += ` e ${joinNatural(dbLabels)}`;
  intro += ".";
  lines.push(intro);

  lines.push(
    `A linguagem principal é ${
      data.stack.language === "typescript" ? "TypeScript" : "JavaScript"
    }, gerenciado com ${data.stack.packageManager}${
      data.stack.isMonorepo ? ", em estrutura de monorepo" : ""
    }.`
  );

  lines.push(
    `O projeto tem ${data.manifest.fileCount} arquivos analisados, com ${data.components.components.length} componentes, ${data.components.functions.length} funções e ${data.routes.length} rotas identificadas.`
  );

  if (data.routes.length > 0) {
    const sampleRoutes = data.routes.slice(0, 10).map((r) => r.routePath);
    lines.push(`Rotas conhecidas: ${sampleRoutes.join(", ")}.`);
  }

  lines.push(
    "\nUse este contexto para entender a arquitetura do projeto antes de propor mudanças. " +
      "Para instruções mais detalhadas sobre convenções de código, consulte o arquivo .ai-context/prompt.md."
  );

  return lines.join("\n");
}
