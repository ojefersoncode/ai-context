# Builds do projeto AI Context

Este monorepo tem dois pacotes, cada um com seu próprio processo de build.

```
packages/
  cli/                 # CLI ai-context (publicada no npm)
  vscode-extension/    # Extensão VS Code (publicada no Marketplace/Open VSX)
```

---

## CLI (`packages/cli`)

Usa `tsup` (bundler baseado em esbuild).

### Build normal

Da raiz do monorepo:

```bash
npm run build
```

Ou direto na pasta do pacote:

```bash
cd packages/cli
npm run build
```

Gera `packages/cli/dist/index.js`, que é o arquivo importado por `bin/ai-context.js`.

### Modo watch (desenvolvimento)

Rebuilda automaticamente a cada mudança:

```bash
cd packages/cli
npm run dev
```

### Typecheck (sem gerar arquivos)

```bash
cd packages/cli
npm run typecheck
```

---

## Extensão VS Code (`packages/vscode-extension`)

Usa `esbuild` diretamente (via `esbuild.js`).

### Build de desenvolvimento

Com sourcemaps, sem minificar — bom para depurar com `F5` no VS Code:

```bash
cd packages/vscode-extension
npm run build
```

Gera `packages/vscode-extension/dist/extension.js`.

### Build de produção

Minificado, sem sourcemap — use antes de empacotar/publicar:

```bash
cd packages/vscode-extension
node esbuild.js --production
```

### Modo watch (desenvolvimento)

```bash
cd packages/vscode-extension
npm run dev
```

### Typecheck (sem gerar arquivos)

```bash
cd packages/vscode-extension
npm run typecheck
```

---

## Empacotar a extensão (`.vsix`)

Já inclui o build de produção por trás:

```bash
cd packages/vscode-extension
npx vsce package --no-dependencies
```

Ou então

```bash
cd packages/vscode-extension
npm run package
```

Gera um arquivo `ai-context-vscode-X.Y.Z.vsix` na pasta — é esse arquivo que se instala com:

```bash
code --install-extension ai-context-vscode-X.Y.Z.vsix
```

ou se publica no Marketplace (`vsce publish`) e no Open VSX (`ovsx publish`).

---

## Resumo rápido

| Comando                        | Onde rodar                  | O que gera                     | Quando usar                       |
| ------------------------------ | --------------------------- | ------------------------------ | --------------------------------- |
| `npm run build`                | raiz do monorepo            | `packages/cli/dist/`           | depois de mexer na CLI            |
| `npm run build`                | `packages/vscode-extension` | `dist/extension.js` (dev)      | testar a extensão localmente (F5) |
| `node esbuild.js --production` | `packages/vscode-extension` | `dist/extension.js` (produção) | antes de empacotar/publicar       |
| `npx vsce package`             | `packages/vscode-extension` | `.vsix`                        | empacotar pra instalar/publicar   |

---

## Publicar novas versões

### CLI (npm)

```bash
cd packages/cli
npm version patch   # ou minor / major
npm publish
```

### Extensão (VS Code Marketplace + Open VSX)

```bash
cd packages/vscode-extension
npm version patch
npx vsce package
npx vsce publish
npx ovsx publish *.vsix -p $OVSX_TOKEN
```
