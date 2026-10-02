// node scripts/test-docs.js: static links, all themes, and documented API options.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { DEFAULTS, THEMES } = require('..')
const root = path.join(__dirname, '..')
const page = fs.readFileSync(path.join(root, 'docs/index.html'), 'utf8')
const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])
assert.equal(ids.length, new Set(ids).size, 'HTML IDs must be unique')
for (const [, url] of page.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  if (url.startsWith('#')) assert(ids.includes(url.slice(1)), `Missing anchor: ${url}`)
  else if (!/^https?:/.test(url)) {
    assert(!url.startsWith('/'), `Use relative URLs for Pages: ${url}`)
    assert(fs.existsSync(path.join(root, 'docs', url)), `Missing asset: ${url}`)
  }
}
assert.equal([...page.matchAll(/class="theme-card"/g)].length, THEMES.length)
for (const t of THEMES) {
  const slug = t.id.toLowerCase().replace(/\s+/g, '-')
  assert(ids.includes(`theme-${slug}`), `Missing theme: ${t.id}`)
  const image = fs.readFileSync(path.join(root, `docs/assets/themes/${slug}.png`))
  assert.equal(image.subarray(1, 4).toString(), 'PNG')
  assert(image.readUInt32BE(16) > 0 && image.readUInt32BE(20) > 0)
}
for (const key of Object.keys(DEFAULTS)) {
  assert(page.includes(`<th scope="row"><code>${key}</code></th>`), `Undocumented option: ${key}`)
}
for (const file of ['README.md', 'README.id.md', 'THEMES.md']) {
  const md = fs.readFileSync(path.join(root, file), 'utf8')
  for (const [, url] of md.matchAll(/\]\(([^)]+)\)/g)) {
    if (!/^https?:|^#/.test(url)) assert(fs.existsSync(path.join(root, url)), `${file}: missing ${url}`)
  }
}
assert(fs.existsSync(path.join(root, 'docs/.nojekyll')))
console.log(`docs ok: ${THEMES.length} themes, ${Object.keys(DEFAULTS).length} options, links and images`)
