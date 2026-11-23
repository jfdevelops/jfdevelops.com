import { expect, it } from 'vitest'
import { getLibraryGroups } from './catalog'

it('groups the docs catalog consistently without dropping unclassified libraries', () => {
  const libraries = [
    'react-layout',
    'cli',
    'multi-step-form-core',
    'create-error',
    'skills',
    'new-library',
  ].map((slug) => ({ slug }))
  const groups = getLibraryGroups(libraries, [
    { id: 'cli', group: 'developer-tools' },
    { id: 'skills', group: 'developer-tools' },
  ])
  expect(
    groups.map((group) => [group.title, group.libraries.map((library) => library.slug)]),
  ).toEqual([
    ['Libraries', ['react-layout', 'multi-step-form-core', 'create-error', 'new-library']],
    ['Developer tools', ['cli', 'skills']],
  ])
  expect(getLibraryGroups([])).toEqual([])
})

