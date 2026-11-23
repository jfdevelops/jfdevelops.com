import { existsSync, readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const pointerFile = '.docs-snapshots/react-layout/current.json'
const snapshotTest = existsSync(pointerFile) ? it : it.skip

snapshotTest(
  'publishes compiler-derived component and literal resource hovers with readable headings',
  () => {
    const pointer = JSON.parse(readFileSync(pointerFile, 'utf8'))
    const page = JSON.parse(
      readFileSync(
        `.docs-snapshots/react-layout/snapshots/${pointer.revision}/pages/react/v4/guides/resource-layouts.json`,
        'utf8',
      ),
    )
    const popups = []
    function text(node) {
      if (node == null) return ''
      if (typeof node !== 'object') return String(node)
      if (Array.isArray(node)) return node.map(text).join('')
      return text(node.children)
    }
    function visit(node) {
      if (!node || typeof node !== 'object') return
      if (Array.isArray(node)) return node.forEach(visit)
      if (node.tag === 'mdx:Popup') {
        const trigger = node.children
          .flat(Infinity)
          .find((child) => child?.tag === 'mdx:PopupTrigger')
        popups.push({ label: text(trigger), content: text(node) })
      }
      visit(node.children)
    }
    visit(page.body)
    const component = popups.find((popup) => popup.label === 'UsersPage')
    const resource = popups.find((popup) => popup.label === 'resource')
    expect(component?.content).toContain('const UsersPage:')
    expect(component?.content).not.toMatch(/const UsersPage:\s*any/)
    expect(component?.content).toMatch(/Element|ResourceLayoutComponent/)
    expect(resource?.content).toContain('resource: "users"')
    expect(resource?.content).not.toContain('resource: string')
    expect(page.toc.some((heading) => heading.title === 'Create pages')).toBe(true)
    expect(page.toc.every((heading) => !heading.title.includes('[object Object]'))).toBe(true)
  },
)
