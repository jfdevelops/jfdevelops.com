import { access, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

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
    let output = input.replace(
      /^```(?:bash|sh)\n((?:npm (?:i|install)|pnpm add|yarn add|bun add)[^\n]*\n)```/gm,
      (_match, command) => `\`\`\`${command.split(' ')[0]}\n${command}\`\`\``,
    )
    for (const match of output.matchAll(/\]\(([^\s)]+)\)/g)) {
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
      output = output.replace(`](${target})`, `](${url})`)
    }
    if (output !== input) await writeFile(file, output)
  }
}
