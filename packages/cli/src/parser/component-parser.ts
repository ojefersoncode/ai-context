import { Node, SyntaxKind, type SourceFile } from "ts-morph";
import type { ComponentInfo } from "../types/index.js";

function isPascalCase(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function returnsJsx(node: Node): boolean {
  const jsxKinds = [
    SyntaxKind.JsxElement,
    SyntaxKind.JsxSelfClosingElement,
    SyntaxKind.JsxFragment,
  ];

  let found = false;
  node.forEachDescendant((descendant) => {
    if (jsxKinds.includes(descendant.getKind())) {
      found = true;
    }
  });
  return found;
}

function extractPropsFromParams(params: string[]): string[] {
  // Heurística simples: pega nomes entre chaves na desestruturação do
  // primeiro parâmetro, ex: `({ title, onClick }: Props)`.
  const first = params[0];
  if (!first) return [];
  const match = first.match(/\{([^}]*)\}/);
  if (!match || !match[1]) return [];
  return match[1]
    .split(",")
    .map((p) => p.trim().split(":")[0]?.trim() ?? "")
    .filter(Boolean);
}

export function extractComponents(sourceFile: SourceFile): ComponentInfo[] {
  const filePath = sourceFile.getFilePath();
  const components: ComponentInfo[] = [];

  // function Foo() { return <div /> }
  for (const fn of sourceFile.getFunctions()) {
    const name = fn.getName();
    if (name && isPascalCase(name) && returnsJsx(fn)) {
      components.push({
        name,
        filePath,
        isExported: fn.isExported(),
        props: extractPropsFromParams(fn.getParameters().map((p) => p.getText())),
        hooksUsed: [],
      });
    }
  }

  // const Foo = () => { return <div /> } ou const Foo = () => <div />
  for (const variableStatement of sourceFile.getVariableStatements()) {
    for (const declaration of variableStatement.getDeclarations()) {
      const name = declaration.getName();
      const initializer = declaration.getInitializer();

      if (
        name &&
        isPascalCase(name) &&
        initializer &&
        (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) &&
        returnsJsx(initializer)
      ) {
        components.push({
          name,
          filePath,
          isExported: variableStatement.isExported(),
          props: extractPropsFromParams(
            initializer.getParameters().map((p) => p.getText())
          ),
          hooksUsed: [],
        });
      }
    }
  }

  return components;
}
