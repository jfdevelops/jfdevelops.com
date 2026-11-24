import { expect, it } from 'vitest'
import { resources } from './definition'
import { docsLibraries, docsSources, getDocsLibrary, libraryGroups } from './libraries'

it('registers docs libraries through typed library groups', () => {
  expect(
    libraryGroups.map((group) => [group.title, group.libraries.map((library) => library.id)]),
  ).toEqual([
    ['Libraries', ['react-layout', 'multi-step-form', 'create-error']],
    ['Developer tools', ['cli', 'skills']],
  ])
  expect(docsLibraries.map((library) => library.packageName)).toEqual([
    '@jfdevelops/react-layout',
    '@jfdevelops/multi-step-form',
    '@jfdevelops/create-error',
    '@jfdevelops/cli',
    '@jfdevelops/skills',
  ])
  expect(docsLibraries.map((library) => library.id)).toEqual([...resources.raw()])
  expect(docsSources.libraries.map((library) => library.id)).toEqual(
    docsLibraries.map((library) => library.id),
  )
  expect(getDocsLibrary('multi-step-form')?.url).toBe('/docs/multi-step-form')
  expect(getDocsLibrary('missing')).toBeNull()
})
