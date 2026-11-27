import type { Node, Root } from 'fumadocs-core/page-tree'

function collapseNode(node: Node): Node {
  if (node.type !== 'folder') {
    return node
  }

  return {
    ...node,
    defaultOpen: node.defaultOpen ?? false,
    children: node.children.map(collapseNode),
  }
}

/**
 * Closes folders without an explicit `defaultOpen`. The glass sidebar opens them by default;
 * the folder holding the current page still opens.
 */
export function collapseFolders(tree: Root) {
  return { ...tree, children: tree.children.map(collapseNode) }
}
