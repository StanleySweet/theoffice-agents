// collectCopilot: a block-scalar name (the raw prompt of a `-p` run) is not a title; a one-line name is.
process.env.THEOFFICE_SKIP_CWD_CHECK = '1'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { collectCopilot } from '../plugin/lib/collect.mjs'

const NOW = Date.parse('2026-11-16T10:00:00.000Z')
const resolver = { resolve: (p) => ({ name: path.basename(p), path: p, worktree: null }) }

function home(nameLines) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-name-'))
  const d = path.join(h, '.copilot', 'session-state', 'abcd1234-0000')
  fs.mkdirSync(d, { recursive: true })
  const yaml = ['id: abcd1234-0000', 'cwd: /w/proj', 'git_root: /w/proj', ...nameLines, `updated_at: ${new Date(NOW).toISOString()}`].join('\n')
  fs.writeFileSync(path.join(d, 'workspace.yaml'), yaml)
  return h
}
const titleOf = (nameLines) => collectCopilot({ nowMs: NOW, resolver, skipCwd: true }, home(nameLines))[0].title

test('a one-line name is the desk title', () => assert.equal(titleOf(['name: Analyze MQTT repo']), 'Analyze MQTT repo'))
test('a block-scalar name (a raw prompt) falls back to the project', () => {
  assert.equal(titleOf(['name: |-', '  do NOT start any workflow', '  second line']), 'proj')
  assert.equal(titleOf(['name: >', '  folded prompt']), 'proj')
})
