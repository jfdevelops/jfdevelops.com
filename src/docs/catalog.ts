import sources from '../../docs.sources.json'

type Registration = { id: string; group?: string }
const groups = [
  { id: 'libraries', title: 'Libraries' },
  { id: 'developer-tools', title: 'Developer tools' },
] as const

export function getLibraryGroups<T extends { slug: string }>(
  libraries: T[],
  registrations: readonly Registration[] = sources.libraries,
) {
  return groups
    .map((group) => ({
      ...group,
      libraries: libraries.filter((library) => {
        const registration = registrations.find((source) => source.id === library.slug)
        return (
          (registration?.group === 'developer-tools' ? 'developer-tools' : 'libraries') === group.id
        )
      }),
    }))
    .filter((group) => group.libraries.length > 0)
}
