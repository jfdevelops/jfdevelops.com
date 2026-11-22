import { Fragment, isValidElement } from 'react'

// Runs only in the snapshot generator. Runtime requests consume JSON, never executable MDX.
export function serializeDocs(value) {
  if (value === undefined || value === null || typeof value === 'boolean') return null
  if (typeof value === 'string' || typeof value === 'number') return value
  if (Array.isArray(value)) return value.map(serializeDocs)
  if (!isValidElement(value)) throw new Error('Unsupported generated MDX value')
  if (value.type === Fragment) return serializeDocs(value.props.children)
  if (typeof value.type === 'function') return serializeDocs(value.type(value.props))
  if (typeof value.type !== 'string')
    throw new Error('Generated MDX contains an unsupported component')
  const props = {}
  for (const [key, input] of Object.entries(value.props)) {
    if (key === 'children' || input === undefined) continue
    if (key === 'dangerouslySetInnerHTML' || /^on/i.test(key) || typeof input === 'function')
      throw new Error('Executable props cannot be published')
    props[key] = JSON.parse(JSON.stringify(input))
  }
  return { tag: value.type, props, children: [serializeDocs(value.props.children)] }
}
