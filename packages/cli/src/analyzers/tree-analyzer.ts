import type { ScannedFile, TreeNode } from "../types/index.js";

/**
 * Constrói uma árvore de diretórios a partir da lista plana de arquivos
 * já filtrada (sem node_modules, dist, etc). Diretórios "folha" ficam com
 * children ordenados: diretórios primeiro, depois arquivos, ambos alfabéticos.
 */
export function buildTree(rootName: string, files: ScannedFile[]): TreeNode {
  const root: TreeNode = { name: rootName, type: "directory", children: [] };

  for (const file of files) {
    const segments = file.relativePath.split("/");
    let currentNode = root;

    segments.forEach((segment, index) => {
      const isFile = index === segments.length - 1;
      currentNode.children ??= [];

      let child = currentNode.children.find((c) => c.name === segment);

      if (!child) {
        child = isFile
          ? { name: segment, type: "file" }
          : { name: segment, type: "directory", children: [] };
        currentNode.children.push(child);
      }

      currentNode = child;
    });
  }

  sortTree(root);
  return root;
}

function sortTree(node: TreeNode): void {
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
