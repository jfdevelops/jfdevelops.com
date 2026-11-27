// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it } from 'vitest'
import { createComponent, mergeProps } from './create-component'

type CardProps = {
  title: ReactNode
  tone: 'quiet' | 'loud'
  options: { compact: boolean; label: string }
  tags: string[]
}

function Card({ title, tone, options, tags }: CardProps) {
  return (
    <article data-tone={tone} data-compact={String(options.compact)}>
      <h2>{title}</h2>
      <p>{options.label}</p>
      <p>{tags.join(',')}</p>
    </article>
  )
}

afterEach(() => {
  cleanup()
})

it('deep-merges plain objects and replaces arrays and elements', () => {
  const merged = mergeProps<CardProps>(
    { options: { label: 'Override' }, tags: ['b'] },
    {
      title: <span>Default</span>,
      tone: 'quiet',
      options: { compact: true, label: 'Default' },
      tags: ['a', 'c'],
    },
  )

  expect(merged.options).toEqual({ compact: true, label: 'Override' })
  expect(merged.tags).toEqual(['b'])
  expect(merged.tone).toBe('quiet')
})

it('renders the wrapped component with defaults and caller overrides', () => {
  const QuietCard = createComponent(Card)({
    tone: 'quiet',
    options: { compact: true, label: 'Default label' },
    tags: ['docs'],
  })

  render(<QuietCard title="Hello" options={{ label: 'Custom label' }} />)

  const card = screen.getByRole('article')

  expect(card.dataset.tone).toBe('quiet')
  expect(card.dataset.compact).toBe('true')
  expect(screen.getByText('Custom label')).toBeTruthy()
  expect(screen.getByText('docs')).toBeTruthy()
  expect(QuietCard.defaults.tone).toBe('quiet')
  expect(QuietCard.displayName).toBe('Card')
})

it('ignores own __proto__ keys instead of polluting prototypes', () => {
  const props = JSON.parse('{"options":{"__proto__":{"polluted":true}}}')
  const merged = mergeProps<CardProps>(props, {
    options: { compact: false, label: 'x' },
  })

  expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  expect(merged.options.label).toBe('x')
})
