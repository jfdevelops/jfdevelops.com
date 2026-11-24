import {
  BrainCircuitIcon,
  CircleXIcon,
  FormIcon,
  LayoutTemplateIcon,
  type LucideIcon,
  TerminalIcon,
} from 'lucide-react'
import { type DocsPackageId, resources } from '@/routes/docs/-utils/definition'

export type DocsLibrarySource = {
  package?: string
  name?: string
}

export type DocsLibrary = {
  id: DocsPackageId
  packageName: string
  title: string
  description: string
  url: string
  icon: LucideIcon
  group: string
  repository: string
  branch: string
  docs?: DocsLibrarySource
}

export type DocsSourcesConfig = {
  snapshotRepository: string
  snapshotBranch: string
  libraries: Array<{
    id: string
    repository: string
    branch: string
    description: string
    docs?: DocsLibrarySource
  }>
}

type LibraryGroupOptions = {
  id: string
  title: string
}

type LibraryInput = {
  packageName: string
  title: string
  description: string
  icon: LucideIcon
  repository: string
  branch?: string
  docs?: DocsLibrarySource
}

type LibraryGroup<TId extends string = string> = {
  id: TId
  title: string
  libraries: DocsLibrary[]
  addLibrary: (library: LibraryInput) => void
}

type LibraryGroups<TGroups extends ReadonlyArray<LibraryGroupOptions>> = Array<
  LibraryGroup<TGroups[number]['id']>
> & {
  [GroupId in TGroups[number]['id']]: LibraryGroup<GroupId>
}

function packageIdFromName(packageName: string) {
  const slash = packageName.lastIndexOf('/')

  return slash === -1 ? packageName : packageName.slice(slash + 1)
}

function registerLibraryGroups<const TGroups extends ReadonlyArray<LibraryGroupOptions>>(
  ...groupDefs: TGroups
) {
  const groups = [] as unknown as LibraryGroups<TGroups>

  for (const def of groupDefs) {
    const group: LibraryGroup<TGroups[number]['id']> = {
      id: def.id,
      title: def.title,
      libraries: [],
      addLibrary(library) {
        const id = resources.parse(packageIdFromName(library.packageName))

        group.libraries.push({
          id,
          packageName: library.packageName,
          title: library.title,
          description: library.description,
          url: `/docs/${id}`,
          icon: library.icon,
          group: def.id,
          repository: library.repository,
          branch: library.branch ?? 'main',
          docs: library.docs,
        })
      },
    }

    groups.push(group)
    Object.assign(groups, { [def.id]: group })
  }

  return groups
}

const groups = registerLibraryGroups(
  { id: 'libraries', title: 'Libraries' },
  { id: 'developerTools', title: 'Developer tools' },
)

groups.libraries.addLibrary({
  packageName: '@jfdevelops/react-layout',
  title: 'React Layout',
  description: 'Typed resource layouts, composable page states, and reusable React page structure.',
  icon: LayoutTemplateIcon,
  repository: 'https://github.com/jfdevelops/react-layout',
})

groups.libraries.addLibrary({
  packageName: '@jfdevelops/multi-step-form',
  title: 'Multi Step Form',
  description: 'Type-safe multi-step forms, reusable definitions, and form builders.',
  icon: FormIcon,
  repository: 'https://github.com/jfdevelops/multi-step-form',
  docs: {
    package: 'packages/core',
    name: 'Multi Step Form',
  },
})

groups.libraries.addLibrary({
  packageName: '@jfdevelops/create-error',
  title: 'Create Error',
  description:
    'Strongly typed error families with configurable context, validation, and shared behavior.',
  icon: CircleXIcon,
  repository: 'https://github.com/jfdevelops/error-blueprint',
})

groups.developerTools.addLibrary({
  packageName: '@jfdevelops/cli',
  title: 'jfdevelops CLI',
  description: 'Create projects, configure shared tooling, and manage package-owned agent skills.',
  icon: TerminalIcon,
  repository: 'https://github.com/jfdevelops/cli',
})

groups.developerTools.addLibrary({
  packageName: '@jfdevelops/skills',
  title: 'Skills',
  description: 'Portable agent skills, shared conventions, and package-owned skill discovery.',
  icon: BrainCircuitIcon,
  repository: 'https://github.com/jfdevelops/skills',
})

export const libraryGroups = groups
  .map((group) => ({
    id: group.id,
    title: group.title,
    libraries: group.libraries,
  }))
  .filter((group) => group.libraries.length > 0)

export const docsLibraries = libraryGroups.flatMap((group) => group.libraries)

export const docsSources = {
  snapshotRepository: 'jfdevelops/jfdevelops.com',
  snapshotBranch: 'docs-content',
  libraries: docsLibraries.map((library) => ({
    id: library.id,
    repository: library.repository,
    branch: library.branch,
    description: library.description,
    docs: library.docs,
  })),
} satisfies DocsSourcesConfig

export function getDocsLibrary(id: string) {
  if (!resources.isResource(id)) {
    return null
  }

  return docsLibraries.find((library) => library.id === id) ?? null
}
