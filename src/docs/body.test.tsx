// @vitest-environment jsdom
// biome-ignore-all lint/security/noDangerouslySetInnerHtml: Static escaped markup fixtures test the rendering boundary.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DocBody } from './body'

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
vi.setConfig({ testTimeout: 30000 })
afterEach(cleanup)

const html =
  '<pre><code><span class="docs-type"><span class="docs-type-fallback">count</span><span class="docs-type-mount" data-type="const count: 42" data-docs="A count."></span></span></code></pre>'

describe('code type tooltip composition', () => {
  it('forwards element props and ref, and exposes type information on keyboard focus', async () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <DocBody
        ref={ref}
        data-testid="body"
        aria-label="Example"
        dangerouslySetInnerHTML={{ __html: html }}
      />,
    )
    expect(ref.current).toBe(screen.getByTestId('body'))
    expect(ref.current?.getAttribute('aria-label')).toBe('Example')
    const trigger = await screen.findByRole('button', { name: 'count' })
    act(() => trigger.focus())
    await waitFor(
      () => expect(screen.getByRole('tooltip').textContent).toContain('const count: 42'),
      { timeout: 10000 },
    )
    expect(screen.getByRole('tooltip').textContent).toContain('A count.')
  })

  it('keeps code readable without hover metadata and does not execute example content', () => {
    render(
      <DocBody
        dangerouslySetInnerHTML={{
          __html: '<pre><code>&lt;script&gt;example&lt;/script&gt;</code></pre>',
        }}
      />,
    )
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('<script>example</script>')).toBeTruthy()
    expect(document.querySelector('script')).toBeNull()
  })
})

it('opens on pointer hover without an intentional delay', () => {
  vi.useFakeTimers()

  try {
    render(<DocBody dangerouslySetInnerHTML={{ __html: html }} />)
    const trigger = screen.getByRole('button', { name: 'count' })
    fireEvent.mouseEnter(trigger)
    act(() => vi.advanceTimersByTime(0))
    expect(screen.getByRole('tooltip').textContent).toContain('const count: 42')
  } finally {
    cleanup()
    vi.useRealTimers()
  }
})
