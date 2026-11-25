// Source edits for registering a docs library. Kept pure so they can be tested.

export function packageId(packageName) {
  return packageName.slice(packageName.lastIndexOf('/') + 1)
}

export function titleFromId(id) {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function quote(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
}

function addResource(definition, id) {
  const match = /resources: \[([^\]]*)\]/.exec(definition)

  if (!match) {
    throw new Error('Could not find the docs resources list in definition.tsx')
  }

  const ids = [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1])

  if (ids.includes(id)) {
    throw new Error(`Docs library "${id}" is already registered`)
  }

  return definition.replace(match[0], `resources: [${[...ids, id].map(quote).join(', ')}]`)
}

function addIconImport(libraries, icon) {
  const match = /import \{([^}]*)\} from 'lucide-react'/.exec(libraries)

  if (!match) {
    throw new Error('Could not find the lucide-react import in libraries.ts')
  }

  const names = match[1]
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  if (names.includes(icon)) {
    return libraries
  }

  const sorted = [...names, icon].sort((left, right) =>
    left.replace(/^type /, '').localeCompare(right.replace(/^type /, '')),
  )

  return libraries.replace(match[0], `import {\n  ${sorted.join(',\n  ')},\n} from 'lucide-react'`)
}

function addLibraryCall(libraries, input) {
  const groups = [...libraries.matchAll(/\{ id: '([^']+)', title: '[^']*' \}/g)].map(
    (entry) => entry[1],
  )

  if (!groups.includes(input.group)) {
    throw new Error(`Unknown docs group "${input.group}". Use one of: ${groups.join(', ')}`)
  }

  if (libraries.includes(`packageName: ${quote(input.packageName)}`)) {
    throw new Error(`${input.packageName} is already registered`)
  }

  const anchor = 'export const libraryGroups'

  if (!libraries.includes(anchor)) {
    throw new Error('Could not find libraryGroups in libraries.ts')
  }

  const lines = [
    `groups.${input.group}.addLibrary({`,
    `  packageName: ${quote(input.packageName)},`,
    `  title: ${quote(input.title)},`,
    `  description: ${quote(input.description)},`,
    `  icon: ${input.icon},`,
    `  repository: ${quote(input.repository)},`,
  ]

  if (input.docsPackage) {
    lines.push('  docs: {', `    package: ${quote(input.docsPackage)},`, '  },')
  }

  lines.push('})', '', '')

  return libraries.replace(anchor, `${lines.join('\n')}${anchor}`)
}

/** Returns the updated `definition.tsx` and `libraries.ts` sources. */
export function registerLibrary(sources, input) {
  const id = packageId(input.packageName)

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`"${id}" is not a valid docs library id`)
  }

  return {
    id,
    definition: addResource(sources.definition, id),
    libraries: addLibraryCall(addIconImport(sources.libraries, input.icon), input),
  }
}
