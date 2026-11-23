import { fromMarkdown } from 'mdast-util-from-markdown'

export function markdownNodes(markdown) {
  const nodes = []
  function visit(node) {
    nodes.push(node)
    for (const child of node.children ?? []) visit(child)
  }
  visit(fromMarkdown(markdown))
  return nodes
}
