// The drawn desk tag shows the session's own title first, even where the account chip would use the room.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderSvg } from '../plugin/lib/svg.mjs'

const NOW = '2026-11-16T10:00:00.000Z'
const desk = (title, account) => ({
  id: 'd1', agent: 'claude', project: 'proj', title, account, status: 'busy', state: 'working', cls: 'thinking',
  activity: { kind: 'thinking', since: '2026-11-16T09:50:00.000Z' }, started_at: '2026-11-16T09:30:00.000Z',
  last_seen: '2026-11-16T09:59:00.000Z', interns: [], meetings: [],
})
const facts = (d) => ({ spec: 'x', generated_at: NOW, now: { iso: NOW, ms: Date.parse(NOW) }, range: { kind: 'live', from: NOW, to: NOW }, live: { desks: [d], recently_left: [] },
  projects: [], accounts: [{ id: 'stan', label: 'stan' }], totals: {}, per_day: {}, per_hour: {} })

test('a long session title is drawn on the tag, with the account on its own line under it', () => {
  const svg = renderSvg(facts(desk('Fix the omp title parser', 'stan')), { view: 'live', width: 1100, animate: false })
  const texts = [...svg.matchAll(/<text[^>]*y="([\d.]+)"[^>]*>(.*?)<\/text>/g)].map((m) => ({ y: Number(m[1]), t: m[2].replace(/<[^>]+>/g, '') }))
  const title = texts.find((t) => /Fix the/.test(t.t))
  const account = texts.find((t) => t.t === '@stan')
  assert.ok(title, 'the title appears as tag text')
  assert.ok(account, 'the account appears on its own line')
  assert.ok(account.y > title.y, 'the account is under the title')
})
