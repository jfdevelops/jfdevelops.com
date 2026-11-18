import { describe, expect, it } from 'vitest'
import { getDocPage, getPackageDocs, getPackages, versionDestination } from './registry'

const pkg = getPackageDocs('react-layout')!
describe('versioned docs contract', () => {
  it('publishes one library with every manifest page in navigation order', () => {
    expect(getPackages().map((p) => p.id)).toEqual(['react-layout'])
    expect(pkg.defaultVersion).toBe('v4')
    for (const version of pkg.versions) {
      expect(pkg.pages.filter((p) => p.version === version.id).map((p) => p.pageId)).toEqual(
        version.navigation.flatMap((g) => g.pages),
      )
      for (const page of pkg.pages.filter((p) => p.version === version.id)) {
        expect(page.title).toBeTruthy()
        expect(page.html).not.toContain('<h1')
        expect([...page.html.matchAll(/<h[2-6] id="([^"]*)"/g)].map((m) => m[1])).toEqual(
          page.headings,
        )
      }
    }
  })
  it('preserves pages and only valid fragments, or explains a fallback', () => {
    const page = getDocPage(pkg.id, 'v4/guides/hosted-surfaces')!
    expect(versionDestination(pkg, page, 'v1')).toBe('/docs/react-layout/v1?missingPage=true')
    const start = getDocPage(pkg.id, 'v4/getting-started')!
    expect(versionDestination(pkg, start, 'v3', '#companion-package-versions')).toBe(
      '/docs/react-layout/v3/getting-started#companion-package-versions',
    )
    expect(versionDestination(pkg, start, 'v3', '#missing')).toBe(
      '/docs/react-layout/v3/getting-started',
    )
    expect(getDocPage(pkg.id, 'v99')).toBeNull()
    expect(getDocPage(pkg.id, 'v4/missing')).toBeNull()
  })
})
