import type { ComponentType } from 'react'
import { render } from 'react-email'

export function renderTemplate<Props extends object>(Template: ComponentType<Props>) {
  return async (props: Props) => {
    const element = <Template {...props} />
    const [html, text] = await Promise.all([render(element), render(element, { plainText: true })])

    return { html, text }
  }
}
