import { librarySchema } from '../schema'

export function fixtureLibrary() {
  const versions = ['v4', 'v3', 'v1'].map((id) => ({
    id,
    label: id,
    status: id === 'v4' ? 'current' : 'previous',
    path: id,
    package: { name: '@jfdevelops/react-layout', endpointVersion: `${id.slice(1)}.0.0` },
    source: { commit: 'a'.repeat(40) },
    docsSource: { commit: 'a'.repeat(40), branch: 'main' },
    channel: 'stable',
    examples: { verification: 'typechecked' },
    navigation: [
      {
        title: 'Start',
        pages:
          id === 'v4'
            ? ['index', 'getting-started', 'guides/hosted-surfaces']
            : ['index', 'getting-started'],
      },
    ],
  }))
  const pages = versions.flatMap((version) =>
    version.navigation.flatMap((group) =>
      group.pages.map((pageId, order) => ({
        slug: `${version.id}${pageId === 'index' ? '' : `/${pageId}`}`,
        pageId,
        version: version.id,
        title: pageId === 'index' ? 'Overview' : pageId,
        description: 'A guide.',
        order,
        group: group.title,
        headings: ['companion-package-versions'],
        previous: null,
        next: null,
        content: '## Companion package versions',
        html: '<h2 id="companion-package-versions">Companion package versions</h2>',
      })),
    ),
  )

  return librarySchema.parse({
    id: 'react-layout',
    name: 'React Layout',
    description: 'Library docs.',
    defaultVersion: 'v4',
    version: '4.0.0',
    versions,
    pages,
    pageExists: Object.fromEntries(
      versions.map((version) => [
        version.id,
        pages.filter((page) => page.version === version.id).map((page) => page.pageId),
      ]),
    ),
  })
}
