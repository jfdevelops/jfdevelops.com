import { execFile } from 'node:child_process'
import { appendFile, readFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { loadDocsSources } from './load-sources.mjs'

const config = await loadDocsSources()
let changed = false
for (const source of config.libraries) {
  const { stdout } = await promisify(execFile)(
    'git',
    ['ls-remote', source.repository, 'refs/heads/main'],
    { timeout: 60000 },
  )
  try {
    const pointer = JSON.parse(await readFile(`.docs-snapshots/${source.id}/current.json`, 'utf8'))
    if (
      pointer.sourceCommit !== stdout.split(/\s+/)[0] ||
      pointer.renderer !== process.env.GITHUB_SHA
    )
      changed = true
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    changed = true
  }
}
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`)
console.log(changed ? 'Documentation refresh required' : 'All main snapshots are current')
