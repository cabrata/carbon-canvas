// Bun runtime check: bun test
import { expect, test } from 'bun:test'
import carbon, { render, THEMES, type RenderOptions } from '@caliph71/carbon-canvas'

test('renders PNG from TypeScript under Bun', () => {
  const opts: RenderOptions = { theme: 'dracula', language: 'typescript', lineNumbers: true }
  const png = render('const x: number = 1', opts)
  expect(png.subarray(1, 4).toString()).toBe('PNG')
})

test('all themes render, default export works', () => {
  for (const t of THEMES) expect(carbon.render('x', { theme: t.id }).length).toBeGreaterThan(0)
})

test('throws on bad input', () => {
  expect(() => render('x', { theme: 'nope' })).toThrow(/Unknown theme/)
  expect(() => render(123 as unknown as string)).toThrow(TypeError)
})
