// Run: node scripts/test-package.js (installs a clean consumer using npm).
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync, spawnSync } = require('node:child_process')

const root = path.resolve(__dirname, '..')
const metadata = require('../package.json')
const scratch = process.env.JCODE_SCRATCH_DIR || path.join(os.homedir(), '.cache', 'carbon-canvas')
fs.mkdirSync(scratch, { recursive: true })
const consumer = fs.mkdtempSync(path.join(scratch, 'carbon-package-'))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const run = (command, args, cwd = consumer) => execFileSync(command, args, {
  cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], timeout: 180000,
})

try {
  const [packed] = JSON.parse(run(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', consumer], root))
  const files = packed.files.map(file => file.path)
  for (const file of ['index.js', 'index.mjs', 'index.d.ts', 'index.d.mts', 'themes.js', 'LICENSE', 'NOTICE',
    'fonts/Hack-Regular.ttf', 'fonts/Hack-LICENSE.md', 'fonts/FiraCode-Regular.ttf', 'fonts/FiraCode-LICENSE',
    'fonts/JetBrainsMono-Regular.ttf', 'fonts/JetBrainsMono-OFL.txt']) assert(files.includes(file), `Missing ${file}`)
  assert(!files.some(file => /^(docs|out|node_modules|scripts)\//.test(file)), 'Unexpected package files')
  assert.equal(packed.bundled.length, 0, 'Native dependencies must not be vendored')
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
  run(npm, ['install', '--ignore-scripts', '--no-audit', '--no-fund', path.join(consumer, packed.filename)])
  assert(fs.existsSync(path.join(consumer, 'node_modules/@types/node/package.json')), 'Buffer types must install without dev dependencies')
  run(npm, ['install', '--save-dev', '--ignore-scripts', '--no-audit', '--no-fund', `typescript@${metadata.devDependencies.typescript}`])

  const checks = `
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
const options: carbon.RenderOptions = { theme: 'dracula', language: 'typescript', windowTheme: 'boxy' }
const png: Buffer = carbon.render('const x: number = 1', options)
assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
assert(png.readUInt32BE(16) > 0 && png.readUInt32BE(20) > 0)
assert.equal(carbon.THEMES.length, 29)
assert.equal(carbon.FONTS.length, 3)
for (const fontFamily of carbon.FONTS) {
  assert(Buffer.isBuffer(carbon.render('const x = 1', { fontFamily, language: 'javascript' })))
}
assert.throws(() => carbon.render('x', { theme: 'missing' }), /Unknown theme/)
assert.throws(() => carbon.render(null as unknown as string), TypeError)
const custom: carbon.Theme = { id: 'custom', highlights: { background: '#000', text: '#fff' } }
carbon.render('x', { theme: custom })
if (false) {
  // @ts-expect-error invalid input
  carbon.render(123)
  // @ts-expect-error invalid window theme
  carbon.render('x', { windowTheme: 'round' })
}
`
  fs.writeFileSync(path.join(consumer, 'import.mts'), `import carbon, * as types from 'carbon-canvas'
import { render } from 'carbon-canvas'
${checks.replaceAll('carbon.RenderOptions', 'types.RenderOptions').replaceAll('carbon.Theme', 'types.Theme')}
assert.equal(render, carbon.render)
`)
  fs.writeFileSync(path.join(consumer, 'require.cts'), `import carbon = require('carbon-canvas')
${checks}
assert.equal(carbon.default, carbon)
`)
  const tsc = path.join(consumer, 'node_modules/typescript/bin/tsc')
  run(process.execPath, [tsc, '--strict', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--outDir', 'compiled', 'import.mts', 'require.cts'])
  run(process.execPath, ['compiled/import.mjs'])
  run(process.execPath, ['compiled/require.cjs'])
  if (spawnSync('bun', ['--version'], { stdio: 'ignore' }).status === 0) {
    run('bun', ['compiled/import.mjs'])
    run('bun', ['compiled/require.cjs'])
  }
  console.log(`ok: ${files.length} packed files, clean dependencies, NodeNext ESM/CJS types and native PNG rendering`)
} finally {
  fs.rmSync(consumer, { recursive: true, force: true })
}
