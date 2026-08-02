# AI Context

Gera e mantém o contexto do seu projeto (`.ai-context`) para que qualquer agente de IA — GitHub Copilot, Claude, ChatGPT, Cursor, Windsurf, Cline e outros — entenda a arquitetura do código sem precisar ler centenas de arquivos.

Esta extensão é uma camada de integração fina sobre a [CLI `ai-context`](https://www.npmjs.com/package/ai-context-cli), que faz toda a análise real do projeto.

## Funcionalidades

- **AI Context: Initialize Project** — gera o `.ai-context` pela primeira vez
- **AI Context: Scan Project** — escaneia o projeto do zero
- **AI Context: Update Context** — atualiza apenas os arquivos modificados
- **AI Context: Clean Cache** — remove o `.ai-context`
- **AI Context: Doctor** — verifica integridade do contexto e do ambiente
- **AI Context: Open Context Folder** — abre o `.ai-context` no explorador de arquivos
- **AI Context: Copy Project Prompt** — copia um resumo do projeto pronto para colar em qualquer chat de IA

## Painel lateral

Um painel na Activity Bar mostra, em tempo real: framework, linguagem, banco de dados, bibliotecas de UI, componentes, rotas, arquivos recentemente alterados e a data da última atualização.

## Requisitos

- A CLI `ai-context-cli` precisa estar acessível: instalada localmente no projeto (`devDependencies`), globalmente (`npm install -g ai-context-cli`), ou apontada manualmente via a configuração `AI Context: Preferred CLI Path`.

## Configurações

| Configuração | Descrição | Padrão |
|---|---|---|
| `aiContext.autoUpdate` | Atualiza automaticamente ao detectar mudanças | `false` |
| `aiContext.updateOnSave` | Atualiza ao salvar arquivos relevantes | `false` |
| `aiContext.ignorePatterns` | Padrões extras a ignorar | `[]` |
| `aiContext.showNotifications` | Mostra notificações de progresso/resultado | `true` |
| `aiContext.preferredCliPath` | Caminho customizado do executável da CLI | `""` |
| `aiContext.autoScanOnOpen` | Sugere gerar o contexto ao abrir um projeto sem `.ai-context` | `true` |

## Licença

MIT
