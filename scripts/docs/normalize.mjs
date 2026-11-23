import { access, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { markdownNodes } from './markdown.mjs'

// Adapt Markdown-only repositories to the public-site contract in the ignored checkout.
export async function normalizeRepositoryDocs(
  checkout,
  registration,
  directory = path.join(checkout, 'docs'),
) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Symlink in repository docs: ${file}`)
    if (entry.isDirectory()) {
      await normalizeRepositoryDocs(checkout, registration, file)
      continue
    }
    if (!entry.name.endsWith('.md')) continue
    const input = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n')
    const nodes = markdownNodes(input)
    const protectedRanges = nodes
      .filter((node) => node.type === 'code' || node.type === 'inlineCode')
      .map((node) => [node.position.start.offset, node.position.end.offset])
    const edits = []
    for (const node of nodes) {
      if (node.type !== 'code' || !node.lang) continue
      let language = ['markdown', 'md'].includes(node.lang) ? 'text' : undefined
      if (
        ['bash', 'sh'].includes(node.lang) &&
        /^(?:npm (?:i|install)|pnpm add|yarn add|bun add)[^\n]*\n?$/.test(node.value)
      )
        language = node.value.split(' ')[0]
      if (!language) continue
      const start = node.position.start.offset
      const marker = /^(`{3,}|~{3,})/.exec(input.slice(start))
      if (marker)
        edits.push({
          start: start + marker[0].length,
          end: start + marker[0].length + node.lang.length,
          value: language,
        })
    }
    for (const match of input.matchAll(/\]\(([^\s)]+)\)/g)) {
      if (protectedRanges.some(([start, end]) => match.index >= start && match.index < end))
        continue
      const target = match[1]
      if (!target.startsWith('.')) continue
      const [relative, anchor] = target.split('#')
      const resolved = path.resolve(directory, relative)
      if (resolved.startsWith(path.join(checkout, 'docs') + path.sep)) continue
      if (!resolved.startsWith(checkout + path.sep))
        throw new Error(`Docs link escapes checkout: ${target}`)
      await access(resolved)
      const repoPath = path
        .relative(checkout, resolved)
        .split(path.sep)
        .map(encodeURIComponent)
        .join('/')
      const url = `${registration.repository}/blob/${registration.commit}/${repoPath}${anchor ? `#${anchor}` : ''}`
      edits.push({ start: match.index + 2, end: match.index + 2 + target.length, value: url })
    }
    let output = input
    for (const edit of edits.sort((left, right) => right.start - left.start))
      output = output.slice(0, edit.start) + edit.value + output.slice(edit.end)
    if (output !== input) await writeFile(file, output)
  }
}
