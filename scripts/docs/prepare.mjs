import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { checkDocs, loadConfig, writeDocsNavigation } from '@jfdevelops/docs'

export async function prepareLibrary(checkout, registration, run, install) {
  const manifest = JSON.parse(await readFile(path.join(checkout, 'package.json'), 'utf8'))
  const generate = ['docs:generate', 'generate-docs'].find((name) => manifest.scripts?.[name])
  const check = ['docs:check', 'check:docs'].find((name) => manifest.scripts?.[name])
  if (install) {
    await run('pnpm', ['install', '--frozen-lockfile', '--ignore-scripts'], checkout)
    if (generate) await run('pnpm', [generate], checkout)
  }
  const config = loadConfig(checkout, registration.docs)
  if (!generate) writeDocsNavigation({ root: checkout, config })
  if (check) await run('pnpm', [check], checkout)
  else {
    const result = checkDocs({ root: checkout, config })
    if (result.errors.length)
      throw new Error(result.errors.map((issue) => `${issue.file}: ${issue.message}`).join('\n'))
    console.log(`Docs check passed: ${result.stats.pages} pages.`)
  }
}
