// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import ThemeToggle from '@/components/theme-toggle'
import { getInitialMode, themeInitScript } from './theme'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('uses the device preference before hydration and follows preference changes in auto mode', () => {
  let listener: (() => void) | undefined
  let dark = true
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return dark
    },
    addEventListener: (_name: string, callback: () => void) => {
      listener = callback
    },
    removeEventListener: vi.fn(),
  }))
  expect(getInitialMode()).toBe('auto')
  Function(themeInitScript)()
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  render(<ThemeToggle />)
  expect(screen.getByRole('button').textContent).toBe('Auto')
  expect(screen.getByRole('button').className).not.toContain('hover:bg-primary/80')
  expect(screen.getByRole('button').className).toContain('hover:bg-[var(--chip-bg)]')
  expect(screen.getByRole('button').className).toContain('hover:text-[var(--sea-ink)]')
  act(() => {
    dark = false
    listener?.()
  })
  expect(document.documentElement.classList.contains('light')).toBe(true)
  fireEvent.click(screen.getByRole('button'))
  expect(localStorage.getItem('theme')).toBe('light')
})

it('honors an explicit selection and still defaults to system when storage is blocked', () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  localStorage.setItem('theme', 'light')
  Function(themeInitScript)()
  expect(document.documentElement.classList.contains('light')).toBe(true)
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Blocked storage')
  })
  expect(getInitialMode()).toBe('auto')
  Function(themeInitScript)()
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})
