// Type check: npm run test:types (no emit). Also guards the .d.ts against drift.
import fs from 'fs'
import carbon, { render, THEMES, FONTS, DEFAULTS, type RenderOptions, type Theme } from 'carbon-canvas'

const opts: RenderOptions = { theme: 'dracula', language: 'typescript', windowTheme: 'boxy', lineNumbers: true }
const png: Buffer = render('const x: number = 1', opts)
fs.writeFileSync('out/ts.png', png)

const custom: Theme = { id: 'mine', highlights: { background: '#000', text: '#fff', keyword: '#f0f' } }
render('let a = 1', { theme: custom, fontFamily: FONTS[0], scale: DEFAULTS.scale })
carbon.render('x', { theme: THEMES[0] })

// @ts-expect-error invalid windowTheme
render('x', { windowTheme: 'round' })
// @ts-expect-error code must be a string
render(123)
