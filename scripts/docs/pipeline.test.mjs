import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const temp = mkdtempSync(path.join(os.tmpdir(), 'docs-failure-test-'))
const fixture = path.join(temp, 'repo')
let baseline
beforeAll(() => {
  baseline = readFileSync('src/docs/generated/registry.json', 'utf8')
  mkdirSync(fixture)
  execFileSync('git', ['init', '-q'], { cwd: fixture })
  execFileSync('git', ['config', 'user.email', 'fixture@example.com'], { cwd: fixture })
  execFileSync('git', ['config', 'user.name', 'Fixture'], { cwd: fixture })
})
afterAll(() => rmSync(temp, { recursive: true, force: true }))

function run(commit) {
  const source = path.join(temp, 'sources.json')
  writeFileSync(source, JSON.stringify({ 'react-layout': { repository: fixture, commit } }))
  const result = spawnSync(process.execPath, ['scripts/generate-docs.mjs', source], {
    encoding: 'utf8',
  })
  expect(result.status).not.toBe(0)
  expect(readFileSync('src/docs/generated/registry.json', 'utf8')).toBe(baseline)

  return result.stdout + result.stderr
}

function commit() {
  execFileSync('git', ['add', '.'], { cwd: fixture })
  execFileSync('git', ['commit', '-qm', 'fixture'], { cwd: fixture })

  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fixture, encoding: 'utf8' }).trim()
}
describe('fail closed without replacing generated content', () => {
  it('rejects a bad pin', () => expect(run('main')).toContain('40-character commit'))
  it('rejects a nonexistent commit', () => expect(run('0'.repeat(40))).toContain('not our ref'))
  it('rejects a missing manifest', () => {
    mkdirSync(path.join(fixture, 'scripts'), { recursive: true })
    writeFileSync(path.join(fixture, 'scripts/check-docs.mjs'), 'process.exit(0)')
    expect(run(commit())).toContain('docs/docs.json')
  })
  it('rejects an unknown schema', () => {
    mkdirSync(path.join(fixture, 'docs'))
    writeFileSync(path.join(fixture, 'docs/docs.json'), '{"schemaVersion":2}')
    expect(run(commit())).toContain('Unsupported docs schemaVersion: 2')
  })
  it('reports checker errors and aborts generation', () => {
    writeFileSync(
      path.join(fixture, 'scripts/check-docs.mjs'),
      'console.error("broken-link: fixture.md: missing.md"); process.exit(1)',
    )
    expect(run(commit())).toContain('broken-link: fixture.md: missing.md')
  })
})

it('rejects a broken relative link using the pinned library checker', () => {
  const source = JSON.parse(readFileSync('docs.sources.json', 'utf8'))['react-layout']
  execFileSync('git', ['fetch', '--depth=1', source.repository, source.commit], { cwd: fixture })
  execFileSync('git', ['checkout', 'FETCH_HEAD', '--', '.'], { cwd: fixture })
  const page = path.join(fixture, 'docs/v4/index.md')
  writeFileSync(page, `${readFileSync(page, 'utf8')}\n[Broken fixture](./missing-fixture.md)\n`)
  expect(run(commit())).toContain('missing-fixture.md')
}, 30000)
