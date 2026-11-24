import type { MDXComponents } from 'mdx/types'
import { createElement, Fragment, type ReactNode } from 'react'
import { getMdxComponents } from '@/routes/docs/-components/mdx'
import type { RenderNode } from './snapshot'

const elements = new Set(
  'a p div span section aside blockquote h1 h2 h3 h4 h5 h6 ul ol li dl dt dd pre code em strong b i s del sup sub hr br img table thead tbody tr th td figure figcaption button details summary svg g path circle rect line polyline polygon defs linearGradient stop mask clipPath title text'.split(
    ' ',
  ),
)

export function renderDocs(
  node: RenderNode,
  components: MDXComponents = getMdxComponents(),
): ReactNode {
  if (node === null || typeof node === 'string' || typeof node === 'number') {
    return node
  }

  if (Array.isArray(node)) {
    return node.map((child, index) =>
      createElement(Fragment, { key: index }, renderDocs(child, components)),
    )
  }

  const component = node.tag.startsWith('mdx:')
    ? components[node.tag.slice(4)]
    : elements.has(node.tag)
      ? node.tag
      : undefined

  if (!component) {
    throw new Error(`Unsupported documentation component: ${node.tag}`)
  }

  const props: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(node.props)) {
    if (/^on/i.test(key) || key === 'dangerouslySetInnerHTML' || key === 'srcDoc') {
      throw new Error('Executable documentation properties are forbidden')
    }

    if (
      (key === 'href' || key === 'src') &&
      typeof value === 'string' &&
      /^(?:javascript|data|vbscript):/i.test(value.trim())
    ) {
      throw new Error('Unsafe documentation URL')
    }

    props[key] = value
  }

  return createElement(
    component as Parameters<typeof createElement>[0],
    props,
    ...node.children.map((child) => renderDocs(child, components)),
  )
}

