import type { ContextData } from "../models/context-data.js";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderBadges(items: string[]): string {
  if (items.length === 0) return '<span class="muted">nenhum</span>';
  return items
    .map((item) => `<span class="badge">${escapeHtml(item)}</span>`)
    .join(" ");
}

function renderEmptyState(): string {
  return `
    <div class="empty-state">
      <p>Este projeto ainda não possui <code>.ai-context</code>.</p>
      <button id="btn-scan">Gerar agora</button>
    </div>
  `;
}

function renderContent(data: ContextData): string {
  const generatedAt = new Date(data.manifest.generatedAt).toLocaleString();
  const recentFilesHtml =
    data.recentFiles.length > 0
      ? data.recentFiles
          .map((f) => `<li>${escapeHtml(f.relativePath)}</li>`)
          .join("")
      : '<li class="muted">nenhum registro</li>';

  const routesHtml =
    data.routes.length > 0
      ? data.routes
          .slice(0, 15)
          .map((r) => `<li><code>${escapeHtml(r.routePath)}</code></li>`)
          .join("")
      : '<li class="muted">nenhuma rota encontrada</li>';

  return `
    <section>
      <h3>Stack</h3>
      <div class="row"><span>Framework</span><strong>${escapeHtml(data.stack.framework)}</strong></div>
      <div class="row"><span>Linguagem</span><strong>${escapeHtml(data.stack.language)}</strong></div>
      <div class="row"><span>Gerenciador</span><strong>${escapeHtml(data.stack.packageManager)}</strong></div>
      <div class="row"><span>Monorepo</span><strong>${data.stack.isMonorepo ? "sim" : "não"}</strong></div>
    </section>

    <section>
      <h3>Banco de dados</h3>
      <div>${renderBadges(data.stack.databases)}</div>
    </section>

    <section>
      <h3>UI</h3>
      <div>${renderBadges(data.stack.uiLibraries)}</div>
    </section>

    <section>
      <h3>Estatísticas</h3>
      <div class="row"><span>Arquivos analisados</span><strong>${data.manifest.fileCount}</strong></div>
      <div class="row"><span>Componentes</span><strong>${data.components.components.length}</strong></div>
      <div class="row"><span>Funções</span><strong>${data.components.functions.length}</strong></div>
      <div class="row"><span>Hooks customizados</span><strong>${data.components.hooks.length}</strong></div>
    </section>

    <section>
      <h3>Rotas (${data.routes.length})</h3>
      <ul>${routesHtml}</ul>
    </section>

    <section>
      <h3>Arquivos recentemente alterados</h3>
      <ul>${recentFilesHtml}</ul>
    </section>

    <section>
      <h3>Última atualização</h3>
      <div class="row"><span>Gerado em</span><strong>${escapeHtml(generatedAt)}</strong></div>
      <div class="row"><span>Duração do scan</span><strong>${data.manifest.scanDurationMs}ms</strong></div>
    </section>
  `;
}

export function buildWebviewHtml(data: ContextData | null): string {
  const body = data ? renderContent(data) : renderEmptyState();

  return /* html */ `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />
<style>
  body {
    font-family: var(--vscode-font-family);
    color: var(--vscode-foreground);
    padding: 8px 12px;
    font-size: 13px;
  }
  h3 {
    margin: 16px 0 6px 0;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--vscode-descriptionForeground);
  }
  section:first-child h3 { margin-top: 0; }
  .row {
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
  }
  .row span { color: var(--vscode-descriptionForeground); }
  .badge {
    display: inline-block;
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    border-radius: 4px;
    padding: 1px 6px;
    margin: 2px 4px 2px 0;
    font-size: 11px;
  }
  .muted { color: var(--vscode-descriptionForeground); font-style: italic; }
  ul { margin: 4px 0; padding-left: 18px; }
  li { padding: 1px 0; word-break: break-all; }
  .toolbar {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }
  button {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 4px 10px;
    border-radius: 2px;
    cursor: pointer;
    font-size: 12px;
  }
  button:hover { background: var(--vscode-button-hoverBackground); }
  .empty-state { text-align: center; padding: 24px 8px; }
</style>
</head>
<body>
  <div class="toolbar">
    <button id="btn-update">Update</button>
    <button id="btn-doctor">Doctor</button>
    <button id="btn-prompt">Copiar Prompt</button>
    <button id="btn-refresh">↻</button>
  </div>

  ${body}

  <script>
    const vscode = acquireVsCodeApi();
    function bind(id, action) {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", () => vscode.postMessage({ action }));
    }
    bind("btn-scan", "scan");
    bind("btn-update", "update");
    bind("btn-doctor", "doctor");
    bind("btn-prompt", "copyPrompt");
    bind("btn-refresh", "refresh");
  </script>
</body>
</html>`;
}
