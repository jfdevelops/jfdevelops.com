import { describe, expect, it } from 'vitest'
import { containedPath, validateManifest } from './collect.mjs'

function manifest() {
  return {
    schemaVersion: 2,
    library: { id: 'sample', name: 'Sample' },
    frameworks: [
      {
        id: 'react',
        path: 'framework/react',
        defaultVersion: 'v1',
        versions: [{ id: 'v1', status: 'current', path: 'framework/react/v1' }],
      },
    ],
  }
}
describe('docs contract validation', () => {
  it('accepts the generated schema and refuses unknown versions', () => {
    expect(() => validateManifest(manifest())).not.toThrow()
    expect(() => validateManifest({ ...manifest(), schemaVersion: 99 })).toThrow('schemaVersion')
  })
  it('refuses missing defaults and duplicate versions', () => {
    const invalid = manifest()
    invalid.frameworks[0].defaultVersion = 'v2'
    expect(() => validateManifest(invalid)).toThrow('default version')
    const duplicate = manifest()
    duplicate.frameworks[0].versions.push(duplicate.frameworks[0].versions[0])
    expect(() => validateManifest(duplicate)).toThrow('version')
  })
  it('refuses paths outside the public docs root', () => {
    expect(() => containedPath('/docs', '../private')).toThrow('escapes')
    expect(() => containedPath('/docs', '/private')).toThrow('escapes')
    expect(() => containedPath('/docs', 'framework/react/v1')).not.toThrow()
  })
})
