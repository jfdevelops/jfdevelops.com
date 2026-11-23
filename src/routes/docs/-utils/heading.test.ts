import { createElement } from 'react'
import { expect, it } from 'vitest'
import { headingText } from '../../../../scripts/docs/serialize.mjs'

it('extracts readable heading text from inline MDX instead of object coercion', () => {
  expect(
    headingText([
      'Use ',
      createElement('code', null, 'createResourceLayout'),
      ' with ',
      createElement('strong', null, 'resources'),
    ]),
  ).toBe('Use createResourceLayout with resources')
})

