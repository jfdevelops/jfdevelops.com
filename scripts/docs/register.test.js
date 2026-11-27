import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { registerLibrary, titleFromId } from './register.mjs'

const sources = {
  definition: await readFile('src/routes/docs/-utils/definition.tsx', 'utf8'),
  libraries: await readFile('src/routes/docs/-utils/libraries.ts', 'utf8'),
}
const input = {
  packageName: '@jfdevelops/new-library',
  title: 'New Library',
  description: "A library's description.",
  icon: 'PackageIcon',
  repository: 'https://github.com/jfdevelops/new-library',
  group: 'developerTools',
}

describe('registerLibrary', () => {
  it('adds the resource id, icon import and addLibrary call', () => {
    const result = registerLibrary(sources, input)

    expect(result.id).toBe('new-library')
    expect(result.definition).toContain("'skills', 'new-library']")
    expect(result.libraries).toContain('  PackageIcon,\n')
    expect(result.libraries).toContain(
      [
        'groups.developerTools.addLibrary({',
        "  packageName: '@jfdevelops/new-library',",
        "  title: 'New Library',",
        "  description: 'A library\\'s description.',",
        '  icon: PackageIcon,',
        "  repository: 'https://github.com/jfdevelops/new-library',",
        '})',
      ].join('\n'),
    )
    expect(result.libraries.indexOf('new-library')).toBeLessThan(
      result.libraries.indexOf('export const libraryGroups'),
    )
  })

  it('writes the monorepo package directory', () => {
    const result = registerLibrary(sources, { ...input, docsPackage: 'packages/core' })

    expect(result.libraries).toContain("  docs: {\n    package: 'packages/core',\n  },")
  })

  it('rejects duplicates and unknown groups', () => {
    expect(() => registerLibrary(sources, { ...input, packageName: '@jfdevelops/cli' })).toThrow(
      'already registered',
    )
    expect(() => registerLibrary(sources, { ...input, group: 'missing' })).toThrow(
      'Unknown docs group',
    )
  })

  it('derives a title from the package id', () => {
    expect(titleFromId('multi-step-form')).toBe('Multi Step Form')
  })
})
