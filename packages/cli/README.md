<p align="center">
<img src="https://raw.githubusercontent.com/ojefersoncode/ai-context/main/.github/Ai-context.webp"
width="100%" align="center">
</p>

# 🤖 AI Context CLI

![License](https://img.shields.io/badge/license-MIT-blue.svg)

Generate an AI-ready context map of your software project.

AI Context CLI analyzes your codebase locally and creates a structured `.ai-context` directory containing your project's architecture, technology stack, file structure, components, routes, dependencies and source organization.

Designed to help AI assistants like ChatGPT, Claude, Cursor, GitHub Copilot and other coding agents understand your project faster while reducing unnecessary context and token usage.

---

## Installation

Install globally:

```bash
npm install -g @ojefersoncode/ai-context-cli
```

---

## Quick Start

Navigate to your project:

```bash
cd your-project
```

Generate your project context:

```bash
npx @ojefersoncode/ai-context-cli
```

The CLI will analyze your project and create:

```
.ai-context/

├── manifest.json
├── project.json
├── stack.json
├── tree.json
├── components.json
├── routes.json
├── styles.json
├── hashes.json
└── prompt.md
```

---

## How it works

AI Context CLI creates a structured representation of your project.

Instead of an AI assistant reading hundreds of files, it can first understand:

- Project architecture
- Framework and libraries
- Folder organization
- Components
- Routes
- Dependencies
- Coding conventions
- Project rules

The context is generated locally and can be shared with any AI assistant.

---

## Why use AI Context CLI?

When asking AI to modify a large project, you usually need to explain:

- Where files are located
- Which technologies are being used
- How components communicate
- What architecture pattern the project follows

AI Context CLI automatically generates this information.

Benefits:

✓ Less manual explanation
✓ Lower AI token usage
✓ Faster project understanding
✓ Better AI responses
✓ Consistent project context

---

## Using with AI assistants

After generating the context:

```
.ai-context/
```

Upload the generated files or copy the content into your AI conversation.

Example:

```
I provided my project context.

Analyze the architecture and help me implement this feature.
```

The AI can now understand:

✓ Project structure
✓ Technology stack
✓ Dependencies
✓ Application organization
✓ Development rules

---

## Commands

### Generate project context

```bash
npx @ojefersoncode/ai-context-cli
```

Creates the `.ai-context` directory.

---

## Privacy

Your code is processed locally.

No project files are uploaded to external services.

AI Context CLI only reads your project to generate metadata and context files.

---

## Roadmap

Future versions will include:

- Incremental updates
- VS Code extension
- AI prompt generator
- MCP integration
- Smart file selection
- Plugin system
- Support for more frameworks

---

## License

AI Context CLI is open source software licensed under the MIT License.

You are free to:

- Use it commercially
- Modify it
- Distribute it
- Create derivative projects

See the [LICENSE](LICENSE) file for details.
