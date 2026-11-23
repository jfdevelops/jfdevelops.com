import { Popup, PopupContent, PopupTrigger } from 'fumadocs-twoslash/ui'
import { Callout } from 'fumadocs-ui/components/callout'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { Children, type ComponentProps, isValidElement, type ReactNode } from 'react'

function textContent(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }

      return isValidElement<{ children?: ReactNode }>(child)
        ? textContent(child.props.children)
        : ''
    })
    .join('')
}

function DocQuote({ children, ...props }: ComponentProps<'blockquote'>) {
  const text = textContent(children).trim()

  if (/^(Note|Tip|Warning):/.test(text)) {
    return <Callout type={text.startsWith('Warning:') ? 'warn' : 'info'}>{children}</Callout>
  }

  return <blockquote {...props}>{children}</blockquote>
}

export function getMdxComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Popup,
    PopupContent,
    PopupTrigger,
    blockquote: DocQuote,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMdxComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMdxComponents>
}

